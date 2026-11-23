'use client';

import { useEffect, useState } from 'react';
import { Terminal } from 'lucide-react';

interface EventVolumeSparklineProps {
  dailyCounts: Array<{ date: string; count: number }>;
}

export function EventVolumeSparkline({
  dailyCounts,
}: EventVolumeSparklineProps) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    setWidth(window.innerWidth);
  }, []);

  const days = 7;
  const now = new Date();
  const labels: string[] = [];
  const values: number[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const found = dailyCounts.find((c) => c.date === dateStr);
    labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    values.push(found ? found.count : 0);
  }

  const total = values.reduce((a, b) => a + b, 0);
  const max = Math.max(...values, 1);
  const min = Math.min(...values);

  const padding = { top: 34, right: 28, bottom: 34, left: 28 };
  const chartHeight = 140;

  const yLevels = [0, Math.round(max / 2), max];

  const getY = (v: number) => padding.top + ((max - v) / (max - min || 1)) * chartHeight;

  const points = values.map((v, i) => {
    const x = padding.left + (i / (days - 1)) * (width - padding.left - padding.right);
    const y = getY(v);
    return `${x},${y}`;
  });

  const linePath = points.reduce(
    (acc, point, i) => (i === 0 ? `M${point}` : `${acc} L${point}`),
    ''
  );

  const latestX = padding.left + ((days - 1) / (days - 1)) * (width - padding.left - padding.right);
  const latestY = getY(values[days - 1]);
  const latestValue = values[days - 1];

  return (
    <section className="rounded-lg border border-zinc-200/50 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] dark:border-zinc-800/50 dark:bg-zinc-900">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
          Event Volume (Last 7 Days)
        </h3>
        <span className="text-xs font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
          {total} events
        </span>
      </div>

      {total === 0 ? (
        <div className="flex flex-col items-center justify-center h-[140px] text-center opacity-60">
          <Terminal className="h-6 w-6 mx-auto mb-2 text-zinc-400" strokeWidth={1.5} />
          <p className="text-xs text-zinc-500 dark:text-zinc-400">No event volume yet</p>
        </div>
      ) : (
        <div className="relative h-[180px] w-full">
          <svg
            width={width}
            height={chartHeight + padding.top + padding.bottom}
            className="w-full h-full"
            viewBox={`0 0 ${width} ${chartHeight + padding.top + padding.bottom}`}
            preserveAspectRatio="none"
          >
            {/* Vertical grid lines */}
            {values.map((_, i) => {
              const x = padding.left + (i / (days - 1)) * (width - padding.left - padding.right);
              return (
                <line
                  key={i}
                  x1={x}
                  y1={padding.top}
                  x2={x}
                  y2={padding.top + chartHeight}
                  stroke="zinc-100"
                  strokeWidth={1}
                  className="dark:stroke-zinc-800/30"
                />
              );
            })}

            {/* Horizontal grid lines + Y labels */}
            {yLevels.map((level, i) => {
              const y = getY(level);
              return (
                <g key={i}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={width - padding.right}
                    y2={y}
                    stroke="zinc-200"
                    strokeWidth={1}
                    strokeDasharray="4"
                    className="dark:stroke-zinc-800/40"
                  />
                  <text
                    x={padding.left - 8}
                    y={y + 4}
                    fill="zinc-500"
                    fontSize="10"
                    className="dark:fill-zinc-400"
                    textAnchor="end"
                  >
                    {level}
                  </text>
                </g>
              );
            })}

            {/* Area fill */}
            <path
              d={`M${padding.left},${padding.top + chartHeight} L${padding.left},${getY(values[0])} ${linePath} L${width - padding.right},${padding.top + chartHeight} Z`}
              fill="url(#sparkline-gradient)"
              fillOpacity={0.12}
            />

            {/* Line */}
            <path d={linePath} fill="none" stroke="zinc-900" strokeWidth={2} className="dark:stroke-zinc-100" />

            {/* Points */}
            {values.map((v, i) => {
              const x = padding.left + (i / (days - 1)) * (width - padding.left - padding.right);
              const y = getY(v);
              const isLatest = i === days - 1;
              return (
                <g key={i}>
                  <circle
                    cx={x}
                    cy={y}
                    r={isLatest ? 5 : 3}
                    fill="zinc-900"
                    className="dark:fill-zinc-100"
                  />
                  {isLatest && (
                    <circle cx={x} cy={y} r={7} fill="none" stroke="zinc-900" strokeWidth={2} opacity={0.2} className="dark:stroke-zinc-100" />
                  )}
                </g>
              );
            })}

            {/* Latest value label */}
            <text
              x={latestX}
              y={latestY - 10}
              fill="zinc-900"
              fontSize="11"
              fontWeight="600"
              className="dark:fill-zinc-100"
              textAnchor="middle"
            >
              {latestValue}
            </text>

            <defs>
              <linearGradient id="sparkline-gradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="zinc-900" stopOpacity={0.3} />
                <stop offset="100%" stopColor="zinc-900" stopOpacity={0} />
              </linearGradient>
            </defs>
          </svg>

          {/* X-axis labels */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2 text-[10px] text-zinc-500 dark:text-zinc-400">
            {labels.map((label) => (
              <span key={label} style={{ flexBasis: `${100 / days}%`, textAlign: 'center' }}>
                {label}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
