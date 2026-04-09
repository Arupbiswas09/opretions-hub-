import React from 'react';
import { cn } from '../ui/utils';

interface BonsaiPageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function BonsaiPageHeader({ title, subtitle, actions, className }: BonsaiPageHeaderProps) {
  return (
    <div className={cn('mb-4 flex flex-col gap-3 sm:mb-6 lg:flex-row lg:items-start lg:justify-between', className)}>
      <div className="min-w-0">
        <h1 className="text-xl font-semibold tracking-tight text-foreground lg:text-2xl">{title}</h1>
        {subtitle && <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{subtitle}</p>}
      </div>
      {actions && (
        <div className="flex flex-shrink-0 flex-wrap items-center gap-2 lg:justify-end">{actions}</div>
      )}
    </div>
  );
}
