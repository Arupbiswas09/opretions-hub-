'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, MotionConfig } from 'motion/react';
import {
  Settings, Search, Bell, Plus, Play,
  ChevronRight, ChevronDown, PanelLeftClose, PanelLeft,
  LogOut, User, Sun, Moon, MoreHorizontal, Globe,
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
import { HUB_EVENTS, dispatchOpenCommandPalette } from '../lib/hub-events';
import { NotificationDrawer } from './bonsai/NotificationDrawer';
import { useTheme } from '../lib/theme';
import {
  CreateClientDrawer, CreateDealDrawer, CreateProjectDrawer,
  CreateInvoiceDrawer, CreateTimeEntryDrawer, CreateProposalDrawer,
  CreateContractDrawer, CreateExpenseDrawer, CreateContactDrawer,
  CreateTaskDrawer, CreateFormDrawer,
} from './ui/QuickCreateDrawers';
import { SettingsDrawer } from './ui/DetailPanels';
import { cn } from './ui/utils';

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
  label, icon: Icon, href, onClick, active, collapsed,
}: {
  label: string;
  icon: React.ElementType;
  href?: string;
  onClick?: () => void;
  active: boolean;
  collapsed: boolean;
}) {
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
    <Link href={href!} className={className} style={style}>
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
) {
  if (item.kind === 'notifications') {
    return (
      <NavRow
        key={item.label}
        label={item.label}
        icon={item.icon}
        onClick={onOpenNotif}
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
  const [collapsed, setCollapsed] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  /* Quick-create drawer state — which type is open */
  const [activeDrawer, setActiveDrawer] = useState<string | null>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const quickAddRef = useRef<HTMLDivElement>(null);
  const portalMenuRef = useRef<HTMLDivElement>(null);
  const [portalMenuOpen, setPortalMenuOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();

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

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex h-[100dvh] min-h-0 overflow-hidden">

        {/* ── Sidebar ── */}
        {!isPortalView && (
          <aside
            className="fixed inset-y-0 left-0 z-30 flex flex-col"
            style={{
              width: sw,
              transition: 'width 0.2s ease',
              background: 'var(--sidebar-glass)',
              borderRight: '1px solid var(--sidebar-divider)',
            }}
          >
            {/* Logo / workspace name */}
            <div className="h-[52px] flex items-center px-3"
              style={{ borderBottom: '1px solid var(--sidebar-divider)' }}>
              <Link href={homeHref} className="flex items-center gap-2 min-w-0 w-full">
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
                    <ChevronDown className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--muted-foreground)' }} />
                  </div>
                )}
              </Link>
            </div>

            {/* Search */}
            {!collapsed && (
              <div className="px-3 pt-3 pb-1">
                <button
                  type="button"
                  onClick={() => dispatchOpenCommandPalette()}
                  className="flex items-center gap-2 px-2.5 py-[6px] rounded-lg transition-colors w-full text-left cursor-pointer hover:opacity-95"
                  style={{
                    background: 'var(--search-bg)',
                    border: '1px solid var(--search-border)',
                  }}
                >
                  <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--muted-foreground)' }} />
                  <span className="text-[12px] flex-1" style={{ color: 'var(--muted-foreground)' }}>Search</span>
                  <kbd className="text-[9px] font-medium px-1 py-0.5 rounded"
                    style={{ background: 'var(--glass-bg)', color: 'var(--muted-foreground)', border: '1px solid var(--border)' }}>
                    ⌘K
                  </kbd>
                </button>
              </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 px-2 py-1 overflow-y-auto space-y-[1px]">
              {HUB_SIDEBAR_TOP.map(item =>
                renderSidebarItem(item, pathname, collapsed, notifOpen, () => setNotifOpen(true)),
              )}

              <SectionHeader label="Workspace" collapsed={collapsed} />
              {HUB_SIDEBAR_WORKSPACE.map(item =>
                renderSidebarItem(item, pathname, collapsed, notifOpen, () => setNotifOpen(true)),
              )}

              <SectionHeader label="Productivity" collapsed={collapsed} />
              {HUB_SIDEBAR_PRODUCTIVITY.map(item =>
                renderSidebarItem(item, pathname, collapsed, notifOpen, () => setNotifOpen(true)),
              )}

              {!collapsed && (
                <Link
                  href="/hub/admin"
                  className="flex items-center gap-2.5 px-3 py-[7px] rounded-lg w-full transition-colors hover:bg-white/[0.04]"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  <MoreHorizontal className="w-4 h-4" />
                  <span className="text-[13px]">More</span>
                </Link>
              )}

              <div style={{ borderTop: '1px solid var(--sidebar-divider)', marginTop: 8, paddingTop: 8 }}>
                {HUB_SIDEBAR_BOTTOM.map(item =>
                  renderSidebarItem(item, pathname, collapsed, notifOpen, () => setNotifOpen(true)),
                )}
              </div>
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
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
          style={{ marginLeft: !isPortalView ? sw : 0, transition: 'margin-left 0.2s ease' }}
        >

          {/* ── Topbar — Bonsai style: breadcrumb left, actions right ── */}
          <header
            className="sticky top-0 z-20 h-[52px] flex items-center justify-between px-5"
            style={{
              background: 'var(--topbar-bg)',
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
              borderBottom: '1px solid var(--topbar-border)',
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
                  <Link href={homeHref} className="font-medium"
                    style={{ color: 'var(--muted-foreground)' }}>
                    {isPortalView ? (portalLabelFromPath(pathname) ?? 'Portal') : 'Home'}
                  </Link>
                  {!isPortalView && modLabel && mod !== 'dashboard' && (
                    <>
                      <ChevronRight className="w-3 h-3" style={{ color: 'var(--muted-foreground)' }} />
                      <Link href={MODULE_DEFAULT_HREF[mod]}
                        className="font-medium"
                        style={{ color: subLabel ? 'var(--muted-foreground)' : 'var(--foreground)' }}>
                        {modLabel}
                      </Link>
                    </>
                  )}
                  {!isPortalView && subLabel && (
                    <>
                      <ChevronRight className="w-3 h-3" style={{ color: 'var(--muted-foreground)' }} />
                      <span className="font-semibold" style={{ color: 'var(--foreground)' }}>{subLabel}</span>
                    </>
                  )}
                </div>
              );
            })()}

            {/* Right actions — Bonsai exact: ▶ + 👤 */}
            <div className="flex items-center gap-1.5">
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
                    className="flex items-center gap-1 px-2 py-1.5 rounded-lg transition-colors hover:bg-white/[0.05] text-[12px] font-medium"
                    style={{ color: 'var(--muted-foreground)' }}
                    title="Open a client, employee, or freelancer portal"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Portals</span>
                    <ChevronDown className="w-3 h-3 opacity-60" />
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

              {/* Theme toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                className="p-[6px] rounded-lg transition-colors"
                style={{ color: 'var(--muted-foreground)' }}
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Notifications — same panel as sidebar item */}
              <button
                type="button"
                onClick={() => setNotifOpen(true)}
                className="relative p-[6px] rounded-lg transition-colors hover:bg-white/[0.05]"
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
                className="p-[6px] rounded-lg transition-colors hover:bg-white/[0.05]"
                title="Log time"
                style={{ color: 'var(--muted-foreground)' }}
              >
                <Play className="w-4 h-4" />
              </button>

              {/* Plus — Quick Add dropdown like Bonsai */}
              <div className="relative" ref={quickAddRef}>
                <button
                  onClick={() => setQuickAddOpen(!quickAddOpen)}
                  className="p-[6px] rounded-lg transition-colors"
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
                          { label: 'Client',     color: '#2563EB', type: 'client' },
                          { label: 'Contact',    color: '#3B82F6', type: 'contact' },
                          { label: 'Deal',       color: '#0EA5E9', type: 'deal' },
                          { label: 'Project',    color: '#0D9488', type: 'project' },
                          { label: 'Task',       color: '#10B981', type: 'task' },
                          { label: 'Time Entry', color: '#22C55E', type: 'time' },
                          { label: 'Invoice',    color: '#84CC16', type: 'invoice' },
                          { label: 'Proposal',   color: '#2563EB', type: 'proposal' },
                          { label: 'Contract',   color: '#0D9488', type: 'contract' },
                          { label: 'Form',       color: '#3B82F6', type: 'form' },
                          { label: 'Expense',    color: '#FBBF24', type: 'expense' },
                        ].map(item => (
                          <button
                            key={item.label}
                            onClick={() => openDrawer(item.type)}
                            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-left transition-colors hover:bg-white/[0.05]"
                            style={{ color: 'var(--foreground)' }}>
                            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color }} />
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User */}
              <div className="relative" ref={userMenuRef}>
                <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ background: '#2563EB' }}>
                  <span className="text-[9px] font-bold text-white">JD</span>
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
                        <p className="text-[12px] font-medium" style={{ color: 'var(--foreground)' }}>John Doe</p>
                        <p className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>john.doe@company.com</p>
                      </div>
                      <div className="py-1">
                        {[{ label: 'Profile', icon: User }, { label: 'Settings', icon: Settings }].map(item => (
                          <button key={item.label}
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
                        <button className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-left"
                          style={{ color: 'var(--muted-foreground)' }}>
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
              'min-h-0 flex-1',
              isPortalWorkspace ? 'flex flex-col overflow-hidden' : 'overflow-y-auto',
            )}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                className={cn(isPortalWorkspace && 'flex h-full min-h-0 flex-1 flex-col')}
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
