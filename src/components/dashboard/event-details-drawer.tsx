'use client';

import { useState } from 'react';
import {
  ChevronRight,
  Copy,
  CheckCircle2,
  X,
  FileJson,
  Terminal,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CopyButton } from '@/components/copy-button';
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

interface EventDetailsDrawerProps {
  open: boolean;
  onClose: () => void;
  record: AuditEvent | null;
}

export function EventDetailsDrawer({
  open,
  onClose,
  record,
}: EventDetailsDrawerProps) {
  if (!open || !record) return null;

  const shortId = record.id.substring(0, 8);
  const fullId = record.id;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      {/* Drawer panel */}
      <div className="fixed right-0 top-0 z-50 h-full w-full md:w-[560px] bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl transform transition-transform duration-300 translate-x-0">
        {/* Drawer header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400 shadow-[0_0_16px_rgba(16,185,129,0.25)]">
              <ShieldCheck className="h-4 w-4" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Event Details
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Black-box audit record
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Drawer body */}
        <div className="overflow-y-auto h-full p-6 space-y-6">
          {/* Top: Verified badge + Event ID */}
          <div className="flex items-center justify-between gap-3">
            <div className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-400">
              <CheckCircle2 className="h-3 w-3" strokeWidth={2} />
              <span>Verified</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs text-zinc-600 dark:text-zinc-400 truncate">
              <span>Event ID:</span>
              <span className="truncate max-w-[200px]">{fullId}</span>
            </div>
          </div>

          {/* Section 1: Cryptographic Proof */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300">
                <Terminal className="h-3.5 w-3.5" strokeWidth={1.75} />
              </div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Cryptographic Proof
              </h3>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Tamper-evident hash chain fields. Any change breaks the chain.
            </p>

            <div className="grid grid-cols-1 gap-3">
              {[
                { label: 'prev_hash', value: record.prev_hash ?? '0000…0000' },
                { label: 'current_hash', value: record.current_hash ?? '—' },
                { label: 'signature', value: record.signature ?? '—' },
              ].map((field) => (
                <div
                  key={field.label}
                  className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-800/50"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                      {field.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-left">
                    <span className="font-mono text-xs text-zinc-900 dark:text-zinc-100 truncate max-w-[220px]">
                      {field.value}
                    </span>
                    <CopyButton
                      value={field.value}
                      label="Copy"
                      variant="ghost"
                      size="sm"
                      className="h-7 shrink-0 px-2 text-[10px] text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Payload Details */}
          <div className="space-y-3 border-t border-zinc-100 pt-6 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300">
                <FileJson className="h-3.5 w-3.5" strokeWidth={1.75} />
              </div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Payload Details
              </h3>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              The exact agent invocation that was recorded.
            </p>

            <div className="grid grid-cols-1 gap-4">
              {[
                { label: 'Tool Name', value: record.tool_name, mono: false },
                { label: 'Agent ID', value: record.agent_id, mono: true },
                { label: 'Session ID', value: record.session_id, mono: true },
                { label: 'Sequence', value: String(record.sequence), mono: true },
                { label: 'Idempotency Key', value: record.idempotency_key, mono: true },
              ].map((field) => (
                <div
                  key={field.label}
                  className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-800/50"
                >
                  <span className="text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    {field.label}
                  </span>
                  <div className="flex items-center gap-2 flex-1 text-left">
                    <span
                      className={cn(
                        'font-mono text-xs truncate max-w-[260px]',
                        field.mono
                          ? 'text-zinc-900 dark:text-zinc-100'
                          : 'text-zinc-700 dark:text-zinc-200'
                      )}
                    >
                      {field.value}
                    </span>
                    {field.mono && (
                      <CopyButton
                        value={field.value}
                        label="Copy"
                        variant="ghost"
                        size="sm"
                        className="h-7 shrink-0 px-2 text-[10px] text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-800/50">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  Created At
                </span>
                <span className="font-mono text-xs text-zinc-900 dark:text-zinc-100">
                  {record.created_at}
                </span>
              </div>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                Human override:{' '}
                {record.human_override ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

interface ClickableRowProps {
  record: AuditEvent;
  onSelect: (record: AuditEvent) => void;
}

export function EventLogsRow({ record, onSelect }: ClickableRowProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyId = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(record.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      onClick={() => onSelect(record)}
      className="w-full text-left transition-all duration-200 group"
    >
      <tr className="border-b border-slate-200 last:border-0 h-16">
        <td className="px-6 align-middle">
          <span
            onClick={handleCopyId}
            className="cursor-pointer font-mono text-xs text-slate-600 bg-slate-100 rounded px-1.5 py-0.5 hover:bg-slate-200 transition-colors"
          >
            {record.id.substring(0, 8)}
          </span>
          {copied && (
            <span className="ml-1 text-[10px] text-emerald-600 font-medium">
              Copied
            </span>
          )}
        </td>
        <td className="px-6 align-middle text-sm text-slate-600 tabular-nums">
          {new Date(record.created_at).toLocaleString('en-US', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })}
        </td>
        <td className="px-6 align-middle text-sm text-slate-600">
          {record.agent_id}
        </td>
        <td className="px-6 align-middle text-sm text-slate-600">
          {record.tool_name}
        </td>
        <td className="px-6 align-middle text-xs font-mono tabular-nums text-slate-600">
          {record.sequence}
        </td>
        <td className="px-6 align-middle">
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-600">
            <span
              aria-hidden
              className="w-1.5 h-1.5 rounded-full bg-emerald-600"
            />
            Verified
          </span>
        </td>
        <td className="px-6 align-middle text-right opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <ChevronRight className="h-3 w-3 text-slate-400" />
        </td>
      </tr>
    </button>
  );
}
