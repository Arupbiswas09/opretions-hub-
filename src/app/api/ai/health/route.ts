import { NextResponse } from 'next/server';
import { getAiModel, getOllamaBaseUrl, ollamaFetch } from '../../../lib/ai-ollama';

/* ═══════════════════════════════════════════════════════════
   AI Health — GET /api/ai/health
═══════════════════════════════════════════════════════════ */

export const dynamic = 'force-dynamic';

export async function GET() {
  const MODEL = getAiModel();
  const base = getOllamaBaseUrl();

  try {
    const pingRes = await ollamaFetch('/api/tags', { method: 'GET' });

    if (!pingRes.ok) {
      return NextResponse.json({
        status: 'error',
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
      ollama: true,
      model: MODEL,
      ollama_url: base,
      available_models: models.map((m: { name: string }) => m.name),
      message: hasModel
        ? `AI ready — ${MODEL}`
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
