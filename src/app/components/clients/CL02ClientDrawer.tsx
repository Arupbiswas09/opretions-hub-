'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Check } from 'lucide-react';
import { SlideDrawer, FormField, GlassInput, GlassTextarea, GlassSelect } from '../ui/Overlays';

interface CL02ClientDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (client: Record<string, unknown>) => void | Promise<void>;
  initialClient?: unknown;
}

type ProfileOpt = { id: string; display_name: string };

export function CL02ClientDrawer({ isOpen, onClose, onSave, initialClient }: CL02ClientDrawerProps) {
  const [name, setName] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('Net 30');
  const [billingAddress, setBillingAddress] = useState('');
  const [accountManagerId, setAccountManagerId] = useState('');
  const [profiles, setProfiles] = useState<ProfileOpt[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    fetch('/api/hub/quick-options', { credentials: 'include' })
      .then((r) => r.json())
      .then((j) => {
        if (!cancelled && Array.isArray(j.profiles)) setProfiles(j.profiles);
      })
      .catch(() => {
        if (!cancelled) setProfiles([]);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (!initialClient) {
      setName('');
      setPaymentTerms('Net 30');
      setBillingAddress('');
      setAccountManagerId('');
      return;
    }
    const c = initialClient as Record<string, unknown>;
    setName(String(c.name ?? ''));
    setPaymentTerms(String(c.payment_terms ?? 'Net 30'));
    const ba = c.billing_address;
    if (ba && typeof ba === 'object' && ba !== null && 'raw' in ba) {
      setBillingAddress(String((ba as { raw?: string }).raw ?? ''));
    } else if (typeof ba === 'string') {
      setBillingAddress(ba);
    } else {
      setBillingAddress('');
    }
    setAccountManagerId(typeof c.account_manager_id === 'string' ? c.account_manager_id : '');
  }, [isOpen, initialClient]);

  const submit = useCallback(async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        paymentTerms: paymentTerms.trim(),
        payment_terms: paymentTerms.trim(),
        billing_address: billingAddress.trim(),
        account_manager_id: accountManagerId || null,
      });
    } finally {
      setSaving(false);
    }
  }, [name, paymentTerms, billingAddress, accountManagerId, onSave]);

  return (
    <SlideDrawer
      open={isOpen}
      onClose={onClose}
      wide
      title={initialClient ? 'Edit client' : 'New client'}
      subtitle="Company name, billing, and terms — matches /api/clients"
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
            {saving ? 'Saving…' : initialClient ? 'Save' : 'Create client'}
          </button>
        </div>
      }
    >
      <FormField label="Company name" required>
        <GlassInput value={name} onChange={(e) => setName(e.target.value)} placeholder="Acme Inc." />
      </FormField>
      <FormField label="Payment terms">
        <GlassInput value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} placeholder="Net 30" />
      </FormField>
      <FormField label="Billing address">
        <GlassTextarea
          rows={3}
          value={billingAddress}
          onChange={(e) => setBillingAddress(e.target.value)}
          placeholder="Street, city, region, postal code…"
        />
      </FormField>
      <FormField label="Account manager">
        <GlassSelect value={accountManagerId} onChange={(e) => setAccountManagerId(e.target.value)}>
          <option value="">None</option>
          {profiles.map((p) => (
            <option key={p.id} value={p.id}>
              {p.display_name}
            </option>
          ))}
        </GlassSelect>
      </FormField>
    </SlideDrawer>
  );
}
