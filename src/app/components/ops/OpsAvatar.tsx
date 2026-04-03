'use client';

import * as React from 'react';
import { cn } from '../ui/utils';

const sizeClass = {
  sm: 'w-7 h-7 text-[10px]',
  md: 'w-8 h-8 text-[11px]',
  lg: 'w-10 h-10 text-[12px]',
} as const;

export interface OpsAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  initials: string;
  size?: keyof typeof sizeClass;
  /** online | away | offline — only renders dot when set */
  presence?: 'online' | 'away' | 'offline';
}

const presenceColor = {
  online: 'bg-emerald-500',
  away: 'bg-amber-400',
  offline: 'bg-stone-300',
} as const;

/**
 * WHY: Single avatar recipe (gradient + initials) matches HubShell JD chip.
 * WHERE: Topbar, people lists, assignment rows.
 */
function OpsAvatar({ className, initials, size = 'md', presence, ...props }: OpsAvatarProps) {
  const dot = presence ? presenceColor[presence] : null;
  return (
    <div
      className={cn('relative inline-flex rounded-full items-center justify-center font-semibold text-white shrink-0', sizeClass[size], className)}
      style={{
        background: 'linear-gradient(145deg, #44403c, #1c1917)',
        boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
      }}
      {...props}
    >
      <span className="select-none">{initials.slice(0, 2).toUpperCase()}</span>
      {dot && (
        <span
          className={cn('absolute bottom-0 right-0 w-[6px] h-[6px] rounded-full ring-2 ring-[#EEEDE9]', dot)}
          title={presence}
          aria-label={presence}
        />
      )}
    </div>
  );
}

export { OpsAvatar };
