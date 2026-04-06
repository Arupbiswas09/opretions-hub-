'use client';
import React from 'react';
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
  width?: string;       // e.g. '480px', '540px'
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function SlideDrawer({
  open, onClose, title, subtitle, width = '480px', children, footer,
}: SlideDrawerProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }}
          />
          {/* Panel */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-50 flex flex-col"
            style={{
              width,
              maxWidth: '90vw',
              background: 'var(--sidebar-glass)',
              backdropFilter: 'blur(24px) saturate(1.6)',
              WebkitBackdropFilter: 'blur(24px) saturate(1.6)',
              borderLeft: '1px solid var(--border)',
              boxShadow: '-8px 0 30px rgba(0,0,0,0.3)',
            }}
          >
            {/* Header */}
            <div className="px-6 py-4 flex items-center justify-between flex-shrink-0"
              style={{ borderBottom: '1px solid var(--border)' }}>
              <div>
                <h2 className="text-[16px] font-semibold" style={{ color: 'var(--foreground)' }}>
                  {title}
                </h2>
                {subtitle && (
                  <p className="text-[12px] mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                    {subtitle}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg transition-colors hover:bg-white/[0.06]"
                style={{ color: 'var(--muted-foreground)' }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-5 custom-scrollbar">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="px-6 py-4 flex-shrink-0"
                style={{ borderTop: '1px solid var(--border)' }}>
                {footer}
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
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
            exit={{ opacity: 0 }}
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
