'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus, Search, CheckSquare, AlertCircle, ThumbsUp, Inbox, Clock, Circle, ArrowRight, Tag,
  User, Calendar, Briefcase, FolderKanban, LayoutGrid, List, Kanban, Flag, Flame, Zap, X,
  GripVertical, MoreHorizontal, ArrowUpDown, CheckCircle2, Eye, Pencil, Trash2, RefreshCw,
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { BonsaiButton } from '../bonsai/BonsaiButton';
import { cn } from '../ui/utils';
import { useHubDataInvalidation } from '../../lib/hub/use-data-invalidation';
import { dispatchQuickCreate, dispatchDataInvalidation } from '../../lib/hub-events';
import { useUserRole } from '../../lib/UserRoleContext';
import { createSupabaseBrowserClient, isSupabaseBrowserConfigured } from '../../lib/supabase/client';
import { DetailDrawer, DrawerField, EmptyState } from './DetailDrawer';

type WorkTab = 'tasks' | 'issues' | 'approvals' | 'requests';
type Priority = 'critical' | 'high' | 'medium' | 'low';
type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done';
type IssueStatus = 'open' | 'in-progress' | 'resolved' | 'closed';
type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'needs-info';
type RequestStatus = 'open' | 'in-progress' | 'resolved';

interface TaskRow {
  id: string;
  title: string;
  project: string;
  assignee: string;
  assigneeInitials: string;
  priority: Priority;
  status: TaskStatus;
  dueDate: string;
  tags: string[];
}

interface IssueRow {
  id: string;
  title: string;
  description: string;
  project: string;
  assignee: string;
  assigneeInitials: string;
  priority: Priority;
  status: IssueStatus;
  createdAt: string;
  type: 'bug' | 'feature' | 'improvement';
}

interface ApprovalRow {
  id: string;
  title: string;
  type: string;
  requestedBy: string;
  requestedByInitials: string;
  status: ApprovalStatus;
  amount?: string;
  dueDate: string;
  client?: string;
}

interface RequestRow {
  id: string;
  title: string;
  type: 'support' | 'change' | 'onboarding' | 'access';
  from: string;
  fromInitials: string;
  status: RequestStatus;
  priority: Priority;
  createdAt: string;
  client?: string;
}

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; icon: React.ElementType }> = {
  critical: { label: 'Critical', color: '#EF4444', icon: Flame },
  high: { label: 'High', color: '#F97316', icon: Flag },
  medium: { label: 'Medium', color: '#EAB308', icon: Zap },
  low: { label: 'Low', color: 'var(--muted-foreground)', icon: ArrowRight },
};

const TASK_STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; bg: string }> = {
  todo: { label: 'To do', color: 'var(--muted-foreground)', bg: 'var(--secondary)' },
  'in-progress': { label: 'In progress', color: '#2563EB', bg: '#2563EB15' },
  review: { label: 'In review', color: '#2563EB', bg: 'rgba(37,99,235,0.12)' },
  done: { label: 'Done', color: 'var(--muted-foreground)', bg: 'var(--secondary)' },
};

const ISSUE_STATUS_CONFIG: Record<IssueStatus, { label: string; color: string }> = {
  open: { label: 'Open', color: '#EF4444' },
  'in-progress': { label: 'In progress', color: '#2563EB' },
  resolved: { label: 'Resolved', color: '#10B981' },
  closed: { label: 'Closed', color: 'var(--muted-foreground)' },
};

const APPROVAL_STATUS_CONFIG: Record<ApprovalStatus, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending', color: '#EAB308', bg: '#EAB30815' },
  approved: { label: 'Approved', color: '#10B981', bg: '#10B98115' },
  rejected: { label: 'Rejected', color: '#EF4444', bg: '#EF444415' },
  'needs-info': { label: 'Needs info', color: '#F97316', bg: '#F9731615' },
};

const TYPE_ICONS: Record<string, React.ElementType> = {
  invoice: Briefcase, timesheet: Clock, proposal: FolderKanban,
  expense: Tag, leave: Calendar, support: Inbox,
  change: ArrowRight, onboarding: User, access: CheckSquare,
  bug: AlertCircle, feature: Plus, improvement: Zap,
  request: Inbox,
};

function initialsFromName(name: string): string {
  const p = name.trim().split(/\s+/).filter(Boolean);
  if (!p.length) return '?';
  if (p.length === 1) return p[0]!.slice(0, 2).toUpperCase();
  return (p[0]![0]! + p[p.length - 1]![0]!).toUpperCase();
}

function mapDbPriority(p: string | null | undefined): Priority {
  const x = (p || 'medium').toLowerCase();
  if (x === 'urgent') return 'critical';
  if (x === 'high') return 'high';
  if (x === 'low') return 'low';
  return 'medium';
}

function formatDue(d: string | null | undefined): string {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return '—';
  }
}

function formatRelative(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    const t = new Date(iso).getTime();
    const diff = Date.now() - t;
    const h = Math.floor(diff / 3600000);
    if (h < 1) return 'Just now';
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    if (d < 7) return `${d}d ago`;
    return formatDue(iso);
  } catch {
    return '—';
  }
}

function parseTicketSubject(subject: string): { type: RequestRow['type']; title: string } {
  const m = subject.match(/^\[([a-z0-9_-]+)\]\s*(.*)$/i);
  const raw = m ? m[1]!.toLowerCase() : 'support';
  const title = m ? (m[2]!.trim() || subject) : subject;
  const t =
    raw === 'access' || raw === 'change' || raw === 'onboarding' || raw === 'support'
      ? (raw as RequestRow['type'])
      : 'support';
  return { type: t, title };
}

function mapReqStatus(db: string): RequestStatus {
  if (db === 'in_progress') return 'in-progress';
  if (db === 'resolved' || db === 'closed') return 'resolved';
  return 'open';
}

function PriorityBadge({ priority }: { priority: Priority }) {
  const cfg = PRIORITY_CONFIG[priority];
  const Icon = cfg.icon;
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-medium">
      <Icon className="w-3 h-3" style={{ color: cfg.color }} />
    </span>
  );
}

function StatusChip({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium"
      style={{ color, background: bg }}>
      {label}
    </span>
  );
}

const AVATAR_COLORS = ['#2563EB','#7C3AED','#059669','#DC2626','#D97706','#0891B2','#4F46E5','#BE185D'];
function hashColor(s: string) { let h = 0; for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h); return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length]; }

function Avatar({ initials, size = 'sm' }: { initials: string; size?: 'sm' | 'xs' }) {
  const dim = size === 'sm' ? 'w-6 h-6 text-[9px]' : 'w-5 h-5 text-[8px]';
  return (
    <div className={cn(dim, 'rounded-full flex items-center justify-center font-bold text-white flex-shrink-0')}
      style={{ background: hashColor(initials) }}>
      {initials}
    </div>
  );
}

const NEXT_TASK_STATUS: Record<TaskStatus, TaskStatus> = { todo: 'in-progress', 'in-progress': 'review', review: 'done', done: 'todo' };

