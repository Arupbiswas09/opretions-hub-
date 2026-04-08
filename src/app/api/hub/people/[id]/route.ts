import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../lib/supabase/admin';
import { getHubOrgOr401 } from '../../../../lib/hub/org';
import { invalidateListCache } from '../../../../lib/hub/list-cache';
import { assertNotViewer } from '../../../../lib/hub/rbac';

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const org = await getHubOrgOr401();
  if (org instanceof NextResponse) return org;

  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from('people')
    .select('*')
    .eq('id', id)
    .eq('org_id', org.orgId)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ data });
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const org = await getHubOrgOr401();
  if (org instanceof NextResponse) return org;

  const admin = getSupabaseAdmin();
  const denied = await assertNotViewer(admin, org.userId);
  if (denied) return denied;

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const allowedFields = ['full_name', 'email', 'phone', 'department', 'role', 'employment_type', 'status', 'start_date', 'manager_id'];
  const patch: Record<string, unknown> = {};
  for (const f of allowedFields) {
    if (body[f] !== undefined) patch[f] = body[f];
  }
  if (Object.keys(patch).length === 0) return NextResponse.json({ error: 'No valid fields' }, { status: 400 });

  const { data, error } = await admin.from('people').update(patch).eq('id', id).eq('org_id', org.orgId).select('*').maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await invalidateListCache(org.orgId, 'people');
  return NextResponse.json({ data });
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const org = await getHubOrgOr401();
  if (org instanceof NextResponse) return org;

  const admin = getSupabaseAdmin();
  const denied = await assertNotViewer(admin, org.userId);
  if (denied) return denied;

  const { error } = await admin.from('people').delete().eq('id', id).eq('org_id', org.orgId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await invalidateListCache(org.orgId, 'people');
  return NextResponse.json({ ok: true });
}
