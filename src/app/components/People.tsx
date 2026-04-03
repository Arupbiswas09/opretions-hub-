'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PE01PeopleDirectory } from './people/PE01PeopleDirectory';
import { PE02PersonDrawer } from './people/PE02PersonDrawer';
import { PE03PersonDetail } from './people/PE03PersonDetail';
import { PE04ApprovalsInbox } from './people/PE04ApprovalsInbox';
import { PE05LeaveRequestDrawer } from './people/PE05LeaveRequestDrawer';
import { PE06ExpenseClaimDrawer } from './people/PE06ExpenseClaimDrawer';
import { PE07ApproveRejectModal } from './people/PE07ApproveRejectModal';

type Screen = 'directory' | 'detail' | 'approvals';

export default function People({ initialScreen = 'directory', hideNav = false }: { initialScreen?: Screen; hideNav?: boolean }) {
  const [currentScreen, setCurrentScreen] = useState<Screen>(initialScreen);
  const [selectedPerson, setSelectedPerson] = useState<any>(null);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showPersonDrawer, setShowPersonDrawer] = useState(false);
  const [showLeaveDrawer, setShowLeaveDrawer] = useState(false);
  const [showExpenseDrawer, setShowExpenseDrawer] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [personToEdit, setPersonToEdit] = useState<any>(null);

  const handlePersonClick = (person: any) => { setSelectedPerson(person); setCurrentScreen('detail'); };

  return (
    <div className="min-h-full">
      {!hideNav && <div className="px-8 py-3 border-b border-stone-100/60">
        <div className="flex items-center gap-1">
          {([{ id: 'directory', label: 'Directory' }, { id: 'detail', label: 'Detail' }, { id: 'approvals', label: 'Approvals' }] as const).map((s) => (
            <button key={s.id} onClick={() => {
              if (s.id === 'detail' && !selectedPerson) setSelectedPerson({ id: '1', name: 'Sarah Johnson', type: 'Freelancer', role: 'Senior Designer', department: 'Design', status: 'Active', email: 'sarah.j@freelance.com', skills: ['UI Design', 'Illustration', 'Animation'], availability: 'Available', startDate: 'Nov 10, 2025' });
              setCurrentScreen(s.id);
            }} className={`px-3 py-1.5 text-[12px] rounded-md transition-all duration-200 ${currentScreen === s.id ? 'bg-stone-800 text-white font-medium shadow-sm' : 'text-stone-400 hover:text-stone-600 hover:bg-stone-50'}`}>{s.label}</button>
          ))}
          <div className="w-px h-3.5 bg-stone-200/60 mx-1.5" />
          <button onClick={() => setShowPersonDrawer(true)} className="px-3 py-1.5 text-[12px] text-stone-400 hover:text-stone-600 hover:bg-stone-50 rounded-md transition-colors">+ Person</button>
          <button onClick={() => setShowLeaveDrawer(true)} className="px-3 py-1.5 text-[12px] text-stone-400 hover:text-stone-600 hover:bg-stone-50 rounded-md transition-colors">Leave</button>
          <button onClick={() => setShowExpenseDrawer(true)} className="px-3 py-1.5 text-[12px] text-stone-400 hover:text-stone-600 hover:bg-stone-50 rounded-md transition-colors">Expense</button>
          <button onClick={() => { setSelectedRequest({ id: '1', type: 'leave', employee: 'Sarah Johnson', submittedDate: 'Jan 15, 2026', status: 'Submitted', leaveType: 'Vacation', startDate: 'Feb 10, 2026', endDate: 'Feb 14, 2026', days: 5 }); setShowApprovalModal(true); }} className="px-3 py-1.5 text-[12px] text-stone-400 hover:text-stone-600 hover:bg-stone-50 rounded-md transition-colors">Review</button>
        </div>
      </div>}

      <AnimatePresence mode="wait">
        <motion.div key={currentScreen} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}>
          {currentScreen === 'directory' && <PE01PeopleDirectory onPersonClick={handlePersonClick} onCreatePerson={() => { setPersonToEdit(null); setShowPersonDrawer(true); }} onBulkAction={() => {}} />}
          {currentScreen === 'detail' && selectedPerson && <PE03PersonDetail person={selectedPerson} onEdit={() => { setPersonToEdit(selectedPerson); setShowPersonDrawer(true); }} onRequestLeave={() => setShowLeaveDrawer(true)} onSubmitExpense={() => setShowExpenseDrawer(true)} />}
          {currentScreen === 'approvals' && <PE04ApprovalsInbox onRequestClick={(r) => { setSelectedRequest(r); setShowApprovalModal(true); }} />}
        </motion.div>
      </AnimatePresence>

      <PE02PersonDrawer isOpen={showPersonDrawer} onClose={() => setShowPersonDrawer(false)} onSave={() => {}} initialPerson={personToEdit} />
      <PE05LeaveRequestDrawer isOpen={showLeaveDrawer} onClose={() => setShowLeaveDrawer(false)} onSubmit={() => {}} />
      <PE06ExpenseClaimDrawer isOpen={showExpenseDrawer} onClose={() => setShowExpenseDrawer(false)} onSubmit={() => {}} />
      <PE07ApproveRejectModal isOpen={showApprovalModal} onClose={() => setShowApprovalModal(false)} onApprove={() => setShowApprovalModal(false)} onReject={() => setShowApprovalModal(false)} request={selectedRequest} />
    </div>
  );
}
