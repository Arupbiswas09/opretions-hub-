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
            <h1 className="text-2xl font-semibold text-foreground">{deal.name}</h1>
            <BonsaiStatusPill status="pending" label={deal.stage} />
            <span className="inline-flex px-3 py-1 text-xs rounded-full bg-muted/60 text-muted-foreground border border-border">
              {deal.type} Deal
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{deal.client} • {deal.value}</p>
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
          className="flex items-center gap-3 p-4 hub-surface rounded-lg hover:shadow-sm transition-all"
        >
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div className="text-left">
            <p className="font-medium text-foreground">Create proposal</p>
            <p className="text-xs text-muted-foreground">Draft a new proposal</p>
          </div>
        </button>

        <button type="button" className="flex items-center gap-3 p-4 hub-surface rounded-lg hover:shadow-sm transition-all">
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
            <Activity className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="text-left">
            <p className="font-medium text-foreground">Log activity</p>
            <p className="text-xs text-muted-foreground">Add a note or call log</p>
          </div>
        </button>

        <button
          onClick={onMarkWonLost}
          className="flex items-center gap-3 p-4 hub-surface rounded-lg hover:shadow-sm transition-all"
        >
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="text-left">
            <p className="font-medium text-foreground">Mark won/lost</p>
            <p className="text-xs text-muted-foreground">Close this deal</p>
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
              {[
                { label: 'Deal value', value: deal.value },
                { label: 'Owner', value: deal.owner },
                { label: 'Created', value: 'Jan 5, 2026' },
                { label: 'Expected close', value: 'Jan 25, 2026' },
              ].map((s) => (
                <div key={s.label} className="hub-surface hub-surface-elevated rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
                  <p className="text-lg font-semibold text-foreground">{s.value}</p>
                </div>
              ))}
            </div>

            {/* Details */}
            <div className="hub-surface rounded-lg p-6">
              <h3 className="font-semibold text-foreground mb-4">Deal details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Client</p>
                  <p className="text-sm text-foreground">{deal.client}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Type</p>
                  <p className="text-sm text-foreground">{deal.type}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Stage</p>
                  <p className="text-sm text-foreground">{deal.stage}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Probability</p>
                  <p className="text-sm text-foreground">65%</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground mb-1">Description</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Complete website redesign including new branding, modern UI/UX, and responsive development.
                    Project includes 5 main pages, blog functionality, and contact forms.
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="hub-surface rounded-lg p-6">
              <h3 className="font-semibold text-foreground mb-4">Primary contact</h3>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center border border-border">
                  <span className="text-muted-foreground font-semibold">JD</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Jennifer Davis</p>
                  <p className="text-sm text-muted-foreground">Marketing Director</p>
                  <p className="text-sm text-muted-foreground">jennifer@acmecorp.com • (555) 123-4567</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'proposals' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Proposals</h3>
              <BonsaiButton size="sm" icon={<Plus />} onClick={onCreateProposal}>
                Create Proposal
              </BonsaiButton>
            </div>
            
            <div className="hub-surface overflow-hidden rounded-lg">
              <table className="w-full">
                <thead className="bg-muted/30 border-b border-border">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Version</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr 
                    className="hover:bg-[var(--row-hover-bg)] cursor-pointer transition-colors"
                    onClick={onViewProposals}
                  >
                    <td className="px-4 py-3 text-sm text-foreground">Website Redesign Proposal</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">v2.0</td>
                    <td className="px-4 py-3 text-sm font-semibold text-foreground">$45,000</td>
                    <td className="px-4 py-3"><BonsaiStatusPill status="pending" label="Sent" /></td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">Jan 10, 2026</td>
                  </tr>
                  <tr className="hover:bg-[var(--row-hover-bg)] cursor-pointer transition-colors">
                    <td className="px-4 py-3 text-sm text-foreground">Website Redesign Proposal</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">v1.0</td>
                    <td className="px-4 py-3 text-sm font-semibold text-foreground">$48,000</td>
                    <td className="px-4 py-3"><BonsaiStatusPill status="inactive" label="Draft" /></td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">Jan 8, 2026</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="hub-surface rounded-lg p-6">
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
              <h3 className="font-semibold text-foreground">All documents</h3>
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
