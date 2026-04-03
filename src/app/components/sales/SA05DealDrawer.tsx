import React, { useState } from 'react';
import { X } from 'lucide-react';
import { BonsaiButton } from '../bonsai/BonsaiButton';
import { BonsaiInput } from '../bonsai/BonsaiFormFields';

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
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-white shadow-2xl z-50 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-stone-800">
              {initialDeal ? 'Edit Deal' : 'Create New Deal'}
            </h2>
            <p className="text-sm text-stone-500">Fill in the details below</p>
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
          {/* Deal Information */}
          <div>
            <h3 className="font-semibold text-stone-800 mb-4">Deal Information</h3>
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
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Deal Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    required
                  >
                    <option value="Project">Project Deal</option>
                    <option value="Talent">Talent Deal</option>
                  </select>
                </div>

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
            <h3 className="font-semibold text-stone-800 mb-4">Sales Information</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Stage *
                  </label>
                  <select
                    value={formData.stage}
                    onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    required
                  >
                    {formData.type === 'Project' ? (
                      <>
                        <option value="New Lead">New Lead</option>
                        <option value="Qualified">Qualified</option>
                        <option value="Discovery Scheduled">Discovery Scheduled</option>
                        <option value="Proposal Sent">Proposal Sent</option>
                        <option value="Negotiation">Negotiation</option>
                      </>
                    ) : (
                      <>
                        <option value="New Request">New Request</option>
                        <option value="Qualified">Qualified</option>
                        <option value="Profiles Shared">Profiles Shared</option>
                        <option value="Interviewing">Interviewing</option>
                        <option value="Placement">Placement</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Owner *
                  </label>
                  <select
                    value={formData.owner}
                    onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    required
                  >
                    <option value="John Doe">John Doe</option>
                    <option value="Jane Smith">Jane Smith</option>
                    <option value="Mike Johnson">Mike Johnson</option>
                    <option value="Sarah Lee">Sarah Lee</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <BonsaiInput
                  label="Expected Close Date"
                  type="date"
                  value={formData.expectedClose}
                  onChange={(e) => setFormData({ ...formData, expectedClose: e.target.value })}
                />

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
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
                    <span className="text-sm font-medium text-stone-800 w-12">{formData.probability}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              placeholder="Brief description of the opportunity..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
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