'use client';
import React from 'react';
import { X, Mail, Tag, UserCheck, Download, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useToast } from '../bonsai/ToastSystem';

interface CO06BulkToolbarProps {
  selectedCount: number;
  onClose: () => void;
}

export function CO06BulkToolbar({ selectedCount, onClose }: CO06BulkToolbarProps) {
  const { addToast } = useToast();

  const actions = [
    { icon: Mail, label: 'Email', onClick: () => addToast(`Email queued for ${selectedCount} contacts`, 'info') },
    { icon: Tag, label: 'Tag', onClick: () => addToast('Tags applied', 'info') },
    { icon: UserCheck, label: 'Consent', onClick: () => addToast('Consent updated', 'success') },
    { icon: Download, label: 'Export', onClick: () => addToast('Export started', 'info') },
    { icon: Trash2, label: 'Delete', onClick: () => addToast(`${selectedCount} contacts deleted`, 'success'), danger: true },
  ];

  return (
    <motion.div
      initial={{ y: 40, opacity: 0, scale: 0.95 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: 40, opacity: 0, scale: 0.95 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
    >
      <div
        className="flex items-center gap-1 rounded-xl px-3 py-2 shadow-2xl"
        style={{
          background: 'var(--popover)',
          border: '1px solid var(--border)',
          backdropFilter: 'blur(24px) saturate(180%)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.05) inset',
        }}
      >
        {/* Count */}
        <div className="flex items-center gap-2 pr-2 mr-1" style={{ borderRight: '1px solid var(--border)' }}>
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #2563EB, #6366F1)' }}
          >
            {selectedCount}
          </div>
          <span className="text-[11px] font-medium" style={{ color: 'var(--foreground)' }}>selected</span>
        </div>

        {/* Actions */}
        {actions.map(a => (
          <button
            key={a.label}
            onClick={a.onClick}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors hover:bg-white/[0.06]"
            style={{ color: (a as any).danger ? '#EF4444' : 'var(--foreground)' }}
          >
            <a.icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{a.label}</span>
          </button>
        ))}

        {/* Close */}
        <button onClick={onClose} className="ml-1 p-1.5 rounded-lg transition-colors hover:bg-white/[0.06]" style={{ color: 'var(--muted-foreground)' }}>
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}
