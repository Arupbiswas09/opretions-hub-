import React, { useState } from 'react';
import { Plus, List, LayoutGrid, Columns3, Settings, Filter, Mail, Tag, UserCheck, Download, Trash2 } from 'lucide-react';
import { BonsaiButton } from '../bonsai/BonsaiButton';
import { BonsaiStatusPill } from '../bonsai/BonsaiStatusPill';
import { EnhancedTable } from '../operations/EnhancedTable';
import { BonsaiGridCards } from '../bonsai/BonsaiGridCards';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: string;
  linkedClient: string;
  consent: 'Given' | 'Pending' | 'Withdrawn';
  gdprStatus: 'Active' | 'Export Requested' | 'Deletion Requested';
  source: string;
  tags: string[];
  lastContact: string;
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
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-stone-800">Contacts</h1>
          <p className="text-sm text-stone-500">Manage all contacts with GDPR compliance</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Switcher */}
          <div className="flex items-center gap-1 bg-white border border-stone-200 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary/10 text-primary' : 'text-stone-600 hover:bg-stone-100'}`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-2 rounded ${viewMode === 'kanban' ? 'bg-primary/10 text-primary' : 'text-stone-600 hover:bg-stone-100'}`}
              title="Kanban View"
            >
              <Columns3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary/10 text-primary' : 'text-stone-600 hover:bg-stone-100'}`}
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
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-xl border border-stone-200 p-4 z-10">
                <h3 className="font-medium text-stone-800 mb-3">Show Columns</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {visibleColumns.map((col) => (
                    <label key={col.key} className="flex items-center gap-2 cursor-pointer">
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
                        className="w-4 h-4 rounded border-stone-300 text-primary focus:ring-2 focus:ring-primary/20"
                      />
                      <span className="text-sm text-stone-700">{col.label}</span>
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-stone-200 p-4">
          <p className="text-sm text-stone-600">Total Contacts</p>
          <p className="text-2xl font-semibold text-stone-800 mt-1">{contacts.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-stone-200 p-4">
          <p className="text-sm text-stone-600">Consent Given</p>
          <p className="text-2xl font-semibold text-green-600 mt-1">3</p>
        </div>
        <div className="bg-white rounded-lg border border-stone-200 p-4">
          <p className="text-sm text-stone-600">Pending Consent</p>
          <p className="text-2xl font-semibold text-amber-600 mt-1">1</p>
        </div>
        <div className="bg-white rounded-lg border border-stone-200 p-4">
          <p className="text-sm text-stone-600">Export Requests</p>
          <p className="text-2xl font-semibold text-blue-600 mt-1">1</p>
        </div>
        <div className="bg-white rounded-lg border border-stone-200 p-4">
          <p className="text-sm text-stone-600">Deletion Requests</p>
          <p className="text-2xl font-semibold text-red-600 mt-1">1</p>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-lg border border-stone-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm"
              >
                <option value="all">All Types</option>
                <option value="client">Client</option>
                <option value="lead">Lead</option>
                <option value="candidate">Candidate</option>
                <option value="partner">Partner</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Linked Client</label>
              <select
                value={filters.linkedClient}
                onChange={(e) => setFilters({ ...filters, linkedClient: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm"
              >
                <option value="all">All Clients</option>
                <option value="linked">Linked</option>
                <option value="unlinked">Not Linked</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Consent</label>
              <select
                value={filters.consent}
                onChange={(e) => setFilters({ ...filters, consent: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm"
              >
                <option value="all">All</option>
                <option value="given">Given</option>
                <option value="pending">Pending</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">GDPR Status</label>
              <select
                value={filters.gdprStatus}
                onChange={(e) => setFilters({ ...filters, gdprStatus: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="export">Export Requested</option>
                <option value="deletion">Deletion Requested</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Source</label>
              <select
                value={filters.source}
                onChange={(e) => setFilters({ ...filters, source: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm"
              >
                <option value="all">All Sources</option>
                <option value="website">Website</option>
                <option value="referral">Referral</option>
                <option value="linkedin">LinkedIn</option>
                <option value="event">Event</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Tags</label>
              <select
                value={filters.tags}
                onChange={(e) => setFilters({ ...filters, tags: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm"
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
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6 flex items-center justify-between">
          <p className="text-sm font-medium text-primary">
            {selectedContacts.length} contact{selectedContacts.length > 1 ? 's' : ''} selected
          </p>
          <div className="flex items-center gap-2">
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
              onClick={() => handleBulkAction('show-toolbar')}
              className="ml-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200"
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
            type: (
              <span className="inline-flex px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                {contact.type}
              </span>
            ),
            consent: (
              <BonsaiStatusPill
                status={contact.consent === 'Given' ? 'active' : contact.consent === 'Pending' ? 'pending' : 'inactive'}
                label={contact.consent}
              />
            ),
            gdprStatus: (
              <BonsaiStatusPill
                status={contact.gdprStatus === 'Active' ? 'active' : 'pending'}
                label={contact.gdprStatus}
              />
            ),
            tags: (
              <div className="flex gap-1 flex-wrap">
                {contact.tags.map((tag, idx) => (
                  <span key={idx} className="inline-flex px-2 py-0.5 text-xs rounded-full bg-stone-100 text-stone-700">
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
        <div className="text-center py-12 bg-white rounded-lg border border-stone-200">
          <p className="text-stone-600 mb-2">Kanban view groups contacts by consent status</p>
          <p className="text-sm text-stone-500">(Given / Pending / Withdrawn columns)</p>
        </div>
      )}
    </div>
  );
}
