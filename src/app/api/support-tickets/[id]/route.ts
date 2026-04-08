import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../lib/supabase/admin';
import { getHubOrgOr401 } from '../../../lib/hub/org';
import { invalidateListCache } from '../../../lib/hub/list-cache';
import { assertNotViewer } from '../../../lib/hub/rbac';

const PRIORITIES = new Set(['low', 'normal', 'high', 'urgent']);
const STATUSES = new Set(['open', 'in_progress', 'resolved', 'closed']);

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
  if (body.subject != null) {
    const s = String(body.subject).trim();
    if (!s) return NextResponse.json({ error: 'subject cannot be empty' }, { status: 400 });
    patch.subject = s;
  }
  if (body.description !== undefined) patch.description = body.description != null ? String(body.description) : null;
  if (body.priority != null) {
    const pr = String(body.priority).toLowerCase();
    if (!PRIORITIES.has(pr)) return NextResponse.json({ error: 'Invalid priority' }, { status: 400 });
    patch.priority = pr;
  }
  if (body.status != null) {
    const st = String(body.status).toLowerCase();
    if (!STATUSES.has(st)) return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    patch.status = st;
  }
  if (body.assigned_to_id !== undefined) {
    patch.assigned_to_id =
      typeof body.assigned_to_id === 'string' && body.assigned_to_id ? body.assigned_to_id : null;
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: 'No valid fields' }, { status: 400 });
  }

  const { data, error } = await admin
    .from('support_tickets')
    .update(patch)
    .eq('id', id)
    .eq('org_id', org.orgId)
    .select('*')
    .maybeSingle();

  if (error) {
    console.error('[PATCH /api/support-tickets/[id]]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await invalidateListCache(org.orgId, 'support_tickets');
  return NextResponse.json({ data });
}
