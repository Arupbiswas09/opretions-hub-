'use client';
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '../ui/utils';
import { BodyPortal } from '../ui/Overlays';

interface BonsaiDrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: 'sm' | 'md' | 'lg' | 'xl';
}

export function BonsaiDrawer({ open, onClose, title, children, footer, width = 'md' }: BonsaiDrawerProps) {
  const widthClass = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-2xl' }[width];

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <BodyPortal>
      <AnimatePresence>
        {open && (
          <>
            {/* Glassmorphic backdrop — deep frosted */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, pointerEvents: 'none' }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[100]"
              onClick={onClose}
            >
              <div className="absolute inset-0 bg-stone-900/20 backdrop-blur-[6px]" />
              {/* Subtle noise texture overlay */}
              <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />
            </motion.div>

            {/* Drawer panel — viewport height, scroll middle */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className={cn(
                'fixed right-0 top-0 z-[101] flex h-[100dvh] max-h-[100dvh] min-h-0 w-full flex-col overflow-hidden',
                'bg-white/80 backdrop-blur-2xl backdrop-saturate-150',
                'border-l border-white/40 shadow-[-8px_0_32px_rgba(0,0,0,0.08)]',
                widthClass,
              )}
            >
              {/* Gradient shimmer top edge */}
              <div className="pointer-events-none absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-stone-300/40 to-transparent" />

              {title && (
                <div className="flex flex-shrink-0 items-center justify-between border-b border-stone-200/30 px-6 py-4">
                  <h2 className="text-[15px] font-medium tracking-[-0.01em] text-stone-800">{title}</h2>
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg p-1.5 text-stone-400 transition-all hover:bg-stone-100/50 hover:text-stone-600 active:scale-95"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
              <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-6 py-5 [-webkit-overflow-scrolling:touch]">
                {children}
              </div>
              {footer && (
                <div className="flex flex-shrink-0 items-center justify-end gap-2 border-t border-stone-200/30 bg-stone-50/30 px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-lg">
                  {footer}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </BodyPortal>
  );
}

interface BonsaiModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function BonsaiModal({ open, onClose, title, children, footer, size = 'md' }: BonsaiModalProps) {
  const sizeClass = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-2xl' }[size];

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, pointerEvents: 'none' }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Frosted backdrop */}
          <div className="absolute inset-0 bg-stone-900/15 backdrop-blur-[8px]" />
          <div className="absolute inset-0 opacity-[0.012]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />

          {/* Modal card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 4 }}
            transition={{ type: 'spring', damping: 26, stiffness: 350 }}
            className={cn(
              "relative w-full rounded-2xl overflow-hidden",
              "bg-white/85 backdrop-blur-2xl backdrop-saturate-150",
              "shadow-[0_24px_80px_-12px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.03)]",
              "border border-white/50",
              sizeClass
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top shimmer */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />

            {title && (
              <div className="px-6 py-4 border-b border-stone-200/25 flex items-center justify-between">
                <h2 className="text-[15px] font-medium text-stone-800 tracking-[-0.01em]">{title}</h2>
                <button
                  onClick={onClose}
                  className="p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100/50 rounded-lg transition-all active:scale-95"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">{children}</div>
            {footer && (
              <div className="px-6 py-4 border-t border-stone-200/25 flex items-center justify-end gap-2 bg-stone-50/20">
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface BonsaiConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
}

export function BonsaiConfirmDialog({
  open, onClose, onConfirm, title, description,
  confirmText = 'Confirm', cancelText = 'Cancel', variant = 'default',
}: BonsaiConfirmDialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, pointerEvents: 'none' }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-stone-900/20 backdrop-blur-[6px]" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ type: 'spring', damping: 26, stiffness: 350 }}
            className="relative bg-white/90 backdrop-blur-2xl rounded-2xl shadow-[0_24px_80px_-12px_rgba(0,0,0,0.12)] w-full max-w-sm p-6 border border-white/50"
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />
            <h2 className="text-[15px] font-medium text-stone-800 mb-2">{title}</h2>
            <p className="text-[13px] text-stone-500 mb-6 leading-relaxed">{description}</p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-[13px] text-stone-500 hover:text-stone-700 hover:bg-stone-100/50 rounded-lg transition-all active:scale-[0.97]"
              >
                {cancelText}
              </button>
              <button
                onClick={() => { onConfirm(); onClose(); }}
                className={cn(
                  "px-4 py-2 text-[13px] font-medium rounded-lg transition-all active:scale-[0.97] shadow-sm",
                  variant === 'destructive'
                    ? "bg-stone-100 text-stone-700 hover:bg-stone-100"
                    : "bg-stone-800 text-white hover:bg-stone-700"
                )}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
