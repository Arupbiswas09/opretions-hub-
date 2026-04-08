'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { Plus, Check } from 'lucide-react';
import { SlideDrawer, FormField, GlassInput, GlassTextarea, GlassSelect } from './Overlays';
import { useToast } from '../bonsai/ToastSystem';
import { dispatchDataInvalidation } from '../../lib/hub-events';

/* ══════════════════════════════════════════════════════════════════════
   QUICK-CREATE DRAWERS — wired to /api/* (Supabase + cache + Bonsai sync)
══════════════════════════════════════════════════════════════════════ */

type QuickOpts = {
  clients: { id: string; name: string }[];
  projects: { id: string; name: string }[];
  profiles: { id: string; display_name: string }[];
  deals: { id: string; title: string }[];
};

function useQuickOptions(open: boolean) {
  const [data, setData] = useState<QuickOpts | null>(null);
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    fetch('/api/hub/quick-options', { credentials: 'include' })
      .then((r) => r.json())
      .then((j) => {
        if (!cancelled) setData(j);
      })
      .catch(() => {
        if (!cancelled) setData({ clients: [], projects: [], profiles: [], deals: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [open]);
  return data;
}

async function postJson<T>(url: string, body: unknown): Promise<{ ok: boolean; data?: T; error?: string }> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, error: json.error || res.statusText };
  return { ok: true, data: json.data };
}

function DrawerFooter({
  onCancel,
  onPrimary,
  onPrimaryAndAnother,
  primaryLabel,
  saving,
  anotherLabel = 'Create & add another',
}: {
  onCancel: () => void;
  onPrimary: () => Promise<void>;
  onPrimaryAndAnother?: () => Promise<void>;
  primaryLabel: string;
  saving: boolean;
  anotherLabel?: string;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <button
        type="button"
        onClick={onCancel}
        disabled={saving}
        className="px-4 py-2 rounded-lg text-[13px] font-medium transition-colors disabled:opacity-50"
        style={{ background: 'var(--glass-bg)', color: 'var(--foreground)', border: '1px solid var(--border)' }}
      >
        Cancel
      </button>
      <div className="flex flex-wrap items-center justify-end gap-2">
        {onPrimaryAndAnother && (
          <button
            type="button"
            disabled={saving}
            onClick={() => void onPrimaryAndAnother()}
            className="px-4 py-2 rounded-lg text-[13px] font-medium transition-all disabled:opacity-50"
            style={{ background: 'var(--glass-bg)', color: 'var(--foreground)', border: '1px solid var(--border)' }}
          >
            {anotherLabel}
          </button>
        )}
        <button
          type="button"
          disabled={saving}
          onClick={() => void onPrimary()}
          className="px-5 py-2 rounded-lg text-[13px] font-medium transition-all disabled:opacity-50 flex items-center gap-2"
          style={{ background: '#2563EB', color: '#FFF' }}
        >
          <Check className="w-3.5 h-3.5" />
          {saving ? 'Saving…' : primaryLabel}
        </button>
      </div>
    </div>
  );
}

/* ── 1. CLIENT ── */
export function CreateClientDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addToast } = useToast();
  const [name, setName] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [accountManagerId, setAccountManagerId] = useState('');
  const [saving, setSaving] = useState(false);
  const opts = useQuickOptions(open);

  useEffect(() => {
    if (open) {
      setName('');
      setBillingAddress('');
      setPaymentTerms('');
      setAccountManagerId('');
    }
  }, [open]);

  const submit = useCallback(
    async (closeAfter: boolean) => {
      if (!name.trim()) {
        addToast('Company name is required', 'error');
        return;
      }
      setSaving(true);
      try {
        const r = await postJson('/api/clients', {
          name: name.trim(),
          billing_address: billingAddress.trim() || undefined,
          payment_terms: paymentTerms.trim() || undefined,
          account_manager_id: accountManagerId || undefined,
        });
        if (!r.ok) throw new Error(r.error);
        addToast('Client created', 'success');
        dispatchDataInvalidation('clients');
        if (closeAfter) onClose();
        else {
          setName('');
          setBillingAddress('');
          setPaymentTerms('');
          setAccountManagerId('');
        }
      } catch (e) {
        addToast(e instanceof Error ? e.message : 'Create failed', 'error');
      } finally {
        setSaving(false);
      }
    },
    [name, billingAddress, paymentTerms, accountManagerId, addToast, onClose],
  );

  return (
    <SlideDrawer
      open={open}
      onClose={onClose}
      title="New Client"
      subtitle="Add a new client to your workspace"
      footer={
        <DrawerFooter
          onCancel={onClose}
          saving={saving}
          primaryLabel="Create Client"
          onPrimary={() => submit(true)}
          onPrimaryAndAnother={() => submit(false)}
        />
      }
    >
      <FormField label="Company Name" required>
        <GlassInput value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Acme Corporation" />
      </FormField>
      <FormField label="Billing Address">
        <GlassTextarea rows={2} value={billingAddress} onChange={(e) => setBillingAddress(e.target.value)} placeholder="Street, city, region…" />
      </FormField>
      <FormField label="Payment Terms">
        <GlassInput value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} placeholder="Net 30" />
      </FormField>
      <FormField label="Account manager">
        <GlassSelect value={accountManagerId} onChange={(e) => setAccountManagerId(e.target.value)}>
          <option value="">None</option>
          {(opts?.profiles ?? []).map((p) => (
            <option key={p.id} value={p.id}>
              {p.display_name}
            </option>
          ))}
        </GlassSelect>
      </FormField>
    </SlideDrawer>
  );
}

