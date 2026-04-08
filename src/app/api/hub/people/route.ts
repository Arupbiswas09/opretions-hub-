import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../lib/supabase/admin';
import { getHubOrgOr401 } from '../../../lib/hub/org';
import { invalidateListCache } from '../../../lib/hub/list-cache';
import { assertNotViewer } from '../../../lib/hub/rbac';

export async function GET(req: NextRequest) {
  const org = await getHubOrgOr401();
  if (org instanceof NextResponse) return org;

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 50));
  const status = searchParams.get('status')?.trim() || '';
  const department = searchParams.get('department')?.trim() || '';
  const q = searchParams.get('q')?.trim() || '';

  const admin = getSupabaseAdmin();
  let query = admin.from('people').select('*', { count: 'exact' }).eq('org_id', org.orgId);
  if (status) query = query.eq('status', status);
  if (department) query = query.ilike('department', `%${department}%`);
  if (q) query = query.ilike('full_name', `%${q}%`);

  const from = (page - 1) * limit;
  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(from, from + limit - 1);

  if (error) {
    console.error('[GET /api/hub/people]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: data ?? [], total: count ?? 0, page, limit });
}

export async function POST(req: NextRequest) {
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

  const fullName = String(body.full_name ?? '').trim();
  if (!fullName) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

  const row = {
    org_id: org.orgId,
    full_name: fullName,
    email: body.email != null ? String(body.email) : null,
    phone: body.phone != null ? String(body.phone) : null,
    department: body.department != null ? String(body.department) : null,
    role: body.role != null ? String(body.role) : null,
    employment_type: body.employment_type != null ? String(body.employment_type) : null,
    status: String(body.status ?? 'active').trim() || 'active',
    start_date: body.start_date != null ? String(body.start_date) : null,
  };

  const { data, error } = await admin.from('people').insert(row).select('*').single();
  if (error) {
    console.error('[POST /api/hub/people]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await invalidateListCache(org.orgId, 'people');
  return NextResponse.json({ data });
}
