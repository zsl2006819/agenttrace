'use client';

import { useState } from 'react';
import {
  AlertTriangle,
  Bot,
  Plug,
  ShieldCheck,
  Zap,
  Terminal,
  Loader2,
  Database,
  Brain,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { EventVolumeSparkline } from './event-volume-sparkline';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const EMPTY_STATE_SVG = (
  <svg
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="mx-auto mb-4 h-16 w-16 text-slate-300 dark:text-zinc-600"
    aria-hidden="true"
  >
    {/* Outer ring - subtle */}
    <circle cx="100" cy="100" r="88" stroke="currentColor" strokeWidth="1" strokeDasharray="8 12" strokeLinecap="round" opacity="0.3" />
    
    {/* Middle ring - animated dash */}
    <circle cx="100" cy="100" r="70" stroke="currentColor" strokeWidth="1.5" strokeDasharray="16 24" strokeLinecap="round" opacity="0.5">
      <animateTransform
        attributeName="transform"
        type="rotate"
        from="0 100 100"
        to="360 100 100"
        dur="20s"
        repeatCount="indefinite"
      />
    </circle>
    
    {/* Inner ring - data pulse */}
    <circle cx="100" cy="100" r="48" stroke="currentColor" strokeWidth="2" strokeDasharray="4 8" strokeLinecap="round" opacity="0.7">
      <animateTransform
        attributeName="transform"
        type="rotate"
        from="360 100 100"
        to="0 100 100"
        dur="15s"
        repeatCount="indefinite"
      />
    </circle>
    
    {/* Center node */}
    <circle cx="100" cy="100" r="8" fill="currentColor" opacity="0.8">
      <animate
        attributeName="r"
        values="6;10;6"
        dur="2s"
        repeatCount="indefinite"
      />
      <animate
        attributeName="opacity"
        values="0.6;1;0.6"
        dur="2s"
        repeatCount="indefinite"
      />
    </circle>
    
    {/* Four data points orbiting */}
    <g stroke="currentColor" strokeWidth="1.5" opacity="0.6">
      <line x1="100" y1="28" x2="100" y2="42" strokeLinecap="round">
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 100 100"
          to="360 100 100"
          dur="8s"
          repeatCount="indefinite"
        />
      </line>
      <line x1="100" y1="28" x2="100" y2="42" strokeLinecap="round">
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="90 100 100"
          to="450 100 100"
          dur="8s"
          repeatCount="indefinite"
        />
      </line>
      <line x1="100" y1="28" x2="100" y2="42" strokeLinecap="round">
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="180 100 100"
          to="540 100 100"
          dur="8s"
          repeatCount="indefinite"
        />
      </line>
      <line x1="100" y1="28" x2="100" y2="42" strokeLinecap="round">
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="270 100 100"
          to="630 100 100"
          dur="8s"
          repeatCount="indefinite"
        />
      </line>
    </g>
    
    {/* Connection lines - geometric grid */}
    <g stroke="currentColor" strokeWidth="0.5" opacity="0.2">
      <line x1="100" y1="100" x2="100" y2="12" strokeLinecap="round" />
      <line x1="100" y1="100" x2="188" y2="100" strokeLinecap="round" />
      <line x1="100" y1="100" x2="100" y2="188" strokeLinecap="round" />
      <line x1="100" y1="100" x2="12" y2="100" strokeLinecap="round" />
      <line x1="100" y1="100" x2="32" y2="32" strokeLinecap="round" />
      <line x1="100" y1="100" x2="168" y2="32" strokeLinecap="round" />
      <line x1="100" y1="100" x2="168" y2="168" strokeLinecap="round" />
      <line x1="100" y1="100" x2="32" y2="168" strokeLinecap="round" />
    </g>
    
    {/* Corner brackets - technical aesthetic */}
    <g stroke="currentColor" strokeWidth="1.5" opacity="0.4" fill="none">
      <path d="M 24 24 L 44 24 L 44 44" />
      <path d="M 176 24 L 156 24 L 156 44" />
      <path d="M 24 176 L 44 176 L 44 156" />
      <path d="M 176 176 L 156 176 L 156 156" />
    </g>
  </svg>
);

interface AuditEvent {
  id: string;
  tenant_id: string;
  agent_id: string;
  session_id: string;
  sequence: number;
  idempotency_key: string;
  tool_name: string;
  input_hash?: string | null;
  output_hash?: string | null;
  error_code?: string | null;
  human_override: boolean;
  prev_hash?: string | null;
  current_hash?: string | null;
  signature?: string | null;
  key_id?: string | null;
  created_at: string;
}

interface AIInsight {
  text: string;
  type: 'security' | 'performance' | 'recommendation' | 'info';
}

const CODE_SNIPPET = [
  { parts: [['$ ', 'text-slate-400'], ['npm ', 'text-blue-400'], ['install ', 'text-blue-400'], ['@agenttrace/sdk', 'text-green-400']] },
  { parts: [['$ ', 'text-slate-400'], ['agenttrace.init(', 'text-blue-400'], ["{ apiKey: 'at_live_...' })", 'text-slate-300']] },
  { parts: [['$ ', 'text-slate-400'], ['agenttrace.capture(', 'text-blue-400'], ["{ tool: 'llm_chat', input: '...' })", 'text-slate-300']] },
];

export function EventLogsSection({
  records,
  dailyCounts,
  totalEvents,
}: {
  records: AuditEvent[];
  dailyCounts: Array<{ date: string; count: number }>;
  totalEvents: number;
}) {
  const [loadingDemo, setLoadingDemo] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [lastAnalyzed, setLastAnalyzed] = useState<string | null>(null);

  const handleLoadDemo = async () => {
    setLoadingDemo(true);
    try {
      const res = await fetch('/api/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to load demo data');
      }
      window.location.reload();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to load demo data');
    } finally {
      setLoadingDemo(false);
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const res = await fetch('/api/ai-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to analyze');
      }
      const insights: AIInsight[] = (data.insights || []).map((text: string, i: number) => ({
        text,
        type: text.toLowerCase().includes('block') || text.toLowerCase().includes('injection') || text.toLowerCase().includes('destructive') ? 'security' :
              text.toLowerCase().includes('error') || text.toLowerCase().includes('rate') || text.toLowerCase().includes('token') ? 'performance' :
              text.toLowerCase().includes('recommend') || text.toLowerCase().includes('enable') || text.toLowerCase().includes('consider') ? 'recommendation' : 'info',
      }));
      setAiInsights(insights);
      setLastAnalyzed(data.timestamp || new Date().toISOString());
    } catch (e) {
      console.error('Analysis failed:', e);
    } finally {
      setAnalyzing(false);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'security': return <AlertTriangle className="h-5 w-5" strokeWidth={1.5} />;
      case 'performance': return <Zap className="h-5 w-5" strokeWidth={1.5} />;
      case 'recommendation': return <ShieldCheck className="h-5 w-5" strokeWidth={1.5} />;
      default: return <Bot className="h-5 w-5" strokeWidth={1.5} />;
    }
  };

  const getInsightColors = (type: string) => {
    switch (type) {
      case 'security': return 'border-red-500 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300';
      case 'performance': return 'border-amber-500 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300';
      case 'recommendation': return 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300';
      default: return 'border-slate-500 bg-slate-50 dark:bg-slate-950/20 text-slate-700 dark:text-slate-300';
    }
  };

  return (
    <div className="space-y-8">
      {/* Event Volume Sparkline */}
      <section className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] transition-all duration-200 hover:border-slate-300 dark:hover:border-zinc-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-zinc-400">
            Event Volume (Last 7 Days)
          </h3>
          <span className="text-xs font-semibold tabular-nums text-slate-900 dark:text-zinc-100">
            {dailyCounts.reduce((a, b) => a + b.count, 0)} events
          </span>
        </div>
        <EventVolumeSparkline dailyCounts={dailyCounts} />
      </section>

      {totalEvents === 0 && (
        <section className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] flex items-center justify-center min-h-[160px]">
          <p className="text-sm text-slate-400 dark:text-zinc-500 text-center">
            Waiting for data to generate insights...
          </p>
        </section>
      )}

      {totalEvents > 0 && (
        <section className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] transition-all duration-200 hover:border-slate-300 dark:hover:border-zinc-700">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-slate-500 dark:text-zinc-400" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
                AI Insights
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-semibold">
                <Sparkles className="h-3 w-3" />
                AI-Powered
              </span>
            </div>
            <Button
              onClick={handleAnalyze}
              disabled={analyzing}
              variant="outline"
              size="sm"
              className="rounded-lg border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all duration-200 active:scale-[0.98]"
            >
              {analyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" strokeWidth={2} />
                  Analyzing…
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-4 w-4" strokeWidth={1.75} />
                  Analyze Latest Logs
                </>
              )}
            </Button>
          </div>

          {lastAnalyzed && (
            <p className="mb-4 text-xs text-slate-500 dark:text-zinc-400">
              Last analyzed: {new Date(lastAnalyzed).toLocaleString()}
              <button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 underline"
              >
                Re-analyze
              </button>
            </p>
          )}

          <div className="space-y-2">
            {aiInsights.length > 0 ? (
              aiInsights.map((insight, i) => (
                <div
                  key={i}
                  className={cn(
                    'rounded-lg border p-4 shadow-sm flex gap-3 group border-l-4 transition-all duration-200',
                    getInsightColors(insight.type)
                  )}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                    {getInsightIcon(insight.type)}
                  </div>
                  <div>
                    <p className="text-sm leading-relaxed">{insight.text}</p>
                  </div>
                </div>
              ))
            ) : (
              <>
                <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 shadow-sm flex gap-3 group border-l-2 border-emerald-500 dark:border-zinc-700 dark:bg-zinc-800/50">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="h-5 w-5" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                      Click <strong>"Analyze Latest Logs"</strong> to run AI-powered security analysis on your recent audit events.
                    </p>
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 shadow-sm flex gap-3 group border-l-2 border-amber-500 dark:border-zinc-700 dark:bg-zinc-800/50">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400">
                    <Zap className="h-5 w-5" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                      The analysis checks for: anomalous tool usage, error spikes, blocked actions, prompt injection patterns, and operational recommendations.
                    </p>
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 shadow-sm flex gap-3 group border-l-2 border-slate-500 dark:border-zinc-700 dark:bg-zinc-800/50">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                    <Bot className="h-5 w-5" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                      Powered by OpenAI GPT-4o-mini when configured. Falls back to rule-based analysis if no API key is set.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {totalEvents === 0 && (
        <section className="mt-8 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-12 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:border-zinc-700 dark:bg-zinc-900/50 dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] text-center">
          {EMPTY_STATE_SVG}
          <h3 className="text-lg font-semibold text-slate-900 dark:text-zinc-100 mb-2">
            No audit events yet
          </h3>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mb-6 max-w-md mx-auto leading-relaxed">
            Start sending events to see your audit trail and AI insights.
          </p>
          <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-sm max-w-md mx-auto mb-6">
            <div className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 border-b border-slate-700">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              <span className="h-2 w-2 rounded-full bg-yellow-500" />
              <span className="h-2 w-2 rounded-full bg-green-500" />
            </div>
            <div className="p-4 font-mono text-xs overflow-x-auto text-left">
              {CODE_SNIPPET.map((line, li) => (
                <div key={li} className="mb-1">
                  {line.parts.map(([text, color], pi) => (
                    <span key={pi} className={cn('whitespace-pre', color)}>
                      {text}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-center gap-3">
            <Button size="sm" className="rounded-lg">
              Copy Integration Code
            </Button>
            <Button
              onClick={handleLoadDemo}
              disabled={loadingDemo}
              className="rounded-lg bg-slate-900 text-white shadow-sm hover:bg-slate-800 transition-all duration-200 active:scale-[0.98]"
            >
              {loadingDemo ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  Load Demo Data
                </>
              )}
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}