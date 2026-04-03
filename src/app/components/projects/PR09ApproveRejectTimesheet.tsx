import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { BonsaiButton } from '../bonsai/BonsaiButton';
import { BonsaiStatusPill } from '../bonsai/BonsaiStatusPill';

interface PR09ApproveRejectTimesheetProps {
  timesheet: any;
  onBack: () => void;
  onApprove: (comment: string) => void;
  onReject: (reason: string) => void;
}

export function PR09ApproveRejectTimesheet({ timesheet, onBack, onApprove, onReject }: PR09ApproveRejectTimesheetProps) {
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [comment, setComment] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  const entries = [
    { project: 'Website Redesign', task: 'Homepage Design', mon: 8, tue: 6, wed: 8, thu: 7, fri: 5, sat: 0, sun: 0 },
    { project: 'Website Redesign', task: 'Client Feedback Meeting', mon: 0, tue: 2, wed: 0, thu: 1, fri: 0, sat: 0, sun: 0 },
  ];

  const calculateTotal = (entry: any) => {
    return entry.mon + entry.tue + entry.wed + entry.thu + entry.fri + entry.sat + entry.sun;
  };

  const handleApprove = () => {
    onApprove(comment);
    setShowApproveConfirm(false);
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    onReject(rejectReason);
    setShowRejectConfirm(false);
  };

  return (
    <div className="p-8">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-stone-600 hover:text-stone-800 mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Approvals
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-stone-800">Review Timesheet - Week of {timesheet.weekOf}</h1>
          <p className="text-sm text-stone-500">{timesheet.employee} • Submitted {timesheet.submittedDate}</p>
        </div>
        <BonsaiStatusPill status="pending" label="Pending Approval" />
      </div>

      {/* Timesheet Details */}
      <div className="bg-white rounded-lg border border-stone-200 overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-stone-700">Project</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-stone-700">Task</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-stone-700">Mon</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-stone-700">Tue</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-stone-700">Wed</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-stone-700">Thu</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-stone-700">Fri</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-stone-700">Sat</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-stone-700">Sun</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-stone-700 bg-stone-100">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {entries.map((entry, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-3 text-sm text-stone-800">{entry.project}</td>
                  <td className="px-4 py-3 text-sm text-stone-700">{entry.task}</td>
                  <td className="px-4 py-3 text-sm text-center text-stone-700">{entry.mon}h</td>
                  <td className="px-4 py-3 text-sm text-center text-stone-700">{entry.tue}h</td>
                  <td className="px-4 py-3 text-sm text-center text-stone-700">{entry.wed}h</td>
                  <td className="px-4 py-3 text-sm text-center text-stone-700">{entry.thu}h</td>
                  <td className="px-4 py-3 text-sm text-center text-stone-700">{entry.fri}h</td>
                  <td className="px-4 py-3 text-sm text-center text-stone-700">{entry.sat}h</td>
                  <td className="px-4 py-3 text-sm text-center text-stone-700">{entry.sun}h</td>
                  <td className="px-4 py-3 text-sm text-center font-semibold text-stone-800 bg-stone-50">
                    {calculateTotal(entry)}h
                  </td>
                </tr>
              ))}
              <tr className="bg-stone-100 font-semibold">
                <td colSpan={2} className="px-4 py-3 text-sm text-stone-800">Weekly Total</td>
                <td className="px-4 py-3 text-sm text-center">8h</td>
                <td className="px-4 py-3 text-sm text-center">8h</td>
                <td className="px-4 py-3 text-sm text-center">8h</td>
                <td className="px-4 py-3 text-sm text-center">8h</td>
                <td className="px-4 py-3 text-sm text-center">5h</td>
                <td className="px-4 py-3 text-sm text-center">0h</td>
                <td className="px-4 py-3 text-sm text-center">0h</td>
                <td className="px-4 py-3 text-sm text-center font-bold text-primary bg-primary/10">{timesheet.totalHours}h</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Approve Confirmation */}
      {showApproveConfirm && (
        <div className="bg-stone-100 border-2 border-stone-200 rounded-lg p-6 mb-6">
          <div className="flex items-start gap-3 mb-4">
            <CheckCircle className="w-6 h-6 text-stone-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-stone-800 mb-2">Approve Timesheet</h3>
              <p className="text-sm text-green-800 mb-4">
                This timesheet will be marked as approved and {timesheet.requiresClientApproval ? 'sent to the client for final approval' : 'moved to billing'}.
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
            <BonsaiButton variant="ghost" onClick={() => setShowApproveConfirm(false)}>
              Cancel
            </BonsaiButton>
            <BonsaiButton variant="primary" icon={<CheckCircle />} onClick={handleApprove}>
              Confirm Approval
            </BonsaiButton>
          </div>
        </div>
      )}

      {/* Reject Confirmation */}
      {showRejectConfirm && (
        <div className="bg-stone-100 border-2 border-red-200 rounded-lg p-6 mb-6">
          <div className="flex items-start gap-3 mb-4">
            <XCircle className="w-6 h-6 text-stone-700 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 mb-2">Reject Timesheet</h3>
              <p className="text-sm text-red-800 mb-4">
                The timesheet will be returned to {timesheet.employee} with your feedback for corrections.
              </p>
              <label className="block text-sm font-medium text-red-900 mb-2">
                Rejection Reason * <span className="font-normal text-stone-700">(Required)</span>
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-white border border-red-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 resize-none"
                placeholder="Please explain what needs to be corrected..."
                required
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-3">
            <BonsaiButton variant="ghost" onClick={() => setShowRejectConfirm(false)}>
              Cancel
            </BonsaiButton>
            <BonsaiButton variant="destructive" icon={<XCircle />} onClick={handleReject}>
              Confirm Rejection
            </BonsaiButton>
          </div>
        </div>
      )}

      {/* Actions */}
      {!showApproveConfirm && !showRejectConfirm && (
        <div className="flex items-center justify-end gap-3">
          <BonsaiButton
            variant="ghost"
            icon={<XCircle />}
            onClick={() => setShowRejectConfirm(true)}
          >
            Reject
          </BonsaiButton>
          <BonsaiButton
            variant="primary"
            icon={<CheckCircle />}
            onClick={() => setShowApproveConfirm(true)}
          >
            Approve
          </BonsaiButton>
        </div>
      )}
    </div>
  );
}
