import React, { useState } from 'react';
import { Plus, MessageSquare, FileText, Users, Settings as SettingsIcon } from 'lucide-react';
import { BonsaiButton } from '../bonsai/BonsaiButton';
import { BonsaiStatusPill } from '../bonsai/BonsaiStatusPill';
import { BonsaiEmptyState } from '../bonsai/BonsaiEmptyStates';

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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'bg-stone-100 text-stone-700';
      case 'High': return 'bg-stone-100 text-stone-700';
      case 'Medium': return 'bg-stone-100 text-stone-600';
      case 'Low': return 'bg-stone-100 text-stone-700';
      default: return 'bg-stone-100 text-stone-700';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              filter === 'all' ? 'bg-primary text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            All Requests
          </button>
          <button
            onClick={() => setFilter('Project Request')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              filter === 'Project Request' ? 'bg-primary text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Project
          </button>
          <button
            onClick={() => setFilter('Staffing Request')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              filter === 'Staffing Request' ? 'bg-primary text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Staffing
          </button>
          <button
            onClick={() => setFilter('Support Request')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              filter === 'Support Request' ? 'bg-primary text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Support
          </button>
          <button
            onClick={() => setFilter('Change Request')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              filter === 'Change Request' ? 'bg-primary text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Change
          </button>
        </div>
        <BonsaiButton size="sm" icon={<Plus />} onClick={onCreateRequest}>
          New Request
        </BonsaiButton>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-6 gap-3">
        <div className="bg-white rounded-lg border border-stone-200 p-3">
          <p className="text-xs text-stone-600">Total</p>
          <p className="text-xl font-semibold text-stone-800">{requests.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-stone-200 p-3">
          <p className="text-xs text-stone-600">New</p>
          <p className="text-xl font-semibold text-stone-600">0</p>
        </div>
        <div className="bg-white rounded-lg border border-stone-200 p-3">
          <p className="text-xs text-stone-600">In Review</p>
          <p className="text-xl font-semibold text-stone-600">1</p>
        </div>
        <div className="bg-white rounded-lg border border-stone-200 p-3">
          <p className="text-xs text-stone-600">Approved</p>
          <p className="text-xl font-semibold text-stone-600">1</p>
        </div>
        <div className="bg-white rounded-lg border border-stone-200 p-3">
          <p className="text-xs text-stone-600">In Progress</p>
          <p className="text-xl font-semibold text-primary">1</p>
        </div>
        <div className="bg-white rounded-lg border border-stone-200 p-3">
          <p className="text-xs text-stone-600">Completed</p>
          <p className="text-xl font-semibold text-stone-600">1</p>
        </div>
      </div>

      {/* Requests List */}
      {filteredRequests.length > 0 ? (
        <div className="bg-white rounded-lg border border-stone-200">
          <div className="divide-y divide-stone-200">
            {filteredRequests.map((request) => (
              <button
                key={request.id}
                onClick={() => onRequestClick(request)}
                className="w-full p-4 hover:bg-stone-50 transition-colors text-left"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                      {getRequestIcon(request.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-stone-800">{request.title}</h4>
                        {request.unreadMessages > 0 && (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-stone-1000 text-white text-xs font-semibold">
                            {request.unreadMessages}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-stone-600">
                        <span>{request.type}</span>
                        <span>•</span>
                        <span>Submitted by {request.submittedBy}</span>
                        <span>•</span>
                        <span>{request.submittedDate}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(request.priority)}`}>
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
