import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../lib/supabase/admin';
import { getHubOrgOr401 } from '../../lib/hub/org';
import { invalidateListCache } from '../../lib/hub/list-cache';
import { redisGet, redisSet, HUB_KEYS } from '../../lib/redis';
import { listFiltersHash } from '../../lib/hub/list-query';
import { assertNotViewer } from '../../lib/hub/rbac';

const ISSUE_TYPES = new Set(['bug', 'feature', 'task']);
const ISSUE_STATUSES = new Set(['open', 'in-progress', 'resolved', 'closed']);
const PRIORITIES = new Set(['low', 'medium', 'high', 'urgent']);

export async function GET(req: NextRequest) {
  const org = await getHubOrgOr401();
  if (org instanceof NextResponse) return org;

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 50));
  const status = searchParams.get('status')?.trim() || '';
  const type = searchParams.get('type')?.trim() || '';
  const sortRaw = searchParams.get('sort') || 'created_at';
  const ascending = searchParams.get('dir') === 'asc';
  const sortCol = ['created_at', 'updated_at', 'title', 'priority'].includes(sortRaw) ? sortRaw : 'created_at';

  const fh = listFiltersHash({ page, limit, status, type, sortCol, ascending });
  const cacheKey = `${HUB_KEYS.list}:issues:${org.orgId}:${fh}`;
  const cached = await redisGet<Record<string, unknown>>(cacheKey);
  if (cached) return NextResponse.json({ ...cached, cached: true });

  const admin = getSupabaseAdmin();
  let q = admin.from('issues').select('*, projects(name)', { count: 'exact' }).eq('org_id', org.orgId);
  if (status) q = q.eq('status', status);
  if (type) q = q.eq('type', type);

  const from = (page - 1) * limit;
  const { data, error, count } = await q.order(sortCol, { ascending }).range(from, from + limit - 1);

  if (error) {
    console.error('[GET /api/issues]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = data ?? [];
  const ids = [
    ...new Set(
      rows
        .flatMap((r: { assignee_id?: string; reporter_id?: string }) => [r.assignee_id, r.reporter_id])
        .filter(Boolean),
    ),
  ] as string[];
  let nameById: Record<string, string> = {};
  if (ids.length) {
    const { data: profs } = await admin.from('profiles').select('id, display_name').in('id', ids);
    nameById = Object.fromEntries((profs ?? []).map((p) => [p.id, p.display_name || 'Member']));
  }

  const enriched = rows.map((r: Record<string, unknown>) => {
    const pr = r.projects as { name?: string } | null;
    const aid = r.assignee_id as string | null;
    const rid = r.reporter_id as string | null;
    return {
      ...r,
      project_name: pr?.name ?? null,
      assignee_name: aid ? nameById[aid] ?? null : null,
      reporter_name: rid ? nameById[rid] ?? null : null,
      projects: undefined,
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

  const title = String(body.title ?? '').trim();
  if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 });

  const typeRaw = String(body.type ?? 'bug').toLowerCase();
  const type = ISSUE_TYPES.has(typeRaw) ? typeRaw : 'bug';
  const statusRaw = String(body.status ?? 'open').toLowerCase();
  const status = ISSUE_STATUSES.has(statusRaw) ? statusRaw : 'open';
  const prRaw = String(body.priority ?? 'medium').toLowerCase();
  const priority = PRIORITIES.has(prRaw) ? prRaw : 'medium';

  const row = {
    org_id: org.orgId,
    project_id: typeof body.project_id === 'string' && body.project_id ? body.project_id : null,
    title,
    description: body.description != null ? String(body.description) : null,
    type,
    status,
    priority,
    reporter_id: org.userId,
    assignee_id: typeof body.assignee_id === 'string' && body.assignee_id ? body.assignee_id : null,
  };

  const { data, error } = await admin.from('issues').insert(row).select('*').single();
  if (error) {
    console.error('[POST /api/issues]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await invalidateListCache(org.orgId, 'issues');
  return NextResponse.json({ data });
}
