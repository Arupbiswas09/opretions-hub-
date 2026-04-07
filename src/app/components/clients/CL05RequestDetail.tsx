import React, { useState } from 'react';
import { ArrowLeft, MessageSquare, Lock, Eye } from 'lucide-react';
import { BonsaiButton } from '../bonsai/BonsaiButton';
import { BonsaiTabs } from '../bonsai/BonsaiTabs';
import { BonsaiStatusPill } from '../bonsai/BonsaiStatusPill';
import { BonsaiDocumentList } from '../bonsai/BonsaiFileUpload';

interface Request {
  id: string;
  title: string;
  type: string;
  status: string;
  submittedBy: string;
  submittedDate: string;
  priority: string;
}

interface CL05RequestDetailProps {
  request: Request;
  onBack: () => void;
}

export function CL05RequestDetail({ request, onBack }: CL05RequestDetailProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [showInternalNotes, setShowInternalNotes] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);

  const tabs = [
    { label: 'Overview', value: 'overview' },
    { label: 'Conversation', value: 'conversation' },
    { label: 'Documents', value: 'documents' },
    { label: 'Audit', value: 'audit' },
  ];

  const conversationMessages = [
    {
      id: '1',
      author: 'Jennifer Davis',
      role: 'Client',
      message: 'We need a complete redesign of our website. Looking for modern, responsive design with improved UX.',
      timestamp: 'Jan 5, 2026, 10:30 AM',
      isInternal: false,
    },
    {
      id: '2',
      author: 'John Doe',
      role: 'Account Manager',
      message: 'Internal note: Client has budget of $45k. High priority, wants to start ASAP.',
      timestamp: 'Jan 5, 2026, 11:15 AM',
      isInternal: true,
    },
    {
      id: '3',
      author: 'John Doe',
      role: 'Account Manager',
      message: 'Thanks for submitting this request! I\'ve reviewed your requirements and we can definitely help. I\'ll schedule a discovery call for next week.',
      timestamp: 'Jan 5, 2026, 2:00 PM',
      isInternal: false,
    },
    {
      id: '4',
      author: 'Jennifer Davis',
      role: 'Client',
      message: 'Perfect! Looking forward to it. Can you also include mobile app design in the scope?',
      timestamp: 'Jan 6, 2026, 9:00 AM',
      isInternal: false,
    },
    {
      id: '5',
      author: 'Sarah Wilson',
      role: 'Design Lead',
      message: 'Internal: Mobile app would add 2-3 weeks and ~$15k to the project.',
      timestamp: 'Jan 6, 2026, 10:30 AM',
      isInternal: true,
    },
  ];

  const filteredMessages = showInternalNotes 
    ? conversationMessages 
    : conversationMessages.filter(m => !m.isInternal);

  const auditLog = [
    { action: 'Request created', user: 'Jennifer Davis (Client)', timestamp: 'Jan 5, 2026, 10:30 AM' },
    { action: 'Status changed to In Review', user: 'System', timestamp: 'Jan 5, 2026, 10:31 AM' },
    { action: 'Internal note added', user: 'John Doe', timestamp: 'Jan 5, 2026, 11:15 AM' },
    { action: 'Response sent to client', user: 'John Doe', timestamp: 'Jan 5, 2026, 2:00 PM' },
    { action: 'Status changed to Approved', user: 'John Doe', timestamp: 'Jan 6, 2026, 3:00 PM' },
    { action: 'Status changed to In Progress', user: 'System', timestamp: 'Jan 7, 2026, 9:00 AM' },
  ];

  const getStatusColor = (status: string): 'active' | 'pending' | 'inactive' | 'archived' => {
    switch (status) {
      case 'Completed': return 'active';
      case 'In Progress': case 'Approved': return 'pending';
      case 'Rejected': return 'inactive';
      default: return 'archived';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'bg-destructive/10 text-destructive border border-destructive/20';
      case 'High': return 'bg-primary/10 text-primary border border-primary/20';
      case 'Medium': return 'bg-muted/60 text-foreground border border-border';
      case 'Low': return 'bg-muted/40 text-muted-foreground border border-border';
      default: return 'bg-muted/60 text-foreground border border-border';
    }
  };

  return (
    <div className="px-3 py-6 sm:p-8">
      {/* Back Button */}
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Requests
      </button>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h1 className="text-2xl font-semibold text-foreground mb-1">{request.title}</h1>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>{request.type}</span>
              <span>•</span>
              <span>Submitted by {request.submittedBy}</span>
              <span>•</span>
              <span>{request.submittedDate}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 text-xs font-medium rounded-full ${getPriorityColor(request.priority)}`}>
              {request.priority} Priority
            </span>
            <BonsaiStatusPill
              status={getStatusColor(request.status)}
              label={request.status}
            />
          </div>
        </div>
      </div>

      {/* Status (compact) */}
      <div className="hub-surface rounded-lg p-5 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Status</p>
            <div className="flex items-center gap-2">
              <BonsaiStatusPill status={getStatusColor(request.status)} label={request.status} />
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Priority</p>
            <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getPriorityColor(request.priority)}`}>
              {request.priority}
            </span>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Owner</p>
            <p className="text-sm text-foreground">John Doe</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Next step</p>
            <p className="text-sm text-foreground">Discovery call</p>
          </div>
          <div className="sm:text-right">
            <p className="text-xs text-muted-foreground mb-1">ETA</p>
            <p className="text-sm text-foreground">Feb 15, 2026</p>
          </div>
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
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="hub-surface rounded-lg p-6">
              <h3 className="font-semibold text-foreground mb-4">Request details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Request type</p>
                  <p className="text-sm font-medium text-foreground">{request.type}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Priority</p>
                  <p className="text-sm font-medium text-foreground">{request.priority}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Submitted by</p>
                  <p className="text-sm font-medium text-foreground">{request.submittedBy}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Submitted</p>
                  <p className="text-sm font-medium text-foreground">{request.submittedDate}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Assigned to</p>
                  <p className="text-sm font-medium text-foreground">John Doe</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Expected completion</p>
                  <p className="text-sm font-medium text-foreground">Feb 15, 2026</p>
                </div>
              </div>
            </div>

            <div className="hub-surface rounded-lg p-6">
              <h3 className="font-semibold text-foreground mb-3">Description</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We need a complete redesign of our corporate website. The current site is outdated and not mobile-responsive. 
                Looking for a modern, clean design that showcases our products and services effectively. 
                Must include improved user experience, faster load times, and better SEO optimization.
              </p>
            </div>

            <div className="hub-surface rounded-lg p-6">
              <h3 className="font-semibold text-foreground mb-4">Requirements</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0"></span>
                  <span>Responsive design for mobile, tablet, and desktop</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0"></span>
                  <span>Content management system integration</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0"></span>
                  <span>SEO optimization</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0"></span>
                  <span>Contact form and newsletter signup</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0"></span>
                  <span>Integration with existing CRM system</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'conversation' && (
          <div className="space-y-4">
            {/* Internal Notes Toggle */}
            <div className="flex items-center justify-between hub-surface rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Show internal notes</span>
                <span className="text-xs text-muted-foreground">(team only)</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showInternalNotes}
                  onChange={(e) => setShowInternalNotes(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            {/* Conversation Thread */}
            <div className="hub-surface rounded-lg p-6 space-y-4 max-h-[55vh] overflow-y-auto pr-2">
              {filteredMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-4 rounded-lg ${
                    msg.isInternal
                      ? 'bg-muted/50 border border-border'
                      : 'bg-muted/25'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-green-600 flex items-center justify-center">
                        <span className="text-xs font-semibold text-white">
                          {msg.author.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{msg.author}</p>
                        <p className="text-xs text-muted-foreground">{msg.role}</p>
                      </div>
                      {msg.isInternal && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-muted text-muted-foreground border border-border flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          Internal
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{msg.timestamp}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{msg.message}</p>
                </div>
              ))}
            </div>

            {/* New Message */}
            <div className="hub-surface rounded-lg p-4">
              <div className="mb-3 flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="messageType"
                    checked={!isInternal}
                    onChange={() => setIsInternal(false)}
                    className="w-4 h-4 text-primary focus:ring-2 focus:ring-ring/30"
                  />
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">Client message</span>
                  </div>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="messageType"
                    checked={isInternal}
                    onChange={() => setIsInternal(true)}
                    className="w-4 h-4 text-primary focus:ring-2 focus:ring-ring/30"
                  />
                  <div className="flex items-center gap-1">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">Internal note</span>
                  </div>
                </label>
              </div>
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                rows={4}
                placeholder={isInternal ? "Add internal note (only visible to team)..." : "Reply to client..."}
                className="hub-field px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none mb-3"
              />
              <div className="flex items-center justify-end">
                <BonsaiButton size="sm" icon={<MessageSquare />}>
                  {isInternal ? 'Add Internal Note' : 'Send Reply'}
                </BonsaiButton>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Attached documents</h3>
              <BonsaiButton size="sm">Upload Document</BonsaiButton>
            </div>
            <BonsaiDocumentList
              documents={[
                {
                  id: '1',
                  name: 'website-requirements.pdf',
                  type: 'application/pdf',
                  size: '2.4 MB',
                  uploadedAt: 'Jan 5, 2026',
                  uploadedBy: 'Jennifer Davis',
                },
                {
                  id: '2',
                  name: 'brand-guidelines.pdf',
                  type: 'application/pdf',
                  size: '5.1 MB',
                  uploadedAt: 'Jan 5, 2026',
                  uploadedBy: 'Jennifer Davis',
                },
                {
                  id: '3',
                  name: 'proposal-draft.docx',
                  type: 'application/msword',
                  size: '156 KB',
                  uploadedAt: 'Jan 6, 2026',
                  uploadedBy: 'John Doe',
                },
              ]}
              onDownload={(doc) => console.log('Download:', doc)}
              onDelete={(doc) => console.log('Delete:', doc)}
            />
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="hub-surface overflow-hidden rounded-lg">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-foreground">Activity log</h3>
            </div>
            <div className="divide-y divide-border">
              {auditLog.map((log, idx) => (
                <div key={idx} className="p-4 flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{log.action}</p>
                    <p className="text-xs text-muted-foreground mt-1">by {log.user}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{log.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
