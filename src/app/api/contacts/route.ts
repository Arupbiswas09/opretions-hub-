import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../lib/supabase/admin';
import { getHubOrgOr401 } from '../../lib/hub/org';
import { invalidateListCache } from '../../lib/hub/list-cache';
import { syncRecord } from '../../lib/search/syncToIndex';
import { parseTags } from '../../lib/hub/parse';
import { redisGet, redisSet, HUB_KEYS } from '../../lib/redis';
import { listFiltersHash } from '../../lib/hub/list-query';

export async function GET(req: NextRequest) {
  const org = await getHubOrgOr401();
  if (org instanceof NextResponse) return org;

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const limit = Math.min(200, Math.max(1, Number(searchParams.get('limit')) || 50));
  const company = searchParams.get('company')?.trim() || '';
  const tag = searchParams.get('tag')?.trim() || '';
  const sortRaw = searchParams.get('sort') || 'created_at';
  const ascending = searchParams.get('dir') === 'asc';
  const sortCol = ['created_at', 'updated_at', 'last_name', 'email', 'company'].includes(sortRaw)
    ? sortRaw
    : 'created_at';

  const fh = listFiltersHash({ page, limit, company, tag, sortCol, ascending });
  const cacheKey = `${HUB_KEYS.list}:contacts:${org.orgId}:${fh}`;
  const cached = await redisGet<Record<string, unknown>>(cacheKey);
  if (cached) return NextResponse.json({ ...cached, cached: true });

  const admin = getSupabaseAdmin();
  let q = admin
    .from('contacts')
    .select('*', { count: 'exact' })
    .eq('org_id', org.orgId)
    .is('deleted_at', null);

  if (company) q = q.ilike('company', `%${company}%`);
  if (tag) q = q.contains('tags', [tag]);

  const from = (page - 1) * limit;
  const { data, error, count } = await q.order(sortCol, { ascending }).range(from, from + limit - 1);

  if (error) {
    console.error('[GET /api/contacts]', error);
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

  const first = String(body.first_name ?? '').trim();
  const last = String(body.last_name ?? '').trim();
  const email = String(body.email ?? '').trim();
  if (!first || !last || !email) {
    return NextResponse.json({ error: 'First name, last name, and email are required' }, { status: 400 });
  }

  const tags =
    Array.isArray(body.tags) && body.tags.every((t) => typeof t === 'string')
      ? (body.tags as string[])
      : parseTags(typeof body.tags === 'string' ? body.tags : '');

  const admin = getSupabaseAdmin();
  const row = {
    org_id: org.orgId,
    first_name: first,
    last_name: last,
    email,
    phone: body.phone != null ? String(body.phone) : null,
    company: body.company != null ? String(body.company) : null,
    tags,
    notes: body.notes != null ? String(body.notes) : null,
  };

  const { data, error } = await admin.from('contacts').insert(row).select('*').single();
  if (error) {
    console.error('[POST /api/contacts]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await invalidateListCache(org.orgId, 'contacts');
  void syncRecord('contacts', data as Record<string, unknown>);

  return NextResponse.json({ data });
}
