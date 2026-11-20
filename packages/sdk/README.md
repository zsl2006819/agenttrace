# @zsl2006819/agenttrace-sdk

[![npm version](https://img.shields.io/npm/v/@zsl2006819/agenttrace-sdk.svg?style=flat-square)](https://www.npmjs.com/package/@zsl2006819/agenttrace-sdk)
[![License: MIT](https://img.shields.io/npm/l/@zsl2006819/agenttrace-sdk.svg?style=flat-square)](https://github.com/zsl2006819/agenttrace/blob/main/packages/sdk/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=flat-square)](https://www.typescriptlang.org/)

TypeScript SDK for **AgentTrace** — tamper-evident audit infrastructure for AI agents.

Every tool call, LLM invocation, and agent decision is recorded as an immutable event chained together with SHA-256. Any attempt to tamper with a record breaks the chain and is instantly detectable. Built for teams deploying AI agents under regulatory frameworks such as the EU AI Act (Article 12), SOC 2, and ISO 42001.

---

## Installation

```bash
npm install @zsl2006819/agenttrace-sdk
```

Requires Node.js 18+.

---

## Quickstart

Create an API Key from the [AgentTrace dashboard](https://agenttrace-eta.vercel.app/dashboard/api-keys), then wrap your agent's tool calls:

```typescript
import { AuditRecorder } from '@zsl2006819/agenttrace-sdk';

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

console.log(result);
```

The SDK automatically:
- Computes SHA-256 input/output hashes
- Maintains a chained hash (each record references the previous `current_hash`)
- Generates idempotency keys for deduplication
- POSTs the record to `/api/audit` with `Authorization: Bearer <api_key>`

---

## API Reference

### `new AuditRecorder(config)`

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `config.apiKey` | `string` | Yes | — | Your AgentTrace API Key |
| `config.endpoint` | `string` | No | `https://agenttrace-eta.vercel.app/api/audit` | Audit API base URL |
| `config.tenantId` | `string` | No | — | Tenant ID (resolved from API Key when omitted) |
| `config.agentId` | `string` | No | `'default-agent'` | Agent identifier for audit records |
| `config.sessionId` | `string` | No | auto-generated | Session identifier for audit records |

### `recorder.wrap(toolName, args, handler)`

Wraps an async tool call, computes hashes, posts the audit record, and returns the handler's result.

| Parameter | Type | Description |
|-----------|------|-------------|
| `toolName` | `string` | Name of the tool (e.g. `'get_weather'`) |
| `args` | `any` | Arguments passed to the handler (hashed into the record) |
| `handler` | `(args) => Promise<TResult>` | Your existing async tool logic |

Returns the handler's return value. Throws if the handler throws.

### `recorder.lastResponse`

The most recent `Response` from the audit endpoint. Useful for testing and debugging.

### Utility exports

```typescript
import { computeHash, generateApiKey, hashApiKey } from '@zsl2006819/agenttrace-sdk';
```

| Function | Description |
|----------|-------------|
| `computeHash(record)` | JCS-canonicalized SHA-256 hash of a JSON value (hex string) |
| `generateApiKey()` | Generates a new `at_live_...` API Key plaintext |
| `hashApiKey(key)` | SHA-256 hash of an API Key (for stored-key lookup) |

---

## How it works

1. **Hash chain** — Each audit record contains `prev_hash` (the previous record's `current_hash`) and `current_hash` (SHA-256 of the record content). Tampering with any record breaks the chain.
2. **Idempotency** — Each call generates a random `idempotency_key`. Replaying the same key returns the existing record instead of duplicating it.
3. **Authentication** — Every request carries `Authorization: Bearer <api_key>`. The server resolves your `tenant_id` from the key, so tenants cannot read or write each other's records.
4. **Non-repudiation** — Records are cryptographically signed and immutable once written.

---

## Security & Compliance

- **Never expose your API Key** in client-side code or public repositories. Store it in environment variables and rotate it regularly from your dashboard.
- All keys are stored as SHA-256 hashes; plaintext keys are never persisted.
- AgentTrace provides technical infrastructure only and does not constitute formal legal advice. Consult your legal counsel for EU AI Act, SOC 2, or ISO 42001 compliance obligations.

---

## License

MIT © AgentTrace. See [LICENSE](./LICENSE) for details.