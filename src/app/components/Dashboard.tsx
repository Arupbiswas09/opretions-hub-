'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronRight, Briefcase, Clock, Mail, BarChart3, ArrowUpRight, Plus } from 'lucide-react';
import { easeOutQuart, EASE_OUT_EXPO, staggerContainer, fadeInUp, springSnap } from '../lib/motion';

/* ─── Animated number counter ───────────────────────────── */
function Num({ to, prefix = '', suffix = '' }: { to: number; prefix?: string; suffix?: string }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const t0 = performance.now();
    const run = (now: number) => {
      const p = Math.min((now - t0) / 1400, 1);
      setV(Math.round(to * easeOutQuart(p)));
      if (p < 1) requestAnimationFrame(run);
    };
    requestAnimationFrame(run);
  }, [to]);
  return <>{prefix}{v.toLocaleString()}{suffix}</>;
}

/* ─── Thin animated progress bar ────────────────────────── */
function Bar({ pct, delay = 0 }: { pct: number; delay?: number }) {
  return (
    <div className="h-[2px] w-full bg-stone-200/70 rounded-full overflow-hidden mt-2">
      <motion.div
        className="h-full bg-stone-800 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ delay, duration: 1.0, ease: EASE_OUT_EXPO }}
      />
    </div>
  );
}

/* ─── Attention item row ─────────────────────────────────── 
     Monochrome. Priority through typography weight only.
     No colored pills, no colored dots. Linear-style. */
function AttentionRow({
  kind, title, meta, due, urgent, idx, actionLabel
}: {
  kind: string; title: string; meta: string; due: string;
  urgent: boolean; idx: number; actionLabel: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.42 + idx * 0.065, duration: 0.32, ease: EASE_OUT_EXPO }}
      whileHover={{ backgroundColor: 'rgba(28,25,23,0.02)' }}
      className="w-full flex items-center gap-5 px-5 py-[16px] text-left group"
      style={{ transition: 'background 0.15s ease' }}
    >
      {/* Status dot — monochrome */}
      <div className={`w-[6px] h-[6px] rounded-full flex-shrink-0 ${
        urgent ? 'bg-stone-800' : 'bg-stone-300'
      }`} />
      <div className="flex-1 min-w-0">
        <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-[0.08em]">{kind}</span>
        <p className={`text-[13px] leading-tight mt-0.5 truncate ${
          urgent ? 'font-semibold text-stone-900' : 'font-medium text-stone-700'
        }`}>{title}</p>
      </div>
      <span className="text-[12px] font-medium text-stone-500 tabular-nums flex-shrink-0">{meta}</span>
      <span className={`text-[11px] flex-shrink-0 w-16 text-right tabular-nums ${
        urgent ? 'font-semibold text-stone-700' : 'text-stone-400'
      }`}>{due}</span>
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="text-[11px] font-semibold text-stone-500 hover:text-stone-900 transition-colors flex-shrink-0 flex items-center gap-1"
      >
        {actionLabel}
        <ArrowUpRight className="w-3 h-3" />
      </motion.button>
    </motion.div>
  );
}

/* ─── Activity row ──────────────────────────────────────── 
     Monochrome. Area shown as plain text, not colored chip. */
function ActivityRow({
  text, by, area, t, idx
}: {
  text: string; by: string; area: string; t: string; idx: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.68 + idx * 0.06, duration: 0.3, ease: EASE_OUT_EXPO }}
      whileHover={{ x: 2, transition: { duration: 0.12 } }}
      className="flex items-start gap-3.5 py-[13px] group cursor-pointer border-b border-stone-100/60 last:border-0"
    >
      <span className="text-[10px] text-stone-400 tabular-nums w-6 pt-[3px] flex-shrink-0 text-right font-medium">{t}</span>
      <div className="w-[5px] h-[5px] rounded-full bg-stone-300 mt-[7px] flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[12px] text-stone-600 leading-snug group-hover:text-stone-900 transition-colors">{text}</p>
        <p className="text-[10px] text-stone-400 mt-1">{by} · {area}</p>
      </div>
    </motion.div>
  );
}

