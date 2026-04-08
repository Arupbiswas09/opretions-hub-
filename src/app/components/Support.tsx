'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, List, Columns3, MessageSquare, X } from 'lucide-react';
import { BonsaiButton } from './bonsai/BonsaiButton';
import { BonsaiStatusPill } from './bonsai/BonsaiStatusPill';
import { BonsaiTabs } from './bonsai/BonsaiTabs';
import { BonsaiTimeline } from './bonsai/BonsaiTimeline';
import { ModuleSubNav, moduleSubNavButtonClass, ModuleSubNavDivider } from './ui/ModuleSubNav';
import { HubStatTile } from './ops/HubStatTile';
import { useHubDataInvalidation } from '../lib/hub/use-data-invalidation';
import { dispatchDataInvalidation } from '../lib/hub-events';
import { useToast } from './bonsai/ToastSystem';

type Screen = 'list' | 'detail';

interface Ticket {
  id: string;
  number: string;
  subject: string;
  description: string | null;
  status: string;
  priority: string;
  submitter: string;
  assignee: string;
  created: string;
  created_at_iso: string;
}

function formatRelative(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    const t = new Date(iso).getTime();
    const diff = Date.now() - t;
    const h = Math.floor(diff / 3600000);
    if (h < 1) return 'Just now';
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    if (d < 7) return `${d}d ago`;
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return '—';
  }
}

