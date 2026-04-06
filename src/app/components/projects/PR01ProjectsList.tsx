import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, List, LayoutGrid, Columns3, Settings, Filter, Play, Timer } from 'lucide-react';
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
  budget: number;
  spent: number;
  progress: number;
  team: number;
}

interface PR01ProjectsListProps {
  onProjectClick: (project: any) => void;
  onCreateProject: () => void;
}

/* ── Budget burn bar inline component ── */
function BudgetCell({ spent, budget }: { spent: number; budget: number }) {
  const pct = budget > 0 ? (spent / budget) * 100 : 0;
  const color = pct > 100 ? 'red' : pct > 80 ? 'amber' : 'green';
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 budget-bar-track">
        <div className={`budget-bar-fill ${color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
      <span className="text-[11px] tabular-nums font-medium" style={{ color: 'var(--foreground-secondary)' }}>
        ${(spent / 1000).toFixed(1)}K / ${(budget / 1000).toFixed(0)}K
      </span>
    </div>
  );
}

export function PR01ProjectsList({ onProjectClick, onCreateProject }: PR01ProjectsListProps) {
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'kanban'>('list');
  const [showFilters, setShowFilters] = useState(false);
  const [showColumnChooser, setShowColumnChooser] = useState(false);

  const projects: Project[] = [
    {
      id: '1', name: 'Website Redesign', client: 'Acme Corporation',
      status: 'In Progress', projectManager: 'John Doe',
      startDate: 'Jan 5, 2026', endDate: 'Mar 15, 2026',
      budget: 45000, spent: 28500, progress: 65, team: 5,
    },
    {
      id: '2', name: 'Mobile App Development', client: 'Tech Startup Inc',
      status: 'Planning', projectManager: 'Jane Smith',
      startDate: 'Feb 1, 2026', endDate: 'Jun 30, 2026',
      budget: 85000, spent: 5200, progress: 10, team: 8,
    },
    {
      id: '3', name: 'Brand Identity Package', client: 'Local Retail Co',
      status: 'Completed', projectManager: 'Sarah Wilson',
      startDate: 'Dec 1, 2025', endDate: 'Jan 15, 2026',
      budget: 15000, spent: 14800, progress: 100, team: 3,
    },
  ];

  const availableColumns = [
    { key: 'name', label: 'Project Name', visible: true },
    { key: 'client', label: 'Client', visible: true },
    { key: 'status', label: 'Status', visible: true },
    { key: 'projectManager', label: 'PM', visible: true },
    { key: 'budget', label: 'Budget', visible: true },
    { key: 'progress', label: 'Progress', visible: true },
    { key: 'timer', label: '', visible: true },
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

  const totalBudget = projects.reduce((s, p) => s + p.budget, 0);
  const totalSpent = projects.reduce((s, p) => s + p.spent, 0);

  return (
    <div className="px-3 py-6 sm:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="eyebrow-label mb-1">Projects</p>
          <h1 className="text-[28px] font-semibold tracking-[-0.025em]"
            style={{ color: 'var(--foreground)' }}>All Projects</h1>
        </div>
        <div className="flex min-w-0 flex-wrap items-center justify-end gap-2 sm:gap-3">
          {/* View Switcher */}
          <div
            className="flex shrink-0 items-center gap-1 rounded-full p-1"
            style={{ background: 'var(--glass-bg)', border: '1px solid var(--border)' }}
          >
            {[
              { mode: 'list' as const, icon: List },
              { mode: 'kanban' as const, icon: Columns3 },
              { mode: 'grid' as const, icon: LayoutGrid },
            ].map(({ mode, icon: Icon }) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                className="rounded-full p-2 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                style={{
                  background: viewMode === mode ? 'var(--primary)' : 'transparent',
                  color: viewMode === mode ? '#FFFFFF' : 'var(--foreground-muted)',
                }}
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>

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
                  className="absolute right-0 top-full mt-2 w-56 rounded-xl p-4 z-10"
                  style={{
                    background: 'var(--popover)',
                    backdropFilter: 'blur(48px) saturate(200%)',
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow-modal)',
                  }}
                >
                  <h3 className="text-[12px] font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Show Columns</h3>
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
                          className="w-4 h-4 rounded"
                          style={{ accentColor: 'var(--primary)' }}
                        />
                        <span className="text-[12px]" style={{ color: 'var(--foreground-secondary)' }}>{col.label}</span>
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

          <BonsaiButton variant="primary" icon={<Plus />} onClick={onCreateProject}>
            New Project
          </BonsaiButton>
        </div>
      </div>

      {/* Stats */}
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
        <HubStatTile label="Total Budget" value={`$${(totalBudget / 1000).toFixed(0)}K`} delay={0.15} />
        <HubStatTile label="Total Spent" value={`$${(totalSpent / 1000).toFixed(1)}K`} delay={0.2} />
      </div>

      {/* Content */}
      {viewMode === 'list' && (
        <EnhancedTable
          columns={visibleColumns
            .filter(col => col.visible)
            .map(col => ({ key: col.key, label: col.label, sortable: col.key !== 'timer' }))}
          data={projects.map(project => ({
            ...project,
            budget: <BudgetCell spent={project.spent} budget={project.budget} />,
            status: (
              <BonsaiStatusPill
                status={getStatusColor(project.status)}
                label={project.status}
              />
            ),
            progress: (
              <div className="flex items-center gap-2">
                <div className="flex-1 h-[4px] rounded-full overflow-hidden"
                  style={{ background: 'var(--stat-bar-track)' }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${project.progress}%`, background: 'var(--primary)' }}
                  />
                </div>
                <span className="text-[11px] font-medium tabular-nums"
                  style={{ color: 'var(--foreground-secondary)' }}>{project.progress}%</span>
              </div>
            ),
            timer: project.status === 'In Progress' ? (
              <button className="p-1.5 rounded-full transition-colors hover:scale-105"
                style={{ background: 'var(--accent)', color: 'var(--primary)' }}
                title="Start timer">
                <Play className="w-3 h-3" />
              </button>
            ) : null,
          }))}
          onRowClick={(row) => onProjectClick(row)}
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
            meta: [project.projectManager, `${project.progress}% complete`, `$${(project.budget / 1000).toFixed(0)}K`],
          }))}
          onCardClick={(card) => {
            const project = projects.find(p => p.id === card.id);
            if (project) onProjectClick(project);
          }}
        />
      )}

      {viewMode === 'kanban' && (
        <div className="-mx-1 flex gap-4 overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch] px-1 sm:mx-0 sm:overflow-visible sm:px-0">
          {['Planning', 'In Progress', 'On Hold', 'Completed'].map((stage, idx) => {
            const stageProjects = projects.filter(p => p.status === stage);
            return (
              <div key={stage} className="w-[min(100%,280px)] shrink-0 sm:w-auto sm:min-w-0 sm:flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-[6px] h-[6px] rounded-full"
                    style={{ background: 'var(--primary)', opacity: [1, 0.7, 0.45, 0.25][idx] }} />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.08em]"
                    style={{ color: 'var(--foreground-muted)' }}>{stage}</span>
                  <span className="text-[10px] font-bold ml-auto"
                    style={{ color: 'var(--foreground-muted)' }}>{stageProjects.length}</span>
                </div>
                <div className="space-y-2">
                  {stageProjects.map(p => (
                    <button
                      key={p.id}
                      onClick={() => onProjectClick(p)}
                      className="w-full rounded-xl p-3.5 text-left transition-all hover:-translate-y-0.5"
                      style={{
                        background: 'var(--glass-bg)',
                        border: '1px solid var(--border)',
                        backdropFilter: 'blur(20px)',
                      }}
                    >
                      <p className="text-[12px] font-medium mb-0.5" style={{ color: 'var(--foreground)' }}>{p.name}</p>
                      <p className="text-[10px] mb-2" style={{ color: 'var(--foreground-muted)' }}>{p.client}</p>
                      <BudgetCell spent={p.spent} budget={p.budget} />
                    </button>
                  ))}
                  <button
                    onClick={onCreateProject}
                    className="w-full py-2.5 rounded-xl text-[11px] font-medium transition-colors"
                    style={{
                      color: 'var(--foreground-muted)',
                      border: '1px dashed var(--border)',
                    }}
                  >
                    + New Project
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
