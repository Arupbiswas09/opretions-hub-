import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { BonsaiButton } from '../bonsai/BonsaiButton';
import { BonsaiKanban } from '../bonsai/BonsaiKanban';

interface Deal {
  id: string;
  name: string;
  client: string;
  type: 'Project' | 'Talent';
  value: string;
  stage: string;
  owner: string;
}

interface SA03PipelineProps {
  onDealClick: (deal: Deal) => void;
  onCreateDeal: () => void;
}

export function SA03Pipeline({ onDealClick, onCreateDeal }: SA03PipelineProps) {
  const [pipelineType, setPipelineType] = useState<'project' | 'talent'>('project');

  const projectColumns = [
    {
      id: 'new-lead',
      title: 'New Lead',
      count: 5,
      color: 'bg-stone-400',
      cards: [
        {
          id: '1',
          title: 'E-commerce Platform',
          description: 'Full-stack development project',
          tags: ['Web Dev', 'High Value'],
          assignee: { name: 'John Doe', avatar: '' },
          metadata: { client: 'Fashion Co', value: '$75,000' },
        },
        {
          id: '2',
          title: 'Marketing Website',
          tags: ['Design', 'Development'],
          assignee: { name: 'Jane Smith', avatar: '' },
          metadata: { client: 'Local Business', value: '$12,000' },
        },
      ],
    },
    {
      id: 'qualified',
      title: 'Qualified',
      count: 3,
      color: 'bg-blue-400',
      cards: [
        {
          id: '3',
          title: 'SaaS Dashboard',
          description: 'Admin panel redesign',
          tags: ['UI/UX', 'React'],
          assignee: { name: 'Mike Johnson', avatar: '' },
          metadata: { client: 'Tech Startup', value: '$38,000' },
        },
      ],
    },
    {
      id: 'discovery',
      title: 'Discovery Scheduled',
      count: 4,
      color: 'bg-cyan-500',
      cards: [
        {
          id: '4',
          title: 'Brand Identity Package',
          tags: ['Branding', 'Design'],
          assignee: { name: 'Sarah Lee', avatar: '' },
          metadata: { client: 'Local Retail', value: '$15,000' },
        },
      ],
    },
    {
      id: 'proposal',
      title: 'Proposal Sent',
      count: 3,
      color: 'bg-purple-500',
      cards: [
        {
          id: '5',
          title: 'Website Redesign Project',
          description: 'Modern, responsive website',
          tags: ['Design', 'Development'],
          assignee: { name: 'John Doe', avatar: '' },
          metadata: { client: 'Acme Corp', value: '$45,000' },
        },
      ],
    },
    {
      id: 'negotiation',
      title: 'Negotiation',
      count: 3,
      color: 'bg-amber-500',
      cards: [
        {
          id: '6',
          title: 'Mobile App Development',
          tags: ['Mobile', 'React Native'],
          assignee: { name: 'Mike Johnson', avatar: '' },
          metadata: { client: 'FinTech Startup', value: '$85,000' },
        },
      ],
    },
    {
      id: 'won',
      title: 'Won',
      count: 8,
      color: 'bg-green-500',
      cards: [],
    },
  ];

  const talentColumns = [
    {
      id: 'new-request',
      title: 'New Request',
      count: 2,
      color: 'bg-stone-400',
      cards: [
        {
          id: 't1',
          title: 'Full-Stack Engineer',
          description: 'Senior level, React + Node.js',
          tags: ['Development', 'Remote'],
          assignee: { name: 'Sarah Lee', avatar: '' },
          metadata: { client: 'SaaS Startup', value: '$45,000' },
        },
      ],
    },
    {
      id: 'qualified',
      title: 'Qualified',
      count: 1,
      color: 'bg-blue-400',
      cards: [
        {
          id: 't2',
          title: 'UX/UI Designer',
          tags: ['Design', 'Contract'],
          assignee: { name: 'Jane Smith', avatar: '' },
          metadata: { client: 'E-commerce Co', value: '$25,000' },
        },
      ],
    },
    {
      id: 'profiles',
      title: 'Profiles Shared',
      count: 1,
      color: 'bg-cyan-500',
      cards: [
        {
          id: 't3',
          title: 'React Developer Search',
          description: '3-6 months contract',
          tags: ['React', 'Frontend'],
          assignee: { name: 'Mike Johnson', avatar: '' },
          metadata: { client: 'Tech Company', value: '$35,000' },
        },
      ],
    },
    {
      id: 'interviewing',
      title: 'Interviewing',
      count: 0,
      color: 'bg-purple-500',
      cards: [
        {
          id: 't4',
          title: 'Senior Designer Placement',
          tags: ['Design', 'Full-time'],
          assignee: { name: 'John Doe', avatar: '' },
          metadata: { client: 'Agency', value: '$28,000' },
        },
      ],
    },
    {
      id: 'placement',
      title: 'Placement',
      count: 1,
      color: 'bg-amber-500',
      cards: [],
    },
    {
      id: 'won',
      title: 'Won',
      count: 4,
      color: 'bg-green-500',
      cards: [],
    },
  ];

  const columns = pipelineType === 'project' ? projectColumns : talentColumns;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-stone-800">Deals Pipeline</h1>
          <p className="text-sm text-stone-500">Visual workflow for sales opportunities</p>
        </div>
        <BonsaiButton variant="primary" icon={<Plus />} onClick={onCreateDeal}>
          Create Deal
        </BonsaiButton>
      </div>

      {/* Pipeline Toggle */}
      <div className="mb-6 flex items-center gap-4">
        <p className="text-sm text-stone-600">Pipeline:</p>
        <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-lg p-1">
          <button
            onClick={() => setPipelineType('project')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              pipelineType === 'project'
                ? 'bg-primary text-white'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Project Pipeline
          </button>
          <button
            onClick={() => setPipelineType('talent')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              pipelineType === 'talent'
                ? 'bg-primary text-white'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Talent Pipeline
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-stone-200 p-4">
          <p className="text-sm text-stone-600">Total Value</p>
          <p className="text-2xl font-semibold text-stone-800 mt-1">
            {pipelineType === 'project' ? '$270K' : '$133K'}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-stone-200 p-4">
          <p className="text-sm text-stone-600">Active Deals</p>
          <p className="text-2xl font-semibold text-stone-800 mt-1">
            {pipelineType === 'project' ? '18' : '5'}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-stone-200 p-4">
          <p className="text-sm text-stone-600">Avg Deal Size</p>
          <p className="text-2xl font-semibold text-stone-800 mt-1">
            {pipelineType === 'project' ? '$45K' : '$28K'}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-stone-200 p-4">
          <p className="text-sm text-stone-600">Close Rate</p>
          <p className="text-2xl font-semibold text-stone-800 mt-1">
            {pipelineType === 'project' ? '72%' : '64%'}
          </p>
        </div>
      </div>

      {/* Kanban Board */}
      <BonsaiKanban
        columns={columns}
        onCardClick={(card) => {
          // Create a deal object from card
          const deal: Deal = {
            id: card.id,
            name: card.title,
            client: card.metadata?.client || 'Unknown',
            type: pipelineType === 'project' ? 'Project' : 'Talent',
            value: card.metadata?.value || '$0',
            stage: columns.find(col => col.cards.some(c => c.id === card.id))?.title || 'Unknown',
            owner: card.assignee?.name || 'Unassigned',
          };
          onDealClick(deal);
        }}
        onAddCard={(columnId) => onCreateDeal()}
      />
    </div>
  );
}
