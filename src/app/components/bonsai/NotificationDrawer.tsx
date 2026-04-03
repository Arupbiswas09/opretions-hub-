'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, FileText, Clock, Users, CheckCircle, AlertTriangle, ArrowUpRight } from 'lucide-react';

type Notification = {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: 'approval' | 'info' | 'warning' | 'success';
  icon: React.ElementType;
};

const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: '1', title: 'Timesheet Approval Required', description: 'John Doe submitted 42 hours for Week 2', time: '5 min ago', read: false, type: 'approval', icon: Clock },
  { id: '2', title: 'Invoice Overdue – INV-1245', description: 'Acme Corp $12,400 — 3 days past due', time: '1 hour ago', read: false, type: 'warning', icon: AlertTriangle },
  { id: '3', title: 'Leave Request: Jane Smith', description: 'Vacation Feb 10-14, 2026 (5 days)', time: '2 hours ago', read: false, type: 'approval', icon: Users },
  { id: '4', title: 'New Deal Created', description: 'Website Redesign for Acme Corp — $45K', time: '3 hours ago', read: true, type: 'info', icon: FileText },
  { id: '5', title: 'Project Milestone Completed', description: 'Q1 Launch milestone reached 100%', time: '5 hours ago', read: true, type: 'success', icon: CheckCircle },
  { id: '6', title: 'Candidate Applied', description: 'Senior Designer role — Alice Chen', time: 'Yesterday', read: true, type: 'info', icon: Users },
];

const typeStyles: Record<string, { dot: string; iconBg: string; iconColor: string }> = {
  approval: {
    dot: 'bg-amber-500 dark:bg-amber-400',
    iconBg: 'bg-amber-500/15 dark:bg-amber-400/12',
    iconColor: 'text-amber-700 dark:text-amber-300',
  },
  warning: {
    dot: 'bg-red-500 dark:bg-red-400',
    iconBg: 'bg-red-500/12 dark:bg-red-400/10',
    iconColor: 'text-red-600 dark:text-red-300',
  },
  info: {
    dot: 'bg-stone-400 dark:bg-stone-500',
    iconBg: 'bg-stone-500/12 dark:bg-white/[0.08]',
    iconColor: 'text-stone-600 dark:text-stone-300',
  },
  success: {
    dot: 'bg-emerald-500 dark:bg-emerald-400',
    iconBg: 'bg-emerald-500/12 dark:bg-emerald-400/10',
    iconColor: 'text-emerald-700 dark:text-emerald-300',
  },
};

interface NotificationDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function NotificationDrawer({ open, onClose }: NotificationDrawerProps) {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[80]"
            onClick={onClose}
          >
            <div className="absolute inset-0 bg-stone-900/25 dark:bg-black/50 backdrop-blur-[6px]" />
          </motion.div>

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            className="fixed right-0 top-0 h-full z-[81] w-full max-w-[400px] flex flex-col"
            style={{
              background: 'var(--notif-drawer-bg)',
              backdropFilter: 'blur(44px) saturate(180%)',
              WebkitBackdropFilter: 'blur(44px) saturate(180%)',
              borderLeft: '1px solid var(--notif-drawer-border)',
              boxShadow: '-12px 0 48px rgba(0,0,0,0.25)',
            }}
          >
            <div
              className="absolute top-0 left-0 right-0 h-px pointer-events-none"
              style={{
                background: 'linear-gradient(90deg, transparent, var(--notif-drawer-edge), transparent)',
              }}
            />

            <div
              className="px-6 py-4 flex items-center justify-between"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <div className="flex items-center gap-3">
                <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-stone-800 dark:text-stone-100">
                  Notifications
                </h2>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-stone-800 dark:bg-white/15 text-white dark:text-stone-100 text-[10px] font-bold">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllRead}
                    className="text-[11px] font-medium transition-colors text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-lg transition-all active:scale-95 text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {notifications.map((notif, i) => {
                const styles = typeStyles[notif.type];
                const Icon = notif.icon;
                return (
                  <motion.button
                    key={notif.id}
                    type="button"
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => markRead(notif.id)}
                    className="w-full flex items-start gap-3.5 px-6 py-4 text-left transition-[background-color] duration-[120ms] ease-out border-b border-[color:var(--border)] hover:bg-[var(--row-hover-bg)] data-[read=true]:opacity-60"
                    data-read={notif.read}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${styles.iconBg}`}>
                      <Icon className={`w-4 h-4 ${styles.iconColor}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-[13px] leading-tight ${
                          notif.read
                            ? 'text-stone-600 dark:text-stone-400'
                            : 'font-medium text-stone-800 dark:text-stone-100'
                        }`}>
                          {notif.title}
                        </p>
                        {!notif.read && (
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1 ${styles.dot}`} />
                        )}
                      </div>
                      <p className="text-[11px] mt-0.5 line-clamp-2 text-stone-500 dark:text-stone-400">
                        {notif.description}
                      </p>
                      <p className="text-[10px] mt-1.5 text-stone-400 dark:text-stone-500">{notif.time}</p>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <div
              className="px-6 py-3"
              style={{
                borderTop: '1px solid var(--border)',
                background: 'var(--table-header-bg)',
              }}
            >
              <button
                type="button"
                className="w-full text-center text-[12px] font-medium flex items-center justify-center gap-1 transition-colors text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200"
              >
                View all notifications <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
