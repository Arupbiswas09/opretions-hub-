'use client';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronDown, Tag, Plus, Clock, DollarSign, Users, BarChart3,
  CheckSquare, FileText, TrendingUp, Settings2, Check, ArrowLeft,
  Loader2, CalendarDays, AlertCircle, X,
} from 'lucide-react';
import { useHubData } from '../../lib/hub/use-hub-data';
import { useHubDataInvalidation } from '../../lib/hub/use-data-invalidation';
import { dispatchDataInvalidation } from '../../lib/hub-events';
import { useToast } from '../bonsai/ToastSystem';
import {
  type TaskRow, type TimeEntryRow, type PersonRow, type ExpenseRow,
  updateProject, updateTask, createTask, createTimeEntry,
} from '../../lib/api/hub-api';

/* ── Status config ── */
const STATUSES = [
  { id: 'planning',   label: 'Planning',   color: '#8B5CF6', dbVal: 'planning' },
  { id: 'active',     label: 'Active',     color: '#2563EB', dbVal: 'active' },
  { id: 'on_hold',    label: 'On Hold',    color: '#D97706', dbVal: 'on_hold' },
  { id: 'completed',  label: 'Completed',  color: '#059669', dbVal: 'completed' },
  { id: 'cancelled',  label: 'Cancelled',  color: '#DC2626', dbVal: 'cancelled' },
];

const TABS = [
  { id: 'overview',  label: 'Overview',  icon: FileText },
  { id: 'tasks',     label: 'Tasks',     icon: CheckSquare },
  { id: 'time',      label: 'Time',      icon: Clock },
  { id: 'billing',   label: 'Billing',   icon: DollarSign },
  { id: 'expenses',  label: 'Expenses',  icon: TrendingUp },
  { id: 'insights',  label: 'Insights',  icon: BarChart3 },
  { id: 'team',      label: 'Team',      icon: Users },
];

const TASK_STATUS_MAP: Record<string, string> = {
  'todo': 'To Do', 'in-progress': 'In Progress', 'review': 'Review', 'done': 'Done',
};

const PRIORITY_COLOR: Record<string, string> = {
  low: '#6B7280', medium: '#2563EB', high: '#D97706', urgent: '#DC2626',
};

interface PR03ProjectDetailProps {
  project?: any;
  onBack?: () => void;
}

