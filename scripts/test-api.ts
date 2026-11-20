import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { AuditRecorder } from '@agenttrace/sdk';

/**
 * Load AGENTTRACE_API_KEY from .env.local (git-ignored).
 * Also works if the variable is already exported in the shell.
 */
function loadEnvLocal(): void {
  if (process.env.AGENTTRACE_API_KEY) return;
  try {
    const content = readFileSync(resolve(process.cwd(), '.env.local'), 'utf8');
    for (const line of content.split(/\r?\n/)) {
      const match = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/.exec(line);
      if (!match) continue;
      const key = match[1];
      let value = match[2].trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // .env.local is optional
  }
}

loadEnvLocal();

const AUDIT_API_URL =
  process.env.AUDIT_API_URL ?? 'https://agenttrace-eta.vercel.app/api/audit';
const API_KEY = process.env.AGENTTRACE_API_KEY ?? '';

if (!API_KEY) {
  console.error(
    'Missing AGENTTRACE_API_KEY. Add it to .env.local or export it before running this test.'
  );
  process.exit(1);
}

async function main() {
  const recorder = new AuditRecorder({
    endpoint: AUDIT_API_URL,
    apiKey: API_KEY,
    agentId: 'agent-demo',
    sessionId: `session-demo-${Date.now()}`,
  });

  const result = await recorder.wrap(
    'get_weather',
    { city: 'Paris' },
    async (args: { city: string }) => {
      console.log('  executing tool with args:', args);
      return { temperature: 22, condition: 'sunny', unit: 'celsius' };
    }
  );

  console.log('← Tool returned:', result);

  const response = recorder.lastResponse;
  if (!response) {
    throw new Error('No response received from the audit endpoint');
  }

  const body = await response.json().catch(() => null);

  console.log(`→ Audit API status: ${response.status} ${response.statusText}`);
  console.log('→ Audit API body:', JSON.stringify(body, null, 2));

  if (!response.ok) {
    throw new Error(`Audit API rejected the record (HTTP ${response.status})`);
  }

  console.log('');
  console.log('✅ SUCCESS — audit record written to Supabase audit_events.');
  console.log('   Open the Audit Logs page to see it.');
}

main().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});