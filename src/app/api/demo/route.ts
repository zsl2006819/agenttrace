import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

const DEMO_TOOLS = [
  'get_weather',
  'send_email',
  'query_database',
  'llm_chat',
  'call_api',
  'process_file',
  'drop_table',
  'truncate_table',
  'send_slack',
  'read_config',
];

function generateHash(): string {
  return Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
}

function generateIdempotencyKey(): string {
  return Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const service = getSupabaseServer();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await service.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's tenant_id
    const { data: profile, error: profileError } = await service
      .from('profiles')
      .select('tenant_id')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError || !profile?.tenant_id) {
      return NextResponse.json(
        { error: 'No tenant found for user' },
        { status: 400 }
      );
    }

    const tenantId = profile.tenant_id as string;

    // Get an active API key for this tenant to use as key_id
    const { data: apiKey, error: keyError } = await service
      .from('api_keys')
      .select('id')
      .eq('tenant_id', tenantId)
      .is('revoked_at', null)
      .limit(1)
      .maybeSingle();

    if (keyError || !apiKey) {
      return NextResponse.json(
        { error: 'No active API key found. Please create one first.' },
        { status: 400 }
      );
    }

    // Generate 10 demo events with proper hash chain
    const events = [];
    let prevHash = '0'.repeat(64);
    const baseTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago

    for (let i = 0; i < 10; i++) {
      const toolName = DEMO_TOOLS[Math.floor(Math.random() * DEMO_TOOLS.length)];
      const isBlocked = toolName === 'drop_table' || toolName === 'truncate_table';
      const currentHash = generateHash();
      const sequence = i + 1;

      events.push({
        tenant_id: tenantId,
        agent_id: `agent-demo-${(i % 3) + 1}`,
        session_id: `sess-${generateIdempotencyKey().slice(0, 8)}`,
        sequence,
        idempotency_key: generateIdempotencyKey(),
        tool_name: toolName,
        input_hash: generateHash(),
        output_hash: isBlocked ? null : generateHash(),
        error_code: isBlocked ? 'BLOCKED_BY_GUARDRAIL' : null,
        human_override: false,
        prev_hash: prevHash,
        current_hash: currentHash,
        signature: null,
        key_id: apiKey.id,
        created_at: new Date(baseTime.getTime() + i * 2 * 60 * 60 * 1000).toISOString(),
      });

      prevHash = currentHash;
    }

    // Insert all events
    const { data: insertedEvents, error: insertError } = await service
      .from('audit_events')
      .insert(events)
      .select();

    if (insertError) {
      console.error('Failed to insert demo events:', insertError);
      return NextResponse.json(
        { error: 'Failed to insert demo events', details: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Demo data loaded successfully',
      count: insertedEvents?.length ?? 0,
    });
  } catch (error: unknown) {
    console.error('Demo API error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Internal server error', details: message },
      { status: 500 }
    );
  }
}