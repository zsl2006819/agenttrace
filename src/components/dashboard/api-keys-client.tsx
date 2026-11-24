'use client';

import { useState } from 'react';
import { KeyRound, Plus, Trash, CircleAlert, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CopyButton } from '@/components/copy-button';
import { cn } from '@/lib/utils';

export interface ApiKeyRow {
  id: string;
  name: string;
  key_prefix: string;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
}

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });

const formatRelativeTime = (iso: string | null): string => {
  if (!iso) return 'Never';
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
};

const headCell =
  'px-4 py-2.5 text-[11px] font-medium uppercase tracking-widest text-zinc-500 dark:text-zinc-400';

const cellBase = 'px-6 py-3';

export function ApiKeysClient({ initialKeys }: { initialKeys: ApiKeyRow[] }) {
  const [keys, setKeys] = useState<ApiKeyRow[]>(initialKeys);
  const [creating, setCreating] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setError(null);
    setCreating(true);
    try {
      const res = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate key');
      setRevealedKey(data.key as string);
      setKeys((prev) => [data.record as ApiKeyRow, ...prev]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate key');
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (id: string) => {
    setRevokingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/keys?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to revoke key');
      }
      setKeys((prev) => prev.filter((k) => k.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to revoke key');
    } finally {
      setRevokingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 md:px-10">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            API Keys
          </h1>
          <p className="mt-1.5 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
            Use a key to authenticate requests from your agents to the audit API.
          </p>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={creating}
          className="rounded-lg bg-zinc-900 text-white shadow-sm hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {creating ? (
            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" strokeWidth={2} />
          )}
          Generate API Key
        </Button>
      </div>

      {error && (
        <div className="mb-5 flex items-start gap-2 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-400">
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} />
          <span>{error}</span>
        </div>
      )}

      {/* List */}
      {keys.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-200/70 bg-white px-6 py-16 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500">
            <KeyRound className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            No API keys yet
          </p>
          <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
            Generate your first key to start recording audit events from your
            agents.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-200/70 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800">
                <th className={headCell}>Name</th>
                <th className={headCell}>Key</th>
                <th className={headCell}>Created</th>
                <th className={headCell}>Last Used</th>
                <th className={headCell}>Permissions</th>
                <th className={headCell}>Status</th>
                <th className={headCell} />
              </tr>
            </thead>
            <tbody>
              {keys.map((k) => {
                const revoked = Boolean(k.revoked_at);
                return (
                  <tr
                    key={k.id}
                    className="border-b border-zinc-100 last:border-0 transition-all duration-200 hover:bg-zinc-50 dark:border-zinc-800/70 dark:hover:bg-zinc-800/30 h-14"
                  >
                    <td className={`${cellBase} text-sm font-medium text-zinc-900 dark:text-zinc-100`}>
                      {k.name}
                    </td>
                    <td className={`${cellBase} font-mono text-xs text-zinc-600 dark:text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded dark:bg-zinc-800/40`}>
                      {k.key_prefix}••••••••
                    </td>
                    <td className={`${cellBase} font-mono text-sm tabular-nums text-zinc-600 dark:text-zinc-500`}>
                      {formatDate(k.created_at)}
                    </td>
                    <td className={`${cellBase} font-mono text-sm text-zinc-600 dark:text-zinc-500`}>
                      {formatRelativeTime(k.last_used_at)}
                    </td>
                    <td className={cellBase}>
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-600 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-400">
                        Read/Write
                      </span>
                    </td>
                    <td className={cellBase}>
                      <span
                        className={
                          revoked
                            ? 'inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 dark:text-zinc-500'
                            : 'inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400'
                        }
                      >
                        <span
                          aria-hidden
                          className={
                            revoked
                              ? 'h-1.5 w-1.5 rounded-full bg-zinc-300 dark:bg-zinc-600'
                              : 'h-1.5 w-1.5 rounded-full bg-emerald-500'
                          }
                        />
                        {revoked ? 'Revoked' : 'Active'}
                      </span>
                    </td>
                    <td className={`${cellBase} text-right`}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRevoke(k.id)}
                        disabled={revokingId === k.id}
                        className={cn(
                          'border-zinc-200 text-zinc-400 hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:border-zinc-700 dark:text-zinc-500 dark:hover:bg-red-950/40 dark:hover:text-red-400 dark:hover:border-red-800',
                          revokingId === k.id && 'opacity-50 pointer-events-none'
                        )}
                      >
                        {revokingId === k.id ? (
                          <LoaderCircle className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash className="h-4 w-4" strokeWidth={1.75} />
                        )}
                        <span className="ml-2 hidden md:inline">Revoke</span>
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* One-time reveal modal */}
      {revealedKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-200/70 bg-white/95 p-6 shadow-xl backdrop-blur-xl dark:border-zinc-700 dark:bg-zinc-900/95">
            <div className="mb-5 flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-500">
                <CircleAlert className="h-4 w-4" strokeWidth={1.75} />
              </div>
              <div>
                <h2 className="text-base font-medium tracking-tight text-zinc-900 dark:text-zinc-100">
                  Copy your API key now
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                  Copy this key and store it somewhere safe. You will not be able
                  to view it again after closing this dialog.
                </p>
              </div>
            </div>

            <div className="mb-5 flex items-center gap-2 rounded-lg bg-zinc-50 p-2.5 pl-3.5 dark:bg-zinc-800/60">
              <code className="min-w-0 flex-1 break-all font-mono text-xs text-zinc-900 dark:text-zinc-100">
                {revealedKey}
              </code>
              <CopyButton
                value={revealedKey}
                label="Copy"
                className="shrink-0 rounded-md bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
              />
            </div>

            <div className="flex justify-end">
              <Button
                onClick={() => setRevealedKey(null)}
                className="rounded-lg bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
              >
                I&apos;ve saved it
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}