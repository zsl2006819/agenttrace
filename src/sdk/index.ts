import { computeHash } from '../lib/crypto';

export interface AuditRecorderConfig {
  endpoint: string;
  tenantId: string;
  agentId: string;
  sessionId: string;
}

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

export class AuditRecorder {
  private endpoint: string;
  private tenantId: string;
  private agentId: string;
  private sessionId: string;
  private prevHash: string;
  private sequenceCounter: number;

  constructor(config: AuditRecorderConfig) {
    this.endpoint = config.endpoint;
    this.tenantId = config.tenantId;
    this.agentId = config.agentId;
    this.sessionId = config.sessionId;
    // 初始 prev_hash 使用 64 个 0
    this.prevHash = '0'.repeat(64);
    this.sequenceCounter = 1;
  }

  /**
   * 包装一个工具调用，自动计算输入/输出哈希并上报审计记录。
   * @param toolName 工具名称
   * @param args 传入给 handler 的参数
   * @param handler 异步处理函数，返回执行结果
   * @returns handler 的返回值
   */
  async wrap<TArgs, TResult>(
    toolName: string,
    args: TArgs,
    handler: (args: TArgs) => Promise<TResult>
  ): Promise<TResult> {
    const sequence = this.sequenceCounter++;
    const idempotency_key = crypto.randomUUID();

    // 计算 input_hash：对 args 进行 JCS 规范化并 SHA-256
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

      // 更新内存中的 prev_hash 为本次的 current_hash，供下一条使用
      this.prevHash = current_hash;

      // POST 到审计 API（不阻塞主流程，错误仅记录）
      void this.sendAuditRecord(record);
    }

    return result;
  }

  private async sendAuditRecord(record: AuditRecordInput): Promise<void> {
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tenant_id: this.tenantId,
          agent_id: this.agentId,
          session_id: this.sessionId,
          ...record,
        }),
      });

      if (!response.ok) {
        console.warn('审计记录上报失败:', response.status, await response.text());
      }
    } catch (err: unknown) {
      console.warn('审计记录上报异常:', err);
    }
  }
}