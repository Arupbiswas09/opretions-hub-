'use client';
import React, { useEffect, useState, useRef } from 'react';
import {
  Plus, List, LayoutGrid, Columns3, Filter, Mail, Tag, UserCheck,
  Download, Trash2, MoreHorizontal, Search, X, ArrowUpDown, ArrowUp,
  ArrowDown, ChevronDown, Users2, Phone, Building,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from '../bonsai/ToastSystem';
import { dispatchDataInvalidation } from '../../lib/hub-events';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  jobTitle?: string;
  type: string;
  linkedClient: string;
  consent: 'Given' | 'Pending' | 'Withdrawn';
  gdprStatus: 'Active' | 'Export Requested' | 'Deletion Requested';
  source: string;
  tags: string[];
  lastContact?: string;
}

interface CO01ContactsListProps {
  onContactClick: (contact: Contact) => void;
  onCreateContact: () => void;
  onBulkAction: (action: string, selected: string[]) => void;
  onShowBulkToolbar: () => void;
  dataRefreshVersion?: number;
}

function mapContactFromApi(r: Record<string, unknown>): Contact {
  const fn = String(r.first_name ?? '');
  const ln = String(r.last_name ?? '');
  const name = `${fn} ${ln}`.trim() || String(r.email ?? 'Contact');
  const tags = Array.isArray(r.tags) ? (r.tags as string[]) : [];
  const created = r.created_at ? String(r.created_at).slice(0, 10) : undefined;
  return {
    id: String(r.id),
    name,
    email: String(r.email ?? ''),
    phone: String(r.phone ?? ''),
    company: r.company ? String(r.company) : undefined,
    jobTitle: undefined,
    type: 'Contact',
    linkedClient: r.company ? String(r.company) : '—',
    consent: 'Given',
    gdprStatus: 'Active',
    source: '—',
    tags,
    lastContact: created,
  };
}

/* ─── Avatar dot ─── */
function ContactAvatar({ name }: { name: string }) {
  const gradients = [
    ['#2563EB', '#6366F1'],
    ['#059669', '#10B981'],
    ['#D97706', '#F59E0B'],
    ['#7C3AED', '#A78BFA'],
    ['#0D9488', '#2DD4BF'],
    ['#DC2626', '#F87171'],
  ];
  const idx = name.charCodeAt(0) % gradients.length;
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';
  return (
    <div
      className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 shadow-sm"
      style={{ background: `linear-gradient(135deg, ${gradients[idx][0]}, ${gradients[idx][1]})` }}
    >
      {initials}
    </div>
  );
}

