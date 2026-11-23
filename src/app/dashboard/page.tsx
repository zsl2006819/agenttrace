import { redirect } from 'next/navigation';
import {
  createSupabaseServerWithAuth,
  createSupabaseServiceRole,
} from '@/lib/supabase-server';
import { ExportReportButton } from './export-report-button';
import { AuditEmptyState } from './empty-state';
import { UsageMeter } from './usage-meter';
import { ChainIntegrityBanner } from '@/components/dashboard/chain-integrity-banner';
import { DashboardRefresher } from '@/components/dashboard/dashboard-refresher';
import { EventLogsSection } from '@/components/dashboard/event-logs-section';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

interface AuditEvent {
  id: string;
  tenant_id: string;
  agent_id: string;
  session_id: string;
  sequence: number;
  idempotency_key: string;
  tool_name: string;
  input_hash?: string | null;
  output_hash?: string | null;
  error_code?: string | null;
  human_override: boolean;
  prev_hash?: string | null;
  current_hash?: string | null;
  signature?: string | null;
  key_id?: string | null;
  created_at: string;
}

const formatTime = (isoString: string): string => {
  return new Date(isoString).toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

const DEFAULT_FREE_LIMIT = 10_000;

export default async function DashboardPage() {
  const supabase = createSupabaseServerWithAuth();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login?redirect=/dashboard');
  }

  const service = createSupabaseServiceRole();

  const { data: profile } = await service
    .from('profiles')
    .select('tenant_id, plan, api_limit')
    .eq('id', user.id)
    .maybeSingle();

  const tenantId = (profile?.tenant_id as string | undefined) ?? null;
  const plan = (profile?.plan as string | undefined) ?? 'free';
  const apiLimit =
    (profile?.api_limit as number | undefined) ?? DEFAULT_FREE_LIMIT;

  const { data: events, error } = await supabase
    .from('audit_events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Failed to fetch audit events:', error);
  }

  const records: AuditEvent[] = (events ?? []) as AuditEvent[];

  let usedThisMonth = 0;
  if (tenantId) {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const { count } = await service
      .from('audit_events')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .gte('created_at', monthStart.toISOString());

    usedThisMonth = count ?? 0;
  }

  const isFree = plan === 'free';

  const { count: totalEventsCount } = await service
    .from('audit_events')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId);
  const { count: activeKeysCount } = await service
    .from('api_keys')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)
    .is('revoked_at', null);

  // Daily counts for sparkline (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const dailyCounts: Array<{ date: string; count: number }> = [];
  if (tenantId) {
    const { data: dailyData } = await service
      .from('audit_events')
      .select('created_at')
      .eq('tenant_id', tenantId)
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: true });

    const countsByDate = new Map<string, number>();
    (dailyData ?? []).forEach((row) => {
      const date = new Date(row.created_at).toISOString().split('T')[0];
      countsByDate.set(date, (countsByDate.get(date) ?? 0) + 1);
    });

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      dailyCounts.push({ date: dateStr, count: countsByDate.get(dateStr) ?? 0 });
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 md:px-10">
      <DashboardRefresher initialPlan={plan} />

      {/* Header */}
      <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Audit Logs
          </h1>
          <p className="mt-1.5 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
            A tamper-evident record of every tool call made by your agents.
          </p>
        </div>

        <div className="flex flex-col gap-4 md:items-end">
          <ExportReportButton records={records} plan={plan} />
          <UsageMeter used={usedThisMonth} limit={apiLimit} plan={plan} />
        </div>
      </div>

      {/* KPI cards */}
        <div className="mb-8 grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-zinc-200/50 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-zinc-800/50 dark:bg-zinc-900">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-1.5">
            Total Events
          </p>
          <p className="text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
            {(totalEventsCount ?? 0).toLocaleString('en-US')}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200/50 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-zinc-800/50 dark:bg-zinc-900">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-1.5">
            Quota Used
          </p>
          <div className="mb-1.5 text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
            {usedThisMonth.toLocaleString('en-US')} /{' '}
            {apiLimit.toLocaleString('en-US')}
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                usedThisMonth >= apiLimit
                  ? 'bg-red-500'
                  : usedThisMonth / apiLimit >= 0.8
                    ? 'bg-amber-500'
                    : 'bg-zinc-900 dark:bg-zinc-100'
              )}
              style={{ width: `${Math.min(100, (usedThisMonth / apiLimit) * 100)}%` }}
            />
          </div>
        </div>
        <div className="rounded-xl border border-zinc-200/50 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-zinc-800/50 dark:bg-zinc-900">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-1.5">
            Active Keys
          </p>
          <p className="text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
            {(activeKeysCount ?? 0).toLocaleString('en-US')}
          </p>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md hover:border-emerald-200 dark:border-emerald-900/30 dark:bg-zinc-900">
          <div className="flex items-end gap-2">
            <p className="text-3xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">98</p>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">/ 100</span>
          </div>
          <p className="mt-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            Trust Score — Excellent
          </p>
        </div>
      </div>

      {/* Chain integrity banner */}
      <ChainIntegrityBanner />

      {/* Event logs table + drawer */}
      <EventLogsSection records={records} dailyCounts={dailyCounts} />

      {/* Free plan upgrade banner */}
      {isFree && (
        <div className="mb-8 flex flex-col gap-3 rounded-xl bg-zinc-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:bg-zinc-900/60">
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              You are on the Free plan.
            </span>{' '}
            Upgrade to unlock API limits and PDF exports.
          </p>
          <a
            href="/#pricing"
            className="shrink-0 self-start rounded-lg bg-zinc-900 px-3.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300 sm:self-auto"
          >
            Upgrade now
          </a>
        </div>
      )}

      {/* Disclaimer */}
      <p className="mt-10 text-center text-xs leading-relaxed text-zinc-400 dark:text-zinc-500">
        AgentTrace provides technical infrastructure only and does not constitute
        formal legal advice.
      </p>
    </div>
  );
}
