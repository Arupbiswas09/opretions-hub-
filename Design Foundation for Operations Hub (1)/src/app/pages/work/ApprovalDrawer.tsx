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
  CheckCircle2,
  XCircle,
  MessageSquare,
  Calendar,
  User,
  FileText,
  Activity,
  AlertCircle,
} from 'lucide-react';
import { Approval } from './types';
import { users } from './data';

interface ApprovalDrawerProps {
  approval: Approval | null;
  open: boolean;
  onClose: () => void;
  onUpdate: (approvalId: string, updates: Partial<Approval>) => void;
}

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

export const ApprovalDrawer: React.FC<ApprovalDrawerProps> = ({ approval, open, onClose, onUpdate }) => {
  const [rejectReason, setRejectReason] = useState('');
  const [newComment, setNewComment] = useState('');

  if (!approval) return null;

  const requester = users.find((u) => u.id === approval.requestedById);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

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

  const handleApprove = () => {
    onUpdate(approval.id, { status: 'approved' });
    onClose();
  };

  const handleReject = () => {
    if (rejectReason.trim()) {
      onUpdate(approval.id, { status: 'rejected' });
      onClose();
      setRejectReason('');
    }
  };

  const handleRequestChanges = () => {
    if (newComment.trim()) {
      // In real app, would add comment and notify requester
      setNewComment('');
    }
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-left">{approval.title}</SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground text-left">
            {approval.type.charAt(0).toUpperCase() + approval.type.slice(1)} approval request
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6 pb-4">
          {/* Status and Type */}
          <div className="flex gap-2 flex-wrap">
            <Badge className={statusColors[approval.status]}>
              {approval.status.charAt(0).toUpperCase() + approval.status.slice(1)}
            </Badge>
            <Badge className={entityTypeColors[approval.entityType]}>
              {approval.entityType.charAt(0).toUpperCase() + approval.entityType.slice(1)}
            </Badge>
            {approval.isOverdue && (
              <Badge className="bg-red-500/10 text-red-600 border-red-500/20">
                Overdue
              </Badge>
            )}
          </div>

          {/* Request Summary */}
          <div className="space-y-4 p-4 border border-border rounded-lg bg-muted/20">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-1">
                  <User className="h-3 w-3" />
                  Requested By
                </label>
                {requester && (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">{requester.avatar}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium">{requester.name}</div>
                      <div className="text-xs text-muted-foreground">{requester.email}</div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-1">
                  <Calendar className="h-3 w-3" />
                  Requested On
                </label>
                <div className="text-sm">{formatTimestamp(approval.requestedAt)}</div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-1">
                  <Calendar className="h-3 w-3" />
                  Due Date
                </label>
                <div className={`text-sm ${approval.isOverdue ? 'text-red-600 font-medium' : ''}`}>
                  {formatDate(approval.dueDate)}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1">Related Entity</label>
                <Badge variant="outline" className={entityTypeColors[approval.entityType]}>
                  {approval.entityName}
                </Badge>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Request Details</label>
            <div className="text-sm text-muted-foreground p-3 border border-border rounded-lg bg-muted/20">
              {approval.description}
            </div>
          </div>

          {/* Attached Document */}
          {approval.documentUrl && (
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Attached Document
              </label>
              <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-muted/20">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="text-sm font-medium">{approval.documentUrl.split('/').pop()}</div>
                    <div className="text-xs text-muted-foreground">PDF Document</div>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  View Document
                </Button>
              </div>
            </div>
          )}

          {/* Comments */}
          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              Comments ({approval.comments.length})
            </label>

            {approval.comments.length > 0 && (
              <div className="space-y-3">
                {approval.comments.map((comment) => {
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
            )}

            <div className="flex gap-2">
              <Textarea
                placeholder="Add a comment or request changes..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={2}
              />
              <Button onClick={handleRequestChanges} disabled={!newComment.trim()}>
                Post
              </Button>
            </div>
          </div>

          {/* Reject Reason (if pending) */}
          {approval.status === 'pending' && (
            <div className="space-y-2 p-4 border border-amber-500/20 rounded-lg bg-amber-500/5">
              <label className="text-sm font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                Rejection Reason (if rejecting)
              </label>
              <Textarea
                placeholder="Provide a reason for rejection..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
              />
            </div>
          )}

          {/* History */}
          {approval.status !== 'pending' && (
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                History
              </label>
              <div className="text-sm text-muted-foreground p-3 border border-border rounded-lg bg-muted/20">
                {approval.status === 'approved' && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    Approved on {formatDate(approval.dueDate)}
                  </div>
                )}
                {approval.status === 'rejected' && (
                  <div className="flex items-center gap-2 text-red-600">
                    <XCircle className="h-4 w-4" />
                    Rejected on {formatDate(approval.dueDate)}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {approval.status === 'pending' && (
          <SheetFooter className="border-t border-border pt-4 mt-6">
            <div className="flex gap-2 w-full">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={handleRequestChanges}
                disabled={!newComment.trim()}
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                Request Changes
              </Button>
              <Button
                variant="outline"
                className="flex-1 text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
                onClick={handleReject}
                disabled={!rejectReason.trim()}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={handleApprove}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Approve
              </Button>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
};
