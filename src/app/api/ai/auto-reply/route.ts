import { NextRequest, NextResponse } from 'next/server';
import {
  getOpenAIClient,
  getAiModel,
  isOpenAiConfigured,
  openAiNotConfiguredResponse,
  TONE_MAX_TOKENS,
} from '../../../lib/ai-openai';

/* ═══════════════════════════════════════════════════════════
   AI Auto-Reply — OpenAI-compatible endpoint
   Token-optimized: recent window + rolling summary context
═══════════════════════════════════════════════════════════ */

export const maxDuration = 60;

const TONE_PROMPTS: Record<string, string> = {
  professional: `You write polished, professional business replies. Clear structure, confident tone, appropriate greeting/closing for email when relevant.`,
  friendly: `You write warm, personable replies. Conversational but still competent; light enthusiasm where fitting.`,
  concise: `You write very short replies: 1–3 sentences max unless a list is explicitly needed. Zero filler.`,
  detailed: `You write thorough replies: address each open point, propose next steps, and include brief rationale when helpful.`,
};

interface MessageInput {
  sender: string;
  text: string;
  timestamp?: string;
  from_me?: boolean;
}

function normalizeSummary(s: unknown): string {
  if (!s || typeof s !== 'string') return '';
  return s.replace(/\s+/g, ' ').trim().slice(0, 900);
}

export async function POST(req: NextRequest) {
  try {
    const { messages, chat_name, channel, tone, thread_summary } = await req.json() as {
      messages: MessageInput[];
      chat_name?: string;
      channel?: string;
      tone?: string;
      thread_summary?: string;
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'messages array is required' }, { status: 400 });
    }

    if (!isOpenAiConfigured()) {
      return openAiNotConfiguredResponse();
    }

    const toneKey = tone && TONE_MAX_TOKENS[tone] !== undefined ? tone : 'professional';
    const toneGuide = TONE_PROMPTS[toneKey] || TONE_PROMPTS.professional;

    const channelGuide = channel === 'email'
      ? 'This is email — include a brief greeting and professional sign-off.'
      : channel === 'linkedin'
      ? 'This is LinkedIn — be professional yet personable. No sign-off needed.'
      : channel === 'whatsapp'
      ? 'This is WhatsApp — keep it casual and conversational. Short messages work best.'
      : 'Keep the reply natural for the platform.';

    const summary = normalizeSummary(thread_summary);

    const systemPrompt = `You are a smart reply assistant. ${toneGuide}

${channelGuide}

RULES:
- Output ONLY the reply text — no labels, no "Reply:", no quotes
- Match the language used in the conversation
- If the last message asks a question, answer it directly
- Be authentic — avoid generic corporate speak
- Keep the reply focused and relevant
- Prefer recent context over old details
- If needed, ask 1 crisp clarifying question instead of guessing`;

    const recentMessages = messages.slice(-(toneKey === 'detailed' ? 12 : 9));
    const transcript = recentMessages
      .map((m) => {
        const who = m.from_me ? 'You' : (m.sender || chat_name || 'Contact');
        return `${who}: ${m.text || '(no text)'}`;
      })
      .join('\n');

    const userPrompt = `Write a reply for this conversation${chat_name ? ` with ${chat_name}` : ''}.
${summary ? `\nThread summary (rolling memory): ${summary}\n` : ''}
Recent messages:
${transcript}`;

    const MODEL = getAiModel();
    const client = getOpenAIClient();

    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: TONE_MAX_TOKENS[toneKey],
      temperature: toneKey === 'concise' ? 0.35 : 0.55,
      top_p: 0.9,
    });

    let reply = (completion.choices[0]?.message?.content || '').trim();

    // Strip common preamble artifacts
    reply = reply.replace(/^(Reply|Response|Message|Draft|Here'?s?\s*(a|my|the)\s*(reply|response|draft))\s*[:：]\s*/i, '');
    reply = reply.replace(/^["'""]|["'""]$/g, '');

    return NextResponse.json({
      reply,
      model: MODEL,
      tone: toneKey,
      usage: completion.usage,
    });
  } catch (e: unknown) {
    const err = e as Error & { status?: number; code?: string };
    console.error('[AI Auto-Reply] Error:', err);
    return NextResponse.json(
      { error: err.message || 'AI request failed', code: err.code },
      { status: err.status || 500 },
    );
  }
}
