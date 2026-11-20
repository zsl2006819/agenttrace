import canonicalize from 'canonicalize';
import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex, randomBytes } from '@noble/hashes/utils';

/**
 * Configuration for the AuditRecorder.
 */
export interface AuditRecorderConfig {
  /**
   * Your AgentTrace API Key. Create one in the dashboard under API Keys.
   */
  apiKey: string;
  /**
   * Audit API endpoint. Defaults to the production AgentTrace API.
   * @default 'https://agenttrace-eta.vercel.app/api/audit'
   */
  endpoint?: string;
  /**
   * Tenant ID. Resolved automatically from your API Key when omitted.
   */
  tenantId?: string;
  /**
   * Agent identifier used in audit records.
   * @default 'default-agent'
   */
  agentId?: string;
  /**
   * Session identifier used in audit records. Auto-generated when omitted.
   */
  sessionId?: string;
}

/**
 * Shape of a single audit record sent to /api/audit.
 */
export interface AuditRecordInput {
  sequence: number;
  idempotency_key: string;
  tool_name: string;
  input_hash: string;
  output_hash?: string | null;
  error_code?: string | null;
  human_override?: boolean;
  prev_hash: string;
  current_hash: string;
  signature?: string | null;
  key_id?: string | null;
}

/**
 * The production audit endpoint.
 */
const DEFAULT_ENDPOINT = 'https://agenttrace-eta.vercel.app/api/audit';

/**
 * Generate a new AgentTrace API Key plaintext.
 * Format: at_live_<48 hex chars>
 * Returned to the user exactly once at creation time.
 */
export function generateApiKey(): string {
  return 'at_live_' + bytesToHex(randomBytes(24));
}

/**
 * SHA-256 hash of an API Key plaintext, returned as hex.
 * Used internally to look up keys by their stored hash.
 */
export function hashApiKey(key: string): string {
  return bytesToHex(sha256(new TextEncoder().encode(key)));
}

/**
 * Canonicalize (JCS) + SHA-256 hash of a JSON-serializable value.
 * Returns a lowercase hex string.
 */
export function computeHash(record: object): string {
  const canonicalJson = canonicalize(record);
  const hashBytes = sha256(new TextEncoder().encode(canonicalJson));
  return bytesToHex(hashBytes);
}

function randomId(): string {
  const crypto = (globalThis as any).crypto;
  if (crypto && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'id_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/**
 * AuditRecorder wraps agent tool calls, computes input/output hashes,
 * maintains a SHA-256 hash chain, and posts tamper-evident records to
 * the AgentTrace audit API.
 *
 * @example
 * ```ts
 * import { AuditRecorder } from '@agenttrace/sdk';
 *
 * const recorder = new AuditRecorder({
 *   apiKey: process.env.AGENTTRACE_API_KEY!,
 *   agentId: 'weather-agent',
 *   sessionId: 'session-001',
 * });
 *
 * const result = await recorder.wrap(
 *   'get_weather',
 *   { city: 'Paris' },
 *   async (args) => ({ temperature: 22, condition: 'sunny' }),
 * );
 * ```
 */
export class AuditRecorder {
  /** The most recent HTTP response from the audit endpoint. */
  public lastResponse: Response | null = null;

  private readonly endpoint: string;
  private readonly apiKey: string;
  private readonly tenantId: string;
  private readonly agentId: string;
  private readonly sessionId: string;
  private prevHash: string;
  private sequenceCounter: number;

  constructor(config: AuditRecorderConfig) {
    this.endpoint = config.endpoint ?? DEFAULT_ENDPOINT;
    this.apiKey = config.apiKey;
    this.tenantId = config.tenantId ?? '';
    this.agentId = config.agentId ?? 'default-agent';
    this.sessionId = config.sessionId ?? randomId();
    this.prevHash = '0'.repeat(64);
    this.sequenceCounter = 1;
  }

  /**
   * Wrap an async agent tool call. Automatically computes input/output
   * hashes, chains them with the previous record's hash, and POSTs the
   * audit record to the AgentTrace API.
   *
   * @param toolName - Name of the tool being called (e.g. 'get_weather')
   * @param args - Arguments passed to the handler (hashed for the record)
   * @param handler - Your existing async tool logic
   * @returns The handler's return value
   */
  async wrap<TArgs, TResult>(
    toolName: string,
    args: TArgs,
    handler: (args: TArgs) => Promise<TResult>
  ): Promise<TResult> {
    const sequence = this.sequenceCounter++;
    const idempotency_key = randomId();

    const input_hash = computeHash({ args });

    let result: TResult;
    let error_code: string | null = null;
    let output_hash: string | undefined;

    try {
      result = await handler(args);
      output_hash = computeHash({ result });
    } catch (err: unknown) {
      error_code = err instanceof Error ? err.message : String(err);
      throw err;
    } finally {
      const current_hash = computeHash({
        tenant_id: this.tenantId,
        agent_id: this.agentId,
        session_id: this.sessionId,
        sequence,
        idempotency_key,
        tool_name: toolName,
        input_hash,
        output_hash: output_hash ?? null,
        error_code,
        human_override: false,
        prev_hash: this.prevHash,
      });

      const record: AuditRecordInput = {
        sequence,
        idempotency_key,
        tool_name: toolName,
        input_hash,
        output_hash: output_hash ?? null,
        error_code,
        human_override: false,
        prev_hash: this.prevHash,
        current_hash,
      };

      this.prevHash = current_hash;
      await this.sendAuditRecord(record);
    }

    return result;
  }

  private async sendAuditRecord(record: AuditRecordInput): Promise<void> {
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          agent_id: this.agentId,
          session_id: this.sessionId,
          ...record,
        }),
      });

      this.lastResponse = response;

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        console.warn(
          '[AgentTrace] Audit record rejected:',
          response.status,
          text
        );
      }
    } catch (err: unknown) {
      console.warn('[AgentTrace] Audit record failed to send:', err);
    }
  }
}