import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../lib/supabase/admin';
import { getHubOrgOr401 } from '../../lib/hub/org';
import { invalidateListCache } from '../../lib/hub/list-cache';
import { syncRecord } from '../../lib/search/syncToIndex';
import { redisGet, redisSet, HUB_KEYS } from '../../lib/redis';
import { listFiltersHash } from '../../lib/hub/list-query';

export async function GET(req: NextRequest) {
  const org = await getHubOrgOr401();
  if (org instanceof NextResponse) return org;

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const limit = Math.min(200, Math.max(1, Number(searchParams.get('limit')) || 50));
  const qSearch = searchParams.get('q')?.trim() || '';
  const sortRaw = searchParams.get('sort') || 'name';
  const ascending = searchParams.get('dir') === 'asc';
  const sortCol = ['created_at', 'updated_at', 'name'].includes(sortRaw) ? sortRaw : 'name';

  const fh = listFiltersHash({ page, limit, qSearch, sortCol, ascending });
  const cacheKey = `${HUB_KEYS.list}:clients:${org.orgId}:${fh}`;
  const cached = await redisGet<Record<string, unknown>>(cacheKey);
  if (cached) return NextResponse.json({ ...cached, cached: true });

  const admin = getSupabaseAdmin();
  let q = admin.from('clients').select('*', { count: 'exact' }).eq('org_id', org.orgId);
  if (qSearch) q = q.ilike('name', `%${qSearch}%`);

  const from = (page - 1) * limit;
  const { data, error, count } = await q.order(sortCol, { ascending }).range(from, from + limit - 1);

  if (error) {
    console.error('[GET /api/clients]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const payload = { data: data ?? [], total: count ?? 0, page, limit };
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

  const name = String(body.name ?? '').trim();
  if (!name) {
    return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
  }

  const admin = getSupabaseAdmin();
  const billingRaw = body.billing_address != null ? String(body.billing_address).trim() : '';
  const allowedStatus = ['Active', 'Onboarding', 'Inactive', 'Archived'] as const;
  const statusRaw = String(body.status ?? 'Active').trim();
  const status = allowedStatus.includes(statusRaw as (typeof allowedStatus)[number])
    ? statusRaw
    : 'Active';
  const industry =
    body.industry != null && String(body.industry).trim() !== ''
      ? String(body.industry).trim()
      : '';

  const row = {
    org_id: org.orgId,
    name,
    status,
    industry,
    billing_address: billingRaw ? { raw: billingRaw } : null,
    payment_terms: body.payment_terms != null ? String(body.payment_terms) : null,
    account_manager_id: typeof body.account_manager_id === 'string' ? body.account_manager_id : null,
  };

  const { data, error } = await admin.from('clients').insert(row).select('*').single();
  if (error) {
    console.error('[POST /api/clients]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await invalidateListCache(org.orgId, 'clients');
  void syncRecord('clients', data as Record<string, unknown>);

  return NextResponse.json({ data });
}
