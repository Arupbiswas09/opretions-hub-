import React, { useState } from 'react';
import { Edit, Trash2, Mail, Phone, Globe, MapPin, Plus, UserPlus, Settings as SettingsIcon } from 'lucide-react';
import { BonsaiButton } from '../bonsai/BonsaiButton';
import { BonsaiTabs } from '../bonsai/BonsaiTabs';
import { BonsaiStatusPill } from '../bonsai/BonsaiStatusPill';
import { BonsaiTimeline } from '../bonsai/BonsaiTimeline';
import { BonsaiDocumentList } from '../bonsai/BonsaiFileUpload';
import { BonsaiEmptyState } from '../bonsai/BonsaiEmptyStates';
import { CL04RequestsList } from './CL04RequestsList';
import { CL05RequestDetail } from './CL05RequestDetail';

interface Client {
  id: string;
  name: string;
  industry: string;
  status: string;
  owner: string;
  website?: string;
  phone?: string;
  email?: string;
  address?: string;
  tags: string[];
}

interface CL03ClientDetailProps {
  client: Client;
  onEdit: () => void;
  onInviteUser: () => void;
  onCreateRequest: () => void;
  onViewRequest: (request: any) => void;
}

export function CL03ClientDetail({ client, onEdit, onInviteUser, onCreateRequest, onViewRequest }: CL03ClientDetailProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  const tabs = [
    { label: 'Overview', value: 'overview' },
    { label: 'Contacts', value: 'contacts' },
    { label: 'Projects', value: 'projects' },
    { label: 'Requests', value: 'requests' },
    { label: 'Deals', value: 'deals' },
    { label: 'Activity', value: 'activity' },
    { label: 'Documents', value: 'documents' },
    { label: 'Portal Users', value: 'portal' },
  ];

  const contacts = [
    { id: '1', name: 'Jennifer Davis', role: 'Marketing Director', email: 'jennifer@acmecorp.com', phone: '(555) 123-4567' },
    { id: '2', name: 'Michael Chen', role: 'CTO', email: 'michael@acmecorp.com', phone: '(555) 234-5678' },
    { id: '3', name: 'Sarah Williams', role: 'Product Manager', email: 'sarah@acmecorp.com', phone: '(555) 345-6789' },
  ];

  const projects = [
    { id: '1', name: 'Website Redesign', status: 'In Progress', progress: 65, budget: '$45,000', startDate: 'Jan 5, 2026' },
    { id: '2', name: 'Mobile App Development', status: 'Planning', progress: 10, budget: '$85,000', startDate: 'Feb 1, 2026' },
  ];

  const deals = [
    { id: '1', name: 'Q1 Marketing Services', value: '$25,000', stage: 'Proposal Sent', probability: '75%' },
    { id: '2', name: 'Annual Support Contract', value: '$50,000', stage: 'Negotiation', probability: '90%' },
  ];

  const portalUsers = [
    { id: '1', name: 'Jennifer Davis', email: 'jennifer@acmecorp.com', role: 'Admin', status: 'Active', lastLogin: '2 hours ago' },
    { id: '2', name: 'Michael Chen', email: 'michael@acmecorp.com', role: 'User', status: 'Active', lastLogin: '1 day ago' },
    { id: '3', name: 'Sarah Williams', email: 'sarah@acmecorp.com', role: 'Viewer', status: 'Inactive', lastLogin: '2 weeks ago' },
  ];

  const activityItems = [
    {
      id: '1',
      title: 'Project milestone completed',
      description: 'Homepage design approved',
      timestamp: '2 hours ago',
      user: { name: 'Design Team' },
    },
    {
      id: '2',
      title: 'Invoice sent',
      description: 'Invoice #INV-2026-001 for $12,500',
      timestamp: '1 day ago',
      user: { name: 'Finance' },
    },
    {
      id: '3',
      title: 'New request submitted',
      description: 'Senior React Developer needed',
      timestamp: '3 days ago',
      user: { name: 'Jennifer Davis' },
    },
  ];

  const getStatusColor = (status: string): 'active' | 'pending' | 'inactive' | 'archived' => {
    switch (status) {
      case 'Active': return 'active';
      case 'Onboarding': return 'pending';
      case 'Inactive': return 'inactive';
      case 'Archived': return 'archived';
      default: return 'pending';
    }
  };

  if (selectedRequest) {
    return (
      <CL05RequestDetail
        request={selectedRequest}
        onBack={() => setSelectedRequest(null)}
      />
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary to-green-600 flex items-center justify-center">
            <span className="text-2xl font-semibold text-white">
              {client.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-semibold text-stone-800">{client.name}</h1>
              <BonsaiStatusPill
                status={getStatusColor(client.status)}
                label={client.status}
              />
              <span className="inline-flex px-3 py-1 text-xs rounded-full bg-stone-100 text-stone-600">
                {client.industry}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-stone-600">
              {client.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>{client.email}</span>
                </div>
              )}
              {client.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{client.phone}</span>
                </div>
              )}
              {client.website && (
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  <a href={client.website} className="text-primary hover:underline">{client.website}</a>
                </div>
              )}
              {client.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{client.address}</span>
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
            Archive
          </BonsaiButton>
        </div>
      </div>

      {/* Tags */}
      {client.tags.length > 0 && (
        <div className="flex items-center gap-2 mb-6">
          {client.tags.map((tag, idx) => (
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
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg border border-stone-200 p-4">
                <p className="text-xs text-stone-600 mb-1">Total Revenue</p>
                <p className="text-2xl font-semibold text-primary">$125,000</p>
              </div>
              <div className="bg-white rounded-lg border border-stone-200 p-4">
                <p className="text-xs text-stone-600 mb-1">Active Projects</p>
                <p className="text-2xl font-semibold text-stone-600">2</p>
              </div>
              <div className="bg-white rounded-lg border border-stone-200 p-4">
                <p className="text-xs text-stone-600 mb-1">Open Requests</p>
                <p className="text-2xl font-semibold text-stone-600">2</p>
              </div>
              <div className="bg-white rounded-lg border border-stone-200 p-4">
                <p className="text-xs text-stone-600 mb-1">Portal Users</p>
                <p className="text-2xl font-semibold text-stone-800">3</p>
              </div>
            </div>

            {/* Client Details */}
            <div className="bg-white rounded-lg border border-stone-200 p-6">
              <h3 className="font-semibold text-stone-800 mb-4">Client Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-stone-600 mb-1">Company Name</p>
                  <p className="text-sm text-stone-800">{client.name}</p>
                </div>
                <div>
                  <p className="text-xs text-stone-600 mb-1">Industry</p>
                  <p className="text-sm text-stone-800">{client.industry}</p>
                </div>
                <div>
                  <p className="text-xs text-stone-600 mb-1">Status</p>
                  <p className="text-sm text-stone-800">{client.status}</p>
                </div>
                <div>
                  <p className="text-xs text-stone-600 mb-1">Account Owner</p>
                  <p className="text-sm text-stone-800">{client.owner}</p>
                </div>
                <div>
                  <p className="text-xs text-stone-600 mb-1">Client Since</p>
                  <p className="text-sm text-stone-800">Jan 1, 2024</p>
                </div>
                <div>
                  <p className="text-xs text-stone-600 mb-1">Payment Terms</p>
                  <p className="text-sm text-stone-800">Net 30</p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg border border-stone-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-stone-800">Recent Activity</h3>
                <button
                  onClick={() => setActiveTab('activity')}
                  className="text-sm text-primary hover:underline"
                >
                  View all →
                </button>
              </div>
              <BonsaiTimeline items={activityItems.slice(0, 3)} />
            </div>

            {/* Notes */}
            <div className="bg-white rounded-lg border border-stone-200 p-6">
              <h3 className="font-semibold text-stone-800 mb-4">Notes</h3>
              <p className="text-sm text-stone-700 leading-relaxed">
                Key account. Very responsive and professional to work with. Has expressed interest in 
                expanding services to include mobile app development. Budget approved for Q1 2026 projects.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'contacts' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-stone-800">Client Contacts</h3>
              <BonsaiButton size="sm" icon={<Plus />}>Add Contact</BonsaiButton>
            </div>
            <div className="bg-white rounded-lg border border-stone-200 divide-y divide-stone-200">
              {contacts.map((contact) => (
                <div key={contact.id} className="p-4 hover:bg-stone-50 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-stone-800">{contact.name}</p>
                      <p className="text-sm text-stone-600">{contact.role}</p>
                    </div>
                    <div className="text-right text-sm text-stone-600">
                      <p>{contact.email}</p>
                      <p>{contact.phone}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-stone-800">Client Projects</h3>
              <BonsaiButton size="sm" icon={<Plus />}>New Project</BonsaiButton>
            </div>
            <div className="space-y-3">
              {projects.map((project) => (
                <div key={project.id} className="bg-white rounded-lg border border-stone-200 p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium text-stone-800">{project.name}</p>
                      <p className="text-sm text-stone-600">Started {project.startDate}</p>
                    </div>
                    <BonsaiStatusPill
                      status={project.status === 'In Progress' ? 'pending' : 'archived'}
                      label={project.status}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-stone-600">Progress</span>
                      <span className="font-medium text-stone-800">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-stone-200 rounded-full h-2">
                      <div
                        className="bg-primary rounded-full h-2 transition-all"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-stone-600">Budget</span>
                      <span className="font-medium text-stone-800">{project.budget}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'requests' && (
          <CL04RequestsList
            onRequestClick={(request) => setSelectedRequest(request)}
            onCreateRequest={onCreateRequest}
          />
        )}

        {activeTab === 'deals' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-stone-800">Active Deals</h3>
              <BonsaiButton size="sm" icon={<Plus />}>New Deal</BonsaiButton>
            </div>
            <div className="space-y-3">
              {deals.map((deal) => (
                <div key={deal.id} className="bg-white rounded-lg border border-stone-200 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-stone-800">{deal.name}</p>
                      <p className="text-sm text-stone-600">{deal.stage}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary">{deal.value}</p>
                      <p className="text-xs text-stone-600">{deal.probability} Win Probability</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="bg-white rounded-lg border border-stone-200 p-6">
            <h3 className="font-semibold text-stone-800 mb-4">All Activity</h3>
            <BonsaiTimeline items={activityItems} />
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-stone-800">Shared Documents</h3>
              <BonsaiButton size="sm">Upload Document</BonsaiButton>
            </div>
            <BonsaiDocumentList
              documents={[
                {
                  id: '1',
                  name: 'signed-contract.pdf',
                  type: 'application/pdf',
                  size: '1.2 MB',
                  uploadedAt: 'Jan 1, 2024',
                  uploadedBy: 'John Doe',
                },
                {
                  id: '2',
                  name: 'brand-guidelines.pdf',
                  type: 'application/pdf',
                  size: '5.4 MB',
                  uploadedAt: 'Jan 5, 2026',
                  uploadedBy: 'Jennifer Davis',
                },
              ]}
              onDownload={(doc) => console.log('Download:', doc)}
              onDelete={(doc) => console.log('Delete:', doc)}
            />
          </div>
        )}

        {activeTab === 'portal' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-stone-800">Portal Users</h3>
                <p className="text-sm text-stone-600">Manage client portal access and permissions</p>
              </div>
              <BonsaiButton size="sm" icon={<UserPlus />} onClick={onInviteUser}>
                Invite User
              </BonsaiButton>
            </div>

            <div className="bg-white rounded-lg border border-stone-200">
              <div className="divide-y divide-stone-200">
                {portalUsers.map((user) => (
                  <div key={user.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-green-600 flex items-center justify-center">
                          <span className="text-sm font-semibold text-white">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-stone-800">{user.name}</p>
                          <p className="text-sm text-stone-600">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-1 text-xs rounded-full bg-stone-100 text-stone-600">
                              {user.role}
                            </span>
                            <BonsaiStatusPill
                              status={user.status === 'Active' ? 'active' : 'inactive'}
                              label={user.status}
                            />
                          </div>
                          <p className="text-xs text-stone-500 mt-1">Last login: {user.lastLogin}</p>
                        </div>
                        <button className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg">
                          <SettingsIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
