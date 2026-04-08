import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../lib/supabase/admin';
import { getHubOrgOr401 } from '../../lib/hub/org';
import { invalidateListCache } from '../../lib/hub/list-cache';
import { redisGet, redisSet, HUB_KEYS } from '../../lib/redis';
import { listFiltersHash } from '../../lib/hub/list-query';
import { assertNotViewer } from '../../lib/hub/rbac';

const PRIORITIES = new Set(['low', 'normal', 'high', 'urgent']);
const STATUSES = new Set(['open', 'in_progress', 'resolved', 'closed']);

function formatSubjectWithType(requestType: string, subject: string): string {
  const s = subject.trim();
  if (s.startsWith('[')) return s;
  const rt = requestType.trim() || 'support';
  return `[${rt}] ${s}`;
}

function parseRequestMeta(subject: string): { type: string; title: string } {
  const m = subject.match(/^\[([a-z0-9_-]+)\]\s*(.*)$/i);
  if (m) return { type: m[1]!.toLowerCase(), title: m[2]!.trim() || subject };
  return { type: 'support', title: subject };
}

export async function GET(req: NextRequest) {
  const org = await getHubOrgOr401();
  if (org instanceof NextResponse) return org;

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 50));
  const status = searchParams.get('status')?.trim() || '';
  const mine = searchParams.get('mine') === '1';
  const sortCol = 'created_at';
  const ascending = false;

  const fh = listFiltersHash({ page, limit, status, mine, sortCol, ascending });
  const cacheKey = `${HUB_KEYS.list}:support_tickets:${org.orgId}:${fh}`;
  const cached = await redisGet<Record<string, unknown>>(cacheKey);
  if (cached) return NextResponse.json({ ...cached, cached: true });

  const admin = getSupabaseAdmin();
  let q = admin.from('support_tickets').select('*', { count: 'exact' }).eq('org_id', org.orgId);
  if (status) q = q.eq('status', status);
  if (mine) q = q.eq('requester_id', org.userId);

  const from = (page - 1) * limit;
  const { data, error, count } = await q.order(sortCol, { ascending }).range(from, from + limit - 1);

  if (error) {
    console.error('[GET /api/support-tickets]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = data ?? [];
  const reqIds = [...new Set(rows.map((r: { requester_id?: string }) => r.requester_id).filter(Boolean))] as string[];
  let nameById: Record<string, string> = {};
  if (reqIds.length) {
    const { data: profs } = await admin.from('profiles').select('id, display_name').in('id', reqIds);
    nameById = Object.fromEntries((profs ?? []).map((p) => [p.id, p.display_name || 'Member']));
  }

  const enriched = rows.map((r: Record<string, unknown>) => {
    const rid = r.requester_id as string | null;
    const subj = String(r.subject ?? '');
    const meta = parseRequestMeta(subj);
    return {
      ...r,
      request_type: meta.type,
      display_title: meta.title,
      requester_name: rid ? nameById[rid] ?? null : null,
    };
  });

  const payload = { data: enriched, total: count ?? 0, page, limit };
  await redisSet(cacheKey, payload, 60);
  return NextResponse.json(payload);
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

  const subjectRaw = String(body.subject ?? '').trim();
  if (!subjectRaw) return NextResponse.json({ error: 'subject is required' }, { status: 400 });

  const requestType = String(body.request_type ?? 'support').trim() || 'support';
  const subject = formatSubjectWithType(requestType, subjectRaw);

  const pr = String(body.priority ?? 'normal').toLowerCase();
  const priority = PRIORITIES.has(pr) ? pr : 'normal';
  const st = String(body.status ?? 'open').toLowerCase();
  const status = STATUSES.has(st) ? st : 'open';

  const row = {
    org_id: org.orgId,
    subject,
    description: body.description != null ? String(body.description) : null,
    requester_id: org.userId,
    priority,
    status,
  };

  const { data, error } = await admin.from('support_tickets').insert(row).select('*').single();
  if (error) {
    console.error('[POST /api/support-tickets]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await invalidateListCache(org.orgId, 'support_tickets');
  return NextResponse.json({ data });
}
