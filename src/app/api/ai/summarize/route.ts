import { NextRequest, NextResponse } from 'next/server';
import { getAiModel, getOllamaBaseUrl, ollamaFetch } from '../../../lib/ai-ollama';

/* ═══════════════════════════════════════════════════════════
   AI Summarize — short, fast; full thread via packed transcript
   Configure OLLAMA_URL + AI_MODEL for any hosted Ollama (see DEPLOYMENT.md)
═══════════════════════════════════════════════════════════ */

export const maxDuration = 60;

/** Target size for model input — keeps latency predictable on long threads */
const MAX_TRANSCRIPT_CHARS = 11_000;
const HEAD_LINES = 14;
const TAIL_LINES = 48;

const SYSTEM_PROMPT = `You summarize business chats in plain text. Be brief.

Output exactly these sections (short):

SUMMARY
2–4 sentences: what this thread is about, current state, anything urgent.

KEY POINTS
• Up to 4 bullets — facts, decisions, or numbers worth remembering.
• Skip filler; merge related ideas.

ACTION ITEMS
→ Up to 3 lines (task + who if clear). If none: No action items.

TONE
One short phrase (e.g. Formal / Casual / Negotiating).

RULES:
- Total output under 130 words.
- No markdown asterisks. No "Here is a summary".
- Cover the whole thread context you receive; prioritize recent messages if trade-offs are needed.`;

interface MessageInput {
  sender: string;
  text: string;
  timestamp?: string;
  from_me?: boolean;
}

function lineFor(m: MessageInput): string {
  const who = m.from_me ? 'You' : (m.sender || 'Contact');
  const t = (m.text || '(no text)').replace(/\s+/g, ' ').trim();
  const clipped = t.length > 900 ? `${t.slice(0, 897)}…` : t;
  return `${who}: ${clipped}`;
}

/** Full chronological thread → compact string for the model */
function buildPackedTranscript(messages: MessageInput[]): {
  text: string;
  totalMessages: number;
  omittedMiddle: number;
} {
  const chronological = [...messages];
  const lines = chronological.map(lineFor);
  const joined = lines.join('\n');

  if (joined.length <= MAX_TRANSCRIPT_CHARS) {
    return { text: joined, totalMessages: messages.length, omittedMiddle: 0 };
  }

  const head = lines.slice(0, HEAD_LINES);
  const tailStart = Math.max(HEAD_LINES, lines.length - TAIL_LINES);
  const tail = lines.slice(tailStart);
  const omitted = Math.max(0, tailStart - HEAD_LINES);
  const middleNote =
    omitted > 0
      ? `\n\n[${omitted} message(s) omitted from middle — same thread]\n\n`
      : '\n';

  let packed = `${head.join('\n')}${middleNote}${tail.join('\n')}`;
  if (packed.length > MAX_TRANSCRIPT_CHARS) {
    packed = packed.slice(-MAX_TRANSCRIPT_CHARS);
    packed = `…(start trimmed)\n${packed}`;
  }
  return { text: packed, totalMessages: messages.length, omittedMiddle: omitted };
}

export async function POST(req: NextRequest) {
  try {
    const { messages, chat_name, channel } = await req.json() as {
      messages: MessageInput[];
      chat_name?: string;
      channel?: string;
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'messages array is required' }, { status: 400 });
    }

    const { text: transcript, totalMessages, omittedMiddle } = buildPackedTranscript(messages);

    const userPrompt = `Thread: ${totalMessages} message(s)${omittedMiddle ? ` (${omittedMiddle} older lines summarized structurally as omitted)` : ''} — ${channel || 'chat'}${chat_name ? ` with "${chat_name}"` : ''}.

Transcript (chronological):
---
${transcript}
---`;

    const MODEL = getAiModel();
    const ollamaRes = await ollamaFetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        stream: false,
        keep_alive: '15m',
        options: {
          temperature: 0.12,
          top_p: 0.82,
          num_predict: 380,
          num_ctx: 6144,
          repeat_penalty: 1.06,
        },
        think: false,
      }),
    });

    if (!ollamaRes.ok) {
      const errText = await ollamaRes.text();
      console.error('[AI Summarize] Ollama error:', ollamaRes.status, errText);
      return NextResponse.json(
        { error: `AI model error (${ollamaRes.status}). Is Ollama running?`, details: errText },
        { status: 502 },
      );
    }

    const data = await ollamaRes.json();
    const summary = data.message?.content || data.response || '';

    return NextResponse.json({
      summary: summary.trim(),
      model: MODEL,
      message_count: totalMessages,
      prompt_stats: {
        transcript_chars: transcript.length,
        omitted_middle_messages: omittedMiddle,
      },
      eval_duration_ms: data.eval_duration ? Math.round(data.eval_duration / 1e6) : undefined,
    });
  } catch (e: any) {
    if (e.cause?.code === 'ECONNREFUSED' || e.message?.includes('fetch failed')) {
      return NextResponse.json(
        {
          error: `Cannot reach Ollama at ${getOllamaBaseUrl()}. Set OLLAMA_URL to a running server (see DEPLOYMENT.md).`,
          details: e.message,
        },
        { status: 503 },
      );
    }
    console.error('[AI Summarize] Error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
