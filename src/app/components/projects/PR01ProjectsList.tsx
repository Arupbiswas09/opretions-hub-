import React, { useState } from 'react';
import { Plus, List, LayoutGrid, Columns3, Settings, Filter } from 'lucide-react';
import { BonsaiButton } from '../bonsai/BonsaiButton';
import { BonsaiStatusPill } from '../bonsai/BonsaiStatusPill';
import { EnhancedTable } from '../operations/EnhancedTable';
import { BonsaiGridCards } from '../bonsai/BonsaiGridCards';
import { HubStatTile } from '../ops';

interface Project {
  id: string;
  name: string;
  client: string;
  status: 'Planning' | 'In Progress' | 'On Hold' | 'Completed' | 'Cancelled';
  projectManager: string;
  startDate: string;
  endDate: string;
  budget: string;
  spent: string;
  progress: number;
  team: number;
}

interface PR01ProjectsListProps {
  onProjectClick: (project: Project) => void;
  onCreateProject: () => void;
}

export function PR01ProjectsList({ onProjectClick, onCreateProject }: PR01ProjectsListProps) {
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'kanban'>('list');
  const [showFilters, setShowFilters] = useState(false);
  const [showColumnChooser, setShowColumnChooser] = useState(false);

  const projects: Project[] = [
    {
      id: '1',
      name: 'Website Redesign',
      client: 'Acme Corporation',
      status: 'In Progress',
      projectManager: 'John Doe',
      startDate: 'Jan 5, 2026',
      endDate: 'Mar 15, 2026',
      budget: '$45,000',
      spent: '$28,500',
      progress: 65,
      team: 5,
    },
    {
      id: '2',
      name: 'Mobile App Development',
      client: 'Tech Startup Inc',
      status: 'Planning',
      projectManager: 'Jane Smith',
      startDate: 'Feb 1, 2026',
      endDate: 'Jun 30, 2026',
      budget: '$85,000',
      spent: '$5,200',
      progress: 10,
      team: 8,
    },
    {
      id: '3',
      name: 'Brand Identity Package',
      client: 'Local Retail Co',
      status: 'Completed',
      projectManager: 'Sarah Wilson',
      startDate: 'Dec 1, 2025',
      endDate: 'Jan 15, 2026',
      budget: '$15,000',
      spent: '$14,800',
      progress: 100,
      team: 3,
    },
  ];

  const availableColumns = [
    { key: 'name', label: 'Project Name', visible: true },
    { key: 'client', label: 'Client', visible: true },
    { key: 'status', label: 'Status', visible: true },
    { key: 'projectManager', label: 'PM', visible: true },
    { key: 'startDate', label: 'Start Date', visible: true },
    { key: 'endDate', label: 'End Date', visible: true },
    { key: 'budget', label: 'Budget', visible: true },
    { key: 'spent', label: 'Spent', visible: true },
    { key: 'progress', label: 'Progress', visible: true },
    { key: 'team', label: 'Team Size', visible: false },
  ];

  const [visibleColumns, setVisibleColumns] = useState(availableColumns);

  const getStatusColor = (status: string): 'active' | 'pending' | 'inactive' | 'archived' => {
    switch (status) {
      case 'In Progress': return 'active';
      case 'Planning': return 'pending';
      case 'On Hold': return 'inactive';
      case 'Completed': return 'archived';
      case 'Cancelled': return 'inactive';
      default: return 'pending';
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-stone-800 dark:text-stone-100">Projects</h1>
          <p className="text-sm text-stone-500 dark:text-stone-400">Manage all projects, tasks, and timesheets</p>
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
              onClick={() => setViewMode('kanban')}
              className={`p-2 rounded transition-[background-color] duration-[120ms] ${viewMode === 'kanban' ? 'bg-primary/10 text-primary' : 'text-stone-600 dark:text-stone-400 hover:bg-[var(--row-hover-bg)]'}`}
            >
              <Columns3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-[background-color] duration-[120ms] ${viewMode === 'grid' ? 'bg-primary/10 text-primary' : 'text-stone-600 dark:text-stone-400 hover:bg-[var(--row-hover-bg)]'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

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

          <BonsaiButton variant="primary" icon={<Plus />} onClick={onCreateProject}>
            New Project
          </BonsaiButton>
        </div>
      </div>

      {/* Stats — same glass hierarchy as Dashboard KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <HubStatTile label="Total Projects" value={projects.length} delay={0} />
        <HubStatTile
          label="In Progress"
          value={projects.filter(p => p.status === 'In Progress').length}
          delay={0.05}
        />
        <HubStatTile
          label="Planning"
          value={projects.filter(p => p.status === 'Planning').length}
          delay={0.1}
        />
        <HubStatTile label="Total Budget" value="$145K" delay={0.15} />
        <HubStatTile label="Total Spent" value="$48.5K" delay={0.2} />
      </div>

      {/* Content */}
      {viewMode === 'list' && (
        <EnhancedTable
          columns={visibleColumns
            .filter(col => col.visible)
            .map(col => ({ key: col.key, label: col.label, sortable: true }))}
          data={projects.map(project => ({
            ...project,
            status: (
              <BonsaiStatusPill
                status={getStatusColor(project.status)}
                label={project.status}
              />
            ),
            progress: (
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-stone-200 rounded-full h-2">
                  <div
                    className="bg-primary rounded-full h-2"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-stone-700">{project.progress}%</span>
              </div>
            ),
          }))}
          onRowClick={(row) => onProjectClick(row as Project)}
          searchable
          filterable
        />
      )}

      {viewMode === 'grid' && (
        <BonsaiGridCards
          columns={3}
          cards={projects.map(project => ({
            id: project.id,
            title: project.name,
            subtitle: project.client,
            status: project.status,
            meta: [project.projectManager, `${project.progress}% complete`, project.budget],
          }))}
          onCardClick={(card) => {
            const project = projects.find(p => p.id === card.id);
            if (project) onProjectClick(project);
          }}
        />
      )}

      {viewMode === 'kanban' && (
        <div className="text-center py-12 bg-white rounded-lg border border-stone-200">
          <p className="text-stone-600 mb-2">Kanban view groups projects by status</p>
          <p className="text-sm text-stone-500">(Planning / In Progress / On Hold / Completed columns)</p>
        </div>
      )}
    </div>
  );
}
