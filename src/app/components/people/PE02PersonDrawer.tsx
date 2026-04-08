'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Check } from 'lucide-react';
import { SlideDrawer, FormField, GlassInput } from '../ui/Overlays';
import { cn } from '../ui/utils';

interface PE02PersonDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (person: Record<string, unknown>) => void | Promise<void>;
  initialPerson?: unknown;
}

type PersonType = 'Employee' | 'Freelancer';

export function PE02PersonDrawer({ isOpen, onClose, onSave, initialPerson }: PE02PersonDrawerProps) {
  const [type, setType] = useState<PersonType>('Employee');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState('');
  const [startDate, setStartDate] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (!initialPerson) {
      setType('Employee');
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setRole('');
      setDepartment('');
      setStartDate('');
      return;
    }
    const p = initialPerson as Record<string, unknown>;
    const full = String(p.full_name ?? '');
    const parts = full.trim().split(/\s+/);
    setFirstName(parts[0] ?? '');
    setLastName(parts.slice(1).join(' ') ?? '');
    setEmail(String(p.email ?? ''));
    setPhone(String(p.phone ?? ''));
    setRole(String(p.role ?? ''));
    setDepartment(String(p.department ?? ''));
    setStartDate(p.start_date ? String(p.start_date).slice(0, 10) : '');
    const et = String(p.employment_type ?? '').toLowerCase();
    setType(et.includes('free') ? 'Freelancer' : 'Employee');
  }, [isOpen, initialPerson]);

  const submit = useCallback(async () => {
    if (!firstName.trim() || !lastName.trim()) return;
    setSaving(true);
    try {
      await onSave({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        role: role.trim(),
        department: department.trim(),
        type,
        employmentType: type,
        startDate: startDate || null,
      });
    } finally {
      setSaving(false);
    }
  }, [firstName, lastName, email, phone, role, department, type, startDate, onSave]);

  return (
    <SlideDrawer
      open={isOpen}
      onClose={onClose}
      wide
      title={initialPerson ? 'Edit person' : 'Add person'}
      subtitle="Directory record — name, role, and org fields stored in hub"
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
            {saving ? 'Saving…' : initialPerson ? 'Save changes' : 'Add person'}
          </button>
        </div>
      }
    >
      <p className="mb-4 text-[12px] leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
        Name, role, department, and how this person works with your org.
      </p>

      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>
        Type
      </p>
      <div className="mb-6 grid grid-cols-2 gap-2">
        {(['Employee', 'Freelancer'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={cn(
              'rounded-xl border-2 px-3 py-3 text-left transition-all',
              type === t ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/40',
            )}
          >
            <span className="text-[13px] font-semibold text-foreground">{t}</span>
            <span className="mt-1 block text-[11px] text-muted-foreground">
              {t === 'Employee' ? 'Payroll or staff' : 'Contractor / 1099'}
            </span>
          </button>
        ))}
      </div>

      <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>
        Profile
      </h3>
      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="First name" required>
          <GlassInput value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Jane" />
        </FormField>
        <FormField label="Last name" required>
          <GlassInput value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Doe" />
        </FormField>
      </div>
      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Email">
          <GlassInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@company.com" />
        </FormField>
        <FormField label="Phone">
          <GlassInput type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 …" />
        </FormField>
      </div>
      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Role">
          <GlassInput value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Project manager" />
        </FormField>
        <FormField label="Department">
          <GlassInput value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="e.g. Engineering" />
        </FormField>
      </div>
      <FormField label="Start date">
        <GlassInput type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
      </FormField>
    </SlideDrawer>
  );
}
