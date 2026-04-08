import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../lib/supabase/admin';
import { getHubOrgOr401 } from '../../lib/hub/org';
import { invalidateListCache } from '../../lib/hub/list-cache';
import { syncRecord } from '../../lib/search/syncToIndex';
import { parseMoney, slugStage } from '../../lib/hub/parse';
import { redisGet, redisSet, HUB_KEYS } from '../../lib/redis';
import { listFiltersHash } from '../../lib/hub/list-query';
import { invalidateAllSalesKpis } from '../../lib/hub/kpi-cache';

export async function GET(req: NextRequest) {
  const org = await getHubOrgOr401();
  if (org instanceof NextResponse) return org;

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 50));
  const stage = searchParams.get('stage')?.trim() || '';
  const sortRaw = searchParams.get('sort') || 'created_at';
  const ascending = searchParams.get('dir') === 'asc';
  const sortCol = ['created_at', 'updated_at', 'value', 'close_date', 'title'].includes(sortRaw)
    ? sortRaw
    : 'created_at';

  const fh = listFiltersHash({ page, limit, stage, sortCol, ascending });
  const cacheKey = `${HUB_KEYS.list}:deals:${org.orgId}:${fh}`;
  const cached = await redisGet<Record<string, unknown>>(cacheKey);
  if (cached) return NextResponse.json({ ...cached, cached: true });

  const admin = getSupabaseAdmin();
  let q = admin
    .from('deals')
    .select('*, clients(name)', { count: 'exact' })
    .eq('org_id', org.orgId);
  if (stage) q = q.eq('stage', stage);

  const from = (page - 1) * limit;
  const { data, error, count } = await q.order(sortCol, { ascending }).range(from, from + limit - 1);

  if (error) {
    console.error('[GET /api/deals]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data ?? []).map((row: Record<string, unknown>) => {
    const clients = row.clients as { name?: string } | null;
    return { ...row, client_name: clients?.name ?? null };
  });

  const payload = { data: rows, total: count ?? 0, page, limit };
  await redisSet(cacheKey, payload, 60);
  return NextResponse.json(payload);
}

export async function POST(req: NextRequest) {
  const org = await getHubOrgOr401();
  if (org instanceof NextResponse) return org;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const title = String(body.title ?? '').trim();
  if (!title) {
    return NextResponse.json({ error: 'Deal title is required' }, { status: 400 });
  }

  const admin = getSupabaseAdmin();
  const clientId = typeof body.client_id === 'string' && body.client_id ? body.client_id : null;
  let clientName: string | null = null;
  if (clientId) {
    const { data: cl } = await admin.from('clients').select('name').eq('id', clientId).eq('org_id', org.orgId).maybeSingle();
    clientName = cl?.name ?? null;
  }

  const value = parseMoney(typeof body.value === 'string' ? body.value : body.value != null ? String(body.value) : null);
  const stageRaw = String(body.stage ?? 'lead');
  const stage = slugStage(stageRaw) || 'lead';

  const row = {
    org_id: org.orgId,
    title,
    client_id: clientId,
    value,
    stage,
    owner_id: typeof body.owner_id === 'string' && body.owner_id ? body.owner_id : org.userId,
    close_date: body.close_date != null ? String(body.close_date) : null,
    probability: body.probability != null ? Number(body.probability) : null,
    description: body.description != null ? String(body.description) : null,
  };

  const { data, error } = await admin.from('deals').insert(row).select('*').single();
  if (error) {
    console.error('[POST /api/deals]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const enriched = { ...data, client_name: clientName };
  await invalidateListCache(org.orgId, 'deals');
  await invalidateAllSalesKpis(org.orgId);
  void syncRecord('deals', enriched as Record<string, unknown>);

  return NextResponse.json({ data });
}
