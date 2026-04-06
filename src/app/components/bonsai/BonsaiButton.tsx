'use client';
import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../ui/utils';

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 disabled:opacity-40 disabled:pointer-events-none active:scale-[0.97]",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground hover:bg-primary/90 " +
          "shadow-sm hover:shadow-md border border-transparent",
        secondary:
          "bg-secondary text-secondary-foreground " +
          "hover:bg-muted dark:bg-white/[0.07] dark:text-foreground dark:hover:bg-white/[0.11]",
        ghost:
          "text-muted-foreground " +
          "hover:text-foreground hover:bg-secondary/90 dark:hover:bg-white/[0.06]",
        destructive:
          "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 " +
          "hover:bg-red-100 dark:hover:bg-red-900/30",
        outline:
          "border border-stone-200 dark:border-white/[0.10] " +
          "bg-white/60 dark:bg-white/[0.05] " +
          "text-stone-700 dark:text-stone-200 " +
          "hover:bg-stone-50 dark:hover:bg-white/[0.08] hover:border-stone-300 dark:hover:border-white/15",
      },
      size: {
        sm: "px-3 py-1.5 text-[12px]",
        md: "px-4 py-2 text-[13px]",
        lg: "px-5 py-2.5 text-[14px]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

interface BonsaiButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  icon?: React.ReactNode;
}

export function BonsaiButton({
  className, variant, size, icon, children, ...props
}: BonsaiButtonProps) {
  return (
    <button className={cn(buttonVariants({ variant, size, className }))} {...props}>
      {icon && <span className="w-4 h-4 flex items-center justify-center">{icon}</span>}
      {children}
    </button>
  );
}
