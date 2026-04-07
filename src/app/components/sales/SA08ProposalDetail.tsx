import React, { useState } from 'react';
import { Download, Send, Edit, FileText, Activity, FolderOpen } from 'lucide-react';
import { BonsaiButton } from '../bonsai/BonsaiButton';
import { BonsaiTabs } from '../bonsai/BonsaiTabs';
import { BonsaiStatusPill } from '../bonsai/BonsaiStatusPill';
import { BonsaiTimeline } from '../bonsai/BonsaiTimeline';
import { BonsaiDocumentList } from '../bonsai/BonsaiFileUpload';

export function SA08ProposalDetail() {
  const [activeTab, setActiveTab] = useState('proposal');

  const tabs = [
    { label: 'Proposal', value: 'proposal' },
    { label: 'Activity', value: 'activity' },
    { label: 'Documents', value: 'documents' },
  ];

  return (
    <div className="px-3 py-6 sm:p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-semibold text-foreground">Website Redesign Proposal</h1>
            <BonsaiStatusPill status="pending" label="Sent" />
            <span className="text-sm text-muted-foreground">v2.0</span>
          </div>
          <p className="text-sm text-muted-foreground">Acme Corp • $45,000 • Valid until Jan 20, 2026</p>
        </div>
        
        <div className="flex items-center gap-2">
          <BonsaiButton variant="ghost" size="sm" icon={<Download />}>
            Download PDF
          </BonsaiButton>
          <BonsaiButton variant="ghost" size="sm" icon={<Edit />}>
            Edit
          </BonsaiButton>
          <BonsaiButton variant="primary" size="sm" icon={<Send />}>
            Send to Client
          </BonsaiButton>
        </div>
      </div>

      {/* Tabs */}
      <BonsaiTabs
        tabs={tabs}
        value={activeTab}
        onValueChange={setActiveTab}
      />

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'proposal' && (
          <div className="space-y-6">
            {/* PDF Preview Placeholder */}
            <div className="hub-surface overflow-hidden rounded-lg">
              <div className="h-[70vh] min-h-[520px] bg-muted/25 flex flex-col items-center justify-center p-6">
                <div className="w-full max-w-4xl bg-[var(--background-2)] border border-border shadow-lg mx-auto p-10 rounded-xl">
                  {/* Mock PDF Content */}
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-semibold text-foreground mb-2">Website Redesign Proposal</h2>
                    <p className="text-muted-foreground">Prepared for Acme Corp</p>
                    <p className="text-sm text-muted-foreground mt-2">January 10, 2026</p>
                  </div>

                  <div className="space-y-8">
                    {/* Executive Summary */}
                    <div>
                      <h3 className="text-xl font-semibold text-foreground mb-3">Executive summary</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        We are excited to present this proposal for a complete website redesign that will modernize
                        your online presence and improve user experience across all devices.
                      </p>
                    </div>

                    {/* Scope of Work */}
                    <div>
                      <h3 className="text-xl font-semibold text-foreground mb-3">Scope of work</h3>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                          <p className="text-muted-foreground">Modern, responsive design for all pages</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                          <p className="text-muted-foreground">Custom CMS integration</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                          <p className="text-muted-foreground">SEO optimization</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                          <p className="text-muted-foreground">Performance optimization</p>
                        </div>
                      </div>
                    </div>

                    {/* Investment */}
                    <div>
                      <h3 className="text-xl font-semibold text-foreground mb-3">Investment</h3>
                      <div className="bg-muted/25 border border-border rounded-lg p-6">
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Design & UX</span>
                            <span className="font-semibold text-foreground">$15,000</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Development</span>
                            <span className="font-semibold text-foreground">$25,000</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Content Migration</span>
                            <span className="font-semibold text-foreground">$5,000</span>
                          </div>
                          <div className="pt-3 border-t border-border flex justify-between">
                            <span className="font-semibold text-foreground">Total investment</span>
                            <span className="text-xl font-semibold text-primary">$45,000</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div>
                      <h3 className="text-xl font-semibold text-foreground mb-3">Timeline</h3>
                      <p className="text-muted-foreground">Estimated completion: 8-10 weeks from project kickoff</p>
                    </div>
                  </div>
                </div>
              </div>
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
                  description: 'Email sent to jennifer@acmecorp.com',
                  timestamp: '2 days ago',
                  user: { name: 'John Doe' },
                },
                {
                  id: '2',
                  title: 'Proposal updated to v2.0',
                  description: 'Adjusted pricing and timeline',
                  timestamp: '3 days ago',
                  user: { name: 'John Doe' },
                },
                {
                  id: '3',
                  title: 'Proposal created',
                  description: 'Initial draft completed',
                  timestamp: '5 days ago',
                  user: { name: 'John Doe' },
                },
              ]}
            />
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Related documents</h3>
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
                  name: 'pricing-breakdown.xlsx',
                  type: 'application/vnd.ms-excel',
                  size: '45 KB',
                  uploadedAt: 'Jan 10, 2026',
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