function StatusDot({ status, onClick }: { status: TaskStatus; onClick?: () => void }) {
  const cfg = TASK_STATUS_CONFIG[status];
  const isDone = status === 'done';
  return (
    <button type="button" onClick={(e) => { e.stopPropagation(); onClick?.(); }}
      className="group/dot relative flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-all hover:scale-110"
      style={{ border: `2px solid ${cfg.color}`, background: isDone ? cfg.color : 'transparent' }}
      title={`Status: ${cfg.label} — click to cycle`}
    >
      {isDone && <CheckCircle2 className="h-3 w-3 text-white" />}
    </button>
  );
}

const BOARD_COLS: TaskStatus[] = ['todo', 'in-progress', 'review', 'done'];

function TasksTab({ refreshVersion, canMutate }: { refreshVersion: number; canMutate: boolean }) {
  const [view, setView] = useState<'list' | 'board'>('list');
  const [filter, setFilter] = useState<TaskStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState<TaskRow[]>([]);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [detailTask, setDetailTask] = useState<TaskRow | null>(null);

  const load = useCallback(async () => {
    setLoadErr(null);
    const res = await fetch('/api/tasks?limit=200', { credentials: 'include' });
    const json = await res.json();
    if (!res.ok || !Array.isArray(json.data)) {
      setLoadErr(json.error || 'Failed to load tasks');
      setRows([]);
      return;
    }
    const mapped: TaskRow[] = json.data.map((r: Record<string, unknown>) => ({
      id: String(r.id),
      title: String(r.title ?? ''),
      project: String(r.project_name ?? '—'),
      assignee: String(r.assignee_name ?? 'Unassigned'),
      assigneeInitials: initialsFromName(String(r.assignee_name ?? '?')),
      priority: mapDbPriority(r.priority as string),
      status: (r.status as TaskStatus) in TASK_STATUS_CONFIG ? (r.status as TaskStatus) : 'todo',
      dueDate: formatDue(r.due_date as string | undefined),
      tags: Array.isArray(r.tags) ? (r.tags as string[]) : [],
    }));
    setRows(mapped);
  }, []);

  useEffect(() => { void load(); }, [load, refreshVersion]);

  const filtered = useMemo(
    () => rows.filter((t) => {
      if (filter !== 'all' && t.status !== filter) return false;
      if (search) { const q = search.toLowerCase(); if (!t.title.toLowerCase().includes(q) && !t.project.toLowerCase().includes(q)) return false; }
      return true;
    }),
    [rows, filter, search],
  );

  const cycleStatus = async (task: TaskRow) => {
    if (!canMutate) return;
    const next = NEXT_TASK_STATUS[task.status];
    const prev = [...rows];
    setRows((r) => r.map((t) => (t.id === task.id ? { ...t, status: next } : t)));
    if (detailTask?.id === task.id) setDetailTask({ ...task, status: next });
    const res = await fetch(`/api/tasks/${task.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ status: next }) });
    if (!res.ok) { setRows(prev); return; }
    dispatchDataInvalidation('tasks');
  };

  const deleteTask = async (id: string) => {
    if (!canMutate) return;
    const prev = [...rows];
    setRows((r) => r.filter((t) => t.id !== id));
    setDetailTask(null);
    const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE', credentials: 'include' });
    if (!res.ok) setRows(prev);
    else dispatchDataInvalidation('tasks');
  };

  const onDragEnd = async (result: DropResult) => {
    if (!canMutate) return;
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;
    const sourceCol = source.droppableId as TaskStatus;
    const destCol = destination.droppableId as TaskStatus;
    const prev = [...rows];
    if (sourceCol === destCol) {
      const colTasks = rows.filter((t) => t.status === sourceCol);
      const items = [...colTasks];
      const [card] = items.splice(source.index, 1);
      if (!card) return;
      items.splice(destination.index, 0, card);
      setRows([...rows.filter((t) => t.status !== sourceCol), ...items]);
      return;
    }
    setRows((r) => r.map((t) => (t.id === draggableId ? { ...t, status: destCol } : t)));
    const res = await fetch(`/api/tasks/${draggableId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ status: destCol }) });
    if (!res.ok) { setRows(prev); return; }
    dispatchDataInvalidation('tasks');
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex flex-col gap-3 border-b px-3 py-3 sm:flex-row sm:items-center sm:px-5" style={{ borderColor: 'var(--border)' }}>
        <div className="flex max-w-full flex-1 items-center gap-1.5 rounded-lg px-2.5 py-1.5 sm:max-w-56" style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}>
          <Search className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--muted-foreground)' }} />
          <input className="min-w-0 flex-1 bg-transparent text-[12px] outline-none" style={{ color: 'var(--foreground)' }} placeholder="Search tasks…" value={search} onChange={(e) => setSearch(e.target.value)} />
          {search && <button type="button" onClick={() => setSearch('')} className="shrink-0" style={{ color: 'var(--muted-foreground)' }}><X className="h-3 w-3" /></button>}
        </div>
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1 sm:flex-[2]">
          {(['all', 'todo', 'in-progress', 'review', 'done'] as const).map((s) => (
            <button key={s} type="button" onClick={() => setFilter(s)} className="rounded-lg px-2 py-1 text-[10px] font-medium capitalize transition-all sm:px-2.5 sm:text-[11px]" style={{ background: filter === s ? '#2563EB' : 'var(--secondary)', color: filter === s ? 'white' : 'var(--muted-foreground)' }}>
              {s === 'all' ? `All (${rows.length})` : TASK_STATUS_CONFIG[s as TaskStatus].label}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-end gap-1 sm:ml-auto">
          {([['list', List], ['board', Kanban]] as const).map(([v, Icon]) => (
            <button key={v} type="button" onClick={() => setView(v)} className="rounded-lg p-2 transition-colors sm:p-1.5" style={{ background: view === v ? '#2563EB15' : 'transparent', color: view === v ? '#2563EB' : 'var(--muted-foreground)' }}>
              <Icon className="h-4 w-4" />
            </button>
          ))}
          <BonsaiButton size="sm" type="button" onClick={() => canMutate && dispatchQuickCreate('task')}>
            <Plus className="h-3.5 w-3.5 sm:mr-1" /><span className="hidden sm:inline">New task</span>
          </BonsaiButton>
        </div>
      </div>

      {loadErr && <p className="px-5 py-2 text-[12px]" style={{ color: 'var(--destructive)' }}>{loadErr}</p>}

      {filtered.length === 0 && !loadErr ? (
        <EmptyState icon={CheckSquare} title="No tasks yet" description="Create your first task to start tracking work across projects." action={canMutate ? <BonsaiButton size="sm" onClick={() => dispatchQuickCreate('task')}><Plus className="mr-1 h-3.5 w-3.5" />New task</BonsaiButton> : undefined} />
      ) : view === 'list' ? (
        <div className="min-h-0 flex-1 overflow-y-auto">
          {/* Mobile cards */}
          <div className="space-y-2 p-3 md:hidden">
            {filtered.map((task) => { const s = TASK_STATUS_CONFIG[task.status]; return (
              <div key={task.id} onClick={() => setDetailTask(task)} className="cursor-pointer rounded-xl border p-3 transition-all hover:shadow-sm active:scale-[0.99]" style={{ borderColor: 'var(--border)', background: 'var(--popover)' }}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 flex-1 items-start gap-2">
                    <StatusDot status={task.status} onClick={() => void cycleStatus(task)} />
                    <span className={cn('text-[13px] font-medium leading-snug', task.status === 'done' && 'line-through opacity-60')} style={{ color: 'var(--foreground)' }}>{task.title}</span>
                  </div>
                  <PriorityBadge priority={task.priority} />
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]" style={{ color: 'var(--muted-foreground)' }}>
                  <span>{task.project}</span><span>·</span><span>{task.dueDate}</span>
                  <div className="ml-auto"><Avatar initials={task.assigneeInitials} size="xs" /></div>
                </div>
              </div>); })}
          </div>
          {/* Desktop table */}
          <div className="hidden md:block">
            <div className="sticky top-0 z-10 grid grid-cols-[1fr_140px_90px_80px_80px] gap-3 border-b px-5 py-2 text-[10px] font-medium uppercase tracking-wider" style={{ borderColor: 'var(--border)', background: 'var(--background)', color: 'var(--muted-foreground)' }}>
              <span>Task</span><span>Project</span><span>Status</span><span>Due</span><span>Assignee</span>
            </div>
            {filtered.map((task) => { const s = TASK_STATUS_CONFIG[task.status]; return (
              <div key={task.id} onClick={() => setDetailTask(task)} className="group grid cursor-pointer grid-cols-[1fr_140px_90px_80px_80px] gap-3 items-center border-b px-5 py-3 transition-colors hover:bg-secondary/30" style={{ borderColor: 'var(--border)' }}>
                <div className="flex min-w-0 items-center gap-2">
                  <PriorityBadge priority={task.priority} />
                  <StatusDot status={task.status} onClick={() => void cycleStatus(task)} />
                  <span className={cn('truncate text-[13px]', task.status === 'done' && 'line-through opacity-60')} style={{ color: 'var(--foreground)' }}>{task.title}</span>
                </div>
                <span className="truncate text-[12px]" style={{ color: 'var(--muted-foreground)' }}>{task.project}</span>
                <StatusChip label={s.label} color={s.color} bg={s.bg} />
                <span className="text-[12px]" style={{ color: 'var(--muted-foreground)' }}>{task.dueDate}</span>
                <Avatar initials={task.assigneeInitials} />
              </div>); })}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex h-full min-w-max gap-3 p-4">
              {BOARD_COLS.map((col) => { const s = TASK_STATUS_CONFIG[col]; const colTasks = rows.filter((t) => t.status === col); return (
                <div key={col} className="flex w-[272px] flex-shrink-0 flex-col rounded-xl" style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}>
                  <div className="flex items-center justify-between px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                      <span className="text-[12px] font-semibold" style={{ color: 'var(--foreground)' }}>{s.label}</span>
                      <span className="rounded-full px-1.5 py-0.5 text-[10px] font-medium" style={{ background: 'var(--background)', color: 'var(--muted-foreground)' }}>{colTasks.length}</span>
                    </div>
                    <button type="button" className="rounded-md p-1 transition-colors hover:bg-white/10" style={{ color: 'var(--muted-foreground)' }} onClick={() => canMutate && dispatchQuickCreate('task')}><Plus className="h-3.5 w-3.5" /></button>
                  </div>
                  <Droppable droppableId={col} isDropDisabled={!canMutate}>
                    {(provided, snapshot) => (
                      <div ref={provided.innerRef} {...provided.droppableProps} className={cn('flex flex-1 flex-col gap-2 overflow-y-auto px-2 pb-2', snapshot.isDraggingOver && 'bg-primary/5')} style={{ minHeight: 60 }}>
                        {colTasks.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index} isDragDisabled={!canMutate}>
                            {(dp, ds) => (
                              <div ref={dp.innerRef} {...dp.draggableProps} {...dp.dragHandleProps} onClick={() => setDetailTask(task)}>
                                <div className={cn('cursor-grab rounded-xl p-3 transition-all hover:shadow-md active:cursor-grabbing', ds.isDragging && 'shadow-xl rotate-1')} style={{ background: 'var(--popover)', border: '1px solid var(--border)' }}>
                                  <div className="mb-2 flex items-start justify-between gap-1">
                                    <span className="text-[12px] font-medium leading-snug" style={{ color: 'var(--foreground)' }}>{task.title}</span>
                                    <PriorityBadge priority={task.priority} />
                                  </div>
                                  {task.tags.length > 0 && <div className="mb-2 flex flex-wrap items-center gap-1">{task.tags.slice(0, 2).map((tag) => (<span key={tag} className="rounded px-1.5 py-0.5 text-[9px] font-medium" style={{ background: 'var(--secondary)', color: 'var(--muted-foreground)' }}>{tag}</span>))}</div>}
                                  <div className="mt-2 flex items-center justify-between">
                                    <span className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>{task.project}</span>
                                    <div className="flex items-center gap-1.5"><span className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>{task.dueDate}</span><Avatar initials={task.assigneeInitials} size="xs" /></div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>); })}
            </div>
          </DragDropContext>
        </div>
      )}

      {/* Task detail drawer */}
      <DetailDrawer open={!!detailTask} onClose={() => setDetailTask(null)} title={detailTask?.title ?? ''} subtitle={detailTask?.project} icon={<CheckSquare className="h-4 w-4" />}
        footer={canMutate && detailTask ? (
          <div className="flex w-full items-center gap-2">
            <BonsaiButton size="sm" variant="primary" onClick={() => { if (detailTask) void cycleStatus(detailTask); }}>
              <RefreshCw className="mr-1 h-3 w-3" />Advance status
            </BonsaiButton>
            <div className="flex-1" />
            <BonsaiButton size="sm" variant="destructive" onClick={() => { if (detailTask) void deleteTask(detailTask.id); }}>
              <Trash2 className="mr-1 h-3 w-3" />Delete
            </BonsaiButton>
          </div>
        ) : undefined}
      >
        {detailTask && (<>
          <DrawerField label="Status"><StatusChip {...TASK_STATUS_CONFIG[rows.find(r => r.id === detailTask.id)?.status ?? detailTask.status]} /></DrawerField>
          <DrawerField label="Priority"><PriorityBadge priority={detailTask.priority} /> <span className="ml-1 capitalize">{detailTask.priority}</span></DrawerField>
          <DrawerField label="Assignee"><div className="flex items-center gap-2"><Avatar initials={detailTask.assigneeInitials} /><span>{detailTask.assignee}</span></div></DrawerField>
          <DrawerField label="Due date">{detailTask.dueDate}</DrawerField>
          {detailTask.tags.length > 0 && <DrawerField label="Tags"><div className="flex flex-wrap gap-1">{detailTask.tags.map(t => <span key={t} className="rounded-lg px-2 py-0.5 text-[11px]" style={{ background: 'var(--secondary)', color: 'var(--muted-foreground)' }}>{t}</span>)}</div></DrawerField>}
        </>)}
      </DetailDrawer>
    </div>
  );
}

function IssuesTab({ refreshVersion, canMutate }: { refreshVersion: number; canMutate: boolean }) {
  const [filter, setFilter] = useState<IssueStatus | 'all'>('all');
  const [rows, setRows] = useState<IssueRow[]>([]);
  const [modal, setModal] = useState(false);
  const [detailIssue, setDetailIssue] = useState<IssueRow | null>(null);
  const [searchQ, setSearchQ] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [itype, setItype] = useState<'bug' | 'feature' | 'improvement'>('bug');
  const [ipriority, setIpriority] = useState<Priority>('medium');
  const [iprojectId, setIprojectId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  /* Fetch projects for modal dropdown */
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>([]);
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/projects?limit=50', { credentials: 'include' });
        const json = await res.json();
        if (res.ok && Array.isArray(json.data)) {
          setProjects(json.data.map((p: Record<string, unknown>) => ({ id: String(p.id), name: String(p.name ?? '') })));
        }
      } catch { /* swallow */ }
    })();
  }, []);

  const load = useCallback(async () => {
    const res = await fetch('/api/issues?limit=200', { credentials: 'include' });
    const json = await res.json();
    if (!res.ok || !Array.isArray(json.data)) {
      setRows([]);
      return;
    }
    setRows(
      json.data.map((r: Record<string, unknown>) => {
        const ty = String(r.type ?? 'bug').toLowerCase();
        const uiType: IssueRow['type'] = ty === 'feature' ? 'feature' : ty === 'task' ? 'improvement' : 'bug';
        return {
          id: String(r.id),
          title: String(r.title ?? ''),
          description: String(r.description ?? ''),
          project: String(r.project_name ?? '—'),
          assignee: String(r.assignee_name ?? 'Unassigned'),
          assigneeInitials: initialsFromName(String(r.assignee_name ?? '?')),
          priority: mapDbPriority(r.priority as string),
          status: (['open', 'in-progress', 'resolved', 'closed'].includes(String(r.status)) ? r.status : 'open') as IssueStatus,
          createdAt: formatRelative(r.created_at as string),
          type: uiType,
        };
      }),
    );
  }, []);

  useEffect(() => { void load(); }, [load, refreshVersion]);

  const filtered = useMemo(() => {
    let r = filter === 'all' ? rows : rows.filter((i) => i.status === filter);
    if (searchQ) { const q = searchQ.toLowerCase(); r = r.filter(i => i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)); }
    return r;
  }, [rows, filter, searchQ]);
  const TYPE_COLOR: Record<IssueRow['type'], string> = { bug: 'var(--destructive)', feature: 'var(--primary)', improvement: 'var(--primary)' };

  const changeIssueStatus = async (id: string, status: IssueStatus) => {
    if (!canMutate) return;
    const prev = [...rows];
    setRows(r => r.map(i => i.id === id ? { ...i, status } : i));
    const res = await fetch(`/api/issues/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ status }) });
    if (!res.ok) setRows(prev);
    else { dispatchDataInvalidation('issues'); if (detailIssue?.id === id) setDetailIssue(d => d ? { ...d, status } : null); }
  };

  const submitIssue = async () => {
    if (!canMutate || !title.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          type: itype === 'improvement' ? 'task' : itype,
          priority: ipriority,
          project_id: iprojectId || undefined,
          status: 'open',
        }),
      });
      if (res.ok) {
        setModal(false);
        setTitle('');
        setDescription('');
        setIpriority('medium');
        setIprojectId('');
        dispatchDataInvalidation('issues');
        void load();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const openModal = () => {
    setTitle('');
    setDescription('');
    setItype('bug');
    setIpriority('medium');
    setIprojectId('');
    setModal(true);
  };

  const formInputCls = 'w-full rounded-xl border px-3 py-2.5 text-[13px] outline-none transition-shadow focus:ring-2 focus:ring-primary/20';
  const formInputStyle: React.CSSProperties = { background: 'var(--secondary)', borderColor: 'var(--border)', color: 'var(--foreground)' };
  const formLabelCls = 'block text-[11px] font-semibold mb-1.5';
  const formLabelStyle: React.CSSProperties = { color: 'var(--foreground)' };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b px-3 py-3 sm:gap-3 sm:px-5" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex max-w-48 flex-1 items-center gap-1.5 rounded-lg px-2.5 py-1.5" style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}>
          <Search className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--muted-foreground)' }} />
          <input className="min-w-0 flex-1 bg-transparent text-[12px] outline-none" style={{ color: 'var(--foreground)' }} placeholder="Search issues…" value={searchQ} onChange={e => setSearchQ(e.target.value)} />
        </div>
        <div className="flex items-center gap-1">
          {(['all', 'open', 'in-progress', 'resolved'] as const).map((s) => (
            <button key={s} type="button" onClick={() => setFilter(s)} className="rounded-lg px-2.5 py-1 text-[11px] font-medium capitalize transition-colors" style={{ background: filter === s ? '#2563EB' : 'var(--secondary)', color: filter === s ? 'white' : 'var(--muted-foreground)' }}>
              {s === 'all' ? 'All' : ISSUE_STATUS_CONFIG[s as IssueStatus].label}
            </button>
          ))}
        </div>
        <div className="ml-auto">
          <BonsaiButton size="sm" type="button" onClick={() => canMutate && openModal()}><Plus className="mr-1 h-3.5 w-3.5" />New issue</BonsaiButton>
        </div>
      </div>
      {filtered.length === 0 ? (
        <EmptyState icon={AlertCircle} title="No issues found" description="Track bugs, feature requests, and improvements across your projects." action={canMutate ? <BonsaiButton size="sm" onClick={openModal}><Plus className="mr-1 h-3.5 w-3.5" />New issue</BonsaiButton> : undefined} />
      ) : (
      <div className="flex-1 overflow-y-auto">
        {filtered.map((issue) => {
          const s = ISSUE_STATUS_CONFIG[issue.status];
          const Icon = TYPE_ICONS[issue.type] ?? AlertCircle;
          return (
            <div key={issue.id} onClick={() => setDetailIssue(issue)} className="flex cursor-pointer items-start gap-3 border-b px-3 py-3.5 transition-colors hover:bg-secondary/30 sm:px-5" style={{ borderColor: 'var(--border)' }}>
              <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg" style={{ background: `${TYPE_COLOR[issue.type]}15` }}>
                <Icon className="h-3.5 w-3.5" style={{ color: TYPE_COLOR[issue.type] }} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-medium" style={{ color: 'var(--foreground)' }}>{issue.title}</span>
                  <PriorityBadge priority={issue.priority} />
                </div>
                <p className="mt-0.5 truncate text-[11px]" style={{ color: 'var(--muted-foreground)' }}>{issue.description}</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>{issue.project} · {issue.createdAt}</span>
                </div>
              </div>
              <div className="flex flex-shrink-0 items-center gap-2">
                {issue.status === 'open' && canMutate && <button type="button" onClick={(e) => { e.stopPropagation(); void changeIssueStatus(issue.id, 'in-progress'); }} className="rounded-lg px-2 py-0.5 text-[10px] font-medium transition-colors hover:opacity-80" style={{ background: '#2563EB15', color: '#2563EB' }}>Start</button>}
                {issue.status === 'in-progress' && canMutate && <button type="button" onClick={(e) => { e.stopPropagation(); void changeIssueStatus(issue.id, 'resolved'); }} className="rounded-lg px-2 py-0.5 text-[10px] font-medium transition-colors hover:opacity-80" style={{ background: '#10B98115', color: '#10B981' }}>Resolve</button>}
                <StatusChip label={s.label} color={s.color} bg={`${s.color}15`} />
                <Avatar initials={issue.assigneeInitials} size="xs" />
              </div>
            </div>
          );
        })}
      </div>)}

      {/* Issue detail drawer */}
      <DetailDrawer open={!!detailIssue} onClose={() => setDetailIssue(null)} title={detailIssue?.title ?? ''} subtitle={detailIssue?.project} icon={<AlertCircle className="h-4 w-4" />}
        footer={canMutate && detailIssue ? (
          <div className="flex w-full flex-wrap items-center gap-2">
            {detailIssue.status === 'open' && <BonsaiButton size="sm" onClick={() => void changeIssueStatus(detailIssue.id, 'in-progress')}>Start work</BonsaiButton>}
            {detailIssue.status === 'in-progress' && <BonsaiButton size="sm" onClick={() => void changeIssueStatus(detailIssue.id, 'resolved')}>Resolve</BonsaiButton>}
            {detailIssue.status === 'resolved' && <BonsaiButton size="sm" variant="secondary" onClick={() => void changeIssueStatus(detailIssue.id, 'closed')}>Close</BonsaiButton>}
            {detailIssue.status === 'closed' && <BonsaiButton size="sm" variant="secondary" onClick={() => void changeIssueStatus(detailIssue.id, 'open')}><RefreshCw className="mr-1 h-3 w-3" />Reopen</BonsaiButton>}
          </div>
        ) : undefined}
      >
        {detailIssue && (<>
          <DrawerField label="Status"><StatusChip label={ISSUE_STATUS_CONFIG[detailIssue.status].label} color={ISSUE_STATUS_CONFIG[detailIssue.status].color} bg={`${ISSUE_STATUS_CONFIG[detailIssue.status].color}15`} /></DrawerField>
          <DrawerField label="Type"><span className="capitalize">{detailIssue.type}</span></DrawerField>
          <DrawerField label="Priority"><PriorityBadge priority={detailIssue.priority} /> <span className="ml-1 capitalize">{detailIssue.priority}</span></DrawerField>
          <DrawerField label="Assignee"><div className="flex items-center gap-2"><Avatar initials={detailIssue.assigneeInitials} /><span>{detailIssue.assignee}</span></div></DrawerField>
          {detailIssue.description && <DrawerField label="Description"><p className="text-[12px] leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--muted-foreground)' }}>{detailIssue.description}</p></DrawerField>}
        </>)}
      </DetailDrawer>

      <AnimatePresence>
        {modal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[90] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
            onClick={() => setModal(false)}
            role="presentation"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-lg overflow-hidden rounded-2xl border shadow-2xl"
              style={{
                background: 'linear-gradient(165deg, color-mix(in srgb, var(--popover) 98%, var(--primary) 2%), var(--popover))',
                borderColor: 'color-mix(in srgb, var(--border) 85%, var(--primary) 15%)',
                boxShadow: '0 25px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04) inset',
              }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
            >
              {/* Header */}
              <div className="flex items-start gap-3 px-5 pt-5 pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-md bg-gradient-to-br from-red-500 to-orange-600">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-[16px] font-semibold tracking-tight" style={{ color: 'var(--foreground)' }}>New issue</h3>
                  <p className="text-[12px] mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Report a bug, request a feature, or suggest an improvement</p>
                </div>
                <button type="button" onClick={() => setModal(false)} className="rounded-lg p-1.5 transition-colors hover:bg-secondary shrink-0" style={{ color: 'var(--muted-foreground)' }}>
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Body */}
              <div className="px-5 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
                <div>
                  <label className={formLabelCls} style={formLabelStyle}>Title</label>
                  <input value={title} onChange={(e) => setTitle(e.target.value)} className={formInputCls} style={formInputStyle} placeholder="Brief summary of the issue" />
                </div>
                <div>
                  <label className={formLabelCls} style={formLabelStyle}>Description</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={cn(formInputCls, 'resize-none')} style={formInputStyle} placeholder="Detailed description, steps to reproduce, expected behavior…" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={formLabelCls} style={formLabelStyle}>Type</label>
                    <select value={itype} onChange={(e) => setItype(e.target.value as typeof itype)} className={cn(formInputCls, 'cursor-pointer')} style={formInputStyle}>
                      <option value="bug">Bug</option>
                      <option value="feature">Feature request</option>
                      <option value="improvement">Improvement</option>
                    </select>
                  </div>
                  <div>
                    <label className={formLabelCls} style={formLabelStyle}>Priority</label>
                    <select value={ipriority} onChange={(e) => setIpriority(e.target.value as Priority)} className={cn(formInputCls, 'cursor-pointer')} style={formInputStyle}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className={formLabelCls} style={formLabelStyle}>Project (optional)</label>
                  <select value={iprojectId} onChange={(e) => setIprojectId(e.target.value)} className={cn(formInputCls, 'cursor-pointer')} style={formInputStyle}>
                    <option value="">— no project —</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-2 px-5 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
                <button type="button" onClick={() => setModal(false)} className="px-4 py-2 rounded-xl text-[13px] font-medium transition-colors hover:bg-secondary" style={{ color: 'var(--muted-foreground)' }}>
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={submitting || !title.trim()}
                  onClick={() => void submitIssue()}
                  className="px-4 py-2 rounded-xl text-[13px] font-semibold text-white disabled:opacity-50 transition-opacity"
                  style={{ background: '#2563EB' }}
                >
                  {submitting ? 'Saving…' : 'Create issue'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ApprovalsTab({ refreshVersion, canMutate }: { refreshVersion: number; canMutate: boolean }) {
  const [filter, setFilter] = useState<ApprovalStatus | 'all'>('all');
  const [rows, setRows] = useState<ApprovalRow[]>([]);
  const [detailAppr, setDetailAppr] = useState<ApprovalRow | null>(null);

  const load = useCallback(async () => {
    const res = await fetch('/api/approvals?limit=200', { credentials: 'include' });
    const json = await res.json();
    if (!res.ok || !Array.isArray(json.data)) {
      setRows([]);
      return;
    }
    setRows(
      json.data.map((r: Record<string, unknown>) => {
        const st = String(r.status ?? 'pending') as ApprovalStatus;
        const status: ApprovalStatus = ['pending', 'approved', 'rejected', 'needs-info'].includes(st) ? st : 'pending';
        const amt = r.amount != null && Number(r.amount) > 0 ? `$${Number(r.amount).toLocaleString()}` : undefined;
        const p = (r.payload as Record<string, unknown>) || {};
        return {
          id: String(r.id),
          title: String(r.display_title ?? p.title ?? r.type ?? 'Approval'),
          type: String(r.type ?? 'request'),
          requestedBy: String(r.requester_name ?? 'Unknown'),
          requestedByInitials: initialsFromName(String(r.requester_name ?? '?')),
          status,
          amount: amt,
          dueDate: formatDue(r.due_date as string | undefined),
          client: typeof p.client === 'string' ? p.client : undefined,
        };
      }),
    );
  }, []);

  useEffect(() => {
    void load();
  }, [load, refreshVersion]);

  const pending = rows.filter((a) => a.status === 'pending' || a.status === 'needs-info');
  const filtered = filter === 'all' ? rows : rows.filter((a) => a.status === filter);

  const act = async (id: string, status: 'approved' | 'rejected') => {
    if (!canMutate) return;
    const res = await fetch(`/api/approvals/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setRows(r => r.map(a => a.id === id ? { ...a, status } : a));
      dispatchDataInvalidation('approvals');
      dispatchDataInvalidation('notifications');
      setDetailAppr(null);
      void load();
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      {pending.length > 0 && (
        <div className="mx-5 mb-1 mt-4 flex items-center justify-between rounded-xl px-4 py-3" style={{ background: '#EAB30810', border: '1px solid #EAB30830' }}>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" style={{ color: '#EAB308' }} />
            <span className="text-[13px] font-medium" style={{ color: 'var(--foreground)' }}>
              {pending.length} approval{pending.length > 1 ? 's' : ''} awaiting action
            </span>
          </div>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2 border-b px-3 py-3 sm:gap-3 sm:px-5" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-1">
          {(['all', 'pending', 'needs-info', 'approved', 'rejected'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(s)}
              className="rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors"
              style={{ background: filter === s ? '#2563EB' : 'var(--secondary)', color: filter === s ? 'white' : 'var(--muted-foreground)' }}
            >
              {s === 'all' ? 'All' : APPROVAL_STATUS_CONFIG[s as ApprovalStatus].label}
            </button>
          ))}
        </div>
      </div>
      {filtered.length === 0 ? (
        <EmptyState icon={ThumbsUp} title="No approvals" description="Approvals for invoices, timesheets, and expenses will appear here." />
      ) : (
      <div className="flex-1 overflow-y-auto">
        {filtered.map((appr) => {
          const s = APPROVAL_STATUS_CONFIG[appr.status];
          const Icon = TYPE_ICONS[appr.type] ?? CheckSquare;
          return (
            <div key={appr.id} onClick={() => setDetailAppr(appr)} className="flex cursor-pointer items-center gap-3 border-b px-3 py-3.5 transition-colors hover:bg-secondary/30 sm:gap-4 sm:px-5" style={{ borderColor: 'var(--border)' }}>
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: 'var(--secondary)' }}><Icon className="h-4 w-4" style={{ color: 'var(--muted-foreground)' }} /></div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium" style={{ color: 'var(--foreground)' }}>{appr.title}</p>
                <div className="mt-0.5 flex items-center gap-2">
                  <span className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>Requested by {appr.requestedBy}</span>
                  {appr.amount && <span className="text-[11px] font-medium" style={{ color: 'var(--foreground)' }}>{appr.amount}</span>}
                </div>
              </div>
              <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3">
                <span className="hidden text-[11px] sm:inline" style={{ color: 'var(--muted-foreground)' }}>{appr.dueDate}</span>
                <StatusChip label={s.label} color={s.color} bg={s.bg} />
                {(appr.status === 'pending' || appr.status === 'needs-info') && canMutate && (
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={(e) => { e.stopPropagation(); void act(appr.id, 'approved'); }} className="rounded-lg px-2.5 py-1 text-[11px] font-medium text-white transition-opacity hover:opacity-90" style={{ background: '#10B981' }}>Approve</button>
                    <button type="button" onClick={(e) => { e.stopPropagation(); void act(appr.id, 'rejected'); }} className="rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors" style={{ background: 'var(--secondary)', color: 'var(--muted-foreground)' }}>Decline</button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>)}

      {/* Approval detail drawer */}
      <DetailDrawer open={!!detailAppr} onClose={() => setDetailAppr(null)} title={detailAppr?.title ?? ''} subtitle={`Requested by ${detailAppr?.requestedBy ?? ''}`} icon={<ThumbsUp className="h-4 w-4" />}
        footer={canMutate && detailAppr && (detailAppr.status === 'pending' || detailAppr.status === 'needs-info') ? (
          <div className="flex w-full items-center gap-2">
            <BonsaiButton size="sm" onClick={() => void act(detailAppr.id, 'approved')} style={{ background: '#10B981' }}>Approve</BonsaiButton>
            <BonsaiButton size="sm" variant="destructive" onClick={() => void act(detailAppr.id, 'rejected')}>Decline</BonsaiButton>
          </div>
        ) : undefined}
      >
        {detailAppr && (<>
          <DrawerField label="Status"><StatusChip {...APPROVAL_STATUS_CONFIG[detailAppr.status]} /></DrawerField>
          <DrawerField label="Type"><span className="capitalize">{detailAppr.type}</span></DrawerField>
          {detailAppr.amount && <DrawerField label="Amount">{detailAppr.amount}</DrawerField>}
          <DrawerField label="Due date">{detailAppr.dueDate}</DrawerField>
          {detailAppr.client && <DrawerField label="Client">{detailAppr.client}</DrawerField>}
        </>)}
      </DetailDrawer>
    </div>
  );
}

function RequestsTab({ refreshVersion, canMutate }: { refreshVersion: number; canMutate: boolean }) {
  const [filter, setFilter] = useState<RequestStatus | 'all'>('all');
  const [rows, setRows] = useState<RequestRow[]>([]);
  const [modal, setModal] = useState(false);
  const [detailReq, setDetailReq] = useState<RequestRow | null>(null);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [rtype, setRtype] = useState<RequestRow['type']>('support');
  const [submitting, setSubmitting] = useState(false);

  const REQ_STATUS: Record<RequestStatus, { label: string; color: string; bg: string }> = {
    open: { label: 'Open', color: '#2563EB', bg: '#2563EB15' },
    'in-progress': { label: 'In progress', color: '#F97316', bg: '#F9731615' },
    resolved: { label: 'Resolved', color: '#10B981', bg: '#10B98115' },
  };

  const load = useCallback(async () => {
    const res = await fetch('/api/support-tickets?limit=200', { credentials: 'include' });
    const json = await res.json();
    if (!res.ok || !Array.isArray(json.data)) {
      setRows([]);
      return;
    }
    setRows(
      json.data.map((r: Record<string, unknown>) => {
        const subj = String(r.subject ?? '');
        const meta = parseTicketSubject(subj);
        return {
          id: String(r.id),
          title: meta.title,
          type: meta.type,
          from: String(r.requester_name ?? 'Unknown'),
          fromInitials: initialsFromName(String(r.requester_name ?? '?')),
          status: mapReqStatus(String(r.status ?? 'open')),
          priority: mapDbPriority(r.priority as string),
          createdAt: formatRelative(r.created_at as string),
        };
      }),
    );
  }, []);

  useEffect(() => {
    void load();
  }, [load, refreshVersion]);

  const filtered = filter === 'all' ? rows : rows.filter((r) => r.status === filter);

  const submit = async () => {
    if (!canMutate || !subject.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/support-tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          subject: subject.trim(),
          description: description.trim() || null,
          request_type: rtype,
        }),
      });
      if (res.ok) {
        setModal(false);
        setSubject('');
        setDescription('');
        dispatchDataInvalidation('support_tickets');
        void load();
      }
    } finally { setSubmitting(false); }
  };

  const changeReqStatus = async (id: string, status: string) => {
    if (!canMutate) return;
    const prev = [...rows];
    const mapped = mapReqStatus(status);
    setRows(r => r.map(rr => rr.id === id ? { ...rr, status: mapped } : rr));
    const res = await fetch(`/api/support-tickets/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ status }) });
    if (!res.ok) setRows(prev);
    else { dispatchDataInvalidation('support_tickets'); setDetailReq(null); }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b px-3 py-3 sm:gap-3 sm:px-5" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-1">
          {(['all', 'open', 'in-progress', 'resolved'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(s)}
              className="rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors"
              style={{ background: filter === s ? '#2563EB' : 'var(--secondary)', color: filter === s ? 'white' : 'var(--muted-foreground)' }}
            >
              {s === 'all' ? 'All' : REQ_STATUS[s as RequestStatus].label}
            </button>
          ))}
        </div>
        <div className="ml-auto">
          <BonsaiButton size="sm" type="button" onClick={() => canMutate && setModal(true)}>
            <Plus className="mr-1 h-3.5 w-3.5" />
            New request
          </BonsaiButton>
        </div>
      </div>
      {filtered.length === 0 ? (
        <EmptyState icon={Inbox} title="No requests" description="Support, change, and access requests will appear here." action={canMutate ? <BonsaiButton size="sm" onClick={() => setModal(true)}><Plus className="mr-1 h-3.5 w-3.5" />New request</BonsaiButton> : undefined} />
      ) : (
      <div className="flex-1 overflow-y-auto">
        {filtered.map((req) => {
          const s = REQ_STATUS[req.status];
          const Icon = TYPE_ICONS[req.type] ?? Inbox;
          return (
            <div key={req.id} onClick={() => setDetailReq(req)} className="flex cursor-pointer items-center gap-3 border-b px-3 py-3.5 transition-colors hover:bg-secondary/30 sm:gap-4 sm:px-5" style={{ borderColor: 'var(--border)' }}>
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: 'var(--secondary)' }}><Icon className="h-4 w-4" style={{ color: 'var(--muted-foreground)' }} /></div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium" style={{ color: 'var(--foreground)' }}>{req.title}</p>
                <div className="mt-0.5 flex items-center gap-2">
                  <span className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>From: {req.from}</span>
                  {req.client && <span className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>· {req.client}</span>}
                  <span className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>· {req.createdAt}</span>
                </div>
              </div>
              <div className="flex flex-shrink-0 items-center gap-2">
                {req.status === 'open' && canMutate && <button type="button" onClick={(e) => { e.stopPropagation(); void changeReqStatus(req.id, 'in_progress'); }} className="rounded-lg px-2 py-0.5 text-[10px] font-medium transition-colors hover:opacity-80" style={{ background: '#F9731615', color: '#F97316' }}>Start</button>}
                {req.status === 'in-progress' && canMutate && <button type="button" onClick={(e) => { e.stopPropagation(); void changeReqStatus(req.id, 'resolved'); }} className="rounded-lg px-2 py-0.5 text-[10px] font-medium transition-colors hover:opacity-80" style={{ background: '#10B98115', color: '#10B981' }}>Resolve</button>}
                <PriorityBadge priority={req.priority} />
                <StatusChip label={s.label} color={s.color} bg={s.bg} />
                <Avatar initials={req.fromInitials} size="xs" />
              </div>
            </div>
          );
        })}
      </div>)}

      {/* Request detail drawer */}
      <DetailDrawer open={!!detailReq} onClose={() => setDetailReq(null)} title={detailReq?.title ?? ''} subtitle={`From ${detailReq?.from ?? ''}`} icon={<Inbox className="h-4 w-4" />}
        footer={canMutate && detailReq && detailReq.status !== 'resolved' ? (
          <div className="flex w-full items-center gap-2">
            {detailReq.status === 'open' && <BonsaiButton size="sm" onClick={() => void changeReqStatus(detailReq.id, 'in_progress')}>Start</BonsaiButton>}
            {detailReq.status === 'in-progress' && <BonsaiButton size="sm" onClick={() => void changeReqStatus(detailReq.id, 'resolved')}>Resolve</BonsaiButton>}
          </div>
        ) : undefined}
      >
        {detailReq && (<>
          <DrawerField label="Status"><StatusChip {...REQ_STATUS[detailReq.status]} /></DrawerField>
          <DrawerField label="Type"><span className="capitalize">{detailReq.type}</span></DrawerField>
          <DrawerField label="Priority"><PriorityBadge priority={detailReq.priority} /> <span className="ml-1 capitalize">{detailReq.priority}</span></DrawerField>
          <DrawerField label="From"><div className="flex items-center gap-2"><Avatar initials={detailReq.fromInitials} /><span>{detailReq.from}</span></div></DrawerField>
          <DrawerField label="Created">{detailReq.createdAt}</DrawerField>
          {detailReq.client && <DrawerField label="Client">{detailReq.client}</DrawerField>}
        </>)}
      </DetailDrawer>
      <AnimatePresence>
        {modal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[90] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
            onClick={() => setModal(false)}
            role="presentation"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-lg overflow-hidden rounded-2xl border shadow-2xl"
              style={{
                background: 'linear-gradient(165deg, color-mix(in srgb, var(--popover) 98%, var(--primary) 2%), var(--popover))',
                borderColor: 'color-mix(in srgb, var(--border) 85%, var(--primary) 15%)',
                boxShadow: '0 25px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04) inset',
              }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
            >
              {/* Header */}
              <div className="flex items-start gap-3 px-5 pt-5 pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-md bg-gradient-to-br from-blue-500 to-indigo-600">
                  <Inbox className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-[16px] font-semibold tracking-tight" style={{ color: 'var(--foreground)' }}>New request</h3>
                  <p className="text-[12px] mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Submit a support, change, or access request</p>
                </div>
                <button type="button" onClick={() => setModal(false)} className="rounded-lg p-1.5 transition-colors hover:bg-secondary shrink-0" style={{ color: 'var(--muted-foreground)' }}>
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Body */}
              <div className="px-5 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
                <div>
                  <label className="block text-[11px] font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>Type</label>
                  <select value={rtype} onChange={(e) => setRtype(e.target.value as RequestRow['type'])} className="w-full rounded-xl border px-3 py-2.5 text-[13px] outline-none cursor-pointer transition-shadow focus:ring-2 focus:ring-primary/20" style={{ background: 'var(--secondary)', borderColor: 'var(--border)', color: 'var(--foreground)' }}>
                    <option value="support">Support</option>
                    <option value="change">Change</option>
                    <option value="onboarding">Onboarding</option>
                    <option value="access">Access</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>Subject</label>
                  <input value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full rounded-xl border px-3 py-2.5 text-[13px] outline-none transition-shadow focus:ring-2 focus:ring-primary/20" style={{ background: 'var(--secondary)', borderColor: 'var(--border)', color: 'var(--foreground)' }} placeholder="Brief description of your request" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>Details</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full rounded-xl border px-3 py-2.5 text-[13px] outline-none resize-none transition-shadow focus:ring-2 focus:ring-primary/20" style={{ background: 'var(--secondary)', borderColor: 'var(--border)', color: 'var(--foreground)' }} placeholder="Additional context, urgency, or specifics…" />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-2 px-5 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
                <button type="button" onClick={() => setModal(false)} className="px-4 py-2 rounded-xl text-[13px] font-medium transition-colors hover:bg-secondary" style={{ color: 'var(--muted-foreground)' }}>
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={submitting || !subject.trim()}
                  onClick={() => void submit()}
                  className="px-4 py-2 rounded-xl text-[13px] font-semibold text-white disabled:opacity-50 transition-opacity"
                  style={{ background: '#2563EB' }}
                >
                  {submitting ? 'Submitting…' : 'Submit request'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function WorkScreen() {
  const { persona } = useUserRole();
  const workRefresh = useHubDataInvalidation('tasks', 'issues', 'approvals', 'support_tickets', 'notifications', 'all');
  const [tab, setTab] = useState<WorkTab>('tasks');
  const [orgId, setOrgId] = useState<string | null>(null);
  const [counts, setCounts] = useState({ tasks: 0, issues: 0, approvals: 0, requests: 0 });

  const canMutate = persona.role !== 'viewer' && persona.role !== 'client';

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      const json = await res.json();
      if (cancelled || !res.ok) return;
      const oid = json.profile?.org_id as string | undefined;
      if (oid) setOrgId(oid);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [t, i, a, r] = await Promise.all([
        fetch('/api/tasks?limit=500', { credentials: 'include' }).then((x) => x.json()),
        fetch('/api/issues?limit=500', { credentials: 'include' }).then((x) => x.json()),
        fetch('/api/approvals?limit=500', { credentials: 'include' }).then((x) => x.json()),
        fetch('/api/support-tickets?limit=500', { credentials: 'include' }).then((x) => x.json()),
      ]);
      if (cancelled) return;
      const taskRows = Array.isArray(t.data) ? t.data : [];
      const issueRows = Array.isArray(i.data) ? i.data : [];
      const apprRows = Array.isArray(a.data) ? a.data : [];
      const reqRows = Array.isArray(r.data) ? r.data : [];
      setCounts({
        tasks: taskRows.filter((x: { status?: string }) => x.status !== 'done').length,
        issues: issueRows.filter((x: { status?: string }) => x.status === 'open').length,
        approvals: apprRows.filter((x: { status?: string }) => x.status === 'pending' || x.status === 'needs-info').length,
        requests: reqRows.filter((x: { status?: string }) => x.status === 'open').length,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [workRefresh]);

  useEffect(() => {
    if (!orgId || !isSupabaseBrowserConfigured()) return;
    const sb = createSupabaseBrowserClient();
    const ch = sb
      .channel(`work-${orgId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks', filter: `org_id=eq.${orgId}` },
        () => dispatchDataInvalidation('tasks'),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'issues', filter: `org_id=eq.${orgId}` },
        () => dispatchDataInvalidation('issues'),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'approvals', filter: `org_id=eq.${orgId}` },
        () => dispatchDataInvalidation('approvals'),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'support_tickets', filter: `org_id=eq.${orgId}` },
        () => dispatchDataInvalidation('support_tickets'),
      )
      .subscribe();
    return () => {
      void sb.removeChannel(ch);
    };
  }, [orgId]);

  const TAB_CONFIG: { id: WorkTab; label: string; icon: React.ElementType; count: number }[] = [
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, count: counts.tasks },
    { id: 'issues', label: 'Issues', icon: AlertCircle, count: counts.issues },
    { id: 'approvals', label: 'Approvals', icon: ThumbsUp, count: counts.approvals },
    { id: 'requests', label: 'Requests', icon: Inbox, count: counts.requests },
  ];

  return (
    <div className="flex h-full min-h-0 flex-col" style={{ background: 'var(--background)' }}>
      <div className="px-4 pb-0 pt-4 sm:px-6 sm:pt-5" style={{ borderBottom: '1px solid var(--border)' }}>
        <h1 className="mb-3 text-[17px] font-semibold sm:mb-4 sm:text-[18px]" style={{ color: 'var(--foreground)' }}>Work</h1>
        <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 sm:mb-4">
          {TAB_CONFIG.map((t) => (
            <div key={t.id} className="flex items-center gap-1.5">
              <t.icon className="h-3.5 w-3.5" style={{ color: 'var(--muted-foreground)' }} />
              <span className="text-[13px] font-semibold" style={{ color: 'var(--foreground)' }}>{t.count}</span>
              <span className="text-[11px] sm:text-[12px]" style={{ color: 'var(--muted-foreground)' }}>{t.label.toLowerCase()}</span>
            </div>
          ))}
        </div>
        <div className="-mx-1 flex items-end gap-0 overflow-x-auto pb-px sm:mx-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TAB_CONFIG.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className="relative flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2.5 text-[12px] font-medium transition-colors sm:px-4 sm:text-[13px]"
              style={{
                borderBottomColor: tab === t.id ? '#2563EB' : 'transparent',
                color: tab === t.id ? '#2563EB' : 'var(--muted-foreground)',
              }}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
              {t.count > 0 && (
                <span
                  className="rounded-full px-1.5 py-0.5 text-[10px] font-bold"
                  style={{ background: tab === t.id ? '#2563EB' : 'var(--secondary)', color: tab === t.id ? 'white' : 'var(--muted-foreground)' }}
                >
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            className="flex h-full min-h-0 flex-col"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4, pointerEvents: 'none' }}
            transition={{ duration: 0.18 }}
          >
            {tab === 'tasks' && <TasksTab refreshVersion={workRefresh} canMutate={canMutate} />}
            {tab === 'issues' && <IssuesTab refreshVersion={workRefresh} canMutate={canMutate} />}
            {tab === 'approvals' && <ApprovalsTab refreshVersion={workRefresh} canMutate={canMutate} />}
            {tab === 'requests' && <RequestsTab refreshVersion={workRefresh} canMutate={canMutate} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
