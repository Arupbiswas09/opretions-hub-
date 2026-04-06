import React, { useState } from 'react';
import { Edit, Trash2, Star, Share2, MoreVertical, FileText, Activity, FolderOpen } from 'lucide-react';
import { BonsaiButton } from '../../bonsai/BonsaiButton';
import { BonsaiTabs } from '../../bonsai/BonsaiTabs';
import { BonsaiStatusPill } from '../../bonsai/BonsaiStatusPill';
import { BonsaiTimeline } from '../../bonsai/BonsaiTimeline';
import { BonsaiDocumentList } from '../../bonsai/BonsaiFileUpload';
import { AIAssistantPanel } from '../AIAssistantPanel';
import { TemplateInfoPanel } from '../TemplateInfoPanel';

interface T04DetailPageProps {
  title: string;
  subtitle?: string;
  moduleTabs?: Array<{ label: string; value: string }>;
}

export function T04DetailPage({ title, subtitle, moduleTabs = [] }: T04DetailPageProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [aiPanelCollapsed, setAiPanelCollapsed] = useState(false);

  const defaultTabs = [
    { label: 'Overview', value: 'overview' },
    { label: 'Activity', value: 'activity' },
    { label: 'Documents', value: 'documents' },
    ...moduleTabs,
  ];

  return (
    <>
      <div className="flex h-full">
        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="px-3 py-6 sm:p-8">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-semibold text-stone-800">{title}</h1>
                  <BonsaiStatusPill status="active" label="Active" />
                </div>
                {subtitle && <p className="text-sm text-stone-500">{subtitle}</p>}
              </div>
              
              <div className="flex items-center gap-2">
                <button className="p-2 text-stone-600 hover:bg-stone-100 rounded-lg">
                  <Star className="w-5 h-5" />
                </button>
                <button className="p-2 text-stone-600 hover:bg-stone-100 rounded-lg">
                  <Share2 className="w-5 h-5" />
                </button>
                <button className="p-2 text-stone-600 hover:bg-stone-100 rounded-lg">
                  <MoreVertical className="w-5 h-5" />
                </button>
                <BonsaiButton variant="ghost" size="sm" icon={<Edit />}>
                  Edit
                </BonsaiButton>
                <BonsaiButton variant="destructive" size="sm" icon={<Trash2 />}>
                  Delete
                </BonsaiButton>
              </div>
            </div>

            {/* Tabs */}
            <BonsaiTabs
              tabs={defaultTabs}
              value={activeTab}
              onValueChange={setActiveTab}
            />

            {/* Tab Content */}
            <div className="mt-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Key Info Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg border border-stone-200 p-4">
                      <p className="text-xs text-stone-600 mb-1">Record ID</p>
                      <p className="text-sm font-semibold text-stone-800">#12345</p>
                    </div>
                    <div className="bg-white rounded-lg border border-stone-200 p-4">
                      <p className="text-xs text-stone-600 mb-1">Created</p>
                      <p className="text-sm font-semibold text-stone-800">Jan 5, 2026</p>
                    </div>
                    <div className="bg-white rounded-lg border border-stone-200 p-4">
                      <p className="text-xs text-stone-600 mb-1">Last Updated</p>
                      <p className="text-sm font-semibold text-stone-800">2 hours ago</p>
                    </div>
                  </div>

                  {/* Details Section */}
                  <div className="bg-white rounded-lg border border-stone-200 p-6">
                    <h3 className="font-semibold text-stone-800 mb-4">Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-stone-600 mb-1">Owner</p>
                        <p className="text-sm text-stone-800">John Doe</p>
                      </div>
                      <div>
                        <p className="text-xs text-stone-600 mb-1">Type</p>
                        <p className="text-sm text-stone-800">Standard</p>
                      </div>
                      <div>
                        <p className="text-xs text-stone-600 mb-1">Priority</p>
                        <p className="text-sm text-stone-800">High</p>
                      </div>
                      <div>
                        <p className="text-xs text-stone-600 mb-1">Value</p>
                        <p className="text-sm text-stone-800">$15,000</p>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="bg-white rounded-lg border border-stone-200 p-6">
                    <h3 className="font-semibold text-stone-800 mb-4">Description</h3>
                    <p className="text-sm text-stone-600 leading-relaxed">
                      This is a detailed description of the record. It contains comprehensive information
                      about the item, including relevant context, background information, and any special
                      notes that are important for understanding the full picture.
                    </p>
                  </div>

                  {/* Related Items */}
                  <div className="bg-white rounded-lg border border-stone-200 p-6">
                    <h3 className="font-semibold text-stone-800 mb-4">Related Items</h3>
                    <div className="space-y-2">
                      {['Related Item 1', 'Related Item 2', 'Related Item 3'].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg hover:bg-stone-100 cursor-pointer">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-stone-200 flex items-center justify-center">
                              <FileText className="w-4 h-4 text-stone-600" />
                            </div>
                            <span className="text-sm text-stone-800">{item}</span>
                          </div>
                          <BonsaiStatusPill status="active" label="Active" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'activity' && (
                <div className="bg-white rounded-lg border border-stone-200 p-6">
                  <BonsaiTimeline
                    items={[
                      {
                        id: '1',
                        title: 'Status changed to Active',
                        description: 'Record status was updated',
                        timestamp: '2 hours ago',
                        user: { name: 'John Doe' },
                      },
                      {
                        id: '2',
                        title: 'Document uploaded',
                        description: 'contract.pdf was added',
                        timestamp: '1 day ago',
                        user: { name: 'Jane Smith' },
                      },
                      {
                        id: '3',
                        title: 'Record created',
                        description: 'Initial record created',
                        timestamp: '3 days ago',
                        user: { name: 'John Doe' },
                      },
                      {
                        id: '4',
                        title: 'Meeting scheduled',
                        description: 'Follow-up meeting set for Jan 15',
                        timestamp: '4 days ago',
                        user: { name: 'Mike Johnson' },
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
                        name: 'contract.pdf',
                        type: 'application/pdf',
                        size: '2.4 MB',
                        uploadedAt: 'Jan 5, 2026',
                        uploadedBy: 'John Doe',
                      },
                      {
                        id: '2',
                        name: 'proposal.docx',
                        type: 'application/msword',
                        size: '1.2 MB',
                        uploadedAt: 'Jan 3, 2026',
                        uploadedBy: 'Jane Smith',
                      },
                      {
                        id: '3',
                        name: 'invoice.pdf',
                        type: 'application/pdf',
                        size: '456 KB',
                        uploadedAt: 'Jan 2, 2026',
                        uploadedBy: 'Mike Johnson',
                      },
                    ]}
                    onDownload={(doc) => console.log('Download:', doc)}
                    onDelete={(doc) => console.log('Delete:', doc)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Assistant Panel */}
        <AIAssistantPanel 
          collapsed={aiPanelCollapsed}
          onToggle={() => setAiPanelCollapsed(!aiPanelCollapsed)}
        />
      </div>
      
      <TemplateInfoPanel
        templateName="T-04 Detail Page"
        features={[
          'AI Assistant side panel (collapsible)',
          'Tabbed interface (Overview, Activity, Documents)',
          'Module-specific custom tabs',
          'Full record details',
          'Timeline activity feed',
          'Document management',
          'Related records section'
        ]}
      />
    </>
  );
}