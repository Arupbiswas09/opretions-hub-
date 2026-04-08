/**
 * Central Ollama config — works for local dev or any remote Ollama-compatible URL.
 *
 * Deploy: set OLLAMA_URL to your server (e.g. https://ollama.yourdomain.com).
 * Do not use localhost from Vercel — the server runs in the cloud.
 *
 * Optional OLLAMA_API_KEY if you put Ollama behind a reverse proxy with Bearer auth.
 */

export function getOllamaBaseUrl(): string {
  const raw = process.env.OLLAMA_URL?.trim();
  const base = raw || 'http://127.0.0.1:11434';
  return base.replace(/\/$/, '');
}

/** True when `OLLAMA_URL` is set — health and pings use Ollama; otherwise health checks OpenAI. */
export function isOllamaConfigured(): boolean {
  return Boolean(process.env.OLLAMA_URL?.trim());
}

/**
 * Tag expected on the Ollama server for `/api/ai/health` when Ollama is enabled.
 * Separate from `AI_MODEL` (GPT/OpenAI) so both can coexist.
 */
export function getOllamaModel(): string {
  return (process.env.OLLAMA_MODEL || 'llama3.2:3b').trim();
}

export function ollamaHeaders(extra?: Record<string, string>): HeadersInit {
  const h: Record<string, string> = { accept: 'application/json', ...extra };
  const key = process.env.OLLAMA_API_KEY?.trim();
  if (key) h.Authorization = `Bearer ${key}`;
  return h;
}

/** GET/POST to Ollama; sets Content-Type only when sending a body */
export async function ollamaFetch(path: string, init?: RequestInit): Promise<Response> {
  const url = `${getOllamaBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`;
  const headers = new Headers(ollamaHeaders());
  if (init?.body) headers.set('Content-Type', 'application/json');
  if (init?.headers) {
    const extra = new Headers(init.headers);
    extra.forEach((v, k) => headers.set(k, v));
  }
  return fetch(url, {
    ...init,
    headers,
    cache: 'no-store',
  });
}
