'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { SlideDrawer, FormField, GlassInput, GlassTextarea, GlassSelect } from '../ui/Overlays';
import { useHubData } from '../../lib/hub/use-hub-data';
import { type ClientRow } from '../../lib/api/hub-api';

interface PR02ProjectDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Record<string, unknown>) => void | Promise<void>;
  initialProject?: unknown;
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

  useEffect(() => {
    if (!isOpen) return;
    if (initialProject) {
      const p = initialProject as Record<string, unknown>;
      setFormData({
        name: String(p.name ?? ''),
        client_id: String(p.client_id ?? ''),
        status: String(p.status ?? 'planning'),
        description: String(p.description ?? ''),
        startDate: String(p.start_date ?? p.startDate ?? ''),
        endDate: String(p.end_date ?? p.endDate ?? ''),
        budgetHours: p.budget_hours != null ? String(p.budget_hours) : '',
      });
    } else {
      setFormData({
        name: '',
        client_id: '',
        status: 'planning',
        description: '',
        startDate: '',
        endDate: '',
        budgetHours: '',
      });
    }
  }, [initialProject, isOpen]);

  const submit = useCallback(async () => {
    if (!formData.name.trim()) return;
    setSaving(true);
    try {
      await onSave({
        name: formData.name.trim(),
        client_id: formData.client_id || null,
        status: formData.status,
        description: formData.description || null,
        start_date: formData.startDate || null,
        end_date: formData.endDate || null,
        budget_hours: formData.budgetHours ? Number(formData.budgetHours) : null,
      });
    } finally {
      setSaving(false);
    }
  }, [formData, onSave]);

  return (
    <SlideDrawer
      open={isOpen}
      onClose={onClose}
      wide
      title={initialProject ? 'Edit project' : 'New project'}
      subtitle="Linked client, status, timeline, and budget hours"
      footer={
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg border px-4 py-2 text-[13px] font-medium transition-colors disabled:opacity-50"
            style={{ background: 'var(--glass-bg)', color: 'var(--foreground)', borderColor: 'var(--border)' }}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving || !formData.name.trim()}
            onClick={() => void submit()}
            className="flex items-center justify-center gap-2 rounded-lg px-5 py-2 text-[13px] font-medium text-white transition-all disabled:opacity-50"
            style={{ background: '#2563EB' }}
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
            {saving ? 'Saving…' : initialProject ? 'Save changes' : 'Create project'}
          </button>
        </div>
      }
    >
      <FormField label="Project name" required>
        <GlassInput
          autoFocus
          value={formData.name}
          onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
          placeholder="e.g. Website redesign"
        />
      </FormField>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Client">
          <GlassSelect
            value={formData.client_id}
            onChange={(e) => setFormData((f) => ({ ...f, client_id: e.target.value }))}
          >
            <option value="">No client</option>
            {(clients ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </GlassSelect>
        </FormField>
        <FormField label="Status">
          <GlassSelect value={formData.status} onChange={(e) => setFormData((f) => ({ ...f, status: e.target.value }))}>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </GlassSelect>
        </FormField>
      </div>
      <FormField label="Description">
        <GlassTextarea
          rows={4}
          value={formData.description}
          onChange={(e) => setFormData((f) => ({ ...f, description: e.target.value }))}
          placeholder="Scope, deliverables, milestones…"
        />
      </FormField>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Start date">
          <GlassInput
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData((f) => ({ ...f, startDate: e.target.value }))}
          />
        </FormField>
        <FormField label="End date">
          <GlassInput
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData((f) => ({ ...f, endDate: e.target.value }))}
          />
        </FormField>
      </div>
      <FormField label="Budget hours">
        <GlassInput
          type="number"
          min={0}
          step={1}
          value={formData.budgetHours}
          onChange={(e) => setFormData((f) => ({ ...f, budgetHours: e.target.value }))}
          placeholder="e.g. 200"
        />
      </FormField>
    </SlideDrawer>
  );
}
