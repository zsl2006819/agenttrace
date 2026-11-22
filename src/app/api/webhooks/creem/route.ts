import { Webhook } from '@creem_io/nextjs';
import { NextResponse } from 'next/server';
import { createSupabaseServiceRole } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

/**
 * Plan → API event limit mapping.
 * These values should match the pricing tiers shown on your landing page.
 */
const PLAN_LIMITS: Record<string, number> = {
  free: 10_000,
  starter: 500_000,
  business: 1_000_000,
  enterprise: 10_000_000,
};

/**
 * Map a Creem product ID or plan name to a plan tier.
 * Extend this table when you add new pricing tiers.
 */
function resolvePlan(product: { id?: string; name?: string } | null): string {
  const pid = (product?.id ?? '').toLowerCase();
  const pname = (product?.name ?? '').toLowerCase();

  if (pid.includes('business') || pname.includes('business')) return 'business';
  if (pid.includes('starter') || pname.includes('starter')) return 'starter';
  if (pid.includes('enterprise') || pname.includes('enterprise')) return 'enterprise';
  if (pid.includes('free') || pname.includes('free')) return 'free';

  // Default: free tier
  return 'free';
}

/**
 * Atomically claim a webhook event.
 *
 * Returns true when this delivery won the insert (i.e. it is the first time
 * we see this event id). Returns false when the unique constraint rejects the
 * row, which means an earlier delivery already processed it — Creem is
 * retrying, so we must not apply the payload again.
 */
async function claimEvent(
  eventId: string,
  eventType: string,
  payload: unknown
): Promise<boolean> {
  const service = createSupabaseServiceRole();

  const { error } = await service
    .from('webhook_events')
    .insert({ event_id: eventId, event_type: eventType, payload });

  if (!error) return true;

  if (error.code === '23505') {
    console.log('[Webhook] Duplicate event ignored:', { eventId, eventType });
    return false;
  }

  // Unexpected database failure: fail open so a real payment is never lost.
  console.error('[Webhook] Failed to record event:', { eventId, error });
  return true;
}

/**
 * Remove the claim so a retry can reprocess the event. Called when the
 * handler throws — otherwise a transient failure would be marked as done.
 */
async function releaseEvent(eventId: string): Promise<void> {
  const service = createSupabaseServiceRole();
  const { error } = await service
    .from('webhook_events')
    .delete()
    .eq('event_id', eventId);

  if (error) {
    console.error('[Webhook] Failed to release event:', { eventId, error });
  }
}

/**
 * Wrap a handler so the event id is claimed exactly once. Events without an
 * id (older SDK payloads) fall through and are processed normally.
 */
async function handleOnce(
  eventId: string | undefined,
  eventType: string | undefined,
  payload: unknown,
  handler: () => Promise<void>
): Promise<void> {
  if (!eventId) {
    await handler();
    return;
  }

  const claimed = await claimEvent(eventId, eventType ?? 'unknown', payload);
  if (!claimed) return;

  try {
    await handler();
  } catch (error) {
    await releaseEvent(eventId);
    throw error;
  }
}

/**
 * `onRevokeAccess` receives a subscription snapshot rather than a webhook
 * envelope, so there is no event id to claim. Derive a stable key from the
 * subscription state instead: a retried delivery carries the same snapshot and
 * is skipped, while a genuine later revocation (new `canceled_at` / status)
 * produces a new key and is processed.
 */
function revokeEventKey(data: {
  id?: string;
  status?: string;
  canceled_at?: Date | string | null;
}): string {
  const canceledAt = data.canceled_at
    ? new Date(data.canceled_at).toISOString()
    : '';
  return `revoke:${data.id ?? 'unknown'}:${data.status ?? 'unknown'}:${canceledAt}`;
}

async function upsertProfile(
  email: string | undefined,
  referenceId: string | undefined,
  plan: string
): Promise<void> {
  const service = createSupabaseServiceRole();

  // Prefer the referenceId (user_id) passed at checkout creation.
  // Fall back to email when referenceId is missing.
  let query = service.from('profiles').select('id, tenant_id, email');

  if (referenceId) {
    query = query.eq('id', referenceId);
  } else if (email) {
    query = query.eq('email', email);
  } else {
    throw new Error('Webhook payload has neither referenceId nor customer email');
  }

  const { data: rows, error: selectError } = await query.limit(1);

  if (selectError) {
    throw new Error(`Failed to look up profile: ${selectError.message}`);
  }

  if (!rows || rows.length === 0) {
    // Throw so the delivery is retried: the profile may appear a moment later.
    throw new Error(`Profile not found for email=${email} referenceId=${referenceId}`);
  }

  const profile = rows[0];
  const apiLimit = PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;

  const { error: updateError } = await service
    .from('profiles')
    .update({
      plan,
      api_limit: apiLimit,
      updated_at: new Date().toISOString(),
    })
    .eq('id', profile.id);

  if (updateError) {
    throw new Error(`Failed to update profile: ${updateError.message}`);
  }

  console.log('[Webhook] Profile updated:', {
    id: profile.id,
    tenant_id: profile.tenant_id,
    plan,
    api_limit: apiLimit,
  });
}

export const POST = Webhook({
  webhookSecret: process.env.CREEM_WEBHOOK_SECRET!,

  onCheckoutCompleted: async (data) => {
    await handleOnce(
      data.webhookId,
      data.webhookEventType,
      data,
      async () => {
        const plan = resolvePlan(data.product ?? null);
        const email = data.customer?.email;
        const referenceId = (data.metadata as Record<string, unknown> | undefined)
          ?.referenceId as string | undefined;

        console.log('[Webhook] checkout.completed:', {
          webhookId: data.webhookId,
          email,
          referenceId,
          product: data.product?.name,
          plan,
        });

        await upsertProfile(email, referenceId, plan);
      }
    );
  },

  onSubscriptionActive: async (data) => {
    await handleOnce(
      data.webhookId,
      data.webhookEventType,
      data,
      async () => {
        const plan = resolvePlan(data.product ?? null);
        const email = data.customer?.email;
        const referenceId = (data.metadata as Record<string, unknown> | undefined)
          ?.referenceId as string | undefined;

        console.log('[Webhook] subscription.active:', {
          webhookId: data.webhookId,
          email,
          referenceId,
          product: data.product?.name,
          plan,
        });

        await upsertProfile(email, referenceId, plan);
      }
    );
  },

  onRevokeAccess: async (data) => {
    await handleOnce(
      revokeEventKey(data),
      'subscription.revoked',
      data,
      async () => {
        const email = data.customer?.email;
        const referenceId = (data.metadata as Record<string, unknown> | undefined)
          ?.referenceId as string | undefined;

        console.log('[Webhook] access revoked:', {
          eventKey: revokeEventKey(data),
          email,
          referenceId,
          reason: data.reason,
        });

        await upsertProfile(email, referenceId, 'free');
      }
    );
  },
});