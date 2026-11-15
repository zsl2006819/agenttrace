'use client';

import { useState } from 'react';
import { KeyRound, Plus, Trash, CircleAlert, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CopyButton } from '@/components/copy-button';
import { Badge } from '@/components/ui/badge';

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
    <div className="mx-auto max-w-4xl px-6 py-8 md:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">API Keys</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Use a key to authenticate requests from your agents to the audit API.
          </p>
        </div>
        <Button onClick={handleGenerate} disabled={creating}>
          {creating ? (
            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          Generate API Key
        </Button>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* List */}
      {keys.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-16 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
            <KeyRound className="h-6 w-6" />
          </div>
          <p className="text-sm font-medium text-foreground">No API keys yet</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Generate your first key to start recording audit events from your
            agents.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/40">
              <tr>
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground">
                  Name
                </th>
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground">
                  Key
                </th>
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground">
                  Created
                </th>
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {keys.map((k) => {
                const revoked = Boolean(k.revoked_at);
                return (
                  <tr key={k.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium text-foreground">
                      {k.name}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {k.key_prefix}••••••••
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(k.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={
                          revoked
                            ? 'border-red-200 bg-red-50 text-red-700'
                            : 'border-green-200 bg-green-50 text-green-700'
                        }
                      >
                        {revoked ? 'Revoked' : 'Active'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRevoke(k.id)}
                        disabled={revokingId === k.id}
                        className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20"
                      >
                        {revokingId === k.id ? (
                          <LoaderCircle className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash className="h-4 w-4" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-lg">
            <div className="mb-4 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-500">
                <CircleAlert className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  Copy your API key now
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Copy this key and store it somewhere safe. You will not be able
                  to view it again after closing this dialog.
                </p>
              </div>
            </div>

            <div className="mb-5 flex items-center gap-2 rounded-lg border border-border bg-muted/40 p-3">
              <code className="flex-1 break-all font-mono text-xs text-foreground">
                {revealedKey}
              </code>
              <CopyButton value={revealedKey} label="Copy" />
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setRevealedKey(null)}>
                I&apos;ve saved it
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}