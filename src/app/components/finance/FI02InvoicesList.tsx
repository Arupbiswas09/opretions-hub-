import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Download, Send, Eye, Bell, AlertCircle } from 'lucide-react';
import { BonsaiButton } from '../bonsai/BonsaiButton';
import { BonsaiStatusPill } from '../bonsai/BonsaiStatusPill';
import { EnhancedTable } from '../operations/EnhancedTable';
import { HubStatTile } from '../ops';

interface Invoice {
  id: string;
  number: string;
  client: string;
  date: string;
  dueDate: string;
  amount: number;
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Cancelled';
  lastReminder?: string;
}

interface FI02InvoicesListProps {
  onInvoiceClick: (invoice: Invoice) => void;
  onCreate: () => void;
  onGenerateFromTimesheets: () => void;
}

export function FI02InvoicesList({ onInvoiceClick, onCreate, onGenerateFromTimesheets }: FI02InvoicesListProps) {
  const invoices: Invoice[] = [
    {
      id: '1', number: 'INV-2026-001', client: 'Acme Corporation',
      date: 'Jan 15, 2026', dueDate: 'Feb 14, 2026', amount: 28500,
      status: 'Sent', lastReminder: 'Jan 22',
    },
    {
      id: '2', number: 'INV-2026-002', client: 'Tech Startup Inc',
      date: 'Jan 10, 2026', dueDate: 'Jan 20, 2026', amount: 5200,
      status: 'Overdue', lastReminder: 'Jan 25',
    },
    {
      id: '3', number: 'INV-2025-098', client: 'Local Retail Co',
      date: 'Dec 28, 2025', dueDate: 'Jan 27, 2026', amount: 14800,
      status: 'Paid',
    },
  ];

  const getStatusColor = (status: string): 'active' | 'pending' | 'inactive' | 'archived' => {
    switch (status) {
      case 'Paid': return 'active';
      case 'Sent': return 'pending';
      case 'Overdue': return 'inactive';
      case 'Draft': return 'archived';
      case 'Cancelled': return 'inactive';
      default: return 'archived';
    }
  };

  const totalAmount = invoices.reduce((s, i) => s + i.amount, 0);

  return (
    <div className="px-3 py-6 sm:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="eyebrow-label mb-1">Finance</p>
          <h1 className="text-[28px] font-semibold tracking-[-0.025em]"
            style={{ color: 'var(--foreground)' }}>Invoices</h1>
        </div>
        <div className="flex min-w-0 flex-wrap items-stretch justify-end gap-2 sm:items-center">
          <BonsaiButton variant="ghost" size="sm" icon={<Download />}>
            Export
          </BonsaiButton>
          <BonsaiButton variant="ghost" size="sm" onClick={onGenerateFromTimesheets}>
            Generate from Timesheets
          </BonsaiButton>
          <BonsaiButton variant="primary" icon={<Plus />} onClick={onCreate}>
            New Invoice
          </BonsaiButton>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <HubStatTile label="Total" value={invoices.length} delay={0} />
        <HubStatTile label="Draft" value={invoices.filter(i => i.status === 'Draft').length} delay={0.05} />
        <HubStatTile label="Sent" value={invoices.filter(i => i.status === 'Sent').length} delay={0.1} />
        <HubStatTile label="Paid" value={invoices.filter(i => i.status === 'Paid').length} delay={0.15} />
        <HubStatTile
          label="Overdue"
          value={invoices.filter(i => i.status === 'Overdue').length}
          delay={0.2}
        />
      </div>

      {/* Invoices Table */}
      <EnhancedTable
        columns={[
          { key: 'number', label: 'Invoice #', sortable: true },
          { key: 'client', label: 'Client', sortable: true },
          { key: 'date', label: 'Date', sortable: true },
          { key: 'dueDate', label: 'Due Date', sortable: true },
          { key: 'amount', label: 'Amount', sortable: true },
          { key: 'status', label: 'Status', sortable: true },
          { key: 'reminder', label: 'Reminder', sortable: false },
        ]}
        data={invoices.map(invoice => ({
          ...invoice,
          amount: (
            <span className="font-semibold tabular-nums" style={{ color: 'var(--foreground)' }}>
              ${invoice.amount.toLocaleString()}
            </span>
          ),
          status: (
            <BonsaiStatusPill
              status={getStatusColor(invoice.status)}
              label={invoice.status}
            />
          ),
          reminder: invoice.status === 'Overdue' ? (
            <button
              className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full transition-colors"
              style={{
                background: 'var(--destructive)',
                color: '#FFFFFF',
              }}
              onClick={(e) => { e.stopPropagation(); }}
            >
              <Bell className="w-3 h-3" />
              Send Reminder
            </button>
          ) : invoice.lastReminder ? (
            <span className="text-[10px]" style={{ color: 'var(--foreground-muted)' }}>
              Last: {invoice.lastReminder}
            </span>
          ) : null,
        }))}
        onRowClick={(row) => onInvoiceClick(row as Invoice)}
        searchable
        filterable
      />
    </div>
  );
}
