import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../lib/supabase/admin';
import { getHubOrgOr401 } from '../../../lib/hub/org';
import { redisGet, redisSet } from '../../../lib/redis';
import { salesKpiKey } from '../../../lib/hub/kpi-cache';

const STAGE_LABEL: Record<string, string> = {
  lead: 'Lead',
  qualified: 'Qualified',
  proposal_sent: 'Proposal sent',
  negotiation: 'Negotiation',
  won: 'Won',
  lost: 'Lost',
};

const FUNNEL_STAGES = ['lead', 'qualified', 'proposal_sent', 'negotiation'] as const;

type DealRow = {
  id: string;
  title: string;
  stage: string | null;
  value: number | null;
  created_at: string;
  close_date: string | null;
  updated_at: string;
  clients: { name?: string } | null;
};

export async function GET() {
  const org = await getHubOrgOr401();
  if (org instanceof NextResponse) return org;

  const cacheKey = salesKpiKey(org.orgId);
  const cached = await redisGet<Record<string, unknown>>(cacheKey);
  if (cached) return NextResponse.json({ ...cached, cached: true });

  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from('deals')
    .select('id, title, stage, value, created_at, close_date, updated_at, clients(name)')
    .eq('org_id', org.orgId);

  if (error) {
    console.error('[GET /api/kpi/sales]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data ?? []) as DealRow[];
  const active = rows.filter((r) => r.stage !== 'won' && r.stage !== 'lost');
  const totalPipelineValue = active.reduce((s, r) => s + (Number(r.value) || 0), 0);
  const totalPipelineK = Math.max(0, Math.round(totalPipelineValue / 1000));
  const activeDeals = active.length;

  const won = rows.filter((r) => r.stage === 'won');
  const lost = rows.filter((r) => r.stage === 'lost');
  const closed = won.length + lost.length;
  const winRatePct = closed > 0 ? Math.round((won.length / closed) * 100) : 0;

  const closeDays: number[] = [];
  for (const r of won) {
    const created = r.created_at ? new Date(r.created_at).getTime() : 0;
    const end = r.close_date
      ? new Date(r.close_date).getTime()
      : r.updated_at
        ? new Date(r.updated_at).getTime()
        : 0;
    if (created && end && end >= created) closeDays.push((end - created) / 86400000);
  }
  const avgCloseDays = closeDays.length
    ? Math.round(closeDays.reduce((a, b) => a + b, 0) / closeDays.length)
    : 42;

  const funnelRaw = FUNNEL_STAGES.map((sk) => {
    const inStage = rows.filter((r) => r.stage === sk);
    const count = inStage.length;
    const value = inStage.reduce((s, r) => s + (Number(r.value) || 0), 0);
    return { stage: STAGE_LABEL[sk] ?? sk, count, valueK: Math.max(0, Math.round(value / 1000)) };
  });
  const maxCount = Math.max(1, ...funnelRaw.map((f) => f.count));
  const funnel = funnelRaw.map((f) => ({
    ...f,
    widthPct: f.count === 0 ? 8 : Math.max(12, Math.round((f.count / maxCount) * 100)),
  }));

  const now = new Date();
  const monthly: { month: string; won: number; lost: number; valueK: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const y = d.getFullYear();
    const m = d.getMonth();
    const label = d.toLocaleString('en-US', { month: 'short' });
    const start = new Date(y, m, 1);
    const end = new Date(y, m + 1, 1);
    let w = 0;
    let l = 0;
    let val = 0;
    for (const r of rows) {
      if (r.stage !== 'won' && r.stage !== 'lost') continue;
      const dt = r.close_date ? new Date(r.close_date) : new Date(r.updated_at);
      if (dt >= start && dt < end) {
        if (r.stage === 'won') {
          w++;
          val += Number(r.value) || 0;
        } else l++;
      }
    }
    monthly.push({
      month: label,
      won: w,
      lost: l,
      valueK: Math.max(0, Math.round(val / 1000)),
    });
  }

  const recentRows = [...rows]
    .filter((r) => r.stage !== 'lost' && r.stage !== 'won')
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 4);

  const recent = recentRows.map((r) => {
    const client = r.clients?.name ?? '—';
    const v = Number(r.value) || 0;
    const valueStr = v >= 1000 ? `$${(v / 1000).toFixed(1)}K` : `$${Math.round(v).toLocaleString()}`;
    const stageLabel = STAGE_LABEL[r.stage ?? ''] ?? r.stage ?? '—';
    return {
      name: r.title,
      client,
      value: valueStr,
      stage: stageLabel,
      hot: v > 40000,
      type: 'Project' as const,
    };
  });

  const totalDeals = rows.length;
  const leadToClosePct =
    totalDeals > 0 ? Math.round((won.length / totalDeals) * 1000) / 10 : 0;
  const avgDealValue =
    won.length > 0
      ? won.reduce((s, r) => s + (Number(r.value) || 0), 0) / won.length
      : 0;
  const avgDealK = Math.round((avgDealValue / 1000) * 10) / 10;

  const payload = {
    totalPipelineK,
    activeDeals,
    winRatePct,
    avgCloseDays,
    funnel,
    monthly,
    recent,
    leadToClosePct,
    avgDealK,
  };

  await redisSet(cacheKey, payload, 30);
  return NextResponse.json(payload);
}
