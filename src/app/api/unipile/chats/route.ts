import { NextRequest, NextResponse } from 'next/server';
import { getUnipileCreds } from '../../../lib/unipile-env';

const PAGE_LIMIT = 100;
/** Merge cursor pages so long lists (e.g. WhatsApp) are not cut off after first page */
const MAX_PAGES = 15;

export async function GET(req: NextRequest) {
  const sp = new URL(req.url).searchParams;
  const account_id = sp.get('account_id') || '';
  const limit = sp.get('limit') || '50';
  const cursorParam = sp.get('cursor') || '';
  const fetchAll = sp.get('fetch_all') === '1' || sp.get('fetch_all') === 'true';

  const creds = getUnipileCreds();
  if (!creds) {
    if (fetchAll) {
      return NextResponse.json({
        object: 'ChatList',
        items: [],
        total_fetched: 0,
        unipile_configured: false,
      });
    }
    return NextResponse.json({ object: 'ChatList', items: [], unipile_configured: false });
  }
  const { api: API, token: TOKEN } = creds;

  try {
    if (fetchAll) {
      const all: unknown[] = [];
      let cursor: string | null | undefined = cursorParam || undefined;
      for (let page = 0; page < MAX_PAGES; page++) {
        const url = new URL(`${API}/chats`);
        url.searchParams.set('limit', String(PAGE_LIMIT));
        if (account_id) url.searchParams.set('account_id', account_id);
        if (cursor) url.searchParams.set('cursor', cursor);

        const res = await fetch(url.toString(), {
          headers: { 'X-API-KEY': TOKEN, accept: 'application/json' },
          cache: 'no-store',
        });
        const data = (await res.json()) as { items?: unknown[]; cursor?: string | null; object?: string };
        if (!res.ok) return NextResponse.json({ error: data }, { status: res.status });

        const batch = Array.isArray(data.items) ? data.items : [];
        all.push(...batch);
        cursor = data.cursor;
        if (!cursor || batch.length === 0) break;
      }
      return NextResponse.json({
        object: 'ChatList',
        items: all,
        total_fetched: all.length,
      });
    }

    let url = `${API}/chats?limit=${limit}`;
    if (account_id) url += `&account_id=${account_id}`;
    if (cursorParam) url += `&cursor=${encodeURIComponent(cursorParam)}`;

    const res = await fetch(url, {
      headers: { 'X-API-KEY': TOKEN, accept: 'application/json' },
      cache: 'no-store',
    });
    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: data }, { status: res.status });
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
