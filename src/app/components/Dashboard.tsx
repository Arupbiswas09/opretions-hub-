'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import Link from 'next/link';
import {
  ChevronRight, Briefcase, Clock, Mail, BarChart3, ArrowUpRight,
  TrendingUp, TrendingDown,
} from 'lucide-react';
import {
  BarChart, Bar as RBar, XAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { easeOutQuart, EASE_OUT_EXPO, staggerFast, fadeInUp, springSnap } from '../lib/motion';
import { useToast } from './bonsai/ToastSystem';
import { useTheme } from '../lib/theme';

/* ─── Inline sparkline — 6-point trend ─────────────────── */
function Sparkline({ values, trend }: { values: number[]; trend: 'up' | 'down' | 'flat' }) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const W = 54, H = 22;
  const pts = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * W;
      const y = H - 3 - ((v - min) / range) * (H - 6);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  const color = trend === 'up' ? 'text-emerald-500 dark:text-emerald-400'
    : trend === 'down' ? 'text-red-400'
    : 'text-stone-400 dark:text-stone-500';
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className={`opacity-80 ${color}`}>
      <polyline
        points={pts}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ─── Animated number counter ───────────────────────────── */
function Num({ to, prefix = '', suffix = '' }: { to: number; prefix?: string; suffix?: string }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const t0 = performance.now();
    const run = (now: number) => {
      const p = Math.min((now - t0) / 1400, 1);
      setV(Math.round(to * easeOutQuart(p)));
      if (p < 1) requestAnimationFrame(run);
    };
    requestAnimationFrame(run);
  }, [to]);
  return <>{prefix}{v.toLocaleString()}{suffix}</>;
}

/* ─── Thin animated progress bar ────────────────────────── */
function ProgressBar({ pct, delay = 0 }: { pct: number; delay?: number }) {
  return (
    <div className="h-[2px] w-full rounded-full overflow-hidden mt-2"
      style={{ background: 'var(--stat-bar-track)' }}>
      <motion.div
        className="h-full rounded-full"
        style={{ background: 'var(--stat-bar-fill)' }}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ delay, duration: 1.0, ease: EASE_OUT_EXPO }}
      />
    </div>
  );
}

/* ─── Weekly activity chart tooltip ─────────────────────── */
function WeekTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-3 py-2.5 text-[11px]"
      style={{
        background: 'var(--user-menu-bg)',
        backdropFilter: 'blur(20px)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-md)',
      }}>
      <p className="font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: p.fill }} />
          <span className="capitalize" style={{ color: 'var(--muted-foreground)' }}>{p.name}:</span>
          <span className="font-medium" style={{ color: 'var(--foreground)' }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Attention item row ─────────────────────────────────── */
function AttentionRow({
  kind, title, meta, due, urgent, idx, actionLabel, onAction,
}: {
  kind: string; title: string; meta: string; due: string;
  urgent: boolean; idx: number; actionLabel: string; onAction?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.22 + idx * 0.055, duration: 0.32, ease: EASE_OUT_EXPO }}
      className="w-full flex items-center gap-5 px-5 py-[16px] text-left group
                 hover:bg-black/[0.02] dark:hover:bg-white/[0.04] transition-colors"
    >
      <div className={`w-[6px] h-[6px] rounded-full flex-shrink-0 ${
        urgent ? 'bg-stone-800 dark:bg-stone-200' : 'bg-stone-300 dark:bg-stone-600'
      }`} />
      <div className="flex-1 min-w-0">
        <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-stone-400 dark:text-stone-500">
          {kind}
        </span>
        <p className={`text-[13px] leading-tight mt-0.5 truncate ${
          urgent
            ? 'font-semibold text-stone-900 dark:text-stone-50'
            : 'font-medium text-stone-700 dark:text-stone-200'
        }`}>{title}</p>
      </div>
      <span className="text-[12px] font-medium tabular-nums flex-shrink-0 text-stone-500 dark:text-stone-400">
        {meta}
      </span>
      <span className={`text-[11px] flex-shrink-0 w-16 text-right tabular-nums ${
        urgent ? 'font-semibold text-stone-700 dark:text-stone-200' : 'text-stone-400 dark:text-stone-500'
      }`}>{due}</span>
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={onAction}
        className="text-[11px] font-semibold flex-shrink-0 flex items-center gap-1 transition-colors
                   text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-50"
      >
        {actionLabel}
        <ArrowUpRight className="w-3 h-3" />
      </motion.button>
    </motion.div>
  );
}

