'use client';
import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════
   TOAST SYSTEM — Apple-style floating notifications
   
   - Success / Warning / Error / Info variants
   - Auto-dismiss after 4s
   - Glassmorphic floating cards
   - Stack from bottom-right
═══════════════════════════════════════════════════════════ */

type ToastType = 'success' | 'error' | 'warning' | 'info';
type Toast = { id: string; message: string; type: ToastType };

const ToastContext = createContext<{
  addToast: (message: string, type?: ToastType) => void;
}>({ addToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

const icons: Record<ToastType, React.ElementType> = {
  success: CheckCircle,
  error: AlertTriangle,
  warning: AlertTriangle,
  info: Info,
};

const styles: Record<ToastType, { border: string; icon: string; bg: string }> = {
  success: { border: 'border-emerald-200/60', icon: 'text-emerald-600', bg: 'bg-emerald-50/30' },
  error:   { border: 'border-red-200/60',     icon: 'text-red-600',     bg: 'bg-red-50/30' },
  warning: { border: 'border-amber-200/60',   icon: 'text-amber-600',   bg: 'bg-amber-50/30' },
  info:    { border: 'border-stone-200/60',    icon: 'text-stone-600',   bg: 'bg-stone-50/30' },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2 items-end pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => {
            const Icon = icons[toast.type];
            const s = styles[toast.type];
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ type: 'spring', damping: 26, stiffness: 340 }}
                className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border ${s.border} ${s.bg} min-w-[280px] max-w-[400px]`}
                style={{
                  backdropFilter: 'blur(32px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(32px) saturate(180%)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.03)',
                  background: 'rgba(255,255,255,0.85)',
                }}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${s.icon}`} />
                <p className="text-[13px] text-stone-700 flex-1">{toast.message}</p>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="p-1 text-stone-400 hover:text-stone-600 rounded-md transition-colors flex-shrink-0"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
