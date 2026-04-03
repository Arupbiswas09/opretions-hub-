'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, MotionConfig } from 'motion/react';
import {
  Home,
  Briefcase,
  Users,
  Building2,
  FolderKanban,
  UserPlus,
  DollarSign,
  Headphones,
  Settings,
  Search,
  Bell,
  Plus,
  ChevronRight,
  ClipboardList,
  PanelLeftClose,
  PanelLeft,
  Command,
  ArrowUpRight,
  LogOut,
  User,
  Sun,
  Moon,
} from 'lucide-react';
import { pageTransition } from '../lib/motion';
import { HUB_MODULES, type HubModule } from '../lib/hub-modules';
import { NotificationDrawer } from './bonsai/NotificationDrawer';
import { useTheme } from '../lib/theme';

export { HUB_MODULES, type HubModule };

const MODULE_DEFAULT_HREF: Record<HubModule, string> = {
  dashboard: '/hub/dashboard',
  sales: '/hub/sales/overview',
  contacts: '/hub/contacts',
  clients: '/hub/clients',
  projects: '/hub/projects/list',
  talent: '/hub/talent/overview',
  people: '/hub/people/directory',
  finance: '/hub/finance/overview',
  support: '/hub/support',
  forms: '/hub/forms',
  admin: '/hub/admin',
};

const SUB_ROUTE_LABEL: Record<string, string> = {
  overview: 'Overview',
  deals: 'Deals',
  pipeline: 'Pipeline',
  list: 'Projects',
  timesheets: 'Timesheets',
  approvals: 'Approvals',
  directory: 'Directory',
  invoices: 'Invoices',
  expenses: 'Expenses',
  jobs: 'Jobs',
  candidates: 'Candidates',
  referrals: 'Referrals',
};

const NAV: { id: HubModule; label: string; icon: React.ElementType; badge?: number }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'sales',     label: 'Sales',     icon: Briefcase,    badge: 5 },
  { id: 'contacts',  label: 'Contacts',  icon: Users },
  { id: 'clients',   label: 'Clients',   icon: Building2 },
  { id: 'projects',  label: 'Projects',  icon: FolderKanban, badge: 3 },
  { id: 'talent',    label: 'Talent',    icon: UserPlus },
  { id: 'people',    label: 'People',    icon: Users,        badge: 2 },
  { id: 'finance',   label: 'Finance',   icon: DollarSign,   badge: 1 },
  { id: 'support',   label: 'Support',   icon: Headphones },
  { id: 'forms',     label: 'Forms',     icon: ClipboardList },
  { id: 'admin',     label: 'Admin',     icon: Settings },
];

const PORTALS = [
  { id: 'client'     as const, label: 'Client',     color: '#57534e', href: '/hub/portals/client' },
  { id: 'employee'   as const, label: 'Employee',   color: '#78716c', href: '/hub/portals/employee' },
  { id: 'freelancer' as const, label: 'Freelancer', color: '#a8a29e', href: '/hub/portals/freelancer' },
] as const;

function moduleFromPath(pathname: string): HubModule | null {
  const m = pathname.replace(/^\/hub\/?/, '').split('/')[0];
  if (!m || m === 'portals') return null;
  return (HUB_MODULES as readonly string[]).includes(m) ? (m as HubModule) : null;
}

function portalLabelFromPath(pathname: string): string | null {
  if (!pathname.startsWith('/hub/portals')) return null;
  const seg = pathname.split('/')[3];
  if (!seg) return 'Portal';
  if (seg === 'hris') return 'HRIS Admin Portal';
  return `${seg.charAt(0).toUpperCase() + seg.slice(1)} Portal`;
}

