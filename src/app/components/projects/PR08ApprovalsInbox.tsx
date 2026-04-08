'use client';
import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { CheckCircle, XCircle, Filter, Clock, Inbox, Search, X } from 'lucide-react';
import { useHubData } from '../../lib/hub/use-hub-data';
import { useHubDataInvalidation } from '../../lib/hub/use-data-invalidation';
import { type TimesheetRow } from '../../lib/api/hub-api';

interface Props {
  onApprovalClick: (approval: any) => void;
}

const STATUS_STYLE: Record<string, { color: string; bg: string; label: string }> = {
  submitted: { color: '#D97706', bg: 'rgba(217,119,6,0.10)',  label: 'Pending' },
  approved:  { color: '#059669', bg: 'rgba(5,150,105,0.10)',  label: 'Approved' },
  rejected:  { color: '#DC2626', bg: 'rgba(220,38,38,0.10)',  label: 'Rejected' },
  draft:     { color: '#6B7280', bg: 'rgba(107,114,128,0.10)', label: 'Draft' },
};

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-md ${className}`} style={{ background: 'var(--border)' }} />;
}

export function PR08ApprovalsInbox({ onApprovalClick }: Props) {
  const refresh = useHubDataInvalidation('timesheets');
  const { data: rawTimesheets, loading } = useHubData<TimesheetRow[]>('/api/timesheets', refresh);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [search, setSearch] = useState('');

  // Only show submitted/approved/rejected (not drafts — those aren't in the approval flow)
  const approvals = useMemo(() => {
    let arr = (rawTimesheets ?? [])
      .filter(ts => ts.status !== 'draft')
      .map(ts => ({
        id: ts.id,
        employee: ts.person_name ?? 'Team Member',
        weekOf: ts.week_start ? new Date(ts.week_start + 'T12:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—',
        totalHours: Number(ts.total_hours ?? 0),
        status: ts.status,
        submittedDate: ts.submitted_at ? new Date(ts.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—',
        project: ts.project_name ?? '—',
      }));

    if (filter === 'pending') arr = arr.filter(a => a.status === 'submitted');
    else if (filter === 'approved') arr = arr.filter(a => a.status === 'approved');
    else if (filter === 'rejected') arr = arr.filter(a => a.status === 'rejected');

    if (search) {
      const q = search.toLowerCase();
      arr = arr.filter(a => a.employee.toLowerCase().includes(q) || a.project.toLowerCase().includes(q));
    }
    return arr;
  }, [rawTimesheets, filter, search]);

  const stats = useMemo(() => {
    const all = (rawTimesheets ?? []).filter(ts => ts.status !== 'draft');
    return {
      pending: all.filter(t => t.status === 'submitted').length,
      approvedWeek: all.filter(t => t.status === 'approved').length,
      hoursInQueue: all.filter(t => t.status === 'submitted').reduce((s, t) => s + Number(t.total_hours ?? 0), 0),
      total: all.length,
    };
  }, [rawTimesheets]);

  return (
    <div className="px-3 py-4 sm:px-5">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Pending', value: String(stats.pending), color: '#D97706' },
          { label: 'Approved', value: String(stats.approvedWeek), color: '#059669' },
          { label: 'Hours in Queue', value: `${stats.hoursInQueue}h`, color: '#2563EB' },
          { label: 'Total', value: String(stats.total), color: 'var(--foreground)' },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-3.5"
            style={{ background: 'var(--glass-bg)', border: '1px solid var(--border)' }}>
            <p className="text-[10px] font-medium uppercase tracking-wider mb-1"
              style={{ color: 'var(--muted-foreground)' }}>{s.label}</p>
            <p className="text-[20px] font-bold tabular-nums" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <div className="flex items-center gap-1.5 rounded-lg px-2.5 py-[5px] flex-1 min-w-[140px] max-w-[240px]"
          style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}>
          <Search className="w-3 h-3 shrink-0" style={{ color: 'var(--muted-foreground)' }} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
            className="w-full bg-transparent text-[11px] outline-none" style={{ color: 'var(--foreground)' }} />
          {search && <button onClick={() => setSearch('')}><X className="w-3 h-3" style={{ color: 'var(--muted-foreground)' }} /></button>}
        </div>

        <div className="flex items-center gap-1">
          {(['all', 'pending', 'approved', 'rejected'] as const).map(key => (
            <button key={key} onClick={() => setFilter(key)}
              className="rounded-lg px-2.5 py-1 text-[10px] font-medium transition-all"
              style={{
                background: filter === key ? '#2563EB' : 'var(--secondary)',
                color: filter === key ? 'white' : 'var(--muted-foreground)',
                border: `1px solid ${filter === key ? '#2563EB' : 'var(--border)'}`,
              }}>
              {key === 'all' ? 'All' : key.charAt(0).toUpperCase() + key.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-2">{[1,2,3,4].map(i => <Skeleton key={i} className="h-18 w-full rounded-xl" />)}</div>
      ) : approvals.length === 0 ? (
        <div className="text-center py-12">
          <Inbox className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--muted-foreground)' }} />
          <p className="text-[12px] font-medium" style={{ color: 'var(--muted-foreground)' }}>
            {filter === 'pending' ? 'No pending approvals' : 'No approvals match'}
          </p>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
          {approvals.map((approval, i) => {
            const st = STATUS_STYLE[approval.status] ?? STATUS_STYLE.draft;
            const initials = approval.employee.split(' ').map(n => n[0]).join('').slice(0, 2);
            const isPending = approval.status === 'submitted';

            return (
              <motion.button
                key={approval.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                onClick={() => onApprovalClick(approval)}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-white/[0.03]"
                style={{ borderBottom: i < approvals.length - 1 ? '1px solid var(--border)' : 'none', background: 'var(--glass-bg)' }}>

                {/* Avatar */}
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #2563EB, #6366F1)' }}>
                  {initials}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <p className="text-[13px] font-medium" style={{ color: 'var(--foreground)' }}>{approval.employee}</p>
                    <span className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>·</span>
                    <span className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>{approval.project}</span>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium"
                      style={{ background: st.bg, color: st.color }}>
                      <span className="w-1 h-1 rounded-full" style={{ background: st.color }} />
                      {st.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]" style={{ color: 'var(--muted-foreground)' }}>
                    <span>Week of {approval.weekOf}</span>
                    <span className="opacity-40">·</span>
                    <span className="tabular-nums">{approval.totalHours}h</span>
                    <span className="opacity-40">·</span>
                    <span>Submitted {approval.submittedDate}</span>
                  </div>
                </div>

                {/* Action buttons for pending */}
                {isPending ? (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={e => { e.stopPropagation(); onApprovalClick({ ...approval, action: 'approve' }); }}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors"
                      style={{ background: 'rgba(5,150,105,0.10)', color: '#059669', border: '1px solid rgba(5,150,105,0.20)' }}>
                      <CheckCircle className="w-3 h-3" /> Approve
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); onApprovalClick({ ...approval, action: 'reject' }); }}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors"
                      style={{ background: 'rgba(220,38,38,0.10)', color: '#DC2626', border: '1px solid rgba(220,38,38,0.20)' }}>
                      <XCircle className="w-3 h-3" /> Reject
                    </button>
                  </div>
                ) : (
                  <span className="text-[16px] font-semibold tabular-nums shrink-0" style={{ color: 'var(--foreground)' }}>
                    {approval.totalHours}h
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
}
