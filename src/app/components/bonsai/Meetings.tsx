'use client';
import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Plus, Video, MapPin, Clock, Users, Calendar,
  ChevronLeft, ChevronRight, ExternalLink, MoreHorizontal,
} from 'lucide-react';
import { BonsaiButton } from './BonsaiButton';
import { HubPageShell, PageHeader } from '../ui/PageHeader';

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};
const fadeItem = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

/* ──────────────────────────────────────────────────────────── 
   MEETINGS — Bonsai-inspired scheduling view
   Features: Upcoming list, Calendar week strip, Quick schedule
   ──────────────────────────────────────────────────────────── */

const UPCOMING = [
  { id: 1, title: 'Sprint Review — Website Redesign', time: '10:00 AM — 10:45 AM',
    date: 'Today', type: 'video' as const, attendees: ['JD', 'JS', 'SW'],
    project: 'Website Redesign', color: '#1e40af',
    link: 'https://meet.google.com/xyz' },
  { id: 2, title: 'Client Kickoff — Mobile App', time: '1:00 PM — 2:00 PM',
    date: 'Today', type: 'video' as const, attendees: ['JD', 'AB', 'CD'],
    project: 'Mobile App Dev', color: '#0f766e',
    link: 'https://zoom.us/j/123' },
  { id: 3, title: 'Brand Review with Stakeholders', time: '11:00 AM — 12:00 PM',
    date: 'Tomorrow', type: 'in-person' as const, attendees: ['JD', 'SW'],
    project: 'Brand Identity', color: '#b45309',
    link: '' },
  { id: 4, title: 'Weekly Team Standup', time: '9:00 AM — 9:30 AM',
    date: 'Wed, Apr 8', type: 'video' as const, attendees: ['JD', 'JS', 'SW', 'AB'],
    project: null, color: '#57534e',
    link: 'https://meet.google.com/abc' },
  { id: 5, title: 'Invoice Review — Q1 Close', time: '3:00 PM — 3:30 PM',
    date: 'Thu, Apr 9', type: 'video' as const, attendees: ['JD', 'CFO'],
    project: null, color: '#44403c',
    link: '' },
];

