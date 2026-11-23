'use client';

import { CopyButton } from '@/components/copy-button';

const SNIPPET = `import { AuditRecorder } from '@agenttrace/sdk';

const recorder = new AuditRecorder({ apiKey: 'YOUR_API_KEY' });
await recorder.wrap('weather_tool', { city: 'Paris' }, () => myAgentCall());`;

export function AuditEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
      <div className="mb-6 w-full max-w-xs">
        <svg
          className="mx-auto h-20 w-20 text-zinc-200 animate-pulse dark:text-zinc-800/50"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect width="16" height="12" x="4" y="6" rx="2" />
          <path d="M2 12h20" />
          <path d="M12 2v20" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      </div>

      <h3 className="text-base font-medium text-zinc-900 dark:text-zinc-100">
        Waiting for your first agent event…
      </h3>
      <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
        Send your first event using our SDK. It takes about three lines of code.
      </p>

      <div className="mt-8 w-full max-w-xl overflow-hidden rounded-xl bg-zinc-900 text-left shadow-sm">
        <div className="flex items-center justify-between gap-3 px-4 py-2">
          <span className="text-[10px] uppercase tracking-wider text-zinc-500">
            TypeScript
          </span>
          <CopyButton
            value={SNIPPET}
            label="Copy"
            variant="ghost"
            size="sm"
            className="h-8 shrink-0 px-2.5 text-xs text-zinc-300 hover:bg-white/10 hover:text-white"
          />
        </div>
        <pre className="overflow-x-auto px-4 pb-4 text-xs leading-relaxed text-zinc-100">
          <code>{SNIPPET}</code>
        </pre>
      </div>
    </div>
  );
}
