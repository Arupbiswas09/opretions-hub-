import React, { useState } from 'react';
import { X, CheckCircle, XCircle, Calendar, DollarSign } from 'lucide-react';
import { BonsaiButton } from '../bonsai/BonsaiButton';

interface PE07ApproveRejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: (comment: string) => void;
  onReject: (reason: string) => void;
  request: any;
}

export function PE07ApproveRejectModal({ isOpen, onClose, onApprove, onReject, request }: PE07ApproveRejectModalProps) {
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [comment, setComment] = useState('');
  const [reason, setReason] = useState('');

  const handleApprove = () => {
    onApprove(comment);
    setAction(null);
    setComment('');
    onClose();
  };

  const handleReject = () => {
    if (!reason.trim()) {
      return;
      return;
    }
    onReject(reason);
    setAction(null);
    setReason('');
    onClose();
  };

  if (!isOpen || !request) return null;

  const isLeave = request.type === 'leave';

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 hub-modal-overlay" onClick={onClose}>
        <div
          className="hub-modal-solid rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                {isLeave ? (
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <DollarSign className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  {isLeave ? 'Leave Request' : 'Expense Claim'}
                </h2>
                <p className="text-sm text-muted-foreground">{request.employee}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Request Details */}
            {isLeave ? (
              <div className="bg-muted/25 border border-border rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-4">Leave details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Leave type</p>
                    <p className="text-sm font-medium text-foreground">{request.leaveType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Duration</p>
                    <p className="text-sm font-medium text-foreground">
                      {request.days} {request.days === 1 ? 'day' : 'days'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Start date</p>
                    <p className="text-sm font-medium text-foreground">{request.startDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">End date</p>
                    <p className="text-sm font-medium text-foreground">{request.endDate}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground mb-1">Reason</p>
                    <p className="text-sm font-medium text-foreground">Family vacation</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-muted/25 border border-border rounded-lg p-6">
                  <h3 className="font-semibold text-foreground mb-4">Expense summary</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted/30 border border-border rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-foreground">Client Meeting Dinner</p>
                        <p className="text-xs text-muted-foreground">Meals & Entertainment • Jan 12, 2026</p>
                      </div>
                      <p className="text-sm font-semibold text-foreground">$145.00</p>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/30 border border-border rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-foreground">Taxi to/from venue</p>
                        <p className="text-xs text-muted-foreground">Travel • Jan 12, 2026</p>
                      </div>
                      <p className="text-sm font-semibold text-foreground">$42.50</p>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/30 border border-border rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-foreground">Office supplies</p>
                        <p className="text-xs text-muted-foreground">Office Supplies • Jan 14, 2026</p>
                      </div>
                      <p className="text-sm font-semibold text-foreground">$85.00</p>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/30 border border-border rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-foreground">Software license</p>
                        <p className="text-xs text-muted-foreground">Software & Tools • Jan 15, 2026</p>
                      </div>
                      <p className="text-sm font-semibold text-foreground">$115.00</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">Total amount</span>
                    <span className="text-2xl font-bold text-primary">${request.amount?.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Forms */}
            {action === null && (
              <div className="flex items-center justify-center gap-3 pt-4">
                <BonsaiButton
                  variant="ghost"
                  icon={<XCircle />}
                  onClick={() => setAction('reject')}
                >
                  Reject
                </BonsaiButton>
                <BonsaiButton
                  variant="primary"
                  icon={<CheckCircle />}
                  onClick={() => setAction('approve')}
                >
                  Approve
                </BonsaiButton>
              </div>
            )}

            {action === 'approve' && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
                <div className="flex items-start gap-3 mb-4">
                  <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-2">Approve request</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      This {isLeave ? 'leave request' : 'expense claim'} will be approved and the employee will be notified.
                    </p>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Comment (optional)
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={3}
                      className="hub-field px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none"
                      placeholder="Add a comment for the employee..."
                    />
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3">
                  <BonsaiButton variant="ghost" onClick={() => setAction(null)} type="button">
                    Cancel
                  </BonsaiButton>
                  <BonsaiButton variant="primary" icon={<CheckCircle />} onClick={handleApprove} type="button">
                    Confirm Approval
                  </BonsaiButton>
                </div>
              </div>
            )}

            {action === 'reject' && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6">
                <div className="flex items-start gap-3 mb-4">
                  <XCircle className="w-6 h-6 text-destructive flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-900 mb-2">Reject Request</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      The request will be rejected and returned to the employee with your feedback.
                    </p>
                    <label className="block text-sm font-medium text-red-900 mb-2">
                      Rejection Reason * <span className="font-normal text-muted-foreground">(Required)</span>
                    </label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={3}
                      className="hub-field px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none"
                      placeholder="Please explain why this request is being rejected..."
                      required
                    />
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3">
                  <BonsaiButton variant="ghost" onClick={() => setAction(null)} type="button">
                    Cancel
                  </BonsaiButton>
                  <BonsaiButton variant="destructive" icon={<XCircle />} onClick={handleReject} type="button">
                    Confirm Rejection
                  </BonsaiButton>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
