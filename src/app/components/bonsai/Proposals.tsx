'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { useHubDataInvalidation } from '../../lib/hub/use-data-invalidation';
import {
  Plus, Search, FileText, Eye, Send, CheckCircle2,
  Clock, DollarSign, MoreHorizontal, ArrowUpRight, Filter
} from 'lucide-react';
import { BonsaiButton } from './BonsaiButton';
import { CreateProposalDrawer } from '../ui/QuickCreateDrawers';
import { SlideDrawer } from '../ui/Overlays';
import { HubPageShell, PageHeader } from '../ui/PageHeader';

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
};
const fadeItem = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

/* ──────────────────────────────────────────────────────────── 
   PROPOSALS — Bonsai-inspired
   Features: Status pipeline, proposal list, quick actions
   ──────────────────────────────────────────────────────────── */

const STATUS_CONFIG = {
  draft:    { label: 'Draft',    color: 'var(--muted-foreground)', bg: 'rgba(255,255,255,0.06)' },
  sent:     { label: 'Sent',     color: 'var(--chart-1)', bg: 'var(--info-muted)' },
  viewed:   { label: 'Viewed',   color: 'var(--chart-3)', bg: 'var(--success-muted)' },
  accepted: { label: 'Accepted', color: 'var(--success)', bg: 'var(--success-muted)' },
  declined: { label: 'Declined', color: 'var(--destructive)', bg: 'rgba(220,38,38,0.08)' },
};

type ProposalStatus = keyof typeof STATUS_CONFIG;

const ROW_ACCENT: Record<ProposalStatus, string> = {
  draft: '#57534e',
  sent: '#1e40af',
  viewed: '#0f766e',
  accepted: '#047857',
  declined: '#b91c1c',
};

function normalizeProposalStatus(raw: string | null | undefined): ProposalStatus {
  const k = (raw || 'draft').toLowerCase().replace(/\s+/g, '_');
  if (k in STATUS_CONFIG) return k as ProposalStatus;
  if (k === 'rejected' || k === 'declined') return 'declined';
  if (k === 'approved' || k === 'accepted') return 'accepted';
  return 'draft';
}

function formatMoney(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(Number(n))) return '—';
  const v = Number(n);
  if (v >= 1000) return `$${(v / 1000).toFixed(1)}K`;
  return `$${Math.round(v).toLocaleString()}`;
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

type ProposalRow = {
  id: string;
  title: string;
  client: string;
  amount: string;
  valueNum: number | null;
  status: ProposalStatus;
  date: string;
  viewed: boolean;
};

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

