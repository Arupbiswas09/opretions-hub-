import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../lib/supabase/admin';
import { getHubOrgOr401 } from '../../lib/hub/org';
import { invalidateListCache } from '../../lib/hub/list-cache';
import { syncRecord } from '../../lib/search/syncToIndex';
import { parseMoney } from '../../lib/hub/parse';

export async function GET(req: NextRequest) {
  const org = await getHubOrgOr401();
  if (org instanceof NextResponse) return org;

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 50));
  const status = searchParams.get('status')?.trim() || '';
  const q = searchParams.get('q')?.trim() || '';

  const admin = getSupabaseAdmin();
  let query = admin.from('projects').select('*, clients(name)', { count: 'exact' }).eq('org_id', org.orgId);
  if (status) query = query.eq('status', status);
  if (q) query = query.ilike('name', `%${q}%`);

  const from = (page - 1) * limit;
  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(from, from + limit - 1);

  if (error) {
    console.error('[GET /api/projects]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data ?? []).map((row: Record<string, unknown>) => {
    const clients = row.clients as { name?: string } | null;
    return { ...row, client_name: clients?.name ?? null, clients: undefined };
  });

  return NextResponse.json({ data: rows, total: count ?? 0, page, limit });
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

  const name = String(body.name ?? '').trim();
  if (!name) {
    return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
  }

  const admin = getSupabaseAdmin();
  const clientId = typeof body.client_id === 'string' && body.client_id ? body.client_id : null;
  let clientName: string | null = null;
  if (clientId) {
    const { data: cl } = await admin.from('clients').select('name').eq('id', clientId).eq('org_id', org.orgId).maybeSingle();
    clientName = cl?.name ?? null;
  }

  const budgetHours = parseMoney(typeof body.budget_hours === 'string' ? body.budget_hours : null);

  const row = {
    org_id: org.orgId,
    client_id: clientId,
    name,
    description: body.description != null ? String(body.description) : null,
    status: String(body.status ?? 'active').trim() || 'active',
    start_date: body.start_date != null ? String(body.start_date) : null,
    end_date: body.end_date != null ? String(body.end_date) : null,
    budget_hours: budgetHours,
  };

  const { data, error } = await admin.from('projects').insert(row).select('*').single();
  if (error) {
    console.error('[POST /api/projects]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const enriched = { ...data, client_name: clientName };
  await invalidateListCache(org.orgId, 'projects');
  void syncRecord('projects', enriched as Record<string, unknown>);

  return NextResponse.json({ data });
}