const WEEK_DATES = [
  { day: 'Mon', date: 31, month: 'Mar', meetings: 1 },
  { day: 'Tue', date: 1, month: 'Apr', meetings: 0 },
  { day: 'Wed', date: 2, month: 'Apr', meetings: 2 },
  { day: 'Thu', date: 3, month: 'Apr', meetings: 1 },
  { day: 'Fri', date: 4, month: 'Apr', meetings: 0 },
  { day: 'Sat', date: 5, month: 'Apr', meetings: 0, isToday: true },
  { day: 'Sun', date: 6, month: 'Apr', meetings: 2 },
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

export default function Meetings() {
  const [selectedDay, setSelectedDay] = useState(5); // index of today

  return (
    <HubPageShell narrow>
      <PageHeader
        eyebrow="Meetings"
        title="Schedule"
        description="This week at a glance — join links and context inline."
        action={
          <BonsaiButton size="md" icon={<Plus className="w-3.5 h-3.5" />} type="button">
            New meeting
          </BonsaiButton>
        }
      />

      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-5">
      {/* ═══ Week Strip ═══ */}
      <motion.div variants={fadeItem}>
        <Card>
          <div
            className="flex flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <div className="flex items-center gap-2">
              <button className="p-1 rounded-md transition-colors hover:bg-white/5"
                style={{ color: 'var(--muted-foreground)' }}>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="text-[13px] font-medium" style={{ color: 'var(--foreground)' }}>
                March 31 — April 6, 2026
              </span>
              <button className="p-1 rounded-md transition-colors hover:bg-white/5"
                style={{ color: 'var(--muted-foreground)' }}>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <button className="text-[11px] px-2.5 py-1 rounded-md transition-colors"
              style={{ background: 'var(--glass-bg-strong)', color: 'var(--foreground-secondary)' }}>
              Today
            </button>
          </div>
          <div className="overflow-x-auto [-webkit-overflow-scrolling:touch]">
          <div className="grid min-w-[560px] grid-cols-7 gap-0">
            {WEEK_DATES.map((d, i) => (
              <button
                key={i}
                onClick={() => setSelectedDay(i)}
                className="flex flex-col items-center py-3 gap-1 transition-all relative"
                style={{
                  background: i === selectedDay ? 'var(--info-muted)' : 'transparent',
                  borderLeft: i > 0 ? '1px solid var(--border-subtle)' : 'none',
                }}
              >
                <span className="text-[10px] uppercase tracking-wider"
                  style={{ color: 'var(--muted-foreground)' }}>{d.day}</span>
                <span className="text-[18px] font-semibold"
                  style={{ color: d.isToday ? 'var(--primary)' : 'var(--foreground)' }}>{d.date}</span>
                {d.meetings > 0 && (
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: Math.min(d.meetings, 3) }).map((_, di) => (
                      <div key={di} className="w-1 h-1 rounded-full" style={{ background: 'var(--primary)' }} />
                    ))}
                  </div>
                )}
                {/* Active indicator */}
                {i === selectedDay && (
                  <div className="absolute bottom-0 left-1/4 right-1/4 h-[2px] rounded-full"
                    style={{ background: 'var(--primary)' }} />
                )}
              </button>
            ))}
          </div>
          </div>
        </Card>
      </motion.div>

      {/* ═══ Upcoming Meetings List ═══ */}
      <motion.div variants={fadeItem}>
        <Card>
          <div
            className="flex flex-col gap-2 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <h2 className="text-[14px] font-semibold" style={{ color: 'var(--foreground)' }}>
              Upcoming
            </h2>
            <span className="text-[11px] px-2 py-0.5 rounded-full font-medium"
              style={{
                background: 'var(--info-muted)',
                color: 'var(--accent-foreground)',
              }}>
              {UPCOMING.length} scheduled
            </span>
          </div>
          <div>
            {UPCOMING.map((meeting, i) => (
              <div
                key={meeting.id}
                className="group flex flex-col gap-3 px-3 py-3.5 transition-colors hover:bg-white/[0.02] sm:flex-row sm:items-center sm:gap-4 sm:px-5"
                style={{
                  borderBottom: i < UPCOMING.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                }}
              >
                {/* Color bar */}
                <div className="w-1 h-10 rounded-full flex-shrink-0" style={{ background: meeting.color }} />

                {/* Meeting info */}
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium truncate" style={{ color: 'var(--foreground)' }}>
                    {meeting.title}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-[11px] flex items-center gap-1"
                      style={{ color: 'var(--muted-foreground)' }}>
                      <Clock className="w-3 h-3" />
                      {meeting.time}
                    </span>
                    {meeting.project && (
                      <span className="text-[10px] px-2 py-0.5 rounded-md"
                        style={{
                          background: `${meeting.color}18`,
                          color: meeting.color,
                          border: `1px solid ${meeting.color}35`,
                        }}>
                        {meeting.project}
                      </span>
                    )}
                  </div>
                </div>

                {/* Date */}
                <span className="text-[11px] font-medium"
                  style={{
                    color: meeting.date === 'Today' ? 'var(--primary)' : 'var(--muted-foreground)',
                  }}>
                  {meeting.date}
                </span>

                {/* Attendees */}
                <div className="flex -space-x-1.5">
                  {meeting.attendees.slice(0, 3).map((a, ai) => (
                    <div key={ai} className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold"
                      style={{
                        background: ai === 0 ? 'var(--foreground)' : 'var(--glass-bg-ultra)',
                        color: ai === 0 ? 'var(--background-2)' : 'var(--foreground)',
                        border: '2px solid var(--background)',
                      }}>
                      {a}
                    </div>
                  ))}
                  {meeting.attendees.length > 3 && (
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[8px]"
                      style={{
                        background: 'var(--glass-bg-strong)',
                        color: 'var(--muted-foreground)',
                        border: '2px solid var(--background)',
                      }}>
                      +{meeting.attendees.length - 3}
                    </div>
                  )}
                </div>

                {/* Meeting type icon */}
                <div className="flex items-center gap-2">
                  {meeting.type === 'video' ? (
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ background: 'var(--info-muted)', color: 'var(--chart-1)' }}>
                      <Video className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ background: 'var(--warning-muted)', color: 'var(--warning)' }}>
                      <MapPin className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>

                {/* Join button */}
                {meeting.link && (
                  <a
                    href={meeting.link}
                    className="text-[11px] font-medium px-3 py-1.5 rounded-lg transition-opacity opacity-0 group-hover:opacity-100 inline-flex items-center gap-1 bg-stone-800 text-white shadow-sm hover:bg-stone-700 dark:bg-white/12 dark:text-stone-100 dark:hover:bg-white/16"
                  >
                    Join
                  </a>
                )}

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
