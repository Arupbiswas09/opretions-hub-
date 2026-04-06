'use client';
import React, { useState } from 'react';
import {
  Building2, User, DollarSign, FolderKanban, Clock, FileText,
  FileSignature, Receipt, Tag, Calendar, Briefcase, Mail, Phone,
  MapPin, Hash, Globe, Percent, CreditCard, Plus, Check,
} from 'lucide-react';
import { SlideDrawer, FormField, GlassInput, GlassTextarea, GlassSelect } from './Overlays';
import { useToast } from '../bonsai/ToastSystem';

/* ══════════════════════════════════════════════════════════════════════
   QUICK-CREATE DRAWERS
   Each drawer is a self-contained creation form opened from:
   - Quick Add (+) menu in top bar
   - "New X" buttons on list pages
   ══════════════════════════════════════════════════════════════════════ */

/* ── Helper: Save button footer (+ product feedback per doc: toasts on create) ── */
function DrawerFooter({
  onSave,
  onCancel,
  saving = false,
  saveLabel = 'Create',
  successToast,
}: {
  onSave: () => void;
  onCancel: () => void;
  saving?: boolean;
  saveLabel?: string;
  /** Shown when primary or “add another” completes — prototype acknowledges the action */
  successToast?: string;
}) {
  const { addToast } = useToast();
  const done = (message?: string) => {
    if (message) addToast(message, 'success');
    onSave();
  };
  return (
    <div className="flex items-center justify-between">
      <button
        type="button"
        onClick={onCancel}
        className="px-4 py-2 rounded-lg text-[13px] font-medium transition-colors"
        style={{ background: 'var(--glass-bg)', color: 'var(--foreground)', border: '1px solid var(--border)' }}
      >
        Cancel
      </button>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => done(successToast)}
          className="px-4 py-2 rounded-lg text-[13px] font-medium transition-all hover:scale-[1.02] flex items-center gap-2"
          style={{ background: 'var(--glass-bg)', color: 'var(--foreground)', border: '1px solid var(--border)' }}
        >
          {saveLabel} & Add Another
        </button>
        <button
          type="button"
          onClick={() => done(successToast)}
          className="px-5 py-2 rounded-lg text-[13px] font-medium transition-all hover:scale-[1.02] flex items-center gap-2"
          style={{ background: '#2563EB', color: '#FFF' }}
        >
          <Check className="w-3.5 h-3.5" />
          {saving ? 'Saving...' : saveLabel}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   1. CREATE CLIENT DRAWER
   ═══════════════════════════════════════ */
export function CreateClientDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <SlideDrawer open={open} onClose={onClose} title="New Client" subtitle="Add a new client to your workspace"
      footer={<DrawerFooter onSave={onClose} onCancel={onClose} saveLabel="Create Client" successToast="Client created" />}>
      <FormField label="Company Name" required>
        <GlassInput placeholder="e.g. Acme Corporation" />
      </FormField>
      <FormField label="Industry">
        <GlassSelect>
          <option value="">Select industry...</option>
          <option>Technology</option><option>Finance</option>
          <option>Healthcare</option><option>Retail</option>
          <option>Education</option><option>Marketing</option>
          <option>Real Estate</option><option>Consulting</option>
        </GlassSelect>
      </FormField>
      <FormField label="Company Size">
        <GlassSelect>
          <option value="">Select size...</option>
          <option>1-10</option><option>11-50</option>
          <option>51-200</option><option>201-1000</option><option>1000+</option>
        </GlassSelect>
      </FormField>
      <div className="pt-2 mb-4">
        <p className="text-[11px] font-medium uppercase tracking-wider mb-3"
          style={{ color: 'var(--muted-foreground)' }}>Primary Contact</p>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="First Name" className="!mb-0">
            <GlassInput placeholder="John" />
          </FormField>
          <FormField label="Last Name" className="!mb-0">
            <GlassInput placeholder="Doe" />
          </FormField>
        </div>
      </div>
      <FormField label="Contact Email">
        <GlassInput type="email" placeholder="john@acme.com" />
      </FormField>
      <FormField label="Contact Phone">
        <GlassInput type="tel" placeholder="+1 (555) 000-0000" />
      </FormField>
      <FormField label="Website">
        <GlassInput type="url" placeholder="https://acme.com" />
      </FormField>
      <FormField label="Billing Address">
        <GlassTextarea rows={2} placeholder="123 Main St, Suite 100, City, State, ZIP" />
      </FormField>
      <FormField label="Tags">
        <GlassInput placeholder="Add tags separated by comma..." />
      </FormField>
      <div className="flex items-center gap-3 mt-2 px-1">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" className="w-4 h-4 rounded accent-blue-500" defaultChecked />
          <span className="text-[12px]" style={{ color: 'var(--foreground-secondary)' }}>
            Enable Client Portal access
          </span>
        </label>
      </div>
    </SlideDrawer>
  );
}

