import React, { useState } from 'react';
import { Plus, Edit, Trash2, MoreVertical, Filter, Star, Calendar } from 'lucide-react';
import { BonsaiSidebar } from './bonsai/BonsaiSidebar';
import { BonsaiTopBar } from './bonsai/BonsaiTopBar';
import { BonsaiPageHeader } from './bonsai/BonsaiPageHeader';
import { BonsaiTabs } from './bonsai/BonsaiTabs';
import { BonsaiButton } from './bonsai/BonsaiButton';
import { BonsaiTable } from './bonsai/BonsaiTable';
import { BonsaiStatusPill } from './bonsai/BonsaiStatusPill';
import { BonsaiDrawer, BonsaiModal } from './bonsai/BonsaiModals';
import { BonsaiInput, BonsaiTextarea, BonsaiSelect } from './bonsai/BonsaiFormFields';
import { BonsaiTimeline } from './bonsai/BonsaiTimeline';
import { BonsaiToastContainer, useBonsaiToast } from './bonsai/BonsaiToast';

export default function LayoutTemplates() {
  const [activeTab, setActiveTab] = useState('all');
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const toast = useBonsaiToast();

  const projectData = Array.from({ length: 15 }, (_, i) => ({
    id: `${i + 1}`,
    name: `Project ${String.fromCharCode(65 + (i % 26))}`,
    client: ['Acme Corp', 'TechStart', 'Design Co', 'BuildIt Inc'][i % 4],
    status: ['Active', 'Completed', 'Draft', 'On Hold'][i % 4],
    revenue: `$${(5000 + i * 1000).toLocaleString()}`,
    progress: `${(i * 7) % 100}%`,
    dueDate: `Jan ${(i % 28) + 1}, 2026`,
  }));

  const handleRowClick = (row: any) => {
    setSelectedItem(row);
    setShowDetailDrawer(true);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <BonsaiSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <BonsaiTopBar />
        
        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto p-8">
            {/* Page Header */}
            <BonsaiPageHeader
              title="01 – Layout Templates"
              subtitle="List and detail view templates with full functionality"
              actions={
                <>
                  <BonsaiButton variant="ghost" size="sm" icon={<Filter />}>
                    Filter
                  </BonsaiButton>
                  <BonsaiButton variant="primary" size="sm" icon={<Plus />}>
                    New Project
                  </BonsaiButton>
                </>
              }
            />

            {/* Tabs */}
            <BonsaiTabs
              tabs={[
                { label: 'All Projects', value: 'all', count: 15 },
                { label: 'Active', value: 'active', count: 8 },
                { label: 'Completed', value: 'completed', count: 5 },
                { label: 'Archived', value: 'archived', count: 2 },
              ]}
              value={activeTab}
              onValueChange={setActiveTab}
            />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-white rounded-lg border border-stone-200 p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm text-stone-600">Total Revenue</p>
                    <p className="text-2xl font-semibold text-stone-800 mt-1">$127,500</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-primary">💰</span>
                  </div>
                </div>
                <p className="text-xs text-green-600">+12% from last month</p>
              </div>

              <div className="bg-white rounded-lg border border-stone-200 p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm text-stone-600">Active Projects</p>
                    <p className="text-2xl font-semibold text-stone-800 mt-1">8</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600">📊</span>
                  </div>
                </div>
                <p className="text-xs text-stone-500">2 due this week</p>
              </div>

              <div className="bg-white rounded-lg border border-stone-200 p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm text-stone-600">Completed</p>
                    <p className="text-2xl font-semibold text-stone-800 mt-1">24</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <span className="text-green-600">✅</span>
                  </div>
                </div>
                <p className="text-xs text-stone-500">This quarter</p>
              </div>

              <div className="bg-white rounded-lg border border-stone-200 p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm text-stone-600">Team Members</p>
                    <p className="text-2xl font-semibold text-stone-800 mt-1">12</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <span className="text-purple-600">👥</span>
                  </div>
                </div>
                <p className="text-xs text-stone-500">Across 8 projects</p>
              </div>
            </div>

            {/* Main Table */}
            <div className="mt-6">
              <BonsaiTable
                columns={[
                  { key: 'name', label: 'Project Name', sortable: true },
                  { key: 'client', label: 'Client', sortable: true },
                  { key: 'status', label: 'Status', sortable: false },
                  { key: 'revenue', label: 'Revenue', sortable: true },
                  { key: 'progress', label: 'Progress', sortable: true },
                  { key: 'dueDate', label: 'Due Date', sortable: true },
                ]}
                data={projectData.map(project => ({
                  ...project,
                  status: (
                    <BonsaiStatusPill
                      status={
                        project.status === 'Active' ? 'active' :
                        project.status === 'Completed' ? 'completed' :
                        project.status === 'Draft' ? 'draft' : 'pending'
                      }
                      label={project.status}
                    />
                  ),
                }))}
                onRowClick={handleRowClick}
                searchable
                filterable
                pagination
              />
            </div>
          </div>
        </div>
      </div>

      {/* Detail Drawer */}
      <BonsaiDrawer
        open={showDetailDrawer}
        onClose={() => setShowDetailDrawer(false)}
        title={selectedItem?.name || 'Project Details'}
        width="lg"
        footer={
          <>
            <BonsaiButton variant="ghost" onClick={() => setShowDetailDrawer(false)}>
              Close
            </BonsaiButton>
            <BonsaiButton variant="destructive" icon={<Trash2 />}>
              Delete
            </BonsaiButton>
            <BonsaiButton icon={<Edit />}>
              Edit Project
            </BonsaiButton>
          </>
        }
      >
        {selectedItem && (
          <div className="space-y-6">
            {/* Project Info */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-stone-800">{selectedItem.name}</h3>
                  <p className="text-sm text-stone-500 mt-1">{selectedItem.client}</p>
                </div>
                <BonsaiStatusPill
                  status={
                    selectedItem.status === 'Active' ? 'active' :
                    selectedItem.status === 'Completed' ? 'completed' :
                    selectedItem.status === 'Draft' ? 'draft' : 'pending'
                  }
                  label={selectedItem.status}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-stone-50 rounded-lg">
                <div>
                  <p className="text-xs text-stone-600 mb-1">Revenue</p>
                  <p className="text-sm font-semibold text-stone-800">{selectedItem.revenue}</p>
                </div>
                <div>
                  <p className="text-xs text-stone-600 mb-1">Progress</p>
                  <p className="text-sm font-semibold text-stone-800">{selectedItem.progress}</p>
                </div>
                <div>
                  <p className="text-xs text-stone-600 mb-1">Due Date</p>
                  <p className="text-sm font-semibold text-stone-800">{selectedItem.dueDate}</p>
                </div>
                <div>
                  <p className="text-xs text-stone-600 mb-1">Project ID</p>
                  <p className="text-sm font-semibold text-stone-800">#{selectedItem.id}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-sm font-semibold text-stone-800 mb-2">Description</h4>
              <p className="text-sm text-stone-600">
                This is a sample project description that would contain detailed information about the project scope, objectives, and deliverables. In a real application, this would be pulled from your database.
              </p>
            </div>

            {/* Team Members */}
            <div>
              <h4 className="text-sm font-semibold text-stone-800 mb-3">Team Members</h4>
              <div className="space-y-2">
                {['John Doe', 'Jane Smith', 'Mike Johnson'].map((name, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-2 hover:bg-stone-50 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-medium">
                        {name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-stone-800">{name}</p>
                      <p className="text-xs text-stone-500">
                        {['Project Manager', 'Designer', 'Developer'][idx]}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity Timeline */}
            <div>
              <h4 className="text-sm font-semibold text-stone-800 mb-3">Recent Activity</h4>
              <BonsaiTimeline
                items={[
                  {
                    id: '1',
                    title: 'Project milestone completed',
                    description: 'Phase 1 deliverables approved',
                    timestamp: '2 hours ago',
                    user: { name: 'John Doe' },
                  },
                  {
                    id: '2',
                    title: 'Status updated',
                    description: 'Project moved to active status',
                    timestamp: '1 day ago',
                    user: { name: 'Jane Smith' },
                  },
                  {
                    id: '3',
                    title: 'Project created',
                    description: 'New project initiated',
                    timestamp: '3 days ago',
                    user: { name: 'Mike Johnson' },
                  },
                ]}
              />
            </div>

            {/* Quick Actions */}
            <div className="pt-4 border-t border-stone-200">
              <h4 className="text-sm font-semibold text-stone-800 mb-3">Quick Actions</h4>
              <div className="grid grid-cols-2 gap-2">
                <BonsaiButton variant="outline" size="sm" icon={<Star />}>
                  Add to Favorites
                </BonsaiButton>
                <BonsaiButton variant="outline" size="sm" icon={<Calendar />}>
                  Schedule Meeting
                </BonsaiButton>
              </div>
            </div>
          </div>
        )}
      </BonsaiDrawer>

      <BonsaiToastContainer toasts={toast.toasts} onClose={toast.closeToast} />
    </div>
  );
}
