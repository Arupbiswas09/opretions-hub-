'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FI01FinanceDashboard } from './finance/FI01FinanceDashboard';
import { FI02InvoicesList } from './finance/FI02InvoicesList';
import { FI04InvoiceDrawer } from './finance/FI04InvoiceDrawer';
import { HubStatTile } from './ops/HubStatTile';
import { moduleSubNavButtonClass, ModuleSubNavDivider, ModuleSubNav } from './ui/ModuleSubNav';
import { useHubDataInvalidation } from '../lib/hub/use-data-invalidation';
import { dispatchDataInvalidation } from '../lib/hub-events';
import { useToast } from './bonsai/ToastSystem';

type Screen = 'dashboard' | 'invoices' | 'expenses';

export default function Finance({ initialScreen = 'dashboard', hideNav = false }: { initialScreen?: Screen; hideNav?: boolean }) {
  const refresh = useHubDataInvalidation('invoices', 'expenses', 'all');
  const { addToast } = useToast();
  const [currentScreen, setCurrentScreen] = useState<Screen>(initialScreen);
  const [showInvoiceDrawer, setShowInvoiceDrawer] = useState(false);
  const [showGenerateWizard, setShowGenerateWizard] = useState(false);

  const handleSaveInvoice = async (data: any) => {
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          client_id: data?.clientId || data?.client_id || null,
          issue_date: data?.issueDate || data?.issue_date || null,
          due_date: data?.dueDate || data?.due_date || null,
          line_items: data?.lineItems || data?.line_items || [],
          tax: data?.tax || 0,
          status: 'draft',
        }),
      });
      if (res.ok) {
        addToast('Invoice saved as draft', 'success');
        dispatchDataInvalidation('invoices');
        setShowInvoiceDrawer(false);
      } else {
        const json = await res.json();
        addToast(json.error || 'Failed to create invoice', 'error');
      }
    } catch {
      addToast('Network error', 'error');
    }
  };

  return (
    <div className="min-h-full">
      {!hideNav && (
        <ModuleSubNav>
          {([{ id: 'dashboard', label: 'Overview' }, { id: 'invoices', label: 'Invoices' }, { id: 'expenses', label: 'Expenses' }] as const).map((s) => (
            <button key={s.id} type="button" onClick={() => setCurrentScreen(s.id)}
              className={moduleSubNavButtonClass(currentScreen === s.id)}>{s.label}</button>
          ))}
          <ModuleSubNavDivider />
          <button type="button" onClick={() => setShowInvoiceDrawer(true)}
            className={moduleSubNavButtonClass(false)}>+ Invoice</button>
          <button type="button" onClick={() => setShowGenerateWizard(true)}
            className={moduleSubNavButtonClass(false)}>From Timesheets</button>
        </ModuleSubNav>
      )}

      <AnimatePresence mode="wait">
        <motion.div key={currentScreen} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4, pointerEvents: 'none' }} transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}>
          {currentScreen === 'dashboard' && <FI01FinanceDashboard onNavigateToInvoices={() => setCurrentScreen('invoices')} onNavigateToExpenses={() => setCurrentScreen('expenses')} />}
          {currentScreen === 'invoices' && <FI02InvoicesList onInvoiceClick={() => {}} onCreate={() => setShowInvoiceDrawer(true)} onGenerateFromTimesheets={() => setShowGenerateWizard(true)} />}
          {currentScreen === 'expenses' && <ExpensesView refreshVersion={refresh} />}
        </motion.div>
      </AnimatePresence>

      <FI04InvoiceDrawer isOpen={showInvoiceDrawer} onClose={() => setShowInvoiceDrawer(false)} onSave={handleSaveInvoice} />

      {showGenerateWizard && <GenerateWizard onClose={() => setShowGenerateWizard(false)} />}
    </div>
  );
}

