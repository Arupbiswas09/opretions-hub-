import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/app/components/ui/sheet';
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

interface IssueDrawerProps {
  issue: Issue | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updates: Partial<Issue>) => void;
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

export const IssueDrawer: React.FC<IssueDrawerProps> = ({ issue, isOpen, onClose, onUpdate }) => {
  const [newComment, setNewComment] = useState('');

  if (!issue) return null;

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
      setNewComment('');
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-left">{issue.title}</SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground text-left">
            Issue reported on {formatTimestamp(issue.createdAt)}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6 pb-4">
          {/* Badges */}
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

          {/* Controls Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={issue.status} onValueChange={(val) => onUpdate({ status: val as any })}>
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

            <div className="space-y-2">
              <label className="text-sm font-medium">Severity</label>
              <Select value={issue.severity} onValueChange={(val) => onUpdate({ severity: val as any })}>
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
          </div>

          {/* Assignee & Reporter */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Assignee</label>
              {assignee && (
                <div className="flex items-center gap-2 p-2 border border-border rounded-lg">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">{assignee.avatar}</AvatarFallback>
                  </Avatar>
                  <div className="text-sm">{assignee.name}</div>
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Reported By</label>
              {creator && (
                <div className="flex items-center gap-2 p-2 border border-border rounded-lg">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">{creator.avatar}</AvatarFallback>
                  </Avatar>
                  <div className="text-sm">{creator.name}</div>
                </div>
              )}
            </div>
          </div>

          {/* Linked Entity */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <LinkIcon className="h-4 w-4 text-muted-foreground" />
              Linked Records
            </label>
            <Badge variant="outline" className={entityTypeColors[issue.entityType]}>
              {issue.entityName}
            </Badge>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <div className="text-sm text-muted-foreground p-3 border border-border rounded-lg bg-muted/20">
              {issue.description}
            </div>
          </div>

          {/* AI Section */}
          <div className="border border-purple-500/20 rounded-lg p-4 bg-purple-500/5">
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
          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              Activity Timeline
            </label>

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
          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              Comments ({issue.comments.length})
            </label>

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

        <SheetFooter className="border-t border-border pt-4 mt-6">
          <div className="flex gap-2 w-full">
            <Button variant="outline" className="flex-1">
              <CheckSquare className="h-4 w-4 mr-2" />
              Convert to Task
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
