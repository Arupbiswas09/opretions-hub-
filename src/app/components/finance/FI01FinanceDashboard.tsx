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

const REVENUE_DATA = [
  { month: 'Aug', revenue: 123000, expenses: 89000, profit: 34000 },
  { month: 'Sep', revenue: 133000, expenses: 94000, profit: 39000 },
  { month: 'Oct', revenue: 113000, expenses: 87000, profit: 26000 },
  { month: 'Nov', revenue: 138000, expenses: 91000, profit: 47000 },
  { month: 'Dec', revenue: 128000, expenses: 95000, profit: 33000 },
  { month: 'Jan', revenue: 145000, expenses: 99000, profit: 46000 },
];

const EXPENSE_CATEGORIES = [
  { name: 'Salaries',    value: 61500, pct: 62, color: 'rgba(251,191,36,0.85)' },
  { name: 'Software',    value: 11900, pct: 12, color: 'rgba(139,92,246,0.70)' },
  { name: 'Marketing',   value: 14850, pct: 15, color: 'rgba(20,184,166,0.70)'  },
  { name: 'Operations',  value: 10890, pct: 11, color: 'rgba(244,114,182,0.60)'  },
];

const MONTHLY_INVOICES = [
  { month: 'Aug', paid: 14, pending: 3 },
  { month: 'Sep', paid: 18, pending: 2 },
  { month: 'Oct', paid: 12, pending: 5 },
  { month: 'Nov', paid: 21, pending: 1 },
  { month: 'Dec', paid: 16, pending: 4 },
  { month: 'Jan', paid: 19, pending: 5 },
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
      className={`rounded-2xl overflow-hidden ${className}`}
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
          <span style={{ color: 'var(--muted-foreground)' }} className="capitalize">{p.name}:</span>
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
          <span style={{ color: 'var(--muted-foreground)' }} className="capitalize">{p.name}:</span>
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

  const revColor    = isDark ? 'rgba(251,191,36,0.90)' : '#1c1917';
  const expColor    = isDark ? 'rgba(255,255,255,0.35)' : '#a8a29e';
  const profitColor = isDark ? 'rgba(52,211,153,0.80)' : '#059669';
  const gridColor   = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
  const tickColor   = isDark ? '#57534e' : '#a8a29e';

  const revGrad  = isDark ? 'revGradDark'  : 'revGradLight';
  const profGrad = isDark ? 'profGradDark' : 'profGradLight';

  const invoicePaidColor    = isDark ? 'rgba(251,191,36,0.80)' : '#292524';
  const invoicePendingColor = isDark ? 'rgba(255,255,255,0.20)' : '#d6d3d1';

  const KPI_CARDS = [
    {
      label: 'Total Revenue', val: '$145,280', icon: DollarSign,
      delta: '+12.5% from last month', deltaColor: 'text-emerald-500 dark:text-emerald-400',
      onClick: onNavigateToInvoices,
    },
    {
      label: 'Outstanding', val: '$38,450', icon: FileText,
      delta: '5 invoices pending', deltaColor: 'text-amber-500 dark:text-amber-400',
      onClick: onNavigateToInvoices,
    },
    {
      label: 'Expenses (MTD)', val: '$24,120', icon: TrendingUp,
      delta: '18 pending claims', deltaColor: 'text-stone-500 dark:text-stone-400',
      onClick: onNavigateToExpenses,
    },
    {
      label: 'Overdue', val: '$8,200', icon: AlertCircle,
      delta: '2 invoices overdue', deltaColor: 'text-red-500 dark:text-red-400',
      urgent: true,
      onClick: onNavigateToInvoices,
    },
  ];

  return (
    <div className="p-8 max-w-[1100px]">

      {/* Header */}
      <motion.div
        className="flex items-end justify-between mb-6"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: EASE_OUT_EXPO }}
      >
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] mb-1
                        text-stone-400 dark:text-stone-500">Finance</p>
          <h1 className="text-[28px] font-semibold tracking-[-0.025em]
                         text-stone-900 dark:text-stone-50">Overview</h1>
        </div>
        <BonsaiButton variant="ghost" size="sm" icon={<Download className="w-4 h-4" />}>
          Export Report
        </BonsaiButton>
      </motion.div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-4 gap-4 mb-6">
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
              className="rounded-2xl p-5 text-left group transition-all"
              style={{
                background: card.urgent
                  ? isDark ? 'rgba(239,68,68,0.08)' : 'rgba(254,242,242,0.65)'
                  : 'var(--glass-bg)',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                border: card.urgent
                  ? isDark ? '1px solid rgba(239,68,68,0.20)' : '1px solid rgba(254,202,202,0.60)'
                  : '1px solid var(--border)',
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em]
                              text-stone-400 dark:text-stone-500">
                  {card.label}
                </p>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center
                                bg-stone-100/60 dark:bg-white/[0.06]">
                  <Icon className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
                </div>
              </div>
              <p className={`text-[26px] font-bold tracking-[-0.02em] leading-none ${
                card.urgent ? 'text-red-600 dark:text-red-400' : 'text-stone-800 dark:text-stone-50'
              }`}>
                {card.val}
              </p>
              <p className={`text-[11px] font-medium mt-2 ${card.deltaColor}`}>{card.delta}</p>
            </motion.button>
          );
        })}
      </div>

      {/* ── Revenue Chart + Expense Breakdown ── */}
      <div className="grid grid-cols-[1fr_300px] gap-5 mb-6">

        {/* Revenue area chart */}
        <GlassPanel delay={0.22}>
          <div className="px-6 pt-5 pb-2 flex items-center justify-between">
            <div>
              <h3 className="text-[14px] font-semibold tracking-[-0.01em] text-stone-800 dark:text-stone-100">
                Revenue Trend
              </h3>
              <p className="text-[11px] mt-0.5 text-stone-400 dark:text-stone-500">Last 6 months</p>
            </div>
            <div className="flex items-center gap-4">
              {[
                { label: 'Revenue',  color: revColor  },
                { label: 'Expenses', color: expColor  },
                { label: 'Profit',   color: profitColor },
              ].map(l => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: l.color }} />
                  <span className="text-[10px] text-stone-400 dark:text-stone-500">{l.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="px-2 pb-4">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={REVENUE_DATA} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGradLight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1c1917" stopOpacity={0.12} />
                    <stop offset="100%" stopColor="#1c1917" stopOpacity={0.01} />
                  </linearGradient>
                  <linearGradient id="revGradDark" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(251,191,36,1)" stopOpacity={0.22} />
                    <stop offset="100%" stopColor="rgba(251,191,36,1)" stopOpacity={0.01} />
                  </linearGradient>
                  <linearGradient id="profGradLight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#059669" stopOpacity={0.14} />
                    <stop offset="100%" stopColor="#059669" stopOpacity={0.01} />
                  </linearGradient>
                  <linearGradient id="profGradDark" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(52,211,153,1)" stopOpacity={0.20} />
                    <stop offset="100%" stopColor="rgba(52,211,153,1)" stopOpacity={0.01} />
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
                  dot={false} activeDot={{ r: 4, fill: revColor, stroke: isDark ? '#0C0A09' : '#fff', strokeWidth: 2 }}
                />
                <Area
                  type="monotone" dataKey="expenses" name="expenses"
                  stroke={expColor} strokeWidth={1.5} strokeDasharray="4 4"
                  fill="none"
                  dot={false} activeDot={{ r: 3, fill: expColor, stroke: isDark ? '#0C0A09' : '#fff', strokeWidth: 2 }}
                />
                <Area
                  type="monotone" dataKey="profit" name="profit"
                  stroke={profitColor} strokeWidth={1.5}
                  fill={`url(#${profGrad})`}
                  dot={false} activeDot={{ r: 3, fill: profitColor, stroke: isDark ? '#0C0A09' : '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>

        {/* Expense breakdown */}
        <GlassPanel delay={0.26} className="flex flex-col">
          <div className="px-5 pt-5 pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
            <h3 className="text-[14px] font-semibold tracking-[-0.01em] text-stone-800 dark:text-stone-100">
              Expense Breakdown
            </h3>
            <p className="text-[11px] mt-0.5 text-stone-400 dark:text-stone-500">January 2026</p>
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
                    <Cell key={i} fill={e.color} />
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
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                      <span className="text-[12px] font-medium text-stone-700 dark:text-stone-200">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-stone-400 dark:text-stone-500">{cat.pct}%</span>
                      <span className="text-[11px] font-semibold tabular-nums text-stone-700 dark:text-stone-200">
                        ${(cat.value / 1000).toFixed(1)}K
                      </span>
                    </div>
                  </div>
                  <div className="h-[3px] rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: cat.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${cat.pct}%` }}
                      transition={{ delay: 0.4, duration: 0.8, ease: EASE_OUT_EXPO }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="mt-4 pt-3 border-t flex items-center justify-between"
              style={{ borderColor: 'var(--border)' }}>
              <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400">Total MTD</span>
              <span className="text-[15px] font-bold tracking-[-0.02em] text-stone-800 dark:text-stone-100">
                $99,140
              </span>
            </div>
          </div>
        </GlassPanel>
      </div>

      {/* ── Invoice volume + Quick actions ── */}
      <div className="grid grid-cols-[1fr_auto] gap-5">

        {/* Monthly invoice volume chart */}
        <GlassPanel delay={0.30}>
          <div className="px-5 pt-4 pb-1 flex items-center justify-between">
            <h3 className="text-[13px] font-semibold tracking-[-0.01em] text-stone-800 dark:text-stone-100">
              Invoice Volume
            </h3>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: invoicePaidColor }} />
                <span className="text-[10px] text-stone-400 dark:text-stone-500">Paid</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: invoicePendingColor }} />
                <span className="text-[10px] text-stone-400 dark:text-stone-500">Pending</span>
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

        {/* Quick navigation cards */}
        <div className="flex flex-col gap-3 w-[200px]">
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
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-stone-100 dark:bg-white/[0.08]">
                    <Icon className="w-4 h-4 text-stone-500 dark:text-stone-300" />
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-stone-300 dark:text-stone-600
                                          group-hover:text-stone-600 dark:group-hover:text-stone-300 transition-colors" />
                </div>
                <h3 className="text-[13px] font-semibold mb-1 text-stone-800 dark:text-stone-100">
                  {item.label}
                </h3>
                <div>{item.pill}</div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
