import { NextRequest, NextResponse } from 'next/server';

const API = process.env.UNIPILE_API_URL!;
const TOKEN = process.env.UNIPILE_ACCESS_TOKEN!;

/** Proxy: GET /chats/{chat_id}/attendees — resolve message.sender_id → display name */
export async function GET(req: NextRequest) {
  const chat_id = req.nextUrl.searchParams.get('chat_id');
  if (!chat_id) return NextResponse.json({ error: 'chat_id required' }, { status: 400 });

  try {
    const res = await fetch(`${API}/chats/${encodeURIComponent(chat_id)}/attendees`, {
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
