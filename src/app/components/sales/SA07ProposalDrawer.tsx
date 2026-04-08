'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { SlideDrawer, FormField, GlassInput, GlassSelect, GlassTextarea } from '../ui/Overlays';

/** Matches POST /api/proposals — no line items in schema; keep form honest. */
const PROPOSAL_STATUSES = [
  { v: 'draft', l: 'Draft' },
  { v: 'sent', l: 'Sent' },
  { v: 'viewed', l: 'Viewed' },
  { v: 'accepted', l: 'Accepted' },
  { v: 'declined', l: 'Declined' },
];

interface SA07ProposalDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (proposal: Record<string, unknown>) => void | Promise<void>;
  /** Linked deal title for default proposal name */
  dealLabel?: string;
}

export function SA07ProposalDrawer({ isOpen, onClose, onSave, dealLabel }: SA07ProposalDrawerProps) {
  const [title, setTitle] = useState('');
  const [value, setValue] = useState('');
  const [status, setStatus] = useState('draft');
  const [sentDate, setSentDate] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const fallback = dealLabel ? `Proposal — ${dealLabel}` : '';
    setTitle(fallback);
    setValue('');
    setStatus('draft');
    setSentDate('');
    setNotes('');
  }, [isOpen, dealLabel]);

  const submit = useCallback(async () => {
    const t = title.trim();
    if (!t) return;
    setSaving(true);
    try {
      await Promise.resolve(
        onSave({
          title: t,
          value: value.trim() || null,
          status,
          sent_date: sentDate || null,
          /** Not persisted by API today — kept for future / local notes */
          notes: notes.trim() || null,
        }),
      );
    } finally {
      setSaving(false);
    }
  }, [title, value, status, sentDate, notes, onSave]);

  return (
    <SlideDrawer
      open={isOpen}
      onClose={onClose}
      wide
      title="Create proposal"
      subtitle="Title, value, and status sync to proposals"
      footer={
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
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
            disabled={saving || !title.trim()}
            onClick={() => void submit()}
            className="flex items-center justify-center gap-2 rounded-lg px-5 py-2 text-[13px] font-medium text-white transition-all disabled:opacity-50"
            style={{ background: '#2563EB' }}
          >
            <Check className="h-3.5 w-3.5" />
            {saving ? 'Saving…' : 'Create proposal'}
          </button>
        </div>
      }
    >
      <p className="mb-5 text-[12px] leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
        Line-item breakdowns are not stored by the API yet; use description for internal context.
      </p>

      <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>
        Proposal
      </h3>
      <FormField label="Title" required>
        <GlassInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Q2 implementation proposal" />
      </FormField>
      <FormField label="Value">
        <GlassInput value={value} onChange={(e) => setValue(e.target.value)} placeholder="45000" />
      </FormField>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormField label="Status">
          <GlassSelect value={status} onChange={(e) => setStatus(e.target.value)}>
            {PROPOSAL_STATUSES.map((s) => (
              <option key={s.v} value={s.v}>
                {s.l}
              </option>
            ))}
          </GlassSelect>
        </FormField>
        <FormField label="Sent / valid date">
          <GlassInput type="date" value={sentDate} onChange={(e) => setSentDate(e.target.value)} />
        </FormField>
      </div>
      <FormField label="Internal notes">
        <GlassTextarea
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Terms, scope — for your team only until the API stores them"
        />
      </FormField>
    </SlideDrawer>
  );
}
