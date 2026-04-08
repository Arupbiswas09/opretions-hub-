/**
 * OpenAI-compatible client config.
 *
 * Configure via environment variables:
 *   OPENAI_API_KEY   — secret token only (no "Bearer " — the SDK adds it)
 *   OPENAI_BASE_URL  — custom base URL (e.g. https://ai.atconglobal.com/v1)
 *   AI_MODEL         — model name (default: gpt-4.1-mini)
 */

import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const PLACEHOLDER_KEYS = new Set(
  ['your-api-key-here', 'your-api-key', 'sk-your-key-here', 'replace-me'].map((s) => s.toLowerCase()),
);

/** Trim, strip BOM/quotes, and a duplicated `Bearer ` prefix so the SDK never sends `Bearer Bearer …`. */
export function normalizeOpenAiApiKey(raw: string | undefined | null): string | undefined {
  if (raw == null) return undefined;
  let k = String(raw).trim();
  if (k.charCodeAt(0) === 0xfeff) k = k.slice(1).trim();
  if (!k) return undefined;
  if ((k.startsWith('"') && k.endsWith('"')) || (k.startsWith("'") && k.endsWith("'"))) {
    k = k.slice(1, -1).trim();
  }
  if (!k) return undefined;
  if (/^Bearer\s+/i.test(k)) {
    k = k.replace(/^Bearer\s+/i, '').trim();
  }
  if (!k) return undefined;
  if (PLACEHOLDER_KEYS.has(k.toLowerCase())) return undefined;
  return k;
}

export function isOpenAiConfigured(): boolean {
  return normalizeOpenAiApiKey(process.env.OPENAI_API_KEY) !== undefined;
}

/** Use from API routes when the key is missing so the UI gets a stable JSON shape and HTTP 503. */
export function openAiNotConfiguredResponse(): NextResponse {
  return NextResponse.json(
    {
      error:
        'OPENAI_API_KEY is not set. Create .env.local in the project root (same folder as package.json), add OPENAI_API_KEY=… with your real secret (no "Bearer " prefix), then restart the dev server. On Vercel: Project → Settings → Environment Variables → Redeploy.',
      code: 'OPENAI_NOT_CONFIGURED',
    },
    { status: 503 },
  );
}

export function getOpenAIClient(): OpenAI {
  const apiKey = normalizeOpenAiApiKey(process.env.OPENAI_API_KEY);
  if (!apiKey) {
    throw new Error(
      'OPENAI_API_KEY is missing or empty. Set it for this environment (e.g. .env.local or Vercel). Use the raw token only — do not include "Bearer ".',
    );
  }
  return new OpenAI({
    apiKey,
    baseURL: (process.env.OPENAI_BASE_URL || 'https://ai.atconglobal.com/v1').replace(/\/$/, ''),
  });
}

export function getAiModel(): string {
  return (process.env.AI_MODEL || 'gpt-4.1-mini').trim();
}

/** Maps tone keys to OpenAI max_tokens limits */
export const TONE_MAX_TOKENS: Record<string, number> = {
  professional: 380,
  friendly: 340,
  concise: 140,
  detailed: 560,
};
