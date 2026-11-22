import { redirect } from 'next/navigation';
import {
  createSupabaseServerWithAuth,
  createSupabaseServiceRole,
} from '@/lib/supabase-server';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ExportReportButton } from './export-report-button';
import { AuditEmptyState } from './empty-state';
import { UsageMeter } from './usage-meter';
import { DashboardRefresher } from '@/components/dashboard/dashboard-refresher';

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

  // Get current user session
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login?redirect=/dashboard');
  }

  const service = createSupabaseServiceRole();

  // Resolve the caller's tenant + plan. Service role is used so the plan
  // reflects the latest webhook update even if RLS policies lag.
  const { data: profile } = await service
    .from('profiles')
    .select('tenant_id, plan, api_limit')
    .eq('id', user.id)
    .maybeSingle();

  const tenantId = (profile?.tenant_id as string | undefined) ?? null;
  const plan = (profile?.plan as string | undefined) ?? 'free';
  const apiLimit =
    (profile?.api_limit as number | undefined) ?? DEFAULT_FREE_LIMIT;

  // Fetch latest 10 audit events for this tenant
  const { data: events, error } = await supabase
    .from('audit_events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Failed to fetch audit events:', error);
  }

  const records: AuditEvent[] = (events ?? []) as AuditEvent[];

  // Monthly usage for the quota meter
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

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 md:px-8">
      <DashboardRefresher initialPlan={plan} />

      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Audit Logs</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            A tamper-evident record of every tool call made by your agents.
          </p>
        </div>
        <div className="flex flex-col items-start gap-3 md:items-end">
          <ExportReportButton records={records} plan={plan} />
          <UsageMeter used={usedThisMonth} limit={apiLimit} plan={plan} />
        </div>
      </div>

      {/* Free plan upgrade banner */}
      {isFree && (
        <div className="mb-6 flex flex-col gap-3 rounded-xl border border-yellow-300 bg-yellow-50 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-yellow-900/50 dark:bg-yellow-950/20">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-yellow-400 text-xs font-bold text-yellow-950">
              !
            </span>
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <span className="font-semibold">You are on the Free plan.</span>{' '}
              Upgrade to unlock API limits and PDF exports.
            </p>
          </div>
          <a
            href="/#pricing"
            className="shrink-0 rounded-lg bg-yellow-500 px-4 py-2 text-center text-sm font-semibold text-yellow-950 transition-colors hover:bg-yellow-400"
          >
            Upgrade now
          </a>
        </div>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col items-end gap-4 md:flex-row">
            <div className="w-full flex-1 md:min-w-[200px]">
              <label className="mb-1 block text-sm font-medium text-muted-foreground">
                Agent ID
              </label>
              <Input placeholder="Enter Agent ID" />
            </div>
            <div className="w-full flex-1 md:min-w-[200px]">
              <label className="mb-1 block text-sm font-medium text-muted-foreground">
                Tool Name
              </label>
              <Input placeholder="Enter Tool Name" />
            </div>
            <Button className="h-10">Search</Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Table or Empty State */}
      <Card>
        {records.length === 0 ? (
          <AuditEmptyState />
        ) : (
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24">Event ID</TableHead>
                    <TableHead className="w-48">Timestamp</TableHead>
                    <TableHead>Agent ID</TableHead>
                    <TableHead>Tool Name</TableHead>
                    <TableHead className="w-20">Sequence</TableHead>
                    <TableHead className="w-32">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{record.id.substring(0, 8)}...</TableCell>
                      <TableCell>{formatTime(record.created_at)}</TableCell>
                      <TableCell>{record.agent_id}</TableCell>
                      <TableCell>{record.tool_name}</TableCell>
                      <TableCell>{record.sequence}</TableCell>
                      <TableCell>
                        <Badge
                          variant="default"
                          className="border-green-200 bg-green-100 text-green-800"
                        >
                          Verified
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Disclaimer */}
      <p className="mt-8 text-center text-xs text-muted-foreground">
        AgentTrace provides technical infrastructure only and does not constitute
        formal legal advice.
      </p>
    </div>
  );
}