/* ─── Activity row ──────────────────────────────────────── */
function ActivityRow({ text, by, area, t, idx }: {
  text: string; by: string; area: string; t: string; idx: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.28 + idx * 0.05, duration: 0.3, ease: EASE_OUT_EXPO }}
      whileHover={{ x: 2, transition: { duration: 0.12 } }}
      className="flex items-start gap-3.5 py-[13px] group cursor-pointer
                 border-b border-stone-100/60 dark:border-white/[0.06] last:border-0"
    >
      <span className="text-[10px] tabular-nums w-6 pt-[3px] flex-shrink-0 text-right font-medium
                       text-stone-400 dark:text-stone-500">{t}</span>
      <div className="w-[5px] h-[5px] rounded-full mt-[7px] flex-shrink-0 bg-stone-300 dark:bg-white/20" />
      <div className="flex-1 min-w-0">
        <p className="text-[12px] leading-snug
                      text-stone-600 dark:text-stone-300
                      group-hover:text-stone-900 dark:group-hover:text-stone-50 transition-colors">{text}</p>
        <p className="text-[10px] mt-1 text-stone-400 dark:text-stone-500">{by} · {area}</p>
      </div>
    </motion.div>
  );
}

/* ─── Quick-action card ──────────────────────────────────── */
function QuickAction({ label, desc, icon: Icon, href }: {
  label: string; desc: string; icon: React.ElementType; href?: string;
}) {
  const inner = (
    <>
      <div className="w-8 h-8 rounded-[10px] flex items-center justify-center flex-shrink-0
                      bg-black/[0.06] dark:bg-white/[0.08] transition-colors
                      group-hover:bg-black/[0.09] dark:group-hover:bg-white/[0.12]">
        <Icon className="w-4 h-4 transition-colors text-stone-600 dark:text-stone-300
                         group-hover:text-stone-800 dark:group-hover:text-stone-50"
          style={{ strokeWidth: 1.8 }} />
      </div>
      <div className="min-w-0">
        <p className="text-[12px] font-semibold leading-tight text-stone-800 dark:text-stone-100">{label}</p>
        <p className="text-[10px] leading-tight mt-0.5 truncate text-stone-400 dark:text-stone-500">{desc}</p>
      </div>
    </>
  );
  if (href) {
    return (
      <Link href={href}
        className="glass-card flex items-center gap-3 px-4 py-3.5 text-left group hover:-translate-y-0.5 transition-transform">
        {inner}
      </Link>
    );
  }
  return (
    <motion.button
      className="glass-card flex items-center gap-3 px-4 py-3.5 text-left group"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={springSnap}
    >
      {inner}
    </motion.button>
  );
}

