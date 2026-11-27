'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { CodeBlock } from './code-block';

const NODEJS_CODE = `import { AuditRecorder } from '@agenttrace/sdk';

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

console.log(result);`;

const CURL_CODE = `curl -X POST https://agenttrace-eta.vercel.app/api/audit \\
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
  }'`;

export function QuickstartTabs() {
  const [activeTab, setActiveTab] = useState<'nodejs' | 'curl'>('nodejs');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6 border-b border-zinc-200 dark:border-zinc-800">
        <button
          onClick={() => setActiveTab('nodejs')}
          className={cn(
            'px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px',
            activeTab === 'nodejs'
              ? 'border-zinc-900 text-zinc-900 dark:border-zinc-100 dark:text-zinc-100'
              : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
          )}
          aria-pressed={activeTab === 'nodejs'}
        >
          Node.js
        </button>
        <button
          onClick={() => setActiveTab('curl')}
          className={cn(
            'px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px border-transparent',
            activeTab === 'curl'
              ? 'border-zinc-900 text-zinc-900 dark:border-zinc-100 dark:text-zinc-100'
              : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
          )}
          aria-pressed={activeTab === 'curl'}
        >
          cURL
        </button>
      </div>

      <div className="space-y-6">
        {activeTab === 'nodejs' && (
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
              Record an agent tool call
            </h3>
            <p className="text-zinc-500 dark:text-zinc-400 mb-6 text-sm leading-relaxed">
              Wrap any async agent function with <code className="font-mono text-sm bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-900 dark:text-white">AuditRecorder.wrap</code>.
              The SDK computes input/output hashes and chains them automatically.
            </p>
            <CodeBlock language="typescript" code={NODEJS_CODE} />
          </div>
        )}

        {activeTab === 'curl' && (
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
              Send an audit event via cURL
            </h3>
            <p className="text-zinc-500 dark:text-zinc-400 mb-6 text-sm leading-relaxed">
              POST directly to the audit API. You must compute and chain the hashes yourself
              when not using the SDK.
            </p>
            <CodeBlock language="bash" code={CURL_CODE} />
          </div>
        )}
      </div>
    </div>
  );
}