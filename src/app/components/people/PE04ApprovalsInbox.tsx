import React, { useState } from 'react';
import { Calendar, DollarSign, CheckCircle, XCircle } from 'lucide-react';
import { BonsaiTabs } from '../bonsai/BonsaiTabs';
import { BonsaiStatusPill } from '../bonsai/BonsaiStatusPill';
import { dashboardFoldRootRelaxedClass, DashboardScrollPanel } from '../dashboard/DashboardFoldLayout';

interface Request {
  id: string;
  type: 'leave' | 'expense';
  employee: string;
  submittedDate: string;
  status: string;
  // Leave specific
  leaveType?: string;
  startDate?: string;
  endDate?: string;
  days?: number;
  // Expense specific
  amount?: number;
  items?: number;
}

interface PE04ApprovalsInboxProps {
  onRequestClick: (request: Request) => void;
}

export function PE04ApprovalsInbox({ onRequestClick }: PE04ApprovalsInboxProps) {
  const [activeTab, setActiveTab] = useState('leave');

  const leaveRequests: Request[] = [
    {
      id: '1',
      type: 'leave',
      employee: 'Sarah Johnson',
      submittedDate: 'Jan 15, 2026',
      status: 'Submitted',
      leaveType: 'Vacation',
      startDate: 'Feb 10, 2026',
      endDate: 'Feb 14, 2026',
      days: 5,
    },
    {
      id: '2',
      type: 'leave',
      employee: 'Mike Chen',
      submittedDate: 'Jan 14, 2026',
      status: 'Submitted',
      leaveType: 'Sick Leave',
      startDate: 'Jan 16, 2026',
      endDate: 'Jan 16, 2026',
      days: 1,
    },
  ];

  const expenseRequests: Request[] = [
    {
      id: '3',
      type: 'expense',
      employee: 'Jane Smith',
      submittedDate: 'Jan 15, 2026',
      status: 'Submitted',
      amount: 387.50,
      items: 4,
    },
    {
      id: '4',
      type: 'expense',
      employee: 'Tom Wilson',
      submittedDate: 'Jan 13, 2026',
      status: 'Submitted',
      amount: 125.00,
      items: 2,
    },
  ];

  const tabs = [
    { label: 'Leave Requests', value: 'leave', count: leaveRequests.length },
    { label: 'Expense Claims', value: 'expense', count: expenseRequests.length },
  ];

  const statTile = 'hub-surface hub-surface-elevated rounded-2xl p-4 sm:p-5';

  return (
    <div className={dashboardFoldRootRelaxedClass}>
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">People approvals</h1>
        <p className="mt-0.5 text-[13px] text-muted-foreground">Leave and expenses.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <div className={statTile}>
          <p className="text-[13px] text-muted-foreground">Leave</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">{leaveRequests.length}</p>
        </div>
        <div className={statTile}>
          <p className="text-[13px] text-muted-foreground">Expenses</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">{expenseRequests.length}</p>
        </div>
        <div className={statTile}>
          <p className="text-[13px] text-muted-foreground">Open amount</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-primary">
            ${expenseRequests.reduce((sum, req) => sum + (req.amount || 0), 0).toFixed(2)}
          </p>
        </div>
        <div className={statTile}>
          <p className="text-[13px] text-muted-foreground">Approved (week)</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">8</p>
        </div>
      </div>

      <div className="mt-1">
        <BonsaiTabs
          tabs={tabs.map(tab => ({
            ...tab,
            label: `${tab.label} (${tab.count})`,
          }))}
          value={activeTab}
          onValueChange={setActiveTab}
        />
      </div>

      <div className="mt-2">
        {activeTab === 'leave' && (
          <DashboardScrollPanel size="lg" className="-mr-0.5 min-h-[200px]">
            <div className="hub-surface hub-surface-elevated divide-y divide-border overflow-hidden rounded-2xl">
              {leaveRequests.map((request) => (
                <button
                  key={request.id}
                  type="button"
                  onClick={() => onRequestClick(request)}
                  className="w-full px-4 py-4 text-left transition-colors hover:bg-[var(--row-hover-bg)] sm:px-5 sm:py-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted sm:h-12 sm:w-12">
                        <Calendar className="h-5 w-5 text-muted-foreground sm:h-6 sm:w-6" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <h3 className="font-medium text-foreground">{request.employee}</h3>
                          <span className="text-muted-foreground">·</span>
                          <span className="text-[13px] text-muted-foreground">{request.leaveType}</span>
                          <BonsaiStatusPill status="pending" label={request.status} />
                        </div>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[13px] text-muted-foreground">
                          <span>
                            {request.startDate} – {request.endDate}
                          </span>
                          <span>·</span>
                          <span>
                            {request.days} {request.days === 1 ? 'day' : 'days'}
                          </span>
                          <span>·</span>
                          <span>Submitted {request.submittedDate}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRequestClick(request);
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
                          onRequestClick(request);
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/15"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Reject
                      </button>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </DashboardScrollPanel>
        )}

        {activeTab === 'expense' && (
          <DashboardScrollPanel size="lg" className="-mr-0.5 min-h-[200px]">
            <div className="hub-surface hub-surface-elevated divide-y divide-border overflow-hidden rounded-2xl">
              {expenseRequests.map((request) => (
                <button
                  key={request.id}
                  type="button"
                  onClick={() => onRequestClick(request)}
                  className="w-full px-4 py-4 text-left transition-colors hover:bg-[var(--row-hover-bg)] sm:px-5 sm:py-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted sm:h-12 sm:w-12">
                        <DollarSign className="h-5 w-5 text-muted-foreground sm:h-6 sm:w-6" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <h3 className="font-medium text-foreground">{request.employee}</h3>
                          <span className="text-muted-foreground">·</span>
                          <span className="text-lg font-semibold tabular-nums text-primary">${request.amount?.toFixed(2)}</span>
                          <BonsaiStatusPill status="pending" label={request.status} />
                        </div>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[13px] text-muted-foreground">
                          <span>
                            {request.items} {request.items === 1 ? 'item' : 'items'}
                          </span>
                          <span>·</span>
                          <span>Submitted {request.submittedDate}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRequestClick(request);
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
                          onRequestClick(request);
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/15"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Reject
                      </button>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </DashboardScrollPanel>
        )}
      </div>
    </div>
  );
}
