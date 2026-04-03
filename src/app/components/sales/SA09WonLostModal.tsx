import React, { useState } from 'react';
import { X, ThumbsUp, ThumbsDown } from 'lucide-react';
import { BonsaiButton } from '../bonsai/BonsaiButton';
import { BonsaiInput } from '../bonsai/BonsaiFormFields';

interface SA09WonLostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { outcome: 'won' | 'lost'; reason: string; notes: string; closeValue?: string }) => void;
  dealName: string;
}

export function SA09WonLostModal({ isOpen, onClose, onSave, dealName }: SA09WonLostModalProps) {
  const [outcome, setOutcome] = useState<'won' | 'lost' | null>(null);
  const [formData, setFormData] = useState({
    reason: '',
    closeValue: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (outcome) {
      onSave({
        outcome,
        reason: formData.reason,
        notes: formData.notes,
        closeValue: outcome === 'won' ? formData.closeValue : undefined,
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <div 
          className="bg-white rounded-lg shadow-2xl w-full max-w-lg"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-stone-800">Mark Deal as Won/Lost</h2>
              <p className="text-sm text-stone-500">{dealName}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Outcome Selection */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-3">
                Select Outcome *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setOutcome('won')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    outcome === 'won'
                      ? 'border-green-500 bg-green-50'
                      : 'border-stone-200 hover:border-green-300'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      outcome === 'won' ? 'bg-green-500' : 'bg-stone-100'
                    }`}>
                      <ThumbsUp className={`w-6 h-6 ${outcome === 'won' ? 'text-white' : 'text-stone-400'}`} />
                    </div>
                    <span className={`font-medium ${outcome === 'won' ? 'text-green-700' : 'text-stone-600'}`}>
                      Won
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setOutcome('lost')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    outcome === 'lost'
                      ? 'border-red-500 bg-red-50'
                      : 'border-stone-200 hover:border-red-300'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      outcome === 'lost' ? 'bg-red-500' : 'bg-stone-100'
                    }`}>
                      <ThumbsDown className={`w-6 h-6 ${outcome === 'lost' ? 'text-white' : 'text-stone-400'}`} />
                    </div>
                    <span className={`font-medium ${outcome === 'lost' ? 'text-red-700' : 'text-stone-600'}`}>
                      Lost
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Conditional Fields */}
            {outcome && (
              <>
                {outcome === 'won' && (
                  <BonsaiInput
                    label="Final Close Value"
                    required
                    value={formData.closeValue}
                    onChange={(e) => setFormData({ ...formData, closeValue: e.target.value })}
                    placeholder="$45,000"
                  />
                )}

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    {outcome === 'won' ? 'Why did we win?' : 'Why did we lose?'} *
                  </label>
                  <select
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    required
                  >
                    <option value="">Select a reason...</option>
                    {outcome === 'won' ? (
                      <>
                        <option value="best-price">Best Price</option>
                        <option value="best-solution">Best Solution</option>
                        <option value="relationship">Relationship</option>
                        <option value="timing">Timing</option>
                        <option value="other">Other</option>
                      </>
                    ) : (
                      <>
                        <option value="price">Price too high</option>
                        <option value="competitor">Lost to competitor</option>
                        <option value="timing">Bad timing</option>
                        <option value="no-budget">No budget</option>
                        <option value="requirements">Couldn't meet requirements</option>
                        <option value="other">Other</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                    placeholder="Add any additional context or learnings..."
                  />
                </div>
              </>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
              <BonsaiButton variant="ghost" onClick={onClose} type="button">
                Cancel
              </BonsaiButton>
              <BonsaiButton 
                variant="primary" 
                type="submit"
                disabled={!outcome}
              >
                {outcome === 'won' ? 'Mark as Won' : outcome === 'lost' ? 'Mark as Lost' : 'Submit'}
              </BonsaiButton>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}