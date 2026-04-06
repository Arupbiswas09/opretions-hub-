'use client';
import React, { useRef, useEffect, useState } from 'react';
import { cn } from '../ui/utils';

interface BonsaiTabsProps {
  tabs: { label: string; value: string; count?: number }[];
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

export function BonsaiTabs({ tabs, value, onValueChange, className }: BonsaiTabsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const activeBtn = container.querySelector(`[data-value="${value}"]`) as HTMLElement;
    if (activeBtn) {
      setIndicator({
        left: activeBtn.offsetLeft,
        width: activeBtn.offsetWidth,
      });
    }
  }, [value]);

  return (
    <div className={cn('min-w-0 border-b border-stone-200/60 dark:border-white/10', className)}>
      <div className="overflow-x-auto [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div ref={containerRef} className="relative flex min-w-0 gap-0">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            data-value={tab.value}
            type="button"
            onClick={() => onValueChange(tab.value)}
            className={cn(
              'relative shrink-0 rounded-md px-3 py-2.5 text-[12px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 sm:px-4 sm:text-[13px]',
              value === tab.value
                ? 'font-medium text-stone-800 dark:text-stone-100'
                : 'text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300'
            )}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className="ml-2 text-[11px] tabular-nums text-stone-400">
                {tab.count}
              </span>
            )}
          </button>
        ))}
        {/* Animated sliding indicator */}
        <div
          className="absolute bottom-0 h-[2px] rounded-full bg-stone-800 transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] dark:bg-stone-200"
          style={{ left: indicator.left, width: indicator.width }}
        />
        </div>
      </div>
    </div>
  );
}
