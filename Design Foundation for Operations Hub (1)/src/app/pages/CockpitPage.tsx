import React, { useState } from 'react';
import { ModuleHeader, ModuleTab } from '@/app/components/ModuleHeader';
import { MyWork } from './cockpit/MyWork';
import { AiInbox } from './cockpit/AiInbox';
import { TodaysCalendar } from './cockpit/TodaysCalendar';
import { QuickCapture } from './cockpit/QuickCapture';
import { TaskDrawer } from './cockpit/TaskDrawer';
import { MeetingDrawer } from './cockpit/MeetingDrawer';
import { AiDetailModal } from './cockpit/AiDetailModal';
import { tasks, aiInsights, todaysMeetings, Task, AiInsight, Meeting } from './cockpit/data';
import { toast } from 'sonner';
import { ListTodo, Sparkles, Calendar, Zap } from 'lucide-react';

type CockpitSection = 'my-work' | 'ai-inbox' | 'calendar' | 'quick-capture';

const sections: ModuleTab[] = [
  { id: 'my-work' as CockpitSection, label: 'My Work', icon: ListTodo },
  { id: 'ai-inbox' as CockpitSection, label: 'AI Inbox', icon: Sparkles },
  { id: 'calendar' as CockpitSection, label: 'Calendar', icon: Calendar },
  { id: 'quick-capture' as CockpitSection, label: 'Quick Capture', icon: Zap },
];

export const CockpitPage = () => {
  const [activeSection, setActiveSection] = useState<CockpitSection>('my-work');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [selectedInsight, setSelectedInsight] = useState<AiInsight | null>(null);
  const [taskDrawerOpen, setTaskDrawerOpen] = useState(false);
  const [meetingDrawerOpen, setMeetingDrawerOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setTaskDrawerOpen(true);
  };

  const handleMeetingClick = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setMeetingDrawerOpen(true);
  };

  const handleInsightClick = (insight: AiInsight) => {
    setSelectedInsight(insight);
    setAiModalOpen(true);
  };

  const handleTaskComplete = (taskId: string) => {
    toast.success('Task marked as complete');
  };

  const handleInsightAccept = (insightId: string) => {
    const insight = aiInsights.find((i) => i.id === insightId);
    if (insight) {
      setSelectedInsight(insight);
      setAiModalOpen(true);
    }
  };

  const handleInsightSnooze = (insightId: string) => {
    toast.success('Insight snoozed for 24 hours');
  };

  const handleInsightDismiss = (insightId: string) => {
    toast.success('Insight dismissed');
  };

  const handleQuickCapture = (text: string, type: 'task' | 'note' | 'issue') => {
    toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} captured`);
  };

  const handleCreateTask = () => {
    toast.success('Task created successfully');
    setAiModalOpen(false);
  };

  return (
    <div>
      <ModuleHeader
        title="Cockpit"
        tabs={sections}
        activeTab={activeSection}
        onTabChange={setActiveSection}
      />
      
      {/* Section Content */}
      <div className="px-8 py-6 max-w-7xl">
        {activeSection === 'my-work' && (
          <MyWork
            tasks={tasks}
            onTaskClick={handleTaskClick}
            onTaskComplete={handleTaskComplete}
          />
        )}

        {activeSection === 'ai-inbox' && (
          <AiInbox
            insights={aiInsights}
            onInsightClick={handleInsightClick}
            onAccept={handleInsightAccept}
            onSnooze={handleInsightSnooze}
            onDismiss={handleInsightDismiss}
          />
        )}

        {activeSection === 'calendar' && (
          <TodaysCalendar meetings={todaysMeetings} onMeetingClick={handleMeetingClick} />
        )}

        {activeSection === 'quick-capture' && (
          <QuickCapture onCapture={handleQuickCapture} />
        )}
      </div>

      {/* Drawers and Modals */}
      <TaskDrawer task={selectedTask} open={taskDrawerOpen} onClose={() => setTaskDrawerOpen(false)} />
      <MeetingDrawer
        meeting={selectedMeeting}
        open={meetingDrawerOpen}
        onClose={() => setMeetingDrawerOpen(false)}
      />
      <AiDetailModal
        insight={selectedInsight}
        open={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        onCreateTask={handleCreateTask}
      />
    </div>
  );
};