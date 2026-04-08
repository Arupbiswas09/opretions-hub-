'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { SlideDrawer, FormField, GlassInput, GlassTextarea, GlassSelect } from '../ui/Overlays';

const DEAL_STAGES = [
  { v: 'lead', l: 'Lead' },
  { v: 'qualified', l: 'Qualified' },
  { v: 'proposal_sent', l: 'Proposal sent' },
  { v: 'negotiation', l: 'Negotiation' },
  { v: 'won', l: 'Won' },
  { v: 'lost', l: 'Lost' },
];

type QuickOpts = {
  clients: { id: string; name: string }[];
  profiles: { id: string; display_name: string }[];
};

function useQuickOptions(open: boolean) {
  const [data, setData] = useState<QuickOpts | null>(null);
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    fetch('/api/hub/quick-options', { credentials: 'include' })
      .then((r) => r.json())
      .then((j) => {
        if (!cancelled)
          setData({
            clients: Array.isArray(j.clients) ? j.clients : [],
            profiles: Array.isArray(j.profiles) ? j.profiles : [],
          });
      })
      .catch(() => {
        if (!cancelled) setData({ clients: [], profiles: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [open]);
  return data;
}

interface SA05DealDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (deal: Record<string, unknown>) => void | Promise<void>;
  initialDeal?: unknown;
}

export function SA05DealDrawer({ isOpen, onClose, onSave, initialDeal }: SA05DealDrawerProps) {
  const opts = useQuickOptions(isOpen);
  const [title, setTitle] = useState('');
  const [clientId, setClientId] = useState('');
  const [value, setValue] = useState('');
  const [stage, setStage] = useState('lead');
  const [closeDate, setCloseDate] = useState('');
  const [probability, setProbability] = useState('');
  const [ownerId, setOwnerId] = useState('');
  const [description, setDescription] = useState('');
  const [loadingDeal, setLoadingDeal] = useState(false);
  const [saving, setSaving] = useState(false);

  const editId =
    initialDeal && typeof initialDeal === 'object' && initialDeal !== null && 'id' in initialDeal
      ? String((initialDeal as { id: unknown }).id)
      : '';

  useEffect(() => {
    if (!isOpen) return;
    if (!editId) {
      setTitle('');
      setClientId('');
      setValue('');
      setStage('lead');
      setCloseDate('');
      setProbability('');
      setOwnerId('');
      setDescription('');
      return;
    }
    let cancelled = false;
    setLoadingDeal(true);
    fetch(`/api/deals/${editId}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((j) => {
        if (cancelled || !j?.data) return;
        const d = j.data as Record<string, unknown>;
        setTitle(String(d.title ?? ''));
        setClientId(typeof d.client_id === 'string' ? d.client_id : '');
        setValue(d.value != null && d.value !== '' ? String(d.value) : '');
        setStage(String(d.stage ?? 'lead'));
        const cd = d.close_date;
        setCloseDate(typeof cd === 'string' && cd ? cd.slice(0, 10) : '');
        setProbability(d.probability != null && d.probability !== '' ? String(d.probability) : '');
        setOwnerId(typeof d.owner_id === 'string' ? d.owner_id : '');
        setDescription(d.description != null ? String(d.description) : '');
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingDeal(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, editId]);

  const submit = useCallback(async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await Promise.resolve(
        onSave({
          name: title.trim(),
          title: title.trim(),
          client_id: clientId || null,
          clientId: clientId || null,
          value,
          stage,
          close_date: closeDate || null,
          closeDate: closeDate || null,
          probability: probability.trim() ? Number(probability) : null,
          owner_id: ownerId || null,
          ownerId: ownerId || null,
          description: description.trim() || null,
        }),
      );
    } finally {
      setSaving(false);
    }
  }, [title, clientId, value, stage, closeDate, probability, ownerId, description, onSave]);

  return (
    <SlideDrawer
      open={isOpen}
      onClose={onClose}
      wide
      title={editId ? 'Edit deal' : 'Create new deal'}
      subtitle="Values map to your pipeline and KPIs"
      footer={
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={saving || loadingDeal}
            className="rounded-lg border px-4 py-2 text-[13px] font-medium transition-colors disabled:opacity-50"
            style={{ background: 'var(--glass-bg)', color: 'var(--foreground)', borderColor: 'var(--border)' }}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving || loadingDeal || !title.trim()}
            onClick={() => void submit()}
            className="flex items-center justify-center gap-2 rounded-lg px-5 py-2 text-[13px] font-medium text-white transition-all disabled:opacity-50"
            style={{ background: '#2563EB' }}
          >
            <Check className="h-3.5 w-3.5" />
            {saving ? 'Saving…' : editId ? 'Save changes' : 'Create deal'}
          </button>
        </div>
      }
    >
      {loadingDeal ? (
        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
          Loading deal…
        </p>
      ) : (
        <>
          <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>
            Deal details
          </h3>
          <FormField label="Deal name" required>
            <GlassInput
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Website redesign"
            />
          </FormField>
          <FormField label="Client">
            <GlassSelect value={clientId} onChange={(e) => setClientId(e.target.value)}>
              <option value="">Select client…</option>
              {(opts?.clients ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </GlassSelect>
          </FormField>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField label="Deal value">
              <GlassInput value={value} onChange={(e) => setValue(e.target.value)} placeholder="25000" />
            </FormField>
            <FormField label="Stage">
              <GlassSelect value={stage} onChange={(e) => setStage(e.target.value)}>
                {DEAL_STAGES.map((s) => (
                  <option key={s.v} value={s.v}>
                    {s.l}
                  </option>
                ))}
              </GlassSelect>
            </FormField>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField label="Expected close">
              <GlassInput type="date" value={closeDate} onChange={(e) => setCloseDate(e.target.value)} />
            </FormField>
            <FormField label="Win probability %">
              <GlassInput value={probability} onChange={(e) => setProbability(e.target.value)} placeholder="50" />
            </FormField>
          </div>
          <FormField label="Owner">
            <GlassSelect value={ownerId} onChange={(e) => setOwnerId(e.target.value)}>
              <option value="">Default (me)</option>
              {(opts?.profiles ?? []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.display_name}
                </option>
              ))}
            </GlassSelect>
          </FormField>
          <FormField label="Description">
            <GlassTextarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Context for your team…"
            />
          </FormField>
        </>
      )}
    </SlideDrawer>
  );
}
