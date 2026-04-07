'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import Link from 'next/link';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { Plus, Check, TrendingUp, Clock, Users, ChevronRight, FolderKanban, Inbox, Timer } from 'lucide-react';
import { easeOutQuart } from '../lib/motion';
import { useTheme } from '../lib/theme';
import { dashboardFoldRootRelaxedClass, DashboardScrollPanel } from './dashboard/DashboardFoldLayout';

/* ── Framer Motion stagger variants ── */
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

/* ─── Animated counter ─── */
function Num({ to, prefix = '' }: { to: number; prefix?: string }) {
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
  return <>{prefix}{v.toLocaleString()}</>;
}

/* ─── Custom tooltip ─── */
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg px-3 py-2 text-[11px]"
      style={{
        background: 'var(--popover)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-md)',
      }}>
      <p className="font-medium mb-1" style={{ color: 'var(--foreground)' }}>{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: p.color || p.fill }} />
          <span className="capitalize" style={{ color: 'var(--muted-foreground)' }}>{p.name}:</span>
          <span className="font-medium" style={{ color: 'var(--foreground)' }}>
            {typeof p.value === 'number' && p.value > 1000 ? `$${(p.value/1000).toFixed(0)}K` : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ─── Glass panel — minimal chrome, readable blur (Ops Hub aesthetic) ─── */
function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl overflow-hidden ${className}`}
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(20px) saturate(var(--glass-saturate))',
        WebkitBackdropFilter: 'blur(20px) saturate(var(--glass-saturate))',
        border: '1px solid color-mix(in srgb, var(--border) 92%, transparent)',
        boxShadow:
          'var(--shadow-sm), inset 0 1px 0 color-mix(in srgb, var(--foreground) 6%, transparent)',
      }}
    >
      {children}
    </div>
  );
}

/* ─── P&L data ─── */
const PNL_DATA = [
  { month: "Oct '25", revenue: 113000, expenses: 87000 },
  { month: "Nov '25", revenue: 138000, expenses: 91000 },
  { month: "Dec '25", revenue: 128000, expenses: 95000 },
  { month: "Jan '26", revenue: 145000, expenses: 99000 },
  { month: "Feb '26", revenue: 138000, expenses: 94000 },
  { month: "Mar '26", revenue: 152000, expenses: 101000 },
  { month: "Apr '26", revenue: 148000, expenses: 98000 },
];

/* ─── Time tracked data ─── */
const TIME_DATA = [
  { day: 'Apr 01', hours: 6.5 },
  { day: 'Apr 04', hours: 7.0 },
  { day: 'Apr 06', hours: 5.5 },
  { day: 'Apr 08', hours: 8.0 },
  { day: 'Apr 10', hours: 6.0 },
  { day: 'Apr 12', hours: 7.5 },
  { day: 'Apr 14', hours: 4.0 },
  { day: 'Apr 16', hours: 7.0 },
  { day: 'Apr 18', hours: 8.5 },
  { day: 'Apr 20', hours: 6.0 },
  { day: 'Apr 22', hours: 7.0 },
  { day: 'Apr 24', hours: 5.5 },
  { day: 'Apr 26', hours: 3.0 },
  { day: 'Apr 28', hours: 0 },
  { day: 'Apr 30', hours: 0 },
];

/* ─── Project timeline ─── */
const PROJECTS_TIMELINE = [
  { name: 'Website Redesign', start: 10, end: 75, color: '#2563EB' },
  { name: 'Mobile App Dev', start: 20, end: 90, color: '#1D4ED8' },
  { name: 'Brand Identity', start: 0, end: 55, color: '#3B82F6' },
];

/** Doc §4.1 — pending approvals widget → real approval routes */
const PENDING_APPROVALS = [
  { id: 'ts', title: 'Timesheets', subtitle: 'John Doe · Week 2 · 42h', href: '/hub/projects/approvals', badge: '3' },
  { id: 'leave', title: 'People & leave', subtitle: 'Jane Smith · Feb 10–14', href: '/hub/people/approvals', badge: '1' },
  { id: 'inv', title: 'Invoice review', subtitle: 'Q1 close checklist', href: '/hub/finance/invoices', badge: null },
] as const;

/* ─── Tasks ─── */
const TASKS = [
  { id: 1, title: 'Review Q2 budget proposal', project: 'Acme Corp', done: false },
  { id: 2, title: 'Send SOW to Tech Startup', project: 'Tech Startup Inc', done: false },
  { id: 3, title: 'Approve timesheet — Jane S.', project: 'Internal', done: true },
  { id: 4, title: 'Finalize brand guidelines', project: 'Local Retail Co', done: true },
];

const fmt = (v: number) => `$${(v / 1000).toFixed(0)}K`;

const glassKpiStyle: React.CSSProperties = {
  background: 'var(--glass-bg)',
  backdropFilter: 'blur(20px) saturate(var(--glass-saturate))',
  WebkitBackdropFilter: 'blur(20px) saturate(var(--glass-saturate))',
  border: '1px solid color-mix(in srgb, var(--border) 92%, transparent)',
  boxShadow: 'var(--shadow-sm), inset 0 1px 0 color-mix(in srgb, var(--foreground) 5%, transparent)',
};

const ACTIVITY_ITEMS = [
  { text: 'New project', time: 'Apr 5 · 9:54 PM', emphasis: true },
  { text: 'Workspace updated', time: 'Apr 5 · 9:54 PM', emphasis: false },
  { text: 'Invoice INV-2026-001 sent', time: 'Apr 5 · 8:30 PM', emphasis: true },
  { text: 'Proposal · Acme', time: 'Apr 4 · 2:12 PM', emphasis: false },
] as const;

function ActivitySpineFeed() {
  const lineColor = 'color-mix(in srgb, var(--muted-foreground) 32%, transparent)';
  const softDot = 'color-mix(in srgb, var(--muted-foreground) 48%, transparent)';

  return (
    <div className="relative min-w-0">
      <div
        className="pointer-events-none absolute left-[5px] top-2 bottom-2 w-px border-l border-dashed"
        style={{ borderColor: lineColor }}
        aria-hidden
      />
      <ul className="m-0 list-none p-0">
        {ACTIVITY_ITEMS.map((row, i) => (
          <li key={i} className="relative flex gap-4 pb-6 last:pb-0">
            <div className="relative z-[1] flex w-3 shrink-0 justify-center pt-1">
              {row.emphasis ? (
                <span
                  className="box-border h-2.5 w-2.5 shrink-0 rounded-full border-2 bg-transparent"
                  style={{ borderColor: 'var(--primary)' }}
                  aria-hidden
                />
              ) : (
                <span
                  className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ background: softDot }}
                  aria-hidden
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] leading-[1.45]" style={{ color: 'var(--foreground)' }}>
                {row.text}
              </p>
              <p className="mt-1.5 text-[11px] tabular-nums" style={{ color: 'var(--muted-foreground)' }}>
                {row.time}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Dashboard() {
  const { isDark } = useTheme();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const [tasks, setTasks] = useState(TASKS);
  const toggleTask = (id: number) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const pendingApprovalsCount = PENDING_APPROVALS.reduce((n, r) => n + (r.badge ? Number(r.badge) : 0), 0);
  const lastRev = PNL_DATA[PNL_DATA.length - 1]?.revenue ?? 0;

  /* ATCON blue chart system */
  const chartStroke = '#2563EB';
  const chartStroke2 = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)';
  const gridColor = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)';
  const tickColor = isDark ? 'rgba(255,255,255,0.30)' : 'rgba(0,0,0,0.35)';
  const barColor = '#2563EB';

  const totalHours = TIME_DATA.reduce((s, d) => s + d.hours, 0);
  const billableHours = Math.round(totalHours * 0.78);

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className={dashboardFoldRootRelaxedClass}
    >
      {/* Header */}
      <motion.div variants={item} className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[12px] font-normal sm:text-[13px]" style={{ color: 'var(--muted-foreground)' }}>
            {dateStr}
          </p>
          <h1
            className="mt-0.5 text-[20px] font-semibold leading-tight tracking-[-0.02em] sm:text-[24px]"
            style={{ color: 'var(--foreground)' }}
          >
            {greeting}, John.
          </h1>
        </div>

        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-opacity hover:opacity-90"
            style={{ background: 'var(--glass-bg)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
          >
            <Plus className="w-3.5 h-3.5" />
            New
          </button>
        </div>
      </motion.div>

      {/* KPI strip — number-first hierarchy, calmer density */}
      <motion.div variants={item} className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Revenue', value: fmt(lastRev), icon: <TrendingUp className="h-4 w-4 opacity-45" /> },
          { label: 'Billable', value: `${billableHours}h`, icon: <Clock className="h-4 w-4 opacity-45" /> },
          { label: 'Inbox', value: pendingApprovalsCount.toString(), icon: <Inbox className="h-4 w-4 opacity-45" /> },
          { label: 'Clients', value: '12', icon: <Users className="h-4 w-4 opacity-45" /> },
        ].map((k) => (
          <div key={k.label} className="min-w-0 rounded-2xl px-4 py-4 sm:px-5 sm:py-5" style={glassKpiStyle}>
            <div className="flex items-start justify-between gap-2">
              <p className="text-[22px] font-semibold leading-none tabular-nums sm:text-[24px]" style={{ color: 'var(--foreground)' }}>
                {k.value}
              </p>
              <span className="shrink-0" style={{ color: 'var(--muted-foreground)' }}>
                {k.icon}
              </span>
            </div>
            <p className="mt-3 text-[12px] font-medium" style={{ color: 'var(--muted-foreground)' }}>
              {k.label}
            </p>
          </div>
        ))}
      </motion.div>

      {/* Primary grid: left = stacked glass modules; right = feed + workflows */}
      <motion.div
        variants={item}
        className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(300px,340px)] lg:items-start lg:gap-5"
      >
        <div className="flex min-w-0 flex-col gap-4 lg:gap-5">
          {/* Project delivery */}
          <Section className="min-w-0">
            <div
              className="flex items-center gap-2 px-5 py-3.5 sm:px-6 sm:py-4"
              style={{ borderBottom: '1px solid color-mix(in srgb, var(--border) 80%, transparent)' }}
            >
              <FolderKanban className="h-4 w-4 shrink-0 opacity-70" style={{ color: 'var(--muted-foreground)' }} />
              <h2 className="text-[15px] font-semibold tracking-[-0.02em]" style={{ color: 'var(--foreground)' }}>
                Projects
              </h2>
            </div>
            <div className="px-5 pb-5 pt-5 sm:px-6 sm:pb-6">
              <div className="mb-4 flex items-center justify-between px-0.5">
                {['MAR 22', 'TODAY', 'APR 19'].map((d, i) => (
                  <span
                    key={d}
                    className="text-[10px] font-medium tracking-wide"
                    style={{ color: i === 1 ? 'var(--foreground)' : 'var(--muted-foreground)' }}
                  >
                    {d}
                  </span>
                ))}
              </div>
              <div className="space-y-3">
                {PROJECTS_TIMELINE.map((proj) => (
                  <div key={proj.name} className="flex items-center">
                    <div
                      className="relative h-7 w-full overflow-hidden rounded-lg sm:h-8"
                      style={{
                        background: 'color-mix(in srgb, var(--muted-foreground) 8%, transparent)',
                      }}
                    >
                      <div
                        className="absolute top-0 bottom-0 flex items-center rounded-lg px-3"
                        style={{
                          left: `${proj.start}%`,
                          width: `${proj.end - proj.start}%`,
                          background: `${proj.color}18`,
                          border: `1px solid ${proj.color}40`,
                        }}
                      >
                        <span className="truncate text-[11px] font-medium sm:text-[12px]" style={{ color: 'var(--foreground)' }}>
                          {proj.name}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          {/* Profit & loss */}
          <Section className="min-w-0">
            <div
              className="flex flex-col gap-3 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4"
              style={{ borderBottom: '1px solid color-mix(in srgb, var(--border) 80%, transparent)' }}
            >
              <h2 className="text-[15px] font-semibold tracking-[-0.02em]" style={{ color: 'var(--foreground)' }}>
                P&amp;L
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  className="cursor-pointer appearance-none rounded-lg px-2.5 py-1.5 text-[11px] sm:text-[12px]"
                  style={{
                    background: 'color-mix(in srgb, var(--background) 40%, transparent)',
                    border: '1px solid color-mix(in srgb, var(--border) 90%, transparent)',
                    color: 'var(--muted-foreground)',
                  }}
                >
                  <option>USD</option>
                </select>
                <select
                  className="cursor-pointer appearance-none rounded-lg px-2.5 py-1.5 text-[11px] sm:text-[12px]"
                  style={{
                    background: 'color-mix(in srgb, var(--background) 40%, transparent)',
                    border: '1px solid color-mix(in srgb, var(--border) 90%, transparent)',
                    color: 'var(--foreground)',
                  }}
                >
                  <option>Last 6 months</option>
                  <option>This year</option>
                </select>
              </div>
            </div>
            <div className="px-3 pb-4 pt-3 sm:px-5 sm:pb-5">
              <ResponsiveContainer width="100%" height={176}>
                <AreaChart data={PNL_DATA} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="dashRevGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={chartStroke} stopOpacity={0.14} />
                      <stop offset="100%" stopColor={chartStroke} stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10, fill: tickColor, fontWeight: 500 }}
                    dy={6}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10, fill: tickColor, fontWeight: 500 }}
                    tickFormatter={fmt}
                  />
                  <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'var(--border)', strokeWidth: 1 }} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="revenue"
                    stroke={chartStroke}
                    strokeWidth={2}
                    fill="url(#dashRevGrad)"
                    dot={false}
                    activeDot={{ r: 3, fill: chartStroke, stroke: isDark ? '#111' : '#fff', strokeWidth: 2 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    name="expenses"
                    stroke={chartStroke2}
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    fill="none"
                    dot={false}
                    activeDot={{ r: 3, fill: chartStroke2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Section>

          {/* Time tracking — explicit module + route to full timer */}
          <Section className="min-w-0">
            <div
              className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 sm:px-6 sm:py-4"
              style={{ borderBottom: '1px solid color-mix(in srgb, var(--border) 80%, transparent)' }}
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <Timer className="h-4 w-4 shrink-0 opacity-70" style={{ color: 'var(--primary)' }} aria-hidden />
                <div className="min-w-0">
                  <h2 className="text-[15px] font-semibold tracking-[-0.02em]" style={{ color: 'var(--foreground)' }}>
                    Time
                  </h2>
                  <p className="text-[13px] font-medium tabular-nums" style={{ color: 'var(--muted-foreground)' }}>
                    {totalHours.toFixed(0)}h · {billableHours}h billable
                  </p>
                </div>
              </div>
              <Link
                href="/hub/timetracking"
                className="inline-flex shrink-0 items-center gap-0.5 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-opacity hover:opacity-85"
                style={{
                  color: 'var(--primary)',
                }}
              >
                Open
                <ChevronRight className="h-4 w-4 opacity-80" />
              </Link>
            </div>
            <div className="px-3 pb-5 pt-3 sm:px-6 sm:pb-6">
              <div className="mb-3 flex justify-end sm:pl-1">
                <select
                  className="w-fit max-w-full cursor-pointer appearance-none rounded-lg px-2.5 py-1.5 text-[11px] sm:text-[12px]"
                  style={{
                    background: 'color-mix(in srgb, var(--background) 40%, transparent)',
                    border: '1px solid color-mix(in srgb, var(--border) 90%, transparent)',
                    color: 'var(--foreground)',
                  }}
                >
                  <option>This month</option>
                  <option>Last month</option>
                </select>
              </div>
              <ResponsiveContainer width="100%" height={128}>
                <BarChart data={TIME_DATA} barSize={9}>
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 9, fill: tickColor, fontWeight: 500 }}
                    dy={4}
                    interval={2}
                  />
                  <Tooltip content={<ChartTooltip />} cursor={false} />
                  <Bar dataKey="hours" name="hours" fill={barColor} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Section>
        </div>

        {/* Right column: command center panels */}
        <div className="flex min-w-0 flex-col gap-4 lg:gap-5">
          {/* Activity */}
          <Section className="min-w-0">
            <div
              className="flex items-center justify-between px-5 py-4 sm:px-6"
              style={{ borderBottom: '1px solid color-mix(in srgb, var(--border) 80%, transparent)' }}
            >
              <h2 className="text-[15px] font-semibold tracking-[-0.02em]" style={{ color: 'var(--foreground)' }}>
                Activity
              </h2>
            </div>
            <div className="px-5 py-5 sm:px-6 sm:py-6">
              <DashboardScrollPanel size="sm">
                <ActivitySpineFeed />
              </DashboardScrollPanel>
            </div>
          </Section>

          {/* Pending approvals */}
          <Section className="min-w-0">
            <div
              className="flex items-center justify-between px-5 py-4 sm:px-6"
              style={{ borderBottom: '1px solid color-mix(in srgb, var(--border) 80%, transparent)' }}
            >
              <h2 className="text-[15px] font-semibold tracking-[-0.02em]" style={{ color: 'var(--foreground)' }}>
                Approvals
              </h2>
              <Link
                href="/hub/projects/approvals"
                className="text-[12px] font-medium transition-opacity hover:opacity-80"
                style={{ color: 'var(--primary)' }}
              >
                All
              </Link>
            </div>
            <DashboardScrollPanel size="sm">
              <div>
                {PENDING_APPROVALS.map((row, i) => (
                  <Link
                    key={row.id}
                    href={row.href}
                    className="flex items-center gap-3 px-5 py-4 transition-colors hover:bg-white/[0.03] sm:px-6"
                    style={{ borderBottom: i < PENDING_APPROVALS.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-[13px] font-medium truncate" style={{ color: 'var(--foreground)' }}>
                          {row.title}
                        </p>
                        {row.badge ? (
                          <span
                            className="text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded-md shrink-0"
                            style={{ background: 'var(--warning-muted)', color: 'var(--warning)' }}
                          >
                            {row.badge}
                          </span>
                        ) : null}
                      </div>
                      <p className="text-[11px] mt-0.5 truncate" style={{ color: 'var(--muted-foreground)' }}>
                        {row.subtitle}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 shrink-0" style={{ color: 'var(--muted-foreground)' }} />
                  </Link>
                ))}
              </div>
            </DashboardScrollPanel>
          </Section>

          {/* My Tasks */}
          <Section className="min-w-0">
            <div
              className="flex items-center justify-between px-5 py-4 sm:px-6"
              style={{ borderBottom: '1px solid color-mix(in srgb, var(--border) 80%, transparent)' }}
            >
              <h2 className="text-[15px] font-semibold tracking-[-0.02em]" style={{ color: 'var(--foreground)' }}>
                Tasks
              </h2>
              <button type="button" className="text-[12px] font-medium flex items-center gap-1" style={{ color: 'var(--primary)' }}>
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <DashboardScrollPanel size="md">
              <div>
                {tasks.length === 0 ? (
                  <div className="px-5 py-8 text-center sm:px-6">
                    <p className="text-[13px]" style={{ color: 'var(--muted-foreground)' }}>
                      Nothing here yet.
                    </p>
                    <button type="button" className="mt-2 text-[13px] font-medium" style={{ color: 'var(--primary)' }}>
                      Add task
                    </button>
                  </div>
                ) : (
                  <div>
                    {tasks.map((task, i) => (
                      <button
                        type="button"
                        key={task.id}
                        onClick={() => toggleTask(task.id)}
                        className="w-full flex items-center gap-3 px-5 py-3.5 text-left transition-colors sm:px-6"
                        style={{ borderBottom: i < tasks.length - 1 ? '1px solid var(--border)' : 'none' }}
                      >
                        <div
                          className="w-[18px] h-[18px] rounded-[4px] flex items-center justify-center flex-shrink-0 transition-colors"
                          style={{
                            border: task.done ? 'none' : '1.5px solid var(--border-strong)',
                            background: task.done ? '#2563EB' : 'transparent',
                          }}
                        >
                          {task.done && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-[13px] truncate ${task.done ? 'line-through' : ''}`}
                            style={{ color: task.done ? 'var(--muted-foreground)' : 'var(--foreground)' }}
                          >
                            {task.title}
                          </p>
                        </div>
                        <span className="text-[11px] flex-shrink-0" style={{ color: 'var(--muted-foreground)' }}>
                          {task.project}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </DashboardScrollPanel>
          </Section>
        </div>
      </motion.div>
    </motion.div>
  );
}