export default function HubShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isPortalView = pathname.startsWith('/hub/portals');
  const mod = moduleFromPath(pathname);
  const sw = collapsed ? 64 : 240;
  const homeHref = '/hub/dashboard';

  return (
    <MotionConfig reducedMotion="user" transition={{ type: 'spring', stiffness: 400, damping: 30 }}>
      <div className="min-h-screen flex">

        {/* ── Sidebar ── */}
        {!isPortalView && (
          <motion.aside
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28, delay: 0.05 }}
            className="fixed inset-y-0 left-0 z-30 flex flex-col"
            style={{
              width: sw,
              transition: 'width 0.28s cubic-bezier(0.25,0.46,0.45,0.94)',
              background: 'var(--sidebar-glass)',
              backdropFilter: 'blur(44px) saturate(180%)',
              WebkitBackdropFilter: 'blur(44px) saturate(180%)',
              borderRight: '1px solid var(--sidebar-divider)',
              boxShadow: '4px 0 24px rgba(0,0,0,0.06)',
            }}
          >
            {/* Right-edge shimmer */}
            <div
              className="absolute top-0 right-0 bottom-0 w-px pointer-events-none"
              style={{ background: 'linear-gradient(180deg, var(--sidebar-edge) 0%, rgba(255,255,255,0.2) 50%, transparent 100%)' }}
            />

            {/* Logo */}
            <div
              className="h-[56px] flex items-center px-4"
              style={{ borderBottom: '1px solid var(--sidebar-divider)' }}
            >
              <Link href={homeHref} className="flex items-center gap-2.5 min-w-0 group press-effect w-full">
                <div className="w-[30px] h-[30px] flex-shrink-0 relative">
                  <div
                    className="absolute inset-0 rounded-full group-hover:scale-105 transition-transform duration-200"
                    style={{
                      background: 'linear-gradient(145deg, #3c3937 0%, #2c2928 100%)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.12)',
                    }}
                  />
                  <div className="absolute top-[3px] left-[3px] w-[24px] h-[24px] rounded-full border border-white/15" />
                  {/* Logomark: stylised "O" ring — a proper geometric shape, not a text character */}
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="w-[14px] h-[14px] rounded-full border-[2px] border-white/70" />
                  </div>
                  <div className="absolute bottom-[3px] right-[3px] w-[4px] h-[4px] rounded-full bg-amber-400/80" />
                </div>
                {!collapsed && (
                  <div className="flex flex-col min-w-0 leading-none">
                    <span className="text-[13px] font-semibold tracking-[-0.02em] text-stone-800 dark:text-stone-100">
                      Operations
                    </span>
                    <span className="text-[9px] font-semibold tracking-[0.10em] uppercase mt-[1px] text-stone-400 dark:text-stone-500">
                      Hub
                    </span>
                  </div>
                )}
              </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-2 py-3 space-y-[2px] overflow-y-auto">
              {NAV.map((item, i) => {
                const Icon = item.icon;
                const href = MODULE_DEFAULT_HREF[item.id];
                const active =
                  pathname === `/hub/${item.id}` ||
                  pathname.startsWith(`/hub/${item.id}/`);

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.035, type: 'spring', stiffness: 350, damping: 30 }}
                  >
                    <Link
                      href={href}
                      className={`relative w-full flex items-center rounded-[10px] transition-colors ${
                        collapsed ? 'justify-center px-0 py-[10px]' : 'px-[10px] py-[8px] gap-[10px]'
                      }`}
                      style={{
                        background: active ? 'var(--nav-active-bg)' : 'transparent',
                        color: active ? 'var(--nav-active-color)' : 'var(--nav-inactive-color)',
                        ...(active
                          ? {
                              backdropFilter: 'blur(24px) saturate(160%)',
                              WebkitBackdropFilter: 'blur(24px) saturate(160%)',
                              boxShadow: 'inset 0 1px 0 var(--nav-active-inset)',
                            }
                          : {}),
                      }}
                    >
                      {active && (
                        <motion.div
                          layoutId="nav-indicator"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[18px] rounded-full"
                          style={{ background: 'var(--nav-indicator)' }}
                          transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                        />
                      )}
                      <Icon
                        className="flex-shrink-0"
                        style={{ width: 16, height: 16, strokeWidth: active ? 2.2 : 1.7 }}
                      />
                      {!collapsed && (
                        <span
                          className={`text-[13px] truncate flex-1 ${
                            active
                              ? 'font-medium text-stone-800 dark:text-stone-100'
                              : 'text-stone-500 dark:text-stone-500'
                          }`}
                        >
                          {item.label}
                        </span>
                      )}
                      {item.badge && !active && (
                        <div
                          className={`w-[5px] h-[5px] rounded-full flex-shrink-0 ${
                            collapsed ? 'absolute top-1.5 right-1.5' : ''
                          }`}
                          style={{ background: 'var(--nav-badge)' }}
                        />
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            {/* Portals section */}
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.3 }}
                className="px-3 pb-3"
                style={{ borderTop: '1px solid var(--sidebar-divider)', paddingTop: 12 }}
              >
                <p className="text-[10px] font-semibold tracking-[0.12em] uppercase px-[10px] mb-[6px] text-stone-400 dark:text-stone-500">
                  Portals
                </p>
                {PORTALS.map((p) => (
                  <motion.div key={p.id} whileHover={{ x: 1 }} whileTap={{ scale: 0.97 }}>
                    <Link
                      href={p.href}
                      className="w-full flex items-center justify-between px-[10px] py-[7px] rounded-[10px] group transition-all hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-[6px] h-[6px] rounded-full flex-shrink-0" style={{ background: p.color }} />
                        <span className="text-[12px] text-stone-500 dark:text-stone-400 group-hover:text-stone-800 dark:group-hover:text-stone-100 transition-colors">
                          {p.label}
                        </span>
                      </div>
                      <ArrowUpRight className="w-3 h-3 text-stone-300 dark:text-stone-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </motion.div>
                ))}
                <motion.div whileHover={{ x: 1 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    href="/hub/portals/hris"
                    className="w-full flex items-center justify-between px-[10px] py-[7px] rounded-[10px] group transition-all mt-0.5 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-[6px] h-[6px] rounded-full flex-shrink-0" style={{ background: '#78716c' }} />
                      <span className="text-[12px] text-stone-500 dark:text-stone-400 group-hover:text-stone-800 dark:group-hover:text-stone-100 transition-colors">
                        HRIS Admin
                      </span>
                    </div>
                    <ArrowUpRight className="w-3 h-3 text-stone-300 dark:text-stone-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </motion.div>
              </motion.div>
            )}

            {/* Collapse toggle */}
            <div className="px-3 py-2" style={{ borderTop: '1px solid var(--sidebar-divider)' }}>
              <button
                type="button"
                onClick={() => setCollapsed(!collapsed)}
                className="w-full flex items-center justify-center py-[8px] rounded-[10px] transition-all press-effect text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-black/[0.05] dark:hover:bg-white/[0.06]"
              >
                {collapsed
                  ? <PanelLeft className="w-4 h-4" />
                  : <PanelLeftClose className="w-4 h-4" />
                }
              </button>
            </div>
          </motion.aside>
        )}

        {/* ── Main content ── */}
        <div
          className="flex-1 flex flex-col"
          style={{
            marginLeft: !isPortalView ? sw : 0,
            transition: 'margin-left 0.28s cubic-bezier(0.25,0.46,0.45,0.94)',
          }}
        >
          {/* ── Topbar ── */}
          <motion.header
            initial={{ y: -4, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="sticky top-0 z-20 h-[56px] flex items-center justify-between px-6"
            style={{
              background: 'var(--topbar-bg)',
              backdropFilter: 'blur(44px) saturate(180%)',
              WebkitBackdropFilter: 'blur(44px) saturate(180%)',
              borderBottom: '1px solid var(--topbar-border)',
              boxShadow: 'var(--topbar-shadow)',
            }}
          >
            {/* Breadcrumb */}
            {(() => {
              const segments = pathname.split('/').filter(Boolean);
              const subSeg = segments[2];
              const subLabel = subSeg ? SUB_ROUTE_LABEL[subSeg] : null;
              const modLabel = mod ? (mod.charAt(0).toUpperCase() + mod.slice(1)) : null;
              return (
                <div className="flex items-center gap-2 text-[13px]">
                  <Link
                    href={homeHref}
                    className="font-medium text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
                  >
                    {isPortalView ? (portalLabelFromPath(pathname) ?? 'Portal') : 'Hub'}
                  </Link>

                  {!isPortalView && modLabel && mod !== 'dashboard' && (
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={mod}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 6 }}
                        transition={{ duration: 0.15 }}
                        className="flex items-center gap-2"
                      >
                        <ChevronRight className="w-3.5 h-3.5 text-stone-300 dark:text-stone-600" />
                        <Link
                          href={MODULE_DEFAULT_HREF[mod]}
                          className={`tracking-[-0.01em] transition-colors ${
                            subLabel
                              ? 'font-medium text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-200'
                              : 'font-semibold text-stone-800 dark:text-stone-100'
                          }`}
                        >
                          {modLabel}
                        </Link>
                      </motion.span>
                    </AnimatePresence>
                  )}

                  {!isPortalView && subLabel && (
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={subSeg}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 6 }}
                        transition={{ duration: 0.15 }}
                        className="flex items-center gap-2"
                      >
                        <ChevronRight className="w-3.5 h-3.5 text-stone-300 dark:text-stone-600" />
                        <span className="font-semibold tracking-[-0.01em] text-stone-800 dark:text-stone-100">
                          {subLabel}
                        </span>
                      </motion.span>
                    </AnimatePresence>
                  )}
                </div>
              );
            })()}

            {/* Right side controls */}
            <div className="flex items-center gap-2">

              {/* Search */}
              <div className="relative hidden md:flex items-center">
                <Search className="absolute left-2.5 w-3.5 h-3.5 text-stone-400 pointer-events-none" />
                <input
                  placeholder="Search…"
                  className="w-48 pl-8 pr-3 py-[6px] text-[13px] rounded-[10px] transition-all focus:outline-none focus:w-56"
                  style={{
                    background: 'var(--search-bg)',
                    border: '1px solid var(--search-border)',
                    color: 'var(--search-color)',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.background = 'var(--search-focus-bg)';
                    e.currentTarget.style.boxShadow = 'var(--search-focus-shadow)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.background = 'var(--search-bg)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
                <kbd className="hidden lg:flex absolute right-2.5 items-center gap-0.5 text-[9px] text-stone-400 bg-white/60 dark:bg-white/[0.06] border border-stone-200/60 dark:border-white/10 rounded px-1 py-0.5 font-medium pointer-events-none">
                  <Command className="w-2.5 h-2.5" />K
                </kbd>
              </div>

              {/* New button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                className="flex items-center gap-1.5 px-3 py-[6px] text-[13px] font-medium rounded-[10px] transition-colors"
                style={{
                  background: 'var(--new-btn-bg)',
                  color: 'var(--new-btn-color)',
                  border: '1px solid var(--new-btn-border)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--new-btn-bg-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--new-btn-bg)')}
              >
                <Plus className="w-3.5 h-3.5" />
                New
              </motion.button>

              {/* Theme toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={toggleTheme}
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                className="relative p-[7px] rounded-[10px] transition-colors"
                style={{
                  background: 'var(--toggle-bg)',
                  border: '1px solid var(--toggle-border)',
                  color: 'var(--toggle-color)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--toggle-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--toggle-bg)')}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {isDark ? (
                    <motion.span
                      key="sun"
                      initial={{ opacity: 0, rotate: -90, scale: 0.8 }}
                      animate={{ opacity: 1, rotate: 0, scale: 1 }}
                      exit={{ opacity: 0, rotate: 90, scale: 0.8 }}
                      transition={{ duration: 0.18 }}
                      className="block"
                    >
                      <Sun className="w-4 h-4" />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="moon"
                      initial={{ opacity: 0, rotate: 90, scale: 0.8 }}
                      animate={{ opacity: 1, rotate: 0, scale: 1 }}
                      exit={{ opacity: 0, rotate: -90, scale: 0.8 }}
                      transition={{ duration: 0.18 }}
                      className="block"
                    >
                      <Moon className="w-4 h-4" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Notification bell */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => setNotifOpen(true)}
                className="relative p-[7px] rounded-[10px] text-stone-500 dark:text-stone-400 transition-colors hover:bg-black/[0.05] dark:hover:bg-white/[0.07]"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-[7px] right-[7px] w-[6px] h-[6px] bg-red-500 rounded-full" />
              </motion.button>

              {/* User avatar + dropdown */}
              <div className="relative" ref={userMenuRef}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer relative"
                  style={{
                    background: 'linear-gradient(145deg, #44403c, #1c1917)',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
                  }}
                >
                  <span className="text-[10px] font-semibold text-white">JD</span>
                  <span className="absolute -bottom-0.5 -right-0.5 w-[10px] h-[10px] bg-emerald-500 border-2 border-white dark:border-stone-900 rounded-full" />
                </motion.button>

                {/* User dropdown */}
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.97, y: 4 }}
                      transition={{ type: 'spring', damping: 28, stiffness: 380 }}
                      className="absolute right-0 top-full mt-2 w-56 rounded-xl overflow-hidden z-50"
                      style={{
                        background: 'var(--user-menu-bg)',
                        backdropFilter: 'blur(48px) saturate(200%)',
                        WebkitBackdropFilter: 'blur(48px) saturate(200%)',
                        boxShadow: 'var(--user-menu-shadow)',
                        border: '1px solid var(--user-menu-border)',
                      }}
                    >
                      <div
                        className="absolute top-0 left-0 right-0 h-px"
                        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)' }}
                      />
                      <div className="px-4 py-3 border-b border-stone-200/30 dark:border-white/[0.07]">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center"
                            style={{ background: 'linear-gradient(145deg, #44403c, #1c1917)' }}
                          >
                            <span className="text-[11px] font-bold text-white">JD</span>
                          </div>
                          <div>
                            <p className="text-[13px] font-semibold text-stone-800 dark:text-stone-100">John Doe</p>
                            <p className="text-[11px] text-stone-500 dark:text-stone-400">john.doe@company.com</p>
                          </div>
                        </div>
                      </div>
                      <div className="py-1">
                        {[
                          { label: 'My Profile', icon: User,     href: '/hub/people' },
                          { label: 'Settings',   icon: Settings, href: '/hub/admin' },
                        ].map(item => (
                          <Link
                            key={item.label}
                            href={item.href}
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-stone-600 dark:text-stone-300 transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                          >
                            <item.icon className="w-4 h-4 text-stone-400 dark:text-stone-500" />
                            {item.label}
                          </Link>
                        ))}
                      </div>
                      <div className="border-t border-stone-200/30 dark:border-white/[0.07] py-1">
                        <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-stone-500 dark:text-stone-400 hover:text-red-500 hover:bg-red-50/40 dark:hover:bg-red-900/20 transition-colors">
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.header>

          {/* Page content */}
          <main className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div key={pathname} {...pageTransition}>
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>

        <NotificationDrawer open={notifOpen} onClose={() => setNotifOpen(false)} />
      </div>
    </MotionConfig>
  );
}
