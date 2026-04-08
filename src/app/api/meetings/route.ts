import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../lib/supabase/admin';
import { getHubOrgOr401 } from '../../lib/hub/org';

export async function GET(req: NextRequest) {
  const org = await getHubOrgOr401();
  if (org instanceof NextResponse) return org;

  const { searchParams } = new URL(req.url);
  const limit = Math.min(200, Math.max(1, Number(searchParams.get('limit')) || 50));

  const admin = getSupabaseAdmin();
  const { data, error, count } = await admin.from('meetings')
    .select('*', { count: 'exact' })
    .eq('org_id', org.orgId)
    .order('starts_at', { ascending: true })
    .limit(limit);

  if (error) {
    console.error('[GET /api/meetings]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data: data ?? [], total: count ?? 0 });
}
