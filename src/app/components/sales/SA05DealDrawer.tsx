import React, { useState } from 'react';
import { X } from 'lucide-react';
import { BonsaiButton } from '../bonsai/BonsaiButton';
import { BonsaiInput, BonsaiSelect } from '../bonsai/BonsaiFormFields';

interface SA05DealDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (deal: any) => void;
  initialDeal?: any;
}

export function SA05DealDrawer({ isOpen, onClose, onSave, initialDeal }: SA05DealDrawerProps) {
  const [formData, setFormData] = useState(initialDeal || {
    name: '',
    client: '',
    type: 'Project',
    value: '',
    stage: 'New Lead',
    owner: 'John Doe',
    expectedClose: '',
    probability: '50',
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 z-40 hub-overlay-backdrop"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div 
        className="fixed right-0 top-0 bottom-0 w-full max-w-2xl shadow-2xl z-50 overflow-y-auto"
        style={{ background: 'var(--background-2)' }}
      >
        {/* Header */}
        <div 
          className="sticky top-0 px-6 py-4 flex items-center justify-between"
          style={{ 
            background: 'var(--background-2)',
            borderBottom: '1px solid var(--border)' 
          }}
        >
          <div>
            <h2 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>
              {initialDeal ? 'Edit Deal' : 'Create New Deal'}
            </h2>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Fill in the details below</p>
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
          {/* Deal Information */}
          <div>
            <h3 className="font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Deal Information</h3>
            <div className="space-y-4">
              <BonsaiInput
                label="Deal Name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Website Redesign Project"
              />

              <BonsaiInput
                label="Client"
                required
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                placeholder="e.g., Acme Corp"
              />

              <div className="grid grid-cols-2 gap-4">
                <BonsaiSelect
                  label="Deal Type *"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  options={[
                    { value: 'Project', label: 'Project Deal' },
                    { value: 'Talent', label: 'Talent Deal' }
                  ]}
                  required
                />

                <BonsaiInput
                  label="Deal Value"
                  required
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  placeholder="$45,000"
                />
              </div>
            </div>
          </div>

          {/* Sales Information */}
          <div>
            <h3 className="font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Sales Information</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <BonsaiSelect
                  label="Stage *"
                  value={formData.stage}
                  onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                  options={
                    formData.type === 'Project' ? [
                      { value: 'New Lead', label: 'New Lead' },
                      { value: 'Qualified', label: 'Qualified' },
                      { value: 'Discovery Scheduled', label: 'Discovery Scheduled' },
                      { value: 'Proposal Sent', label: 'Proposal Sent' },
                      { value: 'Negotiation', label: 'Negotiation' },
                    ] : [
                      { value: 'New Request', label: 'New Request' },
                      { value: 'Qualified', label: 'Qualified' },
                      { value: 'Profiles Shared', label: 'Profiles Shared' },
                      { value: 'Interviewing', label: 'Interviewing' },
                      { value: 'Placement', label: 'Placement' },
                    ]
                  }
                  required
                />

                <BonsaiSelect
                  label="Owner *"
                  value={formData.owner}
                  onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                  options={[
                    { value: 'John Doe', label: 'John Doe' },
                    { value: 'Jane Smith', label: 'Jane Smith' },
                    { value: 'Mike Johnson', label: 'Mike Johnson' },
                    { value: 'Sarah Lee', label: 'Sarah Lee' },
                  ]}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <BonsaiInput
                  label="Expected Close Date"
                  type="date"
                  value={formData.expectedClose}
                  onChange={(e) => setFormData({ ...formData, expectedClose: e.target.value })}
                />

                <div>
                  <label className="block text-[13px] font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                    Probability
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={formData.probability}
                      onChange={(e) => setFormData({ ...formData, probability: e.target.value })}
                      className="flex-1"
                    />
                    <span className="text-[13px] font-medium w-12" style={{ color: 'var(--foreground)' }}>{formData.probability}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[13px] font-medium mb-2" style={{ color: 'var(--foreground)' }}>
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-3.5 py-2.5 text-[13px] rounded-xl resize-none"
              style={{
                background: 'var(--input-background)',
                border: '1px solid var(--border-strong)',
                color: 'var(--foreground)',
              }}
              placeholder="Brief description of the opportunity..."
            />
          </div>

          {/* Actions */}
          <div 
            className="flex items-center justify-end gap-3 pt-4"
            style={{ borderTop: '1px solid var(--border)' }}
          >
            <BonsaiButton variant="ghost" onClick={onClose} type="button">
              Cancel
            </BonsaiButton>
            <BonsaiButton variant="primary" type="submit">
              {initialDeal ? 'Save Changes' : 'Create Deal'}
            </BonsaiButton>
          </div>
        </form>
      </div>
    </>
  );
}