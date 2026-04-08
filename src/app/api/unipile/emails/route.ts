import { NextRequest, NextResponse } from 'next/server';
import { getUnipileCreds } from '../../../lib/unipile-env';

const PAGE_LIMIT = 100;
const MAX_PAGES = 20;
const REQUEST_TIMEOUT_MS = 15_000;

function withTimeout(ms: number) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, done: () => clearTimeout(id) };
}

export async function GET(req: NextRequest) {
  const creds = getUnipileCreds();
  if (!creds) {
    return NextResponse.json({ object: 'EmailList', items: [], unipile_configured: false });
  }
  const { api: API, token: TOKEN } = creds;

  const sp = req.nextUrl.searchParams;
  const account_id = sp.get('account_id');
  if (!account_id?.trim()) {
    return NextResponse.json({ error: 'account_id is required' }, { status: 400 });
  }

  const thread_id = sp.get('thread_id')?.trim() || '';
  const message_id = sp.get('message_id')?.trim() || '';
  const meta_only = sp.get('meta_only') === '1' || sp.get('meta_only') === 'true';
  const fetchAll = sp.get('fetch_all') === '1' || sp.get('fetch_all') === 'true';
  const limitParam = sp.get('limit') || String(PAGE_LIMIT);
  const cursorParam = sp.get('cursor')?.trim() || '';

  try {
    const all: unknown[] = [];
    let cursor: string | null | undefined = cursorParam || undefined;

    for (let page = 0; page < MAX_PAGES; page++) {
      // Unipile docs: listing emails is GET `/emails` (same base as `/accounts`).
      // Some hosted setups/documentation mention `/email/messages`; we keep a fallback for that variant.
      const endpointCandidates = ['/emails', '/email/messages'] as const;

      let data: { items?: unknown[]; cursor?: string | null } = {};
      let ok = false;
      let lastStatus = 500;
      let lastError: unknown = null;

      for (const path of endpointCandidates) {
        const url = new URL(`${API.replace(/\/$/, '')}${path}`);
        url.searchParams.set('account_id', account_id);
        url.searchParams.set(
          'limit',
          String(Math.min(250, Math.max(1, parseInt(limitParam, 10) || PAGE_LIMIT))),
        );
        if (meta_only) url.searchParams.set('meta_only', 'true');
        if (thread_id) url.searchParams.set('thread_id', thread_id);
        if (message_id) url.searchParams.set('message_id', message_id);
        if (cursor) url.searchParams.set('cursor', cursor);

        const t = withTimeout(REQUEST_TIMEOUT_MS);
        const res = await fetch(url.toString(), {
          headers: { 'X-API-KEY': TOKEN, accept: 'application/json' },
          cache: 'no-store',
          signal: t.signal,
        }).finally(t.done);

        lastStatus = res.status;
        const parsed = (await res.json().catch(() => ({}))) as any;
        if (res.ok) {
          data = parsed as { items?: unknown[]; cursor?: string | null };
          ok = true;
          break;
        }
        lastError = parsed;

        // If this path doesn't exist on this host, try the next candidate.
        const msg = typeof parsed?.message === 'string' ? parsed.message : '';
        const cannotGet = msg.startsWith('Cannot GET ');
        if (res.status === 404 && cannotGet) continue;

        // Otherwise propagate the upstream error immediately (e.g. account not found, auth error).
        return NextResponse.json({ error: parsed }, { status: res.status });
      }

      if (!ok) {
        return NextResponse.json({ error: lastError ?? data }, { status: lastStatus });
      }

      const batch = Array.isArray(data.items) ? data.items : [];
      all.push(...batch);
      cursor = data.cursor;

      if (!fetchAll) {
        return NextResponse.json({
          object: 'EmailList',
          items: all,
          cursor: cursor ?? null,
        });
      }

      if (message_id) break;
      if (!cursor || batch.length === 0) break;
    }

    return NextResponse.json({
      object: 'EmailList',
      items: all,
      total_fetched: all.length,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Email fetch failed';
    const isAbort =
      typeof e === 'object' &&
      e != null &&
      'name' in e &&
      (e as any).name === 'AbortError';
    return NextResponse.json(
      { error: isAbort ? 'Upstream timeout fetching emails' : message },
      { status: isAbort ? 504 : 500 },
    );
  }
}
