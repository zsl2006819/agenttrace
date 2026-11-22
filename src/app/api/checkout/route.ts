import { NextRequest, NextResponse } from 'next/server';
import { Creem } from 'creem';
import { createSupabaseServerWithAuth } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

/**
 * Plan → Creem product ID.
 *
 * These are public product identifiers, not secrets. They are environment
 * specific: a product created in Creem's test mode does not exist in live
 * mode, so these must match the environment of the API key being used.
 */
const PLAN_PRODUCT_IDS = {
  starter: 'prod_1CtRjvUKMUB8QUPb8R17CI',
  business: 'prod_6sMrMJEQOoPzwUlBU3LyBL',
} as const;

type PlanKey = keyof typeof PLAN_PRODUCT_IDS;

/** Creem product ids look like `prod_` followed by alphanumerics. */
const PRODUCT_ID_PATTERN = /^prod_[A-Za-z0-9]+$/;

/**
 * Pick the Creem API environment.
 *
 * Test and live keys are not interchangeable, so the key prefix is the source
 * of truth (`creem_test_…` → sandbox, anything else → production). Set
 * CREEM_TEST_MODE=true/false only to override that detection.
 */
function resolveServer(apiKey: string): 'prod' | 'test' {
  const override = process.env.CREEM_TEST_MODE;
  if (override === 'true') return 'test';
  if (override === 'false') return 'prod';
  return apiKey.startsWith('creem_test_') ? 'test' : 'prod';
}

/**
 * Rebuild the public origin from proxy headers so the post-payment redirect
 * works behind Vercel (or any TLS-terminating proxy).
 */
function resolveOrigin(request: NextRequest): string {
  const host =
    request.headers.get('x-forwarded-host') ?? request.headers.get('host');
  const protocol =
    request.headers.get('x-forwarded-proto') ??
    request.nextUrl.protocol.replace(':', '');

  if (host) return `${protocol}://${host}`;
  return request.nextUrl.origin;
}

interface CreemErrorShape {
  statusCode?: number;
  body?: unknown;
  message?: string;
}

/**
 * Pull a human-readable message out of a Creem SDK error.
 * The SDK exposes the HTTP status and the raw JSON body, which is where the
 * useful text ("Invalid API Key", "Product not found") lives.
 */
function describeCreemError(error: unknown): { status?: number; detail: string } {
  const shape = (error ?? {}) as CreemErrorShape;
  let detail = shape.message ?? String(error);

  if (typeof shape.body === 'string') {
    try {
      const parsed = JSON.parse(shape.body) as { message?: unknown };
      const message = Array.isArray(parsed.message)
        ? parsed.message.join('; ')
        : parsed.message;
      if (message) detail = String(message);
    } catch {
      // Body was not JSON — keep the SDK message.
    }
  }

  return { status: shape.statusCode, detail };
}

export async function POST(request: NextRequest) {
  // 1) Authenticate. The plan is always tied to the signed-in user, so an
  //    anonymous visitor can never start someone else's checkout.
  const supabase = createSupabaseServerWithAuth();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: 'You must be signed in to start a checkout.' },
      { status: 401 }
    );
  }

  // 2) Validate the requested plan against an allow-list.
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const plan = (body as { plan?: unknown } | null)?.plan;
  if (plan !== 'starter' && plan !== 'business') {
    return NextResponse.json(
      { error: 'Invalid plan. Expected "starter" or "business".' },
      { status: 400 }
    );
  }

  const planKey: PlanKey = plan;
  const productId = PLAN_PRODUCT_IDS[planKey];

  // 3) Validate configuration before calling Creem, so a missing variable or
  //    a malformed product id produces an actionable error instead of a
  //    generic "could not start checkout".
  const apiKey = process.env.CREEM_API_KEY;
  if (!apiKey) {
    console.error('[Checkout] CREEM_API_KEY is not set');
    return NextResponse.json(
      { error: 'Checkout is not configured. Please contact support.' },
      { status: 503 }
    );
  }

  if (!PRODUCT_ID_PATTERN.test(productId)) {
    console.error('[Checkout] Malformed product id:', { plan: planKey, productId });
    return NextResponse.json(
      { error: 'Checkout is not configured. Please contact support.' },
      { status: 503 }
    );
  }

  const server = resolveServer(apiKey);
  const successUrl = `${resolveOrigin(request)}/dashboard?checkout=success`;

  // 4) Create the checkout session.
  //
  // `referenceId` is derived from the server-side session, never from the
  // request body. The Creem webhook reads it back out of `metadata` to find
  // the profile it must upgrade — this is what makes upgrades reliable even
  // when the customer pays with a different email address.
  try {
    const creem = new Creem({ apiKey, server });

    const checkout = await creem.checkouts.create({
      productId,
      successUrl,
      metadata: {
        referenceId: user.id,
        plan: planKey,
      },
    });

    if (!checkout.checkoutUrl) {
      console.error('[Checkout] Creem returned no checkoutUrl:', {
        plan: planKey,
        productId,
        id: checkout.id,
        status: checkout.status,
      });
      return NextResponse.json(
        { error: 'The payment page is unavailable right now. Please try again.' },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { url: checkout.checkoutUrl },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    const { status, detail } = describeCreemError(error);

    // 401/403  → wrong or revoked API key, or key/environment mismatch.
    // 404      → product id does not exist in this environment.
    console.error('[Checkout] Failed to create session:', {
      plan: planKey,
      productId,
      server,
      userId: user.id,
      status,
      detail,
    });

    if (status === 401 || status === 403) {
      return NextResponse.json(
        { error: 'Checkout is not configured. Please contact support.' },
        { status: 503 }
      );
    }

    if (status === 404) {
      return NextResponse.json(
        { error: 'This plan is currently unavailable. Please contact support.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Could not start checkout. Please try again or contact support.' },
      { status: 502 }
    );
  }
}