import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../lib/supabase/admin';
import { getHubOrgOr401 } from '../../../lib/hub/org';

/** Dropdown data for quick-create drawers (scoped to org). */
export async function GET() {
  const org = await getHubOrgOr401();
  if (org instanceof NextResponse) return org;

  const admin = getSupabaseAdmin();

  const [clients, projects, profiles, deals] = await Promise.all([
    admin.from('clients').select('id, name').eq('org_id', org.orgId).order('name').limit(200),
    admin.from('projects').select('id, name').eq('org_id', org.orgId).order('name').limit(200),
    admin
      .from('profiles')
      .select('id, display_name')
      .eq('org_id', org.orgId)
      .order('display_name')
      .limit(200),
    admin.from('deals').select('id, title').eq('org_id', org.orgId).order('title').limit(200),
  ]);

  return NextResponse.json({
    clients: clients.data ?? [],
    projects: projects.data ?? [],
    profiles: (profiles.data ?? []).map((p) => ({
      id: p.id,
      display_name: p.display_name || 'Member',
    })),
    deals: deals.data ?? [],
  });
}
