import { NextRequest, NextResponse } from 'next/server';

const API   = process.env.UNIPILE_API_URL!;
const TOKEN = process.env.UNIPILE_ACCESS_TOKEN!;
const DSN   = process.env.UNIPILE_DSN!;            // e.g. api36.unipile.com:16649
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Map our provider slugs → Unipile provider identifiers
const PROVIDER_MAP: Record<string, string> = {
  linkedin : 'LINKEDIN',
  whatsapp : 'WHATSAPP',
  gmail    : 'GOOGLE',
};

export async function POST(req: NextRequest) {
  try {
    const { provider } = await req.json();
    const unipileProvider = PROVIDER_MAP[provider];
    if (!unipileProvider) {
      return NextResponse.json({ error: `Unknown provider: ${provider}` }, { status: 400 });
    }

    // Expires in 1 hour from now
    const expiresOn = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    // IMPORTANT: api_url must be the bare DSN base URL (no /api/v1 suffix).
    // Unipile appends its own paths internally when building the OAuth redirect URI.
    const body = {
      type                : 'create',
      providers           : [unipileProvider],
      expiresOn,
      api_url             : `https://${DSN}`,
      name                : 'operations-hub-user',
      notify_url          : `${APP_URL}/api/unipile/webhook`,
      success_redirect_url: `${APP_URL}/hub/communication?connected=${provider}`,
      failure_redirect_url: `${APP_URL}/hub/communication?error=connect_failed`,
    };

    const res = await fetch(`${API}/hosted/accounts/link`, {
      method : 'POST',
      headers: {
        'X-API-KEY'   : TOKEN,
        accept        : 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('[Unipile connect error]', data);
      return NextResponse.json({ error: JSON.stringify(data) }, { status: res.status });
    }

    const url = data.url || data.link || data.hosted_url || data.auth_url;
    if (!url) {
      return NextResponse.json({ error: 'No URL returned from Unipile', raw: data }, { status: 500 });
    }

    return NextResponse.json({ url });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
