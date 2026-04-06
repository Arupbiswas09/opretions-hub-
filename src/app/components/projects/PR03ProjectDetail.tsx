'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronDown, Tag, Plus, Send, MessageSquare, Paperclip,
  ExternalLink, Clock, DollarSign, Users, BarChart3,
  CheckSquare, FileText, TrendingUp, Settings2, Check,
} from 'lucide-react';

/* ── Status config ── */
const STATUSES = [
  { id: 'not-started', label: 'Not Started', color: '#6B7280' },
  { id: 'active',      label: 'Active',      color: '#2563EB' },
  { id: 'on-hold',     label: 'On Hold',     color: '#D97706' },
  { id: 'completed',   label: 'Completed',   color: '#059669' },
  { id: 'cancelled',   label: 'Cancelled',   color: '#DC2626' },
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

interface Task {
  id: string;
  title: string;
  assignee: string;
  due: string;
  done: boolean;
}

interface TimeEntry {
  id: string;
  date: string;
  description: string;
  person: string;
  hours: number;
  billable: boolean;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  billableRate: number;
  hoursLogged: number;
}

interface Project {
  id: string;
  name: string;
  client: string;
  clientId: string;
  status: string;
  budget: number;
  spent: number;
  startDate: string;
  endDate: string;
  billingType: string;
  billableRate: string;
  projectId: string;
  description: string;
}

interface PR03ProjectDetailProps {
  project?: Partial<Project>;
  onBack?: () => void;
}

/* ── Avatar initials ── */
function Avatar({ name, size = 'sm' }: { name: string; size?: 'xs' | 'sm' | 'md' }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const colors = ['#2563EB', '#059669', '#D97706', '#7C3AED', '#DC2626', '#0D9488'];
  const color = colors[name.charCodeAt(0) % colors.length];
  const sz = size === 'xs' ? 'w-6 h-6 text-[9px]' : size === 'sm' ? 'w-8 h-8 text-[11px]' : 'w-10 h-10 text-[13px]';
  return (
    <div className={`${sz} rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0`}
      style={{ background: color }}>
      {initials}
    </div>
  );
}

/* ── Activity Feed ── */
function ActivityFeed({ projectName }: { projectName: string }) {
  const [comment, setComment] = useState('');
  const activities = [
    { who: 'John Doe', action: `created project ${projectName}`, time: 'Today 9:54 PM', avatar: 'John Doe' },
  ];
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors"
          style={{ background: 'var(--glass-bg)', border: '1px solid var(--border)', color: 'var(--foreground)' }}>
          <Send className="w-3.5 h-3.5" />
          Send Email
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors"
          style={{ background: 'var(--glass-bg)', border: '1px solid var(--border)', color: 'var(--foreground)' }}>
          <MessageSquare className="w-3.5 h-3.5" />
          Add Internal Comment
        </button>
      </div>
      <div className="space-y-4">
        {activities.map((a, i) => (
          <div key={i} className="flex items-start gap-3">
            <Avatar name={a.avatar} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-[13px]" style={{ color: 'var(--foreground)' }}>
                <span className="font-medium">{a.who}</span>
                {' '}{a.action}.
                {' '}<span className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>{a.time}</span>
              </p>
              {i === 0 && (
                <a href="#" className="text-[12px]" style={{ color: 'var(--primary)' }}>
                  Forwarding Email
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   PROJECT DETAIL — Bonsai-style: header, tabbed nav, right panel
───────────────────────────────────────────────────────────── */
export function PR03ProjectDetail({ project: proj, onBack }: PR03ProjectDetailProps) {
  const project: Project = {
    id: proj?.id || '1',
    name: proj?.name || 'Engineering Project',
    client: proj?.client || 'Acme Corporation',
    clientId: proj?.clientId || 'SC',
    status: proj?.status || 'Active',
    budget: proj?.budget || 45000,
    spent: proj?.spent || 28500,
    startDate: proj?.startDate || 'Apr 5',
    endDate: proj?.endDate || 'Ongoing',
    billingType: proj?.billingType || 'Time & Materials',
    billableRate: proj?.billableRate || 'Member Hourly Rate',
    projectId: proj?.projectId || 'SAM-0002',
    description: proj?.description || 'Full project description goes here.',
  };

  const [activeTab, setActiveTab] = useState('overview');
  const [status, setStatus] = useState(project.status);
  const [showStatusDrop, setShowStatusDrop] = useState(false);
  const [tags, setTags] = useState<string[]>([]);

  const budgetPct = Math.min((project.spent / project.budget) * 100, 100);
  const budgetColor = budgetPct > 90 ? '#DC2626' : budgetPct > 70 ? '#D97706' : '#059669';
  const statusObj = STATUSES.find(s => s.label === status) || STATUSES[1];

  /* Tasks tab data */
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Setup project repository', assignee: 'John Doe', due: 'Apr 10', done: true },
    { id: '2', title: 'Design system foundation', assignee: 'Jane Smith', due: 'Apr 15', done: false },
    { id: '3', title: 'API integration — Auth module', assignee: 'John Doe', due: 'Apr 20', done: false },
    { id: '4', title: 'Client review session', assignee: 'Sarah Wilson', due: 'Apr 25', done: false },
  ]);

  /* Time entries */
  const timeEntries: TimeEntry[] = [
    { id: '1', date: 'Apr 5', description: 'Initial setup & planning', person: 'John Doe', hours: 3.5, billable: true },
    { id: '2', date: 'Apr 4', description: 'Design review meeting', person: 'Jane Smith', hours: 1.5, billable: true },
    { id: '3', date: 'Apr 3', description: 'Internal coordination', person: 'John Doe', hours: 1.0, billable: false },
  ];

  /* Team members */
  const team: TeamMember[] = [
    { id: '1', name: 'John Doe', role: 'Project Manager', billableRate: 120, hoursLogged: 15 },
    { id: '2', name: 'Jane Smith', role: 'Lead Designer', billableRate: 95, hoursLogged: 8 },
    { id: '3', name: 'Sarah Wilson', role: 'Account Manager', billableRate: 85, hoursLogged: 3 },
  ];

  return (
    <div className="min-h-full">
      {/* ── Page header ── */}
      <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
        {/* Client chip + name row */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-md flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
            style={{ background: '#2563EB' }}>
            {project.clientId}
          </div>
          <h1 className="text-[20px] font-semibold tracking-[-0.02em]"
            style={{ color: 'var(--foreground)' }}>
            {project.name}
          </h1>

          {/* Tags */}
          <button className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-md transition-colors"
            style={{ color: 'var(--muted-foreground)', border: '1px dashed var(--border)' }}>
            <Tag className="w-3 h-3" />
            Add Tag
          </button>

          {/* Budget bar — right in header */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>Budget</span>
            <div className="w-24 h-[5px] rounded-full overflow-hidden" style={{ background: 'var(--stat-bar-track)' }}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${budgetPct}%`, background: budgetColor }} />
            </div>
            <span className="text-[11px] font-medium tabular-nums" style={{ color: 'var(--foreground)' }}>
              {budgetPct.toFixed(0)}%
            </span>
          </div>

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
              {status}
              <ChevronDown className="w-3 h-3" />
            </button>
            <AnimatePresence>
              {showStatusDrop && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.12 }}
                  className="absolute right-0 top-full mt-1 w-44 rounded-lg overflow-hidden z-50"
                  style={{
                    background: 'var(--popover)',
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow-lg)',
                  }}>
                  {STATUSES.map(s => (
                    <button
                      key={s.id}
                      onClick={() => { setStatus(s.label); setShowStatusDrop(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[12px] text-left transition-colors"
                      style={{ color: 'var(--foreground)' }}>
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
                      {s.label}
                      {s.label === status && <Check className="w-3 h-3 ml-auto" style={{ color: 'var(--primary)' }} />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* More */}
          <button className="p-1.5 rounded-lg transition-colors" style={{ color: 'var(--muted-foreground)' }}>
            <Settings2 className="w-4 h-4" />
          </button>
        </div>

        {/* Tab nav — underline style like Bonsai */}
        <div className="flex items-center gap-0 -mb-[17px]">
          {TABS.map(tab => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-medium transition-colors relative"
                style={{ color: active ? 'var(--foreground)' : 'var(--muted-foreground)' }}>
                {tab.label}
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
          <button className="p-2 ml-1 rounded-md transition-colors" style={{ color: 'var(--muted-foreground)' }}>
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Tab content ── */}
      <div className="flex gap-0">
        {/* Main content area */}
        <div className="flex-1 p-6 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}>

              {/* OVERVIEW TAB */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Documents & Links */}
                  <section>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-[14px] font-semibold" style={{ color: 'var(--foreground)' }}>
                        Documents & Links
                      </h3>
                      <button className="w-6 h-6 rounded-md flex items-center justify-center transition-colors"
                        style={{ background: 'var(--glass-bg)', border: '1px solid var(--border)', color: 'var(--muted-foreground)' }}>
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="rounded-xl p-8 text-center"
                      style={{ border: '1px solid var(--border)', background: 'var(--glass-bg)' }}>
                      <p className="text-[13px]" style={{ color: 'var(--muted-foreground)' }}>
                        No documents have been added to this project yet.
                      </p>
                    </div>
                  </section>

                  {/* Activity */}
                  <section>
                    <h3 className="text-[14px] font-semibold mb-3" style={{ color: 'var(--foreground)' }}>
                      Activity
                    </h3>
                    <ActivityFeed projectName={project.name} />
                  </section>
                </div>
              )}

              {/* TASKS TAB */}
              {activeTab === 'tasks' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[13px]" style={{ color: 'var(--muted-foreground)' }}>
                      {tasks.filter(t => t.done).length} of {tasks.length} completed
                    </p>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium"
                      style={{ background: 'var(--primary)', color: '#FFFFFF' }}>
                      <Plus className="w-3.5 h-3.5" />
                      Add Task
                    </button>
                  </div>
                  <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                    {tasks.map((task, i) => (
                      <div key={task.id} className="flex items-center gap-3 px-4 py-3 transition-colors"
                        style={{
                          borderBottom: i < tasks.length - 1 ? '1px solid var(--border)' : 'none',
                          background: 'var(--glass-bg)',
                        }}>
                        <button onClick={() => setTasks(prev => prev.map(t => t.id === task.id ? { ...t, done: !t.done } : t))}
                          className="w-[18px] h-[18px] rounded-[4px] flex items-center justify-center flex-shrink-0 transition-all"
                          style={{
                            border: task.done ? 'none' : '1.5px solid var(--border-strong)',
                            background: task.done ? 'var(--primary)' : 'transparent',
                          }}>
                          {task.done && <Check className="w-3 h-3 text-white" />}
                        </button>
                        <p className={`flex-1 text-[13px] ${task.done ? 'line-through' : ''}`}
                          style={{ color: task.done ? 'var(--muted-foreground)' : 'var(--foreground)' }}>
                          {task.title}
                        </p>
                        <Avatar name={task.assignee} size="xs" />
                        <span className="text-[11px] w-16 text-right" style={{ color: 'var(--muted-foreground)' }}>
                          {task.due}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TIME TAB */}
              {activeTab === 'time' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-[13px]" style={{ color: 'var(--muted-foreground)' }}>
                        {timeEntries.reduce((s, e) => s + e.hours, 0).toFixed(1)} hours logged
                      </p>
                    </div>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium"
                      style={{ background: 'var(--primary)', color: '#FFFFFF' }}>
                      <Plus className="w-3.5 h-3.5" />
                      Log Time
                    </button>
                  </div>
                  <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                    <table className="w-full text-[12px]">
                      <thead>
                        <tr style={{ background: 'var(--glass-bg)', borderBottom: '1px solid var(--border)' }}>
                          {['Date', 'Description', 'Person', 'Hours', 'Billable'].map(h => (
                            <th key={h} className="text-left px-4 py-2.5 font-medium"
                              style={{ color: 'var(--muted-foreground)' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {timeEntries.map((e, i) => (
                          <tr key={e.id} style={{
                            borderBottom: i < timeEntries.length - 1 ? '1px solid var(--border)' : 'none',
                            background: 'var(--glass-bg)',
                          }}>
                            <td className="px-4 py-3" style={{ color: 'var(--muted-foreground)' }}>{e.date}</td>
                            <td className="px-4 py-3" style={{ color: 'var(--foreground)' }}>{e.description}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <Avatar name={e.person} size="xs" />
                                <span style={{ color: 'var(--foreground)' }}>{e.person}</span>
                              </div>
                            </td>
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
                </div>
              )}

              {/* BILLING TAB */}
              {activeTab === 'billing' && (
                <div className="space-y-4">
                  <div className="rounded-xl p-5" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border)' }}>
                    <h3 className="text-[13px] font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Billing Settings</h3>
                    <div className="space-y-3">
                      {[
                        { label: 'Billing Type', value: 'Time & Materials' },
                        { label: 'Billable Rate', value: 'Member Hourly Rate' },
                        { label: 'Budget', value: `$${(project.budget / 1000).toFixed(0)}K` },
                        { label: 'Spent', value: `$${(project.spent / 1000).toFixed(1)}K` },
                      ].map(row => (
                        <div key={row.label} className="flex items-center justify-between py-2"
                          style={{ borderBottom: '1px solid var(--border)' }}>
                          <span className="text-[12px]" style={{ color: 'var(--muted-foreground)' }}>{row.label}</span>
                          <span className="text-[13px] font-medium" style={{ color: 'var(--foreground)' }}>{row.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl p-5" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border)' }}>
                    <h3 className="text-[13px] font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Invoices</h3>
                    <p className="text-[12px]" style={{ color: 'var(--muted-foreground)' }}>No invoices generated yet.</p>
                  </div>
                </div>
              )}

              {/* EXPENSES TAB */}
              {activeTab === 'expenses' && (
                <div className="rounded-xl p-8 text-center" style={{ border: '1px solid var(--border)', background: 'var(--glass-bg)' }}>
                  <p className="text-[13px]" style={{ color: 'var(--muted-foreground)' }}>No expenses recorded yet.</p>
                  <button className="mt-2 text-[13px]" style={{ color: 'var(--primary)' }}>Add expense</button>
                </div>
              )}

              {/* INSIGHTS TAB */}
              {activeTab === 'insights' && (
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Budget Used', value: `${budgetPct.toFixed(0)}%` },
                    { label: 'Hours Logged', value: '6h' },
                    { label: 'Team Size', value: team.length.toString() },
                    { label: 'Tasks Done', value: `${tasks.filter(t => t.done).length}/${tasks.length}` },
                    { label: 'Billable Hours', value: '5h' },
                    { label: 'Days Left', value: '25' },
                  ].map(m => (
                    <div key={m.label} className="rounded-xl p-4"
                      style={{ background: 'var(--glass-bg)', border: '1px solid var(--border)' }}>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.06em] mb-1"
                        style={{ color: 'var(--muted-foreground)' }}>{m.label}</p>
                      <p className="text-[24px] font-bold tracking-[-0.02em]" style={{ color: 'var(--foreground)' }}>
                        {m.value}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* TEAM TAB */}
              {activeTab === 'team' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[13px]" style={{ color: 'var(--muted-foreground)' }}>{team.length} members</p>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium"
                      style={{ background: 'var(--primary)', color: '#FFFFFF' }}>
                      <Plus className="w-3.5 h-3.5" />
                      Add Member
                    </button>
                  </div>
                  <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                    {team.map((member, i) => (
                      <div key={member.id} className="flex items-center gap-3 px-4 py-3"
                        style={{
                          borderBottom: i < team.length - 1 ? '1px solid var(--border)' : 'none',
                          background: 'var(--glass-bg)',
                        }}>
                        <Avatar name={member.name} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-medium" style={{ color: 'var(--foreground)' }}>{member.name}</p>
                          <p className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>{member.role}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[12px] font-medium" style={{ color: 'var(--foreground)' }}>
                            ${member.billableRate}/hr
                          </p>
                          <p className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>
                            {member.hoursLogged}h logged
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Right Properties Panel (shown only on overview) ── */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-60 flex-shrink-0 border-l p-5 space-y-5"
            style={{ borderColor: 'var(--border)' }}>

            {/* Properties */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[12px] font-semibold uppercase tracking-[0.06em]"
                  style={{ color: 'var(--muted-foreground)' }}>
                  Properties
                </h4>
                <button className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>∧</button>
              </div>
              {[
                { label: 'Project ID', value: project.projectId },
                { label: 'Status',     value: status },
                { label: 'Dates',      value: `${project.startDate} – ${project.endDate}` },
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

            {/* Billing */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[12px] font-semibold uppercase tracking-[0.06em]"
                  style={{ color: 'var(--muted-foreground)' }}>
                  Billing
                </h4>
                <button className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>∧</button>
              </div>
              {[
                { label: 'Type',          value: project.billingType },
                { label: 'Billable Rate', value: project.billableRate },
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

            {/* Client */}
            <div>
              <h4 className="text-[12px] font-semibold uppercase tracking-[0.06em] mb-3"
                style={{ color: 'var(--muted-foreground)' }}>
                Client
              </h4>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-bold text-white"
                  style={{ background: '#2563EB' }}>
                  {project.clientId}
                </div>
                <span className="text-[13px] font-medium" style={{ color: 'var(--foreground)' }}>
                  {project.client}
                </span>
              </div>
            </div>

          </motion.div>
        )}
      </div>
    </div>
  );
}