/* ── 2. DEAL ── */
const DEAL_STAGES = [
  { v: 'lead', l: 'Lead' },
  { v: 'qualified', l: 'Qualified' },
  { v: 'proposal_sent', l: 'Proposal sent' },
  { v: 'negotiation', l: 'Negotiation' },
];

export function CreateDealDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addToast } = useToast();
  const opts = useQuickOptions(open);
  const [title, setTitle] = useState('');
  const [clientId, setClientId] = useState('');
  const [value, setValue] = useState('');
  const [stage, setStage] = useState('lead');
  const [closeDate, setCloseDate] = useState('');
  const [probability, setProbability] = useState('');
  const [ownerId, setOwnerId] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle('');
      setClientId('');
      setValue('');
      setStage('lead');
      setCloseDate('');
      setProbability('');
      setOwnerId('');
      setDescription('');
    }
  }, [open]);

  const submit = async (closeAfter: boolean) => {
    if (!title.trim()) {
      addToast('Deal name is required', 'error');
      return;
    }
    setSaving(true);
    try {
      const r = await postJson('/api/deals', {
        title: title.trim(),
        client_id: clientId || undefined,
        value,
        stage,
        close_date: closeDate || undefined,
        probability: probability ? Number(probability) : undefined,
        owner_id: ownerId || undefined,
        description: description || undefined,
      });
      if (!r.ok) throw new Error(r.error);
      addToast('Deal created', 'success');
      dispatchDataInvalidation('deals');
      dispatchDataInvalidation('pipeline');
      dispatchDataInvalidation('sales');
      if (closeAfter) onClose();
      else {
        setTitle('');
        setClientId('');
        setValue('');
        setDescription('');
      }
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Create failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SlideDrawer
      open={open}
      onClose={onClose}
      title="New Deal"
      subtitle="Add a new deal to your pipeline"
      footer={
        <DrawerFooter
          onCancel={onClose}
          saving={saving}
          primaryLabel="Create Deal"
          onPrimary={() => submit(true)}
          onPrimaryAndAnother={() => submit(false)}
        />
      }
    >
      <FormField label="Deal Name" required>
        <GlassInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Website redesign" />
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
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Deal Value">
          <GlassInput value={value} onChange={(e) => setValue(e.target.value)} placeholder="$25,000" />
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
      <div className="grid grid-cols-2 gap-3">
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
      <FormField label="Notes">
        <GlassTextarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
      </FormField>
    </SlideDrawer>
  );
}

