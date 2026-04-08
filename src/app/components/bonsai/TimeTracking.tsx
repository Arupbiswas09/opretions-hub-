'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play, Pause, Square, Plus, ChevronLeft, ChevronRight,
  Clock, MoreHorizontal, FolderKanban, Tag,
} from 'lucide-react';
import { BonsaiButton } from './BonsaiButton';
import { HubPageShell, PageHeader } from '../ui/PageHeader';
import { useHubData } from '../../lib/hub/use-hub-data';
import { createTimeEntry, type ProjectRow, type TimeEntryRow } from '../../lib/api/hub-api';

/* ── Stagger animation variants ── */
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

/* ──────────────────────────────────────────────────────────── 
   TIME TRACKING — Bonsai-inspired
   Features: Live timer, weekly timesheet, recent entries
   ──────────────────────────────────────────────────────────── */

/* ── Mock data replaced with API ── */
const PROJECT_COLORS = ['#1e40af', '#0f766e', '#b45309', '#dc2626', '#7c3aed', '#059669'];

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

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

/* ── Timer Format ── */
function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function TimeTracking() {
  /* ── Live data ── */
  const { data: rawProjects } = useHubData<ProjectRow[]>('/api/projects?status=active');
  const PROJECTS = (rawProjects ?? []).map((p, i) => ({
    id: p.id, name: p.name, client: p.client_name ?? '—', color: PROJECT_COLORS[i % PROJECT_COLORS.length],
  }));

  const { data: rawEntries, refetch: refetchEntries } = useHubData<(TimeEntryRow & { project_name?: string; project_id?: string })[]>('/api/time-entries?limit=20');
  const RECENT_ENTRIES = (rawEntries ?? []).map((e, i) => ({
    id: e.id ?? String(i),
    task: e.description ?? '—',
    project: e.project_name ?? '—',
    color: PROJECT_COLORS[i % PROJECT_COLORS.length],
    duration: `${Math.floor(e.hours)}h ${Math.round((e.hours % 1) * 60)}m`,
    date: (() => {
      const d = new Date(e.entry_date + 'T12:00');
      const today = new Date(); today.setHours(12, 0, 0, 0);
      const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
      if (d.toDateString() === today.toDateString()) return 'Today';
      if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    })(),
    billable: e.billable,
  }));

  /* ── Timer state ── */
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [selectedProject, setSelectedProject] = useState<{ id: string; name: string; client: string; color: string } | null>(null);
  const [taskDesc, setTaskDesc] = useState('');
  const [showProjectPicker, setShowProjectPicker] = useState(false);

  // Auto-select first project when loaded
  useEffect(() => {
    if (!selectedProject && PROJECTS.length > 0) {
      setSelectedProject(PROJECTS[0]);
    }
  }, [PROJECTS.length]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning) {
      timer = setInterval(() => setElapsed(e => e + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning]);

  const startTimer = useCallback(() => setIsRunning(true), []);
  const pauseTimer = useCallback(() => setIsRunning(false), []);
  const stopTimer = useCallback(async () => {
    setIsRunning(false);
    if (elapsed > 0 && selectedProject) {
      const hours = Math.round((elapsed / 3600) * 100) / 100;
      await createTimeEntry({
        project_id: selectedProject.id,
        description: taskDesc || 'Timer entry',
        hours,
        entry_date: new Date().toISOString().slice(0, 10),
        billable: true,
      });
      refetchEntries();
    }
    setElapsed(0);
    setTaskDesc('');
  }, [elapsed, selectedProject, taskDesc, refetchEntries]);

  /* ── Weekly totals — compute from entries ── */
  const weekTotal = RECENT_ENTRIES.reduce((s, e) => {
    const parts = e.duration.match(/(\d+)h\s*(\d+)m/);
    return s + (parts ? parseInt(parts[1]) + parseInt(parts[2]) / 60 : 0);
  }, 0);

  return (
    <HubPageShell narrow>
      <PageHeader
        eyebrow="Time tracking"
        title="Track your hours"
        description="Start a focused timer or backfill the grid — totals stay visible."
        animate={false}
      />

      <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
      {/* ═══ Live Timer — the hero section ═══ */}
      <motion.div variants={item}>
        <Card className="mb-5">
          <div className="px-3 py-4 sm:px-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-4">
              {/* Task description input */}
              <div className="relative min-w-0 flex-1">
                <input
                  type="text"
                  placeholder="What are you working on?"
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  className="w-full bg-transparent text-[14px] outline-none placeholder:opacity-50"
                  style={{ color: 'var(--foreground)' }}
                />
              </div>

              {/* Project picker */}
              <div className="relative shrink-0">
                <button
                  onClick={() => setShowProjectPicker(!showProjectPicker)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-[12px]"
                  style={{
                    background: 'var(--glass-bg-strong)',
                    color: 'var(--foreground-secondary)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: selectedProject?.color ?? '#6B7280' }} />
                  <span className="truncate max-w-[120px]">{selectedProject?.name ?? 'Select project'}</span>
                  <FolderKanban className="w-3 h-3 opacity-50" />
                </button>
                <AnimatePresence>
                  {showProjectPicker && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.96, y: 4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.97, y: 4 }}
                      transition={{ duration: 0.12 }}
                      className="absolute right-0 top-full mt-1.5 w-56 rounded-lg overflow-hidden z-50"
                      style={{
                        background: 'var(--popover)',
                        backdropFilter: 'blur(24px)',
                        border: '1px solid var(--border)',
                        boxShadow: 'var(--shadow-lg)',
                      }}
                    >
                      <div className="py-1">
                        {PROJECTS.map(p => (
                          <button
                            key={p.id}
                            onClick={() => { setSelectedProject(p); setShowProjectPicker(false); }}
                            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-left transition-colors hover:bg-white/[0.05]"
                            style={{ color: 'var(--foreground)' }}
                          >
                            <div className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
                            <div className="flex-1 min-w-0">
                              <div className="truncate">{p.name}</div>
                              <div className="text-[10px] opacity-40">{p.client}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Billable tag */}
              <button
                type="button"
                className="flex w-fit items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] transition-colors"
                style={{
                  background: 'var(--success-muted)',
                  color: 'var(--success)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <Tag className="w-3 h-3" />
                Billable
              </button>

              {/* Timer display */}
              <div className="flex w-full flex-wrap items-center justify-between gap-3 sm:w-auto sm:justify-end">
                <span
                  className={`text-[22px] font-mono font-semibold tabular-nums ${isRunning ? 'timer-pulse' : ''}`}
                  style={{ color: isRunning ? 'var(--success)' : 'var(--foreground)' }}
                >
                  {formatTime(elapsed)}
                </span>

                {/* Controls */}
                <div className="flex items-center gap-1.5">
                  {!isRunning ? (
                    <BonsaiButton
                      type="button"
                      variant="primary"
                      className="!p-0 !min-w-0 w-9 h-9 rounded-full shrink-0"
                      onClick={startTimer}
                      aria-label="Start timer"
                    >
                      <Play className="w-4 h-4 ml-0.5" />
                    </BonsaiButton>
                  ) : (
                    <>
                      <BonsaiButton
                        type="button"
                        variant="outline"
                        className="!p-0 !min-w-0 w-9 h-9 rounded-full shrink-0"
                        onClick={pauseTimer}
                        aria-label="Pause timer"
                      >
                        <Pause className="w-4 h-4" />
                      </BonsaiButton>
                      <button
                        type="button"
                        onClick={stopTimer}
                        className="w-8 h-8 rounded-full flex items-center justify-center transition-opacity hover:opacity-90"
                        style={{ background: 'rgba(220, 38, 38, 0.12)', color: 'var(--destructive)' }}
                        aria-label="Stop timer"
                      >
                        <Square className="w-3.5 h-3.5" fill="currentColor" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* ═══ Weekly Timesheet Grid ═══ */}
      <motion.div variants={item} className="mb-5">
        <Card>
          <div
            className="flex flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <h2 className="text-[14px] font-semibold" style={{ color: 'var(--foreground)' }}>
                Weekly Timesheet
              </h2>
              <div className="flex items-center gap-1.5">
                <button className="p-1 rounded-md transition-colors hover:bg-white/5"
                  style={{ color: 'var(--muted-foreground)' }}>
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="text-[12px] font-medium" style={{ color: 'var(--foreground-secondary)' }}>
                  Mar 31 — Apr 6, 2026
                </span>
                <button className="p-1 rounded-md transition-colors hover:bg-white/5"
                  style={{ color: 'var(--muted-foreground)' }}>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[12px]" style={{ color: 'var(--muted-foreground)' }}>
                Total:{' '}
                <strong style={{ color: 'var(--foreground)' }}>{weekTotal}h</strong>
              </span>
              <BonsaiButton type="button" size="sm" icon={<Plus className="w-3 h-3" />}>
                Add row
              </BonsaiButton>
            </div>
          </div>

          <div className="overflow-x-auto [-webkit-overflow-scrolling:touch]">
          {/* Header */}
          <div className="grid min-w-[720px] grid-cols-[1fr_repeat(7,64px)_64px] gap-0">
            <div className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider"
              style={{ color: 'var(--muted-foreground)', borderBottom: '1px solid var(--border)' }}>
              Project
            </div>
            {WEEK_DAYS.map((day, i) => (
              <div key={day} className="px-2 py-2.5 text-center text-[10px] font-medium uppercase tracking-wider"
                style={{
                  color: i === 5 || i === 6 ? 'var(--muted-foreground)' : 'var(--foreground-secondary)',
                  borderBottom: '1px solid var(--border)',
                  borderLeft: '1px solid var(--border-subtle)',
                }}>
                {day}
              </div>
            ))}
            <div className="px-2 py-2.5 text-center text-[10px] font-medium uppercase tracking-wider"
              style={{
                color: 'var(--foreground-secondary)',
                borderBottom: '1px solid var(--border)',
                borderLeft: '1px solid var(--border)',
              }}>
              Total
            </div>
          </div>

          {/* Rows — derive from projects + entries */}
          {(() => {
            // Build timesheet rows from projects
            const TIMESHEET_DATA = PROJECTS.slice(0, 5).map(p => ({
              project: p.name,
              client: p.client,
              color: p.color,
              hours: [0, 0, 0, 0, 0, 0, 0] as number[],
            }));
            // Distribute recent entries into the grid
            RECENT_ENTRIES.forEach(entry => {
              const row = TIMESHEET_DATA.find(r => r.project === entry.project);
              if (row) {
                const parts = entry.duration.match(/(\d+)h\s*(\d+)m/);
                const h = parts ? parseInt(parts[1]) + parseInt(parts[2]) / 60 : 0;
                // Put into a day slot based on entry index
                const dIdx = TIMESHEET_DATA.indexOf(row) % 5;
                row.hours[dIdx] = Math.round((row.hours[dIdx] + h) * 10) / 10;
              }
            });

            // Compute day totals for the footer
            const dayTotals = [0, 0, 0, 0, 0, 0, 0];
            TIMESHEET_DATA.forEach(row => {
              row.hours.forEach((h, di) => { dayTotals[di] += h; });
            });

            return (
              <>
                {TIMESHEET_DATA.map((row, ri) => {
                  const rowTotal = row.hours.reduce((s, h) => s + h, 0);
                  return (
                    <div key={ri} className="grid min-w-[720px] grid-cols-[1fr_repeat(7,64px)_64px] gap-0 group transition-colors hover:bg-white/[0.02]"
                      style={{ borderBottom: ri < TIMESHEET_DATA.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                      <div className="px-4 py-3 flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: row.color }} />
                        <div className="min-w-0">
                          <div className="text-[13px] font-medium truncate" style={{ color: 'var(--foreground)' }}>
                            {row.project}
                          </div>
                          <div className="text-[10px] truncate" style={{ color: 'var(--muted-foreground)' }}>
                            {row.client}
                          </div>
                        </div>
                      </div>
                      {row.hours.map((h, hi) => (
                        <div key={hi} className="px-2 py-3 flex items-center justify-center"
                          style={{ borderLeft: '1px solid var(--border-subtle)' }}>
                          <span className={`text-[13px] tabular-nums ${h > 0 ? 'font-medium' : ''}`}
                            style={{ color: h > 0 ? 'var(--foreground)' : 'var(--muted-foreground)' }}>
                            {h > 0 ? h : '—'}
                          </span>
                        </div>
                      ))}
                      <div className="px-2 py-3 flex items-center justify-center"
                        style={{ borderLeft: '1px solid var(--border)' }}>
                        <span className="text-[13px] font-semibold tabular-nums" style={{ color: '#2563EB' }}>
                          {Math.round(rowTotal * 10) / 10}h
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* Footer totals */}
                <div className="grid min-w-[720px] grid-cols-[1fr_repeat(7,64px)_64px] gap-0"
                  style={{ borderTop: '1px solid var(--border)', background: 'var(--glass-bg)' }}>
                  <div className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider"
                    style={{ color: 'var(--muted-foreground)' }}>
                    Daily Total
                  </div>
                  {WEEK_DAYS.map((_, di) => {
                    const dt = Math.round(dayTotals[di] * 10) / 10;
                    return (
                      <div key={di} className="px-2 py-2.5 flex items-center justify-center"
                        style={{ borderLeft: '1px solid var(--border-subtle)' }}>
                        <span className="text-[12px] font-semibold tabular-nums"
                          style={{ color: dt > 0 ? 'var(--foreground)' : 'var(--muted-foreground)' }}>
                          {dt > 0 ? `${dt}h` : '—'}
                        </span>
                      </div>
                    );
                  })}
                  <div className="px-2 py-2.5 flex items-center justify-center"
                    style={{ borderLeft: '1px solid var(--border)' }}>
                    <span className="text-[13px] font-bold tabular-nums"
                      style={{ color: '#2563EB' }}>
                      {weekTotal}h
                    </span>
                  </div>
                </div>
              </>
            );
          })()}
          </div>
        </Card>
      </motion.div>

      {/* ═══ Recent Time Entries ═══ */}
      <motion.div variants={item}>
        <Card>
          <div
            className="flex flex-col gap-2 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <h2 className="text-[14px] font-semibold" style={{ color: 'var(--foreground)' }}>
              Recent Entries
            </h2>
            <button className="text-[12px] transition-colors hover:underline"
              style={{ color: '#2563EB' }}>
              View All
            </button>
          </div>
          <div>
            {RECENT_ENTRIES.map((entry, i) => (
              <div
                key={entry.id}
                className="flex items-center gap-3 px-3 py-3 transition-colors hover:bg-white/[0.02] sm:gap-4 sm:px-5"
                style={{
                  borderBottom: i < RECENT_ENTRIES.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                }}
              >
                {/* Color indicator */}
                <div className="w-1 h-8 rounded-full" style={{ background: entry.color }} />
                {/* Task info */}
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium truncate" style={{ color: 'var(--foreground)' }}>
                    {entry.task}
                  </div>
                  <div className="text-[11px] flex items-center gap-2" style={{ color: 'var(--muted-foreground)' }}>
                    <span>{entry.project}</span>
                    <span className="opacity-30">·</span>
                    <span>{entry.date}</span>
                  </div>
                </div>
                {/* Billable badge */}
                {entry.billable && (
                  <span
                    className="text-[9px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full"
                    style={{
                      background: 'var(--success-muted)',
                      color: 'var(--success)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    Billable
                  </span>
                )}
                {/* Duration */}
                <span className="text-[13px] font-mono font-medium tabular-nums"
                  style={{ color: 'var(--foreground)' }}>
                  {entry.duration}
                </span>
                {/* Actions */}
                <button className="p-1 rounded-md transition-colors hover:bg-white/5 opacity-0 group-hover:opacity-100"
                  style={{ color: 'var(--muted-foreground)' }}>
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </motion.div>
    </HubPageShell>
  );
}
