// FREELANCER PORTAL ENHANCED SCREENS - TO BE INTEGRATED

import React, { useState } from 'react';
import { Check, ClipboardList, User, Receipt, FileText, Shield } from 'lucide-react';
import { BonsaiButton } from './bonsai/BonsaiButton';
import { BonsaiStatusPill } from './bonsai/BonsaiStatusPill';
import { BonsaiTimeline } from './bonsai/BonsaiTimeline';
import { BonsaiDocumentList } from './bonsai/BonsaiFileUpload';
import { EnhancedTable } from './operations/EnhancedTable';

// Freelancer Portal Menu Update
const freelancerMenuItems = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'onboarding', label: 'Onboarding', icon: ClipboardList },
  { id: 'profile', label: 'My Profile', icon: User },
  { id: 'assignments', label: 'My Assignments', icon: Briefcase },
  { id: 'tasks', label: 'My Tasks', icon: CheckSquare },
  { id: 'timesheets', label: 'My Timesheets', icon: Clock },
  { id: 'self-bills', label: 'Self-Bills', icon: Receipt },
  { id: 'expenses', label: 'My Expenses', icon: DollarSign },
  { id: 'documents', label: 'My Documents', icon: FolderOpen },
];

// FPO-01: Freelancer Onboarding Home
function FreelancerOnboardingHome({ onNavigate }) {
  const tasks = [
    { id: '1', title: 'Submit Contract', status: 'completed', type: 'upload' },
    { id: '2', title: 'Submit Tax Form (W-9)', status: 'completed', type: 'upload' },
    { id: '3', title: 'Bank Details', status: 'pending', type: 'form' },
    { id: '4', title: 'Sign NDA', status: 'not-started', type: 'confirm' },
  ];

  const completed = tasks.filter(t => t.status === 'completed').length;
  const progress = (completed / tasks.length) * 100;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-green-900 mb-2">Onboarding Checklist</h1>
      <p className="text-sm text-green-700 mb-6">Complete these tasks to start working</p>

      <div className="bg-white rounded-lg border border-green-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-green-900">Progress</p>
          <p className="text-sm font-semibold text-green-900">{completed} of {tasks.length} completed</p>
        </div>
        <div className="w-full bg-green-100 rounded-full h-3">
          <div
            className="bg-green-600 h-3 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-green-200">
        <div className="divide-y divide-green-100">
          {tasks.map((task) => (
            <button
              key={task.id}
              onClick={() => onNavigate('contract-docs')}
              className="w-full p-6 hover:bg-green-50 transition-colors text-left flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  task.status === 'completed' ? 'bg-green-100' : task.status === 'pending' ? 'bg-amber-100' : 'bg-stone-100'
                }`}>
                  {task.status === 'completed' ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : (
                    <ClipboardList className="w-5 h-5 text-stone-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-green-900">{task.title}</p>
                  <p className="text-sm text-green-700 capitalize">{task.type} • {task.status.replace('-', ' ')}</p>
                </div>
              </div>
              <span className="text-green-600">→</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// FPO-02: Contract & Documents
function FreelancerContractDocs({ onNavigate }) {
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <button
        onClick={() => onNavigate('onboarding')}
        className="flex items-center gap-2 text-sm text-green-700 hover:text-green-900 mb-6"
      >
        ← Back to Onboarding
      </button>

      <div className="bg-white rounded-lg border border-green-200 p-8">
        <h1 className="text-2xl font-semibold text-green-900 mb-2">Sign Contract</h1>
        <p className="text-sm text-green-700 mb-6">Please review and sign your freelance contract</p>

        <div className="space-y-6">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>Document:</strong> Freelance_Contract_2026.pdf
            </p>
            <button className="mt-2 text-sm text-green-600 hover:underline">Download & Review</button>
          </div>

          <div>
            <label className="flex items-center gap-3">
              <input type="checkbox" className="w-5 h-5 rounded border-green-300 text-green-600" />
              <span className="text-sm text-green-900">I have read and agree to the terms of the freelance contract</span>
            </label>
          </div>

          <div className="flex gap-3 pt-4 border-t border-green-200">
            <BonsaiButton variant="ghost" onClick={() => onNavigate('onboarding')}>Cancel</BonsaiButton>
            <BonsaiButton variant="primary" onClick={() => { alert('Contract signed!\n\nTask marked as complete.'); onNavigate('onboarding'); }}>
              Sign & Submit
            </BonsaiButton>
          </div>
        </div>
      </div>
    </div>
  );
}

// FPO-03: Freelancer Profile
function FreelancerProfile({ onNavigate }) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-green-900">My Profile</h1>
        <BonsaiButton 
          variant={isEditing ? "primary" : "ghost"} 
          onClick={() => {
            if (isEditing) {
              alert('Profile change request submitted!\n\nChanges pending approval.');
              onNavigate('profile-change-request');
            }
            setIsEditing(!isEditing);
          }}
        >
          {isEditing ? 'Submit Changes' : 'Request Changes'}
        </BonsaiButton>
      </div>

      {!isEditing && (
        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            <strong>Note:</strong> Profile changes require admin approval (GDPR compliance)
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-green-200 p-6">
          <h3 className="font-semibold text-green-900 mb-4">Personal Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-green-700 mb-1">Full Name</label>
              <input
                type="text"
                defaultValue="Sarah Johnson"
                disabled={!isEditing}
                className="w-full px-3 py-2 bg-white border border-green-200 rounded-lg text-sm disabled:bg-green-50 disabled:text-green-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-green-700 mb-1">Email</label>
              <input
                type="email"
                defaultValue="sarah.j@freelance.com"
                disabled={!isEditing}
                className="w-full px-3 py-2 bg-white border border-green-200 rounded-lg text-sm disabled:bg-green-50 disabled:text-green-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-green-700 mb-1">Phone</label>
              <input
                type="tel"
                defaultValue="+1 555-0789"
                disabled={!isEditing}
                className="w-full px-3 py-2 bg-white border border-green-200 rounded-lg text-sm disabled:bg-green-50 disabled:text-green-900"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-green-200 p-6">
          <h3 className="font-semibold text-green-900 mb-4">Business Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-green-700 mb-1">Business Name</label>
              <input
                type="text"
                defaultValue="SJ Design Studio"
                disabled={!isEditing}
                className="w-full px-3 py-2 bg-white border border-green-200 rounded-lg text-sm disabled:bg-green-50 disabled:text-green-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-green-700 mb-1">Tax ID / EIN</label>
              <input
                type="text"
                defaultValue="****5678"
                disabled={!isEditing}
                className="w-full px-3 py-2 bg-white border border-green-200 rounded-lg text-sm disabled:bg-green-50 disabled:text-green-900"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-green-200 p-6">
          <h3 className="font-semibold text-green-900 mb-4">Bank Details</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-green-700 mb-1">Bank Name</label>
              <input
                type="text"
                defaultValue="First National Bank"
                disabled={!isEditing}
                className="w-full px-3 py-2 bg-white border border-green-200 rounded-lg text-sm disabled:bg-green-50 disabled:text-green-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-green-700 mb-1">Account Number</label>
              <input
                type="text"
                defaultValue="****9012"
                disabled={!isEditing}
                className="w-full px-3 py-2 bg-white border border-green-200 rounded-lg text-sm disabled:bg-green-50 disabled:text-green-900"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-green-200 p-6">
          <h3 className="font-semibold text-green-900 mb-4">Address</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-green-700 mb-1">Street Address</label>
              <input
                type="text"
                defaultValue="456 Oak St"
                disabled={!isEditing}
                className="w-full px-3 py-2 bg-white border border-green-200 rounded-lg text-sm disabled:bg-green-50 disabled:text-green-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-green-700 mb-1">City</label>
              <input
                type="text"
                defaultValue="Los Angeles"
                disabled={!isEditing}
                className="w-full px-3 py-2 bg-white border border-green-200 rounded-lg text-sm disabled:bg-green-50 disabled:text-green-900"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// FPO-04: Profile Change Request Detail
function FreelancerProfileChangeRequest({ onNavigate }) {
  return (
    <div className="p-8">
      <button
        onClick={() => onNavigate('profile')}
        className="flex items-center gap-2 text-sm text-green-700 hover:text-green-900 mb-6"
      >
        ← Back to Profile
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-green-900">Profile Change Request</h1>
          <p className="text-sm text-green-700">Request #PCR-5678 • Submitted 1 hour ago</p>
        </div>
        <BonsaiStatusPill status="pending" label="Pending Approval" />
      </div>

      <div className="bg-white rounded-lg border border-green-200 p-6 mb-6">
        <h3 className="font-semibold text-green-900 mb-4">Requested Changes</h3>
        <div className="space-y-4">
          {[
            { field: 'Bank Account', oldValue: '****9012', newValue: '****3456' },
            { field: 'Business Address', oldValue: '456 Oak St', newValue: '789 Pine Ave' },
          ].map((change, i) => (
            <div key={i} className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm font-medium text-green-900 mb-2">{change.field}</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-green-700 mb-1">Current Value</p>
                  <p className="text-sm text-green-900 line-through">{change.oldValue}</p>
                </div>
                <div>
                  <p className="text-xs text-green-700 mb-1">New Value</p>
                  <p className="text-sm font-medium text-green-700">{change.newValue}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-green-200 p-6">
        <h3 className="font-semibold text-green-900 mb-4">Activity</h3>
        <BonsaiTimeline
          items={[
            { id: '1', title: 'Request submitted', description: 'Profile change request created', timestamp: '1 hour ago', user: { name: 'Sarah Johnson' } },
          ]}
        />
      </div>
    </div>
  );
}

// FPO-05: Freelancer Timesheet -> Self-Bill
function FreelancerSelfBills({ onNavigate }) {
  const selfBills = [
    { id: '1', number: 'SB-2026-001', period: 'Jan 1-15, 2026', amount: 4200, status: 'Generated', timesheetStatus: 'Approved' },
    { id: '2', number: 'SB-2025-098', period: 'Dec 16-31, 2025', amount: 3800, status: 'Paid', timesheetStatus: 'Approved' },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-green-900 mb-2">Self-Bills</h1>
      <p className="text-sm text-green-700 mb-6">Automatically generated from approved timesheets</p>

      <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-sm text-green-800">
          <strong>How it works:</strong> When your timesheet is approved, a self-bill is automatically created for you to download and submit.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-green-200">
        <EnhancedTable
          columns={[
            { key: 'number', label: 'Self-Bill #', sortable: true },
            { key: 'period', label: 'Period', sortable: true },
            { key: 'amount', label: 'Amount', sortable: true },
            { key: 'status', label: 'Status', sortable: true },
          ]}
          data={selfBills.map(bill => ({
            ...bill,
            amount: <span className="font-semibold text-green-900">${bill.amount.toLocaleString()}</span>,
            status: (
              <BonsaiStatusPill
                status={bill.status === 'Paid' ? 'active' : 'pending'}
                label={bill.status}
              />
            ),
          }))}
          onRowClick={() => onNavigate('self-bill-detail')}
          searchable
          filterable
        />
      </div>
    </div>
  );
}

// FPO-06: Self-Bill Detail
function FreelancerSelfBillDetail({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="p-8">
      <button
        onClick={() => onNavigate('self-bills')}
        className="flex items-center gap-2 text-sm text-green-700 hover:text-green-900 mb-6"
      >
        ← Back to Self-Bills
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-green-900">SB-2026-001</h1>
          <p className="text-sm text-green-700">Period: Jan 1-15, 2026</p>
        </div>
        <div className="flex items-center gap-3">
          <BonsaiStatusPill status="pending" label="Generated" />
          <BonsaiButton size="sm" variant="primary" icon={<Download />}>
            Download PDF
          </BonsaiButton>
        </div>
      </div>

      <BonsaiTabs
        tabs={[
          { label: 'Overview', value: 'overview' },
          { label: 'Line Items', value: 'items' },
          { label: 'Activity', value: 'activity' },
        ]}
        value={activeTab}
        onValueChange={setActiveTab}
      />

      <div className="mt-6">
        {activeTab === 'overview' && (
          <div className="bg-white rounded-lg border border-green-200 p-6">
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-xs text-green-700 mb-1">Generated Date</p>
                <p className="text-sm font-medium text-green-900">Jan 16, 2026</p>
              </div>
              <div>
                <p className="text-xs text-green-700 mb-1">Period</p>
                <p className="text-sm font-medium text-green-900">Jan 1-15, 2026</p>
              </div>
              <div>
                <p className="text-xs text-green-700 mb-1">Amount</p>
                <p className="text-2xl font-semibold text-green-900">$4,200.00</p>
              </div>
              <div>
                <p className="text-xs text-green-700 mb-1">Timesheet Status</p>
                <BonsaiStatusPill status="active" label="Approved" />
              </div>
            </div>
            <div className="pt-4 border-t border-green-200">
              <p className="text-sm text-green-700 mb-2">This self-bill was automatically generated from your approved timesheet.</p>
              <p className="text-sm text-green-800">Download the PDF to submit to your client or accounting system.</p>
            </div>
          </div>
        )}
        {activeTab === 'items' && (
          <div className="bg-white rounded-lg border border-green-200 p-6">
            <div className="space-y-3">
              {[
                { desc: 'UI Design - Week 1-2', hours: 42, rate: 100 },
              ].map((item, i) => (
                <div key={i} className="p-4 bg-green-50 rounded-lg flex justify-between">
                  <div>
                    <p className="font-medium text-green-900">{item.desc}</p>
                    <p className="text-sm text-green-700">{item.hours} hours × ${item.rate}/hr</p>
                  </div>
                  <p className="font-semibold text-green-900">${(item.hours * item.rate).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'activity' && (
          <div className="bg-white rounded-lg border border-green-200 p-6">
            <BonsaiTimeline
              items={[
                { id: '1', title: 'Self-bill generated', description: 'Generated from approved timesheet', timestamp: 'Jan 16, 2026', user: { name: 'System' } },
                { id: '2', title: 'Timesheet approved', description: 'Timesheet approved by client', timestamp: 'Jan 15, 2026', user: { name: 'Client' } },
              ]}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// FPO-07: Freelancer Documents
function FreelancerDocumentsEnhanced() {
  const documents = [
    { id: '1', name: 'Contract-2026.pdf', type: 'application/pdf', size: '845 KB', uploadedAt: 'Jan 10, 2026', uploadedBy: 'Admin' },
    { id: '2', name: 'NDA.pdf', type: 'application/pdf', size: '245 KB', uploadedAt: 'Nov 10, 2025', uploadedBy: 'Legal' },
    { id: '3', name: 'W9-Form.pdf', type: 'application/pdf', size: '120 KB', uploadedAt: 'Jan 5, 2026', uploadedBy: 'You' },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-green-900">My Documents</h1>
        <BonsaiButton variant="primary">Upload Document</BonsaiButton>
      </div>

      <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-sm text-amber-800">
          <strong>Required Documents:</strong> Please ensure you have uploaded all required documents (Contract, Tax Form, NDA).
        </p>
      </div>

      <div className="bg-white rounded-lg border border-green-200 p-6">
        <BonsaiDocumentList
          documents={documents}
          onDownload={(doc) => alert(`Downloading ${doc.name}`)}
          onDelete={undefined}
        />
      </div>
    </div>
  );
}

export {
  FreelancerOnboardingHome,
  FreelancerContractDocs,
  FreelancerProfile,
  FreelancerProfileChangeRequest,
  FreelancerSelfBills,
  FreelancerSelfBillDetail,
  FreelancerDocumentsEnhanced,
};
