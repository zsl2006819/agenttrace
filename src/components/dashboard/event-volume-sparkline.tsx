'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface EventVolumeSparklineProps {
  dailyCounts: Array<{ date: string; count: number }>;
}

const COLORS = ['#111827', '#059669', '#dc2626'];

export function EventVolumeSparkline({
  dailyCounts,
}: EventVolumeSparklineProps) {
  const total = dailyCounts.reduce((a, b) => a + b.count, 0);

  return (
    <section className="rounded-xl border border-zinc-100 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between mb-3 px-5 pt-4">
        <h3 className="text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
          Event Volume (Last 7 Days)
        </h3>
        <span className="text-xs font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
          {total} events
        </span>
      </div>
      <div className="h-56 w-full px-5 pb-4">
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={dailyCounts} margin={{ top: 10, right: 20, bottom: 8, left: 0 }}>
            <defs>
              <linearGradient id="sparkline-gradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#111827" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#111827" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="2 2" stroke="#f3f4f6" vertical={false} className="dark:stroke-zinc-800/30" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: '#6b7280' }}
              className="dark:text-zinc-400"
            />
            <YAxis
              hide
              domain={['dataMin', 'dataMax']}
              tick={{ fontSize: 10, fill: '#6b7280' }}
              className="dark:text-zinc-400"
            />
            <Tooltip
              content={({ active, payload }: any) => {
                if (active && payload && payload.length) {
                  const { name, value } = payload[0];
                  return (
                    <div className="rounded-md bg-zinc-900 px-2 py-1 text-xs text-white shadow-lg dark:bg-zinc-800">
                      <div className="text-zinc-400">{name}</div>
                      <div className="font-medium">{value} events</div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#111827"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#sparkline-gradient)"
              dot={false}
            >
              <Cell fill="#111827" />
            </Area>
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
