'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, Plus, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import { BonsaiButton } from '../bonsai/BonsaiButton';
import { staggerContainer, fadeInUp, cardInteraction, easeOutQuart, EASE_OUT_EXPO } from '../../lib/motion';

/* ── Animated stat number ──────────────────────────────── */
function AnimatedStat({ to, prefix = '', suffix = '' }: { to: number; prefix?: string; suffix?: string }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const t0 = performance.now();
    const run = (now: number) => {
      const p = Math.min((now - t0) / 1200, 1);
      setV(Math.round(to * easeOutQuart(p)));
      if (p < 1) requestAnimationFrame(run);
    };
    requestAnimationFrame(run);
  }, [to]);
  return <>{prefix}{v.toLocaleString()}{suffix}</>;
}

/* ── Thin animated progress bar ───────────────────────── */
function ProgressBar({ pct, delay = 0, color = 'bg-stone-800' }: { pct: number; delay?: number; color?: string }) {
  return (
    <div className="h-[2px] w-full bg-stone-100 rounded-full overflow-hidden mt-3">
      <motion.div
        className={`h-full ${color} rounded-full`}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ delay, duration: 1.0, ease: EASE_OUT_EXPO }}
      />
    </div>
  );
}

interface SA01DashboardProps {
  onNavigateToDeals: () => void;
  onNavigateToPipeline: () => void;
  onCreateDeal: () => void;
}

const STATS = [
  { label: 'Total Pipeline',  val: 485,  pre: '$', suf: 'K', delta: '+12%', up: true,  sub: 'vs last month' },
  { label: 'Active Deals',    val: 23,   pre: '',  suf: '',   delta: '+3',   up: true,  sub: '18 project · 5 talent' },
  { label: 'Win Rate',        val: 68,   pre: '',  suf: '%',  delta: '+4pp', up: true,  sub: 'Above 64% target' },
  { label: 'Avg Close Time',  val: 42,   pre: '',  suf: 'd',  delta: '-3d',  up: true,  sub: 'Target ≤ 45 days' },
];

const PROJECT_STAGES = [
  { stage: 'New Lead',             count: 5, value: '$125K', pct: 100 },
  { stage: 'Qualified',            count: 3, value: '$85K',  pct: 68  },
  { stage: 'Discovery Scheduled',  count: 4, value: '$110K', pct: 88  },
  { stage: 'Proposal Sent',        count: 3, value: '$95K',  pct: 76  },
  { stage: 'Negotiation',          count: 3, value: '$75K',  pct: 60  },
];

const TALENT_STAGES = [
  { stage: 'New Request',   count: 2, value: '$45K', pct: 100 },
  { stage: 'Qualified',     count: 1, value: '$25K', pct: 56  },
  { stage: 'Profiles Sent', count: 1, value: '$30K', pct: 67  },
  { stage: 'Interviewing',  count: 0, value: '—',    pct: 0   },
  { stage: 'Placement',     count: 1, value: '$28K', pct: 62  },
];

const RECENT_DEALS = [
  { name: 'Website Redesign Project',   client: 'Acme Corp',    value: '$45,000', stage: 'Proposal Sent',        hot: true  },
  { name: 'Senior Designer Placement',  client: 'Tech Startup', value: '$28,000', stage: 'Interviewing',         hot: false },
  { name: 'Brand Identity Package',     client: 'Local Retail', value: '$15,000', stage: 'Discovery Scheduled',  hot: false },
  { name: 'React Developer Search',     client: 'SaaS Co.',     value: '$35,000', stage: 'Profiles Shared',      hot: false },
];

