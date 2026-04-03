// EMPLOYEE PORTAL ENHANCED SCREENS - APPEND TO PORTALS.TSX
import React, { useState } from 'react';
import { Home, ClipboardList, User, Briefcase, CheckSquare, Clock, DollarSign, Calendar, BookOpen, TrendingUp, Video, FolderOpen, Check } from 'lucide-react';
import { BonsaiButton } from './bonsai/BonsaiButton';
import { BonsaiStatusPill } from './bonsai/BonsaiStatusPill';
import { BonsaiTimeline } from './bonsai/BonsaiTimeline';
import { BonsaiTabs } from './bonsai/BonsaiTabs';
import { EnhancedTable } from './operations/EnhancedTable';
import { BonsaiDocumentList } from './bonsai/BonsaiFileUpload';

export type EmployeeScreen = any;
// Employee Portal Menu Update (replace existing menuItems in EmployeePortal function)
const employeeMenuItems = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'onboarding', label: 'Onboarding', icon: ClipboardList },
  { id: 'profile', label: 'My Profile', icon: User },
  { id: 'projects', label: 'My Projects', icon: Briefcase },
  { id: 'tasks', label: 'My Tasks', icon: CheckSquare },
  { id: 'timesheets', label: 'My Timesheets', icon: Clock },
  { id: 'expenses', label: 'My Expenses', icon: DollarSign },
  { id: 'leave', label: 'My Leave', icon: Calendar },
  { id: 'training', label: 'Training', icon: BookOpen },
  { id: 'performance-reviews', label: 'Performance', icon: TrendingUp },
  { id: 'meetings', label: 'Meetings', icon: Video },
  { id: 'documents', label: 'My Documents', icon: FolderOpen },
];

