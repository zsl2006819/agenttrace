'use client';

import { Terminal } from 'lucide-react';
import { CopyButton } from '@/components/copy-button';

const SNIPPET = `import { AuditRecorder } from '@agenttrace/sdk';

const recorder = new AuditRecorder({ apiKey: 'YOUR_API_KEY' });
await recorder.wrap('weather_tool', { city: 'Paris' }, () => myAgentCall());`;

export function AuditEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
        <Terminal className="h-7 w-7" />
      </div>

      <h3 className="text-lg font-semibold text-foreground">No audit logs yet</h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Send your first event using our SDK. It takes about three lines of code.
      </p>

      <div className="mt-8 w-full max-w-xl overflow-hidden rounded-xl border border-border bg-zinc-950 text-left">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
            <span className="ml-2 text-xs text-zinc-400">typescript</span>
          </div>
          <CopyButton
            value={SNIPPET}
            label="Copy"
            variant="ghost"
            size="sm"
            className="text-zinc-300 hover:bg-white/10 hover:text-white"
          />
        </div>
        <pre className="overflow-x-auto px-4 py-4 text-xs leading-relaxed text-zinc-100">
          <code>{SNIPPET}</code>
        </pre>
      </div>
    </div>
  );
}