import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import { hashApiKey } from '@/lib/crypto';

export const dynamic = 'force-dynamic';

const REQUIRED_FIELDS = [
  'agent_id',
  'session_id',
  'sequence',
  'idempotency_key',
  'tool_name',
  'input_hash',
  'prev_hash',
  'current_hash',
];

function extractBearerToken(request: NextRequest): string | null {
  const header =
    request.headers.get('authorization') ?? request.headers.get('Authorization');
  if (!header) return null;
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  return match ? match[1].trim() : null;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // 1) 解析 Bearer API Key
    const token = extractBearerToken(request);
    if (!token) {
      return NextResponse.json(
        { error: 'Missing Authorization: Bearer <api_key>' },
        { status: 401 }
      );
    }

    const service = getSupabaseServer();
    const keyHash = hashApiKey(token);

    // 2) 用 key 的哈希查找对应的 api_keys 记录（未撤销）
    const { data: keyRows, error: keyError } = await service
      .from('api_keys')
      .select('id, tenant_id, revoked_at')
      .eq('key_hash', keyHash)
      .is('revoked_at', null)
      .limit(1);

    if (keyError) {
      console.error('Failed to look up API key:', keyError);
      return NextResponse.json(
        { error: 'Failed to authenticate API key', details: keyError.message },
        { status: 500 }
      );
    }

    const apiKeyRecord = keyRows?.[0];
    if (!apiKeyRecord) {
      return NextResponse.json(
        { error: 'Invalid or revoked API key' },
        { status: 401 }
      );
    }

    // tenant_id 由 API Key 决定，忽略请求体中的任何 tenant_id（防越权）
    const tenantId = apiKeyRecord.tenant_id as string;

    // 更新最后使用时间（不阻塞主流程）
    void service
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', apiKeyRecord.id);

    // 3) 解析并校验请求体
    const body = await request.json();

    const missingFields = REQUIRED_FIELDS.filter(
      (field) => body[field] === undefined || body[field] === null
    );
    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          missing_fields: missingFields,
        },
        { status: 400 }
      );
    }

    // 2.5) 额度检查：查 profiles 表获取 api_limit，再查本月已使用量
    const { data: profile, error: profileError } = await service
      .from('profiles')
      .select('id, plan, api_limit')
      .eq('tenant_id', tenantId)
      .maybeSingle();

    if (profileError) {
      console.error('Failed to look up profile for quota check:', profileError);
      return NextResponse.json(
        { error: 'Failed to look up profile', details: profileError.message },
        { status: 500 }
      );
    }

    const apiLimit = (profile?.api_limit as number | null) ?? 10_000;

    // 统计本月已写入的审计记录数（按 tenant_id 过滤，按 created_at >= 本月 1 号）
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const { count: usedCount, error: countError } = await service
      .from('audit_events')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .gte('created_at', monthStart.toISOString());

    if (countError) {
      console.error('Failed to count audit events for quota check:', countError);
      return NextResponse.json(
        { error: 'Failed to count audit events', details: countError.message },
        { status: 500 }
      );
    }

    if (usedCount !== null && usedCount >= apiLimit) {
      return NextResponse.json(
        {
          error: 'Quota exceeded. Please upgrade your plan.',
          plan: profile?.plan ?? 'free',
          api_limit: apiLimit,
          used_this_month: usedCount,
        },
        { status: 429 }
      );
    }

    const {
      agent_id,
      session_id,
      sequence,
      idempotency_key,
      tool_name,
      input_hash,
      output_hash,
      error_code,
      human_override,
      prev_hash,
      current_hash,
      signature,
    } = body;

    // 4) 幂等检查
    const { data: existingRecord, error: selectError } = await service
      .from('audit_events')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('idempotency_key', idempotency_key)
      .maybeSingle();

    if (selectError) {
      console.error('Failed to query idempotency key:', selectError);
      return NextResponse.json(
        { error: 'Failed to query idempotency key', details: selectError.message },
        { status: 500 }
      );
    }

    if (existingRecord) {
      return NextResponse.json(
        {
          message: 'Idempotency key already exists; returning the existing record',
          record: existingRecord,
        },
        { status: 200 }
      );
    }

    // 5) 写入审计记录（tenant_id / key_id 以服务端解析结果为准）
    const { data: insertedRecord, error: insertError } = await service
      .from('audit_events')
      .insert([
        {
          tenant_id: tenantId,
          agent_id,
          session_id,
          sequence,
          idempotency_key,
          tool_name,
          input_hash,
          output_hash: output_hash ?? null,
          error_code: error_code ?? null,
          human_override: human_override ?? false,
          prev_hash,
          current_hash,
          signature: signature ?? null,
          key_id: apiKeyRecord.id as string,
        },
      ])
      .select()
      .single();

    if (insertError) {
      // 处理唯一约束冲突（幂等键或序列号冲突）
      if (
        insertError.code === '23505' ||
        insertError.message?.includes('unique') ||
        insertError.message?.includes('duplicate')
      ) {
        // 尝试再次查询返回已存在记录（防并发场景）
        const { data: retryRecord, error: retryError } = await service
          .from('audit_events')
          .select('*')
          .eq('tenant_id', tenantId)
          .eq('idempotency_key', idempotency_key)
          .maybeSingle();

        if (retryError || !retryRecord) {
          return NextResponse.json(
            {
              error: 'Unique constraint conflict; the record may have been written by a concurrent request',
              details: insertError.message,
            },
            { status: 409 }
          );
        }

        return NextResponse.json(
          {
            message: 'Idempotency key already exists (found after concurrent retry); returning the existing record',
            record: retryRecord,
          },
          { status: 200 }
        );
      }

      console.error('Failed to insert audit record:', insertError);
      return NextResponse.json(
        { error: 'Failed to insert audit record', details: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Audit record created',
        record: insertedRecord,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('API handler error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Internal server error', details: message },
      { status: 500 }
    );
  }
}