'use client';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Search, Filter, SlidersHorizontal, MoreHorizontal, CheckCircle2, Plus,
  ChevronDown, X, ArrowUpDown, ArrowUp, ArrowDown, Building2, Trash2, Archive,
  Mail, Tag, Download,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from '../bonsai/ToastSystem';
import { dispatchDataInvalidation } from '../../lib/hub-events';

interface Client {
  id: string;
  name: string;
  initials: string;
  contactName: string;
  contactEmail: string;
  emailVerified?: boolean;
  tags: string[];
  status: 'Active' | 'Onboarding' | 'Inactive' | 'Archived';
  industry: string;
  owner: string;
  projects: number;
  revenue: string;
  lastActivity: string;
}

interface CL01ClientsListProps {
  onClientClick: (client: any) => void;
  onCreateClient: () => void;
  onBulkAction?: (action: string, selected: string[]) => void;
  dataRefreshVersion?: number;
}

function mapClientFromApi(r: Record<string, unknown>): Client {
  const name = String(r.name ?? '');
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?';
  const updated = r.updated_at ? String(r.updated_at).slice(0, 10) : '—';
  return {
    id: String(r.id),
    name,
    initials,
    contactName: name,
    contactEmail: '—',
    emailVerified: false,
    tags: [],
    status: 'Active',
    industry: '—',
    owner: '—',
    projects: 0,
    revenue: '—',
    lastActivity: updated,
  };
}

/* ─── Avatar ─── */
function AvatarChip({ name, initials }: { name: string; initials: string }) {
  const palettes = [
    ['#2563EB', '#3B82F6'], ['#059669', '#10B981'], ['#D97706', '#F59E0B'],
    ['#7C3AED', '#8B5CF6'], ['#0D9488', '#14B8A6'], ['#DC2626', '#EF4444'],
  ];
  const [bg, ] = palettes[name.charCodeAt(0) % palettes.length];
  return (
    <div
      className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 shadow-sm"
      style={{ background: `linear-gradient(135deg, ${bg}, ${palettes[name.charCodeAt(0) % palettes.length][1]})` }}
    >
      {initials}
    </div>
  );
}

