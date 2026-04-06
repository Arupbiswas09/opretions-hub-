import React, { useState } from 'react';
import { X, ThumbsUp, ThumbsDown } from 'lucide-react';
import { BonsaiButton } from '../bonsai/BonsaiButton';
import { BonsaiInput, BonsaiSelect } from '../bonsai/BonsaiFormFields';

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
        className="fixed inset-0 z-50 flex items-center justify-center p-4 hub-overlay-backdrop"
        onClick={onClose}
      >
        {/* Modal */}
        <div 
          className="rounded-lg shadow-2xl w-full max-w-lg"
          style={{ background: 'var(--background-2)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div 
            className="px-6 py-4 flex items-center justify-between"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <div>
              <h2 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>Mark Deal as Won/Lost</h2>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{dealName}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-colors"
              style={{ 
                color: 'var(--muted-foreground)',
                background: 'transparent'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--muted)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Outcome Selection */}
            <div>
              <label className="block text-[13px] font-medium mb-3" style={{ color: 'var(--foreground)' }}>
                Select Outcome *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setOutcome('won')}
                  className="p-4 rounded-lg border-2 transition-all"
                  style={{
                    borderColor: outcome === 'won' ? 'var(--success)' : 'var(--border)',
                    background: outcome === 'won' ? 'var(--success-muted)' : 'var(--background)',
                  }}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{
                        background: outcome === 'won' ? 'var(--success)' : 'var(--muted)',
                      }}
                    >
                      <ThumbsUp className={`w-6 h-6 ${outcome === 'won' ? 'text-white' : ''}`} style={{ color: outcome === 'won' ? 'white' : 'var(--muted-foreground)' }} />
                    </div>
                    <span className="font-medium" style={{ color: 'var(--foreground)' }}>
                      Won
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setOutcome('lost')}
                  className="p-4 rounded-lg border-2 transition-all"
                  style={{
                    borderColor: outcome === 'lost' ? 'var(--destructive)' : 'var(--border)',
                    background: outcome === 'lost' ? 'var(--warning-muted)' : 'var(--background)',
                  }}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{
                        background: outcome === 'lost' ? 'var(--destructive)' : 'var(--muted)',
                      }}
                    >
                      <ThumbsDown className={`w-6 h-6 ${outcome === 'lost' ? 'text-white' : ''}`} style={{ color: outcome === 'lost' ? 'white' : 'var(--muted-foreground)' }} />
                    </div>
                    <span className="font-medium" style={{ color: 'var(--foreground)' }}>
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

                <BonsaiSelect
                  label={`${outcome === 'won' ? 'Why did we win?' : 'Why did we lose?'} *`}
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  options={[
                    { value: '', label: 'Select a reason...' },
                    ...(outcome === 'won' ? [
                      { value: 'best-price', label: 'Best Price' },
                      { value: 'best-solution', label: 'Best Solution' },
                      { value: 'relationship', label: 'Relationship' },
                      { value: 'timing', label: 'Timing' },
                      { value: 'other', label: 'Other' },
                    ] : [
                      { value: 'price', label: 'Price too high' },
                      { value: 'competitor', label: 'Lost to competitor' },
                      { value: 'timing', label: 'Bad timing' },
                      { value: 'no-budget', label: 'No budget' },
                      { value: 'requirements', label: 'Couldn\'t meet requirements' },
                      { value: 'other', label: 'Other' },
                    ])
                  ]}
                  required
                />

                <div>
                  <label className="block text-[13px] font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                    Additional Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={4}
                    className="w-full px-3.5 py-2.5 text-[13px] rounded-xl resize-none"
                    style={{
                      background: 'var(--input-background)',
                      border: '1px solid var(--border-strong)',
                      color: 'var(--foreground)',
                    }}
                    placeholder="Add any additional context or learnings..."
                  />
                </div>
              </>
            )}

            {/* Actions */}
            <div 
              className="flex items-center justify-end gap-3 pt-4"
              style={{ borderTop: '1px solid var(--border)' }}
            >
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