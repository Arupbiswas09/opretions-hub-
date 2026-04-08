import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../lib/supabase/admin';
import { getHubOrgOr401 } from '../../lib/hub/org';
import { invalidateListCache } from '../../lib/hub/list-cache';
import { redisGet, redisSet, HUB_KEYS } from '../../lib/redis';
import { listFiltersHash } from '../../lib/hub/list-query';
import { assertNotViewer } from '../../lib/hub/rbac';

const STATUSES = new Set(['pending', 'approved', 'rejected', 'needs-info']);

export async function GET(req: NextRequest) {
  const org = await getHubOrgOr401();
  if (org instanceof NextResponse) return org;

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 50));
  const status = searchParams.get('status')?.trim() || '';
  const mine = searchParams.get('mine') === '1';
  const sortRaw = searchParams.get('sort') || 'created_at';
  const ascending = searchParams.get('dir') === 'asc';
  const sortCol = ['created_at', 'updated_at', 'due_date'].includes(sortRaw) ? sortRaw : 'created_at';

  const fh = listFiltersHash({ page, limit, status, mine, sortCol, ascending });
  const cacheKey = `${HUB_KEYS.list}:approvals:${org.orgId}:${fh}`;
  const cached = await redisGet<Record<string, unknown>>(cacheKey);
  if (cached) return NextResponse.json({ ...cached, cached: true });

  const admin = getSupabaseAdmin();
  let q = admin.from('approvals').select('*', { count: 'exact' }).eq('org_id', org.orgId);
  if (status) q = q.eq('status', status);
  if (mine) q = q.eq('requester_id', org.userId);

  const from = (page - 1) * limit;
  const { data, error, count } = await q.order(sortCol, { ascending }).range(from, from + limit - 1);

  if (error) {
    console.error('[GET /api/approvals]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = data ?? [];
  const reqIds = [...new Set(rows.map((r: { requester_id?: string }) => r.requester_id).filter(Boolean))] as string[];
  let nameById: Record<string, string> = {};
  if (reqIds.length) {
    const { data: profs } = await admin.from('profiles').select('id, display_name').in('id', reqIds);
    nameById = Object.fromEntries((profs ?? []).map((p) => [p.id, p.display_name || 'Member']));
  }

  const enriched = rows.map((r: Record<string, unknown>) => {
    const rid = r.requester_id as string | null;
    const payload = (r.payload as Record<string, unknown>) || {};
    const title = typeof payload.title === 'string' ? payload.title : `${String(r.type)} request`;
    return {
      ...r,
      display_title: title,
      requester_name: rid ? nameById[rid] ?? null : null,
    };
  });

  const payload = { data: enriched, total: count ?? 0, page, limit };
  await redisSet(cacheKey, payload, 60);
  return NextResponse.json(payload);
}

export async function POST(req: NextRequest) {
  const org = await getHubOrgOr401();
  if (org instanceof NextResponse) return org;

  const admin = getSupabaseAdmin();
  const denied = await assertNotViewer(admin, org.userId);
  if (denied) return denied;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const type = String(body.type ?? 'request').trim() || 'request';
  const payload =
    body.payload && typeof body.payload === 'object' && body.payload !== null
      ? (body.payload as Record<string, unknown>)
      : {};
  if (!payload.title && body.title) payload.title = String(body.title);

  const row = {
    org_id: org.orgId,
    type,
    requester_id: org.userId,
    status: 'pending',
    payload,
    amount: body.amount != null ? Number(body.amount) : null,
    due_date: body.due_date != null ? String(body.due_date) : null,
  };

  const { data, error } = await admin.from('approvals').insert(row).select('*').single();
  if (error) {
    console.error('[POST /api/approvals]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await invalidateListCache(org.orgId, 'approvals');
  return NextResponse.json({ data });
}
