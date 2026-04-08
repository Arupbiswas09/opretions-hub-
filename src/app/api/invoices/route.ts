import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../lib/supabase/admin';
import { getHubOrgOr401 } from '../../lib/hub/org';
import { invalidateListCache } from '../../lib/hub/list-cache';

type LineItem = { description?: string; qty?: number; rate?: number };

export async function GET(req: NextRequest) {
  const org = await getHubOrgOr401();
  if (org instanceof NextResponse) return org;

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 50));
  const status = searchParams.get('status')?.trim() || '';

  const admin = getSupabaseAdmin();
  let query = admin.from('invoices').select('*, clients(name)', { count: 'exact' }).eq('org_id', org.orgId);
  if (status) query = query.eq('status', status);

  const from = (page - 1) * limit;
  const { data, error, count } = await query.order('created_at', { ascending: false }).range(from, from + limit - 1);

  if (error) {
    console.error('[GET /api/invoices]', error);
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

  let body: {
    client_id?: string;
    number?: string;
    issue_date?: string;
    due_date?: string;
    status?: string;
    line_items?: LineItem[];
    tax?: number;
    payment_terms?: string;
    notes?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.client_id?.trim()) {
    return NextResponse.json({ error: 'Client is required' }, { status: 400 });
  }

  const lineItems: LineItem[] = Array.isArray(body.line_items) ? body.line_items : [];
  let subtotal = 0;
  const normalized = lineItems.map((row) => {
    const qty = Number(row.qty) || 0;
    const rate = Number(row.rate) || 0;
    const amount = qty * rate;
    subtotal += amount;
    return {
      description: String(row.description ?? ''),
      qty,
      rate,
      amount,
    };
  });

  const tax = Number(body.tax) || 0;
  const total = subtotal + tax;

  const admin = getSupabaseAdmin();
  const row = {
    org_id: org.orgId,
    client_id: body.client_id.trim(),
    number: body.number?.trim() || null,
    status: body.status?.trim() || 'draft',
    issue_date: body.issue_date || null,
    due_date: body.due_date || null,
    subtotal,
    tax,
    total,
    line_items: normalized,
  };

  const { data, error } = await admin.from('invoices').insert(row).select('*').single();
  if (error) {
    console.error('[POST /api/invoices]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await invalidateListCache(org.orgId, 'invoices');
  return NextResponse.json({ data });
}
