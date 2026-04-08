import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../lib/supabase/admin';
import { getHubOrgOr401 } from '../../../lib/hub/org';
import { invalidateListCache } from '../../../lib/hub/list-cache';
import { parseMoney } from '../../../lib/hub/parse';

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const org = await getHubOrgOr401();
  if (org instanceof NextResponse) return org;

  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from('proposals')
    .select('*, deals(title, clients(name))')
    .eq('id', id)
    .eq('org_id', org.orgId)
    .maybeSingle();

  if (error) {
    console.error('[GET /api/proposals/[id]]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const deals = data.deals as { title?: string; clients?: { name?: string } | null } | null;
  const clientName = deals?.clients?.name ?? null;
  const { deals: _d, ...rest } = data as Record<string, unknown>;
  return NextResponse.json({
    data: { ...rest, client_name: clientName, deal_title: deals?.title ?? null },
  });
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const org = await getHubOrgOr401();
  if (org instanceof NextResponse) return org;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};
  if (body.title != null) {
    const t = String(body.title).trim();
    if (!t) return NextResponse.json({ error: 'title cannot be empty' }, { status: 400 });
    patch.title = t;
  }
  if (body.status != null) patch.status = String(body.status).trim() || 'draft';
  if (body.value !== undefined) {
    patch.value = parseMoney(typeof body.value === 'string' ? body.value : String(body.value ?? ''));
  }
  if (body.sent_date !== undefined) {
    patch.sent_date = body.sent_date != null ? String(body.sent_date) : null;
  }
  if (body.deal_id !== undefined) {
    patch.deal_id = typeof body.deal_id === 'string' && body.deal_id ? body.deal_id : null;
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from('proposals')
    .update(patch)
    .eq('id', id)
    .eq('org_id', org.orgId)
    .select('*')
    .maybeSingle();

  if (error) {
    console.error('[PATCH /api/proposals/[id]]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await invalidateListCache(org.orgId, 'proposals');
  return NextResponse.json({ data });
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const org = await getHubOrgOr401();
  if (org instanceof NextResponse) return org;

  const admin = getSupabaseAdmin();
  const { error } = await admin.from('proposals').delete().eq('id', id).eq('org_id', org.orgId);

  if (error) {
    console.error('[DELETE /api/proposals/[id]]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await invalidateListCache(org.orgId, 'proposals');
  return NextResponse.json({ ok: true });
}
