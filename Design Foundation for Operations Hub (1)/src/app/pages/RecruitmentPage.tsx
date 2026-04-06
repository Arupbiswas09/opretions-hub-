import React, { useState } from 'react';
import { ModuleHeader, ModuleTab } from '@/app/components/ModuleHeader';
import { Button } from '@/app/components/ui/button';
import { Plus } from 'lucide-react';
import { jobs as initialJobs } from './recruitment/data';
import { JobsListView } from './recruitment/JobsListView';
import { EmptyJobsState } from './recruitment/EmptyJobsState';
import { toast } from 'sonner';

type RecruitmentTab = 'jobs' | 'candidates';

const recruitmentTabs: ModuleTab[] = [
  { id: 'jobs', label: 'Jobs' },
  { id: 'candidates', label: 'Candidates' },
];

export const RecruitmentPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<RecruitmentTab>('jobs');
  const [jobs] = useState(initialJobs);

  const handleCreateJob = () => {
    toast.success('Job creation form would open here');
  };

  const handleCreateCandidate = () => {
    toast.success('Candidate creation form would open here');
  };

  return (
    <div className="h-full flex flex-col">
      <ModuleHeader
        title="Recruitment"
        description="Manage job requirements, candidates, and hiring pipelines"
        tabs={recruitmentTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        actions={
          <Button onClick={activeTab === 'jobs' ? handleCreateJob : handleCreateCandidate}>
            <Plus className="h-4 w-4 mr-2" />
            {activeTab === 'jobs' ? 'New Job Requirement' : 'Add Candidate'}
          </Button>
        }
      />

      <div className="flex-1 overflow-auto bg-surface">
        <div className="px-8 py-6">
          {activeTab === 'jobs' && (
            jobs.length === 0 ? (
              <EmptyJobsState onCreateJob={handleCreateJob} />
            ) : (
              <JobsListView jobs={jobs} />
            )
          )}
          {activeTab === 'candidates' && (
            <div className="text-center py-12 text-muted-foreground">
              <p>Candidates view coming soon</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
