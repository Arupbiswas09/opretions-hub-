'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { DollarSign, FileText, TrendingUp, AlertCircle, Download, Plus, Eye } from 'lucide-react';
import { BonsaiButton } from '../bonsai/BonsaiButton';
import { BonsaiStatusPill } from '../bonsai/BonsaiStatusPill';

/* ─── Chart data ─────────────────────────── */
const REVENUE_DATA = [
  { month: 'Aug', revenue: 123000, expenses: 89000 },
  { month: 'Sep', revenue: 133000, expenses: 94000 },
  { month: 'Oct', revenue: 113000, expenses: 87000 },
  { month: 'Nov', revenue: 138000, expenses: 91000 },
  { month: 'Dec', revenue: 128000, expenses: 95000 },
  { month: 'Jan', revenue: 145000, expenses: 99000 },
];

const formatCurrency = (val: number) => `$${(val / 1000).toFixed(0)}K`;

/* ─── Custom tooltip ─────────────────────── */
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl px-4 py-3 text-[12px] border"
      style={{
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(24px) saturate(180%)',
        borderColor: 'rgba(0,0,0,0.06)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
      }}
    >
      <p className="font-semibold text-stone-700 mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-stone-500 capitalize">{p.name}:</span>
          <span className="font-medium text-stone-800">{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Main ────────────────────────────────── */
interface FI01FinanceDashboardProps {
  onNavigateToInvoices: () => void;
  onNavigateToExpenses: () => void;
}

export function FI01FinanceDashboard({ onNavigateToInvoices, onNavigateToExpenses }: FI01FinanceDashboardProps) {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-stone-800">Finance Dashboard</h1>
          <p className="text-sm text-stone-500">Overview of invoices, expenses, and financial metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <BonsaiButton variant="ghost" size="sm" icon={<Download />}>
            Export Report
          </BonsaiButton>
        </div>
      </div>

      {/* ─── KPI Cards ─── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="rounded-xl border border-stone-200/60 p-6"
          style={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(20px) saturate(180%)' }}
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-[0.08em]">Total Revenue</p>
            <DollarSign className="w-4 h-4 text-stone-400" />
          </div>
          <p className="text-[28px] font-bold text-stone-800 tracking-[-0.02em]">$145,280</p>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">+12.5% from last month</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-xl border border-stone-200/60 p-6"
          style={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(20px) saturate(180%)' }}
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-[0.08em]">Outstanding</p>
            <FileText className="w-4 h-4 text-stone-400" />
          </div>
          <p className="text-[28px] font-bold text-stone-700 tracking-[-0.02em]">$38,450</p>
          <p className="text-[11px] text-amber-600 font-medium mt-1">5 invoices pending</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="rounded-xl border border-stone-200/60 p-6"
          style={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(20px) saturate(180%)' }}
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-[0.08em]">Expenses (MTD)</p>
            <TrendingUp className="w-4 h-4 text-stone-400" />
          </div>
          <p className="text-[28px] font-bold text-stone-800 tracking-[-0.02em]">$24,120</p>
          <p className="text-[11px] text-stone-500 mt-1">18 pending claims</p>
        </motion.div>

        {/* OVERDUE — Red urgency signal */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-xl border border-red-100 p-6"
          style={{ background: 'rgba(254,242,242,0.65)', backdropFilter: 'blur(20px) saturate(180%)' }}
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-semibold text-red-500 uppercase tracking-[0.08em]">Overdue</p>
            <AlertCircle className="w-4 h-4 text-red-400" />
          </div>
          <p className="text-[28px] font-bold text-red-700 tracking-[-0.02em]">$8,200</p>
          <p className="text-[11px] text-red-500 font-medium mt-1">2 invoices overdue</p>
        </motion.div>
      </div>

      {/* ─── Revenue Chart — Recharts Area ─── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="rounded-xl border border-stone-200/60 p-6 mb-6"
        style={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(20px) saturate(180%)' }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[14px] font-semibold text-stone-800 tracking-[-0.01em]">Revenue Trend (Last 6 Months)</h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-stone-800" />
              <span className="text-[11px] text-stone-500">Revenue</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-stone-300" />
              <span className="text-[11px] text-stone-500">Expenses</span>
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={REVENUE_DATA} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1c1917" stopOpacity={0.12} />
                <stop offset="100%" stopColor="#1c1917" stopOpacity={0.01} />
              </linearGradient>
              <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a8a29e" stopOpacity={0.1} />
                <stop offset="100%" stopColor="#a8a29e" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false} axisLine={false}
              tick={{ fontSize: 11, fill: '#a8a29e', fontWeight: 500 }}
              dy={8}
            />
            <YAxis
              tickLine={false} axisLine={false}
              tick={{ fontSize: 11, fill: '#a8a29e', fontWeight: 500 }}
              tickFormatter={formatCurrency}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgba(28,25,23,0.06)', strokeWidth: 1 }} />
            <Area
              type="monotone" dataKey="revenue" name="revenue"
              stroke="#1c1917" strokeWidth={2}
              fill="url(#revGrad)"
              dot={false} activeDot={{ r: 4, fill: '#1c1917', stroke: '#fff', strokeWidth: 2 }}
            />
            <Area
              type="monotone" dataKey="expenses" name="expenses"
              stroke="#a8a29e" strokeWidth={1.5}
              fill="url(#expGrad)"
              dot={false} activeDot={{ r: 3, fill: '#a8a29e', stroke: '#fff', strokeWidth: 2 }}
              strokeDasharray="4 4"
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* ─── Quick Actions ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.button
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          onClick={onNavigateToInvoices}
          whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}
          className="rounded-xl border border-stone-200/60 p-6 text-left transition-all"
          style={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(20px) saturate(180%)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-stone-600" />
            </div>
            <BonsaiStatusPill status="pending" label="5 Pending" />
          </div>
          <h3 className="text-[14px] font-semibold text-stone-800 mb-1">Manage Invoices</h3>
          <p className="text-[12px] text-stone-500">View, create, and send invoices to clients</p>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          onClick={onNavigateToExpenses}
          whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}
          className="rounded-xl border border-stone-200/60 p-6 text-left transition-all"
          style={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(20px) saturate(180%)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-stone-600" />
            </div>
            <BonsaiStatusPill status="pending" label="18 To Review" />
          </div>
          <h3 className="text-[14px] font-semibold text-stone-800 mb-1">Review Expenses</h3>
          <p className="text-[12px] text-stone-500">Approve employee expense claims</p>
        </motion.button>
      </div>
    </div>
  );
}
