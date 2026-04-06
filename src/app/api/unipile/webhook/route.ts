import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('[Unipile Webhook]', JSON.stringify(body, null, 2));
  } catch (_) {}
  return NextResponse.json({ ok: true });
}