/* ═══════════════════════════════════════
   2. CREATE DEAL DRAWER
   ═══════════════════════════════════════ */
export function CreateDealDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <SlideDrawer open={open} onClose={onClose} title="New Deal" subtitle="Add a new deal to your pipeline"
      footer={<DrawerFooter onSave={onClose} onCancel={onClose} saveLabel="Create Deal" successToast="Deal added to pipeline" />}>
      <FormField label="Deal Name" required>
        <GlassInput placeholder="e.g. Website Redesign — Acme Corp" />
      </FormField>
      <FormField label="Client">
        <GlassSelect>
          <option value="">Select client...</option>
          <option>Acme Corporation</option>
          <option>Tech Startup Inc</option>
          <option>Local Retail Co</option>
          <option>Growth Labs</option>
          <option>Fashion Forward</option>
        </GlassSelect>
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Deal Value" required>
          <GlassInput type="text" placeholder="$25,000" />
        </FormField>
        <FormField label="Currency">
          <GlassSelect>
            <option>USD</option><option>EUR</option><option>GBP</option><option>INR</option>
          </GlassSelect>
        </FormField>
      </div>
      <FormField label="Pipeline Stage">
        <GlassSelect>
          <option>Lead</option><option>Qualified</option>
          <option>Proposal Sent</option><option>Negotiation</option>
        </GlassSelect>
      </FormField>
      <FormField label="Expected Close Date">
        <GlassInput type="date" />
      </FormField>
      <FormField label="Deal Owner">
        <GlassSelect>
          <option>John Doe</option><option>Jane Smith</option><option>Sarah Wilson</option>
        </GlassSelect>
      </FormField>
      <FormField label="Win Probability">
        <GlassInput type="number" placeholder="50" min={0} max={100} />
      </FormField>
      <FormField label="Source">
        <GlassSelect>
          <option value="">Select source...</option>
          <option>Referral</option><option>Website</option><option>Cold Outreach</option>
          <option>Social Media</option><option>Conference</option><option>Existing Client</option>
        </GlassSelect>
      </FormField>
      <FormField label="Notes">
        <GlassTextarea rows={3} placeholder="Add any relevant notes about this deal..." />
      </FormField>
    </SlideDrawer>
  );
}

/* ═══════════════════════════════════════
   3. CREATE PROJECT DRAWER
   ═══════════════════════════════════════ */
export function CreateProjectDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <SlideDrawer open={open} onClose={onClose} title="New Project" subtitle="Set up a new project with team and timeline"
      footer={<DrawerFooter onSave={onClose} onCancel={onClose} saveLabel="Create Project" successToast="Project created" />}>
      <FormField label="Project Name" required>
        <GlassInput placeholder="e.g. Website Redesign" />
      </FormField>
      <FormField label="Client" required>
        <GlassSelect>
          <option value="">Select client...</option>
          <option>Acme Corporation</option>
          <option>Tech Startup Inc</option>
          <option>Local Retail Co</option>
        </GlassSelect>
      </FormField>
      <FormField label="Project Type">
        <GlassSelect>
          <option>Fixed Price</option><option>Time & Materials</option>
          <option>Retainer</option><option>Internal</option>
        </GlassSelect>
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Start Date">
          <GlassInput type="date" />
        </FormField>
        <FormField label="End Date">
          <GlassInput type="date" />
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Budget">
          <GlassInput type="text" placeholder="$50,000" />
        </FormField>
        <FormField label="Hourly Rate">
          <GlassInput type="text" placeholder="$150/hr" />
        </FormField>
      </div>
      <FormField label="Project Lead">
        <GlassSelect>
          <option>John Doe</option><option>Jane Smith</option><option>Sarah Wilson</option>
        </GlassSelect>
      </FormField>
      <FormField label="Team Members">
        <GlassInput placeholder="Search and add team members..." />
      </FormField>
      <FormField label="Description">
        <GlassTextarea rows={3} placeholder="Describe the project scope and deliverables..." />
      </FormField>
      <FormField label="Tags">
        <GlassInput placeholder="design, web, branding..." />
      </FormField>
    </SlideDrawer>
  );
}

