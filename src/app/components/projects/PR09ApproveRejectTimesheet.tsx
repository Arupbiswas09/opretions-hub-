import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { BonsaiButton } from '../bonsai/BonsaiButton';
import { BonsaiStatusPill } from '../bonsai/BonsaiStatusPill';
import { dashboardFoldRootRelaxedClass, DashboardScrollPanel } from '../dashboard/DashboardFoldLayout';

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
      return;
      return;
    }
    onReject(rejectReason);
    setShowRejectConfirm(false);
  };

  const ta =
    'w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20';

  return (
    <div className={dashboardFoldRootRelaxedClass}>
      <button
        type="button"
        onClick={onBack}
        className="mb-2 flex items-center gap-2 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Week of {timesheet.weekOf}
          </h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            {timesheet.employee} · {timesheet.submittedDate}
          </p>
        </div>
        <BonsaiStatusPill status="pending" label="Pending" />
      </div>

      <DashboardScrollPanel size="lg" className="-mr-0.5 min-h-[200px]">
        <div className="hub-surface hub-surface-elevated mb-4 overflow-hidden rounded-2xl sm:mb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/35">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Project</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Task</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Mon</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Tue</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Wed</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Thu</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Fri</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Sat</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Sun</th>
                  <th className="bg-muted/50 px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {entries.map((entry, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-3 text-sm text-foreground">{entry.project}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{entry.task}</td>
                    <td className="px-4 py-3 text-center text-sm tabular-nums text-muted-foreground">{entry.mon}h</td>
                    <td className="px-4 py-3 text-center text-sm tabular-nums text-muted-foreground">{entry.tue}h</td>
                    <td className="px-4 py-3 text-center text-sm tabular-nums text-muted-foreground">{entry.wed}h</td>
                    <td className="px-4 py-3 text-center text-sm tabular-nums text-muted-foreground">{entry.thu}h</td>
                    <td className="px-4 py-3 text-center text-sm tabular-nums text-muted-foreground">{entry.fri}h</td>
                    <td className="px-4 py-3 text-center text-sm tabular-nums text-muted-foreground">{entry.sat}h</td>
                    <td className="px-4 py-3 text-center text-sm tabular-nums text-muted-foreground">{entry.sun}h</td>
                    <td className="bg-muted/30 px-4 py-3 text-center text-sm font-semibold tabular-nums text-foreground">
                      {calculateTotal(entry)}h
                    </td>
                  </tr>
                ))}
                <tr className="bg-muted/40 font-semibold">
                  <td colSpan={2} className="px-4 py-3 text-sm text-foreground">
                    Week total
                  </td>
                  <td className="px-4 py-3 text-center text-sm tabular-nums">8h</td>
                  <td className="px-4 py-3 text-center text-sm tabular-nums">8h</td>
                  <td className="px-4 py-3 text-center text-sm tabular-nums">8h</td>
                  <td className="px-4 py-3 text-center text-sm tabular-nums">8h</td>
                  <td className="px-4 py-3 text-center text-sm tabular-nums">5h</td>
                  <td className="px-4 py-3 text-center text-sm tabular-nums">0h</td>
                  <td className="px-4 py-3 text-center text-sm tabular-nums">0h</td>
                  <td className="bg-primary/10 px-4 py-3 text-center text-sm font-bold tabular-nums text-primary">
                    {timesheet.totalHours}h
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </DashboardScrollPanel>

      {showApproveConfirm && (
        <div className="mb-6 rounded-2xl border border-border bg-muted/25 p-5 sm:p-6">
          <div className="mb-4 flex items-start gap-3">
            <CheckCircle className="mt-0.5 h-6 w-6 shrink-0 text-primary" />
            <div className="min-w-0 flex-1">
              <h3 className="mb-2 font-semibold text-foreground">Approve</h3>
              <p className="mb-4 text-[13px] text-muted-foreground">
                {timesheet.requiresClientApproval ? 'Forwarded for client sign-off.' : 'Ready for billing.'}
              </p>
              <label className="mb-2 block text-sm font-medium text-foreground">Note</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className={ta}
                placeholder="Optional"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <BonsaiButton variant="ghost" onClick={() => setShowApproveConfirm(false)}>
              Cancel
            </BonsaiButton>
            <BonsaiButton variant="primary" icon={<CheckCircle className="h-4 w-4" />} onClick={handleApprove}>
              Confirm
            </BonsaiButton>
          </div>
        </div>
      )}

      {showRejectConfirm && (
        <div className="mb-6 rounded-2xl border border-destructive/25 bg-destructive/5 p-5 sm:p-6">
          <div className="mb-4 flex items-start gap-3">
            <XCircle className="mt-0.5 h-6 w-6 shrink-0 text-destructive" />
            <div className="min-w-0 flex-1">
              <h3 className="mb-2 font-semibold text-destructive">Reject</h3>
              <p className="mb-4 text-[13px] text-muted-foreground">Returns to {timesheet.employee}.</p>
              <label className="mb-2 block text-sm font-medium text-foreground">Reason</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                className={`${ta} border-destructive/30`}
                placeholder="Required"
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <BonsaiButton variant="ghost" onClick={() => setShowRejectConfirm(false)}>
              Cancel
            </BonsaiButton>
            <BonsaiButton variant="destructive" icon={<XCircle className="h-4 w-4" />} onClick={handleReject}>
              Confirm
            </BonsaiButton>
          </div>
        </div>
      )}

      {/* Actions */}
      {!showApproveConfirm && !showRejectConfirm && (
        <div className="flex items-center justify-end gap-3">
          <BonsaiButton
            variant="ghost"
            icon={<XCircle className="h-4 w-4" />}
            onClick={() => setShowRejectConfirm(true)}
          >
            Reject
          </BonsaiButton>
          <BonsaiButton
            variant="primary"
            icon={<CheckCircle className="h-4 w-4" />}
            onClick={() => setShowApproveConfirm(true)}
          >
            Approve
          </BonsaiButton>
        </div>
      )}
    </div>
  );
}
