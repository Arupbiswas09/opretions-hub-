'use client';
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus, Search, Filter, MoreHorizontal, ChevronDown,
  CheckSquare, AlertCircle, ThumbsUp, Inbox,
  Clock, CheckCircle2, Circle, ArrowRight, Tag,
  User, Calendar, Briefcase, FolderKanban, LayoutGrid,
  List, Kanban, Flag, Flame, Zap, X,
} from 'lucide-react';
import { BonsaiButton } from './bonsai/BonsaiButton';
import { BonsaiStatusPill } from './bonsai/BonsaiStatusPill';
import { cn } from './ui/utils';

/* ─────────────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────────────── */
type WorkTab = 'tasks' | 'issues' | 'approvals' | 'requests';
type Priority = 'critical' | 'high' | 'medium' | 'low';
type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done';
type IssueStatus = 'open' | 'in-progress' | 'resolved' | 'closed';
type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'needs-info';
type RequestStatus = 'open' | 'in-progress' | 'resolved';

interface Task {
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

interface Issue {
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

interface Approval {
  id: string;
  title: string;
  type: 'invoice' | 'timesheet' | 'proposal' | 'expense' | 'leave';
  requestedBy: string;
  requestedByInitials: string;
  status: ApprovalStatus;
  amount?: string;
  dueDate: string;
  client?: string;
}

interface Request {
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

/* ─────────────────────────────────────────────────────────────
   Mock data
───────────────────────────────────────────────────────────── */
const TASKS: Task[] = [
  { id: 't1', title: 'Redesign client onboarding flow', project: 'Nexus Rebrand', assignee: 'Priya Kapoor', assigneeInitials: 'PK', priority: 'high', status: 'in-progress', dueDate: 'Apr 10', tags: ['design', 'ux'] },
  { id: 't2', title: 'Write Q2 campaign copy', project: 'Q2 Campaign', assignee: 'Alex Torres', assigneeInitials: 'AT', priority: 'high', status: 'todo', dueDate: 'Apr 8', tags: ['copy', 'marketing'] },
  { id: 't3', title: 'Legal review of Nova HQ contract', project: 'Nova HQ Renewal', assignee: 'You', assigneeInitials: 'JD', priority: 'critical', status: 'review', dueDate: 'Apr 7', tags: ['legal', 'contracts'] },
  { id: 't4', title: 'Set up analytics dashboard', project: 'Vertex IO Website', assignee: 'Marcus Webb', assigneeInitials: 'MW', priority: 'medium', status: 'in-progress', dueDate: 'Apr 14', tags: ['analytics'] },
  { id: 't5', title: 'Update employee handbook', project: 'HR Internal', assignee: 'Diana Lowell', assigneeInitials: 'DL', priority: 'low', status: 'todo', dueDate: 'Apr 20', tags: ['hr', 'documentation'] },
  { id: 't6', title: 'Migrate staging database', project: 'Infrastructure', assignee: 'Marcus Webb', assigneeInitials: 'MW', priority: 'high', status: 'todo', dueDate: 'Apr 9', tags: ['dev', 'infra'] },
  { id: 't7', title: 'Client presentation slides', project: 'Meridian Strategy', assignee: 'Priya Kapoor', assigneeInitials: 'PK', priority: 'medium', status: 'done', dueDate: 'Apr 5', tags: ['slides'] },
  { id: 't8', title: 'Invoice reconciliation — March', project: 'Finance', assignee: 'You', assigneeInitials: 'JD', priority: 'medium', status: 'review', dueDate: 'Apr 12', tags: ['finance'] },
];

const ISSUES: Issue[] = [
  { id: 'i1', title: 'Portal login fails on Safari 17', description: 'Users on Safari 17 cannot complete login — redirect loop after OAuth.', project: 'Client Portal', assignee: 'Marcus Webb', assigneeInitials: 'MW', priority: 'critical', status: 'open', createdAt: '2 hours ago', type: 'bug' },
  { id: 'i2', title: 'Invoice PDF generation broken for EU clients', description: 'VAT number not printing on generated PDFs for clients with EU billing addresses.', project: 'Finance', assignee: 'Alex Torres', assigneeInitials: 'AT', priority: 'high', status: 'in-progress', createdAt: 'Yesterday', type: 'bug' },
  { id: 'i3', title: 'Add bulk actions to task list', description: 'Users should be able to select multiple tasks and change status, assignee, or priority in bulk.', project: 'Internal', assignee: 'Priya Kapoor', assigneeInitials: 'PK', priority: 'medium', status: 'open', createdAt: '3 days ago', type: 'feature' },
  { id: 'i4', title: 'Slow load time on Projects overview', description: 'Projects overview page takes 4–6s to load. Likely N+1 query issue.', project: 'Infrastructure', assignee: 'Marcus Webb', assigneeInitials: 'MW', priority: 'high', status: 'in-progress', createdAt: '4 days ago', type: 'improvement' },
  { id: 'i5', title: 'Mobile nav overlap on iPhone SE', description: 'Bottom nav bar overlaps content on 320px-wide screens.', project: 'Nexus Rebrand', assignee: 'Alex Torres', assigneeInitials: 'AT', priority: 'medium', status: 'resolved', createdAt: '1 week ago', type: 'bug' },
];

const APPROVALS: Approval[] = [
  { id: 'a1', title: 'Invoice #INV-2255 — Meridian Group', type: 'invoice', requestedBy: 'Tom Bridges', requestedByInitials: 'TB', status: 'pending', amount: '$12,400', dueDate: 'Apr 8', client: 'Meridian Group' },
  { id: 'a2', title: 'Timesheet — Week 13 (Priya Kapoor)', type: 'timesheet', requestedBy: 'Priya Kapoor', requestedByInitials: 'PK', status: 'pending', amount: '42h', dueDate: 'Apr 7' },
  { id: 'a3', title: 'Nova HQ — MSA Renewal Proposal', type: 'proposal', requestedBy: 'James Park', requestedByInitials: 'JP', status: 'needs-info', dueDate: 'Apr 9', client: 'Nova HQ' },
  { id: 'a4', title: 'Expense claim — London Summit', type: 'expense', requestedBy: 'Alex Torres', requestedByInitials: 'AT', status: 'pending', amount: '$840', dueDate: 'Apr 10' },
  { id: 'a5', title: 'Annual leave — Diana Lowell (Apr 15–22)', type: 'leave', requestedBy: 'Diana Lowell', requestedByInitials: 'DL', status: 'approved', dueDate: 'Apr 14' },
  { id: 'a6', title: 'Invoice #INV-2218 — Vertex IO', type: 'invoice', requestedBy: 'Client', requestedByInitials: 'VI', status: 'approved', amount: '$8,750', dueDate: 'Mar 31', client: 'Vertex IO' },
];

const REQUESTS: Request[] = [
  { id: 'r1', title: 'Add new user to Client Portal — Acme Corp', type: 'access', from: 'Sarah Chen', fromInitials: 'SC', status: 'open', priority: 'high', createdAt: '1 hour ago', client: 'Acme Corp' },
  { id: 'r2', title: 'Change billing address — Nova HQ', type: 'change', from: 'James Park', fromInitials: 'JP', status: 'in-progress', priority: 'medium', createdAt: '2 days ago', client: 'Nova HQ' },
  { id: 'r3', title: 'Freelancer onboarding — Carlos Ruiz', type: 'onboarding', from: 'HR Team', fromInitials: 'HR', status: 'in-progress', priority: 'medium', createdAt: '3 days ago' },
  { id: 'r4', title: 'Support: Portal file upload not working', type: 'support', from: 'Tom Bridges', fromInitials: 'TB', status: 'open', priority: 'high', createdAt: '5 hours ago', client: 'Meridian Group' },
  { id: 'r5', title: 'Contract template update — Q2', type: 'change', from: 'Legal Team', fromInitials: 'LT', status: 'resolved', priority: 'low', createdAt: '1 week ago' },
];

/* ─────────────────────────────────────────────────────────────
   Shared utilities
───────────────────────────────────────────────────────────── */
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
};

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

function Avatar({ initials, size = 'sm' }: { initials: string; size?: 'sm' | 'xs' }) {
  const dim = size === 'sm' ? 'w-6 h-6 text-[9px]' : 'w-5 h-5 text-[8px]';
  return (
    <div className={cn(dim, 'rounded-full flex items-center justify-center font-bold text-white flex-shrink-0')}
      style={{ background: '#2563EB' }}>
      {initials}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Tasks tab
───────────────────────────────────────────────────────────── */
type TaskView = 'list' | 'board';
const BOARD_COLS: TaskStatus[] = ['todo', 'in-progress', 'review', 'done'];

function TasksTab() {
  const [view, setView] = useState<TaskView>('list');
  const [filter, setFilter] = useState<TaskStatus | 'all'>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => TASKS.filter(t => {
    if (filter !== 'all' && t.status !== filter) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !t.project.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [filter, search]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Toolbar */}
      <div
        className="flex flex-col gap-3 border-b px-3 py-3 sm:flex-row sm:items-center sm:px-5"
        style={{ borderColor: 'var(--border)' }}
      >
        <div
          className="flex max-w-full flex-1 items-center gap-1.5 rounded-lg px-2.5 py-1.5 sm:max-w-56"
          style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}
        >
          <Search className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--muted-foreground)' }} />
          <input
            className="min-w-0 flex-1 bg-transparent text-[12px] outline-none"
            style={{ color: 'var(--foreground)' }}
            placeholder="Search tasks…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1 sm:flex-[2]">
          {(['all', 'todo', 'in-progress', 'review', 'done'] as const).map(s => (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(s)}
              className="rounded-lg px-2 py-1 text-[10px] font-medium capitalize transition-colors sm:px-2.5 sm:text-[11px]"
              style={{
                background: filter === s ? '#2563EB' : 'var(--secondary)',
                color: filter === s ? 'white' : 'var(--muted-foreground)',
              }}
            >
              {s === 'all' ? 'All' : TASK_STATUS_CONFIG[s as TaskStatus].label}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-end gap-1 sm:ml-auto">
          {([['list', List], ['board', Kanban]] as const).map(([v, Icon]) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className="rounded-lg p-2 transition-colors sm:p-1.5"
              style={{
                background: view === v ? '#2563EB15' : 'transparent',
                color: view === v ? '#2563EB' : 'var(--muted-foreground)',
              }}
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
          <BonsaiButton size="sm">
            <Plus className="h-3.5 w-3.5 sm:mr-1" />
            <span className="hidden sm:inline">New task</span>
          </BonsaiButton>
        </div>
      </div>

      {view === 'list' ? (
        <div className="min-h-0 flex-1 overflow-y-auto">
          {/* Mobile cards */}
          <div className="space-y-2 p-3 md:hidden">
            {filtered.map(task => {
              const s = TASK_STATUS_CONFIG[task.status];
              return (
                <div
                  key={task.id}
                  className="cursor-pointer rounded-xl border p-3 transition-colors hover:bg-secondary/40"
                  style={{ borderColor: 'var(--border)', background: 'var(--popover)' }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 flex-1 items-start gap-2">
                      <PriorityBadge priority={task.priority} />
                      <span
                        className={cn('text-[13px] font-medium leading-snug', task.status === 'done' && 'line-through opacity-60')}
                        style={{ color: 'var(--foreground)' }}
                      >
                        {task.title}
                      </span>
                    </div>
                    <Avatar initials={task.assigneeInitials} size="xs" />
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]" style={{ color: 'var(--muted-foreground)' }}>
                    <span>{task.project}</span>
                    <span>·</span>
                    <span>{task.dueDate}</span>
                    <StatusChip label={s.label} color={s.color} bg={s.bg} />
                  </div>
                </div>
              );
            })}
          </div>
          {/* Desktop table */}
          <div className="hidden md:block">
          <div
            className="sticky top-0 z-10 grid grid-cols-[1fr_140px_90px_80px_80px] gap-3 border-b px-5 py-2 text-[10px] font-medium uppercase tracking-wider"
            style={{ borderColor: 'var(--border)', background: 'var(--background)', color: 'var(--muted-foreground)' }}
          >
            <span>Task</span><span>Project</span><span>Status</span><span>Due</span><span>Assignee</span>
          </div>
          {filtered.map(task => {
            const s = TASK_STATUS_CONFIG[task.status];
            return (
              <div key={task.id} className="group grid cursor-pointer grid-cols-[1fr_140px_90px_80px_80px] gap-3 items-center border-b px-5 py-3 transition-colors hover:bg-secondary/30"
                style={{ borderColor: 'var(--border)' }}>
                <div className="flex min-w-0 items-center gap-2">
                  <PriorityBadge priority={task.priority} />
                  <Circle className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" style={{ color: 'var(--muted-foreground)' }} />
                  <span className={cn('truncate text-[13px]', task.status === 'done' && 'line-through opacity-60')} style={{ color: 'var(--foreground)' }}>{task.title}</span>
                  {task.tags.map(tag => (
                    <span key={tag} className="hidden rounded px-1.5 py-0.5 text-[9px] font-medium lg:inline-flex" style={{ background: 'var(--secondary)', color: 'var(--muted-foreground)' }}>{tag}</span>
                  ))}
                </div>
                <span className="truncate text-[12px]" style={{ color: 'var(--muted-foreground)' }}>{task.project}</span>
                <StatusChip label={s.label} color={s.color} bg={s.bg} />
                <span className="text-[12px]" style={{ color: 'var(--muted-foreground)' }}>{task.dueDate}</span>
                <Avatar initials={task.assigneeInitials} />
              </div>
            );
          })}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          <div className="flex gap-3 p-4 h-full min-w-max">
            {BOARD_COLS.map(col => {
              const s = TASK_STATUS_CONFIG[col];
              const colTasks = TASKS.filter(t => t.status === col);
              return (
                <div key={col} className="w-64 flex flex-col gap-2 flex-shrink-0">
                  <div className="flex items-center justify-between px-1 mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-semibold" style={{ color: 'var(--foreground)' }}>{s.label}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: 'var(--secondary)', color: 'var(--muted-foreground)' }}>{colTasks.length}</span>
                    </div>
                    <button className="hover:opacity-70 transition-opacity" style={{ color: 'var(--muted-foreground)' }}><Plus className="w-3.5 h-3.5" /></button>
                  </div>
                  <div className="flex flex-col gap-2 overflow-y-auto pr-1 flex-1">
                    {colTasks.map(task => (
                      <div key={task.id} className="p-3 rounded-xl cursor-pointer transition-all hover:shadow-md"
                        style={{ background: 'var(--popover)', border: '1px solid var(--border)' }}>
                        <div className="flex items-start justify-between gap-1 mb-2">
                          <span className="text-[12px] font-medium leading-snug" style={{ color: 'var(--foreground)' }}>{task.title}</span>
                          <PriorityBadge priority={task.priority} />
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap mb-2">
                          {task.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="px-1.5 py-0.5 rounded text-[9px] font-medium" style={{ background: 'var(--secondary)', color: 'var(--muted-foreground)' }}>{tag}</span>
                          ))}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>{task.project}</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>{task.dueDate}</span>
                            <Avatar initials={task.assigneeInitials} size="xs" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Issues tab
───────────────────────────────────────────────────────────── */
function IssuesTab() {
  const [filter, setFilter] = useState<IssueStatus | 'all'>('all');
  const filtered = filter === 'all' ? ISSUES : ISSUES.filter(i => i.status === filter);
  const TYPE_COLOR: Record<Issue['type'], string> = {
    bug: 'var(--destructive)',
    feature: 'var(--primary)',
    improvement: 'var(--primary)',
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div
        className="flex flex-wrap items-center gap-2 px-3 py-3 sm:gap-3 sm:px-5"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-1">
          {(['all', 'open', 'in-progress', 'resolved'] as const).map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className="px-2.5 py-1 rounded-lg text-[11px] font-medium capitalize transition-colors"
              style={{ background: filter === s ? '#2563EB' : 'var(--secondary)', color: filter === s ? 'white' : 'var(--muted-foreground)' }}>
              {s === 'all' ? 'All' : ISSUE_STATUS_CONFIG[s as IssueStatus].label}
            </button>
          ))}
        </div>
        <div className="ml-auto">
          <BonsaiButton size="sm">
            <Plus className="w-3.5 h-3.5 mr-1" />
            New issue
          </BonsaiButton>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {filtered.map(issue => {
          const s = ISSUE_STATUS_CONFIG[issue.status];
          const Icon = TYPE_ICONS[issue.type] ?? AlertCircle;
          return (
            <div key={issue.id} className="flex cursor-pointer items-start gap-3 border-b px-3 py-3.5 transition-colors hover:bg-secondary/30 sm:px-5"
              style={{ borderColor: 'var(--border)' }}>
              <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: `${TYPE_COLOR[issue.type]}20` }}>
                <Icon className="w-3 h-3" style={{ color: TYPE_COLOR[issue.type] }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-medium" style={{ color: 'var(--foreground)' }}>{issue.title}</span>
                  <PriorityBadge priority={issue.priority} />
                </div>
                <p className="text-[11px] mt-0.5 truncate" style={{ color: 'var(--muted-foreground)' }}>{issue.description}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>{issue.project}</span>
                  <span className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>·</span>
                  <span className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>{issue.createdAt}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <StatusChip label={s.label} color={s.color} bg={`${s.color}15`} />
                <Avatar initials={issue.assigneeInitials} size="xs" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Approvals tab
───────────────────────────────────────────────────────────── */
function ApprovalsTab() {
  const [filter, setFilter] = useState<ApprovalStatus | 'all'>('all');
  const pending = APPROVALS.filter(a => a.status === 'pending' || a.status === 'needs-info');
  const filtered = filter === 'all' ? APPROVALS : APPROVALS.filter(a => a.status === filter);

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Pending banner */}
      {pending.length > 0 && (
        <div className="mx-5 mt-4 mb-1 px-4 py-3 rounded-xl flex items-center justify-between"
          style={{ background: '#EAB30810', border: '1px solid #EAB30830' }}>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" style={{ color: '#EAB308' }} />
            <span className="text-[13px] font-medium" style={{ color: 'var(--foreground)' }}>
              {pending.length} approval{pending.length > 1 ? 's' : ''} awaiting your action
            </span>
          </div>
          <button className="text-[11px] font-medium" style={{ color: '#2563EB' }}>Review all →</button>
        </div>
      )}
      <div
        className="flex flex-wrap items-center gap-2 px-3 py-3 sm:gap-3 sm:px-5"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-1">
          {(['all', 'pending', 'needs-info', 'approved', 'rejected'] as const).map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className="px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors"
              style={{ background: filter === s ? '#2563EB' : 'var(--secondary)', color: filter === s ? 'white' : 'var(--muted-foreground)' }}>
              {s === 'all' ? 'All' : APPROVAL_STATUS_CONFIG[s as ApprovalStatus].label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {filtered.map(appr => {
          const s = APPROVAL_STATUS_CONFIG[appr.status];
          const Icon = TYPE_ICONS[appr.type] ?? CheckSquare;
          return (
            <div key={appr.id} className="flex cursor-pointer items-center gap-3 border-b px-3 py-3.5 transition-colors hover:bg-secondary/30 sm:gap-4 sm:px-5"
              style={{ borderColor: 'var(--border)' }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--secondary)' }}>
                <Icon className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium truncate" style={{ color: 'var(--foreground)' }}>{appr.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>Requested by {appr.requestedBy}</span>
                  {appr.amount && <span className="text-[11px] font-medium" style={{ color: 'var(--foreground)' }}>{appr.amount}</span>}
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>{appr.dueDate}</span>
                <StatusChip label={s.label} color={s.color} bg={s.bg} />
                {(appr.status === 'pending' || appr.status === 'needs-info') && (
                  <div className="flex items-center gap-1">
                    <button className="px-2.5 py-1 rounded-lg text-[11px] font-medium text-white transition-opacity hover:opacity-90"
                      style={{ background: '#10B981' }}>Approve</button>
                    <button className="px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors"
                      style={{ background: 'var(--secondary)', color: 'var(--muted-foreground)' }}>Decline</button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Requests tab
───────────────────────────────────────────────────────────── */
function RequestsTab() {
  const [filter, setFilter] = useState<RequestStatus | 'all'>('all');
  const filtered = filter === 'all' ? REQUESTS : REQUESTS.filter(r => r.status === filter);
  const REQ_STATUS: Record<RequestStatus, { label: string; color: string; bg: string }> = {
    open: { label: 'Open', color: '#2563EB', bg: '#2563EB15' },
    'in-progress': { label: 'In progress', color: '#F97316', bg: '#F9731615' },
    resolved: { label: 'Resolved', color: '#10B981', bg: '#10B98115' },
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div
        className="flex flex-wrap items-center gap-2 px-3 py-3 sm:gap-3 sm:px-5"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-1">
          {(['all', 'open', 'in-progress', 'resolved'] as const).map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className="px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors"
              style={{ background: filter === s ? '#2563EB' : 'var(--secondary)', color: filter === s ? 'white' : 'var(--muted-foreground)' }}>
              {s === 'all' ? 'All' : REQ_STATUS[s as RequestStatus].label}
            </button>
          ))}
        </div>
        <div className="ml-auto">
          <BonsaiButton size="sm">
            <Plus className="w-3.5 h-3.5 mr-1" />
            New request
          </BonsaiButton>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {filtered.map(req => {
          const s = REQ_STATUS[req.status];
          const Icon = TYPE_ICONS[req.type] ?? Inbox;
          return (
            <div key={req.id} className="flex cursor-pointer items-center gap-3 border-b px-3 py-3.5 transition-colors hover:bg-secondary/30 sm:gap-4 sm:px-5"
              style={{ borderColor: 'var(--border)' }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--secondary)' }}>
                <Icon className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium truncate" style={{ color: 'var(--foreground)' }}>{req.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>From: {req.from}</span>
                  {req.client && <span className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>· {req.client}</span>}
                  <span className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>· {req.createdAt}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <PriorityBadge priority={req.priority} />
                <StatusChip label={s.label} color={s.color} bg={s.bg} />
                <Avatar initials={req.fromInitials} size="xs" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Work — main component
───────────────────────────────────────────────────────────── */
const TAB_CONFIG: { id: WorkTab; label: string; icon: React.ElementType; count: number }[] = [
  { id: 'tasks', label: 'Tasks', icon: CheckSquare, count: TASKS.filter(t => t.status !== 'done').length },
  { id: 'issues', label: 'Issues', icon: AlertCircle, count: ISSUES.filter(i => i.status === 'open').length },
  { id: 'approvals', label: 'Approvals', icon: ThumbsUp, count: APPROVALS.filter(a => a.status === 'pending' || a.status === 'needs-info').length },
  { id: 'requests', label: 'Requests', icon: Inbox, count: REQUESTS.filter(r => r.status === 'open').length },
];

export default function Work() {
  const [tab, setTab] = useState<WorkTab>('tasks');

  return (
    <div className="flex h-full min-h-0 flex-col" style={{ background: 'var(--background)' }}>
      {/* Page header */}
      <div className="px-4 pb-0 pt-4 sm:px-6 sm:pt-5" style={{ borderBottom: '1px solid var(--border)' }}>
        <h1 className="mb-3 text-[17px] font-semibold sm:mb-4 sm:text-[18px]" style={{ color: 'var(--foreground)' }}>Work</h1>

        {/* Summary stat row */}
        <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 sm:mb-4">
          {TAB_CONFIG.map(t => (
            <div key={t.id} className="flex items-center gap-1.5">
              <t.icon className="h-3.5 w-3.5" style={{ color: 'var(--muted-foreground)' }} />
              <span className="text-[13px] font-semibold" style={{ color: 'var(--foreground)' }}>{t.count}</span>
              <span className="text-[11px] sm:text-[12px]" style={{ color: 'var(--muted-foreground)' }}>{t.label.toLowerCase()}</span>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="-mx-1 flex items-end gap-0 overflow-x-auto pb-px sm:mx-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TAB_CONFIG.map(t => (
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
              <t.icon className="w-4 h-4" />
              {t.label}
              {t.count > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: tab === t.id ? '#2563EB' : 'var(--secondary)', color: tab === t.id ? 'white' : 'var(--muted-foreground)' }}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            className="h-full flex flex-col min-h-0"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
          >
            {tab === 'tasks' && <TasksTab />}
            {tab === 'issues' && <IssuesTab />}
            {tab === 'approvals' && <ApprovalsTab />}
            {tab === 'requests' && <RequestsTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
