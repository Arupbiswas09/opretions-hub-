'use client';

import React from 'react';
import { cn } from '../ui/utils';

/** Outer shell: tighter vertical rhythm; pair with `hub-page-container` for width cap */
export const dashboardFoldRootClass =
  'hub-page-container w-full min-w-0 flex flex-col gap-2.5 py-2 sm:gap-3 sm:py-4 lg:gap-4';

/** Looser rhythm + more negative space (main home dashboard) */
export const dashboardFoldRootRelaxedClass =
  'hub-page-container w-full min-w-0 flex flex-col gap-3 py-3 sm:gap-5 sm:py-6 lg:gap-6';

/**
 * Bounded scroll region so long lists/charts live inside one panel instead of stretching the page.
 * Uses viewport-relative max height for fold-first layouts on desktop.
 */
export function DashboardScrollPanel({
  children,
  className,
  /** 'md' ≈ one third viewport; 'lg' ≈ half */
  size = 'md',
}: {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const maxH =
    size === 'sm'
      ? 'min(28vh, 260px)'
      : size === 'lg'
        ? 'min(52vh, 560px)'
        : 'min(38vh, 400px)';

  return (
    <div
      className={cn('min-h-0 overflow-y-auto overscroll-contain pr-0.5', className)}
      style={{ maxHeight: maxH }}
    >
      {children}
    </div>
  );
}

/** Segmented control row for dashboard tabs */
export function DashboardTabBar({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: string; label: string }[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div
      className="flex flex-wrap gap-0.5 rounded-[10px] p-0.5 shrink-0"
      style={{ background: 'color-mix(in srgb, var(--foreground) 5%, var(--secondary))' }}
      role="tablist"
    >
      {tabs.map(t => {
        const on = active === t.id;
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(t.id)}
            className={cn(
              'rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-all sm:px-3 sm:text-[12px]',
              on ? 'shadow-sm' : 'opacity-75 hover:opacity-100',
            )}
            style={
              on
                ? { background: 'var(--background)', color: 'var(--foreground)' }
                : { color: 'var(--muted-foreground)' }
            }
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
