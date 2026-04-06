import { NextRequest, NextResponse } from 'next/server';
import { getAiModel, getOllamaBaseUrl, ollamaFetch } from '../../../lib/ai-ollama';

/* ═══════════════════════════════════════════════════════════
   AI Auto-Reply — Ollama (any host via OLLAMA_URL)
═══════════════════════════════════════════════════════════ */

export const maxDuration = 60;

const TONE_PROMPTS: Record<string, string> = {
  professional: `You write polished, professional business replies. Clear structure, confident tone, appropriate greeting/closing for email when relevant.`,
  friendly: `You write warm, personable replies. Conversational but still competent; light enthusiasm where fitting.`,
  concise: `You write very short replies: 1–3 sentences max unless a list is explicitly needed. Zero filler.`,
  detailed: `You write thorough replies: address each open point, propose next steps, and include brief rationale when helpful.`,
};

/** Max tokens to generate — concise stays short; detailed gets room to breathe */
const TONE_NUM_PREDICT: Record<string, number> = {
  professional: 380,
  friendly: 340,
  concise: 140,
  detailed: 560,
};

interface MessageInput {
  sender: string;
  text: string;
  timestamp?: string;
  from_me?: boolean;
}

export async function POST(req: NextRequest) {
  try {
    const { messages, chat_name, channel, tone } = await req.json() as {
      messages: MessageInput[];
      chat_name?: string;
      channel?: string;
      tone?: string;
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'messages array is required' }, { status: 400 });
    }

    const toneKey =
      tone && TONE_NUM_PREDICT[tone] !== undefined ? tone : 'professional';
    const toneGuide = TONE_PROMPTS[toneKey] || TONE_PROMPTS.professional;

    const channelGuide = channel === 'email'
      ? 'This is email — include a brief greeting and professional sign-off.'
      : channel === 'linkedin'
      ? 'This is LinkedIn — be professional yet personable. No sign-off needed.'
      : channel === 'whatsapp'
      ? 'This is WhatsApp — keep it casual and conversational. Short messages work best.'
      : 'Keep the reply natural for the platform.';

    const systemPrompt = `You are a smart reply assistant. ${toneGuide}

${channelGuide}

RULES:
- Output ONLY the reply text — no labels, no "Reply:", no quotes
- Match the language used in the conversation
- If the last message asks a question, answer it directly
- Be authentic — avoid generic corporate speak
- Keep the reply focused and relevant`;

    const recentMessages = messages.slice(-14);
    const transcript = recentMessages
      .map((m) => {
        const who = m.from_me ? 'You' : (m.sender || chat_name || 'Contact');
        return `${who}: ${m.text || '(no text)'}`;
      })
      .join('\n');

    const userPrompt = `Write a reply for this conversation${chat_name ? ` with ${chat_name}` : ''}:\n\n${transcript}`;

    const MODEL = getAiModel();
    const ollamaRes = await ollamaFetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        stream: false,
        keep_alive: '15m',
        options: {
          temperature: toneKey === 'concise' ? 0.35 : 0.55,
          top_p: 0.9,
          num_predict: TONE_NUM_PREDICT[toneKey],
          num_ctx: 6144,
          repeat_penalty: 1.12,
        },
        think: false,
      }),
    });

    if (!ollamaRes.ok) {
      const errText = await ollamaRes.text();
      console.error('[AI Auto-Reply] Ollama error:', ollamaRes.status, errText);
      return NextResponse.json(
        { error: `AI model error (${ollamaRes.status}). Is Ollama running?`, details: errText },
        { status: 502 },
      );
    }

    const data = await ollamaRes.json();
    let reply = (data.message?.content || data.response || '').trim();
    
    // Clean up common artifacts
    reply = reply.replace(/^(Reply|Response|Message|Draft|Here'?s?\s*(a|my|the)\s*(reply|response|draft))\s*[:：]\s*/i, '');
    reply = reply.replace(/^["'""]|["'""]$/g, '');

    return NextResponse.json({
      reply,
      model: MODEL,
      tone: toneKey,
      eval_duration_ms: data.eval_duration ? Math.round(data.eval_duration / 1e6) : undefined,
    });
  } catch (e: any) {
    if (e.cause?.code === 'ECONNREFUSED' || e.message?.includes('fetch failed')) {
      return NextResponse.json(
        {
          error: `Cannot reach Ollama at ${getOllamaBaseUrl()}. Set OLLAMA_URL (see DEPLOYMENT.md).`,
          details: e.message,
        },
        { status: 503 },
      );
    }
    console.error('[AI Auto-Reply] Error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
