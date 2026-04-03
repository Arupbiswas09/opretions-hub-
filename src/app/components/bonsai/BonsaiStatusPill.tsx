import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../ui/utils';

/* ═══════════════════════════════════════════════════════════
   MONOCHROME STATUS PILL SYSTEM
   
   All statuses use stone palette only.
   Hierarchy through: fill weight, text weight, opacity.
   No green, amber, red, blue, or any saturated color.
═══════════════════════════════════════════════════════════ */
const statusPillVariants = cva(
  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium tracking-wide",
  {
    variants: {
      status: {
        draft: "bg-stone-100 text-stone-500",
        active: "bg-stone-800 text-stone-100",
        completed: "bg-stone-200 text-stone-600",
        pending: "bg-stone-150 text-stone-600 bg-stone-100 border border-stone-200",
        cancelled: "bg-stone-100 text-stone-400 line-through",
        overdue: "bg-stone-900 text-white font-semibold",
        inProgress: "bg-stone-700 text-stone-100",
        archived: "bg-stone-100 text-stone-400",
        inactive: "bg-stone-100 text-stone-400",
      },
    },
    defaultVariants: {
      status: "draft",
    },
  }
);

interface BonsaiStatusPillProps extends VariantProps<typeof statusPillVariants> {
  label: string;
  className?: string;
  dot?: boolean;
}

export function BonsaiStatusPill({ status, label, className, dot = true }: BonsaiStatusPillProps) {
  const dotColors: Record<string, string> = {
    draft: 'bg-stone-400',
    active: 'bg-stone-200',
    completed: 'bg-stone-500',
    pending: 'bg-stone-500',
    cancelled: 'bg-stone-300',
    overdue: 'bg-white',
    inProgress: 'bg-stone-300',
  };

  return (
    <span className={cn(statusPillVariants({ status }), className)}>
      {dot && (
        <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", dotColors[status || 'draft'])} />
      )}
      {label}
    </span>
  );
}
