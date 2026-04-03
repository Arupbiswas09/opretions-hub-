import React, { useState } from 'react';
import { Edit, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { BonsaiButton } from '../bonsai/BonsaiButton';
import { BonsaiTabs } from '../bonsai/BonsaiTabs';
import { BonsaiStatusPill } from '../bonsai/BonsaiStatusPill';
import { BonsaiTimeline } from '../bonsai/BonsaiTimeline';
import { BonsaiDocumentList } from '../bonsai/BonsaiFileUpload';

interface PE03PersonDetailProps {
  person: any;
  onEdit: () => void;
  onRequestLeave: () => void;
  onSubmitExpense: () => void;
}

export function PE03PersonDetail({ person, onEdit, onRequestLeave, onSubmitExpense }: PE03PersonDetailProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { label: 'Overview', value: 'overview' },
    { label: 'Assignments', value: 'assignments' },
    { label: 'Skills', value: 'skills' },
    { label: 'Requests', value: 'requests' },
    { label: 'Documents', value: 'documents' },
    { label: 'Activity', value: 'activity' },
  ];

  const activityItems = [
    {
      id: '1',
      title: 'Leave request approved',
      description: 'Vacation leave Feb 10-14 approved',
      timestamp: '2 hours ago',
      user: { name: 'System' },
    },
    {
      id: '2',
      title: 'Assigned to project',
      description: 'Added to Website Redesign team',
      timestamp: '1 day ago',
      user: { name: 'John Doe' },
    },
  ];

  const getStatusColor = (status: string): 'active' | 'pending' | 'inactive' | 'archived' => {
    switch (status) {
      case 'Active': return 'active';
      case 'On Leave': return 'pending';
      case 'Inactive': return 'inactive';
      default: return 'archived';
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-green-600 flex items-center justify-center">
            <span className="text-2xl font-semibold text-white">
              {person.name.split(' ').map((n: string) => n[0]).join('')}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-semibold text-stone-800">{person.name}</h1>
              <BonsaiStatusPill status={getStatusColor(person.status)} label={person.status} />
              <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                person.type === 'Employee' ? 'bg-stone-100 text-stone-600' : 'bg-stone-100 text-stone-700'
              }`}>
                {person.type}
              </span>
            </div>
            <p className="text-lg text-stone-700 mb-2">{person.role}</p>
            <div className="flex items-center gap-4 text-sm text-stone-600">
              {person.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>{person.email}</span>
                </div>
              )}
              {person.department && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{person.department}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <BonsaiButton variant="ghost" size="sm" onClick={onRequestLeave} icon={<Calendar />}>
            Request Leave
          </BonsaiButton>
          <BonsaiButton variant="ghost" size="sm" icon={<Edit />} onClick={onEdit}>
            Edit
          </BonsaiButton>
        </div>
      </div>

      {/* Tabs */}
      <BonsaiTabs tabs={tabs} value={activeTab} onValueChange={setActiveTab} />

      {/* Content */}
      <div className="mt-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg border border-stone-200 p-4">
                <p className="text-xs text-stone-600 mb-1">Current Projects</p>
                <p className="text-2xl font-semibold text-primary">2</p>
              </div>
              <div className="bg-white rounded-lg border border-stone-200 p-4">
                <p className="text-xs text-stone-600 mb-1">Hours This Week</p>
                <p className="text-2xl font-semibold text-stone-800">42h</p>
              </div>
              <div className="bg-white rounded-lg border border-stone-200 p-4">
                <p className="text-xs text-stone-600 mb-1">Pending Requests</p>
                <p className="text-2xl font-semibold text-stone-600">1</p>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-stone-200 p-6">
              <h3 className="font-semibold text-stone-800 mb-4">Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-stone-600 mb-1">Type</p>
                  <p className="text-sm text-stone-800">{person.type}</p>
                </div>
                <div>
                  <p className="text-xs text-stone-600 mb-1">Department</p>
                  <p className="text-sm text-stone-800">{person.department}</p>
                </div>
                <div>
                  <p className="text-xs text-stone-600 mb-1">Start Date</p>
                  <p className="text-sm text-stone-800">{person.startDate}</p>
                </div>
                <div>
                  <p className="text-xs text-stone-600 mb-1">Availability</p>
                  <p className="text-sm text-stone-800">{person.availability}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'assignments' && (
          <div className="bg-white rounded-lg border border-stone-200 p-6">
            <h3 className="font-semibold text-stone-800 mb-4">Current Assignments</h3>
            <div className="space-y-3">
              <div className="p-4 bg-stone-50 rounded-lg">
                <p className="font-medium text-stone-800">Website Redesign</p>
                <p className="text-sm text-stone-600">Acme Corporation • UI/UX Designer</p>
              </div>
              <div className="p-4 bg-stone-50 rounded-lg">
                <p className="font-medium text-stone-800">Mobile App Development</p>
                <p className="text-sm text-stone-600">Tech Startup Inc • Senior Designer</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'skills' && (
          <div className="bg-white rounded-lg border border-stone-200 p-6">
            <h3 className="font-semibold text-stone-800 mb-4">Skills & Expertise</h3>
            <div className="flex flex-wrap gap-2">
              {person.skills?.map((skill: string, idx: number) => (
                <span key={idx} className="inline-flex px-3 py-1.5 text-sm rounded-full bg-primary/10 text-primary">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-stone-800">My Requests</h3>
              <div className="flex items-center gap-2">
                <BonsaiButton size="sm" onClick={onRequestLeave}>Request Leave</BonsaiButton>
                <BonsaiButton size="sm" onClick={onSubmitExpense}>Submit Expense</BonsaiButton>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-stone-200 p-6 text-center">
              <p className="text-stone-600">No recent requests</p>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-stone-800">Documents</h3>
            <BonsaiDocumentList
              documents={[
                {
                  id: '1',
                  name: 'employment-contract.pdf',
                  type: 'application/pdf',
                  size: '245 KB',
                  uploadedAt: person.startDate,
                  uploadedBy: 'HR',
                },
              ]}
              onDownload={(doc) => console.log('Download:', doc)}
              onDelete={(doc) => console.log('Delete:', doc)}
            />
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="bg-white rounded-lg border border-stone-200 p-6">
            <h3 className="font-semibold text-stone-800 mb-4">Recent Activity</h3>
            <BonsaiTimeline items={activityItems} />
          </div>
        )}
      </div>
    </div>
  );
}
