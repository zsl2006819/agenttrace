import Link from 'next/link';
import { CodeBlock } from '@/components/docs/code-block';
import { Badge } from '@/components/ui/badge';

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

export const dynamic = 'force-dynamic';

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 selection:bg-blue-200 selection:text-zinc-900 dark:selection:bg-blue-900/30 dark:selection:text-blue-200">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-950/60 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-[1400px] mx-auto px-6 py-3 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-2"
            aria-label="AgentTrace home"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-900 text-sm font-bold text-white shadow-sm dark:bg-white dark:text-zinc-900">
              AT
            </span>
            <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
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
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-zinc-900 text-xs font-bold text-white">
                AT
              </span>
              <span className="font-semibold text-zinc-900 dark:text-white">Docs</span>
            </div>
            <nav className="space-y-1">
              {NAV_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-500 rounded-lg hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white transition-colors"
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
          <main className="flex-1 min-w-0 lg:w-0 lg:flex-1">
            <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white mb-2 tracking-tight">
              Developer Documentation
            </h1>
            <p className="text-lg text-zinc-500 dark:text-zinc-400 mb-10 leading-relaxed">
              Build AI agents with tamper-evident audit trails. AgentTrace gives you immutable
              hash chains, Ed25519 digital signatures, and compliance-ready reports for EU AI Act
              Article 12, SOC 2, and ISO 42001.
            </p>

            {/* Introduction */}
            <section id="introduction" className="mb-14">
              <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-6">
                Introduction
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 leading-7 mb-6">
                AgentTrace is compliance-grade audit infrastructure for AI agents. Every tool call,
                LLM invocation, and agent decision is recorded as an immutable event chained together
                with SHA-256. Any attempt to tamper with a record breaks the chain and is
                instantly detectable.
              </p>
              <p className="text-zinc-600 dark:text-zinc-400 leading-7 mb-6">
                Designed for teams deploying AI agents under regulatory frameworks such as the EU AI
                Act (Article 12), SOC 2, and ISO 42001 — without sacrificing developer velocity.
              </p>
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 p-5 mb-6">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-1">
                  What you get
                </p>
                <ul className="list-disc list-inside text-sm text-zinc-600 dark:text-zinc-400 space-y-1">
                  <li>Immutable hash-chained audit events</li>
                  <li>Ed25519 digital signatures per event</li>
                  <li>Idempotent writes with deduplication keys</li>
                  <li>Multi-tenant isolation via Row Level Security</li>
                  <li>PDF / JSONL compliance reports</li>
                </ul>
              </div>
            </section>

            {/* Authentication */}
            <section id="authentication" className="mb-14">
              <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-6">
                Authentication
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 leading-7 mb-6">
                All requests to the AgentTrace audit API must be authenticated using an API Key. You
                can create a key from the <Link href="/dashboard/api-keys" className="underline underline-offset-2 hover:text-zinc-900 dark:hover:text-white">API Keys</Link> page in your dashboard.
              </p>
              <p className="text-zinc-600 dark:text-zinc-400 leading-7 mb-6">
                Include the key in the <code className="font-mono text-sm bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-900 dark:text-white">Authorization</code> header as a Bearer token:
              </p>
              <CodeBlock
                language="bash"
                code={`curl -X POST https://agenttrace-eta.vercel.app/api/audit \\
  -H "Authorization: Bearer at_live_8f203c6522f081c82d5c9b2a2d2e4d1814cd58f7fc5c818a" \\
  -H "Content-Type: application/json" \\
  -d '{"agent_id":"agent-001","session_id":"sess-001","sequence":1,...}'`}
              />
              <div className="rounded-lg border-l-2 border-red-500 bg-red-50 p-4 dark:border-red-500 dark:bg-red-950/20 mb-6">
                <p className="text-sm font-medium text-red-800 dark:text-red-400">
                  Never expose your API Key in client-side code or public repositories. Store it
                  securely and rotate it regularly from your dashboard.
                </p>
              </div>
            </section>

            {/* SDK Installation */}
            <section id="sdk-installation" className="mb-14">
              <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-6">
                SDK Installation
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 leading-7 mb-6">
                Install the TypeScript SDK to record audit events with just a few lines of code.
              </p>
              <CodeBlock language="bash" code="npm install @agenttrace/sdk" />
              <p className="text-zinc-600 dark:text-zinc-400 leading-7 mt-6">
                The SDK handles hash-chain computation, idempotency keys, and authenticated HTTP
                requests to <code className="font-mono text-sm bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-900 dark:text-white">/api/audit</code>.
              </p>
            </section>

            {/* Quickstart */}
            <section id="quickstart" className="mb-14">
              <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-6">
                Quickstart
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 leading-7 mb-6">
                Record your first audit event in under a minute. Choose your preferred language
                below.
              </p>

              {/* Tabs */}
              <div className="flex items-center gap-2 mb-8 border-b border-zinc-200 dark:border-zinc-800">
                <button
                  className="px-4 py-2 text-sm font-medium border-b-2 border-blue-500 text-blue-600 bg-blue-50 dark:border-blue-500 dark:text-blue-400 dark:bg-blue-950/20"
                  aria-pressed="true"
                >
                  Node.js
                </button>
                <button
                  className="px-4 py-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
                >
                  cURL
                </button>
              </div>

              <div className="space-y-8">
                {/* Node.js tab */}
                <div>
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
                    Record an agent tool call
                  </h3>
                  <p className="text-zinc-500 dark:text-zinc-400 mb-6 text-sm leading-relaxed">
                    Wrap any async agent function with <code className="font-mono text-sm bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-900 dark:text-white">AuditRecorder.wrap</code>.
                    The SDK computes input/output hashes and chains them automatically.
                  </p>
                  <CodeBlock
                    language="typescript"
                    code={`import { AuditRecorder } from '@agenttrace/sdk';

const recorder = new AuditRecorder({
  apiKey: process.env.AGENTTRACE_API_KEY!,
  agentId: 'weather-agent',
  sessionId: 'session-001',
});

const result = await recorder.wrap(
  'get_weather',
  { city: 'Paris' },
  async (args) => {
    // Your existing agent logic
    return { temperature: 22, condition: 'sunny', unit: 'celsius' };
  }
);

console.log(result);`} />
                </div>

                {/* cURL tab */}
                <div className="hidden">
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
                    Send an audit event via cURL
                  </h3>
                  <p className="text-zinc-500 dark:text-zinc-400 mb-6 text-sm leading-relaxed">
                    POST directly to the audit API. You must compute and chain the hashes yourself
                    when not using the SDK.
                  </p>
                  <CodeBlock
                    language="bash"
                    code={`curl -X POST https://agenttrace-eta.vercel.app/api/audit \\
  -H "Authorization: Bearer at_live_YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "agent_id": "weather-agent",
    "session_id": "session-001",
    "sequence": 1,
    "idempotency_key": "unique-idempotency-key",
    "tool_name": "get_weather",
    "input_hash": "sha256-of-input",
    "output_hash": "sha256-of-output",
    "prev_hash": "0000000000000000000000000000000000000000000000000000000000000000",
    "current_hash": "sha256-of-full-record"
  }'`} />
                </div>
              </div>
            </section>

            {/* API Reference */}
            <section id="api-reference" className="mb-14">
              <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-6">
                API Reference
              </h2>
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden mb-8">
                <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 flex items-center gap-2">
                  <Badge variant="default" className="bg-blue-500 text-white px-2 py-0.5 text-[10px] uppercase tracking-wider">
                    POST
                  </Badge>
                  <span className="font-mono text-sm text-zinc-500 dark:text-zinc-400">
                    /api/audit
                  </span>
                </div>
                <div className="p-6">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
                    Submit a new tamper-evident audit event. Requires a valid API Key in the
                    <code className="font-mono text-xs bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-900 dark:text-white">Authorization: Bearer</code> header.
                  </p>
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h4 className="text-sm font-semibold text-zinc-900 dark:text-white mb-2">URL</h4>
                      <p className="text-xs font-mono text-blue-600 dark:text-blue-400 break-all">
                        https://agenttrace-eta.vercel.app/api/audit
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-zinc-900 dark:text-white mb-2">Auth</h4>
                      <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 break-all">
                        Authorization: Bearer &lt;API_KEY&gt;
                      </p>
                    </div>
                  </div>

                  <h4 className="text-sm font-semibold text-zinc-900 dark:text-white mb-3">
                    Request Body
                  </h4>
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
}`} />
                </div>
              </div>

              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
                <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 flex items-center gap-2">
                  <Badge variant="outline" className="border-zinc-700 text-zinc-500 px-2 py-0.5 text-[10px] uppercase tracking-wider">
                    201
                  </Badge>
                  <Badge variant="outline" className="border-zinc-700 text-zinc-500 px-2 py-0.5 text-[10px] uppercase tracking-wider">
                    401
                  </Badge>
                  <Badge variant="outline" className="border-zinc-700 text-zinc-500 px-2 py-0.5 text-[10px] uppercase tracking-wider">
                    409
                  </Badge>
                </div>
                <div className="p-6">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
                    Successful response includes the inserted record with its chain hashes.
                  </p>
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
}`} />
                  <div className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
                    <p><strong>401</strong> — Invalid or missing API Key.</p>
                    <p><strong>409</strong> — Idempotency key already exists; returns the existing record.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Footer disclaimer */}
            <p className="mt-16 pt-8 border-t border-zinc-200 dark:border-zinc-800 text-xs text-zinc-400 text-center">
              AgentTrace provides technical infrastructure only and does not constitute formal legal advice.
            </p>
          </main>

          {/* On this page (right rail) */}
          <aside className="hidden lg:block lg:sticky lg:top-24 lg:w-[220px]">
            <div className="mb-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              On this page
            </div>
            <nav className="space-y-2">
              {TOC_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-3 py-1.5 text-sm text-zinc-500 rounded-lg hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white transition-colors"
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