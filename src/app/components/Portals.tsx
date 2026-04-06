'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Home, Briefcase, FileText, DollarSign, Calendar, Users, FolderOpen, MessageSquare, ClipboardList, CheckSquare, FileCheck, ThumbsUp, Video, X, Check, Download, MessageCircle, User, BookOpen, Award, TrendingUp, Clock, Receipt, Shield, ChevronRight, Plus } from 'lucide-react';
import { BonsaiTabs } from './bonsai/BonsaiTabs';
import { BonsaiButton } from './bonsai/BonsaiButton';
import { BonsaiStatusPill } from './bonsai/BonsaiStatusPill';
import { BonsaiTimeline } from './bonsai/BonsaiTimeline';
import { BonsaiDocumentList } from './bonsai/BonsaiFileUpload';
import { EnhancedTable } from './operations/EnhancedTable';
import { useToast } from './bonsai/ToastSystem';
import { HubStatTile } from './ops/HubStatTile';
import { PortalSwitcher, PortalRail, PortalMain } from './portals/PortalChrome';
import { PortalNavProvider } from './portals/PortalNavContext';
import type { PortalType } from './portals/portal-types';

export type { PortalType } from './portals/portal-types';
type ClientScreen = 'home' | 'projects' | 'requests' | 'documents' | 'invoices' | 'invoice-detail' | 'support' | 'ticket-detail' | 'talent' | 'proposals' | 'proposal-detail' | 'approvals' | 'approval-detail-request' | 'approval-detail-invoice' | 'approval-detail-timesheet' | 'meetings' | 'meeting-detail' | 'forms';
type EmployeeScreen = 'home' | 'projects' | 'tasks' | 'timesheets' | 'expenses' | 'leave' | 'documents' | 'onboarding' | 'onboarding-task' | 'profile' | 'profile-change-request' | 'training' | 'training-detail' | 'performance-reviews' | 'performance-review-detail' | 'meetings' | 'meeting-detail';
type FreelancerScreen = 'home' | 'assignments' | 'tasks' | 'timesheets' | 'expenses' | 'documents' | 'onboarding' | 'contract-docs' | 'profile' | 'profile-change-request' | 'self-bills' | 'self-bill-detail';
type HRISScreen = 'profile-requests' | 'profile-request-detail' | 'document-requests';
type CandidateScreen = 'home' | 'application' | 'interviews' | 'documents' | 'offer';

type PortalsProps = {
  /** When set (e.g. from `/hub/portals/[portal]`), initial tab matches URL. */
  initialPortal?: PortalType;
  /** Use Next.js links for portal tabs so the URL stays in sync. */
  urlSync?: boolean;
};

export default function Portals({ initialPortal = 'employee', urlSync = false }: PortalsProps) {
  const params = useParams();
  const portalFromUrl = params?.portal as PortalType | undefined;
  const [portalType, setPortalType] = useState<PortalType>(initialPortal);
  const activePortal: PortalType =
    urlSync && portalFromUrl && (['client', 'employee', 'freelancer', 'hris', 'candidate'] as const).includes(portalFromUrl)
      ? portalFromUrl
      : portalType;
  const [clientScreen, setClientScreen] = useState<ClientScreen>('home');
  const [employeeScreen, setEmployeeScreen] = useState<EmployeeScreen>('home');
  const [freelancerScreen, setFreelancerScreen] = useState<FreelancerScreen>('home');
  const [hrisScreen, setHRISScreen] = useState<HRISScreen>('profile-requests');
  const [candidateScreen, setCandidateScreen] = useState<CandidateScreen>('home');

  const screenKey = activePortal === 'client' ? clientScreen
    : activePortal === 'employee' ? employeeScreen
    : activePortal === 'freelancer' ? freelancerScreen
    : activePortal === 'candidate' ? candidateScreen
    : hrisScreen;

  return (
    <PortalNavProvider>
    <div className="flex h-full min-h-0 flex-1 flex-col bg-background">
      <PortalSwitcher active={activePortal} urlSync={urlSync} onPortalChange={setPortalType} />

      <AnimatePresence mode="wait">
        <motion.div
          key={`${activePortal}-${screenKey}`}
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          {activePortal === 'client' && (
            <ClientPortal currentScreen={clientScreen} onNavigate={setClientScreen} />
          )}
          {activePortal === 'employee' && (
            <EmployeePortal currentScreen={employeeScreen} onNavigate={setEmployeeScreen} />
          )}
          {activePortal === 'freelancer' && (
            <FreelancerPortal currentScreen={freelancerScreen} onNavigate={setFreelancerScreen} />
          )}
          {activePortal === 'hris' && (
            <HRISPortal currentScreen={hrisScreen} onNavigate={setHRISScreen} />
          )}
          {activePortal === 'candidate' && (
            <CandidatePortal currentScreen={candidateScreen} onNavigate={setCandidateScreen} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
    </PortalNavProvider>
  );
}

// CP-00: Client Portal — vendor / buyer workspace (approvals, invoices, delivery)
function ClientPortal({ currentScreen, onNavigate }: { currentScreen: ClientScreen; onNavigate: (screen: ClientScreen) => void }) {
  const { addToast } = useToast();
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');
  const [approvalType, setApprovalType] = useState<'proposal' | 'request' | 'invoice'>('proposal');

  const menuItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'projects', label: 'Projects', icon: Briefcase },
    { id: 'proposals', label: 'Proposals', icon: FileCheck },
    { id: 'approvals', label: 'Approvals', icon: ThumbsUp },
    { id: 'requests', label: 'Requests', icon: Clock },
    { id: 'invoices', label: 'Invoices', icon: DollarSign },
    { id: 'documents', label: 'Documents', icon: FolderOpen },
    { id: 'meetings', label: 'Meetings', icon: Video },
    { id: 'talent', label: 'Talent', icon: Users },
    { id: 'support', label: 'Support', icon: MessageSquare },
    { id: 'forms', label: 'Forms', icon: ClipboardList },
  ];

  const clientNavActive = (itemId: string) => {
    const id = itemId as ClientScreen;
    return (
      currentScreen === id ||
      (currentScreen === 'proposal-detail' && id === 'proposals') ||
      (currentScreen.startsWith('approval-detail') && id === 'approvals') ||
      (currentScreen === 'meeting-detail' && id === 'meetings') ||
      (currentScreen === 'invoice-detail' && id === 'invoices') ||
      (currentScreen === 'ticket-detail' && id === 'support')
    );
  };

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">
      <PortalRail
        brandLetter="C"
        title="Client portal"
        subtitle="Acme Corporation"
        layoutId="portal-client-rail"
        items={menuItems}
        isItemActive={clientNavActive}
        onSelect={(id) => onNavigate(id as ClientScreen)}
        user={{ initials: 'AC', name: 'Alex Chen', email: 'alex.chen@acme.com' }}
      />

      <PortalMain>
        {currentScreen === 'home' && <ClientHome onNavigate={onNavigate} />}
        {currentScreen === 'projects' && <ClientProjects />}
        {currentScreen === 'proposals' && <ClientProposalsList onNavigate={onNavigate} />}
        {currentScreen === 'proposal-detail' && <ClientProposalDetail onNavigate={onNavigate} onShowApproval={(action) => { setApprovalAction(action); setApprovalType('proposal'); setShowApprovalModal(true); }} />}
        {currentScreen === 'approvals' && <ClientApprovalsInbox onNavigate={onNavigate} />}
        {currentScreen === 'approval-detail-request' && <ClientApprovalDetailRequest onNavigate={onNavigate} onShowApproval={(action) => { setApprovalAction(action); setApprovalType('request'); setShowApprovalModal(true); }} />}
        {currentScreen === 'approval-detail-invoice' && <ClientApprovalDetailInvoice onNavigate={onNavigate} onShowApproval={(action) => { setApprovalAction(action); setApprovalType('invoice'); setShowApprovalModal(true); }} />}
        {currentScreen === 'approval-detail-timesheet' && <ClientApprovalDetailTimesheet onNavigate={onNavigate} onShowApproval={(action) => { setApprovalAction(action); setApprovalType('request'); setShowApprovalModal(true); }} />}
        {currentScreen === 'meetings' && <ClientMeetingsList onNavigate={onNavigate} />}
        {currentScreen === 'meeting-detail' && <ClientMeetingDetail onNavigate={onNavigate} />}
        {currentScreen === 'requests' && <ClientRequests onNavigate={onNavigate} />}
        {currentScreen === 'documents' && <ClientDocuments />}
        {currentScreen === 'invoices' && <ClientInvoices onNavigate={onNavigate} />}
        {currentScreen === 'invoice-detail' && <ClientInvoiceDetail onNavigate={onNavigate} />}
        {currentScreen === 'support' && <ClientSupport onNavigate={onNavigate} />}
        {currentScreen === 'ticket-detail' && <ClientTicketDetail onNavigate={onNavigate} />}
        {currentScreen === 'talent' && <ClientTalent />}
        {currentScreen === 'forms' && <ClientFormsInbox />}
      </PortalMain>

      {/* Approval Modal */}
      {showApprovalModal && (
        <ApprovalModal
          action={approvalAction}
          type={approvalType}
          onClose={() => setShowApprovalModal(false)}
          onSuccess={() => {
            setShowApprovalModal(false);
            const verb = approvalAction === 'approve' ? 'approved' : 'rejected';
            addToast(
              approvalType === 'proposal'
                ? `Proposal ${verb}. Deal and activity log updated.`
                : `${approvalType.charAt(0).toUpperCase() + approvalType.slice(1)} ${verb}. Team notified.`,
              'success',
            );
            if (approvalType === 'proposal') {
              onNavigate('proposals');
            } else {
              onNavigate('approvals');
            }
          }}
        />
      )}
    </div>
  );
}

