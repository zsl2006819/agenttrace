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
  Database,
  Cpu,
  Cloud,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  BarChart2,
  ArrowUpRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TwoFactorToggle } from '@/components/dashboard/two-factor-toggle';
import { PricingCheckoutButton } from '@/components/pricing-checkout-button';

export const dynamic = 'force-dynamic';

const BILLING_SUPPORT_URL =
  'mailto:zsl.2006819@outlook.com?subject=Billing%20Inquiry';

const PLAN_LABELS: Record<string, string> = {
  free: 'Free',
  starter: 'Starter',
  business: 'Business',
  enterprise: 'Enterprise',
};

const PLAN_LIMITS: Record<string, number> = {
  free: 10_000,
  starter: 500_000,
  business: 1_000_000,
  enterprise: Infinity,
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

function ProgressBar({
  value,
  max,
  label,
}: {
  value: number;
  max: number;
  label?: string;
}) {
  const percentage = max === Infinity ? 0 : Math.min(100, (value / max) * 100);
  const isUnlimited = max === Infinity;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-zinc-500">
          {label ?? 'Usage'}
        </span>
        <span className="text-sm font-mono text-zinc-900 dark:text-zinc-100">
          {isUnlimited ? 'Unlimited' : `${value.toLocaleString()} / ${max.toLocaleString()}`}
        </span>
      </div>
      <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            isUnlimited
              ? 'w-full bg-emerald-500'
              : percentage >= 90
              ? 'bg-red-500'
              : percentage >= 70
              ? 'bg-amber-500'
              : 'bg-zinc-500'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {!isUnlimited && percentage > 0 && (
        <p className="text-xs text-zinc-400 text-right">
          {percentage.toFixed(0)}% of monthly limit
        </p>
      )}
    </div>
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
  eventsUsed: number;
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
    eventsUsed: 0,
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

    // Fetch events used this month for the tenant
    if (data.tenantId) {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count, error: countError } = await service
        .from('audit_events')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', data.tenantId)
        .gte('created_at', startOfMonth.toISOString());

      if (!countError && count !== null) {
        data.eventsUsed = count;
      }
    }

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

          {/* Subscription card - Vercel-style billing card */}
          <Card
            className={cn(
              'overflow-hidden border border-slate-200 rounded-xl bg-white shadow-sm h-full flex flex-col transition-colors duration-200 hover:border-slate-300 relative'
            )}
          >
            <div className="absolute top-4 right-4">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                {PLAN_LABELS[data.plan] ?? data.plan}
              </span>
            </div>
            <CardHeader className="pb-1 pt-8 pr-28">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-zinc-500" />
                <CardTitle className="text-base font-semibold text-zinc-900">
                  Subscription
                </CardTitle>
              </div>
              <CardDescription className="text-sm text-zinc-500">
                Manage your plan, billing, and payment method.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 flex-1">
              <div className="space-y-6">
                {/* Current Plan */}
                <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      Current Plan
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold border border-zinc-200 dark:border-zinc-700">
                      {PLAN_LABELS[data.plan] ?? data.plan}
                    </span>
                  </div>
                  
                  {/* Usage Progress Bar */}
                  <ProgressBar
                    value={data.eventsUsed}
                    max={PLAN_LIMITS[data.plan] ?? data.apiLimit}
                    label="Events used this month"
                  />
                </div>

                {/* Plan Limits */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950">
                    <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                      Monthly Limit
                    </p>
                    <p className="text-2xl font-bold text-zinc-900 dark:text-white font-mono">
                      {PLAN_LIMITS[data.plan] === Infinity ? 'Unlimited' : PLAN_LIMITS[data.plan].toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950">
                    <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                      Remaining
                    </p>
                    <p className="text-2xl font-bold text-zinc-900 dark:text-white font-mono text-emerald-600 dark:text-emerald-400">
                      {PLAN_LIMITS[data.plan] === Infinity
                        ? 'Unlimited'
                        : Math.max(0, (PLAN_LIMITS[data.plan] ?? data.apiLimit) - data.eventsUsed).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <div className="p-4 pt-0 border-t border-zinc-200/50">
              {data.plan === 'free' ? (
                <PricingCheckoutButton
                  plan="starter"
                  className="w-full px-4 py-3 text-sm font-semibold text-white bg-zinc-900 rounded-xl hover:bg-zinc-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors text-center shadow-sm flex items-center justify-center gap-2"
                >
                  <ArrowUpRight className="h-4 w-4" />
                  Upgrade to Pro
                </PricingCheckoutButton>
              ) : data.plan === 'starter' ? (
                <PricingCheckoutButton
                  plan="business"
                  className="w-full px-4 py-3 text-sm font-semibold text-white bg-zinc-900 rounded-xl hover:bg-zinc-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors text-center shadow-sm flex items-center justify-center gap-2"
                >
                  <ArrowUpRight className="h-4 w-4" />
                  Upgrade to Business
                </PricingCheckoutButton>
              ) : (
                <Button
                  asChild
                  className="w-full px-4 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-600 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  <a href="/#pricing" target="_blank" rel="noopener noreferrer">
                    View plans
                  </a>
                </Button>
              )}
              <Button
                asChild
                variant="outline"
                className="w-full mt-3 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                <a href={BILLING_SUPPORT_URL}>Contact Billing Support</a>
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

          {/* Integrations card */}
          <Card
            className={cn(
              'overflow-hidden border border-slate-200 rounded-xl bg-white shadow-sm h-full flex flex-col transition-colors duration-200 hover:border-slate-300'
            )}
          >
            <CardHeaderWithIcon
              icon={Cpu}
              title="Integrations"
              description="Connect AgentTrace to your SIEM and observability stack."
            />
            <CardContent className="pt-0 flex-1">
              <div className="space-y-4">
                {/* Datadog */}
                <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/50 dark:bg-zinc-800/50 transition-colors hover:border-slate-300 dark:hover:border-zinc-600">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                      <Database className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-zinc-100">Datadog</p>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">Log forwarding & metrics</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-semibold">
                      <AlertCircle className="h-3 w-3" />
                      Coming Soon
                    </span>
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Splunk */}
                <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/50 dark:bg-zinc-800/50 transition-colors hover:border-slate-300 dark:hover:border-zinc-600">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                      <Cpu className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-zinc-100">Splunk</p>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">HEC & HTTP Event Collector</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-semibold">
                      <AlertCircle className="h-3 w-3" />
                      Coming Soon
                    </span>
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* AWS S3 */}
                <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/50 dark:bg-zinc-800/50 transition-colors hover:border-slate-300 dark:hover:border-zinc-600">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                      <Cloud className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-zinc-100">AWS S3</p>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">Archive audit logs to S3</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-semibold">
                      <AlertCircle className="h-3 w-3" />
                      Coming Soon
                    </span>
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Webhook */}
                <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/50 dark:bg-zinc-800/50 transition-colors hover:border-slate-300 dark:hover:border-zinc-600">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                      <LinkIcon className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-zinc-100">Custom Webhook</p>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">Real-time event streaming</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-semibold">
                      <CheckCircle2 className="h-3 w-3" />
                      Available
                    </span>
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
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
