'use client';
import { Suspense } from 'react';
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, Plus, RefreshCw, X, Send, ArrowLeft,
  Sparkles, FileText, Link as LinkIcon, Loader2,
  Mail, MessageCircle, MessageSquare, StickyNote,
  AlertCircle, WifiOff,
  Plug, ExternalLink, Filter, Wand2, Copy, Check,
  RotateCcw, Zap, ListTodo, Bug,
} from 'lucide-react';
import { CommunicationCreateTaskModal, CommunicationCreateIssueModal } from './communication/CommTaskIssueModals';
import { BonsaiButton } from './bonsai/BonsaiButton';
import { cn } from './ui/utils';
import { useMediaQuery } from '../lib/use-media-query';
import { useSearchParams } from 'next/navigation';

/* ═══════════════════════════════════════════════════════════
   Types
═══════════════════════════════════════════════════════════ */
type Channel = 'email' | 'linkedin' | 'whatsapp' | 'internal' | 'unknown';
type AccountStatus = 'CONNECTED' | 'RUNNING' | 'STOPPED' | 'CONNECTING' | 'ERROR';

interface UnipileAccount {
  id: string;
  type: string; // 'LINKEDIN' | 'WHATSAPP' | 'GOOGLE' | 'MICROSOFT' | etc.
  name?: string;
  username?: string;
  status: AccountStatus;
  created_at?: string;
}

interface UnipileMessage {
  id?: string;
  message_id?: string;
  /** Unipile: true if the connected account sent this message */
  is_sender?: boolean;
  from_me?: boolean;
  sender?: { name?: string; identifier?: string; display_name?: string; first_name?: string; last_name?: string };
  text?: string;
  body?: string;
  timestamp?: string;
  created_at?: string;
  seen?: boolean;
}

interface UnipileChat {
  id: string;
  account_id: string;
  provider?: string;
  name?: string;
  attendees?: { name?: string; identifier?: string; headline?: string }[];
  last_message?: { text?: string; timestamp?: string; from_me?: boolean };
  unread_count?: number;
  timestamp?: string;
  updated_at?: string;
  subject?: string;
  is_unread?: boolean;
}

/* ═══════════════════════════════════════════════════════════
   Helpers
═══════════════════════════════════════════════════════════ */
function providerToChannel(type: string): Channel {
  const t = (type || '').toUpperCase();
  if (t.includes('LINKEDIN')) return 'linkedin';
  if (t.includes('WHATSAPP')) return 'whatsapp';
  if (t.includes('GOOGLE') || t.includes('MICROSOFT') || t.includes('IMAP') || t.includes('MAIL')) return 'email';
  if (t.includes('INTERNAL')) return 'internal';
  return 'unknown';
}

function channelFromAccountId(accountId: string, accounts: UnipileAccount[]): Channel {
  const acc = accounts.find(a => a.id === accountId);
  return acc ? providerToChannel(acc.type) : 'unknown';
}

const CHANNEL_ICON: Record<Channel, React.ElementType> = {
  email: Mail, linkedin: MessageCircle, whatsapp: MessageSquare, internal: StickyNote, unknown: MessageSquare,
};
const CHANNEL_LABEL: Record<Channel, string> = {
  email: 'Email', linkedin: 'LinkedIn', whatsapp: 'WhatsApp', internal: 'Internal', unknown: 'Message',
};
const CHANNEL_COLOR: Record<Channel, string> = {
  email: '#2563eb', linkedin: '#0077b5', whatsapp: '#16a34a', internal: '#6b7280', unknown: '#6b7280',
};
const CHANNEL_GRADIENT: Record<Channel, string> = {
  email: 'linear-gradient(135deg,#2563eb,#1e40af)',
  linkedin: 'linear-gradient(135deg,#0077b5,#004e7c)',
  whatsapp: 'linear-gradient(135deg,#25d366,#128c7e)',
  internal: 'linear-gradient(135deg,#6b7280,#374151)',
  unknown: 'linear-gradient(135deg,#6b7280,#374151)',
};

