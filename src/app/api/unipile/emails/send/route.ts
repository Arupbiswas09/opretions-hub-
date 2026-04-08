import { NextRequest, NextResponse } from 'next/server';
import { getUnipileCreds, UNIPILE_NOT_CONFIGURED } from '../../../../lib/unipile-env';

/**
 * POST /api/unipile/emails/send
 * Send or reply to an email via Unipile's API.
 * Body: { account_id, to, cc?, bcc?, subject, body, in_reply_to? }
 */
export async function POST(req: NextRequest) {
  try {
    const creds = getUnipileCreds();
    if (!creds) {
      return NextResponse.json({ error: UNIPILE_NOT_CONFIGURED }, { status: 503 });
    }
    const { api: API, token: TOKEN } = creds;

    const payload = await req.json();
    const { account_id, to, cc, bcc, subject, body, in_reply_to } = payload;

    if (!account_id || !to || !body) {
      return NextResponse.json(
        { error: 'account_id, to, and body are required' },
        { status: 400 },
      );
    }

    // Unipile email send endpoint
    const url = `${API.replace(/\/$/, '')}/emails`;

    const emailPayload: Record<string, unknown> = {
      account_id,
      body,
      subject: subject || '(no subject)',
      to: Array.isArray(to) ? to : [{ identifier: to, display_name: to }],
    };

    if (cc) {
      emailPayload.cc = Array.isArray(cc)
        ? cc
        : [{ identifier: cc, display_name: cc }];
    }
    if (bcc) {
      emailPayload.bcc = Array.isArray(bcc)
        ? bcc
        : [{ identifier: bcc, display_name: bcc }];
    }
    if (in_reply_to) {
      emailPayload.in_reply_to = in_reply_to;
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'X-API-KEY': TOKEN,
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error('[Unipile email-send] error', res.status, data);
      return NextResponse.json(
        { error: typeof data.detail === 'string' ? data.detail : JSON.stringify(data) },
        { status: res.status },
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Email send failed';
    console.error('[Unipile email-send]', e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
