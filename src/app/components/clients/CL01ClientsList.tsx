import React, { useState } from 'react';
import { Plus, List, LayoutGrid, Columns3, Settings, Filter, Archive, Trash2, UserPlus, Tag } from 'lucide-react';
import { BonsaiButton } from '../bonsai/BonsaiButton';
import { BonsaiStatusPill } from '../bonsai/BonsaiStatusPill';
import { EnhancedTable } from '../operations/EnhancedTable';
import { BonsaiGridCards } from '../bonsai/BonsaiGridCards';

interface Client {
  id: string;
  name: string;
  industry: string;
  status: 'Active' | 'Onboarding' | 'Inactive' | 'Archived';
  owner: string;
  contacts: number;
  projects: number;
  revenue: string;
  lastActivity: string;
  tags: string[];
}

interface CL01ClientsListProps {
  onClientClick: (client: Client) => void;
  onCreateClient: () => void;
  onBulkAction: (action: string, selected: string[]) => void;
}

export function CL01ClientsList({ onClientClick, onCreateClient, onBulkAction }: CL01ClientsListProps) {
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'kanban'>('list');
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showColumnChooser, setShowColumnChooser] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    industry: 'all',
    owner: 'all',
    tags: 'all',
    lastActivity: 'all',
  });

  const clients: Client[] = [
    {
      id: '1',
      name: 'Acme Corporation',
      industry: 'Technology',
      status: 'Active',
      owner: 'John Doe',
      contacts: 5,
      projects: 3,
      revenue: '$125,000',
      lastActivity: 'Today',
      tags: ['Enterprise', 'VIP'],
    },
    {
      id: '2',
      name: 'Tech Startup Inc',
      industry: 'Software',
      status: 'Active',
      owner: 'Jane Smith',
      contacts: 3,
      projects: 2,
      revenue: '$45,000',
      lastActivity: '2 days ago',
      tags: ['Startup', 'High Growth'],
    },
    {
      id: '3',
      name: 'Local Retail Co',
      industry: 'Retail',
      status: 'Onboarding',
      owner: 'John Doe',
      contacts: 2,
      projects: 1,
      revenue: '$15,000',
      lastActivity: '1 week ago',
      tags: ['SMB'],
    },
    {
      id: '4',
      name: 'FinTech Solutions',
      industry: 'Finance',
      status: 'Active',
      owner: 'Sarah Wilson',
      contacts: 4,
      projects: 2,
      revenue: '$85,000',
      lastActivity: '3 days ago',
      tags: ['Enterprise', 'Strategic'],
    },
    {
      id: '5',
      name: 'Marketing Agency Pro',
      industry: 'Marketing',
      status: 'Inactive',
      owner: 'Mike Chen',
      contacts: 8,
      projects: 0,
      revenue: '$0',
      lastActivity: '3 months ago',
      tags: ['Partner'],
    },
  ];

  const availableColumns = [
    { key: 'name', label: 'Client Name', visible: true },
    { key: 'industry', label: 'Industry', visible: true },
    { key: 'status', label: 'Status', visible: true },
    { key: 'owner', label: 'Account Owner', visible: true },
    { key: 'contacts', label: 'Contacts', visible: true },
    { key: 'projects', label: 'Projects', visible: true },
    { key: 'revenue', label: 'Revenue', visible: true },
    { key: 'lastActivity', label: 'Last Activity', visible: true },
    { key: 'tags', label: 'Tags', visible: false },
  ];

  const [visibleColumns, setVisibleColumns] = useState(availableColumns);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-stone-800">Clients</h1>
          <p className="text-sm text-stone-500">Manage client organizations and relationships</p>
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

          <BonsaiButton variant="primary" icon={<Plus />} onClick={onCreateClient}>
            Add Client
          </BonsaiButton>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-stone-200 p-4">
          <p className="text-sm text-stone-600">Total Clients</p>
          <p className="text-2xl font-semibold text-stone-800 mt-1">{clients.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-stone-200 p-4">
          <p className="text-sm text-stone-600">Active</p>
          <p className="text-2xl font-semibold text-stone-600 mt-1">3</p>
        </div>
        <div className="bg-white rounded-lg border border-stone-200 p-4">
          <p className="text-sm text-stone-600">Onboarding</p>
          <p className="text-2xl font-semibold text-stone-600 mt-1">1</p>
        </div>
        <div className="bg-white rounded-lg border border-stone-200 p-4">
          <p className="text-sm text-stone-600">Total Revenue</p>
          <p className="text-2xl font-semibold text-primary mt-1">$270K</p>
        </div>
        <div className="bg-white rounded-lg border border-stone-200 p-4">
          <p className="text-sm text-stone-600">Avg Project Value</p>
          <p className="text-2xl font-semibold text-stone-800 mt-1">$33.8K</p>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-lg border border-stone-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="onboarding">Onboarding</option>
                <option value="inactive">Inactive</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Industry</label>
              <select
                value={filters.industry}
                onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm"
              >
                <option value="all">All Industries</option>
                <option value="technology">Technology</option>
                <option value="finance">Finance</option>
                <option value="retail">Retail</option>
                <option value="marketing">Marketing</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Owner</label>
              <select
                value={filters.owner}
                onChange={(e) => setFilters({ ...filters, owner: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm"
              >
                <option value="all">All Owners</option>
                <option value="john">John Doe</option>
                <option value="jane">Jane Smith</option>
                <option value="sarah">Sarah Wilson</option>
                <option value="mike">Mike Chen</option>
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
                <option value="enterprise">Enterprise</option>
                <option value="vip">VIP</option>
                <option value="startup">Startup</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Last Activity</label>
              <select
                value={filters.lastActivity}
                onChange={(e) => setFilters({ ...filters, lastActivity: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions Bar */}
      {selectedClients.length > 0 && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6 flex items-center justify-between">
          <p className="text-sm font-medium text-primary">
            {selectedClients.length} client{selectedClients.length > 1 ? 's' : ''} selected
          </p>
          <div className="flex items-center gap-2">
            <BonsaiButton size="sm" variant="ghost" icon={<Archive />} onClick={() => onBulkAction('archive', selectedClients)}>
              Archive
            </BonsaiButton>
            <BonsaiButton size="sm" variant="ghost" icon={<UserPlus />} onClick={() => onBulkAction('assign', selectedClients)}>
              Assign Owner
            </BonsaiButton>
            <BonsaiButton size="sm" variant="ghost" icon={<Tag />} onClick={() => onBulkAction('tag', selectedClients)}>
              Add Tag
            </BonsaiButton>
            <BonsaiButton size="sm" variant="destructive" icon={<Trash2 />} onClick={() => onBulkAction('delete', selectedClients)}>
              Delete (Admin)
            </BonsaiButton>
          </div>
        </div>
      )}

      {/* Content based on view mode */}
      {viewMode === 'list' && (
        <EnhancedTable
          columns={visibleColumns
            .filter(col => col.visible)
            .map(col => ({ key: col.key, label: col.label, sortable: true }))}
          data={clients.map(client => ({
            ...client,
            status: (
              <BonsaiStatusPill
                status={
                  client.status === 'Active' ? 'active' :
                  client.status === 'Onboarding' ? 'pending' :
                  client.status === 'Inactive' ? 'inactive' : 'archived'
                }
                label={client.status}
              />
            ),
            tags: (
              <div className="flex gap-1 flex-wrap">
                {client.tags.map((tag, idx) => (
                  <span key={idx} className="inline-flex px-2 py-0.5 text-xs rounded-full bg-stone-100 text-stone-700">
                    {tag}
                  </span>
                ))}
              </div>
            ),
          }))}
          onRowClick={(row) => onClientClick(row as Client)}
          searchable
          filterable
          selectable
          onSelectionChange={setSelectedClients}
        />
      )}

      {viewMode === 'grid' && (
        <BonsaiGridCards
          columns={3}
          cards={clients.map(client => ({
            id: client.id,
            title: client.name,
            subtitle: client.industry,
            status: client.status,
            meta: [client.owner, `${client.projects} projects`, client.revenue],
          }))}
          onCardClick={(card) => {
            const client = clients.find(c => c.id === card.id);
            if (client) onClientClick(client);
          }}
        />
      )}

      {viewMode === 'kanban' && (
        <div className="text-center py-12 bg-white rounded-lg border border-stone-200">
          <p className="text-stone-600 mb-2">Kanban view groups clients by status</p>
          <p className="text-sm text-stone-500">(Active / Onboarding / Inactive / Archived columns)</p>
        </div>
      )}
    </div>
  );
}
