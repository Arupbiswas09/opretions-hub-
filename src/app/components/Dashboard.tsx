'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { Plus, Check, TrendingUp, Clock, Users, DollarSign, ChevronRight } from 'lucide-react';
import { easeOutQuart } from '../lib/motion';
import { useTheme } from '../lib/theme';

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

/* ─── Section card — ATCON: glassmorphic cards on navy ─── */
function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl overflow-hidden ${className}`}
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
        WebkitBackdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
        border: '1px solid var(--border)',
      }}>
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
  { name: 'Website Redesign', start: 10, end: 75, color: '#1e40af' },
  { name: 'Mobile App Dev', start: 20, end: 90, color: '#0f766e' },
  { name: 'Brand Identity', start: 0, end: 55, color: '#b45309' },
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

/* ═══════════════════════════════════════════════════════════
   DASHBOARD — Bonsai exact: green-only, clean bordered cards,
   Project Timeline with Gantt bars, Activity, P&L, Time, Tasks
═══════════════════════════════════════════════════════════ */
export default function Dashboard() {
  const { isDark } = useTheme();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const [tasks, setTasks] = useState(TASKS);
  const toggleTask = (id: number) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

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
      className="px-8 py-6 max-w-[1000px]"
    >

      {/* ═══ Greeting ══════════════════════════════════════════ */}
      <motion.div variants={item} className="mb-8">
        <p className="text-[12px] mb-1 uppercase tracking-[0.06em] font-medium"
          style={{ color: 'var(--muted-foreground)' }}>{dateStr}</p>
        <h1 className="text-[26px] font-semibold tracking-[-0.02em]"
          style={{ color: 'var(--foreground)' }}>
          {greeting}, John.
        </h1>
      </motion.div>

      {/* ═══ Top row: Project Timeline + Activity ═════════════ */}
      <motion.div variants={item} className="grid grid-cols-[1fr_280px] gap-5 mb-5">
        {/* Project Timeline — Bonsai: Gantt bars with date axis */}
        <Section>
          <div className="px-5 py-4 flex items-center justify-between"
            style={{ borderBottom: '1px solid var(--border)' }}>
            <h2 className="text-[14px] font-semibold" style={{ color: 'var(--foreground)' }}>
              Project Timeline
            </h2>
          </div>
          <div className="px-5 py-4">
            {/* Date axis */}
            <div className="flex items-center justify-between mb-4 px-1">
              {['MAR 22', 'TODAY', 'APR 19'].map((d, i) => (
                <span key={d} className="text-[10px] uppercase tracking-wider"
                  style={{ color: i === 1 ? 'var(--foreground)' : 'var(--muted-foreground)' }}>
                  {d}
                </span>
              ))}
            </div>
            {/* Gantt bars */}
            <div className="space-y-2.5">
              {PROJECTS_TIMELINE.map((proj) => (
                <div key={proj.name} className="flex items-center">
                  <div className="relative w-full h-7 rounded-md overflow-hidden"
                    style={{ background: 'var(--glass-bg)' }}>
                    <div
                      className="absolute top-0 bottom-0 rounded-md flex items-center px-3"
                      style={{
                        left: `${proj.start}%`,
                        width: `${proj.end - proj.start}%`,
                        background: `${proj.color}18`,
                        border: `1px solid ${proj.color}40`,
                      }}>
                      <span className="text-[11px] font-medium truncate"
                        style={{ color: 'var(--foreground)' }}>
                        {proj.name}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* Activity — Bonsai: timestamped activity list */}
        <Section>
          <div className="px-5 py-4 flex items-center justify-between"
            style={{ borderBottom: '1px solid var(--border)' }}>
            <h2 className="text-[14px] font-semibold" style={{ color: 'var(--foreground)' }}>
              Activity
            </h2>
          </div>
          <div className="px-5 py-4 space-y-4">
            {[
              { text: 'Operations Hub created Project.', time: 'Apr 5, 2026 9:54PM', color: '#2563EB' },
              { text: 'Operations Hub created project Engineering Project.', time: 'Apr 5, 2026 9:54PM', color: '#0D9488' },
              { text: 'Invoice INV-2026-001 was sent', time: 'Apr 5, 2026 8:30PM', color: '#CCFF00' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                  style={{ background: item.color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] leading-relaxed" style={{ color: 'var(--foreground)' }}>
                    {item.text}
                  </p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                    {item.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </motion.div>

      {/* ═══ Profit & Loss ════════════════════════════════════ */}
      <motion.div variants={item}>
      <Section className="mb-5">
        <div className="px-5 py-4 flex items-center justify-between"
          style={{ borderBottom: '1px solid var(--border)' }}>
          <h2 className="text-[14px] font-semibold" style={{ color: 'var(--foreground)' }}>
            Profit & Loss
          </h2>
          <div className="flex items-center gap-3">
            <select className="text-[12px] px-2.5 py-1 rounded-md appearance-none cursor-pointer"
              style={{
                background: 'var(--glass-bg)',
                border: '1px solid var(--border)',
                color: 'var(--foreground)',
              }}>
              <option>USD</option>
            </select>
            <select className="text-[12px] px-2.5 py-1 rounded-md appearance-none cursor-pointer"
              style={{
                background: 'var(--glass-bg)',
                border: '1px solid var(--border)',
                color: 'var(--foreground)',
              }}>
              <option>Last 6 Months</option>
              <option>This Year</option>
            </select>
          </div>
        </div>
        <div className="px-3 py-4">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={PNL_DATA} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chartStroke} stopOpacity={0.15} />
                  <stop offset="100%" stopColor={chartStroke} stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false}
                tick={{ fontSize: 10, fill: tickColor, fontWeight: 500 }} dy={6} />
              <YAxis tickLine={false} axisLine={false}
                tick={{ fontSize: 10, fill: tickColor, fontWeight: 500 }} tickFormatter={fmt} />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'var(--border)', strokeWidth: 1 }} />
              <Area type="monotone" dataKey="revenue" name="revenue"
                stroke={chartStroke} strokeWidth={2} fill="url(#revGrad)"
                dot={false} activeDot={{ r: 3, fill: chartStroke, stroke: isDark ? '#111' : '#fff', strokeWidth: 2 }} />
              <Area type="monotone" dataKey="expenses" name="expenses"
                stroke={chartStroke2} strokeWidth={1.5} strokeDasharray="4 4" fill="none"
                dot={false} activeDot={{ r: 3, fill: chartStroke2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        {/* Summary row — Bonsai exact */}
        <div className="px-5 py-3 flex items-center gap-8" style={{ borderTop: '1px solid var(--border)' }}>
          {[
            { label: 'Outstanding', value: '$0.00' },
            { label: 'Overdue', value: '$0.00' },
            { label: 'Paid & Pending', value: '$0.00', dot: true },
            { label: 'Other Income', value: '$0.00', dot: true },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-2">
              <span className="text-[12px]" style={{ color: 'var(--muted-foreground)' }}>{s.label}</span>
              {s.dot && <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#2563EB' }} />}
              <span className="text-[13px] font-semibold tabular-nums" style={{ color: 'var(--foreground)' }}>{s.value}</span>
            </div>
          ))}
        </div>
      </Section>
      </motion.div>

      {/* ═══ Time Tracked ═════════════════════════════════════ */}
      <motion.div variants={item}>
      <Section className="mb-5">
        <div className="px-5 py-4 flex items-center justify-between"
          style={{ borderBottom: '1px solid var(--border)' }}>
          <h2 className="text-[14px] font-semibold" style={{ color: 'var(--foreground)' }}>
            Time Tracked
          </h2>
          <select className="text-[12px] px-2.5 py-1 rounded-md appearance-none cursor-pointer"
            style={{
              background: 'var(--glass-bg)',
              border: '1px solid var(--border)',
              color: 'var(--foreground)',
            }}>
            <option>This Month</option>
            <option>Last Month</option>
          </select>
        </div>
        <div className="px-3 py-4">
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={TIME_DATA} barSize={10}>
              <XAxis dataKey="day" tickLine={false} axisLine={false}
                tick={{ fontSize: 9, fill: tickColor, fontWeight: 500 }} dy={4}
                interval={2} />
              <Tooltip content={<ChartTooltip />} cursor={false} />
              <Bar dataKey="hours" name="hours" fill={barColor} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Summary row */}
        <div className="px-5 py-3 flex items-center gap-8" style={{ borderTop: '1px solid var(--border)' }}>
          {[
            { label: 'Total Hours', value: `${totalHours.toFixed(0)}h 0m` },
            { label: 'Billable Hours', value: `${billableHours}h 0m` },
            { label: 'Billable Amount', value: '$0.00' },
            { label: 'Unbilled Amount', value: '$0.00' },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-[12px]" style={{ color: 'var(--muted-foreground)' }}>{s.label}</p>
              <p className="text-[14px] font-semibold tabular-nums mt-0.5" style={{ color: 'var(--foreground)' }}>{s.value}</p>
            </div>
          ))}
        </div>
      </Section>
      </motion.div>

      {/* ═══ Pending approvals — command center (doc §4.1) ═══════════ */}
      <motion.div variants={item}>
        <Section className="mb-5">
          <div className="px-5 py-4 flex items-center justify-between"
            style={{ borderBottom: '1px solid var(--border)' }}>
            <h2 className="text-[14px] font-semibold" style={{ color: 'var(--foreground)' }}>
              Pending approvals
            </h2>
            <Link href="/hub/projects/approvals" className="text-[12px] font-medium transition-opacity hover:opacity-80"
              style={{ color: 'var(--primary)' }}>
              Inbox
            </Link>
          </div>
          <div>
            {PENDING_APPROVALS.map((row, i) => (
              <Link
                key={row.id}
                href={row.href}
                className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-white/[0.03]"
                style={{ borderBottom: i < PENDING_APPROVALS.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[13px] font-medium truncate" style={{ color: 'var(--foreground)' }}>
                      {row.title}
                    </p>
                    {row.badge ? (
                      <span className="text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded-md shrink-0"
                        style={{ background: 'var(--warning-muted)', color: 'var(--warning)' }}>
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
        </Section>
      </motion.div>

      {/* ═══ My Tasks — Bonsai: clean task list with checkboxes ═════ */}
      <motion.div variants={item}>
      <Section className="mb-5">
        <div className="px-5 py-4 flex items-center justify-between"
          style={{ borderBottom: '1px solid var(--border)' }}>
          <h2 className="text-[14px] font-semibold" style={{ color: 'var(--foreground)' }}>
            My Tasks
          </h2>
          <button className="text-[12px] font-medium flex items-center gap-1"
            style={{ color: 'var(--primary)' }}>
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
        <div>
          {tasks.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-[13px]" style={{ color: 'var(--muted-foreground)' }}>
                No tasks created yet.
              </p>
              <button className="text-[13px] mt-1" style={{ color: 'var(--primary)' }}>
                Create a <span className="underline">new task</span>.
              </button>
            </div>
          ) : (
            <div>
              {tasks.map((task, i) => (
                <button
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className="w-full flex items-center gap-3 px-5 py-3 text-left transition-colors"
                  style={{ borderBottom: i < tasks.length - 1 ? '1px solid var(--border)' : 'none' }}
                >
                  <div className="w-[18px] h-[18px] rounded-[4px] flex items-center justify-center flex-shrink-0 transition-colors"
                    style={{
                      border: task.done ? 'none' : '1.5px solid var(--border-strong)',
                      background: task.done ? '#2563EB' : 'transparent',
                    }}>
                    {task.done && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[13px] truncate ${task.done ? 'line-through' : ''}`}
                      style={{ color: task.done ? 'var(--muted-foreground)' : 'var(--foreground)' }}>
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
      </Section>
      </motion.div>
    </motion.div>
  );
}
