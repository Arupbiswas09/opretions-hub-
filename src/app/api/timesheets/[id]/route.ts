import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../lib/supabase/admin';
import { getHubOrgOr401 } from '../../../lib/hub/org';
import { invalidateListCache } from '../../../lib/hub/list-cache';
import { assertNotViewer } from '../../../lib/hub/rbac';

const TIMESHEET_STATUSES = new Set(['draft', 'submitted', 'approved', 'rejected']);

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const org = await getHubOrgOr401();
  if (org instanceof NextResponse) return org;

  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from('timesheets')
    .select('*, projects(name)')
    .eq('id', id)
    .eq('org_id', org.orgId)
    .maybeSingle();

  if (error) {
    console.error('[GET /api/timesheets/[id]]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Resolve person name
  let person_name: string | null = null;
  const row = data as Record<string, unknown>;
  if (row.person_id && typeof row.person_id === 'string') {
    const { data: p } = await admin.from('people').select('full_name').eq('id', row.person_id).maybeSingle();
    person_name = (p as any)?.full_name ?? null;
    if (!person_name) {
      const { data: pr } = await admin.from('profiles').select('display_name').eq('id', row.person_id as string).maybeSingle();
      person_name = (pr as any)?.display_name ?? null;
    }
  }

  const projects = row.projects as { name?: string } | null;
  const { projects: _p, ...rest } = row;

  return NextResponse.json({
    data: { ...rest, project_name: projects?.name ?? null, person_name },
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

  if (body.status != null) {
    const st = String(body.status).trim();
    if (!TIMESHEET_STATUSES.has(st)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    patch.status = st;

    // Auto-set submitted_at when submitting
    if (st === 'submitted' && !body.submitted_at) {
      patch.submitted_at = new Date().toISOString();
    }
  }

  if (body.submitted_at != null) patch.submitted_at = body.submitted_at;
  if (body.total_hours != null) patch.total_hours = Number(body.total_hours);
  if (body.notes !== undefined) patch.notes = body.notes;

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: 'No valid fields' }, { status: 400 });
  }

  const { data, error } = await admin
    .from('timesheets')
    .update(patch)
    .eq('id', id)
    .eq('org_id', org.orgId)
    .select('*')
    .maybeSingle();

  if (error) {
    console.error('[PATCH /api/timesheets/[id]]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await invalidateListCache(org.orgId, 'timesheets');

  return NextResponse.json({ data });
}
