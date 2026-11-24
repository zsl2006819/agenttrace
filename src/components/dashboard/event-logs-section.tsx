'use client';

import {
  AlertTriangle,
  Bot,
  Plug,
  ShieldCheck,
  Zap,
  Terminal,
} from 'lucide-react';
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

const CODE_SNIPPET = [
  { parts: [['$ ', 'text-slate-400'], ['npm ', 'text-blue-400'], ['install ', 'text-blue-400'], ['@agenttrace/sdk', 'text-green-400']] },
  { parts: [['$ ', 'text-slate-400'], ['agenttrace.init(', 'text-blue-400'], ["{ apiKey: 'at_live_...' })", 'text-slate-300']] },
  { parts: [['$ ', 'text-slate-400'], ['agenttrace.capture(', 'text-blue-400'], ["{ tool: 'llm_chat', input: '...' })", 'text-slate-300']] },
];

export function EventLogsSection({
  records,
  dailyCounts,
  totalEvents,
}: {
  records: AuditEvent[];
  dailyCounts: Array<{ date: string; count: number }>;
  totalEvents: number;
}) {
  return (
    <div className="space-y-8">
      {/* Event Volume Sparkline */}
      <section className="rounded-lg border border-slate-200/80 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[10px] uppercase tracking-wider text-slate-500">
            Event Volume (Last 7 Days)
          </h3>
          <span className="text-xs font-semibold tabular-nums text-slate-900">
            {dailyCounts.reduce((a, b) => a + b.count, 0)} events
          </span>
        </div>
        <EventVolumeSparkline dailyCounts={dailyCounts} />
      </section>

      {totalEvents === 0 && (
        <section className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm flex items-center justify-center min-h-[160px]">
          <p className="text-sm text-slate-400 text-center">
            Waiting for data to generate insights...
          </p>
        </section>
      )}

      {totalEvents > 0 && (
        <section className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Bot className="h-4 w-4 text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
              AI Insights
            </h3>
          </div>
          <div className="space-y-2">
            <div
              className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 shadow-sm flex gap-3 group border-l-2 border-emerald-500"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <ShieldCheck className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Guardrail blocked <span className="font-medium text-slate-900">3 attempts</span> to access{' '}
                  <span className="font-mono text-xs text-slate-500">drop_table</span> today.
                </p>
              </div>
            </div>
            <div
              className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 shadow-sm flex gap-3 group border-l-2 border-amber-500"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <AlertTriangle className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  <span className="font-medium text-slate-900">Agent [agent-demo]</span> has a{' '}
                  <span className="font-medium text-amber-600">30% higher error rate</span> than usual.
                </p>
              </div>
            </div>
            <div
              className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 shadow-sm flex gap-3 group border-l-2 border-slate-500"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-600">
                <Zap className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Recommendation: Consider rotating the API Key used by{' '}
                  <span className="font-medium text-slate-900">agent-qa</span>.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {totalEvents === 0 && (
        <section className="mt-8 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-12 shadow-sm text-center">
          <Plug className="mx-auto mb-4 h-12 w-12 text-slate-300" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            No audit events yet
          </h3>
          <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto leading-relaxed">
            Start sending events to see your audit trail and AI insights.
          </p>
          <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-sm max-w-md mx-auto mb-6">
            <div className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 border-b border-slate-700">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              <span className="h-2 w-2 rounded-full bg-yellow-500" />
              <span className="h-2 w-2 rounded-full bg-green-500" />
            </div>
            <div className="p-4 font-mono text-xs overflow-x-auto text-left">
              {CODE_SNIPPET.map((line, li) => (
                <div key={li} className="mb-1">
                  {line.parts.map(([text, color], pi) => (
                    <span key={pi} className={cn('whitespace-pre', color)}>
                      {text}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <Button size="sm" className="rounded-lg">
            Copy Integration Code
          </Button>
        </section>
      )}
    </div>
  );
}
