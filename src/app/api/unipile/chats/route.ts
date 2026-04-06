import { NextRequest, NextResponse } from 'next/server';

const API = process.env.UNIPILE_API_URL!;
const TOKEN = process.env.UNIPILE_ACCESS_TOKEN!;

const PAGE_LIMIT = 100;
/** Merge cursor pages so long lists (e.g. WhatsApp) are not cut off after first page */
const MAX_PAGES = 15;

export async function GET(req: NextRequest) {
  const sp = new URL(req.url).searchParams;
  const account_id = sp.get('account_id') || '';
  const limit = sp.get('limit') || '50';
  const cursorParam = sp.get('cursor') || '';
  const fetchAll = sp.get('fetch_all') === '1' || sp.get('fetch_all') === 'true';

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