/* ── 3. PROJECT ── */
export function CreateProjectDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addToast } = useToast();
  const opts = useQuickOptions(open);
  const [name, setName] = useState('');
  const [clientId, setClientId] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budgetHours, setBudgetHours] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName('');
      setClientId('');
      setDescription('');
      setStartDate('');
      setEndDate('');
      setBudgetHours('');
    }
  }, [open]);

  const submit = async (closeAfter: boolean) => {
    if (!name.trim()) {
      addToast('Project name is required', 'error');
      return;
    }
    if (!clientId) {
      addToast('Client is required', 'error');
      return;
    }
    setSaving(true);
    try {
      const r = await postJson('/api/projects', {
        name: name.trim(),
        client_id: clientId,
        description: description || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        budget_hours: budgetHours || undefined,
        status: 'active',
      });
      if (!r.ok) throw new Error(r.error);
      addToast('Project created', 'success');
      dispatchDataInvalidation('projects');
      if (closeAfter) onClose();
      else {
        setName('');
        setDescription('');
      }
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Create failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SlideDrawer
      open={open}
      onClose={onClose}
      title="New Project"
      subtitle="Set up a new project"
      footer={
        <DrawerFooter
          onCancel={onClose}
          saving={saving}
          primaryLabel="Create Project"
          onPrimary={() => submit(true)}
          onPrimaryAndAnother={() => submit(false)}
        />
      }
    >
      <FormField label="Project Name" required>
        <GlassInput value={name} onChange={(e) => setName(e.target.value)} />
      </FormField>
      <FormField label="Client" required>
        <GlassSelect value={clientId} onChange={(e) => setClientId(e.target.value)}>
          <option value="">Select client…</option>
          {(opts?.clients ?? []).map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </GlassSelect>
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Start date">
          <GlassInput type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </FormField>
        <FormField label="End date">
          <GlassInput type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </FormField>
      </div>
      <FormField label="Budget (hours)">
        <GlassInput value={budgetHours} onChange={(e) => setBudgetHours(e.target.value)} placeholder="500" />
      </FormField>
      <FormField label="Description">
        <GlassTextarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
      </FormField>
    </SlideDrawer>
  );
}

type LineRow = { description: string; qty: number; rate: number };

/* ── 4. INVOICE ── */
export function CreateInvoiceDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addToast } = useToast();
  const opts = useQuickOptions(open);
  const [clientId, setClientId] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [lines, setLines] = useState<LineRow[]>([{ description: '', qty: 1, rate: 0 }]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setClientId('');
      setIssueDate('');
      setDueDate('');
      setLines([{ description: '', qty: 1, rate: 0 }]);
    }
  }, [open]);

  const submit = async (closeAfter: boolean) => {
    if (!clientId) {
      addToast('Client is required', 'error');
      return;
    }
    setSaving(true);
    try {
      const r = await postJson('/api/invoices', {
        client_id: clientId,
        issue_date: issueDate || undefined,
        due_date: dueDate || undefined,
        line_items: lines.filter((l) => l.description.trim() || l.rate > 0),
        tax: 0,
        status: 'draft',
      });
      if (!r.ok) throw new Error(r.error);
      addToast('Invoice saved as draft', 'success');
      dispatchDataInvalidation('invoices');
      if (closeAfter) onClose();
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Create failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SlideDrawer
      open={open}
      onClose={onClose}
      title="New Invoice"
      subtitle="Create and send an invoice"
      width="540px"
      footer={
        <DrawerFooter
          onCancel={onClose}
          saving={saving}
          primaryLabel="Create Invoice"
          onPrimary={() => submit(true)}
          onPrimaryAndAnother={() => submit(false)}
        />
      }
    >
      <FormField label="Client" required>
        <GlassSelect value={clientId} onChange={(e) => setClientId(e.target.value)}>
          <option value="">Select client…</option>
          {(opts?.clients ?? []).map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </GlassSelect>
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Invoice date">
          <GlassInput type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
        </FormField>
        <FormField label="Due date">
          <GlassInput type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </FormField>
      </div>
      <div className="mt-2 mb-4">
        <p className="text-[11px] font-medium uppercase tracking-wider mb-2" style={{ color: 'var(--muted-foreground)' }}>
          Line items
        </p>
        {lines.map((row, i) => (
          <div key={i} className="mb-2 grid grid-cols-[1fr_56px_72px] gap-2">
            <GlassInput
              placeholder="Description"
              value={row.description}
              onChange={(e) => {
                const next = [...lines];
                next[i] = { ...next[i], description: e.target.value };
                setLines(next);
              }}
            />
            <GlassInput
              type="number"
              value={row.qty || ''}
              onChange={(e) => {
                const next = [...lines];
                next[i] = { ...next[i], qty: Number(e.target.value) || 0 };
                setLines(next);
              }}
            />
            <GlassInput
              type="number"
              placeholder="Rate"
              value={row.rate || ''}
              onChange={(e) => {
                const next = [...lines];
                next[i] = { ...next[i], rate: Number(e.target.value) || 0 };
                setLines(next);
              }}
            />
          </div>
        ))}
        <button
          type="button"
          className="flex w-full items-center justify-center gap-1 py-2 text-[12px]"
          style={{ color: '#2563EB', border: '1px dashed var(--border)' }}
          onClick={() => setLines([...lines, { description: '', qty: 1, rate: 0 }])}
        >
          <Plus className="w-3 h-3" /> Add line
        </button>
      </div>
    </SlideDrawer>
  );
}

/* ── 5. TIME ENTRY ── */
export function CreateTimeEntryDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addToast } = useToast();
  const opts = useQuickOptions(open);
  const [projectId, setProjectId] = useState('');
  const [description, setDescription] = useState('');
  const [entryDate, setEntryDate] = useState('');
  const [hours, setHours] = useState('');
  const [billable, setBillable] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setProjectId('');
      setDescription('');
      setEntryDate('');
      setHours('');
      setBillable(true);
    }
  }, [open]);

  const submit = async (closeAfter: boolean) => {
    if (!projectId) {
      addToast('Project is required', 'error');
      return;
    }
    if (!description.trim()) {
      addToast('Description is required', 'error');
      return;
    }
    const h = Number(hours);
    if (!Number.isFinite(h) || h <= 0) {
      addToast('Enter valid hours', 'error');
      return;
    }
    setSaving(true);
    try {
      const r = await postJson('/api/time-entries', {
        project_id: projectId,
        description: description.trim(),
        entry_date: entryDate || undefined,
        hours: h,
        billable,
      });
      if (!r.ok) throw new Error(r.error);
      addToast('Time logged', 'success');
      dispatchDataInvalidation('timesheets');
      if (closeAfter) onClose();
      else {
        setDescription('');
        setHours('');
      }
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Create failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SlideDrawer
      open={open}
      onClose={onClose}
      title="Log Time"
      subtitle="Add a manual time entry"
      footer={
        <DrawerFooter
          onCancel={onClose}
          saving={saving}
          primaryLabel="Log Entry"
          onPrimary={() => submit(true)}
          onPrimaryAndAnother={() => submit(false)}
        />
      }
    >
      <FormField label="Project" required>
        <GlassSelect value={projectId} onChange={(e) => setProjectId(e.target.value)}>
          <option value="">Select project…</option>
          {(opts?.projects ?? []).map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </GlassSelect>
      </FormField>
      <FormField label="What did you work on?" required>
        <GlassInput value={description} onChange={(e) => setDescription(e.target.value)} />
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Date">
          <GlassInput type="date" value={entryDate} onChange={(e) => setEntryDate(e.target.value)} />
        </FormField>
        <FormField label="Hours" required>
          <GlassInput type="number" step="0.25" min="0.25" value={hours} onChange={(e) => setHours(e.target.value)} placeholder="2.5" />
        </FormField>
      </div>
      <label className="mb-4 flex items-center gap-2 text-[12px] cursor-pointer" style={{ color: 'var(--foreground)' }}>
        <input type="checkbox" checked={billable} onChange={(e) => setBillable(e.target.checked)} className="rounded accent-blue-500" />
        Billable
      </label>
    </SlideDrawer>
  );
}

/* ── 6. PROPOSAL ── */
export function CreateProposalDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addToast } = useToast();
  const opts = useQuickOptions(open);
  const [title, setTitle] = useState('');
  const [dealId, setDealId] = useState('');
  const [value, setValue] = useState('');
  const [sentDate, setSentDate] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle('');
      setDealId('');
      setValue('');
      setSentDate('');
    }
  }, [open]);

  const submit = async (closeAfter: boolean) => {
    if (!title.trim()) {
      addToast('Title is required', 'error');
      return;
    }
    setSaving(true);
    try {
      const r = await postJson('/api/proposals', {
        title: title.trim(),
        deal_id: dealId || undefined,
        value: value || undefined,
        sent_date: sentDate || undefined,
        status: 'draft',
      });
      if (!r.ok) throw new Error(r.error);
      addToast('Proposal created', 'success');
      dispatchDataInvalidation('proposals');
      if (closeAfter) onClose();
      else setTitle('');
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Create failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SlideDrawer
      open={open}
      onClose={onClose}
      title="New Proposal"
      subtitle="Draft a proposal"
      footer={
        <DrawerFooter
          onCancel={onClose}
          saving={saving}
          primaryLabel="Create Proposal"
          onPrimary={() => submit(true)}
          onPrimaryAndAnother={() => submit(false)}
        />
      }
    >
      <FormField label="Title" required>
        <GlassInput value={title} onChange={(e) => setTitle(e.target.value)} />
      </FormField>
      <FormField label="Related deal (optional)">
        <GlassSelect value={dealId} onChange={(e) => setDealId(e.target.value)}>
          <option value="">None</option>
          {(opts?.deals ?? []).map((d) => (
            <option key={d.id} value={d.id}>
              {d.title}
            </option>
          ))}
        </GlassSelect>
      </FormField>
      <FormField label="Value">
        <GlassInput value={value} onChange={(e) => setValue(e.target.value)} placeholder="$25,000" />
      </FormField>
      <FormField label="Valid until">
        <GlassInput type="date" value={sentDate} onChange={(e) => setSentDate(e.target.value)} />
      </FormField>
    </SlideDrawer>
  );
}

