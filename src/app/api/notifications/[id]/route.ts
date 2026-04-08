import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../lib/supabase/admin';
import { getHubOrgOr401 } from '../../../lib/hub/org';
import { redisDel, HUB_KEYS } from '../../../lib/redis';

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const org = await getHubOrgOr401();
  if (org instanceof NextResponse) return org;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (body.read !== true) {
    return NextResponse.json({ error: 'Only { read: true } supported' }, { status: 400 });
  }

  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', id)
    .eq('org_id', org.orgId)
    .eq('user_id', org.userId)
    .select('*')
    .maybeSingle();

  if (error) {
    console.error('[PATCH /api/notifications/[id]]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await redisDel(`${HUB_KEYS.notif}:count:${org.userId}`, `${HUB_KEYS.notif}:count:${org.userId}:list`);

  return NextResponse.json({ data });
}
