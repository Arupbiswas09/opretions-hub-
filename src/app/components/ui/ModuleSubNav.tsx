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
    'px-3 py-1.5 text-[12px] rounded-md transition-all duration-200',
    active
      ? 'bg-stone-800 dark:bg-white/10 text-white dark:text-stone-100 font-medium'
      : 'text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100/60 dark:hover:bg-white/[0.06]',
  );
}

export function ModuleSubNavDivider() {
  return <div className="w-px h-3.5 bg-stone-200/60 dark:bg-white/10 mx-1.5" />;
}
