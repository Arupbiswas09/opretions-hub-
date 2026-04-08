import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../lib/supabase/admin';
import { getHubOrgOr401 } from '../../lib/hub/org';
import { redisGet, redisSet } from '../../lib/redis';
import { pipelineKpiKey } from '../../lib/hub/kpi-cache';

const STAGE_ORDER = ['lead', 'qualified', 'proposal_sent', 'negotiation', 'won', 'lost'] as const;

const STAGE_LABEL: Record<string, string> = {
  lead: 'Lead',
  qualified: 'Qualified',
  proposal_sent: 'Proposal',
  negotiation: 'Negotiation',
  won: 'Won',
  lost: 'Lost',
};

const COLORS = ['#94A3B8', '#2563EB', '#0D9488', '#7C3AED', '#059669', '#DC2626'];

type DealCard = {
  id: string;
  title: string;
  client: string;
  value: number;
  tags: string[];
  owner: string;
};

/** Kanban columns derived from live deals (Phase 4 pipeline cache). */
export async function GET() {
  const org = await getHubOrgOr401();
  if (org instanceof NextResponse) return org;

  const cacheKey = pipelineKpiKey(org.orgId);
  const cached = await redisGet<{ columns: unknown[]; pipelineType: string }>(cacheKey);
  if (cached) return NextResponse.json({ ...cached, cached: true });

  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from('deals')
    .select('id, title, value, stage, owner_id, clients(name)')
    .eq('org_id', org.orgId);

  if (error) {
    console.error('[GET /api/pipeline]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const ownerIds = [...new Set((data ?? []).map((d: { owner_id?: string }) => d.owner_id).filter(Boolean))] as string[];
  let ownerMap: Record<string, string> = {};
  if (ownerIds.length) {
    const { data: profs } = await admin.from('profiles').select('id, display_name').in('id', ownerIds);
    ownerMap = Object.fromEntries((profs ?? []).map((p) => [p.id, p.display_name || 'Member']));
  }

  const grouped: Record<string, DealCard[]> = {};
  for (const s of STAGE_ORDER) grouped[s] = [];

  for (const row of data ?? []) {
    const r = row as {
      id: string;
      title: string;
      value: number | null;
      stage: string | null;
      owner_id: string | null;
      clients: { name?: string } | null;
    };
    const st =
      r.stage && (STAGE_ORDER as readonly string[]).includes(r.stage) ? r.stage : 'lead';
    grouped[st].push({
      id: r.id,
      title: r.title,
      client: r.clients?.name ?? '—',
      value: Number(r.value) || 0,
      tags: [],
      owner: r.owner_id ? ownerMap[r.owner_id] || 'Member' : '—',
    });
  }

  const columns = STAGE_ORDER.map((id, i) => ({
    id,
    title: STAGE_LABEL[id] ?? id,
    color: COLORS[i] ?? '#64748B',
    cards: grouped[id],
  }));

  const payload = { columns, pipelineType: 'project' as const };
  await redisSet(cacheKey, payload, 30);
  return NextResponse.json(payload);
}
