import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../lib/supabase/admin';

/** POST /api/forms/[id]/submit — Public form submission (no auth required).
 *  Body: { responses: Record<string, unknown> }
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id) return NextResponse.json({ error: 'Missing form ID' }, { status: 400 });

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const admin = getSupabaseAdmin();

  // Verify form exists and is active
  const { data: form, error: formErr } = await admin.from('forms')
    .select('id, org_id, status, fields')
    .eq('id', id)
    .single();

  if (formErr || !form) {
    return NextResponse.json({ error: 'Form not found' }, { status: 404 });
  }
  if ((form as Record<string, unknown>).status !== 'active') {
    return NextResponse.json({ error: 'This form is not currently accepting responses' }, { status: 403 });
  }

  const org_id = (form as Record<string, unknown>).org_id;
  const responses = body.responses ?? body;

  const { data, error } = await admin.from('form_responses').insert({
    form_id: id,
    org_id,
    respondent_email: body.email != null ? String(body.email) : null,
    responses,
  }).select('id').single();

  if (error) {
    console.error('[POST /api/forms/[id]/submit]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Allow CORS for public form endpoints
  return new NextResponse(JSON.stringify({ success: true, id: data?.id }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST',
    },
  });
}

/** OPTIONS — CORS preflight for public form endpoint */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}
