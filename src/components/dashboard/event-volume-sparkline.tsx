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
import { Activity } from 'lucide-react';

interface EventVolumeSparklineProps {
  dailyCounts: Array<{ date: string; count: number }>;
}

export function EventVolumeSparkline({
  dailyCounts,
}: EventVolumeSparklineProps) {
  const total = dailyCounts.reduce((a, b) => a + b.count, 0);
  const isEmpty = total === 0;

  return (
    <section className="rounded-xl border border-slate-200/80 bg-white shadow-sm">
      <div className="flex items-center justify-between mb-3 px-6 pt-6">
        <div className="flex items-center gap-2">
          <h3 className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
            Event Volume (Last 7 Days)
          </h3>
          <select
            className="ml-2 text-[10px] font-medium text-slate-600 bg-transparent border-none focus:ring-0 cursor-pointer"
          >
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
          </select>
        </div>
        <span className="text-xs font-semibold tabular-nums text-slate-900">
          {total} events
        </span>
      </div>

      {isEmpty ? (
        <div className="h-64 w-full flex flex-col items-center justify-center pt-10 text-center">
          <Activity className="mb-3 h-8 w-8 text-slate-200" />
          <p className="text-xs text-slate-400">Waiting for event data...</p>
        </div>
      ) : (
        <div className="h-64 w-full px-6 pb-6">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={dailyCounts} margin={{ top: 10, right: 20, bottom: 8, left: 0 }}>
              <defs>
                <linearGradient id="sparkline-gradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#18181b" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#18181b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 2" stroke="#f3f4f6" vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: '#71717a' }}
              />
              <YAxis
                hide
                domain={['dataMin', 'dataMax']}
                tick={{ fontSize: 10, fill: '#71717a' }}
              />
              <Tooltip
                content={({ active, payload }: any) => {
                  if (active && payload && payload.length) {
                    const { name, value } = payload[0];
                    return (
                      <div className="rounded-md bg-slate-900 px-2 py-1 text-xs text-white shadow-lg">
                        <div className="text-slate-400">{name}</div>
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
      )}
    </section>
  );
}
