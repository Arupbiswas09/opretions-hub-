import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../lib/supabase/admin';
import { getHubOrgOr401 } from '../../lib/hub/org';
import { invalidateListCache } from '../../lib/hub/list-cache';
import { redisGet, redisSet, HUB_KEYS } from '../../lib/redis';

export async function GET(req: NextRequest) {
  const org = await getHubOrgOr401();
  if (org instanceof NextResponse) return org;

  const { searchParams } = new URL(req.url);
  const limit = Math.min(200, Math.max(1, Number(searchParams.get('limit')) || 50));
  const jobId = searchParams.get('job_id')?.trim() || '';
  const stage = searchParams.get('stage')?.trim() || '';

  const admin = getSupabaseAdmin();
  let query = admin.from('candidates').select('*, jobs(title)', { count: 'exact' }).eq('org_id', org.orgId);
  if (jobId) query = query.eq('job_id', jobId);
  if (stage) query = query.eq('stage', stage);

  const { data, error, count } = await query.order('created_at', { ascending: false }).limit(limit);
  if (error) {
    console.error('[GET /api/candidates]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data ?? []).map((r: Record<string, unknown>) => {
    const jobs = r.jobs as { title?: string } | null;
    return { ...r, job_title: jobs?.title ?? null, jobs: undefined };
  });
  return NextResponse.json({ data: rows, total: count ?? 0 });
}

export async function POST(req: NextRequest) {
  const org = await getHubOrgOr401();
  if (org instanceof NextResponse) return org;

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const fullName = String(body.full_name ?? '').trim();
  if (!fullName) return NextResponse.json({ error: 'Candidate name is required' }, { status: 400 });

  const admin = getSupabaseAdmin();
  const { data, error } = await admin.from('candidates').insert({
    org_id: org.orgId,
    full_name: fullName,
    email: body.email != null ? String(body.email) : null,
    job_id: body.job_id != null ? String(body.job_id) : null,
    stage: String(body.stage ?? 'applied'),
    source: body.source != null ? String(body.source) : null,
    notes: body.notes != null ? String(body.notes) : null,
  }).select('*').single();

  if (error) {
    console.error('[POST /api/candidates]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  await invalidateListCache(org.orgId, 'candidates');
  return NextResponse.json({ data });
}
