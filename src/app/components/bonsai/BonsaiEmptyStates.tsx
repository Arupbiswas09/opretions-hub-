import React from 'react';
import { Inbox, FileX, Lock } from 'lucide-react';
import { cn } from '../ui/utils';

interface BonsaiEmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function BonsaiEmptyState({ icon, title, description, action, className }: BonsaiEmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 px-4 text-center", className)}>
      <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mb-4">
        {icon || <Inbox className="w-8 h-8 text-stone-400" />}
      </div>
      
      <h3 className="text-lg font-semibold text-stone-800 mb-2">{title}</h3>
      {description && <p className="text-sm text-stone-600 max-w-sm mb-6">{description}</p>}
      
      {action && <div>{action}</div>}
    </div>
  );
}

interface BonsaiPermissionDeniedProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function BonsaiPermissionDenied({
  title = 'Access Denied',
  description = "You don't have permission to view this content. Please contact your administrator if you believe this is an error.",
  action,
  className,
}: BonsaiPermissionDeniedProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 px-4 text-center", className)}>
      <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
        <Lock className="w-8 h-8 text-destructive" />
      </div>
      
      <h3 className="text-lg font-semibold text-stone-800 mb-2">{title}</h3>
      <p className="text-sm text-stone-600 max-w-sm mb-6">{description}</p>
      
      {action && <div>{action}</div>}
    </div>
  );
}
