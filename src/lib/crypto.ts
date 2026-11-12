import canonicalize from 'canonicalize';
import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex } from '@noble/hashes/utils';

/**
 * 使用 JCS (canonicalize) 规范化 JSON，然后计算 SHA-256 哈希。
 * 返回十六进制字符串。
 */
export function computeHash(record: object): string {
  const canonicalJson = canonicalize(record);
  const hashBytes = sha256(new TextEncoder().encode(canonicalJson));
  return bytesToHex(hashBytes);
}

/**
 * 验证哈希链是否连续、是否被篡改。
 *
 * 规则：
 * 1. 第 i 条记录的 prev_hash 必须等于第 i-1 条记录的 current_hash。
 * 2. 每条记录的 current_hash 必须等于基于该记录内容（不含 current_hash 本身）重新计算的哈希。
 *
 * @returns { valid: boolean; brokenAt?: string; reason?: string }
 */
export function verifyChain(records: any[]): { valid: boolean; brokenAt?: string; reason?: string } {
  if (!Array.isArray(records) || records.length === 0) {
    return {
      valid: false,
      brokenAt: '0',
      reason: 'records must be a non-empty array',
    };
  }

  let prevCurrentHash: string | undefined;

  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    const sequence = record.sequence ?? i + 1;
    const sequenceLabel = String(sequence);

    // 检查 prev_hash 链接是否连续（从第二条开始）
    if (i > 0) {
      if (record.prev_hash !== prevCurrentHash) {
        return {
          valid: false,
          brokenAt: sequenceLabel,
          reason: `prev_hash mismatch at sequence ${sequence}: expected ${prevCurrentHash}, got ${record.prev_hash}`,
        };
      }
    }

    // 验证 current_hash 是否正确：排除 current_hash 本身后重新计算
    const recordForHash = { ...record };
    delete recordForHash.current_hash;
    const expectedHash = computeHash(recordForHash);

    if (record.current_hash !== expectedHash) {
      return {
        valid: false,
        brokenAt: sequenceLabel,
        reason: `current_hash mismatch at sequence ${sequence}: expected ${expectedHash}, got ${record.current_hash}`,
      };
    }

    prevCurrentHash = record.current_hash;
  }

  return { valid: true };
}