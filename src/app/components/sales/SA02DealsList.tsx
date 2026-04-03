import React, { useState } from 'react';
import { Plus, List, LayoutGrid, Columns3 } from 'lucide-react';
import { BonsaiButton } from '../bonsai/BonsaiButton';
import { BonsaiStatusPill } from '../bonsai/BonsaiStatusPill';
import { EnhancedTable } from '../operations/EnhancedTable';
import { BonsaiGridCards } from '../bonsai/BonsaiGridCards';
import { BonsaiKanban } from '../bonsai/BonsaiKanban';

interface Deal {
  id: string;
  name: string;
  client: string;
  type: 'Project' | 'Talent';
  value: string;
  stage: string;
  owner: string;
  nextStep: string;
  closeDate: string;
}

interface SA02DealsListProps {
  onDealClick: (deal: Deal) => void;
  onCreateDeal: () => void;
}

export function SA02DealsList({ onDealClick, onCreateDeal }: SA02DealsListProps) {
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'kanban'>('list');

  const deals: Deal[] = [
    {
      id: '1',
      name: 'Website Redesign Project',
      client: 'Acme Corp',
      type: 'Project',
      value: '$45,000',
      stage: 'Proposal Sent',
      owner: 'John Doe',
      nextStep: 'Follow up on proposal',
      closeDate: 'Jan 25, 2026',
    },
    {
      id: '2',
      name: 'Senior Designer Placement',
      client: 'Tech Startup',
      type: 'Talent',
      value: '$28,000',
      stage: 'Interviewing',
      owner: 'Jane Smith',
      nextStep: 'Schedule final interview',
      closeDate: 'Jan 30, 2026',
    },
    {
      id: '3',
      name: 'Brand Identity Package',
      client: 'Local Retail',
      type: 'Project',
      value: '$15,000',
      stage: 'Discovery Scheduled',
      owner: 'Mike Johnson',
      nextStep: 'Discovery call on Jan 12',
      closeDate: 'Feb 5, 2026',
    },
    {
      id: '4',
      name: 'React Developer Search',
      client: 'SaaS Company',
      type: 'Talent',
      value: '$35,000',
      stage: 'Profiles Shared',
      owner: 'Sarah Lee',
      nextStep: 'Await client feedback',
      closeDate: 'Jan 28, 2026',
    },
    {
      id: '5',
      name: 'Mobile App Development',
      client: 'FinTech Startup',
      type: 'Project',
      value: '$85,000',
      stage: 'Negotiation',
      owner: 'John Doe',
      nextStep: 'Contract review',
      closeDate: 'Jan 20, 2026',
    },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-stone-800">Deals</h1>
          <p className="text-sm text-stone-500">Manage all sales opportunities</p>
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
          <BonsaiButton variant="primary" icon={<Plus />} onClick={onCreateDeal}>
            Create Deal
          </BonsaiButton>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-stone-200 p-4">
          <p className="text-sm text-stone-600">Total Deals</p>
          <p className="text-2xl font-semibold text-stone-800 mt-1">{deals.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-stone-200 p-4">
          <p className="text-sm text-stone-600">Total Value</p>
          <p className="text-2xl font-semibold text-stone-800 mt-1">$208K</p>
        </div>
        <div className="bg-white rounded-lg border border-stone-200 p-4">
          <p className="text-sm text-stone-600">Project Deals</p>
          <p className="text-2xl font-semibold text-stone-800 mt-1">3</p>
        </div>
        <div className="bg-white rounded-lg border border-stone-200 p-4">
          <p className="text-sm text-stone-600">Talent Deals</p>
          <p className="text-2xl font-semibold text-stone-800 mt-1">2</p>
        </div>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'list' && (
        <EnhancedTable
          columns={[
            { key: 'name', label: 'Deal Name', sortable: true },
            { key: 'client', label: 'Client', sortable: true },
            { key: 'type', label: 'Type', sortable: true },
            { key: 'value', label: 'Value', sortable: true },
            { key: 'stage', label: 'Stage', sortable: false },
            { key: 'owner', label: 'Owner', sortable: true },
            { key: 'closeDate', label: 'Close Date', sortable: true },
          ]}
          data={deals.map(deal => ({
            ...deal,
            type: (
              <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                deal.type === 'Project' 
                  ? 'bg-stone-100 text-stone-600' 
                  : 'bg-stone-100 text-stone-600'
              }`}>
                {deal.type}
              </span>
            ),
            stage: <BonsaiStatusPill status="pending" label={deal.stage} />,
          }))}
          onRowClick={(row) => onDealClick(row as Deal)}
          searchable
          filterable
          selectable
        />
      )}

      {viewMode === 'grid' && (
        <BonsaiGridCards
          columns={3}
          cards={deals.map(deal => ({
            id: deal.id,
            title: deal.name,
            subtitle: deal.client,
            status: deal.stage,
            meta: [deal.value, deal.closeDate, `Type: ${deal.type}`],
          }))}
          onCardClick={(card) => {
            const deal = deals.find(d => d.id === card.id);
            if (deal) onDealClick(deal);
          }}
        />
      )}

      {viewMode === 'kanban' && (
        <div className="text-center py-12 bg-white rounded-lg border border-stone-200">
          <p className="text-stone-600 mb-4">Kanban view available in Pipeline screen</p>
          <BonsaiButton onClick={() => {/* Navigate to pipeline */}}>
            Go to Pipeline View
          </BonsaiButton>
        </div>
      )}
    </div>
  );
}
