import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../lib/supabase/admin';
import { getHubOrgOr401 } from '../../../lib/hub/org';

export async function GET(req: NextRequest) {
  const org = await getHubOrgOr401();
  if (org instanceof NextResponse) return org;

  const { searchParams } = new URL(req.url);
  const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit')) || 20));

  const admin = getSupabaseAdmin();
  const { data, error } = await admin.from('activity_log')
    .select('*')
    .eq('org_id', org.orgId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[GET /api/admin/activity-log]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data: data ?? [] });
}
