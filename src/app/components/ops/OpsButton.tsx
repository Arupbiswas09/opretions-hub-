'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../ui/utils';

/**
 * Hub-styled button (stone / warm neutral). Complements shadcn Button for
 * screens that match Operations Hub chrome (Apple-like density).
 */
const opsButtonVariants = cva(
  'inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-[10px] text-[13px] font-medium transition-all outline-none focus-visible:ring-[3px] focus-visible:ring-stone-900/15 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-3.5 [&_svg]:shrink-0 active:scale-[0.97]',
  {
    variants: {
      variant: {
        primary:
          'bg-stone-900 text-white shadow-sm hover:bg-stone-800 border border-stone-900/10',
        secondary:
          'bg-stone-100 text-stone-800 border border-stone-200/80 hover:bg-stone-200/80',
        ghost:
          'bg-transparent text-stone-600 hover:bg-stone-900/[0.06] hover:text-stone-900',
        danger:
          'bg-red-600 text-white hover:bg-red-600/90 border border-red-700/20',
      },
      size: {
        default: 'h-9 px-3.5 py-2',
        sm: 'h-8 px-2.5 text-[12px] rounded-[8px]',
        lg: 'h-10 px-5',
        icon: 'size-9 p-0 rounded-[10px]',
      },
    },
    defaultVariants: { variant: 'primary', size: 'default' },
  },
);

export interface OpsButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof opsButtonVariants> {
  asChild?: boolean;
}

const OpsButton = React.forwardRef<HTMLButtonElement, OpsButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp ref={ref} className={cn(opsButtonVariants({ variant, size, className }))} {...props} />
    );
  },
);
OpsButton.displayName = 'OpsButton';

export { OpsButton, opsButtonVariants };
