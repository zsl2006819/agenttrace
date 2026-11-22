import { NextResponse } from 'next/server';
import {
  createSupabaseServerWithAuth,
  createSupabaseServiceRole,
} from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

/**
 * Lightweight endpoint the dashboard polls after a checkout so the UI can
 * unlock exports without a manual reload (and without depending on the
 * redirect parameters Creem happens to append).
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
    .select('tenant_id, plan, api_limit')
    .eq('id', user.id)
    .maybeSingle();

  return NextResponse.json(
    {
      plan: profile?.plan ?? 'free',
      apiLimit: profile?.api_limit ?? 10_000,
      tenantId: profile?.tenant_id ?? null,
    },
    { headers: { 'Cache-Control': 'no-store, max-age=0' } }
  );
}