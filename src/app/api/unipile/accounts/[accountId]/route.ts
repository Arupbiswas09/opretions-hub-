import { NextRequest, NextResponse } from 'next/server';
import { getUnipileCreds } from '../../../../lib/unipile-env';

/**
 * Disconnect (remove) an account from Unipile.
 * This enables "Disconnect" UX in Communication without requiring Unipile dashboard access.
 */
export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ accountId: string }> }) {
  try {
    const creds = getUnipileCreds();
    if (!creds) {
      return NextResponse.json({ ok: true, skipped: true, reason: 'unipile_not_configured' });
    }
    const { api: API, token: TOKEN } = creds;

    const { accountId } = await ctx.params;
    if (!accountId) return NextResponse.json({ error: 'accountId is required' }, { status: 400 });

    const url = `${API.replace(/\/$/, '')}/accounts/${encodeURIComponent(accountId)}`;
    const res = await fetch(url, {
      method: 'DELETE',
      headers: { 'X-API-KEY': TOKEN, accept: 'application/json' },
    });

    const data = await res.json().catch(() => ({}));
    // Idempotent: Unipile returns 404 if the account is already removed — treat as success for UX.
    if (res.status === 404) {
      return NextResponse.json({ ok: true, alreadyRemoved: true, detail: data });
    }
    if (!res.ok) {
      console.error('[Unipile DELETE account]', res.status, url, data);
      return NextResponse.json({ error: data }, { status: res.status });
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

