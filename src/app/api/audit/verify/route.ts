import { NextResponse } from 'next/server';
import { createSupabaseServerWithAuth, createSupabaseServiceRole } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

const ZERO_HASH = '0'.repeat(64);

/**
 * Verify the hash-chain integrity of the latest N audit events for the
 * current tenant.
 *
 * A chain is valid when:
 *   1. Records are ordered by sequence (ascending).
 *   2. The first record's prev_hash is the zero hash.
 *   3. Each subsequent record's prev_hash equals the previous record's
 *      current_hash.
 *   4. No record's current_hash is missing or malformed.
 */
export async function GET() {
  const supabase = createSupabaseServerWithAuth();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const service = createSupabaseServiceRole();

  const { data: profile } = await service
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .maybeSingle();

  const tenantId = (profile?.tenant_id as string | undefined) ?? null;
  if (!tenantId) {
    return NextResponse.json(
      { error: 'no tenant found for current user' },
      { status: 404 }
    );
  }

  // Fetch the latest 100 records ordered by sequence so we can walk the chain.
  const { data: events, error } = await service
    .from('audit_events')
    .select('id, sequence, prev_hash, current_hash, created_at')
    .eq('tenant_id', tenantId)
    .order('sequence', { ascending: true })
    .limit(100);

  if (error) {
    console.error('[Verify] Failed to fetch audit events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audit events', details: error.message },
      { status: 500 }
    );
  }

  const records = (events ?? []) as Array<{
    id: string;
    sequence: number;
    prev_hash: string | null;
    current_hash: string | null;
    created_at: string;
  }>;

  if (records.length === 0) {
    return NextResponse.json({
      valid: true,
      checked: 0,
      message: 'No audit events found for this tenant.',
    });
  }

  let brokenAt: number | null = null;
  let brokenReason = '';

  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    const expectedPrev = i === 0 ? ZERO_HASH : records[i - 1].current_hash;

    if (!record.current_hash || record.current_hash.length !== 64) {
      brokenAt = i;
      brokenReason = `Record ${record.id} has a missing or malformed current_hash.`;
      break;
    }

    if (record.prev_hash !== expectedPrev) {
      brokenAt = i;
      brokenReason = `Record ${record.id} prev_hash does not link to previous record's current_hash.`;
      break;
    }
  }

  const valid = brokenAt === null;

  return NextResponse.json({
    valid,
    checked: records.length,
    brokenAt: brokenAt ?? null,
    brokenReason: brokenReason ?? null,
    message: valid
      ? `Chain integrity verified across ${records.length} record(s).`
      : `Chain broken at record #${brokenAt! + 1}: ${brokenReason ?? 'unknown error'}`,
  });
}