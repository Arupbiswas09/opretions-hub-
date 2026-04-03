import React, { useState } from 'react';
import { X } from 'lucide-react';
import { BonsaiButton } from '../bonsai/BonsaiButton';
import { BonsaiInput } from '../bonsai/BonsaiFormFields';

interface SA07ProposalDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (proposal: any) => void;
}

export function SA07ProposalDrawer({ isOpen, onClose, onSave }: SA07ProposalDrawerProps) {
  const [formData, setFormData] = useState({
    name: '',
    version: '1.0',
    amount: '',
    validUntil: '',
    status: 'Draft',
    items: [
      { description: '', quantity: '1', rate: '', amount: '' }
    ],
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const addLineItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: '1', rate: '', amount: '' }]
    });
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
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-3xl bg-white shadow-2xl z-50 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-stone-800">Create Proposal</h2>
            <p className="text-sm text-stone-500">Build a detailed proposal</p>
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
          {/* Basic Information */}
          <div>
            <h3 className="font-semibold text-stone-800 mb-4">Basic Information</h3>
            <div className="space-y-4">
              <BonsaiInput
                label="Proposal Name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Website Redesign Proposal"
              />

              <div className="grid grid-cols-3 gap-4">
                <BonsaiInput
                  label="Version"
                  required
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  placeholder="1.0"
                />

                <BonsaiInput
                  label="Total Amount"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="$45,000"
                />

                <BonsaiInput
                  label="Valid Until"
                  type="date"
                  required
                  value={formData.validUntil}
                  onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Status *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                >
                  <option value="Draft">Draft</option>
                  <option value="Sent">Sent</option>
                  <option value="Viewed">Viewed</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Declined">Declined</option>
                </select>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-stone-800">Line Items</h3>
              <button
                type="button"
                onClick={addLineItem}
                className="text-sm text-primary hover:underline"
              >
                + Add Item
              </button>
            </div>
            
            <div className="space-y-3">
              {formData.items.map((item, index) => (
                <div key={index} className="p-4 bg-stone-50 rounded-lg space-y-3">
                  <BonsaiInput
                    label="Description"
                    value={item.description}
                    onChange={(e) => {
                      const newItems = [...formData.items];
                      newItems[index].description = e.target.value;
                      setFormData({ ...formData, items: newItems });
                    }}
                    placeholder="Website design and development"
                  />
                  <div className="grid grid-cols-3 gap-3">
                    <BonsaiInput
                      label="Quantity"
                      type="number"
                      value={item.quantity}
                      onChange={(e) => {
                        const newItems = [...formData.items];
                        newItems[index].quantity = e.target.value;
                        setFormData({ ...formData, items: newItems });
                      }}
                    />
                    <BonsaiInput
                      label="Rate"
                      value={item.rate}
                      onChange={(e) => {
                        const newItems = [...formData.items];
                        newItems[index].rate = e.target.value;
                        setFormData({ ...formData, items: newItems });
                      }}
                      placeholder="$5,000"
                    />
                    <BonsaiInput
                      label="Amount"
                      value={item.amount}
                      onChange={(e) => {
                        const newItems = [...formData.items];
                        newItems[index].amount = e.target.value;
                        setFormData({ ...formData, items: newItems });
                      }}
                      placeholder="$5,000"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Notes & Terms
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              placeholder="Payment terms, deliverables, timeline..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
            <BonsaiButton variant="ghost" onClick={onClose} type="button">
              Cancel
            </BonsaiButton>
            <BonsaiButton variant="primary" type="submit">
              Create Proposal
            </BonsaiButton>
          </div>
        </form>
      </div>
    </>
  );
}