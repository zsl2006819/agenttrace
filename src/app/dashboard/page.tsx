import { createSupabaseServerWithAuth } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
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

  // Fetch latest 10 audit events for this user's tenant (RLS will filter by tenant_id)
  const { data: events, error } = await supabase
    .from('audit_events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Failed to fetch audit events:', error);
  }

  const records: AuditEvent[] = (events ?? []) as AuditEvent[];

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 md:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Audit Logs</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            A tamper-evident record of every tool call made by your agents.
          </p>
        </div>
        <ExportReportButton records={records} />
      </div>

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