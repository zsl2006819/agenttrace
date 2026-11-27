import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import { hashApiKey } from '@/lib/crypto';

export const dynamic = 'force-dynamic';

function extractBearerToken(request: NextRequest): string | null {
  const header =
    request.headers.get('authorization') ?? request.headers.get('Authorization');
  if (!header) return null;
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  return match ? match[1].trim() : null;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const token = extractBearerToken(request);
    if (!token) {
      return NextResponse.json(
        { error: 'Missing Authorization: Bearer <api_key>' },
        { status: 401 }
      );
    }

    const service = getSupabaseServer();
    const keyHash = hashApiKey(token);

    const { data: keyRows, error: keyError } = await service
      .from('api_keys')
      .select('id, tenant_id, revoked_at')
      .eq('key_hash', keyHash)
      .is('revoked_at', null)
      .limit(1);

    if (keyError || !keyRows?.[0]) {
      return NextResponse.json(
        { error: 'Invalid or revoked API key' },
        { status: 401 }
      );
    }

    const tenantId = keyRows[0].tenant_id as string;

    const { data: events, error: eventsError } = await service
      .from('audit_events')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (eventsError) {
      console.error('Failed to fetch events for AI analysis:', eventsError);
      return NextResponse.json(
        { error: 'Failed to fetch events' },
        { status: 500 }
      );
    }

    if (!events || events.length === 0) {
      return NextResponse.json(
        { error: 'No events to analyze' },
        { status: 400 }
      );
    }

    const openaiApiKey = process.env.OPENAI_API_KEY;
    let insights: string[] = [];

    if (openaiApiKey) {
      try {
        const prompt = `You are a security analyst for AgentTrace, an AI agent audit platform. Analyze the following 10 most recent audit events and provide 3-5 concise security insights. Focus on:
1. Anomalous patterns (unusual tool usage, error spikes, frequency anomalies)
2. Security risks (blocked actions, PII exposure, injection attempts)
3. Operational recommendations (key rotation, rate limiting, monitoring)

Events (newest first):
${events.map((e, i) => `${i + 1}. [${e.created_at}] Agent: ${e.agent_id} | Tool: ${e.tool_name} | Seq: ${e.sequence} | Error: ${e.error_code ?? 'none'} | Override: ${e.human_override ? 'yes' : 'no'} | Hash: ${e.current_hash?.slice(0, 8)}...`).join('\n')}

Return ONLY a JSON array of strings, each being one insight. Example:
["Detected 3 blocked drop_table attempts from agent-qa — possible destructive behavior", "Agent agent-prod shows 40% error rate on llm_chat — check for prompt injection", "High frequency external API calls from agent-weather — verify rate limits"]`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiApiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: 'You are a security analyst. Return only valid JSON array of strings.' },
              { role: 'user', content: prompt },
            ],
            temperature: 0.3,
            max_tokens: 500,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const content = data.choices[0]?.message?.content?.trim();
          if (content) {
            try {
              insights = JSON.parse(content);
            } catch {
              insights = content.split('\n').filter(Boolean).slice(0, 5);
            }
          }
        }
      } catch (e) {
        console.error('OpenAI API error:', e);
      }
    }

    if (insights.length === 0) {
      const blockedEvents = events.filter(e => e.error_code === 'BLOCKED_BY_GUARDRAIL');
      const errorEvents = events.filter(e => e.error_code && e.error_code !== 'BLOCKED_BY_GUARDRAIL');
      const agents = [...new Set(events.map(e => e.agent_id))];
      const tools = [...new Set(events.map(e => e.tool_name))];

      if (blockedEvents.length > 0) {
        insights.push(`Guardrail blocked ${blockedEvents.length} attempt${blockedEvents.length > 1 ? 's' : ''} (${[...new Set(blockedEvents.map(e => e.tool_name))].join(', ')}) — security policies active`);
      }
      if (errorEvents.length > 0) {
        insights.push(`${errorEvents.length} event${errorEvents.length > 1 ? 's' : ''} with errors detected — review ${[...new Set(errorEvents.map(e => e.tool_name))].join(', ')} calls`);
      }
      if (agents.length > 1) {
        insights.push(`${agents.length} active agents in this period — consider key rotation for ${agents[0]}`);
      }
      if (tools.includes('llm_chat')) {
        insights.push('LLM chat activity detected — monitor for prompt injection and token usage anomalies');
      }
      if (tools.some(t => t.includes('drop') || t.includes('truncate') || t.includes('delete'))) {
        insights.push('Destructive tool calls present — ensure guardrails are configured for production');
      }
      if (insights.length === 0) {
        insights.push('All events clean — no anomalies detected in recent activity');
        insights.push('Recommendation: Enable "Rate-limit LLM calls" guardrail for proactive protection');
      }
    }

    return NextResponse.json({
      insights: insights.slice(0, 5),
      analyzedEvents: events.length,
      timestamp: new Date().toISOString(),
      aiPowered: !!openaiApiKey,
    });
  } catch (error: unknown) {
    console.error('AI analysis error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Internal server error', details: message },
      { status: 500 }
    );
  }
}