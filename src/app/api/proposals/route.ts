import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../lib/supabase/admin';
import { getHubOrgOr401 } from '../../lib/hub/org';
import { invalidateListCache } from '../../lib/hub/list-cache';
import { parseMoney } from '../../lib/hub/parse';
import { redisGet, redisSet, HUB_KEYS } from '../../lib/redis';
import { listFiltersHash } from '../../lib/hub/list-query';

export async function GET(req: NextRequest) {
  const org = await getHubOrgOr401();
  if (org instanceof NextResponse) return org;

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 50));
  const status = searchParams.get('status')?.trim() || '';
  const sortRaw = searchParams.get('sort') || 'created_at';
  const ascending = searchParams.get('dir') === 'asc';
  const sortCol = ['created_at', 'updated_at', 'title', 'status', 'value'].includes(sortRaw)
    ? sortRaw
    : 'created_at';

  const fh = listFiltersHash({ page, limit, status, sortCol, ascending });
  const cacheKey = `${HUB_KEYS.list}:proposals:${org.orgId}:${fh}`;
  const cached = await redisGet<Record<string, unknown>>(cacheKey);
  if (cached) return NextResponse.json({ ...cached, cached: true });

  const admin = getSupabaseAdmin();
  let q = admin
    .from('proposals')
    .select('*, deals(title, clients(name))', { count: 'exact' })
    .eq('org_id', org.orgId);
  if (status) q = q.eq('status', status);

  const from = (page - 1) * limit;
  const { data, error, count } = await q.order(sortCol, { ascending }).range(from, from + limit - 1);

  if (error) {
    console.error('[GET /api/proposals]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data ?? []).map((row: Record<string, unknown>) => {
    const deals = row.deals as { title?: string; clients?: { name?: string } | null } | null;
    const client_name = deals?.clients?.name ?? null;
    const { deals: _d, ...rest } = row;
    return { ...rest, client_name };
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
    return NextResponse.json({ error: 'Proposal title is required' }, { status: 400 });
  }

  const value = parseMoney(typeof body.value === 'string' ? body.value : body.value != null ? String(body.value) : null);

  const admin = getSupabaseAdmin();
  const row = {
    org_id: org.orgId,
    deal_id: typeof body.deal_id === 'string' && body.deal_id ? body.deal_id : null,
    title,
    status: String(body.status ?? 'draft').trim() || 'draft',
    value,
    sent_date: body.sent_date != null ? String(body.sent_date) : null,
  };

  const { data, error } = await admin.from('proposals').insert(row).select('*').single();
  if (error) {
    console.error('[POST /api/proposals]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await invalidateListCache(org.orgId, 'proposals');
  return NextResponse.json({ data });
}

