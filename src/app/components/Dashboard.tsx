'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { Plus, Check, TrendingUp, Clock, Users, ChevronRight, FolderKanban, Inbox, Timer } from 'lucide-react';
import { easeOutQuart } from '../lib/motion';
import { useTheme } from '../lib/theme';
import { dashboardFoldRootRelaxedClass, DashboardScrollPanel } from './dashboard/DashboardFoldLayout';
import { useHubData } from '../lib/hub/use-hub-data';
import { listTasks, updateTask, type TaskRow } from '../lib/api/hub-api';
import { dispatchQuickCreate, type QuickCreateKind } from '../lib/hub-events';

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

const fmt = (v: number) => `$${(v / 1000).toFixed(0)}K`;

const glassKpiStyle: React.CSSProperties = {
  background: 'var(--glass-bg)',
  backdropFilter: 'blur(20px) saturate(var(--glass-saturate))',
  WebkitBackdropFilter: 'blur(20px) saturate(var(--glass-saturate))',
  border: '1px solid color-mix(in srgb, var(--border) 92%, transparent)',
  boxShadow: 'var(--shadow-sm), inset 0 1px 0 color-mix(in srgb, var(--foreground) 5%, transparent)',
};

interface ActivityItem { text: string; time: string; emphasis: boolean; }
interface ApprovalItem { id: string; title: string; subtitle: string; href: string; badge: string | null; }

