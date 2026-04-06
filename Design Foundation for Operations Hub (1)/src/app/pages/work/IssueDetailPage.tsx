import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { Textarea } from '@/app/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import {
  ArrowLeft,
  AlertCircle,
  AlertTriangle,
  Info,
  MessageSquare,
  Activity,
  Sparkles,
  Link as LinkIcon,
  CheckSquare,
} from 'lucide-react';
import { Issue } from './types';
import { users } from './data';

interface IssueDetailPageProps {
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

const entityTypeColors = {
  project: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  client: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  job: 'bg-green-500/10 text-green-600 border-green-500/20',
  candidate: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  internal: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
};

export const IssueDetailPage: React.FC<IssueDetailPageProps> = ({ issues, onIssueUpdate }) => {
  const { issueId } = useParams();
  const navigate = useNavigate();
  const [newComment, setNewComment] = useState('');

  const issue = issues.find((i) => i.id === issueId);

  if (!issue) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Issue not found</p>
        <Button onClick={() => navigate('/work')} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Work
        </Button>
      </div>
    );
  }

  const assignee = users.find((u) => u.id === issue.assigneeId);
  const creator = users.find((u) => u.id === issue.createdById);
  const { color, icon: SeverityIcon } = severityConfig[issue.severity];

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      // In real app, would call API
      setNewComment('');
    }
  };

  const handleConvertToTask = () => {
    // In real app, would create a task from this issue
    console.log('Converting issue to task...');
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/work')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Work
        </Button>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-semibold mb-2">{issue.title}</h1>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="outline" className={color}>
                <SeverityIcon className="h-3 w-3 mr-1" />
                {issue.severity.charAt(0).toUpperCase() + issue.severity.slice(1)} Severity
              </Badge>
              <Badge variant="outline" className={statusColors[issue.status]}>
                {issue.status === 'in-progress' ? 'In Progress' : 
                 issue.status.charAt(0).toUpperCase() + issue.status.slice(1)}
              </Badge>
              <Badge variant="outline" className={entityTypeColors[issue.entityType]}>
                {issue.entityType.charAt(0).toUpperCase() + issue.entityType.slice(1)}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="font-medium mb-3">Description</h2>
            <div className="text-sm text-muted-foreground">{issue.description}</div>
          </div>

          {/* AI Section */}
          <div className="border border-purple-500/20 rounded-lg p-6 bg-purple-500/5">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <h2 className="font-medium">AI Analysis</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-2">Issue Summary</div>
                <div className="text-sm">
                  {issue.severity === 'critical' || issue.severity === 'high'
                    ? 'This is a high-priority issue affecting system functionality. Immediate attention recommended.'
                    : 'This issue can be addressed in the normal workflow. No immediate action required.'}
                </div>
              </div>

              <div>
                <div className="text-xs font-medium text-muted-foreground mb-2">Suggested Resolution Steps</div>
                <ul className="text-sm space-y-1 list-disc list-inside">
                  <li>Review error logs and identify root cause</li>
                  <li>Implement fix and create unit tests</li>
                  <li>Deploy to staging and verify resolution</li>
                  <li>Monitor production metrics post-deployment</li>
                </ul>
              </div>

              <div>
                <div className="text-xs font-medium text-muted-foreground mb-2">Suggested Assignee</div>
                <div className="flex items-center gap-2">
                  {assignee && (
                    <>
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">{assignee.avatar}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{assignee.name} (current assignee)</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="font-medium mb-4 flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              Activity Timeline
            </h2>

            <div className="space-y-4">
              {issue.activityLog.map((activity) => {
                const activityUser = activity.userId === 'ai' ? null : users.find((u) => u.id === activity.userId);
                
                return (
                  <div key={activity.id} className="flex gap-3">
                    <div className="text-xs text-muted-foreground whitespace-nowrap pt-1">
                      {formatTimestamp(activity.timestamp)}
                    </div>
                    <div className="flex-1 flex items-start gap-2">
                      {activityUser ? (
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">{activityUser.avatar}</AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="h-6 w-6 rounded-full bg-purple-500/10 flex items-center justify-center">
                          <Sparkles className="h-3 w-3 text-purple-600" />
                        </div>
                      )}
                      <div className="text-sm">
                        <span className="font-medium">
                          {activityUser ? activityUser.name : 'AI'}
                        </span>
                        {' '}
                        <span className="text-muted-foreground">{activity.action}</span>
                        {activity.details && (
                          <span className="text-muted-foreground"> - {activity.details}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Comments */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="font-medium mb-4 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              Comments ({issue.comments.length})
            </h2>

            <div className="space-y-4 mb-4">
              {issue.comments.map((comment) => {
                const commentUser = users.find((u) => u.id === comment.userId);
                return (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">{commentUser?.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{commentUser?.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(comment.timestamp)}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">{comment.text}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-2">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
              />
              <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                Post
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Status Control */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="font-medium mb-3 text-sm">Status</h3>
            <Select 
              value={issue.status} 
              onValueChange={(val) => onIssueUpdate(issue.id, { status: val as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Severity Control */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="font-medium mb-3 text-sm">Severity</h3>
            <Select 
              value={issue.severity} 
              onValueChange={(val) => onIssueUpdate(issue.id, { severity: val as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Assignee */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="font-medium mb-3 text-sm">Assignee</h3>
            {assignee && (
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">{assignee.avatar}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-sm font-medium">{assignee.name}</div>
                  <div className="text-xs text-muted-foreground">{assignee.email}</div>
                </div>
              </div>
            )}
          </div>

          {/* Reporter */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="font-medium mb-3 text-sm">Reported By</h3>
            {creator && (
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">{creator.avatar}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-sm font-medium">{creator.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatTimestamp(issue.createdAt)}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Linked Records */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="font-medium mb-3 text-sm flex items-center gap-2">
              <LinkIcon className="h-4 w-4 text-muted-foreground" />
              Linked Records
            </h3>
            <Badge variant="outline" className={entityTypeColors[issue.entityType]}>
              {issue.entityName}
            </Badge>
          </div>

          {/* Actions */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="font-medium mb-3 text-sm">Actions</h3>
            <div className="space-y-2">
              <Button variant="outline" className="w-full" onClick={handleConvertToTask}>
                <CheckSquare className="h-4 w-4 mr-2" />
                Convert to Task
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
