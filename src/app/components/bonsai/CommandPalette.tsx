'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import {
  Search, Home, Briefcase, Users, Building2, FolderKanban, UserPlus,
  DollarSign, Headphones, Settings, ClipboardList, ArrowRight, Hash,
  FileText, User, BarChart3, Command
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════
   ⌘K COMMAND PALETTE — Apple-style with glassmorphism
   
   - Opens with ⌘K / Ctrl+K
   - Search modules, pages, actions, people
   - Keyboard navigation (up/down/enter)
   - Glassmorphic backdrop + panel
═══════════════════════════════════════════════════════════ */

type CommandItem = {
  id: string;
  label: string;
  description?: string;
  icon: React.ElementType;
  category: string;
  href?: string;
  action?: () => void;
  keywords?: string[];
};

const COMMANDS: CommandItem[] = [
  // Navigation
  { id: 'nav-dashboard',  label: 'Dashboard',      icon: Home,         category: 'Navigate', href: '/hub/dashboard', keywords: ['home', 'overview'] },
  { id: 'nav-sales',      label: 'Sales',           icon: Briefcase,    category: 'Navigate', href: '/hub/sales',     keywords: ['deals', 'pipeline', 'revenue'] },
  { id: 'nav-contacts',   label: 'Contacts',        icon: Users,        category: 'Navigate', href: '/hub/contacts',  keywords: ['people', 'crm'] },
  { id: 'nav-clients',    label: 'Clients',         icon: Building2,    category: 'Navigate', href: '/hub/clients',   keywords: ['company', 'accounts'] },
  { id: 'nav-projects',   label: 'Projects',        icon: FolderKanban, category: 'Navigate', href: '/hub/projects',  keywords: ['tasks', 'kanban'] },
  { id: 'nav-talent',     label: 'Talent',          icon: UserPlus,     category: 'Navigate', href: '/hub/talent',    keywords: ['hiring', 'recruitment', 'candidates'] },
  { id: 'nav-people',     label: 'People',          icon: Users,        category: 'Navigate', href: '/hub/people',    keywords: ['team', 'employees', 'freelancers'] },
  { id: 'nav-finance',    label: 'Finance',         icon: DollarSign,   category: 'Navigate', href: '/hub/finance',   keywords: ['invoices', 'expenses', 'billing'] },
  { id: 'nav-support',    label: 'Support',         icon: Headphones,   category: 'Navigate', href: '/hub/support',   keywords: ['tickets', 'help'] },
  { id: 'nav-forms',      label: 'Forms',           icon: ClipboardList, category: 'Navigate', href: '/hub/forms',    keywords: ['surveys', 'questionnaires'] },
  { id: 'nav-admin',      label: 'Admin',           icon: Settings,     category: 'Navigate', href: '/hub/admin',     keywords: ['settings', 'configuration'] },
  // Portals
  { id: 'nav-client-portal',    label: 'Client Portal',    icon: Building2, category: 'Portals', href: '/hub/portals/client',    keywords: ['external'] },
  { id: 'nav-employee-portal',  label: 'Employee Portal',  icon: User,      category: 'Portals', href: '/hub/portals/employee',  keywords: ['self service'] },
  { id: 'nav-freelancer-portal', label: 'Freelancer Portal', icon: UserPlus, category: 'Portals', href: '/hub/portals/freelancer', keywords: ['contractor'] },
  // Actions
  { id: 'act-new-deal',      label: 'New Deal',         icon: Briefcase, category: 'Actions', keywords: ['create', 'add', 'sales'] },
  { id: 'act-new-invoice',   label: 'Create Invoice',   icon: FileText,  category: 'Actions', keywords: ['billing', 'send'] },
  { id: 'act-new-project',   label: 'New Project',      icon: FolderKanban, category: 'Actions', keywords: ['create'] },
  { id: 'act-add-person',    label: 'Add Team Member',  icon: UserPlus,  category: 'Actions', keywords: ['hire', 'onboard'] },
  { id: 'act-run-report',    label: 'Run Report',       icon: BarChart3, category: 'Actions', keywords: ['analytics', 'export'] },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // ⌘K / Ctrl+K to open
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(prev => !prev);
        setQuery('');
        setSelectedIdx(0);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Focus input on open
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  // Filter
  const filtered = query.trim()
    ? COMMANDS.filter(c =>
        c.label.toLowerCase().includes(query.toLowerCase()) ||
        c.category.toLowerCase().includes(query.toLowerCase()) ||
        c.keywords?.some(k => k.includes(query.toLowerCase()))
      )
    : COMMANDS;

  // Group by category
  const grouped = filtered.reduce<Record<string, CommandItem[]>>((acc, item) => {
    (acc[item.category] ??= []).push(item);
    return acc;
  }, {});

  const flatItems = Object.values(grouped).flat();

  // Keyboard nav
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIdx(i => Math.min(i + 1, flatItems.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && flatItems[selectedIdx]) {
      e.preventDefault();
      const item = flatItems[selectedIdx];
      if (item.href) router.push(item.href);
      if (item.action) item.action();
      setOpen(false);
      setQuery('');
    }
  }, [flatItems, selectedIdx, router]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh]"
          onClick={() => setOpen(false)}
        >
          {/* Glassmorphic backdrop */}
          <div className="absolute inset-0 bg-stone-900/20 backdrop-blur-[8px]" />

          {/* Palette panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -4 }}
            transition={{ type: 'spring', damping: 28, stiffness: 380 }}
            className="relative w-full max-w-[560px] rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.88)',
              backdropFilter: 'blur(48px) saturate(200%)',
              WebkitBackdropFilter: 'blur(48px) saturate(200%)',
              boxShadow: '0 24px 80px -12px rgba(0,0,0,0.16), 0 0 0 1px rgba(0,0,0,0.04)',
              border: '1px solid rgba(255,255,255,0.5)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Top shimmer */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" />

            {/* Search input */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-stone-200/30">
              <Search className="w-4 h-4 text-stone-400 flex-shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => { setQuery(e.target.value); setSelectedIdx(0); }}
                onKeyDown={handleKeyDown}
                placeholder="Search commands, pages, actions…"
                className="flex-1 text-[14px] text-stone-800 placeholder:text-stone-400 bg-transparent outline-none"
              />
              <kbd className="flex items-center gap-0.5 text-[9px] text-stone-400 bg-stone-100/80 border border-stone-200/60 rounded px-1.5 py-0.5 font-medium">
                esc
              </kbd>
            </div>

            {/* Results */}
            <div className="max-h-[360px] overflow-y-auto py-2">
              {Object.entries(grouped).length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <p className="text-[13px] text-stone-400">No results for "{query}"</p>
                </div>
              ) : (
                Object.entries(grouped).map(([category, items]) => (
                  <div key={category}>
                    <p className="px-5 py-1.5 text-[10px] font-semibold text-stone-400 uppercase tracking-[0.08em]">
                      {category}
                    </p>
                    {items.map((item) => {
                      const globalIdx = flatItems.indexOf(item);
                      const isSelected = globalIdx === selectedIdx;
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            if (item.href) router.push(item.href);
                            if (item.action) item.action();
                            setOpen(false);
                            setQuery('');
                          }}
                          onMouseEnter={() => setSelectedIdx(globalIdx)}
                          className={`w-full flex items-center gap-3 px-5 py-2.5 text-left transition-colors ${
                            isSelected ? 'bg-stone-100/80' : 'hover:bg-stone-50/60'
                          }`}
                        >
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            isSelected ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-500'
                          }`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-[13px] truncate ${isSelected ? 'font-medium text-stone-900' : 'text-stone-700'}`}>
                              {item.label}
                            </p>
                            {item.description && (
                              <p className="text-[11px] text-stone-400 truncate">{item.description}</p>
                            )}
                          </div>
                          {isSelected && (
                            <ArrowRight className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-2.5 border-t border-stone-200/30 flex items-center gap-4 text-[10px] text-stone-400">
              <span className="flex items-center gap-1"><kbd className="bg-stone-100 rounded px-1 py-0.5 font-medium">↑↓</kbd> Navigate</span>
              <span className="flex items-center gap-1"><kbd className="bg-stone-100 rounded px-1 py-0.5 font-medium">↵</kbd> Select</span>
              <span className="flex items-center gap-1"><kbd className="bg-stone-100 rounded px-1 py-0.5 font-medium">esc</kbd> Close</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
