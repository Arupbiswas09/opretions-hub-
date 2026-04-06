'use client';

import React from 'react';
import { motion } from 'motion/react';
import { EASE_OUT_EXPO } from '../../lib/motion';

/** Max-width + horizontal padding aligned with Dashboard. */
export function HubPageShell({
  children,
  className = '',
  narrow,
}: {
  children: React.ReactNode;
  className?: string;
  /** Use slightly narrower column for dense tools (timer, calendar). */
  narrow?: boolean;
}) {
  return (
    <div className={`mx-auto px-10 py-8 ${narrow ? 'max-w-[1000px]' : 'max-w-[1120px]'} ${className}`}>
      {children}
    </div>
  );
}

/**
 * Editorial page title — matches Dashboard greeting tier (without competing at 40px).
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  action,
  animate = true,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  animate?: boolean;
}) {
  const inner = (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] mb-1 text-stone-400 dark:text-stone-500">
          {eyebrow}
        </p>
        <h1 className="text-[28px] font-semibold tracking-[-0.025em] text-stone-900 dark:text-stone-50 leading-tight">
          {title}
        </h1>
        {description ? (
          <p className="text-[13px] mt-1.5 text-stone-500 dark:text-stone-400 max-w-xl leading-relaxed">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="flex-shrink-0">{action}</div> : null}
    </div>
  );

  if (!animate) return inner;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, filter: 'blur(2px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.34, ease: EASE_OUT_EXPO }}
    >
      {inner}
    </motion.div>
  );
}
