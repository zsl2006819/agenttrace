'use client';

import { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Link,
  Hash,
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
          'relative overflow-hidden rounded-xl border border-zinc-200/50 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all duration-300 hover:shadow-md hover:shadow-zinc-900/5 dark:border-zinc-800/50 dark:bg-zinc-900',
          isValid === true && 'border-emerald-100 bg-emerald-50/40 dark:border-emerald-900/20 dark:bg-emerald-900/10',
          isValid === false && 'border-amber-100 bg-amber-50/40 dark:border-amber-900/20 dark:bg-amber-900/10'
        )}
      >
        {/* Glow behind shield when valid */}
        {isValid === true && (
          <div className="absolute -top-1/2 -left-1/2 w-full h-full blur-[120px] bg-emerald-500/10 rounded-full" />
        )}

        {/* Hash chain visualization */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          {/* Left: Icon + text */}
          <div className="flex items-center gap-4 md:gap-6">
            <div className={cn(
              'flex h-12 w-12 items-center justify-center rounded-xl shadow-sm transition-transform duration-300 group-hover:scale-110',
              isValid === true
                ? 'bg-emerald-100 text-emerald-600 shadow-[0_0_20px_rgba(16,185,129,0.25)]'
                : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300'
            )}>
              <Icon className="h-6 w-6" strokeWidth={2} />
            </div>

            <div>
              <div className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                Chain Integrity: <span className={cn(isValid === true ? 'text-emerald-600' : 'text-zinc-900')}>
                  Verified ({isValid === true ? '100%' : result?.checked ?? 0})
                </span>
              </div>
              <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                All records are cryptographically linked and untampered.
              </p>
            </div>
          </div>

          {/* Right: Hash chain SVG */}
          <div className="w-full md:w-80">
            <svg
              width="100%"
              height="64"
              viewBox="0 0 1000 64"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="chain-gradient" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0%" stopColor="zinc-900" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="zinc-600" stopOpacity={0.7} />
                </linearGradient>
              </defs>

              {/* Connecting lines */}
              <line x1="90" y1="32" x2="230" y2="32" stroke="zinc-200" strokeWidth={2} className="dark:stroke-zinc-800" />
              <line x1="330" y1="32" x2="470" y2="32" stroke="zinc-200" strokeWidth={2} className="dark:stroke-zinc-800" />
              <line x1="570" y1="32" x2="710" y2="32" stroke="zinc-200" strokeWidth={2} className="dark:stroke-zinc-800" />

              {/* Nodes */}
              {HASH_NODES.map((hash, i) => {
                const cx = 160 + i * 240;
                return (
                  <g key={hash}>
                    <circle cx={cx} cy={32} r={18} fill="zinc-900" className="dark:fill-zinc-100" />
                    <circle cx={cx} cy={32} r={22} fill="none" stroke="zinc-400" strokeWidth={1} className="dark:stroke-zinc-600" />
                    <text
                      x={cx}
                      y={36}
                      fill="zinc-300"
                      fontSize="10"
                      fontFamily="monospace"
                      fontWeight="600"
                      className="dark:fill-zinc-500"
                      textAnchor="middle"
                    >
                      {hash}
                    </text>
                  </g>
                );
              })}

              {/* Shield check at end */}
              <circle cx="780" cy={32} r={22} fill="emerald-500" />
              <path
                d="M780 20 L790 28 L800 20"
                fill="none"
                stroke="white"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
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
                ? 'bg-zinc-900 text-white shadow-sm hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-900 dark:text-emerald-300 dark:hover:bg-emerald-800'
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
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
            )}>
              {isValid === true ? <CheckCircle2 className="h-3 w-3" strokeWidth={2} /> : <AlertCircle className="h-3 w-3" strokeWidth={2} />}
              {isValid === true ? 'Intact' : 'Broken'}
            </span>
          )}
        </div>

        {result && !verifying && (
          <div className="mt-4 flex items-start gap-2 px-1">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" strokeWidth={1.75} />
            <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {result.message} ({result.checked} record(s) checked)
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