/* ─── Quick-action pill ──────────────────────────────────── */
function QuickAction({ label, desc, icon: Icon }: { label: string; desc: string; icon: React.ElementType }) {
  return (
    <motion.button
      className="glass-card flex items-center gap-3 px-4 py-3.5 text-left group"
      whileHover={{ y: -1, boxShadow: '0 6px 20px rgba(0,0,0,0.06)', backgroundColor: 'rgba(255,255,255,0.82)' }}
      whileTap={{ scale: 0.98 }}
      transition={springSnap}
    >
      <div className="w-8 h-8 rounded-[10px] flex items-center justify-center flex-shrink-0"
        style={{ background: 'rgba(28,25,23,0.06)' }}
      >
        <Icon className="w-4 h-4 text-stone-600 group-hover:text-stone-800 transition-colors" style={{ strokeWidth: 1.8 }} />
      </div>
      <div className="min-w-0">
        <p className="text-[12px] font-semibold text-stone-800 leading-tight">{label}</p>
        <p className="text-[10px] text-stone-400 leading-tight mt-0.5 truncate">{desc}</p>
      </div>
    </motion.button>
  );
}

/* ─── Workflow stage — monochrome mini-column ────────────── 
     No colored dots. Stage weight indicated by opacity.
     Cards are plain glass. Priority through font weight. */
