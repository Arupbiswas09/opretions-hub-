'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Home,
  Briefcase,
  Users,
  Building2,
  FolderKanban,
  UserPlus,
  DollarSign,
  Headphones,
  Settings,
  ClipboardList,
  ArrowRight,
  FileText,
  User,
  BarChart3,
  Calendar,
  FileSignature,
  Clock,
  Share2,
  LayoutGrid,
  Inbox,
  UserCheck,
  PanelsTopLeft,
} from 'lucide-react';
import { HUB_EVENTS, dispatchQuickCreate, type QuickCreateKind } from '../../lib/hub-events';
import { springSnap } from '../../lib/motion';

type CommandItem = {
  id: string;
  label: string;
  description?: string;
  icon: React.ElementType;
  category: string;
  href?: string;
  /** Opens a quick-create drawer in HubShell */
  quickCreate?: QuickCreateKind;
  keywords?: string[];
};

function buildCommands(): CommandItem[] {
  return [
    { id: 'nav-dashboard', label: 'Dashboard', icon: Home, category: 'Navigate', href: '/hub/dashboard', keywords: ['home', 'overview'] },
    { id: 'nav-sales', label: 'Sales', icon: Briefcase, category: 'Navigate', href: '/hub/sales/overview', keywords: ['deals', 'pipeline', 'revenue'] },
    { id: 'nav-contacts', label: 'Contacts', icon: Users, category: 'Navigate', href: '/hub/contacts', keywords: ['people', 'crm'] },
    { id: 'nav-clients', label: 'Clients', icon: Building2, category: 'Navigate', href: '/hub/clients', keywords: ['company', 'accounts'] },
    { id: 'nav-projects', label: 'Projects', icon: FolderKanban, category: 'Navigate', href: '/hub/projects/list', keywords: ['tasks', 'kanban'] },
    { id: 'nav-talent', label: 'Talent', icon: UserPlus, category: 'Navigate', href: '/hub/talent/overview', keywords: ['hiring', 'recruitment', 'candidates'] },
    { id: 'nav-people', label: 'People', icon: Users, category: 'Navigate', href: '/hub/people/directory', keywords: ['team', 'employees', 'freelancers'] },
    { id: 'nav-finance', label: 'Finance', icon: DollarSign, category: 'Navigate', href: '/hub/finance/overview', keywords: ['invoices', 'expenses', 'billing'] },
    { id: 'nav-support', label: 'Support', icon: Headphones, category: 'Navigate', href: '/hub/support', keywords: ['tickets', 'help'] },
    { id: 'nav-forms', label: 'Forms', icon: ClipboardList, category: 'Navigate', href: '/hub/forms', keywords: ['surveys', 'questionnaires'] },
    { id: 'nav-meetings', label: 'Meetings', icon: Calendar, category: 'Navigate', href: '/hub/meetings', keywords: ['calendar', 'schedule'] },
    { id: 'nav-proposals', label: 'Proposals', icon: FileSignature, category: 'Navigate', href: '/hub/proposals', keywords: ['quotes', 'send'] },
    { id: 'nav-contracts', label: 'Contracts', icon: FileText, category: 'Navigate', href: '/hub/contracts', keywords: ['agreements', 'msa'] },
    { id: 'nav-time', label: 'Time tracking', icon: Clock, category: 'Navigate', href: '/hub/timetracking', keywords: ['timer', 'timesheet'] },
    { id: 'nav-tasks', label: 'Tasks', icon: LayoutGrid, category: 'Navigate', href: '/hub/forms', keywords: ['board', 'work'] },
    { id: 'nav-admin', label: 'Admin', icon: Settings, category: 'Navigate', href: '/hub/admin', keywords: ['settings', 'configuration'] },
    { id: 'nav-client-portal', label: 'Client Portal', icon: Share2, category: 'Portals', href: '/hub/portals/client', keywords: ['external'] },
    { id: 'nav-employee-portal', label: 'Employee Portal', icon: User, category: 'Portals', href: '/hub/portals/employee', keywords: ['self service'] },
    { id: 'nav-freelancer-portal', label: 'Freelancer Portal', icon: UserPlus, category: 'Portals', href: '/hub/portals/freelancer', keywords: ['contractor'] },
    { id: 'nav-portal-hub', label: 'All portals', icon: PanelsTopLeft, category: 'Portals', href: '/hub/portals', keywords: ['chooser', 'switch', 'external'] },
    { id: 'wf-timesheets', label: 'Timesheet approvals', icon: Inbox, category: 'Workflow', href: '/hub/projects/approvals', keywords: ['approve', 'hours', 'week'] },
    { id: 'wf-people', label: 'People & HR approvals', icon: UserCheck, category: 'Workflow', href: '/hub/people/approvals', keywords: ['leave', 'vacation', 'gdpr', 'profile'] },
    { id: 'wf-timesheets-ts', label: 'Timesheets (submitted)', icon: FileText, category: 'Workflow', href: '/hub/projects/timesheets', keywords: ['submit', 'grid'] },
    { id: 'act-new-client', label: 'New client', icon: Building2, category: 'Actions', quickCreate: 'client', keywords: ['create', 'add'] },
    { id: 'act-new-contact', label: 'New contact', icon: Users, category: 'Actions', quickCreate: 'contact', keywords: ['create', 'add', 'person'] },
    { id: 'act-new-deal', label: 'New deal', icon: Briefcase, category: 'Actions', quickCreate: 'deal', keywords: ['create', 'add', 'sales'] },
    { id: 'act-new-project', label: 'New project', icon: FolderKanban, category: 'Actions', quickCreate: 'project', keywords: ['create'] },
    { id: 'act-new-task', label: 'New task', icon: LayoutGrid, category: 'Actions', quickCreate: 'task', keywords: ['create'] },
    { id: 'act-log-time', label: 'Log time', icon: Clock, category: 'Actions', quickCreate: 'time', keywords: ['timer', 'entry'] },
    { id: 'act-new-invoice', label: 'Create invoice', icon: FileText, category: 'Actions', quickCreate: 'invoice', keywords: ['billing', 'send'] },
    { id: 'act-new-proposal', label: 'New proposal', icon: FileSignature, category: 'Actions', quickCreate: 'proposal', keywords: ['quote'] },
    { id: 'act-new-contract', label: 'New contract', icon: FileText, category: 'Actions', quickCreate: 'contract', keywords: ['agreement'] },
    { id: 'act-new-form', label: 'New form', icon: ClipboardList, category: 'Actions', quickCreate: 'form', keywords: ['survey'] },
    { id: 'act-new-expense', label: 'Log expense', icon: DollarSign, category: 'Actions', quickCreate: 'expense', keywords: ['receipt'] },
    { id: 'act-run-report', label: 'Reports & exports', icon: BarChart3, category: 'Actions', href: '/hub/admin', keywords: ['analytics', 'export'] },
  ];
}

