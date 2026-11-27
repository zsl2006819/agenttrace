import Link from 'next/link';
import { CodeBlock } from '@/components/docs/code-block';
import { Badge } from '@/components/ui/badge';
import { MarkdownContent } from '@/components/docs/markdown-content';
import { QuickstartTabs } from '@/components/docs/quickstart-tabs';
import { ShieldCheck, Check, Copy, ExternalLink } from 'lucide-react';

const TOC_LINKS = [
  { href: '#introduction', label: 'Introduction' },
  { href: '#authentication', label: 'Authentication' },
  { href: '#sdk-installation', label: 'SDK Installation' },
  { href: '#quickstart', label: 'Quickstart' },
  { href: '#api-reference', label: 'API Reference' },
];

const NAV_LINKS = [
  { href: '#introduction', label: 'Introduction' },
  { href: '#authentication', label: 'Authentication' },
  { href: '#sdk-installation', label: 'SDK Installation' },
  { href: '#quickstart', label: 'Quickstart' },
  { href: '#api-reference', label: 'API Reference' },
];

const INTRODUCTION_MD = `
AgentTrace is compliance-grade audit infrastructure for AI agents. Every tool call,
LLM invocation, and agent decision is recorded as an immutable event chained together
with SHA-256. Any attempt to tamper with a record breaks the chain and is
instantly detectable.

Designed for teams deploying AI agents under regulatory frameworks such as the EU AI
Act (Article 12), SOC 2, and ISO 42001 — without sacrificing developer velocity.

### What you get

- Immutable hash-chained audit events
- Ed25519 digital signatures per event
- Idempotent writes with deduplication keys
- Multi-tenant isolation via Row Level Security
- PDF / JSONL compliance reports
`;

const AUTHENTICATION_MD = `
All requests to the AgentTrace audit API must be authenticated using an API Key. You
can create a key from the [API Keys](/dashboard/api-keys) page in your dashboard.

Include the key in the \`Authorization\` header as a Bearer token:

> ⚠️ **Security Warning**: Never expose your API Key in client-side code or public repositories. Store it
> securely and rotate it regularly from your dashboard.
`;

const SDK_INSTALLATION_MD = `
Install the TypeScript SDK to record audit events with just a few lines of code.

The SDK handles hash-chain computation, idempotency keys, and authenticated HTTP
requests to \`/api/audit\`.
`;

const API_REFERENCE_MD = `
### POST /api/audit

Submit a new tamper-evident audit event. Requires a valid API Key in the
\`Authorization: Bearer\` header.

**URL**: \`https://agenttrace-eta.vercel.app/api/audit\`

**Auth**: \`Authorization: Bearer <API_KEY>\`

#### Request Body

**Response (201)**

<Badge>201</Badge> <Badge variant="outline">401</Badge> <Badge variant="outline">409</Badge>

Successful response includes the inserted record with its chain hashes.

- **401** — Invalid or missing API Key.
- **409** — Idempotency key already exists; returns the existing record.
`;

