'use client';

import { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const HASH_NODES = ['0x3f4c...a1b2', '0x8e9d...f3c4', '0x2a7b...d5e6'];

export function ChainIntegrityBanner() {
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<{
    valid: boolean;
    message: string;
    checked: number;
  } | null>(null);

  const handleVerify = async () => {
    setVerifying(true);
    setResult(null);
    try {
      const res = await fetch('/api/audit/verify', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      });
      const data = await res.json();
      setResult({
        valid: data.valid ?? false,
        message: data.message ?? 'Verification completed.',
        checked: data.checked ?? 0,
      });
    } catch {
      setResult({
        valid: false,
        message: 'Unable to reach the verification service. Please try again.',
        checked: 0,
      });
    } finally {
      setVerifying(false);
    }
  };

  const isValid = result?.valid;
  const Icon = isValid === true ? CheckCircle2 : isValid === false ? AlertCircle : ShieldCheck;

  return (
    <section className="mb-8">
      <div
        className={cn(
          'relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm',
          isValid === true && 'border-emerald-100 bg-emerald-50/40',
          isValid === false && 'border-amber-100 bg-amber-50/40'
        )}
      >
        {/* Hash chain visualization */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          {/* Left: Icon + text */}
          <div className="flex items-center gap-4 md:gap-6">
            <div className={cn(
              'flex h-12 w-12 items-center justify-center rounded-xl shadow-sm transition-transform duration-300 group-hover:scale-110',
              isValid === true
                ? 'bg-emerald-100 text-emerald-600 shadow-[0_0_20px_rgba(16,185,129,0.25)]'
                : 'bg-slate-100 text-slate-600'
            )}>
              <Icon className="h-6 w-6" strokeWidth={2} />
            </div>

            <div>
              <div className="text-lg font-bold tracking-tight text-slate-900">
                Chain Integrity: <span className={cn(isValid === true ? 'text-emerald-600' : 'text-slate-900')}>
                  Verified ({isValid === true ? '100%' : result?.checked ?? 0})
                </span>
              </div>
              <p className="mt-0.5 text-sm text-slate-500">
                All records are cryptographically linked and untampered.
              </p>
            </div>
          </div>

          {/* Right: Hash chain visualization */}
          <div className="w-full md:w-80 relative h-16 flex items-center justify-center">
            <svg
              width="100%"
              height="48"
              viewBox="0 0 1000 48"
              preserveAspectRatio="none"
            >
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                  <polygon points="0 0, 5 3.5, 0 7" fill="slate-400" className="dark:fill-slate-600" />
                </marker>
              </defs>

              {/* Connecting dashed lines with arrows */}
              <path
                d="M105 24 L215 24 M345 24 L455 24 M585 24 L695 24"
                stroke="slate-300"
                strokeWidth={1}
                strokeDasharray="4"
                fill="none"
                marker-end="url(#arrowhead)"
                className="dark:stroke-slate-700/50"
              />

              {/* Nodes */}
              {HASH_NODES.map((hash, i) => {
                const cx = 160 + i * 240;
                return (
                  <g key={hash}>
                    <circle
                      cx={cx}
                      cy={24}
                      r={14}
                      fill="none"
                      stroke="slate-300"
                      strokeWidth={1.5}
                      className="dark:stroke-slate-700"
                    />
                    <text
                      x={cx}
                      y={28}
                      fill="slate-600"
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="700"
                      className="dark:fill-slate-400"
                      textAnchor="middle"
                    >
                      {i + 1}
                    </text>
                    <text
                      x={cx}
                      y={40}
                      fill="slate-400"
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {hash}
                    </text>
                  </g>
                );
              })}

              {/* Final node: Shield Check */}
              <g transform="translate(780, 24)">
                <circle r={14} fill="none" stroke="emerald-600" strokeWidth={1.5} />
                <ShieldCheck className="h-4 w-4 text-emerald-600" strokeWidth={1.5} />
              </g>
            </svg>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-2">
          <Button
            onClick={handleVerify}
            disabled={verifying}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 active:scale-[0.98]',
              isValid === true
                ? 'bg-slate-900 text-white shadow-sm hover:bg-slate-800'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
            )}
          >
            {verifying ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ShieldCheck className="mr-2 h-4 w-4" strokeWidth={2} />
            )}
            {verifying ? 'Verifying…' : 'Verify Chain Now'}
          </Button>

          {result && !verifying && (
            <span className={cn(
              'inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-semibold uppercase tracking-wider',
              isValid === true
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-amber-100 text-amber-700'
            )}>
              {isValid === true ? <CheckCircle2 className="h-3 w-3" strokeWidth={2} /> : <AlertCircle className="h-3 w-3" strokeWidth={2} />}
              {isValid === true ? 'Intact' : 'Broken'}
            </span>
          )}
        </div>

        {result && !verifying && (
          <div className="mt-4 flex items-start gap-2 px-1">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" strokeWidth={1.75} />
            <p className="text-sm leading-relaxed text-slate-600">
              {result.message} ({result.checked} record(s) checked)
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

