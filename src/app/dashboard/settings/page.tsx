import { redirect } from 'next/navigation';
import {
  createSupabaseServerWithAuth,
  createSupabaseServiceRole,
} from '@/lib/supabase-server';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  User,
  CreditCard,
  Shield,
  AlertTriangle,
  Lock,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TwoFactorToggle } from '@/components/dashboard/two-factor-toggle';

export const dynamic = 'force-dynamic';

const BILLING_SUPPORT_URL =
  'mailto:zsl.2006819@outlook.com?subject=Billing%20Inquiry';

const PLAN_LABELS: Record<string, string> = {
  free: 'Free',
  starter: 'Starter',
  business: 'Business',
  enterprise: 'Enterprise',
};

function CardHeaderWithIcon({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <CardHeader className="pb-1">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-zinc-500" />
        <CardTitle className="text-base font-semibold text-zinc-900">
          {title}
        </CardTitle>
      </div>
      <CardDescription className="text-sm text-zinc-500">{description}</CardDescription>
    </CardHeader>
  );
}

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-200/50 pb-3 pt-2 last:border-0">
      <span className="text-sm text-zinc-500">{label}</span>
      <span className="break-all font-mono text-sm text-zinc-900">{value}</span>
    </div>
  );
}

function SkeletonFieldRow({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-200/50 pb-3 pt-2 last:border-0">
      <span className="text-sm text-zinc-500">{label}</span>
      <div className="h-5 w-32 rounded-full bg-slate-200 animate-pulse" />
    </div>
  );
}

interface SettingsData {
  tenantId: string | null;
  plan: string;
  apiLimit: number;
  error: string | null;
  loading: boolean;
}

export default async function SettingsPage() {
  const supabase = createSupabaseServerWithAuth();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login?redirect=/dashboard/settings');
  }

  let data: SettingsData = {
    tenantId: null,
    plan: 'free',
    apiLimit: 10_000,
    error: null,
    loading: true,
  };

  try {
    const service = createSupabaseServiceRole();

    // Fetch profile with tenant_id included
    const { data: profile, error: profileError } = await service
      .from('profiles')
      .select('tenant_id, plan, api_limit')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) {
      throw new Error(profileError.message);
    }

    data.tenantId = (profile?.tenant_id as string | undefined) ?? null;
    data.plan = (profile?.plan as string | undefined) ?? 'free';
    data.apiLimit =
      (profile?.api_limit as number | undefined) ?? 10_000;
    data.loading = false;
  } catch (e) {
    data.error = e instanceof Error ? e.message : 'Failed to load settings';
    data.loading = false;
  }

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-10 md:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Settings
        </h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Manage your account and workspace details.
        </p>
      </div>

      {data.error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load settings. Please try again later.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left column */}
        <div className="lg:col-span-1 space-y-6 flex flex-col h-full">
          {/* Account card */}
          <Card
            className={cn(
              'overflow-hidden border border-slate-200 rounded-xl bg-white shadow-sm h-full flex flex-col transition-colors duration-200 hover:border-slate-300'
            )}
          >
            <CardHeaderWithIcon
              icon={User}
              title="Account"
              description="Your personal account information."
            />
            <CardContent className="pt-0 flex-1">
              <div className="divide-y divide-zinc-200/50">
                <FieldRow label="Email" value={user.email ?? '—'} />
                <FieldRow label="User ID" value={user.id} />
                {data.loading ? (
                  <SkeletonFieldRow label="Tenant ID" />
                ) : data.error ? (
                  <FieldRow label="Tenant ID" value="Failed to load" />
                ) : (
                  <FieldRow
                    label="Tenant ID"
                    value={data.tenantId ?? '—'}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Subscription card */}
          <Card
            className={cn(
              'overflow-hidden border border-slate-200 rounded-xl bg-white shadow-sm h-full flex flex-col transition-colors duration-200 hover:border-slate-300'
            )}
          >
            <CardHeaderWithIcon
              icon={CreditCard}
              title="Subscription"
              description="Manage your plan, billing, and payment method."
            />
            <CardContent className="pt-0 flex-1">
              <div className="divide-y divide-zinc-200/50">
                <div className="flex items-center justify-between border-b border-zinc-200/50 pb-3 pt-2 last:border-0">
                  <span className="text-sm text-zinc-500">
                    Current plan
                  </span>
                  <span className="text-sm font-semibold text-zinc-900 uppercase tracking-widest">
                    {PLAN_LABELS[data.plan] ?? data.plan}
                  </span>
                </div>
                <FieldRow
                  label="Monthly event limit"
                  value={data.apiLimit.toLocaleString('en-US')}
                />
              </div>
            </CardContent>
            <div className="p-4 pt-0 border-t border-zinc-200/50 flex flex-col gap-3 sm:flex-row sm:items-end">
              <Button
                asChild
                className={cn(
                  'w-full sm:w-auto rounded-lg bg-slate-900 text-white shadow-sm hover:bg-slate-800'
                )}
              >
                <a href={BILLING_SUPPORT_URL}>Contact Billing Support</a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full sm:w-auto rounded-lg border-zinc-200 hover:bg-zinc-50"
              >
                <a href="/#pricing" target="_blank" rel="noopener noreferrer">
                  {data.plan === 'free' ? 'Upgrade plan' : 'View plans'}
                </a>
              </Button>
            </div>
          </Card>
        </div>

        {/* Right column */}
        <div className="lg:col-span-1 space-y-6 flex flex-col h-full">
          {/* Security card */}
          <Card
            className={cn(
              'overflow-hidden border border-slate-200 rounded-xl bg-white shadow-sm h-full flex flex-col transition-colors duration-200 hover:border-slate-300'
            )}
          >
            <CardHeaderWithIcon
              icon={Shield}
              title="Security"
              description="Protect your account and workspace."
            />
            <CardContent className="pt-0 flex-1">
              <div className="divide-y divide-zinc-200/50">
                <TwoFactorToggle
                  label="Two-Factor Authentication"
                  description="Add an extra layer of security to your account."
                  enabled={false}
                />
                <TwoFactorToggle
                  label="Active Sessions"
                  description="View and manage active sessions across devices."
                  enabled={false}
                />
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone card */}
          <Card
            className={cn(
              'overflow-hidden border border-slate-200 rounded-xl bg-white shadow-sm h-full flex flex-col transition-colors duration-200 hover:border-slate-300'
            )}
          >
            <CardHeader className="pb-1">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <CardTitle className="text-base font-semibold text-zinc-900">
                  Danger Zone
                </CardTitle>
              </div>
              <CardDescription className="text-sm text-zinc-500">
                Permanent actions. Cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 flex-1">
              <div className="flex items-center justify-between border-b border-zinc-200/50 py-3 last:border-0">
                <div>
                  <span className="text-sm text-zinc-900">
                    Delete Workspace
                  </span>
                  <p className="text-xs text-zinc-500">
                    Permanently delete all data and audit events.
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  className="border border-transparent bg-transparent text-red-600 hover:bg-red-50 hover:text-red-700 shadow-sm"
                >
                  <Lock className="mr-2 h-4 w-4" strokeWidth={1.75} />
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <p className="mt-10 text-center text-xs leading-relaxed text-zinc-400">
        AgentTrace provides technical infrastructure only and does not constitute
        formal legal advice.
      </p>
    </div>
  );
}
