import React, { useState } from 'react';
import { Edit, Trash2, Mail, Phone, Building, Briefcase, Calendar, Tag as TagIcon, Filter } from 'lucide-react';
import { BonsaiButton } from '../bonsai/BonsaiButton';
import { BonsaiTabs } from '../bonsai/BonsaiTabs';
import { BonsaiStatusPill } from '../bonsai/BonsaiStatusPill';
import { BonsaiTimeline } from '../bonsai/BonsaiTimeline';
import { BonsaiDocumentList } from '../bonsai/BonsaiFileUpload';
import { BonsaiEmptyState } from '../bonsai/BonsaiEmptyStates';
import { CO04GDPRActions } from './CO04GDPRActions';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  jobTitle?: string;
  type: string;
  linkedClient: string;
  consent: 'Given' | 'Pending' | 'Withdrawn';
  gdprStatus: 'Active' | 'Export Requested' | 'Deletion Requested';
  source: string;
  tags: string[];
  lastContact?: string;
}

interface CO03ContactDetailProps {
  contact: Contact;
  onEdit: () => void;
  onLinkClient: () => void;
}

export function CO03ContactDetail({ contact, onEdit, onLinkClient }: CO03ContactDetailProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [activityFilter, setActivityFilter] = useState<string[]>(['all']);

  const tabs = [
    { label: 'Overview', value: 'overview' },
    { label: 'Related', value: 'related' },
    { label: 'Activity', value: 'activity' },
    { label: 'Documents', value: 'documents' },
    { label: 'GDPR', value: 'gdpr' },
  ];

  const activityTypes = [
    { label: 'All', value: 'all' },
    { label: 'Note', value: 'note' },
    { label: 'Email', value: 'email' },
    { label: 'Call', value: 'call' },
    { label: 'Meeting', value: 'meeting' },
    { label: 'System', value: 'system' },
  ];

  const activityItems = [
    {
      id: '1',
      title: 'Sent proposal follow-up email',
      description: 'Checked in on the website redesign proposal',
      timestamp: '2 hours ago',
      user: { name: 'John Doe' },
      type: 'email',
    },
    {
      id: '2',
      title: 'Phone call completed',
      description: 'Discussed project timeline and budget',
      timestamp: '1 day ago',
      user: { name: 'Jane Smith' },
      type: 'call',
    },
    {
      id: '3',
      title: 'Meeting scheduled',
      description: 'Discovery call set for Jan 15, 2026',
      timestamp: '3 days ago',
      user: { name: 'John Doe' },
      type: 'meeting',
    },
    {
      id: '4',
      title: 'Consent updated',
      description: 'Marketing consent given',
      timestamp: '1 week ago',
      user: { name: 'System' },
      type: 'system',
    },
    {
      id: '5',
      title: 'Added note',
      description: 'Very interested in our services, follow up in 2 weeks',
      timestamp: '1 week ago',
      user: { name: 'John Doe' },
      type: 'note',
    },
  ];

  const filteredActivities = activityFilter.includes('all')
    ? activityItems
    : activityItems.filter(item => activityFilter.includes(item.type));

  const toggleActivityFilter = (value: string) => {
    if (value === 'all') {
      setActivityFilter(['all']);
    } else {
      const newFilters = activityFilter.filter(f => f !== 'all');
      if (newFilters.includes(value)) {
        const updated = newFilters.filter(f => f !== value);
        setActivityFilter(updated.length === 0 ? ['all'] : updated);
      } else {
        setActivityFilter([...newFilters, value]);
      }
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-green-600 flex items-center justify-center">
            <span className="text-2xl font-semibold text-white">
              {contact.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-semibold text-stone-800">{contact.name}</h1>
              <BonsaiStatusPill
                status={contact.consent === 'Given' ? 'active' : contact.consent === 'Pending' ? 'pending' : 'draft'}
                label={`Consent: ${contact.consent}`}
              />
              {contact.gdprStatus !== 'Active' && (
                <BonsaiStatusPill
                  status="pending"
                  label={contact.gdprStatus}
                />
              )}
              <span className="inline-flex px-3 py-1 text-xs rounded-full bg-stone-100 text-stone-600">
                {contact.type}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-stone-600">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>{contact.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>{contact.phone}</span>
              </div>
              {contact.company && (
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  <span>{contact.company}</span>
                </div>
              )}
              {contact.jobTitle && (
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  <span>{contact.jobTitle}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <BonsaiButton variant="ghost" size="sm" icon={<Mail />}>
            Send Email
          </BonsaiButton>
          <BonsaiButton variant="ghost" size="sm" icon={<Edit />} onClick={onEdit}>
            Edit
          </BonsaiButton>
          <BonsaiButton variant="destructive" size="sm" icon={<Trash2 />}>
            Delete
          </BonsaiButton>
        </div>
      </div>

      {/* Tags */}
      {contact.tags.length > 0 && (
        <div className="flex items-center gap-2 mb-6">
          <TagIcon className="w-4 h-4 text-stone-400" />
          {contact.tags.map((tag, idx) => (
            <span key={idx} className="inline-flex px-3 py-1 text-xs rounded-full bg-stone-100 text-stone-700">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Tabs */}
      <BonsaiTabs
        tabs={tabs}
        value={activeTab}
        onValueChange={setActiveTab}
      />

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg border border-stone-200 p-4">
                <p className="text-xs text-stone-600 mb-1">Source</p>
                <p className="text-lg font-semibold text-stone-800">{contact.source}</p>
              </div>
              <div className="bg-white rounded-lg border border-stone-200 p-4">
                <p className="text-xs text-stone-600 mb-1">Linked Client</p>
                <p className="text-lg font-semibold text-stone-800">{contact.linkedClient || '-'}</p>
                {!contact.linkedClient && (
                  <button
                    onClick={onLinkClient}
                    className="text-xs text-primary hover:underline mt-1"
                  >
                    Link to Client
                  </button>
                )}
              </div>
              <div className="bg-white rounded-lg border border-stone-200 p-4">
                <p className="text-xs text-stone-600 mb-1">Added</p>
                <p className="text-lg font-semibold text-stone-800">Jan 1, 2026</p>
              </div>
              <div className="bg-white rounded-lg border border-stone-200 p-4">
                <p className="text-xs text-stone-600 mb-1">Last Contact</p>
                <p className="text-lg font-semibold text-stone-800">Jan 10, 2026</p>
              </div>
            </div>

            {/* Contact Details */}
            <div className="bg-white rounded-lg border border-stone-200 p-6">
              <h3 className="font-semibold text-stone-800 mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-stone-600 mb-1">Email</p>
                  <p className="text-sm text-stone-800">{contact.email}</p>
                </div>
                <div>
                  <p className="text-xs text-stone-600 mb-1">Phone</p>
                  <p className="text-sm text-stone-800">{contact.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-stone-600 mb-1">Company</p>
                  <p className="text-sm text-stone-800">{contact.company || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-stone-600 mb-1">Job Title</p>
                  <p className="text-sm text-stone-800">{contact.jobTitle || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-stone-600 mb-1">Type</p>
                  <p className="text-sm text-stone-800">{contact.type}</p>
                </div>
                <div>
                  <p className="text-xs text-stone-600 mb-1">Source</p>
                  <p className="text-sm text-stone-800">{contact.source}</p>
                </div>
              </div>
            </div>

            {/* GDPR Summary */}
            <div className="bg-white rounded-lg border border-stone-200 p-6">
              <h3 className="font-semibold text-stone-800 mb-4">Data Privacy Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-stone-600 mb-1">Consent Status</p>
                  <BonsaiStatusPill
                    status={contact.consent === 'Given' ? 'active' : contact.consent === 'Pending' ? 'pending' : 'draft'}
                    label={contact.consent}
                  />
                </div>
                <div>
                  <p className="text-xs text-stone-600 mb-1">Consent Date</p>
                  <p className="text-sm text-stone-800">Jan 1, 2026</p>
                </div>
                <div>
                  <p className="text-xs text-stone-600 mb-1">Processing Basis</p>
                  <p className="text-sm text-stone-800">Consent</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-stone-200">
                <button
                  onClick={() => setActiveTab('gdpr')}
                  className="text-sm text-primary hover:underline"
                >
                  View full GDPR details and actions →
                </button>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white rounded-lg border border-stone-200 p-6">
              <h3 className="font-semibold text-stone-800 mb-4">Notes</h3>
              <p className="text-sm text-stone-700 leading-relaxed">
                Very interested in our website redesign services. Has budget approved for Q1 2026. 
                Decision maker for marketing initiatives. Follow up after proposal review.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'related' && (
          <div className="space-y-6">
            {/* Deals Section */}
            <div className="bg-white rounded-lg border border-stone-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-stone-800">Related Deals</h3>
                <button className="text-sm text-primary hover:underline">View all →</button>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-stone-800">Website Redesign Project</p>
                    <p className="text-xs text-stone-500">Proposal Sent</p>
                  </div>
                  <p className="text-sm font-semibold text-stone-800">$45,000</p>
                </div>
              </div>
            </div>

            {/* Projects Section */}
            <div className="bg-white rounded-lg border border-stone-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-stone-800">Related Projects</h3>
                <button className="text-sm text-primary hover:underline">View all →</button>
              </div>
              <BonsaiEmptyState
                title="No projects yet"
                description="This contact is not associated with any projects"
              />
            </div>

            {/* Jobs Section */}
            <div className="bg-white rounded-lg border border-stone-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-stone-800">Related Jobs</h3>
                <button className="text-sm text-primary hover:underline">View all →</button>
              </div>
              <BonsaiEmptyState
                title="No jobs yet"
                description="This contact is not associated with any talent placements"
              />
            </div>

            {/* Requests Section */}
            <div className="bg-white rounded-lg border border-stone-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-stone-800">Support Requests</h3>
                <button className="text-sm text-primary hover:underline">View all →</button>
              </div>
              <BonsaiEmptyState
                title="No support requests"
                description="This contact hasn't submitted any support requests"
              />
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="space-y-4">
            {/* Activity Filter Chips */}
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-stone-400" />
              {activityTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => toggleActivityFilter(type.value)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                    activityFilter.includes(type.value) || (type.value === 'all' && activityFilter.includes('all'))
                      ? 'bg-primary text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>

            {/* Timeline with Edit/Delete Actions */}
            <div className="bg-white rounded-lg border border-stone-200 p-6">
              <BonsaiTimeline
                items={filteredActivities.map(item => ({
                  ...item,
                  actions: item.type !== 'system' ? (
                    <div className="flex items-center gap-2">
                      <button className="text-xs text-primary hover:underline">Edit</button>
                      <button className="text-xs text-stone-700 hover:underline">Delete</button>
                    </div>
                  ) : undefined,
                }))}
              />
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-stone-800">All Documents</h3>
              <BonsaiButton size="sm">Upload Document</BonsaiButton>
            </div>
            <BonsaiDocumentList
              documents={[
                {
                  id: '1',
                  name: 'signed-consent-form.pdf',
                  type: 'application/pdf',
                  size: '245 KB',
                  uploadedAt: 'Jan 1, 2026',
                  uploadedBy: 'System',
                },
                {
                  id: '2',
                  name: 'meeting-notes-jan-8.docx',
                  type: 'application/msword',
                  size: '56 KB',
                  uploadedAt: 'Jan 8, 2026',
                  uploadedBy: 'John Doe',
                },
              ]}
              onDownload={(doc) => console.log('Download:', doc)}
              onDelete={(doc) => console.log('Delete:', doc)}
            />
          </div>
        )}

        {activeTab === 'gdpr' && (
          <CO04GDPRActions contact={contact} />
        )}
      </div>
    </div>
  );
}
