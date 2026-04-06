import { NextRequest, NextResponse } from 'next/server';

const API = process.env.UNIPILE_API_URL!;
const TOKEN = process.env.UNIPILE_ACCESS_TOKEN!;

const PAGE_LIMIT = 250;
/** Safety cap: 20 pages × 250 = 5000 messages max per chat */
const MAX_PAGES = 20;

export async function GET(req: NextRequest) {
  const sp = new URL(req.url).searchParams;
  const chat_id = sp.get('chat_id');
  const limit = sp.get('limit') || '30';
  const fetchAll = sp.get('fetch_all') === '1' || sp.get('fetch_all') === 'true';

  if (!chat_id) return NextResponse.json({ error: 'chat_id required' }, { status: 400 });

  try {
    if (fetchAll) {
      const all: unknown[] = [];
      let cursor: string | null | undefined;
      for (let page = 0; page < MAX_PAGES; page++) {
        const url = new URL(`${API}/chats/${chat_id}/messages`);
        url.searchParams.set('limit', String(PAGE_LIMIT));
        if (cursor) url.searchParams.set('cursor', cursor);

        const res = await fetch(url.toString(), {
          headers: { 'X-API-KEY': TOKEN, accept: 'application/json' },
          cache: 'no-store',
        });
        const data = (await res.json()) as {
          items?: unknown[];
          cursor?: string | null;
          object?: string;
        };
        if (!res.ok) return NextResponse.json({ error: data }, { status: res.status });

        const batch = Array.isArray(data.items) ? data.items : [];
        all.push(...batch);
        cursor = data.cursor;
        if (!cursor || batch.length === 0) break;
      }
      // API returns newest-first; chronological order for reading & summarization
      all.reverse();
      return NextResponse.json({
        object: 'MessageList',
        items: all,
        total_fetched: all.length,
      });
    }

    const url = new URL(`${API}/chats/${chat_id}/messages`);
    url.searchParams.set('limit', limit);
    const res = await fetch(url.toString(), {
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
