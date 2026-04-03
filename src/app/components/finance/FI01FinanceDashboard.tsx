import React, { useState } from 'react';
import { DollarSign, FileText, TrendingUp, AlertCircle, Download, Plus, Eye } from 'lucide-react';
import { BonsaiButton } from '../bonsai/BonsaiButton';
import { BonsaiStatusPill } from '../bonsai/BonsaiStatusPill';

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

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-stone-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-stone-600">Total Revenue</p>
            <DollarSign className="w-5 h-5 text-primary" />
          </div>
          <p className="text-3xl font-semibold text-stone-800">$145,280</p>
          <p className="text-xs text-green-600 mt-1">+12.5% from last month</p>
        </div>

        <div className="bg-white rounded-lg border border-stone-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-stone-600">Outstanding</p>
            <FileText className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-3xl font-semibold text-amber-600">$38,450</p>
          <p className="text-xs text-stone-600 mt-1">5 invoices pending</p>
        </div>

        <div className="bg-white rounded-lg border border-stone-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-stone-600">Expenses (MTD)</p>
            <TrendingUp className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-3xl font-semibold text-stone-800">$24,120</p>
          <p className="text-xs text-stone-600 mt-1">18 pending claims</p>
        </div>

        <div className="bg-white rounded-lg border border-stone-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-stone-600">Overdue</p>
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-3xl font-semibold text-red-600">$8,200</p>
          <p className="text-xs text-stone-600 mt-1">2 invoices overdue</p>
        </div>
      </div>

      {/* Revenue Chart Placeholder */}
      <div className="bg-white rounded-lg border border-stone-200 p-6 mb-6">
        <h3 className="font-semibold text-stone-800 mb-4">Revenue Trend (Last 6 Months)</h3>
        <div className="h-64 flex items-end justify-around gap-2">
          {[85, 92, 78, 95, 88, 100].map((value, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center">
              <div className="w-full bg-primary/20 rounded-t-lg relative" style={{ height: `${value}%` }}>
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-medium text-stone-700">
                  ${Math.round(value * 1.45)}K
                </div>
              </div>
              <p className="text-xs text-stone-600 mt-2">
                {['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'][idx]}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={onNavigateToInvoices}
          className="bg-white rounded-lg border border-stone-200 p-6 hover:shadow-md transition-shadow text-left"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <BonsaiStatusPill status="pending" label="5 Pending" />
          </div>
          <h3 className="font-semibold text-stone-800 mb-2">Manage Invoices</h3>
          <p className="text-sm text-stone-600">View, create, and send invoices to clients</p>
        </button>

        <button
          onClick={onNavigateToExpenses}
          className="bg-white rounded-lg border border-stone-200 p-6 hover:shadow-md transition-shadow text-left"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <BonsaiStatusPill status="pending" label="18 To Review" />
          </div>
          <h3 className="font-semibold text-stone-800 mb-2">Review Expenses</h3>
          <p className="text-sm text-stone-600">Approve employee expense claims</p>
        </button>
      </div>
    </div>
  );
}
