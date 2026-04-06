import React, { useState, useMemo } from 'react';
import { Button } from '@/app/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Plus } from 'lucide-react';
import { Request, RequestType, RequestCategory, RequestStatus } from './request-types';
import { RequestListView } from './RequestListView';
import { RequestDrawer } from './RequestDrawer';
import { RequestCreateModal } from './RequestCreateModal';

interface RequestsTabProps {
  requests: Request[];
  onRequestUpdate: (requestId: string, updates: Partial<Request>) => void;
  onRequestCreate: (request: Omit<Request, 'id'>) => void;
}

export const RequestsTab: React.FC<RequestsTabProps> = ({ requests, onRequestUpdate, onRequestCreate }) => {
  const [typeFilter, setTypeFilter] = useState<RequestType | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<RequestCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'all'>('all');
  const [requestedByFilter, setRequestedByFilter] = useState<string>('all');

  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      if (typeFilter !== 'all' && request.requestType !== typeFilter) return false;
      if (categoryFilter !== 'all' && request.category !== categoryFilter) return false;
      if (statusFilter !== 'all' && request.status !== statusFilter) return false;
      if (requestedByFilter !== 'all' && request.requestedById !== requestedByFilter) return false;
      return true;
    });
  }, [requests, typeFilter, categoryFilter, statusFilter, requestedByFilter]);

  // Get unique requesters for filter
  const uniqueRequesters = useMemo(() => {
    const requestersMap = new Map();
    requests.forEach((req) => {
      if (!requestersMap.has(req.requestedById)) {
        requestersMap.set(req.requestedById, {
          id: req.requestedById,
          name: req.requestedByName,
        });
      }
    });
    return Array.from(requestersMap.values());
  }, [requests]);

  const handleRequestClick = (request: Request) => {
    setSelectedRequest(request);
    setIsDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setSelectedRequest(null);
  };

  const handleRequestUpdate = (updates: Partial<Request>) => {
    if (selectedRequest) {
      onRequestUpdate(selectedRequest.id, updates);
    }
  };

  const handleNewRequest = () => {
    setIsCreateModalOpen(true);
  };

  return (
    <div>
      {/* Header with filters */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={typeFilter} onValueChange={(val) => setTypeFilter(val as RequestType | 'all')}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Request Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="client">Client</SelectItem>
              <SelectItem value="employee">Employee</SelectItem>
              <SelectItem value="freelancer">Freelancer</SelectItem>
              <SelectItem value="internal">Internal</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={(val) => setCategoryFilter(val as RequestCategory | 'all')}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="new-talent">New Talent</SelectItem>
              <SelectItem value="change-request">Change Request</SelectItem>
              <SelectItem value="support">Support</SelectItem>
              <SelectItem value="leave">Leave</SelectItem>
              <SelectItem value="payment">Payment</SelectItem>
              <SelectItem value="access">Access</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val as RequestStatus | 'all')}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="in-review">In Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="fulfilled">Fulfilled</SelectItem>
              <SelectItem value="converted">Converted</SelectItem>
            </SelectContent>
          </Select>

          <Select value={requestedByFilter} onValueChange={setRequestedByFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Requested By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Requesters</SelectItem>
              {uniqueRequesters.map((requester) => (
                <SelectItem key={requester.id} value={requester.id}>
                  {requester.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleNewRequest}>
          <Plus className="h-4 w-4 mr-2" />
          New Request
        </Button>
      </div>

      {/* Requests List */}
      <RequestListView requests={filteredRequests} onRequestClick={handleRequestClick} />

      {/* Request Drawer */}
      <RequestDrawer
        request={selectedRequest}
        open={isDrawerOpen}
        onClose={handleDrawerClose}
        onUpdate={handleRequestUpdate}
      />

      {/* Create Modal */}
      <RequestCreateModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={onRequestCreate}
      />
    </div>
  );
};
