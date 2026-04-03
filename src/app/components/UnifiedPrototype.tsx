'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'motion/react';
import {
  Home, Briefcase, Users, Building2, FolderKanban, UserPlus,
  DollarSign, Headphones, Settings, Search, Bell, Plus,
  ChevronRight, ClipboardList, PanelLeftClose, PanelLeft,
  Command, ArrowUpRight
} from 'lucide-react';
import { pageTransition, springSnap } from '../lib/motion';

import Dashboard from './Dashboard';
import Sales from './Sales';
import Contacts from './Contacts';
import Clients from './Clients';
import Projects from './Projects';
import Talent from './Talent';
import People from './People';
import Finance from './Finance';
import Support from './Support';
import Forms from './Forms';
import Admin from './Admin';
import Portals from './Portals';

type View = 'internal' | 'client-portal' | 'employee-portal' | 'freelancer-portal';
type Module = 'dashboard' | 'sales' | 'contacts' | 'clients' | 'projects' | 'talent' | 'people' | 'finance' | 'support' | 'forms' | 'admin';

const NAV: { id: Module; label: string; icon: React.ElementType; badge?: number }[] = [
  { id: 'dashboard', label: 'Dashboard',  icon: Home },
  { id: 'sales',     label: 'Sales',      icon: Briefcase,    badge: 5 },
  { id: 'contacts',  label: 'Contacts',   icon: Users },
  { id: 'clients',   label: 'Clients',    icon: Building2 },
  { id: 'projects',  label: 'Projects',   icon: FolderKanban, badge: 3 },
  { id: 'talent',    label: 'Talent',     icon: UserPlus },
  { id: 'people',    label: 'People',     icon: Users,        badge: 2 },
  { id: 'finance',   label: 'Finance',    icon: DollarSign,   badge: 1 },
  { id: 'support',   label: 'Support',    icon: Headphones },
  { id: 'forms',     label: 'Forms',      icon: ClipboardList },
  { id: 'admin',     label: 'Admin',      icon: Settings },
];

const PORTALS = [
  { id: 'client-portal',     label: 'Client',     color: '#6366F1' },
  { id: 'employee-portal',   label: 'Employee',   color: '#059669' },
  { id: 'freelancer-portal', label: 'Freelancer', color: '#D97706' },
] as const;