/* ─── Workflow stage column ──────────────────────────────── */
function WorkflowStage({ stage, count, items, idx }: {
  stage: string; count: number;
  items: { title: string; assignee: string; urgent?: boolean }[];
  idx: number;
}) {
  const stageOpacity = [1, 0.80, 0.55, 0.35][idx] ?? 0.4;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 + idx * 0.065, duration: 0.35, ease: EASE_OUT_EXPO }}
      className="flex-1 min-w-0"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-[6px] h-[6px] rounded-full bg-stone-800 dark:bg-stone-200"
          style={{ opacity: stageOpacity }} />
        <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-stone-500 dark:text-stone-400">
          {stage}
        </span>
        <span className="text-[10px] font-bold ml-auto text-stone-400 dark:text-stone-500">{count}</span>
      </div>
      <div className="space-y-1.5">
        {items.map((item, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -1, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
            className="rounded-[10px] px-3 py-2.5 cursor-pointer transition-all"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <p className={`text-[11px] leading-tight truncate ${
              item.urgent
                ? 'font-semibold text-stone-800 dark:text-stone-100'
                : 'font-medium text-stone-600 dark:text-stone-300'
            }`}>{item.title}</p>
            <p className="text-[10px] mt-0.5 text-stone-400 dark:text-stone-500">{item.assignee}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

/* ─── Weekly activity data ───────────────────────────────── */
const WEEK_DATA = [
  { day: 'Mon', Sales: 3, People: 5, Finance: 2 },
  { day: 'Tue', Sales: 5, People: 8, Finance: 4 },
  { day: 'Wed', Sales: 2, People: 6, Finance: 1 },
  { day: 'Thu', Sales: 7, People: 9, Finance: 5 },
  { day: 'Fri', Sales: 4, People: 7, Finance: 3 },
  { day: 'Sat', Sales: 1, People: 2, Finance: 0 },
  { day: 'Sun', Sales: 0, People: 1, Finance: 0 },
];

/* ═══════════════════════════════════════════════════════════
   MAIN DASHBOARD
═══════════════════════════════════════════════════════════ */
export default function Dashboard() {
  const { addToast } = useToast();
  const { isDark } = useTheme();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  const approvals = [
    { id: 1, kind: 'Timesheet', title: 'John Doe — Week 2',     meta: '42 hrs',  due: 'Today',    urgent: true,  actionLabel: 'Approve' },
    { id: 2, kind: 'Invoice',   title: 'INV-1245 · Acme Corp',  meta: '$12,400', due: 'Tomorrow', urgent: false, actionLabel: 'Review'  },
    { id: 3, kind: 'Leave',     title: 'Jane Smith — Vacation', meta: '5 days',  due: 'Jan 30',   urgent: false, actionLabel: 'Review'  },
  ];

  const activity = [
    { id: 1, text: 'New deal created — Acme Corp Website Redesign', by: 'Sarah Johnson', t: '5m',  area: 'Sales'    },
    { id: 2, text: 'Project milestone completed — Q1 Launch',        by: 'Mike Torres',  t: '1h',  area: 'Projects' },
    { id: 3, text: 'Invoice #INV-1234 marked as paid',               by: 'Finance',      t: '2h',  area: 'Finance'  },
    { id: 4, text: 'New candidate applied — Senior Designer role',   by: 'HR Team',      t: '3h',  area: 'Talent'   },
  ];

  const quickActions = [
    { label: 'New Deal',      desc: 'Add to sales pipeline', icon: Briefcase, href: '/hub/sales/overview'  },
    { label: 'Log Timesheet', desc: 'Submit this week',       icon: Clock,     href: '/hub/projects/timesheets' },
    { label: 'Invite Client', desc: 'Send portal access',     icon: Mail,      href: '/hub/clients'  },
    { label: 'Run Report',    desc: 'Finance or project',     icon: BarChart3, href: '/hub/finance/overview' },
  ];

  /* KPI definitions — sparkline data + destination href */
  const KPI_CARDS = [
    {
      label: 'Revenue',      val: 485, pre: '$', suf: 'K',
      sub: '+8% this month', trend: 'up' as const,
      spark: [410, 430, 420, 455, 470, 485],
      href: '/hub/finance/overview',
    },
    {
      label: 'Active deals', val: 24, pre: '', suf: '',
      sub: '+3 this quarter', trend: 'up' as const,
      spark: [19, 20, 21, 21, 23, 24],
      href: '/hub/sales/overview',
    },
    {
      label: 'Projects',     val: 18, pre: '', suf: '',
      sub: '3 new this week', trend: 'up' as const,
      spark: [14, 15, 15, 16, 17, 18],
      href: '/hub/projects/list',
    },
    {
      label: 'Team',         val: 42, pre: '', suf: '',
      sub: '2 joined recently', trend: 'flat' as const,
      spark: [40, 40, 41, 41, 42, 42],
      href: '/hub/people/directory',
    },
    {
      label: 'Q1 Target',   val: 92, pre: '', suf: '%',
      sub: '$485K of $530K', trend: 'up' as const,
      spark: [72, 78, 82, 86, 89, 92],
      bar: true, barPct: 92,
    },
  ];

  /* Chart colors switch with theme */
  const chartColors = isDark
    ? { sales: 'rgba(251,191,36,0.75)', people: 'rgba(139,92,246,0.60)', finance: 'rgba(20,184,166,0.55)' }
    : { sales: 'rgba(28,25,23,0.55)',   people: 'rgba(120,113,108,0.40)', finance: 'rgba(68,64,60,0.35)' };

  const glassPanel: React.CSSProperties = {
    border: '1px solid var(--border)',
    background: 'var(--glass-bg)',
    backdropFilter: 'blur(24px) saturate(180%)',
    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
  };

  return (
    <div className="px-10 py-8 max-w-[1120px]">

      {/* ═══ Hero greeting ═════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 12, filter: 'blur(2px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
        className="mb-8"
      >
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.08em] uppercase mb-2
                          text-stone-400 dark:text-stone-500">{dateStr}</p>
            <h1 className="text-[40px] leading-[1.1] font-semibold tracking-[-0.03em]
                           text-stone-900 dark:text-stone-50">{greeting}, John.</h1>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.18, duration: 0.35 }}
            className="text-[12px] pb-1.5 flex items-center gap-3 text-stone-400 dark:text-stone-500"
          >
            <span>
              <span className="font-semibold text-stone-700 dark:text-stone-200">3</span> pending sign-offs
            </span>
            <span className="text-stone-300 dark:text-stone-600">·</span>
            <span>
              <span className="font-semibold text-stone-700 dark:text-stone-200">$485K</span> pipeline
            </span>
          </motion.p>
        </div>
      </motion.div>

      {/* ═══ KPI row — sparklines + links ══════════════════════ */}
      <motion.div
        className="flex items-stretch gap-0 mb-8 rounded-2xl overflow-hidden"
        style={{ border: '1px solid var(--border)', background: 'transparent' }}
        variants={staggerFast}
        initial="hidden"
        animate="visible"
      >
        {KPI_CARDS.map((s, i) => (
          <motion.div
            key={s.label}
            className="flex-1 flex flex-col justify-between px-5 py-5 group cursor-pointer
                       hover:bg-white/[0.04] dark:hover:bg-white/[0.03] transition-colors"
            style={{
              background: 'var(--glass-bg)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              borderRight: i < KPI_CARDS.length - 1 ? '1px solid var(--border)' : 'none',
            }}
            variants={fadeInUp}
            onClick={() => s.href && (window.location.href = s.href)}
          >
            {/* Header: label + sparkline */}
            <div className="flex items-start justify-between mb-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em]
                            text-stone-400 dark:text-stone-500">{s.label}</p>
              <Sparkline values={s.spark} trend={s.trend} />
            </div>

            {/* Main number */}
            <p className="text-[28px] font-bold leading-none tracking-[-0.025em]
                          text-stone-900 dark:text-stone-50">
              <Num to={s.val} prefix={s.pre} suffix={s.suf} />
            </p>

            {/* Progress bar for target */}
            {s.bar && <ProgressBar pct={s.barPct!} delay={0.6} />}

            {/* Footer: trend delta */}
            <div className="flex items-center gap-1 mt-2">
              {s.trend === 'up'
                ? <TrendingUp className="w-3 h-3 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
                : <TrendingDown className="w-3 h-3 text-stone-400 dark:text-stone-500 flex-shrink-0" />
              }
              <p className="text-[10px] text-stone-400 dark:text-stone-500">{s.sub}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ═══ Two-column: Workflows + Attention ═════════════════ */}
      <div className="grid grid-cols-[1fr_380px] gap-5 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.20, duration: 0.4, ease: EASE_OUT_EXPO }}
        >
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2.5">
              <h2 className="text-[14px] font-semibold tracking-[-0.01em] text-stone-800 dark:text-stone-100">
                Active Workflows
              </h2>
              <span className="text-[10px] font-bold text-stone-400 dark:text-stone-500">12</span>
            </div>
            <Link href="/hub/projects"
              className="text-[11px] flex items-center gap-1 group transition-colors
                         text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-200">
              Board <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          <div className="rounded-2xl overflow-hidden p-4" style={glassPanel}>
            <div className="flex gap-3">
              <WorkflowStage idx={0} stage="To Do" count={4} items={[
                { title: 'Q2 budget review',  assignee: 'Finance · Sarah K.', urgent: true },
                { title: 'Update SOW — Acme', assignee: 'Sales · Mike T.' },
              ]} />
              <WorkflowStage idx={1} stage="In Progress" count={5} items={[
                { title: 'Website Redesign v2',  assignee: 'Projects · Jane S.', urgent: true },
                { title: 'Onboard contractors',  assignee: 'People · HR Team' },
              ]} />
              <WorkflowStage idx={2} stage="Review" count={2} items={[
                { title: 'INV-1245 · Acme', assignee: 'Finance · John D.', urgent: true },
              ]} />
              <WorkflowStage idx={3} stage="Done" count={1} items={[
                { title: 'Portal launch', assignee: 'Projects · Team A' },
              ]} />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.4, ease: EASE_OUT_EXPO }}
        >
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2.5">
              <h2 className="text-[14px] font-semibold tracking-[-0.01em] text-stone-800 dark:text-stone-100">
                Needs attention
              </h2>
              <span className="w-[18px] h-[18px] rounded-full text-[9px] font-bold flex items-center justify-center
                               bg-stone-800 dark:bg-white/15 text-white dark:text-stone-100">
                {approvals.length}
              </span>
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden divide-y divide-stone-100/60 dark:divide-white/[0.07]"
            style={glassPanel}>
            {approvals.map((a, i) => (
              <AttentionRow
                key={a.id}
                {...a}
                idx={i}
                onAction={() => addToast(
                  a.actionLabel === 'Approve'
                    ? `${a.title} approved successfully`
                    : `Opened ${a.title} for review`,
                  'success',
                )}
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* ═══ Quick Actions ═════════════════════════════════════ */}
      <motion.div className="mb-8"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.24, duration: 0.35, ease: EASE_OUT_EXPO }}>
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] mb-3
                      text-stone-400 dark:text-stone-500">Quick Actions</p>
        <div className="grid grid-cols-4 gap-2.5">
          {quickActions.map((a) => <QuickAction key={a.label} {...a} />)}
        </div>
      </motion.div>

      {/* ═══ Three-column: Activity + Weekly chart + Role ══════ */}
      <div className="grid grid-cols-[1fr_200px_220px] gap-5">

        {/* Activity feed */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.4, ease: EASE_OUT_EXPO }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[14px] font-semibold tracking-[-0.01em] text-stone-800 dark:text-stone-100">
              Today
            </h2>
            <Link href="/hub/admin"
              className="text-[11px] flex items-center gap-1 group transition-colors
                         text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-200">
              View all <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          <div>
            {activity.map((a, i) => <ActivityRow key={a.id} {...a} idx={i} />)}
          </div>
        </motion.div>

        {/* Weekly activity bar chart */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.30, duration: 0.4, ease: EASE_OUT_EXPO }}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] mb-3
                        text-stone-400 dark:text-stone-500">This week</p>
          <div className="rounded-2xl p-4" style={glassPanel}>
            {/* Legend */}
            <div className="flex flex-wrap gap-x-3 gap-y-1 mb-3">
              {[
                { name: 'Sales',   color: chartColors.sales   },
                { name: 'People',  color: chartColors.people  },
                { name: 'Finance', color: chartColors.finance },
              ].map(l => (
                <div key={l.name} className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: l.color }} />
                  <span className="text-[9px] font-medium text-stone-400 dark:text-stone-500">{l.name}</span>
                </div>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={110}>
              <BarChart data={WEEK_DATA} barSize={8} barCategoryGap="30%">
                <XAxis
                  dataKey="day"
                  tickLine={false} axisLine={false}
                  tick={{ fontSize: 9, fill: isDark ? '#57534e' : '#a8a29e', fontWeight: 500 }}
                  dy={4}
                />
                <Tooltip content={<WeekTooltip />} cursor={false} />
                <RBar dataKey="Sales"   stackId="a" fill={chartColors.sales}   radius={[0, 0, 0, 0]} />
                <RBar dataKey="People"  stackId="a" fill={chartColors.people}  radius={[0, 0, 0, 0]} />
                <RBar dataKey="Finance" stackId="a" fill={chartColors.finance} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Your role context */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.32, duration: 0.4, ease: EASE_OUT_EXPO }}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] mb-3
                        text-stone-400 dark:text-stone-500">Your role</p>
          <div className="rounded-2xl overflow-hidden p-4 space-y-2.5" style={glassPanel}>
            <div className="flex items-center gap-3 pb-2.5 border-b border-stone-100 dark:border-white/[0.08]">
              <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-white"
                style={{ background: 'linear-gradient(145deg,#292524,#57534e)' }}>
                JD
              </div>
              <div>
                <p className="text-[13px] font-semibold leading-tight text-stone-900 dark:text-stone-50">John Doe</p>
                <p className="text-[11px] text-stone-400 dark:text-stone-500">Operations Manager</p>
              </div>
            </div>
            {[
              { label: 'Open approvals',  val: '3',         actionable: true,  href: '/hub/people/approvals' },
              { label: 'My timesheets',   val: '1 pending', actionable: true,  href: '/hub/projects/timesheets' },
              { label: 'Active projects', val: '18',        actionable: false, href: '/hub/projects/list' },
              { label: 'Team capacity',   val: '87%',       actionable: false  },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href ?? '#'}
                className="w-full flex items-center justify-between group py-0.5 hover:no-underline"
              >
                <div className="flex items-center gap-2">
                  <div className={`w-[5px] h-[5px] rounded-full ${
                    item.actionable ? 'bg-stone-700 dark:bg-stone-300' : 'bg-stone-300 dark:bg-stone-600'
                  }`} />
                  <span className="text-[12px] transition-colors
                                   text-stone-500 dark:text-stone-400
                                   group-hover:text-stone-800 dark:group-hover:text-stone-100">
                    {item.label}
                  </span>
                </div>
                <span className={`text-[12px] ${
                  item.actionable ? 'font-bold text-stone-800 dark:text-stone-100' : 'font-medium text-stone-500 dark:text-stone-400'
                }`}>{item.val}</span>
              </Link>
            ))}
            <div className="pt-2 border-t border-stone-100 dark:border-white/[0.08]">
              <p className="text-[11px] text-stone-400 dark:text-stone-500">
                Pipeline up{' '}
                <span className="font-semibold text-stone-700 dark:text-stone-200">12%</span>
                {' '}vs last quarter
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
