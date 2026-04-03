import React, { useState } from 'react';
import { X, DollarSign, Plus, Trash2 } from 'lucide-react';
import { BonsaiButton } from '../bonsai/BonsaiButton';
import { BonsaiInput } from '../bonsai/BonsaiFormFields';

interface ExpenseItem {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
}

interface PE06ExpenseClaimDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (claim: any) => void;
}

export function PE06ExpenseClaimDrawer({ isOpen, onClose, onSubmit }: PE06ExpenseClaimDrawerProps) {
  const [items, setItems] = useState<ExpenseItem[]>([
    { id: '1', category: 'Travel', description: '', amount: 0, date: '' },
  ]);
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ items, notes });
    onClose();
  };

  const addItem = () => {
    setItems([...items, {
      id: Date.now().toString(),
      category: 'Travel',
      description: '',
      amount: 0,
      date: '',
    }]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: string, value: any) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.amount || 0), 0);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-white shadow-2xl z-50 overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-stone-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-stone-800">Submit Expense Claim</h2>
              <p className="text-sm text-stone-500">Request reimbursement for expenses</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Expense Items */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-stone-800">Expense Items</h3>
              <BonsaiButton size="sm" variant="ghost" icon={<Plus />} onClick={addItem} type="button">
                Add Item
              </BonsaiButton>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={item.id} className="p-4 bg-stone-50 rounded-lg border border-stone-200">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-sm font-medium text-stone-700">Item {index + 1}</span>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-stone-600 mb-1">Category *</label>
                      <select
                        value={item.category}
                        onChange={(e) => updateItem(item.id, 'category', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        required
                      >
                        <option value="Travel">Travel</option>
                        <option value="Meals">Meals & Entertainment</option>
                        <option value="Accommodation">Accommodation</option>
                        <option value="Office Supplies">Office Supplies</option>
                        <option value="Software">Software & Tools</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-stone-600 mb-1">Date *</label>
                      <input
                        type="date"
                        value={item.date}
                        onChange={(e) => updateItem(item.id, 'date', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        required
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-stone-600 mb-1">Description *</label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="e.g., Taxi to client meeting"
                        required
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-stone-600 mb-1">Amount *</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500">$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.amount || ''}
                          onChange={(e) => updateItem(item.id, 'amount', parseFloat(e.target.value) || 0)}
                          className="w-full pl-8 pr-3 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                          placeholder="0.00"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-stone-800">Total Amount</span>
              <span className="text-2xl font-bold text-primary">
                ${calculateTotal().toFixed(2)}
              </span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Additional Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              placeholder="Any additional context or details..."
            />
          </div>

          {/* Info */}
          <div className="p-4 bg-stone-50 border border-stone-200 rounded-lg">
            <p className="text-xs text-stone-700">
              <strong>Reimbursement Policy:</strong> Receipts are required for expenses over $25. 
              Please attach receipts after submitting this claim. Approved expenses are typically 
              reimbursed within 7-10 business days.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
            <BonsaiButton variant="ghost" onClick={onClose} type="button">
              Cancel
            </BonsaiButton>
            <BonsaiButton variant="primary" type="submit">
              Submit Claim
            </BonsaiButton>
          </div>
        </form>
      </div>
    </>
  );
}
