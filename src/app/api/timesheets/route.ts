import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../lib/supabase/admin';
import { getHubOrgOr401 } from '../../lib/hub/org';

export async function GET(req: NextRequest) {
  const org = await getHubOrgOr401();
  if (org instanceof NextResponse) return org;

  const { searchParams } = new URL(req.url);
  const limit = Math.min(200, Math.max(1, Number(searchParams.get('limit')) || 50));
  const status = searchParams.get('status')?.trim() || '';

  const admin = getSupabaseAdmin();

  // Try query with people join first, fall back to projects-only if FK doesn't exist
  let selectStr = '*, projects(name)';
  let query = admin.from('timesheets').select(selectStr, { count: 'exact' }).eq('org_id', org.orgId);
  if (status) query = query.eq('status', status);

  const { data, error, count } = await query.order('created_at', { ascending: false }).limit(limit);
  if (error) {
    console.error('[GET /api/timesheets]', error);
    // If join fails, try without joins
    const fallback = admin.from('timesheets').select('*', { count: 'exact' }).eq('org_id', org.orgId);
    const { data: fbData, error: fbError, count: fbCount } = await (status ? fallback.eq('status', status) : fallback)
      .order('created_at', { ascending: false }).limit(limit);
    if (fbError) {
      return NextResponse.json({ error: fbError.message }, { status: 500 });
    }
    const rows = (fbData ?? []).map((row: Record<string, unknown>) => ({
      ...row, project_name: null, person_name: null,
    }));
    return NextResponse.json({ data: rows, total: fbCount ?? 0 });
  }

  // Resolve person_name from person_id if needed
  const personIds = new Set<string>();
  ((data ?? []) as any[]).forEach((row: Record<string, unknown>) => {
    if (row.person_id && typeof row.person_id === 'string') personIds.add(row.person_id);
  });

  let personMap: Record<string, string> = {};
  if (personIds.size > 0) {
    // Try people table first, then profiles
    const { data: pData } = await admin.from('people')
      .select('id, full_name').in('id', Array.from(personIds));
    if (pData && pData.length > 0) {
      pData.forEach((p: any) => { personMap[p.id] = p.full_name; });
    } else {
      const { data: prData } = await admin.from('profiles')
        .select('id, display_name').in('id', Array.from(personIds));
      if (prData) prData.forEach((p: any) => { personMap[p.id] = p.display_name; });
    }
  }

  const rows = ((data ?? []) as any[]).map((row: Record<string, unknown>) => {
    const projects = row.projects as { name?: string } | null;
    const { projects: _p, ...rest } = row;
    return {
      ...rest,
      project_name: projects?.name ?? null,
      person_name: personMap[row.person_id as string] ?? null,
    };
  });

  return NextResponse.json({ data: rows, total: count ?? 0 });
}
