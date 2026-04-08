import { createHash } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../lib/supabase/admin';
import { getHubOrgOr401 } from '../../../lib/hub/org';
import {
  isOpenAiConfigured,
  openAiNotConfiguredResponse,
} from '../../../lib/ai-openai';
import { runSummarizeMessages, type SummarizeMessageInput } from '../../../lib/ai/summarize-run';
import { inferReplyToneFromSummary, type ReplyToneKey } from '../../../lib/ai/tone-from-summary';

export const maxDuration = 60;

function fingerprintMessages(messages: SummarizeMessageInput[]): string {
  const tail = messages.slice(-10);
  const parts = tail.map((m) =>
    `${m.timestamp ?? ''}|${String(m.from_me ? 1 : 0)}|${(m.text || '').slice(0, 160)}`,
  );
  return createHash('sha256').update(parts.join('\n')).digest('hex').slice(0, 48);
}

const TONES = new Set(['professional', 'friendly', 'concise', 'detailed']);

function normalizeTone(t: string): ReplyToneKey {
  const x = (t || 'professional').toLowerCase();
  return (TONES.has(x) ? x : 'professional') as ReplyToneKey;
}

/**
 * POST /api/comm/thread-ai
 * Upserts rolling summary + tone for a Unipile/internal thread key when messages change.
 */
export async function POST(req: NextRequest) {
  const org = await getHubOrgOr401();
  if (org instanceof NextResponse) return org;

  if (!isOpenAiConfigured()) {
    return openAiNotConfiguredResponse();
  }

  try {
    const body = (await req.json()) as {
      thread_key?: string;
      messages?: SummarizeMessageInput[];
      chat_name?: string;
      channel?: string;
      force?: boolean;
    };

    const threadKey = String(body.thread_key || '').trim().slice(0, 512);
    const messages = body.messages;
    if (!threadKey || !messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'thread_key and messages are required' }, { status: 400 });
    }

    const fp = fingerprintMessages(messages);
    const admin = getSupabaseAdmin();

    if (!body.force) {
      const { data: existing } = await admin
        .from('comm_thread_ai')
        .select('summary, tone, message_fingerprint, updated_at')
        .eq('org_id', org.orgId)
        .eq('user_id', org.userId)
        .eq('thread_key', threadKey)
        .maybeSingle();

      if (
        existing &&
        existing.message_fingerprint === fp &&
        typeof existing.summary === 'string' &&
        existing.summary.length > 20
      ) {
        return NextResponse.json({
          summary: existing.summary,
          tone: normalizeTone(String(existing.tone)),
          message_fingerprint: fp,
          updated_at: existing.updated_at,
          cached: true,
        });
      }
    }

    const { data: prevRow } = await admin
      .from('comm_thread_ai')
      .select('summary')
      .eq('org_id', org.orgId)
      .eq('user_id', org.userId)
      .eq('thread_key', threadKey)
      .maybeSingle();
    const previous_summary =
      typeof prevRow?.summary === 'string' ? prevRow.summary : '';

    const result = await runSummarizeMessages({
      messages,
      chat_name: body.chat_name,
      channel: body.channel,
      previous_summary: previous_summary.slice(0, 900),
    });

    const tone = inferReplyToneFromSummary(result.summary);

    const { error: upsertErr } = await admin.from('comm_thread_ai').upsert(
      {
        org_id: org.orgId,
        user_id: org.userId,
        thread_key: threadKey,
        summary: result.summary,
        tone,
        message_fingerprint: fp,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'org_id,user_id,thread_key' },
    );

    if (upsertErr) {
      console.error('[comm/thread-ai] upsert', upsertErr);
      return NextResponse.json(
        { error: upsertErr.message || 'Failed to save thread insight' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      summary: result.summary,
      tone,
      message_fingerprint: fp,
      updated_at: new Date().toISOString(),
      model: result.model,
      message_count: result.message_count,
      prompt_stats: result.prompt_stats,
      usage: result.usage,
      cached: false,
    });
  } catch (e: unknown) {
    const err = e as Error;
    console.error('[comm/thread-ai]', err);
    return NextResponse.json(
      { error: err.message || 'Thread insight failed' },
      { status: 500 },
    );
  }
}
