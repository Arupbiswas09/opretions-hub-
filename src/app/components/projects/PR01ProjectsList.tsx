'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus, Search, Filter, ArrowUpDown, List, LayoutGrid, Columns3,
  FolderKanban, Play, X, Loader2,
} from 'lucide-react';
import { useHubData } from '../../lib/hub/use-hub-data';
import { type ProjectRow, type TaskRow } from '../../lib/api/hub-api';

/* ── Types ── */
interface Project {
  id: string;
  name: string;
  client: string;
  client_id: string | null;
  status: 'Planning' | 'In Progress' | 'On Hold' | 'Completed' | 'Cancelled';
  dbStatus: string;
  startDate: string;
  endDate: string;
  budgetHours: number;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  budget_hours: number | null;
}

interface Props {
  onProjectClick: (project: any) => void;
  onCreateProject: () => void;
  dataRefreshVersion?: number;
}

const STATUS_MAP: Record<string, Project['status']> = {
  active: 'In Progress', planning: 'Planning', completed: 'Completed',
  on_hold: 'On Hold', cancelled: 'Cancelled',
};

const STATUS_STYLE: Record<Project['status'], { color: string; bg: string }> = {
  'In Progress': { color: '#2563EB', bg: 'rgba(37,99,235,0.10)' },
  'Planning':    { color: '#8B5CF6', bg: 'rgba(139,92,246,0.10)' },
  'On Hold':     { color: '#D97706', bg: 'rgba(217,119,6,0.10)' },
  'Completed':   { color: '#059669', bg: 'rgba(5,150,105,0.10)' },
  'Cancelled':   { color: '#6B7280', bg: 'rgba(107,114,128,0.10)' },
};

const KANBAN_COLS: Project['status'][] = ['Planning', 'In Progress', 'On Hold', 'Completed'];

/* ── Skeleton row ── */
function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-3 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
      <div className="w-7 h-7 rounded-lg animate-pulse" style={{ background: 'var(--border)' }} />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 w-32 rounded animate-pulse" style={{ background: 'var(--border)' }} />
        <div className="h-2 w-20 rounded animate-pulse" style={{ background: 'var(--border)' }} />
      </div>
      <div className="h-5 w-16 rounded animate-pulse" style={{ background: 'var(--border)' }} />
    </div>
  );
}

