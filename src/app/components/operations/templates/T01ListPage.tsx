import React from 'react';
import { Plus, Filter } from 'lucide-react';
import { BonsaiPageHeader } from '../../bonsai/BonsaiPageHeader';
import { BonsaiButton } from '../../bonsai/BonsaiButton';
import { BonsaiStatusPill } from '../../bonsai/BonsaiStatusPill';
import { EnhancedTable } from '../EnhancedTable';
import { TemplateInfoPanel } from '../TemplateInfoPanel';

interface T01ListPageProps {
  title: string;
  subtitle?: string;
}

export function T01ListPage({ title, subtitle }: T01ListPageProps) {
  const sampleData = Array.from({ length: 25 }, (_, i) => ({
    id: `${i + 1}`,
    name: `Record ${i + 1}`,
    type: ['Type A', 'Type B', 'Type C'][i % 3],
    status: ['Active', 'Pending', 'Completed'][i % 3],
    owner: ['John Doe', 'Jane Smith', 'Mike Johnson'][i % 3],
    date: `Jan ${(i % 28) + 1}, 2026`,
    value: `$${(1000 + i * 500).toLocaleString()}`,
  }));

  return (
    <>
      <div className="p-8">
        <BonsaiPageHeader
          title={title}
          subtitle={subtitle || `Manage and organize your ${title.toLowerCase()}`}
          actions={
            <>
              <BonsaiButton variant="ghost" size="sm" icon={<Filter />}>
                Advanced Filters
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
            <p className="text-sm text-stone-600">Total Records</p>
            <p className="text-2xl font-semibold text-stone-800 mt-1">{sampleData.length}</p>
          </div>
          <div className="bg-white rounded-lg border border-stone-200 p-4">
            <p className="text-sm text-stone-600">Active</p>
            <p className="text-2xl font-semibold text-stone-800 mt-1">8</p>
          </div>
          <div className="bg-white rounded-lg border border-stone-200 p-4">
            <p className="text-sm text-stone-600">Pending</p>
            <p className="text-2xl font-semibold text-stone-800 mt-1">9</p>
          </div>
          <div className="bg-white rounded-lg border border-stone-200 p-4">
            <p className="text-sm text-stone-600">Completed</p>
            <p className="text-2xl font-semibold text-stone-800 mt-1">8</p>
          </div>
        </div>

        {/* Enhanced Table with Bulk Actions */}
        <EnhancedTable
          columns={[
            { key: 'name', label: 'Name', sortable: true },
            { key: 'type', label: 'Type', sortable: true },
            { key: 'status', label: 'Status', sortable: false },
            { key: 'owner', label: 'Owner', sortable: true },
            { key: 'value', label: 'Value', sortable: true },
            { key: 'date', label: 'Date', sortable: true },
          ]}
          data={sampleData.map(item => ({
            ...item,
            status: (
              <BonsaiStatusPill
                status={
                  item.status === 'Active' ? 'active' :
                  item.status === 'Pending' ? 'pending' : 'completed'
                }
                label={item.status}
              />
            ),
          }))}
          onRowClick={(row) => console.log('Row clicked:', row)}
          searchable
          filterable
          pagination
          selectable
        />
      </div>
      
      <TemplateInfoPanel
        templateName="T-01 List Page"
        features={[
          'Row selection (individual & select all)',
          'Bulk actions toolbar',
          'Column chooser (show/hide)',
          'Search & filters',
          'Sortable columns',
          'Pagination',
          'Stats overview cards'
        ]}
      />
    </>
  );
}