import React from 'react';
import { Briefcase } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

interface EmptyJobsStateProps {
  onCreateJob: () => void;
}

export const EmptyJobsState: React.FC<EmptyJobsStateProps> = ({ onCreateJob }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Briefcase className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No job requirements yet</h3>
      <p className="text-muted-foreground text-sm mb-6 text-center max-w-md">
        Start managing your recruitment pipeline by creating your first job requirement.
      </p>
      <Button onClick={onCreateJob}>
        <Briefcase className="w-4 h-4 mr-2" />
        Create First Job Requirement
      </Button>
    </div>
  );
};
