'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PR01ProjectsList } from './projects/PR01ProjectsList';
import { PR02ProjectDrawer } from './projects/PR02ProjectDrawer';
import { PR06TimesheetsList } from './projects/PR06TimesheetsList';
import { PR07TimesheetDetail } from './projects/PR07TimesheetDetail';
import { PR08ApprovalsInbox } from './projects/PR08ApprovalsInbox';
import { PR09ApproveRejectTimesheet } from './projects/PR09ApproveRejectTimesheet';

type Screen = 'projects' | 'timesheets' | 'approvals' | 'timesheet-detail' | 'approval-detail' | 'client-portal' | 'freelancer-portal';

const SCREENS: { id: Screen; label: string }[] = [
  { id: 'projects', label: 'Projects' },
  { id: 'timesheets', label: 'Timesheets' },
  { id: 'approvals', label: 'Approvals' },
  { id: 'timesheet-detail', label: 'Sheet Detail' },
  { id: 'approval-detail', label: 'Review' },
];

export default function Projects({ initialScreen = 'projects', hideNav = false }: { initialScreen?: Screen; hideNav?: boolean }) {
  const [currentScreen, setCurrentScreen] = useState<Screen>(initialScreen);
  const [selectedTimesheet, setSelectedTimesheet] = useState<any>(null);
  const [selectedApproval, setSelectedApproval] = useState<any>(null);
  const [showProjectDrawer, setShowProjectDrawer] = useState(false);

  const handleTimesheetClick = (ts: any) => { setSelectedTimesheet(ts); setCurrentScreen('timesheet-detail'); };
  const handleApprovalClick = (a: any) => { setSelectedApproval(a); setCurrentScreen('approval-detail'); };

  return (
    <div className="min-h-full">
      {!hideNav && (
        <div className="px-8 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-1">
            {SCREENS.map((s) => (
              <button key={s.id} onClick={() => {
                if (s.id === 'timesheet-detail' && !selectedTimesheet) setSelectedTimesheet({ id: '1', weekOf: 'Jan 13, 2026', employee: 'John Doe', status: 'Draft' });
                if (s.id === 'approval-detail' && !selectedApproval) setSelectedApproval({ id: '1', employee: 'Sarah Johnson', weekOf: 'Jan 13, 2026', totalHours: 42, status: 'Submitted', submittedDate: 'Jan 17, 2026', requiresClientApproval: true });
                setCurrentScreen(s.id);
              }} className={`px-3 py-1.5 text-[12px] rounded-md transition-all duration-200 ${
                currentScreen === s.id
                  ? 'bg-stone-800 dark:bg-white/10 text-white dark:text-stone-100 font-medium'
                  : 'text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100/60 dark:hover:bg-white/[0.06]'
              }`}>{s.label}</button>
            ))}
            <div className="w-px h-3.5 bg-stone-200/60 dark:bg-white/10 mx-1.5" />
            <button onClick={() => setShowProjectDrawer(true)}
              className="px-3 py-1.5 text-[12px] rounded-md transition-colors
                         text-stone-400 dark:text-stone-500
                         hover:text-stone-600 dark:hover:text-stone-200
                         hover:bg-stone-100/60 dark:hover:bg-white/[0.06]">+ Project</button>
            {(['client-portal', 'freelancer-portal'] as const).map((id) => (
              <button key={id} onClick={() => setCurrentScreen(id)}
                className={`px-3 py-1.5 text-[12px] rounded-md transition-all duration-200 ${
                  currentScreen === id
                    ? 'bg-stone-800 dark:bg-white/10 text-white dark:text-stone-100 font-medium'
                    : 'text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100/60 dark:hover:bg-white/[0.06]'
                }`}>{id === 'client-portal' ? 'Client Portal' : 'Freelancer Portal'}</button>
            ))}
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div key={currentScreen} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}>
          {currentScreen === 'projects' && <PR01ProjectsList onProjectClick={() => {}} onCreateProject={() => setShowProjectDrawer(true)} />}
          {currentScreen === 'timesheets' && <PR06TimesheetsList onTimesheetClick={handleTimesheetClick} onCreateTimesheet={() => { setSelectedTimesheet({ id: 'new', weekOf: 'Jan 13, 2026', employee: 'John Doe', status: 'Draft' }); setCurrentScreen('timesheet-detail'); }} />}
          {currentScreen === 'timesheet-detail' && selectedTimesheet && <PR07TimesheetDetail timesheet={selectedTimesheet} onBack={() => setCurrentScreen('timesheets')} onSubmit={() => { if (selectedTimesheet) setSelectedTimesheet({ ...selectedTimesheet, status: 'Submitted' }); }} />}
          {currentScreen === 'approvals' && <PR08ApprovalsInbox onApprovalClick={handleApprovalClick} />}
          {currentScreen === 'approval-detail' && selectedApproval && <PR09ApproveRejectTimesheet timesheet={selectedApproval} onBack={() => setCurrentScreen('approvals')} onApprove={() => setCurrentScreen('approvals')} onReject={() => setCurrentScreen('approvals')} />}
          {currentScreen === 'client-portal' && <ClientPortalDemo />}
          {currentScreen === 'freelancer-portal' && <FreelancerPortalDemo />}
        </motion.div>
      </AnimatePresence>

      <PR02ProjectDrawer isOpen={showProjectDrawer} onClose={() => setShowProjectDrawer(false)} onSave={() => {}} />
    </div>
  );
}

function ClientPortalDemo() {
  const [view, setView] = useState<'projects' | 'approvals'>('projects');
  return (
    <div className="p-8">
      <div className="max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <span className="px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider rounded-md bg-stone-800 text-white">Client Portal</span>
          <h1 className="text-xl font-medium text-stone-800">Acme Corporation</h1>
        </div>
        <div className="flex items-center gap-1 mb-6">
          <button onClick={() => setView('projects')} className={`px-3 py-1.5 text-[12px] rounded-md transition-all ${view === 'projects' ? 'bg-stone-100 text-stone-800 font-medium' : 'text-stone-400 hover:text-stone-600'}`}>Projects</button>
          <button onClick={() => setView('approvals')} className={`px-3 py-1.5 text-[12px] rounded-md transition-all ${view === 'approvals' ? 'bg-stone-100 text-stone-800 font-medium' : 'text-stone-400 hover:text-stone-600'}`}>Pending Approvals (2)</button>
        </div>
        {view === 'projects' && (
          <div className="rounded-xl border border-stone-200/60 bg-white/50 backdrop-blur-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div><h3 className="text-[15px] font-medium text-stone-800">Website Redesign</h3><p className="text-[12px] text-stone-400 mt-0.5">Started Jan 5, 2026</p></div>
              <span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-stone-100 text-stone-700">In Progress</span>
            </div>
            <div className="mb-4">
              <div className="flex items-center justify-between text-[12px] mb-1.5"><span className="text-stone-400">Progress</span><span className="font-medium text-stone-700">65%</span></div>
              <div className="h-[3px] bg-stone-100 rounded-full overflow-hidden"><div className="h-full bg-stone-800 rounded-full" style={{ width: '65%' }} /></div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-[12px]">
              <div><p className="text-stone-400">Budget</p><p className="font-medium text-stone-700 mt-0.5">$45,000</p></div>
              <div><p className="text-stone-400">Hours</p><p className="font-medium text-stone-700 mt-0.5">190h</p></div>
              <div><p className="text-stone-400">Team</p><p className="font-medium text-stone-700 mt-0.5">5 members</p></div>
            </div>
          </div>
        )}
        {view === 'approvals' && (
          <div className="space-y-3">
            {['Sarah Johnson · 42 hrs · $6,300', 'Mike Chen · 38 hrs · $5,700'].map((text, i) => (
              <div key={i} className="rounded-xl border border-stone-200/60 bg-white/50 backdrop-blur-sm p-5 hover:bg-white/70 transition-colors cursor-pointer">
                <div className="flex items-start justify-between">
                  <div><p className="text-[13px] font-medium text-stone-800">Week of Jan {13 + i * 7}, 2026</p><p className="text-[12px] text-stone-400 mt-0.5">{text}</p></div>
                  <span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-stone-100 text-stone-600">Pending</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FreelancerPortalDemo() {
  return (
    <div className="p-8">
      <div className="max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <span className="px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider rounded-md bg-stone-800 text-white">Freelancer Portal</span>
          <h1 className="text-xl font-medium text-stone-800">Sarah Johnson</h1>
          <span className="text-[12px] text-stone-400">Senior Designer</span>
        </div>
        <div className="flex gap-8 mb-8">
          {[{ label: 'Active Projects', val: '2' }, { label: 'This Week', val: '42h' }, { label: 'Pending', val: '1' }].map((s) => (
            <div key={s.label}><p className="text-[11px] text-stone-400 uppercase tracking-widest mb-1">{s.label}</p><p className="text-[24px] font-light text-stone-800">{s.val}</p></div>
          ))}
        </div>
        <div className="space-y-3">
          {[{ title: 'Website Redesign', client: 'Acme Corporation · 65% complete', status: 'Active', color: 'bg-stone-100 text-stone-700' },
            { title: 'Mobile App Development', client: 'Tech Startup Inc · 10% complete', status: 'Planning', color: 'bg-stone-100 text-stone-600' }].map((p) => (
            <div key={p.title} className="rounded-xl border border-stone-200/60 bg-white/50 backdrop-blur-sm p-5 flex items-center justify-between hover:bg-white/70 transition-colors cursor-pointer">
              <div><p className="text-[13px] font-medium text-stone-800">{p.title}</p><p className="text-[12px] text-stone-400 mt-0.5">{p.client}</p></div>
              <span className={`px-2 py-0.5 text-[11px] font-medium rounded-full ${p.color}`}>{p.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