/* ── Avatar ── */
function Avatar({ name, size = 'sm' }: { name: string; size?: 'xs' | 'sm' | 'md' }) {
  const initials = (name || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const colors = ['#2563EB', '#059669', '#D97706', '#7C3AED', '#DC2626', '#0D9488'];
  const color = colors[(name || '').charCodeAt(0) % colors.length];
  const sz = size === 'xs' ? 'w-6 h-6 text-[9px]' : size === 'sm' ? 'w-8 h-8 text-[11px]' : 'w-10 h-10 text-[13px]';
  return (
    <div className={`${sz} rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0`}
      style={{ background: color }}>
      {initials}
    </div>
  );
}

/* ── Loading skeleton ── */
function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-md ${className}`} style={{ background: 'var(--border)' }} />;
}

/* ── Inline Add Task ── */
function InlineAddTask({ projectId, onDone }: { projectId: string; onDone: () => void }) {
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  const save = async () => {
    if (!title.trim()) return;
    setSaving(true);
    const { error } = await createTask({ title: title.trim(), project_id: projectId, status: 'todo', priority: 'medium' });
    setSaving(false);
    if (error) { addToast(error, 'error'); return; }
    addToast('Task created', 'success');
    setTitle('');
    dispatchDataInvalidation('tasks');
    onDone();
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3" style={{ background: 'var(--glass-bg)', borderTop: '1px solid var(--border)' }}>
      <div className="w-[18px] h-[18px] rounded-[4px] flex-shrink-0" style={{ border: '1.5px solid var(--border-strong)' }} />
      <input
        autoFocus
        value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') onDone(); }}
        placeholder="Task title…"
        className="flex-1 text-[13px] bg-transparent outline-none"
        style={{ color: 'var(--foreground)' }}
      />
      <button onClick={save} disabled={saving || !title.trim()}
        className="text-[11px] font-medium px-2.5 py-1 rounded-md transition-colors disabled:opacity-40"
        style={{ background: 'var(--primary)', color: '#fff' }}>
        {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Add'}
      </button>
      <button onClick={onDone} className="text-[11px] px-1.5 py-1 rounded-md" style={{ color: 'var(--muted-foreground)' }}>
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

/* ── Inline Log Time ── */
function InlineLogTime({ projectId, onDone }: { projectId: string; onDone: () => void }) {
  const [desc, setDesc] = useState('');
  const [hours, setHours] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [billable, setBillable] = useState(true);
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  const save = async () => {
    if (!desc.trim() || !hours) return;
    setSaving(true);
    const { error } = await createTimeEntry({
      project_id: projectId, description: desc.trim(),
      hours: parseFloat(hours), entry_date: date, billable,
    });
    setSaving(false);
    if (error) { addToast(error, 'error'); return; }
    addToast('Time logged', 'success');
    dispatchDataInvalidation('time_entries');
    dispatchDataInvalidation('timesheets');
    onDone();
  };

  return (
    <div className="rounded-xl p-4 mb-4 space-y-3" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border)' }}>
      <input autoFocus value={desc} onChange={e => setDesc(e.target.value)}
        placeholder="What did you work on?" className="w-full text-[13px] bg-transparent outline-none"
        style={{ color: 'var(--foreground)' }} />
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3 h-3" style={{ color: 'var(--muted-foreground)' }} />
          <input type="number" value={hours} onChange={e => setHours(e.target.value)} placeholder="Hours"
            step="0.25" min="0.25" className="w-16 text-[12px] bg-transparent outline-none text-center rounded-md px-2 py-1"
            style={{ color: 'var(--foreground)', border: '1px solid var(--border)' }} />
        </div>
        <div className="flex items-center gap-1.5">
          <CalendarDays className="w-3 h-3" style={{ color: 'var(--muted-foreground)' }} />
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="text-[12px] bg-transparent outline-none rounded-md px-2 py-1"
            style={{ color: 'var(--foreground)', border: '1px solid var(--border)' }} />
        </div>
        <button onClick={() => setBillable(!billable)} type="button"
          className="text-[10px] font-medium px-2 py-1 rounded-full"
          style={{
            background: billable ? 'rgba(5,150,105,0.12)' : 'var(--glass-bg)',
            color: billable ? 'var(--success)' : 'var(--muted-foreground)',
            border: '1px solid var(--border-subtle)',
          }}>
          {billable ? '$ Billable' : 'Non-billable'}
        </button>
        <div className="flex-1" />
        <button onClick={save} disabled={saving || !desc.trim() || !hours}
          className="text-[11px] font-medium px-3 py-1.5 rounded-md transition-colors disabled:opacity-40"
          style={{ background: 'var(--primary)', color: '#fff' }}>
          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Log Time'}
        </button>
        <button onClick={onDone} className="p-1 rounded-md" style={{ color: 'var(--muted-foreground)' }}>
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   PROJECT DETAIL — fully wired to live API
───────────────────────────────────────────────────────────── */
export function PR03ProjectDetail({ project: proj, onBack }: PR03ProjectDetailProps) {
  const { addToast } = useToast();
  const taskRefresh = useHubDataInvalidation('tasks');
  const timeRefresh = useHubDataInvalidation('time_entries', 'timesheets');

  const projectId = proj?.id ?? '';
  const projectName = proj?.name ?? 'Project';
  const clientName = proj?.client ?? proj?.client_name ?? '—';
  const budgetHours = Number(proj?.budgetHours ?? proj?.budget_hours ?? 0);
  const dbStatus = proj?.status ?? 'active';

  const [activeTab, setActiveTab] = useState('overview');
  const [status, setStatus] = useState(dbStatus);
  const [showStatusDrop, setShowStatusDrop] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showLogTime, setShowLogTime] = useState(false);

  /* ── Live data ── */
  const { data: tasks, loading: tasksLoading, refetch: refetchTasks } = useHubData<TaskRow[]>(
    projectId ? `/api/tasks?project_id=${projectId}` : null, taskRefresh,
  );
  const { data: timeEntries, loading: timeLoading } = useHubData<(TimeEntryRow & { project_id?: string })[]>(
    '/api/time-entries?limit=100', timeRefresh,
  );
  const { data: people, loading: peopleLoading } = useHubData<PersonRow[]>('/api/hub/people');
  const { data: expenses, loading: expensesLoading } = useHubData<ExpenseRow[]>(
    projectId ? `/api/expenses?project_id=${projectId}` : null,
  );

  // Filter time entries for this project
  const projectTimeEntries = useMemo(() =>
    (timeEntries ?? []).filter(e => e.project_id === projectId), [timeEntries, projectId]
  );

  const totalHoursLogged = useMemo(() =>
    projectTimeEntries.reduce((s, e) => s + e.hours, 0), [projectTimeEntries]
  );

  const billableHours = useMemo(() =>
    projectTimeEntries.filter(e => e.billable).reduce((s, e) => s + e.hours, 0), [projectTimeEntries]
  );

  const tasksDone = useMemo(() => (tasks ?? []).filter(t => t.status === 'done').length, [tasks]);
  const tasksTotal = (tasks ?? []).length;

  const budgetPct = budgetHours > 0 ? Math.min((totalHoursLogged / budgetHours) * 100, 100) : 0;
  const budgetColor = budgetPct > 90 ? '#DC2626' : budgetPct > 70 ? '#D97706' : '#059669';
  const statusObj = STATUSES.find(s => s.dbVal === status || s.label === status) || STATUSES[1];

  /* ── Status change → API ── */
  const handleStatusChange = async (newStatus: typeof STATUSES[number]) => {
    setStatus(newStatus.dbVal);
    setShowStatusDrop(false);
    if (!projectId) return;
    const { error } = await updateProject(projectId, { status: newStatus.dbVal });
    if (error) {
      addToast('Failed to update status', 'error');
      setStatus(dbStatus); // revert
    } else {
      addToast(`Status → ${newStatus.label}`, 'success');
      dispatchDataInvalidation('projects');
    }
  };

  /* ── Toggle task done ── */
  const toggleTask = async (task: TaskRow) => {
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    await updateTask(task.id, { status: newStatus });
    dispatchDataInvalidation('tasks');
  };

  return (
    <div className="min-h-full">
      {/* ── Page header ── */}
      <div className="px-4 py-4 sm:px-6" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3 mb-2 flex-wrap">
          {onBack && (
            <button onClick={onBack} className="p-1.5 rounded-lg transition-colors hover:bg-white/[0.05]"
              style={{ color: 'var(--muted-foreground)' }}>
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div className="w-8 h-8 rounded-md flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #2563EB, #6366F1)' }}>
            {projectName.slice(0, 2).toUpperCase()}
          </div>
          <h1 className="text-[18px] sm:text-[20px] font-semibold tracking-[-0.02em]"
            style={{ color: 'var(--foreground)' }}>
            {projectName}
          </h1>

          {/* Budget bar */}
          {budgetHours > 0 && (
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>Budget</span>
              <div className="w-24 h-[5px] rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${budgetPct}%`, background: budgetColor }} />
              </div>
              <span className="text-[11px] font-medium tabular-nums" style={{ color: 'var(--foreground)' }}>
                {totalHoursLogged.toFixed(1)}/{budgetHours}h
              </span>
            </div>
          )}

          {/* Status dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowStatusDrop(!showStatusDrop)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors"
              style={{
                background: `${statusObj.color}18`,
                border: `1px solid ${statusObj.color}40`,
                color: statusObj.color,
              }}>
              <div className="w-2 h-2 rounded-full" style={{ background: statusObj.color }} />
              {statusObj.label}
              <ChevronDown className="w-3 h-3" />
            </button>
            <AnimatePresence>
              {showStatusDrop && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }} transition={{ duration: 0.12 }}
                  className="absolute right-0 top-full mt-1 w-44 rounded-lg overflow-hidden z-50"
                  style={{ background: 'var(--popover)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>
                  {STATUSES.map(s => (
                    <button
                      key={s.id}
                      onClick={() => handleStatusChange(s)}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[12px] text-left transition-colors hover:bg-white/[0.05]"
                      style={{ color: 'var(--foreground)' }}>
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
                      {s.label}
                      {s.dbVal === status && <Check className="w-3 h-3 ml-auto" style={{ color: 'var(--primary)' }} />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Tab nav */}
        <div className="flex items-center gap-0 -mb-[17px] overflow-x-auto scrollbar-none">
          {TABS.map(tab => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2.5 text-[12px] sm:text-[13px] font-medium transition-colors relative whitespace-nowrap"
                style={{ color: active ? 'var(--foreground)' : 'var(--muted-foreground)' }}>
                {tab.label}
                {tab.id === 'tasks' && tasksTotal > 0 && (
                  <span className="text-[9px] tabular-nums font-bold px-1 rounded-full"
                    style={{ background: 'var(--border)', color: 'var(--muted-foreground)' }}>
                    {tasksTotal}
                  </span>
                )}
                {active && (
                  <motion.div
                    layoutId="project-tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full"
                    style={{ background: 'var(--primary)' }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tab content ── */}
      <div className="flex gap-0">
        <div className="flex-1 p-4 sm:p-6 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>

              {/* ═══ OVERVIEW ═══ */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Quick stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: 'Tasks', value: `${tasksDone}/${tasksTotal}`, sub: 'completed' },
                      { label: 'Hours', value: `${totalHoursLogged.toFixed(1)}h`, sub: 'logged' },
                      { label: 'Billable', value: `${billableHours.toFixed(1)}h`, sub: `${totalHoursLogged > 0 ? ((billableHours / totalHoursLogged) * 100).toFixed(0) : 0}%` },
                      { label: 'Team', value: String((people ?? []).length), sub: 'members' },
                    ].map(s => (
                      <div key={s.label} className="rounded-xl p-3.5"
                        style={{ background: 'var(--glass-bg)', border: '1px solid var(--border)' }}>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.06em] mb-1"
                          style={{ color: 'var(--muted-foreground)' }}>{s.label}</p>
                        <p className="text-[20px] font-bold tracking-[-0.02em] tabular-nums"
                          style={{ color: 'var(--foreground)' }}>{s.value}</p>
                        <p className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>{s.sub}</p>
                      </div>
                    ))}
                  </div>

                  {/* Description */}
                  {proj?.description && (
                    <div className="rounded-xl p-4" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border)' }}>
                      <h3 className="text-[13px] font-semibold mb-2" style={{ color: 'var(--foreground)' }}>Description</h3>
                      <p className="text-[13px] leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                        {proj.description}
                      </p>
                    </div>
                  )}

                  {/* Recent activity — tasks */}
                  <div>
                    <h3 className="text-[13px] font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Recent Tasks</h3>
                    {tasksLoading ? (
                      <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-10 w-full" />)}</div>
                    ) : (tasks ?? []).length === 0 ? (
                      <div className="rounded-xl p-6 text-center" style={{ border: '1px solid var(--border)', background: 'var(--glass-bg)' }}>
                        <CheckSquare className="w-6 h-6 mx-auto mb-2" style={{ color: 'var(--muted-foreground)' }} />
                        <p className="text-[12px]" style={{ color: 'var(--muted-foreground)' }}>No tasks yet</p>
                      </div>
                    ) : (
                      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                        {(tasks ?? []).slice(0, 5).map((task, i) => (
                          <div key={task.id} className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-white/[0.02]"
                            style={{ borderBottom: i < Math.min((tasks ?? []).length, 5) - 1 ? '1px solid var(--border)' : 'none', background: 'var(--glass-bg)' }}>
                            <button onClick={() => toggleTask(task)}
                              className="w-[16px] h-[16px] rounded-[3px] flex items-center justify-center flex-shrink-0 transition-all"
                              style={{
                                border: task.status === 'done' ? 'none' : '1.5px solid var(--border-strong)',
                                background: task.status === 'done' ? 'var(--primary)' : 'transparent',
                              }}>
                              {task.status === 'done' && <Check className="w-2.5 h-2.5 text-white" />}
                            </button>
                            <p className={`flex-1 text-[12px] truncate ${task.status === 'done' ? 'line-through opacity-50' : ''}`}
                              style={{ color: 'var(--foreground)' }}>{task.title}</p>
                            <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full"
                              style={{ background: `${PRIORITY_COLOR[task.priority] ?? '#6B7280'}18`, color: PRIORITY_COLOR[task.priority] ?? '#6B7280' }}>
                              {task.priority}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ═══ TASKS ═══ */}
              {activeTab === 'tasks' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[13px]" style={{ color: 'var(--muted-foreground)' }}>
                      {tasksDone} of {tasksTotal} completed
                    </p>
                    <button onClick={() => setShowAddTask(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors"
                      style={{ background: 'var(--primary)', color: '#FFFFFF' }}>
                      <Plus className="w-3.5 h-3.5" /> Add Task
                    </button>
                  </div>

                  {tasksLoading ? (
                    <div className="space-y-2">{[1,2,3,4].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
                  ) : tasksTotal === 0 && !showAddTask ? (
                    <div className="rounded-xl p-8 text-center" style={{ border: '1px solid var(--border)', background: 'var(--glass-bg)' }}>
                      <CheckSquare className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--muted-foreground)' }} />
                      <p className="text-[13px] mb-2" style={{ color: 'var(--muted-foreground)' }}>No tasks yet</p>
                      <button onClick={() => setShowAddTask(true)} className="text-[12px] font-medium" style={{ color: 'var(--primary)' }}>
                        Create your first task →
                      </button>
                    </div>
                  ) : (
                    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                      {(tasks ?? []).map((task, i) => (
                        <div key={task.id} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-white/[0.02] group"
                          style={{
                            borderBottom: i < tasksTotal - 1 ? '1px solid var(--border)' : 'none',
                            background: 'var(--glass-bg)',
                          }}>
                          <button onClick={() => toggleTask(task)}
                            className="w-[18px] h-[18px] rounded-[4px] flex items-center justify-center flex-shrink-0 transition-all"
                            style={{
                              border: task.status === 'done' ? 'none' : '1.5px solid var(--border-strong)',
                              background: task.status === 'done' ? 'var(--primary)' : 'transparent',
                            }}>
                            {task.status === 'done' && <Check className="w-3 h-3 text-white" />}
                          </button>
                          <div className="flex-1 min-w-0">
                            <p className={`text-[13px] truncate ${task.status === 'done' ? 'line-through opacity-50' : ''}`}
                              style={{ color: 'var(--foreground)' }}>{task.title}</p>
                            {task.description && (
                              <p className="text-[10px] truncate mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                                {task.description}
                              </p>
                            )}
                          </div>
                          <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full"
                            style={{ background: `${PRIORITY_COLOR[task.priority] ?? '#6B7280'}18`, color: PRIORITY_COLOR[task.priority] ?? '#6B7280' }}>
                            {task.priority}
                          </span>
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                            style={{ background: 'var(--glass-bg)', color: 'var(--muted-foreground)', border: '1px solid var(--border-subtle)' }}>
                            {TASK_STATUS_MAP[task.status] ?? task.status}
                          </span>
                          {task.due_date && (
                            <span className="text-[10px] tabular-nums" style={{ color: 'var(--muted-foreground)' }}>
                              {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          )}
                          {task.assignee_name && <Avatar name={task.assignee_name} size="xs" />}
                        </div>
                      ))}
                      {showAddTask && (
                        <InlineAddTask projectId={projectId} onDone={() => { setShowAddTask(false); refetchTasks(); }} />
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ═══ TIME ═══ */}
              {activeTab === 'time' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[13px]" style={{ color: 'var(--muted-foreground)' }}>
                      {totalHoursLogged.toFixed(1)} hours logged · {billableHours.toFixed(1)}h billable
                    </p>
                    <button onClick={() => setShowLogTime(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium"
                      style={{ background: 'var(--primary)', color: '#FFFFFF' }}>
                      <Plus className="w-3.5 h-3.5" /> Log Time
                    </button>
                  </div>

                  {showLogTime && (
                    <InlineLogTime projectId={projectId} onDone={() => setShowLogTime(false)} />
                  )}

                  {timeLoading ? (
                    <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
                  ) : projectTimeEntries.length === 0 ? (
                    <div className="rounded-xl p-8 text-center" style={{ border: '1px solid var(--border)', background: 'var(--glass-bg)' }}>
                      <Clock className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--muted-foreground)' }} />
                      <p className="text-[13px] mb-2" style={{ color: 'var(--muted-foreground)' }}>No time entries yet</p>
                      <button onClick={() => setShowLogTime(true)} className="text-[12px] font-medium" style={{ color: 'var(--primary)' }}>
                        Log your first entry →
                      </button>
                    </div>
                  ) : (
                    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                      <table className="w-full text-[12px]">
                        <thead>
                          <tr style={{ background: 'var(--glass-bg)', borderBottom: '1px solid var(--border)' }}>
                            {['Date', 'Description', 'Hours', 'Billable'].map(h => (
                              <th key={h} className="text-left px-4 py-2.5 font-medium"
                                style={{ color: 'var(--muted-foreground)' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {projectTimeEntries.map((e, i) => (
                            <tr key={e.id} style={{
                              borderBottom: i < projectTimeEntries.length - 1 ? '1px solid var(--border)' : 'none',
                              background: 'var(--glass-bg)',
                            }}>
                              <td className="px-4 py-3 tabular-nums" style={{ color: 'var(--muted-foreground)' }}>
                                {new Date(e.entry_date + 'T12:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </td>
                              <td className="px-4 py-3" style={{ color: 'var(--foreground)' }}>{e.description || '—'}</td>
                              <td className="px-4 py-3 tabular-nums font-medium" style={{ color: 'var(--foreground)' }}>
                                {e.hours}h
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                                  style={{
                                    background: e.billable ? 'rgba(5,150,105,0.12)' : 'var(--glass-bg)',
                                    color: e.billable ? 'var(--success)' : 'var(--muted-foreground)',
                                  }}>
                                  {e.billable ? 'Billable' : 'Non-billable'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* ═══ BILLING ═══ */}
              {activeTab === 'billing' && (
                <div className="space-y-4">
                  <div className="rounded-xl p-5" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border)' }}>
                    <h3 className="text-[13px] font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Billing Summary</h3>
                    <div className="space-y-3">
                      {[
                        { label: 'Budget Hours', value: budgetHours > 0 ? `${budgetHours}h` : '—' },
                        { label: 'Hours Used', value: `${totalHoursLogged.toFixed(1)}h` },
                        { label: 'Billable Hours', value: `${billableHours.toFixed(1)}h` },
                        { label: 'Budget Remaining', value: budgetHours > 0 ? `${Math.max(0, budgetHours - totalHoursLogged).toFixed(1)}h` : '—' },
                        { label: 'Budget Utilization', value: budgetHours > 0 ? `${budgetPct.toFixed(0)}%` : '—' },
                      ].map(row => (
                        <div key={row.label} className="flex items-center justify-between py-2"
                          style={{ borderBottom: '1px solid var(--border)' }}>
                          <span className="text-[12px]" style={{ color: 'var(--muted-foreground)' }}>{row.label}</span>
                          <span className="text-[13px] font-medium tabular-nums" style={{ color: 'var(--foreground)' }}>{row.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ═══ EXPENSES ═══ */}
              {activeTab === 'expenses' && (
                <div>
                  {expensesLoading ? (
                    <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-10 w-full" />)}</div>
                  ) : (expenses ?? []).length === 0 ? (
                    <div className="rounded-xl p-8 text-center" style={{ border: '1px solid var(--border)', background: 'var(--glass-bg)' }}>
                      <TrendingUp className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--muted-foreground)' }} />
                      <p className="text-[13px]" style={{ color: 'var(--muted-foreground)' }}>No expenses recorded yet</p>
                    </div>
                  ) : (
                    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                      {(expenses ?? []).map((exp, i) => (
                        <div key={exp.id} className="flex items-center justify-between px-4 py-3"
                          style={{ borderBottom: i < (expenses ?? []).length - 1 ? '1px solid var(--border)' : 'none', background: 'var(--glass-bg)' }}>
                          <div>
                            <p className="text-[13px] font-medium" style={{ color: 'var(--foreground)' }}>{exp.description}</p>
                            <p className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>{exp.category ?? 'Uncategorized'}</p>
                          </div>
                          <span className="text-[14px] font-semibold tabular-nums" style={{ color: 'var(--foreground)' }}>
                            ${Number(exp.amount).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ═══ INSIGHTS ═══ */}
              {activeTab === 'insights' && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    { label: 'Budget Used', value: budgetHours > 0 ? `${budgetPct.toFixed(0)}%` : 'N/A', color: budgetColor },
                    { label: 'Hours Logged', value: `${totalHoursLogged.toFixed(1)}h`, color: '#2563EB' },
                    { label: 'Billable Rate', value: totalHoursLogged > 0 ? `${((billableHours / totalHoursLogged) * 100).toFixed(0)}%` : '—', color: '#059669' },
                    { label: 'Tasks Done', value: `${tasksDone}/${tasksTotal}`, color: '#8B5CF6' },
                    { label: 'Completion', value: tasksTotal > 0 ? `${((tasksDone / tasksTotal) * 100).toFixed(0)}%` : '0%', color: '#059669' },
                    { label: 'Team Size', value: String((people ?? []).length), color: '#D97706' },
                  ].map(m => (
                    <div key={m.label} className="rounded-xl p-4"
                      style={{ background: 'var(--glass-bg)', border: '1px solid var(--border)' }}>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.06em] mb-1"
                        style={{ color: 'var(--muted-foreground)' }}>{m.label}</p>
                      <p className="text-[24px] font-bold tracking-[-0.02em] tabular-nums"
                        style={{ color: m.color }}>{m.value}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* ═══ TEAM ═══ */}
              {activeTab === 'team' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[13px]" style={{ color: 'var(--muted-foreground)' }}>
                      {(people ?? []).length} members
                    </p>
                  </div>
                  {peopleLoading ? (
                    <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-14 w-full" />)}</div>
                  ) : (people ?? []).length === 0 ? (
                    <div className="rounded-xl p-8 text-center" style={{ border: '1px solid var(--border)', background: 'var(--glass-bg)' }}>
                      <Users className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--muted-foreground)' }} />
                      <p className="text-[13px]" style={{ color: 'var(--muted-foreground)' }}>No team members yet</p>
                    </div>
                  ) : (
                    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                      {(people ?? []).map((member, i) => (
                        <div key={member.id} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-white/[0.02]"
                          style={{
                            borderBottom: i < (people ?? []).length - 1 ? '1px solid var(--border)' : 'none',
                            background: 'var(--glass-bg)',
                          }}>
                          <Avatar name={member.full_name} size="sm" />
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-medium" style={{ color: 'var(--foreground)' }}>{member.full_name}</p>
                            <p className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>
                              {member.role ?? member.department ?? 'Team member'}
                            </p>
                          </div>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                            style={{
                              background: member.status === 'active' ? 'rgba(5,150,105,0.12)' : 'var(--glass-bg)',
                              color: member.status === 'active' ? 'var(--success)' : 'var(--muted-foreground)',
                            }}>
                            {member.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Right Properties Panel ── */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
            className="hidden lg:block w-60 flex-shrink-0 border-l p-5 space-y-5"
            style={{ borderColor: 'var(--border)' }}>
            <div>
              <h4 className="text-[11px] font-semibold uppercase tracking-[0.06em] mb-3"
                style={{ color: 'var(--muted-foreground)' }}>Properties</h4>
              {[
                { label: 'Status', value: statusObj.label },
                { label: 'Start', value: proj?.startDate ?? proj?.start_date ? new Date(proj?.start_date || proj?.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—' },
                { label: 'End', value: proj?.endDate ?? proj?.end_date ? new Date(proj?.end_date || proj?.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—' },
                { label: 'Budget', value: budgetHours > 0 ? `${budgetHours}h` : '—' },
              ].map(row => (
                <div key={row.label} className="flex items-start justify-between py-2"
                  style={{ borderBottom: '1px solid var(--border)' }}>
                  <span className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>{row.label}</span>
                  <span className="text-[12px] font-medium text-right ml-2" style={{ color: 'var(--foreground)' }}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            <div>
              <h4 className="text-[11px] font-semibold uppercase tracking-[0.06em] mb-3"
                style={{ color: 'var(--muted-foreground)' }}>Client</h4>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-bold text-white"
                  style={{ background: '#2563EB' }}>
                  {(clientName || '—').slice(0, 2).toUpperCase()}
                </div>
                <span className="text-[13px] font-medium" style={{ color: 'var(--foreground)' }}>
                  {clientName}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
