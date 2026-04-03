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
      case 'Urgent': return 'bg-red-100 text-red-700';
      case 'High': return 'bg-orange-100 text-orange-700';
      case 'Medium': return 'bg-blue-100 text-blue-700';
      case 'Low': return 'bg-stone-100 text-stone-700';
      default: return 'bg-stone-100 text-stone-700';
    }
  };

  return (
    <div className="p-8">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-stone-600 hover:text-stone-800 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Requests
      </button>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h1 className="text-2xl font-semibold text-stone-800 mb-2">{request.title}</h1>
            <div className="flex items-center gap-3 text-sm text-stone-600">
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

      {/* Status Flow */}
      <div className="bg-white rounded-lg border border-stone-200 p-6 mb-6">
        <h3 className="font-semibold text-stone-800 mb-4">Request Status Flow</h3>
        <div className="flex items-center gap-2">
          <div className={`flex-1 text-center p-3 rounded-lg ${request.status === 'New' ? 'bg-primary text-white' : 'bg-stone-100 text-stone-600'}`}>
            <p className="text-xs font-medium">New</p>
          </div>
          <div className="w-8 h-0.5 bg-stone-300"></div>
          <div className={`flex-1 text-center p-3 rounded-lg ${request.status === 'In Review' ? 'bg-primary text-white' : request.status !== 'New' ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-600'}`}>
            <p className="text-xs font-medium">In Review</p>
          </div>
          <div className="w-8 h-0.5 bg-stone-300"></div>
          <div className={`flex-1 text-center p-3 rounded-lg ${request.status === 'Approved' ? 'bg-primary text-white' : ['In Progress', 'Completed'].includes(request.status) ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-600'}`}>
            <p className="text-xs font-medium">Approved</p>
          </div>
          <div className="w-8 h-0.5 bg-stone-300"></div>
          <div className={`flex-1 text-center p-3 rounded-lg ${request.status === 'In Progress' ? 'bg-primary text-white' : request.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-600'}`}>
            <p className="text-xs font-medium">In Progress</p>
          </div>
          <div className="w-8 h-0.5 bg-stone-300"></div>
          <div className={`flex-1 text-center p-3 rounded-lg ${request.status === 'Completed' ? 'bg-green-600 text-white' : request.status === 'Rejected' ? 'bg-red-600 text-white' : 'bg-stone-100 text-stone-600'}`}>
            <p className="text-xs font-medium">{request.status === 'Rejected' ? 'Rejected' : 'Completed'}</p>
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
            <div className="bg-white rounded-lg border border-stone-200 p-6">
              <h3 className="font-semibold text-stone-800 mb-4">Request Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-stone-600 mb-1">Request Type</p>
                  <p className="text-sm font-medium text-stone-800">{request.type}</p>
                </div>
                <div>
                  <p className="text-xs text-stone-600 mb-1">Priority</p>
                  <p className="text-sm font-medium text-stone-800">{request.priority}</p>
                </div>
                <div>
                  <p className="text-xs text-stone-600 mb-1">Submitted By</p>
                  <p className="text-sm font-medium text-stone-800">{request.submittedBy}</p>
                </div>
                <div>
                  <p className="text-xs text-stone-600 mb-1">Submitted Date</p>
                  <p className="text-sm font-medium text-stone-800">{request.submittedDate}</p>
                </div>
                <div>
                  <p className="text-xs text-stone-600 mb-1">Assigned To</p>
                  <p className="text-sm font-medium text-stone-800">John Doe</p>
                </div>
                <div>
                  <p className="text-xs text-stone-600 mb-1">Expected Completion</p>
                  <p className="text-sm font-medium text-stone-800">Feb 15, 2026</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-stone-200 p-6">
              <h3 className="font-semibold text-stone-800 mb-4">Description</h3>
              <p className="text-sm text-stone-700 leading-relaxed">
                We need a complete redesign of our corporate website. The current site is outdated and not mobile-responsive. 
                Looking for a modern, clean design that showcases our products and services effectively. 
                Must include improved user experience, faster load times, and better SEO optimization.
              </p>
            </div>

            <div className="bg-white rounded-lg border border-stone-200 p-6">
              <h3 className="font-semibold text-stone-800 mb-4">Requirements</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-stone-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0"></span>
                  <span>Responsive design for mobile, tablet, and desktop</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-stone-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0"></span>
                  <span>Content management system integration</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-stone-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0"></span>
                  <span>SEO optimization</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-stone-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0"></span>
                  <span>Contact form and newsletter signup</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-stone-700">
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
            <div className="flex items-center justify-between bg-white rounded-lg border border-stone-200 p-4">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-stone-600" />
                <span className="text-sm font-medium text-stone-800">Show Internal Notes</span>
                <span className="text-xs text-stone-500">(Only visible to team)</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showInternalNotes}
                  onChange={(e) => setShowInternalNotes(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            {/* Conversation Thread */}
            <div className="bg-white rounded-lg border border-stone-200 p-6 space-y-4">
              {filteredMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-4 rounded-lg ${
                    msg.isInternal
                      ? 'bg-amber-50 border border-amber-200'
                      : 'bg-stone-50'
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
                        <p className="text-sm font-medium text-stone-800">{msg.author}</p>
                        <p className="text-xs text-stone-500">{msg.role}</p>
                      </div>
                      {msg.isInternal && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-amber-200 text-amber-800 flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          Internal
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-stone-500">{msg.timestamp}</span>
                  </div>
                  <p className="text-sm text-stone-700">{msg.message}</p>
                </div>
              ))}
            </div>

            {/* New Message */}
            <div className="bg-white rounded-lg border border-stone-200 p-4">
              <div className="mb-3 flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="messageType"
                    checked={!isInternal}
                    onChange={() => setIsInternal(false)}
                    className="w-4 h-4 text-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4 text-stone-600" />
                    <span className="text-sm text-stone-700">Client Message</span>
                  </div>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="messageType"
                    checked={isInternal}
                    onChange={() => setIsInternal(true)}
                    className="w-4 h-4 text-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <div className="flex items-center gap-1">
                    <Lock className="w-4 h-4 text-stone-600" />
                    <span className="text-sm text-stone-700">Internal Note</span>
                  </div>
                </label>
              </div>
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                rows={4}
                placeholder={isInternal ? "Add internal note (only visible to team)..." : "Reply to client..."}
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none mb-3"
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
              <h3 className="font-semibold text-stone-800">Attached Documents</h3>
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
          <div className="bg-white rounded-lg border border-stone-200">
            <div className="p-4 border-b border-stone-200">
              <h3 className="font-semibold text-stone-800">Activity Log</h3>
            </div>
            <div className="divide-y divide-stone-200">
              {auditLog.map((log, idx) => (
                <div key={idx} className="p-4 flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-stone-800">{log.action}</p>
                    <p className="text-xs text-stone-500 mt-1">by {log.user}</p>
                  </div>
                  <span className="text-xs text-stone-500">{log.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
