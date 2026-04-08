import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../lib/supabase/admin';
import { getHubOrgOr401 } from '../../lib/hub/org';
import { invalidateListCache } from '../../lib/hub/list-cache';
import { redisGet, redisSet, HUB_KEYS } from '../../lib/redis';
import { syncRecord } from '../../lib/search/syncToIndex';

export async function GET(req: NextRequest) {
  const org = await getHubOrgOr401();
  if (org instanceof NextResponse) return org;

  const { searchParams } = new URL(req.url);
  const limit = Math.min(200, Math.max(1, Number(searchParams.get('limit')) || 50));
  const status = searchParams.get('status')?.trim() || '';

  const cacheKey = `${HUB_KEYS.list}:jobs:${org.orgId}:${limit}:${status}`;
  const cached = await redisGet<{ data: unknown[]; total: number }>(cacheKey);
  if (cached) return NextResponse.json({ ...cached, cached: true });

  const admin = getSupabaseAdmin();
  let query = admin.from('jobs').select('*', { count: 'exact' }).eq('org_id', org.orgId);
  if (status) query = query.eq('status', status);

  const { data, error, count } = await query.order('created_at', { ascending: false }).limit(limit);
  if (error) {
    console.error('[GET /api/jobs]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  const payload = { data: data ?? [], total: count ?? 0 };
  await redisSet(cacheKey, payload, 60);
  return NextResponse.json(payload);
}

export async function POST(req: NextRequest) {
  const org = await getHubOrgOr401();
  if (org instanceof NextResponse) return org;

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const title = String(body.title ?? '').trim();
  if (!title) return NextResponse.json({ error: 'Job title is required' }, { status: 400 });

  const admin = getSupabaseAdmin();
  const { data, error } = await admin.from('jobs').insert({
    org_id: org.orgId,
    title,
    department: body.department != null ? String(body.department) : null,
    location: body.location != null ? String(body.location) : null,
    employment_type: body.employment_type != null ? String(body.employment_type) : null,
    status: String(body.status ?? 'open'),
    posted_date: body.posted_date != null ? String(body.posted_date) : null,
  }).select('*').single();

  if (error) {
    console.error('[POST /api/jobs]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  await invalidateListCache(org.orgId, 'jobs');
  syncRecord('jobs', data as Record<string, unknown>).catch(console.error);
  return NextResponse.json({ data });
}
