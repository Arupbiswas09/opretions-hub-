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
            <div className="flex items-center gap-1 hub-surface rounded-lg p-1">
              <button type="button" className="p-1.5 bg-primary/10 text-primary rounded">
                <Grid3x3 className="w-4 h-4" />
              </button>
              <button
                type="button"
                className="p-1.5 text-muted-foreground hover:bg-[var(--row-hover-bg)] rounded"
              >
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Items', value: cards.length },
          { label: 'Active', value: 4 },
          { label: 'Pending', value: 4 },
          { label: 'Completed', value: 4 },
        ].map((s) => (
          <div key={s.label} className="hub-surface hub-surface-elevated rounded-lg p-4">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="text-2xl font-semibold text-foreground mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search items..."
            className="hub-field px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <select className="hub-field px-4 py-2 text-sm bg-background text-foreground">
          <option>All Categories</option>
          <option>Category A</option>
          <option>Category B</option>
          <option>Category C</option>
        </select>
        <select className="hub-field px-4 py-2 text-sm bg-background text-foreground">
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
