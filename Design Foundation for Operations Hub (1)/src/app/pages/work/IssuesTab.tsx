import React, { useState } from 'react';
import { Badge } from '@/app/components/ui/badge';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { Issue } from './types';
import { users } from './data';
import { IssueDrawer } from './IssueDrawer';

interface IssuesTabProps {
  issues: Issue[];
  onIssueUpdate: (issueId: string, updates: Partial<Issue>) => void;
}

const severityConfig = {
  critical: {
    color: 'bg-red-500/10 text-red-600 border-red-500/20',
    icon: AlertCircle,
  },
  high: {
    color: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    icon: AlertTriangle,
  },
  medium: {
    color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    icon: AlertTriangle,
  },
  low: {
    color: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    icon: Info,
  },
};

const statusColors = {
  open: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
  'in-progress': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  blocked: 'bg-red-500/10 text-red-600 border-red-500/20',
  resolved: 'bg-green-500/10 text-green-600 border-green-500/20',
};

const statusLabels = {
  open: 'Open',
  'in-progress': 'In Progress',
  blocked: 'Blocked',
  resolved: 'Resolved',
};

const entityTypeColors = {
  project: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  client: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  job: 'bg-green-500/10 text-green-600 border-green-500/20',
  candidate: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  internal: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
};

export const IssuesTab: React.FC<IssuesTabProps> = ({ issues, onIssueUpdate }) => {
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    return `${month} ${day}`;
  };

  const handleIssueClick = (issue: Issue) => {
    setSelectedIssue(issue);
    setIsDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setSelectedIssue(null);
  };

  const handleIssueUpdate = (updates: Partial<Issue>) => {
    if (selectedIssue) {
      onIssueUpdate(selectedIssue.id, updates);
    }
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-muted/50 border-b border-border">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium">Severity</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Issue</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Related Entity</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Assignee</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Created</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {issues.map((issue) => {
            const assignee = users.find((u) => u.id === issue.assigneeId);
            const { color, icon: SeverityIcon } = severityConfig[issue.severity];

            return (
              <tr
                key={issue.id}
                className="hover:bg-muted/30 cursor-pointer transition-colors"
                onClick={() => handleIssueClick(issue)}
              >
                <td className="px-4 py-3">
                  <Badge variant="outline" className={color}>
                    <SeverityIcon className="h-3 w-3 mr-1" />
                    {issue.severity.charAt(0).toUpperCase() + issue.severity.slice(1)}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-sm">{issue.title}</div>
                  <div className="text-xs text-muted-foreground line-clamp-1 mt-1">
                    {issue.description}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className={statusColors[issue.status]}>
                    {statusLabels[issue.status]}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className={entityTypeColors[issue.entityType]}>
                    {issue.entityName}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  {assignee && (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">{assignee.avatar}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{assignee.name}</span>
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-muted-foreground">
                    {formatDate(issue.createdAt)}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {selectedIssue && (
        <IssueDrawer
          issue={selectedIssue}
          isOpen={isDrawerOpen}
          onClose={handleDrawerClose}
          onUpdate={handleIssueUpdate}
        />
      )}
    </div>
  );
};