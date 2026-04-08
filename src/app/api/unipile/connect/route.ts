import { NextRequest, NextResponse } from 'next/server';
import { getUnipileConnectEnv, UNIPILE_CONNECT_NOT_CONFIGURED } from '../../../lib/unipile-env';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Map our provider slugs → Unipile provider identifiers
const PROVIDER_MAP: Record<string, string> = {
  linkedin : 'LINKEDIN',
  whatsapp : 'WHATSAPP',
  gmail    : 'GOOGLE',
};

export async function POST(req: NextRequest) {
  try {
    const env = getUnipileConnectEnv();
    if (!env) {
      return NextResponse.json({ error: UNIPILE_CONNECT_NOT_CONFIGURED, code: 'unipile_not_configured' }, { status: 503 });
    }
    const { api: API, token: TOKEN, dsn: DSN } = env;

    let reqBody: { provider?: string };
    try {
      reqBody = await req.json();
    } catch {
      return NextResponse.json({ error: 'Expected JSON body with { "provider": "linkedin" | "whatsapp" | "gmail" }' }, { status: 400 });
    }
    const { provider } = reqBody;
    const unipileProvider = provider ? PROVIDER_MAP[provider] : undefined;
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

    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;

    if (!res.ok) {
      console.error('[Unipile connect error]', res.status, data);
      return NextResponse.json(
        { error: typeof data.detail === 'string' ? data.detail : JSON.stringify(data.error ?? data) },
        { status: res.status },
      );
    }

    const url = data.url || data.link || data.hosted_url || data.auth_url;
    if (typeof url !== 'string' || !url) {
      return NextResponse.json({ error: 'No URL returned from Unipile', raw: data }, { status: 502 });
    }

    return NextResponse.json({ url });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Connect failed';
    console.error('[Unipile connect]', e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
