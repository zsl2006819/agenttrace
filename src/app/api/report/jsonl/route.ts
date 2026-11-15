import { NextResponse } from 'next/server';
import { createSupabaseServerWithAuth } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const supabase = createSupabaseServerWithAuth();

  // Get current user - RLS will filter by tenant_id
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: events, error } = await supabase
    .from('audit_events')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (events ?? []).map((e) => JSON.stringify(e, null, 0));
  const body = rows.length ? rows.join('\n') + '\n' : '';

  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'Content-Disposition': 'attachment; filename="audit-report.jsonl"',
    },
  });
}