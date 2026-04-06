'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, List, Columns3, MessageSquare, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { BonsaiButton } from './bonsai/BonsaiButton';
import { BonsaiStatusPill } from './bonsai/BonsaiStatusPill';
import { BonsaiTabs } from './bonsai/BonsaiTabs';
import { BonsaiTimeline } from './bonsai/BonsaiTimeline';
import { ModuleSubNav, moduleSubNavButtonClass, ModuleSubNavDivider } from './ui/ModuleSubNav';

type Screen = 'list' | 'detail';

export default function Support() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('list');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);

  return (
    <div className="min-h-full">
      <ModuleSubNav>
        {([{ id: 'list', label: 'All Tickets' }, { id: 'detail', label: 'Detail' }] as const).map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => {
              if (s.id === 'detail' && !selectedTicket) setSelectedTicket({ id: '1', number: 'TKT-1234', subject: 'Cannot access project files', status: 'Open', priority: 'High', submitter: 'Sarah Johnson', assignee: 'Support Team', created: '2 hours ago' });
              setCurrentScreen(s.id);
            }}
            className={moduleSubNavButtonClass(currentScreen === s.id)}
          >
            {s.label}
          </button>
        ))}
        <ModuleSubNavDivider />
        <button type="button" onClick={() => setShowNewTicket(true)} className={moduleSubNavButtonClass(false)}>+ Ticket</button>
      </ModuleSubNav>

      <AnimatePresence mode="wait">
        <motion.div key={currentScreen} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.25, ease: 'easeOut' }}>
          {currentScreen === 'list' && <TicketsList viewMode={viewMode} onViewModeChange={setViewMode} onTicketClick={(t) => { setSelectedTicket(t); setCurrentScreen('detail'); }} onNewTicket={() => setShowNewTicket(true)} />}
          {currentScreen === 'detail' && selectedTicket && <TicketDetail ticket={selectedTicket} onBack={() => setCurrentScreen('list')} />}
        </motion.div>
      </AnimatePresence>

      {showNewTicket && <NewTicketModal onClose={() => setShowNewTicket(false)} />}
    </div>
  );
}

