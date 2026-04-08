import { NextRequest, NextResponse } from 'next/server';
import { getUnipileCreds, UNIPILE_NOT_CONFIGURED } from '../../../lib/unipile-env';

/** Unipile expects multipart/form-data for POST /chats/{id}/messages (not JSON). */
export async function POST(req: NextRequest) {
  try {
    const creds = getUnipileCreds();
    if (!creds) {
      return NextResponse.json({ error: UNIPILE_NOT_CONFIGURED }, { status: 503 });
    }
    const { api: API, token: TOKEN } = creds;

    const { chat_id, text, account_id } = await req.json();
    if (!chat_id || !text) return NextResponse.json({ error: 'chat_id and text required' }, { status: 400 });

    const form = new FormData();
    form.append('text', String(text));
    if (account_id) form.append('account_id', String(account_id));

    // Some Unipile providers expect account_id for auth/routing; include it in both body and query.
    const url = new URL(`${API}/chats/${encodeURIComponent(String(chat_id))}/messages`);
    if (account_id) url.searchParams.set('account_id', String(account_id));

    const res = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'X-API-KEY': TOKEN,
        accept: 'application/json',
      },
      body: form,
    });
    const data = await res.json();
    if (!res.ok) {
      console.error('[Unipile send] error', res.status, data);
      return NextResponse.json({ error: data, status: res.status }, { status: res.status });
    }
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
