import React from 'react';
import { Card } from '@/app/components/ui/card';
import { InboxIcon } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
}

export const EmptyState = ({ 
  title = 'Module screen coming next',
  description = 'This placeholder will be replaced with the detailed module implementation.',
  icon
}: EmptyStateProps) => {
  return (
    <Card className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <div className="mb-4 text-muted-foreground">
        {icon || <InboxIcon className="w-12 h-12" />}
      </div>
      <h3 className="mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md">{description}</p>
    </Card>
  );
};
