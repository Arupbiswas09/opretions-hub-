'use client';
import React, { useState } from 'react';
import { Search, Filter, SlidersHorizontal, MoreHorizontal, CheckCircle2, Plus } from 'lucide-react';
import { motion } from 'motion/react';

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
}

/* ─── Avatar chip ─── */
function AvatarChip({ name, initials }: { name: string; initials: string }) {
  const colors = ['#2563EB', '#059669', '#D97706', '#7C3AED', '#0D9488', '#DC2626'];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
      style={{ background: color }}>
      {initials}
    </div>
  );
}

/* ─── Tag pill ─── */
function Tag({ label }: { label: string }) {
  return (
    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
      style={{
        background: 'var(--glass-bg)',
        border: '1px solid var(--border)',
        color: 'var(--muted-foreground)',
      }}>
      {label}
    </span>
  );
}

/* ─── Sort badge ─── */
function SortBadge({ count, onClick }: { count: number; onClick: () => void }) {
  if (count === 0) {
    return (
      <button onClick={onClick}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium"
        style={{
          background: 'var(--glass-bg)',
          border: '1px solid var(--border)',
          color: 'var(--foreground)',
        }}>
        <SlidersHorizontal className="w-3.5 h-3.5" style={{ color: 'var(--muted-foreground)' }} />
        Sort
      </button>
    );
  }
  return (
    <button onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium"
      style={{
        background: 'rgba(37,99,235,0.10)',
        border: '1px solid rgba(37,99,235,0.25)',
        color: 'var(--primary)',
      }}>
      <SlidersHorizontal className="w-3.5 h-3.5" />
      Sort {count}
    </button>
  );
}

const CLIENTS: Client[] = [
  {
    id: '1', name: 'Acme Corporation', initials: 'AC',
    contactName: 'Sample Client', contactEmail: 'contact@acmecorp.com',
    emailVerified: true, tags: ['Enterprise', 'VIP'],
    status: 'Active', industry: 'Technology', owner: 'John Doe',
    projects: 3, revenue: '$125,000', lastActivity: 'Today',
  },
  {
    id: '2', name: 'Tech Startup Inc', initials: 'TS',
    contactName: 'Jane Smith', contactEmail: 'jane@techstartup.com',
    emailVerified: false, tags: ['Startup', 'High Growth'],
    status: 'Active', industry: 'Software', owner: 'Jane Smith',
    projects: 2, revenue: '$45,000', lastActivity: '2 days ago',
  },
  {
    id: '3', name: 'Local Retail Co', initials: 'LR',
    contactName: 'Mike Johnson', contactEmail: 'mike@localretail.com',
    emailVerified: true, tags: ['SMB'],
    status: 'Onboarding', industry: 'Retail', owner: 'John Doe',
    projects: 1, revenue: '$15,000', lastActivity: '1 week ago',
  },
  {
    id: '4', name: 'FinTech Solutions', initials: 'FS',
    contactName: 'Sarah Wilson', contactEmail: 'sarah@fintech.com',
    emailVerified: true, tags: ['Enterprise', 'Strategic'],
    status: 'Active', industry: 'Finance', owner: 'Sarah Wilson',
    projects: 2, revenue: '$85,000', lastActivity: '3 days ago',
  },
  {
    id: '5', name: 'Marketing Agency Pro', initials: 'MA',
    contactName: 'Mike Chen', contactEmail: 'mike@mapro.com',
    emailVerified: false, tags: ['Partner'],
    status: 'Inactive', industry: 'Marketing', owner: 'Mike Chen',
    projects: 0, revenue: '$0', lastActivity: '3 months ago',
  },
];

const TH_STYLE: React.CSSProperties = {
  padding: '10px 16px',
  textAlign: 'left',
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  color: 'var(--muted-foreground)',
  borderBottom: '1px solid var(--border)',
  whiteSpace: 'nowrap',
};

