'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUpRight, ChevronRight, Zap, TrendingUp, Briefcase, Clock, Mail, BarChart3 } from 'lucide-react';
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

/* ─── Attention item row ─────────────────────────────────── */
function AttentionRow({
  kind, title, meta, due, hot, idx
}: {
  kind: string; title: string; meta: string; due: string; hot: boolean; idx: number;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.42 + idx * 0.065, duration: 0.32, ease: EASE_OUT_EXPO }}
      whileHover={{ backgroundColor: 'rgba(28,25,23,0.025)', x: 3 }}
      whileTap={{ scale: 0.998 }}
      className="w-full flex items-center gap-5 px-6 py-[18px] text-left group"
      style={{ transition: 'background 0.15s ease' }}
    >
      <div className="flex-shrink-0">
        <div className={`w-2 h-2 rounded-full ${hot ? 'bg-amber-500' : 'bg-stone-300'}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2.5 mb-0.5">
          <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-[0.09em]">{kind}</span>
          {hot && <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Due today</span>}
        </div>
        <p className="text-[14px] font-medium text-stone-800 truncate leading-tight">{title}</p>
      </div>
      <span className="text-[13px] font-medium text-stone-600 tabular-nums flex-shrink-0">{meta}</span>
      <span className="text-[12px] text-stone-400 flex-shrink-0 w-20 text-right">{due}</span>
      <ArrowUpRight className="w-3.5 h-3.5 text-stone-300 group-hover:text-stone-600 transition-colors flex-shrink-0" />
    </motion.button>
  );
}

/* ─── Activity item ──────────────────────────────────────── */
function ActivityRow({
  text, by, area, t, idx
}: {
  text: string; by: string; area: string; t: string; idx: number;
}) {
  const areaColors: Record<string, string> = {
    Sales: 'bg-indigo-100 text-indigo-700',
    Projects: 'bg-emerald-100 text-emerald-700',
    Finance: 'bg-amber-100 text-amber-700',
    Talent: 'bg-rose-100 text-rose-700',
    People: 'bg-sky-100 text-sky-700',
  };
  const color = areaColors[area] ?? 'bg-stone-100 text-stone-600';

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.68 + idx * 0.06, duration: 0.3, ease: EASE_OUT_EXPO }}
      whileHover={{ x: 3, transition: { duration: 0.12 } }}
      className="flex items-start gap-4 py-[14px] group cursor-pointer border-b border-stone-100/70 last:border-0 -mx-2 px-2 rounded-lg"
    >
      <span className="text-[11px] text-stone-400 tabular-nums w-7 pt-1 flex-shrink-0 text-right">{t}</span>
      <div className="w-1.5 h-1.5 rounded-full bg-stone-300 mt-[7px] flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] text-stone-700 leading-snug group-hover:text-stone-900 transition-colors">{text}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <p className="text-[11px] text-stone-400">{by}</p>
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${color}`}>{area}</span>
        </div>
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
      <div className="w-8 h-8 rounded-[10px] flex items-center justify-center flex-shrink-0 transition-colors"
        style={{ background: 'rgba(28,25,23,0.06)' }}
      >
        <Icon className="w-4 h-4 text-stone-600 group-hover:text-stone-800 transition-colors" style={{ strokeWidth: 1.8 }} />
      </div>
      <div className="min-w-0">
        <p className="text-[12px] font-semibold text-stone-800 leading-tight">{label}</p>
        <p className="text-[11px] text-stone-400 leading-tight mt-0.5 truncate">{desc}</p>
      </div>
    </motion.button>
  );
}

