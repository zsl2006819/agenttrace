import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

const REQUIRED_FIELDS = [
  'tenant_id',
  'agent_id',
  'session_id',
  'sequence',
  'idempotency_key',
  'tool_name',
  'input_hash',
  'prev_hash',
  'current_hash',
];

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    // 校验必填字段
    const missingFields = REQUIRED_FIELDS.filter(
      (field) => body[field] === undefined || body[field] === null
    );
    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: '缺少必填字段',
          missing_fields: missingFields,
        },
        { status: 400 }
      );
    }

    const {
      tenant_id,
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
      key_id,
    } = body;

    // 幂等检查：如果 idempotency_key 已存在，返回已存在的记录
    const { data: existingRecord, error: selectError } = await getSupabaseServer()
      .from('audit_events')
      .select('*')
      .eq('tenant_id', tenant_id)
      .eq('idempotency_key', idempotency_key)
      .maybeSingle();

    if (selectError) {
      console.error('查询幂等键失败:', selectError);
      return NextResponse.json(
        { error: '查询幂等键失败', details: selectError.message },
        { status: 500 }
      );
    }

    if (existingRecord) {
      return NextResponse.json(
        {
          message: '幂等键已存在，返回已存在的记录',
          record: existingRecord,
        },
        { status: 200 }
      );
    }

    // 插入新记录
    const { data: insertedRecord, error: insertError } = await getSupabaseServer()
      .from('audit_events')
      .insert([
        {
          tenant_id,
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
          key_id: key_id ?? null,
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
        const { data: retryRecord, error: retryError } = await getSupabaseServer()
          .from('audit_events')
          .select('*')
          .eq('tenant_id', tenant_id)
          .eq('idempotency_key', idempotency_key)
          .maybeSingle();

        if (retryError || !retryRecord) {
          return NextResponse.json(
            {
              error: '唯一约束冲突，记录可能已由并发请求写入',
              details: insertError.message,
            },
            { status: 409 }
          );
        }

        return NextResponse.json(
          {
            message: '幂等键已存在（并发重试后找到），返回已存在的记录',
            record: retryRecord,
          },
          { status: 200 }
        );
      }

      console.error('插入审计记录失败:', insertError);
      return NextResponse.json(
        { error: '插入审计记录失败', details: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: '审计记录创建成功',
        record: insertedRecord,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('API 处理异常:', error);
    const message = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json(
      { error: '服务器内部错误', details: message },
      { status: 500 }
    );
  }
}