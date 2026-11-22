import { NextRequest, NextResponse } from 'next/server';
import { Creem } from 'creem';
import { createSupabaseServerWithAuth } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

/**
 * Plan → Creem product ID.
 *
 * These are public product identifiers, not secrets. Keep them in sync with
 * the PLAN_LIMITS table in the Creem webhook route.
 */
const PLAN_PRODUCT_IDS = {
  starter: 'prod_1cTrjVUKMUB8QUPb8R17CI',
  business: 'prod_6sMnWEQOoPzwUlBU3LyBL',
} as const;

type PlanKey = keyof typeof PLAN_PRODUCT_IDS;

let creemClient: Creem | null = null;

/**
 * The Creem SDK is stateless, so one client per server instance is enough.
 * Set CREEM_TEST_MODE=true to target the sandbox API with a test key.
 */
function getCreemClient(): Creem {
  if (creemClient) return creemClient;

  const apiKey = process.env.CREEM_API_KEY;
  if (!apiKey) {
    throw new Error('Missing CREEM_API_KEY');
  }

  const isTestMode = process.env.CREEM_TEST_MODE === 'true';
  creemClient = new Creem({ apiKey, server: isTestMode ? 'test' : 'prod' });
  return creemClient;
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
  const successUrl = `${resolveOrigin(request)}/dashboard?checkout=success`;

  // 3) Create the checkout session.
  //
  // `referenceId` is derived from the server-side session, never from the
  // request body. The Creem webhook reads it back out of `metadata` to find
  // the profile it must upgrade — this is what makes upgrades reliable even
  // when the customer pays with a different email address.
  try {
    const checkout = await getCreemClient().checkouts.create({
      productId: PLAN_PRODUCT_IDS[planKey],
      successUrl,
      metadata: {
        referenceId: user.id,
        plan: planKey,
      },
    });

    if (!checkout.checkoutUrl) {
      console.error('[Checkout] Creem returned no checkoutUrl:', {
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
    console.error('[Checkout] Failed to create session:', {
      plan: planKey,
      userId: user.id,
      error: error instanceof Error ? error.message : error,
    });

    return NextResponse.json(
      { error: 'Could not start checkout. Please try again or contact support.' },
      { status: 502 }
    );
  }
}