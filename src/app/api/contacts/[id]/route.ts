import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../lib/supabase/admin';
import { getHubOrgOr401 } from '../../../lib/hub/org';
import { invalidateListCache } from '../../../lib/hub/list-cache';
import { syncRecord, deleteRecord } from '../../../lib/search/syncToIndex';
import { parseTags } from '../../../lib/hub/parse';
import { assertNotViewer } from '../../../lib/hub/rbac';

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
  if (body.first_name !== undefined) patch.first_name = String(body.first_name ?? '').trim();
  if (body.last_name !== undefined) patch.last_name = String(body.last_name ?? '').trim();
  if (body.email !== undefined) {
    const email = String(body.email ?? '').trim();
    if (!email) return NextResponse.json({ error: 'Email cannot be empty' }, { status: 400 });
    patch.email = email;
  }
  if (body.phone !== undefined) patch.phone = body.phone != null ? String(body.phone) : null;
  if (body.company !== undefined) patch.company = body.company != null ? String(body.company) : null;
  if (body.notes !== undefined) patch.notes = body.notes != null ? String(body.notes) : null;
  if (body.tags !== undefined) {
    patch.tags =
      Array.isArray(body.tags) && body.tags.every((t) => typeof t === 'string')
        ? (body.tags as string[])
        : parseTags(typeof body.tags === 'string' ? body.tags : '');
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: 'No valid fields' }, { status: 400 });
  }

  const { data, error } = await admin
    .from('contacts')
    .update(patch)
    .eq('id', id)
    .eq('org_id', org.orgId)
    .is('deleted_at', null)
    .select('*')
    .maybeSingle();

  if (error) {
    console.error('[PATCH /api/contacts/[id]]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await invalidateListCache(org.orgId, 'contacts');
  void syncRecord('contacts', data as Record<string, unknown>);

  return NextResponse.json({ data });
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const org = await getHubOrgOr401();
  if (org instanceof NextResponse) return org;

  const admin = getSupabaseAdmin();
  const denied = await assertNotViewer(admin, org.userId);
  if (denied) return denied;

  const now = new Date().toISOString();
  const { data, error } = await admin
    .from('contacts')
    .update({ deleted_at: now })
    .eq('id', id)
    .eq('org_id', org.orgId)
    .is('deleted_at', null)
    .select('id')
    .maybeSingle();

  if (error) {
    console.error('[DELETE /api/contacts/[id]]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await invalidateListCache(org.orgId, 'contacts');
  void deleteRecord('contacts', id);

  return NextResponse.json({ ok: true });
}
