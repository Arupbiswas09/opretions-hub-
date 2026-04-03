import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../ui/utils';

/* ═══════════════════════════════════════════════════════════
   FUNCTIONAL STATUS PILL SYSTEM
   
   Monochrome for decorative/neutral states.
   Functional color for OPERATIONAL semantics only:
   - Overdue / Urgent → Red (danger signal)
   - Pending / Warning → Amber (attention signal)
   - Active / Success  → Dark stone (confident)
   - Completed         → Green (confirmation)
   
   This matches Linear, Stripe, and Vercel patterns:
   monochrome base + functional color for status.
═══════════════════════════════════════════════════════════ */
const statusPillVariants = cva(
  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium tracking-wide transition-colors",
  {
    variants: {
      status: {
        draft:      "bg-stone-100 text-stone-500",
        active:     "bg-stone-800 text-stone-100",
        completed:  "bg-emerald-50 text-emerald-700 border border-emerald-100",
        pending:    "bg-amber-50 text-amber-700 border border-amber-100",
        cancelled:  "bg-stone-100 text-stone-400 line-through",
        overdue:    "bg-red-50 text-red-700 border border-red-100 font-semibold",
        inProgress: "bg-stone-700 text-stone-100",
        archived:   "bg-stone-100 text-stone-400",
        inactive:   "bg-stone-100 text-stone-400",
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
    draft:      'bg-stone-400',
    active:     'bg-emerald-300',
    completed:  'bg-emerald-500',
    pending:    'bg-amber-500',
    cancelled:  'bg-stone-300',
    overdue:    'bg-red-500',
    inProgress: 'bg-stone-300',
    inactive:   'bg-stone-300',
    archived:   'bg-stone-300',
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
