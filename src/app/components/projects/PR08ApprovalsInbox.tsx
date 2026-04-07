import React, { useState } from 'react';
import { CheckCircle, XCircle, Filter } from 'lucide-react';
import { BonsaiStatusPill } from '../bonsai/BonsaiStatusPill';
import { dashboardFoldRootRelaxedClass, DashboardScrollPanel } from '../dashboard/DashboardFoldLayout';
import { cn } from '../ui/utils';

interface TimesheetApproval {
  id: string;
  employee: string;
  weekOf: string;
  totalHours: number;
  status: string;
  submittedDate: string;
  project: string;
}

interface PR08ApprovalsInboxProps {
  onApprovalClick: (approval: TimesheetApproval) => void;
}

export function PR08ApprovalsInbox({ onApprovalClick }: PR08ApprovalsInboxProps) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  const approvals: TimesheetApproval[] = [
    {
      id: '1',
      employee: 'Sarah Johnson',
      weekOf: 'Jan 13, 2026',
      totalHours: 42,
      status: 'Submitted',
      submittedDate: 'Jan 17, 2026',
      project: 'Website Redesign',
    },
    {
      id: '2',
      employee: 'Mike Chen',
      weekOf: 'Jan 13, 2026',
      totalHours: 38,
      status: 'Submitted',
      submittedDate: 'Jan 17, 2026',
      project: 'Mobile App Development',
    },
    {
      id: '3',
      employee: 'Sarah Johnson',
      weekOf: 'Jan 6, 2026',
      totalHours: 40,
      status: 'Approved',
      submittedDate: 'Jan 10, 2026',
      project: 'Website Redesign',
    },
    {
      id: '4',
      employee: 'Tom Wilson',
      weekOf: 'Jan 6, 2026',
      totalHours: 35,
      status: 'Rejected',
      submittedDate: 'Jan 10, 2026',
      project: 'Brand Identity',
    },
  ];

  const filteredApprovals = filter === 'all'
    ? approvals
    : approvals.filter(a => {
        if (filter === 'pending') return a.status === 'Submitted';
        if (filter === 'approved') return a.status === 'Approved';
        if (filter === 'rejected') return a.status === 'Rejected';
        return true;
      });

  const getStatusColor = (status: string): 'active' | 'pending' | 'inactive' | 'archived' => {
    switch (status) {
      case 'Submitted': return 'pending';
      case 'Approved': return 'active';
      case 'Rejected': return 'inactive';
      default: return 'archived';
    }
  };

  const statClass = 'hub-surface hub-surface-elevated rounded-2xl p-4 sm:p-5';

  const chipClass = (on: boolean) =>
    cn(
      'rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
      on
        ? 'border-transparent bg-primary text-primary-foreground'
        : 'border-border bg-secondary/60 text-muted-foreground hover:bg-secondary',
    );

  return (
    <div className={dashboardFoldRootRelaxedClass}>
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">Timesheet Approvals</h1>
        <p className="mt-0.5 text-[13px] text-muted-foreground">Review team submissions.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <div className={statClass}>
          <p className="text-[13px] text-muted-foreground">Pending</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">2</p>
        </div>
        <div className={statClass}>
          <p className="text-[13px] text-muted-foreground">Approved (week)</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">1</p>
        </div>
        <div className={statClass}>
          <p className="text-[13px] text-muted-foreground">Hours in queue</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-primary">80h</p>
        </div>
        <div className={statClass}>
          <p className="text-[13px] text-muted-foreground">Avg. response</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">1.2d</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Filter className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
        {(['all', 'pending', 'approved', 'rejected'] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={chipClass(filter === key)}
          >
            {key === 'all' ? 'All' : key.charAt(0).toUpperCase() + key.slice(1)}
          </button>
        ))}
      </div>

      <DashboardScrollPanel size="lg" className="-mr-0.5 min-h-[240px]">
        <div className="hub-surface hub-surface-elevated divide-y divide-border overflow-hidden rounded-2xl">
          {filteredApprovals.map((approval) => (
            <button
              key={approval.id}
              type="button"
              onClick={() => onApprovalClick(approval)}
              className="w-full px-4 py-4 text-left transition-colors hover:bg-[var(--row-hover-bg)] sm:px-5 sm:py-5"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 sm:h-12 sm:w-12">
                    <span className="text-xs font-semibold text-primary-foreground sm:text-sm">
                      {approval.employee.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <h3 className="font-medium text-foreground">{approval.employee}</h3>
                      <span className="text-muted-foreground">·</span>
                      <span className="text-[13px] text-muted-foreground">{approval.project}</span>
                      <BonsaiStatusPill
                        status={getStatusColor(approval.status)}
                        label={approval.status}
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[13px] text-muted-foreground">
                      <span>Week of {approval.weekOf}</span>
                      <span aria-hidden>·</span>
                      <span className="tabular-nums">{approval.totalHours}h</span>
                      <span aria-hidden>·</span>
                      <span>Submitted {approval.submittedDate}</span>
                    </div>
                  </div>
                </div>
                {approval.status === 'Submitted' ? (
                  <div className="flex shrink-0 items-center gap-2 sm:justify-end">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onApprovalClick(approval);
                      }}
                      className="inline-flex items-center gap-1 rounded-lg border border-border bg-secondary/80 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onApprovalClick(approval);
                      }}
                      className="inline-flex items-center gap-1 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/15"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Reject
                    </button>
                  </div>
                ) : (
                  <div className="shrink-0 text-xl font-semibold tabular-nums text-foreground">
                    {approval.totalHours}h
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </DashboardScrollPanel>
    </div>
  );
}