/* ── 7. CONTRACT ── */
export function CreateContractDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addToast } = useToast();
  const opts = useQuickOptions(open);
  const [title, setTitle] = useState('');
  const [clientId, setClientId] = useState('');
  const [value, setValue] = useState('');
  const [signedDate, setSignedDate] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle('');
      setClientId('');
      setValue('');
      setSignedDate('');
    }
  }, [open]);

  const submit = async (closeAfter: boolean) => {
    if (!title.trim() || !clientId) {
      addToast('Title and client are required', 'error');
      return;
    }
    setSaving(true);
    try {
      const r = await postJson('/api/contracts', {
        title: title.trim(),
        client_id: clientId,
        value: value || undefined,
        signed_date: signedDate || undefined,
        status: 'draft',
      });
      if (!r.ok) throw new Error(r.error);
      addToast('Contract saved', 'success');
      dispatchDataInvalidation('contracts');
      if (closeAfter) onClose();
      else setTitle('');
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Create failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SlideDrawer
      open={open}
      onClose={onClose}
      title="New Contract"
      subtitle="Create a contract record"
      footer={
        <DrawerFooter
          onCancel={onClose}
          saving={saving}
          primaryLabel="Create Contract"
          onPrimary={() => submit(true)}
          onPrimaryAndAnother={() => submit(false)}
        />
      }
    >
      <FormField label="Title" required>
        <GlassInput value={title} onChange={(e) => setTitle(e.target.value)} />
      </FormField>
      <FormField label="Client" required>
        <GlassSelect value={clientId} onChange={(e) => setClientId(e.target.value)}>
          <option value="">Select client…</option>
          {(opts?.clients ?? []).map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </GlassSelect>
      </FormField>
      <FormField label="Value">
        <GlassInput value={value} onChange={(e) => setValue(e.target.value)} />
      </FormField>
      <FormField label="Signed date">
        <GlassInput type="date" value={signedDate} onChange={(e) => setSignedDate(e.target.value)} />
      </FormField>
    </SlideDrawer>
  );
}

/* ── 8. EXPENSE ── */
export function CreateExpenseDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addToast } = useToast();
  const opts = useQuickOptions(open);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Travel');
  const [expenseDate, setExpenseDate] = useState('');
  const [projectId, setProjectId] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setDescription('');
      setAmount('');
      setCategory('Travel');
      setExpenseDate('');
      setProjectId('');
      setNotes('');
    }
  }, [open]);

  const submit = async (closeAfter: boolean) => {
    if (!description.trim()) {
      addToast('Description is required', 'error');
      return;
    }
    if (!amount.trim()) {
      addToast('Amount is required', 'error');
      return;
    }
    setSaving(true);
    try {
      const desc =
        notes.trim() ? `${description.trim()}\n\n${notes.trim()}` : description.trim();
      const r = await postJson('/api/expenses', {
        description: desc,
        amount,
        category,
        expense_date: expenseDate || undefined,
        project_id: projectId || undefined,
      });
      if (!r.ok) throw new Error(r.error);
      addToast('Expense submitted', 'success');
      dispatchDataInvalidation('expenses');
      if (closeAfter) onClose();
      else {
        setDescription('');
        setAmount('');
      }
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Create failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SlideDrawer
      open={open}
      onClose={onClose}
      title="New Expense"
      subtitle="Submit an expense"
      footer={
        <DrawerFooter
          onCancel={onClose}
          saving={saving}
          primaryLabel="Submit Expense"
          onPrimary={() => submit(true)}
          onPrimaryAndAnother={() => submit(false)}
        />
      }
    >
      <FormField label="Description" required>
        <GlassInput value={description} onChange={(e) => setDescription(e.target.value)} />
      </FormField>
      <FormField label="Category">
        <GlassSelect value={category} onChange={(e) => setCategory(e.target.value)}>
          {['Travel', 'Meals & Entertainment', 'Software & Tools', 'Office Supplies', 'Equipment', 'Marketing', 'Other'].map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </GlassSelect>
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Amount" required>
          <GlassInput value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="$120" />
        </FormField>
        <FormField label="Date">
          <GlassInput type="date" value={expenseDate} onChange={(e) => setExpenseDate(e.target.value)} />
        </FormField>
      </div>
      <FormField label="Project">
        <GlassSelect value={projectId} onChange={(e) => setProjectId(e.target.value)}>
          <option value="">No project</option>
          {(opts?.projects ?? []).map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </GlassSelect>
      </FormField>
      <FormField label="Notes">
        <GlassTextarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </FormField>
    </SlideDrawer>
  );
}

/* ── 9. CONTACT ── */
export function CreateContactDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addToast } = useToast();
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [tags, setTags] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setFirst('');
      setLast('');
      setEmail('');
      setPhone('');
      setCompany('');
      setTags('');
      setNotes('');
    }
  }, [open]);

  const submit = async (closeAfter: boolean) => {
    if (!first.trim() || !last.trim() || !email.trim()) {
      addToast('First name, last name, and email are required', 'error');
      return;
    }
    setSaving(true);
    try {
      const tagArr = tags.trim()
        ? tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : [];
      const r = await postJson('/api/contacts', {
        first_name: first.trim(),
        last_name: last.trim(),
        email: email.trim(),
        phone: phone || undefined,
        company: company || undefined,
        tags: tagArr,
        notes: notes || undefined,
      });
      if (!r.ok) throw new Error(r.error);
      addToast('Contact created', 'success');
      dispatchDataInvalidation('contacts');
      if (closeAfter) onClose();
      else {
        setFirst('');
        setLast('');
        setEmail('');
        setPhone('');
        setCompany('');
        setTags('');
        setNotes('');
      }
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Create failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SlideDrawer
      open={open}
      onClose={onClose}
      title="New Contact"
      subtitle="Add a contact"
      footer={
        <DrawerFooter
          onCancel={onClose}
          saving={saving}
          primaryLabel="Create Contact"
          onPrimary={() => submit(true)}
          onPrimaryAndAnother={() => submit(false)}
        />
      }
    >
      <div className="grid grid-cols-2 gap-3">
        <FormField label="First Name" required>
          <GlassInput value={first} onChange={(e) => setFirst(e.target.value)} />
        </FormField>
        <FormField label="Last Name" required>
          <GlassInput value={last} onChange={(e) => setLast(e.target.value)} />
        </FormField>
      </div>
      <FormField label="Email" required>
        <GlassInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </FormField>
      <FormField label="Phone">
        <GlassInput value={phone} onChange={(e) => setPhone(e.target.value)} />
      </FormField>
      <FormField label="Company">
        <GlassInput value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Acme Inc." />
      </FormField>
      <FormField label="Tags (comma-separated)">
        <GlassInput value={tags} onChange={(e) => setTags(e.target.value)} />
      </FormField>
      <FormField label="Notes">
        <GlassTextarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </FormField>
    </SlideDrawer>
  );
}

