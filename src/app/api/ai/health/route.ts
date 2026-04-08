import { NextResponse } from 'next/server';
import { getAiModel, normalizeOpenAiApiKey } from '../../../lib/ai-openai';
import {
  getOllamaBaseUrl,
  getOllamaModel,
  isOllamaConfigured,
  ollamaFetch,
} from '../../../lib/ai-ollama';

/* ═══════════════════════════════════════════════════════════
   AI Health — GET /api/ai/health
═══════════════════════════════════════════════════════════ */

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!isOllamaConfigured()) {
    const key = normalizeOpenAiApiKey(process.env.OPENAI_API_KEY);
    const model = getAiModel();
    if (!key) {
      return NextResponse.json(
        {
          status: 'misconfigured',
          provider: 'openai',
          model,
          message: 'Set OPENAI_API_KEY (summarize / smart reply use this endpoint).',
        },
        { status: 503 },
      );
    }
    return NextResponse.json({
      status: 'ready',
      provider: 'openai',
      model,
      message: `AI ready — ${model} (OpenAI-compatible)`,
    });
  }

  const MODEL = getOllamaModel();
  const base = getOllamaBaseUrl();

  try {
    const pingRes = await ollamaFetch('/api/tags', { method: 'GET' });

    if (!pingRes.ok) {
      return NextResponse.json({
        status: 'error',
        provider: 'ollama',
        ollama: false,
        model: MODEL,
        ollama_url: base,
        message: 'Ollama is not responding',
      }, { status: 503 });
    }

    const data = await pingRes.json();
    const models = data.models || [];
    const hasModel = models.some(
      (m: { name?: string }) =>
        m.name === MODEL || m.name?.startsWith(MODEL.split(':')[0]),
    );

    return NextResponse.json({
      status: hasModel ? 'ready' : 'model_missing',
      provider: 'ollama',
      ollama: true,
      model: MODEL,
      ollama_url: base,
      available_models: models.map((m: { name: string }) => m.name),
      message: hasModel
        ? `AI ready — ${MODEL} (Ollama)`
        : `Ollama reachable but ${MODEL} not found. Pull: ollama pull ${MODEL}`,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    const refused =
      (e as { cause?: { code?: string } })?.cause?.code === 'ECONNREFUSED' ||
      msg.includes('fetch failed');
    return NextResponse.json(
      {
        status: 'error',
        provider: 'ollama',
        ollama: false,
        model: MODEL,
        ollama_url: base,
        message: refused
          ? `Cannot reach ${base}. Set OLLAMA_URL in production (see DEPLOYMENT.md).`
          : msg,
      },
      { status: 503 },
    );
  }
}
