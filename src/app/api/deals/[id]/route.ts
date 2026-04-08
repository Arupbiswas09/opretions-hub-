import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../lib/supabase/admin';
import { getHubOrgOr401 } from '../../../lib/hub/org';
import { invalidateListCache } from '../../../lib/hub/list-cache';
import { syncRecord, deleteRecord } from '../../../lib/search/syncToIndex';
import { parseMoney, slugStage } from '../../../lib/hub/parse';
import { invalidateAllSalesKpis } from '../../../lib/hub/kpi-cache';

const STAGES = new Set(['lead', 'qualified', 'proposal_sent', 'negotiation', 'won', 'lost']);

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const org = await getHubOrgOr401();
  if (org instanceof NextResponse) return org;

  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from('deals')
    .select('*, clients(name)')
    .eq('id', id)
    .eq('org_id', org.orgId)
    .maybeSingle();

  if (error) {
    console.error('[GET /api/deals/[id]]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { clients: cl, ...rest } = data as Record<string, unknown> & {
    clients?: { name?: string } | null;
  };
  const client_name = cl?.name ?? null;
  return NextResponse.json({ data: { ...rest, client_name } });
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

  const admin = getSupabaseAdmin();
  const patch: Record<string, unknown> = {};

  if (body.title != null) {
    const t = String(body.title).trim();
    if (!t) return NextResponse.json({ error: 'title cannot be empty' }, { status: 400 });
    patch.title = t;
  }
  if (body.stage != null) {
    const st = slugStage(String(body.stage));
    if (!STAGES.has(st)) {
      return NextResponse.json({ error: 'Invalid stage' }, { status: 400 });
    }
    patch.stage = st;
  }
  if (body.value !== undefined) {
    patch.value = parseMoney(typeof body.value === 'string' ? body.value : String(body.value ?? ''));
  }
  if (body.client_id !== undefined) {
    patch.client_id =
      typeof body.client_id === 'string' && body.client_id ? body.client_id : null;
  }
  if (body.owner_id !== undefined) {
    patch.owner_id =
      typeof body.owner_id === 'string' && body.owner_id ? body.owner_id : null;
  }
  if (body.close_date !== undefined) {
    patch.close_date = body.close_date != null ? String(body.close_date) : null;
  }
  if (body.probability !== undefined) {
    patch.probability = body.probability != null ? Number(body.probability) : null;
  }
  if (body.description !== undefined) {
    patch.description = body.description != null ? String(body.description) : null;
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  const { data, error } = await admin
    .from('deals')
    .update(patch)
    .eq('id', id)
    .eq('org_id', org.orgId)
    .select('*')
    .maybeSingle();

  if (error) {
    console.error('[PATCH /api/deals/[id]]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  let clientName: string | null = null;
  if (data.client_id) {
    const { data: cl } = await admin
      .from('clients')
      .select('name')
      .eq('id', data.client_id)
      .eq('org_id', org.orgId)
      .maybeSingle();
    clientName = cl?.name ?? null;
  }

  const enriched = { ...data, client_name: clientName };
  await invalidateListCache(org.orgId, 'deals');
  await invalidateAllSalesKpis(org.orgId);
  void syncRecord('deals', enriched as Record<string, unknown>);

  return NextResponse.json({ data: enriched });
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const org = await getHubOrgOr401();
  if (org instanceof NextResponse) return org;

  const admin = getSupabaseAdmin();
  const { error } = await admin.from('deals').delete().eq('id', id).eq('org_id', org.orgId);

  if (error) {
    console.error('[DELETE /api/deals/[id]]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await invalidateListCache(org.orgId, 'deals');
  await invalidateAllSalesKpis(org.orgId);
  void deleteRecord('deals', id);

  return NextResponse.json({ ok: true });
}
