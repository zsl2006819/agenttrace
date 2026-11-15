import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerWithAuth, createSupabaseServiceRole } from '@/lib/supabase-server';
import { getCurrentTenant } from '@/lib/tenant';
import { generateApiKey, hashApiKey } from '@/lib/crypto';

export const dynamic = 'force-dynamic';

/**
 * GET /api/keys
 * 列出当前租户的所有 API Key（不含明文）。
 */
export async function GET(): Promise<NextResponse> {
  const supabase = createSupabaseServerWithAuth();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const tenantId = await getCurrentTenant(supabase);
  if (!tenantId) {
    return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
  }

  const service = createSupabaseServiceRole();
  const { data, error } = await service
    .from('api_keys')
    .select('id, name, key_prefix, created_at, last_used_at, revoked_at')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to list API keys:', error);
    return NextResponse.json({ error: 'Failed to list API keys' }, { status: 500 });
  }

  return NextResponse.json({ keys: data ?? [] });
}

/**
 * POST /api/keys
 * 生成一个新的 API Key。明文仅在本次响应中返回一次。
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = createSupabaseServerWithAuth();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const tenantId = await getCurrentTenant(supabase);
  if (!tenantId) {
    return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
  }

  let name = 'Default';
  try {
    const body = await request.json();
    if (body && typeof body.name === 'string' && body.name.trim()) {
      name = body.name.trim().slice(0, 80);
    }
  } catch {
    // 无 body 时使用默认名称
  }

  const plaintext = generateApiKey();
  const keyHash = hashApiKey(plaintext);
  const keyPrefix = plaintext.slice(0, 12);

  const service = createSupabaseServiceRole();
  const { data, error } = await service
    .from('api_keys')
    .insert({
      tenant_id: tenantId,
      name,
      key_prefix: keyPrefix,
      key_hash: keyHash,
    })
    .select('id, name, key_prefix, created_at')
    .single();

  if (error) {
    console.error('Failed to create API key:', error);
    return NextResponse.json({ error: 'Failed to create API key' }, { status: 500 });
  }

  // 注意：这是唯一一次返回明文 key 的机会。
  return NextResponse.json({ key: plaintext, record: data }, { status: 201 });
}

/**
 * DELETE /api/keys?id=<id>
 * 撤销（硬删除）一个 API Key，仅限当前租户。
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const supabase = createSupabaseServerWithAuth();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const tenantId = await getCurrentTenant(supabase);
  if (!tenantId) {
    return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
  }

  const id = request.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  const service = createSupabaseServiceRole();
  const { error } = await service
    .from('api_keys')
    .delete()
    .eq('tenant_id', tenantId)
    .eq('id', id);

  if (error) {
    console.error('Failed to revoke API key:', error);
    return NextResponse.json({ error: 'Failed to revoke API key' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}