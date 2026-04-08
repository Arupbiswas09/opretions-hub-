'use client';

import React, { useEffect, useState } from 'react';
import { X, Calendar } from 'lucide-react';
import { BonsaiButton } from '../bonsai/BonsaiButton';
import { BonsaiInput } from '../bonsai/BonsaiFormFields';
import { BodyPortal } from '../ui/Overlays';

interface PE05LeaveRequestDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (request: any) => void;
}

export function PE05LeaveRequestDrawer({ isOpen, onClose, onSubmit }: PE05LeaveRequestDrawerProps) {
  const [formData, setFormData] = useState({
    type: 'Vacation',
    startDate: '',
    endDate: '',
    reason: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  const calculateDays = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  if (!isOpen) return null;

  return (
    <BodyPortal>
      <>
        <div className="fixed inset-0 z-[100] bg-black/50" onClick={onClose} aria-hidden />

        <div className="fixed right-0 top-0 z-[101] flex h-[100dvh] max-h-[100dvh] min-h-0 w-full max-w-xl flex-col overflow-hidden bg-white shadow-2xl">
          <div className="flex flex-shrink-0 items-center justify-between border-b border-stone-200 bg-white px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-stone-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-stone-800">Request Time Off</h2>
              <p className="text-sm text-stone-500">Submit a leave request</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
          </div>

          <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]">
            <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {/* Leave Type */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Leave Type *</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              required
            >
              <option value="Vacation">Vacation</option>
              <option value="Sick Leave">Sick Leave</option>
              <option value="Personal">Personal</option>
              <option value="Unpaid">Unpaid Leave</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <BonsaiInput
              label="Start Date"
              type="date"
              required
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            />
            <BonsaiInput
              label="End Date"
              type="date"
              required
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            />
          </div>

          {/* Duration Display */}
          {formData.startDate && formData.endDate && (
            <div className="p-4 bg-stone-100 border border-stone-200 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-800">Total Duration</span>
                <span className="text-lg font-semibold text-stone-800">
                  {calculateDays()} {calculateDays() === 1 ? 'day' : 'days'}
                </span>
              </div>
            </div>
          )}

          {/* Reason */}
          <BonsaiInput
            label="Reason"
            required
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            placeholder="Brief reason for leave"
          />

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Additional Notes (optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              placeholder="Any additional information..."
            />
          </div>

          {/* Info */}
          <div className="p-4 bg-stone-50 border border-stone-200 rounded-lg">
            <p className="text-xs text-stone-700">
              <strong>What happens next?</strong> Your request will be sent to your manager for approval. 
              You'll receive a notification once it's reviewed.
            </p>
          </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 border-t border-stone-200 pt-4">
                <BonsaiButton variant="ghost" onClick={onClose} type="button">
                  Cancel
                </BonsaiButton>
                <BonsaiButton variant="primary" type="submit">
                  Submit Request
                </BonsaiButton>
              </div>
            </form>
          </div>
        </div>
      </>
    </BodyPortal>
  );
}
