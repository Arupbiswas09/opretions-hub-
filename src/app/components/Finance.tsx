'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FI01FinanceDashboard } from './finance/FI01FinanceDashboard';
import { FI02InvoicesList } from './finance/FI02InvoicesList';
import { FI04InvoiceDrawer } from './finance/FI04InvoiceDrawer';

type Screen = 'dashboard' | 'invoices' | 'expenses';

export default function Finance() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');
  const [showInvoiceDrawer, setShowInvoiceDrawer] = useState(false);
  const [showGenerateWizard, setShowGenerateWizard] = useState(false);

  return (
    <div className="min-h-full">
      <div className="px-8 py-3 border-b border-stone-100/60">
        <div className="flex items-center gap-1">
          {([{ id: 'dashboard', label: 'Overview' }, { id: 'invoices', label: 'Invoices' }, { id: 'expenses', label: 'Expenses' }] as const).map((s) => (
            <button key={s.id} onClick={() => setCurrentScreen(s.id)} className={`px-3 py-1.5 text-[12px] rounded-md transition-all duration-200 ${currentScreen === s.id ? 'bg-stone-800 text-white font-medium shadow-sm' : 'text-stone-400 hover:text-stone-600 hover:bg-stone-50'}`}>{s.label}</button>
          ))}
          <div className="w-px h-3.5 bg-stone-200/60 mx-1.5" />
          <button onClick={() => setShowInvoiceDrawer(true)} className="px-3 py-1.5 text-[12px] text-stone-400 hover:text-stone-600 hover:bg-stone-50 rounded-md transition-colors">+ Invoice</button>
          <button onClick={() => setShowGenerateWizard(true)} className="px-3 py-1.5 text-[12px] text-stone-400 hover:text-stone-600 hover:bg-stone-50 rounded-md transition-colors">From Timesheets</button>
        </div>
      </div>

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
  return (
    <div className="p-8 max-w-4xl">
      <h2 className="text-xl font-medium text-stone-800 mb-6">Expense Claims</h2>
      <div className="flex gap-8 mb-8 pb-8 border-b border-stone-200/60">
        {[{ label: 'Pending', val: '18', sub: 'Awaiting review' }, { label: 'Approved MTD', val: '$24,120', sub: 'This month' }, { label: 'Rejected', val: '2', sub: 'Needs attention' }, { label: 'Total MTD', val: '$26,580', sub: 'All claims' }].map((s) => (
          <div key={s.label}><p className="text-[11px] text-stone-400 uppercase tracking-widest mb-1">{s.label}</p><p className="text-[24px] font-light text-stone-800">{s.val}</p><p className="text-[11px] text-stone-400 mt-1">{s.sub}</p></div>
        ))}
      </div>
      <div className="rounded-xl border border-stone-200/60 bg-white/50 backdrop-blur-sm p-8 text-center">
        <p className="text-[13px] text-stone-500">Uses the same approval flow as People module</p>
        <p className="text-[12px] text-stone-400 mt-1">Expense claims from team members appear here for finance approval</p>
      </div>
    </div>
  );
}

function GenerateWizard({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  return (
    <div className="fixed inset-0 bg-black/15 backdrop-blur-[2px] z-50 flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease]" onClick={onClose}>
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-2xl border border-stone-200/40 animate-[scaleIn_0.25s_cubic-bezier(0.16,1,0.3,1)]" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-stone-100/60">
          <h2 className="text-[15px] font-medium text-stone-800">Generate Invoice from Timesheets</h2>
          <p className="text-[12px] text-stone-400 mt-0.5">Step {step} of 3</p>
        </div>
        <div className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              <div><label className="block text-[13px] font-medium text-stone-600 mb-1.5">Client</label><select className="w-full px-3.5 py-2.5 bg-white/60 border border-stone-200/60 rounded-xl text-[13px]"><option>Acme Corporation</option><option>Tech Startup Inc</option></select></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-[13px] font-medium text-stone-600 mb-1.5">Start Date</label><input type="date" className="w-full px-3.5 py-2.5 bg-white/60 border border-stone-200/60 rounded-xl text-[13px]" /></div>
                <div><label className="block text-[13px] font-medium text-stone-600 mb-1.5">End Date</label><input type="date" className="w-full px-3.5 py-2.5 bg-white/60 border border-stone-200/60 rounded-xl text-[13px]" /></div>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-3">
              <h3 className="text-[13px] font-medium text-stone-700 mb-3">Review Timesheets</h3>
              {[1, 2, 3].map((i) => (
                <label key={i} className="flex items-center gap-3 p-4 rounded-xl border border-stone-200/60 bg-white/50 cursor-pointer hover:bg-white/70 transition-colors">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-stone-300 text-stone-800" />
                  <div className="flex-1"><p className="text-[13px] font-medium text-stone-700">Week of Jan {i * 7}, 2026</p><p className="text-[12px] text-stone-400">42 hours · $6,300</p></div>
                </label>
              ))}
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/60 flex items-center justify-between">
                <span className="text-[13px] font-medium text-stone-700">Total</span>
                <span className="text-xl font-light text-stone-800">$18,900</span>
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-4">
              <div><label className="block text-[13px] font-medium text-stone-600 mb-1.5">Invoice Number</label><input type="text" defaultValue="INV-2026-003" className="w-full px-3.5 py-2.5 bg-white/60 border border-stone-200/60 rounded-xl text-[13px]" /></div>
              <div><label className="block text-[13px] font-medium text-stone-600 mb-1.5">Due Date</label><input type="date" className="w-full px-3.5 py-2.5 bg-white/60 border border-stone-200/60 rounded-xl text-[13px]" /></div>
              <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/40"><p className="text-[13px] text-emerald-700"><strong>Ready to generate.</strong> Invoice will be marked as Draft.</p></div>
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t border-stone-100/60 flex items-center justify-between">
          <button onClick={onClose} className="px-4 py-2 text-[13px] text-stone-500 hover:text-stone-700 rounded-lg transition-colors">Cancel</button>
          <div className="flex items-center gap-2">
            {step > 1 && <button onClick={() => setStep(step - 1)} className="px-4 py-2 text-[13px] text-stone-500 hover:text-stone-700 rounded-lg transition-colors">Back</button>}
            <button onClick={() => { if (step < 3) setStep(step + 1); else onClose(); }} className="px-4 py-2 text-[13px] font-medium bg-stone-800 text-white rounded-lg hover:bg-stone-700 shadow-sm transition-colors active:scale-[0.97]">{step < 3 ? 'Next' : 'Generate Invoice'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
