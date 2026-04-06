import React from 'react';
import { Badge } from '@/app/components/ui/badge';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { Request } from './request-types';
import { users } from './data';
import {
  Users,
  Briefcase,
  UserCircle,
  Building,
  Clock,
} from 'lucide-react';

interface RequestListViewProps {
  requests: Request[];
  onRequestClick: (request: Request) => void;
}

const requestTypeConfig = {
  client: {
    label: 'Client',
    color: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    icon: Building,
  },
  employee: {
    label: 'Employee',
    color: 'bg-green-500/10 text-green-600 border-green-500/20',
    icon: UserCircle,
  },
  freelancer: {
    label: 'Freelancer',
    color: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    icon: Briefcase,
  },
  internal: {
    label: 'Internal',
    color: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
    icon: Users,
  },
};

const categoryLabels = {
  'new-talent': 'New Talent',
  'change-request': 'Change Request',
  'support': 'Support',
  'leave': 'Leave',
  'payment': 'Payment',
  'access': 'Access',
  'other': 'Other',
};

const statusColors = {
  new: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  'in-review': 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  approved: 'bg-green-500/10 text-green-600 border-green-500/20',
  rejected: 'bg-red-500/10 text-red-600 border-red-500/20',
  fulfilled: 'bg-green-500/10 text-green-600 border-green-500/20',
  converted: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
};

const statusLabels = {
  new: 'New',
  'in-review': 'In Review',
  approved: 'Approved',
  rejected: 'Rejected',
  fulfilled: 'Fulfilled',
  converted: 'Converted',
};

const entityTypeColors = {
  project: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  client: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  internal: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
};

export const RequestListView: React.FC<RequestListViewProps> = ({ requests, onRequestClick }) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    return `${month} ${day}`;
  };

  const getDaysAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date('2026-01-26');
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  };

  if (requests.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground border border-border rounded-lg">
        <p>No requests found matching your filters.</p>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-muted/50 border-b border-border">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Subject</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Category</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Requested By</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Related Entity</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Owner</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Submitted</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {requests.map((request) => {
            const config = requestTypeConfig[request.requestType];
            const TypeIcon = config.icon;
            const owner = request.ownerId ? users.find((u) => u.id === request.ownerId) : null;

            return (
              <tr
                key={request.id}
                className="hover:bg-muted/30 cursor-pointer transition-colors"
                onClick={() => onRequestClick(request)}
              >
                <td className="px-4 py-3">
                  <Badge variant="outline" className={config.color}>
                    <TypeIcon className="h-3 w-3 mr-1" />
                    {config.label}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-sm">{request.subject}</div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-muted-foreground">
                    {categoryLabels[request.category]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <div className="text-sm font-medium">{request.requestedByName}</div>
                    {request.requestedByOrg && (
                      <div className="text-xs text-muted-foreground">{request.requestedByOrg}</div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {request.relatedEntityName && request.relatedEntityType && (
                    <Badge 
                      variant="outline" 
                      className={entityTypeColors[request.relatedEntityType as keyof typeof entityTypeColors] || 'bg-gray-500/10 text-gray-600 border-gray-500/20'}
                    >
                      {request.relatedEntityName}
                    </Badge>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className={statusColors[request.status]}>
                    {statusLabels[request.status]}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  {owner && (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">{owner.avatar}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{owner.name}</span>
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {getDaysAgo(request.submittedDate)}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
