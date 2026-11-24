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
    <div className="mx-auto max-w-7xl py-8 px-4 sm:px-6 lg:px-8">
      <DashboardRefresher initialPlan={plan} />

      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Audit Logs
          </h1>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
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
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm h-full flex flex-col transition-colors duration-200 hover:border-slate-300">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">
            Total Events
          </p>
          <p className="text-3xl font-medium tabular-nums text-slate-900">
            {(totalEventsCount ?? 0).toLocaleString('en-US')}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm h-full flex flex-col transition-colors duration-200 hover:border-slate-300">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">
            Quota Used
          </p>
          <div className="mb-1.5 text-3xl font-medium tabular-nums text-slate-900">
            {usedThisMonth.toLocaleString('en-US')} /{' '}
            {apiLimit.toLocaleString('en-US')}
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-slate-200 mt-auto">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                usedThisMonth >= apiLimit
                  ? 'bg-red-500'
                  : usedThisMonth / apiLimit >= 0.8
                    ? 'bg-amber-500'
                    : 'bg-slate-900'
              )}
              style={{ width: `${Math.min(100, (usedThisMonth / apiLimit) * 100)}%` }}
            />
          </div>
        </div>
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm h-full flex flex-col transition-colors duration-200 hover:border-slate-300">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">
            Active Keys
          </p>
          <p className="text-3xl font-medium tabular-nums text-slate-900 mt-auto">
            {(activeKeysCount ?? 0).toLocaleString('en-US')}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm flex flex-col h-full transition-colors duration-200 hover:border-slate-300">
          <div className="flex items-center justify-between">
            <div className="relative w-16 h-16">
              {totalEventsCount === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-3xl font-bold tabular-nums text-slate-400 leading-none">--</p>
                </div>
              ) : (
                <>
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="slate-100"
                      strokeWidth="8"
                      fill="transparent"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="emerald-600"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray="283"
                      strokeDashoffset={5.66}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-3xl font-bold tabular-nums text-emerald-600 leading-none">100</p>
                  </div>
                </>
              )}
            </div>
            <div>
              <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider">
                Trust Score
              </p>
              <p className={cn(
                'text-xs font-medium uppercase tracking-wider',
                totalEventsCount === 0 ? 'text-slate-400' : 'text-emerald-600'
              )}>
                {totalEventsCount === 0 ? 'Awaiting data' : 'Excellent'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chain integrity banner */}
      <ChainIntegrityBanner />

      {/* Event logs table + drawer */}
      <EventLogsSection
        records={records}
        dailyCounts={dailyCounts}
        totalEvents={totalEventsCount ?? 0}
      />

      {/* Free plan upgrade banner */}
      {isFree && (
        <div className="mb-8 flex flex-col gap-3 rounded-xl bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-relaxed text-slate-600">
            <span className="font-medium text-slate-900">
              You are on the Free plan.
            </span>{' '}
            Upgrade to unlock API limits and PDF exports.
          </p>
          <a
            href="/#pricing"
            className="shrink-0 self-start rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-slate-800 sm:self-auto"
          >
            Upgrade now
          </a>
        </div>
      )}

      {/* Disclaimer */}
      <p className="mt-10 text-center text-xs leading-relaxed text-slate-400">
        AgentTrace provides technical infrastructure only and does not constitute
        formal legal advice.
      </p>
    </div>
  );
}
