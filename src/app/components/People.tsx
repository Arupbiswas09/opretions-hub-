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
import { ModuleSubNav, moduleSubNavButtonClass, ModuleSubNavDivider } from './ui/ModuleSubNav';
import { useHubDataInvalidation } from '../lib/hub/use-data-invalidation';
import { dispatchDataInvalidation } from '../lib/hub-events';
import { useToast } from './bonsai/ToastSystem';

type Screen = 'directory' | 'detail' | 'approvals';

export default function People({ initialScreen = 'directory', hideNav = false }: { initialScreen?: Screen; hideNav?: boolean }) {
  const refresh = useHubDataInvalidation('people', 'approvals', 'expenses', 'all');
  const { addToast } = useToast();
  const [currentScreen, setCurrentScreen] = useState<Screen>(initialScreen);
  const [selectedPerson, setSelectedPerson] = useState<any>(null);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showPersonDrawer, setShowPersonDrawer] = useState(false);
  const [showLeaveDrawer, setShowLeaveDrawer] = useState(false);
  const [showExpenseDrawer, setShowExpenseDrawer] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [personToEdit, setPersonToEdit] = useState<any>(null);

  const handlePersonClick = (person: any) => { setSelectedPerson(person); setCurrentScreen('detail'); };

  const handleSavePerson = async (person: any) => {
    try {
      const isEdit = !!personToEdit;
      const url = isEdit ? `/api/hub/people/${personToEdit.id}` : '/api/hub/people';
      const method = isEdit ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          full_name: `${person.firstName || ''} ${person.lastName || ''}`.trim() || person.name || 'Unnamed',
          email: person.email || null,
          phone: person.phone || null,
          department: person.department?.trim() || null,
          role: person.role?.trim() || null,
          employment_type: person.type || person.employmentType || null,
          status: 'active',
          start_date: person.startDate || null,
        }),
      });
      if (res.ok) {
        addToast(isEdit ? 'Person updated' : 'Person added', 'success');
        dispatchDataInvalidation('people');
        setShowPersonDrawer(false);
      } else {
        const json = await res.json();
        addToast(json.error || 'Failed to save', 'error');
      }
    } catch {
      addToast('Network error', 'error');
    }
  };

  const handleSubmitLeave = async (data: any) => {
    try {
      const res = await fetch('/api/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          type: 'leave',
          title: `Leave request: ${data?.leaveType || 'Vacation'}`,
          payload: {
            title: `Leave request: ${data?.leaveType || 'Vacation'}`,
            start_date: data?.startDate,
            end_date: data?.endDate,
            days: data?.days,
            leave_type: data?.leaveType,
            reason: data?.reason,
          },
        }),
      });
      if (res.ok) {
        addToast('Leave request submitted', 'success');
        dispatchDataInvalidation('approvals');
        setShowLeaveDrawer(false);
      } else {
        addToast('Failed to submit leave request', 'error');
      }
    } catch {
      addToast('Network error', 'error');
    }
  };

  const handleSubmitExpense = async (data: any) => {
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          description: data?.description || 'Expense claim',
          amount: data?.amount || '0',
          category: data?.category || 'Other',
          expense_date: data?.date || null,
          project_id: data?.projectId || null,
        }),
      });
      if (res.ok) {
        addToast('Expense claim submitted', 'success');
        dispatchDataInvalidation('expenses');
        setShowExpenseDrawer(false);
      } else {
        addToast('Failed to submit expense', 'error');
      }
    } catch {
      addToast('Network error', 'error');
    }
  };

  const handleApproveRequest = async () => {
    if (!selectedRequest?.id) return;
    try {
      const res = await fetch(`/api/approvals/${selectedRequest.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'approved' }),
      });
      if (res.ok) {
        addToast('Request approved', 'success');
        dispatchDataInvalidation('approvals');
        setShowApprovalModal(false);
      } else {
        addToast('Failed to approve', 'error');
      }
    } catch {
      addToast('Network error', 'error');
    }
  };

  const handleRejectRequest = async () => {
    if (!selectedRequest?.id) return;
    try {
      const res = await fetch(`/api/approvals/${selectedRequest.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'rejected' }),
      });
      if (res.ok) {
        addToast('Request rejected', 'success');
        dispatchDataInvalidation('approvals');
        setShowApprovalModal(false);
      } else {
        addToast('Failed to reject', 'error');
      }
    } catch {
      addToast('Network error', 'error');
    }
  };

  return (
    <div className="min-h-full">
      {!hideNav && (
        <ModuleSubNav>
          {([{ id: 'directory', label: 'Directory' }, { id: 'detail', label: 'Detail' }, { id: 'approvals', label: 'Approvals' }] as const).map((s) => (
            <button key={s.id} type="button" onClick={() => {
              if (s.id === 'detail' && !selectedPerson) setSelectedPerson({ id: '1', name: 'Sarah Johnson', type: 'Freelancer', role: 'Senior Designer', department: 'Design', status: 'Active', email: 'sarah.j@freelance.com', skills: ['UI Design', 'Illustration', 'Animation'], availability: 'Available', startDate: 'Nov 10, 2025' });
              setCurrentScreen(s.id);
            }} className={moduleSubNavButtonClass(currentScreen === s.id)}>{s.label}</button>
          ))}
          <ModuleSubNavDivider />
          {[
            { label: '+ Person', fn: () => { setPersonToEdit(null); setShowPersonDrawer(true); } },
            { label: 'Leave',    fn: () => setShowLeaveDrawer(true) },
            { label: 'Expense',  fn: () => setShowExpenseDrawer(true) },
            { label: 'Review',   fn: () => { setSelectedRequest({ id: '1', type: 'leave', employee: 'Sarah Johnson', submittedDate: 'Jan 15, 2026', status: 'Submitted', leaveType: 'Vacation', startDate: 'Feb 10, 2026', endDate: 'Feb 14, 2026', days: 5 }); setShowApprovalModal(true); } },
          ].map((btn) => (
            <button key={btn.label} type="button" onClick={btn.fn}
              className={moduleSubNavButtonClass(false)}>{btn.label}</button>
          ))}
        </ModuleSubNav>
      )}

      <AnimatePresence mode="wait">
        <motion.div key={currentScreen} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4, pointerEvents: 'none' }} transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}>
          {currentScreen === 'directory' && <PE01PeopleDirectory onPersonClick={handlePersonClick} onCreatePerson={() => { setPersonToEdit(null); setShowPersonDrawer(true); }} onBulkAction={() => {}} />}
          {currentScreen === 'detail' && selectedPerson && <PE03PersonDetail person={selectedPerson} onEdit={() => { setPersonToEdit(selectedPerson); setShowPersonDrawer(true); }} onRequestLeave={() => setShowLeaveDrawer(true)} onSubmitExpense={() => setShowExpenseDrawer(true)} />}
          {currentScreen === 'approvals' && <PE04ApprovalsInbox onRequestClick={(r) => { setSelectedRequest(r); setShowApprovalModal(true); }} />}
        </motion.div>
      </AnimatePresence>

      <PE02PersonDrawer isOpen={showPersonDrawer} onClose={() => setShowPersonDrawer(false)} onSave={handleSavePerson} initialPerson={personToEdit} />
      <PE05LeaveRequestDrawer isOpen={showLeaveDrawer} onClose={() => setShowLeaveDrawer(false)} onSubmit={handleSubmitLeave} />
      <PE06ExpenseClaimDrawer isOpen={showExpenseDrawer} onClose={() => setShowExpenseDrawer(false)} onSubmit={handleSubmitExpense} />
      <PE07ApproveRejectModal isOpen={showApprovalModal} onClose={() => setShowApprovalModal(false)} onApprove={handleApproveRequest} onReject={handleRejectRequest} request={selectedRequest} />
    </div>
  );
}
