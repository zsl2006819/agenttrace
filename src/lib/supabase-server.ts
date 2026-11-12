import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let cachedClient: SupabaseClient | null = null;

/**
 * 获取 Supabase Service Role 客户端（服务端专用，惰性初始化）。
 * 使用 Service Role 密钥绕过 RLS，用于读取/写入审计事件。
 */
export function getSupabaseServer(): SupabaseClient {
  if (cachedClient) return cachedClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error('缺少环境变量 NEXT_PUBLIC_SUPABASE_URL');
  }
  if (!supabaseServiceRoleKey) {
    throw new Error('缺少环境变量 SUPABASE_SERVICE_ROLE_KEY');
  }
  // 校验密钥是否为占位符，避免出现难以理解的 ByteString 报错
  if (
    supabaseServiceRoleKey.includes('替换') ||
    supabaseServiceRoleKey.includes('这里') ||
    supabaseServiceRoleKey.length < 20
  ) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY 仍是占位符，请填入 Supabase 控制台 ' +
        'Project Settings > API 中的真实密钥（sb_secret_... 或 eyJ... 开头）'
    );
  }

  cachedClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return cachedClient;
}

/** @deprecated 使用 getSupabaseServer() 以便错误可被捕获 */
export const supabaseServer = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabaseServer() as unknown as Record<string | symbol, unknown>)[prop];
  },
});