export const dynamic = 'force-dynamic';

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-black text-white antialiased">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-[1400px] mx-auto px-6 py-4 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-2"
            aria-label="AgentTrace home"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-sm font-bold text-black shadow-sm">
              AT
            </span>
            <span className="text-xl font-bold tracking-tight text-white">
              AgentTrace Docs
            </span>
          </Link>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-6 py-12 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Left Sidebar */}
          <aside
            className="lg:sticky lg:top-24 lg:w-[260px] lg:hidden flex-col space-y-6 mb-8 lg:mb-0"
          >
            <div className="mb-6 flex items-center gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white text-xs font-bold text-black">
                AT
              </span>
              <span className="font-semibold text-white">Docs</span>
            </div>
            <nav className="space-y-1">
              {NAV_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-400 rounded-lg hover:bg-zinc-800 hover:text-white transition-colors"
                >
                  <span className="text-[10px] uppercase tracking-wider font-semibold opacity-60">
                    {item.label.split(' ')[0][0]}
                  </span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="min-w-0 max-w-3xl flex-1 lg:w-0 lg:flex-1">
            <div className="mb-12">
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
                Developer Documentation
              </h1>
              <p className="text-lg text-zinc-400 mb-8 leading-relaxed max-w-2xl">
                Build AI agents with tamper-evident audit trails. AgentTrace gives you immutable
                hash chains, Ed25519 digital signatures, and compliance-ready reports for EU AI Act
                Article 12, SOC 2, and ISO 42001.
              </p>
              <div className="flex items-center gap-4 text-sm text-zinc-500">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  Tamper-evident
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700">
                  EU AI Act Ready
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700">
                  TypeScript SDK
                </span>
              </div>
            </div>

            {/* Introduction */}
            <section id="introduction" className="mb-16">
              <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-6 tracking-tight">
                Introduction
              </h2>
              <MarkdownContent content={INTRODUCTION_MD} />
            </section>

            {/* Authentication */}
            <section id="authentication" className="mb-16">
              <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-6 tracking-tight">
                Authentication
              </h2>
              <MarkdownContent content={AUTHENTICATION_MD} />
              <div className="relative group">
                <CodeBlock
                  language="bash"
                  code={`curl -X POST https://agenttrace-eta.vercel.app/api/audit \\
  -H "Authorization: Bearer at_live_8f203c6522f081c82d5c9b2a2d2e4d1814cd58f7fc5c818a" \\
  -H "Content-Type: application/json" \\
  -d '{"agent_id":"agent-001","session_id":"sess-001","sequence":1,...}'`}
                />
              </div>
            </section>

            {/* SDK Installation */}
            <section id="sdk-installation" className="mb-16">
              <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-6 tracking-tight">
                SDK Installation
              </h2>
              <MarkdownContent content={SDK_INSTALLATION_MD} />
              <div className="relative group">
                <CodeBlock language="bash" code="npm install @agenttrace/sdk" />
              </div>
              <p className="mt-6 text-zinc-400 leading-7">
                The SDK handles hash-chain computation, idempotency keys, and authenticated HTTP
                requests to <code className="font-mono text-sm bg-zinc-800 px-1.5 py-0.5 rounded text-white">/api/audit</code>.
              </p>
            </section>

            {/* Quickstart */}
            <section id="quickstart" className="mb-16">
              <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-6 tracking-tight">
                Quickstart
              </h2>
              <p className="text-zinc-400 leading-7 mb-8">
                Record your first audit event in under a minute. Choose your preferred language
                below.
              </p>
              <QuickstartTabs />
            </section>

            {/* API Reference */}
            <section id="api-reference" className="mb-16">
              <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-6 tracking-tight">
                API Reference
              </h2>
              <MarkdownContent content={API_REFERENCE_MD} />

              <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden mb-8">
                <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-900/50 flex items-center gap-2">
                  <Badge variant="default" className="bg-white px-2 py-0.5 text-[10px] uppercase tracking-wider text-black">
                    POST
                  </Badge>
                  <span className="font-mono text-sm text-zinc-400">
                    /api/audit
                  </span>
                </div>
                <div className="p-6">
                  <CodeBlock
                    language="json"
                    code={`{
  "agent_id": "weather-agent",
  "session_id": "session-001",
  "sequence": 1,
  "idempotency_key": "uuid-v4-string",
  "tool_name": "get_weather",
  "input_hash": "sha256-hex-string",
  "output_hash": "sha256-hex-string",
  "error_code": null,
  "human_override": false,
  "prev_hash": "0000...0000",
  "current_hash": "sha256-hex-string",
  "signature": null,
  "key_id": null
}`}
                  />
                </div>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden">
                <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-900/50 flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="border-zinc-600 text-zinc-400 px-2 py-0.5 text-[10px] uppercase tracking-wider">
                    201
                  </Badge>
                  <Badge variant="outline" className="border-zinc-600 text-zinc-400 px-2 py-0.5 text-[10px] uppercase tracking-wider">
                    401
                  </Badge>
                  <Badge variant="outline" className="border-zinc-600 text-zinc-400 px-2 py-0.5 text-[10px] uppercase tracking-wider">
                    409
                  </Badge>
                </div>
                <div className="p-6">
                  <CodeBlock
                    language="json"
                    code={`{
  "message": "Audit record created",
  "record": {
    "id": "fc034d03-9bce-4999-beec-3768c0db85c4",
    "tenant_id": "tenant_e5953cc127129aa740480631817e3e83",
    "agent_id": "weather-agent",
    "session_id": "session-001",
    "sequence": 1,
    "idempotency_key": "uuid-v4-string",
    "tool_name": "get_weather",
    "input_hash": "sha256-hex-string",
    "output_hash": "sha256-hex-string",
    "error_code": null,
    "human_override": false,
    "prev_hash": "0000...0000",
    "current_hash": "sha256-hex-string",
    "signature": null,
    "key_id": "a7f8a0cf-08f3-4587-99bb-73b27cfd850f",
    "created_at": "2026-11-17T01:50:08.046001+00:00"
  }
}`}
                  />
                </div>
              </div>
            </section>

            {/* Footer disclaimer */}
            <p className="mt-16 pt-8 border-t border-zinc-800 text-xs text-zinc-500 text-center">
              AgentTrace provides technical infrastructure only and does not constitute formal legal advice.
            </p>
          </main>

          {/* On this page (right rail) */}
          <aside className="hidden lg:block lg:sticky lg:top-24 lg:w-[220px]">
            <div className="mb-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              On this page
            </div>
            <nav className="space-y-1">
              {TOC_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-3 py-1.5 text-sm text-zinc-400 rounded-lg hover:bg-zinc-800 hover:text-white transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      </div>
    </div>
  );
}