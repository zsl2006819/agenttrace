import { redirect } from 'next/navigation';
import {
  createSupabaseServerWithAuth,
  createSupabaseServiceRole,
} from '@/lib/supabase-server';
import { getCurrentTenant } from '@/lib/tenant';
import {
  ApiKeysClient,
  type ApiKeyRow,
} from '@/components/dashboard/api-keys-client';

export const dynamic = 'force-dynamic';

export default async function ApiKeysPage() {
  const supabase = createSupabaseServerWithAuth();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login?redirect=/dashboard/api-keys');
  }

  const tenantId = await getCurrentTenant(supabase);

  let keys: ApiKeyRow[] = [];
  if (tenantId) {
    const service = createSupabaseServiceRole();
    const { data, error: keysError } = await service
      .from('api_keys')
      .select('id, name, key_prefix, created_at, last_used_at, revoked_at')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (keysError) {
      console.error('Failed to fetch API keys:', keysError);
    } else {
      keys = (data ?? []) as ApiKeyRow[];
    }
  }

  return <ApiKeysClient initialKeys={keys} />;
}