export function CL01ClientsList({ onClientClick, onCreateClient }: CL01ClientsListProps) {
  const [search, setSearch] = useState('');
  const [sortCount, setSortCount] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);

  const filtered = CLIENTS.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.contactName.toLowerCase().includes(search.toLowerCase()) ||
    c.contactEmail.toLowerCase().includes(search.toLowerCase())
  );

  const allSelected = filtered.length > 0 && selected.length === filtered.length;
  const toggleAll = () => setSelected(allSelected ? [] : filtered.map(c => c.id));
  const toggleOne = (id: string) => setSelected(prev =>
    prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
  );

  return (
    <div>
      {/* ── Toolbar — Bonsai exact: Search · Filter · Sort · ··· · New Client ── */}
      <div
        className="flex flex-wrap items-center gap-2 px-3 py-3 sm:px-6"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        {/* Search */}
        <div className="relative flex min-w-0 flex-1 basis-[200px] sm:max-w-xs">
          <Search className="absolute left-2.5 w-3.5 h-3.5 pointer-events-none" style={{ color: 'var(--muted-foreground)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search…"
            className="w-full rounded-lg py-[6px] pl-8 pr-3 text-[12px] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            style={{
              background: 'var(--search-bg)',
              border: '1px solid var(--search-border)',
              color: 'var(--foreground)',
            }}
          />
        </div>

        {/* Filter */}
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium"
          style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--border)',
            color: 'var(--foreground)',
          }}>
          <Filter className="w-3.5 h-3.5" style={{ color: 'var(--muted-foreground)' }} />
          Filter
        </button>

        {/* Sort — shows "Sort 1" badge when active */}
        <SortBadge count={sortCount} onClick={() => setSortCount(sortCount === 0 ? 1 : 0)} />

        {/* More */}
        <button className="p-1.5 rounded-lg" style={{ color: 'var(--muted-foreground)' }}>
          <MoreHorizontal className="w-4 h-4" />
        </button>

        <div className="ml-auto flex w-full justify-end sm:w-auto">
          <button
            type="button"
            onClick={onCreateClient}
            className="flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-[12px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            style={{ background: 'var(--primary)', color: '#FFFFFF' }}>
            <Plus className="w-3.5 h-3.5" />
            New Client
          </button>
        </div>
      </div>

      {/* ── Table — Bonsai exact columns: Client · Contact Name · Contact Email · Tags · ··· ── */}
      <div className="overflow-x-auto [-webkit-overflow-scrolling:touch]">
        <table className="min-w-[640px] w-full">
          <thead>
            <tr style={{ background: 'var(--glass-bg)' }}>
              <th style={{ ...TH_STYLE, width: 36, padding: '10px 12px' }}>
                <input type="checkbox" checked={allSelected} onChange={toggleAll}
                  className="w-3.5 h-3.5 rounded border accent-[color:var(--primary)]"
                  style={{ borderColor: 'var(--border-strong)' }} />
              </th>
              {/* Sortable client column */}
              <th style={TH_STYLE}>
                <button className="flex items-center gap-1" onClick={() => setSortCount(s => s === 0 ? 1 : 0)}>
                  Client
                  {sortCount > 0 && (
                    <span className="text-[9px] font-bold px-1 py-0.5 rounded"
                      style={{ background: 'rgba(37,99,235,0.12)', color: 'var(--primary)' }}>
                      {sortCount}
                    </span>
                  )}
                </button>
              </th>
              <th style={TH_STYLE}>Contact Name</th>
              <th style={TH_STYLE}>Contact Email</th>
              <th style={TH_STYLE}>Tags</th>
              <th style={{ ...TH_STYLE, width: 40 }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((client, i) => {
              const isSelected = selected.includes(client.id);
              return (
                <motion.tr
                  key={client.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => onClientClick({
                    id: client.id, name: client.name, industry: client.industry,
                    status: client.status, owner: client.owner, contacts: 1,
                    projects: client.projects, revenue: client.revenue,
                    lastActivity: client.lastActivity, tags: client.tags,
                    email: client.contactEmail,
                  })}
                  className="cursor-pointer transition-colors group"
                  style={{
                    background: isSelected ? 'rgba(37,99,235,0.05)' : 'transparent',
                    borderBottom: '1px solid var(--border)',
                  }}>
                  {/* Checkbox */}
                  <td className="px-3 py-3" onClick={e => { e.stopPropagation(); toggleOne(client.id); }}>
                    <input type="checkbox" checked={isSelected} onChange={() => toggleOne(client.id)}
                      className="w-3.5 h-3.5 rounded accent-[color:var(--primary)]"
                      style={{ borderColor: 'var(--border-strong)' }} />
                  </td>

                  {/* Client — avatar chip + name */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <AvatarChip name={client.name} initials={client.initials} />
                      <span className="text-[13px] font-medium group-hover:underline"
                        style={{ color: 'var(--foreground)' }}>
                        {client.name}
                      </span>
                    </div>
                  </td>

                  {/* Contact Name */}
                  <td className="px-4 py-3">
                    <span className="text-[13px]" style={{ color: 'var(--foreground)' }}>
                      {client.contactName}
                    </span>
                  </td>

                  {/* Contact Email — with verified badge */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[12px]" style={{ color: 'var(--foreground)' }}>
                        {client.contactEmail}
                      </span>
                      {client.emailVerified && (
                        <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#059669' }} />
                      )}
                    </div>
                  </td>

                  {/* Tags */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 flex-wrap">
                      {client.tags.length > 0
                        ? client.tags.map(tag => <Tag key={tag} label={tag} />)
                        : <span className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>No tags</span>
                      }
                    </div>
                  </td>

                  {/* More */}
                  <td className="px-3 py-3" onClick={e => e.stopPropagation()}>
                    <button className="opacity-0 group-hover:opacity-100 p-1 rounded-md transition-opacity"
                      style={{ color: 'var(--muted-foreground)' }}>
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </motion.tr>
              );
            })}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-[13px]"
                  style={{ color: 'var(--muted-foreground)' }}>
                  No clients found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