export function SA01Dashboard({ onNavigateToDeals, onNavigateToPipeline, onCreateDeal }: SA01DashboardProps) {
  return (
    <motion.div
      className="px-8 py-8 max-w-[1080px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      {/* ── Header ─────────────────────────────────────── */}
      <motion.div
        className="flex items-end justify-between mb-10"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
      >
        <div>
          <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-[0.1em] mb-1">Sales</p>
          <h1 className="text-[28px] font-semibold text-stone-900 tracking-[-0.025em]">Pipeline Overview</h1>
        </div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
          <BonsaiButton variant="primary" icon={<Plus className="w-4 h-4" />} onClick={onCreateDeal}>
            New Deal
          </BonsaiButton>
        </motion.div>
      </motion.div>

      {/* ── Stats ─── typography-only, no icon circles ─── */}
      <motion.div
        className="grid grid-cols-4 gap-px bg-stone-200/60 rounded-2xl overflow-hidden mb-8"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {STATS.map((s, i) => (
          <motion.div
            key={s.label}
            className="bg-white/80 backdrop-blur-sm px-6 py-6 flex flex-col gap-1"
            variants={fadeInUp}
            {...cardInteraction}
          >
            <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-[0.1em]">{s.label}</p>
            <p className="text-[34px] font-bold text-stone-900 tracking-[-0.03em] leading-none mt-2">
              <AnimatedStat to={s.val} prefix={s.pre} suffix={s.suf} />
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              {s.up
                ? <TrendingUp className="w-3 h-3 text-stone-600 flex-shrink-0" />
                : <TrendingDown className="w-3 h-3 text-stone-400 flex-shrink-0" />
              }
              <span className={`text-[11px] font-medium ${s.up ? 'text-stone-700' : 'text-stone-400'}`}>{s.delta}</span>
              <span className="text-[11px] text-stone-400">{s.sub}</span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Pipeline tables — 2 col ─────────────────────── */}
      <div className="grid grid-cols-2 gap-5 mb-8">
        {/* Project Pipeline */}
        <motion.div
          className="rounded-2xl border border-stone-200/60 bg-white/70 backdrop-blur-sm overflow-hidden"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.4, ease: EASE_OUT_EXPO }}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
            <h3 className="text-[13px] font-semibold text-stone-800">Project Pipeline</h3>
            <button onClick={onNavigateToPipeline} className="text-[12px] text-stone-400 hover:text-stone-700 transition-colors flex items-center gap-1 group">
              View all <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
          <div className="px-5 py-4 space-y-4">
            {PROJECT_STAGES.map((item, i) => (
              <motion.div
                key={item.stage}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.22 + i * 0.05, duration: 0.3, ease: EASE_OUT_EXPO }}
              >
                <div className="flex items-center justify-between">
                  <p className="text-[13px] font-medium text-stone-700">{item.stage}</p>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-stone-400">{item.count} deals</span>
                    <span className="text-[13px] font-semibold text-stone-800 tabular-nums">{item.value}</span>
                  </div>
                </div>
                <ProgressBar pct={item.pct} delay={0.3 + i * 0.06} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Talent Pipeline */}
        <motion.div
          className="rounded-2xl border border-stone-200/60 bg-white/70 backdrop-blur-sm overflow-hidden"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24, duration: 0.4, ease: EASE_OUT_EXPO }}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
            <h3 className="text-[13px] font-semibold text-stone-800">Talent Pipeline</h3>
            <button onClick={onNavigateToPipeline} className="text-[12px] text-stone-400 hover:text-stone-700 transition-colors flex items-center gap-1 group">
              View all <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
          <div className="px-5 py-4 space-y-4">
            {TALENT_STAGES.map((item, i) => (
              <motion.div
                key={item.stage}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.28 + i * 0.05, duration: 0.3, ease: EASE_OUT_EXPO }}
              >
                <div className="flex items-center justify-between">
                  <p className="text-[13px] font-medium text-stone-700">{item.stage}</p>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-stone-400">{item.count} deals</span>
                    <span className={`text-[13px] font-semibold tabular-nums ${item.pct === 0 ? 'text-stone-300' : 'text-stone-800'}`}>{item.value}</span>
                  </div>
                </div>
                {item.pct > 0
                  ? <ProgressBar pct={item.pct} delay={0.35 + i * 0.06} color="bg-stone-600" />
                  : <div className="h-[2px] w-full bg-stone-100 rounded-full mt-3" />
                }
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Recent Deals — editorial list ──────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.32, duration: 0.4, ease: EASE_OUT_EXPO }}
        className="rounded-2xl border border-stone-200/60 bg-white/70 backdrop-blur-sm overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <h3 className="text-[13px] font-semibold text-stone-800">Recent Deals</h3>
          <button onClick={onNavigateToDeals} className="text-[12px] text-stone-400 hover:text-stone-700 transition-colors flex items-center gap-1 group">
            View all <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
        <div className="divide-y divide-stone-100/80">
          {RECENT_DEALS.map((deal, i) => (
            <motion.button
              key={deal.name}
              className="w-full flex items-center gap-4 px-6 py-4 text-left group"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.38 + i * 0.05 }}
              whileHover={{ backgroundColor: 'rgba(28,25,23,0.025)', x: 2 }}
              whileTap={{ scale: 0.998 }}
              onClick={onNavigateToDeals}
            >
              {/* Urgency indicator */}
              <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${deal.hot ? 'bg-stone-800' : 'bg-stone-200'}`} />

              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-stone-800 truncate">{deal.name}</p>
                <p className="text-[12px] text-stone-400 mt-0.5">{deal.client}</p>
              </div>

              <span className="text-[12px] text-stone-400 flex-shrink-0 hidden md:block">{deal.stage}</span>

              <span className="text-[13px] font-semibold text-stone-800 tabular-nums flex-shrink-0">{deal.value}</span>

              <ArrowUpRight className="w-4 h-4 text-stone-200 group-hover:text-stone-500 transition-colors flex-shrink-0" />
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
