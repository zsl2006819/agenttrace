import { redirect } from 'next/navigation';
import {
  createSupabaseServerWithAuth,
  createSupabaseServiceRole,
} from '@/lib/supabase-server';
import { getCurrentTenant } from '@/lib/tenant';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

export const dynamic = 'force-dynamic';

/**
 * Billing support runs through email rather than a self-serve portal, so
 * subscription changes are handled by a human. The subject line is
 * pre-filled to make triage easier.
 */
const BILLING_SUPPORT_URL =
  'mailto:zsl.2006819@outlook.com?subject=Billing%20Inquiry';

const PLAN_LABELS: Record<string, string> = {
  free: 'Free',
  starter: 'Starter',
  business: 'Business',
  enterprise: 'Enterprise',
};

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

  const service = createSupabaseServiceRole();
  const { data: profile } = await service
    .from('profiles')
    .select('plan, api_limit')
    .eq('id', user.id)
    .maybeSingle();

  const plan = (profile?.plan as string | undefined) ?? 'free';
  const apiLimit = (profile?.api_limit as number | undefined) ?? 10_000;

  return (
    <div className="mx-auto max-w-3xl px-6 py-8 md:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account and workspace details.
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Account</CardTitle>
            <CardDescription>Your personal account information.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col">
              <Field label="Email" value={user.email ?? '—'} />
              <Field label="User ID" value={user.id} />
              <Field label="Tenant ID" value={tenantId ?? '—'} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Subscription</CardTitle>
            <CardDescription>
              Manage your plan, billing, and payment method.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col">
              <div className="flex items-center justify-between border-b border-border py-3">
                <span className="text-sm text-muted-foreground">Current plan</span>
                <Badge
                  variant="outline"
                  className={
                    plan === 'free'
                      ? 'border-zinc-300 text-zinc-600'
                      : 'border-emerald-300 text-emerald-700'
                  }
                >
                  {PLAN_LABELS[plan] ?? plan}
                </Badge>
              </div>
              <Field
                label="Monthly event limit"
                value={apiLimit.toLocaleString('en-US')}
              />
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="w-full sm:w-auto">
                <a href={BILLING_SUPPORT_URL}>Contact Billing Support</a>
              </Button>
              <Button asChild variant="outline" className="w-full sm:w-auto">
                <a href="/#pricing" target="_blank" rel="noopener noreferrer">
                  {plan === 'free' ? 'Upgrade plan' : 'View plans'}
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        AgentTrace provides technical infrastructure only and does not constitute
        formal legal advice.
      </p>
    </div>
  );
}