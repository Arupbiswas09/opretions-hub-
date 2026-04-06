import React, { useState } from 'react';
import { Plus, MessageSquare, FileText, Users, Settings as SettingsIcon } from 'lucide-react';
import { BonsaiButton } from '../bonsai/BonsaiButton';
import { BonsaiStatusPill } from '../bonsai/BonsaiStatusPill';
import { BonsaiEmptyState } from '../bonsai/BonsaiEmptyStates';
import { cn } from '../ui/utils';

interface Request {
  id: string;
  title: string;
  type: 'Project Request' | 'Staffing Request' | 'Support Request' | 'Change Request';
  status: 'New' | 'In Review' | 'Approved' | 'In Progress' | 'Completed' | 'Rejected';
  submittedBy: string;
  submittedDate: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  unreadMessages: number;
}

interface CL04RequestsListProps {
  onRequestClick: (request: Request) => void;
  onCreateRequest: () => void;
}

export function CL04RequestsList({ onRequestClick, onCreateRequest }: CL04RequestsListProps) {
  const [filter, setFilter] = useState<'all' | string>('all');

  const requests: Request[] = [
    {
      id: '1',
      title: 'Website Redesign Project',
      type: 'Project Request',
      status: 'In Progress',
      submittedBy: 'Jennifer Davis',
      submittedDate: 'Jan 5, 2026',
      priority: 'High',
      unreadMessages: 2,
    },
    {
      id: '2',
      title: 'Senior React Developer Needed',
      type: 'Staffing Request',
      status: 'In Review',
      submittedBy: 'Jennifer Davis',
      submittedDate: 'Jan 8, 2026',
      priority: 'Urgent',
      unreadMessages: 0,
    },
    {
      id: '3',
      title: 'Change Logo in Portal',
      type: 'Change Request',
      status: 'Approved',
      submittedBy: 'Michael Chen',
      submittedDate: 'Jan 3, 2026',
      priority: 'Low',
      unreadMessages: 1,
    },
    {
      id: '4',
      title: 'Portal Login Issue',
      type: 'Support Request',
      status: 'Completed',
      submittedBy: 'Jennifer Davis',
      submittedDate: 'Dec 28, 2025',
      priority: 'Medium',
      unreadMessages: 0,
    },
  ];

  const filteredRequests = filter === 'all'
    ? requests
    : requests.filter(r => r.type === filter);

  const getRequestIcon = (type: string) => {
    switch (type) {
      case 'Project Request': return <FileText className="w-4 h-4" />;
      case 'Staffing Request': return <Users className="w-4 h-4" />;
      case 'Support Request': return <MessageSquare className="w-4 h-4" />;
      case 'Change Request': return <SettingsIcon className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string): 'active' | 'pending' | 'inactive' | 'archived' => {
    switch (status) {
      case 'Completed': return 'active';
      case 'In Progress': case 'Approved': return 'pending';
      case 'Rejected': return 'inactive';
      default: return 'archived';
    }
  };

  const filterPills: { key: 'all' | Request['type']; label: string }[] = [
    { key: 'all', label: 'All Requests' },
    { key: 'Project Request', label: 'Project' },
    { key: 'Staffing Request', label: 'Staffing' },
    { key: 'Support Request', label: 'Support' },
    { key: 'Change Request', label: 'Change' },
  ];

  return (
    <div className="space-y-4">
      {/* Header with Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 overflow-x-auto [-webkit-overflow-scrolling:touch] pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex min-w-max flex-nowrap items-center gap-2 pr-1">
            {filterPills.map(({ key, label }) => (
              <button
                key={String(key)}
                type="button"
                onClick={() => setFilter(key)}
                className={cn(
                  'shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
                  filter === key
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80',
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <BonsaiButton size="sm" icon={<Plus />} onClick={onCreateRequest} className="shrink-0 self-end sm:self-auto">
          New Request
        </BonsaiButton>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { label: 'Total', value: requests.length, highlight: false },
          { label: 'New', value: 0, highlight: false },
          { label: 'In Review', value: 1, highlight: false },
          { label: 'Approved', value: 1, highlight: false },
          { label: 'In Progress', value: 1, highlight: true },
          { label: 'Completed', value: 1, highlight: false },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-lg border p-3"
            style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
          >
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{s.label}</p>
            <p
              className="text-xl font-semibold"
              style={{ color: s.highlight ? 'var(--primary)' : 'var(--foreground)' }}
            >
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Requests List */}
      {filteredRequests.length > 0 ? (
        <div className="rounded-lg border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {filteredRequests.map((request) => (
              <button
                key={request.id}
                type="button"
                onClick={() => onRequestClick(request)}
                className="w-full p-4 text-left transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/50"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      {getRequestIcon(request.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <h4 className="font-medium" style={{ color: 'var(--foreground)' }}>{request.title}</h4>
                        {request.unreadMessages > 0 && (
                          <span className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary px-1 text-xs font-semibold text-primary-foreground">
                            {request.unreadMessages}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                        <span>{request.type}</span>
                        <span aria-hidden>•</span>
                        <span>Submitted by {request.submittedBy}</span>
                        <span aria-hidden>•</span>
                        <span>{request.submittedDate}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
                    <span
                      className="inline-flex rounded-full px-2 py-1 text-xs font-medium"
                      style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}
                    >
                      {request.priority}
                    </span>
                    <BonsaiStatusPill
                      status={getStatusColor(request.status)}
                      label={request.status}
                    />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <BonsaiEmptyState
          title="No requests found"
          description={`No ${filter === 'all' ? '' : filter.toLowerCase()} requests for this client`}
        />
      )}
    </div>
  );
}
