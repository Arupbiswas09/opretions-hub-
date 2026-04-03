import React, { useState } from 'react';
import { Plus, List, Columns3, LayoutGrid, Settings, Download } from 'lucide-react';
import { BonsaiButton } from '../bonsai/BonsaiButton';
import { BonsaiStatusPill } from '../bonsai/BonsaiStatusPill';
import { EnhancedTable } from '../operations/EnhancedTable';

interface Job {
  id: string;
  title: string;
  client: string;
  type: string;
  location: string;
  stage: string;
  candidates: number;
  created: string;
}

interface TA02JobsListProps {
  onJobClick: (job: Job) => void;
  onCreate: () => void;
  onPipelineView: () => void;
}

export function TA02JobsList({ onJobClick, onCreate, onPipelineView }: TA02JobsListProps) {
  const [viewMode, setViewMode] = useState<'list' | 'kanban' | 'grid'>('list');
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);

  const jobs: Job[] = [
    {
      id: '1',
      title: 'Senior React Developer',
      client: 'Tech Startup Inc',
      type: 'Full-time',
      location: 'Remote',
      stage: 'Sourcing',
      candidates: 8,
      created: 'Jan 10, 2026',
    },
    {
      id: '2',
      title: 'UX Designer',
      client: 'Acme Corporation',
      type: 'Contract',
      location: 'San Francisco',
      stage: 'Interviewing',
      candidates: 12,
      created: 'Jan 5, 2026',
    },
    {
      id: '3',
      title: 'Product Manager',
      client: 'Local Retail Co',
      type: 'Full-time',
      location: 'New York',
      stage: 'Offer/Placement',
      candidates: 5,
      created: 'Dec 28, 2025',
    },
  ];

  const getStageColor = (stage: string): 'active' | 'pending' | 'inactive' | 'archived' => {
    switch (stage) {
      case 'Offer/Placement':
      case 'Won': return 'active';
      case 'Sourcing':
      case 'Interviewing': return 'pending';
      case 'Lost': return 'inactive';
      default: return 'archived';
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-stone-800">Jobs</h1>
          <p className="text-sm text-stone-500">Open positions and requisitions</p>
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
              onClick={() => { setViewMode('kanban'); onPipelineView(); }}
              className={`p-2 rounded ${viewMode === 'kanban' ? 'bg-primary/10 text-primary' : 'text-stone-600 hover:bg-stone-100'}`}
            >
              <Columns3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary/10 text-primary' : 'text-stone-600 hover:bg-stone-100'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <BonsaiButton variant="ghost" size="sm" icon={<Download />}>
            Export
          </BonsaiButton>
          <BonsaiButton variant="primary" icon={<Plus />} onClick={onCreate}>
            New Job
          </BonsaiButton>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-stone-200 p-4">
          <p className="text-sm text-stone-600">Total Jobs</p>
          <p className="text-2xl font-semibold text-stone-800 mt-1">{jobs.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-stone-200 p-4">
          <p className="text-sm text-stone-600">Sourcing</p>
          <p className="text-2xl font-semibold text-stone-600 mt-1">1</p>
        </div>
        <div className="bg-white rounded-lg border border-stone-200 p-4">
          <p className="text-sm text-stone-600">Interviewing</p>
          <p className="text-2xl font-semibold text-stone-600 mt-1">1</p>
        </div>
        <div className="bg-white rounded-lg border border-stone-200 p-4">
          <p className="text-sm text-stone-600">Offers</p>
          <p className="text-2xl font-semibold text-stone-600 mt-1">1</p>
        </div>
        <div className="bg-white rounded-lg border border-stone-200 p-4">
          <p className="text-sm text-stone-600">Total Candidates</p>
          <p className="text-2xl font-semibold text-primary mt-1">25</p>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedJobs.length > 0 && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6 flex items-center justify-between">
          <p className="text-sm font-medium text-primary">
            {selectedJobs.length} {selectedJobs.length === 1 ? 'job' : 'jobs'} selected
          </p>
          <div className="flex items-center gap-2">
            <BonsaiButton size="sm" variant="ghost">Archive</BonsaiButton>
            <BonsaiButton size="sm" variant="ghost">Export</BonsaiButton>
          </div>
        </div>
      )}

      {/* Jobs Table */}
      {viewMode === 'list' && (
        <EnhancedTable
          columns={[
            { key: 'title', label: 'Job Title', sortable: true },
            { key: 'client', label: 'Client', sortable: true },
            { key: 'type', label: 'Type', sortable: true },
            { key: 'location', label: 'Location', sortable: true },
            { key: 'candidates', label: 'Candidates', sortable: true },
            { key: 'stage', label: 'Stage', sortable: true },
            { key: 'created', label: 'Created', sortable: true },
          ]}
          data={jobs.map(job => ({
            ...job,
            stage: (
              <BonsaiStatusPill
                status={getStageColor(job.stage)}
                label={job.stage}
              />
            ),
          }))}
          onRowClick={(row) => onJobClick(row as Job)}
          searchable
          filterable
          selectable
          onSelectionChange={setSelectedJobs}
        />
      )}

      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {jobs.map((job) => (
            <button
              key={job.id}
              onClick={() => onJobClick(job)}
              className="bg-white rounded-lg border border-stone-200 p-6 hover:shadow-md transition-shadow text-left"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-stone-800">{job.title}</h3>
                <BonsaiStatusPill status={getStageColor(job.stage)} label={job.stage} />
              </div>
              <p className="text-sm text-stone-600 mb-2">{job.client}</p>
              <div className="flex items-center gap-3 text-xs text-stone-500">
                <span>{job.type}</span>
                <span>•</span>
                <span>{job.location}</span>
                <span>•</span>
                <span>{job.candidates} candidates</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {viewMode === 'kanban' && (
        <div className="text-center py-12 bg-white rounded-lg border border-stone-200">
          <p className="text-stone-600">Kanban Pipeline View (TA-03)</p>
        </div>
      )}
    </div>
  );
}