/* ═══════════════════════════════════════
   4. CREATE INVOICE DRAWER
   ═══════════════════════════════════════ */
export function CreateInvoiceDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [lineItems] = useState([
    { desc: '', qty: 1, rate: 0 },
  ]);

  return (
    <SlideDrawer open={open} onClose={onClose} title="New Invoice" subtitle="Create and send an invoice" width="540px"
      footer={<DrawerFooter onSave={onClose} onCancel={onClose} saveLabel="Create Invoice" successToast="Invoice saved as draft" />}>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Client" required>
          <GlassSelect>
            <option value="">Select client...</option>
            <option>Acme Corporation</option>
            <option>Tech Startup Inc</option>
          </GlassSelect>
        </FormField>
        <FormField label="Invoice Number">
          <GlassInput defaultValue="INV-2026-007" />
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Invoice Date">
          <GlassInput type="date" />
        </FormField>
        <FormField label="Due Date">
          <GlassInput type="date" />
        </FormField>
      </div>
      <FormField label="Payment Terms">
        <GlassSelect>
          <option>Net 30</option><option>Net 15</option>
          <option>Net 60</option><option>Due on Receipt</option>
        </GlassSelect>
      </FormField>

      {/* Line Items */}
      <div className="mt-2 mb-4">
        <p className="text-[11px] font-medium uppercase tracking-wider mb-2"
          style={{ color: 'var(--muted-foreground)' }}>Line Items</p>
        <div className="rounded-lg overflow-hidden"
          style={{ border: '1px solid var(--border)' }}>
          {/* Header */}
          <div className="grid grid-cols-[1fr_60px_80px_80px] gap-2 px-3 py-2 text-[10px] font-medium uppercase tracking-wider"
            style={{ background: 'var(--glass-bg)', color: 'var(--muted-foreground)', borderBottom: '1px solid var(--border)' }}>
            <span>Description</span>
            <span className="text-right">Qty</span>
            <span className="text-right">Rate</span>
            <span className="text-right">Amount</span>
          </div>
          {/* Row */}
          <div className="grid grid-cols-[1fr_60px_80px_80px] gap-2 px-3 py-2.5 items-center">
            <input className="bg-transparent text-[13px] outline-none w-full"
              style={{ color: 'var(--foreground)' }} placeholder="Service description..." />
            <input className="bg-transparent text-[13px] outline-none text-right w-full tabular-nums"
              style={{ color: 'var(--foreground)' }} defaultValue="1" />
            <input className="bg-transparent text-[13px] outline-none text-right w-full tabular-nums"
              style={{ color: 'var(--foreground)' }} placeholder="$0.00" />
            <span className="text-[13px] text-right tabular-nums font-medium"
              style={{ color: 'var(--foreground)' }}>$0.00</span>
          </div>
          {/* Add Row */}
          <button className="w-full px-3 py-2 text-[12px] flex items-center gap-1.5 transition-colors hover:bg-white/[0.03]"
            style={{ color: '#2563EB', borderTop: '1px solid var(--border)' }}>
            <Plus className="w-3 h-3" /> Add Line Item
          </button>
        </div>
      </div>

      {/* Totals */}
      <div className="rounded-lg px-4 py-3 mb-4"
        style={{ background: 'var(--glass-bg)', border: '1px solid var(--border)' }}>
        <div className="flex justify-between text-[12px] mb-1.5"
          style={{ color: 'var(--muted-foreground)' }}>
          <span>Subtotal</span><span className="tabular-nums" style={{ color: 'var(--foreground)' }}>$0.00</span>
        </div>
        <div className="flex justify-between text-[12px] mb-1.5"
          style={{ color: 'var(--muted-foreground)' }}>
          <span>Tax (0%)</span><span className="tabular-nums" style={{ color: 'var(--foreground)' }}>$0.00</span>
        </div>
        <div className="flex justify-between text-[14px] font-semibold pt-1.5"
          style={{ borderTop: '1px solid var(--border)', color: 'var(--foreground)' }}>
          <span>Total</span><span className="tabular-nums">$0.00</span>
        </div>
      </div>

      <FormField label="Notes">
        <GlassTextarea rows={2} placeholder="Payment instructions or additional notes..." />
      </FormField>
    </SlideDrawer>
  );
}

