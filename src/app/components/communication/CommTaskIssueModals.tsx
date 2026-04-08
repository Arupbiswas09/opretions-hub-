'use client';

import React, { useEffect, useState } from 'react';
import { X, MessageSquare, ListTodo, Bug, Check, Loader2 } from 'lucide-react';
import { cn } from '../ui/utils';
import { createTask, type TaskRow } from '../../lib/api/hub-api';
import { createIssue, type IssueRow } from '../../lib/api/hub-api';
import { useHubData } from '../../lib/hub/use-hub-data';
import { dispatchDataInvalidation } from '../../lib/hub-events';

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

/* Shared field component */
const inputClass = 'w-full rounded-xl border px-3 py-2.5 text-[13px] outline-none transition-shadow focus:ring-2 focus:ring-primary/25';
const inputStyle: React.CSSProperties = { background: 'var(--secondary)', borderColor: 'var(--border)', color: 'var(--foreground)' };
const labelClass = 'block text-[11px] font-semibold mb-1.5';
const labelStyle: React.CSSProperties = { color: 'var(--foreground)' };

/* ═══════════════════════════════════════════════════════════
   CREATE TASK MODAL — wired to /api/tasks
═══════════════════════════════════════════════════════════ */
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
  const [projectId, setProjectId] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  // Fetch projects for the dropdown
  const { data: projects } = useHubData<Array<{ id: string; name: string }>>('/api/projects?limit=50');

  useEffect(() => {
    if (!open) return;
    setDone(false);
    setSaving(false);
    setError('');
    setTitle(`Follow up with ${contactName}`);
    setDescription(
      `Created from conversation with ${contactName}.\n\n${snippet ? `Context:\n${snippet}` : ''}`,
    );
    setDueDate('');
    setProjectId('');
  }, [open, contactName, snippet, chatId]);

  if (!open) return null;

  const handleCreate = async () => {
    const t = title.trim();
    if (!t || saving) return;
    setSaving(true);
    setError('');
    try {
      await createTask({
        title: t,
        description: description.trim() || null,
        priority,
        due_date: dueDate || null,
        project_id: projectId || null,
        status: 'todo',
        tags: ['communication', contactName.toLowerCase().replace(/\s+/g, '-')],
      });
      setDone(true);
      dispatchDataInvalidation('tasks');
      setTimeout(() => {
        onClose();
        setDone(false);
      }, 600);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to create task');
    } finally {
      setSaving(false);
    }
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
            disabled={!title.trim() || saving || done}
            className="px-4 py-2 rounded-xl text-[13px] font-semibold text-primary-foreground transition-opacity disabled:opacity-40 inline-flex items-center gap-2"
            style={{ background: done ? '#10b981' : 'var(--primary)' }}
          >
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {done ? <><Check className="h-3.5 w-3.5" /> Created</> : saving ? 'Saving…' : 'Create task'}
          </button>
        </>
      }
    >
      {/* Source context badge */}
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

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl text-[12px]"
          style={{ background: 'color-mix(in srgb, #ef4444 8%, var(--secondary))', border: '1px solid color-mix(in srgb, #ef4444 20%, var(--border))' }}>
          <span style={{ color: '#ef4444' }}>{error}</span>
        </div>
      )}

      <div>
        <label className={labelClass} style={labelStyle}>Title</label>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          className={inputClass}
          style={inputStyle}
          placeholder="Task title"
        />
      </div>

      <div>
        <label className={labelClass} style={labelStyle}>Description</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={3}
          className={cn(inputClass, 'resize-none')}
          style={inputStyle}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass} style={labelStyle}>Priority</label>
          <select
            value={priority}
            onChange={e => setPriority(e.target.value)}
            className={cn(inputClass, 'cursor-pointer')}
            style={inputStyle}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div>
          <label className={labelClass} style={labelStyle}>Due date</label>
          <input
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            className={inputClass}
            style={inputStyle}
          />
        </div>
      </div>

      {/* Project select */}
      <div>
        <label className={labelClass} style={labelStyle}>Project (optional)</label>
        <select
          value={projectId}
          onChange={e => setProjectId(e.target.value)}
          className={cn(inputClass, 'cursor-pointer')}
          style={inputStyle}
        >
          <option value="">— no project —</option>
          {(projects ?? []).map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>
    </ModalChrome>
  );
}

/* ═══════════════════════════════════════════════════════════
   CREATE ISSUE MODAL — wired to /api/issues
═══════════════════════════════════════════════════════════ */
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
  const [priority, setPriority] = useState('medium');
  const [type, setType] = useState('bug');
  const [projectId, setProjectId] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const { data: projects } = useHubData<Array<{ id: string; name: string }>>('/api/projects?limit=50');

  useEffect(() => {
    if (!open) return;
    setDone(false);
    setSaving(false);
    setError('');
    setTitle(`Issue from chat: ${contactName}`);
    setDescription(
      `Reported from Operations Hub · Communication.\nContact: ${contactName}\n\n${snippet ? `Context:\n${snippet}` : ''}`,
    );
    setProjectId('');
  }, [open, contactName, snippet, chatId]);

  if (!open) return null;

  const handleCreate = async () => {
    const t = title.trim();
    if (!t || saving) return;
    setSaving(true);
    setError('');
    try {
      await createIssue({
        title: t,
        description: description.trim() || null,
        priority,
        type,
        status: 'open',
        project_id: projectId || null,
      });
      setDone(true);
      dispatchDataInvalidation('issues');
      setTimeout(() => {
        onClose();
        setDone(false);
      }, 600);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to create issue');
    } finally {
      setSaving(false);
    }
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
            disabled={!title.trim() || saving || done}
            className="px-4 py-2 rounded-xl text-[13px] font-semibold text-primary-foreground transition-opacity disabled:opacity-40 inline-flex items-center gap-2"
            style={{ background: done ? '#10b981' : 'var(--primary)' }}
          >
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {done ? <><Check className="h-3.5 w-3.5" /> Created</> : saving ? 'Saving…' : 'Create issue'}
          </button>
        </>
      }
    >
      {/* Conversation context badge */}
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

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl text-[12px]"
          style={{ background: 'color-mix(in srgb, #ef4444 8%, var(--secondary))', border: '1px solid color-mix(in srgb, #ef4444 20%, var(--border))' }}>
          <span style={{ color: '#ef4444' }}>{error}</span>
        </div>
      )}

      <div>
        <label className={labelClass} style={labelStyle}>Title</label>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          className={inputClass}
          style={inputStyle}
        />
      </div>

      <div>
        <label className={labelClass} style={labelStyle}>Description</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={3}
          className={cn(inputClass, 'resize-none')}
          style={inputStyle}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass} style={labelStyle}>Type</label>
          <select
            value={type}
            onChange={e => setType(e.target.value)}
            className={cn(inputClass, 'cursor-pointer')}
            style={inputStyle}
          >
            <option value="bug">Bug</option>
            <option value="feature">Feature request</option>
            <option value="improvement">Improvement</option>
          </select>
        </div>
        <div>
          <label className={labelClass} style={labelStyle}>Priority</label>
          <select
            value={priority}
            onChange={e => setPriority(e.target.value)}
            className={cn(inputClass, 'cursor-pointer')}
            style={inputStyle}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>

      {/* Project select */}
      <div>
        <label className={labelClass} style={labelStyle}>Project (optional)</label>
        <select
          value={projectId}
          onChange={e => setProjectId(e.target.value)}
          className={cn(inputClass, 'cursor-pointer')}
          style={inputStyle}
        >
          <option value="">— no project —</option>
          {(projects ?? []).map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>
    </ModalChrome>
  );
}
