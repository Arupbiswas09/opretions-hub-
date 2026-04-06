import React, { useState } from 'react';
import { Edit, Trash2, FileText, Activity, FolderOpen, Plus, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import { BonsaiButton } from '../bonsai/BonsaiButton';
import { BonsaiTabs } from '../bonsai/BonsaiTabs';
import { BonsaiStatusPill } from '../bonsai/BonsaiStatusPill';
import { BonsaiTimeline } from '../bonsai/BonsaiTimeline';
import { BonsaiDocumentList } from '../bonsai/BonsaiFileUpload';

interface Deal {
  id: string;
  name: string;
  client: string;
  type: 'Project' | 'Talent';
  value: string;
  stage: string;
  owner: string;
}

interface SA04DealDetailProps {
  deal: Deal;
  onCreateProposal: () => void;
  onMarkWonLost: () => void;
  onEdit: () => void;
  onViewProposals: () => void;
}

export function SA04DealDetail({ 
  deal, 
  onCreateProposal, 
  onMarkWonLost, 
  onEdit,
  onViewProposals 
}: SA04DealDetailProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { label: 'Overview', value: 'overview' },
    { label: 'Proposals', value: 'proposals' },
    { label: 'Activity', value: 'activity' },
    { label: 'Documents', value: 'documents' },
  ];

  return (
    <div className="px-3 py-6 sm:p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-semibold text-stone-800">{deal.name}</h1>
            <BonsaiStatusPill status="pending" label={deal.stage} />
            <span className={`inline-flex px-3 py-1 text-xs rounded-full ${
              deal.type === 'Project' 
                ? 'bg-stone-100 text-stone-600' 
                : 'bg-stone-100 text-stone-600'
            }`}>
              {deal.type} Deal
            </span>
          </div>
          <p className="text-sm text-stone-500">{deal.client} • {deal.value}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <BonsaiButton variant="ghost" size="sm" icon={<Edit />} onClick={onEdit}>
            Edit
          </BonsaiButton>
          <BonsaiButton variant="destructive" size="sm" icon={<Trash2 />}>
            Delete
          </BonsaiButton>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <button
          onClick={onCreateProposal}
          className="flex items-center gap-3 p-4 bg-white rounded-lg border border-stone-200 hover:border-primary hover:shadow-sm transition-all"
        >
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div className="text-left">
            <p className="font-medium text-stone-800">Create Proposal</p>
            <p className="text-xs text-stone-500">Draft a new proposal</p>
          </div>
        </button>

        <button className="flex items-center gap-3 p-4 bg-white rounded-lg border border-stone-200 hover:border-primary hover:shadow-sm transition-all">
          <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center">
            <Activity className="w-5 h-5 text-stone-600" />
          </div>
          <div className="text-left">
            <p className="font-medium text-stone-800">Log Activity</p>
            <p className="text-xs text-stone-500">Add a note or call log</p>
          </div>
        </button>

        <button
          onClick={onMarkWonLost}
          className="flex items-center gap-3 p-4 bg-white rounded-lg border border-stone-200 hover:border-primary hover:shadow-sm transition-all"
        >
          <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-stone-600" />
          </div>
          <div className="text-left">
            <p className="font-medium text-stone-800">Mark Won/Lost</p>
            <p className="text-xs text-stone-500">Close this deal</p>
          </div>
        </button>
      </div>

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
            {/* Next Step Widget */}
            <div className="bg-gradient-to-r from-primary to-green-600 text-white rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5" />
                    <h3 className="font-semibold">Next Step</h3>
                  </div>
                  <p className="text-sm text-white/90 mb-3">Follow up on proposal with decision maker</p>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Follow-up: Jan 15, 2026</span>
                    </div>
                  </div>
                </div>
                <BonsaiButton size="sm" variant="ghost" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                  Mark Complete
                </BonsaiButton>
              </div>
            </div>

            {/* Key Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg border border-stone-200 p-4">
                <p className="text-xs text-stone-600 mb-1">Deal Value</p>
                <p className="text-lg font-semibold text-stone-800">{deal.value}</p>
              </div>
              <div className="bg-white rounded-lg border border-stone-200 p-4">
                <p className="text-xs text-stone-600 mb-1">Owner</p>
                <p className="text-lg font-semibold text-stone-800">{deal.owner}</p>
              </div>
              <div className="bg-white rounded-lg border border-stone-200 p-4">
                <p className="text-xs text-stone-600 mb-1">Created</p>
                <p className="text-lg font-semibold text-stone-800">Jan 5, 2026</p>
              </div>
              <div className="bg-white rounded-lg border border-stone-200 p-4">
                <p className="text-xs text-stone-600 mb-1">Expected Close</p>
                <p className="text-lg font-semibold text-stone-800">Jan 25, 2026</p>
              </div>
            </div>

            {/* Details */}
            <div className="bg-white rounded-lg border border-stone-200 p-6">
              <h3 className="font-semibold text-stone-800 mb-4">Deal Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-stone-600 mb-1">Client</p>
                  <p className="text-sm text-stone-800">{deal.client}</p>
                </div>
                <div>
                  <p className="text-xs text-stone-600 mb-1">Type</p>
                  <p className="text-sm text-stone-800">{deal.type}</p>
                </div>
                <div>
                  <p className="text-xs text-stone-600 mb-1">Stage</p>
                  <p className="text-sm text-stone-800">{deal.stage}</p>
                </div>
                <div>
                  <p className="text-xs text-stone-600 mb-1">Probability</p>
                  <p className="text-sm text-stone-800">65%</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-stone-600 mb-1">Description</p>
                  <p className="text-sm text-stone-700 leading-relaxed">
                    Complete website redesign including new branding, modern UI/UX, and responsive development.
                    Project includes 5 main pages, blog functionality, and contact forms.
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-lg border border-stone-200 p-6">
              <h3 className="font-semibold text-stone-800 mb-4">Primary Contact</h3>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-stone-200 flex items-center justify-center">
                  <span className="text-stone-600 font-semibold">JD</span>
                </div>
                <div>
                  <p className="font-medium text-stone-800">Jennifer Davis</p>
                  <p className="text-sm text-stone-600">Marketing Director</p>
                  <p className="text-sm text-stone-500">jennifer@acmecorp.com • (555) 123-4567</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'proposals' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-stone-800">Proposals</h3>
              <BonsaiButton size="sm" icon={<Plus />} onClick={onCreateProposal}>
                Create Proposal
              </BonsaiButton>
            </div>
            
            <div className="bg-white rounded-lg border border-stone-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-stone-50 border-b border-stone-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-stone-600 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-stone-600 uppercase">Version</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-stone-600 uppercase">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-stone-600 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-stone-600 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  <tr 
                    className="hover:bg-stone-50 cursor-pointer"
                    onClick={onViewProposals}
                  >
                    <td className="px-4 py-3 text-sm text-stone-800">Website Redesign Proposal</td>
                    <td className="px-4 py-3 text-sm text-stone-600">v2.0</td>
                    <td className="px-4 py-3 text-sm font-semibold text-stone-800">$45,000</td>
                    <td className="px-4 py-3"><BonsaiStatusPill status="pending" label="Sent" /></td>
                    <td className="px-4 py-3 text-sm text-stone-600">Jan 10, 2026</td>
                  </tr>
                  <tr className="hover:bg-stone-50 cursor-pointer">
                    <td className="px-4 py-3 text-sm text-stone-800">Website Redesign Proposal</td>
                    <td className="px-4 py-3 text-sm text-stone-600">v1.0</td>
                    <td className="px-4 py-3 text-sm font-semibold text-stone-800">$48,000</td>
                    <td className="px-4 py-3"><BonsaiStatusPill status="inactive" label="Draft" /></td>
                    <td className="px-4 py-3 text-sm text-stone-600">Jan 8, 2026</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="bg-white rounded-lg border border-stone-200 p-6">
            <BonsaiTimeline
              items={[
                {
                  id: '1',
                  title: 'Proposal sent to client',
                  description: 'Website Redesign Proposal v2.0',
                  timestamp: '2 days ago',
                  user: { name: 'John Doe' },
                },
                {
                  id: '2',
                  title: 'Discovery call completed',
                  description: 'Discussed project scope and timeline',
                  timestamp: '5 days ago',
                  user: { name: 'John Doe' },
                },
                {
                  id: '3',
                  title: 'Deal qualified',
                  description: 'Budget confirmed, decision maker identified',
                  timestamp: '1 week ago',
                  user: { name: 'John Doe' },
                },
                {
                  id: '4',
                  title: 'Deal created',
                  description: 'Initial contact from website inquiry',
                  timestamp: '2 weeks ago',
                  user: { name: 'Jane Smith' },
                },
              ]}
            />
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
                  name: 'proposal-v2.pdf',
                  type: 'application/pdf',
                  size: '2.4 MB',
                  uploadedAt: 'Jan 10, 2026',
                  uploadedBy: 'John Doe',
                },
                {
                  id: '2',
                  name: 'discovery-notes.docx',
                  type: 'application/msword',
                  size: '124 KB',
                  uploadedAt: 'Jan 5, 2026',
                  uploadedBy: 'John Doe',
                },
              ]}
              onDownload={(doc) => console.log('Download:', doc)}
              onDelete={(doc) => console.log('Delete:', doc)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