// SU-01: Tickets List
function TicketsList({ viewMode, onViewModeChange, onTicketClick, onNewTicket }: any) {
  const tickets = [
    {
      id: '1',
      number: 'TKT-1234',
      subject: 'Cannot access project files',
      status: 'Open',
      priority: 'High',
      submitter: 'Sarah Johnson',
      assignee: 'Support Team',
      created: '2 hours ago',
    },
    {
      id: '2',
      number: 'TKT-1233',
      subject: 'Invoice payment not reflected',
      status: 'In Progress',
      priority: 'Medium',
      submitter: 'Mike Chen',
      assignee: 'John Doe',
      created: '5 hours ago',
    },
    {
      id: '3',
      number: 'TKT-1232',
      subject: 'Need help with timesheet submission',
      status: 'Resolved',
      priority: 'Low',
      submitter: 'Jane Smith',
      assignee: 'Support Team',
      created: '1 day ago',
    },
  ];

  const getStatusColor = (status: string): 'active' | 'pending' | 'draft' | 'completed' | 'cancelled' | 'overdue' | 'inProgress' => {
    switch (status) {
      case 'Open': return 'pending';
      case 'In Progress': return 'inProgress';
      case 'Resolved': return 'completed';
      case 'Closed': return 'draft';
      default: return 'pending';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-stone-100 text-stone-700';
      case 'Medium': return 'bg-stone-100 text-stone-600';
      case 'Low': return 'bg-stone-100 text-stone-600';
      default: return 'bg-stone-100 text-stone-700';
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-stone-800">Support Tickets</h1>
          <p className="text-sm text-stone-500">Manage customer support requests</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-white border border-stone-200 rounded-lg p-1">
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary/10 text-primary' : 'text-stone-600 hover:bg-stone-100'}`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('kanban')}
              className={`p-2 rounded ${viewMode === 'kanban' ? 'bg-primary/10 text-primary' : 'text-stone-600 hover:bg-stone-100'}`}
            >
              <Columns3 className="w-4 h-4" />
            </button>
          </div>
          <BonsaiButton variant="primary" icon={<Plus />} onClick={onNewTicket}>
            New Ticket
          </BonsaiButton>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-stone-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-stone-600">Open</p>
            <AlertCircle className="w-5 h-5 text-stone-600" />
          </div>
          <p className="text-2xl font-semibold text-stone-600">1</p>
        </div>
        <div className="bg-white rounded-lg border border-stone-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-stone-600">In Progress</p>
            <Clock className="w-5 h-5 text-stone-600" />
          </div>
          <p className="text-2xl font-semibold text-stone-600">1</p>
        </div>
        <div className="bg-white rounded-lg border border-stone-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-stone-600">Resolved</p>
            <CheckCircle className="w-5 h-5 text-stone-600" />
          </div>
          <p className="text-2xl font-semibold text-stone-600">1</p>
        </div>
        <div className="bg-white rounded-lg border border-stone-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-stone-600">Avg Response</p>
            <Clock className="w-5 h-5 text-primary" />
          </div>
          <p className="text-2xl font-semibold text-stone-800">2.5h</p>
        </div>
      </div>

      {/* Tickets */}
      {viewMode === 'list' ? (
        <div className="bg-white rounded-lg border border-stone-200">
          <div className="divide-y divide-stone-200">
            {tickets.map((ticket) => (
              <button
                key={ticket.id}
                onClick={() => onTicketClick(ticket)}
                className="w-full p-4 hover:bg-stone-50 transition-colors text-left"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 rounded-lg bg-stone-100 flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-stone-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-stone-600">{ticket.number}</span>
                        <span className="text-sm text-stone-500">•</span>
                        <h3 className="font-medium text-stone-800">{ticket.subject}</h3>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-stone-600">
                        <span>{ticket.submitter}</span>
                        <span>•</span>
                        <span>Assigned to {ticket.assignee}</span>
                        <span>•</span>
                        <span>{ticket.created}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                    <BonsaiStatusPill status={getStatusColor(ticket.status)} label={ticket.status} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border border-stone-200">
          <p className="text-stone-600 mb-2">Kanban view groups tickets by status</p>
          <p className="text-sm text-stone-500">(Open / In Progress / Resolved / Closed columns)</p>
        </div>
      )}
    </div>
  );
}

// SU-02: Ticket Detail
function TicketDetail({ ticket, onBack }: any) {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { label: 'Overview', value: 'overview' },
    { label: 'Conversation', value: 'conversation' },
    { label: 'Documents', value: 'documents' },
    { label: 'Activity', value: 'activity' },
    { label: 'Audit', value: 'audit' },
  ];

  const activityItems = [
    { id: '1', title: 'Ticket created', description: 'Sarah Johnson submitted ticket', timestamp: '2 hours ago', user: { name: 'Sarah Johnson' } },
    { id: '2', title: 'Assigned to support', description: 'Auto-assigned to Support Team', timestamp: '2 hours ago', user: { name: 'System' } },
  ];

  return (
    <div className="p-8">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-stone-600 hover:text-stone-800 mb-6">
        ← Back to Tickets
      </button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-semibold text-stone-800">{ticket.number}</h1>
            <BonsaiStatusPill status="pending" label={ticket.status} />
            <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-stone-100 text-stone-700">
              {ticket.priority} Priority
            </span>
          </div>
          <h2 className="text-lg text-stone-700 mb-2">{ticket.subject}</h2>
          <p className="text-sm text-stone-500">Submitted by {ticket.submitter} • {ticket.created}</p>
        </div>
        <div className="flex items-center gap-2">
          <BonsaiButton variant="ghost" size="sm">Assign</BonsaiButton>
          <BonsaiButton variant="primary" size="sm">Mark Resolved</BonsaiButton>
        </div>
      </div>

      <BonsaiTabs tabs={tabs} value={activeTab} onValueChange={setActiveTab} />

      <div className="mt-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-stone-200 p-6">
              <h3 className="font-semibold text-stone-800 mb-4">Ticket Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-stone-600 mb-1">Submitter</p>
                  <p className="text-sm text-stone-800">{ticket.submitter}</p>
                </div>
                <div>
                  <p className="text-xs text-stone-600 mb-1">Assignee</p>
                  <p className="text-sm text-stone-800">{ticket.assignee}</p>
                </div>
                <div>
                  <p className="text-xs text-stone-600 mb-1">Priority</p>
                  <p className="text-sm text-stone-800">{ticket.priority}</p>
                </div>
                <div>
                  <p className="text-xs text-stone-600 mb-1">Status</p>
                  <p className="text-sm text-stone-800">{ticket.status}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-stone-200 p-6">
              <h3 className="font-semibold text-stone-800 mb-4">Description</h3>
              <p className="text-sm text-stone-700">
                I'm unable to access the shared project files for the Website Redesign project. 
                When I try to open the folder, I get an "Access Denied" error. This is blocking 
                my work on the homepage designs.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'conversation' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg border border-stone-200 p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-green-600 flex items-center justify-center text-white text-sm font-semibold">
                  SJ
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-stone-800">Sarah Johnson</span>
                    <span className="text-xs text-stone-500">2 hours ago</span>
                  </div>
                  <p className="text-sm text-stone-700">
                    I'm unable to access the shared project files for the Website Redesign project.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-stone-200 p-4">
              <textarea
                rows={3}
                placeholder="Add a reply..."
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none mb-2"
              />
              <BonsaiButton size="sm">Send Reply</BonsaiButton>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="bg-white rounded-lg border border-stone-200 p-6">
            <BonsaiTimeline items={activityItems} />
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="bg-white rounded-lg border border-stone-200 p-6 text-center text-stone-600">
            No documents attached
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="bg-white rounded-lg border border-stone-200 p-6">
            <p className="text-sm text-stone-600">Audit log of all changes and actions</p>
          </div>
        )}
      </div>
    </div>
  );
}

// SU-03: New Ticket Modal
function NewTicketModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl">
        <div className="px-6 py-4 border-b border-stone-200">
          <h2 className="text-xl font-semibold text-stone-800">Create Support Ticket</h2>
          <p className="text-sm text-stone-500">Submit a new support request</p>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Subject *</label>
            <input
              type="text"
              placeholder="Brief description of the issue"
              className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Priority</label>
              <select className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm">
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Category</label>
              <select className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm">
                <option>Technical Issue</option>
                <option>Access Request</option>
                <option>Feature Request</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Description *</label>
            <textarea
              rows={6}
              placeholder="Provide detailed information about your request..."
              className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-stone-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              alert('Support ticket created!');
              onClose();
            }}
            className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Create Ticket
          </button>
        </div>
      </div>
    </div>
  );
}