/* ═══════════════════════════════════════
   5. CREATE TIME ENTRY DRAWER
   ═══════════════════════════════════════ */
export function CreateTimeEntryDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <SlideDrawer open={open} onClose={onClose} title="Log Time" subtitle="Add a manual time entry"
      footer={<DrawerFooter onSave={onClose} onCancel={onClose} saveLabel="Log Entry" successToast="Time entry logged" />}>
      <FormField label="Project" required>
        <GlassSelect>
          <option value="">Select project...</option>
          <option>Website Redesign — Acme Corp</option>
          <option>Mobile App Dev — Tech Startup</option>
          <option>Brand Identity — Local Retail</option>
        </GlassSelect>
      </FormField>
      <FormField label="Task Description" required>
        <GlassInput placeholder="What did you work on?" />
      </FormField>
      <FormField label="Date">
        <GlassInput type="date" />
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Start Time">
          <GlassInput type="time" />
        </FormField>
        <FormField label="End Time">
          <GlassInput type="time" />
        </FormField>
      </div>
      <FormField label="Duration">
        <GlassInput placeholder="2h 30m" />
      </FormField>
      <div className="flex items-center gap-3 mt-2 px-1 mb-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" className="w-4 h-4 rounded accent-blue-500" defaultChecked />
          <span className="text-[12px]" style={{ color: 'var(--foreground-secondary)' }}>
            Billable
          </span>
        </label>
      </div>
      <FormField label="Notes">
        <GlassTextarea rows={2} placeholder="Additional notes..." />
      </FormField>
    </SlideDrawer>
  );
}

/* ═══════════════════════════════════════
   6. CREATE PROPOSAL DRAWER
   ═══════════════════════════════════════ */
export function CreateProposalDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <SlideDrawer open={open} onClose={onClose} title="New Proposal" subtitle="Draft a new proposal for a client"
      footer={<DrawerFooter onSave={onClose} onCancel={onClose} saveLabel="Create Proposal" successToast="Proposal draft created" />}>
      <FormField label="Proposal Title" required>
        <GlassInput placeholder="e.g. Website Redesign Proposal" />
      </FormField>
      <FormField label="Client" required>
        <GlassSelect>
          <option value="">Select client...</option>
          <option>Acme Corporation</option>
          <option>Tech Startup Inc</option>
        </GlassSelect>
      </FormField>
      <FormField label="Template">
        <GlassSelect>
          <option value="">Start from scratch...</option>
          <option>Standard Proposal</option>
          <option>Detailed Scope of Work</option>
          <option>Quick Estimate</option>
        </GlassSelect>
      </FormField>
      <FormField label="Valid Until">
        <GlassInput type="date" />
      </FormField>
      <FormField label="Proposal Value">
        <GlassInput type="text" placeholder="$25,000" />
      </FormField>
      <FormField label="Executive Summary">
        <GlassTextarea rows={4} placeholder="Brief overview of what you're proposing..." />
      </FormField>
      <FormField label="Terms & Conditions">
        <GlassTextarea rows={3} placeholder="Payment terms, timeline, deliverables..." />
      </FormField>
    </SlideDrawer>
  );
}

