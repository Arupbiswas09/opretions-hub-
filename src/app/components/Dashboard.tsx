'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, ArrowRight, ChevronRight, Circle } from 'lucide-react';
import { easeOutQuart } from '../lib/motion';

/* ─── Animated number ─── */
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

/* ─── Thin progress bar ─── */
function Bar({ pct, delay = 0 }: { pct: number; delay?: number }) {
  return (
    <div className="h-[3px] w-full bg-stone-100 rounded-full overflow-hidden mt-2">
      <motion.div
        className="h-full bg-stone-800 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ delay, duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
      />
    </div>
  );
}

export default function Dashboard() {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const dateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'short', day: 'numeric',
  });

  const approvals = [
    { id: 1, kind: 'Timesheet', title: 'John Doe — Week 2', meta: '42 hrs', due: 'Today', hot: true },
    { id: 2, kind: 'Invoice', title: 'INV-1245 · Acme Corp', meta: '$12,400', due: 'Tomorrow', hot: false },
    { id: 3, kind: 'Leave', title: 'Jane Smith — Vacation', meta: '5 days', due: 'Jan 30', hot: false },
  ];

  const activity = [
    { id: 1, text: 'New deal created — Acme Corp Website Redesign', by: 'Sarah Johnson', t: '5m', area: 'Sales' },
    { id: 2, text: 'Project milestone completed — Q1 Launch', by: 'Mike Torres', t: '1h', area: 'Projects' },
    { id: 3, text: 'Invoice #INV-1234 marked as paid', by: 'Finance', t: '2h', area: 'Finance' },
    { id: 4, text: 'New candidate applied — Senior Designer role', by: 'HR Team', t: '3h', area: 'Talent' },
  ];

  return (
    <div className="px-10 py-10 max-w-[1120px]">

      {/* ═══ Hero: Greeting ═══ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="mb-14"
      >
        <p className="text-[13px] text-stone-400 tracking-wide mb-3">{dateStr}</p>
        <h1 className="text-[42px] leading-[1.1] font-extralight text-stone-800 tracking-[-0.02em]">
          {greeting},<br />
          <span className="font-medium">John.</span>
        </h1>
      </motion.div>

      {/* ═══ Stats — typography only, no cards ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        className="flex items-end gap-14 mb-14 pb-10 border-b border-stone-200/60"
      >
        {[
          { label: 'Revenue', val: 485, pre: '$', suf: 'K', sub: '+8% from last month' },
          { label: 'Active deals', val: 24, sub: '+12% this quarter' },
          { label: 'Projects', val: 18, sub: '3 new this week' },
          { label: 'Team', val: 42, sub: '2 joined recently' },
        ].map((s, i) => (
          <div key={s.label} className="flex-1">
            <p className="text-[11px] text-stone-400 uppercase tracking-widest mb-2">{s.label}</p>
            <p className="text-[32px] font-light text-stone-800 leading-none tracking-tight">
              <Num to={s.val} prefix={s.pre} suffix={s.suf} />
            </p>
            <p className="text-[12px] text-stone-400 mt-2">{s.sub}</p>
          </div>
        ))}

        {/* Target — with progress bar */}
        <div className="flex-1">
          <p className="text-[11px] text-stone-400 uppercase tracking-widest mb-2">Q1 Target</p>
          <p className="text-[32px] font-light text-stone-800 leading-none tracking-tight">
            <Num to={92} suffix="%" />
          </p>
          <Bar pct={92} delay={0.8} />
          <p className="text-[12px] text-stone-400 mt-2">$485K of $530K</p>
        </div>
      </motion.div>

      {/* ═══ Needs attention — stacked list, not card grid ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mb-14"
      >
        <div className="flex items-center gap-3 mb-5">
          <h2 className="text-[13px] font-medium text-stone-800 tracking-wide">
            Needs your attention
          </h2>
          <span className="w-5 h-5 rounded-full bg-stone-800 text-white text-[10px] font-medium flex items-center justify-center">
            {approvals.length}
          </span>
        </div>

        <div className="rounded-2xl border border-stone-200/70 bg-white/50 backdrop-blur-sm overflow-hidden divide-y divide-stone-100">
          {approvals.map((a, i) => (
            <motion.button
              key={a.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 + i * 0.07 }}
              className="w-full flex items-center gap-5 px-6 py-5 text-left hover:bg-stone-50/60 transition-colors group"
            >
              {/* Urgency dot */}
              <div className="flex-shrink-0">
                <Circle
                  className={`w-2.5 h-2.5 ${a.hot ? 'fill-amber-500 text-amber-500' : 'fill-stone-300 text-stone-300'}`}
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-stone-400 font-medium uppercase tracking-wider">
                    {a.kind}
                  </span>
                  {a.hot && (
                    <span className="text-[10px] text-amber-600 font-medium">Due today</span>
                  )}
                </div>
                <p className="text-[14px] text-stone-700 mt-0.5 truncate">{a.title}</p>
              </div>

              {/* Meta */}
              <span className="text-[13px] text-stone-400 tabular-nums flex-shrink-0">{a.meta}</span>

              {/* Due */}
              <span className="text-[12px] text-stone-400 flex-shrink-0 w-16 text-right">{a.due}</span>

              {/* Arrow */}
              <ArrowUpRight className="w-4 h-4 text-stone-300 group-hover:text-stone-600 transition-colors flex-shrink-0" />
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* ═══ Activity — editorial timeline ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[13px] font-medium text-stone-800 tracking-wide">Today</h2>
          <button className="text-[12px] text-stone-400 hover:text-stone-600 transition-colors flex items-center gap-1">
            View all <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-0">
          {activity.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.65 + i * 0.06, duration: 0.35 }}
              className="flex items-start gap-5 py-4 group cursor-pointer border-b border-stone-100/80 last:border-0 hover:bg-stone-50/40 -mx-3 px-3 rounded-lg transition-colors"
            >
              {/* Time column */}
              <span className="text-[12px] text-stone-400 tabular-nums w-8 pt-0.5 flex-shrink-0 text-right">
                {a.t}
              </span>

              {/* Dot */}
              <div className="w-1.5 h-1.5 rounded-full bg-stone-300 mt-2 flex-shrink-0" />

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="text-[14px] text-stone-600 leading-relaxed group-hover:text-stone-800 transition-colors">
                  {a.text}
                </p>
                <p className="text-[12px] text-stone-400 mt-1">
                  {a.by}
                  <span className="text-stone-300 mx-1.5">·</span>
                  {a.area}
                </p>
              </div>

              {/* Action */}
              <ArrowRight className="w-4 h-4 text-stone-200 group-hover:text-stone-500 transition-colors mt-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100" />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
