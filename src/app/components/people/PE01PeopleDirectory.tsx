import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, List, LayoutGrid, Settings, Filter, Download, Tag, Power } from 'lucide-react';
import { BonsaiButton } from '../bonsai/BonsaiButton';
import { BonsaiStatusPill } from '../bonsai/BonsaiStatusPill';
import { EnhancedTable } from '../operations/EnhancedTable';
import { BonsaiGridCards } from '../bonsai/BonsaiGridCards';
import { HubStatTile, OpsAvatar } from '../ops';
import { useHubData } from '../../lib/hub/use-hub-data';
import { type PersonRow } from '../../lib/api/hub-api';

interface Person {
  id: string;
  name: string;
  type: 'Employee' | 'Freelancer';
  role: string;
  department: string;
  status: 'Active' | 'Inactive' | 'On Leave';
  email: string;
  skills: string[];
  availability: 'Available' | 'Busy' | 'On Leave';
  startDate: string;
}

interface PE01PeopleDirectoryProps {
  onPersonClick: (person: Person) => void;
  onCreatePerson: () => void;
  onBulkAction: (action: string, selected: string[]) => void;
}

export function PE01PeopleDirectory({ onPersonClick, onCreatePerson, onBulkAction }: PE01PeopleDirectoryProps) {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedPeople, setSelectedPeople] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showColumnChooser, setShowColumnChooser] = useState(false);

  const { data: rawPeople, loading } = useHubData<PersonRow[]>('/api/hub/people');

  const people: Person[] = (rawPeople ?? []).map(p => ({
    id: p.id,
    name: p.full_name,
    type: (p.employment_type === 'freelancer' || p.employment_type === 'contractor' ? 'Freelancer' : 'Employee') as Person['type'],
    role: p.role ?? '—',
    department: p.department ?? '—',
    status: (
      p.status === 'active' ? 'Active' :
      p.status === 'on_leave' ? 'On Leave' : 'Inactive'
    ) as Person['status'],
    email: p.email ?? '—',
    skills: [],
    availability: (
      p.status === 'on_leave' ? 'On Leave' : 'Available'
    ) as Person['availability'],
    startDate: p.start_date ? new Date(p.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—',
  }));

  const availableColumns = [
    { key: 'name', label: 'Name', visible: true },
    { key: 'type', label: 'Type', visible: true },
    { key: 'role', label: 'Role', visible: true },
    { key: 'department', label: 'Department', visible: true },
    { key: 'status', label: 'Status', visible: true },
    { key: 'email', label: 'Email', visible: true },
    { key: 'skills', label: 'Skills', visible: false },
    { key: 'availability', label: 'Availability', visible: true },
    { key: 'startDate', label: 'Start Date', visible: false },
  ];

  const [visibleColumns, setVisibleColumns] = useState(availableColumns);

  const getStatusColor = (status: string): 'active' | 'pending' | 'inactive' | 'archived' => {
    switch (status) {
      case 'Active': return 'active';
      case 'On Leave': return 'pending';
      case 'Inactive': return 'inactive';
      default: return 'archived';
    }
  };

  const getAvailabilityStyle = (availability: string) => {
    switch (availability) {
      case 'Available': return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
      case 'Busy':      return 'bg-amber-50 text-amber-700 border border-amber-100';
      case 'On Leave':  return 'bg-muted/60 text-muted-foreground border border-border';
      default:          return 'bg-muted/60 text-muted-foreground border border-border';
    }
  };

  const presenceForAvatar = (a: Person['availability']): 'online' | 'away' | 'offline' => {
    if (a === 'Available') return 'online';
    if (a === 'Busy') return 'away';
    return 'offline';
  };

  return (
    <div className="px-3 py-6 sm:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">People</h1>
          <p className="text-sm text-muted-foreground">Manage team members and freelancers</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Switcher */}
          <div
            className="flex items-center gap-1 rounded-lg p-1"
            style={{ background: 'var(--table-header-bg)', border: '1px solid var(--border)' }}
          >
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-[background-color] duration-[120ms] ${viewMode === 'list' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-[var(--row-hover-bg)]'}`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-[background-color] duration-[120ms] ${viewMode === 'grid' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-[var(--row-hover-bg)]'}`}
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
              type="button"
            >
              Columns
            </BonsaiButton>
            <AnimatePresence>
              {showColumnChooser && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97, y: 4 }}
                  transition={{ type: 'spring', damping: 28, stiffness: 380 }}
                  className="absolute right-0 top-full mt-2 w-64 rounded-xl p-4 z-10 hub-modal-solid shadow-xl"
                >
                <h3 className="font-medium text-foreground mb-3">Show columns</h3>
                <div className="space-y-2">
                  {visibleColumns.map((col) => (
                    <label key={col.key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={col.visible}
                        onChange={(e) => {
                          setVisibleColumns(
                            visibleColumns.map((c) => c.key === col.key ? { ...c, visible: e.target.checked } : c)
                          );
                        }}
                        className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-ring/30"
                      />
                      <span className="text-sm text-foreground">{col.label}</span>
                    </label>
                  ))}
                </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <BonsaiButton variant="ghost" size="sm" icon={<Filter />} onClick={() => setShowFilters(!showFilters)}>
            Filters
          </BonsaiButton>

          <BonsaiButton variant="primary" icon={<Plus />} onClick={onCreatePerson}>
            Add Person
          </BonsaiButton>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        {[
          { label: 'Total People', val: people.length, sub: 'All team' },
          { label: 'Employees',    val: people.filter(p => p.type === 'Employee').length, sub: 'Full-time' },
          { label: 'Freelancers',  val: people.filter(p => p.type === 'Freelancer').length, sub: 'Contract' },
          { label: 'Available',    val: people.filter(p => p.availability === 'Available').length, sub: 'Ready to assign' },
          { label: 'On Leave',     val: people.filter(p => p.status === 'On Leave').length, sub: 'Currently away' },
        ].map((s, i) => (
          <HubStatTile key={s.label} label={s.label} value={s.val} sub={s.sub} delay={i * 0.05} />
        ))}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="hub-surface hub-surface-elevated mb-6 rounded-2xl p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Type</label>
              <select className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground">
                <option>All Types</option>
                <option>Employee</option>
                <option>Freelancer</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Status</label>
              <select className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground">
                <option>All Statuses</option>
                <option>Active</option>
                <option>Inactive</option>
                <option>On Leave</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Department</label>
              <select className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground">
                <option>All Departments</option>
                <option>Operations</option>
                <option>Design</option>
                <option>Engineering</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Skills</label>
              <select className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground">
                <option>All Skills</option>
                <option>Project Management</option>
                <option>UI/UX Design</option>
                <option>React</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Availability</label>
              <select className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground">
                <option>All</option>
                <option>Available</option>
                <option>Busy</option>
                <option>On Leave</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions Bar */}
      {selectedPeople.length > 0 && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6 flex items-center justify-between">
          <p className="text-sm font-medium text-primary">
            {selectedPeople.length} {selectedPeople.length === 1 ? 'person' : 'people'} selected
          </p>
          <div className="flex items-center gap-2">
            <BonsaiButton size="sm" variant="ghost" icon={<Power />} onClick={() => onBulkAction('activate', selectedPeople)}>
              Activate
            </BonsaiButton>
            <BonsaiButton size="sm" variant="ghost" icon={<Power />} onClick={() => onBulkAction('deactivate', selectedPeople)}>
              Deactivate
            </BonsaiButton>
            <BonsaiButton size="sm" variant="ghost" icon={<Tag />} onClick={() => onBulkAction('tag', selectedPeople)}>
              Add Tag
            </BonsaiButton>
            <BonsaiButton size="sm" variant="ghost" icon={<Download />} onClick={() => onBulkAction('export', selectedPeople)}>
              Export
            </BonsaiButton>
          </div>
        </div>
      )}

      {/* Content */}
      {viewMode === 'list' && (
        <EnhancedTable
          columns={visibleColumns
            .filter(col => col.visible)
            .map(col => ({ key: col.key, label: col.label, sortable: true }))}
          data={people.map(person => ({
            ...person,
            name: (
              <div className="flex items-center gap-3">
                <OpsAvatar name={person.name} size="md" presence={presenceForAvatar(person.availability)} />
                <div>
                  <p className="text-[13px] font-medium text-foreground">{person.name}</p>
                  <p className="text-[10px] text-muted-foreground">{person.role}</p>
                </div>
              </div>
            ),
            type: (
              <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-muted/60 text-muted-foreground border border-border">
                {person.type}
              </span>
            ),
            status: (
              <BonsaiStatusPill
                status={getStatusColor(person.status)}
                label={person.status}
              />
            ),
            availability: (
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-full ${getAvailabilityStyle(person.availability)}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  person.availability === 'Available' ? 'bg-emerald-500' : person.availability === 'Busy' ? 'bg-amber-500' : 'bg-muted-foreground'
                }`} />
                {person.availability}
              </span>
            ),
            skills: (
              <div className="flex gap-1 flex-wrap">
                {person.skills.slice(0, 2).map((skill, idx) => (
                  <span key={idx} className="inline-flex px-2 py-0.5 text-xs rounded-full bg-muted/60 text-foreground border border-border">
                    {skill}
                  </span>
                ))}
                {person.skills.length > 2 && (
                  <span className="inline-flex px-2 py-0.5 text-xs rounded-full bg-muted/60 text-foreground border border-border">
                    +{person.skills.length - 2}
                  </span>
                )}
              </div>
            ),
          }))}
          onRowClick={(row) => onPersonClick(row as Person)}
          searchable
          filterable
          selectable
          onSelectionChange={setSelectedPeople}
        />
      )}

      {viewMode === 'grid' && (
        <BonsaiGridCards
          columns={3}
          cards={people.map(person => ({
            id: person.id,
            title: person.name,
            subtitle: `${person.role} • ${person.department}`,
            status: person.status,
            meta: [person.type, person.email, person.availability],
          }))}
          onCardClick={(card) => {
            const person = people.find(p => p.id === card.id);
            if (person) onPersonClick(person);
          }}
        />
      )}
    </div>
  );
}
