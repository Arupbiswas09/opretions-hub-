import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../lib/supabase/admin';
import { getHubOrgOr401 } from '../../lib/hub/org';
import { invalidateListCache } from '../../lib/hub/list-cache';
import { parseMoney } from '../../lib/hub/parse';
import { redisGet, redisSet, HUB_KEYS } from '../../lib/redis';

export async function GET(req: NextRequest) {
  const org = await getHubOrgOr401();
  if (org instanceof NextResponse) return org;

  const { searchParams } = new URL(req.url);
  const limit = Math.min(200, Math.max(1, Number(searchParams.get('limit')) || 50));
  const status = searchParams.get('status')?.trim() || '';

  const admin = getSupabaseAdmin();
  let query = admin.from('contracts').select('*, clients(name)', { count: 'exact' }).eq('org_id', org.orgId);
  if (status) query = query.eq('status', status);

  const { data, error, count } = await query.order('created_at', { ascending: false }).limit(limit);
  if (error) {
    console.error('[GET /api/contracts]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data ?? []).map((row: Record<string, unknown>) => {
    const clients = row.clients as { name?: string } | null;
    return { ...row, client_name: clients?.name ?? null, clients: undefined };
  });

  return NextResponse.json({ data: rows, total: count ?? 0 });
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
    return NextResponse.json({ error: 'Contract title is required' }, { status: 400 });
  }

  if (!body.client_id || typeof body.client_id !== 'string') {
    return NextResponse.json({ error: 'Client is required' }, { status: 400 });
  }

  const value = parseMoney(typeof body.value === 'string' ? body.value : body.value != null ? String(body.value) : null);

  const admin = getSupabaseAdmin();
  const row = {
    org_id: org.orgId,
    client_id: body.client_id,
    deal_id: typeof body.deal_id === 'string' && body.deal_id ? body.deal_id : null,
    title,
    status: String(body.status ?? 'draft').trim() || 'draft',
    value,
    signed_date: body.signed_date != null ? String(body.signed_date) : null,
    pdf_path: null,
  };

  const { data, error } = await admin.from('contracts').insert(row).select('*').single();
  if (error) {
    console.error('[POST /api/contracts]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await invalidateListCache(org.orgId, 'contracts');
  return NextResponse.json({ data });
}
