import React from 'react';
import { Plus } from 'lucide-react';
import { BonsaiPageHeader } from '../../bonsai/BonsaiPageHeader';
import { BonsaiButton } from '../../bonsai/BonsaiButton';
import { BonsaiKanban } from '../../bonsai/BonsaiKanban';

interface T02KanbanPageProps {
  title: string;
  subtitle?: string;
}

export function T02KanbanPage({ title, subtitle }: T02KanbanPageProps) {
  const columns = [
    {
      id: 'new',
      title: 'New',
      count: 5,
      color: 'bg-stone-400',
      cards: [
        {
          id: '1',
          title: 'Initial consultation call',
          description: 'Schedule and prepare for first client meeting',
          tags: ['High Priority', 'Sales'],
          assignee: { name: 'John Doe', avatar: '' },
          dueDate: 'Jan 10',
        },
        {
          id: '2',
          title: 'Review proposal documents',
          tags: ['Documentation'],
          assignee: { name: 'Jane Smith', avatar: '' },
          dueDate: 'Jan 12',
        },
      ],
    },
    {
      id: 'inprogress',
      title: 'In Progress',
      count: 8,
      color: 'bg-stone-1000',
      cards: [
        {
          id: '3',
          title: 'Project kickoff meeting',
          description: 'Align team on project goals and timeline',
          tags: ['Meeting', 'Project'],
          assignee: { name: 'Mike Johnson', avatar: '' },
          dueDate: 'Jan 15',
        },
        {
          id: '4',
          title: 'Design mockups review',
          tags: ['Design', 'Review'],
          assignee: { name: 'Sarah Lee', avatar: '' },
          dueDate: 'Jan 16',
        },
      ],
    },
    {
      id: 'review',
      title: 'Review',
      count: 3,
      color: 'bg-stone-1000',
      cards: [
        {
          id: '5',
          title: 'Contract approval needed',
          description: 'Waiting for legal team sign-off',
          tags: ['Legal', 'Blocking'],
          assignee: { name: 'Tom Wilson', avatar: '' },
          dueDate: 'Jan 14',
        },
      ],
    },
    {
      id: 'done',
      title: 'Done',
      count: 12,
      color: 'bg-stone-1000',
      cards: [
        {
          id: '6',
          title: 'Onboarding documentation',
          tags: ['Documentation'],
          assignee: { name: 'Alice Brown', avatar: '' },
          dueDate: 'Completed',
        },
      ],
    },
  ];

  return (
    <div className="p-8">
      <BonsaiPageHeader
        title={title}
        subtitle={subtitle || `Manage workflow and track progress`}
        actions={
          <>
            <BonsaiButton variant="ghost" size="sm">
              View Settings
            </BonsaiButton>
            <BonsaiButton variant="primary" size="sm" icon={<Plus />}>
              Add Card
            </BonsaiButton>
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-stone-200 p-4">
          <p className="text-sm text-stone-600">Total Cards</p>
          <p className="text-2xl font-semibold text-stone-800 mt-1">28</p>
        </div>
        <div className="bg-white rounded-lg border border-stone-200 p-4">
          <p className="text-sm text-stone-600">In Progress</p>
          <p className="text-2xl font-semibold text-stone-800 mt-1">8</p>
        </div>
        <div className="bg-white rounded-lg border border-stone-200 p-4">
          <p className="text-sm text-stone-600">Blocked</p>
          <p className="text-2xl font-semibold text-stone-800 mt-1">3</p>
        </div>
        <div className="bg-white rounded-lg border border-stone-200 p-4">
          <p className="text-sm text-stone-600">Completed</p>
          <p className="text-2xl font-semibold text-stone-800 mt-1">12</p>
        </div>
      </div>

      {/* Kanban Board */}
      <BonsaiKanban
        columns={columns}
        onCardClick={(card) => console.log('Card clicked:', card)}
        onAddCard={(columnId) => console.log('Add card to:', columnId)}
      />
    </div>
  );
}