// EPO-01: Employee Onboarding Home
function EmployeeOnboardingHome({ onNavigate }: { onNavigate: (screen: EmployeeScreen) => void }) {
  const tasks = [
    { id: '1', title: 'Submit ID Document', status: 'completed', type: 'upload' },
    { id: '2', title: 'Submit CV/Resume', status: 'completed', type: 'upload' },
    { id: '3', title: 'Sign Employment Contract', status: 'pending', type: 'form' },
    { id: '4', title: 'Bank Details Form', status: 'pending', type: 'form' },
    { id: '5', title: 'Tax Information', status: 'not-started', type: 'form' },
    { id: '6', title: 'Sign NDA', status: 'not-started', type: 'confirm' },
  ];

  const completed = tasks.filter(t => t.status === 'completed').length;
  const progress = (completed / tasks.length) * 100;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-stone-800 mb-2">Onboarding Checklist</h1>
      <p className="text-sm text-stone-600 mb-6">Complete these tasks to finish your onboarding</p>

      <div className="bg-white rounded-lg border border-stone-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-stone-800">Progress</p>
          <p className="text-sm font-semibold text-stone-800">{completed} of {tasks.length} completed</p>
        </div>
        <div className="w-full bg-stone-100 rounded-full h-3">
          <div
            className="bg-stone-700 h-3 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-stone-200">
        <div className="divide-y divide-blue-100">
          {tasks.map((task) => (
            <button
              key={task.id}
              onClick={() => onNavigate('onboarding-task')}
              className="w-full p-6 hover:bg-stone-100 transition-colors text-left flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  task.status === 'completed' ? 'bg-stone-100' : task.status === 'pending' ? 'bg-stone-100' : 'bg-stone-100'
                }`}>
                  {task.status === 'completed' ? (
                    <Check className="w-5 h-5 text-stone-600" />
                  ) : (
                    <ClipboardList className="w-5 h-5 text-stone-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-stone-800">{task.title}</p>
                  <p className="text-sm text-stone-600 capitalize">{task.type} • {task.status.replace('-', ' ')}</p>
                </div>
              </div>
              <span className="text-stone-600">→</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// EPO-02: Onboarding Task Detail
function EmployeeOnboardingTaskDetail({ onNavigate }: { onNavigate: (screen: EmployeeScreen) => void }) {
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <button
        onClick={() => onNavigate('onboarding')}
        className="flex items-center gap-2 text-sm text-stone-600 hover:text-stone-800 mb-6"
      >
        ← Back to Onboarding
      </button>

      <div className="bg-white rounded-lg border border-stone-200 p-8">
        <h1 className="text-2xl font-semibold text-stone-800 mb-2">Sign Employment Contract</h1>
        <p className="text-sm text-stone-600 mb-6">Please review and sign your employment contract</p>

        <div className="space-y-6">
          <div className="p-4 bg-stone-100 border border-stone-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Document:</strong> Employment_Contract_2026.pdf
            </p>
            <button className="mt-2 text-sm text-stone-600 hover:underline">Download & Review</button>
          </div>

          <div>
            <label className="flex items-center gap-3">
              <input type="checkbox" className="w-5 h-5 rounded border-blue-300 text-stone-600" />
              <span className="text-sm text-stone-800">I have read and agree to the terms of the employment contract</span>
            </label>
          </div>

          <div className="flex gap-3 pt-4 border-t border-stone-200">
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

// EPO-03: Employee Profile
function EmployeeProfile({ onNavigate }: { onNavigate: (screen: EmployeeScreen) => void }) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-stone-800">My Profile</h1>
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
        <div className="mb-4 p-4 bg-stone-100 border border-stone-200 rounded-lg">
          <p className="text-sm text-stone-700">
            <strong>Note:</strong> Profile changes require manager approval (GDPR compliance)
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-stone-200 p-6">
          <h3 className="font-semibold text-stone-800 mb-4">Personal Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1">Full Name</label>
              <input
                type="text"
                defaultValue="John Doe"
                disabled={!isEditing}
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm disabled:bg-stone-100 disabled:text-stone-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1">Email</label>
              <input
                type="email"
                defaultValue="john.doe@company.com"
                disabled={!isEditing}
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm disabled:bg-stone-100 disabled:text-stone-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1">Phone</label>
              <input
                type="tel"
                defaultValue="+1 555-0123"
                disabled={!isEditing}
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm disabled:bg-stone-100 disabled:text-stone-800"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-stone-200 p-6">
          <h3 className="font-semibold text-stone-800 mb-4">Address</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1">Street Address</label>
              <input
                type="text"
                defaultValue="123 Main St"
                disabled={!isEditing}
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm disabled:bg-stone-100 disabled:text-stone-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1">City</label>
              <input
                type="text"
                defaultValue="San Francisco"
                disabled={!isEditing}
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm disabled:bg-stone-100 disabled:text-stone-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1">Postal Code</label>
              <input
                type="text"
                defaultValue="94105"
                disabled={!isEditing}
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm disabled:bg-stone-100 disabled:text-stone-800"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-stone-200 p-6">
          <h3 className="font-semibold text-stone-800 mb-4">Bank Details</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1">Bank Name</label>
              <input
                type="text"
                defaultValue="First National Bank"
                disabled={!isEditing}
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm disabled:bg-stone-100 disabled:text-stone-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1">Account Number</label>
              <input
                type="text"
                defaultValue="****1234"
                disabled={!isEditing}
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm disabled:bg-stone-100 disabled:text-stone-800"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-stone-200 p-6">
          <h3 className="font-semibold text-stone-800 mb-4">Emergency Contact</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1">Contact Name</label>
              <input
                type="text"
                defaultValue="Jane Doe"
                disabled={!isEditing}
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm disabled:bg-stone-100 disabled:text-stone-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1">Contact Phone</label>
              <input
                type="tel"
                defaultValue="+1 555-0456"
                disabled={!isEditing}
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm disabled:bg-stone-100 disabled:text-stone-800"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// EPO-04: Profile Change Request Detail
function EmployeeProfileChangeRequest({ onNavigate }: { onNavigate: (screen: EmployeeScreen) => void }) {
  return (
    <div className="p-8">
      <button
        onClick={() => onNavigate('profile')}
        className="flex items-center gap-2 text-sm text-stone-600 hover:text-stone-800 mb-6"
      >
        ← Back to Profile
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-stone-800">Profile Change Request</h1>
          <p className="text-sm text-stone-600">Request #PCR-1234 • Submitted 2 hours ago</p>
        </div>
        <BonsaiStatusPill status="pending" label="Pending Approval" />
      </div>

      <div className="bg-white rounded-lg border border-stone-200 p-6 mb-6">
        <h3 className="font-semibold text-stone-800 mb-4">Requested Changes</h3>
        <div className="space-y-4">
          {[
            { field: 'Phone', oldValue: '+1 555-0123', newValue: '+1 555-9999' },
            { field: 'Street Address', oldValue: '123 Main St', newValue: '456 Oak Ave' },
          ].map((change, i) => (
            <div key={i} className="p-4 bg-stone-100 rounded-lg">
              <p className="text-sm font-medium text-stone-800 mb-2">{change.field}</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-stone-600 mb-1">Current Value</p>
                  <p className="text-sm text-stone-800 line-through">{change.oldValue}</p>
                </div>
                <div>
                  <p className="text-xs text-stone-600 mb-1">New Value</p>
                  <p className="text-sm font-medium text-stone-700">{change.newValue}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-stone-200 p-6">
        <h3 className="font-semibold text-stone-800 mb-4">Activity</h3>
        <BonsaiTimeline
          items={[
            { id: '1', title: 'Request submitted', description: 'Profile change request created', timestamp: '2 hours ago', user: { name: 'John Doe' } },
          ]}
        />
      </div>
    </div>
  );
}

// EPO-05: Training & Knowledge Hub
function EmployeeTraining({ onNavigate }: { onNavigate: (screen: EmployeeScreen) => void }) {
  const assignedTrainings = [
    { id: '1', title: 'Security Awareness Training', status: 'assigned', dueDate: 'Jan 30, 2026' },
    { id: '2', title: 'GDPR Compliance', status: 'completed', completedDate: 'Jan 10, 2026' },
  ];

  const knowledgeArticles = [
    { id: '1', title: 'Company Policies Handbook', category: 'HR' },
    { id: '2', title: 'IT Support Guide', category: 'IT' },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-stone-800 mb-6">Training & Knowledge Hub</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg border border-stone-200 p-6">
          <p className="text-sm text-stone-600 mb-1">Assigned Trainings</p>
          <p className="text-3xl font-semibold text-stone-800">1</p>
        </div>
        <div className="bg-white rounded-lg border border-stone-200 p-6">
          <p className="text-sm text-stone-600 mb-1">Completed Trainings</p>
          <p className="text-3xl font-semibold text-stone-600">1</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-stone-200 mb-6">
        <div className="p-6 border-b border-blue-100">
          <h3 className="font-semibold text-stone-800">My Trainings</h3>
        </div>
        <div className="divide-y divide-blue-100">
          {assignedTrainings.map((training) => (
            <button
              key={training.id}
              onClick={() => onNavigate('training-detail')}
              className="w-full p-6 hover:bg-stone-100 transition-colors text-left flex items-center justify-between"
            >
              <div>
                <p className="font-medium text-stone-800">{training.title}</p>
                <p className="text-sm text-stone-600">
                  {training.status === 'assigned' ? `Due ${training.dueDate}` : `Completed ${training.completedDate}`}
                </p>
              </div>
              <BonsaiStatusPill
                status={training.status === 'completed' ? 'active' : 'pending'}
                label={training.status === 'completed' ? 'Completed' : 'Assigned'}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-stone-200">
        <div className="p-6 border-b border-blue-100">
          <h3 className="font-semibold text-stone-800">Knowledge Articles</h3>
        </div>
        <div className="divide-y divide-blue-100">
          {knowledgeArticles.map((article) => (
            <button
              key={article.id}
              className="w-full p-6 hover:bg-stone-100 transition-colors text-left flex items-center justify-between"
            >
              <div>
                <p className="font-medium text-stone-800">{article.title}</p>
                <p className="text-sm text-stone-600">{article.category}</p>
              </div>
              <span className="text-stone-600">→</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// EPO-06: Training Detail
function EmployeeTrainingDetail({ onNavigate }: { onNavigate: (screen: EmployeeScreen) => void }) {
  const [activeTab, setActiveTab] = useState('content');

  return (
    <div className="p-8">
      <button
        onClick={() => onNavigate('training')}
        className="flex items-center gap-2 text-sm text-stone-600 hover:text-stone-800 mb-6"
      >
        ← Back to Training
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-stone-800">Security Awareness Training</h1>
          <p className="text-sm text-stone-600">Due Jan 30, 2026</p>
        </div>
        <BonsaiStatusPill status="pending" label="Assigned" />
      </div>

      <BonsaiTabs
        tabs={[
          { label: 'Content', value: 'content' },
          { label: 'Resources', value: 'resources' },
        ]}
        value={activeTab}
        onValueChange={setActiveTab}
      />

      <div className="mt-6">
        {activeTab === 'content' && (
          <div className="bg-white rounded-lg border border-stone-200 p-6">
            <div className="prose max-w-none">
              <p className="text-blue-800 mb-4">
                This training covers essential security practices to keep company data safe.
              </p>
              <h3 className="font-semibold text-stone-800 mb-2">Topics Covered:</h3>
              <ul className="list-disc list-inside text-blue-800 space-y-2">
                <li>Password best practices</li>
                <li>Phishing detection</li>
                <li>Data handling procedures</li>
                <li>Device security</li>
              </ul>
            </div>
            <div className="mt-6 pt-6 border-t border-stone-200">
              <BonsaiButton variant="primary" onClick={() => { alert('Training marked as complete!'); onNavigate('training'); }}>
                Mark as Complete
              </BonsaiButton>
            </div>
          </div>
        )}
        {activeTab === 'resources' && (
          <div className="bg-white rounded-lg border border-stone-200 p-6">
            <p className="text-sm text-stone-600">Additional resources and materials</p>
          </div>
        )}
      </div>
    </div>
  );
}

// EPO-07: Performance Reviews List
function EmployeePerformanceReviews({ onNavigate }: { onNavigate: (screen: EmployeeScreen) => void }) {
  const reviews = [
    { id: '1', period: 'Q4 2025', status: 'completed', date: 'Jan 5, 2026', rating: '4.5/5' },
    { id: '2', period: 'Q3 2025', status: 'completed', date: 'Oct 5, 2025', rating: '4.2/5' },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-stone-800 mb-6">Performance Reviews</h1>

      <div className="bg-white rounded-lg border border-stone-200">
        <EnhancedTable
          columns={[
            { key: 'period', label: 'Review Period', sortable: true },
            { key: 'date', label: 'Date', sortable: true },
            { key: 'rating', label: 'Rating', sortable: true },
            { key: 'status', label: 'Status', sortable: true },
          ]}
          data={reviews.map(review => ({
            ...review,
            rating: <span className="font-semibold text-stone-800">{review.rating}</span>,
            status: (
              <BonsaiStatusPill
                status={review.status === 'completed' ? 'active' : 'pending'}
                label={review.status === 'completed' ? 'Completed' : 'Pending'}
              />
            ),
          }))}
          onRowClick={() => onNavigate('performance-review-detail')}
          searchable
          filterable
        />
      </div>
    </div>
  );
}

// EPO-08: Performance Review Detail
function EmployeePerformanceReviewDetail({ onNavigate }: { onNavigate: (screen: EmployeeScreen) => void }) {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="p-8">
      <button
        onClick={() => onNavigate('performance-reviews')}
        className="flex items-center gap-2 text-sm text-stone-600 hover:text-stone-800 mb-6"
      >
        ← Back to Performance Reviews
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-stone-800">Q4 2025 Performance Review</h1>
          <p className="text-sm text-stone-600">Completed Jan 5, 2026</p>
        </div>
        <div className="flex items-center gap-3">
          <BonsaiStatusPill status="active" label="Completed" />
          <div className="px-4 py-2 bg-stone-100 rounded-lg">
            <p className="text-lg font-semibold text-stone-800">4.5/5</p>
          </div>
        </div>
      </div>

      <BonsaiTabs
        tabs={[
          { label: 'Overview', value: 'overview' },
          { label: 'Comments', value: 'comments' },
          { label: 'Goals', value: 'goals' },
        ]}
        value={activeTab}
        onValueChange={setActiveTab}
      />

      <div className="mt-6">
        {activeTab === 'overview' && (
          <div className="bg-white rounded-lg border border-stone-200 p-6">
            <h3 className="font-semibold text-stone-800 mb-4">Performance Areas</h3>
            <div className="space-y-4">
              {[
                { area: 'Technical Skills', rating: 5 },
                { area: 'Communication', rating: 4 },
                { area: 'Teamwork', rating: 5 },
                { area: 'Problem Solving', rating: 4 },
              ].map((item, i) => (
                <div key={i} className="p-4 bg-stone-100 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-stone-800">{item.area}</p>
                    <p className="font-semibold text-stone-800">{item.rating}/5</p>
                  </div>
                  <div className="w-full bg-stone-200 rounded-full h-2">
                    <div
                      className="bg-stone-700 h-2 rounded-full"
                      style={{ width: `${(item.rating / 5) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'comments' && (
          <div className="bg-white rounded-lg border border-stone-200 p-6">
            <h3 className="font-semibold text-stone-800 mb-4">Manager Feedback</h3>
            <p className="text-blue-800">
              John has shown excellent technical skills and dedication this quarter. 
              His communication has improved significantly, and he's been a great team player.
            </p>
          </div>
        )}
        {activeTab === 'goals' && (
          <div className="bg-white rounded-lg border border-stone-200 p-6">
            <h3 className="font-semibold text-stone-800 mb-4">Goals for Next Period</h3>
            <ul className="list-disc list-inside text-blue-800 space-y-2">
              <li>Lead a major project initiative</li>
              <li>Mentor junior team members</li>
              <li>Complete advanced certification</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

// EPO-09: Meetings & 1:1 Summaries List
function EmployeeMeetingsList({ onNavigate }: { onNavigate: (screen: EmployeeScreen) => void }) {
  const meetings = [
    { id: '1', title: 'Weekly 1:1 with Manager', date: 'Jan 15, 2026', type: '1:1', shared: true },
    { id: '2', title: 'Team Sync', date: 'Jan 10, 2026', type: 'Team', shared: true },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-stone-800 mb-6">Meetings & 1:1s</h1>

      <div className="bg-white rounded-lg border border-stone-200">
        <EnhancedTable
          columns={[
            { key: 'title', label: 'Meeting Title', sortable: true },
            { key: 'type', label: 'Type', sortable: true },
            { key: 'date', label: 'Date', sortable: true },
          ]}
          data={meetings}
          onRowClick={() => onNavigate('meeting-detail')}
          searchable
          filterable
        />
      </div>
    </div>
  );
}

// EPO-10: Meeting Summary Detail
function EmployeeMeetingDetail({ onNavigate }: { onNavigate: (screen: EmployeeScreen) => void }) {
  return (
    <div className="p-8">
      <button
        onClick={() => onNavigate('meetings')}
        className="flex items-center gap-2 text-sm text-stone-600 hover:text-stone-800 mb-6"
      >
        ← Back to Meetings
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-stone-800">Weekly 1:1 with Manager</h1>
          <p className="text-sm text-stone-600">Jan 15, 2026 • 30 minutes</p>
        </div>
        <div className="px-3 py-1 bg-stone-100 text-stone-700 rounded-lg text-sm font-medium">
          Shared with you
        </div>
      </div>

      <div className="bg-white rounded-lg border border-stone-200 p-6 mb-6">
        <h3 className="font-semibold text-stone-800 mb-4">Summary</h3>
        <div className="prose max-w-none text-blue-800">
          <p className="mb-4">
            We discussed project progress and upcoming initiatives. John is doing great work on the redesign project.
          </p>
          <h4 className="font-semibold text-stone-800 mb-2">Key Points:</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>Project redesign on track for Q1 delivery</li>
            <li>Interested in mentoring junior developers</li>
            <li>Plans to attend upcoming tech conference</li>
          </ul>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-stone-200 p-6">
        <h3 className="font-semibold text-stone-800 mb-4">Action Items</h3>
        <div className="space-y-2">
          {[
            'Complete code review by Friday',
            'Schedule mentoring session next week',
            'Submit conference request form',
          ].map((item, i) => (
            <div key={i} className="p-3 bg-stone-100 rounded-lg flex items-center gap-3">
              <CheckSquare className="w-5 h-5 text-stone-600" />
              <p className="text-sm text-stone-800">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// EPO-11 & EPO-12: Enhanced Employee Documents (already exists, just add request modal)
function EmployeeDocumentsEnhanced() {
  const [showRequestModal, setShowRequestModal] = useState(false);
  const documents = [
    { id: '1', name: 'Employment-Contract.pdf', type: 'application/pdf', size: '245 KB', uploadedAt: 'Jan 15, 2024', uploadedBy: 'HR' },
    { id: '2', name: 'Benefits-Guide.pdf', type: 'application/pdf', size: '1.8 MB', uploadedAt: 'Jan 1, 2024', uploadedBy: 'HR' },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-stone-800">My Documents</h1>
        <BonsaiButton variant="primary" onClick={() => setShowRequestModal(true)}>
          Request Document
        </BonsaiButton>
      </div>

      <div className="bg-white rounded-lg border border-stone-200 p-6">
        <BonsaiDocumentList
          documents={documents}
          onDownload={(doc) => alert(`Downloading ${doc.name}`)}
          onDelete={undefined}
        />
      </div>

      {/* EPO-12: Document Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg">
            <div className="px-6 py-4 border-b border-stone-200">
              <h2 className="text-xl font-semibold text-stone-800">Request Document</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-2">Document Type</label>
                <select className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm">
                  <option>Employment Verification Letter</option>
                  <option>Tax Document (W-2)</option>
                  <option>Pay Stub</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-2">Reason (optional)</label>
                <textarea rows={3} className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm" placeholder="Why do you need this document?" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-stone-200 flex justify-end gap-3">
              <BonsaiButton variant="ghost" onClick={() => setShowRequestModal(false)}>Cancel</BonsaiButton>
              <BonsaiButton variant="primary" onClick={() => { alert('Document request submitted!\n\nHR will process your request.'); setShowRequestModal(false); }}>
                Submit Request
              </BonsaiButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
