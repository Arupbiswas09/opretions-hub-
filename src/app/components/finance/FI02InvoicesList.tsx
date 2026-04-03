import React, { useState } from 'react';
import { Plus, Download, Send, Eye } from 'lucide-react';
import { BonsaiButton } from '../bonsai/BonsaiButton';
import { BonsaiStatusPill } from '../bonsai/BonsaiStatusPill';
import { EnhancedTable } from '../operations/EnhancedTable';

interface Invoice {
  id: string;
  number: string;
  client: string;
  date: string;
  dueDate: string;
  amount: number;
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Cancelled';
}

interface FI02InvoicesListProps {
  onInvoiceClick: (invoice: Invoice) => void;
  onCreate: () => void;
  onGenerateFromTimesheets: () => void;
}

export function FI02InvoicesList({ onInvoiceClick, onCreate, onGenerateFromTimesheets }: FI02InvoicesListProps) {
  const invoices: Invoice[] = [
    {
      id: '1',
      number: 'INV-2026-001',
      client: 'Acme Corporation',
      date: 'Jan 15, 2026',
      dueDate: 'Feb 14, 2026',
      amount: 28500,
      status: 'Sent',
    },
    {
      id: '2',
      number: 'INV-2026-002',
      client: 'Tech Startup Inc',
      date: 'Jan 10, 2026',
      dueDate: 'Jan 20, 2026',
      amount: 5200,
      status: 'Overdue',
    },
    {
      id: '3',
      number: 'INV-2025-098',
      client: 'Local Retail Co',
      date: 'Dec 28, 2025',
      dueDate: 'Jan 27, 2026',
      amount: 14800,
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

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-stone-800">Invoices</h1>
          <p className="text-sm text-stone-500">Manage client invoices and billing</p>
        </div>
        <div className="flex items-center gap-2">
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
        <div className="bg-white rounded-lg border border-stone-200 p-4">
          <p className="text-sm text-stone-600">Total</p>
          <p className="text-2xl font-semibold text-stone-800 mt-1">{invoices.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-stone-200 p-4">
          <p className="text-sm text-stone-600">Draft</p>
          <p className="text-2xl font-semibold text-stone-600 mt-1">0</p>
        </div>
        <div className="bg-white rounded-lg border border-stone-200 p-4">
          <p className="text-sm text-stone-600">Sent</p>
          <p className="text-2xl font-semibold text-amber-600 mt-1">1</p>
        </div>
        <div className="bg-white rounded-lg border border-stone-200 p-4">
          <p className="text-sm text-stone-600">Paid</p>
          <p className="text-2xl font-semibold text-green-600 mt-1">1</p>
        </div>
        <div className="bg-white rounded-lg border border-stone-200 p-4">
          <p className="text-sm text-stone-600">Overdue</p>
          <p className="text-2xl font-semibold text-red-600 mt-1">1</p>
        </div>
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
        ]}
        data={invoices.map(invoice => ({
          ...invoice,
          amount: (
            <span className="font-semibold text-stone-800">
              ${invoice.amount.toLocaleString()}
            </span>
          ),
          status: (
            <BonsaiStatusPill
              status={getStatusColor(invoice.status)}
              label={invoice.status}
            />
          ),
        }))}
        onRowClick={(row) => onInvoiceClick(row as Invoice)}
        searchable
        filterable
      />
    </div>
  );
}
