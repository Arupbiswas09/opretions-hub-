'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, Plus, ChevronRight, TrendingUp, TrendingDown, Target, Zap } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, CartesianGrid,
} from 'recharts';
import { BonsaiButton } from '../bonsai/BonsaiButton';
import { StatCard } from '../bonsai/StatCard';
import { staggerContainer, fadeInUp, cardInteraction, easeOutQuart, EASE_OUT_EXPO } from '../../lib/motion';
import { useTheme } from '../../lib/theme';
import { dashboardFoldRootClass, DashboardScrollPanel } from '../dashboard/DashboardFoldLayout';

/* ── Animated stat number ──────────────────────────────── */
function AnimatedStat({ to, prefix = '', suffix = '' }: { to: number; prefix?: string; suffix?: string }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const t0 = performance.now();
    const run = (now: number) => {
      const p = Math.min((now - t0) / 1200, 1);
      setV(Math.round(to * easeOutQuart(p)));
      if (p < 1) requestAnimationFrame(run);
    };
    requestAnimationFrame(run);
  }, [to]);
  return <>{prefix}{v.toLocaleString()}{suffix}</>;
}

/* ── Chart tooltip ─────────────────────────────────────── */
function ChartTooltip({ active, payload, label, formatter }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-3 py-2.5 text-[11px]"
      style={{
        background: 'var(--user-menu-bg)',
        backdropFilter: 'blur(20px)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-md)',
      }}>
      <p className="font-semibold mb-1" style={{ color: 'var(--foreground)' }}>{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: p.fill ?? p.color }} />
          <span style={{ color: 'var(--muted-foreground)' }} className="capitalize">{p.name}:</span>
          <span className="font-medium" style={{ color: 'var(--foreground)' }}>
            {formatter ? formatter(p.value) : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

type SalesKpiPayload = {
  totalPipelineK: number;
  activeDeals: number;
  winRatePct: number;
  avgCloseDays: number;
  funnel: { stage: string; count: number; valueK: number; widthPct: number }[];
  monthly: { month: string; won: number; lost: number; valueK: number }[];
  recent: {
    name: string;
    client: string;
    value: string;
    stage: string;
    hot: boolean;
    type: 'Project' | 'Talent';
  }[];
  leadToClosePct: number;
  avgDealK: number;
};

interface SA01DashboardProps {
  dataRefreshVersion?: number;
  onNavigateToDeals: () => void;
  onNavigateToPipeline: () => void;
  onCreateDeal: () => void;
}

const STATS = [
  { label: 'Total Pipeline',  val: 485,  pre: '$', suf: 'K', delta: '+12%', up: true,  sub: 'vs last month' },
  { label: 'Active Deals',    val: 23,   pre: '',  suf: '',   delta: '+3',   up: true,  sub: '18 project · 5 talent' },
  { label: 'Win Rate',        val: 68,   pre: '',  suf: '%',  delta: '+4pp', up: true,  sub: 'Above 64% target' },
  { label: 'Avg Close Time',  val: 42,   pre: '',  suf: 'd',  delta: '-3d',  up: true,  sub: 'Target ≤ 45 days' },
];

/* Pipeline funnel data — each stage with deal count + value */
const PIPELINE_STAGES = [
  { stage: 'New Lead',            count: 8,  value: 195, width: 100, type: 'mixed' },
  { stage: 'Qualified',           count: 5,  value: 130, width: 80,  type: 'mixed' },
  { stage: 'Discovery',           count: 4,  value: 110, width: 68,  type: 'mixed' },
  { stage: 'Proposal Sent',       count: 3,  value: 95,  width: 52,  type: 'mixed' },
  { stage: 'Negotiation',         count: 2,  value: 50,  width: 34,  type: 'mixed' },
];

/* Win/loss monthly data */
const MONTHLY_PERFORMANCE = [
  { month: 'Aug', won: 8,  lost: 3, value: 182 },
  { month: 'Sep', won: 11, lost: 2, value: 234 },
  { month: 'Oct', won: 7,  lost: 4, value: 156 },
  { month: 'Nov', won: 14, lost: 1, value: 312 },
  { month: 'Dec', won: 9,  lost: 3, value: 198 },
  { month: 'Jan', won: 12, lost: 2, value: 275 },
];

const RECENT_DEALS = [
  { name: 'Website Redesign Project',   client: 'Acme Corp',    value: '$45,000', stage: 'Proposal Sent',        hot: true,  type: 'Project' },
  { name: 'Senior Designer Placement',  client: 'Tech Startup', value: '$28,000', stage: 'Interviewing',         hot: false, type: 'Talent'  },
  { name: 'Brand Identity Package',     client: 'Local Retail', value: '$15,000', stage: 'Discovery Scheduled',  hot: false, type: 'Project' },
  { name: 'React Developer Search',     client: 'SaaS Co.',     value: '$35,000', stage: 'Profiles Shared',      hot: false, type: 'Talent'  },
];

export function SA01Dashboard({
  dataRefreshVersion = 0,
  onNavigateToDeals,
  onNavigateToPipeline,
  onCreateDeal,
}: SA01DashboardProps) {
  const { isDark } = useTheme();
  const [kpi, setKpi] = useState<SalesKpiPayload | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch('/api/kpi/sales', { credentials: 'include' });
      const json = await res.json();
      if (cancelled || !res.ok || json?.error) return;
      const { cached: _c, ...rest } = json;
      if (typeof rest.totalPipelineK === 'number' && Array.isArray(rest.funnel)) {
        setKpi(rest as SalesKpiPayload);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [dataRefreshVersion]);

  const wonColor   = isDark ? 'rgba(251,191,36,0.85)' : 'rgba(37,99,235,0.85)';
  const lostColor  = isDark ? 'rgba(255,255,255,0.18)' : 'rgba(15,23,42,0.08)';
  const valueColor = isDark ? 'rgba(52,211,153,0.70)'  : 'rgba(37,99,235,0.65)';
  const gridColor  = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(15,23,42,0.06)';
  const tickColor  = 'var(--muted-foreground)';

  /* Pipeline bar fill — warmer amber gradient in dark */
  const stageBarColor = (idx: number) => {
    if (isDark) {
      const alphas = [0.80, 0.65, 0.52, 0.40, 0.28];
      return `rgba(251,191,36,${alphas[idx] ?? 0.20})`;
    }
    const alphas = [0.85, 0.65, 0.48, 0.34, 0.22];
    return `rgba(37,99,235,${alphas[idx] ?? 0.20})`;
  };

  const glassPanel: React.CSSProperties = {
    background: 'var(--glass-bg)',
    backdropFilter: 'blur(24px) saturate(180%)',
    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
    border: '1px solid var(--border)',
  };

  const statsRow = kpi
    ? [
        {
          label: 'Total Pipeline',
          val: kpi.totalPipelineK,
          pre: '$',
          suf: 'K',
          delta: 'Live',
          up: true,
          sub: 'Open deals (excl. won/lost)',
        },
        {
          label: 'Active Deals',
          val: kpi.activeDeals,
          pre: '',
          suf: '',
          delta: 'Live',
          up: true,
          sub: 'In pipeline',
        },
        {
          label: 'Win Rate',
          val: kpi.winRatePct,
          pre: '',
          suf: '%',
          delta: 'won / (won+lost)',
          up: true,
          sub: 'Closed outcomes',
        },
        {
          label: 'Avg Close Time',
          val: kpi.avgCloseDays,
          pre: '',
          suf: 'd',
          delta: 'Live',
          up: true,
          sub: 'Won deals',
        },
      ]
    : STATS;

  const funnelData = kpi
    ? kpi.funnel.map((f) => ({
        stage: f.stage,
        count: f.count,
        value: f.valueK,
        width: f.widthPct,
        type: 'mixed' as const,
      }))
    : PIPELINE_STAGES;

  const monthlyData = kpi ? kpi.monthly : MONTHLY_PERFORMANCE;
  const recentDeals = kpi?.recent?.length ? kpi.recent : RECENT_DEALS;

  return (
    <motion.div
      className={dashboardFoldRootClass}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      {/* ── Header ──────────────────────────────────────── */}
      <motion.div
        className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
      >
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] mb-1 text-muted-foreground">Sales</p>
          <h1 className="text-[28px] font-semibold tracking-[-0.025em] text-foreground">Pipeline overview</h1>
        </div>
        <BonsaiButton variant="primary" icon={<Plus className="w-4 h-4" />} onClick={onCreateDeal}>
          New Deal
        </BonsaiButton>
      </motion.div>

      {/* ── Stats row ─── */}
      <motion.div
        className="grid grid-cols-2 gap-3 lg:grid-cols-4"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {statsRow.map((s) => (
          <StatCard
            key={s.label}
            label={s.label}
            value={<AnimatedStat to={s.val} prefix={s.pre} suffix={s.suf} />}
            trend={s.delta}
            trendUp={s.up}
            sublabel={s.sub}
            variant="glass"
          />
        ))}
      </motion.div>

      {/* ── Pipeline funnel + Monthly performance ── */}
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1fr_280px]">

        {/* Visual funnel */}
        <motion.div
          className="rounded-2xl overflow-hidden"
          style={glassPanel}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.4, ease: EASE_OUT_EXPO }}
        >
          <div className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2.5">
              <Target className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-[13px] font-semibold text-foreground">Pipeline funnel</h3>
            </div>
            <button onClick={onNavigateToPipeline}
              className="text-[12px] flex items-center gap-1 group transition-colors
                         text-muted-foreground hover:text-foreground">
              View board <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Horizontal bar funnel */}
          <DashboardScrollPanel size="md" className="px-5 py-5">
            <div className="space-y-3">
              {funnelData.map((stage, i) => (
                <motion.div
                  key={stage.stage}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.22 + i * 0.06, duration: 0.35, ease: EASE_OUT_EXPO }}
                  className="group cursor-pointer"
                  onClick={onNavigateToPipeline}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="text-[10px] font-bold tabular-nums w-3 text-right text-muted-foreground"
                      >
                        {stage.count}
                      </span>
                      <span className="text-[12px] font-medium text-foreground">{stage.stage}</span>
                    </div>
                    <span className="text-[12px] font-semibold tabular-nums text-foreground">
                      ${stage.value}K
                    </span>
                  </div>
                  <div className="h-[6px] rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: stageBarColor(i) }}
                      initial={{ width: 0 }}
                      animate={{ width: `${stage.width}%` }}
                      transition={{ delay: 0.28 + i * 0.07, duration: 0.9, ease: EASE_OUT_EXPO }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </DashboardScrollPanel>

            {/* Conversion summary */}
            <div className="flex items-center gap-4 pt-3 mt-1"
              style={{ borderTop: '1px solid var(--border)' }}>
              <div className="flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-muted-foreground" />
                <span className="text-[11px] text-muted-foreground">Lead → Close:</span>
                <span className="text-[11px] font-bold text-foreground">
                  {kpi ? `${kpi.leadToClosePct}%` : '25.6%'}
                </span>
              </div>
              <span className="text-muted-foreground/40">·</span>
              <div className="text-[11px] text-muted-foreground">
                Avg deal:{' '}
                <span className="font-bold text-foreground">
                  {kpi ? `$${kpi.avgDealK}K` : '$21.1K'}
                </span>
              </div>
            </div>
        </motion.div>

        {/* Monthly won/lost performance */}
        <motion.div
          className="rounded-2xl overflow-hidden"
          style={glassPanel}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.4, ease: EASE_OUT_EXPO }}
        >
          <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <h3 className="text-[13px] font-semibold text-foreground">Deals closed</h3>
            <p className="text-[11px] mt-0.5 text-muted-foreground">Last 6 months</p>
          </div>

          <div className="px-2 pb-2">
            <ResponsiveContainer width="100%" height={110}>
              <BarChart data={monthlyData} barSize={10} barCategoryGap="30%">
                <XAxis
                  dataKey="month" tickLine={false} axisLine={false}
                  tick={{ fontSize: 9, fill: tickColor, fontWeight: 500 }} dy={4}
                />
                <Tooltip
                  content={(props) => <ChartTooltip {...props} />}
                  cursor={false}
                />
                <Bar dataKey="won"  stackId="a" fill={wonColor}  radius={[0, 0, 0, 0]} />
                <Bar dataKey="lost" stackId="a" fill={lostColor} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pipeline value trend */}
          <div className="px-5 pb-0" style={{ borderTop: '1px solid var(--border)' }}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] pt-3 mb-1
                          text-muted-foreground">Value (\$K)</p>
            <ResponsiveContainer width="100%" height={60}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="2 4" stroke={gridColor} vertical={false} />
                <XAxis dataKey="month" hide />
                <Tooltip
                  content={(props) => <ChartTooltip {...props} formatter={(v: number) => `$${v}K`} />}
                  cursor={false}
                />
                <Line
                  type="monotone" dataKey="value" stroke={valueColor}
                  strokeWidth={1.5} dot={false}
                  activeDot={{ r: 3, fill: valueColor, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3 px-5 py-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: wonColor }} />
              <span className="text-[10px] text-muted-foreground">Won</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: lostColor }} />
              <span className="text-[10px] text-muted-foreground">Lost</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: valueColor }} />
              <span className="text-[10px] text-muted-foreground">Value</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Recent Deals ─────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.32, duration: 0.4, ease: EASE_OUT_EXPO }}
        className="rounded-2xl overflow-hidden"
        style={glassPanel}
      >
        <div
          className="flex items-center justify-between px-3 py-4 sm:px-6"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <h3 className="text-[13px] font-semibold text-foreground">Hot deals</h3>
          <button onClick={onNavigateToDeals}
            className="text-[12px] flex items-center gap-1 group transition-colors
                       text-muted-foreground hover:text-foreground">
            View all <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <DashboardScrollPanel size="md" className="pb-1">
          <div>
            {recentDeals.map((deal, i) => (
              <motion.button
                key={`${deal.name}-${i}`}
                className="group flex w-full items-center gap-3 px-3 py-4 text-left transition-colors sm:gap-4 sm:px-6"
                style={{
                  borderBottom: i < recentDeals.length - 1 ? '1px solid var(--border)' : 'none',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.38 + i * 0.05 }}
                whileHover={{ backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', x: 2 }}
                whileTap={{ scale: 0.998 }}
                onClick={onNavigateToDeals}
              >
                {/* Type badge */}
                <span
                  className={`text-[9px] font-bold uppercase tracking-[0.08em] px-1.5 py-0.5 rounded-md flex-shrink-0 ${
                    deal.type === 'Project'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {deal.type}
                </span>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[13px] font-medium text-foreground truncate">{deal.name}</p>
                    {deal.hot && (
                      <span
                        className="text-[9px] font-bold uppercase tracking-[0.06em] px-1.5 py-0.5 rounded-full flex-shrink-0
                                     bg-amber-100 dark:bg-amber-400/15 text-amber-700 dark:text-amber-300"
                      >
                        Hot
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] mt-0.5 text-muted-foreground">{deal.client}</p>
                </div>

                <span className="text-[11px] flex-shrink-0 hidden md:block text-muted-foreground">
                  {deal.stage}
                </span>
                <span className="text-[13px] font-semibold tabular-nums flex-shrink-0 text-foreground">
                  {deal.value}
                </span>
                <ArrowUpRight className="w-4 h-4 flex-shrink-0 transition-colors text-muted-foreground group-hover:text-foreground" />
              </motion.button>
            ))}
          </div>
        </DashboardScrollPanel>
      </motion.div>
    </motion.div>
  );
}
