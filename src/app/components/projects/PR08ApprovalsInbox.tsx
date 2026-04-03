import React, { useState } from 'react';
import { CheckCircle, XCircle, Clock, Filter } from 'lucide-react';
import { BonsaiButton } from '../bonsai/BonsaiButton';
import { BonsaiStatusPill } from '../bonsai/BonsaiStatusPill';

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

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-stone-800">Timesheet Approvals</h1>
          <p className="text-sm text-stone-500">Review and approve team timesheets</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-stone-200 p-4">
          <p className="text-sm text-stone-600">Pending Review</p>
          <p className="text-2xl font-semibold text-stone-600 mt-1">2</p>
        </div>
        <div className="bg-white rounded-lg border border-stone-200 p-4">
          <p className="text-sm text-stone-600">Approved This Week</p>
          <p className="text-2xl font-semibold text-stone-600 mt-1">1</p>
        </div>
        <div className="bg-white rounded-lg border border-stone-200 p-4">
          <p className="text-sm text-stone-600">Total Hours Pending</p>
          <p className="text-2xl font-semibold text-primary mt-1">80h</p>
        </div>
        <div className="bg-white rounded-lg border border-stone-200 p-4">
          <p className="text-sm text-stone-600">Avg Response Time</p>
          <p className="text-2xl font-semibold text-stone-800 mt-1">1.2d</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6">
        <Filter className="w-4 h-4 text-stone-400" />
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            filter === 'all' ? 'bg-primary text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            filter === 'pending' ? 'bg-primary text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            filter === 'approved' ? 'bg-primary text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          Approved
        </button>
        <button
          onClick={() => setFilter('rejected')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            filter === 'rejected' ? 'bg-primary text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          Rejected
        </button>
      </div>

      {/* Approvals List */}
      <div className="bg-white rounded-lg border border-stone-200">
        <div className="divide-y divide-stone-200">
          {filteredApprovals.map((approval) => (
            <button
              key={approval.id}
              onClick={() => onApprovalClick(approval)}
              className="w-full p-4 hover:bg-stone-50 transition-colors text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-green-600 flex items-center justify-center">
                    <span className="text-sm font-semibold text-white">
                      {approval.employee.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-stone-800">{approval.employee}</h3>
                      <span className="text-sm text-stone-500">•</span>
                      <span className="text-sm text-stone-600">{approval.project}</span>
                      <BonsaiStatusPill
                        status={getStatusColor(approval.status)}
                        label={approval.status}
                      />
                    </div>
                    <div className="flex items-center gap-3 text-sm text-stone-600">
                      <span>Week of {approval.weekOf}</span>
                      <span>•</span>
                      <span>{approval.totalHours} hours</span>
                      <span>•</span>
                      <span>Submitted {approval.submittedDate}</span>
                    </div>
                  </div>
                </div>
                {approval.status === 'Submitted' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onApprovalClick(approval);
                      }}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200 flex items-center gap-1"
                    >
                      <CheckCircle className="w-3 h-3" />
                      Approve
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onApprovalClick(approval);
                      }}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg bg-stone-100 text-stone-700 hover:bg-red-200 flex items-center gap-1"
                    >
                      <XCircle className="w-3 h-3" />
                      Reject
                    </button>
                  </div>
                )}
                {approval.status !== 'Submitted' && (
                  <div className="text-2xl font-semibold text-stone-800">
                    {approval.totalHours}h
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
