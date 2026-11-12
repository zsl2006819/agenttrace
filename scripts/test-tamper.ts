import { computeHash, verifyChain } from '../src/lib/crypto';

function makeRecord(
  sequence: number,
  prevHash: string,
  toolName: string
): any {
  const record: any = {
    tenant_id: 'tenant-abc',
    agent_id: 'agent-001',
    session_id: 'session-xyz',
    sequence: sequence,
    idempotency_key: `idempotency-${sequence}`,
    tool_name: toolName,
    input_hash: 'input-hash-placeholder',
    output_hash: 'output-hash-placeholder',
    error_code: null,
    human_override: false,
    prev_hash: prevHash,
    current_hash: '', // 稍后填充
    signature: '',
    key_id: 'key-1',
    created_at: new Date().toISOString(),
  };
  // 计算 current_hash（不包含 current_hash 本身）
  record.current_hash = computeHash({ ...record, current_hash: undefined });
  return record;
}

// 生成 5 条模拟记录（sequence 1 到 5），前一条的 current_hash 必须等于后一条的 prev_hash
const records: any[] = [];
let prevHash = '';
for (let i = 1; i <= 5; i++) {
  const rec = makeRecord(i, prevHash, `tool-${i}`);
  records.push(rec);
  prevHash = rec.current_hash;
}

// 篡改前验证
const before = verifyChain(records);
if (before.valid) {
  console.log('篡改前验证通过');
} else {
  console.log('篡改前验证失败:', before.reason);
}

// 故意篡改第 3 条的 tool_name 字段（不重新计算哈希）
records[2].tool_name = 'tampered-tool';

// 篡改后验证
const after = verifyChain(records);
if (!after.valid) {
  console.log(`篡改后验证失败，断在第 ${after.brokenAt} 条`);
} else {
  console.log('篡改后验证通过（未检测到篡改）');
}