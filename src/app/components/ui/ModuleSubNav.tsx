'use client';

import React from 'react';
import { cn } from './utils';

export function ModuleSubNav({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn('px-2 py-2 sm:px-5 sm:py-3 lg:px-8', className)}
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      <div className="flex min-w-0 flex-nowrap items-center gap-0.5 overflow-x-auto pb-0.5 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-1">
        {children}
      </div>
    </div>
  );
}

export function moduleSubNavButtonClass(active: boolean): string {
  return cn(
    'shrink-0 px-2.5 py-1.5 text-[11px] rounded-md transition-all duration-200 border border-transparent sm:px-3 sm:text-[12px]',
    active
      ? 'bg-primary/12 text-primary font-medium border-primary/20 shadow-sm dark:bg-white/10 dark:text-foreground dark:border-white/[0.12] dark:shadow-none'
      : 'text-muted-foreground hover:text-foreground hover:bg-secondary hover:border-border/80 dark:hover:bg-white/[0.06] dark:hover:border-transparent',
  );
}

export function ModuleSubNavDivider() {
  return <div className="w-px h-3.5 bg-border mx-1.5" />;
}
