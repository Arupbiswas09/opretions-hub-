import React, { useState } from 'react';
import { Plus, Download, Edit, Trash2, MoreVertical } from 'lucide-react';
import { BonsaiSidebar } from './bonsai/BonsaiSidebar';
import { BonsaiTopBar } from './bonsai/BonsaiTopBar';
import { BonsaiPageHeader } from './bonsai/BonsaiPageHeader';
import { BonsaiTabs } from './bonsai/BonsaiTabs';
import { BonsaiButton } from './bonsai/BonsaiButton';
import { BonsaiInput, BonsaiTextarea, BonsaiSelect, BonsaiCheckbox } from './bonsai/BonsaiFormFields';
import { BonsaiTable } from './bonsai/BonsaiTable';
import { BonsaiKanban } from './bonsai/BonsaiKanban';
import { BonsaiGridCards } from './bonsai/BonsaiGridCards';
import { BonsaiStatusPill } from './bonsai/BonsaiStatusPill';
import { BonsaiDrawer, BonsaiModal, BonsaiConfirmDialog } from './bonsai/BonsaiModals';
import { BonsaiTimeline } from './bonsai/BonsaiTimeline';
import { BonsaiFileUpload, BonsaiDocumentList } from './bonsai/BonsaiFileUpload';
import { BonsaiEmptyState, BonsaiPermissionDenied } from './bonsai/BonsaiEmptyStates';
import { BonsaiToastContainer, useBonsaiToast } from './bonsai/BonsaiToast';