export default function Support() {
  const refresh = useHubDataInvalidation('support_tickets', 'all');
  const [currentScreen, setCurrentScreen] = useState<Screen>('list');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  return (
    <div className="min-h-full">
      <ModuleSubNav>
        {([{ id: 'list', label: 'All Tickets' }, { id: 'detail', label: 'Detail' }] as const).map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => {
              if (s.id === 'detail' && !selectedTicket) return;
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
        <motion.div key={currentScreen} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4, pointerEvents: 'none' }} transition={{ duration: 0.25, ease: 'easeOut' }}>
          {currentScreen === 'list' && (
            <TicketsList
              refreshVersion={refresh}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onTicketClick={(t) => { setSelectedTicket(t); setCurrentScreen('detail'); }}
              onNewTicket={() => setShowNewTicket(true)}
            />
          )}
          {currentScreen === 'detail' && selectedTicket && (
            <TicketDetail
              ticket={selectedTicket}
              onBack={() => setCurrentScreen('list')}
              onStatusChange={(newStatus) => {
                setSelectedTicket({ ...selectedTicket, status: newStatus });
              }}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {showNewTicket && (
        <NewTicketModal
          onClose={() => setShowNewTicket(false)}
          onCreated={() => {
            setShowNewTicket(false);
            dispatchDataInvalidation('support_tickets');
          }}
        />
      )}
    </div>
  );
}

function TicketsList({ refreshVersion, viewMode, onViewModeChange, onTicketClick, onNewTicket }: {
  refreshVersion: number;
  viewMode: 'list' | 'kanban';
  onViewModeChange: (m: 'list' | 'kanban') => void;
  onTicketClick: (t: Ticket) => void;
  onNewTicket: () => void;
}) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/support-tickets?limit=200', { credentials: 'include' });
      const json = await res.json();
      if (res.ok && Array.isArray(json.data)) {
        setTickets(
          json.data.map((r: Record<string, unknown>, i: number) => ({
            id: String(r.id),
            number: `TKT-${String(i + 1).padStart(4, '0')}`,
            subject: String(r.display_title ?? r.subject ?? ''),
            description: r.description != null ? String(r.description) : null,
            status: String(r.status ?? 'open'),
            priority: String(r.priority ?? 'normal'),
            submitter: String(r.requester_name ?? 'Unknown'),
            assignee: 'Support Team',
            created: formatRelative(r.created_at as string),
            created_at_iso: String(r.created_at ?? ''),
          }))
        );
      }
    } catch {
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load, refreshVersion]);

  const statusCounts = {
    open: tickets.filter(t => t.status === 'open').length,
    in_progress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
  };

  const getStatusColor = (status: string): 'active' | 'pending' | 'draft' | 'completed' | 'cancelled' | 'overdue' | 'inProgress' => {
    switch (status) {
      case 'open': return 'pending';
      case 'in_progress': return 'inProgress';
      case 'resolved': return 'completed';
      case 'closed': return 'draft';
      default: return 'pending';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return 'Open';
      case 'in_progress': return 'In Progress';
      case 'resolved': return 'Resolved';
      case 'closed': return 'Closed';
      default: return status;
    }
  };

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'high': case 'urgent': return 'bg-destructive/15 text-destructive';
      case 'normal': return 'bg-warning/15 text-warning';
      case 'low': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="w-full min-w-0 px-3 py-6 sm:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold text-foreground">Support Tickets</h1>
          <p className="text-sm text-muted-foreground">Manage customer support requests</p>
        </div>
        <div className="flex flex-shrink-0 flex-wrap items-center gap-3">
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
        <HubStatTile label="Open" value={String(statusCounts.open)} sub="Needs first response" delay={0} />
        <HubStatTile label="In progress" value={String(statusCounts.in_progress)} sub="Assigned" delay={0.04} />
        <HubStatTile label="Resolved" value={String(statusCounts.resolved)} sub="Last 7 days" delay={0.08} />
        <HubStatTile label="Total" value={String(tickets.length)} sub="All tickets" delay={0.12} />
      </div>

      {loading ? (
        <div className="hub-surface hub-surface-elevated text-center py-12">
          <p className="text-muted-foreground animate-pulse">Loading tickets…</p>
        </div>
      ) : tickets.length === 0 ? (
        <div className="hub-surface hub-surface-elevated text-center py-12 px-4">
          <MessageSquare className="w-8 h-8 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-foreground font-medium mb-1">No tickets yet</p>
          <p className="text-sm text-muted-foreground mb-4">Create your first support ticket to get started</p>
          <BonsaiButton variant="primary" icon={<Plus />} onClick={onNewTicket}>New Ticket</BonsaiButton>
        </div>
      ) : viewMode === 'list' ? (
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
                      {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                    </span>
                    <BonsaiStatusPill status={getStatusColor(ticket.status)} label={getStatusLabel(ticket.status)} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {['open', 'in_progress', 'resolved', 'closed'].map(status => {
            const col = tickets.filter(t => t.status === status);
            return (
              <div key={status} className="hub-surface hub-surface-elevated p-4 rounded-xl">
                <h3 className="text-sm font-semibold text-foreground mb-3 capitalize">{getStatusLabel(status)}</h3>
                <div className="space-y-2">
                  {col.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">No tickets</p>
                  ) : col.map(ticket => (
                    <button
                      key={ticket.id}
                      type="button"
                      onClick={() => onTicketClick(ticket)}
                      className="w-full text-left p-3 rounded-lg border border-border hover:bg-secondary/30 transition-colors"
                    >
                      <p className="text-sm font-medium text-foreground truncate">{ticket.subject}</p>
                      <p className="text-xs text-muted-foreground mt-1">{ticket.submitter} · {ticket.created}</p>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TicketDetail({ ticket, onBack, onStatusChange }: {
  ticket: Ticket;
  onBack: () => void;
  onStatusChange: (status: string) => void;
}) {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [resolving, setResolving] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  const tabs = [
    { label: 'Overview', value: 'overview' },
    { label: 'Conversation', value: 'conversation' },
    { label: 'Documents', value: 'documents' },
    { label: 'Activity', value: 'activity' },
    { label: 'Audit', value: 'audit' },
  ];

  const activityItems = [
    { id: '1', title: 'Ticket created', description: `${ticket.submitter} submitted ticket`, timestamp: ticket.created, user: { name: ticket.submitter } },
    { id: '2', title: 'Assigned to support', description: 'Auto-assigned to Support Team', timestamp: ticket.created, user: { name: 'System' } },
  ];

  const handleResolve = async () => {
    setResolving(true);
    try {
      const res = await fetch(`/api/support-tickets/${ticket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'resolved' }),
      });
      if (res.ok) {
        onStatusChange('resolved');
        addToast('Ticket marked as resolved', 'success');
        dispatchDataInvalidation('support_tickets');
      } else {
        const json = await res.json();
        addToast(json.error || 'Failed to update', 'error');
      }
    } catch {
      addToast('Network error', 'error');
    } finally {
      setResolving(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    setSendingReply(true);
    try {
      // Update ticket description to include reply (append)
      const res = await fetch(`/api/support-tickets/${ticket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          description: `${ticket.description || ''}\n\n---\nReply: ${replyText.trim()}`,
        }),
      });
      if (res.ok) {
        addToast('Reply sent', 'success');
        setReplyText('');
        dispatchDataInvalidation('support_tickets');
      } else {
        addToast('Failed to send reply', 'error');
      }
    } catch {
      addToast('Network error', 'error');
    } finally {
      setSendingReply(false);
    }
  };

  const priorityClass = ticket.priority === 'high' || ticket.priority === 'urgent'
    ? 'bg-destructive/15 text-destructive'
    : ticket.priority === 'normal'
      ? 'bg-warning/15 text-warning'
      : 'bg-muted text-muted-foreground';

  const statusLabel = ticket.status === 'in_progress' ? 'In Progress'
    : ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1);

  return (
    <div className="w-full min-w-0 px-3 py-6 sm:p-8">
      <button type="button" onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        ← Back to Tickets
      </button>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="text-2xl font-semibold text-foreground">{ticket.number}</h1>
            <BonsaiStatusPill status={ticket.status === 'resolved' ? 'completed' : 'pending'} label={statusLabel} />
            <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${priorityClass}`}>
              {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)} priority
            </span>
          </div>
          <h2 className="text-lg text-foreground/90 mb-2">{ticket.subject}</h2>
          <p className="text-sm text-muted-foreground">Submitted by {ticket.submitter} · {ticket.created}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
            <BonsaiButton
              variant="primary"
              size="sm"
              onClick={handleResolve}
              disabled={resolving}
            >
              {resolving ? 'Resolving…' : 'Mark Resolved'}
            </BonsaiButton>
          )}
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
                  <p className="text-sm text-foreground capitalize">{ticket.priority}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <p className="text-sm text-foreground capitalize">{statusLabel}</p>
                </div>
              </div>
            </div>

            <div className="hub-surface hub-surface-elevated p-6">
              <h3 className="font-semibold text-foreground mb-4">Description</h3>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {ticket.description || 'No description provided.'}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'conversation' && (
          <div className="space-y-4">
            <div className="hub-surface hub-surface-elevated p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-primary-foreground text-sm font-semibold shrink-0">
                  {ticket.submitter.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-foreground">{ticket.submitter}</span>
                    <span className="text-xs text-muted-foreground">{ticket.created}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {ticket.description || ticket.subject}
                  </p>
                </div>
              </div>
            </div>

            <div className="hub-surface hub-surface-elevated p-4">
              <textarea
                rows={3}
                placeholder="Add a reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm resize-none mb-2 bg-input-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
              <BonsaiButton size="sm" onClick={handleSendReply} disabled={sendingReply || !replyText.trim()}>
                {sendingReply ? 'Sending…' : 'Send Reply'}
              </BonsaiButton>
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

function NewTicketModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const { addToast } = useToast();
  const [subject, setSubject] = useState('');
  const [priority, setPriority] = useState('normal');
  const [category, setCategory] = useState('support');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!subject.trim()) {
      addToast('Subject is required', 'error');
      return;
    }
    if (!description.trim()) {
      addToast('Description is required', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/support-tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          subject: subject.trim(),
          description: description.trim(),
          priority,
          request_type: category,
        }),
      });
      if (res.ok) {
        addToast('Support ticket created', 'success');
        onCreated();
      } else {
        const json = await res.json();
        addToast(json.error || 'Failed to create ticket', 'error');
      }
    } catch {
      addToast('Network error', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="presentation">
      <div className="absolute inset-0 hub-overlay-backdrop" aria-hidden onClick={onClose} />
      <div
        className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl border border-border hub-modal-solid max-h-[min(90vh,720px)] flex flex-col shadow-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="shrink-0 border-b border-border bg-background-2 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Create Support Ticket</h2>
            <p className="text-sm text-muted-foreground">Submit a new support request</p>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-background-2 p-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Subject *</label>
            <input
              type="text"
              placeholder="Brief description of the issue"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm bg-input-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm bg-input-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm bg-input-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
              >
                <option value="support">Technical Issue</option>
                <option value="access">Access Request</option>
                <option value="change">Feature Request</option>
                <option value="onboarding">Onboarding</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Description *</label>
            <textarea
              rows={6}
              placeholder="Provide detailed information about your request..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm resize-none bg-input-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-border bg-background-2 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !subject.trim() || !description.trim()}
            className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {submitting ? 'Creating…' : 'Create Ticket'}
          </button>
        </div>
      </div>
    </div>
  );
}
