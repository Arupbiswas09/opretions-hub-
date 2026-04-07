import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { BonsaiButton } from '../bonsai/BonsaiButton';
import { BonsaiInput } from '../bonsai/BonsaiFormFields';

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

interface FI04InvoiceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (invoice: any) => void;
  initialInvoice?: any;
}

export function FI04InvoiceDrawer({ isOpen, onClose, onSave, initialInvoice }: FI04InvoiceDrawerProps) {
  const [formData, setFormData] = useState(initialInvoice || {
    client: '',
    invoiceNumber: '',
    date: '',
    dueDate: '',
    notes: '',
    terms: 'Net 30',
  });

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: '1', description: '', quantity: 1, rate: 0 },
  ]);

  const addLineItem = () => {
    setLineItems([...lineItems, {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      rate: 0,
    }]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter(item => item.id !== id));
    }
  };

  const updateLineItem = (id: string, field: string, value: any) => {
    setLineItems(lineItems.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, lineItems });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 hub-overlay-backdrop" onClick={onClose} />
      
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-3xl hub-modal-solid shadow-2xl z-50 overflow-y-auto">
        <div className="sticky top-0 bg-[var(--background-2)] border-b border-border px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              {initialInvoice ? 'Edit Invoice' : 'Create Invoice'}
            </h2>
            <p className="text-sm text-muted-foreground">Add invoice details and line items</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Invoice Info */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Invoice information</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <BonsaiInput
                  label="Client"
                  required
                  value={formData.client}
                  onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                  placeholder="Select client"
                />
                <BonsaiInput
                  label="Invoice Number"
                  required
                  value={formData.invoiceNumber}
                  onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                  placeholder="INV-2026-001"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <BonsaiInput
                  label="Invoice Date"
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
                <BonsaiInput
                  label="Due Date"
                  type="date"
                  required
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Payment terms</label>
                <select
                  value={formData.terms}
                  onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                  className="hub-field px-3 py-2 text-sm bg-background text-foreground"
                >
                  <option value="Net 30">Net 30</option>
                  <option value="Net 60">Net 60</option>
                  <option value="Due on Receipt">Due on Receipt</option>
                  <option value="Net 15">Net 15</option>
                </select>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Line items</h3>
              <BonsaiButton size="sm" variant="ghost" icon={<Plus />} onClick={addLineItem} type="button">
                Add Line
              </BonsaiButton>
            </div>

            <div className="space-y-3">
              {lineItems.map((item, index) => (
                <div key={item.id} className="p-4 bg-muted/25 rounded-lg border border-border">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-sm font-medium text-foreground">Line {index + 1}</span>
                    {lineItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLineItem(item.id)}
                        className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                      placeholder="Description of service or product"
                      className="hub-field px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                      required
                    />
                    
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">Quantity</label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateLineItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                          className="hub-field px-3 py-2 text-sm text-foreground"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">Rate</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.rate}
                          onChange={(e) => updateLineItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                          className="hub-field px-3 py-2 text-sm text-foreground"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">Total</label>
                        <div className="px-3 py-2 bg-muted/60 border border-border rounded-lg text-sm font-semibold text-foreground">
                          ${(item.quantity * item.rate).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Subtotal */}
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">Subtotal</span>
              <span className="text-2xl font-bold text-primary">
                ${calculateSubtotal().toFixed(2)}
              </span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Notes (optional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="hub-field px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none"
              placeholder="Notes for the client (e.g., milestones, payment details)"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <BonsaiButton variant="ghost" onClick={onClose} type="button">
              Cancel
            </BonsaiButton>
            <BonsaiButton variant="primary" type="submit">
              {initialInvoice ? 'Save Changes' : 'Create Invoice'}
            </BonsaiButton>
          </div>
        </form>
      </div>
    </>
  );
}
