'use client';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   UNIVERSAL SLIDE DRAWER
   Reusable slide-in panel anchored to the right edge.
   Used for: Quick-create forms, detail views, settings, etc.
   ═══════════════════════════════════════════════════════════════ */

interface SlideDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  /** Panel width. Use `wide` for entity forms (contacts, people) to match hub chrome. */
  width?: string;
  wide?: boolean;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

/** z-index for portaled hub drawers (above module chrome, below command palette if any). */
const DRAWER_BACKDROP_Z = 100;
const DRAWER_PANEL_Z = 101;

export function SlideDrawer({
  open,
  onClose,
  title,
  subtitle,
  width,
  wide = false,
  children,
  footer,
}: SlideDrawerProps) {
  const [mounted, setMounted] = useState(false);
  const resolvedWidth = width ?? (wide ? 'min(640px, 92vw)' : '480px');

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const drawer = (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop — portaled so `position:fixed` is viewport-relative (not clipped by hub page `filter` / transforms). */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, pointerEvents: 'none' }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0"
            style={{
              zIndex: DRAWER_BACKDROP_Z,
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(2px)',
            }}
          />
          {/* Panel — full viewport height; body scrolls inside flex middle */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed right-0 top-0 flex max-h-[100dvh] min-h-0 flex-col"
            style={{
              zIndex: DRAWER_PANEL_Z,
              width: resolvedWidth,
              maxWidth: 'min(92vw, 100%)',
              height: '100dvh',
              background: 'var(--sidebar-glass)',
              backdropFilter: 'blur(24px) saturate(1.6)',
              WebkitBackdropFilter: 'blur(24px) saturate(1.6)',
              borderLeft: '1px solid var(--border)',
              boxShadow: '-8px 0 30px rgba(0,0,0,0.3)',
            }}
          >
            {/* Header */}
            <div
              className="flex flex-shrink-0 items-center justify-between px-6 py-4"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <div className="min-w-0 pr-2">
                <h2 className="text-[16px] font-semibold" style={{ color: 'var(--foreground)' }}>
                  {title}
                </h2>
                {subtitle && (
                  <p className="mt-0.5 text-[12px]" style={{ color: 'var(--muted-foreground)' }}>
                    {subtitle}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex-shrink-0 rounded-lg p-1.5 transition-colors hover:bg-white/[0.06]"
                style={{ color: 'var(--muted-foreground)' }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable body — min-h-0 is required for flex overflow scrolling */}
            <div className="custom-scrollbar min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-6 py-5 [-webkit-overflow-scrolling:touch]">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div
                className="flex-shrink-0 px-6 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4"
                style={{ borderTop: '1px solid var(--border)' }}
              >
                {footer}
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );

  if (!mounted) return null;
  return createPortal(drawer, document.body);
}

/**
 * Renders into `document.body` so fixed overlays escape filtered/transformed hub layout ancestors.
 * Use for custom drawer UIs that do not use `SlideDrawer`.
 */
export function BodyPortal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}

/* ═══════════════════════════════════════════════════════════════
   CONFIRMATION MODAL
   Used for: Delete, Approve, Reject, Archive, etc.
   ═══════════════════════════════════════════════════════════════ */

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  confirmColor?: string;  // e.g. '#EF4444' for destructive, '#2563EB' for primary
  cancelLabel?: string;
}

export function ConfirmModal({
  open, onClose, onConfirm, title, message,
  confirmLabel = 'Confirm', confirmColor = '#2563EB', cancelLabel = 'Cancel',
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, pointerEvents: 'none' }}
            transition={{ duration: 0.12 }}
            onClick={onClose}
            className="fixed inset-0 z-[60]"
            style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(3px)' }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 4 }}
            transition={{ duration: 0.15 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] w-[420px] max-w-[90vw] rounded-xl overflow-hidden"
            style={{
              background: 'var(--popover)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <div className="p-6">
              <h3 className="text-[16px] font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                {title}
              </h3>
              <p className="text-[13px] leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                {message}
              </p>
            </div>
            <div className="px-6 py-4 flex items-center justify-end gap-2"
              style={{ borderTop: '1px solid var(--border)' }}>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-[13px] font-medium transition-colors"
                style={{
                  background: 'var(--glass-bg)',
                  color: 'var(--foreground)',
                  border: '1px solid var(--border)',
                }}
              >
                {cancelLabel}
              </button>
              <button
                onClick={() => { onConfirm(); onClose(); }}
                className="px-4 py-2 rounded-lg text-[13px] font-medium transition-all hover:scale-[1.02]"
                style={{ background: confirmColor, color: '#FFF' }}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FORM FIELD HELPERS — reusable glassmorphic inputs
   ═══════════════════════════════════════════════════════════════ */

interface FieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function FormField({ label, required, children, className = '' }: FieldProps) {
  return (
    <div className={`mb-4 ${className}`}>
      <label className="block text-[12px] font-medium mb-1.5"
        style={{ color: 'var(--foreground-secondary)' }}>
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

export function GlassInput({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full px-3 py-2.5 rounded-lg text-[13px] outline-none transition-all focus:ring-1 focus:ring-blue-500/40 ${props.className || ''}`}
      style={{
        background: 'var(--glass-bg)',
        border: '1px solid var(--border)',
        color: 'var(--foreground)',
        ...props.style,
      }}
    />
  );
}

export function GlassTextarea({ ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full px-3 py-2.5 rounded-lg text-[13px] outline-none resize-none transition-all focus:ring-1 focus:ring-blue-500/40 ${props.className || ''}`}
      style={{
        background: 'var(--glass-bg)',
        border: '1px solid var(--border)',
        color: 'var(--foreground)',
        ...props.style,
      }}
    />
  );
}

export function GlassSelect({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full px-3 py-2.5 rounded-lg text-[13px] outline-none appearance-none cursor-pointer ${props.className || ''}`}
      style={{
        background: 'var(--glass-bg)',
        border: '1px solid var(--border)',
        color: 'var(--foreground)',
        ...props.style,
      }}
    >
      {children}
    </select>
  );
}
