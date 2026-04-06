'use client';
import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Plus, Search, FileText, Shield, AlertCircle,
  CheckCircle2, Clock, MoreHorizontal,
} from 'lucide-react';
import { BonsaiButton } from './BonsaiButton';
import { HubPageShell, PageHeader } from '../ui/PageHeader';
import { dispatchQuickCreate } from '../../lib/hub-events';

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
};
const fadeItem = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

/* ──────────────────────────────────────────────────────────── 
   CONTRACTS — Bonsai-inspired
   Features: Status overview, contract list, expiry warnings
   ──────────────────────────────────────────────────────────── */

const STATUS_MAP = {
  active:   { label: 'Active',   color: 'var(--chart-1)', bg: 'var(--info-muted)', icon: CheckCircle2 },
  pending:  { label: 'Pending',  color: 'var(--chart-3)', bg: 'var(--success-muted)', icon: Clock },
  expiring: { label: 'Expiring', color: 'var(--warning)', bg: 'var(--warning-muted)', icon: AlertCircle },
  expired:  { label: 'Expired',  color: 'var(--destructive)', bg: 'rgba(220,38,38,0.08)', icon: AlertCircle },
  draft:    { label: 'Draft',    color: 'var(--muted-foreground)', bg: 'rgba(255,255,255,0.06)', icon: FileText },
};

type ContractStatus = keyof typeof STATUS_MAP;

const ROW_ACCENT: Record<ContractStatus, string> = {
  active: '#1e40af',
  pending: '#0f766e',
  expiring: '#b45309',
  expired: '#991b1b',
  draft: '#57534e',
};

const CONTRACTS = [
  { id: 1, title: 'Master Service Agreement', client: 'Acme Corporation',
    status: 'active' as ContractStatus, startDate: 'Jan 15, 2026', endDate: 'Jan 14, 2027',
    value: '$120,000', signedBy: 'John D.' },
  { id: 2, title: 'NDA — Mobile App Project', client: 'Tech Startup Inc',
    status: 'active' as ContractStatus, startDate: 'Mar 1, 2026', endDate: 'Mar 1, 2027',
    value: 'N/A', signedBy: 'Jane S.' },
  { id: 3, title: 'Scope of Work — Brand Identity', client: 'Local Retail Co',
    status: 'pending' as ContractStatus, startDate: '—', endDate: '—',
    value: '$15,000', signedBy: '—' },
  { id: 4, title: 'Retainer Agreement — SEO Services', client: 'Growth Labs',
    status: 'expiring' as ContractStatus, startDate: 'Jun 1, 2025', endDate: 'Apr 30, 2026',
    value: '$48,000', signedBy: 'John D.' },
  { id: 5, title: 'Freelancer Agreement — Design', client: 'Internal',
    status: 'expired' as ContractStatus, startDate: 'Jan 1, 2025', endDate: 'Dec 31, 2025',
    value: '$36,000', signedBy: 'Sarah W.' },
  { id: 6, title: 'E-commerce Platform SLA', client: 'Fashion Forward',
    status: 'draft' as ContractStatus, startDate: '—', endDate: '—',
    value: '$45,000', signedBy: '—' },
];

/* ── Glass card ── */
function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
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

