import React, { useState } from 'react';
import { ModuleHeader, ModuleTab } from '@/app/components/ModuleHeader';
import { TasksTab } from './TasksTab';
import { RequestsTab } from './RequestsTab';
import { ApprovalsTab } from './ApprovalsTab';
import { IssuesTab } from './IssuesTab';
import { tasks as initialTasks, approvals as initialApprovals, issues as initialIssues } from './data';
import { requests as initialRequests } from './request-data';
import { Task, Approval, Issue } from './types';
import { Request } from './request-types';

type WorkTab = 'tasks' | 'requests' | 'issues' | 'approvals';

const workTabs: ModuleTab[] = [
  { id: 'tasks', label: 'Tasks' },
  { id: 'requests', label: 'Requests' },
  { id: 'issues', label: 'Issues' },
  { id: 'approvals', label: 'Approvals' },
];

export const WorkPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<WorkTab>('tasks');
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [requests, setRequests] = useState<Request[]>(initialRequests);
  const [approvals, setApprovals] = useState<Approval[]>(initialApprovals);
  const [issues, setIssues] = useState<Issue[]>(initialIssues);

  const handleTaskUpdate = (taskId: string, updates: Partial<Task>) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, ...updates } : task
      )
    );
  };

  const handleRequestUpdate = (requestId: string, updates: Partial<Request>) => {
    setRequests((prevRequests) =>
      prevRequests.map((request) =>
        request.id === requestId ? { ...request, ...updates } : request
      )
    );
  };

  const handleRequestCreate = (newRequest: Omit<Request, 'id'>) => {
    const request: Request = {
      ...newRequest,
      id: `req-${Date.now()}`,
    };
    setRequests((prev) => [request, ...prev]);
  };

  const handleApprovalUpdate = (approvalId: string, updates: Partial<Approval>) => {
    setApprovals((prevApprovals) =>
      prevApprovals.map((approval) =>
        approval.id === approvalId ? { ...approval, ...updates } : approval
      )
    );
  };

  const handleIssueUpdate = (issueId: string, updates: Partial<Issue>) => {
    setIssues((prevIssues) =>
      prevIssues.map((issue) =>
        issue.id === issueId ? { ...issue, ...updates } : issue
      )
    );
  };

  return (
    <div>
      <ModuleHeader
        title="Work"
        description="Manage tasks, requests, issues, and approvals across all projects"
        tabs={workTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="px-8 py-6">
        {activeTab === 'tasks' && (
          <TasksTab tasks={tasks} onTaskUpdate={handleTaskUpdate} />
        )}
        {activeTab === 'requests' && (
          <RequestsTab 
            requests={requests} 
            onRequestUpdate={handleRequestUpdate}
            onRequestCreate={handleRequestCreate}
          />
        )}
        {activeTab === 'issues' && (
          <IssuesTab issues={issues} onIssueUpdate={handleIssueUpdate} />
        )}
        {activeTab === 'approvals' && (
          <ApprovalsTab approvals={approvals} onApprovalUpdate={handleApprovalUpdate} />
        )}
      </div>
    </div>
  );
};