/* ─── Status badge ─── */
function StatusDot({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string; border: string }> = {
    Active:     { bg: 'rgba(16,185,129,0.10)', text: '#10B981', border: 'rgba(16,185,129,0.25)' },
    Onboarding: { bg: 'rgba(245,158,11,0.10)', text: '#F59E0B', border: 'rgba(245,158,11,0.25)' },
    Inactive:   { bg: 'rgba(148,163,184,0.10)', text: '#94A3B8', border: 'rgba(148,163,184,0.25)' },
    Archived:   { bg: 'rgba(220,38,38,0.08)',   text: '#DC2626', border: 'rgba(220,38,38,0.20)' },
  };
  const s = map[status] || map.Active;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold"
      style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}` }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.text }} />
      {status}
    </span>
  );
}

/* ─── Tag pill ─── */
function TagPill({ label }: { label: string }) {
  return (
    <span
      className="text-[10px] px-1.5 py-0.5 rounded-md font-medium"
      style={{ background: 'var(--glass-bg)', border: '1px solid var(--border)', color: 'var(--muted-foreground)' }}
    >
      {label}
    </span>
  );
}

type SortField = 'name' | 'status' | 'lastActivity' | 'industry';
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

export function CL01ClientsList({ onClientClick, onCreateClient, dataRefreshVersion = 0 }: CL01ClientsListProps) {
  const { addToast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
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

  // Filter state
  const [filters, setFilters] = useState({
    status: 'all',
    industry: 'all',
  });

  // Listen for global search
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setGlobalSearch(detail?.q || '');
    };
    window.addEventListener('hub:global-search', handler);
    return () => window.removeEventListener('hub:global-search', handler);
  }, []);

  // Close dropdowns on outside click
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
        const res = await fetch('/api/clients?page=1&limit=200', { credentials: 'include' });
        const json = await res.json();
        if (cancelled) return;
        if (res.ok && Array.isArray(json.data)) setClients(json.data.map(mapClientFromApi));
        else setClients([]);
      } catch {
        if (!cancelled) setClients([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [dataRefreshVersion]);

  // Active search term (global overrides local)
  const search = globalSearch || localSearch;

  // Filter + search
  const filtered = clients.filter(c => {
    if (filters.status !== 'all' && c.status !== filters.status) return false;
    if (filters.industry !== 'all' && c.industry !== filters.industry) return false;
    if (search) {
      const q = search.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.contactEmail.toLowerCase().includes(q) || c.industry.toLowerCase().includes(q);
    }
    return true;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (!sortField) return 0;
    const av = a[sortField] || '';
    const bv = b[sortField] || '';
    const cmp = String(av).localeCompare(String(bv));
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const allSelected = sorted.length > 0 && selected.length === sorted.length;
  const toggleAll = () => setSelected(allSelected ? [] : sorted.map(c => c.id));
  const toggleOne = (id: string) => setSelected(prev =>
    prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 opacity-40" />;
    return sortDir === 'asc'
      ? <ArrowUp className="w-3 h-3" style={{ color: 'var(--primary)' }} />
      : <ArrowDown className="w-3 h-3" style={{ color: 'var(--primary)' }} />;
  };

  const activeFilterCount = Object.values(filters).filter(v => v !== 'all').length;
  const industries = [...new Set(clients.map(c => c.industry).filter(Boolean))];

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selected.map(id => fetch(`/api/clients/${id}`, { method: 'DELETE', credentials: 'include' })));
      addToast(`${selected.length} client${selected.length > 1 ? 's' : ''} deleted`, 'success');
      dispatchDataInvalidation('clients');
      setSelected([]);
    } catch {
      addToast('Failed to delete', 'error');
    }
    setShowBulkMenu(false);
  };

  return (
    <div>
      {/* ── Compact Toolbar ── */}
      <div
        className="flex flex-wrap items-center gap-1.5 px-3 py-2 sm:px-5"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        {/* Inline Search (syncs with global) */}
        <div className="relative flex min-w-0 flex-1 basis-[180px] sm:max-w-[240px]">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: 'var(--muted-foreground)' }} />
          <input
            value={globalSearch || localSearch}
            onChange={e => { setLocalSearch(e.target.value); setGlobalSearch(''); }}
            placeholder="Search clients…"
            className="w-full rounded-lg py-[5px] pl-7 pr-2.5 text-[11px] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            style={{ background: 'var(--search-bg)', border: '1px solid var(--search-border)', color: 'var(--foreground)' }}
          />
          {search && (
            <button
              onClick={() => { setLocalSearch(''); setGlobalSearch(''); }}
              className="absolute right-2 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--muted-foreground)' }}
            >
              <X className="w-3 h-3" />
            </button>
          )}
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
              <span className="ml-0.5 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center"
                style={{ background: 'var(--primary)', color: '#fff' }}>
                {activeFilterCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showFilterPanel && (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.97 }}
                transition={{ duration: 0.12 }}
                className="absolute left-0 top-full mt-1.5 z-50 w-64 rounded-xl p-3 space-y-3"
                style={{
                  background: 'var(--popover)',
                  border: '1px solid var(--border)',
                  boxShadow: 'var(--shadow-lg)',
                  backdropFilter: 'blur(24px) saturate(180%)',
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold" style={{ color: 'var(--foreground)' }}>Filters</span>
                  <button onClick={() => setFilters({ status: 'all', industry: 'all' })} className="text-[10px] font-medium" style={{ color: 'var(--primary)' }}>Clear all</button>
                </div>
                <div>
                  <label className="block text-[10px] font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Status</label>
                  <select
                    value={filters.status}
                    onChange={e => setFilters({ ...filters, status: e.target.value })}
                    className="w-full rounded-lg px-2.5 py-1.5 text-[11px]"
                    style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                  >
                    <option value="all">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Onboarding">Onboarding</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Industry</label>
                  <select
                    value={filters.industry}
                    onChange={e => setFilters({ ...filters, industry: e.target.value })}
                    className="w-full rounded-lg px-2.5 py-1.5 text-[11px]"
                    style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                  >
                    <option value="all">All Industries</option>
                    {industries.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sort */}
        <button
          onClick={() => handleSort('name')}
          className="flex items-center gap-1 px-2.5 py-[5px] rounded-lg text-[11px] font-medium"
          style={{
            background: sortField ? 'rgba(37,99,235,0.10)' : 'var(--glass-bg)',
            border: `1px solid ${sortField ? 'rgba(37,99,235,0.25)' : 'var(--border)'}`,
            color: sortField ? 'var(--primary)' : 'var(--foreground)',
          }}
        >
          <SlidersHorizontal className="w-3 h-3" />
          Sort
        </button>

        {/* Bulk actions */}
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
                  className="absolute left-0 top-full mt-1 z-50 w-44 rounded-lg py-1 overflow-hidden"
                  style={{ background: 'var(--popover)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}
                >
                  {[
                    { icon: Mail, label: 'Send Email', action: () => { addToast(`Email queued for ${selected.length} client(s)`, 'info'); setShowBulkMenu(false); } },
                    { icon: Tag, label: 'Add Tags', action: () => { addToast('Tags applied', 'info'); setShowBulkMenu(false); } },
                    { icon: Archive, label: 'Archive', action: () => { addToast(`${selected.length} archived`, 'success'); setShowBulkMenu(false); } },
                    { icon: Download, label: 'Export', action: () => { addToast('Export started', 'info'); setShowBulkMenu(false); } },
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

        {/* More */}
        <button className="p-1 rounded-lg" style={{ color: 'var(--muted-foreground)' }}>
          <MoreHorizontal className="w-3.5 h-3.5" />
        </button>

        <div className="ml-auto flex w-full justify-end sm:w-auto">
          <button
            type="button"
            onClick={onCreateClient}
            className="flex items-center gap-1 rounded-lg px-3 py-[5px] text-[11px] font-semibold transition-all hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            style={{ background: 'var(--primary)', color: '#FFFFFF' }}
          >
            <Plus className="w-3 h-3" />
            New Client
          </button>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="flex items-center gap-3 px-3 py-2 sm:px-5 overflow-x-auto" style={{ borderBottom: '1px solid var(--border)' }}>
        {[
          { label: 'Total', val: clients.length, color: '#2563EB' },
          { label: 'Active', val: clients.filter(c => c.status === 'Active').length, color: '#10B981' },
          { label: 'Onboarding', val: clients.filter(c => c.status === 'Onboarding').length, color: '#F59E0B' },
          { label: 'Inactive', val: clients.filter(c => c.status === 'Inactive').length, color: '#94A3B8' },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-1.5 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
            <span className="text-[10px] font-medium" style={{ color: 'var(--muted-foreground)' }}>{s.label}</span>
            <span className="text-[11px] font-bold" style={{ color: 'var(--foreground)' }}>{s.val}</span>
          </div>
        ))}
        {loading && <span className="text-[10px] ml-auto animate-pulse" style={{ color: 'var(--muted-foreground)' }}>Loading…</span>}
      </div>

      {/* ── Table ── */}
      <div className="overflow-x-auto [-webkit-overflow-scrolling:touch]">
        <table className="min-w-[640px] w-full">
          <thead>
            <tr style={{ background: 'var(--glass-bg)' }}>
              <th style={{ ...TH, width: 32, padding: '8px 10px' }}>
                <input type="checkbox" checked={allSelected} onChange={toggleAll}
                  className="w-3.5 h-3.5 rounded accent-[color:var(--primary)]"
                  style={{ borderColor: 'var(--border-strong)' }} />
              </th>
              <th style={TH}>
                <button className="flex items-center gap-1" onClick={() => handleSort('name')}>
                  Client <SortIcon field="name" />
                </button>
              </th>
              <th style={TH}>
                <button className="flex items-center gap-1" onClick={() => handleSort('status')}>
                  Status <SortIcon field="status" />
                </button>
              </th>
              <th style={TH}>
                <button className="flex items-center gap-1" onClick={() => handleSort('industry')}>
                  Industry <SortIcon field="industry" />
                </button>
              </th>
              <th style={TH}>Contact</th>
              <th style={TH}>Tags</th>
              <th style={{ ...TH, width: 36 }}></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((client, i) => {
              const isSelected = selected.includes(client.id);
              return (
                <motion.tr
                  key={client.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  onClick={() => onClientClick({
                    id: client.id, name: client.name, industry: client.industry,
                    status: client.status, owner: client.owner, contacts: 1,
                    projects: client.projects, revenue: client.revenue,
                    lastActivity: client.lastActivity, tags: client.tags,
                    email: client.contactEmail,
                  })}
                  className="cursor-pointer transition-colors group"
                  style={{
                    background: isSelected ? 'rgba(37,99,235,0.04)' : 'transparent',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  <td className="px-2.5 py-2.5" onClick={e => { e.stopPropagation(); toggleOne(client.id); }}>
                    <input type="checkbox" checked={isSelected} onChange={() => toggleOne(client.id)}
                      className="w-3.5 h-3.5 rounded accent-[color:var(--primary)]"
                      style={{ borderColor: 'var(--border-strong)' }} />
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <AvatarChip name={client.name} initials={client.initials} />
                      <div className="min-w-0">
                        <span className="text-[12px] font-medium group-hover:underline block truncate"
                          style={{ color: 'var(--foreground)' }}>
                          {client.name}
                        </span>
                        <span className="text-[10px] block truncate" style={{ color: 'var(--muted-foreground)' }}>
                          {client.lastActivity}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <StatusDot status={client.status} />
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>{client.industry}</span>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] truncate" style={{ color: 'var(--foreground)' }}>
                        {client.contactEmail}
                      </span>
                      {client.emailVerified && (
                        <CheckCircle2 className="w-3 h-3 flex-shrink-0" style={{ color: '#10B981' }} />
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1 flex-wrap">
                      {client.tags.length > 0
                        ? client.tags.slice(0, 2).map(tag => <TagPill key={tag} label={tag} />)
                        : <span className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>—</span>
                      }
                      {client.tags.length > 2 && (
                        <span className="text-[9px] font-medium" style={{ color: 'var(--muted-foreground)' }}>+{client.tags.length - 2}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-2 py-2.5" onClick={e => e.stopPropagation()}>
                    <button className="opacity-0 group-hover:opacity-100 p-1 rounded-md transition-opacity"
                      style={{ color: 'var(--muted-foreground)' }}>
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </motion.tr>
              );
            })}

            {sorted.length === 0 && !loading && (
              <tr>
                <td colSpan={7} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border)' }}>
                      <Building2 className="w-6 h-6" style={{ color: 'var(--muted-foreground)' }} />
                    </div>
                    <div>
                      <p className="text-[13px] font-medium" style={{ color: 'var(--foreground)' }}>
                        {search ? 'No matching clients' : 'No clients yet'}
                      </p>
                      <p className="text-[11px] mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                        {search ? 'Try adjusting your search or filters' : 'Create your first client to get started'}
                      </p>
                    </div>
                    {!search && (
                      <button onClick={onCreateClient} className="mt-1 flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-medium"
                        style={{ background: 'var(--primary)', color: '#fff' }}>
                        <Plus className="w-3 h-3" /> Add Client
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Results count */}
      {sorted.length > 0 && (
        <div className="px-3 py-2 sm:px-5 text-[10px] font-medium" style={{ color: 'var(--muted-foreground)', borderTop: '1px solid var(--border)' }}>
          Showing {sorted.length} of {clients.length} client{clients.length !== 1 ? 's' : ''}
          {search && <span> · Filtered by "{search}"</span>}
        </div>
      )}
    </div>
  );
}
