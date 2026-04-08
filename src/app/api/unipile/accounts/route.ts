import { NextResponse } from 'next/server';
import { getUnipileCreds } from '../../../lib/unipile-env';

export async function GET() {
  const creds = getUnipileCreds();
  if (!creds) {
    return NextResponse.json({ object: 'AccountList', items: [], unipile_configured: false });
  }
  const { api: API, token: TOKEN } = creds;

  try {
    const res = await fetch(`${API}/accounts`, {
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
