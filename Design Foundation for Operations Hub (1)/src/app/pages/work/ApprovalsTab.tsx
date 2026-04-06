import React, { useState } from 'react';
import { Badge } from '@/app/components/ui/badge';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { Button } from '@/app/components/ui/button';
import {
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  DollarSign,
  Calendar as CalendarIcon,
  File,
} from 'lucide-react';
import { Approval } from './types';
import { ApprovalDrawer } from './ApprovalDrawer';
import { users } from './data';

interface ApprovalsTabProps {
  approvals: Approval[];
  onApprovalUpdate: (approvalId: string, updates: Partial<Approval>) => void;
}

const typeIcons = {
  timesheet: Clock,
  document: File,
  invoice: DollarSign,
  leave: CalendarIcon,
};

const statusColors = {
  pending: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  approved: 'bg-green-500/10 text-green-600 border-green-500/20',
  rejected: 'bg-red-500/10 text-red-600 border-red-500/20',
};

const entityTypeColors = {
  project: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  client: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  job: 'bg-green-500/10 text-green-600 border-green-500/20',
  candidate: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  internal: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
};

export const ApprovalsTab: React.FC<ApprovalsTabProps> = ({ approvals, onApprovalUpdate }) => {
  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleApprovalClick = (approval: Approval) => {
    setSelectedApproval(approval);
    setIsDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setSelectedApproval(null);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    return `${month} ${day}`;
  };

  const handleQuickApprove = (e: React.MouseEvent, approvalId: string) => {
    e.stopPropagation();
    onApprovalUpdate(approvalId, { status: 'approved' });
  };

  const handleQuickReject = (e: React.MouseEvent, approvalId: string) => {
    e.stopPropagation();
    onApprovalUpdate(approvalId, { status: 'rejected' });
  };

  return (
    <div>
      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Title</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Requested By</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Related Entity</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Due Date</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {approvals.map((approval) => {
              const requester = users.find((u) => u.id === approval.requestedById);
              const TypeIcon = typeIcons[approval.type];

              return (
                <tr
                  key={approval.id}
                  className="hover:bg-muted/30 cursor-pointer transition-colors"
                  onClick={() => handleApprovalClick(approval)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <TypeIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm capitalize">{approval.type}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-sm">{approval.title}</div>
                  </td>
                  <td className="px-4 py-3">
                    {requester && (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">{requester.avatar}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{requester.name}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={entityTypeColors[approval.entityType]}>
                      {approval.entityName}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className={`text-sm ${approval.isOverdue ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}>
                      {formatDate(approval.dueDate)}
                      {approval.isOverdue && (
                        <Badge variant="outline" className="ml-2 bg-red-500/10 text-red-600 border-red-500/20">
                          Overdue
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={statusColors[approval.status]}>
                      {approval.status.charAt(0).toUpperCase() + approval.status.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    {approval.status === 'pending' && (
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => handleQuickApprove(e, approval.id)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => handleQuickReject(e, approval.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ApprovalDrawer
        approval={selectedApproval}
        open={isDrawerOpen}
        onClose={handleDrawerClose}
        onUpdate={onApprovalUpdate}
      />
    </div>
  );
};
