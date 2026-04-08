import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../lib/supabase/admin';
import { getHubOrgOr401 } from '../../lib/hub/org';
import { invalidateListCache } from '../../lib/hub/list-cache';
import { syncRecord } from '../../lib/search/syncToIndex';
import { parseTags } from '../../lib/hub/parse';
import { redisGet, redisSet, HUB_KEYS } from '../../lib/redis';
import { listFiltersHash } from '../../lib/hub/list-query';
import { assertNotViewer } from '../../lib/hub/rbac';

const TASK_STATUSES = new Set(['todo', 'in-progress', 'review', 'done']);

export async function GET(req: NextRequest) {
  const org = await getHubOrgOr401();
  if (org instanceof NextResponse) return org;

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 50));
  const status = searchParams.get('status')?.trim() || '';
  const projectId = searchParams.get('project_id')?.trim() || '';
  const assigneeId = searchParams.get('assignee_id')?.trim() || '';
  const sortRaw = searchParams.get('sort') || 'created_at';
  const ascending = searchParams.get('dir') === 'asc';
  const sortCol = ['created_at', 'updated_at', 'due_date', 'title', 'priority'].includes(sortRaw)
    ? sortRaw
    : 'created_at';

  const fh = listFiltersHash({ page, limit, status, projectId, assigneeId, sortCol, ascending });
  const cacheKey = `${HUB_KEYS.list}:tasks:${org.orgId}:${fh}`;
  const cached = await redisGet<Record<string, unknown>>(cacheKey);
  if (cached) return NextResponse.json({ ...cached, cached: true });

  const admin = getSupabaseAdmin();
  let q = admin.from('tasks').select('*, projects(name)', { count: 'exact' }).eq('org_id', org.orgId);
  if (status) q = q.eq('status', status);
  if (projectId) q = q.eq('project_id', projectId);
  if (assigneeId) q = q.eq('assignee_id', assigneeId);

  const from = (page - 1) * limit;
  const { data, error, count } = await q.order(sortCol, { ascending }).range(from, from + limit - 1);

  if (error) {
    console.error('[GET /api/tasks]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = data ?? [];
  const assigneeIds = [...new Set(rows.map((r: { assignee_id?: string }) => r.assignee_id).filter(Boolean))] as string[];
  let nameById: Record<string, string> = {};
  if (assigneeIds.length) {
    const { data: profs } = await admin.from('profiles').select('id, display_name').in('id', assigneeIds);
    nameById = Object.fromEntries((profs ?? []).map((p) => [p.id, p.display_name || 'Member']));
  }

  const enriched = rows.map((r: Record<string, unknown>) => {
    const pr = r.projects as { name?: string } | null;
    const aid = r.assignee_id as string | null;
    return {
      ...r,
      project_name: pr?.name ?? null,
      assignee_name: aid ? nameById[aid] ?? null : null,
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
  if (!title) {
    return NextResponse.json({ error: 'Task title is required' }, { status: 400 });
  }

  const tags =
    Array.isArray(body.tags) && body.tags.every((t) => typeof t === 'string')
      ? (body.tags as string[])
      : parseTags(typeof body.tags === 'string' ? body.tags : '');

  const priorityRaw = String(body.priority ?? 'medium').toLowerCase();
  const priority = ['low', 'medium', 'high', 'urgent'].includes(priorityRaw) ? priorityRaw : 'medium';

  const statusRaw = String(body.status ?? 'todo').trim() || 'todo';
  const status = TASK_STATUSES.has(statusRaw) ? statusRaw : 'todo';

  const row = {
    org_id: org.orgId,
    project_id: typeof body.project_id === 'string' && body.project_id ? body.project_id : null,
    title,
    description: body.description != null ? String(body.description) : null,
    assignee_id: typeof body.assignee_id === 'string' && body.assignee_id ? body.assignee_id : null,
    status,
    priority,
    due_date: body.due_date != null ? String(body.due_date) : null,
    tags,
  };

  const { data, error } = await admin.from('tasks').insert(row).select('*').single();
  if (error) {
    console.error('[POST /api/tasks]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await invalidateListCache(org.orgId, 'tasks');
  void syncRecord('tasks', data as Record<string, unknown>);

  return NextResponse.json({ data });
}
