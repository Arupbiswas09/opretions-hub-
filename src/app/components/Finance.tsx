'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FI01FinanceDashboard } from './finance/FI01FinanceDashboard';
import { FI02InvoicesList } from './finance/FI02InvoicesList';
import { FI04InvoiceDrawer } from './finance/FI04InvoiceDrawer';
import { HubStatTile } from './ops/HubStatTile';
import { moduleSubNavButtonClass, ModuleSubNavDivider } from './ui/ModuleSubNav';

type Screen = 'dashboard' | 'invoices' | 'expenses';

export default function Finance({ initialScreen = 'dashboard', hideNav = false }: { initialScreen?: Screen; hideNav?: boolean }) {
  const [currentScreen, setCurrentScreen] = useState<Screen>(initialScreen);
  const [showInvoiceDrawer, setShowInvoiceDrawer] = useState(false);
  const [showGenerateWizard, setShowGenerateWizard] = useState(false);

  return (
    <div className="min-h-full">
      {!hideNav && (
        <div className="px-8 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-1 flex-wrap">
            {([{ id: 'dashboard', label: 'Overview' }, { id: 'invoices', label: 'Invoices' }, { id: 'expenses', label: 'Expenses' }] as const).map((s) => (
              <button key={s.id} type="button" onClick={() => setCurrentScreen(s.id)}
                className={moduleSubNavButtonClass(currentScreen === s.id)}>{s.label}</button>
            ))}
            <ModuleSubNavDivider />
            <button type="button" onClick={() => setShowInvoiceDrawer(true)}
              className={moduleSubNavButtonClass(false)}>+ Invoice</button>
            <button type="button" onClick={() => setShowGenerateWizard(true)}
              className={moduleSubNavButtonClass(false)}>From Timesheets</button>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div key={currentScreen} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}>
          {currentScreen === 'dashboard' && <FI01FinanceDashboard onNavigateToInvoices={() => setCurrentScreen('invoices')} onNavigateToExpenses={() => setCurrentScreen('expenses')} />}
          {currentScreen === 'invoices' && <FI02InvoicesList onInvoiceClick={() => {}} onCreate={() => setShowInvoiceDrawer(true)} onGenerateFromTimesheets={() => setShowGenerateWizard(true)} />}
          {currentScreen === 'expenses' && <ExpensesDemo />}
        </motion.div>
      </AnimatePresence>

      <FI04InvoiceDrawer isOpen={showInvoiceDrawer} onClose={() => setShowInvoiceDrawer(false)} onSave={() => {}} />

      {showGenerateWizard && <GenerateWizard onClose={() => setShowGenerateWizard(false)} />}
    </div>
  );
}

function ExpensesDemo() {
  const stats = [
    { label: 'Pending', val: '18', sub: 'Awaiting review', delay: 0 },
    { label: 'Approved MTD', val: '$24,120', sub: 'This month', delay: 0.05 },
    { label: 'Rejected', val: '2', sub: 'Needs attention', delay: 0.1 },
    { label: 'Total MTD', val: '$26,580', sub: 'All claims', delay: 0.15 },
  ] as const;
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h2 className="text-xl font-medium text-foreground mb-6">Expense Claims</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 pb-8 border-b border-border">
        {stats.map((s) => (
          <HubStatTile key={s.label} label={s.label} value={s.val} sub={s.sub} delay={s.delay} />
        ))}
      </div>
      <div className="hub-surface hub-surface-elevated p-8 text-center rounded-xl">
        <p className="text-[13px] text-muted-foreground">Uses the same approval flow as People module</p>
        <p className="text-[12px] text-muted-foreground/80 mt-1">Expense claims from team members appear here for finance approval</p>
      </div>
    </div>
  );
}

function GenerateWizard({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  const field = 'w-full px-3.5 py-2.5 bg-input-background border border-border rounded-xl text-[13px] text-foreground';
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
            <button type="button" onClick={() => { if (step < 3) setStep(step + 1); else onClose(); }} className="px-4 py-2 text-[13px] font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 shadow-sm transition-colors active:scale-[0.97]">{step < 3 ? 'Next' : 'Generate Invoice'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
