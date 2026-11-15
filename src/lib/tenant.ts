import type { SupabaseClient } from '@supabase/supabase-js';
import { createSupabaseServiceRole } from './supabase-server';

/**
 * 返回当前登录用户所属的 tenant_id。
 * 通过 service role 查询 profiles（profiles 的 RLS 只允许用户读自己，
 * 而 service role 会绕过 RLS），因此在任意页面/路由中都能安全解析。
 * 未登录或找不到 profile 时返回 null。
 */
export async function getCurrentTenant(
  supabase: SupabaseClient
): Promise<string | null> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  const service = createSupabaseServiceRole();
  const { data, error: profileError } = await service
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError) {
    console.error('Failed to resolve tenant:', profileError);
    return null;
  }

  return (data?.tenant_id as string | undefined) ?? null;
}