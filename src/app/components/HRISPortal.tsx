// HRIS ADMIN PORTAL - Internal approval screens for profile changes and document requests

import React, { useState } from 'react';
import { Shield, CheckCircle, XCircle, FileText, User } from 'lucide-react';
import { BonsaiButton } from './bonsai/BonsaiButton';
import { BonsaiStatusPill } from './bonsai/BonsaiStatusPill';
import { BonsaiTabs } from './bonsai/BonsaiTabs';
import { BonsaiTimeline } from './bonsai/BonsaiTimeline';
import { EnhancedTable } from './operations/EnhancedTable';

// HRIS Portal Shell
export type HRISScreen = any;
function HRISPortal({ currentScreen, onNavigate }: { currentScreen: HRISScreen; onNavigate: (screen: HRISScreen) => void }) {
  const menuItems = [
    { id: 'profile-requests', label: 'Profile Change Requests', icon: User },
    { id: 'document-requests', label: 'Document Requests', icon: FileText },
  ];

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-purple-900 text-white flex flex-col">
        <div className="p-6 border-b border-purple-800">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5" />
            <h1 className="text-xl font-semibold">HRIS Admin</h1>
          </div>
          <p className="text-sm text-purple-300">Approval Management</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id || 
              (currentScreen === 'profile-request-detail' && item.id === 'profile-requests');
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id as HRISScreen)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-purple-800 text-white'
                    : 'text-purple-200 hover:bg-purple-800/50 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-purple-800">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-8 h-8 rounded-full bg-purple-700 flex items-center justify-center text-sm font-semibold">
              HR
            </div>
            <div className="flex-1 text-sm">
              <p className="font-medium">HR Admin</p>
              <p className="text-purple-300 text-xs">hr@company.com</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-background text-foreground">
        {currentScreen === 'profile-requests' && <ProfileChangeRequestsInbox onNavigate={onNavigate} />}
        {currentScreen === 'profile-request-detail' && <ProfileChangeRequestReview onNavigate={onNavigate} />}
        {currentScreen === 'document-requests' && <DocumentRequestsInbox onNavigate={onNavigate} />}
      </div>
    </div>
  );
}

// HR-01: Profile Change Requests Inbox
function ProfileChangeRequestsInbox({ onNavigate }: { onNavigate: (screen: HRISScreen) => void }) {
  const requests = [
    { id: '1', employee: 'John Doe', type: 'Employee', submitted: '2 hours ago', changesCount: 2, status: 'Pending' },
    { id: '2', employee: 'Sarah Johnson', type: 'Freelancer', submitted: '1 hour ago', changesCount: 2, status: 'Pending' },
    { id: '3', employee: 'Mike Smith', type: 'Employee', submitted: '3 days ago', changesCount: 1, status: 'Approved' },
  ];

  return (
    <div className="px-3 py-6 sm:p-8">
      <h1 className="text-2xl font-semibold text-foreground mb-2">Profile change requests</h1>
      <p className="text-sm text-muted-foreground mb-6">Review profile updates for compliance.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="hub-surface hub-surface-elevated rounded-lg p-6">
          <p className="text-sm text-muted-foreground mb-1">Pending</p>
          <p className="text-3xl font-semibold text-primary">2</p>
        </div>
        <div className="hub-surface hub-surface-elevated rounded-lg p-6">
          <p className="text-sm text-muted-foreground mb-1">Approved this month</p>
          <p className="text-3xl font-semibold text-foreground">12</p>
        </div>
        <div className="hub-surface hub-surface-elevated rounded-lg p-6">
          <p className="text-sm text-muted-foreground mb-1">Rejected this month</p>
          <p className="text-3xl font-semibold text-foreground">1</p>
        </div>
      </div>

      <div className="hub-surface overflow-hidden rounded-lg">
        <EnhancedTable
          columns={[
            { key: 'employee', label: 'Employee/Freelancer', sortable: true },
            { key: 'type', label: 'Type', sortable: true },
            { key: 'changesCount', label: 'Changes', sortable: true },
            { key: 'submitted', label: 'Submitted', sortable: true },
            { key: 'status', label: 'Status', sortable: true },
          ]}
          data={requests.map(req => ({
            ...req,
            changesCount: <span className="font-medium text-primary">{req.changesCount} fields</span>,
            status: (
              <BonsaiStatusPill
                status={req.status === 'Approved' ? 'active' : req.status === 'Rejected' ? 'archived' : 'pending'}
                label={req.status}
              />
            ),
          }))}
          onRowClick={() => onNavigate('profile-request-detail')}
          searchable
          filterable
        />
      </div>
    </div>
  );
}

