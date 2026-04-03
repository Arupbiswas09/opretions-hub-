'use client';
import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../ui/utils';

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-400/30 disabled:opacity-40 disabled:pointer-events-none active:scale-[0.97]",
  {
    variants: {
      variant: {
        primary: "bg-stone-800 text-white hover:bg-stone-700 shadow-sm hover:shadow-md",
        secondary: "bg-stone-100 text-stone-700 hover:bg-stone-200/80",
        ghost: "text-stone-500 hover:text-stone-700 hover:bg-stone-100/60",
        destructive: "bg-stone-100 text-stone-700 hover:bg-stone-100 hover:text-stone-700",
        outline: "border border-stone-200 bg-white/60 text-stone-700 hover:bg-stone-50 hover:border-stone-300",
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
