import { AuditRecorder } from '../src/sdk';

const PORT = process.env.AUDIT_API_PORT ?? '3000';

async function main() {
  const recorder = new AuditRecorder({
    endpoint: `http://localhost:${PORT}/api/audit`,
    tenantId: 'tenant-demo',
    agentId: 'agent-demo',
    sessionId: 'session-demo',
  });

  const result = await recorder.wrap('get_weather', { city: 'Beijing' }, async (args) => {
    console.log('执行工具:', args);
    return { temperature: 25, condition: 'sunny' };
  });

  console.log('工具返回结果:', result);
  console.log('审计记录已发送，请检查 Supabase audit_events 表');
}

main().catch((err) => {
  console.error('测试失败:', err);
  process.exit(1);
});