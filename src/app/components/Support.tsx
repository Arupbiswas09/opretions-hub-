'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, List, Columns3, MessageSquare } from 'lucide-react';
import { BonsaiButton } from './bonsai/BonsaiButton';
import { BonsaiStatusPill } from './bonsai/BonsaiStatusPill';
import { BonsaiTabs } from './bonsai/BonsaiTabs';
import { BonsaiTimeline } from './bonsai/BonsaiTimeline';
import { ModuleSubNav, moduleSubNavButtonClass, ModuleSubNavDivider } from './ui/ModuleSubNav';
import { HubStatTile } from './ops/HubStatTile';

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

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-destructive/15 text-destructive';
      case 'Medium': return 'bg-warning/15 text-warning';
      case 'Low': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="p-8 max-w-[1120px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Support Tickets</h1>
          <p className="text-sm text-muted-foreground">Manage customer support requests</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hub-surface hub-surface-elevated flex items-center gap-1 p-1">
            <button
              type="button"
              onClick={() => onViewModeChange('list')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:bg-secondary/80'}`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('kanban')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'kanban' ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:bg-secondary/80'}`}
            >
              <Columns3 className="w-4 h-4" />
            </button>
          </div>
          <BonsaiButton variant="primary" icon={<Plus />} onClick={onNewTicket}>
            New Ticket
          </BonsaiButton>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <HubStatTile label="Open" value="1" sub="Needs first response" delay={0} />
        <HubStatTile label="In progress" value="1" sub="Assigned" delay={0.04} />
        <HubStatTile label="Resolved" value="1" sub="Last 7 days" delay={0.08} />
        <HubStatTile label="Avg response" value="2.5h" sub="Rolling 30d" delay={0.12} />
      </div>

      {viewMode === 'list' ? (
        <div className="hub-surface hub-surface-elevated overflow-hidden">
          <div className="divide-y divide-border">
            {tickets.map((ticket) => (
              <button
                key={ticket.id}
                type="button"
                onClick={() => onTicketClick(ticket)}
                className="w-full p-4 hover:bg-[color:var(--row-hover-bg)] transition-colors text-left"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-secondary border border-border">
                      <MessageSquare className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-muted-foreground">{ticket.number}</span>
                        <span className="text-muted-foreground">•</span>
                        <h3 className="font-medium text-foreground truncate">{ticket.subject}</h3>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                        <span>{ticket.submitter}</span>
                        <span>Assigned to {ticket.assignee}</span>
                        <span>{ticket.created}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityClass(ticket.priority)}`}>
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
        <div className="hub-surface hub-surface-elevated text-center py-12 px-4">
          <p className="text-muted-foreground mb-2">Kanban view groups tickets by status</p>
          <p className="text-sm text-muted-foreground/80">Open · In progress · Resolved · Closed</p>
        </div>
      )}
    </div>
  );
}

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

  const priorityClass = ticket.priority === 'High'
    ? 'bg-destructive/15 text-destructive'
    : ticket.priority === 'Medium'
      ? 'bg-warning/15 text-warning'
      : 'bg-muted text-muted-foreground';

  return (
    <div className="p-8 max-w-[1120px] mx-auto">
      <button type="button" onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        ← Back to Tickets
      </button>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="text-2xl font-semibold text-foreground">{ticket.number}</h1>
            <BonsaiStatusPill status="pending" label={ticket.status} />
            <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${priorityClass}`}>
              {ticket.priority} priority
            </span>
          </div>
          <h2 className="text-lg text-foreground/90 mb-2">{ticket.subject}</h2>
          <p className="text-sm text-muted-foreground">Submitted by {ticket.submitter} · {ticket.created}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <BonsaiButton variant="ghost" size="sm">Assign</BonsaiButton>
          <BonsaiButton variant="primary" size="sm">Mark Resolved</BonsaiButton>
        </div>
      </div>

      <BonsaiTabs tabs={tabs} value={activeTab} onValueChange={setActiveTab} />

      <div className="mt-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="hub-surface hub-surface-elevated p-6">
              <h3 className="font-semibold text-foreground mb-4">Ticket Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Submitter</p>
                  <p className="text-sm text-foreground">{ticket.submitter}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Assignee</p>
                  <p className="text-sm text-foreground">{ticket.assignee}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Priority</p>
                  <p className="text-sm text-foreground">{ticket.priority}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <p className="text-sm text-foreground">{ticket.status}</p>
                </div>
              </div>
            </div>

            <div className="hub-surface hub-surface-elevated p-6">
              <h3 className="font-semibold text-foreground mb-4">Description</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                I&apos;m unable to access the shared project files for the Website Redesign project.
                When I try to open the folder, I get an &quot;Access Denied&quot; error. This is blocking
                my work on the homepage designs.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'conversation' && (
          <div className="space-y-4">
            <div className="hub-surface hub-surface-elevated p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-primary-foreground text-sm font-semibold shrink-0">
                  SJ
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-foreground">Sarah Johnson</span>
                    <span className="text-xs text-muted-foreground">2 hours ago</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    I&apos;m unable to access the shared project files for the Website Redesign project.
                  </p>
                </div>
              </div>
            </div>

            <div className="hub-surface hub-surface-elevated p-4">
              <textarea
                rows={3}
                placeholder="Add a reply..."
                className="w-full px-3 py-2 rounded-lg text-sm resize-none mb-2 bg-input-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
              <BonsaiButton size="sm">Send Reply</BonsaiButton>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="hub-surface hub-surface-elevated p-6">
            <BonsaiTimeline items={activityItems} />
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="hub-surface hub-surface-elevated p-6 text-center text-muted-foreground">
            No documents attached
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="hub-surface hub-surface-elevated p-6">
            <p className="text-sm text-muted-foreground">Audit log of all changes and actions</p>
          </div>
        )}
      </div>
    </div>
  );
}

function NewTicketModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="presentation">
      <div className="absolute inset-0 hub-overlay-backdrop" aria-hidden onClick={onClose} />
      <div
        className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl border border-border hub-modal-solid max-h-[min(90vh,720px)] flex flex-col shadow-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="shrink-0 border-b border-border bg-background-2 px-6 py-4">
          <h2 className="text-xl font-semibold text-foreground">Create Support Ticket</h2>
          <p className="text-sm text-muted-foreground">Submit a new support request</p>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-background-2 p-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Subject *</label>
            <input
              type="text"
              placeholder="Brief description of the issue"
              className="w-full px-3 py-2 rounded-lg text-sm bg-input-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Priority</label>
              <select className="w-full px-3 py-2 rounded-lg text-sm bg-input-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30">
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Category</label>
              <select className="w-full px-3 py-2 rounded-lg text-sm bg-input-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30">
                <option>Technical Issue</option>
                <option>Access Request</option>
                <option>Feature Request</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Description *</label>
            <textarea
              rows={6}
              placeholder="Provide detailed information about your request..."
              className="w-full px-3 py-2 rounded-lg text-sm resize-none bg-input-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-border bg-background-2 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              alert('Support ticket created!');
              onClose();
            }}
            className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            Create Ticket
          </button>
        </div>
      </div>
    </div>
  );
}
