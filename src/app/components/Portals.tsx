'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Home, Briefcase, FileText, DollarSign, Calendar, Users, FolderOpen, MessageSquare, ClipboardList, CheckSquare, FileCheck, ThumbsUp, Video, X, Check, Download, MessageCircle, User, BookOpen, Award, TrendingUp, Clock, Receipt, Shield, ChevronRight } from 'lucide-react';
import { BonsaiTabs } from './bonsai/BonsaiTabs';
import { BonsaiButton } from './bonsai/BonsaiButton';
import { BonsaiStatusPill } from './bonsai/BonsaiStatusPill';
import { BonsaiTimeline } from './bonsai/BonsaiTimeline';
import { BonsaiDocumentList } from './bonsai/BonsaiFileUpload';
import { EnhancedTable } from './operations/EnhancedTable';
import { useToast } from './bonsai/ToastSystem';

export type PortalType = 'client' | 'employee' | 'freelancer' | 'hris';
type ClientScreen = 'home' | 'projects' | 'requests' | 'documents' | 'invoices' | 'invoice-detail' | 'support' | 'ticket-detail' | 'talent' | 'proposals' | 'proposal-detail' | 'approvals' | 'approval-detail-request' | 'approval-detail-invoice' | 'approval-detail-timesheet' | 'meetings' | 'meeting-detail' | 'forms';
type EmployeeScreen = 'home' | 'projects' | 'tasks' | 'timesheets' | 'expenses' | 'leave' | 'documents' | 'onboarding' | 'onboarding-task' | 'profile' | 'profile-change-request' | 'training' | 'training-detail' | 'performance-reviews' | 'performance-review-detail' | 'meetings' | 'meeting-detail';
type FreelancerScreen = 'home' | 'assignments' | 'tasks' | 'timesheets' | 'expenses' | 'documents' | 'onboarding' | 'contract-docs' | 'profile' | 'profile-change-request' | 'self-bills' | 'self-bill-detail';
type HRISScreen = 'profile-requests' | 'profile-request-detail' | 'document-requests';

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
    urlSync && portalFromUrl && (['client', 'employee', 'freelancer', 'hris'] as const).includes(portalFromUrl)
      ? portalFromUrl
      : portalType;
  const [clientScreen, setClientScreen] = useState<ClientScreen>('home');
  const [employeeScreen, setEmployeeScreen] = useState<EmployeeScreen>('home');
  const [freelancerScreen, setFreelancerScreen] = useState<FreelancerScreen>('home');
  const [hrisScreen, setHRISScreen] = useState<HRISScreen>('profile-requests');

  const portalBtn = (id: PortalType, label: string) => (
    <button
      key={id}
      onClick={() => setPortalType(id)}
      className={`px-3 py-1.5 text-[12px] rounded-md transition-all duration-200 ${
        portalType === id
          ? 'bg-stone-800 text-white font-medium shadow-sm'
          : 'text-stone-400 hover:text-stone-600 hover:bg-stone-50'
      }`}
    >{label}</button>
  );

  const screenKey = activePortal === 'client' ? clientScreen
    : activePortal === 'employee' ? employeeScreen
    : activePortal === 'freelancer' ? freelancerScreen
    : hrisScreen;

  return (
    <div className="min-h-full">
      {/* Glass tab switcher */}
      <div
        className="px-6 py-2 sticky top-0 z-10"
        style={{
          background: 'rgba(245,245,243,0.88)',
          backdropFilter: 'blur(44px) saturate(180%)',
          WebkitBackdropFilter: 'blur(44px) saturate(180%)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        <div className="flex items-center gap-1">
          {(['client','employee','freelancer','hris'] as const).map((id) => {
            const label = id === 'hris' ? 'HRIS Admin' : id.charAt(0).toUpperCase() + id.slice(1);
            const dot: Record<string, string> = { client: '#6366F1', employee: '#059669', freelancer: '#D97706', hris: '#78716c' };
            const href = `/hub/portals/${id}`;
            const className =
              'flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[12px] font-medium transition-all duration-200';
            const style = {
              background: activePortal === id ? '#1c1917' : 'transparent',
              color: activePortal === id ? '#ffffff' : '#78716c',
            } as const;
            if (urlSync) {
              return (
                <Link
                  key={id}
                  href={href}
                  className={className}
                  style={style}
                  scroll={false}
                >
                  {activePortal === id && <div className="w-[5px] h-[5px] rounded-full" style={{ background: dot[id] }} />}
                  {label}
                </Link>
              );
            }
            return (
              <button
                key={id}
                type="button"
                onClick={() => setPortalType(id)}
                className={className}
                style={style}
                onMouseEnter={(e) => { if (activePortal !== id) e.currentTarget.style.background = 'rgba(28,25,23,0.06)'; }}
                onMouseLeave={(e) => { if (activePortal !== id) e.currentTarget.style.background = 'transparent'; }}
              >
                {activePortal === id && <div className="w-[5px] h-[5px] rounded-full" style={{ background: dot[id] }} />}
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={`${activePortal}-${screenKey}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.25, ease: 'easeOut' }}>
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
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// CP-00: Client Portal Shell + Screens
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

  return (
    <div className="flex h-screen">
      {/* Client Portal Sidebar — Apple glass */}
      <div
        className="w-60 flex flex-col flex-shrink-0"
        style={{
          background: 'rgba(255,255,255,0.76)',
          backdropFilter: 'blur(44px) saturate(180%)',
          WebkitBackdropFilter: 'blur(44px) saturate(180%)',
          borderRight: '1px solid rgba(0,0,0,0.06)',
          boxShadow: '4px 0 24px rgba(0,0,0,0.03)',
        }}
      >
        <div className="px-5 py-5" style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(145deg, #4f46e5, #6366f1)', boxShadow: '0 2px 6px rgba(99,102,241,0.3)' }}
            >
              <span className="text-white text-[9px] font-semibold">C</span>
            </div>
            <div>
              <p className="text-[13px] font-semibold text-stone-800 leading-tight tracking-[-0.01em]">Client Portal</p>
              <p className="text-[11px] text-stone-400 leading-tight">Acme Corporation</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-2.5 py-3 space-y-[2px] overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id ||
              (currentScreen === 'proposal-detail' && item.id === 'proposals') ||
              (currentScreen.startsWith('approval-detail') && item.id === 'approvals') ||
              (currentScreen === 'meeting-detail' && item.id === 'meetings') ||
              (currentScreen === 'invoice-detail' && item.id === 'invoices') ||
              (currentScreen === 'ticket-detail' && item.id === 'support');
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id as ClientScreen)}
                className="relative w-full flex items-center gap-2.5 px-3 py-[7px] rounded-[10px] text-left transition-all"
                style={{ background: isActive ? 'rgba(28,25,23,0.07)' : 'transparent', color: isActive ? '#1c1917' : '#78716c' }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'rgba(28,25,23,0.04)'; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
              >
                {isActive && <motion.div layoutId="client-nav" className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[16px] rounded-full bg-stone-800" transition={{ type:'spring', stiffness:450, damping:32 }} />}
                <Icon className="w-4 h-4 flex-shrink-0" style={{ strokeWidth: isActive ? 2.1 : 1.7 }} />
                <span className={`text-[13px] ${isActive ? 'font-semibold text-stone-800' : 'text-stone-500'}`}>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="px-3 py-3" style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}>
          <div className="flex items-center gap-2.5 px-3 py-2">
            <div className="w-7 h-7 rounded-full bg-stone-200 flex items-center justify-center text-[11px] font-semibold text-stone-600 flex-shrink-0">AC</div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium text-stone-700 truncate">Admin User</p>
              <p className="text-[11px] text-stone-400 truncate">admin@acme.com</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-stone-50">
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
      </div>

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
  return (
    <div className="px-8 py-8 max-w-4xl">
      <motion.div
        className="mb-8"
        initial={{ opacity:0, y:8 }}
        animate={{ opacity:1, y:0 }}
        transition={{ duration:0.3 }}
      >
        <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-[0.1em] mb-1">Client Portal</p>
        <h1 className="text-[30px] font-semibold text-stone-800 tracking-[-0.03em]">Welcome back, Acme.</h1>
      </motion.div>

      <motion.div
        className="grid grid-cols-4 gap-3 mb-6"
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
      >
        {[
          { label: 'Active Projects', value: '3', sub: '1 on track' },
          { label: 'Pending Timesheets', value: '5', sub: 'awaiting review', urgent: true },
          { label: 'Open Tickets', value: '2', sub: 'unresolved' },
          { label: 'Invoices', value: '4', sub: '1 pending payment' },
        ].map((kpi) => (
          <motion.div
            key={kpi.label}
            className="glass-stat p-4"
            variants={{ hidden: { opacity:0, y:12 }, show: { opacity:1, y:0, transition:{ type:'spring', stiffness:320, damping:28 } } }}
          >
            <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-[0.08em] mb-2">{kpi.label}</p>
            <p className={`text-[32px] font-bold tracking-[-0.03em] leading-none shimmer-text ${kpi.urgent ? 'text-stone-600' : 'text-stone-800'}`}>{kpi.value}</p>
            <p className="text-[11px] text-stone-400 mt-1.5">{kpi.sub}</p>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <button
          onClick={() => onNavigate('projects')}
          className="bg-white/60 backdrop-blur-sm rounded-xl border border-stone-200/40 p-5 hover:bg-white/80 hover:shadow-sm transition-all text-left group"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[13px] font-semibold text-stone-700">Active Projects</h3>
            <span className="text-stone-300 group-hover:text-stone-500 transition-colors text-[14px]">→</span>
          </div>
          <div className="space-y-2">
            {[
              { name: 'Website Redesign', pct: 65, status: 'On Track' },
              { name: 'Mobile App Development', pct: 30, status: 'In Progress' },
            ].map(p => (
              <div key={p.name} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <p className="text-[12px] font-medium text-stone-700">{p.name}</p>
                  <p className="text-[11px] text-stone-400">{p.pct}%</p>
                </div>
                <div className="h-1 bg-stone-100 rounded-full overflow-hidden">
                  <div className="h-full bg-stone-400 rounded-full transition-all" style={{ width: `${p.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </button>

        <button
          onClick={() => onNavigate('support')}
          className="bg-white/60 backdrop-blur-sm rounded-xl border border-stone-200/40 p-5 hover:bg-white/80 hover:shadow-sm transition-all text-left group"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[13px] font-semibold text-stone-700">Support Tickets</h3>
            <span className="text-stone-300 group-hover:text-stone-500 transition-colors text-[14px]">→</span>
          </div>
          <div className="space-y-2">
            <div className="p-3 bg-stone-100/60 rounded-lg border border-stone-200/50">
              <p className="text-[12px] font-medium text-stone-700">Access issue with project files</p>
              <p className="text-[11px] text-stone-600 mt-0.5">Open • 2 hours ago</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => onNavigate('invoices')}
          className="bg-white/60 backdrop-blur-sm rounded-xl border border-stone-200/40 p-5 hover:bg-white/80 hover:shadow-sm transition-all text-left group"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[13px] font-semibold text-stone-700">Recent Invoices</h3>
            <span className="text-stone-300 group-hover:text-stone-500 transition-colors text-[14px]">→</span>
          </div>
          <div className="p-3 bg-stone-50 rounded-lg border border-stone-100">
            <p className="text-[12px] font-medium text-stone-700">INV-2026-001 • $28,500</p>
            <p className="text-[11px] text-stone-400 mt-0.5">Due Feb 14, 2026 • Pending</p>
          </div>
        </button>

        <button
          onClick={() => onNavigate('talent')}
          className="bg-white/60 backdrop-blur-sm rounded-xl border border-stone-200/40 p-5 hover:bg-white/80 hover:shadow-sm transition-all text-left group"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[13px] font-semibold text-stone-700">Talent Shortlists</h3>
            <span className="text-stone-300 group-hover:text-stone-500 transition-colors text-[14px]">→</span>
          </div>
          <div className="p-3 bg-stone-50 rounded-lg border border-stone-100">
            <p className="text-[12px] font-medium text-stone-700">Senior React Developer</p>
            <p className="text-[11px] text-stone-400 mt-0.5">3 shortlisted candidates</p>
          </div>
        </button>
      </div>
    </div>
  );
}

function ClientProjects() {
  return (
    <div className="px-8 py-8 max-w-3xl">
      <h1 className="text-[24px] font-semibold text-stone-800 tracking-[-0.02em] mb-6">My Projects</h1>
      <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-stone-200/40 overflow-hidden divide-y divide-stone-100/60">
        {[
          { name: 'Website Redesign', status: 'On Track', statusKey: 'active' as const, progress: 65 },
          { name: 'Mobile App Development', status: 'In Progress', statusKey: 'inProgress' as const, progress: 30 },
          { name: 'Brand Identity', status: 'Completed', statusKey: 'completed' as const, progress: 100 },
        ].map((project, i) => (
          <div key={i} className="px-5 py-4 hover:bg-stone-50/50 transition-colors cursor-pointer">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-[14px] font-medium text-stone-800">{project.name}</h3>
              <BonsaiStatusPill status={project.statusKey} label={project.status} />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-1 bg-stone-100 rounded-full overflow-hidden">
                <div className="h-full bg-stone-400 rounded-full" style={{ width: `${project.progress}%` }} />
              </div>
              <span className="text-[12px] text-stone-400">{project.progress}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ClientRequests({ onNavigate }: { onNavigate: (screen: ClientScreen) => void }) {
  return (
    <div className="px-8 py-8 max-w-3xl">
      <h1 className="text-[24px] font-semibold text-stone-800 tracking-[-0.02em] mb-6">Pending Requests</h1>
      <p className="text-[11px] font-medium text-stone-400 uppercase tracking-[0.08em] mb-3">Timesheet Approvals</p>
      <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-stone-200/40 overflow-hidden divide-y divide-stone-100/60">
        {[1, 2, 3].map((i) => (
          <div key={i} className="px-5 py-4 flex items-center justify-between hover:bg-stone-50/50 transition-colors">
            <div>
              <p className="text-[14px] font-medium text-stone-800">Week of Jan {i * 7}, 2026</p>
              <p className="text-[12px] text-stone-400 mt-0.5">Sarah Johnson · 42 hours</p>
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
    <div className="px-8 py-8 max-w-3xl">
      <h1 className="text-[24px] font-semibold text-stone-800 tracking-[-0.02em] mb-2">Forms inbox</h1>
      <p className="text-[13px] text-stone-500 mb-6">Assigned intakes and signatures — same pipeline as the internal Forms module.</p>
      <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-stone-200/40">
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
    <div className="px-8 py-8 max-w-3xl">
      <h1 className="text-[24px] font-semibold text-stone-800 tracking-[-0.02em] mb-6">Documents</h1>
      <div className="flex gap-2 mb-4">
        {['All Types', 'PDF', 'Archives'].map(f => (
          <button key={f} className="px-3 py-1.5 text-[12px] rounded-md text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors first:bg-stone-100 first:text-stone-800">{f}</button>
        ))}
      </div>
      <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-stone-200/40 p-5">
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
    <div className="px-8 py-8 max-w-3xl">
      <h1 className="text-[24px] font-semibold text-stone-800 tracking-[-0.02em] mb-6">Invoices</h1>

      <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-stone-200/40">
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
            amount: <span className="font-semibold text-stone-800">${inv.amount.toLocaleString()}</span>,
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
    <div className="p-8">
      <button
        onClick={() => onNavigate('invoices')}
        className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-800 mb-6"
      >
        ← Back to Invoices
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-stone-800">INV-2026-001</h1>
          <p className="text-sm text-stone-500">Due Feb 14, 2026</p>
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
          <div className="bg-white rounded-lg border border-stone-200/40 p-6">
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-xs text-stone-500 mb-1">Invoice Date</p>
                <p className="text-sm font-medium text-stone-800">Jan 15, 2026</p>
              </div>
              <div>
                <p className="text-xs text-stone-500 mb-1">Due Date</p>
                <p className="text-sm font-medium text-stone-800">Feb 14, 2026</p>
              </div>
              <div>
                <p className="text-xs text-stone-500 mb-1">Amount</p>
                <p className="text-2xl font-semibold text-stone-800">$28,500.00</p>
              </div>
              <div>
                <p className="text-xs text-stone-500 mb-1">Payment Terms</p>
                <p className="text-sm font-medium text-stone-800">Net 30</p>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'items' && (
          <div className="bg-white rounded-lg border border-stone-200/40 p-6">
            <div className="space-y-3">
              {[
                { desc: 'Website Design - Week 1-2', qty: 80, rate: 150 },
                { desc: 'Development - Week 1-2', qty: 100, rate: 125 },
              ].map((item, i) => (
                <div key={i} className="p-4 bg-stone-50 rounded-lg flex justify-between">
                  <div>
                    <p className="font-medium text-stone-800">{item.desc}</p>
                    <p className="text-sm text-stone-500">{item.qty} hours × ${item.rate}/hr</p>
                  </div>
                  <p className="font-semibold text-stone-800">${(item.qty * item.rate).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'activity' && (
          <div className="bg-white rounded-lg border border-stone-200/40 p-6">
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
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-stone-800">Support Tickets</h1>
        <BonsaiButton variant="primary">New Ticket</BonsaiButton>
      </div>

      <div className="bg-white rounded-lg border border-stone-200/40">
        <div className="divide-y divide-stone-100/60">
          {[
            { id: '1', subject: 'Access issue with project files', status: 'Open', priority: 'High', created: '2 hours ago' },
            { id: '2', subject: 'Question about invoice', status: 'Resolved', priority: 'Low', created: '3 days ago' },
          ].map((ticket) => (
            <button
              key={ticket.id}
              onClick={() => onNavigate('ticket-detail')}
              className="w-full p-6 hover:bg-stone-50 transition-colors text-left"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-stone-800">{ticket.subject}</h3>
                <BonsaiStatusPill
                  status={ticket.status === 'Open' ? 'pending' : 'active'}
                  label={ticket.status}
                />
              </div>
              <div className="flex items-center gap-3 text-sm text-stone-500">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  ticket.priority === 'High' ? 'bg-stone-100 text-stone-700' : 'bg-stone-100 text-stone-500'
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
    <div className="p-8">
      <button
        onClick={() => onNavigate('support')}
        className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-800 mb-6"
      >
        ← Back to Support
      </button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-stone-800 mb-2">Access issue with project files</h1>
          <p className="text-sm text-stone-500">Ticket #TKT-1234 • Created 2 hours ago</p>
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
            <div className="bg-white rounded-lg border border-stone-200/40 p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-stone-600 flex items-center justify-center text-white font-semibold">
                  AC
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-stone-800">You</span>
                    <span className="text-xs text-stone-500">2 hours ago</span>
                  </div>
                  <p className="text-sm text-stone-800">
                    I'm unable to access the shared project files folder. Getting an "Access Denied" error.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-stone-200/40 p-4">
              <textarea
                rows={3}
                placeholder="Type your reply..."
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200/40 rounded-lg text-sm resize-none mb-2"
              />
              <BonsaiButton size="sm">Send Reply</BonsaiButton>
            </div>
          </div>
        )}
        {activeTab === 'attachments' && (
          <div className="bg-white rounded-lg border border-stone-200/40 p-6 text-center text-stone-500">
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
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-semibold text-stone-800 mb-2">Talent shortlists</h1>
      <p className="text-sm text-stone-500 mb-6">Review profiles shared from Talent — feedback syncs to your account team.</p>

      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-stone-200/40 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-stone-800">Senior React Developer</h3>
            <BonsaiStatusPill status="pending" label="Awaiting feedback" />
          </div>
          <p className="text-sm text-stone-500 mb-4">3 shortlisted candidates</p>
          <div className="space-y-3">
            {[
              { name: 'Alex Rivera', exp: '8 yrs · Fintech', rate: '$95–110/hr' },
              { name: 'Jordan Lee', exp: '6 yrs · Product SaaS', rate: '$90–105/hr' },
              { name: 'Sam Okonkwo', exp: '10 yrs · Agency', rate: '$100–125/hr' },
            ].map(c => (
              <div key={c.name} className="flex items-center justify-between p-4 bg-stone-50 rounded-lg border border-stone-100">
                <div>
                  <p className="font-medium text-stone-800">{c.name}</p>
                  <p className="text-xs text-stone-500 mt-0.5">{c.exp}</p>
                  <p className="text-xs text-stone-400 mt-1">{c.rate}</p>
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
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-stone-800 mb-6">Proposals</h1>

      <div className="bg-white rounded-lg border border-stone-200/40">
        <EnhancedTable
          columns={[
            { key: 'title', label: 'Proposal Title', sortable: true },
            { key: 'status', label: 'Status', sortable: true },
            { key: 'amount', label: 'Amount', sortable: true },
          ]}
          data={proposals.map(prop => ({
            ...prop,
            amount: <span className="font-semibold text-stone-800">${prop.amount.toLocaleString()}</span>,
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
    <div className="p-8">
      <button
        onClick={() => onNavigate('proposals')}
        className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-800 mb-6"
      >
        ← Back to Proposals
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-stone-800">Website Redesign Proposal</h1>
          <p className="text-sm text-stone-500">Proposal #PRP-1234 • Created 2 hours ago</p>
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
          <div className="bg-white rounded-lg border border-stone-200/40 p-6">
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-xs text-stone-500 mb-1">Proposal Date</p>
                <p className="text-sm font-medium text-stone-800">Jan 15, 2026</p>
              </div>
              <div>
                <p className="text-xs text-stone-500 mb-1">Amount</p>
                <p className="text-2xl font-semibold text-stone-800">$28,500.00</p>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'items' && (
          <div className="bg-white rounded-lg border border-stone-200/40 p-6">
            <div className="space-y-3">
              {[
                { desc: 'Website Design - Week 1-2', qty: 80, rate: 150 },
                { desc: 'Development - Week 1-2', qty: 100, rate: 125 },
              ].map((item, i) => (
                <div key={i} className="p-4 bg-stone-50 rounded-lg flex justify-between">
                  <div>
                    <p className="font-medium text-stone-800">{item.desc}</p>
                    <p className="text-sm text-stone-500">{item.qty} hours × ${item.rate}/hr</p>
                  </div>
                  <p className="font-semibold text-stone-800">${(item.qty * item.rate).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'activity' && (
          <div className="bg-white rounded-lg border border-stone-200/40 p-6">
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
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-stone-800 mb-6">Approvals</h1>

      <div className="bg-white rounded-lg border border-stone-200/40">
        <EnhancedTable
          columns={[
            { key: 'type', label: 'Type', sortable: true },
            { key: 'title', label: 'Approval Title', sortable: true },
            { key: 'status', label: 'Status', sortable: true },
            { key: 'amount', label: 'Amount', sortable: true },
          ]}
          data={approvals.map(approval => ({
            ...approval,
            amount: <span className="font-semibold text-stone-800">${approval.amount.toLocaleString()}</span>,
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
    <div className="p-8">
      <button
        onClick={() => onNavigate('approvals')}
        className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-800 mb-6"
      >
        ← Back to Approvals
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-stone-800">Timesheet Approval Request</h1>
          <p className="text-sm text-stone-500">Request #REQ-1234 • Created 2 hours ago</p>
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
          <div className="bg-white rounded-lg border border-stone-200/40 p-6">
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-xs text-stone-500 mb-1">Request Date</p>
                <p className="text-sm font-medium text-stone-800">Jan 15, 2026</p>
              </div>
              <div>
                <p className="text-xs text-stone-500 mb-1">Amount</p>
                <p className="text-2xl font-semibold text-stone-800">$28,500.00</p>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'items' && (
          <div className="bg-white rounded-lg border border-stone-200/40 p-6">
            <div className="space-y-3">
              {[
                { desc: 'Website Design - Week 1-2', qty: 80, rate: 150 },
                { desc: 'Development - Week 1-2', qty: 100, rate: 125 },
              ].map((item, i) => (
                <div key={i} className="p-4 bg-stone-50 rounded-lg flex justify-between">
                  <div>
                    <p className="font-medium text-stone-800">{item.desc}</p>
                    <p className="text-sm text-stone-500">{item.qty} hours × ${item.rate}/hr</p>
                  </div>
                  <p className="font-semibold text-stone-800">${(item.qty * item.rate).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'activity' && (
          <div className="bg-white rounded-lg border border-stone-200/40 p-6">
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
    <div className="p-8">
      <button
        onClick={() => onNavigate('approvals')}
        className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-800 mb-6"
      >
        ← Back to Approvals
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-stone-800">Invoice Approval Request</h1>
          <p className="text-sm text-stone-500">Request #REQ-1234 • Created 2 hours ago</p>
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
          <div className="bg-white rounded-lg border border-stone-200/40 p-6">
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-xs text-stone-500 mb-1">Request Date</p>
                <p className="text-sm font-medium text-stone-800">Jan 15, 2026</p>
              </div>
              <div>
                <p className="text-xs text-stone-500 mb-1">Amount</p>
                <p className="text-2xl font-semibold text-stone-800">$28,500.00</p>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'items' && (
          <div className="bg-white rounded-lg border border-stone-200/40 p-6">
            <div className="space-y-3">
              {[
                { desc: 'Website Design - Week 1-2', qty: 80, rate: 150 },
                { desc: 'Development - Week 1-2', qty: 100, rate: 125 },
              ].map((item, i) => (
                <div key={i} className="p-4 bg-stone-50 rounded-lg flex justify-between">
                  <div>
                    <p className="font-medium text-stone-800">{item.desc}</p>
                    <p className="text-sm text-stone-500">{item.qty} hours × ${item.rate}/hr</p>
                  </div>
                  <p className="font-semibold text-stone-800">${(item.qty * item.rate).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'activity' && (
          <div className="bg-white rounded-lg border border-stone-200/40 p-6">
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
    <div className="p-8">
      <button
        onClick={() => onNavigate('approvals')}
        className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-800 mb-6"
      >
        ← Back to Approvals
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-stone-800">Timesheet Approval Request</h1>
          <p className="text-sm text-stone-500">Request #REQ-1234 • Created 2 hours ago</p>
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
          <div className="bg-white rounded-lg border border-stone-200/40 p-6">
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-xs text-stone-500 mb-1">Request Date</p>
                <p className="text-sm font-medium text-stone-800">Jan 15, 2026</p>
              </div>
              <div>
                <p className="text-xs text-stone-500 mb-1">Amount</p>
                <p className="text-2xl font-semibold text-stone-800">$28,500.00</p>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'items' && (
          <div className="bg-white rounded-lg border border-stone-200/40 p-6">
            <div className="space-y-3">
              {[
                { desc: 'Website Design - Week 1-2', qty: 80, rate: 150 },
                { desc: 'Development - Week 1-2', qty: 100, rate: 125 },
              ].map((item, i) => (
                <div key={i} className="p-4 bg-stone-50 rounded-lg flex justify-between">
                  <div>
                    <p className="font-medium text-stone-800">{item.desc}</p>
                    <p className="text-sm text-stone-500">{item.qty} hours × ${item.rate}/hr</p>
                  </div>
                  <p className="font-semibold text-stone-800">${(item.qty * item.rate).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'activity' && (
          <div className="bg-white rounded-lg border border-stone-200/40 p-6">
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
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-stone-800 mb-6">Meetings</h1>

      <div className="bg-white rounded-lg border border-stone-200/40">
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
    <div className="p-8">
      <button
        onClick={() => onNavigate('meetings')}
        className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-800 mb-6"
      >
        ← Back to Meetings
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-stone-800">Project Kickoff Meeting</h1>
          <p className="text-sm text-stone-500">Meeting #MTG-1234 • Scheduled Jan 15, 2026 at 10:00 AM</p>
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
          <div className="bg-white rounded-lg border border-stone-200/40 p-6">
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-xs text-stone-500 mb-1">Meeting Date</p>
                <p className="text-sm font-medium text-stone-800">Jan 15, 2026</p>
              </div>
              <div>
                <p className="text-xs text-stone-500 mb-1">Meeting Time</p>
                <p className="text-sm font-medium text-stone-800">10:00 AM</p>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'agenda' && (
          <div className="bg-white rounded-lg border border-stone-200/40 p-6">
            <div className="space-y-3">
              {[
                { desc: 'Project Overview' },
                { desc: 'Design Review' },
              ].map((item, i) => (
                <div key={i} className="p-4 bg-stone-50 rounded-lg flex justify-between">
                  <div>
                    <p className="font-medium text-stone-800">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'participants' && (
          <div className="bg-white rounded-lg border border-stone-200/40 p-6">
            <div className="space-y-3">
              {[
                { name: 'John Doe', role: 'Project Manager' },
                { name: 'Sarah Johnson', role: 'Designer' },
              ].map((item, i) => (
                <div key={i} className="p-4 bg-stone-50 rounded-lg flex justify-between">
                  <div>
                    <p className="font-medium text-stone-800">{item.name}</p>
                    <p className="text-sm text-stone-500">{item.role}</p>
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

  return (
    <div className="flex h-screen">
      {/* Employee Portal Sidebar — Apple glass */}
      <div
        className="w-60 flex flex-col flex-shrink-0"
        style={{
          background: 'rgba(255,255,255,0.76)',
          backdropFilter: 'blur(44px) saturate(180%)',
          WebkitBackdropFilter: 'blur(44px) saturate(180%)',
          borderRight: '1px solid rgba(0,0,0,0.06)',
          boxShadow: '4px 0 24px rgba(0,0,0,0.03)',
        }}
      >
        <div className="px-5 py-5" style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(145deg, #047857, #059669)', boxShadow: '0 2px 6px rgba(5,150,105,0.3)' }}
            >
              <span className="text-white text-[9px] font-semibold">E</span>
            </div>
            <div>
              <p className="text-[13px] font-semibold text-stone-800 leading-tight tracking-[-0.01em]">Employee Portal</p>
              <p className="text-[11px] text-stone-400 leading-tight">John Doe</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-2.5 py-3 space-y-[2px] overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              currentScreen === item.id ||
              (currentScreen === 'onboarding-task' && item.id === 'onboarding') ||
              (currentScreen === 'training-detail' && item.id === 'training') ||
              (currentScreen === 'performance-review-detail' && item.id === 'performance-reviews') ||
              (currentScreen === 'meeting-detail' && item.id === 'meetings') ||
              (currentScreen === 'profile-change-request' && item.id === 'profile');
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id as EmployeeScreen)}
                className="relative w-full flex items-center gap-2.5 px-3 py-[7px] rounded-[10px] text-left transition-all"
                style={{ background: isActive ? 'rgba(28,25,23,0.07)' : 'transparent', color: isActive ? '#1c1917' : '#78716c' }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'rgba(28,25,23,0.04)'; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
              >
                {isActive && <motion.div layoutId="emp-nav" className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[16px] rounded-full bg-stone-800" transition={{ type:'spring', stiffness:450, damping:32 }} />}
                <Icon className="w-4 h-4 flex-shrink-0" style={{ strokeWidth: isActive ? 2.1 : 1.7 }} />
                <span className={`text-[13px] ${isActive ? 'font-semibold text-stone-800' : 'text-stone-500'}`}>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="px-3 py-3" style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}>
          <div className="flex items-center gap-2.5 px-3 py-2">
            <div className="w-7 h-7 rounded-full bg-stone-200 flex items-center justify-center text-[11px] font-semibold text-stone-600 flex-shrink-0">JD</div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium text-stone-700 truncate">John Doe</p>
              <p className="text-[11px] text-stone-400 truncate">john.doe@company.com</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto" style={{ background: '#F5F5F3' }}>
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
      </div>
    </div>
  );
}

// EP-01: Employee Portal Home
function EmployeeHome({ onNavigate }: { onNavigate: (screen: EmployeeScreen) => void }) {
  return (
    <div className="px-8 py-8 max-w-4xl">
      <motion.div
        className="mb-8"
        initial={{ opacity:0, y:8 }}
        animate={{ opacity:1, y:0 }}
        transition={{ duration:0.3 }}
      >
        <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-[0.1em] mb-1">Employee Portal</p>
        <h1 className="text-[30px] font-semibold text-stone-800 tracking-[-0.03em]">Welcome back, John.</h1>
      </motion.div>

      <motion.div
        className="grid grid-cols-3 gap-3 mb-6"
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
      >
        {[
          { label: 'Tasks Due', value: '5', sub: 'this week' },
          { label: 'Timesheets', value: '1', sub: 'to submit', urgent: true },
          { label: 'Approvals', value: '3', sub: 'pending' },
        ].map((kpi) => (
          <motion.div
            key={kpi.label}
            className="glass-stat p-4"
            variants={{ hidden: { opacity:0, y:12 }, show: { opacity:1, y:0, transition:{ type:'spring', stiffness:320, damping:28 } } }}
          >
            <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-[0.08em] mb-2">{kpi.label}</p>
            <p className={`text-[32px] font-bold tracking-[-0.03em] leading-none shimmer-text ${kpi.urgent ? 'text-stone-600' : 'text-stone-800'}`}>{kpi.value}</p>
            <p className="text-[11px] text-stone-400 mt-1.5">{kpi.sub}</p>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <button
          onClick={() => onNavigate('tasks')}
          className="bg-white/60 backdrop-blur-sm rounded-xl border border-stone-200/40 p-5 hover:bg-white/80 hover:shadow-sm transition-all text-left group"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[13px] font-semibold text-stone-700">Tasks Due This Week</h3>
            <span className="text-stone-300 group-hover:text-stone-500 transition-colors text-[14px]">→</span>
          </div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="px-3 py-2.5 bg-stone-50 rounded-lg border border-stone-100">
                <p className="text-[12px] font-medium text-stone-700">Task {i}</p>
                <p className="text-[11px] text-stone-400 mt-0.5">Website Redesign · Due Jan {15 + i}</p>
              </div>
            ))}
          </div>
        </button>

        <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-stone-200/40 p-5">
          <h3 className="text-[13px] font-semibold text-stone-700 mb-4">Timesheet Status</h3>
          <div className="p-4 bg-stone-100/60 rounded-lg border border-stone-200/50">
            <p className="text-[13px] font-medium text-stone-700">Week of Jan 13, 2026</p>
            <p className="text-[12px] text-stone-600 mt-0.5">Not submitted · 42 hours logged</p>
            <BonsaiButton size="sm" variant="primary" className="mt-3" onClick={() => onNavigate('timesheets')}>
              Submit Timesheet
            </BonsaiButton>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('onboarding')}
          className="bg-white/60 backdrop-blur-sm rounded-xl border border-stone-200/40 p-5 hover:bg-white/80 transition-all text-left lg:col-span-2"
        >
          <h3 className="text-[13px] font-semibold text-stone-700 mb-2">Onboarding</h3>
          <p className="text-[12px] text-stone-500">4 of 6 tasks complete — ID upload & tax forms pending.</p>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('training')}
          className="bg-white/60 backdrop-blur-sm rounded-xl border border-stone-200/40 p-5 hover:bg-white/80 transition-all text-left"
        >
          <h3 className="text-[13px] font-semibold text-stone-700 mb-2">Training</h3>
          <p className="text-[12px] text-stone-500">2 required courses · Code of conduct due Apr 12</p>
        </button>
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
    <div className="px-8 py-8 max-w-2xl">
      <h1 className="text-[24px] font-semibold text-stone-800 mb-2">Onboarding</h1>
      <p className="text-[13px] text-stone-500 mb-6">Complete all tasks — HR is notified as you progress.</p>
      <div className="rounded-xl border border-stone-200/40 bg-white/70 divide-y divide-stone-100">
        {tasks.map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => onNavigate('onboarding-task')}
            className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-stone-50/80 transition-colors"
          >
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${t.done ? 'bg-emerald-500 text-white' : 'border-2 border-stone-300 text-stone-400'}`}>
              {t.done ? '✓' : ''}
            </span>
            <span className={`flex-1 text-[14px] ${t.done ? 'text-stone-500 line-through' : 'font-medium text-stone-800'}`}>{t.label}</span>
            <span className="text-[12px] text-stone-400">Open</span>
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
    <div className="px-8 py-8 max-w-xl">
      <button type="button" onClick={() => onNavigate('onboarding')} className="text-[13px] text-stone-500 hover:text-stone-800 mb-6">
        ← Back to checklist
      </button>
      <h1 className="text-[22px] font-semibold text-stone-800 mb-2">Bank details for payroll</h1>
      <p className="text-[13px] text-stone-500 mb-6">Encrypted — only payroll can view full account numbers.</p>
      <div className="space-y-4 bg-white rounded-xl border border-stone-200/40 p-6">
        <input className="w-full px-3 py-2 rounded-lg border border-stone-200 text-[13px]" placeholder="Account holder name" />
        <input className="w-full px-3 py-2 rounded-lg border border-stone-200 text-[13px]" placeholder="Routing number" />
        <input className="w-full px-3 py-2 rounded-lg border border-stone-200 text-[13px]" placeholder="Account number" />
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
    <div className="px-8 py-8 max-w-3xl">
      <h1 className="text-[24px] font-semibold text-stone-800 mb-6">Training</h1>
      <div className="space-y-3">
        {courses.map(c => (
          <button
            key={c.id}
            type="button"
            onClick={() => onNavigate('training-detail')}
            className="w-full flex items-center justify-between p-5 bg-white/70 rounded-xl border border-stone-200/40 text-left hover:bg-white transition-colors"
          >
            <div>
              <p className="font-semibold text-stone-800">{c.name}</p>
              <p className="text-[12px] text-stone-500 mt-1">{c.req ? 'Required' : 'Optional'} · Due {c.due}</p>
              <div className="h-1.5 bg-stone-100 rounded-full mt-3 max-w-[200px]">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${c.pct}%` }} />
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
    <div className="px-8 py-8 max-w-2xl">
      <button type="button" onClick={() => onNavigate('training')} className="text-[13px] text-stone-500 hover:text-stone-800 mb-6">
        ← All courses
      </button>
      <h1 className="text-[22px] font-semibold text-stone-800 mb-4">Code of Conduct</h1>
      <div className="prose prose-sm text-stone-600 mb-6">
        <p>Review our workplace expectations, anti-harassment policy, and reporting channels. You must acknowledge each section.</p>
      </div>
      <label className="flex items-center gap-2 text-[13px] text-stone-700 mb-4">
        <input type="checkbox" className="rounded border-stone-300" />
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
    <div className="px-8 py-8 max-w-3xl">
      <h1 className="text-[24px] font-semibold text-stone-800 mb-6">Performance reviews</h1>
      <div className="bg-white/70 rounded-xl border border-stone-200/40 divide-y divide-stone-100">
        {[
          { period: 'Q1 2026', status: 'Self-assessment due', due: 'Apr 15' },
          { period: 'Annual 2025', status: 'Completed', due: 'Jan 10' },
        ].map(r => (
          <button
            key={r.period}
            type="button"
            onClick={() => onNavigate('performance-review-detail')}
            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-stone-50/80"
          >
            <div>
              <p className="font-medium text-stone-800">{r.period}</p>
              <p className="text-[12px] text-stone-500 mt-0.5">{r.status} · {r.due}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </button>
        ))}
      </div>
    </div>
  );
}

function EmployeePerformanceReviewDetail({ onNavigate }: { onNavigate: (s: EmployeeScreen) => void }) {
  const { addToast } = useToast();
  return (
    <div className="px-8 py-8 max-w-2xl">
      <button type="button" onClick={() => onNavigate('performance-reviews')} className="text-[13px] text-stone-500 hover:text-stone-800 mb-6">
        ← Reviews
      </button>
      <h1 className="text-[22px] font-semibold text-stone-800 mb-2">Q1 2026 · Self-assessment</h1>
      <textarea className="w-full min-h-[160px] px-3 py-2 rounded-lg border border-stone-200 text-[13px] mb-4" placeholder="Summarize wins, blockers, and goals for next quarter…" />
      <BonsaiButton variant="primary" onClick={() => { addToast('Self-assessment submitted to your manager.', 'success'); onNavigate('performance-reviews'); }}>
        Submit
      </BonsaiButton>
    </div>
  );
}

function EmployeeMeetingsList({ onNavigate }: { onNavigate: (s: EmployeeScreen) => void }) {
  return (
    <div className="px-8 py-8 max-w-3xl">
      <h1 className="text-[24px] font-semibold text-stone-800 mb-6">Meetings</h1>
      <div className="space-y-2">
        {[
          { title: '1:1 with Sarah Chen', when: 'Thu, Apr 10 · 2:00 PM', link: true },
          { title: 'Design critique', when: 'Fri, Apr 11 · 11:00 AM', link: true },
        ].map(m => (
          <button
            key={m.title}
            type="button"
            onClick={() => onNavigate('meeting-detail')}
            className="w-full flex items-center justify-between p-4 bg-white/70 rounded-xl border border-stone-200/40 text-left hover:bg-white"
          >
            <div>
              <p className="font-medium text-stone-800">{m.title}</p>
              <p className="text-[12px] text-stone-500 mt-0.5">{m.when}</p>
            </div>
            {m.link ? <span className="text-[12px] text-indigo-600 font-medium">Join</span> : null}
          </button>
        ))}
      </div>
    </div>
  );
}

function EmployeeMeetingDetail({ onNavigate }: { onNavigate: (s: EmployeeScreen) => void }) {
  return (
    <div className="px-8 py-8 max-w-2xl">
      <button type="button" onClick={() => onNavigate('meetings')} className="text-[13px] text-stone-500 hover:text-stone-800 mb-6">
        ← Meetings
      </button>
      <h1 className="text-[22px] font-semibold text-stone-800 mb-2">1:1 with Sarah Chen</h1>
      <p className="text-[13px] text-stone-500 mb-6">Thu, Apr 10, 2026 · 2:00 PM · Google Meet</p>
      <BonsaiButton variant="primary" onClick={() => window.open('https://meet.google.com', '_blank')}>
        Open video link
      </BonsaiButton>
      <div className="mt-8 p-5 bg-white rounded-xl border border-stone-200/40">
        <p className="text-[12px] font-semibold text-stone-400 uppercase tracking-wider mb-2">Agenda</p>
        <ul className="text-[13px] text-stone-600 space-y-2 list-disc list-inside">
          <li>Project priorities</li>
          <li>Career growth</li>
        </ul>
      </div>
    </div>
  );
}

function EmployeeProfile({ onNavigate }: { onNavigate: (s: EmployeeScreen) => void }) {
  return (
    <div className="px-8 py-8 max-w-xl">
      <h1 className="text-[24px] font-semibold text-stone-800 mb-6">My profile</h1>
      <div className="space-y-4 bg-white rounded-xl border border-stone-200/40 p-6">
        <div>
          <p className="text-[11px] text-stone-400 uppercase tracking-wider mb-1">Legal name</p>
          <p className="text-[14px] font-medium text-stone-800">John Doe</p>
        </div>
        <div>
          <p className="text-[11px] text-stone-400 uppercase tracking-wider mb-1">Work email</p>
          <p className="text-[14px] font-medium text-stone-800">john.doe@company.com</p>
        </div>
        <div>
          <p className="text-[11px] text-stone-400 uppercase tracking-wider mb-1">Home address</p>
          <p className="text-[14px] text-stone-600">123 Market St, San Francisco, CA</p>
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
    <div className="px-8 py-8 max-w-xl">
      <button type="button" onClick={() => onNavigate('profile')} className="text-[13px] text-stone-500 hover:text-stone-800 mb-6">
        ← Profile
      </button>
      <h1 className="text-[22px] font-semibold text-stone-800 mb-2">Request profile change</h1>
      <p className="text-[13px] text-stone-500 mb-6">HR will review before updates apply. You will be notified.</p>
      <div className="space-y-4 bg-white rounded-xl border border-stone-200/40 p-6">
        <select className="w-full px-3 py-2 rounded-lg border border-stone-200 text-[13px]">
          <option>Home address</option>
          <option>Legal name</option>
          <option>Emergency contact</option>
        </select>
        <textarea className="w-full px-3 py-2 rounded-lg border border-stone-200 text-[13px] min-h-[100px]" placeholder="New value or details…" />
        <BonsaiButton variant="primary" onClick={() => { addToast('Request sent to HRIS queue.', 'success'); onNavigate('profile'); }}>
          Submit request
        </BonsaiButton>
      </div>
    </div>
  );
}

function EmployeeProjects() {
  return (
    <div className="px-8 py-8 max-w-3xl">
      <h1 className="text-[24px] font-semibold text-stone-800 tracking-[-0.02em] mb-6">My Projects</h1>
      <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-stone-200/40 divide-y divide-stone-100/60">
        {[
          { name: 'Website Redesign', role: 'Design lead', pm: 'Sarah Chen', hrs: '32h / week cap' },
          { name: 'Mobile App', role: 'IC contributor', pm: 'Alex Kim', hrs: '24h / week cap' },
        ].map(p => (
          <div key={p.name} className="px-5 py-4">
            <p className="text-[14px] font-semibold text-stone-800">{p.name}</p>
            <p className="text-[12px] text-stone-500 mt-1">{p.role} · PM: {p.pm}</p>
            <p className="text-[11px] text-stone-400 mt-2">{p.hrs}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmployeeTasks() {
  return (
    <div className="px-8 py-8 max-w-3xl">
      <h1 className="text-[24px] font-semibold text-stone-800 tracking-[-0.02em] mb-6">My Tasks</h1>
      <div className="space-y-2">
        {[
          { t: 'Hero concepts v2', proj: 'Website Redesign', due: 'Apr 6' },
          { t: 'Design QA — checkout', proj: 'Website Redesign', due: 'Apr 8' },
          { t: 'Icon set export', proj: 'Mobile App', due: 'Apr 9' },
        ].map(x => (
          <div key={x.t} className="bg-white/60 backdrop-blur-sm rounded-xl border border-stone-200/40 px-5 py-3 flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium text-stone-800">{x.t}</p>
              <p className="text-[11px] text-stone-400 mt-0.5">{x.proj} · Due {x.due}</p>
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
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-stone-800">My Timesheets</h1>
          <p className="text-sm text-stone-500 mt-1">Week of Mar 31 — Apr 6, 2026</p>
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
      <div className="bg-white rounded-xl border border-stone-200/40 overflow-hidden">
        <div className="grid grid-cols-[1fr_repeat(7,52px)_56px] gap-px bg-stone-200/60 text-[10px] font-semibold uppercase tracking-wider text-stone-500">
          <div className="bg-stone-50 px-3 py-2">Project</div>
          {days.map(d => (
            <div key={d} className="bg-stone-50 py-2 text-center">{d}</div>
          ))}
          <div className="bg-stone-50 py-2 text-center">Σ</div>
        </div>
        <div className="grid grid-cols-[1fr_repeat(7,52px)_56px] gap-px bg-stone-200/40 items-center">
          <div className="bg-white px-3 py-3 text-[13px] font-medium text-stone-800">Website Redesign</div>
          {row.map((h, i) => (
            <div key={i} className="bg-white py-3 text-center text-[12px] tabular-nums text-stone-700">{h || '—'}</div>
          ))}
          <div className="bg-white py-3 text-center text-[12px] font-semibold tabular-nums">{row.reduce((a, b) => a + b, 0)}</div>
        </div>
      </div>
      <p className="text-[12px] text-stone-400 mt-4">Approvals route to your manager and client portal when required.</p>
    </div>
  );
}

// EP-02: My Expenses
function EmployeeExpenses() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-stone-800">My Expenses</h1>
        <BonsaiButton variant="primary">Submit Expense</BonsaiButton>
      </div>

      <div className="bg-white rounded-lg border border-stone-200/40">
        <div className="divide-y divide-blue-100">
          {[
            { date: 'Jan 15, 2026', amount: 125.50, category: 'Travel', status: 'Pending' },
            { date: 'Jan 10, 2026', amount: 45.00, category: 'Meals', status: 'Approved' },
          ].map((expense, i) => (
            <div key={i} className="p-6 flex items-center justify-between">
              <div>
                <p className="font-medium text-stone-800">{expense.category} - ${expense.amount}</p>
                <p className="text-sm text-stone-500">{expense.date}</p>
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
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-stone-800">My Leave</h1>
        <BonsaiButton variant="primary">Request Leave</BonsaiButton>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-stone-200/40 p-4">
          <p className="text-sm text-stone-500 mb-1">Available Days</p>
          <p className="text-2xl font-semibold text-stone-800">15</p>
        </div>
        <div className="bg-white rounded-lg border border-stone-200/40 p-4">
          <p className="text-sm text-stone-500 mb-1">Used This Year</p>
          <p className="text-2xl font-semibold text-stone-800">10</p>
        </div>
        <div className="bg-white rounded-lg border border-stone-200/40 p-4">
          <p className="text-sm text-stone-500 mb-1">Pending Requests</p>
          <p className="text-2xl font-semibold text-stone-600">1</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-stone-200/40">
        <div className="divide-y divide-blue-100">
          {[
            { dates: 'Feb 10-14, 2026', days: 5, type: 'Vacation', status: 'Pending' },
            { dates: 'Dec 25-26, 2025', days: 2, type: 'Holiday', status: 'Approved' },
          ].map((leave, i) => (
            <div key={i} className="p-6 flex items-center justify-between">
              <div>
                <p className="font-medium text-stone-800">{leave.type} - {leave.days} days</p>
                <p className="text-sm text-stone-500">{leave.dates}</p>
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
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-stone-800 mb-6">My Documents</h1>

      <div className="bg-white rounded-lg border border-stone-200/40 p-6">
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

  return (
    <div className="flex h-screen">
      {/* Freelancer Portal Sidebar — Apple glass */}
      <div
        className="w-60 flex flex-col flex-shrink-0"
        style={{
          background: 'rgba(255,255,255,0.76)',
          backdropFilter: 'blur(44px) saturate(180%)',
          WebkitBackdropFilter: 'blur(44px) saturate(180%)',
          borderRight: '1px solid rgba(0,0,0,0.06)',
          boxShadow: '4px 0 24px rgba(0,0,0,0.03)',
        }}
      >
        <div className="px-5 py-5" style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(145deg, #b45309, #d97706)', boxShadow: '0 2px 6px rgba(217,119,6,0.3)' }}
            >
              <span className="text-white text-[9px] font-semibold">F</span>
            </div>
            <div>
              <p className="text-[13px] font-semibold text-stone-800 leading-tight tracking-[-0.01em]">Freelancer Portal</p>
              <p className="text-[11px] text-stone-400 leading-tight">Sarah Johnson</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-2.5 py-3 space-y-[2px] overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              currentScreen === item.id ||
              (currentScreen === 'self-bill-detail' && item.id === 'self-bills') ||
              (currentScreen === 'profile-change-request' && item.id === 'profile');
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id as FreelancerScreen)}
                className="relative w-full flex items-center gap-2.5 px-3 py-[7px] rounded-[10px] text-left transition-all"
                style={{ background: isActive ? 'rgba(28,25,23,0.07)' : 'transparent', color: isActive ? '#1c1917' : '#78716c' }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'rgba(28,25,23,0.04)'; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
              >
                {isActive && <motion.div layoutId="fl-nav" className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[16px] rounded-full bg-stone-800" transition={{ type:'spring', stiffness:450, damping:32 }} />}
                <Icon className="w-4 h-4 flex-shrink-0" style={{ strokeWidth: isActive ? 2.1 : 1.7 }} />
                <span className={`text-[13px] ${isActive ? 'font-semibold text-stone-800' : 'text-stone-500'}`}>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="px-3 py-3" style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}>
          <div className="flex items-center gap-2.5 px-3 py-2">
            <div className="w-7 h-7 rounded-full bg-stone-200 flex items-center justify-center text-[11px] font-semibold text-stone-600 flex-shrink-0">SJ</div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium text-stone-700 truncate">Sarah Johnson</p>
              <p className="text-[11px] text-stone-400 truncate">sarah.j@freelance.com</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto" style={{ background: '#F5F5F3' }}>
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
      </div>
    </div>
  );
}

function FreelancerHome({ onNavigate }: { onNavigate: (screen: FreelancerScreen) => void }) {
  return (
    <div className="px-8 py-8 max-w-4xl">
      <motion.div
        className="mb-8"
        initial={{ opacity:0, y:8 }}
        animate={{ opacity:1, y:0 }}
        transition={{ duration:0.3 }}
      >
        <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-[0.1em] mb-1">Freelancer Portal</p>
        <h1 className="text-[30px] font-semibold text-stone-800 tracking-[-0.03em]">Welcome back, Sarah.</h1>
      </motion.div>

      <motion.div
        className="grid grid-cols-3 gap-3 mb-6"
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
      >
        {[
          { label: 'Active Assignments', value: '2', sub: 'in progress' },
          { label: 'Tasks This Week',    value: '8', sub: 'assigned' },
          { label: 'Hours This Month',   value: '84', sub: 'logged' },
        ].map((kpi) => (
          <motion.div
            key={kpi.label}
            className="glass-stat p-4"
            variants={{ hidden: { opacity:0, y:12 }, show: { opacity:1, y:0, transition:{ type:'spring', stiffness:320, damping:28 } } }}
          >
            <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-[0.08em] mb-2">{kpi.label}</p>
            <p className="text-[32px] font-bold tracking-[-0.03em] leading-none shimmer-text text-stone-800">{kpi.value}</p>
            <p className="text-[11px] text-stone-400 mt-1.5">{kpi.sub}</p>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <button
          onClick={() => onNavigate('assignments')}
          className="glass-card p-5 text-left group hover-lift"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[13px] font-semibold text-stone-700">Current Assignments</h3>
            <span className="text-stone-300 group-hover:text-stone-500 transition-colors text-[14px]">→</span>
          </div>
          <div className="space-y-2">
            <div className="px-3 py-2.5 bg-stone-50/60 rounded-lg border border-stone-100/60">
              <p className="text-[12px] font-medium text-stone-700">Website Redesign</p>
              <p className="text-[11px] text-stone-400 mt-0.5">UI/UX Designer · Active</p>
            </div>
            <div className="px-3 py-2.5 bg-stone-50/60 rounded-lg border border-stone-100/60">
              <p className="text-[12px] font-medium text-stone-700">Mobile App Development</p>
              <p className="text-[11px] text-stone-400 mt-0.5">Senior Designer · Active</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => onNavigate('timesheets')}
          className="glass-card p-5 text-left hover-lift"
        >
          <h3 className="text-[13px] font-semibold text-stone-700 mb-4">Timesheet Status</h3>
          <div className="p-4 bg-stone-100/70 rounded-xl border border-stone-200/50">
            <p className="text-[13px] font-semibold text-stone-700">Week of Jan 13, 2026</p>
            <p className="text-[12px] text-stone-600 mt-0.5">Not submitted · 42 hours logged</p>
          </div>
        </button>

        <button type="button" onClick={() => onNavigate('self-bills')} className="glass-card p-5 text-left hover-lift">
          <h3 className="text-[13px] font-semibold text-stone-700 mb-2">Self-bills</h3>
          <p className="text-[12px] text-stone-500">March 2026 ready · $8,400</p>
        </button>

        <button type="button" onClick={() => onNavigate('onboarding')} className="glass-card p-5 text-left hover-lift">
          <h3 className="text-[13px] font-semibold text-stone-700 mb-2">Onboarding</h3>
          <p className="text-[12px] text-stone-500">W-9 & payment profile complete</p>
        </button>
      </div>
    </div>
  );
}

function FreelancerOnboarding({ onNavigate }: { onNavigate: (s: FreelancerScreen) => void }) {
  const { addToast } = useToast();
  return (
    <div className="px-8 py-8 max-w-xl">
      <h1 className="text-[24px] font-semibold text-stone-800 mb-6">Freelancer onboarding</h1>
      <div className="space-y-3">
        {[
          { l: 'W-9 submitted', ok: true },
          { l: 'Contract signed', ok: true },
          { l: 'Payment method (ACH)', ok: true },
          { l: 'NDA', ok: true },
        ].map(x => (
          <div key={x.l} className="flex items-center gap-3 p-4 bg-white/70 rounded-xl border border-stone-200/40">
            <span className="text-emerald-500 font-bold">✓</span>
            <span className="text-[14px] text-stone-800">{x.l}</span>
          </div>
        ))}
      </div>
      <BonsaiButton className="mt-6" variant="outline" onClick={() => addToast('Ops will confirm compliance within 24h.', 'info')}>
        Contact ops
      </BonsaiButton>
      <button type="button" className="block mt-4 text-[13px] text-amber-700" onClick={() => onNavigate('contract-docs')}>
        View contract PDFs →
      </button>
    </div>
  );
}

function FreelancerAssignments() {
  return (
    <div className="px-8 py-8 max-w-3xl">
      <h1 className="text-[24px] font-semibold text-stone-800 tracking-[-0.02em] mb-6">My Assignments</h1>
      <div className="space-y-3">
        {[
          { c: 'Acme Corp', r: 'Website Redesign', rate: '$95/hr', cap: '120h' },
          { c: 'Tech Startup Inc', r: 'Mobile App', rate: '$105/hr', cap: '80h' },
        ].map(a => (
          <div key={a.c} className="bg-white/60 backdrop-blur-sm rounded-xl border border-stone-200/40 p-5">
            <p className="text-[14px] font-semibold text-stone-800">{a.r}</p>
            <p className="text-[12px] text-stone-500 mt-1">{a.c}</p>
            <p className="text-[11px] text-stone-400 mt-3">{a.rate} · Cap {a.cap}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function FreelancerTasks() {
  return (
    <div className="px-8 py-8 max-w-3xl">
      <h1 className="text-[24px] font-semibold text-stone-800 tracking-[-0.02em] mb-6">My Tasks</h1>
      <div className="space-y-2">
        {['Design system tokens', 'Homepage mobile QA', 'Handoff documentation'].map(t => (
          <div key={t} className="bg-white/60 rounded-xl border border-stone-200/40 px-5 py-3 flex justify-between items-center">
            <span className="text-[13px] font-medium text-stone-800">{t}</span>
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
    <div className="px-8 py-8 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[24px] font-semibold text-stone-800">My Timesheets</h1>
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
      <div className="bg-white/70 rounded-xl border border-stone-200/40 p-6">
        <p className="text-[13px] text-stone-600 mb-4">Week of Mar 31 — Apr 6 · 42h across Acme + Tech Startup</p>
        <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
          <div className="h-full w-[85%] bg-amber-500 rounded-full" />
        </div>
        <p className="text-[11px] text-stone-400 mt-2">After approval, self-bill can generate automatically.</p>
      </div>
    </div>
  );
}

function FreelancerExpenses() {
  return (
    <div className="px-8 py-8 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[24px] font-semibold text-stone-800 tracking-[-0.02em]">My Expenses</h1>
        <BonsaiButton variant="primary">Submit Expense</BonsaiButton>
      </div>
      <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-stone-200/40 overflow-hidden divide-y divide-stone-100/60">
        {[
          { date: 'Jan 15, 2026', amount: 85.00, category: 'Software', status: 'Pending' },
          { date: 'Jan 12, 2026', amount: 42.50, category: 'Travel', status: 'Approved' },
        ].map((expense, i) => (
          <div key={i} className="px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-[14px] font-medium text-stone-800">{expense.category} — ${expense.amount}</p>
              <p className="text-[12px] text-stone-400 mt-0.5">{expense.date}</p>
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
    <div className="px-8 py-8 max-w-3xl">
      <h1 className="text-[24px] font-semibold text-stone-800 tracking-[-0.02em] mb-6">My Documents</h1>
      <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-stone-200/40 p-5">
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
    <div className="px-8 py-8 max-w-3xl">
      <h1 className="text-[24px] font-semibold text-stone-800 mb-2">Self-bills</h1>
      <p className="text-[13px] text-stone-500 mb-6">Generated from approved timesheets — download for taxes and records.</p>
      <div className="bg-white/70 rounded-xl border border-stone-200/40 divide-y divide-stone-100">
        {[
          { id: 'SB-2026-03', period: 'Mar 1–31, 2026', amt: '$8,400', st: 'Ready' },
          { id: 'SB-2026-02', period: 'Feb 1–28, 2026', amt: '$7,200', st: 'Paid' },
        ].map(b => (
          <button
            key={b.id}
            type="button"
            onClick={() => onNavigate('self-bill-detail')}
            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-stone-50/80"
          >
            <div>
              <p className="font-semibold text-stone-800">{b.id}</p>
              <p className="text-[12px] text-stone-500 mt-0.5">{b.period}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-stone-800">{b.amt}</p>
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
    <div className="px-8 py-8 max-w-2xl">
      <button type="button" onClick={() => onNavigate('self-bills')} className="text-[13px] text-stone-500 hover:text-stone-800 mb-6">
        ← Self-bills
      </button>
      <h1 className="text-[22px] font-semibold text-stone-800 mb-2">SB-2026-03</h1>
      <p className="text-[13px] text-stone-500 mb-6">Mar 1–31, 2026 · 88 billable hours</p>
      <div className="bg-white rounded-xl border border-stone-200/40 p-6 mb-6">
        <div className="flex justify-between text-[13px] mb-2">
          <span className="text-stone-500">Acme Corp</span>
          <span className="font-semibold">$4,800</span>
        </div>
        <div className="flex justify-between text-[13px] mb-4">
          <span className="text-stone-500">Tech Startup Inc</span>
          <span className="font-semibold">$3,600</span>
        </div>
        <div className="border-t border-stone-100 pt-4 flex justify-between font-semibold text-stone-800">
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
    <div className="px-8 py-8 max-w-3xl">
      <h1 className="text-[24px] font-semibold text-stone-800 mb-6">Contract documents</h1>
      <div className="bg-white/70 rounded-xl border border-stone-200/40 p-6 space-y-4">
        {[
          { n: 'Master services agreement — 2026', d: 'Jan 10, 2026' },
          { n: 'Statement of work — Website', d: 'Jan 12, 2026' },
          { n: 'NDA (mutual)', d: 'Nov 10, 2025' },
        ].map(f => (
          <div key={f.n} className="flex items-center justify-between py-2 border-b border-stone-100 last:border-0">
            <div>
              <p className="font-medium text-stone-800">{f.n}</p>
              <p className="text-[11px] text-stone-400">Signed {f.d}</p>
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
    <div className="px-8 py-8 max-w-xl">
      <h1 className="text-[24px] font-semibold text-stone-800 mb-6">Profile</h1>
      <div className="bg-white rounded-xl border border-stone-200/40 p-6 space-y-4">
        <div>
          <p className="text-[11px] text-stone-400 uppercase tracking-wider">Display name</p>
          <p className="text-[14px] font-medium text-stone-800">Sarah Johnson</p>
        </div>
        <div>
          <p className="text-[11px] text-stone-400 uppercase tracking-wider">Business email</p>
          <p className="text-[14px] text-stone-800">sarah.j@freelance.com</p>
        </div>
        <div>
          <p className="text-[11px] text-stone-400 uppercase tracking-wider">Tax entity</p>
          <p className="text-[14px] text-stone-800">S Johnson LLC</p>
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
    <div className="px-8 py-8 max-w-xl">
      <button type="button" onClick={() => onNavigate('profile')} className="text-[13px] text-stone-500 hover:text-stone-800 mb-6">
        ← Profile
      </button>
      <h1 className="text-[22px] font-semibold text-stone-800 mb-6">Request profile update</h1>
      <div className="bg-white rounded-xl border border-stone-200/40 p-6 space-y-4">
        <textarea className="w-full min-h-[120px] px-3 py-2 rounded-lg border border-stone-200 text-[13px]" placeholder="Describe the change (legal name, address, etc.)" />
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
      <div className="absolute inset-0 bg-stone-900/15 backdrop-blur-[8px]" onClick={onClose} />
      <div className="relative bg-white/85 backdrop-blur-2xl rounded-2xl shadow-[0_24px_80px_-12px_rgba(0,0,0,0.12)] border border-white/50 p-6 w-full max-w-sm">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />
        <h2 className="text-[16px] font-medium text-stone-800 mb-2">Confirm {action === 'approve' ? 'Approval' : 'Rejection'}</h2>
        <p className="text-[13px] text-stone-500 mb-6 leading-relaxed">Are you sure you want to {action === 'approve' ? 'approve' : 'reject'} this {type}?</p>
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

  return (
    <div className="max-w-4xl mx-auto px-8 py-10 min-h-screen" style={{ background: '#fafaf9' }}>
      <div className="mb-8">
        <h1 className="text-[24px] font-semibold text-stone-800 tracking-[-0.02em]">HRIS administration</h1>
        <p className="text-[13px] text-stone-500 mt-1">Profile change requests (GDPR) and document intake from employee portal</p>
      </div>

      <div className="flex gap-2 mb-8">
        <button
          type="button"
          onClick={() => onNavigate('profile-requests')}
          className={`px-3 py-1.5 text-[12px] rounded-md transition-all ${currentScreen === 'profile-requests' || currentScreen === 'profile-request-detail' ? 'bg-stone-800 text-white font-medium' : 'text-stone-500 hover:bg-stone-100'}`}
        >
          Profile requests
        </button>
        <button
          type="button"
          onClick={() => onNavigate('document-requests')}
          className={`px-3 py-1.5 text-[12px] rounded-md transition-all ${currentScreen === 'document-requests' ? 'bg-stone-800 text-white font-medium' : 'text-stone-500 hover:bg-stone-100'}`}
        >
          Document requests
        </button>
      </div>

      {currentScreen === 'profile-requests' && (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-stone-200/40 overflow-hidden divide-y divide-stone-100/60 shadow-sm">
          {requests.map(req => (
            <button
              key={req.id}
              type="button"
              onClick={() => onNavigate('profile-request-detail')}
              className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-stone-50/80 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-[14px] font-medium text-stone-800">{req.employee}</span>
                  <span className="text-[11px] text-stone-500 uppercase tracking-wide">{req.type}</span>
                </div>
                <div className="text-[12px] text-stone-400 mt-0.5">{req.field} · {req.submitted}</div>
              </div>
              <BonsaiStatusPill status={req.status === 'Pending' ? 'pending' : 'completed'} label={req.status} />
            </button>
          ))}
        </div>
      )}

      {currentScreen === 'profile-request-detail' && (
        <div>
          <button type="button" onClick={() => onNavigate('profile-requests')} className="text-[13px] text-stone-500 hover:text-stone-800 mb-6">
            ← All requests
          </button>
          <div className="bg-white rounded-xl border border-stone-200/40 p-6 shadow-sm mb-6">
            <h2 className="text-[18px] font-semibold text-stone-800 mb-1">Jane Smith — Legal name</h2>
            <p className="text-[12px] text-stone-500 mb-6">Submitted 2026-03-30 · Employee portal</p>
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-lg bg-red-50/50 border border-red-100">
                <p className="text-[10px] font-semibold text-red-800/80 uppercase tracking-wider mb-2">Current</p>
                <p className="text-[14px] text-stone-800">Jane Smith</p>
              </div>
              <div className="p-4 rounded-lg bg-emerald-50/50 border border-emerald-100">
                <p className="text-[10px] font-semibold text-emerald-800/80 uppercase tracking-wider mb-2">Requested</p>
                <p className="text-[14px] text-stone-800">Jane Smith-Lee</p>
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
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-stone-200/40 overflow-hidden divide-y divide-stone-100 shadow-sm">
          {docRequests.map(d => (
            <div key={d.id} className="px-5 py-4 flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-stone-800">{d.doc}</p>
                <p className="text-[12px] text-stone-500 mt-0.5">{d.employee} · {d.submitted}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
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
  );
}