/* ═══════════════════════════════════════
   7. CREATE CONTRACT DRAWER
   ═══════════════════════════════════════ */
export function CreateContractDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <SlideDrawer open={open} onClose={onClose} title="New Contract" subtitle="Create a new contract or agreement"
      footer={<DrawerFooter onSave={onClose} onCancel={onClose} saveLabel="Create Contract" successToast="Contract draft saved" />}>
      <FormField label="Contract Title" required>
        <GlassInput placeholder="e.g. Master Service Agreement" />
      </FormField>
      <FormField label="Client" required>
        <GlassSelect>
          <option value="">Select client...</option>
          <option>Acme Corporation</option>
          <option>Tech Startup Inc</option>
        </GlassSelect>
      </FormField>
      <FormField label="Contract Type">
        <GlassSelect>
          <option>Service Agreement</option><option>NDA</option>
          <option>Scope of Work</option><option>Retainer Agreement</option>
          <option>Freelancer Agreement</option><option>SLA</option>
        </GlassSelect>
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Start Date">
          <GlassInput type="date" />
        </FormField>
        <FormField label="End Date">
          <GlassInput type="date" />
        </FormField>
      </div>
      <FormField label="Contract Value">
        <GlassInput type="text" placeholder="$120,000" />
      </FormField>
      <FormField label="Signed By">
        <GlassSelect>
          <option>John Doe</option><option>Jane Smith</option>
        </GlassSelect>
      </FormField>
      <FormField label="Description">
        <GlassTextarea rows={3} placeholder="Contract scope and key terms..." />
      </FormField>
    </SlideDrawer>
  );
}

/* ═══════════════════════════════════════
   8. CREATE EXPENSE DRAWER
   ═══════════════════════════════════════ */
export function CreateExpenseDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <SlideDrawer open={open} onClose={onClose} title="New Expense" subtitle="Submit an expense for reimbursement"
      footer={<DrawerFooter onSave={onClose} onCancel={onClose} saveLabel="Submit Expense" successToast="Expense submitted" />}>
      <FormField label="Description" required>
        <GlassInput placeholder="e.g. Client dinner at Nobu" />
      </FormField>
      <FormField label="Category">
        <GlassSelect>
          <option>Travel</option><option>Meals & Entertainment</option>
          <option>Software & Tools</option><option>Office Supplies</option>
          <option>Equipment</option><option>Marketing</option><option>Other</option>
        </GlassSelect>
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Amount" required>
          <GlassInput type="text" placeholder="$250.00" />
        </FormField>
        <FormField label="Date">
          <GlassInput type="date" />
        </FormField>
      </div>
      <FormField label="Project">
        <GlassSelect>
          <option value="">No project</option>
          <option>Website Redesign</option>
          <option>Mobile App Dev</option>
        </GlassSelect>
      </FormField>
      <FormField label="Receipt">
        <div className="rounded-lg p-6 text-center cursor-pointer transition-colors hover:bg-white/[0.02]"
          style={{ border: '2px dashed var(--border)', background: 'var(--glass-bg)' }}>
          <Receipt className="w-6 h-6 mx-auto mb-2" style={{ color: 'var(--muted-foreground)' }} />
          <p className="text-[12px]" style={{ color: 'var(--muted-foreground)' }}>
            Click or drag to upload receipt
          </p>
          <p className="text-[10px] mt-1" style={{ color: 'var(--muted-foreground)' }}>
            PNG, JPG, PDF up to 10MB
          </p>
        </div>
      </FormField>
      <FormField label="Notes">
        <GlassTextarea rows={2} placeholder="Additional details..." />
      </FormField>
    </SlideDrawer>
  );
}

/* ═══════════════════════════════════════
   9. CREATE CONTACT DRAWER
   ═══════════════════════════════════════ */