/* ─── Consent badge ─── */
function ConsentBadge({ consent }: { consent: string }) {
  const map: Record<string, { bg: string; text: string; border: string; dot: string }> = {
    Given:     { bg: 'rgba(16,185,129,0.08)', text: '#10B981', border: 'rgba(16,185,129,0.20)', dot: '#10B981' },
    Pending:   { bg: 'rgba(245,158,11,0.08)', text: '#F59E0B', border: 'rgba(245,158,11,0.20)', dot: '#F59E0B' },
    Withdrawn: { bg: 'rgba(220,38,38,0.08)',  text: '#EF4444', border: 'rgba(220,38,38,0.20)',  dot: '#EF4444' },
  };
  const s = map[consent] || map.Given;
  return (
    <span
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold"
      style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}` }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
      {consent}
    </span>
  );
}

type SortField = 'name' | 'email' | 'consent' | 'type' | 'lastContact';
type SortDir = 'asc' | 'desc';

const TH: React.CSSProperties = {
  padding: '8px 12px',
  textAlign: 'left',
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  color: 'var(--muted-foreground)',
  borderBottom: '1px solid var(--border)',
  whiteSpace: 'nowrap',
};

export function CO01ContactsList({
  onContactClick,
  onCreateContact,
  onBulkAction,
  onShowBulkToolbar,
  dataRefreshVersion = 0,
}: CO01ContactsListProps) {
  const { addToast } = useToast();
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'kanban'>('list');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [localSearch, setLocalSearch] = useState('');
  const [globalSearch, setGlobalSearch] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showBulkMenu, setShowBulkMenu] = useState(false);
  const bulkRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  const [filters, setFilters] = useState({
    type: 'all',
    consent: 'all',
    gdprStatus: 'all',
    source: 'all',
  });

  // Global search listener
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setGlobalSearch(detail?.q || '');
    };
    window.addEventListener('hub:global-search', handler);
    return () => window.removeEventListener('hub:global-search', handler);
  }, []);

  // Outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (bulkRef.current && !bulkRef.current.contains(e.target as Node)) setShowBulkMenu(false);
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setShowFilterPanel(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Fetch
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/contacts?page=1&limit=200', { credentials: 'include' });
        const json = await res.json();
        if (cancelled) return;
        if (res.ok && Array.isArray(json.data)) setContacts(json.data.map(mapContactFromApi));
        else setContacts([]);
      } catch {
        if (!cancelled) setContacts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [dataRefreshVersion]);

  const search = globalSearch || localSearch;

  const filtered = contacts.filter(c => {
    if (filters.type !== 'all' && c.type !== filters.type) return false;
    if (filters.consent !== 'all' && c.consent !== filters.consent) return false;
    if (filters.gdprStatus !== 'all' && c.gdprStatus !== filters.gdprStatus) return false;
    if (filters.source !== 'all' && c.source !== filters.source) return false;
    if (search) {
      const q = search.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) ||
        (c.company || '').toLowerCase().includes(q) || c.phone.toLowerCase().includes(q);
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (!sortField) return 0;
    const av = (a as any)[sortField] || '';
    const bv = (b as any)[sortField] || '';
    const cmp = String(av).localeCompare(String(bv));
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const allSelected = sorted.length > 0 && selected.length === sorted.length;
  const toggleAll = () => setSelected(allSelected ? [] : sorted.map(c => c.id));
  const toggleOne = (id: string) => setSelected(prev =>
    prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 opacity-40" />;
    return sortDir === 'asc'
      ? <ArrowUp className="w-3 h-3" style={{ color: 'var(--primary)' }} />
      : <ArrowDown className="w-3 h-3" style={{ color: 'var(--primary)' }} />;
  };

  const activeFilterCount = Object.values(filters).filter(v => v !== 'all').length;

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selected.map(id => fetch(`/api/contacts/${id}`, { method: 'DELETE', credentials: 'include' })));
      addToast(`${selected.length} contact${selected.length > 1 ? 's' : ''} deleted`, 'success');
      dispatchDataInvalidation('contacts');
      setSelected([]);
    } catch { addToast('Failed to delete', 'error'); }
    setShowBulkMenu(false);
  };

  // Kanban data
  const kanbanCols: { title: string; consent: string; color: string; borderColor: string }[] = [
    { title: 'Consent Given', consent: 'Given', color: 'rgba(16,185,129,0.06)', borderColor: 'rgba(16,185,129,0.15)' },
    { title: 'Pending', consent: 'Pending', color: 'rgba(245,158,11,0.06)', borderColor: 'rgba(245,158,11,0.15)' },
    { title: 'Withdrawn', consent: 'Withdrawn', color: 'rgba(220,38,38,0.06)', borderColor: 'rgba(220,38,38,0.15)' },
  ];

  return (
    <div>
      {/* ── Compact Toolbar ── */}
      <div className="flex flex-wrap items-center gap-1.5 px-2 py-2 sm:px-5" style={{ borderBottom: '1px solid var(--border)' }}>
        {/* Search */}
        <div className="relative flex min-w-0 flex-1 basis-[180px] sm:max-w-[240px]">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: 'var(--muted-foreground)' }} />
          <input
            value={globalSearch || localSearch}
            onChange={e => { setLocalSearch(e.target.value); setGlobalSearch(''); }}
            placeholder="Search contacts…"
            className="w-full rounded-lg py-[5px] pl-7 pr-2.5 text-[11px] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            style={{ background: 'var(--search-bg)', border: '1px solid var(--search-border)', color: 'var(--foreground)' }}
          />
          {search && (
            <button onClick={() => { setLocalSearch(''); setGlobalSearch(''); }} className="absolute right-2 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }}>
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* View switcher */}
        <div className="flex items-center rounded-lg p-0.5" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border)' }}>
          {([
            { mode: 'list' as const, icon: List },
            { mode: 'kanban' as const, icon: Columns3 },
            { mode: 'grid' as const, icon: LayoutGrid },
          ]).map(v => (
            <button
              key={v.mode}
              onClick={() => setViewMode(v.mode)}
              className="rounded p-1.5 transition-all"
              style={{
                background: viewMode === v.mode ? 'rgba(37,99,235,0.12)' : 'transparent',
                color: viewMode === v.mode ? 'var(--primary)' : 'var(--muted-foreground)',
              }}
            >
              <v.icon className="w-3.5 h-3.5" />
            </button>
          ))}
        </div>

        {/* Filter */}
        <div className="relative" ref={filterRef}>
          <button
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className="flex items-center gap-1 px-2.5 py-[5px] rounded-lg text-[11px] font-medium transition-colors"
            style={{
              background: activeFilterCount > 0 ? 'rgba(37,99,235,0.10)' : 'var(--glass-bg)',
              border: `1px solid ${activeFilterCount > 0 ? 'rgba(37,99,235,0.25)' : 'var(--border)'}`,
              color: activeFilterCount > 0 ? 'var(--primary)' : 'var(--foreground)',
            }}
          >
            <Filter className="w-3 h-3" />
            Filter
            {activeFilterCount > 0 && (
              <span className="ml-0.5 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center" style={{ background: 'var(--primary)', color: '#fff' }}>{activeFilterCount}</span>
            )}
          </button>
          <AnimatePresence>
            {showFilterPanel && (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.97 }}
                transition={{ duration: 0.12 }}
                className="absolute left-0 top-full mt-1.5 z-50 w-72 rounded-xl p-3 space-y-3"
                style={{ background: 'var(--popover)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)', backdropFilter: 'blur(24px)' }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold" style={{ color: 'var(--foreground)' }}>Filters</span>
                  <button onClick={() => setFilters({ type: 'all', consent: 'all', gdprStatus: 'all', source: 'all' })} className="text-[10px] font-medium" style={{ color: 'var(--primary)' }}>Clear all</button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'consent', label: 'Consent', opts: [{ v: 'all', l: 'All' }, { v: 'Given', l: 'Given' }, { v: 'Pending', l: 'Pending' }, { v: 'Withdrawn', l: 'Withdrawn' }] },
                    { key: 'type', label: 'Type', opts: [{ v: 'all', l: 'All' }, { v: 'Contact', l: 'Contact' }, { v: 'Lead', l: 'Lead' }, { v: 'Client', l: 'Client' }] },
                    { key: 'gdprStatus', label: 'GDPR', opts: [{ v: 'all', l: 'All' }, { v: 'Active', l: 'Active' }, { v: 'Export Requested', l: 'Export Req.' }, { v: 'Deletion Requested', l: 'Delete Req.' }] },
                    { key: 'source', label: 'Source', opts: [{ v: 'all', l: 'All' }, { v: 'Website', l: 'Website' }, { v: 'Referral', l: 'Referral' }, { v: 'LinkedIn', l: 'LinkedIn' }] },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="block text-[10px] font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>{f.label}</label>
                      <select
                        value={(filters as any)[f.key]}
                        onChange={e => setFilters({ ...filters, [f.key]: e.target.value })}
                        className="w-full rounded-lg px-2 py-1.5 text-[11px]"
                        style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                      >
                        {f.opts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bulk */}
        {selected.length > 0 && (
          <div className="relative" ref={bulkRef}>
            <button
              onClick={() => setShowBulkMenu(!showBulkMenu)}
              className="flex items-center gap-1 px-2.5 py-[5px] rounded-lg text-[11px] font-medium"
              style={{ background: 'rgba(37,99,235,0.10)', border: '1px solid rgba(37,99,235,0.25)', color: 'var(--primary)' }}
            >
              {selected.length} selected
              <ChevronDown className="w-3 h-3" />
            </button>
            <AnimatePresence>
              {showBulkMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  className="absolute left-0 top-full mt-1 z-50 w-48 rounded-lg py-1 overflow-hidden"
                  style={{ background: 'var(--popover)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}
                >
                  {[
                    { icon: Mail, label: 'Send Email', action: () => { onBulkAction('email', selected); setShowBulkMenu(false); } },
                    { icon: Tag, label: 'Add Tags', action: () => { onBulkAction('tag', selected); setShowBulkMenu(false); } },
                    { icon: UserCheck, label: 'Update Consent', action: () => { onBulkAction('consent', selected); setShowBulkMenu(false); } },
                    { icon: Download, label: 'Export', action: () => { onBulkAction('export', selected); setShowBulkMenu(false); } },
                    { icon: Trash2, label: 'Delete', action: handleBulkDelete },
                  ].map(item => (
                    <button
                      key={item.label}
                      onClick={item.action}
                      className="w-full flex items-center gap-2 px-3 py-2 text-[11px] text-left transition-colors hover:bg-white/[0.06]"
                      style={{ color: item.label === 'Delete' ? '#EF4444' : 'var(--foreground)' }}
                    >
                      <item.icon className="w-3.5 h-3.5" />
                      {item.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        <div className="ml-auto flex w-full justify-end sm:w-auto">
          <button
            onClick={onCreateContact}
            className="flex items-center gap-1 rounded-lg px-3 py-[5px] text-[11px] font-semibold transition-all hover:shadow-md"
            style={{ background: 'var(--primary)', color: '#fff' }}
          >
            <Plus className="w-3 h-3" />
            New Contact
          </button>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="flex items-center gap-2 overflow-x-auto px-2 py-2 sm:gap-3 sm:px-5" style={{ borderBottom: '1px solid var(--border)' }}>
        {[
          { label: 'Total', val: contacts.length, color: '#2563EB' },
          { label: 'Consent Given', val: contacts.filter(c => c.consent === 'Given').length, color: '#10B981' },
          { label: 'Pending', val: contacts.filter(c => c.consent === 'Pending').length, color: '#F59E0B' },
          { label: 'Withdrawn', val: contacts.filter(c => c.consent === 'Withdrawn').length, color: '#EF4444' },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-1.5 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
            <span className="text-[10px] font-medium" style={{ color: 'var(--muted-foreground)' }}>{s.label}</span>
            <span className="text-[11px] font-bold" style={{ color: 'var(--foreground)' }}>{s.val}</span>
          </div>
        ))}
        {loading && <span className="text-[10px] ml-auto animate-pulse" style={{ color: 'var(--muted-foreground)' }}>Loading…</span>}
      </div>

      {/* ── LIST VIEW ── */}
      {viewMode === 'list' && (
        <div className="overflow-x-auto [-webkit-overflow-scrolling:touch]">
          <table className="min-w-[700px] w-full">
            <thead>
              <tr style={{ background: 'var(--glass-bg)' }}>
                <th style={{ ...TH, width: 32, padding: '8px 10px' }}>
                  <input type="checkbox" checked={allSelected} onChange={toggleAll}
                    className="w-3.5 h-3.5 rounded accent-[color:var(--primary)]" style={{ borderColor: 'var(--border-strong)' }} />
                </th>
                <th style={TH}>
                  <button className="flex items-center gap-1" onClick={() => handleSort('name')}>Contact <SortIcon field="name" /></button>
                </th>
                <th style={TH}>
                  <button className="flex items-center gap-1" onClick={() => handleSort('email')}>Email <SortIcon field="email" /></button>
                </th>
                <th style={TH}>Phone</th>
                <th style={TH}>Company</th>
                <th style={TH}>
                  <button className="flex items-center gap-1" onClick={() => handleSort('consent')}>Consent <SortIcon field="consent" /></button>
                </th>
                <th style={TH}>Tags</th>
                <th style={{ ...TH, width: 36 }}></th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((contact, i) => {
                const isSelected = selected.includes(contact.id);
                return (
                  <motion.tr
                    key={contact.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    onClick={() => onContactClick(contact)}
                    className="cursor-pointer transition-colors group"
                    style={{ background: isSelected ? 'rgba(37,99,235,0.04)' : 'transparent', borderBottom: '1px solid var(--border)' }}
                  >
                    <td className="px-2.5 py-2" onClick={(e) => e.stopPropagation()}>
                      {/* toggleOne only in onChange — not on td, or checkbox clicks double-toggle. */}
                      <label className="flex cursor-pointer items-center justify-center py-0.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleOne(contact.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="relative z-10 w-3.5 h-3.5 cursor-pointer rounded accent-[color:var(--primary)]"
                          style={{ borderColor: 'var(--border-strong)' }}
                        />
                      </label>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2.5">
                        <ContactAvatar name={contact.name} />
                        <div className="min-w-0">
                          <span className="text-[12px] font-medium group-hover:underline block truncate" style={{ color: 'var(--foreground)' }}>{contact.name}</span>
                          {contact.jobTitle && <span className="text-[10px] block truncate" style={{ color: 'var(--muted-foreground)' }}>{contact.jobTitle}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <span className="text-[11px]" style={{ color: 'var(--foreground)' }}>{contact.email}</span>
                    </td>
                    <td className="px-3 py-2">
                      <span className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>{contact.phone || '—'}</span>
                    </td>
                    <td className="px-3 py-2">
                      <span className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>{contact.company || '—'}</span>
                    </td>
                    <td className="px-3 py-2"><ConsentBadge consent={contact.consent} /></td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1 flex-wrap">
                        {contact.tags.length > 0 ? contact.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-md font-medium"
                            style={{ background: 'var(--glass-bg)', border: '1px solid var(--border)', color: 'var(--muted-foreground)' }}>
                            {tag}
                          </span>
                        )) : <span className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>—</span>}
                      </div>
                    </td>
                    <td className="px-2 py-2" onClick={e => e.stopPropagation()}>
                      <button className="opacity-0 group-hover:opacity-100 p-1 rounded-md transition-opacity" style={{ color: 'var(--muted-foreground)' }}>
                        <MoreHorizontal className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </motion.tr>
                );
              })}

              {sorted.length === 0 && !loading && (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border)' }}>
                        <Users2 className="w-6 h-6" style={{ color: 'var(--muted-foreground)' }} />
                      </div>
                      <div>
                        <p className="text-[13px] font-medium" style={{ color: 'var(--foreground)' }}>
                          {search ? 'No matching contacts' : 'No contacts yet'}
                        </p>
                        <p className="text-[11px] mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                          {search ? 'Try adjusting your search or filters' : 'Add your first contact to get started'}
                        </p>
                      </div>
                      {!search && (
                        <button onClick={onCreateContact} className="mt-1 flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-medium" style={{ background: 'var(--primary)', color: '#fff' }}>
                          <Plus className="w-3 h-3" /> Add Contact
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── GRID VIEW ── */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-3 sm:p-5">
          {sorted.map((contact, i) => (
            <motion.div
              key={contact.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => onContactClick(contact)}
              className="rounded-xl p-4 cursor-pointer transition-all hover:shadow-md group"
              style={{ background: 'var(--glass-bg)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-start gap-3 mb-3">
                <ContactAvatar name={contact.name} />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold truncate group-hover:underline" style={{ color: 'var(--foreground)' }}>{contact.name}</p>
                  <p className="text-[10px] truncate" style={{ color: 'var(--muted-foreground)' }}>{contact.email}</p>
                </div>
                <ConsentBadge consent={contact.consent} />
              </div>
              <div className="space-y-1.5">
                {contact.company && (
                  <div className="flex items-center gap-1.5">
                    <Building className="w-3 h-3" style={{ color: 'var(--muted-foreground)' }} />
                    <span className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>{contact.company}</span>
                  </div>
                )}
                {contact.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3 h-3" style={{ color: 'var(--muted-foreground)' }} />
                    <span className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>{contact.phone}</span>
                  </div>
                )}
              </div>
              {contact.tags.length > 0 && (
                <div className="flex items-center gap-1 mt-2 flex-wrap">
                  {contact.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-md font-medium"
                      style={{ background: 'rgba(37,99,235,0.08)', color: 'var(--primary)', border: '1px solid rgba(37,99,235,0.15)' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
          {sorted.length === 0 && !loading && (
            <div className="col-span-full py-16 text-center">
              <p className="text-[13px] font-medium" style={{ color: 'var(--foreground)' }}>No contacts found</p>
              <p className="text-[11px] mt-1" style={{ color: 'var(--muted-foreground)' }}>Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      )}

      {/* ── KANBAN VIEW ── */}
      {viewMode === 'kanban' && (
        <div className="flex gap-3 p-3 sm:p-5 overflow-x-auto min-h-[400px]">
          {kanbanCols.map(col => {
            const items = sorted.filter(c => c.consent === col.consent);
            return (
              <div key={col.consent} className="flex-1 min-w-[240px] rounded-xl p-3" style={{ background: col.color, border: `1px solid ${col.borderColor}` }}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[11px] font-semibold" style={{ color: 'var(--foreground)' }}>{col.title}</h3>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: 'var(--glass-bg)', color: 'var(--muted-foreground)' }}>{items.length}</span>
                </div>
                <div className="space-y-2">
                  {items.map(contact => (
                    <motion.div
                      key={contact.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={() => onContactClick(contact)}
                      className="rounded-lg p-3 cursor-pointer transition-all hover:shadow-sm"
                      style={{ background: 'var(--background)', border: '1px solid var(--border)' }}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <ContactAvatar name={contact.name} />
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-medium truncate" style={{ color: 'var(--foreground)' }}>{contact.name}</p>
                          <p className="text-[9px] truncate" style={{ color: 'var(--muted-foreground)' }}>{contact.email}</p>
                        </div>
                      </div>
                      {contact.company && (
                        <p className="text-[9px] mt-1" style={{ color: 'var(--muted-foreground)' }}>{contact.company}</p>
                      )}
                    </motion.div>
                  ))}
                  {items.length === 0 && (
                    <p className="text-[10px] text-center py-6" style={{ color: 'var(--muted-foreground)' }}>No contacts</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer count */}
      {sorted.length > 0 && (
        <div className="px-2 py-2 text-[10px] font-medium sm:px-5" style={{ color: 'var(--muted-foreground)', borderTop: '1px solid var(--border)' }}>
          Showing {sorted.length} of {contacts.length} contact{contacts.length !== 1 ? 's' : ''}
          {search && <span> · Filtered by &quot;{search}&quot;</span>}
        </div>
      )}
    </div>
  );
}
