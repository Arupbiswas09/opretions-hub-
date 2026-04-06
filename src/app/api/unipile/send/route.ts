import { NextRequest, NextResponse } from 'next/server';

const API = process.env.UNIPILE_API_URL!;
const TOKEN = process.env.UNIPILE_ACCESS_TOKEN!;

/** Unipile expects multipart/form-data for POST /chats/{id}/messages (not JSON). */
export async function POST(req: NextRequest) {
  try {
    const { chat_id, text, account_id } = await req.json();
    if (!chat_id || !text) return NextResponse.json({ error: 'chat_id and text required' }, { status: 400 });

    const form = new FormData();
    form.append('text', String(text));
    if (account_id) form.append('account_id', String(account_id));

    const res = await fetch(`${API}/chats/${chat_id}/messages`, {
      method: 'POST',
      headers: {
        'X-API-KEY': TOKEN,
        accept: 'application/json',
      },
      body: form,
    });
    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: data }, { status: res.status });
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
