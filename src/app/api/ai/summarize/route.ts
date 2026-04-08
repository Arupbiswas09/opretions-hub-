import { NextRequest, NextResponse } from 'next/server';
import {
  isOpenAiConfigured,
  openAiNotConfiguredResponse,
} from '../../../lib/ai-openai';
import {
  runSummarizeMessages,
  type SummarizeMessageInput,
} from '../../../lib/ai/summarize-run';

/* ═══════════════════════════════════════════════════════════
   AI Summarize — OpenAI-compatible endpoint
═══════════════════════════════════════════════════════════ */

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { messages, chat_name, channel, previous_summary } = await req.json() as {
      messages: SummarizeMessageInput[];
      chat_name?: string;
      channel?: string;
      previous_summary?: string;
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'messages array is required' }, { status: 400 });
    }

    if (!isOpenAiConfigured()) {
      return openAiNotConfiguredResponse();
    }

    const result = await runSummarizeMessages({
      messages,
      chat_name,
      channel,
      previous_summary,
    });

    return NextResponse.json({
      summary: result.summary,
      model: result.model,
      message_count: result.message_count,
      prompt_stats: result.prompt_stats,
      usage: result.usage,
    });
  } catch (e: unknown) {
    const err = e as Error & { status?: number; code?: string };
    console.error('[AI Summarize] Error:', err);
    return NextResponse.json(
      { error: err.message || 'AI request failed', code: err.code },
      { status: err.status || 500 },
    );
  }
}
