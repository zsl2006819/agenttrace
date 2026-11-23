import { redirect } from 'next/navigation';
import {
  createSupabaseServerWithAuth,
  createSupabaseServiceRole,
} from '@/lib/supabase-server';
import { getCurrentTenant } from '@/lib/tenant';
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
        <Icon className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
        <CardTitle className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          {title}
        </CardTitle>
      </div>
      <CardDescription className="text-sm text-zinc-500 dark:text-zinc-400">
        {description}
      </CardDescription>
    </CardHeader>
  );
}

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-100 pb-3 pt-2 last:border-0 dark:border-zinc-800/70 sm:flex-row">
      <span className="text-sm text-zinc-500 dark:text-zinc-400">{label}</span>
      <span className="break-all font-mono text-sm text-zinc-900 dark:text-zinc-100">
        {value}
      </span>
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
  const apiLimit =
    (profile?.api_limit as number | undefined) ?? 10_000;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 md:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Settings
        </h1>
        <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
          Manage your account and workspace details.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column */}
        <div className="lg:col-span-1 space-y-6 flex flex-col h-full">
          {/* Account card */}
          <Card className="overflow-hidden border border-zinc-200/50 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)] dark:border-zinc-800/50 dark:bg-zinc-900 h-full flex flex-col">
            <CardHeaderWithIcon
              icon={User}
              title="Account"
              description="Your personal account information."
            />
            <CardContent className="pt-0 flex-1">
              <div className="divide-y divide-zinc-100/70 dark:divide-zinc-800/70">
                <FieldRow label="Email" value={user.email ?? '—'} />
                <FieldRow label="User ID" value={user.id} />
                <FieldRow label="Tenant ID" value={tenantId ?? '—'} />
              </div>
            </CardContent>
          </Card>

          {/* Subscription card */}
          <Card className="overflow-hidden border border-zinc-200/50 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)] dark:border-zinc-800/50 dark:bg-zinc-900 h-full flex flex-col">
            <CardHeaderWithIcon
              icon={CreditCard}
              title="Subscription"
              description="Manage your plan, billing, and payment method."
            />
            <CardContent className="pt-0 flex-1">
              <div className="divide-y divide-zinc-100/70 dark:divide-zinc-800/70">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-3 pt-2 last:border-0 dark:border-zinc-800/70">
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">
                    Current plan
                  </span>
                  <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">
                    {PLAN_LABELS[plan] ?? plan}
                  </span>
                </div>
                <FieldRow
                  label="Monthly event limit"
                  value={apiLimit.toLocaleString('en-US')}
                />
              </div>
            </CardContent>
            <div className="p-4 pt-0 border-t border-zinc-100 dark:border-zinc-800/50 flex flex-col gap-3 sm:flex-row sm:items-end">
              <Button
                asChild
                className={cn(
                  'w-full sm:w-auto rounded-lg bg-zinc-900 text-white shadow-sm hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200'
                )}
              >
                <a href={BILLING_SUPPORT_URL}>Contact Billing Support</a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full sm:w-auto rounded-lg border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800"
              >
                <a href="/#pricing" target="_blank" rel="noopener noreferrer">
                  {plan === 'free' ? 'Upgrade plan' : 'View plans'}
                </a>
              </Button>
            </div>
          </Card>
        </div>

        {/* Right column */}
        <div className="lg:col-span-1 space-y-6 flex flex-col h-full">
          {/* Security card */}
          <Card className="overflow-hidden border border-zinc-200/50 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)] dark:border-zinc-800/50 dark:bg-zinc-900 h-full flex flex-col">
            <CardHeaderWithIcon
              icon={Shield}
              title="Security"
              description="Protect your account and workspace."
            />
            <CardContent className="pt-0 flex-1">
              <div className="divide-y divide-zinc-100/70 dark:divide-zinc-800/70">
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
          <Card className="overflow-hidden border border-red-200/50 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)] dark:border-red-900/30 dark:bg-zinc-900 h-full flex flex-col">
            <CardHeader className="pb-1">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500 dark:text-red-400" />
                <CardTitle className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  Danger Zone
                </CardTitle>
              </div>
              <CardDescription className="text-sm text-zinc-500 dark:text-zinc-400">
                Permanent actions. Cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 flex-1">
              <div className="flex items-center justify-between border-b border-zinc-100 py-3 last:border-0 dark:border-zinc-800/50">
                <div>
                  <span className="text-sm text-zinc-900 dark:text-zinc-100">
                    Delete Workspace
                  </span>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Permanently delete all data and audit events.
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/40 dark:hover:text-red-300"
                >
                  <Lock className="mr-2 h-4 w-4" strokeWidth={1.75} />
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <p className="mt-10 text-center text-xs leading-relaxed text-zinc-400 dark:text-zinc-500">
        AgentTrace provides technical infrastructure only and does not constitute
        formal legal advice.
      </p>
    </div>
  );
}
