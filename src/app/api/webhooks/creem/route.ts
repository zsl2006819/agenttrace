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
    return;
  }

  const { data: rows, error: selectError } = await query.limit(1);

  if (selectError || !rows || rows.length === 0) {
    console.error('[Webhook] Profile not found:', {
      email,
      referenceId,
      error: selectError?.message,
    });
    return;
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
    console.error('[Webhook] Failed to update profile:', updateError);
  } else {
    console.log('[Webhook] Profile updated:', {
      id: profile.id,
      tenant_id: profile.tenant_id,
      plan,
      api_limit: apiLimit,
    });
  }
}

export const POST = Webhook({
  webhookSecret: process.env.CREEM_WEBHOOK_SECRET!,

  onCheckoutCompleted: async (data) => {
    const plan = resolvePlan(data.product ?? null);
    const email = data.customer?.email;
    const referenceId = (data.metadata as any)?.referenceId as string | undefined;

    console.log('[Webhook] checkout.completed:', {
      email,
      referenceId,
      product: data.product?.name,
      plan,
    });

    await upsertProfile(email, referenceId, plan);
  },

  onSubscriptionActive: async (data) => {
    const plan = resolvePlan(data.product ?? null);
    const email = data.customer?.email;
    const referenceId = (data.metadata as any)?.referenceId as string | undefined;

    console.log('[Webhook] subscription.active:', {
      email,
      referenceId,
      product: data.product?.name,
      plan,
    });

    await upsertProfile(email, referenceId, plan);
  },

  onRevokeAccess: async (data) => {
    const email = data.customer?.email;
    const referenceId = (data.metadata as any)?.referenceId as string | undefined;

    console.log('[Webhook] access revoked:', { email, referenceId, reason: data.reason });

    await upsertProfile(email, referenceId, 'free');
  },
});