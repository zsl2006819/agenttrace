import Link from 'next/link';
import { PricingCheckoutButton } from '@/components/pricing-checkout-button';

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Navigation */}
      <nav className="border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/" className="text-xl font-bold text-zinc-900 dark:text-white">
                AgentTrace
              </Link>
              <div className="hidden md:flex items-center gap-6 text-sm text-zinc-600 dark:text-zinc-400">
                <Link href="#features" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                  Features
                </Link>
                <Link href="#pricing" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                  Pricing
                </Link>
                <Link href="#compliance" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                  Compliance
                </Link>
                <Link href="/docs" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                  Docs
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/zsl2006819/agenttrace"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors flex items-center gap-1"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.536-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </a>
              <Link
                href="/dashboard"
                className="hidden sm:block px-4 py-2 text-sm font-medium text-white bg-zinc-900 dark:bg-white dark:text-zinc-900 rounded-lg hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-20 sm:pt-32 lg:pt-40">
        {/* Backdrop: soft gradient + engineering grid + halo */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-50 via-white to-white dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-950" />
          <div className="bg-grid absolute inset-0" />
          <div className="absolute left-1/2 top-0 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-zinc-200/50 blur-3xl dark:bg-zinc-800/40" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/70 px-4 py-1.5 text-sm font-medium text-zinc-600 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-zinc-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-zinc-900 dark:bg-zinc-100"></span>
              </span>
              EU AI Act Article 12 Compliant
            </div>

            <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl xl:text-7xl dark:text-white">
              Tamper-evident Audit Trails
              <br />
              <span className="bg-gradient-to-r from-zinc-500 via-zinc-700 to-zinc-500 bg-clip-text text-transparent dark:from-zinc-400 dark:via-zinc-200 dark:to-zinc-400">
                for AI Agents
              </span>
            </h1>

            <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-zinc-600 sm:text-xl dark:text-zinc-400">
              From passive logging to active defense. The operating system for compliant AI agents.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/dashboard"
                className="w-full rounded-xl bg-zinc-900 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-zinc-900/10 transition-all duration-200 hover:bg-zinc-700 hover:shadow-xl active:scale-[0.98] sm:w-auto dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Get Started Free
              </Link>
              <a
                href="https://github.com/zsl2006819/agenttrace"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full rounded-xl border border-zinc-300 px-8 py-4 text-base font-semibold text-zinc-700 transition-all duration-200 hover:border-zinc-400 hover:bg-zinc-50 active:scale-[0.98] sm:w-auto dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                View on GitHub
              </a>
            </div>
          </div>

          {/* Abstract data flow */}
          <div className="relative mx-auto mt-20 max-w-5xl sm:mt-24">
            {/* Background grid */}
            <div
              aria-hidden
              className="absolute inset-0 bg-zinc-50/40 dark:bg-zinc-900/40 rounded-[2rem] blur-3xl"
            />
            {/* Radial glow pulses */}
            <div
              aria-hidden
              className="absolute -top-24 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl dark:bg-blue-500/20 animate-pulse"
            />
            <div
              aria-hidden
              className="absolute -bottom-24 right-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl dark:bg-emerald-500/20 animate-pulse"
              style={{ animationDelay: '1.2s' }}
            />
            {/* Gradient data bands */}
            <div className="relative overflow-hidden rounded-[2rem] border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              {/* Left band — events */}
              <div
                className="absolute top-0 left-0 bottom-0 w-1/3 bg-gradient-to-b from-zinc-900 via-zinc-700 to-zinc-900 dark:from-zinc-100 dark:via-zinc-200 dark:to-zinc-100 opacity-60"
              />
              {/* Right band — signatures */}
              <div
                className="absolute top-0 right-0 bottom-0 w-1/3 bg-gradient-to-t from-zinc-500 via-zinc-300 to-zinc-500 dark:from-zinc-400 dark:via-zinc-700 dark:to-zinc-400 opacity-40"
              />
              {/* Center pulse line */}
              <div
                className="absolute top-0 left-1/2 bottom-0 w-[1px] bg-zinc-300 dark:bg-zinc-700 opacity-60"
              />
              {/* Node dots */}
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="absolute left-1/2 top-[calc(100%*_0.2)] -mt-1.5 w-3 h-3 rounded-full bg-zinc-900 shadow-[0_0_10px_rgba(24,24,27,0.6)] dark:bg-zinc-100 dark:shadow-[0_0_10px_rgba(244,244,245,0.6)]"
                  style={{
                    animationName: 'data-pulse',
                    animationDelay: `${i * 0.3}s`,
                    animationDuration: '2s',
                    animationTimingFunction: 'ease-in-out',
                    animationIterationCount: 'infinite',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Trust indicators */}
          <div className="mt-14 flex flex-wrap items-center justify-center gap-8 text-sm text-zinc-500 dark:text-zinc-500">
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>EU AI Act Article 12</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>SOC 2 Type II Ready</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>ISO 42001 Aligned</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-24 lg:py-32 bg-white dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white mb-4">
              Why AgentTrace?
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              Complete audit infrastructure for AI agents. Deploy with confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {/* Feature 1 */}
            <div className="group relative rounded-2xl border border-zinc-200/80 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-zinc-300 hover:shadow-xl hover:shadow-zinc-900/5 dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-zinc-700">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-200/80 bg-gradient-to-br from-zinc-50 to-zinc-100 text-zinc-900 shadow-sm transition-transform duration-300 group-hover:scale-105 dark:border-zinc-700 dark:from-zinc-800 dark:to-zinc-800/40 dark:text-zinc-100">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-3">Cryptographic proof to avoid massive EU AI Act fines</h3>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Every agent action is cryptographically linked to the previous event using SHA-256.
                Any tampering breaks the chain and is instantly detectable — zero-trust by design.
              </p>
              <ul className="mt-5 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  SHA-256 chained hashes
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  Tamper-evident verification
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  Merkle root anchoring
                </li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="group relative rounded-2xl border border-zinc-200/80 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-zinc-300 hover:shadow-xl hover:shadow-zinc-900/5 dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-zinc-700">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-200/80 bg-gradient-to-br from-zinc-50 to-zinc-100 text-zinc-900 shadow-sm transition-transform duration-300 group-hover:scale-105 dark:border-zinc-700 dark:from-zinc-800 dark:to-zinc-800/40 dark:text-zinc-100">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-3">Zero-maintenance, secure audit infrastructure</h3>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Ed25519 signatures on every audit event. Non-repudiation guaranteed — agents cannot
                deny their actions. Keys managed via HSM-compatible interfaces.
              </p>
              <ul className="mt-5 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  Ed25519 per-event signing
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  Key rotation support
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  HSM / KMS integration ready
                </li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="group relative rounded-2xl border border-zinc-200/80 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-zinc-300 hover:shadow-xl hover:shadow-zinc-900/5 dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-zinc-700">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-200/80 bg-gradient-to-br from-zinc-50 to-zinc-100 text-zinc-900 shadow-sm transition-transform duration-300 group-hover:scale-105 dark:border-zinc-700 dark:from-zinc-800 dark:to-zinc-800/40 dark:text-zinc-100">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-3">Automate your compliance workflow</h3>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                One-click PDF/JSONL reports for auditors. Pre-mapped to EU AI Act Article 12,
                SOC 2 CC6.1, ISO 42001 Annex A. Export in seconds, not days.
              </p>
              <ul className="mt-5 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  PDF & JSONL export
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  Framework-mapped controls
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  Scheduled & on-demand
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 sm:py-24 lg:py-32 bg-zinc-50 dark:bg-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              Start free. Scale as you grow. No hidden fees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">Free</h3>
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <span className="text-4xl font-bold text-zinc-900 dark:text-white">$0</span>
                  <span className="text-zinc-500 dark:text-zinc-400">/month</span>
                </div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">For individual developers & prototypes</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  10,000 events/month
                </li>
                <li className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  Hash chain verification
                </li>
                <li className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  JSONL export
                </li>
                <li className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  Community support
                </li>
              </ul>
              <Link
                href="/login"
                className="w-full px-4 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-600 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-center"
              >
                Start Free
              </Link>
            </div>

            {/* Starter Plan */}
            <div className="relative p-8 rounded-2xl border-2 border-zinc-900 dark:border-zinc-100 bg-white dark:bg-zinc-950 shadow-sm">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold rounded-full">
                Most Popular
              </div>
              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">Starter</h3>
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <span className="text-4xl font-bold text-zinc-900 dark:text-white">$79</span>
                  <span className="text-zinc-500 dark:text-zinc-400">/month</span>
                </div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">For small teams deploying AI agents</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  500,000 events/month
                </li>
                <li className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  Digital signatures (Ed25519)
                </li>
                <li className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  PDF compliance reports
                </li>
                <li className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  Email support (24h SLA)
                </li>
                <li className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  3 team members
                </li>
              </ul>
              <PricingCheckoutButton
                plan="starter"
                className="w-full px-4 py-3 text-sm font-semibold text-white bg-zinc-900 rounded-xl hover:bg-zinc-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors text-center shadow-sm"
              >
                Get Started
              </PricingCheckoutButton>
            </div>

            {/* Business Plan */}
            <div className="p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">Business</h3>
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <span className="text-4xl font-bold text-zinc-900 dark:text-white">$149</span>
                  <span className="text-zinc-500 dark:text-zinc-400">/month</span>
                </div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">For scaling companies with compliance needs</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  Unlimited events
                </li>
                <li className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  Custom retention policies
                </li>
                <li className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  SSO / SAML / OIDC
                </li>
                <li className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  Dedicated support (4h SLA)
                </li>
                <li className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  Audit log API access
                </li>
                <li className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  Unlimited team members
                </li>
              </ul>
              <PricingCheckoutButton
                plan="business"
                className="w-full px-4 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-600 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors text-center"
              >
                Get Started
              </PricingCheckoutButton>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-24 lg:py-32 bg-zinc-900 dark:bg-zinc-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to deploy compliant AI agents?
          </h2>
          <p className="text-lg text-zinc-300 mb-10 max-w-2xl mx-auto">
            Join teams already using AgentTrace to satisfy EU AI Act Article 12,
            SOC 2, and ISO 42001 audit requirements.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-8 py-4 text-base font-semibold text-zinc-900 bg-white rounded-xl hover:bg-zinc-100 transition-colors"
            >
              Start Free Trial
            </Link>
            <a
              href="https://github.com/zsl2006819/agenttrace"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-4 text-base font-semibold text-white border border-zinc-600 rounded-xl hover:bg-zinc-800 transition-colors"
            >
              Self-Host on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <p className="text-xl font-bold text-zinc-900 dark:text-white mb-3">AgentTrace</p>
              <p className="text-zinc-600 dark:text-zinc-400 max-w-sm">
                Tamper-evident audit trails for AI agents. Built for compliance teams deploying
                under EU AI Act, SOC 2, and ISO 42001.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-zinc-900 dark:text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <li><Link href="#features" className="hover:text-zinc-900 dark:hover:text-white">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-zinc-900 dark:hover:text-white">Pricing</Link></li>
                <li><Link href="/dashboard" className="hover:text-zinc-900 dark:hover:text-white">Dashboard</Link></li>
                <li><a href="https://github.com/zsl2006819/agenttrace" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-900 dark:hover:text-white">GitHub</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-zinc-900 dark:text-white mb-4">Compliance</h4>
              <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <li><a href="#" className="hover:text-zinc-900 dark:hover:text-white">EU AI Act Article 12</a></li>
                <li><a href="#" className="hover:text-zinc-900 dark:hover:text-white">SOC 2 Type II</a></li>
                <li><a href="#" className="hover:text-zinc-900 dark:hover:text-white">ISO 42001</a></li>
                <li><a href="#" className="hover:text-zinc-900 dark:hover:text-white">Documentation</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              AgentTrace provides technical infrastructure only and does not constitute formal legal advice.
            </p>
            <div className="flex items-center gap-6 text-sm text-zinc-500 dark:text-zinc-400">
              <a href="#" className="hover:text-zinc-900 dark:hover:text-white">Privacy</a>
              <a href="#" className="hover:text-zinc-900 dark:hover:text-white">Terms</a>
              <a href="#" className="hover:text-zinc-900 dark:hover:text-white">Security</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}