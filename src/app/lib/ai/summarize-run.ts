/**
 * Shared thread summarization (same prompts as /api/ai/summarize).
 */

import type OpenAI from 'openai';
import { getOpenAIClient, getAiModel } from '../ai-openai';

export interface SummarizeMessageInput {
  sender: string;
  text: string;
  timestamp?: string;
  from_me?: boolean;
}

const MAX_TRANSCRIPT_CHARS = 7_500;
const HEAD_LINES = 10;
const TAIL_LINES = 28;
const MAX_PREVIOUS_SUMMARY_CHARS = 900;
const RECENT_FOR_UPDATE = 24;

export const SYSTEM_PROMPT_FULL = `You summarize business chats in plain text. Be brief.

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

const SYSTEM_PROMPT_UPDATE = `You maintain a rolling business-chat summary.

You will receive:
- A PREVIOUS SUMMARY (may be partial)
- Recent new messages

Update the summary to reflect the latest state while keeping it compact.

Output exactly these sections (short):

SUMMARY
2–4 sentences: what this thread is about, current state, anything urgent.

KEY POINTS
• Up to 4 bullets — facts/decisions/numbers worth remembering.

ACTION ITEMS
→ Up to 3 lines (task + owner if clear). If none: No action items.

TONE
One short phrase (e.g. Formal / Casual / Negotiating).

RULES:
- Total output under 120 words.
- No markdown asterisks. No "Here is a summary".
- Don't restate the entire history. Prefer what changed most recently.
- If the recent messages contradict the previous summary, the recent messages win.`;

function lineFor(m: SummarizeMessageInput): string {
  const who = m.from_me ? 'You' : (m.sender || 'Contact');
  const t = (m.text || '(no text)').replace(/\s+/g, ' ').trim();
  const clipped = t.length > 900 ? `${t.slice(0, 897)}…` : t;
  return `${who}: ${clipped}`;
}

function buildPackedTranscript(messages: SummarizeMessageInput[]): {
  text: string;
  totalMessages: number;
  omittedMiddle: number;
} {
  const lines = messages.map(lineFor);
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

function normalizeSummary(s: unknown): string {
  if (!s || typeof s !== 'string') return '';
  return s.replace(/\s+/g, ' ').trim().slice(0, MAX_PREVIOUS_SUMMARY_CHARS);
}

function buildUpdatePrompt(args: {
  previousSummary: string;
  recentMessages: SummarizeMessageInput[];
  totalMessages: number;
  chat_name?: string;
  channel?: string;
}) {
  const recentLines = args.recentMessages.map(lineFor).join('\n');
  return `Thread: ${args.totalMessages} message(s) — ${args.channel || 'chat'}${args.chat_name ? ` with "${args.chat_name}"` : ''}.

PREVIOUS SUMMARY:
${args.previousSummary || '(none)'}

RECENT MESSAGES (chronological, newest last):
---
${recentLines}
---`;
}

export type SummarizeRunResult = {
  summary: string;
  model: string;
  message_count: number;
  prompt_stats: {
    transcript_chars: number;
    omitted_middle_messages: number;
    used_previous_summary: boolean;
    mode: 'update' | 'full';
  };
  usage: OpenAI.Chat.Completions.ChatCompletion['usage'];
};

/** Run summarization (caller must ensure OpenAI is configured). */
export async function runSummarizeMessages(args: {
  messages: SummarizeMessageInput[];
  chat_name?: string;
  channel?: string;
  previous_summary?: string;
  client?: OpenAI;
}): Promise<SummarizeRunResult> {
  const { messages, chat_name, channel, previous_summary } = args;
  const client = args.client ?? getOpenAIClient();
  const prev = normalizeSummary(previous_summary);
  const totalMessages = messages.length;
  const isUpdateMode = prev.length >= 80 && totalMessages > RECENT_FOR_UPDATE;

  const recentMessages = isUpdateMode ? messages.slice(-RECENT_FOR_UPDATE) : messages;

  const { text: transcript, omittedMiddle } = isUpdateMode
    ? {
        text: recentMessages.map(lineFor).join('\n'),
        omittedMiddle: Math.max(0, totalMessages - recentMessages.length),
      }
    : buildPackedTranscript(messages);

  const userPrompt = isUpdateMode
    ? buildUpdatePrompt({ previousSummary: prev, recentMessages, totalMessages, chat_name, channel })
    : `Thread: ${totalMessages} message(s)${omittedMiddle ? ` (${omittedMiddle} older line(s) omitted)` : ''} — ${channel || 'chat'}${chat_name ? ` with "${chat_name}"` : ''}.

Transcript (chronological):
---
${transcript}
---`;

  const MODEL = getAiModel();

  const completion = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: isUpdateMode ? SYSTEM_PROMPT_UPDATE : SYSTEM_PROMPT_FULL },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: isUpdateMode ? 320 : 380,
    temperature: 0.12,
    top_p: 0.82,
  });

  const summary = (completion.choices[0]?.message?.content || '').trim();

  return {
    summary,
    model: MODEL,
    message_count: totalMessages,
    prompt_stats: {
      transcript_chars: transcript.length,
      omitted_middle_messages: omittedMiddle,
      used_previous_summary: Boolean(prev),
      mode: isUpdateMode ? 'update' : 'full',
    },
    usage: completion.usage,
  };
}
