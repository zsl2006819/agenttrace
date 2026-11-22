import { Badge } from '@/components/ui/badge';
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
 * Lightweight monthly usage indicator shown next to the Audit Logs heading.
 * Turns yellow once usage crosses 80% of the plan limit.
 */
export function UsageMeter({ used, limit, plan }: UsageMeterProps) {
  const safeLimit = limit > 0 ? limit : 0;
  const pct = safeLimit > 0 ? Math.min(100, (used / safeLimit) * 100) : 0;
  const warning = pct >= 80;
  const exhausted = safeLimit > 0 && used >= safeLimit;

  return (
    <div className="w-full max-w-sm rounded-xl border border-border bg-card p-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">
            {formatNumber(used)} / {formatNumber(safeLimit)} events used
          </span>
        </div>
        <Badge
          variant="outline"
          className={cn(
            'shrink-0 text-[10px] uppercase tracking-wider',
            plan === 'free'
              ? 'border-zinc-300 text-zinc-600'
              : 'border-emerald-300 text-emerald-700'
          )}
        >
          {PLAN_LABELS[plan] ?? plan}
        </Badge>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            exhausted
              ? 'bg-red-500'
              : warning
                ? 'bg-yellow-500'
                : 'bg-emerald-500'
          )}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {exhausted
            ? 'Monthly limit reached'
            : `${Math.round(pct)}% of monthly quota`}
        </span>
        {warning && (
          <span
            className={cn(
              'text-xs font-medium',
              exhausted ? 'text-red-600' : 'text-yellow-600'
            )}
          >
            {exhausted ? 'Upgrade required' : 'Upgrade recommended'}
          </span>
        )}
      </div>
    </div>
  );
}