import React, { useState } from 'react';
import { Plus, List, LayoutGrid, Settings, Filter, Download, Tag, Power } from 'lucide-react';
import { BonsaiButton } from '../bonsai/BonsaiButton';
import { BonsaiStatusPill } from '../bonsai/BonsaiStatusPill';
import { EnhancedTable } from '../operations/EnhancedTable';
import { BonsaiGridCards } from '../bonsai/BonsaiGridCards';

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

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'Available': return 'bg-stone-100 text-stone-700';
      case 'Busy': return 'bg-stone-100 text-stone-600';
      case 'On Leave': return 'bg-stone-100 text-stone-700';
      default: return 'bg-stone-100 text-stone-700';
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-stone-800">People</h1>
          <p className="text-sm text-stone-500">Manage team members and freelancers</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Switcher */}
          <div className="flex items-center gap-1 bg-white border border-stone-200 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary/10 text-primary' : 'text-stone-600 hover:bg-stone-100'}`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary/10 text-primary' : 'text-stone-600 hover:bg-stone-100'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          {/* Column Chooser */}
          <div className="relative">
            <BonsaiButton variant="ghost" size="sm" icon={<Settings />} onClick={() => setShowColumnChooser(!showColumnChooser)}>
              Columns
            </BonsaiButton>
            {showColumnChooser && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-xl border border-stone-200 p-4 z-10">
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
              </div>
            )}
          </div>

          <BonsaiButton variant="ghost" size="sm" icon={<Filter />} onClick={() => setShowFilters(!showFilters)}>
            Filters
          </BonsaiButton>

          <BonsaiButton variant="primary" icon={<Plus />} onClick={onCreatePerson}>
            Add Person
          </BonsaiButton>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-stone-200 p-4">
          <p className="text-sm text-stone-600">Total People</p>
          <p className="text-2xl font-semibold text-stone-800 mt-1">{people.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-stone-200 p-4">
          <p className="text-sm text-stone-600">Employees</p>
          <p className="text-2xl font-semibold text-primary mt-1">2</p>
        </div>
        <div className="bg-white rounded-lg border border-stone-200 p-4">
          <p className="text-sm text-stone-600">Freelancers</p>
          <p className="text-2xl font-semibold text-stone-600 mt-1">2</p>
        </div>
        <div className="bg-white rounded-lg border border-stone-200 p-4">
          <p className="text-sm text-stone-600">Available</p>
          <p className="text-2xl font-semibold text-stone-600 mt-1">2</p>
        </div>
        <div className="bg-white rounded-lg border border-stone-200 p-4">
          <p className="text-sm text-stone-600">On Leave</p>
          <p className="text-2xl font-semibold text-stone-600 mt-1">1</p>
        </div>
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
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getAvailabilityColor(person.availability)}`}>
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
