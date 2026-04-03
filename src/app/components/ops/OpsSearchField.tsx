'use client';

import * as React from 'react';
import { Search, Command } from 'lucide-react';
import { cn } from '../ui/utils';

export interface OpsSearchFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  showKbdHint?: boolean;
}

/**
 * WHY: Matches HubShell topbar search — one place to tweak focus ring + width.
 * WHERE: Sticky headers, command palettes entry.
 */
function OpsSearchField({
  className,
  showKbdHint = true,
  placeholder = 'Search…',
  ...props
}: OpsSearchFieldProps) {
  return (
    <div className={cn('relative hidden md:flex items-center', className)}>
      <Search className="absolute left-2.5 w-3.5 h-3.5 text-stone-400 pointer-events-none" aria-hidden />
      <input
        type="search"
        placeholder={placeholder}
        className="w-48 pl-8 pr-3 py-[6px] text-[13px] rounded-[10px] transition-all focus:outline-none focus:w-56 bg-stone-500/[0.08] border border-black/[0.06] text-stone-900 placeholder:text-stone-400 focus:bg-white/85 focus:shadow-[0_0_0_3px_rgba(28,25,23,0.06)]"
        {...props}
      />
      {showKbdHint && (
        <kbd className="hidden lg:flex absolute right-2.5 items-center gap-0.5 text-[9px] text-stone-400 bg-white/60 border border-stone-200/60 rounded px-1 py-0.5 font-medium pointer-events-none">
          <Command className="w-2.5 h-2.5" aria-hidden />
          K
        </kbd>
      )}
    </div>
  );
}

export { OpsSearchField };
