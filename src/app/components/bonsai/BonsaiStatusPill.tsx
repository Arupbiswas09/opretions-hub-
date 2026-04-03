import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../ui/utils';

const statusPillVariants = cva(
  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium tracking-wide",
  {
    variants: {
      status: {
        draft: "bg-stone-100 text-stone-500",
        active: "bg-emerald-50 text-emerald-700",
        completed: "bg-stone-800 text-white",
        pending: "bg-amber-50 text-amber-700",
        cancelled: "bg-stone-100 text-stone-400 line-through",
        overdue: "bg-red-50 text-red-600",
        inProgress: "bg-sky-50 text-sky-700",
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
    active: 'bg-emerald-500',
    completed: 'bg-white',
    pending: 'bg-amber-500',
    cancelled: 'bg-stone-300',
    overdue: 'bg-red-500',
    inProgress: 'bg-sky-500',
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
