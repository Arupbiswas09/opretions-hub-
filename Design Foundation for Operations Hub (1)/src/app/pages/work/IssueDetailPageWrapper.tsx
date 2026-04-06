import React, { useState } from 'react';
import { IssueDetailPage } from './IssueDetailPage';
import { issues as initialIssues } from './data';
import { Issue } from './types';

export const IssueDetailPageWrapper: React.FC = () => {
  const [issues, setIssues] = useState<Issue[]>(initialIssues);

  const handleIssueUpdate = (issueId: string, updates: Partial<Issue>) => {
    setIssues((prevIssues) =>
      prevIssues.map((issue) =>
        issue.id === issueId ? { ...issue, ...updates } : issue
      )
    );
  };

  return <IssueDetailPage issues={issues} onIssueUpdate={handleIssueUpdate} />;
};
