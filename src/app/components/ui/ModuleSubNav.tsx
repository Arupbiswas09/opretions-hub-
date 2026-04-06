'use client';

import React from 'react';
import { cn } from './utils';

export function ModuleSubNav({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('px-8 py-3', className)} style={{ borderBottom: '1px solid var(--border)' }}>
      <div className="flex items-center gap-1 flex-wrap">{children}</div>
    </div>
  );
}

export function moduleSubNavButtonClass(active: boolean): string {
  return cn(
    'px-3 py-1.5 text-[12px] rounded-md transition-all duration-200 border border-transparent',
    active
      ? 'bg-primary/12 text-primary font-medium border-primary/20 shadow-sm dark:bg-white/10 dark:text-foreground dark:border-white/[0.12] dark:shadow-none'
      : 'text-muted-foreground hover:text-foreground hover:bg-secondary hover:border-border/80 dark:hover:bg-white/[0.06] dark:hover:border-transparent',
  );
}

export function ModuleSubNavDivider() {
  return <div className="w-px h-3.5 bg-border mx-1.5" />;
}