/* ── 10. TASK ── */
export function CreateTaskDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addToast } = useToast();
  const opts = useQuickOptions(open);
  const [title, setTitle] = useState('');
  const [projectId, setProjectId] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle('');
      setProjectId('');
      setAssigneeId('');
      setPriority('medium');
      setDueDate('');
      setDescription('');
      setTags('');
    }
  }, [open]);

  const submit = async (closeAfter: boolean) => {
    if (!title.trim()) {
      addToast('Task title is required', 'error');
      return;
    }
    setSaving(true);
    try {
      const tagArr = tags.trim()
        ? tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : [];
      const r = await postJson('/api/tasks', {
        title: title.trim(),
        project_id: projectId || undefined,
        assignee_id: assigneeId || undefined,
        priority,
        due_date: dueDate || undefined,
        description: description || undefined,
        tags: tagArr,
        status: 'todo',
      });
      if (!r.ok) throw new Error(r.error);
      addToast('Task created', 'success');
      dispatchDataInvalidation('tasks');
      if (closeAfter) onClose();
      else setTitle('');
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Create failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SlideDrawer
      open={open}
      onClose={onClose}
      title="New Task"
      subtitle="Create a task"
      footer={
        <DrawerFooter
          onCancel={onClose}
          saving={saving}
          primaryLabel="Create Task"
          onPrimary={() => submit(true)}
          onPrimaryAndAnother={() => submit(false)}
        />
      }
    >
      <FormField label="Task Title" required>
        <GlassInput value={title} onChange={(e) => setTitle(e.target.value)} />
      </FormField>
      <FormField label="Project">
        <GlassSelect value={projectId} onChange={(e) => setProjectId(e.target.value)}>
          <option value="">No project</option>
          {(opts?.projects ?? []).map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </GlassSelect>
      </FormField>
      <FormField label="Assignee">
        <GlassSelect value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
          <option value="">Unassigned</option>
          {(opts?.profiles ?? []).map((p) => (
            <option key={p.id} value={p.id}>
              {p.display_name}
            </option>
          ))}
        </GlassSelect>
      </FormField>
      <FormField label="Priority">
        <GlassSelect value={priority} onChange={(e) => setPriority(e.target.value)}>
          {['low', 'medium', 'high', 'urgent'].map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </GlassSelect>
      </FormField>
      <FormField label="Due date">
        <GlassInput type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
      </FormField>
      <FormField label="Description">
        <GlassTextarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
      </FormField>
      <FormField label="Tags">
        <GlassInput value={tags} onChange={(e) => setTags(e.target.value)} placeholder="comma-separated" />
      </FormField>
    </SlideDrawer>
  );
}

/* ── 11. FORM ── */
export function CreateFormDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addToast } = useToast();
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle('');
    }
  }, [open]);

  const submit = async (closeAfter: boolean) => {
    if (!title.trim()) {
      addToast('Form name is required', 'error');
      return;
    }
    setSaving(true);
    try {
      const r = await postJson('/api/forms', {
        title: title.trim(),
        fields: [],
        status: 'draft',
      });
      if (!r.ok) throw new Error(r.error);
      addToast('Form created', 'success');
      dispatchDataInvalidation('forms');
      if (closeAfter) onClose();
      else setTitle('');
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Create failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SlideDrawer
      open={open}
      onClose={onClose}
      title="New Form"
      subtitle="Create a form template"
      footer={
        <DrawerFooter
          onCancel={onClose}
          saving={saving}
          primaryLabel="Create Form"
          onPrimary={() => submit(true)}
          onPrimaryAndAnother={() => submit(false)}
        />
      }
    >
      <FormField label="Form Name" required>
        <GlassInput value={title} onChange={(e) => setTitle(e.target.value)} />
      </FormField>
    </SlideDrawer>
  );
}