export function CreateContactDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <SlideDrawer open={open} onClose={onClose} title="New Contact" subtitle="Add a contact to your network"
      footer={<DrawerFooter onSave={onClose} onCancel={onClose} saveLabel="Create Contact" successToast="Contact created" />}>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="First Name" required>
          <GlassInput placeholder="John" />
        </FormField>
        <FormField label="Last Name" required>
          <GlassInput placeholder="Doe" />
        </FormField>
      </div>
      <FormField label="Email" required>
        <GlassInput type="email" placeholder="john@example.com" />
      </FormField>
      <FormField label="Phone">
        <GlassInput type="tel" placeholder="+1 (555) 000-0000" />
      </FormField>
      <FormField label="Company">
        <GlassSelect>
          <option value="">Select or type company...</option>
          <option>Acme Corporation</option>
          <option>Tech Startup Inc</option>
        </GlassSelect>
      </FormField>
      <FormField label="Job Title">
        <GlassInput placeholder="e.g. Marketing Director" />
      </FormField>
      <FormField label="Lead Source">
        <GlassSelect>
          <option value="">Select source...</option>
          <option>Referral</option><option>Website</option><option>LinkedIn</option>
          <option>Conference</option><option>Cold Outreach</option>
        </GlassSelect>
      </FormField>
      <FormField label="Tags">
        <GlassInput placeholder="vip, prospect, partner..." />
      </FormField>
      <FormField label="Notes">
        <GlassTextarea rows={2} placeholder="How did you meet?" />
      </FormField>
    </SlideDrawer>
  );
}

/* ═══════════════════════════════════════
   10. CREATE TASK DRAWER
   ═══════════════════════════════════════ */
export function CreateTaskDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <SlideDrawer open={open} onClose={onClose} title="New Task" subtitle="Create a task and assign it"
      footer={<DrawerFooter onSave={onClose} onCancel={onClose} saveLabel="Create Task" successToast="Task created" />}>
      <FormField label="Task Title" required>
        <GlassInput placeholder="e.g. Design homepage wireframe" />
      </FormField>
      <FormField label="Project">
        <GlassSelect>
          <option value="">No project</option>
          <option>Website Redesign</option>
          <option>Mobile App Dev</option>
          <option>Brand Identity</option>
        </GlassSelect>
      </FormField>
      <FormField label="Assignee">
        <GlassSelect>
          <option>John Doe</option><option>Jane Smith</option>
          <option>Sarah Wilson</option><option>Alex Brown</option>
        </GlassSelect>
      </FormField>
      <FormField label="Priority">
        <GlassSelect>
          <option>Low</option><option>Medium</option><option>High</option><option>Urgent</option>
        </GlassSelect>
      </FormField>
      <FormField label="Due Date">
        <GlassInput type="date" />
      </FormField>
      <FormField label="Description">
        <GlassTextarea rows={3} placeholder="Describe what needs to be done..." />
      </FormField>
      <FormField label="Tags">
        <GlassInput placeholder="design, ui, review..." />
      </FormField>
    </SlideDrawer>
  );
}

/* ═══════════════════════════════════════
   11. CREATE FORM DRAWER
   ═══════════════════════════════════════ */
export function CreateFormDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <SlideDrawer open={open} onClose={onClose} title="New Form" subtitle="Create a new intake or survey form"
      footer={<DrawerFooter onSave={onClose} onCancel={onClose} saveLabel="Create Form" successToast="Form template created" />}>
      <FormField label="Form Name" required>
        <GlassInput placeholder="e.g. Project Intake Form" />
      </FormField>
      <FormField label="Template">
        <GlassSelect>
          <option value="">Blank form</option>
          <option>Contact Request</option>
          <option>Project Intake</option>
          <option>Support Ticket</option>
          <option>Feedback Survey</option>
          <option>Expense Claim</option>
          <option>Leave Request</option>
        </GlassSelect>
      </FormField>
      <FormField label="Portal Assignment">
        <GlassSelect>
          <option value="">Internal only</option>
          <option>Client Portal</option>
          <option>Employee Portal</option>
          <option>Freelancer Portal</option>
          <option>All Portals</option>
        </GlassSelect>
      </FormField>
      <FormField label="Description">
        <GlassTextarea rows={3} placeholder="Describe the purpose of this form..." />
      </FormField>
    </SlideDrawer>
  );
}
