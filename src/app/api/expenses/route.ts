import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../lib/supabase/admin';
import { getHubOrgOr401 } from '../../lib/hub/org';
import { invalidateListCache } from '../../lib/hub/list-cache';
import { parseMoney } from '../../lib/hub/parse';

export async function GET(req: NextRequest) {
  const org = await getHubOrgOr401();
  if (org instanceof NextResponse) return org;

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 50));
  const status = searchParams.get('status')?.trim() || '';

  const admin = getSupabaseAdmin();
  let query = admin.from('expenses').select('*', { count: 'exact' }).eq('org_id', org.orgId);
  if (status) query = query.eq('status', status);

  const from = (page - 1) * limit;
  const { data, error, count } = await query.order('created_at', { ascending: false }).range(from, from + limit - 1);

  if (error) {
    console.error('[GET /api/expenses]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: data ?? [], total: count ?? 0, page, limit });
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

  const description = String(body.description ?? '').trim();
  if (!description) {
    return NextResponse.json({ error: 'Description is required' }, { status: 400 });
  }

  const amount = parseMoney(typeof body.amount === 'string' ? body.amount : body.amount != null ? String(body.amount) : null);
  if (amount == null || amount <= 0) {
    return NextResponse.json({ error: 'Valid amount is required' }, { status: 400 });
  }

  const admin = getSupabaseAdmin();
  const row = {
    org_id: org.orgId,
    description,
    amount,
    category: body.category != null ? String(body.category) : null,
    person_id: org.userId,
    project_id: typeof body.project_id === 'string' && body.project_id ? body.project_id : null,
    receipt_path: typeof body.receipt_path === 'string' ? body.receipt_path : null,
    status: 'submitted',
    expense_date: body.expense_date != null ? String(body.expense_date) : null,
  };

  const { data, error } = await admin.from('expenses').insert(row).select('*').single();
  if (error) {
    console.error('[POST /api/expenses]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await invalidateListCache(org.orgId, 'expenses');
  return NextResponse.json({ data });
}