/* ─── Main dashboard ─────────────────────────────────────── */
export default function Dashboard() {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  const approvals = [
    { id: 1, kind: 'Timesheet', title: 'John Doe — Week 2',    meta: '42 hrs',  due: 'Today',    hot: true  },
    { id: 2, kind: 'Invoice',   title: 'INV-1245 · Acme Corp', meta: '$12,400', due: 'Tomorrow', hot: false },
    { id: 3, kind: 'Leave',     title: 'Jane Smith — Vacation', meta: '5 days', due: 'Jan 30',   hot: false },
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
    <div className="px-10 py-10 max-w-[1120px]">

      {/* ═══ Hero: Greeting + contextual date ════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 12, filter: 'blur(3px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
        className="mb-12"
      >
        <p className="text-[12px] font-semibold text-stone-400 tracking-[0.08em] uppercase mb-2">{dateStr}</p>
        <h1 className="text-[44px] leading-[1.08] font-light text-stone-900 tracking-[-0.025em]">
          {greeting},<br />
          <span className="font-semibold">John.</span>
        </h1>

        {/* Context line — personalised for the logged-in user */}
        <motion.p
          className="mt-3 text-[14px] text-stone-500 flex items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.35 }}
        >
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          You have <span className="font-semibold text-stone-800">3 items</span> needing sign-off
          <span className="text-stone-300">·</span>
          <span className="font-semibold text-emerald-600">$485K</span> pipeline on track
        </motion.p>
      </motion.div>

      {/* ═══ KPI row — typography only ════════════════════════ */}
      <motion.div
        className="flex items-end gap-0 mb-10 rounded-2xl overflow-hidden"
        style={{ border: '1px solid rgba(0,0,0,0.06)', background: 'transparent' }}
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {[
          { label: 'Revenue',      val: 485, pre: '$', suf: 'K', sub: '+8% from last month',   delta: '+8%',   delayBar: 0.5  },
          { label: 'Active deals', val: 24,  pre: '',  suf: '',   sub: '+12% this quarter',     delta: '+12%',  delayBar: 0.55 },
          { label: 'Projects',     val: 18,  pre: '',  suf: '',   sub: '3 new this week',       delta: '+3',    delayBar: 0.6  },
          { label: 'Team',         val: 42,  pre: '',  suf: '',   sub: '2 joined recently',     delta: '+2',    delayBar: 0.65 },
          {
            label: 'Q1 Target', val: 92, pre: '', suf: '%',
            sub: '$485K of $530K', delta: 'On track', delayBar: 0.7, bar: true, barPct: 92,
          },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            className="flex-1 px-6 py-5"
            style={{
              background: 'rgba(255,255,255,0.58)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              borderRight: i < 4 ? '1px solid rgba(0,0,0,0.05)' : 'none',
            }}
            variants={fadeInUp}
          >
            <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-[0.1em] mb-2">{s.label}</p>
            <p className="text-[30px] font-bold text-stone-900 leading-none tracking-[-0.025em] shimmer-text">
              <Num to={s.val} prefix={s.pre} suffix={s.suf} />
            </p>
            {s.bar && <Bar pct={s.barPct!} delay={s.delayBar} />}
            <p className="text-[11px] text-stone-500 mt-2">{s.sub}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* ═══ Quick actions ════════════════════════════════════ */}
      <motion.div
        className="mb-10"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28, duration: 0.35, ease: EASE_OUT_EXPO }}
      >
        <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-[0.1em] mb-3">Quick Actions</p>
        <div className="grid grid-cols-4 gap-2.5">
          {quickActions.map((a, i) => (
            <QuickAction key={a.label} {...a} />
          ))}
        </div>
      </motion.div>

      {/* ═══ Needs attention ══════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.32, duration: 0.4, ease: EASE_OUT_EXPO }}
        className="mb-10"
      >
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-[15px] font-semibold text-stone-800 tracking-[-0.015em]">Needs your attention</h2>
          <motion.span
            className="relative w-5 h-5 rounded-full bg-stone-800 text-white text-[9px] font-bold flex items-center justify-center"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ delay: 0.9, duration: 0.4, ease: EASE_OUT_EXPO }}
          >
            {approvals.length}
          </motion.span>
        </div>

        <div
          className="rounded-2xl overflow-hidden divide-y divide-stone-100/70"
          style={{
            border: '1px solid rgba(0,0,0,0.06)',
            background: 'rgba(255,255,255,0.55)',
            backdropFilter: 'blur(32px) saturate(180%)',
            WebkitBackdropFilter: 'blur(32px) saturate(180%)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.75)',
          }}
        >
          {approvals.map((a, i) => (
            <AttentionRow key={a.id} {...a} idx={i} />
          ))}
        </div>
      </motion.div>

      {/* ═══ Two-column: activity + context sidebar ═══════════ */}
      <div className="grid grid-cols-[1fr_280px] gap-6">

        {/* Activity feed */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4, ease: EASE_OUT_EXPO }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-semibold text-stone-800 tracking-[-0.015em]">Today</h2>
            <button className="text-[11px] text-stone-400 hover:text-stone-700 transition-colors flex items-center gap-1 group">
              View all <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
          <div>
            {activity.map((a, i) => <ActivityRow key={a.id} {...a} idx={i} />)}
          </div>
        </motion.div>

        {/* Contextual sidebar — role-relevant shortcuts */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.55, duration: 0.4, ease: EASE_OUT_EXPO }}
        >
          <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-[0.1em] mb-4">Your role</p>

          <div
            className="rounded-2xl overflow-hidden p-4 space-y-3"
            style={{
              border: '1px solid rgba(0,0,0,0.06)',
              background: 'rgba(255,255,255,0.55)',
              backdropFilter: 'blur(32px) saturate(180%)',
              WebkitBackdropFilter: 'blur(32px) saturate(180%)',
            }}
          >
            {/* User card */}
            <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
              <div
                className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-[13px] font-bold text-white"
                style={{ background: 'linear-gradient(145deg, #292524, #57534e)' }}
              >JD</div>
              <div>
                <p className="text-[13px] font-semibold text-stone-900 leading-tight">John Doe</p>
                <p className="text-[11px] text-stone-400">Operations Manager</p>
              </div>
            </div>

            {/* Role-relevant metrics */}
            {[
              { label: 'Open approvals',   val: '3',   hot: true  },
              { label: 'My timesheets',    val: '1 pending', hot: true  },
              { label: 'Active projects',  val: '18',  hot: false },
              { label: 'Team capacity',    val: '87%', hot: false },
            ].map((item) => (
              <motion.button
                key={item.label}
                className="w-full flex items-center justify-between group py-1"
                whileHover={{ x: 2, transition: { duration: 0.12 } }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${item.hot ? 'bg-amber-500' : 'bg-stone-200'}`} />
                  <span className="text-[12px] text-stone-600 group-hover:text-stone-900 transition-colors">{item.label}</span>
                </div>
                <span className={`text-[12px] font-semibold ${item.hot ? 'text-amber-700' : 'text-stone-800'}`}>{item.val}</span>
              </motion.button>
            ))}

            {/* Trend indicator */}
            <div className="pt-3 border-t border-stone-100">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                <p className="text-[11px] text-stone-500">Pipeline up <span className="font-semibold text-emerald-700">12%</span> vs last quarter</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
