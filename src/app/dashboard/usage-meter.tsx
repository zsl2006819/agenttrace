import { cn } from '@/lib/utils';

interface UsageMeterProps {
  used: number;
  limit: number;
  plan: string;
}

const PLAN_LABELS: Record<string, string> = {
  free: 'Free',
  starter: 'Starter',
  business: 'Business',
  enterprise: 'Enterprise',
};

const formatNumber = (value: number): string => value.toLocaleString('en-US');

/**
 * Minimal monthly usage indicator: one line of text over a hairline bar.
 * Deliberately quiet so it never competes with the audit data.
 */
export function UsageMeter({ used, limit, plan }: UsageMeterProps) {
  const safeLimit = limit > 0 ? limit : 0;
  const pct = safeLimit > 0 ? Math.min(100, (used / safeLimit) * 100) : 0;
  const warning = pct >= 80;
  const exhausted = safeLimit > 0 && used >= safeLimit;

  return (
    <div className="w-full md:w-64">
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          <span className="font-medium text-zinc-900 dark:text-zinc-100">
            {formatNumber(used)}
          </span>
          {' / '}
          {formatNumber(safeLimit)} events
        </span>
        <span className="text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          {PLAN_LABELS[plan] ?? plan}
        </span>
      </div>

      <div className="h-1 w-full overflow-hidden rounded-full bg-zinc-200/80 dark:bg-zinc-800">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            exhausted
              ? 'bg-red-500'
              : warning
                ? 'bg-amber-500'
                : 'bg-zinc-900 dark:bg-zinc-100'
          )}
          style={{ width: `${pct}%` }}
        />
      </div>

      {warning && (
        <p
          className={cn(
            'mt-1.5 text-[11px]',
            exhausted ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-500'
          )}
        >
          {exhausted
            ? 'Monthly limit reached — upgrade to keep recording.'
            : 'Approaching your monthly limit.'}
        </p>
      )}
    </div>
  );
}