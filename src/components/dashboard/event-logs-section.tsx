'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  AlertTriangle,
  Bot,
  ChevronDown,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import {
  EventDetailsDrawer,
  EventLogsRow,
} from './event-details-drawer';
import { EventVolumeSparkline } from './event-volume-sparkline';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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

export function EventLogsSection({
  records,
  dailyCounts,
}: {
  records: AuditEvent[];
  dailyCounts: Array<{ date: string; count: number }>;
}) {
  const [openRecord, setOpenRecord] = useState<AuditEvent | null>(null);

  return (
    <div className="space-y-8">
      {/* Event Volume Sparkline */}
      <section className="rounded-lg border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Event Volume (Last 7 Days)
          </h3>
          <span className="text-xs font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
            {dailyCounts.reduce((a, b) => a + b.count, 0)} events
          </span>
        </div>
        <EventVolumeSparkline dailyCounts={dailyCounts} />
      </section>

      {/* AI Insights Panel */}
      <section className="rounded-xl border border-zinc-100 bg-zinc-50 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="flex items-center gap-2 mb-6">
          <Bot className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
            AI Insights
          </h3>
        </div>
        <div className="space-y-3">
          <div
            className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/40 flex gap-3 group border-l-2 border-emerald-500"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
              <ShieldCheck className="h-5 w-5" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm text-zinc-700 dark:text-zinc-400 leading-relaxed">
                Guardrail blocked <span className="font-medium text-zinc-900 dark:text-zinc-100">3 attempts</span> to access{' '}
                <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">drop_table</span> today.
              </p>
            </div>
          </div>
          <div
            className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/40 flex gap-3 group border-l-2 border-amber-500"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
              <AlertTriangle className="h-5 w-5" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm text-zinc-700 dark:text-zinc-400 leading-relaxed">
                <span className="font-medium text-zinc-900 dark:text-zinc-100">Agent [agent-demo]</span> has a{' '}
                <span className="font-medium text-amber-600">30% higher error rate</span> than usual.
              </p>
            </div>
          </div>
          <div
            className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/40 flex gap-3 group border-l-2 border-zinc-500"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-50 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              <Zap className="h-5 w-5" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm text-zinc-700 dark:text-zinc-400 leading-relaxed">
                Recommendation: Consider rotating the API Key used by{' '}
                <span className="font-medium text-zinc-900 dark:text-zinc-100">agent-qa</span>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Data Table */}
      <div className="mt-8 overflow-hidden rounded-xl border border-zinc-200/70 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40 flex flex-col">
        <div className="border-b border-zinc-200/70 px-6 py-4 flex items-center justify-between gap-4 dark:border-zinc-800/50">
          <div className="relative flex-1 max-w-xs">
            <input
              type="search"
              placeholder="Search events…"
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500"
            />
          </div>
          <Button size="sm" className="rounded-lg">
            Filter <ChevronDown className="ml-1 h-3.5 w-3.5" strokeWidth={1.5} />
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent dark:hover:bg-transparent">
              <TableHead className="w-28">Event ID</TableHead>
              <TableHead className="w-44">Timestamp</TableHead>
              <TableHead>Agent ID</TableHead>
              <TableHead>Tool Name</TableHead>
              <TableHead className="w-20">Seq</TableHead>
              <TableHead className="w-28">Status</TableHead>
              <TableHead className="w-10 text-right" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record) => (
              <EventLogsRow key={record.id} record={record} onSelect={setOpenRecord} />
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Drawer */}
      <EventDetailsDrawer
        open={openRecord !== null}
        onClose={() => setOpenRecord(null)}
        record={openRecord}
      />
    </div>
  );
}