export default function Proposals() {
  const refresh = useHubDataInvalidation('proposals', 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<ProposalStatus | 'all'>('all');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<ProposalRow | null>(null);
  const [rows, setRows] = useState<ProposalRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch('/api/proposals?limit=100', { credentials: 'include' });
      const json = await res.json();
      if (cancelled || !res.ok || !Array.isArray(json.data)) return;
      const mapped: ProposalRow[] = json.data.map((r: Record<string, unknown>) => {
        const st = normalizeProposalStatus(r.status as string);
        const val = r.value != null ? Number(r.value) : null;
        return {
          id: String(r.id),
          title: String(r.title ?? ''),
          client: String(r.client_name ?? '—'),
          amount: formatMoney(val),
          valueNum: val,
          status: st,
          date: formatDate(r.sent_date as string | undefined) || formatDate(r.created_at as string),
          viewed: st === 'viewed',
        };
      });
      setRows(mapped);
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  const filtered = useMemo(
    () =>
      rows.filter((p) => {
        if (filterStatus !== 'all' && p.status !== filterStatus) return false;
        if (searchQuery && !p.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
      }),
    [rows, filterStatus, searchQuery]
  );

  const totalValue = rows.reduce((s, p) => s + (p.valueNum ?? 0), 0);
  const acceptedValue = rows
    .filter((p) => p.status === 'accepted')
    .reduce((s, p) => s + (p.valueNum ?? 0), 0);
  const pendingCount = rows.filter((p) => p.status === 'sent' || p.status === 'viewed').length;

  return (
    <>
    <HubPageShell narrow>
      <PageHeader
        eyebrow="Proposals"
        title="All proposals"
        description="Draft, send, and track outcomes in one calm surface."
        action={
          <BonsaiButton size="md" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setDrawerOpen(true)}>
            New proposal
          </BonsaiButton>
        }
      />

      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-5">
      {/* ═══ Pipeline Summary KPIs ═══ */}
      <motion.div variants={fadeItem} className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: 'TOTAL PROPOSALS', value: rows.length.toString(), sub: 'All time' },
          { label: 'PIPELINE VALUE', value: `$${(totalValue / 1000).toFixed(0)}K`, sub: 'Combined' },
          { label: 'WON VALUE', value: `$${(acceptedValue / 1000).toFixed(1)}K`, sub: 'Accepted', accent: true },
          { label: 'PENDING', value: pendingCount.toString(), sub: 'Awaiting response' },
        ].map((kpi, i) => (
          <Card key={i}>
            <div className="px-4 py-3.5">
              <p className="text-[9px] font-medium tracking-[0.08em] uppercase"
                style={{ color: 'var(--muted-foreground)' }}>{kpi.label}</p>
              <p className="text-[22px] font-bold mt-0.5"
                style={{
                  color: kpi.accent ? 'var(--success)' : 'var(--foreground)',
                }}>{kpi.value}</p>
              <p className="text-[10px] mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{kpi.sub}</p>
            </div>
          </Card>
        ))}
      </motion.div>

      {/* ═══ Status Filter Tabs ═══ */}
      <motion.div variants={fadeItem}>
        <div className="-mx-1 flex min-w-0 flex-nowrap items-center gap-1.5 overflow-x-auto px-1 pb-0.5 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {(['all', ...Object.keys(STATUS_CONFIG)] as const).map(status => {
            const isActive = filterStatus === status;
            const cfg = status === 'all' ? null : STATUS_CONFIG[status as ProposalStatus];
            const count =
              status === 'all' ? rows.length : rows.filter((p) => p.status === status).length;
            return (
              <button
                key={status}
                type="button"
                onClick={() => setFilterStatus(status as ProposalStatus | 'all')}
                className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-all"
                style={{
                  background: isActive ? (cfg?.bg || 'rgba(255,255,255,0.08)') : 'transparent',
                  color: isActive ? (cfg?.color || 'var(--foreground)') : 'var(--muted-foreground)',
                  border: `1px solid ${isActive ? 'var(--border)' : 'transparent'}`,
                }}
              >
                {status === 'all' ? 'All' : cfg?.label}
                <span className="text-[10px] opacity-60">{count}</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* ═══ Search ═══ */}
      <motion.div variants={fadeItem}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: 'var(--muted-foreground)' }} />
          <input
            type="text"
            placeholder="Search proposals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg text-[13px] bg-transparent outline-none"
            style={{
              background: 'var(--glass-bg)',
              border: '1px solid var(--border)',
              color: 'var(--foreground)',
            }}
          />
        </div>
      </motion.div>

      {/* ═══ Proposals List ═══ */}
      <motion.div variants={fadeItem}>
        <Card>
          <div className="overflow-x-auto [-webkit-overflow-scrolling:touch]">
          {/* Header */}
          <div className="grid min-w-[640px] grid-cols-[1fr_120px_100px_100px_80px_40px] gap-4 px-3 py-2.5 sm:px-5"
            style={{ borderBottom: '1px solid var(--border)', background: 'var(--glass-bg)' }}>
            {['Proposal', 'Client', 'Amount', 'Status', 'Date', ''].map(h => (
              <span key={h} className="text-[10px] font-medium uppercase tracking-wider"
                style={{ color: 'var(--muted-foreground)' }}>{h}</span>
            ))}
          </div>
          {/* Rows */}
          {filtered.map((proposal, i) => {
            const cfg = STATUS_CONFIG[proposal.status];
            return (
              <div
                key={proposal.id}
                className="grid min-w-[640px] grid-cols-[1fr_120px_100px_100px_80px_40px] gap-4 px-3 py-3 transition-colors hover:bg-white/[0.02] group sm:px-5 items-center"
                style={{
                  borderBottom: i < filtered.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                }}
              >
                {/* Title */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-1 h-6 rounded-full flex-shrink-0" style={{ background: ROW_ACCENT[proposal.status] }} />
                  <div className="min-w-0">
                    <div className="text-[13px] font-medium truncate" style={{ color: 'var(--foreground)' }}>
                      {proposal.title}
                    </div>
                  </div>
                </div>
                {/* Client */}
                <span className="text-[12px] truncate" style={{ color: 'var(--foreground-secondary)' }}>
                  {proposal.client}
                </span>
                {/* Amount */}
                <span className="text-[13px] font-medium tabular-nums" style={{ color: 'var(--foreground)' }}>
                  {proposal.amount}
                </span>
                {/* Status badge */}
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded-md w-fit"
                  style={{ background: cfg.bg, color: cfg.color }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.color }} />
                  {cfg.label}
                </span>
                {/* Date */}
                <span className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>
                  {proposal.date}
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
          {filtered.length === 0 && (
            <div className="px-5 py-12 text-center">
              <FileText className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--muted-foreground)' }} />
              <p className="text-[13px]" style={{ color: 'var(--muted-foreground)' }}>
                No proposals match your filters
              </p>
            </div>
          )}
        </Card>
      </motion.div>
    </motion.div>
    </HubPageShell>

    <CreateProposalDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

    {/* Detail slide-over */}
    <SlideDrawer open={detailOpen} onClose={() => setDetailOpen(false)}
      title={selectedProposal?.title || ''} subtitle={selectedProposal?.client || ''} width="520px"
      footer={
        <div className="flex items-center justify-between">
          <button className="px-3 py-2 rounded-lg text-[12px] font-medium" style={{ background: 'var(--glass-bg)', color: 'var(--foreground)', border: '1px solid var(--border)' }}>Download PDF</button>
          <BonsaiButton size="md" type="button">Send to client</BonsaiButton>
        </div>
      }>
      {selectedProposal && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-md"
              style={{ background: STATUS_CONFIG[selectedProposal.status as keyof typeof STATUS_CONFIG]?.bg, color: STATUS_CONFIG[selectedProposal.status as keyof typeof STATUS_CONFIG]?.color }}>
              {STATUS_CONFIG[selectedProposal.status as keyof typeof STATUS_CONFIG]?.label}
            </span>
            <span className="text-[18px] font-bold tabular-nums" style={{ color: 'var(--foreground)' }}>{selectedProposal.amount}</span>
          </div>
          {[{ l: 'Client', v: selectedProposal.client }, { l: 'Date', v: selectedProposal.date }, { l: 'Amount', v: selectedProposal.amount }].map(r => (
            <div key={r.l} className="flex justify-between py-2.5" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <span className="text-[12px]" style={{ color: 'var(--muted-foreground)' }}>{r.l}</span>
              <span className="text-[13px] font-medium" style={{ color: 'var(--foreground)' }}>{r.v}</span>
            </div>
          ))}
        </div>
      )}
    </SlideDrawer>
    </>
  );
}
