import React from 'react';
import { Plus, Filter, Grid3x3, List } from 'lucide-react';
import { BonsaiPageHeader } from '../../bonsai/BonsaiPageHeader';
import { BonsaiButton } from '../../bonsai/BonsaiButton';
import { BonsaiGridCards } from '../../bonsai/BonsaiGridCards';

interface T03GridPageProps {
  title: string;
  subtitle?: string;
}

export function T03GridPage({ title, subtitle }: T03GridPageProps) {
  const cards = Array.from({ length: 12 }, (_, i) => ({
    id: `${i + 1}`,
    title: `Item ${i + 1}`,
    subtitle: ['Category A', 'Category B', 'Category C'][i % 3],
    status: ['Active', 'Pending', 'Completed'][i % 3],
    meta: [
      `${Math.floor(Math.random() * 10) + 1} tasks`,
      `Due Jan ${(i % 28) + 1}`,
    ],
  }));

  return (
    <div className="px-3 py-6 sm:p-8">
      <BonsaiPageHeader
        title={title}
        subtitle={subtitle || `Browse and manage your ${title.toLowerCase()}`}
        actions={
          <>
            <div className="flex items-center gap-1 bg-white border border-stone-200 rounded-lg p-1">
              <button className="p-1.5 bg-primary/10 text-primary rounded">
                <Grid3x3 className="w-4 h-4" />
              </button>
              <button className="p-1.5 text-stone-600 hover:bg-stone-100 rounded">
                <List className="w-4 h-4" />
              </button>
            </div>
            <BonsaiButton variant="ghost" size="sm" icon={<Filter />}>
              Filter
            </BonsaiButton>
            <BonsaiButton variant="primary" size="sm" icon={<Plus />}>
              Create New
            </BonsaiButton>
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-stone-200 p-4">
          <p className="text-sm text-stone-600">Total Items</p>
          <p className="text-2xl font-semibold text-stone-800 mt-1">{cards.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-stone-200 p-4">
          <p className="text-sm text-stone-600">Active</p>
          <p className="text-2xl font-semibold text-stone-800 mt-1">4</p>
        </div>
        <div className="bg-white rounded-lg border border-stone-200 p-4">
          <p className="text-sm text-stone-600">Pending</p>
          <p className="text-2xl font-semibold text-stone-800 mt-1">4</p>
        </div>
        <div className="bg-white rounded-lg border border-stone-200 p-4">
          <p className="text-sm text-stone-600">Completed</p>
          <p className="text-2xl font-semibold text-stone-800 mt-1">4</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search items..."
            className="w-full px-4 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <select className="px-4 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
          <option>All Categories</option>
          <option>Category A</option>
          <option>Category B</option>
          <option>Category C</option>
        </select>
        <select className="px-4 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
          <option>All Status</option>
          <option>Active</option>
          <option>Pending</option>
          <option>Completed</option>
        </select>
      </div>

      {/* Grid Cards */}
      <BonsaiGridCards
        columns={3}
        cards={cards}
        onCardClick={(card) => console.log('Card clicked:', card)}
      />
    </div>
  );
}
