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
  CheckSquare,
  AlertCircle,
  Briefcase,
  X,
  MessageSquare,
  Activity,
  Sparkles,
  FileText,
  Link as LinkIcon,
  Building,
  UserCircle,
  Users,
  MoreHorizontal,
} from 'lucide-react';
import { Request } from './request-types';
import { users } from './data';
import { ConversionModal } from './ConversionModal';

interface RequestDrawerProps {
  request: Request | null;
  open: boolean;
  onClose: () => void;
  onUpdate: (updates: Partial<Request>) => void;
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

export const RequestDrawer: React.FC<RequestDrawerProps> = ({ request, open, onClose, onUpdate }) => {
  const [newComment, setNewComment] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [conversionModalOpen, setConversionModalOpen] = useState(false);
  const [conversionType, setConversionType] = useState<'task' | 'issue' | 'project' | null>(null);

  if (!request) return null;

  const config = requestTypeConfig[request.requestType];
  const TypeIcon = config.icon;
  const owner = request.ownerId ? users.find((u) => u.id === request.ownerId) : null;

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

  const handleApprove = () => {
    onUpdate({ status: 'approved' });
  };

  const handleReject = () => {
    if (rejectReason.trim()) {
      onUpdate({ status: 'rejected' });
      setRejectReason('');
      setShowRejectInput(false);
    }
  };

  const handleConvert = (type: 'task' | 'issue' | 'project') => {
    setConversionType(type);
    setConversionModalOpen(true);
  };

  const handleConversionComplete = () => {
    onUpdate({ status: 'converted' });
    setConversionModalOpen(false);
    setConversionType(null);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-left flex items-center gap-2">
              <TypeIcon className="h-5 w-5" />
              {request.subject}
            </SheetTitle>
            <SheetDescription className="text-sm text-muted-foreground text-left">
              {config.label} request from {request.requestedByName}
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 mt-6 pb-4">
            {/* Status and Type Badges */}
            <div className="flex gap-2 flex-wrap">
              <Badge className={config.color}>
                <TypeIcon className="h-3 w-3 mr-1" />
                {config.label}
              </Badge>
              <Badge variant="outline" className={statusColors[request.status]}>
                {request.status === 'in-review' ? 'In Review' : 
                 request.status.charAt(0).toUpperCase() + request.status.slice(1)}
              </Badge>
              <Badge variant="outline">
                {categoryLabels[request.category]}
              </Badge>
            </div>

            {/* Request Summary */}
            <div className="space-y-4 p-4 border border-border rounded-lg bg-muted/20">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Requested By
                  </label>
                  <div>
                    <div className="text-sm font-medium">{request.requestedByName}</div>
                    {request.requestedByOrg && (
                      <div className="text-xs text-muted-foreground">{request.requestedByOrg}</div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Submitted
                  </label>
                  <div className="text-sm">{formatTimestamp(request.submittedDate)}</div>
                </div>

                {request.dueDate && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">
                      Due Date
                    </label>
                    <div className="text-sm">{formatTimestamp(request.dueDate)}</div>
                  </div>
                )}

                {owner && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">
                      Owner
                    </label>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">{owner.avatar}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{owner.name}</span>
                    </div>
                  </div>
                )}
              </div>

              {request.relatedEntityName && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                    <LinkIcon className="h-3 w-3" />
                    Related Entity
                  </label>
                  <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/20">
                    {request.relatedEntityName}
                  </Badge>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <div className="text-sm text-muted-foreground p-3 border border-border rounded-lg bg-muted/20 whitespace-pre-line">
                {request.description}
              </div>
            </div>

            {/* Attachments */}
            {request.attachments && request.attachments.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  Attachments ({request.attachments.length})
                </label>
                <div className="space-y-2">
                  {request.attachments.map((attachment, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 border border-border rounded-lg">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{attachment}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Section */}
            <div className="border border-purple-500/20 rounded-lg p-4 bg-purple-500/5">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <h3 className="font-medium text-sm">AI Analysis</h3>
              </div>
              
              <div className="space-y-3 text-sm">
                <div>
                  <div className="font-medium text-xs text-muted-foreground mb-1">Request Summary</div>
                  <div className="text-sm">
                    {request.category === 'new-talent' && 'Talent acquisition request for specialized role. Recommend creating job requisition.'}
                    {request.category === 'change-request' && 'Scope change request detected. Requires impact analysis and client approval.'}
                    {request.category === 'support' && 'Support request with technical nature. Consider converting to issue for tracking.'}
                    {request.category === 'leave' && 'Time-off request. Check team capacity before approval.'}
                    {request.category === 'payment' && 'Payment-related inquiry. Verify invoice status in finance system.'}
                    {request.category === 'access' && 'Access request. Ensure proper security approval workflow.'}
                    {request.category === 'other' && 'General request. Review details to determine appropriate action.'}
                  </div>
                </div>
                
                <div>
                  <div className="font-medium text-xs text-muted-foreground mb-1">Suggested Classification</div>
                  <div className="text-sm">
                    {request.category === 'support' && 'Convert to Issue (Technical problem requiring investigation)'}
                    {request.category === 'new-talent' && 'Convert to Job Requirement (Hiring process needed)'}
                    {(request.category === 'change-request' || request.category === 'other') && 'Convert to Task (Action item to be tracked)'}
                    {(request.category === 'leave' || request.category === 'payment' || request.category === 'access') && 'Approve or Reject (Simple decision gate)'}
                  </div>
                </div>

                <div>
                  <div className="font-medium text-xs text-muted-foreground mb-1">Suggested Next Action</div>
                  <div className="text-sm">
                    {request.status === 'new' && 'Assign an owner and move to In Review'}
                    {request.status === 'in-review' && 'Gather additional information or convert to appropriate work type'}
                    {request.status === 'approved' && 'Create tasks or notify requester of approval'}
                  </div>
                </div>
              </div>
            </div>

            {/* Communication Thread */}
            <div className="space-y-3">
              <label className="text-sm font-medium flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                Communication Thread ({request.comments.length})
              </label>

              {request.comments.length > 0 && (
                <div className="space-y-3">
                  {request.comments.map((comment) => {
                    const commentUser = users.find((u) => u.id === comment.userId);
                    return (
                      <div key={comment.id} className="flex gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">{commentUser?.avatar || '?'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">{commentUser?.name || 'Unknown'}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatTimestamp(comment.timestamp)}
                            </span>
                            {comment.isInternal && (
                              <Badge variant="outline" className="text-xs">Internal</Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">{comment.text}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex gap-2">
                <Textarea
                  placeholder="Add a comment (visible to requester)..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={2}
                />
                <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                  Post
                </Button>
              </div>
            </div>

            {/* Activity Timeline */}
            <div className="space-y-3">
              <label className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                Activity Timeline
              </label>

              <div className="space-y-2">
                {request.activityLog.map((activity) => {
                  const activityUser = activity.userId === 'system' ? null : users.find((u) => u.id === activity.userId);
                  
                  return (
                    <div key={activity.id} className="flex gap-3 text-sm">
                      <div className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatTimestamp(activity.timestamp)}
                      </div>
                      <div className="flex items-center gap-1">
                        {activityUser ? (
                          <span className="font-medium">{activityUser.name}</span>
                        ) : (
                          <span className="font-medium">System</span>
                        )}
                        <span className="text-muted-foreground">{activity.action}</span>
                        {activity.details && (
                          <span className="text-muted-foreground">- {activity.details}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Reject Reason Input */}
            {showRejectInput && (
              <div className="space-y-2 p-4 border border-red-500/20 rounded-lg bg-red-500/5">
                <label className="text-sm font-medium">Rejection Reason</label>
                <Textarea
                  placeholder="Provide a reason for rejecting this request..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowRejectInput(false);
                      setRejectReason('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleReject}
                    disabled={!rejectReason.trim()}
                  >
                    Confirm Rejection
                  </Button>
                </div>
              </div>
            )}

            {/* Converted Notice */}
            {request.convertedTo && (
              <div className="p-4 border border-purple-500/20 rounded-lg bg-purple-500/5">
                <div className="flex items-center gap-2 text-sm">
                  <CheckSquare className="h-4 w-4 text-purple-600" />
                  <span className="font-medium">This request has been converted to a {request.convertedTo.type}</span>
                </div>
              </div>
            )}
          </div>

          {request.status !== 'converted' && request.status !== 'rejected' && request.status !== 'fulfilled' && (
            <SheetFooter className="border-t border-border pt-4 mt-6">
              <div className="flex gap-2 w-full flex-wrap">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleConvert('task')}
                >
                  <CheckSquare className="h-4 w-4 mr-2" />
                  Convert to Task
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleConvert('issue')}
                >
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Convert to Issue
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleConvert('project')}
                >
                  <Briefcase className="h-4 w-4 mr-2" />
                  Convert to Project
                </Button>
              </div>
              
              <div className="flex gap-2 w-full mt-2">
                {request.status === 'new' || request.status === 'in-review' ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={handleApprove}
                      className="flex-1"
                    >
                      <CheckSquare className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowRejectInput(true)}
                      className="flex-1 text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </>
                ) : null}
              </div>
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>

      {/* Conversion Modal */}
      {conversionType && (
        <ConversionModal
          open={conversionModalOpen}
          onClose={() => {
            setConversionModalOpen(false);
            setConversionType(null);
          }}
          request={request}
          conversionType={conversionType}
          onComplete={handleConversionComplete}
        />
      )}
    </>
  );
};
