import React, { useState } from 'react';
import { Plus, List, LayoutGrid, Columns3, Settings, Filter, Mail, Tag, UserCheck, Download, Trash2 } from 'lucide-react';
import { BonsaiButton } from '../bonsai/BonsaiButton';
import { BonsaiStatusPill } from '../bonsai/BonsaiStatusPill';
import { EnhancedTable } from '../operations/EnhancedTable';
import { BonsaiGridCards } from '../bonsai/BonsaiGridCards';
import { HubStatTile, OpsAvatar } from '../ops';

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
}

export function CO01ContactsList({ onContactClick, onCreateContact, onBulkAction, onShowBulkToolbar }: CO01ContactsListProps) {
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'kanban'>('list');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showColumnChooser, setShowColumnChooser] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all',
    linkedClient: 'all',
    consent: 'all',
    gdprStatus: 'all',
    source: 'all',
    tags: 'all',
  });

  const contacts: Contact[] = [
    {
      id: '1',
      name: 'Jennifer Davis',
      email: 'jennifer@acmecorp.com',
      phone: '(555) 123-4567',
      type: 'Client',
      linkedClient: 'Acme Corp',
      consent: 'Given',
      gdprStatus: 'Active',
      source: 'Website',
      tags: ['VIP', 'Decision Maker'],
      lastContact: 'Jan 10, 2026',
    },
    {
      id: '2',
      name: 'Michael Chen',
      email: 'mchen@techstartup.io',
      phone: '(555) 234-5678',
      type: 'Lead',
      linkedClient: 'Tech Startup',
      consent: 'Given',
      gdprStatus: 'Active',
      source: 'Referral',
      tags: ['Qualified'],
      lastContact: 'Jan 8, 2026',
    },
    {
      id: '3',
      name: 'Sarah Thompson',
      email: 'sarah.t@example.com',
      phone: '(555) 345-6789',
      type: 'Candidate',
      linkedClient: '-',
      consent: 'Pending',
      gdprStatus: 'Active',
      source: 'LinkedIn',
      tags: ['Designer', 'Senior'],
      lastContact: 'Jan 5, 2026',
    },
    {
      id: '4',
      name: 'David Rodriguez',
      email: 'david@localretail.com',
      phone: '(555) 456-7890',
      type: 'Client',
      linkedClient: 'Local Retail',
      consent: 'Given',
      gdprStatus: 'Export Requested',
      source: 'Cold Outreach',
      tags: ['Active'],
      lastContact: 'Jan 3, 2026',
    },
    {
      id: '5',
      name: 'Emma Wilson',
      email: 'emma.wilson@agency.com',
      phone: '(555) 567-8901',
      type: 'Partner',
      linkedClient: 'Partner Agency',
      consent: 'Withdrawn',
      gdprStatus: 'Deletion Requested',
      source: 'Event',
      tags: ['Partnership'],
      lastContact: 'Dec 28, 2025',
    },
  ];

  const availableColumns = [
    { key: 'name', label: 'Name', visible: true },
    { key: 'email', label: 'Email', visible: true },
    { key: 'phone', label: 'Phone', visible: true },
    { key: 'type', label: 'Type', visible: true },
    { key: 'linkedClient', label: 'Linked Client', visible: true },
    { key: 'consent', label: 'Consent', visible: true },
    { key: 'gdprStatus', label: 'GDPR Status', visible: false },
    { key: 'source', label: 'Source', visible: false },
    { key: 'tags', label: 'Tags', visible: true },
    { key: 'lastContact', label: 'Last Contact', visible: true },
  ];

  const [visibleColumns, setVisibleColumns] = useState(availableColumns);

  const handleBulkAction = (action: string) => {
    if (selectedContacts.length > 0) {
      onBulkAction(action, selectedContacts);
      if (action === 'show-toolbar') {
        onShowBulkToolbar();
      }
    }
  };

  return (
    <div className="px-3 py-6 sm:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold text-stone-800 dark:text-stone-100">Contacts</h1>
          <p className="text-sm text-stone-500 dark:text-stone-400">Manage all contacts with GDPR compliance</p>
        </div>
        <div className="flex min-w-0 flex-wrap items-center justify-end gap-2 sm:gap-3">
          {/* View Switcher */}
          <div
            className="flex shrink-0 items-center gap-1 rounded-lg p-1"
            style={{ background: 'var(--table-header-bg)', border: '1px solid var(--border)' }}
          >
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`rounded p-2 transition-[background-color] duration-[120ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 ${viewMode === 'list' ? 'bg-primary/10 text-primary' : 'text-stone-600 hover:bg-[var(--row-hover-bg)] dark:text-stone-400'}`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={`rounded p-2 transition-[background-color] duration-[120ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 ${viewMode === 'kanban' ? 'bg-primary/10 text-primary' : 'text-stone-600 hover:bg-[var(--row-hover-bg)] dark:text-stone-400'}`}
              title="Kanban View"
            >
              <Columns3 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`rounded p-2 transition-[background-color] duration-[120ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 ${viewMode === 'grid' ? 'bg-primary/10 text-primary' : 'text-stone-600 hover:bg-[var(--row-hover-bg)] dark:text-stone-400'}`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          {/* Column Chooser */}
          <div className="relative">
            <BonsaiButton
              variant="ghost"
              size="sm"
              icon={<Settings />}
              onClick={() => setShowColumnChooser(!showColumnChooser)}
            >
              Columns
            </BonsaiButton>
            {showColumnChooser && (
              <div
                className="absolute right-0 top-full z-10 mt-2 w-64 rounded-xl p-4"
                style={{
                  background: 'var(--popover)',
                  backdropFilter: 'blur(48px) saturate(200%)',
                  WebkitBackdropFilter: 'blur(48px) saturate(200%)',
                  border: '1px solid var(--border)',
                  boxShadow: 'var(--shadow-modal, var(--shadow-lg))',
                }}
              >
                <h3 className="mb-3 text-sm font-medium" style={{ color: 'var(--foreground)' }}>Show Columns</h3>
                <div className="max-h-64 space-y-2 overflow-y-auto">
                  {visibleColumns.map((col) => (
                    <label key={col.key} className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={col.visible}
                        onChange={(e) => {
                          setVisibleColumns(
                            visibleColumns.map((c) =>
                              c.key === col.key ? { ...c, visible: e.target.checked } : c
                            )
                          );
                        }}
                        className="h-4 w-4 rounded border-border"
                        style={{ accentColor: 'var(--primary)' }}
                      />
                      <span className="text-sm" style={{ color: 'var(--foreground-secondary, var(--foreground))' }}>{col.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Filters */}
          <BonsaiButton
            variant="ghost"
            size="sm"
            icon={<Filter />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters
          </BonsaiButton>

          <BonsaiButton variant="primary" icon={<Plus />} onClick={onCreateContact}>
            Create Contact
          </BonsaiButton>
        </div>
      </div>

      {/* Stats — same glass hierarchy as Dashboard KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        {[
          { label: 'Total Contacts', val: contacts.length },
          { label: 'Consent Given', val: contacts.filter(c => c.consent === 'Given').length },
          { label: 'Pending Consent', val: contacts.filter(c => c.consent === 'Pending').length },
          { label: 'Export Requests', val: contacts.filter(c => c.gdprStatus === 'Export Requested').length },
          { label: 'Deletion Requests', val: contacts.filter(c => c.gdprStatus === 'Deletion Requested').length },
        ].map((s, i) => (
          <HubStatTile key={s.label} label={s.label} value={s.val} delay={i * 0.05} />
        ))}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div
          className="mb-6 rounded-lg border p-4"
          style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-6">
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
              >
                <option value="all">All Types</option>
                <option value="client">Client</option>
                <option value="lead">Lead</option>
                <option value="candidate">Candidate</option>
                <option value="partner">Partner</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Linked Client</label>
              <select
                value={filters.linkedClient}
                onChange={(e) => setFilters({ ...filters, linkedClient: e.target.value })}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
              >
                <option value="all">All Clients</option>
                <option value="linked">Linked</option>
                <option value="unlinked">Not Linked</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Consent</label>
              <select
                value={filters.consent}
                onChange={(e) => setFilters({ ...filters, consent: e.target.value })}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
              >
                <option value="all">All</option>
                <option value="given">Given</option>
                <option value="pending">Pending</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>GDPR Status</label>
              <select
                value={filters.gdprStatus}
                onChange={(e) => setFilters({ ...filters, gdprStatus: e.target.value })}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="export">Export Requested</option>
                <option value="deletion">Deletion Requested</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Source</label>
              <select
                value={filters.source}
                onChange={(e) => setFilters({ ...filters, source: e.target.value })}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
              >
                <option value="all">All Sources</option>
                <option value="website">Website</option>
                <option value="referral">Referral</option>
                <option value="linkedin">LinkedIn</option>
                <option value="event">Event</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Tags</label>
              <select
                value={filters.tags}
                onChange={(e) => setFilters({ ...filters, tags: e.target.value })}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
              >
                <option value="all">All Tags</option>
                <option value="vip">VIP</option>
                <option value="qualified">Qualified</option>
                <option value="active">Active</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions Bar (when items selected) */}
      {selectedContacts.length > 0 && (
        <div className="mb-6 flex flex-col gap-3 rounded-lg border border-primary/20 bg-primary/10 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-primary">
            {selectedContacts.length} contact{selectedContacts.length > 1 ? 's' : ''} selected
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <BonsaiButton size="sm" variant="ghost" icon={<Mail />} onClick={() => handleBulkAction('email')}>
              Send Email
            </BonsaiButton>
            <BonsaiButton size="sm" variant="ghost" icon={<Tag />} onClick={() => handleBulkAction('tag')}>
              Add Tag
            </BonsaiButton>
            <BonsaiButton size="sm" variant="ghost" icon={<UserCheck />} onClick={() => handleBulkAction('consent')}>
              Update Consent
            </BonsaiButton>
            <BonsaiButton size="sm" variant="ghost" icon={<Download />} onClick={() => handleBulkAction('export')}>
              Export
            </BonsaiButton>
            <BonsaiButton size="sm" variant="destructive" icon={<Trash2 />} onClick={() => handleBulkAction('delete')}>
              Delete
            </BonsaiButton>
            <button
              type="button"
              onClick={() => handleBulkAction('show-toolbar')}
              className="ml-0 rounded-lg px-3 py-1.5 text-xs font-medium sm:ml-2"
              style={{ background: 'var(--secondary)', color: 'var(--secondary-foreground)' }}
            >
              Show CO-06
            </button>
          </div>
        </div>
      )}

      {/* Content based on view mode */}
      {viewMode === 'list' && (
        <EnhancedTable
          columns={visibleColumns
            .filter(col => col.visible)
            .map(col => ({ key: col.key, label: col.label, sortable: true }))}
          data={contacts.map(contact => ({
            ...contact,
            name: (
              <div className="flex items-center gap-3">
                <OpsAvatar name={contact.name} size="md" />
                <div>
                  <p className="text-[13px] font-medium text-stone-800 dark:text-stone-100">{contact.name}</p>
                  <p className="text-[10px] text-stone-400 dark:text-stone-500">{contact.email}</p>
                </div>
              </div>
            ),
            type: (
              <span className="inline-flex rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                {contact.type}
              </span>
            ),
            consent: (
              <BonsaiStatusPill
                status={contact.consent === 'Given' ? 'completed' : contact.consent === 'Pending' ? 'pending' : 'overdue'}
                label={contact.consent}
              />
            ),
            gdprStatus: (
              <BonsaiStatusPill
                status={contact.gdprStatus === 'Active' ? 'active' : contact.gdprStatus === 'Deletion Requested' ? 'overdue' : 'pending'}
                label={contact.gdprStatus}
              />
            ),
            tags: (
              <div className="flex gap-1 flex-wrap">
                {contact.tags.map((tag, idx) => (
                  <span key={idx} className="inline-flex rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    {tag}
                  </span>
                ))}
              </div>
            ),
          }))}
          onRowClick={(row) => onContactClick(row as Contact)}
          searchable
          filterable
          selectable
          onSelectionChange={setSelectedContacts}
        />
      )}

      {viewMode === 'grid' && (
        <BonsaiGridCards
          columns={3}
          cards={contacts.map(contact => ({
            id: contact.id,
            title: contact.name,
            subtitle: contact.email,
            status: contact.consent,
            meta: [contact.type, contact.linkedClient, contact.lastContact],
          }))}
          onCardClick={(card) => {
            const contact = contacts.find(c => c.id === card.id);
            if (contact) onContactClick(contact);
          }}
        />
      )}

      {viewMode === 'kanban' && (
        <div
          className="rounded-lg border py-12 text-center"
          style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
        >
          <p className="mb-2" style={{ color: 'var(--foreground-secondary, var(--foreground))' }}>Kanban view groups contacts by consent status</p>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>(Given / Pending / Withdrawn columns)</p>
        </div>
      )}
    </div>
  );
}
