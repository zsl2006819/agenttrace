import { redirect } from 'next/navigation';
import { createSupabaseServerWithAuth } from '@/lib/supabase-server';
import { getCurrentTenant } from '@/lib/tenant';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-b border-border py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="break-all font-mono text-sm text-foreground">{value}</span>
    </div>
  );
}

export default async function SettingsPage() {
  const supabase = createSupabaseServerWithAuth();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login?redirect=/dashboard/settings');
  }

  const tenantId = await getCurrentTenant(supabase);

  return (
    <div className="mx-auto max-w-3xl px-6 py-8 md:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account and workspace details.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Account</CardTitle>
          <CardDescription>
            Your personal account information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col">
            <Field label="Email" value={user.email ?? '—'} />
            <Field label="User ID" value={user.id} />
            <Field label="Tenant ID" value={tenantId ?? '—'} />
          </div>
        </CardContent>
      </Card>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        AgentTrace provides technical infrastructure only and does not constitute
        formal legal advice.
      </p>
    </div>
  );
}