export default function UIKitDemo() {
  const [activeTab, setActiveTab] = useState('components');
  const [showDrawer, setShowDrawer] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const toast = useBonsaiToast();

  return (
    <div className="flex h-screen overflow-hidden">
      <BonsaiSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <BonsaiTopBar />
        
        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto p-8">
            <BonsaiPageHeader
              title="00 – UI Kit (Bonsai Style)"
              subtitle="A comprehensive design system inspired by HelloBonsai"
              actions={
                <>
                  <BonsaiButton variant="ghost" size="sm">
                    Export
                  </BonsaiButton>
                  <BonsaiButton variant="primary" size="sm" icon={<Plus />}>
                    Create Component
                  </BonsaiButton>
                </>
              }
            />

            <BonsaiTabs
              tabs={[
                { label: 'Components', value: 'components', count: 15 },
                { label: 'Buttons & Forms', value: 'forms', count: 8 },
                { label: 'Data Display', value: 'data', count: 5 },
                { label: 'Feedback', value: 'feedback', count: 4 },
              ]}
              value={activeTab}
              onValueChange={setActiveTab}
            />

            <div className="mt-8 space-y-12">
              {/* Buttons Section */}
              <section>
                <h2 className="text-xl font-semibold text-stone-800 mb-4">Buttons</h2>
                <div className="bg-white rounded-lg border border-stone-200 p-6">
                  <div className="flex flex-wrap gap-3">
                    <BonsaiButton variant="primary">Primary Button</BonsaiButton>
                    <BonsaiButton variant="secondary">Secondary Button</BonsaiButton>
                    <BonsaiButton variant="ghost">Ghost Button</BonsaiButton>
                    <BonsaiButton variant="outline">Outline Button</BonsaiButton>
                    <BonsaiButton variant="destructive">Destructive Button</BonsaiButton>
                    <BonsaiButton variant="primary" size="sm" icon={<Plus />}>
                      With Icon
                    </BonsaiButton>
                    <BonsaiButton variant="primary" disabled>
                      Disabled
                    </BonsaiButton>
                  </div>
                </div>
              </section>

              {/* Status Pills */}
              <section>
                <h2 className="text-xl font-semibold text-stone-800 mb-4">Status Pills</h2>
                <div className="bg-white rounded-lg border border-stone-200 p-6">
                  <div className="flex flex-wrap gap-3">
                    <BonsaiStatusPill status="draft" label="Draft" />
                    <BonsaiStatusPill status="active" label="Active" />
                    <BonsaiStatusPill status="completed" label="Completed" />
                    <BonsaiStatusPill status="pending" label="Pending" />
                    <BonsaiStatusPill status="inProgress" label="In Progress" />
                    <BonsaiStatusPill status="overdue" label="Overdue" />
                    <BonsaiStatusPill status="cancelled" label="Cancelled" />
                  </div>
                </div>
              </section>

              {/* Form Fields */}
              <section>
                <h2 className="text-xl font-semibold text-stone-800 mb-4">Form Fields</h2>
                <div className="bg-white rounded-lg border border-stone-200 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <BonsaiInput
                      label="Text Input"
                      placeholder="Enter your name"
                      helperText="This is a helper text"
                    />
                    <BonsaiInput
                      label="Email with Error"
                      type="email"
                      placeholder="email@example.com"
                      error="Please enter a valid email"
                    />
                    <BonsaiSelect
                      label="Select Dropdown"
                      options={[
                        { value: '', label: 'Select an option' },
                        { value: '1', label: 'Option 1' },
                        { value: '2', label: 'Option 2' },
                      ]}
                    />
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">
                        Date Input
                      </label>
                      <BonsaiInput type="date" />
                    </div>
                  </div>
                  <div className="mt-6">
                    <BonsaiTextarea
                      label="Textarea"
                      placeholder="Enter a longer description..."
                      helperText="Maximum 500 characters"
                    />
                  </div>
                  <div className="mt-6 space-y-3">
                    <BonsaiCheckbox label="I agree to the terms and conditions" />
                    <BonsaiCheckbox label="Subscribe to newsletter" />
                  </div>
                </div>
              </section>

              {/* Grid Cards */}
              <section>
                <h2 className="text-xl font-semibold text-stone-800 mb-4">Grid Cards</h2>
                <BonsaiGridCards
                  columns={3}
                  cards={[
                    {
                      id: '1',
                      title: 'Project Alpha',
                      subtitle: 'Web Development',
                      status: 'Active',
                      meta: ['5 tasks', 'Due Jan 15'],
                    },
                    {
                      id: '2',
                      title: 'Brand Identity',
                      subtitle: 'Design',
                      status: 'Completed',
                      meta: ['12 deliverables', 'Completed Dec 20'],
                    },
                    {
                      id: '3',
                      title: 'Mobile App',
                      subtitle: 'iOS Development',
                      status: 'In Progress',
                      meta: ['8 tasks', 'Due Feb 1'],
                    },
                  ]}
                />
              </section>

              {/* Kanban Board */}
              <section>
                <h2 className="text-xl font-semibold text-stone-800 mb-4">Kanban Board</h2>
                <BonsaiKanban
                  columns={[
                    {
                      id: 'todo',
                      title: 'To Do',
                      count: 3,
                      color: 'bg-stone-400',
                      cards: [
                        {
                          id: '1',
                          title: 'Design homepage',
                          description: 'Create wireframes and mockups',
                          tags: ['Design', 'High Priority'],
                          assignee: { name: 'John Doe', avatar: '' },
                          dueDate: 'Jan 10',
                        },
                        {
                          id: '2',
                          title: 'Setup analytics',
                          tags: ['Development'],
                          assignee: { name: 'Jane Smith', avatar: '' },
                          dueDate: 'Jan 12',
                        },
                      ],
                    },
                    {
                      id: 'progress',
                      title: 'In Progress',
                      count: 2,
                      color: 'bg-stone-1000',
                      cards: [
                        {
                          id: '3',
                          title: 'Build payment flow',
                          description: 'Integrate Stripe API',
                          tags: ['Development', 'Backend'],
                          assignee: { name: 'Mike Johnson', avatar: '' },
                          dueDate: 'Jan 15',
                        },
                      ],
                    },
                    {
                      id: 'done',
                      title: 'Done',
                      count: 5,
                      color: 'bg-stone-1000',
                      cards: [
                        {
                          id: '4',
                          title: 'User research',
                          tags: ['Research'],
                          assignee: { name: 'Sarah Lee', avatar: '' },
                          dueDate: 'Completed',
                        },
                      ],
                    },
                  ]}
                />
              </section>

              {/* Table */}
              <section>
                <h2 className="text-xl font-semibold text-stone-800 mb-4">Data Table</h2>
                <BonsaiTable
                  columns={[
                    { key: 'name', label: 'Name', sortable: true },
                    { key: 'email', label: 'Email', sortable: true },
                    { key: 'role', label: 'Role', sortable: true },
                    { key: 'status', label: 'Status', sortable: false },
                    { key: 'date', label: 'Joined', sortable: true },
                  ]}
                  data={Array.from({ length: 25 }, (_, i) => ({
                    name: `User ${i + 1}`,
                    email: `user${i + 1}@example.com`,
                    role: ['Admin', 'Editor', 'Viewer'][i % 3],
                    status: i % 3 === 0 ? 'Active' : i % 3 === 1 ? 'Pending' : 'Inactive',
                    date: `Jan ${(i % 30) + 1}, 2026`,
                  }))}
                />
              </section>

              {/* Timeline */}
              <section>
                <h2 className="text-xl font-semibold text-stone-800 mb-4">Timeline / Activity Feed</h2>
                <div className="bg-white rounded-lg border border-stone-200 p-6">
                  <BonsaiTimeline
                    items={[
                      {
                        id: '1',
                        title: 'Project created',
                        description: 'New project "Website Redesign" has been created',
                        timestamp: '2 hours ago',
                        user: { name: 'John Doe' },
                      },
                      {
                        id: '2',
                        title: 'File uploaded',
                        description: 'design-specs.pdf added to project',
                        timestamp: '5 hours ago',
                        user: { name: 'Jane Smith' },
                      },
                      {
                        id: '3',
                        title: 'Status changed',
                        description: 'Project status updated to "In Progress"',
                        timestamp: '1 day ago',
                        user: { name: 'Mike Johnson' },
                      },
                    ]}
                  />
                </div>
              </section>

              {/* File Upload */}
              <section>
                <h2 className="text-xl font-semibold text-stone-800 mb-4">File Upload & Documents</h2>
                <div className="space-y-4">
                  <BonsaiFileUpload
                    onFilesSelected={(files) => {
                      toast.success(`${files.length} file(s) selected`);
                    }}
                    accept="image/*,.pdf,.doc,.docx"
                    maxSize={10}
                  />
                  
                  <BonsaiDocumentList
                    documents={[
                      {
                        id: '1',
                        name: 'project-proposal.pdf',
                        type: 'application/pdf',
                        size: '2.4 MB',
                        uploadedAt: 'Jan 5, 2026',
                        uploadedBy: 'John Doe',
                      },
                      {
                        id: '2',
                        name: 'design-mockup.png',
                        type: 'image/png',
                        size: '1.8 MB',
                        uploadedAt: 'Jan 4, 2026',
                        uploadedBy: 'Jane Smith',
                      },
                    ]}
                    onDownload={(doc) => toast.info(`Downloading ${doc.name}`)}
                    onDelete={(doc) => toast.error(`Deleted ${doc.name}`)}
                  />
                </div>
              </section>

              {/* Modals & Dialogs */}
              <section>
                <h2 className="text-xl font-semibold text-stone-800 mb-4">Modals & Dialogs</h2>
                <div className="bg-white rounded-lg border border-stone-200 p-6">
                  <div className="flex flex-wrap gap-3">
                    <BonsaiButton onClick={() => setShowDrawer(true)}>
                      Open Drawer
                    </BonsaiButton>
                    <BonsaiButton onClick={() => setShowModal(true)}>
                      Open Modal
                    </BonsaiButton>
                    <BonsaiButton variant="destructive" onClick={() => setShowConfirm(true)}>
                      Show Confirm Dialog
                    </BonsaiButton>
                    <BonsaiButton onClick={() => toast.success('Action completed successfully!')}>
                      Show Success Toast
                    </BonsaiButton>
                    <BonsaiButton variant="secondary" onClick={() => toast.error('An error occurred')}>
                      Show Error Toast
                    </BonsaiButton>
                  </div>
                </div>
              </section>

              {/* Empty States */}
              <section>
                <h2 className="text-xl font-semibold text-stone-800 mb-4">Empty States</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg border border-stone-200">
                    <BonsaiEmptyState
                      title="No projects yet"
                      description="Get started by creating your first project"
                      action={
                        <BonsaiButton icon={<Plus />}>Create Project</BonsaiButton>
                      }
                    />
                  </div>
                  <div className="bg-white rounded-lg border border-stone-200">
                    <BonsaiPermissionDenied
                      action={
                        <BonsaiButton variant="ghost">Go Back</BonsaiButton>
                      }
                    />
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <BonsaiDrawer
        open={showDrawer}
        onClose={() => setShowDrawer(false)}
        title="Edit Project"
        footer={
          <>
            <BonsaiButton variant="ghost" onClick={() => setShowDrawer(false)}>
              Cancel
            </BonsaiButton>
            <BonsaiButton onClick={() => setShowDrawer(false)}>
              Save Changes
            </BonsaiButton>
          </>
        }
      >
        <div className="space-y-4">
          <BonsaiInput label="Project Name" placeholder="Enter project name" />
          <BonsaiTextarea label="Description" placeholder="Enter project description" />
          <BonsaiSelect
            label="Status"
            options={[
              { value: 'draft', label: 'Draft' },
              { value: 'active', label: 'Active' },
              { value: 'completed', label: 'Completed' },
            ]}
          />
        </div>
      </BonsaiDrawer>

      <BonsaiModal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Create New Project"
        size="lg"
        footer={
          <>
            <BonsaiButton variant="ghost" onClick={() => setShowModal(false)}>
              Cancel
            </BonsaiButton>
            <BonsaiButton onClick={() => setShowModal(false)}>
              Create Project
            </BonsaiButton>
          </>
        }
      >
        <div className="space-y-4">
          <BonsaiInput label="Project Name" placeholder="Enter project name" />
          <BonsaiInput label="Client" placeholder="Select client" />
          <BonsaiTextarea label="Description" placeholder="Enter project description" />
          <div className="grid grid-cols-2 gap-4">
            <BonsaiInput label="Start Date" type="date" />
            <BonsaiInput label="End Date" type="date" />
          </div>
        </div>
      </BonsaiModal>

      <BonsaiConfirmDialog
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={() => toast.success('Item deleted successfully')}
        title="Delete Project"
        description="Are you sure you want to delete this project? This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
      />

      <BonsaiToastContainer toasts={toast.toasts} onClose={toast.closeToast} />
    </div>
  );
}