// CP-01: Client Portal Home — Editorial
function ClientHome({ onNavigate }: { onNavigate: (screen: ClientScreen) => void }) {
  const kpis = [
    { label: 'Active projects', value: '3', sub: '1 on track' },
    { label: 'Timesheets to review', value: '5', sub: 'awaiting approval' },
    { label: 'Open tickets', value: '2', sub: 'needs response' },
    { label: 'Invoices', value: '4', sub: '1 unpaid' },
  ];

  return (
    <div className="max-w-4xl px-6 py-8 md:px-8">
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Client workspace</p>
        <h1 className="text-[30px] font-semibold tracking-[-0.03em] text-foreground">Welcome back, Acme</h1>
        <p className="mt-2 max-w-xl text-[14px] text-muted-foreground">
          Approvals, delivery, and billing in one place — tuned for sponsor and procurement stakeholders.
        </p>
      </motion.div>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((kpi, i) => (
          <HubStatTile key={kpi.label} label={kpi.label} value={kpi.value} sub={kpi.sub} delay={i * 0.05} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <button
          type="button"
          onClick={() => onNavigate('projects')}
          className="portal-panel group p-5 text-left shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-[13px] font-semibold text-foreground">Active projects</h3>
            <span className="text-[14px] text-muted-foreground transition-colors group-hover:text-foreground">→</span>
          </div>
          <div className="space-y-2">
            {[
              { name: 'Website redesign', pct: 65 },
              { name: 'Mobile app', pct: 30 },
            ].map(p => (
              <div key={p.name} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <p className="text-[12px] font-medium text-foreground">{p.name}</p>
                  <p className="text-[11px] text-muted-foreground">{p.pct}%</p>
                </div>
                <div className="h-1 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-primary/70 transition-all" style={{ width: `${p.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('support')}
          className="portal-panel group p-5 text-left shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-[13px] font-semibold text-foreground">Support</h3>
            <span className="text-[14px] text-muted-foreground transition-colors group-hover:text-foreground">→</span>
          </div>
          <div className="rounded-lg border border-border bg-secondary/40 p-3">
            <p className="text-[12px] font-medium text-foreground">Access issue with project files</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Open · 2 hours ago</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('invoices')}
          className="portal-panel group p-5 text-left shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-[13px] font-semibold text-foreground">Recent invoices</h3>
            <span className="text-[14px] text-muted-foreground transition-colors group-hover:text-foreground">→</span>
          </div>
          <div className="rounded-lg border border-border bg-secondary/30 p-3">
            <p className="text-[12px] font-medium text-foreground">INV-2026-001 · $28,500</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Due Feb 14, 2026 · Pending</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('talent')}
          className="portal-panel group p-5 text-left shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-[13px] font-semibold text-foreground">Talent shortlists</h3>
            <span className="text-[14px] text-muted-foreground transition-colors group-hover:text-foreground">→</span>
          </div>
          <div className="rounded-lg border border-border bg-secondary/30 p-3">
            <p className="text-[12px] font-medium text-foreground">Senior React developer</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">3 candidates · your review</p>
          </div>
        </button>
      </div>
    </div>
  );
}

function ClientProjects() {
  return (
    <div className="px-3 py-6 sm:px-6 sm:py-8 lg:px-8 max-w-3xl">
      <h1 className="text-[24px] font-semibold text-foreground tracking-[-0.02em] mb-6">My Projects</h1>
      <div className="portal-panel overflow-hidden divide-y divide-border">
        {[
          { name: 'Website Redesign', status: 'On Track', statusKey: 'active' as const, progress: 65 },
          { name: 'Mobile App Development', status: 'In Progress', statusKey: 'inProgress' as const, progress: 30 },
          { name: 'Brand Identity', status: 'Completed', statusKey: 'completed' as const, progress: 100 },
        ].map((project, i) => (
          <div key={i} className="px-5 py-4 hover:bg-secondary/50 transition-colors cursor-pointer">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-[14px] font-medium text-foreground">{project.name}</h3>
              <BonsaiStatusPill status={project.statusKey} label={project.status} />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-muted-foreground/50 rounded-full" style={{ width: `${project.progress}%` }} />
              </div>
              <span className="text-[12px] text-muted-foreground">{project.progress}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ClientRequests({ onNavigate }: { onNavigate: (screen: ClientScreen) => void }) {
  return (
    <div className="px-3 py-6 sm:px-6 sm:py-8 lg:px-8 max-w-3xl">
      <h1 className="text-[24px] font-semibold text-foreground tracking-[-0.02em] mb-6">Pending Requests</h1>
      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.08em] mb-3">Timesheet Approvals</p>
      <div className="portal-panel overflow-hidden divide-y divide-border">
        {[1, 2, 3].map((i) => (
          <div key={i} className="px-5 py-4 flex items-center justify-between hover:bg-secondary/50 transition-colors">
            <div>
              <p className="text-[14px] font-medium text-foreground">Week of Jan {i * 7}, 2026</p>
              <p className="text-[12px] text-muted-foreground mt-0.5">Sarah Johnson · 42 hours</p>
            </div>
            <BonsaiButton size="sm" variant="ghost" onClick={() => onNavigate('approval-detail-timesheet')}>
              Review
            </BonsaiButton>
          </div>
        ))}
      </div>
    </div>
  );
}

function ClientFormsInbox() {
  const { addToast } = useToast();
  const rows = [
    { id: '1', name: 'Q1 satisfaction survey', due: 'Apr 15, 2026', status: 'Pending' },
    { id: '2', name: 'Security acknowledgement 2026', due: 'Apr 1, 2026', status: 'Overdue' },
    { id: '3', name: 'Project closeout — Website', due: 'Completed', status: 'Done' },
  ];
  return (
    <div className="px-3 py-6 sm:px-6 sm:py-8 lg:px-8 max-w-3xl">
      <h1 className="text-[24px] font-semibold text-foreground tracking-[-0.02em] mb-2">Forms inbox</h1>
      <p className="text-[13px] text-muted-foreground mb-6">Assigned intakes and signatures — same pipeline as the internal Forms module.</p>
      <div className="portal-panel">
        <EnhancedTable
          columns={[
            { key: 'name', label: 'Form', sortable: true },
            { key: 'due', label: 'Due / status', sortable: true },
            { key: 'status', label: 'State', sortable: true },
          ]}
          data={rows.map(r => ({
            ...r,
            status: (
              <BonsaiStatusPill
                status={r.status === 'Done' ? 'active' : r.status === 'Overdue' ? 'overdue' : 'pending'}
                label={r.status}
              />
            ),
          }))}
          onRowClick={() => addToast('Form builder opens in full product — response saved as draft here.', 'info')}
          searchable
          filterable
        />
      </div>
    </div>
  );
}

// CP-02: Client Portal Documents
function ClientDocuments() {
  const { addToast } = useToast();
  const documents = [
    { id: '1', name: 'Project-Brief.pdf', type: 'application/pdf', size: '1.2 MB', uploadedAt: 'Jan 15, 2026', uploadedBy: 'Team' },
    { id: '2', name: 'Contract-2026.pdf', type: 'application/pdf', size: '845 KB', uploadedAt: 'Jan 10, 2026', uploadedBy: 'Admin' },
    { id: '3', name: 'Design-Assets.zip', type: 'application/zip', size: '12.4 MB', uploadedAt: 'Jan 8, 2026', uploadedBy: 'Design Team' },
  ];

  return (
    <div className="px-3 py-6 sm:px-6 sm:py-8 lg:px-8 max-w-3xl">
      <h1 className="text-[24px] font-semibold text-foreground tracking-[-0.02em] mb-6">Documents</h1>
      <div className="flex gap-2 mb-4">
        {['All Types', 'PDF', 'Archives'].map(f => (
          <button key={f} className="px-3 py-1.5 text-[12px] rounded-md text-muted-foreground hover:text-muted-foreground hover:bg-secondary transition-colors first:bg-secondary first:text-foreground">{f}</button>
        ))}
      </div>
      <div className="portal-panel p-5">
        <BonsaiDocumentList
          documents={documents}
          onDownload={doc => addToast(`Downloading ${doc.name}`, 'info')}
          onDelete={undefined}
        />
      </div>
    </div>
  );
}

// CP-03: Client Portal Invoices
function ClientInvoices({ onNavigate }: { onNavigate: (screen: ClientScreen) => void }) {
  const invoices = [
    { id: '1', number: 'INV-2026-001', date: 'Jan 15, 2026', dueDate: 'Feb 14, 2026', amount: 28500, status: 'Sent' },
    { id: '2', number: 'INV-2025-098', date: 'Dec 28, 2025', dueDate: 'Jan 27, 2026', amount: 14800, status: 'Paid' },
  ];

  return (
    <div className="px-3 py-6 sm:px-6 sm:py-8 lg:px-8 max-w-3xl">
      <h1 className="text-[24px] font-semibold text-foreground tracking-[-0.02em] mb-6">Invoices</h1>

      <div className="portal-panel">
        <EnhancedTable
          columns={[
            { key: 'number', label: 'Invoice #', sortable: true },
            { key: 'date', label: 'Date', sortable: true },
            { key: 'dueDate', label: 'Due Date', sortable: true },
            { key: 'amount', label: 'Amount', sortable: true },
            { key: 'status', label: 'Status', sortable: true },
          ]}
          data={invoices.map(inv => ({
            ...inv,
            amount: <span className="font-semibold text-foreground">${inv.amount.toLocaleString()}</span>,
            status: (
              <BonsaiStatusPill
                status={inv.status === 'Paid' ? 'active' : 'pending'}
                label={inv.status}
              />
            ),
          }))}
          onRowClick={() => onNavigate('invoice-detail')}
          searchable
          filterable
        />
      </div>
    </div>
  );
}

// CP-04: Client Portal Invoice Detail
function ClientInvoiceDetail({ onNavigate }: { onNavigate: (screen: ClientScreen) => void }) {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="px-3 py-6 sm:p-8">
      <button
        onClick={() => onNavigate('invoices')}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        ← Back to Invoices
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">INV-2026-001</h1>
          <p className="text-sm text-muted-foreground">Due Feb 14, 2026</p>
        </div>
        <div className="flex items-center gap-3">
          <BonsaiStatusPill status="pending" label="Sent" />
          <BonsaiButton size="sm" variant="primary">Download PDF</BonsaiButton>
        </div>
      </div>

      <BonsaiTabs
        tabs={[
          { label: 'Overview', value: 'overview' },
          { label: 'Line Items', value: 'items' },
          { label: 'Activity', value: 'activity' },
        ]}
        value={activeTab}
        onValueChange={setActiveTab}
      />

      <div className="mt-6">
        {activeTab === 'overview' && (
          <div className="portal-panel rounded-lg p-6">
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Invoice Date</p>
                <p className="text-sm font-medium text-foreground">Jan 15, 2026</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Due Date</p>
                <p className="text-sm font-medium text-foreground">Feb 14, 2026</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Amount</p>
                <p className="text-2xl font-semibold text-foreground">$28,500.00</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Payment Terms</p>
                <p className="text-sm font-medium text-foreground">Net 30</p>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'items' && (
          <div className="portal-panel rounded-lg p-6">
            <div className="space-y-3">
              {[
                { desc: 'Website Design - Week 1-2', qty: 80, rate: 150 },
                { desc: 'Development - Week 1-2', qty: 100, rate: 125 },
              ].map((item, i) => (
                <div key={i} className="p-4 bg-secondary/40 rounded-lg flex justify-between">
                  <div>
                    <p className="font-medium text-foreground">{item.desc}</p>
                    <p className="text-sm text-muted-foreground">{item.qty} hours × ${item.rate}/hr</p>
                  </div>
                  <p className="font-semibold text-foreground">${(item.qty * item.rate).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'activity' && (
          <div className="portal-panel rounded-lg p-6">
            <BonsaiTimeline
              items={[
                { id: '1', title: 'Invoice sent', description: 'Sent to client email', timestamp: 'Jan 15, 2026', user: { name: 'System' } },
                { id: '2', title: 'Invoice created', description: 'Generated from timesheets', timestamp: 'Jan 15, 2026', user: { name: 'Finance' } },
              ]}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// CP-05: Client Portal Support
function ClientSupport({ onNavigate }: { onNavigate: (screen: ClientScreen) => void }) {
  return (
    <div className="px-3 py-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Support Tickets</h1>
        <BonsaiButton variant="primary">New Ticket</BonsaiButton>
      </div>

      <div className="portal-panel rounded-lg">
        <div className="divide-y divide-border">
          {[
            { id: '1', subject: 'Access issue with project files', status: 'Open', priority: 'High', created: '2 hours ago' },
            { id: '2', subject: 'Question about invoice', status: 'Resolved', priority: 'Low', created: '3 days ago' },
          ].map((ticket) => (
            <button
              key={ticket.id}
              onClick={() => onNavigate('ticket-detail')}
              className="w-full p-6 hover:bg-secondary/50 transition-colors text-left"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-foreground">{ticket.subject}</h3>
                <BonsaiStatusPill
                  status={ticket.status === 'Open' ? 'pending' : 'active'}
                  label={ticket.status}
                />
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  ticket.priority === 'High' ? 'bg-secondary text-foreground' : 'bg-secondary text-muted-foreground'
                }`}>
                  {ticket.priority}
                </span>
                <span>•</span>
                <span>{ticket.created}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// CP-06: Client Portal Ticket Detail
function ClientTicketDetail({ onNavigate }: { onNavigate: (screen: ClientScreen) => void }) {
  const [activeTab, setActiveTab] = useState('conversation');

  return (
    <div className="px-3 py-6 sm:p-8">
      <button
        onClick={() => onNavigate('support')}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        ← Back to Support
      </button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">Access issue with project files</h1>
          <p className="text-sm text-muted-foreground">Ticket #TKT-1234 • Created 2 hours ago</p>
        </div>
        <BonsaiStatusPill status="pending" label="Open" />
      </div>

      <BonsaiTabs
        tabs={[
          { label: 'Conversation', value: 'conversation' },
          { label: 'Attachments', value: 'attachments' },
        ]}
        value={activeTab}
        onValueChange={setActiveTab}
      />

      <div className="mt-6">
        {activeTab === 'conversation' && (
          <div className="space-y-4">
            <div className="portal-panel rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
                  AC
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-foreground">You</span>
                    <span className="text-xs text-muted-foreground">2 hours ago</span>
                  </div>
                  <p className="text-sm text-foreground">
                    I'm unable to access the shared project files folder. Getting an "Access Denied" error.
                  </p>
                </div>
              </div>
            </div>

            <div className="portal-panel rounded-lg p-4">
              <textarea
                rows={3}
                placeholder="Type your reply..."
                className="w-full px-3 py-2 bg-secondary/40 border border-border rounded-lg text-sm resize-none mb-2"
              />
              <BonsaiButton size="sm">Send Reply</BonsaiButton>
            </div>
          </div>
        )}
        {activeTab === 'attachments' && (
          <div className="portal-panel rounded-lg p-6 text-center text-muted-foreground">
            No attachments
          </div>
        )}
      </div>
    </div>
  );
}

function ClientTalent() {
  const { addToast } = useToast();
  return (
    <div className="mx-auto w-full max-w-3xl px-3 py-6 sm:p-8">
      <h1 className="text-2xl font-semibold text-foreground mb-2">Talent shortlists</h1>
      <p className="text-sm text-muted-foreground mb-6">Review profiles shared from Talent — feedback syncs to your account team.</p>

      <div className="space-y-6">
        <div className="portal-panel rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Senior React Developer</h3>
            <BonsaiStatusPill status="pending" label="Awaiting feedback" />
          </div>
          <p className="text-sm text-muted-foreground mb-4">3 shortlisted candidates</p>
          <div className="space-y-3">
            {[
              { name: 'Alex Rivera', exp: '8 yrs · Fintech', rate: '$95–110/hr' },
              { name: 'Jordan Lee', exp: '6 yrs · Product SaaS', rate: '$90–105/hr' },
              { name: 'Sam Okonkwo', exp: '10 yrs · Agency', rate: '$100–125/hr' },
            ].map(c => (
              <div key={c.name} className="flex items-center justify-between p-4 bg-secondary/40 rounded-lg border border-border/60">
                <div>
                  <p className="font-medium text-foreground">{c.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{c.exp}</p>
                  <p className="text-xs text-muted-foreground mt-1">{c.rate}</p>
                </div>
                <div className="flex gap-2">
                  <BonsaiButton size="sm" variant="ghost" onClick={() => addToast('Decline recorded — recruiter notified.', 'info')}>
                    Pass
                  </BonsaiButton>
                  <BonsaiButton size="sm" variant="primary" onClick={() => addToast('Interest sent — scheduling intro.', 'success')}>
                    Interested
                  </BonsaiButton>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// CP-07: Client Portal Proposals List
function ClientProposalsList({ onNavigate }: { onNavigate: (screen: ClientScreen) => void }) {
  const proposals = [
    { id: '1', title: 'Website Redesign Proposal', status: 'Pending', amount: 28500 },
    { id: '2', title: 'Mobile App Development Proposal', status: 'Approved', amount: 14800 },
  ];

  return (
    <div className="px-3 py-6 sm:p-8">
      <h1 className="text-2xl font-semibold text-foreground mb-6">Proposals</h1>

      <div className="portal-panel rounded-lg">
        <EnhancedTable
          columns={[
            { key: 'title', label: 'Proposal Title', sortable: true },
            { key: 'status', label: 'Status', sortable: true },
            { key: 'amount', label: 'Amount', sortable: true },
          ]}
          data={proposals.map(prop => ({
            ...prop,
            amount: <span className="font-semibold text-foreground">${prop.amount.toLocaleString()}</span>,
            status: (
              <BonsaiStatusPill
                status={prop.status === 'Approved' ? 'active' : 'pending'}
                label={prop.status}
              />
            ),
          }))}
          onRowClick={(row) => onNavigate(`proposal-detail`)}
          searchable
          filterable
        />
      </div>
    </div>
  );
}

// CP-08: Client Portal Proposal Detail
function ClientProposalDetail({ onNavigate, onShowApproval }: { onNavigate: (screen: ClientScreen) => void, onShowApproval: (action: 'approve' | 'reject') => void }) {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="px-3 py-6 sm:p-8">
      <button
        onClick={() => onNavigate('proposals')}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        ← Back to Proposals
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Website Redesign Proposal</h1>
          <p className="text-sm text-muted-foreground">Proposal #PRP-1234 • Created 2 hours ago</p>
        </div>
        <div className="flex items-center gap-3">
          <BonsaiStatusPill status="pending" label="Pending" />
          <BonsaiButton size="sm" variant="primary" onClick={() => onShowApproval('approve')}>Approve</BonsaiButton>
          <BonsaiButton size="sm" variant="destructive" onClick={() => onShowApproval('reject')}>Reject</BonsaiButton>
        </div>
      </div>

      <BonsaiTabs
        tabs={[
          { label: 'Overview', value: 'overview' },
          { label: 'Line Items', value: 'items' },
          { label: 'Activity', value: 'activity' },
        ]}
        value={activeTab}
        onValueChange={setActiveTab}
      />

      <div className="mt-6">
        {activeTab === 'overview' && (
          <div className="portal-panel rounded-lg p-6">
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Proposal Date</p>
                <p className="text-sm font-medium text-foreground">Jan 15, 2026</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Amount</p>
                <p className="text-2xl font-semibold text-foreground">$28,500.00</p>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'items' && (
          <div className="portal-panel rounded-lg p-6">
            <div className="space-y-3">
              {[
                { desc: 'Website Design - Week 1-2', qty: 80, rate: 150 },
                { desc: 'Development - Week 1-2', qty: 100, rate: 125 },
              ].map((item, i) => (
                <div key={i} className="p-4 bg-secondary/40 rounded-lg flex justify-between">
                  <div>
                    <p className="font-medium text-foreground">{item.desc}</p>
                    <p className="text-sm text-muted-foreground">{item.qty} hours × ${item.rate}/hr</p>
                  </div>
                  <p className="font-semibold text-foreground">${(item.qty * item.rate).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'activity' && (
          <div className="portal-panel rounded-lg p-6">
            <BonsaiTimeline
              items={[
                { id: '1', title: 'Proposal submitted', description: 'Submitted by sales team', timestamp: 'Jan 15, 2026', user: { name: 'Sales' } },
                { id: '2', title: 'Proposal created', description: 'Generated from project details', timestamp: 'Jan 15, 2026', user: { name: 'Project Manager' } },
              ]}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// CP-09: Client Portal Approvals Inbox
function ClientApprovalsInbox({ onNavigate }: { onNavigate: (screen: ClientScreen) => void }) {
  const approvals = [
    { id: '1', type: 'request', title: 'Timesheet Approval Request', status: 'Pending', amount: 28500 },
    { id: '2', type: 'invoice', title: 'Invoice Approval Request', status: 'Approved', amount: 14800 },
  ];

  return (
    <div className="px-3 py-6 sm:p-8">
      <h1 className="text-2xl font-semibold text-foreground mb-6">Approvals</h1>

      <div className="portal-panel rounded-lg">
        <EnhancedTable
          columns={[
            { key: 'type', label: 'Type', sortable: true },
            { key: 'title', label: 'Approval Title', sortable: true },
            { key: 'status', label: 'Status', sortable: true },
            { key: 'amount', label: 'Amount', sortable: true },
          ]}
          data={approvals.map(approval => ({
            ...approval,
            amount: <span className="font-semibold text-foreground">${approval.amount.toLocaleString()}</span>,
            status: (
              <BonsaiStatusPill
                status={approval.status === 'Approved' ? 'active' : 'pending'}
                label={approval.status}
              />
            ),
          }))}
          onRowClick={(row) => onNavigate(`approval-detail-${row.type}` as ClientScreen)}
          searchable
          filterable
        />
      </div>
    </div>
  );
}

// CP-10: Client Portal Approval Detail Request
function ClientApprovalDetailRequest({ onNavigate, onShowApproval }: { onNavigate: (screen: ClientScreen) => void, onShowApproval: (action: 'approve' | 'reject') => void }) {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="px-3 py-6 sm:p-8">
      <button
        onClick={() => onNavigate('approvals')}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        ← Back to Approvals
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Timesheet Approval Request</h1>
          <p className="text-sm text-muted-foreground">Request #REQ-1234 • Created 2 hours ago</p>
        </div>
        <div className="flex items-center gap-3">
          <BonsaiStatusPill status="pending" label="Pending" />
          <BonsaiButton size="sm" variant="primary" onClick={() => onShowApproval('approve')}>Approve</BonsaiButton>
          <BonsaiButton size="sm" variant="destructive" onClick={() => onShowApproval('reject')}>Reject</BonsaiButton>
        </div>
      </div>

      <BonsaiTabs
        tabs={[
          { label: 'Overview', value: 'overview' },
          { label: 'Line Items', value: 'items' },
          { label: 'Activity', value: 'activity' },
        ]}
        value={activeTab}
        onValueChange={setActiveTab}
      />

      <div className="mt-6">
        {activeTab === 'overview' && (
          <div className="portal-panel rounded-lg p-6">
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Request Date</p>
                <p className="text-sm font-medium text-foreground">Jan 15, 2026</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Amount</p>
                <p className="text-2xl font-semibold text-foreground">$28,500.00</p>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'items' && (
          <div className="portal-panel rounded-lg p-6">
            <div className="space-y-3">
              {[
                { desc: 'Website Design - Week 1-2', qty: 80, rate: 150 },
                { desc: 'Development - Week 1-2', qty: 100, rate: 125 },
              ].map((item, i) => (
                <div key={i} className="p-4 bg-secondary/40 rounded-lg flex justify-between">
                  <div>
                    <p className="font-medium text-foreground">{item.desc}</p>
                    <p className="text-sm text-muted-foreground">{item.qty} hours × ${item.rate}/hr</p>
                  </div>
                  <p className="font-semibold text-foreground">${(item.qty * item.rate).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'activity' && (
          <div className="portal-panel rounded-lg p-6">
            <BonsaiTimeline
              items={[
                { id: '1', title: 'Request submitted', description: 'Submitted by employee', timestamp: 'Jan 15, 2026', user: { name: 'Employee' } },
                { id: '2', title: 'Request created', description: 'Generated from timesheet', timestamp: 'Jan 15, 2026', user: { name: 'Project Manager' } },
              ]}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// CP-11: Client Portal Approval Detail Invoice
function ClientApprovalDetailInvoice({ onNavigate, onShowApproval }: { onNavigate: (screen: ClientScreen) => void, onShowApproval: (action: 'approve' | 'reject') => void }) {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="px-3 py-6 sm:p-8">
      <button
        onClick={() => onNavigate('approvals')}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        ← Back to Approvals
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Invoice Approval Request</h1>
          <p className="text-sm text-muted-foreground">Request #REQ-1234 • Created 2 hours ago</p>
        </div>
        <div className="flex items-center gap-3">
          <BonsaiStatusPill status="pending" label="Pending" />
          <BonsaiButton size="sm" variant="primary" onClick={() => onShowApproval('approve')}>Approve</BonsaiButton>
          <BonsaiButton size="sm" variant="destructive" onClick={() => onShowApproval('reject')}>Reject</BonsaiButton>
        </div>
      </div>

      <BonsaiTabs
        tabs={[
          { label: 'Overview', value: 'overview' },
          { label: 'Line Items', value: 'items' },
          { label: 'Activity', value: 'activity' },
        ]}
        value={activeTab}
        onValueChange={setActiveTab}
      />

      <div className="mt-6">
        {activeTab === 'overview' && (
          <div className="portal-panel rounded-lg p-6">
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Request Date</p>
                <p className="text-sm font-medium text-foreground">Jan 15, 2026</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Amount</p>
                <p className="text-2xl font-semibold text-foreground">$28,500.00</p>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'items' && (
          <div className="portal-panel rounded-lg p-6">
            <div className="space-y-3">
              {[
                { desc: 'Website Design - Week 1-2', qty: 80, rate: 150 },
                { desc: 'Development - Week 1-2', qty: 100, rate: 125 },
              ].map((item, i) => (
                <div key={i} className="p-4 bg-secondary/40 rounded-lg flex justify-between">
                  <div>
                    <p className="font-medium text-foreground">{item.desc}</p>
                    <p className="text-sm text-muted-foreground">{item.qty} hours × ${item.rate}/hr</p>
                  </div>
                  <p className="font-semibold text-foreground">${(item.qty * item.rate).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'activity' && (
          <div className="portal-panel rounded-lg p-6">
            <BonsaiTimeline
              items={[
                { id: '1', title: 'Request submitted', description: 'Submitted by finance', timestamp: 'Jan 15, 2026', user: { name: 'Finance' } },
                { id: '2', title: 'Request created', description: 'Generated from invoice', timestamp: 'Jan 15, 2026', user: { name: 'Project Manager' } },
              ]}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// CP-12: Client Portal Approval Detail Timesheet
function ClientApprovalDetailTimesheet({ onNavigate, onShowApproval }: { onNavigate: (screen: ClientScreen) => void, onShowApproval: (action: 'approve' | 'reject') => void }) {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="px-3 py-6 sm:p-8">
      <button
        onClick={() => onNavigate('approvals')}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        ← Back to Approvals
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Timesheet Approval Request</h1>
          <p className="text-sm text-muted-foreground">Request #REQ-1234 • Created 2 hours ago</p>
        </div>
        <div className="flex items-center gap-3">
          <BonsaiStatusPill status="pending" label="Pending" />
          <BonsaiButton size="sm" variant="primary" onClick={() => onShowApproval('approve')}>Approve</BonsaiButton>
          <BonsaiButton size="sm" variant="destructive" onClick={() => onShowApproval('reject')}>Reject</BonsaiButton>
        </div>
      </div>

      <BonsaiTabs
        tabs={[
          { label: 'Overview', value: 'overview' },
          { label: 'Line Items', value: 'items' },
          { label: 'Activity', value: 'activity' },
        ]}
        value={activeTab}
        onValueChange={setActiveTab}
      />

      <div className="mt-6">
        {activeTab === 'overview' && (
          <div className="portal-panel rounded-lg p-6">
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Request Date</p>
                <p className="text-sm font-medium text-foreground">Jan 15, 2026</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Amount</p>
                <p className="text-2xl font-semibold text-foreground">$28,500.00</p>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'items' && (
          <div className="portal-panel rounded-lg p-6">
            <div className="space-y-3">
              {[
                { desc: 'Website Design - Week 1-2', qty: 80, rate: 150 },
                { desc: 'Development - Week 1-2', qty: 100, rate: 125 },
              ].map((item, i) => (
                <div key={i} className="p-4 bg-secondary/40 rounded-lg flex justify-between">
                  <div>
                    <p className="font-medium text-foreground">{item.desc}</p>
                    <p className="text-sm text-muted-foreground">{item.qty} hours × ${item.rate}/hr</p>
                  </div>
                  <p className="font-semibold text-foreground">${(item.qty * item.rate).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'activity' && (
          <div className="portal-panel rounded-lg p-6">
            <BonsaiTimeline
              items={[
                { id: '1', title: 'Request submitted', description: 'Submitted by employee', timestamp: 'Jan 15, 2026', user: { name: 'Employee' } },
                { id: '2', title: 'Request created', description: 'Generated from timesheet', timestamp: 'Jan 15, 2026', user: { name: 'Project Manager' } },
              ]}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// CP-13: Client Portal Meetings List
function ClientMeetingsList({ onNavigate }: { onNavigate: (screen: ClientScreen) => void }) {
  const meetings = [
    { id: '1', title: 'Project Kickoff Meeting', status: 'Scheduled', date: 'Jan 15, 2026', time: '10:00 AM' },
    { id: '2', title: 'Design Review Meeting', status: 'Completed', date: 'Jan 10, 2026', time: '2:00 PM' },
  ];

  return (
    <div className="px-3 py-6 sm:p-8">
      <h1 className="text-2xl font-semibold text-foreground mb-6">Meetings</h1>

      <div className="portal-panel rounded-lg">
        <EnhancedTable
          columns={[
            { key: 'title', label: 'Meeting Title', sortable: true },
            { key: 'status', label: 'Status', sortable: true },
            { key: 'date', label: 'Date', sortable: true },
            { key: 'time', label: 'Time', sortable: true },
          ]}
          data={meetings.map(meeting => ({
            ...meeting,
            status: (
              <BonsaiStatusPill
                status={meeting.status === 'Completed' ? 'active' : 'pending'}
                label={meeting.status}
              />
            ),
          }))}
          onRowClick={(row) => onNavigate(`meeting-detail`)}
          searchable
          filterable
        />
      </div>
    </div>
  );
}

// CP-14: Client Portal Meeting Detail
function ClientMeetingDetail({ onNavigate }: { onNavigate: (screen: ClientScreen) => void }) {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="px-3 py-6 sm:p-8">
      <button
        onClick={() => onNavigate('meetings')}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        ← Back to Meetings
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Project Kickoff Meeting</h1>
          <p className="text-sm text-muted-foreground">Meeting #MTG-1234 • Scheduled Jan 15, 2026 at 10:00 AM</p>
        </div>
        <BonsaiStatusPill status="pending" label="Scheduled" />
      </div>

      <BonsaiTabs
        tabs={[
          { label: 'Overview', value: 'overview' },
          { label: 'Agenda', value: 'agenda' },
          { label: 'Participants', value: 'participants' },
        ]}
        value={activeTab}
        onValueChange={setActiveTab}
      />

      <div className="mt-6">
        {activeTab === 'overview' && (
          <div className="portal-panel rounded-lg p-6">
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Meeting Date</p>
                <p className="text-sm font-medium text-foreground">Jan 15, 2026</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Meeting Time</p>
                <p className="text-sm font-medium text-foreground">10:00 AM</p>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'agenda' && (
          <div className="portal-panel rounded-lg p-6">
            <div className="space-y-3">
              {[
                { desc: 'Project Overview' },
                { desc: 'Design Review' },
              ].map((item, i) => (
                <div key={i} className="p-4 bg-secondary/40 rounded-lg flex justify-between">
                  <div>
                    <p className="font-medium text-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'participants' && (
          <div className="portal-panel rounded-lg p-6">
            <div className="space-y-3">
              {[
                { name: 'John Doe', role: 'Project Manager' },
                { name: 'Sarah Johnson', role: 'Designer' },
              ].map((item, i) => (
                <div key={i} className="p-4 bg-secondary/40 rounded-lg flex justify-between">
                  <div>
                    <p className="font-medium text-foreground">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// EP-00: Employee Portal Shell + Screens
function EmployeePortal({ currentScreen, onNavigate }: { currentScreen: EmployeeScreen; onNavigate: (screen: EmployeeScreen) => void }) {
  const menuItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'onboarding', label: 'Onboarding', icon: FileCheck },
    { id: 'projects', label: 'My Projects', icon: Briefcase },
    { id: 'tasks', label: 'My Tasks', icon: CheckSquare },
    { id: 'timesheets', label: 'My Timesheets', icon: Calendar },
    { id: 'expenses', label: 'My Expenses', icon: DollarSign },
    { id: 'leave', label: 'My Leave', icon: Calendar },
    { id: 'training', label: 'Training', icon: BookOpen },
    { id: 'performance-reviews', label: 'Reviews', icon: Award },
    { id: 'meetings', label: 'Meetings', icon: Video },
    { id: 'documents', label: 'My Documents', icon: FolderOpen },
    { id: 'profile', label: 'My Profile', icon: User },
  ];

  const empNavActive = (itemId: string) => {
    const id = itemId as EmployeeScreen;
    return (
      currentScreen === id ||
      (currentScreen === 'onboarding-task' && id === 'onboarding') ||
      (currentScreen === 'training-detail' && id === 'training') ||
      (currentScreen === 'performance-review-detail' && id === 'performance-reviews') ||
      (currentScreen === 'meeting-detail' && id === 'meetings') ||
      (currentScreen === 'profile-change-request' && id === 'profile')
    );
  };

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">
      <PortalRail
        brandLetter="E"
        title="Employee portal"
        subtitle="John Doe"
        layoutId="portal-employee-rail"
        items={menuItems}
        isItemActive={empNavActive}
        onSelect={(id) => onNavigate(id as EmployeeScreen)}
        user={{ initials: 'JD', name: 'John Doe', email: 'john.doe@company.com' }}
      />

      <PortalMain>
        {currentScreen === 'home' && <EmployeeHome onNavigate={onNavigate} />}
        {currentScreen === 'onboarding' && <EmployeeOnboarding onNavigate={onNavigate} />}
        {currentScreen === 'onboarding-task' && <EmployeeOnboardingTask onNavigate={onNavigate} />}
        {currentScreen === 'projects' && <EmployeeProjects />}
        {currentScreen === 'tasks' && <EmployeeTasks />}
        {currentScreen === 'timesheets' && <EmployeeTimesheets onNavigate={onNavigate} />}
        {currentScreen === 'expenses' && <EmployeeExpenses />}
        {currentScreen === 'leave' && <EmployeeLeave />}
        {currentScreen === 'training' && <EmployeeTraining onNavigate={onNavigate} />}
        {currentScreen === 'training-detail' && <EmployeeTrainingDetail onNavigate={onNavigate} />}
        {currentScreen === 'performance-reviews' && <EmployeePerformanceReviews onNavigate={onNavigate} />}
        {currentScreen === 'performance-review-detail' && <EmployeePerformanceReviewDetail onNavigate={onNavigate} />}
        {currentScreen === 'meetings' && <EmployeeMeetingsList onNavigate={onNavigate} />}
        {currentScreen === 'meeting-detail' && <EmployeeMeetingDetail onNavigate={onNavigate} />}
        {currentScreen === 'documents' && <EmployeeDocuments />}
        {currentScreen === 'profile' && <EmployeeProfile onNavigate={onNavigate} />}
        {currentScreen === 'profile-change-request' && <EmployeeProfileChangeRequest onNavigate={onNavigate} />}
      </PortalMain>
    </div>
  );
}

// EP-01: Employee Portal Home
type CockpitTab = 'my-work' | 'inbox' | 'capture';

function EmployeeHome({ onNavigate }: { onNavigate: (screen: EmployeeScreen) => void }) {
  const [tab, setTab] = useState<CockpitTab>('my-work');
  const [captureText, setCaptureText] = useState('');
  const [captures, setCaptures] = useState<{ id: number; text: string; time: string }[]>([
    { id: 1, text: 'Follow up with Marcus about Nexus resource request', time: '9:41 AM' },
    { id: 2, text: 'Check timesheet submission deadline this week', time: 'Yesterday' },
  ]);

  const kpis = [
    { label: 'Tasks due today', value: '3', sub: '2 overdue' },
    { label: 'Timesheet', value: '1', sub: 'not submitted' },
    { label: 'Pending approvals', value: '2', sub: 'in queue' },
    { label: 'Leave balance', value: '12d', sub: 'remaining' },
  ];

  const MY_TASKS = [
    { id: 1, title: 'Submit design review feedback', project: 'Nexus Rebrand', due: 'Today', priority: 'high', done: false },
    { id: 2, title: 'Complete tax form (W-4)', project: 'Onboarding', due: 'Today', priority: 'critical', done: false },
    { id: 3, title: 'Log hours for last week', project: 'Timesheets', due: 'Today', priority: 'high', done: false },
    { id: 4, title: 'Review NDA draft from legal', project: 'Nova HQ Renewal', due: 'Apr 9', priority: 'medium', done: false },
    { id: 5, title: 'Prepare kick-off slides', project: 'Nexus Rebrand', due: 'Apr 10', priority: 'medium', done: true },
  ];

  const AI_INBOX = [
    { id: 1, from: 'HR Team', initials: 'HR', subject: 'Benefits enrollment deadline — Apr 15', summary: 'Your benefits enrollment window closes on April 15. Action required to confirm your healthcare and pension selections.', time: '8:00 AM', urgent: true },
    { id: 2, from: 'Marcus Webb', initials: 'MW', subject: 'Nexus resource request — heads-up', summary: 'Flagged the need for an extra dev on Nexus starting week 3. Wanted to give you a direct heads-up before the planning session.', time: 'Yesterday', urgent: false },
    { id: 3, from: 'Payroll', initials: 'PY', subject: 'March payslip ready', summary: 'Your March payslip has been processed and is available in the documents section.', time: 'Mon', urgent: false },
    { id: 4, from: 'Sarah Chen', initials: 'SC', subject: 'Q2 Campaign kick-off — Thursday 2pm', summary: 'Client review moved to Thursday 2pm. Deck should be ready by Wednesday EOD. Can you handle the case studies section?', time: 'Sun', urgent: false },
  ];

  const PRIORITY_DOT: Record<string, string> = { critical: '#EF4444', high: '#F97316', medium: '#EAB308', low: '#94A3B8' };

  const handleCapture = () => {
    if (!captureText.trim()) return;
    setCaptures(prev => [{ id: Date.now(), text: captureText.trim(), time: 'Just now' }, ...prev]);
    setCaptureText('');
  };

  return (
    <div className="flex flex-col h-full min-h-0 overflow-y-auto">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-1">Monday, April 6</p>
          <h1 className="text-[26px] font-semibold tracking-[-0.025em] text-foreground">Good morning, Priya</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">You have 3 tasks due today and 2 items awaiting your review.</p>
        </motion.div>

        {/* KPI row */}
        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {kpis.map((kpi, i) => (
            <HubStatTile key={kpi.label} label={kpi.label} value={kpi.value} sub={kpi.sub} delay={i * 0.04} />
          ))}
        </div>
      </div>

      {/* Cockpit tabs */}
      <div className="px-6 border-b border-border">
        <div className="flex items-end gap-0">
          {([
            { id: 'my-work' as CockpitTab, label: 'My Work', count: MY_TASKS.filter(t => !t.done).length },
            { id: 'inbox' as CockpitTab, label: 'AI Inbox', count: AI_INBOX.filter(m => m.urgent).length },
            { id: 'capture' as CockpitTab, label: 'Quick Capture', count: captures.length },
          ] as const).map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex items-center gap-1.5 px-4 py-2.5 text-[12px] font-medium border-b-2 transition-colors"
              style={{
                borderBottomColor: tab === t.id ? 'var(--color-primary, #2563EB)' : 'transparent',
                color: tab === t.id ? 'var(--color-primary, #2563EB)' : 'var(--muted-foreground)',
              }}
            >
              {t.label}
              {t.count > 0 && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: tab === t.id ? 'var(--color-primary, #2563EB)' : 'var(--secondary)', color: tab === t.id ? 'white' : 'var(--muted-foreground)' }}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 px-6 py-4">
        <AnimatePresence mode="wait">
          {tab === 'my-work' && (
            <motion.div key="my-work" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Today · Apr 6</p>
                <button className="text-[11px] font-medium text-primary" onClick={() => onNavigate('tasks')}>View all →</button>
              </div>
              <div className="space-y-1.5 mb-6">
                {MY_TASKS.filter(t => t.due === 'Today').map(task => (
                  <div key={task.id} className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors hover:bg-secondary/50 cursor-pointer"
                    style={{ background: 'var(--popover)', border: '1px solid var(--border)' }}>
                    <button className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${task.done ? 'border-primary bg-primary' : 'border-border'}`}>
                      {task.done && <Check className="w-2.5 h-2.5 text-white" />}
                    </button>
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: PRIORITY_DOT[task.priority] ?? '#94A3B8' }} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-[13px] font-medium truncate ${task.done ? 'line-through opacity-50' : ''}`} style={{ color: 'var(--foreground)' }}>{task.title}</p>
                      <p className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>{task.project}</p>
                    </div>
                    <span className="text-[10px] font-medium flex-shrink-0" style={{ color: '#EF4444' }}>{task.due}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">This week</p>
              </div>
              <div className="space-y-1.5">
                {MY_TASKS.filter(t => t.due !== 'Today').map(task => (
                  <div key={task.id} className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors hover:bg-secondary/50 cursor-pointer"
                    style={{ background: 'var(--popover)', border: '1px solid var(--border)' }}>
                    <button className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${task.done ? 'border-primary bg-primary' : 'border-border'}`}>
                      {task.done && <Check className="w-2.5 h-2.5 text-white" />}
                    </button>
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: PRIORITY_DOT[task.priority] ?? '#94A3B8' }} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-[13px] font-medium truncate ${task.done ? 'line-through opacity-50' : ''}`} style={{ color: 'var(--foreground)' }}>{task.title}</p>
                      <p className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>{task.project}</p>
                    </div>
                    <span className="text-[10px] flex-shrink-0" style={{ color: 'var(--muted-foreground)' }}>{task.due}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {tab === 'inbox' && (
            <motion.div key="inbox" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
              <p className="text-[11px] text-muted-foreground mb-3">AI-filtered messages relevant to you. Mark as done when actioned.</p>
              <div className="space-y-2">
                {AI_INBOX.map(msg => (
                  <div key={msg.id} className="flex items-start gap-3 px-4 py-3 rounded-xl cursor-pointer transition-colors hover:bg-secondary/50"
                    style={{ background: 'var(--popover)', border: msg.urgent ? '1px solid #EAB30840' : '1px solid var(--border)' }}>
                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-bold text-white"
                      style={{ background: msg.urgent ? '#EAB308' : 'var(--muted-foreground)' }}>
                      {msg.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-[12px] font-semibold text-foreground truncate">{msg.subject}</p>
                        {msg.urgent && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded text-white flex-shrink-0" style={{ background: '#EAB308' }}>Urgent</span>}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{msg.summary}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] text-muted-foreground">{msg.from}</span>
                        <span className="text-[10px] text-muted-foreground">· {msg.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {tab === 'capture' && (
            <motion.div key="capture" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
              <p className="text-[11px] text-muted-foreground mb-3">Capture quick thoughts, ideas, and follow-ups. Convert to tasks later.</p>
              {/* Input */}
              <div className="flex items-start gap-2 mb-4">
                <textarea
                  className="flex-1 resize-none text-[13px] bg-transparent outline-none leading-relaxed px-4 py-3 rounded-xl"
                  style={{ background: 'var(--popover)', border: '1px solid var(--border)', color: 'var(--foreground)', minHeight: 72 }}
                  placeholder="What's on your mind? Press Enter to capture…"
                  value={captureText}
                  onChange={e => setCaptureText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleCapture(); } }}
                  rows={3}
                />
                <button
                  onClick={handleCapture}
                  className="mt-0.5 p-2.5 rounded-xl transition-colors flex-shrink-0"
                  style={{ background: captureText ? 'var(--color-primary, #2563EB)' : 'var(--secondary)', color: captureText ? 'white' : 'var(--muted-foreground)' }}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {/* Captured items */}
              <div className="space-y-1.5">
                {captures.map(c => (
                  <div key={c.id} className="flex items-start gap-3 px-4 py-3 rounded-xl"
                    style={{ background: 'var(--popover)', border: '1px solid var(--border)' }}>
                    <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ background: 'var(--muted-foreground)' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px]" style={{ color: 'var(--foreground)' }}>{c.text}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{c.time}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button className="text-[10px] font-medium px-2 py-1 rounded" style={{ color: 'var(--color-primary, #2563EB)' }}>→ Task</button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function EmployeeOnboarding({ onNavigate }: { onNavigate: (s: EmployeeScreen) => void }) {
  const { addToast } = useToast();
  const tasks = [
    { id: 't1', label: 'Upload government ID', done: true },
    { id: 't2', label: 'Sign employment contract', done: true },
    { id: 't3', label: 'Bank details for payroll', done: false },
    { id: 't4', label: 'Tax forms (W-4)', done: false },
    { id: 't5', label: 'NDA & handbook', done: true },
    { id: 't6', label: 'Benefits enrollment', done: true },
  ];
  return (
    <div className="px-3 py-6 sm:px-6 sm:py-8 lg:px-8 max-w-2xl">
      <h1 className="text-[24px] font-semibold text-foreground mb-2">Onboarding</h1>
      <p className="text-[13px] text-muted-foreground mb-6">Complete all tasks — HR is notified as you progress.</p>
      <div className="portal-list divide-y divide-border">
        {tasks.map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => onNavigate('onboarding-task')}
            className="portal-row-hover flex w-full items-center gap-3 px-5 py-4 text-left transition-colors"
          >
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${
                t.done ? 'bg-primary text-primary-foreground' : 'border-2 border-border text-muted-foreground'
              }`}
            >
              {t.done ? '✓' : ''}
            </span>
            <span
              className={`flex-1 text-[14px] ${
                t.done ? 'text-foreground/50 line-through' : 'font-medium text-foreground'
              }`}
            >
              {t.label}
            </span>
            <span className="text-[12px] font-medium text-primary">Open</span>
          </button>
        ))}
      </div>
      <BonsaiButton className="mt-6" variant="outline" onClick={() => addToast('HR has been nudged for pending items.', 'info')}>
        Ask HR for help
      </BonsaiButton>
    </div>
  );
}

function EmployeeOnboardingTask({ onNavigate }: { onNavigate: (s: EmployeeScreen) => void }) {
  const { addToast } = useToast();
  return (
    <div className="px-3 py-6 sm:px-6 sm:py-8 lg:px-8 max-w-xl">
      <button type="button" onClick={() => onNavigate('onboarding')} className="text-[13px] text-muted-foreground hover:text-foreground mb-6">
        ← Back to checklist
      </button>
      <h1 className="text-[22px] font-semibold text-foreground mb-2">Bank details for payroll</h1>
      <p className="text-[13px] text-muted-foreground mb-6">Encrypted — only payroll can view full account numbers.</p>
      <div className="portal-panel space-y-4 p-6">
        <input className="hub-field px-3 py-2 text-[13px]" placeholder="Account holder name" />
        <input className="hub-field px-3 py-2 text-[13px]" placeholder="Routing number" />
        <input className="hub-field px-3 py-2 text-[13px]" placeholder="Account number" />
        <BonsaiButton variant="primary" onClick={() => { addToast('Saved — pending HR verification.', 'success'); onNavigate('onboarding'); }}>
          Save & mark complete
        </BonsaiButton>
      </div>
    </div>
  );
}

function EmployeeTraining({ onNavigate }: { onNavigate: (s: EmployeeScreen) => void }) {
  const courses = [
    { id: 'c1', name: 'Code of Conduct', due: 'Apr 12, 2026', pct: 0, req: true },
    { id: 'c2', name: 'Security & phishing', due: 'Apr 20, 2026', pct: 60, req: true },
    { id: 'c3', name: 'Role: Design workflows', due: 'Optional', pct: 100, req: false },
  ];
  return (
    <div className="px-3 py-6 sm:px-6 sm:py-8 lg:px-8 max-w-3xl">
      <h1 className="text-[24px] font-semibold text-foreground mb-6">Training</h1>
      <div className="space-y-3">
        {courses.map(c => (
          <button
            key={c.id}
            type="button"
            onClick={() => onNavigate('training-detail')}
            className="w-full flex items-center justify-between p-5 portal-panel text-left hover:bg-secondary/40 transition-colors"
          >
            <div>
              <p className="font-semibold text-foreground">{c.name}</p>
              <p className="text-[12px] text-muted-foreground mt-1">{c.req ? 'Required' : 'Optional'} · Due {c.due}</p>
              <div className="h-1.5 bg-secondary rounded-full mt-3 max-w-[200px]">
                <div className="h-full bg-primary rounded-full" style={{ width: `${c.pct}%` }} />
              </div>
            </div>
            <BonsaiStatusPill status={c.pct === 100 ? 'active' : 'pending'} label={c.pct === 100 ? 'Done' : 'In progress'} />
          </button>
        ))}
      </div>
    </div>
  );
}

function EmployeeTrainingDetail({ onNavigate }: { onNavigate: (s: EmployeeScreen) => void }) {
  const { addToast } = useToast();
  return (
    <div className="px-3 py-6 sm:px-6 sm:py-8 lg:px-8 max-w-2xl">
      <button type="button" onClick={() => onNavigate('training')} className="text-[13px] text-muted-foreground hover:text-foreground mb-6">
        ← All courses
      </button>
      <h1 className="text-[22px] font-semibold text-foreground mb-4">Code of Conduct</h1>
      <div className="prose prose-sm text-muted-foreground mb-6">
        <p>Review our workplace expectations, anti-harassment policy, and reporting channels. You must acknowledge each section.</p>
      </div>
      <label className="flex items-center gap-2 text-[13px] text-foreground mb-4">
        <input type="checkbox" className="rounded border-border" />
        I have read and agree to the Code of Conduct
      </label>
      <BonsaiButton variant="primary" onClick={() => { addToast('Course completed — certificate on file.', 'success'); onNavigate('training'); }}>
        Complete course
      </BonsaiButton>
    </div>
  );
}

function EmployeePerformanceReviews({ onNavigate }: { onNavigate: (s: EmployeeScreen) => void }) {
  return (
    <div className="px-3 py-6 sm:px-6 sm:py-8 lg:px-8 max-w-3xl">
      <h1 className="text-[24px] font-semibold text-foreground mb-6">Performance reviews</h1>
      <div className="portal-panel divide-y divide-border">
        {[
          { period: 'Q1 2026', status: 'Self-assessment due', due: 'Apr 15' },
          { period: 'Annual 2025', status: 'Completed', due: 'Jan 10' },
        ].map(r => (
          <button
            key={r.period}
            type="button"
            onClick={() => onNavigate('performance-review-detail')}
            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-secondary/50"
          >
            <div>
              <p className="font-medium text-foreground">{r.period}</p>
              <p className="text-[12px] text-muted-foreground mt-0.5">{r.status} · {r.due}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        ))}
      </div>
    </div>
  );
}

function EmployeePerformanceReviewDetail({ onNavigate }: { onNavigate: (s: EmployeeScreen) => void }) {
  const { addToast } = useToast();
  return (
    <div className="px-3 py-6 sm:px-6 sm:py-8 lg:px-8 max-w-2xl">
      <button type="button" onClick={() => onNavigate('performance-reviews')} className="text-[13px] text-muted-foreground hover:text-foreground mb-6">
        ← Reviews
      </button>
      <h1 className="text-[22px] font-semibold text-foreground mb-2">Q1 2026 · Self-assessment</h1>
      <textarea className="w-full min-h-[160px] px-3 py-2 rounded-lg border border-border text-[13px] mb-4" placeholder="Summarize wins, blockers, and goals for next quarter…" />
      <BonsaiButton variant="primary" onClick={() => { addToast('Self-assessment submitted to your manager.', 'success'); onNavigate('performance-reviews'); }}>
        Submit
      </BonsaiButton>
    </div>
  );
}

function EmployeeMeetingsList({ onNavigate }: { onNavigate: (s: EmployeeScreen) => void }) {
  return (
    <div className="px-3 py-6 sm:px-6 sm:py-8 lg:px-8 max-w-3xl">
      <h1 className="text-[24px] font-semibold text-foreground mb-6">Meetings</h1>
      <div className="space-y-2">
        {[
          { title: '1:1 with Sarah Chen', when: 'Thu, Apr 10 · 2:00 PM', link: true },
          { title: 'Design critique', when: 'Fri, Apr 11 · 11:00 AM', link: true },
        ].map(m => (
          <button
            key={m.title}
            type="button"
            onClick={() => onNavigate('meeting-detail')}
            className="w-full flex items-center justify-between p-4 portal-panel text-left hover:bg-secondary/40"
          >
            <div>
              <p className="font-medium text-foreground">{m.title}</p>
              <p className="text-[12px] text-muted-foreground mt-0.5">{m.when}</p>
            </div>
            {m.link ? <span className="text-[12px] text-primary font-medium">Join</span> : null}
          </button>
        ))}
      </div>
    </div>
  );
}

function EmployeeMeetingDetail({ onNavigate }: { onNavigate: (s: EmployeeScreen) => void }) {
  return (
    <div className="px-3 py-6 sm:px-6 sm:py-8 lg:px-8 max-w-2xl">
      <button type="button" onClick={() => onNavigate('meetings')} className="text-[13px] text-muted-foreground hover:text-foreground mb-6">
        ← Meetings
      </button>
      <h1 className="text-[22px] font-semibold text-foreground mb-2">1:1 with Sarah Chen</h1>
      <p className="text-[13px] text-muted-foreground mb-6">Thu, Apr 10, 2026 · 2:00 PM · Google Meet</p>
      <BonsaiButton variant="primary" onClick={() => window.open('https://meet.google.com', '_blank')}>
        Open video link
      </BonsaiButton>
      <div className="mt-8 p-5 portal-panel rounded-xl">
        <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Agenda</p>
        <ul className="text-[13px] text-muted-foreground space-y-2 list-disc list-inside">
          <li>Project priorities</li>
          <li>Career growth</li>
        </ul>
      </div>
    </div>
  );
}

function EmployeeProfile({ onNavigate }: { onNavigate: (s: EmployeeScreen) => void }) {
  return (
    <div className="px-3 py-6 sm:px-6 sm:py-8 lg:px-8 max-w-xl">
      <h1 className="text-[24px] font-semibold text-foreground mb-6">My profile</h1>
      <div className="space-y-4 portal-panel rounded-xl p-6">
        <div>
          <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">Legal name</p>
          <p className="text-[14px] font-medium text-foreground">John Doe</p>
        </div>
        <div>
          <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">Work email</p>
          <p className="text-[14px] font-medium text-foreground">john.doe@company.com</p>
        </div>
        <div>
          <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">Home address</p>
          <p className="text-[14px] text-muted-foreground">123 Market St, San Francisco, CA</p>
        </div>
        <BonsaiButton variant="outline" onClick={() => onNavigate('profile-change-request')}>
          Request profile change (GDPR)
        </BonsaiButton>
      </div>
    </div>
  );
}

function EmployeeProfileChangeRequest({ onNavigate }: { onNavigate: (s: EmployeeScreen) => void }) {
  const { addToast } = useToast();
  return (
    <div className="px-3 py-6 sm:px-6 sm:py-8 lg:px-8 max-w-xl">
      <button type="button" onClick={() => onNavigate('profile')} className="text-[13px] text-muted-foreground hover:text-foreground mb-6">
        ← Profile
      </button>
      <h1 className="text-[22px] font-semibold text-foreground mb-2">Request profile change</h1>
      <p className="text-[13px] text-muted-foreground mb-6">HR will review before updates apply. You will be notified.</p>
      <div className="space-y-4 portal-panel rounded-xl p-6">
        <select className="w-full px-3 py-2 rounded-lg border border-border text-[13px]">
          <option>Home address</option>
          <option>Legal name</option>
          <option>Emergency contact</option>
        </select>
        <textarea className="w-full px-3 py-2 rounded-lg border border-border text-[13px] min-h-[100px]" placeholder="New value or details…" />
        <BonsaiButton variant="primary" onClick={() => { addToast('Request sent to HRIS queue.', 'success'); onNavigate('profile'); }}>
          Submit request
        </BonsaiButton>
      </div>
    </div>
  );
}

function EmployeeProjects() {
  return (
    <div className="px-3 py-6 sm:px-6 sm:py-8 lg:px-8 max-w-3xl">
      <h1 className="text-[24px] font-semibold text-foreground tracking-[-0.02em] mb-6">My Projects</h1>
      <div className="portal-panel divide-y divide-border">
        {[
          { name: 'Website Redesign', role: 'Design lead', pm: 'Sarah Chen', hrs: '32h / week cap' },
          { name: 'Mobile App', role: 'IC contributor', pm: 'Alex Kim', hrs: '24h / week cap' },
        ].map(p => (
          <div key={p.name} className="px-5 py-4">
            <p className="text-[14px] font-semibold text-foreground">{p.name}</p>
            <p className="text-[12px] text-muted-foreground mt-1">{p.role} · PM: {p.pm}</p>
            <p className="text-[11px] text-muted-foreground mt-2">{p.hrs}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmployeeTasks() {
  return (
    <div className="px-3 py-6 sm:px-6 sm:py-8 lg:px-8 max-w-3xl">
      <h1 className="text-[24px] font-semibold text-foreground tracking-[-0.02em] mb-6">My Tasks</h1>
      <div className="space-y-2">
        {[
          { t: 'Hero concepts v2', proj: 'Website Redesign', due: 'Apr 6' },
          { t: 'Design QA — checkout', proj: 'Website Redesign', due: 'Apr 8' },
          { t: 'Icon set export', proj: 'Mobile App', due: 'Apr 9' },
        ].map(x => (
          <div key={x.t} className="portal-panel px-5 py-3 flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium text-foreground">{x.t}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{x.proj} · Due {x.due}</p>
            </div>
            <BonsaiStatusPill status="pending" label="Open" />
          </div>
        ))}
      </div>
    </div>
  );
}

function EmployeeTimesheets({ onNavigate }: { onNavigate: (s: EmployeeScreen) => void }) {
  const { addToast } = useToast();
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const row = [8, 8, 7.5, 8, 6, 0, 0];
  return (
    <div className="mx-auto w-full max-w-4xl px-3 py-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">My Timesheets</h1>
          <p className="text-sm text-muted-foreground mt-1">Week of Mar 31 — Apr 6, 2026</p>
        </div>
        <BonsaiButton
          variant="primary"
          onClick={() => {
            addToast('Timesheet submitted for manager approval.', 'success');
            onNavigate('home');
          }}
        >
          Submit week
        </BonsaiButton>
      </div>
      <div className="portal-panel rounded-xl overflow-hidden">
        <div className="grid grid-cols-[1fr_repeat(7,52px)_56px] gap-px bg-secondary/60 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          <div className="bg-secondary/40 px-3 py-2">Project</div>
          {days.map(d => (
            <div key={d} className="bg-secondary/40 py-2 text-center">{d}</div>
          ))}
          <div className="bg-secondary/40 py-2 text-center">Σ</div>
        </div>
        <div className="grid grid-cols-[1fr_repeat(7,52px)_56px] gap-px bg-secondary/40 items-center">
          <div className="bg-background-2 px-3 py-3 text-[13px] font-medium text-foreground">Website Redesign</div>
          {row.map((h, i) => (
            <div key={i} className="bg-background-2 py-3 text-center text-[12px] tabular-nums text-foreground">{h || '—'}</div>
          ))}
          <div className="bg-background-2 py-3 text-center text-[12px] font-semibold tabular-nums">{row.reduce((a, b) => a + b, 0)}</div>
        </div>
      </div>
      <p className="text-[12px] text-muted-foreground mt-4">Approvals route to your manager and client portal when required.</p>
    </div>
  );
}

// EP-02: My Expenses
function EmployeeExpenses() {
  return (
    <div className="px-3 py-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-foreground">My Expenses</h1>
        <BonsaiButton variant="primary">Submit Expense</BonsaiButton>
      </div>

      <div className="portal-panel rounded-lg">
        <div className="divide-y divide-blue-100">
          {[
            { date: 'Jan 15, 2026', amount: 125.50, category: 'Travel', status: 'Pending' },
            { date: 'Jan 10, 2026', amount: 45.00, category: 'Meals', status: 'Approved' },
          ].map((expense, i) => (
            <div key={i} className="p-6 flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">{expense.category} - ${expense.amount}</p>
                <p className="text-sm text-muted-foreground">{expense.date}</p>
              </div>
              <BonsaiStatusPill
                status={expense.status === 'Approved' ? 'active' : 'pending'}
                label={expense.status}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// EP-03: My Leave
function EmployeeLeave() {
  return (
    <div className="px-3 py-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-foreground">My Leave</h1>
        <BonsaiButton variant="primary">Request Leave</BonsaiButton>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="portal-panel rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Available Days</p>
          <p className="text-2xl font-semibold text-foreground">15</p>
        </div>
        <div className="portal-panel rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Used This Year</p>
          <p className="text-2xl font-semibold text-foreground">10</p>
        </div>
        <div className="portal-panel rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Pending Requests</p>
          <p className="text-2xl font-semibold text-muted-foreground">1</p>
        </div>
      </div>

      <div className="portal-panel rounded-lg">
        <div className="divide-y divide-blue-100">
          {[
            { dates: 'Feb 10-14, 2026', days: 5, type: 'Vacation', status: 'Pending' },
            { dates: 'Dec 25-26, 2025', days: 2, type: 'Holiday', status: 'Approved' },
          ].map((leave, i) => (
            <div key={i} className="p-6 flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">{leave.type} - {leave.days} days</p>
                <p className="text-sm text-muted-foreground">{leave.dates}</p>
              </div>
              <BonsaiStatusPill
                status={leave.status === 'Approved' ? 'active' : 'pending'}
                label={leave.status}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// EP-04: My Documents
function EmployeeDocuments() {
  const { addToast } = useToast();
  const documents = [
    { id: '1', name: 'Employment-Contract.pdf', type: 'application/pdf', size: '245 KB', uploadedAt: 'Jan 15, 2024', uploadedBy: 'HR' },
    { id: '2', name: 'Benefits-Guide.pdf', type: 'application/pdf', size: '1.8 MB', uploadedAt: 'Jan 1, 2024', uploadedBy: 'HR' },
  ];

  return (
    <div className="px-3 py-6 sm:p-8">
      <h1 className="text-2xl font-semibold text-foreground mb-6">My Documents</h1>

      <div className="portal-panel rounded-lg p-6">
        <BonsaiDocumentList
          documents={documents}
          onDownload={doc => addToast(`Downloading ${doc.name}`, 'info')}
          onDelete={undefined}
        />
      </div>
    </div>
  );
}

// FP-00: Freelancer Portal Shell + Screens
function FreelancerPortal({ currentScreen, onNavigate }: { currentScreen: FreelancerScreen; onNavigate: (screen: FreelancerScreen) => void }) {
  const menuItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'onboarding', label: 'Onboarding', icon: FileCheck },
    { id: 'assignments', label: 'Assignments', icon: Briefcase },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'timesheets', label: 'Timesheets', icon: Calendar },
    { id: 'expenses', label: 'Expenses', icon: DollarSign },
    { id: 'self-bills', label: 'Self-bills', icon: Receipt },
    { id: 'contract-docs', label: 'Contracts', icon: FileText },
    { id: 'documents', label: 'Documents', icon: FolderOpen },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const flNavActive = (itemId: string) => {
    const id = itemId as FreelancerScreen;
    return (
      currentScreen === id ||
      (currentScreen === 'self-bill-detail' && id === 'self-bills') ||
      (currentScreen === 'profile-change-request' && id === 'profile')
    );
  };

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">
      <PortalRail
        brandLetter="F"
        title="Freelancer portal"
        subtitle="Sarah Johnson"
        layoutId="portal-freelancer-rail"
        items={menuItems}
        isItemActive={flNavActive}
        onSelect={(id) => onNavigate(id as FreelancerScreen)}
        user={{ initials: 'SJ', name: 'Sarah Johnson', email: 'sarah.j@freelance.com' }}
      />

      <PortalMain>
        {currentScreen === 'home' && <FreelancerHome onNavigate={onNavigate} />}
        {currentScreen === 'onboarding' && <FreelancerOnboarding onNavigate={onNavigate} />}
        {currentScreen === 'assignments' && <FreelancerAssignments />}
        {currentScreen === 'tasks' && <FreelancerTasks />}
        {currentScreen === 'timesheets' && <FreelancerTimesheets onNavigate={onNavigate} />}
        {currentScreen === 'expenses' && <FreelancerExpenses />}
        {currentScreen === 'self-bills' && <FreelancerSelfBillsList onNavigate={onNavigate} />}
        {currentScreen === 'self-bill-detail' && <FreelancerSelfBillDetail onNavigate={onNavigate} />}
        {currentScreen === 'contract-docs' && <FreelancerContractDocs />}
        {currentScreen === 'documents' && <FreelancerDocuments />}
        {currentScreen === 'profile' && <FreelancerProfile onNavigate={onNavigate} />}
        {currentScreen === 'profile-change-request' && <FreelancerProfileChangeRequest onNavigate={onNavigate} />}
      </PortalMain>
    </div>
  );
}

function FreelancerHome({ onNavigate }: { onNavigate: (screen: FreelancerScreen) => void }) {
  const kpis = [
    { label: 'Active assignments', value: '2', sub: 'in progress' },
    { label: 'Tasks this week', value: '8', sub: 'assigned to you' },
    { label: 'Hours this month', value: '84', sub: 'logged' },
  ];

  return (
    <div className="max-w-4xl px-6 py-8 md:px-8">
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Contractor workspace</p>
        <h1 className="text-[30px] font-semibold tracking-[-0.03em] text-foreground">Welcome back, Sarah</h1>
        <p className="mt-2 max-w-xl text-[14px] text-muted-foreground">
          Assignments, utilization, and payouts — built for 1099 and corp-to-corp contributors.
        </p>
      </motion.div>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {kpis.map((kpi, i) => (
          <HubStatTile key={kpi.label} label={kpi.label} value={kpi.value} sub={kpi.sub} delay={i * 0.05} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <button
          type="button"
          onClick={() => onNavigate('assignments')}
          className="portal-panel group p-5 text-left shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-[13px] font-semibold text-foreground">Current assignments</h3>
            <span className="text-[14px] text-muted-foreground transition-colors group-hover:text-foreground">→</span>
          </div>
          <div className="space-y-2">
            <div className="rounded-lg border border-border bg-secondary/30 px-3 py-2.5">
              <p className="text-[12px] font-medium text-foreground">Website redesign</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">UI/UX designer · Active</p>
            </div>
            <div className="rounded-lg border border-border bg-secondary/30 px-3 py-2.5">
              <p className="text-[12px] font-medium text-foreground">Mobile app</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">Senior designer · Active</p>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('timesheets')}
          className="portal-panel p-5 shadow-sm text-left transition-shadow hover:shadow-md"
        >
          <h3 className="mb-4 text-[13px] font-semibold text-foreground">Timesheet</h3>
          <div className="rounded-xl border border-border bg-secondary/40 p-4">
            <p className="text-[13px] font-semibold text-foreground">Week of Jan 13, 2026</p>
            <p className="mt-0.5 text-[12px] text-muted-foreground">Not submitted · 42 hours logged</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('self-bills')}
          className="portal-panel p-5 shadow-sm text-left transition-shadow hover:shadow-md"
        >
          <h3 className="mb-2 text-[13px] font-semibold text-foreground">Self-bills</h3>
          <p className="text-[12px] text-muted-foreground">March 2026 ready · $8,400</p>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('onboarding')}
          className="portal-panel p-5 shadow-sm text-left transition-shadow hover:shadow-md"
        >
          <h3 className="mb-2 text-[13px] font-semibold text-foreground">Onboarding</h3>
          <p className="text-[12px] text-muted-foreground">W-9 and payment profile complete</p>
        </button>
      </div>
    </div>
  );
}

function FreelancerOnboarding({ onNavigate }: { onNavigate: (s: FreelancerScreen) => void }) {
  const { addToast } = useToast();
  return (
    <div className="px-3 py-6 sm:px-6 sm:py-8 lg:px-8 max-w-xl">
      <h1 className="text-[24px] font-semibold text-foreground mb-6">Freelancer onboarding</h1>
      <div className="space-y-3">
        {[
          { l: 'W-9 submitted', ok: true },
          { l: 'Contract signed', ok: true },
          { l: 'Payment method (ACH)', ok: true },
          { l: 'NDA', ok: true },
        ].map(x => (
          <div key={x.l} className="flex items-center gap-3 p-4 portal-panel">
            <span className="text-primary font-bold">✓</span>
            <span className="text-[14px] text-foreground">{x.l}</span>
          </div>
        ))}
      </div>
      <BonsaiButton className="mt-6" variant="outline" onClick={() => addToast('Ops will confirm compliance within 24h.', 'info')}>
        Contact ops
      </BonsaiButton>
      <button type="button" className="mt-4 block text-[13px] font-medium text-primary hover:underline" onClick={() => onNavigate('contract-docs')}>
        View contract PDFs →
      </button>
    </div>
  );
}

function FreelancerAssignments() {
  return (
    <div className="px-3 py-6 sm:px-6 sm:py-8 lg:px-8 max-w-3xl">
      <h1 className="text-[24px] font-semibold text-foreground tracking-[-0.02em] mb-6">My Assignments</h1>
      <div className="space-y-3">
        {[
          { c: 'Acme Corp', r: 'Website Redesign', rate: '$95/hr', cap: '120h' },
          { c: 'Tech Startup Inc', r: 'Mobile App', rate: '$105/hr', cap: '80h' },
        ].map(a => (
          <div key={a.c} className="portal-panel p-5">
            <p className="text-[14px] font-semibold text-foreground">{a.r}</p>
            <p className="text-[12px] text-muted-foreground mt-1">{a.c}</p>
            <p className="text-[11px] text-muted-foreground mt-3">{a.rate} · Cap {a.cap}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function FreelancerTasks() {
  return (
    <div className="px-3 py-6 sm:px-6 sm:py-8 lg:px-8 max-w-3xl">
      <h1 className="text-[24px] font-semibold text-foreground tracking-[-0.02em] mb-6">My Tasks</h1>
      <div className="space-y-2">
        {['Design system tokens', 'Homepage mobile QA', 'Handoff documentation'].map(t => (
          <div key={t} className="portal-panel px-5 py-3 flex justify-between items-center">
            <span className="text-[13px] font-medium text-foreground">{t}</span>
            <BonsaiStatusPill status="pending" label="Assigned" />
          </div>
        ))}
      </div>
    </div>
  );
}

function FreelancerTimesheets({ onNavigate }: { onNavigate: (s: FreelancerScreen) => void }) {
  const { addToast } = useToast();
  return (
    <div className="px-3 py-6 sm:px-6 sm:py-8 lg:px-8 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[24px] font-semibold text-foreground">My Timesheets</h1>
        <BonsaiButton
          variant="primary"
          onClick={() => {
            addToast('Timesheet submitted — client approval may be required.', 'success');
            onNavigate('home');
          }}
        >
          Submit week
        </BonsaiButton>
      </div>
      <div className="portal-panel p-6">
        <p className="text-[13px] text-muted-foreground mb-4">Week of Mar 31 — Apr 6 · 42h across Acme + Tech Startup</p>
        <div className="h-2 overflow-hidden rounded-full bg-secondary">
          <div className="h-full w-[85%] rounded-full bg-primary" />
        </div>
        <p className="text-[11px] text-muted-foreground mt-2">After approval, self-bill can generate automatically.</p>
      </div>
    </div>
  );
}

function FreelancerExpenses() {
  return (
    <div className="px-3 py-6 sm:px-6 sm:py-8 lg:px-8 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[24px] font-semibold text-foreground tracking-[-0.02em]">My Expenses</h1>
        <BonsaiButton variant="primary">Submit Expense</BonsaiButton>
      </div>
      <div className="portal-panel overflow-hidden divide-y divide-border">
        {[
          { date: 'Jan 15, 2026', amount: 85.00, category: 'Software', status: 'Pending' },
          { date: 'Jan 12, 2026', amount: 42.50, category: 'Travel', status: 'Approved' },
        ].map((expense, i) => (
          <div key={i} className="px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-[14px] font-medium text-foreground">{expense.category} — ${expense.amount}</p>
              <p className="text-[12px] text-muted-foreground mt-0.5">{expense.date}</p>
            </div>
            <BonsaiStatusPill
              status={expense.status === 'Approved' ? 'active' : 'pending'}
              label={expense.status}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// FP-07: Freelancer Documents
function FreelancerDocuments() {
  const { addToast } = useToast();
  const documents = [
    { id: '1', name: 'Contract-2026.pdf', type: 'application/pdf', size: '845 KB', uploadedAt: 'Jan 10, 2026', uploadedBy: 'Admin' },
    { id: '2', name: 'NDA.pdf', type: 'application/pdf', size: '245 KB', uploadedAt: 'Nov 10, 2025', uploadedBy: 'Legal' },
  ];

  return (
    <div className="px-3 py-6 sm:px-6 sm:py-8 lg:px-8 max-w-3xl">
      <h1 className="text-[24px] font-semibold text-foreground tracking-[-0.02em] mb-6">My Documents</h1>
      <div className="portal-panel p-5">
        <BonsaiDocumentList
          documents={documents}
          onDownload={doc => addToast(`Downloading ${doc.name}`, 'info')}
          onDelete={undefined}
        />
      </div>
    </div>
  );
}

function FreelancerSelfBillsList({ onNavigate }: { onNavigate: (s: FreelancerScreen) => void }) {
  return (
    <div className="px-3 py-6 sm:px-6 sm:py-8 lg:px-8 max-w-3xl">
      <h1 className="text-[24px] font-semibold text-foreground mb-2">Self-bills</h1>
      <p className="text-[13px] text-muted-foreground mb-6">Generated from approved timesheets — download for taxes and records.</p>
      <div className="portal-panel divide-y divide-border">
        {[
          { id: 'SB-2026-03', period: 'Mar 1–31, 2026', amt: '$8,400', st: 'Ready' },
          { id: 'SB-2026-02', period: 'Feb 1–28, 2026', amt: '$7,200', st: 'Paid' },
        ].map(b => (
          <button
            key={b.id}
            type="button"
            onClick={() => onNavigate('self-bill-detail')}
            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-secondary/50"
          >
            <div>
              <p className="font-semibold text-foreground">{b.id}</p>
              <p className="text-[12px] text-muted-foreground mt-0.5">{b.period}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-foreground">{b.amt}</p>
              <BonsaiStatusPill status={b.st === 'Paid' ? 'active' : 'pending'} label={b.st} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function FreelancerSelfBillDetail({ onNavigate }: { onNavigate: (s: FreelancerScreen) => void }) {
  const { addToast } = useToast();
  return (
    <div className="px-3 py-6 sm:px-6 sm:py-8 lg:px-8 max-w-2xl">
      <button type="button" onClick={() => onNavigate('self-bills')} className="text-[13px] text-muted-foreground hover:text-foreground mb-6">
        ← Self-bills
      </button>
      <h1 className="text-[22px] font-semibold text-foreground mb-2">SB-2026-03</h1>
      <p className="text-[13px] text-muted-foreground mb-6">Mar 1–31, 2026 · 88 billable hours</p>
      <div className="portal-panel rounded-xl p-6 mb-6">
        <div className="flex justify-between text-[13px] mb-2">
          <span className="text-muted-foreground">Acme Corp</span>
          <span className="font-semibold">$4,800</span>
        </div>
        <div className="flex justify-between text-[13px] mb-4">
          <span className="text-muted-foreground">Tech Startup Inc</span>
          <span className="font-semibold">$3,600</span>
        </div>
        <div className="border-t border-border/60 pt-4 flex justify-between font-semibold text-foreground">
          <span>Total</span>
          <span>$8,400</span>
        </div>
      </div>
      <BonsaiButton variant="primary" onClick={() => addToast('PDF downloaded (demo).', 'success')}>
        Download PDF
      </BonsaiButton>
    </div>
  );
}

function FreelancerContractDocs() {
  const { addToast } = useToast();
  return (
    <div className="px-3 py-6 sm:px-6 sm:py-8 lg:px-8 max-w-3xl">
      <h1 className="text-[24px] font-semibold text-foreground mb-6">Contract documents</h1>
      <div className="portal-panel p-6 space-y-4">
        {[
          { n: 'Master services agreement — 2026', d: 'Jan 10, 2026' },
          { n: 'Statement of work — Website', d: 'Jan 12, 2026' },
          { n: 'NDA (mutual)', d: 'Nov 10, 2025' },
        ].map(f => (
          <div key={f.n} className="flex items-center justify-between py-2 border-b border-border/60 last:border-0">
            <div>
              <p className="font-medium text-foreground">{f.n}</p>
              <p className="text-[11px] text-muted-foreground">Signed {f.d}</p>
            </div>
            <BonsaiButton size="sm" variant="ghost" onClick={() => addToast(`Opening ${f.n}`, 'info')}>
              Download
            </BonsaiButton>
          </div>
        ))}
      </div>
    </div>
  );
}

function FreelancerProfile({ onNavigate }: { onNavigate: (s: FreelancerScreen) => void }) {
  return (
    <div className="px-3 py-6 sm:px-6 sm:py-8 lg:px-8 max-w-xl">
      <h1 className="text-[24px] font-semibold text-foreground mb-6">Profile</h1>
      <div className="portal-panel rounded-xl p-6 space-y-4">
        <div>
          <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Display name</p>
          <p className="text-[14px] font-medium text-foreground">Sarah Johnson</p>
        </div>
        <div>
          <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Business email</p>
          <p className="text-[14px] text-foreground">sarah.j@freelance.com</p>
        </div>
        <div>
          <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Tax entity</p>
          <p className="text-[14px] text-foreground">S Johnson LLC</p>
        </div>
        <BonsaiButton variant="outline" onClick={() => onNavigate('profile-change-request')}>
          Request data change
        </BonsaiButton>
      </div>
    </div>
  );
}

function FreelancerProfileChangeRequest({ onNavigate }: { onNavigate: (s: FreelancerScreen) => void }) {
  const { addToast } = useToast();
  return (
    <div className="px-3 py-6 sm:px-6 sm:py-8 lg:px-8 max-w-xl">
      <button type="button" onClick={() => onNavigate('profile')} className="text-[13px] text-muted-foreground hover:text-foreground mb-6">
        ← Profile
      </button>
      <h1 className="text-[22px] font-semibold text-foreground mb-6">Request profile update</h1>
      <div className="portal-panel rounded-xl p-6 space-y-4">
        <textarea className="w-full min-h-[120px] px-3 py-2 rounded-lg border border-border text-[13px]" placeholder="Describe the change (legal name, address, etc.)" />
        <BonsaiButton variant="primary" onClick={() => { addToast('Request queued for HR / ops.', 'success'); onNavigate('profile'); }}>
          Submit
        </BonsaiButton>
      </div>
    </div>
  );
}

// Approval Modal — Glassmorphic
function ApprovalModal({ action, type, onClose, onSuccess }: { action: 'approve' | 'reject', type: 'proposal' | 'request' | 'invoice', onClose: () => void, onSuccess: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/60 backdrop-blur-[8px]" onClick={onClose} />
      <div className="relative hub-modal-solid rounded-2xl p-6 w-full max-w-sm">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />
        <h2 className="text-[16px] font-medium text-foreground mb-2">Confirm {action === 'approve' ? 'Approval' : 'Rejection'}</h2>
        <p className="text-[13px] text-muted-foreground mb-6 leading-relaxed">Are you sure you want to {action === 'approve' ? 'approve' : 'reject'} this {type}?</p>
        <div className="flex items-center justify-end gap-2">
          <BonsaiButton size="sm" variant="ghost" onClick={onClose}>Cancel</BonsaiButton>
          <BonsaiButton size="sm" variant={action === 'approve' ? 'primary' : 'destructive'} onClick={onSuccess}>{action === 'approve' ? 'Approve' : 'Reject'}</BonsaiButton>
        </div>
      </div>
    </div>
  );
}

// HRIS Portal — profile change & document review (ties to employee GDPR flow)
function HRISPortal({ currentScreen, onNavigate }: { currentScreen: HRISScreen; onNavigate: (screen: HRISScreen) => void }) {
  const { addToast } = useToast();
  const requests = [
    { id: 1, employee: 'John Doe', type: 'Address Change', field: 'Home Address', submitted: '2026-04-01', status: 'Pending' as const },
    { id: 2, employee: 'Jane Smith', type: 'Name Change', field: 'Legal Name', submitted: '2026-03-30', status: 'Pending' as const },
    { id: 3, employee: 'Mike Torres', type: 'Bank Details', field: 'Account Number', submitted: '2026-03-28', status: 'Approved' as const },
    { id: 4, employee: 'Sarah Johnson', type: 'Emergency Contact', field: 'Primary Contact', submitted: '2026-03-25', status: 'Approved' as const },
  ];

  const docRequests = [
    { id: 'd1', employee: 'John Doe', doc: 'Updated driver license', submitted: '2026-04-02', status: 'Pending' as const },
    { id: 'd2', employee: 'Priya N.', doc: 'I-9 reverification', submitted: '2026-03-29', status: 'Pending' as const },
  ];

  const hrisMenu = [
    { id: 'profile-requests', label: 'Profile requests', icon: ClipboardList },
    { id: 'document-requests', label: 'Document intake', icon: FileText },
  ];

  const hrisNavActive = (itemId: string) => {
    if (itemId === 'profile-requests') {
      return currentScreen === 'profile-requests' || currentScreen === 'profile-request-detail';
    }
    return currentScreen === 'document-requests';
  };

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">
      <PortalRail
        brandLetter="H"
        title="HRIS admin"
        subtitle="People operations"
        layoutId="portal-hris-rail"
        items={hrisMenu}
        isItemActive={hrisNavActive}
        onSelect={(id) => onNavigate(id as HRISScreen)}
        user={{ initials: 'HR', name: 'HR Ops', email: 'hr-ops@company.com' }}
      />

      <PortalMain>
        <div className="mx-auto max-w-4xl px-6 py-8 md:px-8">
          <div className="mb-8">
            <h1 className="text-[24px] font-semibold tracking-[-0.02em] text-foreground">HRIS administration</h1>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Profile change requests and sensitive document intake from the employee portal — audit-ready workflows.
            </p>
          </div>

          {currentScreen === 'profile-requests' && (
            <div className="portal-list divide-y divide-border shadow-sm">
              {requests.map(req => (
                <button
                  key={req.id}
                  type="button"
                  onClick={() => onNavigate('profile-request-detail')}
                  className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-[color:var(--row-hover-bg)]"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-[14px] font-medium text-foreground">{req.employee}</span>
                      <span className="text-[11px] uppercase tracking-wide text-muted-foreground">{req.type}</span>
                    </div>
                    <div className="mt-0.5 text-[12px] text-muted-foreground">
                      {req.field} · {req.submitted}
                    </div>
                  </div>
                  <BonsaiStatusPill status={req.status === 'Pending' ? 'pending' : 'completed'} label={req.status} />
                </button>
              ))}
            </div>
          )}

          {currentScreen === 'profile-request-detail' && (
            <div>
              <button
                type="button"
                onClick={() => onNavigate('profile-requests')}
                className="mb-6 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
              >
                ← All requests
              </button>
              <div className="portal-panel mb-6 p-6 shadow-sm">
                <h2 className="mb-1 text-[18px] font-semibold text-foreground">Jane Smith — Legal name</h2>
                <p className="mb-6 text-[12px] text-muted-foreground">Submitted 2026-03-30 · Employee portal</p>
                <div className="mb-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border border-border bg-secondary/50 p-4">
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Current</p>
                    <p className="text-[14px] text-foreground">Jane Smith</p>
                  </div>
                  <div className="rounded-lg border border-primary/25 bg-primary/5 p-4 dark:border-primary/30 dark:bg-primary/10">
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-primary">Requested</p>
                    <p className="text-[14px] text-foreground">Jane Smith-Lee</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <BonsaiButton
                    variant="primary"
                    onClick={() => {
                      addToast('Change approved — employee record updated.', 'success');
                      onNavigate('profile-requests');
                    }}
                  >
                    Approve
                  </BonsaiButton>
                  <BonsaiButton
                    variant="destructive"
                    onClick={() => {
                      addToast('Rejected — employee notified with reason.', 'warning');
                      onNavigate('profile-requests');
                    }}
                  >
                    Reject
                  </BonsaiButton>
                  <BonsaiButton variant="ghost" onClick={() => addToast('Audit log entry added.', 'info')}>
                    Add note
                  </BonsaiButton>
                </div>
              </div>
            </div>
          )}

          {currentScreen === 'document-requests' && (
            <div className="portal-list divide-y divide-border shadow-sm">
              {docRequests.map(d => (
                <div key={d.id} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div>
                    <p className="font-medium text-foreground">{d.doc}</p>
                    <p className="mt-0.5 text-[12px] text-muted-foreground">
                      {d.employee} · {d.submitted}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <BonsaiStatusPill status="pending" label={d.status} />
                    <BonsaiButton size="sm" variant="primary" onClick={() => addToast('Document marked verified.', 'success')}>
                      Verify
                    </BonsaiButton>
                    <BonsaiButton size="sm" variant="ghost" onClick={() => addToast('Preview opened (demo).', 'info')}>
                      Preview
                    </BonsaiButton>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PortalMain>
    </div>
  );
}

// CP-04: Candidate Portal — application tracking, interview prep, offer stage
function CandidatePortal({ currentScreen, onNavigate }: { currentScreen: CandidateScreen; onNavigate: (screen: CandidateScreen) => void }) {
  const { addToast } = useToast();

  const menuItems = [
    { id: 'home', label: 'Dashboard', icon: Home },
    { id: 'application', label: 'My Application', icon: ClipboardList },
    { id: 'interviews', label: 'Interviews', icon: Video },
    { id: 'documents', label: 'Documents', icon: FolderOpen },
    { id: 'offer', label: 'Offer', icon: FileCheck },
  ];

  const navActive = (id: string) => currentScreen === id;

  const STAGES = [
    { id: 1, label: 'Applied', done: true, date: 'Mar 20' },
    { id: 2, label: 'Screening', done: true, date: 'Mar 24' },
    { id: 3, label: 'Technical', done: true, date: 'Apr 1' },
    { id: 4, label: 'Final round', done: false, date: 'Apr 10' },
    { id: 5, label: 'Offer', done: false, date: '—' },
  ];

  const INTERVIEWS = [
    { id: 1, title: 'Final Round Interview', type: 'Video call', date: 'Thu, Apr 10 · 2:00 PM', interviewer: 'Sarah Chen, James Park', status: 'scheduled' },
    { id: 2, title: 'Technical Assessment', type: 'Take-home', date: 'Tue, Apr 1 · Completed', interviewer: 'Engineering team', status: 'completed' },
    { id: 3, title: 'Recruiter Screen', type: 'Video call', date: 'Mon, Mar 24 · Completed', interviewer: 'HR Team', status: 'completed' },
  ];

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">
      <PortalRail
        brandLetter="C"
        title="Candidate portal"
        subtitle="Senior React Developer"
        layoutId="portal-candidate-rail"
        items={menuItems}
        isItemActive={navActive}
        onSelect={(id) => onNavigate(id as CandidateScreen)}
        user={{ initials: 'CR', name: 'Carlos Ruiz', email: 'carlos@freelance.io' }}
      />

      <PortalMain>
        {currentScreen === 'home' && (
          <div className="max-w-3xl px-6 py-8">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Candidate workspace</p>
              <h1 className="text-[28px] font-semibold tracking-[-0.025em] text-foreground">Hi Carlos, you're in the running!</h1>
              <p className="mt-2 text-[13px] text-muted-foreground">Senior React Developer · Operations Hub · Full-time</p>
            </motion.div>

            {/* Progress pipeline */}
            <div className="mt-8 mb-8">
              <h2 className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground mb-4">Application progress</h2>
              <div className="flex items-center gap-0">
                {STAGES.map((stage, i) => (
                  <React.Fragment key={stage.id}>
                    <div className="flex flex-col items-center gap-1.5 flex-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold border-2 transition-colors ${stage.done ? 'bg-primary border-primary text-white' : i === STAGES.findIndex(s => !s.done) ? 'border-primary text-primary bg-background' : 'border-border text-muted-foreground bg-background'}`}>
                        {stage.done ? <Check className="w-4 h-4" /> : stage.id}
                      </div>
                      <p className="text-[10px] font-medium text-center" style={{ color: stage.done ? 'var(--foreground)' : 'var(--muted-foreground)' }}>{stage.label}</p>
                      <p className="text-[9px] text-center" style={{ color: 'var(--muted-foreground)' }}>{stage.date}</p>
                    </div>
                    {i < STAGES.length - 1 && (
                      <div className="flex-1 h-0.5 mb-5 -mx-1" style={{ background: stage.done ? 'var(--color-primary, #2563EB)' : 'var(--border)' }} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Next step */}
            <div className="portal-panel p-5 mb-4 border-l-4" style={{ borderLeftColor: 'var(--color-primary, #2563EB)' }}>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-primary mb-1">Next step</p>
              <h3 className="text-[14px] font-semibold text-foreground">Final Round Interview</h3>
              <p className="text-[12px] text-muted-foreground mt-0.5">Thursday, April 10 · 2:00 PM · Video call with Sarah Chen & James Park</p>
              <div className="flex items-center gap-2 mt-3">
                <BonsaiButton size="sm" onClick={() => addToast('Calendar invite sent to your email.', 'success')}>Add to calendar</BonsaiButton>
                <BonsaiButton size="sm" variant="outline" onClick={() => onNavigate('interviews')}>View details</BonsaiButton>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button type="button" onClick={() => onNavigate('documents')} className="portal-panel group p-4 text-left hover:shadow-md transition-shadow">
                <h3 className="text-[13px] font-semibold text-foreground mb-1.5">Documents needed</h3>
                <p className="text-[12px] text-muted-foreground">2 documents pending upload — ID and right to work.</p>
                <p className="text-[11px] font-medium text-primary mt-2">Upload now →</p>
              </button>
              <button type="button" onClick={() => onNavigate('offer')} className="portal-panel group p-4 text-left hover:shadow-md transition-shadow">
                <h3 className="text-[13px] font-semibold text-foreground mb-1.5">Offer package</h3>
                <p className="text-[12px] text-muted-foreground">Available after final round. You'll be notified by email.</p>
                <p className="text-[11px] font-medium text-muted-foreground mt-2">Pending →</p>
              </button>
            </div>
          </div>
        )}

        {currentScreen === 'interviews' && (
          <div className="px-6 py-8 max-w-3xl">
            <h1 className="text-[24px] font-semibold text-foreground mb-6">Interviews</h1>
            <div className="space-y-3">
              {INTERVIEWS.map(iv => (
                <div key={iv.id} className="portal-panel p-5 flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iv.status === 'scheduled' ? 'bg-primary/10' : 'bg-secondary'}`}>
                    <Video className="w-5 h-5" style={{ color: iv.status === 'scheduled' ? 'var(--color-primary, #2563EB)' : 'var(--muted-foreground)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[14px] font-semibold text-foreground">{iv.title}</h3>
                      <BonsaiStatusPill status={iv.status === 'scheduled' ? 'inProgress' : 'completed'} label={iv.status === 'scheduled' ? 'Scheduled' : 'Completed'} />
                    </div>
                    <p className="text-[12px] text-muted-foreground mt-0.5">{iv.date}</p>
                    <p className="text-[12px] text-muted-foreground">{iv.type} · {iv.interviewer}</p>
                  </div>
                  {iv.status === 'scheduled' && (
                    <BonsaiButton size="sm" onClick={() => addToast('Video link copied to clipboard.', 'success')}>Join call</BonsaiButton>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {currentScreen === 'documents' && (
          <div className="px-6 py-8 max-w-2xl">
            <h1 className="text-[24px] font-semibold text-foreground mb-2">Documents</h1>
            <p className="text-[13px] text-muted-foreground mb-6">Upload required documents for your application. All files are encrypted and handled securely.</p>
            <div className="space-y-3">
              {[
                { name: 'Government-issued ID', status: 'required', uploaded: false },
                { name: 'Right to work', status: 'required', uploaded: false },
                { name: 'CV / Résumé', status: 'uploaded', uploaded: true },
                { name: 'Portfolio', status: 'uploaded', uploaded: true },
              ].map(doc => (
                <div key={doc.name} className="portal-panel flex items-center justify-between gap-3 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${doc.uploaded ? 'bg-primary/10' : 'bg-secondary'}`}>
                      <FileText className="w-4 h-4" style={{ color: doc.uploaded ? 'var(--color-primary, #2563EB)' : 'var(--muted-foreground)' }} />
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-foreground">{doc.name}</p>
                      <p className="text-[11px] text-muted-foreground">{doc.uploaded ? 'Uploaded' : 'Required'}</p>
                    </div>
                  </div>
                  {doc.uploaded ? (
                    <BonsaiStatusPill status="completed" label="Done" />
                  ) : (
                    <BonsaiButton size="sm" onClick={() => addToast(`${doc.name} upload dialog opened.`, 'info')}>Upload</BonsaiButton>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {currentScreen === 'application' && (
          <div className="px-6 py-8 max-w-2xl">
            <h1 className="text-[24px] font-semibold text-foreground mb-6">My Application</h1>
            <div className="portal-panel divide-y divide-border">
              {[
                { label: 'Role', value: 'Senior React Developer' },
                { label: 'Department', value: 'Engineering' },
                { label: 'Location', value: 'Remote (UK / EU)' },
                { label: 'Contract', value: 'Full-time permanent' },
                { label: 'Applied', value: 'March 20, 2026' },
                { label: 'Stage', value: 'Final Round' },
                { label: 'Recruiter', value: 'HR Team — hr@company.com' },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between px-5 py-3.5">
                  <span className="text-[12px] text-muted-foreground">{row.label}</span>
                  <span className="text-[13px] font-medium text-foreground">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentScreen === 'offer' && (
          <div className="px-6 py-8 max-w-2xl flex flex-col items-center text-center pt-20">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ background: 'var(--secondary)' }}>
              <FileCheck className="w-8 h-8" style={{ color: 'var(--muted-foreground)' }} />
            </div>
            <h1 className="text-[22px] font-semibold text-foreground mb-2">Offer package</h1>
            <p className="text-[13px] text-muted-foreground max-w-sm">Your offer letter and compensation details will appear here after the final round interview. You'll receive an email notification.</p>
            <div className="mt-6 px-4 py-2 rounded-lg text-[12px] font-medium" style={{ background: 'var(--secondary)', color: 'var(--muted-foreground)' }}>Pending — final round on Apr 10</div>
          </div>
        )}
      </PortalMain>
    </div>
  );
}