/* ── Main Component ── */
export function PR01ProjectsList({ onProjectClick, onCreateProject, dataRefreshVersion }: Props) {
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'kanban'>('list');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<Project['status'] | 'all'>('all');
  const [sortKey, setSortKey] = useState<'name' | 'status' | 'budget'>('name');
  const [sortAsc, setSortAsc] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const { data: rawProjects, loading } = useHubData<ProjectRow[]>('/api/projects');
  const { data: rawTasks } = useHubData<TaskRow[]>('/api/tasks?limit=200');

  /* ── Global search listener ── */
  useEffect(() => {
    const handler = (e: Event) => {
      const q = (e as CustomEvent).detail?.query ?? '';
      setSearch(q);
    };
    window.addEventListener('hub:global-search', handler);
    return () => window.removeEventListener('hub:global-search', handler);
  }, []);

  /* ── Compute task-based progress per project ── */
  const tasksByProject = useMemo(() => {
    const map: Record<string, { total: number; done: number }> = {};
    (rawTasks ?? []).forEach(t => {
      if (!t.project_id) return;
      if (!map[t.project_id]) map[t.project_id] = { total: 0, done: 0 };
      map[t.project_id].total++;
      if (t.status === 'done') map[t.project_id].done++;
    });
    return map;
  }, [rawTasks]);

  const projects: Project[] = useMemo(() =>
    (rawProjects ?? []).map(p => {
      const taskInfo = tasksByProject[p.id];
      return {
        id: p.id,
        name: p.name,
        client: p.client_name ?? '—',
        client_id: p.client_id,
        status: STATUS_MAP[p.status] ?? 'Planning',
        dbStatus: p.status,
        startDate: p.start_date ? new Date(p.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—',
        endDate: p.end_date ? new Date(p.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—',
        budgetHours: Number(p.budget_hours ?? 0),
        description: p.description,
        start_date: p.start_date,
        end_date: p.end_date,
        budget_hours: p.budget_hours,
        // Real progress from tasks
        progress: taskInfo ? (taskInfo.total > 0 ? Math.round((taskInfo.done / taskInfo.total) * 100) : 0) : (p.status === 'completed' ? 100 : 0),
        tasksDone: taskInfo?.done ?? 0,
        tasksTotal: taskInfo?.total ?? 0,
      };
    }), [rawProjects, tasksByProject]);

  const filtered = useMemo(() => {
    let arr = projects;
    if (statusFilter !== 'all') arr = arr.filter(p => p.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      arr = arr.filter(p => p.name.toLowerCase().includes(q) || p.client.toLowerCase().includes(q));
    }
    arr.sort((a, b) => {
      const v = sortKey === 'name' ? a.name.localeCompare(b.name)
        : sortKey === 'status' ? a.status.localeCompare(b.status)
        : a.budgetHours - b.budgetHours;
      return sortAsc ? v : -v;
    });
    return arr;
  }, [projects, statusFilter, search, sortKey, sortAsc]);

  const stats = useMemo(() => ({
    total: projects.length,
    active: projects.filter(p => p.status === 'In Progress').length,
    planning: projects.filter(p => p.status === 'Planning').length,
    completed: projects.filter(p => p.status === 'Completed').length,
  }), [projects]);

  const toggleSort = (key: typeof sortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  return (
    <div className="px-3 py-4 sm:px-5">
      {/* ── Stats row ── */}
      <div className="flex items-center gap-4 mb-4 overflow-x-auto scrollbar-none">
        {[
          { label: 'Total', value: stats.total, color: 'var(--foreground)' },
          { label: 'Active', value: stats.active, color: '#2563EB' },
          { label: 'Planning', value: stats.planning, color: '#8B5CF6' },
          { label: 'Done', value: stats.completed, color: '#059669' },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-2 shrink-0">
            <span className="text-[18px] font-bold tabular-nums" style={{ color: s.color }}>{s.value}</span>
            <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <div className="flex items-center gap-1.5 rounded-lg px-2.5 py-[5px] flex-1 min-w-[140px] max-w-[260px]"
          style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}>
          <Search className="w-3 h-3 shrink-0" style={{ color: 'var(--muted-foreground)' }} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search projects…"
            className="w-full bg-transparent text-[11px] outline-none"
            style={{ color: 'var(--foreground)' }} />
          {search && (
            <button onClick={() => setSearch('')} className="shrink-0" style={{ color: 'var(--muted-foreground)' }}>
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        <button onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-1 rounded-lg px-2.5 py-[5px] text-[11px] font-medium transition-colors"
          style={{
            background: statusFilter !== 'all' ? 'rgba(37,99,235,0.08)' : 'var(--secondary)',
            border: statusFilter !== 'all' ? '1px solid rgba(37,99,235,0.20)' : '1px solid var(--border)',
            color: statusFilter !== 'all' ? '#2563EB' : 'var(--muted-foreground)',
          }}>
          <Filter className="w-3 h-3" />
          {statusFilter !== 'all' ? statusFilter : 'Filter'}
        </button>

        <button onClick={() => toggleSort(sortKey)}
          className="flex items-center gap-1 rounded-lg px-2.5 py-[5px] text-[11px] font-medium transition-colors"
          style={{ background: 'var(--secondary)', border: '1px solid var(--border)', color: 'var(--muted-foreground)' }}>
          <ArrowUpDown className="w-3 h-3" />
          {sortKey}
        </button>

        <div className="flex-1" />

        <div className="flex items-center gap-0.5 rounded-lg p-0.5"
          style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}>
          {([['list', List], ['kanban', Columns3], ['grid', LayoutGrid]] as const).map(([mode, Icon]) => (
            <button key={mode} onClick={() => setViewMode(mode)}
              className="rounded-md p-1.5 transition-all"
              style={{
                background: viewMode === mode ? '#2563EB' : 'transparent',
                color: viewMode === mode ? 'white' : 'var(--muted-foreground)',
              }}>
              <Icon className="w-3.5 h-3.5" />
            </button>
          ))}
        </div>

        <button onClick={onCreateProject}
          className="flex items-center gap-1 rounded-lg px-3 py-[5px] text-[11px] font-semibold text-white transition-all hover:opacity-90"
          style={{ background: '#2563EB' }}>
          <Plus className="w-3.5 h-3.5" /> New Project
        </button>
      </div>

      {/* ── Filter row ── */}
      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="mb-3 overflow-hidden">
            <div className="flex flex-wrap gap-1.5 py-2">
              {(['all', 'In Progress', 'Planning', 'On Hold', 'Completed', 'Cancelled'] as const).map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className="rounded-lg px-2.5 py-1 text-[10px] font-medium transition-all"
                  style={{
                    background: statusFilter === s ? '#2563EB' : 'var(--secondary)',
                    color: statusFilter === s ? 'white' : 'var(--muted-foreground)',
                    border: `1px solid ${statusFilter === s ? '#2563EB' : 'var(--border)'}`,
                  }}>
                  {s === 'all' ? `All (${projects.length})` : s}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── List View ── */}
      {viewMode === 'list' && (
        <>
          <div className="hidden sm:grid grid-cols-[1fr_120px_90px_100px_80px] gap-3 px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider"
            style={{ color: 'var(--muted-foreground)', borderBottom: '1px solid var(--border)' }}>
            <button className="text-left flex items-center gap-1" onClick={() => toggleSort('name')}>
              Project {sortKey === 'name' && <ArrowUpDown className="w-2.5 h-2.5" />}
            </button>
            <span>Client</span>
            <button className="flex items-center gap-1" onClick={() => toggleSort('status')}>
              Status {sortKey === 'status' && <ArrowUpDown className="w-2.5 h-2.5" />}
            </button>
            <button className="flex items-center gap-1" onClick={() => toggleSort('budget')}>
              Budget {sortKey === 'budget' && <ArrowUpDown className="w-2.5 h-2.5" />}
            </button>
            <span>Progress</span>
          </div>

          {loading && (
            <div>{[1,2,3,4,5].map(i => <SkeletonRow key={i} />)}</div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="text-center py-12">
              <FolderKanban className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--muted-foreground)' }} />
              <p className="text-[12px] font-medium" style={{ color: 'var(--muted-foreground)' }}>
                {search || statusFilter !== 'all' ? 'No projects match your filters' : 'No projects yet'}
              </p>
              <button onClick={onCreateProject} className="mt-2 text-[11px] font-medium" style={{ color: '#2563EB' }}>
                Create your first project →
              </button>
            </div>
          )}

          {filtered.map((p: any, i) => (
            <motion.div key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
              onClick={() => onProjectClick(p)}
              className="grid grid-cols-1 sm:grid-cols-[1fr_120px_90px_100px_80px] gap-2 sm:gap-3 items-center px-3 py-2.5 cursor-pointer transition-colors hover:bg-white/[0.03] group"
              style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                  style={{ background: 'linear-gradient(135deg, #2563EB, #6366F1)' }}>
                  {p.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-[12px] font-medium truncate" style={{ color: 'var(--foreground)' }}>{p.name}</p>
                  <p className="text-[10px] truncate sm:hidden" style={{ color: 'var(--muted-foreground)' }}>{p.client}</p>
                </div>
              </div>
              <span className="hidden sm:block text-[11px] truncate" style={{ color: 'var(--muted-foreground)' }}>{p.client}</span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium w-fit"
                style={{ background: STATUS_STYLE[p.status as Project['status']]?.bg, color: STATUS_STYLE[p.status as Project['status']]?.color }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS_STYLE[p.status as Project['status']]?.color }} />
                {p.status}
              </span>
              {/* Budget — real hours */}
              <div className="hidden sm:flex items-center gap-2">
                {p.budgetHours > 0 ? (
                  <>
                    <div className="w-14 h-[3px] rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                      <div className="h-full rounded-full" style={{
                        width: `${Math.min(p.progress, 100)}%`,
                        background: p.progress > 85 ? '#EF4444' : p.progress > 60 ? '#D97706' : '#059669',
                      }} />
                    </div>
                    <span className="text-[10px] tabular-nums" style={{ color: 'var(--muted-foreground)' }}>{p.budgetHours}h</span>
                  </>
                ) : (
                  <span className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>—</span>
                )}
              </div>
              {/* Progress — real from tasks */}
              <div className="hidden sm:flex items-center gap-1.5">
                <div className="w-12 h-[3px] rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                  <div className="h-full rounded-full" style={{ width: `${p.progress}%`, background: '#2563EB' }} />
                </div>
                <span className="text-[10px] tabular-nums" style={{ color: 'var(--muted-foreground)' }}>
                  {p.tasksTotal > 0 ? `${p.tasksDone}/${p.tasksTotal}` : `${p.progress}%`}
                </span>
              </div>
            </motion.div>
          ))}
        </>
      )}

      {/* ── Grid View ── */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {loading ? (
            [1,2,3,4,5,6].map(i => (
              <div key={i} className="rounded-xl p-4 animate-pulse" style={{ background: 'var(--popover)', border: '1px solid var(--border)' }}>
                <div className="h-8 w-8 rounded-lg mb-3" style={{ background: 'var(--border)' }} />
                <div className="h-4 w-3/4 rounded mb-1.5" style={{ background: 'var(--border)' }} />
                <div className="h-3 w-1/2 rounded" style={{ background: 'var(--border)' }} />
              </div>
            ))
          ) : (
            filtered.map((p: any, i) => (
              <motion.button key={p.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                onClick={() => onProjectClick(p)}
                className="rounded-xl p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md"
                style={{ background: 'var(--popover)', border: '1px solid var(--border)' }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, #2563EB, #6366F1)' }}>
                    {p.name.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium"
                    style={{ background: STATUS_STYLE[p.status as Project['status']]?.bg, color: STATUS_STYLE[p.status as Project['status']]?.color }}>
                    {p.status}
                  </span>
                </div>
                <p className="text-[13px] font-semibold mb-0.5 truncate" style={{ color: 'var(--foreground)' }}>{p.name}</p>
                <p className="text-[10px] mb-3" style={{ color: 'var(--muted-foreground)' }}>{p.client}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-14 h-[3px] rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                      <div className="h-full rounded-full" style={{ width: `${p.progress}%`, background: '#2563EB' }} />
                    </div>
                    <span className="text-[10px] tabular-nums" style={{ color: 'var(--muted-foreground)' }}>
                      {p.tasksTotal > 0 ? `${p.tasksDone}/${p.tasksTotal}` : `${p.progress}%`}
                    </span>
                  </div>
                  {p.budgetHours > 0 && (
                    <span className="text-[10px] tabular-nums font-medium" style={{ color: 'var(--muted-foreground)' }}>{p.budgetHours}h</span>
                  )}
                </div>
              </motion.button>
            ))
          )}
        </div>
      )}

      {/* ── Kanban View ── */}
      {viewMode === 'kanban' && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
          {KANBAN_COLS.map(col => {
            const colProjects = filtered.filter(p => p.status === col);
            const s = STATUS_STYLE[col];
            return (
              <div key={col} className="w-[260px] shrink-0 flex flex-col">
                <div className="flex items-center gap-2 mb-2.5 px-1">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
                  <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>{col}</span>
                  <span className="text-[10px] font-bold ml-auto" style={{ color: 'var(--muted-foreground)' }}>{colProjects.length}</span>
                </div>
                <div className="space-y-2 flex-1">
                  {colProjects.map((p: any) => (
                    <button key={p.id} onClick={() => onProjectClick(p)}
                      className="w-full rounded-xl p-3 text-left transition-all hover:-translate-y-0.5"
                      style={{ background: 'var(--popover)', border: '1px solid var(--border)' }}>
                      <p className="text-[12px] font-medium mb-0.5 truncate" style={{ color: 'var(--foreground)' }}>{p.name}</p>
                      <p className="text-[10px] mb-2" style={{ color: 'var(--muted-foreground)' }}>{p.client}</p>
                      <div className="flex items-center gap-2">
                        <div className="w-full h-[3px] rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                          <div className="h-full rounded-full" style={{ width: `${p.progress}%`, background: '#2563EB' }} />
                        </div>
                        <span className="text-[10px] tabular-nums shrink-0" style={{ color: 'var(--muted-foreground)' }}>
                          {p.tasksTotal > 0 ? `${p.tasksDone}/${p.tasksTotal}` : `${p.progress}%`}
                        </span>
                      </div>
                    </button>
                  ))}
                  <button onClick={onCreateProject}
                    className="w-full py-2 rounded-xl text-[10px] font-medium transition-colors"
                    style={{ color: 'var(--muted-foreground)', border: '1px dashed var(--border)' }}>
                    + New
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
