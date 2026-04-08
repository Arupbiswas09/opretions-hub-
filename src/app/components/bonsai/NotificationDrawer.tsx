'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import { X, FileText, Clock, Users, CheckCircle, AlertTriangle, ArrowUpRight, Bell } from 'lucide-react';
import { listNotifications, markNotificationRead, type NotificationRow } from '../../lib/api/hub-api';

type UiNotification = {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: 'approval' | 'info' | 'warning' | 'success';
  icon: React.ElementType;
  href?: string;
};

function mapEntityToType(entityType: string | null): 'approval' | 'info' | 'warning' | 'success' {
  switch (entityType) {
    case 'approvals': return 'approval';
    case 'invoices': case 'expenses': return 'warning';
    case 'projects': case 'deals': return 'success';
    default: return 'info';
  }
}

function mapEntityToIcon(entityType: string | null): React.ElementType {
  switch (entityType) {
    case 'approvals': return Clock;
    case 'invoices': case 'expenses': return AlertTriangle;
    case 'projects': case 'deals': return CheckCircle;
    case 'candidates': case 'people': return Users;
    default: return FileText;
  }
}

function mapEntityToHref(entityType: string | null): string | undefined {
  switch (entityType) {
    case 'approvals': return '/hub/projects/approvals';
    case 'invoices': return '/hub/finance/invoices';
    case 'expenses': return '/hub/people/approvals';
    case 'projects': return '/hub/projects';
    case 'deals': return '/hub/sales';
    case 'candidates': return '/hub/talent';
    case 'support_tickets': return '/hub/support';
    default: return undefined;
  }
}

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'Just now';
  if (min < 60) return `${min} min ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} hour${h > 1 ? 's' : ''} ago`;
  const d = Math.floor(h / 24);
  if (d === 1) return 'Yesterday';
  return `${d} days ago`;
}

function mapRow(row: NotificationRow): UiNotification {
  return {
    id: row.id,
    title: row.title,
    description: row.body ?? '',
    time: formatRelativeTime(row.created_at),
    read: !!row.read_at,
    type: mapEntityToType(row.entity_type),
    icon: mapEntityToIcon(row.entity_type),
    href: mapEntityToHref(row.entity_type),
  };
}

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
  const router = useRouter();
  const [notifications, setNotifications] = useState<UiNotification[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch from API when drawer opens
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      const res = await listNotifications({ limit: 20 });
      if (cancelled) return;
      if (res.data && Array.isArray(res.data)) {
        setNotifications(res.data.map(mapRow));
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [open]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    // Mark each unread notification read in API
    const unread = notifications.filter(n => !n.read);
    await Promise.allSettled(unread.map(n => markNotificationRead(n.id)));
  };

  const markRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    await markNotificationRead(id);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, pointerEvents: 'none' }}
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
                    onClick={() => {
                      markRead(notif.id);
                      if (notif.href) {
                        router.push(notif.href);
                        onClose();
                      }
                    }}
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
                      <div className="flex items-center justify-between gap-2 mt-1.5">
                        <p className="text-[10px] text-stone-400 dark:text-stone-500">{notif.time}</p>
                        {notif.href ? (
                          <span className="text-[10px] font-medium text-stone-500 dark:text-stone-400">
                            Open →
                          </span>
                        ) : null}
                      </div>
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
                onClick={() => {
                  router.push('/hub/admin');
                  onClose();
                }}
                className="w-full text-center text-[12px] font-medium flex items-center justify-center gap-1 transition-colors text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200"
              >
                Notification settings <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
