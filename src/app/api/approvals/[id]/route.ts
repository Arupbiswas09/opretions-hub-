import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../lib/supabase/admin';
import { getHubOrgOr401 } from '../../../lib/hub/org';
import { invalidateListCache } from '../../../lib/hub/list-cache';
import { redisTryLock, redisDel, HUB_KEYS } from '../../../lib/redis';

/** PATCH /api/approvals/[id] — Approve or reject an approval item.
 *  Body: { action: 'approved' | 'rejected', comment?: string }
 *  Uses Redis distributed lock to prevent double-approval race conditions.
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const org = await getHubOrgOr401();
  if (org instanceof NextResponse) return org;

  const { id } = await params;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const action = String(body.action ?? '').trim();
  if (!['approved', 'rejected'].includes(action)) {
    return NextResponse.json({ error: 'action must be approved or rejected' }, { status: 400 });
  }

  // Distributed lock to prevent race condition
  const lockKey = `${HUB_KEYS.lock}:approval:${id}`;
  const locked = await redisTryLock(lockKey, 10);
  if (!locked) {
    return NextResponse.json({ error: 'This approval is being processed by another user' }, { status: 409 });
  }

  try {
    const admin = getSupabaseAdmin();

    // Verify approval exists and belongs to org
    const { data: existing, error: fetchErr } = await admin.from('approvals')
      .select('id, status, org_id')
      .eq('id', id)
      .eq('org_id', org.orgId)
      .single();

    if (fetchErr || !existing) {
      return NextResponse.json({ error: 'Approval not found' }, { status: 404 });
    }
    if (existing.status !== 'pending') {
      return NextResponse.json({ error: `Approval already ${existing.status}` }, { status: 409 });
    }

    // Update status
    const { data, error } = await admin.from('approvals')
      .update({
        status: action,
        reviewed_by: org.userId,
        reviewed_at: new Date().toISOString(),
        comment: body.comment != null ? String(body.comment) : null,
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('[PATCH /api/approvals/[id]]', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await invalidateListCache(org.orgId, 'approvals');

    // Create notification for the requester
    try {
      await admin.from('notifications').insert({
        org_id: org.orgId,
        user_id: (data as Record<string, unknown>).requested_by ?? org.userId,
        title: `Approval ${action}`,
        body: `Your ${(data as Record<string, unknown>).type ?? 'request'} has been ${action}.`,
        entity_type: 'approvals',
        entity_id: id,
      });
    } catch (e) { console.error('[notification insert]', e); }

    return NextResponse.json({ data });
  } finally {
    await redisDel(lockKey);
  }
}
