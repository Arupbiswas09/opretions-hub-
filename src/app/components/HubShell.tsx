'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { showPersonaSimulator } from '../lib/UserRoleContext';
import { motion, AnimatePresence, MotionConfig } from 'motion/react';
import {
  Settings, Bell, Plus, Play,
  ChevronRight, ChevronDown, PanelLeftClose, PanelLeft,
  LogOut, User, Sun, Moon, MoreHorizontal, MoreVertical, Globe, Users, Menu,
} from 'lucide-react';
import { pageTransition } from '../lib/motion';
import { HUB_MODULES, type HubModule } from '../lib/hub-modules';
import {
  HUB_SIDEBAR_TOP,
  HUB_SIDEBAR_WORKSPACE,
  HUB_SIDEBAR_PRODUCTIVITY,
  HUB_SIDEBAR_BOTTOM,
  isSidebarLinkActive,
  type HubSidebarItem,
} from '../lib/hub-sidebar-config';
import { HUB_EVENTS } from '../lib/hub-events';
import { NotificationDrawer } from './bonsai/NotificationDrawer';
import { useTheme } from '../lib/theme';
import { useUserRole, PERSONAS, type UserPersona } from '../lib/UserRoleContext';
import { useMediaQuery } from '../lib/use-media-query';
import { prefetchCommunicationData } from '../lib/communication-prefetch';
import {
  CreateClientDrawer, CreateDealDrawer, CreateProjectDrawer,
  CreateInvoiceDrawer, CreateTimeEntryDrawer, CreateProposalDrawer,
  CreateContractDrawer, CreateExpenseDrawer, CreateContactDrawer,
  CreateTaskDrawer, CreateFormDrawer,
} from './ui/QuickCreateDrawers';
import { SettingsDrawer } from './ui/DetailPanels';
import { GlobalSearchBar } from './hub/GlobalSearchBar';
import { cn } from './ui/utils';

export { HUB_MODULES, type HubModule };

const MODULE_DEFAULT_HREF: Record<HubModule, string> = {
  dashboard: '/hub/dashboard',
  communication: '/hub/communication',
  work: '/hub/work',
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
  meetings: '/hub/meetings',
  proposals: '/hub/proposals',
  contracts: '/hub/contracts',
  timetracking: '/hub/timetracking',
};

const SUB_ROUTE_LABEL: Record<string, string> = {
  overview: 'Overview', deals: 'Deals', pipeline: 'Pipeline',
  list: 'Projects', timesheets: 'Timesheets', approvals: 'Approvals',
  directory: 'Directory', invoices: 'Invoices', expenses: 'Expenses',
  jobs: 'Jobs', candidates: 'Candidates', referrals: 'Referrals',
  meetings: 'Meetings', proposals: 'Proposals', contracts: 'Contracts',
  timetracking: 'Time Tracking',
};

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

/* ── Sidebar row: link or action (e.g. notifications panel) ── */
function NavRow({
  label, icon: Icon, href, onClick, active, collapsed, onNavigate,
}: {
  label: string;
  icon: React.ElementType;
  href?: string;
  onClick?: () => void;
  active: boolean;
  collapsed: boolean;
  /** Called after following a sidebar link (e.g. close mobile drawer). */
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const className = `group relative flex items-center rounded-lg transition-all duration-200 w-full text-left ${
    collapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-[7px] gap-2.5'
  }`;
  const style: React.CSSProperties = {
    background: active ? 'var(--nav-active-bg)' : 'transparent',
    color: active ? 'var(--nav-active-color)' : 'var(--sidebar-foreground)',
    ...(active
      ? {
          backdropFilter: 'blur(24px) saturate(160%)',
          WebkitBackdropFilter: 'blur(24px) saturate(160%)',
          boxShadow: 'inset 0 1px 0 var(--nav-active-inset)',
        }
      : {}),
  };
  const body = (
    <>
      {active && !collapsed && (
        <span
          className="absolute left-0 top-[6px] bottom-[6px] w-[3px] rounded-r-full"
          style={{ background: 'var(--nav-indicator)' }}
        />
      )}
      <Icon
        className="flex-shrink-0 transition-transform duration-200 group-hover:scale-105"
        style={{ width: 16, height: 16, strokeWidth: active ? 2.1 : 1.7 }}
      />
      {!collapsed && (
        <span className={`text-[13px] truncate ${active ? 'font-medium' : ''}`}>{label}</span>
      )}
    </>
  );
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className} style={style}>
        {body}
      </button>
    );
  }
  return (
    <Link
      href={href!}
      prefetch
      className={className}
      style={style}
      onMouseEnter={() => {
        if (href) router.prefetch(href);
        if (href === '/hub/communication') void prefetchCommunicationData();
      }}
      onFocus={() => {
        if (href) router.prefetch(href);
        if (href === '/hub/communication') void prefetchCommunicationData();
      }}
      onClick={() => onNavigate?.()}
    >
      {body}
    </Link>
  );
}