// HR-02: Profile Change Request Review
function ProfileChangeRequestReview({ onNavigate }: { onNavigate: (screen: HRISScreen) => void }) {
  const [activeTab, setActiveTab] = useState('changes');

  return (
    <div className="px-3 py-6 sm:p-8">
      <button
        type="button"
        onClick={() => onNavigate('profile-requests')}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        ← Back to requests
      </button>

      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Profile change request</h1>
          <p className="text-sm text-muted-foreground">John Doe · #PCR-1234 · 2h ago</p>
        </div>
        <div className="flex items-center gap-3">
          <BonsaiStatusPill status="pending" label="Pending Review" />
          <BonsaiButton 
            size="sm" 
            variant="primary" 
            icon={<CheckCircle />}
            onClick={() => {
              // approved — handled by API
              onNavigate('profile-requests');
            }}
          >
            Approve
          </BonsaiButton>
          <BonsaiButton 
            size="sm" 
            variant="destructive" 
            icon={<XCircle />}
            onClick={() => {
              // rejected — handled by API
              onNavigate('profile-requests');
            }}
          >
            Reject
          </BonsaiButton>
        </div>
      </div>

      <BonsaiTabs
        tabs={[
          { label: 'Changes', value: 'changes' },
          { label: 'Current Data', value: 'current' },
          { label: 'Activity', value: 'activity' },
        ]}
        value={activeTab}
        onValueChange={setActiveTab}
      />

      <div className="mt-6">
        {activeTab === 'changes' && (
          <div className="hub-surface rounded-lg p-6">
            <h3 className="font-semibold text-foreground mb-4">Requested changes</h3>
            <div className="space-y-4">
              {[
                { field: 'Phone', oldValue: '+1 555-0123', newValue: '+1 555-9999', sensitive: false },
                { field: 'Street Address', oldValue: '123 Main St', newValue: '456 Oak Ave', sensitive: false },
              ].map((change, i) => (
                <div key={i} className="p-4 rounded-lg bg-muted/40 border border-border">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-foreground">{change.field}</p>
                    {change.sensitive && (
                      <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">
                        Sensitive
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/25">
                      <p className="text-xs text-muted-foreground font-medium mb-1">Current</p>
                      <p className="text-sm text-destructive line-through">{change.oldValue}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/60 border border-border">
                      <p className="text-xs text-muted-foreground font-medium mb-1">Proposed</p>
                      <p className="text-sm font-medium text-foreground">{change.newValue}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-sm text-foreground">
                <strong className="text-primary">Compliance:</strong> Verify sensitive fields before approval.
              </p>
            </div>
          </div>
        )}
        {activeTab === 'current' && (
          <div className="hub-surface rounded-lg p-6">
            <h3 className="font-semibold text-foreground mb-4">Current profile</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Full name</p>
                <p className="text-sm font-medium text-foreground">John Doe</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Email</p>
                <p className="text-sm font-medium text-foreground">john.doe@company.com</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Phone</p>
                <p className="text-sm font-medium text-foreground">+1 555-0123</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Address</p>
                <p className="text-sm font-medium text-foreground">123 Main St, San Francisco, CA 94105</p>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'activity' && (
          <div className="hub-surface rounded-lg p-6">
            <BonsaiTimeline
              items={[
                { id: '1', title: 'Request submitted', description: 'Profile change request created', timestamp: '2 hours ago', user: { name: 'John Doe' } },
              ]}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// HR-03: Document Requests Inbox
function DocumentRequestsInbox({ onNavigate }: { onNavigate: (screen: HRISScreen) => void }) {
  const requests = [
    { id: '1', employee: 'Jane Smith', type: 'Employee', documentType: 'Employment Verification', submitted: '1 day ago', status: 'Pending' },
    { id: '2', employee: 'Bob Johnson', type: 'Employee', documentType: 'Tax Document (W-2)', submitted: '2 days ago', status: 'Completed' },
  ];

  return (
    <div className="px-3 py-6 sm:p-8">
      <h1 className="text-2xl font-semibold text-foreground mb-2">Document requests</h1>
      <p className="text-sm text-muted-foreground mb-6">Process verification and tax documents.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="hub-surface hub-surface-elevated rounded-lg p-6">
          <p className="text-sm text-muted-foreground mb-1">Pending</p>
          <p className="text-3xl font-semibold text-primary">1</p>
        </div>
        <div className="hub-surface hub-surface-elevated rounded-lg p-6">
          <p className="text-sm text-muted-foreground mb-1">Completed this month</p>
          <p className="text-3xl font-semibold text-foreground">8</p>
        </div>
      </div>

      <div className="hub-surface overflow-hidden rounded-lg">
        <EnhancedTable
          columns={[
            { key: 'employee', label: 'Employee', sortable: true },
            { key: 'documentType', label: 'Document Type', sortable: true },
            { key: 'submitted', label: 'Submitted', sortable: true },
            { key: 'status', label: 'Status', sortable: true },
          ]}
          data={requests.map(req => ({
            ...req,
            status: (
              <BonsaiStatusPill
                status={req.status === 'Completed' ? 'active' : 'pending'}
                label={req.status}
              />
            ),
          }))}
          onRowClick={() => { /* navigate to document detail */ }}
          searchable
          filterable
        />
      </div>
    </div>
  );
}

export { HRISPortal, ProfileChangeRequestsInbox, ProfileChangeRequestReview, DocumentRequestsInbox };