function WorkflowStage({ stage, count, items, idx }: {
  stage: string; count: number;
  items: { title: string; assignee: string; urgent?: boolean }[];
  idx: number;
}) {
  // Opacity gets lighter as stages progress (visual weight = urgency)
  const stageOpacity = [1, 0.85, 0.65, 0.45][idx] ?? 0.5;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 + idx * 0.08, duration: 0.35, ease: EASE_OUT_EXPO }}
      className="flex-1 min-w-0"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-[6px] h-[6px] rounded-full bg-stone-800" style={{ opacity: stageOpacity }} />
        <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-[0.08em]">{stage}</span>
        <span className="text-[10px] font-bold text-stone-400 ml-auto">{count}</span>
      </div>
      <div className="space-y-1.5">
        {items.map((item, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -1, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
            className="rounded-[10px] px-3 py-2.5 cursor-pointer group"
            style={{
              background: 'rgba(255,255,255,0.72)',
              border: '1px solid rgba(0,0,0,0.05)',
              transition: 'all 0.15s ease',
            }}
          >
            <p className={`text-[11px] leading-tight truncate ${
              item.urgent ? 'font-semibold text-stone-800' : 'font-medium text-stone-600'
            }`}>{item.title}</p>
            <p className="text-[10px] text-stone-400 mt-0.5">{item.assignee}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN DASHBOARD
   
   Design system: MONOCHROMATIC stone palette only.
   No green. No orange. No blue. No red. No amber. No indigo.
   Hierarchy through: weight, size, opacity, spacing.
   Inspired by: Linear, Vercel, Notion.
═══════════════════════════════════════════════════════════ */
export default function Dashboard() {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  const approvals = [
    { id: 1, kind: 'Timesheet', title: 'John Doe — Week 2',    meta: '42 hrs',  due: 'Today',    urgent: true,  actionLabel: 'Approve' },
    { id: 2, kind: 'Invoice',   title: 'INV-1245 · Acme Corp', meta: '$12,400', due: 'Tomorrow', urgent: false, actionLabel: 'Review' },
    { id: 3, kind: 'Leave',     title: 'Jane Smith — Vacation', meta: '5 days', due: 'Jan 30',   urgent: false, actionLabel: 'Review' },
  ];

  const activity = [
    { id: 1, text: 'New deal created — Acme Corp Website Redesign', by: 'Sarah Johnson', t: '5m',  area: 'Sales'    },
    { id: 2, text: 'Project milestone completed — Q1 Launch',        by: 'Mike Torres',  t: '1h',  area: 'Projects' },
    { id: 3, text: 'Invoice #INV-1234 marked as paid',               by: 'Finance',      t: '2h',  area: 'Finance'  },
    { id: 4, text: 'New candidate applied — Senior Designer role',   by: 'HR Team',      t: '3h',  area: 'Talent'   },
  ];

  const quickActions = [
    { label: 'New Deal',       desc: 'Add to sales pipeline',   icon: Briefcase },
    { label: 'Log Timesheet',  desc: 'Submit this week',         icon: Clock },
    { label: 'Invite Client',  desc: 'Send portal access',       icon: Mail },
    { label: 'Run Report',     desc: 'Finance or project',       icon: BarChart3 },
  ];

  return (
    <div className="px-10 py-8 max-w-[1120px]">

      {/* ═══ Hero: Compact greeting ════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 10, filter: 'blur(2px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
        className="mb-8"
      >
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[11px] font-semibold text-stone-400 tracking-[0.08em] uppercase mb-1.5">{dateStr}</p>
            <h1 className="text-[32px] leading-[1.12] font-semibold text-stone-900 tracking-[-0.025em]">
              {greeting}, John.
            </h1>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.35 }}
            className="text-[12px] text-stone-400 pb-1.5 flex items-center gap-3"
          >
            <span><span className="font-semibold text-stone-700">3</span> pending sign-offs</span>
            <span className="text-stone-300">·</span>
            <span><span className="font-semibold text-stone-700">$485K</span> pipeline</span>
          </motion.p>
        </div>
      </motion.div>

      {/* ═══ KPI row ═══════════════════════════════════════════ */}
      <motion.div
        className="flex items-end gap-0 mb-8 rounded-2xl overflow-hidden"
        style={{ border: '1px solid rgba(0,0,0,0.06)', background: 'transparent' }}
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {[
          { label: 'Revenue',      val: 485, pre: '$', suf: 'K', sub: '+8% from last month',   delayBar: 0.5  },
          { label: 'Active deals', val: 24,  pre: '',  suf: '',   sub: '+12% this quarter',     delayBar: 0.55 },
          { label: 'Projects',     val: 18,  pre: '',  suf: '',   sub: '3 new this week',       delayBar: 0.6  },
          { label: 'Team',         val: 42,  pre: '',  suf: '',   sub: '2 joined recently',     delayBar: 0.65 },
          {
            label: 'Q1 Target', val: 92, pre: '', suf: '%',
            sub: '$485K of $530K', delayBar: 0.7, bar: true, barPct: 92,
          },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            className="flex-1 px-5 py-5"
            style={{
              background: 'rgba(255,255,255,0.55)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              borderRight: i < 4 ? '1px solid rgba(0,0,0,0.05)' : 'none',
            }}
            variants={fadeInUp}
          >
            <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-[0.1em] mb-2">{s.label}</p>
            <p className="text-[28px] font-bold text-stone-900 leading-none tracking-[-0.025em]">
              <Num to={s.val} prefix={s.pre} suffix={s.suf} />
            </p>
            {s.bar && <Bar pct={s.barPct!} delay={s.delayBar} />}
            <p className="text-[10px] text-stone-400 mt-1.5">{s.sub}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* ═══ Two-column: Workflows + Attention ═════════════════ */}
      <div className="grid grid-cols-[1fr_380px] gap-5 mb-8">

        {/* Active Workflows — mini kanban board */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.4, ease: EASE_OUT_EXPO }}
        >
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2.5">
              <h2 className="text-[14px] font-semibold text-stone-800 tracking-[-0.01em]">Active Workflows</h2>
              <span className="text-[10px] font-bold text-stone-400">12</span>
            </div>
            <button className="text-[11px] text-stone-400 hover:text-stone-700 transition-colors flex items-center gap-1 group">
              Board <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
          <div
            className="rounded-2xl overflow-hidden p-4"
            style={{
              border: '1px solid rgba(0,0,0,0.06)',
              background: 'rgba(255,255,255,0.48)',
              backdropFilter: 'blur(32px) saturate(180%)',
              WebkitBackdropFilter: 'blur(32px) saturate(180%)',
            }}
          >
            <div className="flex gap-3">
              <WorkflowStage idx={0} stage="To Do" count={4} items={[
                { title: 'Q2 budget review', assignee: 'Finance · Sarah K.', urgent: true },
                { title: 'Update SOW — Acme', assignee: 'Sales · Mike T.' },
              ]} />
              <WorkflowStage idx={1} stage="In Progress" count={5} items={[
                { title: 'Website Redesign v2', assignee: 'Projects · Jane S.', urgent: true },
                { title: 'Onboard contractors', assignee: 'People · HR Team' },
              ]} />
              <WorkflowStage idx={2} stage="Review" count={2} items={[
                { title: 'INV-1245 · Acme', assignee: 'Finance · John D.', urgent: true },
              ]} />
              <WorkflowStage idx={3} stage="Done" count={1} items={[
                { title: 'Portal launch', assignee: 'Projects · Team A' },
              ]} />
            </div>
          </div>
        </motion.div>

        {/* Needs attention — right column */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32, duration: 0.4, ease: EASE_OUT_EXPO }}
        >
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2.5">
              <h2 className="text-[14px] font-semibold text-stone-800 tracking-[-0.01em]">Needs attention</h2>
              <span className="w-[18px] h-[18px] rounded-full bg-stone-800 text-white text-[9px] font-bold flex items-center justify-center">
                {approvals.length}
              </span>
            </div>
          </div>
          <div
            className="rounded-2xl overflow-hidden divide-y divide-stone-100/60"
            style={{
              border: '1px solid rgba(0,0,0,0.06)',
              background: 'rgba(255,255,255,0.48)',
              backdropFilter: 'blur(32px) saturate(180%)',
              WebkitBackdropFilter: 'blur(32px) saturate(180%)',
            }}
          >
            {approvals.map((a, i) => (
              <AttentionRow key={a.id} {...a} idx={i} />
            ))}
          </div>
        </motion.div>
      </div>

      {/* ═══ Quick actions ═════════════════════════════════════ */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.36, duration: 0.35, ease: EASE_OUT_EXPO }}
      >
        <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-[0.1em] mb-3">Quick Actions</p>
        <div className="grid grid-cols-4 gap-2.5">
          {quickActions.map((a) => (
            <QuickAction key={a.label} {...a} />
          ))}
        </div>
      </motion.div>

      {/* ═══ Two-column: Activity + Your role ═════════════════ */}
      <div className="grid grid-cols-[1fr_260px] gap-6">

        {/* Activity feed */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4, ease: EASE_OUT_EXPO }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[14px] font-semibold text-stone-800 tracking-[-0.01em]">Today</h2>
            <button className="text-[11px] text-stone-400 hover:text-stone-700 transition-colors flex items-center gap-1 group">
              View all <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
          <div>
            {activity.map((a, i) => <ActivityRow key={a.id} {...a} idx={i} />)}
          </div>
        </motion.div>

        {/* Context sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.55, duration: 0.4, ease: EASE_OUT_EXPO }}
        >
          <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-[0.1em] mb-3">Your role</p>

          <div
            className="rounded-2xl overflow-hidden p-4 space-y-2.5"
            style={{
              border: '1px solid rgba(0,0,0,0.06)',
              background: 'rgba(255,255,255,0.48)',
              backdropFilter: 'blur(32px) saturate(180%)',
              WebkitBackdropFilter: 'blur(32px) saturate(180%)',
            }}
          >
            {/* User card */}
            <div className="flex items-center gap-3 pb-2.5 border-b border-stone-100">
              <div
                className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-[13px] font-bold text-white"
                style={{ background: 'linear-gradient(145deg, #292524, #57534e)' }}
              >JD</div>
              <div>
                <p className="text-[13px] font-semibold text-stone-900 leading-tight">John Doe</p>
                <p className="text-[11px] text-stone-400">Operations Manager</p>
              </div>
            </div>

            {/* Role-relevant metrics — monochrome, weight-differentiated */}
            {[
              { label: 'Open approvals',  val: '3',         actionable: true  },
              { label: 'My timesheets',   val: '1 pending', actionable: true  },
              { label: 'Active projects', val: '18',        actionable: false },
              { label: 'Team capacity',   val: '87%',       actionable: false },
            ].map((item) => (
              <motion.button
                key={item.label}
                className="w-full flex items-center justify-between group py-0.5"
                whileHover={{ x: 2, transition: { duration: 0.12 } }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-[5px] h-[5px] rounded-full ${
                    item.actionable ? 'bg-stone-700' : 'bg-stone-300'
                  }`} />
                  <span className="text-[12px] text-stone-500 group-hover:text-stone-800 transition-colors">{item.label}</span>
                </div>
                <span className={`text-[12px] ${
                  item.actionable ? 'font-bold text-stone-800' : 'font-medium text-stone-500'
                }`}>{item.val}</span>
              </motion.button>
            ))}

            {/* Trend — plain text, no colored icon */}
            <div className="pt-2 border-t border-stone-100">
              <p className="text-[11px] text-stone-400">Pipeline up <span className="font-semibold text-stone-700">12%</span> vs last quarter</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
