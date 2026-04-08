import { NextRequest, NextResponse } from 'next/server';
import { format, startOfWeek } from 'date-fns';
import { getSupabaseAdmin } from '../../lib/supabase/admin';
import { getHubOrgOr401 } from '../../lib/hub/org';
import { invalidateListCache } from '../../lib/hub/list-cache';

export async function GET(req: NextRequest) {
  const org = await getHubOrgOr401();
  if (org instanceof NextResponse) return org;

  const { searchParams } = new URL(req.url);
  const limit = Math.min(200, Math.max(1, Number(searchParams.get('limit')) || 50));

  const admin = getSupabaseAdmin();
  const { data, error, count } = await admin.from('time_entries')
    .select('*, timesheets(project_id, projects(name))', { count: 'exact' })
    .eq('org_id', org.orgId)
    .order('entry_date', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[GET /api/time-entries]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data ?? []).map((r: Record<string, unknown>) => {
    const ts = r.timesheets as { project_id?: string; projects?: { name?: string } } | null;
    return {
      ...r,
      project_name: ts?.projects?.name ?? null,
      project_id: ts?.project_id ?? null,
      timesheets: undefined,
    };
  });

  return NextResponse.json({ data: rows, total: count ?? 0 });
}


export async function POST(req: NextRequest) {
  const org = await getHubOrgOr401();
  if (org instanceof NextResponse) return org;

  let body: {
    project_id?: string;
    description?: string;
    entry_date?: string;
    hours?: number;
    billable?: boolean;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.project_id?.trim()) {
    return NextResponse.json({ error: 'Project is required' }, { status: 400 });
  }

  const description = String(body.description ?? '').trim();
  if (!description) {
    return NextResponse.json({ error: 'Task description is required' }, { status: 400 });
  }

  const hours = Number(body.hours);
  if (!Number.isFinite(hours) || hours <= 0) {
    return NextResponse.json({ error: 'Valid hours are required' }, { status: 400 });
  }

  const entryDateStr = body.entry_date?.trim() || format(new Date(), 'yyyy-MM-dd');
  const entryD = new Date(entryDateStr + 'T12:00:00');
  if (Number.isNaN(entryD.getTime())) {
    return NextResponse.json({ error: 'Invalid entry date' }, { status: 400 });
  }

  const weekStartStr = format(startOfWeek(entryD, { weekStartsOn: 1 }), 'yyyy-MM-dd');
  const admin = getSupabaseAdmin();

  let { data: ts } = await admin
    .from('timesheets')
    .select('id')
    .eq('org_id', org.orgId)
    .eq('person_id', org.userId)
    .eq('week_start', weekStartStr)
    .maybeSingle();

  if (!ts) {
    const ins = await admin
      .from('timesheets')
      .insert({
        org_id: org.orgId,
        person_id: org.userId,
        project_id: body.project_id.trim(),
        week_start: weekStartStr,
        status: 'draft',
      })
      .select('id')
      .single();
    if (ins.error || !ins.data) {
      console.error('[time-entries] timesheet', ins.error);
      return NextResponse.json({ error: ins.error?.message ?? 'Timesheet create failed' }, { status: 500 });
    }
    ts = ins.data;
  }

  const { data, error } = await admin
    .from('time_entries')
    .insert({
      org_id: org.orgId,
      timesheet_id: ts.id,
      entry_date: entryDateStr,
      hours,
      description,
      billable: body.billable !== false,
    })
    .select('*')
    .single();

  if (error) {
    console.error('[POST /api/time-entries]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await invalidateListCache(org.orgId, 'timesheets');
  await invalidateListCache(org.orgId, 'time_entries');
  return NextResponse.json({ data });
}
