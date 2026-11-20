/**
 * Configuration for the AuditRecorder.
 */
interface AuditRecorderConfig {
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
interface AuditRecordInput {
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
 * Generate a new AgentTrace API Key plaintext.
 * Format: at_live_<48 hex chars>
 * Returned to the user exactly once at creation time.
 */
declare function generateApiKey(): string;
/**
 * SHA-256 hash of an API Key plaintext, returned as hex.
 * Used internally to look up keys by their stored hash.
 */
declare function hashApiKey(key: string): string;
/**
 * Canonicalize (JCS) + SHA-256 hash of a JSON-serializable value.
 * Returns a lowercase hex string.
 */
declare function computeHash(record: object): string;
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
declare class AuditRecorder {
    /** The most recent HTTP response from the audit endpoint. */
    lastResponse: Response | null;
    private readonly endpoint;
    private readonly apiKey;
    private readonly tenantId;
    private readonly agentId;
    private readonly sessionId;
    private prevHash;
    private sequenceCounter;
    constructor(config: AuditRecorderConfig);
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
    wrap<TArgs, TResult>(toolName: string, args: TArgs, handler: (args: TArgs) => Promise<TResult>): Promise<TResult>;
    private sendAuditRecord;
}

export { type AuditRecordInput, AuditRecorder, type AuditRecorderConfig, computeHash, generateApiKey, hashApiKey };
