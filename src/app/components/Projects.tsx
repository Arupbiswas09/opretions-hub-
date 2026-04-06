'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PR01ProjectsList } from './projects/PR01ProjectsList';
import { PR02ProjectDrawer } from './projects/PR02ProjectDrawer';
import { PR03ProjectDetail } from './projects/PR03ProjectDetail';
import { PR06TimesheetsList } from './projects/PR06TimesheetsList';
import { PR07TimesheetDetail } from './projects/PR07TimesheetDetail';
import { PR08ApprovalsInbox } from './projects/PR08ApprovalsInbox';
import { PR09ApproveRejectTimesheet } from './projects/PR09ApproveRejectTimesheet';

type Screen = 'projects' | 'project-detail' | 'timesheets' | 'approvals' | 'timesheet-detail' | 'approval-detail';

export default function Projects({ initialScreen = 'projects', hideNav = false }: { initialScreen?: Screen; hideNav?: boolean }) {
  const [currentScreen, setCurrentScreen] = useState<Screen>(initialScreen);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [selectedTimesheet, setSelectedTimesheet] = useState<any>(null);
  const [selectedApproval, setSelectedApproval] = useState<any>(null);
  const [showProjectDrawer, setShowProjectDrawer] = useState(false);

  const handleProjectClick = (project: any) => { setSelectedProject(project); setCurrentScreen('project-detail'); };
  const handleTimesheetClick = (ts: any) => { setSelectedTimesheet(ts); setCurrentScreen('timesheet-detail'); };
  const handleApprovalClick = (a: any) => { setSelectedApproval(a); setCurrentScreen('approval-detail'); };

  return (
    <div className="min-h-full">
      <AnimatePresence mode="wait">
        <motion.div key={currentScreen}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}>

          {currentScreen === 'projects' && (
            <PR01ProjectsList
              onProjectClick={handleProjectClick}
              onCreateProject={() => setShowProjectDrawer(true)}
            />
          )}

          {currentScreen === 'project-detail' && (
            <PR03ProjectDetail
              project={selectedProject}
              onBack={() => setCurrentScreen('projects')}
            />
          )}

          {currentScreen === 'timesheets' && (
            <PR06TimesheetsList
              onTimesheetClick={handleTimesheetClick}
              onCreateTimesheet={() => {
                setSelectedTimesheet({ id: 'new', weekOf: 'Jan 13, 2026', employee: 'John Doe', status: 'Draft' });
                setCurrentScreen('timesheet-detail');
              }}
            />
          )}

          {currentScreen === 'timesheet-detail' && selectedTimesheet && (
            <PR07TimesheetDetail
              timesheet={selectedTimesheet}
              onBack={() => setCurrentScreen('timesheets')}
              onSubmit={() => {
                if (selectedTimesheet) setSelectedTimesheet({ ...selectedTimesheet, status: 'Submitted' });
              }}
            />
          )}

          {currentScreen === 'approvals' && (
            <PR08ApprovalsInbox onApprovalClick={handleApprovalClick} />
          )}

          {currentScreen === 'approval-detail' && selectedApproval && (
            <PR09ApproveRejectTimesheet
              timesheet={selectedApproval}
              onBack={() => setCurrentScreen('approvals')}
              onApprove={() => setCurrentScreen('approvals')}
              onReject={() => setCurrentScreen('approvals')}
            />
          )}

        </motion.div>
      </AnimatePresence>

      <PR02ProjectDrawer
        isOpen={showProjectDrawer}
        onClose={() => setShowProjectDrawer(false)}
        onSave={() => {}}
      />
    </div>
  );
}