export default function UnifiedPrototype() {
  const [view, setView] = useState<View>('internal');
  const [mod, setMod]   = useState<Module>('dashboard');
  const [collapsed, setCollapsed] = useState(false);

  const go   = (m: Module) => { setMod(m); setView('internal'); };
  const home = () => { setView('internal'); setMod('dashboard'); };
  const sw   = collapsed ? 64 : 240;

  const renderContent = () => {
    if (view !== 'internal') return <Portals />;
    const map: Record<Module, React.ReactNode> = {
      dashboard: <Dashboard />, sales: <Sales />,    contacts: <Contacts />,
      clients:   <Clients />,   projects: <Projects />, talent: <Talent />,
      people:    <People />,    finance: <Finance />, support: <Support />,
      forms:     <Forms />,     admin: <Admin />,
    };
    return map[mod];
  };

  return (
    <MotionConfig reducedMotion="user" transition={{ type: 'spring', stiffness: 400, damping: 30 }}>
    <div className="min-h-screen flex">

      {/* ═══════════════════════════════════════
          SIDEBAR — Apple-grade true glassmorphism
          Key: backdrop-filter blur + saturate on a
          semi-opaque white surface over the ambient bg
      ═══════════════════════════════════════ */}
      {view === 'internal' && (
        <motion.aside
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28, delay: 0.05 }}
          className="fixed inset-y-0 left-0 z-30 flex flex-col"
          style={{
            width: sw,
            transition: 'width 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            /* Apple glass formula */
            background: 'rgba(255,255,255,0.78)',
            backdropFilter: 'blur(44px) saturate(180%)',
            WebkitBackdropFilter: 'blur(44px) saturate(180%)',
            borderRight: '1px solid rgba(0,0,0,0.06)',
            boxShadow: '4px 0 24px rgba(0,0,0,0.04)',
          }}
        >
          {/* Top shimmer line */}
          <div
            className="absolute top-0 right-0 bottom-0 w-px pointer-events-none"
            style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0.1) 100%)' }}
          />

          {/* ── Brand ── */}
          <div className="h-[56px] flex items-center px-4" style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
            <button onClick={home} className="flex items-center gap-2.5 min-w-0 group press-effect w-full">
              {/* Geometric monogram */}
              <div className="w-[30px] h-[30px] flex-shrink-0 relative">
                <div
                  className="absolute inset-0 rounded-full group-hover:scale-105 transition-transform duration-200"
                  style={{ background: 'linear-gradient(145deg, #2c2928 0%, #1c1917 100%)', boxShadow: '0 2px 8px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.10)' }}
                />
                <div className="absolute top-[3px] left-[3px] w-[24px] h-[24px] rounded-full border border-white/20" />
                <span className="absolute inset-0 flex items-center justify-center text-white text-[10px] font-semibold tracking-tight z-10">O</span>
                <div className="absolute bottom-[3px] right-[3px] w-[4px] h-[4px] rounded-full bg-amber-400/80" />
              </div>
              {!collapsed && (
                <div className="flex flex-col min-w-0 leading-none">
                  <span className="text-[13px] font-semibold text-stone-800 tracking-[-0.02em]">Operations</span>
                  <span className="text-[9px] font-semibold text-stone-400 tracking-[0.1em] uppercase mt-[1px]">Hub</span>
                </div>
              )}
            </button>
          </div>

          {/* ── Navigation ── */}
          <nav className="flex-1 px-2 py-3 space-y-[2px] overflow-y-auto">
            {NAV.map((item, i) => {
              const Icon   = item.icon;
              const active = mod === item.id;
              return (
                <motion.button
                  key={item.id}
                  onClick={() => go(item.id)}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.035, type: 'spring', stiffness: 350, damping: 30 }}
                  className={`relative w-full flex items-center rounded-[10px] transition-colors ${
                    collapsed ? 'justify-center px-0 py-[10px]' : 'px-[10px] py-[8px] gap-[10px]'
                  }`}
                  style={{
                    background: active ? 'rgba(28,25,23,0.07)' : 'transparent',
                    color: active ? '#1c1917' : '#78716c',
                  }}
                  whileHover={{ backgroundColor: 'rgba(28,25,23,0.05)' }}
                  whileTap={{ scale: 0.97 }}
                >
                  {/* Active indicator bar */}
                  {active && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[18px] rounded-full"
                      style={{ background: '#1c1917' }}
                      transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                    />
                  )}
                  <Icon
                    className="flex-shrink-0"
                    style={{ width: 16, height: 16, strokeWidth: active ? 2.2 : 1.7 }}
                  />
                  {!collapsed && (
                    <span className={`text-[13px] truncate flex-1 ${active ? 'font-medium text-stone-800' : 'text-stone-500'}`}>
                      {item.label}
                    </span>
                  )}
                  {/* Subtle activity dot — monochrome */}
                  {item.badge && !active && (
                    <div className={`w-[5px] h-[5px] rounded-full bg-stone-700 flex-shrink-0 ${
                      collapsed ? 'absolute top-1.5 right-1.5' : ''
                    }`} />
                  )}
                </motion.button>
              );
            })}
          </nav>

          {/* ── Portal Links ── */}
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.3 }}
              className="px-3 pb-3"
              style={{ borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: 12 }}
            >
              <p className="text-[10px] font-semibold text-stone-400 tracking-[0.12em] uppercase px-[10px] mb-[6px]">
                Portals
              </p>
              {PORTALS.map((p) => (
                <motion.button
                  key={p.id}
                  onClick={() => setView(p.id)}
                  className="w-full flex items-center justify-between px-[10px] py-[7px] rounded-[10px] group transition-all"
                  style={{ color: '#78716c' }}
                  whileHover={{ backgroundColor: 'rgba(28,25,23,0.05)', x: 1 }}
                  whileTap={{ scale: 0.97 }}
                  transition={springSnap}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-[6px] h-[6px] rounded-full flex-shrink-0" style={{ background: p.color }} />
                    <span className="text-[12px] text-stone-600 group-hover:text-stone-800 transition-colors">{p.label}</span>
                  </div>
                  <ArrowUpRight className="w-3 h-3 text-stone-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.button>
              ))}
            </motion.div>
          )}

          {/* ── Collapse toggle ── */}
          <div className="px-3 py-2" style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="w-full flex items-center justify-center py-[8px] rounded-[10px] text-stone-400 hover:text-stone-600 transition-all press-effect"
              style={{ background: 'transparent' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(28,25,23,0.05)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              {collapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>
          </div>
        </motion.aside>
      )}

      {/* ═══════════════════════════════════════
          MAIN CONTENT AREA
      ═══════════════════════════════════════ */}
      <div
        className="flex-1 flex flex-col"
        style={{ marginLeft: view === 'internal' ? sw : 0, transition: 'margin-left 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}
      >

        {/* ── Top Bar — Apple glass (lighter) ── */}
        <motion.header
          initial={{ y: -4, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="sticky top-0 z-20 h-[56px] flex items-center justify-between px-6"
          style={{
            background: 'rgba(238,237,233,0.88)',
            backdropFilter: 'blur(44px) saturate(180%)',
            WebkitBackdropFilter: 'blur(44px) saturate(180%)',
            borderBottom: '1px solid rgba(0,0,0,0.06)',
            boxShadow: '0 1px 0 rgba(255,255,255,0.6)',
          }}
        >
          {/* Breadcrumb / title */}
          <div className="flex items-center gap-2 text-[13px]">
            <button
              onClick={home}
              className="text-stone-400 hover:text-stone-700 transition-colors font-medium"
            >
              {view === 'internal' ? 'Hub' : view.replace('-', ' ').replace('portal', 'Portal')}
            </button>
            {view === 'internal' && mod !== 'dashboard' && (
              <AnimatePresence mode="wait">
                <motion.span
                  key={mod}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 6 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-2"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-stone-300" />
                  <span className="text-stone-800 font-semibold capitalize tracking-[-0.01em]">{mod}</span>
                </motion.span>
              </AnimatePresence>
            )}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative hidden md:flex items-center">
              <Search className="absolute left-2.5 w-3.5 h-3.5 text-stone-400 pointer-events-none" />
              <input
                placeholder="Search…"
                className="w-48 pl-8 pr-3 py-[6px] text-[13px] rounded-[10px] transition-all focus:outline-none focus:w-56"
                style={{
                  background: 'rgba(120,113,108,0.08)',
                  border: '1px solid rgba(0,0,0,0.06)',
                  color: '#1c1917',
                }}
                onFocus={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.85)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(28,25,23,0.06)'; }}
                onBlur={(e)  => { e.currentTarget.style.background = 'rgba(120,113,108,0.08)'; e.currentTarget.style.boxShadow = 'none'; }}
              />
              <kbd className="hidden lg:flex absolute right-2.5 items-center gap-0.5 text-[9px] text-stone-400 bg-white/60 border border-stone-200/60 rounded px-1 py-0.5 font-medium pointer-events-none">
                <Command className="w-2.5 h-2.5" />K
              </kbd>
            </div>

            {/* New button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-1.5 px-3 py-[6px] text-[13px] font-medium rounded-[10px] transition-colors"
              style={{ background: 'rgba(28,25,23,0.08)', color: '#1c1917', border: '1px solid rgba(0,0,0,0.07)' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(28,25,23,0.12)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(28,25,23,0.08)')}
            >
              <Plus className="w-3.5 h-3.5" />
              New
            </motion.button>

            {/* Notifications */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-[7px] rounded-[10px] text-stone-500 transition-colors"
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(28,25,23,0.07)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-[7px] right-[7px] w-[6px] h-[6px] bg-amber-500 rounded-full" />
            </motion.button>

            {/* Avatar */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer"
              style={{
                background: 'linear-gradient(145deg, #44403c, #1c1917)',
                boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
              }}
            >
              <span className="text-[10px] font-semibold text-white">JD</span>
            </motion.div>
          </div>
        </motion.header>

        {/* ── Page Content ── */}
        <main className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={view === 'internal' ? mod : view}
              {...pageTransition}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
    </MotionConfig>
  );
}
