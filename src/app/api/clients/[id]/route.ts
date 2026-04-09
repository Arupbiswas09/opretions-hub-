import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../lib/supabase/admin';
import { getHubOrgOr401 } from '../../../lib/hub/org';
import { invalidateListCache } from '../../../lib/hub/list-cache';
import { syncRecord, deleteRecord } from '../../../lib/search/syncToIndex';
import { assertNotViewer } from '../../../lib/hub/rbac';

const ALLOWED_STATUS = ['Active', 'Onboarding', 'Inactive', 'Archived'] as const;

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
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

  const patch: Record<string, unknown> = {};
  if (body.name !== undefined) {
    const name = String(body.name ?? '').trim();
    if (!name) return NextResponse.json({ error: 'Company name cannot be empty' }, { status: 400 });
    patch.name = name;
  }
  if (body.billing_address !== undefined) {
    const billingRaw = body.billing_address != null ? String(body.billing_address).trim() : '';
    patch.billing_address = billingRaw ? { raw: billingRaw } : null;
  }
  if (body.payment_terms !== undefined) {
    patch.payment_terms = body.payment_terms != null ? String(body.payment_terms) : null;
  }
  if (body.account_manager_id !== undefined) {
    patch.account_manager_id =
      typeof body.account_manager_id === 'string' && body.account_manager_id ? body.account_manager_id : null;
  }
  if (body.status !== undefined) {
    const statusRaw = String(body.status ?? '').trim();
    if (!ALLOWED_STATUS.includes(statusRaw as (typeof ALLOWED_STATUS)[number])) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    patch.status = statusRaw;
  }
  if (body.industry !== undefined) {
    patch.industry = body.industry != null && String(body.industry).trim() !== '' ? String(body.industry).trim() : '';
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: 'No valid fields' }, { status: 400 });
  }

  const { data, error } = await admin
    .from('clients')
    .update(patch)
    .eq('id', id)
    .eq('org_id', org.orgId)
    .select('*')
    .maybeSingle();

  if (error) {
    console.error('[PATCH /api/clients/[id]]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await invalidateListCache(org.orgId, 'clients');
  void syncRecord('clients', data as Record<string, unknown>);

  return NextResponse.json({ data });
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const org = await getHubOrgOr401();
  if (org instanceof NextResponse) return org;

  const admin = getSupabaseAdmin();
  const denied = await assertNotViewer(admin, org.userId);
  if (denied) return denied;

  const { error } = await admin.from('clients').delete().eq('id', id).eq('org_id', org.orgId);

  if (error) {
    console.error('[DELETE /api/clients/[id]]', error);
    return NextResponse.json(
      {
        error:
          error.code === '23503'
            ? 'This client is linked to deals, projects, or other records. Remove those links first.'
            : error.message,
      },
      { status: error.code === '23503' ? 409 : 500 },
    );
  }

  await invalidateListCache(org.orgId, 'clients');
  void deleteRecord('clients', id);

  return NextResponse.json({ ok: true });
}
