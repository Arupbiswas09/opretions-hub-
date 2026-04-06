import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, List, LayoutGrid, Settings, Filter, Download, Tag, Power } from 'lucide-react';
import { BonsaiButton } from '../bonsai/BonsaiButton';
import { BonsaiStatusPill } from '../bonsai/BonsaiStatusPill';
import { EnhancedTable } from '../operations/EnhancedTable';
import { BonsaiGridCards } from '../bonsai/BonsaiGridCards';
import { HubStatTile, OpsAvatar } from '../ops';

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

  const people: Person[] = [
    {
      id: '1',
      name: 'John Doe',
      type: 'Employee',
      role: 'Senior Project Manager',
      department: 'Operations',
      status: 'Active',
      email: 'john.doe@company.com',
      skills: ['Project Management', 'Agile', 'Leadership'],
      availability: 'Available',
      startDate: 'Jan 15, 2024',
    },
    {
      id: '2',
      name: 'Jane Smith',
      type: 'Employee',
      role: 'Lead Designer',
      department: 'Design',
      status: 'Active',
      email: 'jane.smith@company.com',
      skills: ['UI/UX Design', 'Figma', 'Branding'],
      availability: 'Busy',
      startDate: 'Mar 1, 2023',
    },
    {
      id: '3',
      name: 'Sarah Johnson',
      type: 'Freelancer',
      role: 'Senior Designer',
      department: 'Design',
      status: 'Active',
      email: 'sarah.j@freelance.com',
      skills: ['UI Design', 'Illustration', 'Animation'],
      availability: 'Available',
      startDate: 'Nov 10, 2025',
    },
    {
      id: '4',
      name: 'Mike Chen',
      type: 'Employee',
      role: 'Software Engineer',
      department: 'Engineering',
      status: 'On Leave',
      email: 'mike.chen@company.com',
      skills: ['React', 'Node.js', 'TypeScript'],
      availability: 'On Leave',
      startDate: 'Jun 1, 2022',
    },
    {
      id: '5',
      name: 'Priya Patel',
      type: 'Employee',
      role: 'Marketing Lead',
      department: 'Marketing',
      status: 'Active',
      email: 'priya.p@company.com',
      skills: ['SEO', 'Content Strategy', 'Analytics'],
      availability: 'Available',
      startDate: 'Aug 20, 2023',
    },
    {
      id: '6',
      name: 'Alex Rivera',
      type: 'Freelancer',
      role: 'Backend Developer',
      department: 'Engineering',
      status: 'Active',
      email: 'alex.r@freelance.com',
      skills: ['Python', 'Django', 'PostgreSQL'],
      availability: 'Busy',
      startDate: 'Dec 5, 2025',
    },
  ];

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
      case 'On Leave':  return 'bg-stone-100 text-stone-600';
      default:          return 'bg-stone-100 text-stone-700';
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
          <h1 className="text-2xl font-semibold text-stone-800 dark:text-stone-100">People</h1>
          <p className="text-sm text-stone-500 dark:text-stone-400">Manage team members and freelancers</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Switcher */}
          <div
            className="flex items-center gap-1 rounded-lg p-1"
            style={{ background: 'var(--table-header-bg)', border: '1px solid var(--border)' }}
          >
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-[background-color] duration-[120ms] ${viewMode === 'list' ? 'bg-primary/10 text-primary' : 'text-stone-600 dark:text-stone-400 hover:bg-[var(--row-hover-bg)]'}`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-[background-color] duration-[120ms] ${viewMode === 'grid' ? 'bg-primary/10 text-primary' : 'text-stone-600 dark:text-stone-400 hover:bg-[var(--row-hover-bg)]'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          {/* Column Chooser */}
          <div className="relative">
            <BonsaiButton variant="ghost" size="sm" icon={<Settings />} onClick={() => setShowColumnChooser(!showColumnChooser)}>
              Columns
            </BonsaiButton>
            <AnimatePresence>
              {showColumnChooser && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97, y: 4 }}
                  transition={{ type: 'spring', damping: 28, stiffness: 380 }}
                  className="absolute right-0 top-full mt-2 w-64 rounded-xl p-4 z-10"
                  style={{
                    background: 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(48px) saturate(200%)',
                    WebkitBackdropFilter: 'blur(48px) saturate(200%)',
                    boxShadow: '0 16px 48px -8px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)',
                    border: '1px solid rgba(255,255,255,0.5)',
                  }}
                >
                <h3 className="font-medium text-stone-800 mb-3">Show Columns</h3>
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
                        className="w-4 h-4 rounded border-stone-300 text-primary focus:ring-2 focus:ring-primary/20"
                      />
                      <span className="text-sm text-stone-700">{col.label}</span>
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
        <div className="bg-white rounded-lg border border-stone-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Type</label>
              <select className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm">
                <option>All Types</option>
                <option>Employee</option>
                <option>Freelancer</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Status</label>
              <select className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm">
                <option>All Statuses</option>
                <option>Active</option>
                <option>Inactive</option>
                <option>On Leave</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Department</label>
              <select className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm">
                <option>All Departments</option>
                <option>Operations</option>
                <option>Design</option>
                <option>Engineering</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Skills</label>
              <select className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm">
                <option>All Skills</option>
                <option>Project Management</option>
                <option>UI/UX Design</option>
                <option>React</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Availability</label>
              <select className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm">
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
                  <p className="text-[13px] font-medium text-stone-800 dark:text-stone-100">{person.name}</p>
                  <p className="text-[10px] text-stone-400 dark:text-stone-500">{person.role}</p>
                </div>
              </div>
            ),
            type: (
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                person.type === 'Employee' ? 'bg-stone-100 text-stone-600' : 'bg-stone-100 text-stone-700'
              }`}>
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
                  person.availability === 'Available' ? 'bg-emerald-500' : person.availability === 'Busy' ? 'bg-amber-500' : 'bg-stone-400'
                }`} />
                {person.availability}
              </span>
            ),
            skills: (
              <div className="flex gap-1 flex-wrap">
                {person.skills.slice(0, 2).map((skill, idx) => (
                  <span key={idx} className="inline-flex px-2 py-0.5 text-xs rounded-full bg-stone-100 text-stone-700">
                    {skill}
                  </span>
                ))}
                {person.skills.length > 2 && (
                  <span className="inline-flex px-2 py-0.5 text-xs rounded-full bg-stone-100 text-stone-700">
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
