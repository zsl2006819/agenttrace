'use strict';

var canonicalize = require('canonicalize');
var sha256 = require('@noble/hashes/sha256');
var utils = require('@noble/hashes/utils');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var canonicalize__default = /*#__PURE__*/_interopDefault(canonicalize);

// src/index.ts
var DEFAULT_ENDPOINT = "https://agenttrace-eta.vercel.app/api/audit";
function generateApiKey() {
  return "at_live_" + utils.bytesToHex(utils.randomBytes(24));
}
function hashApiKey(key) {
  return utils.bytesToHex(sha256.sha256(new TextEncoder().encode(key)));
}
function computeHash(record) {
  const canonicalJson = canonicalize__default.default(record);
  const hashBytes = sha256.sha256(new TextEncoder().encode(canonicalJson));
  return utils.bytesToHex(hashBytes);
}
function randomId() {
  const crypto = globalThis.crypto;
  if (crypto && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "id_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}
var AuditRecorder = class {
  constructor(config) {
    /** The most recent HTTP response from the audit endpoint. */
    this.lastResponse = null;
    this.endpoint = config.endpoint ?? DEFAULT_ENDPOINT;
    this.apiKey = config.apiKey;
    this.tenantId = config.tenantId ?? "";
    this.agentId = config.agentId ?? "default-agent";
    this.sessionId = config.sessionId ?? randomId();
    this.prevHash = "0".repeat(64);
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
  async wrap(toolName, args, handler) {
    const sequence = this.sequenceCounter++;
    const idempotency_key = randomId();
    const input_hash = computeHash({ args });
    let result;
    let error_code = null;
    let output_hash;
    try {
      result = await handler(args);
      output_hash = computeHash({ result });
    } catch (err) {
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
        prev_hash: this.prevHash
      });
      const record = {
        sequence,
        idempotency_key,
        tool_name: toolName,
        input_hash,
        output_hash: output_hash ?? null,
        error_code,
        human_override: false,
        prev_hash: this.prevHash,
        current_hash
      };
      this.prevHash = current_hash;
      await this.sendAuditRecord(record);
    }
    return result;
  }
  async sendAuditRecord(record) {
    try {
      const response = await fetch(this.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          agent_id: this.agentId,
          session_id: this.sessionId,
          ...record
        })
      });
      this.lastResponse = response;
      if (!response.ok) {
        const text = await response.text().catch(() => "");
        console.warn(
          "[AgentTrace] Audit record rejected:",
          response.status,
          text
        );
      }
    } catch (err) {
      console.warn("[AgentTrace] Audit record failed to send:", err);
    }
  }
};

exports.AuditRecorder = AuditRecorder;
exports.computeHash = computeHash;
exports.generateApiKey = generateApiKey;
exports.hashApiKey = hashApiKey;
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map