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
    <div className={cn("border-b border-stone-200/60", className)}>
      <div ref={containerRef} className="flex gap-0 relative">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            data-value={tab.value}
            onClick={() => onValueChange(tab.value)}
            className={cn(
              "px-4 py-2.5 text-[13px] transition-colors relative",
              value === tab.value
                ? "text-stone-800 font-medium"
                : "text-stone-400 hover:text-stone-600"
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
          className="absolute bottom-0 h-[2px] bg-stone-800 rounded-full transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
          style={{ left: indicator.left, width: indicator.width }}
        />
      </div>
    </div>
  );
}
