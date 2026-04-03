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
      alert('Please provide a reason for rejection');
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
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div
          className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${isLeave ? 'bg-stone-100' : 'bg-stone-100'} flex items-center justify-center`}>
                {isLeave ? (
                  <Calendar className="w-5 h-5 text-stone-600" />
                ) : (
                  <DollarSign className="w-5 h-5 text-stone-600" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-stone-800">
                  {isLeave ? 'Leave Request' : 'Expense Claim'}
                </h2>
                <p className="text-sm text-stone-500">{request.employee}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Request Details */}
            {isLeave ? (
              <div className="bg-stone-50 rounded-lg p-6">
                <h3 className="font-semibold text-stone-800 mb-4">Leave Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-stone-600 mb-1">Leave Type</p>
                    <p className="text-sm font-medium text-stone-800">{request.leaveType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-stone-600 mb-1">Duration</p>
                    <p className="text-sm font-medium text-stone-800">
                      {request.days} {request.days === 1 ? 'day' : 'days'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-stone-600 mb-1">Start Date</p>
                    <p className="text-sm font-medium text-stone-800">{request.startDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-stone-600 mb-1">End Date</p>
                    <p className="text-sm font-medium text-stone-800">{request.endDate}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-stone-600 mb-1">Reason</p>
                    <p className="text-sm font-medium text-stone-800">Family vacation</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-stone-50 rounded-lg p-6">
                  <h3 className="font-semibold text-stone-800 mb-4">Expense Summary</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-stone-800">Client Meeting Dinner</p>
                        <p className="text-xs text-stone-600">Meals & Entertainment • Jan 12, 2026</p>
                      </div>
                      <p className="text-sm font-semibold text-stone-800">$145.00</p>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-stone-800">Taxi to/from venue</p>
                        <p className="text-xs text-stone-600">Travel • Jan 12, 2026</p>
                      </div>
                      <p className="text-sm font-semibold text-stone-800">$42.50</p>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-stone-800">Office supplies</p>
                        <p className="text-xs text-stone-600">Office Supplies • Jan 14, 2026</p>
                      </div>
                      <p className="text-sm font-semibold text-stone-800">$85.00</p>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-stone-800">Software license</p>
                        <p className="text-xs text-stone-600">Software & Tools • Jan 15, 2026</p>
                      </div>
                      <p className="text-sm font-semibold text-stone-800">$115.00</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-stone-800">Total Amount</span>
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
              <div className="bg-stone-100 border-2 border-stone-200 rounded-lg p-6">
                <div className="flex items-start gap-3 mb-4">
                  <CheckCircle className="w-6 h-6 text-stone-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-stone-800 mb-2">Approve Request</h3>
                    <p className="text-sm text-green-800 mb-4">
                      This {isLeave ? 'leave request' : 'expense claim'} will be approved and the employee will be notified.
                    </p>
                    <label className="block text-sm font-medium text-stone-800 mb-2">
                      Comment (optional)
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 bg-white border border-green-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 resize-none"
                      placeholder="Add a comment for the employee..."
                    />
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3">
                  <BonsaiButton variant="ghost" onClick={() => setAction(null)}>
                    Cancel
                  </BonsaiButton>
                  <BonsaiButton variant="primary" icon={<CheckCircle />} onClick={handleApprove}>
                    Confirm Approval
                  </BonsaiButton>
                </div>
              </div>
            )}

            {action === 'reject' && (
              <div className="bg-stone-100 border-2 border-red-200 rounded-lg p-6">
                <div className="flex items-start gap-3 mb-4">
                  <XCircle className="w-6 h-6 text-stone-700 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-900 mb-2">Reject Request</h3>
                    <p className="text-sm text-red-800 mb-4">
                      The request will be rejected and returned to the employee with your feedback.
                    </p>
                    <label className="block text-sm font-medium text-red-900 mb-2">
                      Rejection Reason * <span className="font-normal text-stone-700">(Required)</span>
                    </label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 bg-white border border-red-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 resize-none"
                      placeholder="Please explain why this request is being rejected..."
                      required
                    />
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3">
                  <BonsaiButton variant="ghost" onClick={() => setAction(null)}>
                    Cancel
                  </BonsaiButton>
                  <BonsaiButton variant="destructive" icon={<XCircle />} onClick={handleReject}>
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
