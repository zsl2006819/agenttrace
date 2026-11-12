import { getSupabaseServer } from '@/lib/supabase-server';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ExportReportButton } from './export-report-button';

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

export default async function DashboardPage() {
  // Fetch latest 10 audit events
  const { data: events, error } = await getSupabaseServer()
    .from('audit_events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Failed to fetch audit events:', error);
  }

  const records: AuditEvent[] = (events ?? []) as AuditEvent[];

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

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Top bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-primary">AgentTrace Dashboard</span>
        </div>
        <ExportReportButton records={records} />
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Agent ID
              </label>
              <Input placeholder="Enter Agent ID" />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Tool Name
              </label>
              <Input placeholder="Enter Tool Name" />
            </div>
            <Button className="h-10">
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
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
                    <TableCell>
                      {record.id.substring(0, 8)}...
                    </TableCell>
                    <TableCell>{formatTime(record.created_at)}</TableCell>
                    <TableCell>{record.agent_id}</TableCell>
                    <TableCell>{record.tool_name}</TableCell>
                    <TableCell>{record.sequence}</TableCell>
                    <TableCell>
                      <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                        Verified
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {records.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-4">
                      No audit records found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <p className="mt-8 text-xs text-muted-foreground text-center">
        AgentTrace provides technical infrastructure only and does not constitute formal legal advice.
      </p>
    </div>
  );
}