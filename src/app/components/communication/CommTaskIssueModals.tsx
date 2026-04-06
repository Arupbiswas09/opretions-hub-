'use client';

import React, { useEffect, useState } from 'react';
import { X, MessageSquare, ListTodo, Bug } from 'lucide-react';
import { cn } from '../ui/utils';

const LS_TASKS = 'hub_comm_tasks';
const LS_ISSUES = 'hub_comm_issues';

export type CommTaskPayload = {
  title: string;
  description: string;
  priority: string;
  dueDate: string;
  source: 'communication';
  chatId: string;
  contactName: string;
  createdAt: string;
};

export type CommIssuePayload = {
  title: string;
  description: string;
  severity: string;
  category: string;
  source: 'communication';
  chatId: string;
  contactName: string;
  createdAt: string;
};

function pushLocal(key: string, item: unknown) {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
    const arr = raw ? (JSON.parse(raw) as unknown[]) : [];
    arr.push(item);
    localStorage.setItem(key, JSON.stringify(arr));
  } catch {
    /* ignore */
  }
}

function ModalChrome({
  title,
  subtitle,
  icon: Icon,
  iconClass,
  children,
  footer,
  onClose,
}: {
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  iconClass: string;
  children: React.ReactNode;
  footer: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" role="presentation">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        aria-hidden
        onClick={onClose}
      />
      <div
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border shadow-2xl flex flex-col max-h-[min(90vh,640px)]"
        style={{
          background: 'linear-gradient(165deg, color-mix(in srgb, var(--popover) 98%, var(--primary) 2%), var(--popover))',
          borderColor: 'color-mix(in srgb, var(--border) 85%, var(--primary) 15%)',
          boxShadow: '0 25px 80px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.04) inset',
        }}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="comm-modal-title"
      >
        <div className="shrink-0 flex items-start gap-3 px-5 pt-5 pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-md', iconClass)}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 id="comm-modal-title" className="text-[16px] font-semibold tracking-tight" style={{ color: 'var(--foreground)' }}>
              {title}
            </h2>
            {subtitle ? (
              <p className="text-[12px] mt-0.5 leading-snug" style={{ color: 'var(--muted-foreground)' }}>{subtitle}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 transition-colors hover:bg-secondary shrink-0"
            style={{ color: 'var(--muted-foreground)' }}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 space-y-4">{children}</div>
        <div className="shrink-0 flex items-center justify-end gap-2 px-5 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
          {footer}
        </div>
      </div>
    </div>
  );
}

export function CommunicationCreateTaskModal({
  open,
  onClose,
  contactName,
  chatId,
  snippet,
}: {
  open: boolean;
  onClose: () => void;
  contactName: string;
  chatId: string;
  snippet: string;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!open) return;
    setDone(false);
    setTitle(`Follow up with ${contactName}`);
    setDescription(
      `Created from conversation with ${contactName}.\n\n${snippet ? `Context:\n${snippet}` : ''}`,
    );
  }, [open, contactName, snippet, chatId]);

  if (!open) return null;

  const handleCreate = () => {
    const t = title.trim();
    if (!t) return;
    const payload: CommTaskPayload = {
      title: t,
      description: description.trim(),
      priority,
      dueDate,
      source: 'communication',
      chatId,
      contactName,
      createdAt: new Date().toISOString(),
    };
    pushLocal(LS_TASKS, payload);
    setDone(true);
    setTimeout(() => {
      onClose();
      setDone(false);
    }, 600);
  };

  return (
    <ModalChrome
      title="Create task"
      subtitle={`From thread with ${contactName}`}
      icon={ListTodo}
      iconClass="bg-gradient-to-br from-violet-500 to-indigo-600"
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-[13px] font-medium transition-colors hover:bg-secondary"
            style={{ color: 'var(--muted-foreground)' }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCreate}
            disabled={!title.trim() || done}
            className="px-4 py-2 rounded-xl text-[13px] font-semibold text-primary-foreground transition-opacity disabled:opacity-40"
            style={{ background: 'var(--primary)' }}
          >
            {done ? 'Saved' : 'Create task'}
          </button>
        </>
      }
    >
      <div
        className="flex items-start gap-2 p-3 rounded-xl border text-[12px]"
        style={{
          background: 'color-mix(in srgb, var(--primary) 6%, var(--secondary))',
          borderColor: 'color-mix(in srgb, var(--primary) 18%, var(--border))',
        }}
      >
        <MessageSquare className="h-4 w-4 shrink-0 mt-0.5" style={{ color: 'var(--primary)' }} />
        <div className="min-w-0">
          <p className="font-medium" style={{ color: 'var(--foreground)' }}>Source conversation</p>
          <p className="text-[11px] mt-0.5 line-clamp-2" style={{ color: 'var(--muted-foreground)' }}>
            {snippet || 'No preview text'}
          </p>
        </div>
      </div>
      <div>
        <label className="block text-[11px] font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>Title</label>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full rounded-xl border px-3 py-2.5 text-[13px] outline-none transition-shadow focus:ring-2 focus:ring-primary/25"
          style={{ background: 'var(--secondary)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
          placeholder="Task title"
        />
      </div>
      <div>
        <label className="block text-[11px] font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>Description</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={4}
          className="w-full rounded-xl border px-3 py-2.5 text-[13px] resize-none outline-none transition-shadow focus:ring-2 focus:ring-primary/25"
          style={{ background: 'var(--secondary)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>Priority</label>
          <select
            value={priority}
            onChange={e => setPriority(e.target.value)}
            className="w-full rounded-xl border px-3 py-2.5 text-[13px] outline-none cursor-pointer"
            style={{ background: 'var(--secondary)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>Due</label>
          <input
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            className="w-full rounded-xl border px-3 py-2.5 text-[13px] outline-none"
            style={{ background: 'var(--secondary)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
          />
        </div>
      </div>
    </ModalChrome>
  );
}

export function CommunicationCreateIssueModal({
  open,
  onClose,
  contactName,
  chatId,
  snippet,
}: {
  open: boolean;
  onClose: () => void;
  contactName: string;
  chatId: string;
  snippet: string;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [category, setCategory] = useState('communication');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!open) return;
    setDone(false);
    setTitle(`Issue from chat: ${contactName}`);
    setDescription(
      `Reported from Operations Hub · Communication.\nContact: ${contactName}\n\n${snippet ? `Context:\n${snippet}` : ''}`,
    );
  }, [open, contactName, snippet, chatId]);

  if (!open) return null;

  const handleCreate = () => {
    const t = title.trim();
    if (!t) return;
    const payload: CommIssuePayload = {
      title: t,
      description: description.trim(),
      severity,
      category,
      source: 'communication',
      chatId,
      contactName,
      createdAt: new Date().toISOString(),
    };
    pushLocal(LS_ISSUES, payload);
    setDone(true);
    setTimeout(() => {
      onClose();
      setDone(false);
    }, 600);
  };

  return (
    <ModalChrome
      title="Create issue"
      subtitle={`Linked to ${contactName}`}
      icon={Bug}
      iconClass="bg-gradient-to-br from-amber-500 to-orange-600"
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-[13px] font-medium transition-colors hover:bg-secondary"
            style={{ color: 'var(--muted-foreground)' }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCreate}
            disabled={!title.trim() || done}
            className="px-4 py-2 rounded-xl text-[13px] font-semibold text-primary-foreground transition-opacity disabled:opacity-40"
            style={{ background: 'var(--primary)' }}
          >
            {done ? 'Saved' : 'Create issue'}
          </button>
        </>
      }
    >
      <div
        className="flex items-start gap-2 p-3 rounded-xl border text-[12px]"
        style={{
          background: 'color-mix(in srgb, #f59e0b 8%, var(--secondary))',
          borderColor: 'color-mix(in srgb, #f59e0b 22%, var(--border))',
        }}
      >
        <MessageSquare className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
        <div className="min-w-0">
          <p className="font-medium" style={{ color: 'var(--foreground)' }}>Conversation context</p>
          <p className="text-[11px] mt-0.5 line-clamp-2" style={{ color: 'var(--muted-foreground)' }}>
            {snippet || 'No preview text'}
          </p>
        </div>
      </div>
      <div>
        <label className="block text-[11px] font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>Title</label>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full rounded-xl border px-3 py-2.5 text-[13px] outline-none transition-shadow focus:ring-2 focus:ring-primary/25"
          style={{ background: 'var(--secondary)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
        />
      </div>
      <div>
        <label className="block text-[11px] font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>Description</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={4}
          className="w-full rounded-xl border px-3 py-2.5 text-[13px] resize-none outline-none"
          style={{ background: 'var(--secondary)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>Severity</label>
          <select
            value={severity}
            onChange={e => setSeverity(e.target.value)}
            className="w-full rounded-xl border px-3 py-2.5 text-[13px] outline-none cursor-pointer"
            style={{ background: 'var(--secondary)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>Category</label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="w-full rounded-xl border px-3 py-2.5 text-[13px] outline-none cursor-pointer"
            style={{ background: 'var(--secondary)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
          >
            <option value="communication">Communication</option>
            <option value="integration">Integration</option>
            <option value="data">Data quality</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
    </ModalChrome>
  );
}