export function CommandPalette() {
  const COMMANDS = useMemo(() => buildCommands(), []);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const openPalette = useCallback(() => {
    setOpen(true);
    setQuery('');
    setSelectedIdx(0);
  }, []);

  useEffect(() => {
    const toggle = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(prev => {
          if (prev) return false;
          queueMicrotask(() => {
            setQuery('');
            setSelectedIdx(0);
          });
          return true;
        });
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', toggle);
    return () => window.removeEventListener('keydown', toggle);
  }, []);

  useEffect(() => {
    const onOpen = () => openPalette();
    window.addEventListener(HUB_EVENTS.OPEN_COMMAND_PALETTE, onOpen);
    return () => window.removeEventListener(HUB_EVENTS.OPEN_COMMAND_PALETTE, onOpen);
  }, [openPalette]);

  useEffect(() => {
    if (open) {
      const t = window.setTimeout(() => inputRef.current?.focus(), 40);
      return () => window.clearTimeout(t);
    }
  }, [open]);

  const filtered = query.trim()
    ? COMMANDS.filter(
        c =>
          c.label.toLowerCase().includes(query.toLowerCase()) ||
          c.category.toLowerCase().includes(query.toLowerCase()) ||
          c.keywords?.some(k => k.includes(query.toLowerCase())),
      )
    : COMMANDS;

  const grouped = filtered.reduce<Record<string, CommandItem[]>>((acc, item) => {
    (acc[item.category] ??= []).push(item);
    return acc;
  }, {});

  const flatItems = Object.values(grouped).flat();

  useEffect(() => {
    if (flatItems.length === 0) {
      setSelectedIdx(0);
      return;
    }
    setSelectedIdx(i => Math.min(i, flatItems.length - 1));
  }, [query, flatItems.length]);

  const runItem = useCallback(
    (item: CommandItem) => {
      if (item.href) router.push(item.href);
      if (item.quickCreate) dispatchQuickCreate(item.quickCreate);
      setOpen(false);
      setQuery('');
    },
    [router],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIdx(i => Math.min(i + 1, Math.max(0, flatItems.length - 1)));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIdx(i => Math.max(i - 1, 0));
      } else if (e.key === 'Enter' && flatItems[selectedIdx]) {
        e.preventDefault();
        runItem(flatItems[selectedIdx]);
      }
    },
    [flatItems, selectedIdx, runItem],
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, pointerEvents: 'none' }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[18vh]"
          onClick={() => setOpen(false)}
        >
          <div className="absolute inset-0 bg-stone-900/25 dark:bg-black/50 backdrop-blur-[6px]" />

          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -4 }}
            transition={springSnap}
            className="relative w-full max-w-[560px] rounded-2xl overflow-hidden mx-4"
            style={{
              background: 'var(--popover)',
              backdropFilter: 'blur(40px) saturate(180%)',
              WebkitBackdropFilter: 'blur(40px) saturate(180%)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-modal)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div
              className="flex items-center gap-3 px-5 py-4"
              style={{ borderBottom: '1px solid var(--border-subtle)' }}
            >
              <Search className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--muted-foreground)' }} />
              <input
                ref={inputRef}
                value={query}
                onChange={e => {
                  setQuery(e.target.value);
                  setSelectedIdx(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search pages, portals, quick actions…"
                className="flex-1 text-[14px] bg-transparent outline-none placeholder:text-[var(--muted-foreground)]"
                style={{ color: 'var(--foreground)' }}
              />
              <kbd
                className="text-[9px] font-medium px-1.5 py-0.5 rounded"
                style={{
                  background: 'var(--muted)',
                  color: 'var(--muted-foreground)',
                  border: '1px solid var(--border)',
                }}
              >
                esc
              </kbd>
            </div>

            <div className="max-h-[min(52vh,420px)] overflow-y-auto py-2">
              {Object.entries(grouped).length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <p className="text-[13px]" style={{ color: 'var(--muted-foreground)' }}>
                    No results for &ldquo;{query}&rdquo;
                  </p>
                </div>
              ) : (
                Object.entries(grouped).map(([category, items]) => (
                  <div key={category}>
                    <p
                      className="px-5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em]"
                      style={{ color: 'var(--muted-foreground)' }}
                    >
                      {category}
                    </p>
                    {items.map(item => {
                      const globalIdx = flatItems.indexOf(item);
                      const isSelected = globalIdx === selectedIdx;
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => runItem(item)}
                          onMouseEnter={() => setSelectedIdx(globalIdx)}
                          className="w-full flex items-center gap-3 px-5 py-2.5 text-left transition-colors"
                          style={{
                            background: isSelected ? 'var(--muted)' : 'transparent',
                          }}
                        >
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{
                              background: isSelected ? 'var(--primary)' : 'var(--muted)',
                              color: isSelected ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
                            }}
                          >
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className="text-[13px] truncate"
                              style={{
                                fontWeight: isSelected ? 600 : 500,
                                color: 'var(--foreground)',
                              }}
                            >
                              {item.label}
                            </p>
                            {item.description ? (
                              <p className="text-[11px] truncate" style={{ color: 'var(--muted-foreground)' }}>
                                {item.description}
                              </p>
                            ) : null}
                          </div>
                          {isSelected ? (
                            <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--muted-foreground)' }} />
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            <div
              className="px-5 py-2.5 flex items-center gap-4 text-[10px]"
              style={{ borderTop: '1px solid var(--border-subtle)', color: 'var(--muted-foreground)' }}
            >
              <span className="flex items-center gap-1">
                <kbd className="rounded px-1 py-0.5 font-medium" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
                  ↑↓
                </kbd>{' '}
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded px-1 py-0.5 font-medium" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
                  ↵
                </kbd>{' '}
                Select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded px-1 py-0.5 font-medium" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
                  esc
                </kbd>{' '}
                Close
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
