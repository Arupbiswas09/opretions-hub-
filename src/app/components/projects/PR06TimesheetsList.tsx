'use client';
import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Plus, Clock, Search, Filter, Loader2, FileText, X } from 'lucide-react';
import { useHubData } from '../../lib/hub/use-hub-data';
import { useHubDataInvalidation } from '../../lib/hub/use-data-invalidation';
import { type TimesheetRow } from '../../lib/api/hub-api';

interface Props {
  onTimesheetClick: (timesheet: any) => void;
  onCreateTimesheet: () => void;
}

const STATUS_STYLE: Record<string, { color: string; bg: string; label: string }> = {
  draft:     { color: '#6B7280', bg: 'rgba(107,114,128,0.10)', label: 'Draft' },
  submitted: { color: '#D97706', bg: 'rgba(217,119,6,0.10)',  label: 'Submitted' },
  approved:  { color: '#059669', bg: 'rgba(5,150,105,0.10)',  label: 'Approved' },
  rejected:  { color: '#DC2626', bg: 'rgba(220,38,38,0.10)',  label: 'Rejected' },
};

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-md ${className}`} style={{ background: 'var(--border)' }} />;
}

export function PR06TimesheetsList({ onTimesheetClick, onCreateTimesheet }: Props) {
  const refresh = useHubDataInvalidation('timesheets');
  const { data: rawTimesheets, loading } = useHubData<TimesheetRow[]>('/api/timesheets', refresh);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const timesheets = useMemo(() => {
    let arr = (rawTimesheets ?? []).map(ts => ({
      id: ts.id,
      weekOf: ts.week_start ? new Date(ts.week_start + 'T12:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—',
      week_start: ts.week_start,
      employee: ts.person_name ?? 'You',
      project: ts.project_name ?? '—',
      totalHours: Number(ts.total_hours ?? 0),
      status: ts.status ?? 'draft',
      submittedDate: ts.submitted_at ? new Date(ts.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : undefined,
    }));
    if (statusFilter !== 'all') arr = arr.filter(t => t.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      arr = arr.filter(t => t.project.toLowerCase().includes(q) || t.employee.toLowerCase().includes(q));
    }
    return arr;
  }, [rawTimesheets, statusFilter, search]);

  const stats = useMemo(() => {
    const all = rawTimesheets ?? [];
    return {
      thisWeek: all.length > 0 ? `${Number(all[0].total_hours ?? 0)}h` : '0h',
      pending: all.filter(t => t.status === 'submitted').length,
      thisMonth: `${all.reduce((s, t) => s + Number(t.total_hours ?? 0), 0)}h`,
      total: all.length,
    };
  }, [rawTimesheets]);

  return (
    <div className="px-3 py-4 sm:px-5">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Latest Week', value: stats.thisWeek, color: '#2563EB' },
          { label: 'Pending', value: String(stats.pending), color: '#D97706' },
          { label: 'Total Hours', value: stats.thisMonth, color: 'var(--foreground)' },
          { label: 'Timesheets', value: String(stats.total), color: 'var(--foreground)' },
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
          {['all', 'draft', 'submitted', 'approved', 'rejected'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className="rounded-lg px-2.5 py-1 text-[10px] font-medium transition-all"
              style={{
                background: statusFilter === s ? '#2563EB' : 'var(--secondary)',
                color: statusFilter === s ? 'white' : 'var(--muted-foreground)',
                border: `1px solid ${statusFilter === s ? '#2563EB' : 'var(--border)'}`,
              }}>
              {s === 'all' ? 'All' : (STATUS_STYLE[s]?.label ?? s)}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        <button onClick={onCreateTimesheet}
          className="flex items-center gap-1 rounded-lg px-3 py-[5px] text-[11px] font-semibold text-white transition-all hover:opacity-90"
          style={{ background: '#2563EB' }}>
          <Plus className="w-3.5 h-3.5" /> New Timesheet
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-2">{[1,2,3,4].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}</div>
      ) : timesheets.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--muted-foreground)' }} />
          <p className="text-[12px] font-medium" style={{ color: 'var(--muted-foreground)' }}>
            {statusFilter !== 'all' || search ? 'No timesheets match' : 'No timesheets yet'}
          </p>
          <button onClick={onCreateTimesheet} className="mt-2 text-[11px] font-medium" style={{ color: '#2563EB' }}>
            Create your first timesheet →
          </button>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
          {timesheets.map((ts, i) => {
            const st = STATUS_STYLE[ts.status] ?? STATUS_STYLE.draft;
            return (
              <motion.button
                key={ts.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                onClick={() => onTimesheetClick(ts)}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-white/[0.03]"
                style={{ borderBottom: i < timesheets.length - 1 ? '1px solid var(--border)' : 'none', background: 'var(--glass-bg)' }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${st.color}15` }}>
                  <Clock className="w-4 h-4" style={{ color: st.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <p className="text-[13px] font-medium" style={{ color: 'var(--foreground)' }}>
                      Week of {ts.weekOf}
                    </p>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium"
                      style={{ background: st.bg, color: st.color }}>
                      <span className="w-1 h-1 rounded-full" style={{ background: st.color }} />
                      {st.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]" style={{ color: 'var(--muted-foreground)' }}>
                    <span>{ts.project}</span>
                    {ts.submittedDate && (
                      <>
                        <span className="opacity-40">·</span>
                        <span>Submitted {ts.submittedDate}</span>
                      </>
                    )}
                  </div>
                </div>
                <span className="text-[16px] font-semibold tabular-nums" style={{ color: 'var(--foreground)' }}>
                  {ts.totalHours}h
                </span>
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
}