function timeAgo(iso: string) {
  if (!iso) return '';
  const d = Date.now() - new Date(iso).getTime();
  const m = Math.floor(d / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function fmtTime(iso: string) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

/** Single attendee display name (Unipile shapes vary by provider) */
function attendeeDisplayName(a: Record<string, unknown> | undefined): string {
  if (!a || typeof a !== 'object') return '';
  const o = a as any;
  if (o.is_self === true || o.self === true) return '';
  const combined = [o.first_name, o.last_name].filter(Boolean).join(' ').trim();
  const n =
    o.display_name ||
    o.name ||
    o.full_name ||
    combined ||
    o.phone_number ||
    o.identifier ||
    o.public_identifier ||
    '';
  return typeof n === 'string' ? n.trim() : '';
}

/** Resolve a display name from a Unipile chat object.
 *  Unipile uses different field names per provider (LinkedIn, WhatsApp, Gmail, etc.)
 */
function chatName(chat: UnipileChat): string {
  const c = chat as any;

  if (chat.name && String(chat.name).trim() && chat.name !== 'undefined') return String(chat.name).trim();

  for (const key of ['display_name', 'formatted_name', 'chat_name', 'title']) {
    const v = c[key];
    if (v && String(v).trim()) return String(v).trim();
  }

  if (c.phone_number && String(c.phone_number).trim()) return String(c.phone_number).trim();
  if (c.identifier && String(c.identifier).trim() && !String(c.identifier).includes('chat')) return String(c.identifier).trim();

  const fa = c.from_attendees;
  if (Array.isArray(fa) && fa.length) {
    const n = fa.map(attendeeDisplayName).filter(Boolean);
    if (n.length) return n.join(', ');
    const raw = fa[0]?.display_name || fa[0]?.name;
    if (raw && String(raw).trim()) return String(raw).trim();
  }

  const ta = c.to_attendees;
  if (Array.isArray(ta) && ta.length) {
    const n = ta.map(attendeeDisplayName).filter(Boolean);
    if (n.length) return n.join(', ');
  }

  if (Array.isArray(chat.attendees) && chat.attendees.length) {
    const fromAtt = chat.attendees.map(a => attendeeDisplayName(a as any)).filter(Boolean);
    if (fromAtt.length) return fromAtt.join(', ');
    const names = chat.attendees
      .map((a: any) => a.display_name || a.name || a.full_name || a.identifier || a.phone_number || '')
      .filter(Boolean);
    if (names.length) return names.join(', ');
  }

  const parts = c.participants;
  if (Array.isArray(parts) && parts.length) {
    const n = attendeeDisplayName(parts[0]) || parts[0]?.name || parts[0]?.display_name;
    if (n) return String(n);
  }

  const headline = c.headline || c.subject;
  if (headline && String(headline).trim() && headline !== chat.name) return String(headline).trim();

  return 'Unknown Contact';
}

/** Profile image URL from chat or attendee (when Unipile provides it) */
function chatAvatarUrl(chat: UnipileChat): string | null {
  const c = chat as any;
  const tryUrl = (o: any) => o?.picture_url || o?.avatar_url || o?.profile_picture_url || o?.photo_url || o?.picture;
  const direct = tryUrl(c);
  if (typeof direct === 'string' && direct.startsWith('http')) return direct;
  const attendees = Array.isArray(c.attendees) ? c.attendees : [];
  for (const a of attendees) {
    if (a && (a as any).is_self) continue;
    const u = tryUrl(a);
    if (typeof u === 'string' && u.startsWith('http')) return u;
  }
  const fa = c.from_attendees;
  if (Array.isArray(fa)) {
    for (const a of fa) {
      const u = tryUrl(a);
      if (typeof u === 'string' && u.startsWith('http')) return u;
    }
  }
  return null;
}

function chatSnippet(chat: UnipileChat): string {
  const t = chat.last_message?.text;
  if (t && t.trim()) return t.trim();
  // For email, subject is usually separate from name
  const subj = chat.subject;
  if (subj && subj !== chatName(chat)) return subj;
  return 'No messages yet';
}

function chatTime(chat: UnipileChat): string {
  return timeAgo(chat.last_message?.timestamp || chat.timestamp || chat.updated_at || '');
}

/** Initials avatar from a name string */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

/** Detect if a message was sent by the connected account. Unipile standard field is `is_sender`. */
function isSentByMe(msg: any): boolean {
  if (typeof msg.is_sender === 'boolean') return msg.is_sender;
  if (msg.is_sender === 1 || msg.is_sender === '1' || msg.is_sender === 'true') return true;
  if (msg.is_sender === 0 || msg.is_sender === '0' || msg.is_sender === 'false') return false;
  if (typeof msg.from_me === 'boolean') return msg.from_me;
  if (msg.direction === 'OUTGOING' || msg.direction === 'sent') return true;
  if (msg.direction === 'INCOMING' || msg.direction === 'received') return false;
  if (msg.sender?.role === 'FROM' && msg.sender?.self === true) return true;
  return false;
}

function messageStableId(msg: any, index: number): string {
  return String(msg.id ?? msg.message_id ?? msg.provider_id ?? `msg-${index}`);
}

function messageTimeMs(msg: any): number {
  const raw = msg.timestamp || msg.created_at || msg.date || '';
  const t = raw ? new Date(raw).getTime() : 0;
  return Number.isFinite(t) ? t : 0;
}

/** Unipile returns newest-first; chat UIs expect oldest at top */
function sortMessagesOldestFirst<T>(items: T[]): T[] {
  return [...items].sort((a: any, b: any) => messageTimeMs(a) - messageTimeMs(b));
}

function displaySenderName(msg: any, contactName: string): string {
  const s = msg.sender;
  if (!s) return contactName;
  const combined = [s.first_name, s.last_name].filter(Boolean).join(' ').trim();
  return (
    s.name ||
    s.display_name ||
    combined ||
    s.identifier ||
    contactName
  );
}

/* ═══════════════════════════════════════════════════════════
   Account Status Badge
═══════════════════════════════════════════════════════════ */
function StatusDot({ status }: { status: AccountStatus }) {
  const cls = {
    RUNNING: 'bg-emerald-500', CONNECTED: 'bg-emerald-500',
    CONNECTING: 'bg-amber-500 animate-pulse', STOPPED: 'bg-red-500', ERROR: 'bg-red-500',
  }[status] || 'bg-gray-400';
  return <span className={cn('inline-block h-2 w-2 rounded-full shrink-0', cls)} />;
}

/** Single channel filter — segmented control (replaces duplicate “All Channels” dropdown vs account tabs) */
function ChannelSegmented({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const opts: { id: string; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'email', label: 'Email' },
    { id: 'linkedin', label: 'LinkedIn' },
    { id: 'whatsapp', label: 'WhatsApp' },
    { id: 'internal', label: 'Internal' },
  ];
  return (
    <div
      className="flex p-0.5 rounded-[11px] gap-0.5 overflow-x-auto scrollbar-none max-w-full"
      role="group"
      aria-label="Filter by channel type"
      style={{
        background: 'color-mix(in srgb, var(--foreground) 4.5%, var(--secondary))',
        boxShadow: 'inset 0 1px 2px color-mix(in srgb, var(--foreground) 5%, transparent)',
      }}>
      {opts.map(o => {
        const active = value === o.id;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            className={cn(
              'shrink-0 rounded-[9px] px-2.5 py-1.5 text-[11px] font-semibold tracking-tight transition-all duration-200',
              active ? 'shadow-sm' : 'hover:opacity-90',
            )}
            style={{
              background: active ? 'var(--background)' : 'transparent',
              color: active ? 'var(--foreground)' : 'var(--muted-foreground)',
              boxShadow: active ? '0 1px 2px color-mix(in srgb, var(--foreground) 10%, transparent)' : undefined,
            }}>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Connect Accounts Panel (shown when no accounts)
═══════════════════════════════════════════════════════════ */
function ConnectPanel({ onConnect, connecting }: {
  onConnect: (provider: string) => void; connecting: string | null;
}) {
  const providers = [
    { id: 'linkedin', label: 'LinkedIn', icon: MessageCircle, color: '#0077b5', desc: 'Messages & InMails' },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare, color: '#16a34a', desc: 'WhatsApp messages' },
    { id: 'gmail', label: 'Gmail', icon: Mail, color: '#ea4335', desc: 'Google email' },
    { id: 'outlook', label: 'Outlook', icon: Mail, color: '#0078d4', desc: 'Microsoft email' },
  ];

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-8 gap-6">
      <div className="text-center max-w-sm">
        <div className="mb-4 flex justify-center">
          <div className="rounded-2xl p-3" style={{ background: 'var(--secondary)' }}>
            <Plug className="h-8 w-8" style={{ color: 'var(--primary)' }} />
          </div>
        </div>
        <h3 className="text-[15px] font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
          Connect your accounts
        </h3>
        <p className="text-[12px] leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
          Connect LinkedIn, WhatsApp, and email accounts to see all your messages in one place.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
        {providers.map(p => {
          const Icon = p.icon;
          const isConnecting = connecting === p.id;
          return (
            <button key={p.id} onClick={() => onConnect(p.id)} disabled={!!connecting}
              className="flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ borderColor: 'var(--border)', background: 'var(--secondary)' }}>
              {isConnecting
                ? <Loader2 className="h-6 w-6 animate-spin" style={{ color: p.color }} />
                : <Icon className="h-6 w-6" style={{ color: p.color }} />}
              <span className="text-[12px] font-medium" style={{ color: 'var(--foreground)' }}>{p.label}</span>
              <span className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>{p.desc}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Account Selector Bar
═══════════════════════════════════════════════════════════ */
function AccountBar({ accounts, selectedId, onSelect, onConnect, onRefresh, connecting }: {
  accounts: UnipileAccount[]; selectedId: string; onSelect: (id: string) => void;
  onConnect: (provider: string) => void; onRefresh: () => void; connecting: string | null;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [dropPos, setDropPos] = useState({ top: 0, left: 0 });

  // Close on outside click
  useEffect(() => {
    if (!showAdd) return;
    const h = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!btnRef.current?.contains(t)) setShowAdd(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [showAdd]);

  const openDrop = () => {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setDropPos({ top: r.bottom + 6, left: r.left });
    }
    setShowAdd(v => !v);
  };


  return (
    <div className="flex items-center gap-2 px-4 py-2 overflow-x-auto scrollbar-none"
      style={{ borderBottom: '1px solid var(--border)', background: 'var(--sidebar-glass)' }}>
      {/* All accounts tab */}
      <button onClick={() => onSelect('all')}
        className={cn('flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-medium whitespace-nowrap transition-colors shrink-0',
          selectedId === 'all' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary')}
        style={selectedId !== 'all' ? { color: 'var(--muted-foreground)' } : {}}>
        All
      </button>

      {/* Per-account tabs */}
      {accounts.map(acc => {
        const ch = providerToChannel(acc.type);
        const Icon = CHANNEL_ICON[ch];
        const isActive = selectedId === acc.id;
        return (
          <button key={acc.id} onClick={() => onSelect(acc.id)}
            className={cn('flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-medium whitespace-nowrap transition-colors shrink-0',
              isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary')}
            style={!isActive ? { color: 'var(--foreground)' } : {}}>
            <StatusDot status={acc.status} />
            <Icon className="h-3.5 w-3.5 shrink-0" style={isActive ? {} : { color: CHANNEL_COLOR[ch] }} />
            <span className="max-w-[80px] truncate">{CHANNEL_LABEL[ch]}{acc.username ? ` · ${acc.username}` : ''}</span>
          </button>
        );
      })}

      {/* Add account — fixed dropdown */}
      <div className="relative shrink-0">
        <button ref={btnRef} onClick={openDrop} disabled={!!connecting}
          className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] font-semibold transition-all hover:bg-secondary disabled:opacity-50"
          style={{ borderColor: 'var(--border)', color: 'var(--foreground)', letterSpacing: '0.02em' }}>
          {connecting
            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
            : <Plus className="h-3.5 w-3.5" style={{ color: 'var(--primary)' }} />}
          Connect
        </button>
      </div>

      {/* Premium fixed-position dropdown */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -4 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'fixed',
              top: dropPos.top,
              left: dropPos.left,
              zIndex: 9999,
              width: '260px',
            }}>
            {/* Glass card */}
            <div style={{
              background: 'linear-gradient(145deg, color-mix(in srgb, var(--popover) 97%, var(--primary) 3%), var(--popover))',
              border: '1px solid color-mix(in srgb, var(--border) 80%, var(--primary) 20%)',
              borderRadius: '16px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.03) inset',
              overflow: 'hidden',
            }}>
              {/* Header */}
              <div className="px-4 pt-4 pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
                <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--muted-foreground)', letterSpacing: '0.1em' }}>
                  Connect Account
                </p>
                <p className="text-[12px] mt-0.5" style={{ color: 'var(--foreground)' }}>
                  Add a new messaging channel
                </p>
              </div>

              {/* Provider list */}
              <div className="p-2 space-y-0.5">
                {([
                  {
                    id: 'linkedin', label: 'LinkedIn', desc: 'Messages & InMail',
                    gradient: 'linear-gradient(135deg, #0077b5, #004e7c)',
                    icon: (
                      <svg viewBox="0 0 24 24" fill="white" className="h-4 w-4">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    ),
                  },
                  {
                    id: 'whatsapp', label: 'WhatsApp', desc: 'Mobile & Business',
                    gradient: 'linear-gradient(135deg, #25d366, #128c7e)',
                    icon: (
                      <svg viewBox="0 0 24 24" fill="white" className="h-4 w-4">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    ),
                  },
                  {
                    id: 'gmail', label: 'Gmail', desc: 'Google Workspace email',
                    gradient: 'linear-gradient(135deg, #ea4335, #c5221f)',
                    icon: (
                      <svg viewBox="0 0 24 24" fill="white" className="h-4 w-4">
                        <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 010 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
                      </svg>
                    ),
                  },
                ] as { id: string; label: string; desc: string; gradient: string; icon: React.ReactNode }[]).map(p => (
                  <button key={p.id}
                    onClick={() => { onConnect(p.id); setShowAdd(false); }}
                    className="group w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all hover:bg-white/5"
                    style={{ color: 'var(--foreground)' }}>
                    {/* Brand icon */}
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-md transition-transform group-hover:scale-105"
                      style={{ background: p.gradient }}>
                      {connecting === p.id
                        ? <Loader2 className="h-4 w-4 animate-spin text-white" />
                        : p.icon}
                    </div>
                    {/* Text */}
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold leading-tight" style={{ color: 'var(--foreground)' }}>{p.label}</p>
                      <p className="text-[11px] mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{p.desc}</p>
                    </div>
                    {/* Arrow */}
                    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0 opacity-0 group-hover:opacity-40 transition-opacity -translate-x-1 group-hover:translate-x-0 transition-transform" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 12l4-4-4-4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                ))}
              </div>

              {/* Footer */}
              <div className="px-4 py-2.5" style={{ borderTop: '1px solid var(--border)' }}>
                <p className="text-[10px] text-center" style={{ color: 'var(--muted-foreground)' }}>
                  Powered by <span className="font-semibold">Unipile</span> · Secure OAuth
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1" />
      <button onClick={onRefresh} title="Refresh" className="rounded-lg p-1.5 transition-colors hover:bg-secondary shrink-0" style={{ color: 'var(--muted-foreground)' }}>
        <RefreshCw className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Chat Row
═══════════════════════════════════════════════════════════ */
function lastMessageFromMe(lm: { is_sender?: boolean; from_me?: boolean } | undefined): boolean {
  if (!lm) return false;
  if (typeof lm.is_sender === 'boolean') return lm.is_sender;
  if (typeof lm.from_me === 'boolean') return lm.from_me;
  return false;
}

function ChatRow({ chat, accounts, active, onClick }: {
  chat: UnipileChat; accounts: UnipileAccount[]; active: boolean; onClick: () => void;
}) {
  const [avatarFailed, setAvatarFailed] = useState(false);
  useEffect(() => { setAvatarFailed(false); }, [chat.id]);
  const channel = channelFromAccountId(chat.account_id, accounts);
  const Icon = CHANNEL_ICON[channel];
  const isUnread = (chat.unread_count || 0) > 0 || chat.is_unread;
  const name = chatName(chat);
  const snippet = chatSnippet(chat);
  const avatarUrl = chatAvatarUrl(chat);
  const showImg = avatarUrl && !avatarFailed;
  // Only show subject as subtitle if it differs from the name AND differs from snippet
  const showSubject = chat.subject && chat.subject !== name && chat.subject !== snippet;

  return (
    <button type="button" onClick={onClick}
      className={cn('w-full text-left px-4 py-3.5 transition-all border-b focus-visible:outline-none',
        active
          ? 'bg-primary/[0.08] border-l-2 border-l-primary'
          : isUnread
          ? 'bg-blue-500/[0.04] hover:bg-secondary/70'
          : 'hover:bg-secondary/60')}
      style={{ borderColor: 'var(--border)' }}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0 h-9 w-9 rounded-full overflow-hidden flex items-center justify-center text-white text-[11px] font-bold shadow-sm"
          style={{ background: CHANNEL_GRADIENT[channel], boxShadow: `0 2px 8px ${CHANNEL_COLOR[channel]}40` }}>
          {showImg ? (
            <img src={avatarUrl!} alt="" className="h-full w-full object-cover" loading="lazy"
              onError={() => setAvatarFailed(true)} />
          ) : (
            <span className="flex items-center justify-center w-full h-full">
              {name !== 'Unknown Contact' ? initials(name) : <Icon className="h-4 w-4" />}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className={cn('truncate text-[13px]', isUnread ? 'font-semibold' : 'font-medium')} style={{ color: 'var(--foreground)' }}>
                {name}
              </span>
              {isUnread && <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />}
              {(chat.unread_count || 0) > 1 && (
                <span className="rounded-full bg-blue-500 px-1.5 py-0.5 text-[9px] font-bold text-white shrink-0">{chat.unread_count}</span>
              )}
            </div>
            <span className="text-[10px] tabular-nums shrink-0" style={{ color: 'var(--muted-foreground)' }}>{chatTime(chat)}</span>
          </div>
          {showSubject && (
            <p className="text-[11px] truncate mb-0.5 font-medium" style={{ color: 'var(--foreground)', opacity: 0.75 }}>{chat.subject}</p>
          )}
          <p className="text-[11px] truncate leading-snug" style={{ color: 'var(--muted-foreground)' }}>
            {lastMessageFromMe(chat.last_message) ? <span className="font-medium" style={{ color: 'var(--primary)' }}>You: </span> : ''}{snippet}
          </p>
        </div>
      </div>
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════
   Reply Box — AI reply (segmented tone) + auto-growing composer
═══════════════════════════════════════════════════════════ */
type ReplyTone = 'professional' | 'friendly' | 'concise' | 'detailed';

const REPLY_TONES: { id: ReplyTone; label: string; subtitle: string }[] = [
  { id: 'professional', label: 'Professional', subtitle: 'Clear & formal' },
  { id: 'friendly', label: 'Friendly', subtitle: 'Warm tone' },
  { id: 'concise', label: 'Concise', subtitle: 'Brief' },
  { id: 'detailed', label: 'Detailed', subtitle: 'Thorough' },
];

function ReplyBox({ onSend, sending, messages, chatName: cName, channel }: {
  onSend: (text: string) => Promise<void> | void;
  sending: boolean;
  messages: any[]; chatName?: string; channel?: string;
}) {
  const [text, setText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [showTones, setShowTones] = useState(false);
  const [selectedTone, setSelectedTone] = useState<ReplyTone>('professional');
  const [aiGenerated, setAiGenerated] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const MAX_TA_PX = 280;

  const autoResize = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = '0px';
    const next = Math.min(ta.scrollHeight, MAX_TA_PX);
    ta.style.height = `${Math.max(next, 44)}px`;
  }, []);

  useEffect(() => { autoResize(); }, [text, autoResize]);
  useEffect(() => {
    if (aiLoading) {
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [aiLoading]);

  const sendNow = async () => {
    const t = text.trim();
    if (!t || sending || aiLoading) return;
    try {
      await onSend(t);
      setText('');
      setAiGenerated(false);
      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.style.height = '44px';
        }
      });
    } catch {
      /* parent surfaced error */
    }
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void sendNow();
    }
  };

  const generateReply = async (tone: ReplyTone) => {
    if (messages.length === 0) return;
    setAiLoading(true);
    setAiError('');
    setShowTones(false);
    setAiGenerated(false);
    try {
      const msgPayload = messages.slice(-16).map((m: any) => ({
        sender: m.sender?.name || m.sender?.display_name || cName || 'Contact',
        text: m.text || m.body || (m as any).content || '',
        timestamp: m.timestamp || m.created_at,
        from_me: isSentByMe(m),
      }));
      const res = await fetch('/api/ai/auto-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: msgPayload, chat_name: cName, channel, tone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate reply');
      setText(data.reply || '');
      setAiGenerated(true);
      requestAnimationFrame(() => {
        textareaRef.current?.focus();
        autoResize();
      });
    } catch (e: unknown) {
      setAiError(e instanceof Error ? e.message : 'Failed to generate reply');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
      <AnimatePresence>
        {aiError && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <div className="flex items-center gap-2 px-4 py-2 text-[11px]"
              style={{ background: 'color-mix(in srgb, #ef4444 8%, var(--background))', borderBottom: '1px solid color-mix(in srgb, #ef4444 15%, var(--border))' }}>
              <AlertCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
              <span className="flex-1 min-w-0 break-words" style={{ color: '#ef4444' }}>{aiError}</span>
              <button type="button" onClick={() => generateReply(selectedTone)} className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-md hover:bg-red-500/10" style={{ color: '#ef4444' }}>Retry</button>
              <button type="button" onClick={() => setAiError('')} className="shrink-0"><X className="h-3 w-3" style={{ color: 'var(--muted-foreground)' }} /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showTones && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
            className="px-3 pt-3 pb-2"
            style={{
              background: 'color-mix(in srgb, var(--secondary) 88%, var(--background))',
              borderBottom: '1px solid var(--border)',
              backdropFilter: 'saturate(180%) blur(12px)',
            }}>
            <div className="flex items-center gap-2 mb-2.5">
              <span className="text-[13px] font-semibold tracking-tight" style={{ color: 'var(--foreground)' }}>Smart reply</span>
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md" style={{ background: 'color-mix(in srgb, var(--foreground) 6%, transparent)', color: 'var(--muted-foreground)' }}>Choose tone</span>
              <div className="flex-1" />
              <button type="button" onClick={() => setShowTones(false)} className="rounded-full p-1 hover:bg-black/5 dark:hover:bg-white/10 transition-colors" style={{ color: 'var(--muted-foreground)' }} aria-label="Close tone picker">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            {/* Segmented control — Apple-style pill */}
            <div
              className="flex p-0.5 rounded-xl gap-0.5 overflow-x-auto scrollbar-none snap-x snap-mandatory"
              style={{
                background: 'color-mix(in srgb, var(--foreground) 5%, var(--secondary))',
                boxShadow: 'inset 0 1px 2px color-mix(in srgb, var(--foreground) 6%, transparent)',
              }}>
              {REPLY_TONES.map(t => {
                const active = selectedTone === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => { setSelectedTone(t.id); void generateReply(t.id); }}
                    className={cn(
                      'snap-start shrink-0 min-w-[100px] flex-1 rounded-[10px] px-2.5 py-2 text-center transition-all duration-200',
                      active ? 'shadow-sm' : 'hover:opacity-90',
                    )}
                    style={{
                      background: active ? 'var(--background)' : 'transparent',
                      color: active ? 'var(--foreground)' : 'var(--muted-foreground)',
                      boxShadow: active ? '0 1px 3px color-mix(in srgb, var(--foreground) 12%, transparent)' : undefined,
                    }}>
                    <div className="text-[12px] font-semibold leading-tight tracking-tight">{t.label}</div>
                    <div className="text-[9px] mt-0.5 opacity-80 leading-tight">{t.subtitle}</div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {aiGenerated && text && !aiLoading && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <div className="flex items-center gap-2 px-4 py-1.5" style={{
              background: 'color-mix(in srgb, #10b981 5%, var(--background))',
              borderBottom: '1px solid color-mix(in srgb, #10b981 12%, var(--border))',
            }}>
              <div className="h-3.5 w-3.5 rounded-full flex items-center justify-center" style={{ background: '#10b981' }}>
                <Check className="h-2 w-2 text-white" />
              </div>
              <span className="text-[10px] font-medium" style={{ color: '#10b981' }}>Draft ready — review before sending</span>
              <div className="flex-1" />
              <button type="button" onClick={() => { setText(''); setAiGenerated(false); textareaRef.current?.focus(); }}
                className="text-[10px] font-medium px-2 py-0.5 rounded-md hover:bg-secondary transition-colors" style={{ color: 'var(--muted-foreground)' }}>Clear</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Unified composer: text + bottom toolbar (hint + smart reply + send) — aligns controls like iOS */}
      <div className="px-3 pb-3 pt-1">
        <div
          className="rounded-2xl border flex flex-col overflow-hidden"
          style={{
            borderColor: aiGenerated
              ? 'color-mix(in srgb, #10b981 28%, var(--border))'
              : aiLoading
              ? 'color-mix(in srgb, #6366f1 28%, var(--border))'
              : 'color-mix(in srgb, var(--border) 92%, transparent)',
            background: aiGenerated
              ? 'color-mix(in srgb, #10b981 5%, var(--secondary))'
              : 'color-mix(in srgb, var(--secondary) 88%, var(--background))',
            boxShadow: '0 1px 2px color-mix(in srgb, var(--foreground) 4%, transparent)',
          }}>
          <div className="relative min-h-[48px]">
            {aiLoading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center gap-2 rounded-t-2xl pointer-events-none"
                style={{ background: 'color-mix(in srgb, var(--background) 88%, transparent)' }}>
                <Sparkles className="h-3.5 w-3.5" style={{ color: '#6366f1' }} />
                <span className="text-[11px] font-medium" style={{ color: 'var(--muted-foreground)' }}>
                  {REPLY_TONES.find(x => x.id === selectedTone)?.label ?? 'Smart'} reply
                </span>
                <span className="flex gap-0.5">
                  <span className="h-1 w-1 rounded-full bg-[#6366f1]" style={{ animation: 'aiDot 1.2s infinite 0s' }} />
                  <span className="h-1 w-1 rounded-full bg-[#6366f1]" style={{ animation: 'aiDot 1.2s infinite 0.15s' }} />
                  <span className="h-1 w-1 rounded-full bg-[#6366f1]" style={{ animation: 'aiDot 1.2s infinite 0.3s' }} />
                </span>
                {elapsed > 0 && (
                  <span className="text-[9px] tabular-nums" style={{ color: 'var(--muted-foreground)' }}>{elapsed}s</span>
                )}
              </div>
            )}
            <textarea
              ref={textareaRef}
              value={text}
              onChange={e => { setText(e.target.value); if (aiGenerated) setAiGenerated(false); }}
              onKeyDown={onKey}
              disabled={sending || aiLoading}
              rows={1}
              placeholder="Message…"
              className="w-full border-0 bg-transparent px-3.5 pt-3 pb-2 text-[13px] leading-[1.45] resize-none outline-none focus:ring-0"
              style={{
                minHeight: 48,
                maxHeight: MAX_TA_PX,
                color: 'var(--foreground)',
              }}
            />
          </div>
          <div
            className="flex items-center justify-between gap-2 px-2 pb-2 pt-0.5 border-t"
            style={{ borderColor: 'color-mix(in srgb, var(--border) 75%, transparent)' }}>
            <p className="text-[9px] pl-1 min-w-0 truncate" style={{ color: 'var(--muted-foreground)' }}>
              Return to send · Shift+Return for new line
            </p>
            <div className="flex items-center gap-1.5 shrink-0">
              <motion.button
                whileTap={{ scale: 0.96 }}
                type="button"
                onClick={() => { if (showTones) void generateReply(selectedTone); else setShowTones(true); }}
                disabled={aiLoading || messages.length === 0}
                title="Smart reply"
                className="flex h-9 w-9 items-center justify-center rounded-xl transition-all disabled:opacity-30"
                style={{
                  background: 'linear-gradient(180deg, #a855f7, #6366f1)',
                  boxShadow: '0 0 0 1px color-mix(in srgb, white 18%, transparent) inset, 0 2px 8px rgba(99,102,241,0.3)',
                  color: 'white',
                }}>
                {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.96 }}
                type="button"
                onClick={() => void sendNow()}
                disabled={!text.trim() || sending || aiLoading}
                className="flex h-9 w-9 items-center justify-center rounded-xl transition-all disabled:opacity-35"
                style={{
                  background: text.trim() ? 'var(--primary)' : 'var(--secondary)',
                  color: text.trim() ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
                  border: text.trim() ? 'none' : '1px solid var(--border)',
                  boxShadow: text.trim() ? '0 0 0 1px color-mix(in srgb, white 10%, transparent) inset' : undefined,
                }}>
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes aiDot {
          0%, 80%, 100% { opacity: 0.25; transform: scale(0.85); }
          40% { opacity: 1; transform: scale(1.15); }
        }
      `}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Chat Detail — with real AI Summarization
═══════════════════════════════════════════════════════════ */
function ChatDetail({ chat, accounts, onBack, onSend, sending }: {
  chat: UnipileChat; accounts: UnipileAccount[];
  onBack?: () => void; onSend: (text: string) => Promise<void>; sending: boolean;
}) {
  const [messages, setMessages] = useState<UnipileMessage[]>([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [msgError, setMsgError] = useState('');

  // AI Summary state
  const [showSummary, setShowSummary] = useState(false);
  const [summaryText, setSummaryText] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState('');
  const [summaryCopied, setSummaryCopied] = useState(false);
  /** Set when last summary used full-thread fetch */
  const [summaryThreadCount, setSummaryThreadCount] = useState<number | null>(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [issueModalOpen, setIssueModalOpen] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  const channel = channelFromAccountId(chat.account_id, accounts);
  const Icon = CHANNEL_ICON[channel];
  const name = chatName(chat);

  const contextSnippet = useMemo(() => {
    return messages
      .slice(-8)
      .map(m => (m.text || m.body || (m as any).content || '').trim())
      .filter(Boolean)
      .join('\n')
      .slice(0, 1200);
  }, [messages]);

  const fetchMessages = useCallback(async () => {
    setLoadingMsgs(true); setMsgError('');
    try {
      const res = await fetch(`/api/unipile/messages?chat_id=${encodeURIComponent(chat.id)}&limit=30`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load messages');
      const raw: UnipileMessage[] = Array.isArray(data) ? data : (data.items || data.messages || []);
      setMessages(sortMessagesOldestFirst(raw));
    } catch (e: any) {
      setMsgError(e.message);
    } finally {
      setLoadingMsgs(false);
    }
  }, [chat.id]);

  /** Full thread (paginated server-side) → short model summary — not limited to on-screen messages */
  const fetchSummary = useCallback(async () => {
    setSummaryLoading(true);
    setSummaryError('');
    setSummaryText('');
    setSummaryThreadCount(null);
    try {
      const res = await fetch(
        `/api/unipile/messages?chat_id=${encodeURIComponent(chat.id)}&fetch_all=1`,
      );
      const data = await res.json();
      if (!res.ok) {
        const err = data.error;
        const msg = typeof err === 'string' ? err : (err?.detail || err?.title || JSON.stringify(err || data));
        throw new Error(msg || 'Failed to load conversation');
      }
      const items: UnipileMessage[] = Array.isArray(data.items) ? data.items : [];
      if (items.length === 0) {
        setSummaryError('No messages in this chat yet.');
        return;
      }

      const msgPayload = items.map((m: any) => ({
        sender: m.sender?.name || m.sender?.display_name || name || 'Contact',
        text: m.text || m.body || (m as any).content || '',
        timestamp: m.timestamp || m.created_at,
        from_me: isSentByMe(m),
      }));

      const resAi = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: msgPayload,
          chat_name: name,
          channel,
        }),
      });
      const out = await resAi.json();
      if (!resAi.ok) throw new Error(out.error || 'Summarization failed');
      setSummaryText(out.summary || 'No summary generated.');
      setSummaryThreadCount(typeof out.message_count === 'number' ? out.message_count : items.length);
    } catch (e: unknown) {
      setSummaryError(e instanceof Error ? e.message : 'Summarization failed');
    } finally {
      setSummaryLoading(false);
    }
  }, [chat.id, name, channel]);

  const copySummary = () => {
    navigator.clipboard.writeText(summaryText);
    setSummaryCopied(true);
    setTimeout(() => setSummaryCopied(false), 2000);
  };

  const handleToggleSummary = () => {
    if (!showSummary) {
      setShowSummary(true);
      // Auto-fetch if we don't have a summary yet
      if (!summaryText && !summaryLoading) fetchSummary();
    } else {
      setShowSummary(false);
    }
  };

  useEffect(() => { fetchMessages(); }, [fetchMessages]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => {
    setSummaryText('');
    setSummaryError('');
    setShowSummary(false);
    setSummaryThreadCount(null);
  }, [chat.id]);

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="shrink-0 px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2">
          {onBack && (
            <button onClick={onBack} className="hub-touch-target shrink-0 rounded-lg lg:hidden" style={{ color: 'var(--muted-foreground)' }}>
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <Icon className="h-4 w-4 shrink-0" style={{ color: CHANNEL_COLOR[channel] }} />
          <h2 className="text-[13px] font-semibold truncate flex-1" style={{ color: 'var(--foreground)' }}>{name}</h2>
          {chat.unread_count ? (
            <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">{chat.unread_count} unread</span>
          ) : null}
          <button onClick={fetchMessages} title="Refresh messages" className="rounded-lg p-1.5 hover:bg-secondary transition-colors shrink-0" style={{ color: 'var(--muted-foreground)' }}>
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
        {chat.subject && <p className="text-[11px] mt-1 ml-6" style={{ color: 'var(--muted-foreground)' }}>{chat.subject}</p>}
      </div>

      {/* AI Summary panel */}
      <AnimatePresence>
        {showSummary && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="shrink-0 mx-4 mt-3">
            <div className="rounded-xl overflow-hidden" style={{
              background: 'linear-gradient(135deg, color-mix(in srgb, var(--primary) 6%, var(--background)), color-mix(in srgb, #a855f7 4%, var(--background)))',
              border: '1px solid color-mix(in srgb, var(--primary) 20%, var(--border))',
              boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
            }}>
              {/* Summary header */}
              <div className="flex items-center gap-2 px-3 py-2" style={{ borderBottom: '1px solid color-mix(in srgb, var(--primary) 10%, var(--border))' }}>
                <div className="flex items-center justify-center h-5 w-5 rounded-md" style={{ background: 'linear-gradient(135deg, #a855f7, #6366f1)' }}>
                  <Sparkles className="h-3 w-3 text-white" />
                </div>
                <div className="min-w-0 flex flex-col gap-0.5">
                  <span className="text-[11px] font-semibold" style={{ color: 'var(--foreground)' }}>AI Summary</span>
                  {summaryThreadCount != null && (
                    <span className="text-[9px] font-medium truncate" style={{ color: 'var(--muted-foreground)' }}>
                      Full thread · {summaryThreadCount} message{summaryThreadCount !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium shrink-0" style={{
                  background: 'color-mix(in srgb, var(--primary) 12%, transparent)',
                  color: 'var(--primary)',
                }}>Gemma 4</span>
                <div className="flex-1" />
                {summaryText && (
                  <>
                    <button onClick={copySummary} title="Copy summary"
                      className="rounded p-1 hover:bg-white/10 transition-colors" style={{ color: 'var(--muted-foreground)' }}>
                      {summaryCopied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    </button>
                    <button onClick={fetchSummary} title="Regenerate summary" disabled={summaryLoading}
                      className="rounded p-1 hover:bg-white/10 transition-colors disabled:opacity-40" style={{ color: 'var(--muted-foreground)' }}>
                      <RotateCcw className={cn('h-3 w-3', summaryLoading && 'animate-spin')} />
                    </button>
                  </>
                )}
                <button onClick={() => setShowSummary(false)} className="rounded p-1 hover:bg-white/10 transition-colors" style={{ color: 'var(--muted-foreground)' }}>
                  <X className="h-3 w-3" />
                </button>
              </div>

              {/* Summary content */}
              <div className="px-3.5 py-3 min-h-[56px]">
                {summaryLoading && (
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center justify-center h-4 w-4 rounded-md" style={{ background: 'linear-gradient(135deg, #a855f7, #6366f1)' }}>
                        <Sparkles className="h-2.5 w-2.5 text-white" />
                      </div>
                      <span className="text-[10px] font-medium" style={{ color: 'var(--muted-foreground)' }}>
                        Loading full thread, then summarizing…
                      </span>
                      <span className="flex gap-0.5 ml-1">
                        <span className="h-1 w-1 rounded-full" style={{ background: '#a855f7', animation: 'aiDot 1.4s infinite 0s' }} />
                        <span className="h-1 w-1 rounded-full" style={{ background: '#a855f7', animation: 'aiDot 1.4s infinite 0.2s' }} />
                        <span className="h-1 w-1 rounded-full" style={{ background: '#a855f7', animation: 'aiDot 1.4s infinite 0.4s' }} />
                      </span>
                    </div>
                    {/* Skeleton bars */}
                    {[100, 92, 85, 60].map((w, i) => (
                      <div key={i} className="rounded-md overflow-hidden" style={{
                        width: `${w}%`, height: '8px',
                        background: 'color-mix(in srgb, var(--foreground) 6%, var(--background))',
                        position: 'relative',
                      }}>
                        <div style={{
                          position: 'absolute', inset: 0,
                          background: 'linear-gradient(90deg, transparent, color-mix(in srgb, #a855f7 12%, transparent), transparent)',
                          animation: `aiShimmer 1.8s ease-in-out infinite ${i * 0.15}s`,
                        }} />
                      </div>
                    ))}
                  </div>
                )}
                {summaryError && (
                  <div className="flex items-center gap-2.5 py-1">
                    <div className="flex items-center justify-center h-5 w-5 rounded-full shrink-0" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
                      <AlertCircle className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-[11px] flex-1 font-medium" style={{ color: '#ef4444' }}>{summaryError}</span>
                    <button onClick={fetchSummary} className="text-[10px] font-semibold px-2.5 py-1 rounded-lg transition-colors hover:bg-red-500/10 shrink-0" style={{ color: '#ef4444', border: '1px solid color-mix(in srgb, #ef4444 25%, transparent)' }}>Retry</button>
                  </div>
                )}
                {!summaryLoading && !summaryError && summaryText && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-[11px] leading-[1.7] whitespace-pre-wrap ai-summary-content"
                    style={{ color: 'var(--foreground)' }}>
                    {summaryText}
                  </motion.div>
                )}
              </div>
              {/* Summary animations */}
              <style>{`
                @keyframes aiDot {
                  0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
                  40% { opacity: 1; transform: scale(1.3); }
                }
                @keyframes aiShimmer {
                  0% { transform: translateX(-100%); }
                  100% { transform: translateX(200%); }
                }
                .ai-summary-content { line-height: 1.7; }
                .ai-summary-content br + br { display: none; }
              `}</style>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {loadingMsgs && (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" style={{ color: 'var(--muted-foreground)' }} />
          </div>
        )}
        {msgError && (
          <div className="flex items-center gap-2 p-3 rounded-lg text-[12px]" style={{ background: 'var(--secondary)', color: 'var(--muted-foreground)' }}>
            <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
            {msgError}
            <button onClick={fetchMessages} className="ml-auto text-primary hover:underline">Retry</button>
          </div>
        )}
        {!loadingMsgs && !msgError && messages.length === 0 && (
          <p className="text-center text-[12px] py-8" style={{ color: 'var(--muted-foreground)' }}>No messages yet</p>
        )}
        {messages.map((msg, idx) => {
          const fromMe = isSentByMe(msg);
          const peerName = displaySenderName(msg, name);
          const senderName = fromMe ? 'You' : peerName;
          const text = msg.text || msg.body || (msg as any).content || '';
          const initialSrc = peerName !== 'Unknown Contact' ? peerName : name;
          return (
            <div key={messageStableId(msg, idx)} className={cn('flex gap-2.5', fromMe ? 'justify-end' : 'justify-start')}>
              {!fromMe && (
                <div className="shrink-0 h-7 w-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold mt-1"
                  style={{ background: CHANNEL_GRADIENT[channel] }}>
                  {initialSrc !== 'Unknown Contact' ? initials(initialSrc) : <span>?</span>}
                </div>
              )}
              <div className={cn('flex flex-col gap-1', fromMe ? 'items-end max-w-[72%]' : 'items-start max-w-[72%]')}>
                <div className={cn('flex items-center gap-1.5', fromMe ? 'flex-row-reverse' : 'flex-row')}>
                  <span className="text-[11px] font-semibold" style={{ color: 'var(--foreground)' }}>{senderName}</span>
                  <span className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>{fmtTime(msg.timestamp || msg.created_at || '')}</span>
                </div>
                <div className={cn('rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap break-words shadow-sm',
                  fromMe ? 'rounded-tr-sm' : 'rounded-tl-sm')}
                  style={fromMe
                    ? { background: 'var(--primary)', color: 'var(--primary-foreground)' }
                    : { background: 'var(--secondary)', color: 'var(--foreground)', border: '1px solid var(--border)' }}>
                  {text || <em className="opacity-50">Media / attachment</em>}
                </div>
              </div>
              {fromMe && (
                <div className="shrink-0 h-7 w-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold mt-1"
                  style={{ background: 'linear-gradient(135deg,var(--primary),color-mix(in srgb,var(--primary) 70%,#000))' }}>
                  Me
                </div>
              )}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Action bar — Design Foundation pattern: primary actions left, task/issue right */}
      <div
        className="shrink-0 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3"
        style={{
          borderTop: '1px solid color-mix(in srgb, var(--border) 90%, transparent)',
          background: 'linear-gradient(0deg, color-mix(in srgb, var(--secondary) 35%, transparent), transparent)',
        }}>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={handleToggleSummary}
            disabled={summaryLoading}
            className={cn(
              'flex items-center gap-1.5 rounded-[10px] border px-3 py-2 text-[12px] font-semibold tracking-tight transition-all disabled:opacity-40',
              showSummary
                ? 'bg-purple-500/15 border-purple-500/35 text-purple-600 dark:text-purple-300'
                : 'hover:bg-secondary/80',
            )}
            style={!showSummary ? {
              borderColor: 'color-mix(in srgb, #a855f7 28%, var(--border))',
              color: 'var(--foreground)',
            } : {}}>
            {summaryLoading
              ? <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" style={{ color: '#a855f7' }} />
              : <Sparkles className="h-3.5 w-3.5 shrink-0" style={{ color: '#a855f7' }} />}
            AI Summary
          </button>
          <BonsaiButton size="sm" variant="outline" className="rounded-[10px] gap-1.5 font-medium">
            <LinkIcon className="h-3.5 w-3.5" />Link to Record
          </BonsaiButton>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setTaskModalOpen(true)}
            className="flex items-center gap-1.5 rounded-[10px] border px-3 py-2 text-[12px] font-semibold tracking-tight transition-colors hover:bg-secondary/90"
            style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
            <ListTodo className="h-3.5 w-3.5 shrink-0 opacity-80" />
            Create task
          </button>
          <button
            type="button"
            onClick={() => setIssueModalOpen(true)}
            className="flex items-center gap-1.5 rounded-[10px] border px-3 py-2 text-[12px] font-semibold tracking-tight transition-colors hover:bg-secondary/90"
            style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
            <Bug className="h-3.5 w-3.5 shrink-0 opacity-80" />
            Create issue
          </button>
        </div>
      </div>

      <CommunicationCreateTaskModal
        open={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        contactName={name}
        chatId={chat.id}
        snippet={contextSnippet}
      />
      <CommunicationCreateIssueModal
        open={issueModalOpen}
        onClose={() => setIssueModalOpen(false)}
        contactName={name}
        chatId={chat.id}
        snippet={contextSnippet}
      />

      <ReplyBox
        onSend={async (t) => {
          await onSend(t);
          await fetchMessages();
        }}
        sending={sending}
        messages={messages}
        chatName={name}
        channel={channel}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Empty Detail placeholder
═══════════════════════════════════════════════════════════ */
function EmptyDetail() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3">
      <MessageSquare className="h-10 w-10" style={{ color: 'var(--muted-foreground)' }} />
      <p className="text-[13px]" style={{ color: 'var(--muted-foreground)' }}>Select a conversation to read</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Main Page
═══════════════════════════════════════════════════════════ */
function CommunicationInner() {
  const isLg = useMediaQuery('(min-width: 1024px)');
  const searchParams = useSearchParams();

  // Accounts
  const [accounts, setAccounts] = useState<UnipileAccount[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [accountsError, setAccountsError] = useState('');
  const [connecting, setConnecting] = useState<string | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState('all');

  // Chats
  const [chats, setChats] = useState<UnipileChat[]>([]);
  const [chatsLoading, setChatsLoading] = useState(false);
  const [chatsError, setChatsError] = useState('');

  // Selected chat + send
  const [selectedChat, setSelectedChat] = useState<UnipileChat | null>(null);
  const [sending, setSending] = useState(false);
  const [mobileDetail, setMobileDetail] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [channelFilter, setChannelFilter] = useState('all');

  // Detect redirect from Unipile hosted auth
  useEffect(() => {
    const connected = searchParams?.get('connected');
    if (connected) {
      fetchAccounts();
      fetchChats();
    }
  }, [searchParams]);

  // On mobile navigating back to list
  useEffect(() => { if (isLg) setMobileDetail(false); }, [isLg]);

  const fetchAccounts = useCallback(async () => {
    setAccountsLoading(true); setAccountsError('');
    try {
      const res = await fetch('/api/unipile/accounts');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load accounts');
      const items: UnipileAccount[] = Array.isArray(data) ? data : (data.items || data.accounts || []);
      setAccounts(items);
    } catch (e: any) {
      setAccountsError(e.message);
    } finally {
      setAccountsLoading(false);
    }
  }, []);

  const fetchChats = useCallback(async (accountId?: string) => {
    setChatsLoading(true); setChatsError('');
    try {
      const params = new URLSearchParams({ fetch_all: '1' });
      if (accountId && accountId !== 'all') params.set('account_id', accountId);
      const res = await fetch(`/api/unipile/chats?${params}`);
      const data = await res.json();
      if (!res.ok) {
        const err = data.error;
        const msg = typeof err === 'string' ? err : (err?.detail || err?.title || JSON.stringify(err || data));
        throw new Error(msg || 'Failed to load chats');
      }
      const items: UnipileChat[] = Array.isArray(data) ? data : (data.items || data.chats || []);
      setChats(items);
    } catch (e: any) {
      setChatsError(e.message);
    } finally {
      setChatsLoading(false);
    }
  }, []);

  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);
  useEffect(() => {
    if (!accountsLoading) fetchChats(selectedAccountId);
  }, [accountsLoading, selectedAccountId, fetchChats]);

  const handleConnect = async (provider: string) => {
    setConnecting(provider);
    try {
      const res = await fetch('/api/unipile/connect', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        const msg = typeof data.error === 'string' ? data.error : JSON.stringify(data.error || data);
        throw new Error(msg);
      }
      // Open hosted auth in same tab — Unipile will redirect back on success
      window.location.href = data.url;
    } catch (e: any) {
      alert(`Connection error: ${e.message}`);
      setConnecting(null);
    }
  };

  const handleAccountSelect = (id: string) => {
    setSelectedAccountId(id);
    setSelectedChat(null);
    fetchChats(id);
  };

  const handleSelectChat = (chat: UnipileChat) => {
    setSelectedChat(chat);
    if (!isLg) setMobileDetail(true);
  };

  const handleSend = async (text: string) => {
    if (!selectedChat) return;
    setSending(true);
    try {
      const res = await fetch('/api/unipile/send', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: selectedChat.id, text, account_id: selectedChat.account_id }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) {
        const errMsg = typeof d.error === 'string' ? d.error : (d.error?.detail || d.error?.title || JSON.stringify(d.error || d) || 'Send failed');
        throw new Error(errMsg);
      }
      setSelectedChat(c => c ? { ...c, last_message: { text, from_me: true, timestamp: new Date().toISOString() } } : c);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Send failed';
      alert(`Send error: ${msg}`);
      throw e;
    } finally {
      setSending(false);
    }
  };

  // Filtered chats
  const filteredChats = useMemo(() => {
    return chats.filter(chat => {
      if (channelFilter !== 'all') {
        const ch = channelFromAccountId(chat.account_id, accounts);
        if (ch !== channelFilter) return false;
      }
      if (search) {
        const s = search.toLowerCase();
        const name = chatName(chat).toLowerCase();
        const snip = chatSnippet(chat).toLowerCase();
        const subj = (chat.subject || '').toLowerCase();
        if (!name.includes(s) && !snip.includes(s) && !subj.includes(s)) return false;
      }
      return true;
    });
  }, [chats, channelFilter, search, accounts]);

  const showList = isLg || !mobileDetail;
  const showDetail = isLg || mobileDetail;
  const hasAccounts = accounts.length > 0;

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden" style={{ background: 'var(--background)' }}>
      {/* Force outer layout containment without HubShell hydration errors */}
      <style>{`
        main {
          overflow: hidden !important;
          display: flex !important;
          flex-direction: column !important;
        }
        .hub-main-container {
          flex: 1 1 0% !important;
          display: flex !important;
          flex-direction: column !important;
          min-height: 0 !important;
        }
      `}</style>

      {/* ── Top: account bar + filters ── */}
      {!accountsLoading && hasAccounts && (
        <>
          <AccountBar
            accounts={accounts}
            selectedId={selectedAccountId}
            onSelect={handleAccountSelect}
            onConnect={handleConnect}
            onRefresh={() => { fetchAccounts(); fetchChats(selectedAccountId); }}
            connecting={connecting}
          />
          {/* Search + channel segment (account tabs above already scope inbox) */}
          <div
            className="shrink-0 flex flex-col gap-2.5 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between"
            style={{
              borderBottom: '1px solid color-mix(in srgb, var(--border) 92%, transparent)',
              background: 'linear-gradient(180deg, color-mix(in srgb, var(--secondary) 40%, transparent), transparent)',
            }}>
            <div className="flex items-center gap-1.5 rounded-xl border px-3 py-2 min-w-0 flex-1 sm:max-w-md shadow-sm"
              style={{
                background: 'color-mix(in srgb, var(--background) 70%, var(--secondary))',
                borderColor: 'var(--border)',
                boxShadow: '0 1px 0 color-mix(in srgb, var(--foreground) 4%, transparent)',
              }}>
              <Search className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--muted-foreground)' }} />
              <input
                className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:opacity-60"
                style={{ color: 'var(--foreground)' }}
                placeholder="Search conversations…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <ChannelSegmented value={channelFilter} onChange={setChannelFilter} />
              <span className="text-[11px] tabular-nums whitespace-nowrap px-1" style={{ color: 'var(--muted-foreground)' }}>
                {filteredChats.length} thread{filteredChats.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </>
      )}

      {/* ── Loading accounts ── */}
      {accountsLoading && (
        <div className="flex flex-1 items-center justify-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin" style={{ color: 'var(--muted-foreground)' }} />
          <span className="text-[13px]" style={{ color: 'var(--muted-foreground)' }}>Connecting to Unipile…</span>
        </div>
      )}

      {/* ── Error loading accounts ── */}
      {!accountsLoading && accountsError && (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
          <WifiOff className="h-8 w-8 text-red-500" />
          <div className="text-center">
            <p className="text-[14px] font-semibold mb-1" style={{ color: 'var(--foreground)' }}>Could not reach Unipile</p>
            <p className="text-[12px] mb-4" style={{ color: 'var(--muted-foreground)' }}>{accountsError}</p>
            <BonsaiButton size="sm" onClick={fetchAccounts}><RefreshCw className="h-3.5 w-3.5 mr-1.5" />Retry</BonsaiButton>
          </div>
        </div>
      )}

      {/* ── No accounts connected ── */}
      {!accountsLoading && !accountsError && !hasAccounts && (
        <ConnectPanel onConnect={handleConnect} connecting={connecting} />
      )}

      {/* ── Main 2-col layout ── */}
      {!accountsLoading && !accountsError && hasAccounts && (
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Chat List */}
          {showList && (
            <div className={cn('flex flex-col border-r min-h-0 overflow-hidden',
              isLg ? 'w-[360px] min-w-[300px] max-w-[420px]' : 'w-full')}
              style={{ borderColor: 'var(--border)' }}>
              <div className="flex-1 overflow-y-auto">

                {chatsLoading && (
                  <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin" style={{ color: 'var(--muted-foreground)' }} /></div>
                )}

                {!chatsLoading && chatsError && (
                  <div className="p-4 text-center text-[12px]" style={{ color: 'var(--muted-foreground)' }}>
                    <AlertCircle className="h-5 w-5 mx-auto mb-2 text-red-500" />
                    {chatsError}
                    <button onClick={() => fetchChats(selectedAccountId)} className="block mx-auto mt-2 text-primary hover:underline">Retry</button>
                  </div>
                )}

                {!chatsLoading && !chatsError && filteredChats.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 gap-3 px-8 text-center">
                    <MessageSquare className="h-8 w-8" style={{ color: 'var(--muted-foreground)' }} />
                    <p className="text-[13px] font-medium" style={{ color: 'var(--foreground)' }}>No conversations yet</p>
                    <p className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>
                      {search ? 'No results match your search.' : 'Messages from your connected accounts will appear here.'}
                    </p>
                  </div>
                )}

                {filteredChats.map(chat => (
                  <ChatRow key={chat.id} chat={chat} accounts={accounts}
                    active={selectedChat?.id === chat.id} onClick={() => handleSelectChat(chat)} />
                ))}
              </div>
            </div>
          )}

          {/* Chat Detail */}
          {showDetail && (
            <div className="flex flex-1 min-h-0 min-w-0 flex-col overflow-hidden">
              <AnimatePresence mode="wait">
                {selectedChat ? (
                  <motion.div key={selectedChat.id} className="flex flex-col flex-1 min-h-0"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                    <ChatDetail
                      chat={selectedChat}
                      accounts={accounts}
                      onBack={!isLg ? () => setMobileDetail(false) : undefined}
                      onSend={handleSend}
                      sending={sending}
                    />
                  </motion.div>
                ) : (
                  <motion.div key="empty" className="flex flex-1 flex-col" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <EmptyDetail />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Communication() {
  return (
    <Suspense fallback={
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" style={{ color: 'var(--muted-foreground)' }} />
      </div>
    }>
      <CommunicationInner />
    </Suspense>
  );
}
