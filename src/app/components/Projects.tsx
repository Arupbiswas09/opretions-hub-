'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useHubDataInvalidation } from '../lib/hub/use-data-invalidation';
import { dispatchDataInvalidation } from '../lib/hub-events';
import { useToast } from './bonsai/ToastSystem';
import { PR01ProjectsList } from './projects/PR01ProjectsList';
import { PR02ProjectDrawer } from './projects/PR02ProjectDrawer';
import { PR03ProjectDetail } from './projects/PR03ProjectDetail';
import { PR06TimesheetsList } from './projects/PR06TimesheetsList';
import { PR07TimesheetDetail } from './projects/PR07TimesheetDetail';
import { PR08ApprovalsInbox } from './projects/PR08ApprovalsInbox';
import { PR09ApproveRejectTimesheet } from './projects/PR09ApproveRejectTimesheet';

type Screen = 'list' | 'detail' | 'timesheets' | 'timesheetDetail' | 'approvals' | 'approvalReview';

interface ProjectsProps {
  initialScreen?: string;
  hideNav?: boolean;
}

export default function Projects({ initialScreen, hideNav }: ProjectsProps) {
  const listRefresh = useHubDataInvalidation('projects', 'all');
  const { addToast } = useToast();

  // Map page-route initialScreen props to internal screen state
  const getInitialScreen = (): Screen => {
    if (initialScreen === 'timesheets') return 'timesheets';
    if (initialScreen === 'approvals') return 'approvals';
    return 'list';
  };

  const [currentScreen, setCurrentScreen] = useState<Screen>(getInitialScreen());
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [showProjectDrawer, setShowProjectDrawer] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<any>(null);
  const [selectedTimesheet, setSelectedTimesheet] = useState<any>(null);
  const [selectedApproval, setSelectedApproval] = useState<any>(null);

  const handleProjectClick = (project: any) => {
    setSelectedProject(project);
    setCurrentScreen('detail');
  };

  const handleCreateProject = () => {
    setProjectToEdit(null);
    setShowProjectDrawer(true);
  };

  const handleSaveProject = async (data: any) => {
    try {
      const isEdit = !!projectToEdit;
      const url = isEdit ? `/api/projects/${projectToEdit.id}` : '/api/projects';
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: data?.name || 'Untitled Project',
          client_id: data?.client_id || null,
          description: data?.description || null,
          status: data?.status || 'active',
          start_date: data?.start_date || null,
          end_date: data?.end_date || null,
          budget_hours: data?.budget_hours || null,
        }),
      });
      if (res.ok) {
        addToast(isEdit ? 'Project updated' : 'Project created', 'success');
        dispatchDataInvalidation('projects');
        setShowProjectDrawer(false);
      } else {
        const json = await res.json();
        addToast(json.error || 'Failed to save project', 'error');
      }
    } catch {
      addToast('Network error', 'error');
    }
  };

  const handleTimesheetClick = (timesheet: any) => {
    setSelectedTimesheet(timesheet);
    setCurrentScreen('timesheetDetail');
  };

  const handleApprovalClick = (approval: any) => {
    setSelectedApproval(approval);
    setCurrentScreen('approvalReview');
  };

  const handleTimesheetSubmit = async () => {
    if (!selectedTimesheet) return;
    try {
      const res = await fetch(`/api/timesheets/${selectedTimesheet.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'submitted', submitted_at: new Date().toISOString() }),
      });
      if (res.ok) {
        addToast('Timesheet submitted', 'success');
        dispatchDataInvalidation('timesheets');
        setCurrentScreen('timesheets');
      } else {
        addToast('Failed to submit timesheet', 'error');
      }
    } catch {
      addToast('Network error', 'error');
    }
  };

  const handleApproveTimesheet = async (comment: string) => {
    if (!selectedApproval) return;
    try {
      const res = await fetch(`/api/timesheets/${selectedApproval.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'approved' }),
      });
      if (res.ok) {
        addToast('Timesheet approved', 'success');
        dispatchDataInvalidation('timesheets');
        setCurrentScreen('approvals');
      } else {
        addToast('Failed to approve', 'error');
      }
    } catch {
      addToast('Network error', 'error');
    }
  };

  const handleRejectTimesheet = async (reason: string) => {
    if (!selectedApproval) return;
    try {
      const res = await fetch(`/api/timesheets/${selectedApproval.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'rejected' }),
      });
      if (res.ok) {
        addToast('Timesheet rejected', 'success');
        dispatchDataInvalidation('timesheets');
        setCurrentScreen('approvals');
      } else {
        addToast('Failed to reject', 'error');
      }
    } catch {
      addToast('Network error', 'error');
    }
  };

  const handleCreateTimesheet = () => {
    // Navigate to time tracking to create entries
    addToast('Use Time Tracking to log hours — timesheets are created automatically', 'info');
  };

  return (
    <div className="min-h-full">
      {/* ── Breadcrumb (only when not using ModuleSubNav from layout) ── */}
      {!hideNav && (
        <div className="flex items-center gap-1 px-3 py-2 sm:px-5 overflow-x-auto"
          style={{ borderBottom: '1px solid var(--border)' }}>
          {[
            { screen: 'list' as Screen, label: 'Projects' },
            { screen: 'timesheets' as Screen, label: 'Timesheets' },
            { screen: 'approvals' as Screen, label: 'Approvals' },
          ].map(nav => (
            <button
              key={nav.screen}
              onClick={() => setCurrentScreen(nav.screen)}
              className="shrink-0 px-2.5 py-1 text-[11px] font-medium rounded-md transition-all"
              style={{
                background: currentScreen === nav.screen || (nav.screen === 'list' && currentScreen === 'detail')
                  ? 'rgba(37,99,235,0.10)' : 'transparent',
                color: currentScreen === nav.screen || (nav.screen === 'list' && currentScreen === 'detail')
                  ? 'var(--primary)' : 'var(--muted-foreground)',
                border: currentScreen === nav.screen || (nav.screen === 'list' && currentScreen === 'detail')
                  ? '1px solid rgba(37,99,235,0.20)' : '1px solid transparent',
              }}>
              {nav.label}
            </button>
          ))}
          {selectedProject && currentScreen === 'detail' && (
            <>
              <span className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>›</span>
              <span className="shrink-0 px-2.5 py-1 text-[11px] font-medium rounded-md truncate max-w-[200px]"
                style={{ background: 'rgba(37,99,235,0.10)', color: 'var(--primary)', border: '1px solid rgba(37,99,235,0.20)' }}>
                {selectedProject.name}
              </span>
            </>
          )}
        </div>
      )}

      {/* ── Screen content ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScreen}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4, pointerEvents: 'none' }}
          transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}>

          {currentScreen === 'list' && (
            <PR01ProjectsList
              dataRefreshVersion={listRefresh}
              onProjectClick={handleProjectClick}
              onCreateProject={handleCreateProject}
            />
          )}

          {currentScreen === 'detail' && selectedProject && (
            <PR03ProjectDetail
              project={selectedProject}
              onBack={() => setCurrentScreen('list')}
            />
          )}

          {currentScreen === 'timesheets' && (
            <PR06TimesheetsList
              onTimesheetClick={handleTimesheetClick}
              onCreateTimesheet={handleCreateTimesheet}
            />
          )}

          {currentScreen === 'timesheetDetail' && selectedTimesheet && (
            <PR07TimesheetDetail
              timesheet={selectedTimesheet}
              onBack={() => setCurrentScreen('timesheets')}
              onSubmit={handleTimesheetSubmit}
            />
          )}

          {currentScreen === 'approvals' && (
            <PR08ApprovalsInbox onApprovalClick={handleApprovalClick} />
          )}

          {currentScreen === 'approvalReview' && selectedApproval && (
            <PR09ApproveRejectTimesheet
              timesheet={selectedApproval}
              onBack={() => setCurrentScreen('approvals')}
              onApprove={handleApproveTimesheet}
              onReject={handleRejectTimesheet}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* ── Project Drawer ── */}
      <PR02ProjectDrawer
        isOpen={showProjectDrawer}
        onClose={() => setShowProjectDrawer(false)}
        onSave={handleSaveProject}
        initialProject={projectToEdit}
      />
    </div>
  );
}
