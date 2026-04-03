import React, { useState } from 'react';
import { Calendar, DollarSign, CheckCircle, XCircle } from 'lucide-react';
import { BonsaiTabs } from '../bonsai/BonsaiTabs';
import { BonsaiStatusPill } from '../bonsai/BonsaiStatusPill';

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

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-stone-800">Approvals Inbox</h1>
          <p className="text-sm text-stone-500">Review and approve team requests</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-stone-200 p-4">
          <p className="text-sm text-stone-600">Pending Leave</p>
          <p className="text-2xl font-semibold text-blue-600 mt-1">{leaveRequests.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-stone-200 p-4">
          <p className="text-sm text-stone-600">Pending Expenses</p>
          <p className="text-2xl font-semibold text-green-600 mt-1">{expenseRequests.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-stone-200 p-4">
          <p className="text-sm text-stone-600">Total Pending Amount</p>
          <p className="text-2xl font-semibold text-primary mt-1">
            ${expenseRequests.reduce((sum, req) => sum + (req.amount || 0), 0).toFixed(2)}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-stone-200 p-4">
          <p className="text-sm text-stone-600">Approved This Week</p>
          <p className="text-2xl font-semibold text-stone-800 mt-1">8</p>
        </div>
      </div>

      {/* Tabs */}
      <BonsaiTabs
        tabs={tabs.map(tab => ({
          ...tab,
          label: `${tab.label} (${tab.count})`,
        }))}
        value={activeTab}
        onValueChange={setActiveTab}
      />

      {/* Content */}
      <div className="mt-6">
        {activeTab === 'leave' && (
          <div className="bg-white rounded-lg border border-stone-200">
            <div className="divide-y divide-stone-200">
              {leaveRequests.map((request) => (
                <button
                  key={request.id}
                  onClick={() => onRequestClick(request)}
                  className="w-full p-4 hover:bg-stone-50 transition-colors text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-stone-800">{request.employee}</h3>
                          <span className="text-sm text-stone-500">•</span>
                          <span className="text-sm text-stone-600">{request.leaveType}</span>
                          <BonsaiStatusPill status="pending" label={request.status} />
                        </div>
                        <div className="flex items-center gap-3 text-sm text-stone-600">
                          <span>{request.startDate} - {request.endDate}</span>
                          <span>•</span>
                          <span>{request.days} {request.days === 1 ? 'day' : 'days'}</span>
                          <span>•</span>
                          <span>Submitted {request.submittedDate}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRequestClick(request);
                        }}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-green-100 text-green-700 hover:bg-green-200 flex items-center gap-1"
                      >
                        <CheckCircle className="w-3 h-3" />
                        Approve
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRequestClick(request);
                        }}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-100 text-red-700 hover:bg-red-200 flex items-center gap-1"
                      >
                        <XCircle className="w-3 h-3" />
                        Reject
                      </button>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'expense' && (
          <div className="bg-white rounded-lg border border-stone-200">
            <div className="divide-y divide-stone-200">
              {expenseRequests.map((request) => (
                <button
                  key={request.id}
                  onClick={() => onRequestClick(request)}
                  className="w-full p-4 hover:bg-stone-50 transition-colors text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-stone-800">{request.employee}</h3>
                          <span className="text-sm text-stone-500">•</span>
                          <span className="text-lg font-semibold text-primary">${request.amount?.toFixed(2)}</span>
                          <BonsaiStatusPill status="pending" label={request.status} />
                        </div>
                        <div className="flex items-center gap-3 text-sm text-stone-600">
                          <span>{request.items} {request.items === 1 ? 'item' : 'items'}</span>
                          <span>•</span>
                          <span>Submitted {request.submittedDate}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRequestClick(request);
                        }}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-green-100 text-green-700 hover:bg-green-200 flex items-center gap-1"
                      >
                        <CheckCircle className="w-3 h-3" />
                        Approve
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRequestClick(request);
                        }}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-100 text-red-700 hover:bg-red-200 flex items-center gap-1"
                      >
                        <XCircle className="w-3 h-3" />
                        Reject
                      </button>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