function renderSidebarItem(
  item: HubSidebarItem,
  pathname: string,
  collapsed: boolean,
  notifOpen: boolean,
  onOpenNotif: () => void,
  onAfterNav?: () => void,
) {
  if (item.kind === 'notifications') {
    return (
      <NavRow
        key={item.label}
        label={item.label}
        icon={item.icon}
        onClick={() => {
          onOpenNotif();
          onAfterNav?.();
        }}
        active={notifOpen}
        collapsed={collapsed}
      />
    );
  }
  const active = isSidebarLinkActive(pathname, item.href);
  return (
    <NavRow
      key={item.label}
      label={item.label}
      icon={item.icon}
      href={item.href}
      active={active}
      collapsed={collapsed}
      onNavigate={onAfterNav}
    />
  );
}

/* ── Section header ── */
function SectionHeader({ label, collapsed }: { label: string; collapsed: boolean }) {
  if (collapsed) return <div className="h-3" />;
  return (
    <p className="text-[10px] font-medium tracking-[0.06em] uppercase px-3 pt-4 pb-1"
      style={{ color: 'var(--muted-foreground)' }}>
      {label}
    </p>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HUB SHELL — Bonsai-inspired: clean sidebar, minimal topbar
═══════════════════════════════════════════════════════════════ */
export default function HubShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [switchUserOpen, setSwitchUserOpen] = useState(false);
  /* Quick-create drawer state — which type is open */
  const [activeDrawer, setActiveDrawer] = useState<string | null>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const quickAddRef = useRef<HTMLDivElement>(null);
  const portalMenuRef = useRef<HTMLDivElement>(null);
  const switchUserRef = useRef<HTMLDivElement>(null);
  const mobileMoreRef = useRef<HTMLDivElement>(null);
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  const [portalMenuOpen, setPortalMenuOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const { persona, setPersona } = useUserRole();
  const router = useRouter();
  const isLg = useMediaQuery('(min-width: 1024px)');
  const closeMobileNav = () => setMobileNavOpen(false);

  const canSection = (section: 'top' | 'workspace' | 'productivity' | 'bottom') =>
    persona.accessGroups.includes(section);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  const openDrawer = (type: string) => {
    setQuickAddOpen(false);
    setActiveDrawer(type);
  };
  const closeDrawer = () => setActiveDrawer(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (quickAddRef.current && !quickAddRef.current.contains(e.target as Node)) {
        setQuickAddOpen(false);
      }
      if (portalMenuRef.current && !portalMenuRef.current.contains(e.target as Node)) {
        setPortalMenuOpen(false);
      }
      if (switchUserRef.current && !switchUserRef.current.contains(e.target as Node)) {
        setSwitchUserOpen(false);
      }
      if (mobileMoreRef.current && !mobileMoreRef.current.contains(e.target as Node)) {
        setMobileMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const onQuickCreate = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      if (typeof detail !== 'string' || !detail) return;
      setQuickAddOpen(false);
      setActiveDrawer(detail);
    };
    window.addEventListener(HUB_EVENTS.QUICK_CREATE, onQuickCreate);
    return () => window.removeEventListener(HUB_EVENTS.QUICK_CREATE, onQuickCreate);
  }, []);

  const isPortalView = pathname.startsWith('/hub/portals');
  /** Deep portal routes (/hub/portals/client, …) need a fixed-height shell so the portal rail stays put while only the main column scrolls. */
  const isPortalWorkspace = pathname.startsWith('/hub/portals/');
  const mod = moduleFromPath(pathname);
  const sw = collapsed ? 56 : 220;
  const homeHref = '/hub/dashboard';
  const pathSegs = pathname.split('/').filter(Boolean);
  const isDeepPortalRoute = pathSegs[0] === 'hub' && pathSegs[1] === 'portals' && pathSegs.length >= 3;

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex h-[100dvh] min-h-0 min-w-0 overflow-hidden">

        {/* Mobile sidebar backdrop */}
        {!isPortalView && !isLg && mobileNavOpen && (
          <button
            type="button"
            aria-label="Close navigation"
            className="fixed inset-0 z-30 bg-black/50 backdrop-blur-[1px] lg:hidden"
            onClick={closeMobileNav}
          />
        )}

        {/* ── Sidebar ── */}
        {!isPortalView && (
          <aside
            className={cn(
              'flex flex-col flex-shrink-0',
              'max-lg:fixed max-lg:inset-y-0 max-lg:left-0 max-lg:z-40',
              'max-lg:transition-transform max-lg:duration-200 max-lg:ease-out',
              !isLg && !mobileNavOpen && 'max-lg:-translate-x-full',
              'lg:static lg:translate-x-0',
            )}
            style={{
              width: sw,
              minWidth: sw,
              maxWidth: sw,
              transition: 'width 0.2s ease, min-width 0.2s ease, max-width 0.2s ease',
              background: 'var(--sidebar-glass)',
              borderRight: '1px solid var(--sidebar-divider)',
            }}
          >
            {/* Logo / workspace name */}
            <div className="h-[52px] min-h-[52px] flex items-center px-3"
              style={{ borderBottom: '1px solid var(--sidebar-divider)' }}>
              <Link href={homeHref} onClick={closeMobileNav} className="flex items-center gap-2 min-w-0 w-full">
                <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
                  style={{
                    background: '#2563EB',
                  }}>
                  <span className="text-[10px] font-bold text-white">OH</span>
                </div>
                {!collapsed && (
                  <div className="flex items-center gap-1 min-w-0">
                    <span className="text-[13px] font-semibold truncate"
                      style={{ color: 'var(--foreground)' }}>
                      Operations Hub
                    </span>
                  </div>
                )}
              </Link>
            </div>

            {/* Navigation — sections respect simulated persona */}
            <nav className="flex-1 px-2 py-1 overflow-y-auto space-y-[1px]">
              {canSection('top') && HUB_SIDEBAR_TOP.map(item =>
                renderSidebarItem(item, pathname, collapsed, notifOpen, () => setNotifOpen(true), closeMobileNav),
              )}

              {canSection('workspace') && (
                <>
                  <SectionHeader label="Workspace" collapsed={collapsed} />
                  {HUB_SIDEBAR_WORKSPACE.map(item =>
                    renderSidebarItem(item, pathname, collapsed, notifOpen, () => setNotifOpen(true), closeMobileNav),
                  )}
                </>
              )}

              {canSection('productivity') && (
                <>
                  <SectionHeader label="Productivity" collapsed={collapsed} />
                  {HUB_SIDEBAR_PRODUCTIVITY.map(item =>
                    renderSidebarItem(item, pathname, collapsed, notifOpen, () => setNotifOpen(true), closeMobileNav),
                  )}
                </>
              )}

              {canSection('workspace') && !collapsed && (
                <Link
                  href="/hub/admin"
                  onClick={closeMobileNav}
                  className="flex items-center gap-2.5 px-3 py-[7px] rounded-lg w-full transition-colors hover:bg-white/[0.04]"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  <MoreHorizontal className="w-4 h-4" />
                  <span className="text-[13px]">More</span>
                </Link>
              )}

              {canSection('bottom') && (
                <div style={{ borderTop: '1px solid var(--sidebar-divider)', marginTop: 8, paddingTop: 8 }}>
                  {HUB_SIDEBAR_BOTTOM.map(item =>
                    renderSidebarItem(item, pathname, collapsed, notifOpen, () => setNotifOpen(true), closeMobileNav),
                  )}
                </div>
              )}
            </nav>

            {/* Collapse */}
            <div className="px-3 py-2" style={{ borderTop: '1px solid var(--sidebar-divider)' }}>
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="w-full flex items-center justify-center py-2 rounded-lg transition-colors"
                style={{ color: 'var(--muted-foreground)' }}
              >
                {collapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
              </button>
            </div>
          </aside>
        )}

        {/* ── Main ── */}
        <div
          className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
        >

          {/* ── Topbar — Bonsai style: breadcrumb left, actions right ── */}
          <header
            className="sticky top-0 z-20 flex h-[52px] min-h-[52px] min-w-0 items-center gap-2 px-2 sm:gap-3 sm:px-4"
            style={{
              background: 'var(--topbar-bg)',
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
              borderBottom: '1px solid var(--topbar-border)',
            }}
          >
            {/* Breadcrumb + mobile menu */}
            {(() => {
              const segments = pathname.split('/').filter(Boolean);
              const subSeg = segments[2];
              const subLabel = subSeg ? SUB_ROUTE_LABEL[subSeg] : null;
              const modLabel = mod ? (mod.charAt(0).toUpperCase() + mod.slice(1)) : null;
              return (
                <div className="flex min-w-0 max-w-[min(100%,14rem)] flex-shrink-0 items-center gap-1.5 sm:max-w-[min(100%,18rem)] sm:gap-2 text-[12px] sm:text-[13px] md:max-w-[min(100%,22rem)]">
                  {!isPortalView && !isLg && (
                    <button
                      type="button"
                      className="hub-touch-target shrink-0 rounded-lg text-muted-foreground hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                      aria-label="Open navigation"
                      onClick={() => setMobileNavOpen(true)}
                    >
                      <Menu className="h-5 w-5" strokeWidth={1.75} />
                    </button>
                  )}
                  <div className="flex min-w-0 items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                  <Link href={homeHref} className="font-medium shrink-0"
                    style={{ color: 'var(--muted-foreground)' }}>
                    {isPortalView ? (portalLabelFromPath(pathname) ?? 'Portal') : 'Home'}
                  </Link>
                  {!isPortalView && modLabel && mod !== 'dashboard' && (
                    <>
                      <ChevronRight className="w-3 h-3 shrink-0" style={{ color: 'var(--muted-foreground)' }} />
                      <Link href={MODULE_DEFAULT_HREF[mod]}
                        className="font-medium truncate"
                        style={{ color: subLabel ? 'var(--muted-foreground)' : 'var(--foreground)' }}>
                        {modLabel}
                      </Link>
                    </>
                  )}
                  {!isPortalView && subLabel && (
                    <>
                      <ChevronRight className="w-3 h-3 shrink-0" style={{ color: 'var(--muted-foreground)' }} />
                      <span className="font-semibold truncate" style={{ color: 'var(--foreground)' }}>{subLabel}</span>
                    </>
                  )}
                  </div>
                </div>
              );
            })()}

            {/* Centered hub search (Bonsai-backed, debounced) */}
            {!isPortalView && (
              <div className="min-w-0 flex-1 px-0 sm:px-2">
                <GlobalSearchBar />
              </div>
            )}

            {/* Right actions — Bonsai exact: ▶ + 👤 */}
            <div className="flex min-w-0 shrink-0 items-center gap-0.5 sm:gap-1.5">
              {/* Internal ↔ Portals (doc: view switcher) */}
              {isPortalView ? (
                <Link
                  href="/hub/dashboard"
                  className="text-[12px] font-medium px-2.5 py-1.5 rounded-lg transition-colors hover:bg-white/[0.05]"
                  style={{ color: 'var(--foreground)' }}
                >
                  Operations hub
                </Link>
              ) : (
                <div className="relative" ref={portalMenuRef}>
                  <button
                    type="button"
                    onClick={() => setPortalMenuOpen(o => !o)}
                    className="hub-touch-target flex items-center gap-1 rounded-lg px-1.5 py-1.5 text-[12px] font-medium transition-colors hover:bg-white/[0.05] sm:px-2"
                    style={{ color: 'var(--muted-foreground)' }}
                    title="Open a client, employee, or freelancer portal"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Portals</span>
                    <ChevronDown className="hidden w-3 h-3 opacity-60 sm:inline" />
                  </button>
                  <AnimatePresence>
                    {portalMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.97, y: 4 }}
                        transition={{ duration: 0.12 }}
                        className="absolute right-0 top-full mt-1.5 w-52 rounded-lg overflow-hidden z-50 py-1"
                        style={{
                          background: 'var(--popover)',
                          border: '1px solid var(--border)',
                          boxShadow: 'var(--shadow-lg)',
                        }}
                      >
                        <Link
                          href="/hub/portals"
                          onClick={() => setPortalMenuOpen(false)}
                          className="block px-3 py-2 text-[12px] font-medium transition-colors hover:bg-white/[0.05]"
                          style={{ color: 'var(--foreground)' }}
                        >
                          All portals…
                        </Link>
                        <div style={{ borderTop: '1px solid var(--border-subtle)' }} className="my-1" />
                        {[
                          { href: '/hub/portals/client', label: 'Client portal' },
                          { href: '/hub/portals/employee', label: 'Employee portal' },
                          { href: '/hub/portals/freelancer', label: 'Freelancer portal' },
                          { href: '/hub/portals/hris', label: 'HRIS admin' },
                          { href: '/hub/portals/candidate', label: 'Candidate portal' },
                        ].map(row => (
                          <Link
                            key={row.href}
                            href={row.href}
                            onClick={() => setPortalMenuOpen(false)}
                            className="block px-3 py-2 text-[12px] transition-colors hover:bg-white/[0.05]"
                            style={{ color: 'var(--muted-foreground)' }}
                          >
                            {row.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Tablet/desktop: full toolbar */}
              <div className="hidden items-center gap-0.5 sm:gap-1.5 md:flex">
                {/* Theme toggle */}
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="hub-touch-target rounded-lg transition-colors"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>

                {/* Notifications — same panel as sidebar item */}
                <button
                  type="button"
                  onClick={() => setNotifOpen(true)}
                  className="hub-touch-target relative rounded-lg transition-colors hover:bg-white/[0.05]"
                  title="Notifications"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-500" aria-hidden />
                </button>

                {/* Play — opens quick time entry drawer */}
                <button
                  type="button"
                  onClick={() => openDrawer('time')}
                  className="hub-touch-target rounded-lg transition-colors hover:bg-white/[0.05]"
                  title="Log time"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  <Play className="w-4 h-4" />
                </button>

                {/* Plus — Quick Add dropdown like Bonsai */}
                <div className="relative" ref={quickAddRef}>
                  <button
                    type="button"
                    onClick={() => setQuickAddOpen(!quickAddOpen)}
                    className="hub-touch-target rounded-lg transition-colors"
                    style={{ color: 'var(--muted-foreground)' }}>
                    <Plus className="w-4 h-4" />
                  </button>
                  <AnimatePresence>
                    {quickAddOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.97, y: 4 }}
                        transition={{ duration: 0.12 }}
                        className="absolute right-0 top-full mt-1.5 w-44 rounded-lg overflow-hidden z-50"
                        style={{
                          background: 'var(--popover)',
                          border: '1px solid var(--border)',
                          boxShadow: 'var(--shadow-lg)',
                        }}>
                        <div className="py-1">
                          {[
                            { label: 'Client', type: 'client' },
                            { label: 'Contact', type: 'contact' },
                            { label: 'Deal', type: 'deal' },
                            { label: 'Project', type: 'project' },
                            { label: 'Task', type: 'task' },
                            { label: 'Time Entry', type: 'time' },
                            { label: 'Invoice', type: 'invoice' },
                            { label: 'Proposal', type: 'proposal' },
                            { label: 'Contract', type: 'contract' },
                            { label: 'Form', type: 'form' },
                            { label: 'Expense', type: 'expense' },
                          ].map(item => (
                            <button
                              key={item.label}
                              type="button"
                              onClick={() => openDrawer(item.type)}
                              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-left transition-colors hover:bg-white/[0.05]"
                              style={{ color: 'var(--foreground)' }}>
                              <div className="h-2 w-2 shrink-0 rounded-full bg-primary opacity-80" />
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Phone: overflow menu (theme, alerts, time, create) */}
              <div className="relative md:hidden" ref={mobileMoreRef}>
                  <button
                    type="button"
                    onClick={() => setMobileMoreOpen(o => !o)}
                    className="hub-touch-target rounded-lg transition-colors hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                    style={{ color: 'var(--muted-foreground)' }}
                    aria-label="More actions"
                    aria-expanded={mobileMoreOpen}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  <AnimatePresence>
                    {mobileMoreOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.97, y: 4 }}
                        transition={{ duration: 0.12 }}
                        className="absolute right-0 top-full z-50 mt-1.5 max-h-[min(70vh,420px)] w-[min(18rem,calc(100vw-2rem))] overflow-y-auto rounded-xl py-1"
                        style={{
                          background: 'var(--popover)',
                          border: '1px solid var(--border)',
                          boxShadow: 'var(--shadow-lg)',
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            toggleTheme();
                            setMobileMoreOpen(false);
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[13px] transition-colors hover:bg-white/[0.05]"
                          style={{ color: 'var(--foreground)' }}
                        >
                          {isDark ? <Sun className="w-4 h-4 shrink-0" /> : <Moon className="w-4 h-4 shrink-0" />}
                          {isDark ? 'Light mode' : 'Dark mode'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setNotifOpen(true);
                            setMobileMoreOpen(false);
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[13px] transition-colors hover:bg-white/[0.05]"
                          style={{ color: 'var(--foreground)' }}
                        >
                          <Bell className="w-4 h-4 shrink-0" />
                          Notifications
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            openDrawer('time');
                            setMobileMoreOpen(false);
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[13px] transition-colors hover:bg-white/[0.05]"
                          style={{ color: 'var(--foreground)' }}
                        >
                          <Play className="w-4 h-4 shrink-0" />
                          Log time
                        </button>
                        <div className="my-1" style={{ borderTop: '1px solid var(--border-subtle)' }} />
                        <p className="px-3 pt-1 pb-0.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>
                          Create
                        </p>
                        {[
                          { label: 'Client', type: 'client' },
                          { label: 'Contact', type: 'contact' },
                          { label: 'Deal', type: 'deal' },
                          { label: 'Project', type: 'project' },
                          { label: 'Task', type: 'task' },
                          { label: 'Time Entry', type: 'time' },
                          { label: 'Invoice', type: 'invoice' },
                          { label: 'Proposal', type: 'proposal' },
                          { label: 'Contract', type: 'contract' },
                          { label: 'Form', type: 'form' },
                          { label: 'Expense', type: 'expense' },
                        ].map(item => (
                          <button
                            key={item.label}
                            type="button"
                            onClick={() => {
                              openDrawer(item.type);
                              setMobileMoreOpen(false);
                            }}
                            className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] transition-colors hover:bg-white/[0.05]"
                            style={{ color: 'var(--foreground)' }}
                          >
                            <div className="h-2 w-2 shrink-0 rounded-full bg-primary opacity-80" />
                            {item.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

              {/* Demo persona switcher (opt-in via NEXT_PUBLIC_ENABLE_PERSONA_SIMULATOR) */}
              {showPersonaSimulator() && (
                <div className="relative" ref={switchUserRef}>
                  <button
                    type="button"
                    onClick={() => setSwitchUserOpen(o => !o)}
                    className="flex min-h-[44px] min-w-[44px] items-center justify-center gap-1 rounded-lg px-2 text-[11px] font-medium transition-colors hover:bg-white/[0.05] sm:min-w-0 sm:justify-start"
                    style={{ color: 'var(--muted-foreground)' }}
                    title="Simulate persona (dev)"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline capitalize">{persona.role}</span>
                    <ChevronDown className="hidden w-2.5 opacity-60 sm:inline" />
                  </button>
                  <AnimatePresence>
                    {switchUserOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.97, y: 4 }}
                        transition={{ duration: 0.12 }}
                        className="absolute right-0 top-full mt-1.5 w-60 rounded-xl overflow-hidden z-50 py-1"
                        style={{
                          background: 'var(--popover)',
                          backdropFilter: 'blur(24px)',
                          border: '1px solid var(--border)',
                          boxShadow: 'var(--shadow-lg)',
                        }}
                      >
                        <p className="px-3 pt-2 pb-1.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>
                          Simulate persona
                        </p>
                        {PERSONAS.map(p => (
                          <button
                            key={p.role}
                            type="button"
                            onClick={() => { setPersona(p); setSwitchUserOpen(false); }}
                            className="w-full flex items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-white/[0.05]"
                          >
                            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-white"
                              style={{ background: p.avatarColor }}>
                              {p.initials}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[12px] font-medium" style={{ color: 'var(--foreground)' }}>{p.name}</p>
                              <p className="text-[11px] capitalize" style={{ color: 'var(--muted-foreground)' }}>{p.role}</p>
                            </div>
                            {persona.role === p.role && (
                              <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#2563EB' }} />
                            )}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* User */}
              <div className="relative" ref={userMenuRef}>
                <button type="button" onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full overflow-hidden sm:h-9 sm:w-9"
                  style={{ background: persona.avatarUrl ? 'transparent' : persona.avatarColor }}>
                  {persona.avatarUrl ? (
                    <img src={persona.avatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-[10px] font-bold text-white sm:text-[9px]">{persona.initials}</span>
                  )}
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.96, y: 4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.97, y: 4 }}
                      transition={{ duration: 0.12 }}
                      className="absolute right-0 top-full mt-1.5 w-52 rounded-lg overflow-hidden z-50"
                      style={{
                        background: 'var(--popover)',
                        backdropFilter: 'blur(24px)',
                        border: '1px solid var(--border)',
                        boxShadow: 'var(--shadow-lg)',
                      }}
                    >
                      <div className="px-3 py-2.5" style={{ borderBottom: '1px solid var(--border)' }}>
                        <p className="text-[12px] font-medium" style={{ color: 'var(--foreground)' }}>{persona.name}</p>
                        <p className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>{persona.email}</p>
                        <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-semibold capitalize"
                          style={{ background: `${persona.avatarColor}20`, color: persona.avatarColor }}>
                          {persona.role}
                        </span>
                      </div>
                      <div className="py-1">
                        {[{ label: 'Profile', icon: User }, { label: 'Settings', icon: Settings }].map(item => (
                          <button key={item.label} type="button"
                            onClick={() => {
                              setUserMenuOpen(false);
                              if (item.label === 'Settings') setSettingsOpen(true);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-[12px] transition-colors text-left hover:bg-white/[0.05]"
                            style={{ color: 'var(--foreground)' }}>
                            <item.icon className="w-3.5 h-3.5" style={{ color: 'var(--muted-foreground)' }} />
                            {item.label}
                          </button>
                        ))}
                      </div>
                      <div style={{ borderTop: '1px solid var(--border)' }}>
                        <button
                          type="button"
                          className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-left hover:bg-white/[0.05]"
                          style={{ color: 'var(--muted-foreground)' }}
                          onClick={async () => {
                            setUserMenuOpen(false);
                            await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
                            router.push('/login');
                            router.refresh();
                          }}
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </header>

          {/* Content — portal workspace fills viewport below header; inner column scrolls only */}
          <main
            className={cn(
              'min-h-0 min-w-0 flex-1 overflow-x-hidden',
              isPortalWorkspace ? 'flex flex-col overflow-hidden' : 'overflow-y-auto',
            )}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                className={cn(
                  isPortalWorkspace && 'flex h-full min-h-0 flex-1 flex-col',
                  !isDeepPortalRoute && 'hub-main-container w-full min-h-0 min-w-0',
                  isDeepPortalRoute && 'w-full min-h-0 flex-1',
                )}
                {...pageTransition}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>

        <NotificationDrawer open={notifOpen} onClose={() => setNotifOpen(false)} />

        {/* ── Quick-Create Drawers ── */}
        <CreateClientDrawer open={activeDrawer === 'client'} onClose={closeDrawer} />
        <CreateContactDrawer open={activeDrawer === 'contact'} onClose={closeDrawer} />
        <CreateDealDrawer open={activeDrawer === 'deal'} onClose={closeDrawer} />
        <CreateProjectDrawer open={activeDrawer === 'project'} onClose={closeDrawer} />
        <CreateTaskDrawer open={activeDrawer === 'task'} onClose={closeDrawer} />
        <CreateTimeEntryDrawer open={activeDrawer === 'time'} onClose={closeDrawer} />
        <CreateInvoiceDrawer open={activeDrawer === 'invoice'} onClose={closeDrawer} />
        <CreateProposalDrawer open={activeDrawer === 'proposal'} onClose={closeDrawer} />
        <CreateContractDrawer open={activeDrawer === 'contract'} onClose={closeDrawer} />
        <CreateFormDrawer open={activeDrawer === 'form'} onClose={closeDrawer} />
        <CreateExpenseDrawer open={activeDrawer === 'expense'} onClose={closeDrawer} />

        {/* ── Settings Drawer ── */}
        <SettingsDrawer open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      </div>
    </MotionConfig>
  );
}