function ExpensesView({ refreshVersion }: { refreshVersion: number }) {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/expenses?limit=200', { credentials: 'include' });
      const json = await res.json();
      if (res.ok && Array.isArray(json.data)) {
        setExpenses(json.data);
      }
    } catch { /* empty */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load, refreshVersion]);

  const pending = expenses.filter(e => e.status === 'submitted');
  const approved = expenses.filter(e => e.status === 'approved');
  const rejected = expenses.filter(e => e.status === 'rejected');
  const totalMTD = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  const stats = [
    { label: 'Pending', val: String(pending.length), sub: 'Awaiting review', delay: 0 },
    { label: 'Approved MTD', val: `$${approved.reduce((s, e) => s + (Number(e.amount) || 0), 0).toLocaleString()}`, sub: 'This month', delay: 0.05 },
    { label: 'Rejected', val: String(rejected.length), sub: 'Needs attention', delay: 0.1 },
    { label: 'Total MTD', val: `$${totalMTD.toLocaleString()}`, sub: 'All claims', delay: 0.15 },
  ] as const;

  return (
    <div className="mx-auto w-full max-w-4xl px-3 py-6 sm:p-8">
      <h2 className="text-xl font-medium text-foreground mb-6">Expense Claims</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 pb-8 border-b border-border">
        {stats.map((s) => (
          <HubStatTile key={s.label} label={s.label} value={s.val} sub={s.sub} delay={s.delay} />
        ))}
      </div>

      {loading ? (
        <div className="hub-surface hub-surface-elevated p-8 text-center rounded-xl">
          <p className="text-[13px] text-muted-foreground animate-pulse">Loading expenses…</p>
        </div>
      ) : expenses.length === 0 ? (
        <div className="hub-surface hub-surface-elevated p-8 text-center rounded-xl">
          <p className="text-[13px] text-muted-foreground">No expense claims yet</p>
          <p className="text-[12px] text-muted-foreground/80 mt-1">Submit expenses through the People module or Quick Create</p>
        </div>
      ) : (
        <div className="hub-surface hub-surface-elevated rounded-xl overflow-hidden">
          <div className="divide-y divide-border">
            {expenses.map((exp: any) => (
              <div key={exp.id} className="flex items-center justify-between px-5 py-3.5">
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium text-foreground truncate">{exp.description}</p>
                  <p className="text-[11px] text-muted-foreground">{exp.category || 'Uncategorized'} · {exp.expense_date ? new Date(exp.expense_date).toLocaleDateString() : '—'}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-[13px] font-medium text-foreground tabular-nums">${Number(exp.amount).toLocaleString()}</span>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${
                    exp.status === 'approved' ? 'bg-emerald-500/15 text-emerald-600' :
                    exp.status === 'rejected' ? 'bg-destructive/15 text-destructive' :
                    'bg-amber-500/15 text-amber-600'
                  }`}>
                    {exp.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function GenerateWizard({ onClose }: { onClose: () => void }) {
  const { addToast } = useToast();
  const [step, setStep] = useState(1);
  const field = 'w-full px-3.5 py-2.5 bg-input-background border border-border rounded-xl text-[13px] text-foreground';

  const handleGenerate = async () => {
    addToast('Invoice generated as Draft', 'success');
    dispatchDataInvalidation('invoices');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease]" role="presentation">
      <div className="absolute inset-0 hub-overlay-backdrop" aria-hidden onClick={onClose} />
      <div
        className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl border border-border hub-modal-solid animate-[scaleIn_0.25s_cubic-bezier(0.16,1,0.3,1)] max-h-[min(90vh,760px)] flex flex-col shadow-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="shrink-0 border-b border-border bg-background-2 px-6 py-4">
          <h2 className="text-[15px] font-medium text-foreground">Generate Invoice from Timesheets</h2>
          <p className="text-[12px] text-muted-foreground mt-0.5">Step {step} of 3</p>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto bg-background-2 p-6">
          {step === 1 && (
            <div className="space-y-4">
              <div><label className="block text-[13px] font-medium text-muted-foreground mb-1.5">Client</label><select className={field}><option>Acme Corporation</option><option>Tech Startup Inc</option></select></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-[13px] font-medium text-muted-foreground mb-1.5">Start Date</label><input type="date" className={field} /></div>
                <div><label className="block text-[13px] font-medium text-muted-foreground mb-1.5">End Date</label><input type="date" className={field} /></div>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-3">
              <h3 className="text-[13px] font-medium text-foreground mb-3">Review Timesheets</h3>
              {[1, 2, 3].map((i) => (
                <label key={i} className="flex items-center gap-3 p-4 rounded-xl border border-border bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-border text-primary" />
                  <div className="flex-1"><p className="text-[13px] font-medium text-foreground">Week of Jan {i * 7}, 2026</p><p className="text-[12px] text-muted-foreground">42 hours · $6,300</p></div>
                </label>
              ))}
              <div className="p-4 rounded-xl bg-secondary border border-border flex items-center justify-between">
                <span className="text-[13px] font-medium text-foreground">Total</span>
                <span className="text-xl font-light text-foreground tabular-nums">$18,900</span>
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-4">
              <div><label className="block text-[13px] font-medium text-muted-foreground mb-1.5">Invoice Number</label><input type="text" defaultValue="INV-2026-003" className={field} /></div>
              <div><label className="block text-[13px] font-medium text-muted-foreground mb-1.5">Due Date</label><input type="date" className={field} /></div>
              <div className="p-4 rounded-xl border border-success/30 bg-[color:var(--success-muted)]"><p className="text-[13px] text-foreground"><strong>Ready to generate.</strong> Invoice will be marked as Draft.</p></div>
            </div>
          )}
        </div>
        <div className="flex shrink-0 items-center justify-between border-t border-border bg-background-2 px-6 py-4">
          <button type="button" onClick={onClose} className="px-4 py-2 text-[13px] text-muted-foreground hover:text-foreground rounded-lg transition-colors">Cancel</button>
          <div className="flex items-center gap-2">
            {step > 1 && <button type="button" onClick={() => setStep(step - 1)} className="px-4 py-2 text-[13px] text-muted-foreground hover:text-foreground rounded-lg transition-colors">Back</button>}
            <button type="button" onClick={() => { if (step < 3) setStep(step + 1); else void handleGenerate(); }} className="px-4 py-2 text-[13px] font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 shadow-sm transition-colors active:scale-[0.97]">{step < 3 ? 'Next' : 'Generate Invoice'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
