'use client';

import { cn } from '@/lib/utils';

interface TwoFactorToggleProps {
  label: string;
  description: string;
  enabled: boolean;
}

export function TwoFactorToggle({
  label,
  description,
  enabled,
}: TwoFactorToggleProps) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-100 py-3 last:border-0 dark:border-zinc-800/70 sm:flex-row">
      <div>
        <span className="text-sm text-zinc-900 dark:text-zinc-100">{label}</span>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{description}</p>
      </div>
      <button
        disabled
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70',
          enabled
            ? 'bg-emerald-50 border-emerald-500 dark:bg-emerald-900/40 dark:border-emerald-500'
            : 'bg-zinc-200 border-zinc-300 dark:bg-zinc-800 dark:border-zinc-700'
        )}
      >
        <span
          className={cn(
            'inline-block h-5 w-5 transform rounded-full bg-white transition-transform',
            enabled ? 'translate-x-5' : 'translate-x-0'
          )}
          aria-hidden="true"
        />
      </button>
    </div>
  );
}
