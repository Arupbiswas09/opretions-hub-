import React from 'react';
import { Plus, Clock } from 'lucide-react';
import { BonsaiButton } from '../bonsai/BonsaiButton';
import { BonsaiStatusPill } from '../bonsai/BonsaiStatusPill';

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

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-stone-800">My Timesheets</h1>
          <p className="text-sm text-stone-500">Track and submit your weekly hours</p>
        </div>
        <BonsaiButton variant="primary" icon={<Plus />} onClick={onCreateTimesheet}>
          New Timesheet
        </BonsaiButton>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-stone-200 p-4">
          <p className="text-sm text-stone-600">This Week</p>
          <p className="text-2xl font-semibold text-primary mt-1">40h</p>
        </div>
        <div className="bg-white rounded-lg border border-stone-200 p-4">
          <p className="text-sm text-stone-600">Pending Approval</p>
          <p className="text-2xl font-semibold text-stone-600 mt-1">1</p>
        </div>
        <div className="bg-white rounded-lg border border-stone-200 p-4">
          <p className="text-sm text-stone-600">This Month</p>
          <p className="text-2xl font-semibold text-stone-800 mt-1">154h</p>
        </div>
        <div className="bg-white rounded-lg border border-stone-200 p-4">
          <p className="text-sm text-stone-600">This Year</p>
          <p className="text-2xl font-semibold text-stone-800 mt-1">154h</p>
        </div>
      </div>

      {/* Timesheets List */}
      <div className="bg-white rounded-lg border border-stone-200">
        <div className="divide-y divide-stone-200">
          {timesheets.map((timesheet) => (
            <button
              key={timesheet.id}
              onClick={() => onTimesheetClick(timesheet)}
              className="w-full p-4 hover:bg-stone-50 transition-colors text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-stone-800">Week of {timesheet.weekOf}</h3>
                      <BonsaiStatusPill
                        status={getStatusColor(timesheet.status)}
                        label={timesheet.status}
                      />
                    </div>
                    <div className="flex items-center gap-3 text-sm text-stone-600">
                      <span>{timesheet.totalHours} hours</span>
                      {timesheet.submittedDate && (
                        <>
                          <span>•</span>
                          <span>Submitted {timesheet.submittedDate}</span>
                        </>
                      )}
                      {timesheet.approvedDate && (
                        <>
                          <span>•</span>
                          <span>Approved {timesheet.approvedDate}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-2xl font-semibold text-stone-800">
                  {timesheet.totalHours}h
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
