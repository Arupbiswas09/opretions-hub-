'use client';
import React from 'react';
import { motion } from 'motion/react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { DollarSign, FileText, TrendingUp, AlertCircle, Download, ArrowUpRight } from 'lucide-react';
import { BonsaiButton } from '../bonsai/BonsaiButton';
import { BonsaiStatusPill } from '../bonsai/BonsaiStatusPill';
import { useTheme } from '../../lib/theme';
import { EASE_OUT_EXPO } from '../../lib/motion';
import { dashboardFoldRootClass, DashboardScrollPanel } from '../dashboard/DashboardFoldLayout';

const REVENUE_DATA = [
  { month: 'Aug', revenue: 123000, expenses: 89000, profit: 34000 },
  { month: 'Sep', revenue: 133000, expenses: 94000, profit: 39000 },
  { month: 'Oct', revenue: 113000, expenses: 87000, profit: 26000 },
  { month: 'Nov', revenue: 138000, expenses: 91000, profit: 47000 },
  { month: 'Dec', revenue: 128000, expenses: 95000, profit: 33000 },
  { month: 'Jan', revenue: 145000, expenses: 99000, profit: 46000 },
];

const EXPENSE_CATEGORIES = [
  { name: 'Salaries',    value: 61500, pct: 62, color: isDarkFn => isDarkFn ? 'rgba(251,191,36,0.85)' : '#D97706' },
  { name: 'Software',    value: 11900, pct: 12, color: isDarkFn => isDarkFn ? 'rgba(139,92,246,0.70)' : '#7C3AED' },
  { name: 'Marketing',   value: 14850, pct: 15, color: isDarkFn => isDarkFn ? 'rgba(20,184,166,0.70)' : '#0D9488' },
  { name: 'Operations',  value: 10890, pct: 11, color: isDarkFn => isDarkFn ? 'rgba(244,114,182,0.60)' : '#EC4899' },
];

const MONTHLY_INVOICES = [
  { month: 'Aug', paid: 14, pending: 3 },
  { month: 'Sep', paid: 18, pending: 2 },
  { month: 'Oct', paid: 12, pending: 5 },
  { month: 'Nov', paid: 21, pending: 1 },
  { month: 'Dec', paid: 16, pending: 4 },
  { month: 'Jan', paid: 19, pending: 5 },
];

/* Profitability per client */
const CLIENT_PROFITABILITY = [
  { client: 'Acme Corp',        revenue: 45000, cost: 28500, margin: 36.7 },
  { client: 'Tech Startup Inc', revenue: 85000, cost: 52000, margin: 38.8 },
  { client: 'Local Retail Co',  revenue: 15000, cost: 14800, margin: 1.3  },
];

const fmt = (val: number) => `$${(val / 1000).toFixed(0)}K`;

function GlassPanel({ children, className = '', delay = 0 }: {
  children: React.ReactNode; className?: string; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.38, ease: EASE_OUT_EXPO }}
      className={`dashboard-glass-surface rounded-2xl overflow-hidden ${className}`}
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        border: '1px solid var(--border)',
      }}
    >
      {children}
    </motion.div>
  );
}

function RevenueTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-4 py-3 text-[12px]"
      style={{
        background: 'var(--user-menu-bg)',
        backdropFilter: 'blur(24px)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-md)',
      }}>
      <p className="font-semibold mb-2" style={{ color: 'var(--foreground)' }}>{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2 mb-0.5">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span style={{ color: 'var(--foreground-muted)' }} className="capitalize">{p.name}:</span>
          <span className="font-semibold" style={{ color: 'var(--foreground)' }}>{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

function InvoiceTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-3 py-2 text-[11px]"
      style={{
        background: 'var(--user-menu-bg)',
        backdropFilter: 'blur(20px)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
      }}>
      <p className="font-semibold mb-1" style={{ color: 'var(--foreground)' }}>{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: p.fill }} />
          <span style={{ color: 'var(--foreground-muted)' }} className="capitalize">{p.name}:</span>
          <span className="font-medium" style={{ color: 'var(--foreground)' }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
}

interface FI01FinanceDashboardProps {
  onNavigateToInvoices: () => void;
  onNavigateToExpenses: () => void;
}

export function FI01FinanceDashboard({ onNavigateToInvoices, onNavigateToExpenses }: FI01FinanceDashboardProps) {
  const { isDark } = useTheme();

  const revColor    = isDark ? '#2563EB' : '#1E3A8A';
  const expColor    = isDark ? 'rgba(255,255,255,0.35)' : '#94A3B8';
  const profitColor = isDark ? '#34D399' : '#059669';
  const gridColor   = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
  const tickColor   = isDark ? 'rgba(255,255,255,0.35)' : '#94A3B8';

  const revGrad  = isDark ? 'revGradDark'  : 'revGradLight';
  const profGrad = isDark ? 'profGradDark' : 'profGradLight';

  const invoicePaidColor    = isDark ? '#2563EB' : '#1E3A8A';
  const invoicePendingColor = isDark ? 'rgba(255,255,255,0.15)' : '#CBD5E1';

  const KPI_CARDS = [
    {
      label: 'Total Revenue', val: '$145,280', icon: DollarSign,
      delta: '+12.5% from last month',
      deltaStyle: { color: isDark ? '#34D399' : '#059669' },
      onClick: onNavigateToInvoices,
    },
    {
      label: 'Outstanding', val: '$38,450', icon: FileText,
      delta: '5 invoices pending',
      deltaStyle: { color: isDark ? '#FBBF24' : '#D97706' },
      onClick: onNavigateToInvoices,
    },
    {
      label: 'Expenses (MTD)', val: '$24,120', icon: TrendingUp,
      delta: '18 pending claims',
      deltaStyle: { color: 'var(--foreground-muted)' },
      onClick: onNavigateToExpenses,
    },
    {
      label: 'Overdue', val: '$8,200', icon: AlertCircle,
      delta: '2 invoices overdue',
      deltaStyle: { color: isDark ? '#F87171' : '#DC2626' },
      urgent: true,
      onClick: onNavigateToInvoices,
    },
  ];

  return (
    <div className={dashboardFoldRootClass}>

      {/* Header */}
      <motion.div
        className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: EASE_OUT_EXPO }}
      >
        <div>
          <p className="eyebrow-label mb-1">Finance</p>
          <h1 className="text-[22px] font-semibold tracking-[-0.025em] sm:text-[26px] lg:text-[28px]"
            style={{ color: 'var(--foreground)' }}>Overview</h1>
        </div>
        <BonsaiButton variant="ghost" size="sm" icon={<Download className="w-4 h-4" />}>
          Export Report
        </BonsaiButton>
      </motion.div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3 xl:grid-cols-4">
        {KPI_CARDS.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.button
              key={card.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 + i * 0.05, ease: EASE_OUT_EXPO }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={card.onClick}
              className="glass-stat group rounded-2xl p-4 text-left transition-all sm:p-5"
              style={card.urgent ? {
                background: isDark ? 'rgba(248,113,113,0.08)' : 'rgba(254,242,242,0.65)',
                border: isDark ? '1px solid rgba(248,113,113,0.20)' : '1px solid rgba(254,202,202,0.60)',
              } : {}}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em]"
                  style={{ color: 'var(--foreground-muted)' }}>
                  {card.label}
                </p>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: 'var(--glass-bg)' }}>
                  <Icon className="w-3.5 h-3.5" style={{ color: 'var(--foreground-secondary)' }} />
                </div>
              </div>
              <p className={`text-[26px] font-bold tracking-[-0.02em] leading-none`}
                style={{ color: card.urgent ? (isDark ? '#F87171' : '#DC2626') : 'var(--foreground)' }}>
                {card.val}
              </p>
              <p className="text-[11px] font-medium mt-2" style={card.deltaStyle}>{card.delta}</p>
            </motion.button>
          );
        })}
      </div>

      {/* ── Revenue Chart + Expense Breakdown ── */}
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1fr_300px]">

        {/* Revenue area chart */}
        <GlassPanel delay={0.22}>
          <div className="flex flex-col gap-3 px-4 pt-5 pb-2 sm:flex-row sm:items-start sm:justify-between sm:px-6">
            <div>
              <h3 className="text-[14px] font-semibold tracking-[-0.01em]"
                style={{ color: 'var(--foreground)' }}>
                Revenue Trend
              </h3>
              <p className="text-[11px] mt-0.5" style={{ color: 'var(--foreground-muted)' }}>Last 6 months</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              {[
                { label: 'Revenue',  color: revColor  },
                { label: 'Expenses', color: expColor  },
                { label: 'Profit',   color: profitColor },
              ].map(l => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: l.color }} />
                  <span className="text-[10px]" style={{ color: 'var(--foreground-muted)' }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="min-w-0 px-1 pb-4 sm:px-2">
            <ResponsiveContainer width="100%" height={190}>
              <AreaChart data={REVENUE_DATA} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGradLight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1E3A8A" stopOpacity={0.12} />
                    <stop offset="100%" stopColor="#1E3A8A" stopOpacity={0.01} />
                  </linearGradient>
                  <linearGradient id="revGradDark" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity={0.22} />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity={0.01} />
                  </linearGradient>
                  <linearGradient id="profGradLight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#059669" stopOpacity={0.14} />
                    <stop offset="100%" stopColor="#059669" stopOpacity={0.01} />
                  </linearGradient>
                  <linearGradient id="profGradDark" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34D399" stopOpacity={0.20} />
                    <stop offset="100%" stopColor="#34D399" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis
                  dataKey="month" tickLine={false} axisLine={false}
                  tick={{ fontSize: 10, fill: tickColor, fontWeight: 500 }} dy={6}
                />
                <YAxis
                  tickLine={false} axisLine={false}
                  tick={{ fontSize: 10, fill: tickColor, fontWeight: 500 }}
                  tickFormatter={fmt}
                />
                <Tooltip content={<RevenueTooltip />} cursor={{ stroke: 'var(--border)', strokeWidth: 1 }} />
                <Area
                  type="monotone" dataKey="revenue" name="revenue"
                  stroke={revColor} strokeWidth={2}
                  fill={`url(#${revGrad})`}
                  dot={false} activeDot={{ r: 4, fill: revColor, stroke: isDark ? '#0B0D12' : '#fff', strokeWidth: 2 }}
                />
                <Area
                  type="monotone" dataKey="expenses" name="expenses"
                  stroke={expColor} strokeWidth={1.5} strokeDasharray="4 4"
                  fill="none"
                  dot={false} activeDot={{ r: 3, fill: expColor, stroke: isDark ? '#0B0D12' : '#fff', strokeWidth: 2 }}
                />
                <Area
                  type="monotone" dataKey="profit" name="profit"
                  stroke={profitColor} strokeWidth={1.5}
                  fill={`url(#${profGrad})`}
                  dot={false} activeDot={{ r: 3, fill: profitColor, stroke: isDark ? '#0B0D12' : '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>

        {/* Expense breakdown */}
        <GlassPanel delay={0.26} className="flex flex-col">
          <div className="px-5 pt-5 pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <h3 className="text-[14px] font-semibold tracking-[-0.01em]"
              style={{ color: 'var(--foreground)' }}>
              Expense Breakdown
            </h3>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--foreground-muted)' }}>January 2026</p>
          </div>

          {/* Donut + categories */}
          <div className="flex-1 flex flex-col gap-0 px-5 py-4">
            {/* Mini donut */}
            <div className="flex items-center justify-center mb-4">
              <PieChart width={120} height={120}>
                <Pie
                  data={EXPENSE_CATEGORIES}
                  cx={60} cy={60}
                  innerRadius={36} outerRadius={54}
                  paddingAngle={2}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {EXPENSE_CATEGORIES.map((e, i) => (
                    <Cell key={i} fill={e.color(isDark)} />
                  ))}
                </Pie>
              </PieChart>
            </div>

            {/* Category bars */}
            <div className="space-y-3">
              {EXPENSE_CATEGORIES.map((cat) => (
                <div key={cat.name}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cat.color(isDark) }} />
                      <span className="text-[12px] font-medium" style={{ color: 'var(--foreground)' }}>{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px]" style={{ color: 'var(--foreground-muted)' }}>{cat.pct}%</span>
                      <span className="text-[11px] font-semibold tabular-nums" style={{ color: 'var(--foreground)' }}>
                        ${(cat.value / 1000).toFixed(1)}K
                      </span>
                    </div>
                  </div>
                  <div className="h-[3px] rounded-full overflow-hidden" style={{ background: 'var(--stat-bar-track)' }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: cat.color(isDark) }}
                      initial={{ width: 0 }}
                      animate={{ width: `${cat.pct}%` }}
                      transition={{ delay: 0.4, duration: 0.8, ease: EASE_OUT_EXPO }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="mt-4 pt-3 flex items-center justify-between"
              style={{ borderTop: '1px solid var(--border)' }}>
              <span className="text-[11px] font-medium" style={{ color: 'var(--foreground-muted)' }}>Total MTD</span>
              <span className="text-[15px] font-bold tracking-[-0.02em]" style={{ color: 'var(--foreground)' }}>
                $99,140
              </span>
            </div>
          </div>
        </GlassPanel>
      </div>

      {/* ── Invoice volume + Profitability Table ── */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">

        {/* Monthly invoice volume chart */}
        <GlassPanel delay={0.30}>
          <div className="px-5 pt-4 pb-1 flex items-center justify-between">
            <h3 className="text-[13px] font-semibold tracking-[-0.01em]"
              style={{ color: 'var(--foreground)' }}>
              Invoice Volume
            </h3>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: invoicePaidColor }} />
                <span className="text-[10px]" style={{ color: 'var(--foreground-muted)' }}>Paid</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: invoicePendingColor }} />
                <span className="text-[10px]" style={{ color: 'var(--foreground-muted)' }}>Pending</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={100}>
            <BarChart data={MONTHLY_INVOICES} barSize={14} barCategoryGap="35%">
              <XAxis
                dataKey="month" tickLine={false} axisLine={false}
                tick={{ fontSize: 10, fill: tickColor, fontWeight: 500 }} dy={4}
              />
              <Tooltip content={<InvoiceTooltip />} cursor={false} />
              <Bar dataKey="paid"    stackId="a" fill={invoicePaidColor}    radius={[0, 0, 0, 0]} />
              <Bar dataKey="pending" stackId="a" fill={invoicePendingColor} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassPanel>

        {/* Client Profitability Table */}
        <GlassPanel delay={0.34}>
          <div className="px-5 pt-4 pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <h3 className="text-[13px] font-semibold tracking-[-0.01em]"
              style={{ color: 'var(--foreground)' }}>
              Client Profitability
            </h3>
            <p className="text-[10px] mt-0.5" style={{ color: 'var(--foreground-muted)' }}>Revenue vs cost per client</p>
          </div>
          <DashboardScrollPanel size="sm" className="px-5 py-3">
            <table className="w-full text-[11px]">
              <thead>
                <tr>
                  <th
                    className="text-left font-medium py-1.5 pr-2"
                    style={{ color: 'var(--foreground-muted)' }}
                  >
                    Client
                  </th>
                  <th
                    className="text-right font-medium py-1.5 px-2"
                    style={{ color: 'var(--foreground-muted)' }}
                  >
                    Revenue
                  </th>
                  <th
                    className="text-right font-medium py-1.5 px-2"
                    style={{ color: 'var(--foreground-muted)' }}
                  >
                    Cost
                  </th>
                  <th
                    className="text-right font-medium py-1.5 pl-2"
                    style={{ color: 'var(--foreground-muted)' }}
                  >
                    Margin
                  </th>
                </tr>
              </thead>
              <tbody>
                {CLIENT_PROFITABILITY.map((row) => (
                  <tr key={row.client}>
                    <td className="py-2 pr-2 font-medium" style={{ color: 'var(--foreground)' }}>
                      {row.client}
                    </td>
                    <td className="py-2 px-2 text-right tabular-nums" style={{ color: 'var(--foreground-secondary)' }}>
                      ${(row.revenue / 1000).toFixed(0)}K
                    </td>
                    <td className="py-2 px-2 text-right tabular-nums" style={{ color: 'var(--foreground-secondary)' }}>
                      ${(row.cost / 1000).toFixed(1)}K
                    </td>
                    <td
                      className="py-2 pl-2 text-right tabular-nums font-semibold"
                      style={{
                        color:
                          row.margin > 20
                            ? 'var(--success)'
                            : row.margin > 5
                              ? 'var(--warning)'
                              : 'var(--destructive)',
                      }}
                    >
                      {row.margin}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </DashboardScrollPanel>
        </GlassPanel>
      </div>

      {/* ── Quick navigation cards ── */}
      <div className="flex gap-3">
        {[
          {
            icon: FileText, label: 'Invoices', sub: '5 Pending',
            onClick: onNavigateToInvoices,
            pill: <BonsaiStatusPill status="pending" label="5 Pending" />,
          },
          {
            icon: DollarSign, label: 'Expenses', sub: '18 To Review',
            onClick: onNavigateToExpenses,
            pill: <BonsaiStatusPill status="pending" label="18 To Review" />,
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <motion.button
              key={item.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.32, ease: EASE_OUT_EXPO }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={item.onClick}
              className="flex-1 rounded-2xl p-4 text-left group transition-all"
              style={{
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(20px) saturate(180%)',
                border: '1px solid var(--border)',
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: 'var(--glass-bg)' }}>
                  <Icon className="w-4 h-4" style={{ color: 'var(--foreground-secondary)' }} />
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-30 group-hover:opacity-100 transition-opacity"
                  style={{ color: 'var(--foreground-muted)' }} />
              </div>
              <h3 className="text-[13px] font-semibold mb-1" style={{ color: 'var(--foreground)' }}>
                {item.label}
              </h3>
              <div>{item.pill}</div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
