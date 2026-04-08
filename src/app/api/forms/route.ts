import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../lib/supabase/admin';
import { getHubOrgOr401 } from '../../lib/hub/org';
import { invalidateListCache } from '../../lib/hub/list-cache';

export async function GET(req: NextRequest) {
  const org = await getHubOrgOr401();
  if (org instanceof NextResponse) return org;

  const { searchParams } = new URL(req.url);
  const limit = Math.min(200, Math.max(1, Number(searchParams.get('limit')) || 50));
  const status = searchParams.get('status')?.trim() || '';

  const admin = getSupabaseAdmin();
  let query = admin.from('forms').select('*', { count: 'exact' }).eq('org_id', org.orgId);
  if (status) query = query.eq('status', status);

  const { data, error, count } = await query.order('created_at', { ascending: false }).limit(limit);
  if (error) {
    console.error('[GET /api/forms]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data: data ?? [], total: count ?? 0 });
}


export async function POST(req: NextRequest) {
  const org = await getHubOrgOr401();
  if (org instanceof NextResponse) return org;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const title = String(body.title ?? '').trim();
  if (!title) {
    return NextResponse.json({ error: 'Form name is required' }, { status: 400 });
  }

  const fields = Array.isArray(body.fields) ? body.fields : [];

  const admin = getSupabaseAdmin();
  const row = {
    org_id: org.orgId,
    title,
    fields,
    status: String(body.status ?? 'draft').trim() || 'draft',
  };

  const { data, error } = await admin.from('forms').insert(row).select('*').single();
  if (error) {
    console.error('[POST /api/forms]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await invalidateListCache(org.orgId, 'forms');
  return NextResponse.json({ data });
}