function ActivitySpineFeed({ items }: { items: ActivityItem[] }) {
  const lineColor = 'color-mix(in srgb, var(--muted-foreground) 32%, transparent)';
  const softDot = 'color-mix(in srgb, var(--muted-foreground) 48%, transparent)';

  if (items.length === 0) {
    return <p className="text-[13px] py-4" style={{ color: 'var(--muted-foreground)' }}>No recent activity.</p>;
  }

  return (
    <div className="relative min-w-0">
      <div
        className="pointer-events-none absolute left-[5px] top-2 bottom-2 w-px border-l border-dashed"
        style={{ borderColor: lineColor }}
        aria-hidden
      />
      <ul className="m-0 list-none p-0">
        {items.map((row, i) => (
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

  /* ── Quick New dropdown ── */
  const [quickNewOpen, setQuickNewOpen] = useState(false);
  const quickNewRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (quickNewRef.current && !quickNewRef.current.contains(e.target as Node)) setQuickNewOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  const quickItems: { label: string; kind: QuickCreateKind }[] = [
    { label: 'Task', kind: 'task' },
    { label: 'Project', kind: 'project' },
    { label: 'Deal', kind: 'deal' },
    { label: 'Client', kind: 'client' },
    { label: 'Invoice', kind: 'invoice' },
    { label: 'Expense', kind: 'expense' },
    { label: 'Contact', kind: 'contact' },
    { label: 'Time Entry', kind: 'time' },
  ];

  /* ── Live data hooks ── */
  const { data: kpi } = useHubData<{
    revenue: number; expenses: number; billable_hours: number;
    pending_approvals: number; active_clients: number; active_projects: number;
    open_tasks: number; total_tasks: number;
  }>('/api/kpi/dashboard');

  const { data: tasksRaw } = useHubData<TaskRow[]>('/api/tasks?limit=8');
  const tasks = (tasksRaw ?? []).map(t => ({
    id: t.id, title: t.title, project: t.project_name ?? 'Internal', done: t.status === 'done' || t.status === 'completed',
  }));

  const toggleTask = useCallback(async (id: string) => {
    const task = tasksRaw?.find(t => t.id === id);
    if (!task) return;
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    await updateTask(id, { status: newStatus });
  }, [tasksRaw]);

  const { data: approvalsRaw } = useHubData<Array<{ id: string; type: string; payload: Record<string, unknown>; amount: number | null }>>('/api/approvals?status=pending&limit=10');
  const pendingApprovals: ApprovalItem[] = (approvalsRaw ?? []).slice(0, 5).map(a => {
    const p = a.payload ?? {};
    const typeMap: Record<string, { title: string; href: string }> = {
      timesheet: { title: 'Timesheets', href: '/hub/projects/approvals' },
      leave: { title: 'People & leave', href: '/hub/people/approvals' },
      expense: { title: 'Expense review', href: '/hub/people/approvals' },
      invoice: { title: 'Invoice review', href: '/hub/finance/invoices' },
    };
    const info = typeMap[a.type] ?? { title: a.type, href: '/hub/admin' };
    return { id: a.id, ...info, subtitle: String(p.employee ?? p.description ?? p.invoice_number ?? ''), badge: null };
  });
  const pendingApprovalsCount = approvalsRaw?.length ?? 0;

  const { data: projectsRaw } = useHubData<Array<{ id: string; name: string; status: string; start_date: string | null; end_date: string | null }>>('/api/projects?status=active&limit=5');
  const PROJECTS_TIMELINE = (projectsRaw ?? []).map((p, i) => {
    const colors = ['#2563EB', '#1D4ED8', '#3B82F6', '#0284C7', '#6366F1'];
    const start = Math.max(0, Math.min(80, i * 15));
    const end = Math.min(100, start + 40 + Math.random() * 25);
    return { name: p.name, start, end, color: colors[i % colors.length] };
  });

  const { data: activityRaw } = useHubData<Array<{ action: string; entity_type: string; metadata: Record<string, unknown>; created_at: string }>>('/api/admin/activity-log?limit=6');
  const activityItems: ActivityItem[] = (activityRaw ?? []).map(a => {
    const meta = a.metadata ?? {};
    const text = `${a.action.charAt(0).toUpperCase() + a.action.slice(1)} ${String(meta.name ?? meta.title ?? meta.number ?? a.entity_type)}`;
    const d = new Date(a.created_at);
    const time = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' · ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    return { text, time, emphasis: ['created', 'sent'].includes(a.action) };
  });

  const { data: timeRaw } = useHubData<Array<{ entry_date: string; hours: number }>>('/api/time-entries?limit=30');
  const TIME_DATA = (timeRaw ?? []).map(e => ({ day: new Date(e.entry_date + 'T12:00').toLocaleDateString('en-US', { month: 'short', day: '2-digit' }), hours: e.hours })).reverse();

  const { data: invoicesRaw } = useHubData<Array<{ total: number; status: string }>>('/api/invoices?limit=200');
  const PNL_DATA = (() => {
    const months: Record<string, { revenue: number; expenses: number }> = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    for (let m = 6; m >= 0; m--) {
      const d = new Date(); d.setMonth(d.getMonth() - m);
      const key = `${monthNames[d.getMonth()]} '${String(d.getFullYear()).slice(2)}`;
      months[key] = { revenue: 0, expenses: 0 };
    }
    (invoicesRaw ?? []).forEach(inv => {
      if (inv.status === 'paid' || inv.status === 'sent') {
        const first = Object.keys(months).pop();
        if (first && months[first]) months[first].revenue += Number(inv.total ?? 0);
      }
    });
    return Object.entries(months).map(([month, v]) => ({ month, ...v }));
  })();

  const revenue = kpi?.revenue ?? 0;
  const totalHours = TIME_DATA.reduce((s, d) => s + d.hours, 0);
  const billableHours = kpi?.billable_hours ?? Math.round(totalHours * 0.78);

  /* ATCON blue chart system */
  const chartStroke = '#2563EB';
  const chartStroke2 = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)';
  const gridColor = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)';
  const tickColor = isDark ? 'rgba(255,255,255,0.30)' : 'rgba(0,0,0,0.35)';
  const barColor = '#2563EB';

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

        <div className="hidden sm:flex items-center gap-2 shrink-0" ref={quickNewRef}>
          <div className="relative">
            <button
              type="button"
              onClick={() => setQuickNewOpen(o => !o)}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-all hover:opacity-90"
              style={{ background: 'var(--glass-bg)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
            >
              <Plus className="w-3.5 h-3.5" />
              New
            </button>
            <AnimatePresence>
              {quickNewOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97, y: 4 }}
                  transition={{ duration: 0.12 }}
                  className="absolute right-0 top-full mt-1.5 w-44 rounded-xl overflow-hidden z-50"
                  style={{ background: 'var(--popover)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}
                >
                  <div className="py-1">
                    {quickItems.map(qi => (
                      <button
                        key={qi.kind}
                        type="button"
                        onClick={() => { setQuickNewOpen(false); dispatchQuickCreate(qi.kind); }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-left transition-colors hover:bg-white/[0.05]"
                        style={{ color: 'var(--foreground)' }}
                      >
                        <div className="h-2 w-2 shrink-0 rounded-full bg-primary opacity-80" />
                        {qi.label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* KPI strip — number-first hierarchy, calmer density */}
      <motion.div variants={item} className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Revenue', value: fmt(revenue), icon: <TrendingUp className="h-4 w-4 opacity-45" /> },
          { label: 'Billable', value: `${billableHours}h`, icon: <Clock className="h-4 w-4 opacity-45" /> },
          { label: 'Inbox', value: String(pendingApprovalsCount), icon: <Inbox className="h-4 w-4 opacity-45" /> },
          { label: 'Clients', value: String(kpi?.active_clients ?? 0), icon: <Users className="h-4 w-4 opacity-45" /> },
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
                <ActivitySpineFeed items={activityItems} />
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
                {pendingApprovals.length === 0 ? (
                  <div className="px-5 py-8 text-center sm:px-6">
                    <p className="text-[13px]" style={{ color: 'var(--muted-foreground)' }}>No pending approvals.</p>
                  </div>
                ) : pendingApprovals.map((row, i) => (
                  <Link
                    key={row.id}
                    href={row.href}
                    className="flex items-center gap-3 px-5 py-4 transition-colors hover:bg-white/[0.03] sm:px-6"
                    style={{ borderBottom: i < pendingApprovals.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}
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
              <button type="button" onClick={() => dispatchQuickCreate('task')} className="text-[12px] font-medium flex items-center gap-1 transition-opacity hover:opacity-80" style={{ color: 'var(--primary)' }}>
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
                    <button type="button" onClick={() => dispatchQuickCreate('task')} className="mt-2 text-[13px] font-medium transition-opacity hover:opacity-80" style={{ color: 'var(--primary)' }}>
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
