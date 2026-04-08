'use client';
import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useHubData } from '../../lib/hub/use-hub-data';
import { type ClientRow } from '../../lib/api/hub-api';

interface PR02ProjectDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: any) => void;
  initialProject?: any;
}

const STATUS_OPTIONS = [
  { value: 'planning', label: 'Planning' },
  { value: 'active', label: 'Active' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export function PR02ProjectDrawer({ isOpen, onClose, onSave, initialProject }: PR02ProjectDrawerProps) {
  const { data: clients } = useHubData<ClientRow[]>(isOpen ? '/api/clients' : null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    client_id: '',
    status: 'planning',
    description: '',
    startDate: '',
    endDate: '',
    budgetHours: '',
  });

  // Populate for edit mode
  useEffect(() => {
    if (initialProject) {
      setFormData({
        name: initialProject.name ?? '',
        client_id: initialProject.client_id ?? '',
        status: initialProject.status ?? 'planning',
        description: initialProject.description ?? '',
        startDate: initialProject.start_date ?? initialProject.startDate ?? '',
        endDate: initialProject.end_date ?? initialProject.endDate ?? '',
        budgetHours: initialProject.budget_hours ?? initialProject.budgetHours ?? '',
      });
    } else {
      setFormData({
        name: '', client_id: '', status: 'planning', description: '',
        startDate: '', endDate: '', budgetHours: '',
      });
    }
  }, [initialProject, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    setSaving(true);
    await onSave({
      name: formData.name.trim(),
      client_id: formData.client_id || null,
      status: formData.status,
      description: formData.description || null,
      start_date: formData.startDate || null,
      end_date: formData.endDate || null,
      budget_hours: formData.budgetHours ? Number(formData.budgetHours) : null,
    });
    setSaving(false);
  };

  const inputStyle: React.CSSProperties = {
    background: 'var(--background)',
    border: '1px solid var(--border)',
    color: 'var(--foreground)',
  };

  const labelClass = "block text-[12px] font-medium mb-1.5";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-lg overflow-y-auto"
            style={{ background: 'var(--popover)', borderLeft: '1px solid var(--border)' }}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4"
              style={{ background: 'var(--popover)', borderBottom: '1px solid var(--border)' }}>
              <div>
                <h2 className="text-[16px] font-semibold" style={{ color: 'var(--foreground)' }}>
                  {initialProject ? 'Edit Project' : 'New Project'}
                </h2>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                  {initialProject ? 'Update project details' : 'Set up a new project'}
                </p>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg transition-colors hover:bg-white/[0.05]"
                style={{ color: 'var(--muted-foreground)' }}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-5">
              {/* Name */}
              <div>
                <label className={labelClass} style={{ color: 'var(--foreground)' }}>
                  Project Name <span style={{ color: 'var(--destructive)' }}>*</span>
                </label>
                <input
                  type="text" required autoFocus
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Website Redesign"
                  className="w-full rounded-lg px-3 py-2 text-[13px] outline-none transition-all focus:ring-2 focus:ring-blue-500/20"
                  style={inputStyle}
                />
              </div>

              {/* Client + Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass} style={{ color: 'var(--foreground)' }}>Client</label>
                  <select
                    value={formData.client_id}
                    onChange={e => setFormData({ ...formData, client_id: e.target.value })}
                    className="w-full rounded-lg px-3 py-2 text-[13px] outline-none transition-all focus:ring-2 focus:ring-blue-500/20"
                    style={inputStyle}
                  >
                    <option value="">No client</option>
                    {(clients ?? []).map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass} style={{ color: 'var(--foreground)' }}>Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    className="w-full rounded-lg px-3 py-2 text-[13px] outline-none transition-all focus:ring-2 focus:ring-blue-500/20"
                    style={inputStyle}
                  >
                    {STATUS_OPTIONS.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className={labelClass} style={{ color: 'var(--foreground)' }}>Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  placeholder="Scope, deliverables, milestones…"
                  className="w-full resize-none rounded-lg px-3 py-2 text-[13px] outline-none transition-all focus:ring-2 focus:ring-blue-500/20"
                  style={inputStyle}
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass} style={{ color: 'var(--foreground)' }}>Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full rounded-lg px-3 py-2 text-[13px] outline-none transition-all focus:ring-2 focus:ring-blue-500/20"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className={labelClass} style={{ color: 'var(--foreground)' }}>End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full rounded-lg px-3 py-2 text-[13px] outline-none transition-all focus:ring-2 focus:ring-blue-500/20"
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Budget */}
              <div>
                <label className={labelClass} style={{ color: 'var(--foreground)' }}>Budget Hours</label>
                <input
                  type="number" min="0" step="1"
                  value={formData.budgetHours}
                  onChange={e => setFormData({ ...formData, budgetHours: e.target.value })}
                  placeholder="e.g. 200"
                  className="w-full rounded-lg px-3 py-2 text-[13px] outline-none transition-all focus:ring-2 focus:ring-blue-500/20"
                  style={inputStyle}
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3"
                style={{ borderTop: '1px solid var(--border)' }}>
                <button type="button" onClick={onClose}
                  className="px-4 py-2 text-[13px] font-medium rounded-lg transition-colors"
                  style={{ color: 'var(--muted-foreground)' }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving || !formData.name.trim()}
                  className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium rounded-lg text-white transition-all disabled:opacity-50"
                  style={{ background: '#2563EB' }}>
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {initialProject ? 'Save Changes' : 'Create Project'}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
