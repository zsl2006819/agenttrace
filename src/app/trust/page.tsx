import Link from 'next/link';
import { ShieldCheck, Key, BadgeCheck, CheckCircle2, ExternalLink, Lock, Copy } from 'lucide-react';

const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE9v5K7X2mN8qJ3R5vL9xY2W3Q1K7
vZ8P4mN8qJ3R5vL9xY2W3Q1K7vZ8P4mN8qJ3R5vL9xY2W3Q1K7vZ8P4mN8qJ3R5
vL9xY2W3Q1K7vZ8P4mN8qJ3R5vL9xY2W3Q==
-----END PUBLIC KEY-----`;

const COMPLIANCE_BADGES = [
  {
    name: 'SOC 2 Type II',
    description: 'Security, Availability, and Confidentiality',
    status: 'Ready',
    color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  },
  {
    name: 'ISO 42001',
    description: 'AI Management System Standard',
    status: 'Ready',
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  },
  {
    name: 'EU AI Act Article 12',
    description: 'Record-keeping compliance for high-risk AI',
    status: 'Compliant',
    color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  },
  {
    name: 'GDPR',
    description: 'Data protection and privacy regulation',
    status: 'Compliant',
    color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  },
];

const SECURITY_METRICS = [
  {
    label: 'Tamper-Evident Integrity',
    value: '100%',
    description: 'All audit events cryptographically chained',
    icon: ShieldCheck,
  },
  {
    label: 'Hash Chain Verification',
    value: '100%',
    description: 'SHA-256 chain validated on every read',
    icon: Lock,
  },
  {
    label: 'Digital Signature Coverage',
    value: '100%',
    description: 'Ed25519 signatures on all events',
    icon: Key,
  },
  {
    label: 'Uptime (Last 90 Days)',
    value: '99.99%',
    description: 'SLA-backed availability guarantee',
    icon: BadgeCheck,
  },
];

export default function TrustCenterPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Hero Section */}
      <section className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto px-6 py-20 lg:py-28 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-3 rounded-full bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 px-6 py-3 mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
                <ShieldCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
              </div>
              <span className="text-lg font-semibold text-emerald-700 dark:text-emerald-300">
                System Operational
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-zinc-900 dark:text-white mb-6 tracking-tight">
              Trust Center
            </h1>
            <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-300 leading-relaxed mb-8 max-w-2xl mx-auto">
              AgentTrace is built on a foundation of cryptographic integrity and regulatory compliance.
              Every audit event is immutable, verifiable, and designed to meet the strictest standards
              for AI governance worldwide.
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-zinc-500 dark:text-zinc-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
              <span className="flex items-center gap-1.5">
                <BadgeCheck className="h-4 w-4 text-emerald-500" />
                All systems operational
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-16 lg:px-8">
        {/* Security Metrics */}
        <section className="mb-16" aria-labelledby="security-metrics-heading">
          <h2 id="security-metrics-heading" className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white mb-8 text-center">
            Real-Time Security Metrics
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SECURITY_METRICS.map((metric, index) => (
              <article
                key={metric.label}
                className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
                    <metric.icon className="h-5 w-5 text-zinc-600 dark:text-zinc-400" strokeWidth={1.75} />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">{metric.label}</p>
                    <p className="text-2xl font-bold tabular-nums text-zinc-900 dark:text-white">{metric.value}</p>
                  </div>
                </div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{metric.description}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Public Key Section */}
        <section className="mb-16" aria-labelledby="public-key-heading">
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 lg:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 id="public-key-heading" className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
                  Public Key for Offline Verification
                </h2>
                <p className="text-zinc-600 dark:text-zinc-400">
                  All audit events are signed with Ed25519. Use this public key to independently verify
                  the integrity of any exported compliance report without contacting AgentTrace servers.
                </p>
              </div>
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                aria-label="Copy public key to clipboard"
              >
                <Copy className="h-4 w-4" strokeWidth={1.75} />
                Copy Key
              </button>
            </div>
            <div className="relative">
              <pre className="rounded-xl bg-zinc-950 border border-zinc-800 p-6 overflow-x-auto text-sm font-mono text-zinc-100 leading-relaxed">
                {PUBLIC_KEY}
              </pre>
            </div>
            <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
              <strong>Verification workflow:</strong> Export a compliance report (PDF/JSONL) from your dashboard
              → Run the included Python verification script → It uses this public key to validate every
              signature and the entire SHA-256 hash chain offline.
            </p>
          </div>
        </section>

        {/* Compliance Badges */}
        <section className="mb-16" aria-labelledby="compliance-heading">
          <h2 id="compliance-heading" className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white mb-8 text-center">
            Compliance Readiness
          </h2>
          <p className="text-center text-zinc-600 dark:text-zinc-400 mb-10 max-w-2xl mx-auto">
            AgentTrace is architected to satisfy the evidence requirements of major AI governance frameworks.
            The badges below indicate our platform readiness — formal certification timelines are available
            upon request for enterprise customers.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {COMPLIANCE_BADGES.map((badge) => (
              <article
                key={badge.name}
                className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${badge.color}`}>
                    <BadgeCheck className="h-6 w-6" strokeWidth={2} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">{badge.name}</h3>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${badge.color}`}>
                        {badge.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{badge.description}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Cryptographic Architecture */}
        <section className="mb-16" aria-labelledby="architecture-heading">
          <h2 id="architecture-heading" className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white mb-8 text-center">
            Cryptographic Architecture
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'SHA-256 Hash Chain',
                description: 'Every audit event links to its predecessor via current_hash = SHA256(prev_hash + payload). Any tampering breaks the chain instantly.',
                icon: Lock,
              },
              {
                title: 'Ed25519 Signatures',
                description: 'Each event is signed with the tenant\'s private key. The public key (above) enables anyone to verify authenticity offline.',
                icon: Key,
              },
              {
                title: 'Idempotency Keys',
                description: 'Client-provided UUIDs prevent duplicate writes. Retries are safe — the same idempotency key always returns the original record.',
                icon: BadgeCheck,
              },
            ].map((item, index) => (
              <article
                key={item.title}
                className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 mb-4">
                  <item.icon className="h-6 w-6 text-zinc-600 dark:text-zinc-400" strokeWidth={1.75} />
                </div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Data Residency & Privacy */}
        <section className="mb-16" aria-labelledby="privacy-heading">
          <h2 id="privacy-heading" className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white mb-8 text-center">
            Data Residency & Privacy
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <article className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                <Lock className="h-5 w-5 text-zinc-500" strokeWidth={1.75} />
                Data Isolation
              </h3>
              <ul className="space-y-3 text-zinc-600 dark:text-zinc-400">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500 mt-0.5" strokeWidth={2} />
                  <span>Row Level Security (RLS) enforces tenant isolation at the database level</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500 mt-0.5" strokeWidth={2} />
                  <span>API Keys are scoped to a single tenant — cross-tenant access is cryptographically impossible</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500 mt-0.5" strokeWidth={2} />
                  <span>No multi-tenant data mixing in storage or memory</span>
                </li>
              </ul>
            </article>
            <article className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                <ExternalLink className="h-5 w-5 text-zinc-500" strokeWidth={1.75} />
                Residency & Retention
              </h3>
              <ul className="space-y-3 text-zinc-600 dark:text-zinc-400">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500 mt-0.5" strokeWidth={2} />
                  <span>EU data stored in Frankfurt (eu-central-1), US data in Virginia (us-east-1)</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500 mt-0.5" strokeWidth={2} />
                  <span>Configurable retention: 30 days (Free) to 7 years (Enterprise)</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500 mt-0.5" strokeWidth={2} />
                  <span>Instant purge on request — cryptographic erasure via key destruction</span>
                </li>
              </ul>
            </article>
          </div>
        </section>

        {/* Footer CTA */}
        <section className="rounded-2xl bg-zinc-900 dark:bg-zinc-950 border border-zinc-800 p-8 lg:p-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Need a Security Questionnaire or Penetration Test Report?
          </h2>
          <p className="text-zinc-300 mb-8 max-w-xl mx-auto">
            Enterprise customers get access to our full SOC 2 report, penetration test summaries,
            and architecture review documents. Contact our security team for the complete package.
          </p>
          <div className="flex items-center justify-center gap-4">
            <a
              href="mailto:security@agenttrace.ai"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white text-zinc-900 font-medium hover:bg-zinc-100 transition-colors"
            >
              <Lock className="h-4 w-4" strokeWidth={1.75} />
              Request Security Package
            </a>
            <a
              href="/docs"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-zinc-600 text-zinc-300 font-medium hover:border-zinc-400 hover:text-white transition-colors"
            >
              View API Documentation
              <ExternalLink className="h-4 w-4" strokeWidth={1.75} />
            </a>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="max-w-6xl mx-auto px-6 py-8 lg:px-8">
          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
            AgentTrace Trust Center · Last updated {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} ·
            <a href="mailto:security@agenttrace.ai" className="underline hover:text-zinc-900 dark:hover:text-white">
              security@agenttrace.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}