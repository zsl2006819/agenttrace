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

export function EventVolumeSparkline({
  dailyCounts,
}: EventVolumeSparklineProps) {
  const total = dailyCounts.reduce((a, b) => a + b.count, 0);

  return (
    <section className="rounded-xl border border-zinc-100 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between mb-3 px-6 pt-6">
        <div className="flex items-center gap-2">
          <h3 className="text-[10px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Event Volume (Last 7 Days)
          </h3>
          <select
            className="ml-2 text-[10px] font-medium text-zinc-600 dark:text-zinc-400 bg-transparent border-none focus:ring-0 cursor-pointer"
          >
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
          </select>
        </div>
        <span className="text-xs font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
          {total} events
        </span>
      </div>
      <div className="h-64 w-full px-6 pb-6">
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={dailyCounts} margin={{ top: 10, right: 20, bottom: 8, left: 0 }}>
            <defs>
              <linearGradient id="sparkline-gradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#18181b" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#18181b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="2 2" stroke="#f3f4f6" vertical={false} className="dark:stroke-zinc-800/30" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: '#71717a' }}
              className="dark:text-zinc-500"
            />
            <YAxis
              hide
              domain={['dataMin', 'dataMax']}
              tick={{ fontSize: 10, fill: '#71717a' }}
              className="dark:text-zinc-500"
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
              stroke="#18181b"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#sparkline-gradient)"
              dot={false}
            >
              <Cell fill="#18181b" />
            </Area>
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
