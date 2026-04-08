'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Check } from 'lucide-react';
import { SlideDrawer, FormField, GlassInput, GlassTextarea } from '../ui/Overlays';

interface CO02ContactDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contact: Record<string, unknown>) => void;
  initialContact?: unknown;
}

function parseName(name: string): { first: string; last: string } {
  const p = name.trim().split(/\s+/);
  if (p.length === 0) return { first: '', last: '' };
  if (p.length === 1) return { first: p[0], last: '' };
  return { first: p[0], last: p.slice(1).join(' ') };
}

export function CO02ContactDrawer({ isOpen, onClose, onSave, initialContact }: CO02ContactDrawerProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [tags, setTags] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (!initialContact) {
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setCompany('');
      setTags('');
      setNotes('');
      return;
    }
    const ic = initialContact as Record<string, unknown>;
    if (ic.first_name != null || ic.last_name != null) {
      setFirstName(String(ic.first_name ?? ''));
      setLastName(String(ic.last_name ?? ''));
    } else if (ic.name != null) {
      const { first, last } = parseName(String(ic.name));
      setFirstName(first);
      setLastName(last);
    } else {
      setFirstName('');
      setLastName('');
    }
    setEmail(String(ic.email ?? ''));
    setPhone(String(ic.phone ?? ''));
    setCompany(String(ic.company ?? ''));
    setTags(Array.isArray(ic.tags) ? (ic.tags as string[]).join(', ') : String(ic.tags ?? ''));
    setNotes(String(ic.notes ?? ''));
  }, [isOpen, initialContact]);

  const submit = useCallback(async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) return;
    setSaving(true);
    try {
      await Promise.resolve(
        onSave({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          company: company.trim(),
          tags,
          notes: notes.trim(),
        }),
      );
    } finally {
      setSaving(false);
    }
  }, [firstName, lastName, email, phone, company, tags, notes, onSave]);

  return (
    <SlideDrawer
      open={isOpen}
      onClose={onClose}
      wide
      title={initialContact ? 'Edit contact' : 'Create contact'}
      subtitle="Details synced to your workspace and search index"
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
            disabled={saving}
            onClick={() => void submit()}
            className="flex items-center justify-center gap-2 rounded-lg px-5 py-2 text-[13px] font-medium text-white transition-all disabled:opacity-50"
            style={{ background: '#2563EB' }}
          >
            <Check className="h-3.5 w-3.5" />
            {saving ? 'Saving…' : initialContact ? 'Save changes' : 'Create contact'}
          </button>
        </div>
      }
    >
      <p className="mb-5 text-[12px] leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
        Only fields below are stored. Tags and notes help your team and search.
      </p>

      <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>
        Name & reachability
      </h3>
      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="First name" required>
          <GlassInput value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Jane" autoComplete="given-name" />
        </FormField>
        <FormField label="Last name" required>
          <GlassInput value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Doe" autoComplete="family-name" />
        </FormField>
      </div>
      <FormField label="Email" required>
        <GlassInput
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="jane@company.com"
          autoComplete="email"
        />
      </FormField>
      <FormField label="Phone">
        <GlassInput type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 …" autoComplete="tel" />
      </FormField>
      <FormField label="Company">
        <GlassInput value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Organization name" />
      </FormField>

      <h3 className="mb-3 mt-6 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>
        Organization
      </h3>
      <FormField label="Tags">
        <GlassInput value={tags} onChange={(e) => setTags(e.target.value)} placeholder="VIP, decision maker (comma-separated)" />
      </FormField>
      <FormField label="Notes">
        <GlassTextarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Context for your team…" />
      </FormField>
    </SlideDrawer>
  );
}