export default function Contracts() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<ContractStatus | 'all'>('all');

  const filtered = CONTRACTS.filter(c => {
    if (filterStatus !== 'all' && c.status !== filterStatus) return false;
    if (searchQuery && !c.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const activeCount = CONTRACTS.filter(c => c.status === 'active').length;
  const pendingCount = CONTRACTS.filter(c => c.status === 'pending' || c.status === 'draft').length;
  const expiringCount = CONTRACTS.filter(c => c.status === 'expiring').length;

  return (
    <HubPageShell narrow>
      <PageHeader
        eyebrow="Contracts"
        title="All contracts"
        description="Status, renewal risk, and value in a single scan."
        action={
          <BonsaiButton
            size="md"
            icon={<Plus className="w-3.5 h-3.5" />}
            type="button"
            onClick={() => dispatchQuickCreate('contract')}
          >
            New contract
          </BonsaiButton>
        }
      />

      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-5">
      {/* ═══ Status Summary ═══ */}
      <motion.div variants={fadeItem} className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card>
          <div className="px-4 py-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--info-muted)' }}>
              <Shield className="w-4 h-4" style={{ color: 'var(--chart-1)' }} />
            </div>
            <div>
              <p className="text-[20px] font-bold" style={{ color: 'var(--foreground)' }}>{activeCount}</p>
              <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Active</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="px-4 py-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--success-muted)' }}>
              <Clock className="w-4 h-4" style={{ color: 'var(--chart-3)' }} />
            </div>
            <div>
              <p className="text-[20px] font-bold" style={{ color: 'var(--foreground)' }}>{pendingCount}</p>
              <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Pending / Draft</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="px-4 py-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--warning-muted)' }}>
              <AlertCircle className="w-4 h-4" style={{ color: 'var(--warning)' }} />
            </div>
            <div>
              <p className="text-[20px] font-bold" style={{ color: 'var(--warning)' }}>{expiringCount}</p>
              <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Expiring Soon</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* ═══ Filter + Search ═══ */}
      <motion.div variants={fadeItem} className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="-mx-1 flex min-w-0 flex-nowrap items-center gap-1.5 overflow-x-auto px-1 pb-0.5 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {(['all', ...Object.keys(STATUS_MAP)] as const).map(status => {
            const isActive = filterStatus === status;
            const cfg = status === 'all' ? null : STATUS_MAP[status as ContractStatus];
            return (
              <button
                key={status}
                type="button"
                onClick={() => setFilterStatus(status as ContractStatus | 'all')}
                className="shrink-0 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-all"
                style={{
                  background: isActive ? (cfg?.bg || 'rgba(255,255,255,0.08)') : 'transparent',
                  color: isActive ? (cfg?.color || 'var(--foreground)') : 'var(--muted-foreground)',
                  border: `1px solid ${isActive ? 'var(--border)' : 'transparent'}`,
                }}
              >
                {status === 'all' ? 'All' : cfg?.label}
              </button>
            );
          })}
        </div>
        <div className="relative w-full sm:ml-auto sm:max-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
            style={{ color: 'var(--muted-foreground)' }} />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 rounded-lg text-[12px] bg-transparent outline-none"
            style={{
              background: 'var(--glass-bg)',
              border: '1px solid var(--border)',
              color: 'var(--foreground)',
            }}
          />
        </div>
      </motion.div>

      {/* ═══ Contracts Table ═══ */}
      <motion.div variants={fadeItem}>
        <Card>
          <div className="overflow-x-auto [-webkit-overflow-scrolling:touch]">
          {/* Header */}
          <div className="grid min-w-[720px] grid-cols-[1fr_120px_90px_90px_90px_70px_40px] gap-3 px-3 py-2.5 sm:px-5"
            style={{ borderBottom: '1px solid var(--border)', background: 'var(--glass-bg)' }}>
            {['Contract', 'Client', 'Status', 'Start', 'End', 'Value', ''].map(h => (
              <span key={h} className="text-[10px] font-medium uppercase tracking-wider"
                style={{ color: 'var(--muted-foreground)' }}>{h}</span>
            ))}
          </div>
          {/* Rows */}
          {filtered.map((contract, i) => {
            const cfg = STATUS_MAP[contract.status];
            return (
              <div
                key={contract.id}
                className="grid min-w-[720px] grid-cols-[1fr_120px_90px_90px_90px_70px_40px] gap-3 px-3 py-3 transition-colors hover:bg-white/[0.02] group sm:px-5 items-center"
                style={{
                  borderBottom: i < filtered.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                }}
              >
                {/* Title */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-1 h-6 rounded-full flex-shrink-0" style={{ background: ROW_ACCENT[contract.status] }} />
                  <span className="text-[13px] font-medium truncate" style={{ color: 'var(--foreground)' }}>
                    {contract.title}
                  </span>
                </div>
                {/* Client */}
                <span className="text-[12px] truncate" style={{ color: 'var(--foreground-secondary)' }}>
                  {contract.client}
                </span>
                {/* Status */}
                <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md w-fit"
                  style={{ background: cfg.bg, color: cfg.color }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.color }} />
                  {cfg.label}
                </span>
                {/* Start */}
                <span className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>{contract.startDate}</span>
                {/* End */}
                <span className="text-[11px]"
                  style={{ color: contract.status === 'expiring' ? 'var(--warning)' : 'var(--muted-foreground)' }}>
                  {contract.endDate}
                </span>
                {/* Value */}
                <span className="text-[12px] font-medium tabular-nums" style={{ color: 'var(--foreground)' }}>
                  {contract.value}
                </span>
                {/* Actions */}
                <button className="p-1 rounded-md transition-colors hover:bg-white/5 opacity-0 group-hover:opacity-100"
                  style={{ color: 'var(--muted-foreground)' }}>
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            );
          })}
          </div>
        </Card>
      </motion.div>
    </motion.div>
    </HubPageShell>
  );
}
