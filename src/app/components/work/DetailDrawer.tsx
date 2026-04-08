'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { BodyPortal } from '../ui/Overlays';

interface DetailDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function DetailDrawer({ open, onClose, title, subtitle, icon, children, footer }: DetailDrawerProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <BodyPortal>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-[100]"
              style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
              onClick={onClose}
            />
            <motion.aside
              initial={{ x: '100%', opacity: 0.8 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0.6 }}
              transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
              className="fixed right-0 top-0 z-[101] flex h-[100dvh] max-h-[100dvh] min-h-0 w-full max-w-md flex-col overflow-hidden"
              style={{
                background: 'var(--popover)',
                borderLeft: '1px solid var(--border)',
                boxShadow: '-8px 0 40px rgba(0,0,0,0.2)',
              }}
            >
            {/* Header */}
            <div
              className="flex items-start gap-3 px-5 pt-5 pb-4"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              {icon && (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md">
                  {icon}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h3
                  className="text-[15px] font-semibold leading-snug tracking-tight"
                  style={{ color: 'var(--foreground)' }}
                >
                  {title}
                </h3>
                {subtitle && (
                  <p className="mt-0.5 text-[12px]" style={{ color: 'var(--muted-foreground)' }}>
                    {subtitle}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="shrink-0 rounded-lg p-1.5 transition-colors hover:bg-secondary"
                style={{ color: 'var(--muted-foreground)' }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body — min-h-0 so flex child can scroll */}
            <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-5 py-4 [-webkit-overflow-scrolling:touch]">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div
                className="flex flex-shrink-0 items-center gap-2 px-5 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3"
                style={{ borderTop: '1px solid var(--border)' }}
              >
                {footer}
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
    </BodyPortal>
  );
}

export function DrawerField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3">
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>
        {label}
      </p>
      <div className="text-[13px]" style={{ color: 'var(--foreground)' }}>
        {children}
      </div>
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <div
        className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{
          background: 'linear-gradient(135deg, #2563EB15, #7C3AED15)',
          border: '1px solid var(--border)',
        }}
      >
        <Icon className="h-6 w-6" style={{ color: '#2563EB' }} />
      </div>
      <h3 className="mb-1 text-[15px] font-semibold" style={{ color: 'var(--foreground)' }}>
        {title}
      </h3>
      <p className="mb-4 max-w-xs text-[12px] leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
        {description}
      </p>
      {action}
    </div>
  );
}
