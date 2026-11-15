import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let serviceRoleClient: SupabaseClient | null = null;

/**
 * 创建 Service Role 客户端（用于写入审计事件、绕过 RLS）
 * 这是给 AI Agent 服务端调用用的，不使用用户会话
 */
export function createSupabaseServiceRole(): SupabaseClient {
  if (serviceRoleClient) return serviceRoleClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
  }
  if (!supabaseServiceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
  }

  serviceRoleClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return serviceRoleClient;
}

/**
 * 创建带有用户会话的 Supabase 客户端（用于 RLS 生效的查询）
 * 这个客户端会使用用户的 access token，而不是 service role key
 */
export function createSupabaseServerWithAuth() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Server Component 中无法设置 cookie，忽略
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch {
            // Server Component 中无法设置 cookie，忽略
          }
        },
      },
    }
  );
}

/**
 * 向后兼容：返回 service role 客户端
 */
export function getSupabaseServer(): SupabaseClient {
  return createSupabaseServiceRole();
}