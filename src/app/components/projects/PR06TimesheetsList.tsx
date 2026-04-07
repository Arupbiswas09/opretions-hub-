import React from 'react';
import { Plus, Clock } from 'lucide-react';
import { BonsaiButton } from '../bonsai/BonsaiButton';
import { BonsaiStatusPill } from '../bonsai/BonsaiStatusPill';
import { dashboardFoldRootRelaxedClass, DashboardScrollPanel } from '../dashboard/DashboardFoldLayout';

interface Timesheet {
  id: string;
  weekOf: string;
  employee: string;
  totalHours: number;
  status: string;
  submittedDate?: string;
  approvedDate?: string;
}

interface PR06TimesheetsListProps {
  onTimesheetClick: (timesheet: Timesheet) => void;
  onCreateTimesheet: () => void;
}

export function PR06TimesheetsList({ onTimesheetClick, onCreateTimesheet }: PR06TimesheetsListProps) {
  const timesheets: Timesheet[] = [
    {
      id: '1',
      weekOf: 'Jan 13, 2026',
      employee: 'John Doe',
      totalHours: 40,
      status: 'Draft',
    },
    {
      id: '2',
      weekOf: 'Jan 6, 2026',
      employee: 'John Doe',
      totalHours: 37,
      status: 'Pending Client Approval',
      submittedDate: 'Jan 10, 2026',
    },
    {
      id: '3',
      weekOf: 'Dec 30, 2025',
      employee: 'John Doe',
      totalHours: 42,
      status: 'Client Approved',
      submittedDate: 'Jan 3, 2026',
      approvedDate: 'Jan 5, 2026',
    },
    {
      id: '4',
      weekOf: 'Dec 23, 2025',
      employee: 'John Doe',
      totalHours: 35,
      status: 'Rejected',
      submittedDate: 'Dec 27, 2025',
    },
  ];

  const getStatusColor = (status: string): 'active' | 'pending' | 'inactive' | 'archived' => {
    switch (status) {
      case 'Draft': return 'archived';
      case 'Submitted': return 'pending';
      case 'Approved': return 'active';
      case 'Rejected': return 'inactive';
      case 'Pending Client Approval': return 'pending';
      case 'Client Approved': return 'active';
      case 'Client Rejected': return 'inactive';
      default: return 'archived';
    }
  };

  const statClass = 'hub-surface hub-surface-elevated rounded-2xl p-4 sm:p-5';

  return (
    <div className={dashboardFoldRootRelaxedClass}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">My Timesheets</h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">Submit and track weekly hours.</p>
        </div>
        <BonsaiButton variant="primary" icon={<Plus className="h-4 w-4" />} onClick={onCreateTimesheet}>
          New Timesheet
        </BonsaiButton>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <div className={statClass}>
          <p className="text-[13px] text-muted-foreground">This week</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-primary">40h</p>
        </div>
        <div className={statClass}>
          <p className="text-[13px] text-muted-foreground">Pending</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">1</p>
        </div>
        <div className={statClass}>
          <p className="text-[13px] text-muted-foreground">This month</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">154h</p>
        </div>
        <div className={statClass}>
          <p className="text-[13px] text-muted-foreground">YTD</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">154h</p>
        </div>
      </div>

      <DashboardScrollPanel size="lg" className="-mr-0.5 min-h-[240px]">
        <div className="hub-surface hub-surface-elevated divide-y divide-border overflow-hidden rounded-2xl">
          {timesheets.map((timesheet) => (
            <button
              key={timesheet.id}
              type="button"
              onClick={() => onTimesheetClick(timesheet)}
              className="w-full px-4 py-4 text-left transition-colors hover:bg-[var(--row-hover-bg)] sm:px-5 sm:py-5"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 sm:h-12 sm:w-12">
                    <Clock className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <h3 className="font-medium text-foreground">Week of {timesheet.weekOf}</h3>
                      <BonsaiStatusPill
                        status={getStatusColor(timesheet.status)}
                        label={timesheet.status}
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[13px] text-muted-foreground">
                      <span className="tabular-nums">{timesheet.totalHours}h</span>
                      {timesheet.submittedDate && (
                        <>
                          <span aria-hidden className="text-border">·</span>
                          <span>Submitted {timesheet.submittedDate}</span>
                        </>
                      )}
                      {timesheet.approvedDate && (
                        <>
                          <span aria-hidden className="text-border">·</span>
                          <span>Approved {timesheet.approvedDate}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="shrink-0 text-xl font-semibold tabular-nums text-foreground">
                  {timesheet.totalHours}h
                </div>
              </div>
            </button>
          ))}
        </div>
      </DashboardScrollPanel>
    </div>
  );
}
