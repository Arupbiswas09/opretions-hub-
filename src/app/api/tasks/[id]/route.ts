import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../lib/supabase/admin';
import { getHubOrgOr401 } from '../../../lib/hub/org';
import { invalidateListCache } from '../../../lib/hub/list-cache';
import { syncRecord, deleteRecord } from '../../../lib/search/syncToIndex';
import { parseTags } from '../../../lib/hub/parse';
import { assertNotViewer } from '../../../lib/hub/rbac';

const TASK_STATUSES = new Set(['todo', 'in-progress', 'review', 'done']);

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const org = await getHubOrgOr401();
  if (org instanceof NextResponse) return org;

  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from('tasks')
    .select('*, projects(name)')
    .eq('id', id)
    .eq('org_id', org.orgId)
    .maybeSingle();

  if (error) {
    console.error('[GET /api/tasks/[id]]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  let assignee_name: string | null = null;
  if (data.assignee_id) {
    const { data: p } = await admin.from('profiles').select('display_name').eq('id', data.assignee_id).maybeSingle();
    assignee_name = p?.display_name ?? null;
  }
  const pr = data.projects as { name?: string } | null;
  const { projects: _p, ...rest } = data as Record<string, unknown>;
  return NextResponse.json({
    data: { ...rest, project_name: pr?.name ?? null, assignee_name },
  });
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
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

  const patch: Record<string, unknown> = {};
  if (body.title != null) {
    const t = String(body.title).trim();
    if (!t) return NextResponse.json({ error: 'title cannot be empty' }, { status: 400 });
    patch.title = t;
  }
  if (body.status != null) {
    const st = String(body.status).trim();
    if (!TASK_STATUSES.has(st)) return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    patch.status = st;
  }
  if (body.priority != null) {
    const pr = String(body.priority).toLowerCase();
    if (!['low', 'medium', 'high', 'urgent'].includes(pr)) {
      return NextResponse.json({ error: 'Invalid priority' }, { status: 400 });
    }
    patch.priority = pr;
  }
  if (body.description !== undefined) patch.description = body.description != null ? String(body.description) : null;
  if (body.project_id !== undefined) {
    patch.project_id = typeof body.project_id === 'string' && body.project_id ? body.project_id : null;
  }
  if (body.assignee_id !== undefined) {
    patch.assignee_id = typeof body.assignee_id === 'string' && body.assignee_id ? body.assignee_id : null;
  }
  if (body.due_date !== undefined) patch.due_date = body.due_date != null ? String(body.due_date) : null;
  if (body.tags !== undefined) {
    patch.tags =
      Array.isArray(body.tags) && body.tags.every((t) => typeof t === 'string')
        ? body.tags
        : parseTags(typeof body.tags === 'string' ? body.tags : '');
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: 'No valid fields' }, { status: 400 });
  }

  const { data, error } = await admin
    .from('tasks')
    .update(patch)
    .eq('id', id)
    .eq('org_id', org.orgId)
    .select('*')
    .maybeSingle();

  if (error) {
    console.error('[PATCH /api/tasks/[id]]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await invalidateListCache(org.orgId, 'tasks');
  void syncRecord('tasks', data as Record<string, unknown>);

  return NextResponse.json({ data });
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const org = await getHubOrgOr401();
  if (org instanceof NextResponse) return org;

  const admin = getSupabaseAdmin();
  const denied = await assertNotViewer(admin, org.userId);
  if (denied) return denied;

  const { error } = await admin.from('tasks').delete().eq('id', id).eq('org_id', org.orgId);

  if (error) {
    console.error('[DELETE /api/tasks/[id]]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await invalidateListCache(org.orgId, 'tasks');
  void deleteRecord('tasks', id);

  return NextResponse.json({ ok: true });
}
