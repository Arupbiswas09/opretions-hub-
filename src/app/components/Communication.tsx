'use client';
import { Suspense } from 'react';
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, Plus, RefreshCw, X, Send, ArrowLeft,
  Sparkles, FileText, Link as LinkIcon, Loader2,
  Mail, MessageCircle, MessageSquare, StickyNote,
  AlertCircle, WifiOff,
  ExternalLink, Filter, Wand2, Copy, Check,
  RotateCcw, Zap, ListTodo, Bug,
  ChevronDown,
} from 'lucide-react';
import { CommunicationCreateTaskModal, CommunicationCreateIssueModal } from './communication/CommTaskIssueModals';
import { BonsaiButton } from './bonsai/BonsaiButton';
import { cn } from './ui/utils';
import { useMediaQuery } from '../lib/use-media-query';
import { useSearchParams } from 'next/navigation';
import { commFetchJsonWithPolicy, getCommNavCache, getCommBackoff } from '../lib/communication-prefetch';
import DOMPurify from 'dompurify';
import { inferReplyToneFromSummary } from '../lib/ai/tone-from-summary';

/* ═══════════════════════════════════════════════════════════
   Types
═══════════════════════════════════════════════════════════ */
type Channel = 'email' | 'linkedin' | 'whatsapp' | 'internal' | 'unknown';
type ReplyTone = 'professional' | 'friendly' | 'concise' | 'detailed';
type AccountStatus = 'CONNECTED' | 'RUNNING' | 'STOPPED' | 'CONNECTING' | 'ERROR';

function isEmailAccount(a: UnipileAccount): boolean {
  return providerToChannel(a.type) === 'email';
}

interface UnipileAccount {
  id: string;
  type: string; // 'LINKEDIN' | 'WHATSAPP' | 'GOOGLE' | 'MICROSOFT' | etc.
  name?: string;
  username?: string;
  status?: AccountStatus;
  created_at?: string;
}

function normalizeUnipileAccount(raw: Record<string, unknown>): UnipileAccount | null {
  // Unipile often exposes both `id` and `account_id`; `account_id` is the stable identifier
  // expected by many endpoints (notably mail). Prefer it when present.
  const id = raw.account_id ?? raw.id;
  if (id == null || String(id).trim() === '') return null;
  return {
    id: String(id),
    type: String(raw.type ?? 'UNKNOWN'),
    name: typeof raw.name === 'string' ? raw.name : undefined,
    username: typeof raw.username === 'string' ? raw.username : undefined,
    status: typeof raw.status === 'string' ? (raw.status as AccountStatus) : undefined,
    created_at: typeof raw.created_at === 'string' ? raw.created_at : undefined,
  };
}

interface UnipileMessage {
  id?: string;
  message_id?: string;
  /** Unipile: provider-native id; match to chat attendees' provider_id for names */
  sender_id?: string;
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
  /** Email thread (Unipile mail API — not /chats) */
  mail_thread_id?: string;
  mail_message_id?: string;
  name?: string;
  attendees?: { name?: string; identifier?: string; headline?: string }[];
  last_message?: { text?: string; timestamp?: string; from_me?: boolean };
  unread_count?: number;
  timestamp?: string;
  updated_at?: string;
  subject?: string;
  is_unread?: boolean;
}

function parseMailTime(raw: string | undefined): number {
  if (!raw) return 0;
  const t = Date.parse(raw);
  return Number.isFinite(t) ? t : 0;
}

function looksLikeHtml(s: string): boolean {
  return /<([a-z][\s\S]*?)>/i.test(s);
}

function htmlToText(html: string): string {
  if (!html) return '';
  try {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return (doc.body?.textContent || '').replace(/\s+/g, ' ').trim();
  } catch {
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }
}

function sanitizeEmailHtml(html: string): string {
  const clean = DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ['target', 'rel', 'style'],
  });
  return clean.replace(/<a\b(?![^>]*\btarget=)[^>]*>/gi, (m) => {
    const hasRel = /\brel=/.test(m);
    const withTarget = m.replace(/>$/, ' target="_blank">');
    return hasRel ? withTarget : withTarget.replace(/>$/, ' rel="noopener noreferrer">');
  });
}

function mailRecordId(e: Record<string, unknown>): string {
  const id = e.id ?? e.deprecated_id;
  if (id == null || String(id).trim() === '') return '';
  return String(id);
}

function mailRecordThreadId(e: Record<string, unknown>): string {
  const t = e.thread_id ?? e.threadId;
  return t != null ? String(t).trim() : '';
}

function mailRecordFrom(e: Record<string, unknown>): { display_name?: string; identifier?: string } | null {
  if (e.from_attendee && typeof e.from_attendee === 'object') {
    return e.from_attendee as { display_name?: string; identifier?: string };
  }
  const list = e.from_attendees;
  if (Array.isArray(list) && list[0] && typeof list[0] === 'object') {
    return list[0] as { display_name?: string; identifier?: string };
  }
  return null;
}

/** Collapse GET /emails rows into one row per thread (or single message if no thread_id). */
function groupRawEmailsToChats(items: unknown[], accountId: string): UnipileChat[] {
  const best = new Map<string, { mail: Record<string, unknown>; at: number }>();
  for (const raw of items) {
    if (!raw || typeof raw !== 'object') continue;
    const e = raw as Record<string, unknown>;
    const id = mailRecordId(e);
    if (!id) continue;
    const threadId = mailRecordThreadId(e);
    const solo = !threadId;
    const key = solo ? `msg:${id}` : threadId;
    const at = parseMailTime(typeof e.date === 'string' ? e.date : undefined);
    const prev = best.get(key);
    if (!prev || at >= prev.at) best.set(key, { mail: e, at });
  }

  const rows: UnipileChat[] = [];
  for (const [key, { mail }] of best) {
    const mid = mailRecordId(mail);
    const threadId = mailRecordThreadId(mail);
    const solo = !threadId;
    const fromA = mailRecordFrom(mail);
    const fromAddr = fromA?.identifier ? String(fromA.identifier) : '';
    const fromName = fromA?.display_name ? String(fromA.display_name) : '';
    const subject = typeof mail.subject === 'string' ? mail.subject : '';
    const body =
      (typeof mail.body === 'string' && mail.body) ||
      (typeof mail.body_plain === 'string' && mail.body_plain) ||
      '';
    const snippetSource = looksLikeHtml(body) ? htmlToText(body) : body;
    const snippet = snippetSource
      ? snippetSource.slice(0, 220).replace(/\s+/g, ' ').trim()
      : subject || 'No subject';
    const date =
      (typeof mail.date === 'string' && mail.date) ||
      (typeof mail.read_date === 'string' && mail.read_date) ||
      new Date().toISOString();

    rows.push({
      id: `mail:${accountId}:${key}`,
      account_id: accountId,
      provider: 'MAIL',
      subject: subject || undefined,
      name: (fromName || fromAddr || subject || `Email · ${mid.slice(0, 8)}`).trim() || 'Email',
      mail_thread_id: solo ? undefined : threadId,
      mail_message_id: solo ? mid : undefined,
      last_message: { text: snippet, timestamp: date, from_me: false },
      timestamp: date,
      updated_at: date,
    });
  }
  return rows;
}

/** Sidebar list: filled after GET /chats/{id}/attendees when the list API omits title/photo */
interface ChatListEnrichment {
  displayName: string;
  avatarUrl: string | null;
  loaded: boolean;
}

/** Local-only internal threads (persisted); not Unipile */
const INTERNAL_LOCAL_ACCOUNT = '__hub_internal__';

interface InternalThread {
  id: string;
  peerId: string;
  peerName: string;
  peerRole?: string;
  messages: { id: string; text: string; fromMe: boolean; at: string }[];
  updatedAt: string;
}

const INTERNAL_TEAM = [
  { id: '1', name: 'John Doe', role: 'Senior Project Manager · Operations' },
  { id: '2', name: 'Jane Smith', role: 'Lead Designer · Design' },
  { id: '3', name: 'Sarah Johnson', role: 'Senior Designer · Freelance' },
  { id: '4', name: 'Mike Chen', role: 'Software Engineer · Engineering' },
  { id: '5', name: 'Priya Patel', role: 'Operations Lead · Operations' },
] as const;

const INTERNAL_INBOX_STORAGE_KEY = 'hub-internal-inbox-v1';
const CHAT_MEMORY_STORAGE_KEY = 'hub-comm-chat-memory-v1';

type ChatMemory = {
  summary?: string;
  tone?: ReplyTone;
  updatedAt?: string;
};

function memoryKeyForChat(chatId: string) {
  return `${CHAT_MEMORY_STORAGE_KEY}:${chatId}`;
}

function loadChatMemory(chatId: string): ChatMemory | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(memoryKeyForChat(chatId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ChatMemory;
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

function saveChatMemory(chatId: string, mem: ChatMemory) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(memoryKeyForChat(chatId), JSON.stringify(mem));
  } catch {
    // ignore storage quota/errors
  }
}

function seedInternalThreads(): InternalThread[] {
  return INTERNAL_TEAM.map(p => ({
    id: `int-${p.id}`,
    peerId: p.id,
    peerName: p.name,
    peerRole: p.role,
    messages: [],
    updatedAt: new Date(0).toISOString(),
  }));
}

function loadInternalThreadsFromStorage(): InternalThread[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(INTERNAL_INBOX_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as InternalThread[];
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function internalThreadToChat(t: InternalThread): UnipileChat {
  const last = t.messages.length ? t.messages[t.messages.length - 1]! : undefined;
  return {
    id: t.id,
    account_id: INTERNAL_LOCAL_ACCOUNT,
    name: t.peerName,
    last_message: last
      ? { text: last.text, timestamp: last.at, from_me: last.fromMe }
      : undefined,
    ...(last ? { timestamp: t.updatedAt, updated_at: t.updatedAt } : {}),
  };
}

/* ═══════════════════════════════════════════════════════════
   Helpers
═══════════════════════════════════════════════════════════ */
function providerToChannel(type: string): Channel {
  const t = (type || '').toUpperCase();
  if (t.includes('LINKEDIN')) return 'linkedin';
  if (t.includes('WHATSAPP')) return 'whatsapp';
  if (
    t.includes('GOOGLE') ||
    t.includes('GMAIL') ||
    t.includes('MICROSOFT') ||
    t.includes('OUTLOOK') ||
    t.includes('OFFICE') ||
    t.includes('EXCHANGE') ||
    t.includes('O365') ||
    t.includes('IMAP') ||
    t.includes('ICLOUD') ||
    t.includes('MAIL')
  ) {
    return 'email';
  }
  if (t.includes('INTERNAL')) return 'internal';
  return 'unknown';
}

function channelFromAccountId(accountId: string, accounts: UnipileAccount[]): Channel {
  if (accountId === INTERNAL_LOCAL_ACCOUNT) return 'internal';
  const acc = accounts.find((a) => String(a.id) === String(accountId));
  return acc ? providerToChannel(acc.type) : 'unknown';
}

/** Channel types that appear in the filter bar, in display order (only those with a connected account). */
const FILTERABLE_INTEGRATION_CHANNELS: Channel[] = ['email', 'linkedin', 'whatsapp'];

function channelsFromAccounts(accounts: UnipileAccount[]): Channel[] {
  const have = new Set<Channel>();
  for (const a of accounts) {
    const ch = providerToChannel(a.type);
    if (FILTERABLE_INTEGRATION_CHANNELS.includes(ch)) have.add(ch);
  }
  return FILTERABLE_INTEGRATION_CHANNELS.filter((c) => have.has(c));
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

/** Unipile chat attendee: is_self is often 0 | 1 */
function isSelfAttendee(a: any): boolean {
  return a?.is_self === true || a?.is_self === 1 || a?.is_self === '1' || a?.self === true;
}

/** Single attendee display name (Unipile shapes vary by provider) */
function attendeeDisplayName(a: Record<string, unknown> | undefined): string {
  if (!a || typeof a !== 'object') return '';
  const o = a as any;
  if (o.is_self === true || o.self === true) return '';
  if (o.is_self === 1 || o.is_self === '1') return '';
  const combined = [o.first_name, o.last_name].filter(Boolean).join(' ').trim();
  const spec = o.specifics && typeof o.specifics === 'object' ? o.specifics : null;
  const specPush =
    spec &&
    (spec.pushname || spec.wa_name || spec.formatted_name) &&
    String(spec.pushname || spec.wa_name || spec.formatted_name).trim();
  const n =
    o.display_name ||
    o.name ||
    o.full_name ||
    (specPush as string) ||
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

/** Image URL from Unipile / WhatsApp / LinkedIn shapes (incl. nested specifics, data URIs) */
function photoFromRecord(o: any): string | null {
  if (!o || typeof o !== 'object') return null;
  const spec = o.specifics && typeof o.specifics === 'object' ? o.specifics : null;
  const candidates: unknown[] = [
    o.picture_url,
    o.avatar_url,
    o.profile_picture_url,
    o.photo_url,
    o.image_url,
    o.icon_url,
    typeof o.picture === 'string' ? o.picture : null,
    typeof o.profile_picture === 'string' ? o.profile_picture : (o.profile_picture && (o.profile_picture as any).url),
    spec?.picture_url,
    spec?.avatar_url,
    spec?.profile_picture_url,
    typeof spec?.picture === 'string' ? spec.picture : null,
  ];
  for (const u of candidates) {
    if (typeof u === 'string' && (u.startsWith('http') || u.startsWith('data:image'))) return u;
  }
  return null;
}

/** Profile image URL from chat or attendee (when Unipile provides it) */
function chatAvatarUrl(chat: UnipileChat): string | null {
  const c = chat as any;
  const direct = photoFromRecord(c);
  if (direct) return direct;
  const attendees = Array.isArray(c.attendees) ? c.attendees : [];
  for (const a of attendees) {
    if (a && (a as any).is_self) continue;
    const u = photoFromRecord(a);
    if (u) return u;
  }
  const fa = c.from_attendees;
  if (Array.isArray(fa)) {
    for (const a of fa) {
      const u = photoFromRecord(a);
      if (u) return u;
    }
  }
  return null;
}

function chatSnippet(chat: UnipileChat): string {
  const lm = chat.last_message as any;
  const t = lm?.text || lm?.body || lm?.content || lm?.message || lm?.snippet || chat.last_message?.text;
  if (t && String(t).trim()) return String(t).trim();
  // For email, subject is usually separate from name
  const subj = chat.subject;
  if (subj && subj !== chatName(chat)) return subj;
  return 'No messages yet';
}

/** Most recent activity time for sorting (newest-first lists) */
function chatSortTimestampMs(chat: UnipileChat): number {
  const c = chat as any;
  const lm = chat.last_message as any;
  const raw =
    lm?.timestamp ||
    lm?.created_at ||
    lm?.date ||
    chat.updated_at ||
    chat.timestamp ||
    c.modified_at ||
    c.last_activity_at ||
    c.created_at ||
    '';
  const t = raw ? new Date(raw).getTime() : 0;
  return Number.isFinite(t) && t > 0 ? t : 0;
}

function chatTime(chat: UnipileChat): string {
  const lm = chat.last_message as any;
  const raw =
    lm?.timestamp || lm?.created_at || lm?.date || chat.timestamp || chat.updated_at || '';
  if (!raw) return '';
  const ms = new Date(raw).getTime();
  if (!Number.isFinite(ms) || ms <= 0) return '';
  if (Date.now() - ms > 45 * 365 * 24 * 60 * 60 * 1000) return '';
  return timeAgo(raw);
}

const CHATS_CACHE_TTL_MS = 120_000;
const ACCOUNTS_CACHE_TTL_MS = 300_000;

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

/** Map provider_id / attendee id → display name (from GET /chats/{id}/attendees) */
function buildSenderLookupFromAttendees(items: any[]): Record<string, string> {
  const map: Record<string, string> = {};
  if (!Array.isArray(items)) return map;
  for (const a of items) {
    if (!a || typeof a !== 'object') continue;
    if (isSelfAttendee(a)) continue;
    const spec = a.specifics && typeof a.specifics === 'object' ? a.specifics : null;
    const specCombo =
      spec && (spec.first_name || spec.last_name)
        ? [spec.first_name, spec.last_name].filter(Boolean).join(' ').trim()
        : '';
    const label =
      (a.name && String(a.name).trim()) ||
      (a.display_name && String(a.display_name).trim()) ||
      specCombo ||
      attendeeDisplayName(a as any) ||
      '';
    if (!label) continue;
    for (const k of [a.provider_id, a.id, a.public_identifier].filter(Boolean).map(String)) {
      map[k] = label;
      const low = k.toLowerCase();
      if (low !== k) map[low] = label;
    }
  }
  return map;
}

/** When chat list title is unknown but attendees API returns exactly one other person */
function resolvedTitleFromAttendees(items: any[], chatTitle: string): string {
  if (chatTitle !== 'Unknown Contact' || !Array.isArray(items)) return '';
  const others = items.filter((a: any) => a && typeof a === 'object' && !isSelfAttendee(a));
  const labels: string[] = [];
  for (const a of others) {
    const spec = a.specifics && typeof a.specifics === 'object' ? a.specifics : null;
    const specCombo =
      spec && (spec.first_name || spec.last_name)
        ? [spec.first_name, spec.last_name].filter(Boolean).join(' ').trim()
        : '';
    const specWa =
      spec &&
      (spec.pushname || spec.wa_name || spec.formatted_name) &&
      String(spec.pushname || spec.wa_name || spec.formatted_name).trim();
    const label =
      (a.name && String(a.name).trim()) ||
      (a.display_name && String(a.display_name).trim()) ||
      (specWa as string) ||
      specCombo ||
      attendeeDisplayName(a as any) ||
      '';
    if (label) labels.push(label);
  }
  if (labels.length === 1) return labels[0]!;
  return '';
}

function attendeePhotoUrl(a: any): string | null {
  return photoFromRecord(a);
}

/** Title + first available profile image for conversation list rows (all providers) */
function listEnrichmentFromAttendees(items: any[]): { displayName: string; avatarUrl: string | null } {
  if (!Array.isArray(items) || items.length === 0) return { displayName: '', avatarUrl: null };
  const others = items.filter((a: any) => a && typeof a === 'object' && !isSelfAttendee(a));
  let avatarUrl: string | null = null;
  const labels: string[] = [];
  for (const a of others) {
    if (!avatarUrl) {
      const u = attendeePhotoUrl(a);
      if (u) avatarUrl = u;
    }
    const spec = a.specifics && typeof a.specifics === 'object' ? a.specifics : null;
    const specCombo =
      spec && (spec.first_name || spec.last_name)
        ? [spec.first_name, spec.last_name].filter(Boolean).join(' ').trim()
        : '';
    const specWa =
      spec &&
      (spec.pushname || spec.wa_name || spec.formatted_name) &&
      String(spec.pushname || spec.wa_name || spec.formatted_name).trim();
    const label =
      (a.name && String(a.name).trim()) ||
      (a.display_name && String(a.display_name).trim()) ||
      (specWa as string) ||
      specCombo ||
      attendeeDisplayName(a as any) ||
      '';
    if (label && !labels.includes(label)) labels.push(label);
  }
  const displayName = labels.join(', ');
  return { displayName, avatarUrl };
}

/** List title is mostly digits / masking — fetch attendees for WhatsApp pushname etc. */
function looksLikePhoneOrMaskedId(s: string): boolean {
  const t = s.replace(/[\s.·\-]/g, '');
  if (t.length < 7) return false;
  const digitRatio = (t.match(/\d/g) || []).length / t.length;
  if (digitRatio >= 0.5) return true;
  return /^\+?\d[\d*]{4,}\d$/.test(t);
}

function humanizeSenderId(id: string): string {
  const s = id.trim();
  if (!s) return '';
  const wa = s.match(/^(\d+)@s\.whatsapp\.net$/i);
  if (wa) return `+${wa[1]}`;
  const at = s.indexOf('@');
  if (at > 0 && !s.includes(' ')) return s.slice(0, at);
  return s;
}

/** Resolve row label: nested sender → attendee map by sender_id → readable id → chat title */
function resolveMessageSenderLabel(
  msg: any,
  chatContactName: string,
  attendeeByKey: Record<string, string>,
): string {
  const s = msg.sender;
  let nested = '';
  if (s && typeof s === 'object') {
    nested =
      (s.name && String(s.name).trim()) ||
      (s.display_name && String(s.display_name).trim()) ||
      [s.first_name, s.last_name].filter(Boolean).join(' ').trim() ||
      (s.identifier && String(s.identifier).trim()) ||
      '';
  }
  if (nested) return nested;

  const sid = msg.sender_id != null ? String(msg.sender_id).trim() : '';
  if (sid) {
    if (attendeeByKey[sid]) return attendeeByKey[sid];
    const low = sid.toLowerCase();
    if (attendeeByKey[low]) return attendeeByKey[low];
    const hum = humanizeSenderId(sid);
    if (hum && attendeeByKey[hum]) return attendeeByKey[hum];
    return hum || sid;
  }

  return chatContactName;
}

/* ═══════════════════════════════════════════════════════════
   Account Status Badge
═══════════════════════════════════════════════════════════ */
function StatusDot({ status }: { status?: AccountStatus }) {
  const cls = (status
    ? {
        RUNNING: 'bg-emerald-500',
        CONNECTED: 'bg-emerald-500',
        CONNECTING: 'bg-amber-500 animate-pulse',
        STOPPED: 'bg-red-500',
        ERROR: 'bg-red-500',
      }[status]
    : undefined) || 'bg-gray-400';
  return <span className={cn('inline-block h-2 w-2 rounded-full shrink-0', cls)} />;
}

/** Channel filter: All + only integrations you have connected + Internal */
function ChannelSegmented({
  value,
  onChange,
  connectedChannels,
}: {
  value: string;
  onChange: (v: string) => void;
  connectedChannels: Channel[];
}) {
  const opts: { id: string; label: string }[] = [
    { id: 'all', label: 'All' },
    ...connectedChannels.map((ch) => ({ id: ch, label: CHANNEL_LABEL[ch] })),
    { id: 'internal', label: 'Internal' },
  ];
  return (
    <div
      className="flex p-0.5 rounded-[11px] gap-0.5 overflow-x-auto scrollbar-none max-w-full"
      role="group"
      aria-label="Filter by channel type"
      style={{
        background: 'color-mix(in srgb, var(--foreground) 5%, var(--muted))',
        boxShadow: 'inset 0 1px 2px color-mix(in srgb, var(--foreground) 6%, transparent)',
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
   Account Selector Bar
═══════════════════════════════════════════════════════════ */
function AccountBar({ accounts, onConnect, connecting }: {
  accounts: UnipileAccount[];
  onConnect: (provider: string) => void;
  connecting: string | null;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [showManage, setShowManage] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const manageBtnRef = useRef<HTMLButtonElement>(null);
  const addPanelRef = useRef<HTMLDivElement>(null);
  const managePanelRef = useRef<HTMLDivElement>(null);
  const [dropPos, setDropPos] = useState({ top: 0, right: 0 });
  const [managePos, setManagePos] = useState({ top: 0, right: 0 });
  const PANEL_W = 260;
  const panelW = () => {
    const vw =
      typeof document !== 'undefined'
        ? (document.documentElement?.clientWidth || window.innerWidth)
        : 1200;
    return Math.min(PANEL_W, Math.max(180, vw - 16));
  };
  const clampRight = (right: number) => {
    const pad = 8;
    const vw =
      typeof document !== 'undefined'
        ? (document.documentElement?.clientWidth || window.innerWidth)
        : 1200;
    const w = panelW();
    return Math.min(Math.max(pad, right), Math.max(pad, vw - w - pad));
  };

  // Close on outside click (include fixed dropdown panels)
  useEffect(() => {
    if (!showAdd && !showManage) return;
    const h = (e: MouseEvent) => {
      const t = e.target as Node;
      if (showAdd && !btnRef.current?.contains(t) && !addPanelRef.current?.contains(t)) setShowAdd(false);
      if (showManage && !manageBtnRef.current?.contains(t) && !managePanelRef.current?.contains(t)) {
        setShowManage(false);
      }
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [showAdd, showManage]);

  const openDrop = () => {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      // Anchor to the viewport right edge to avoid off-screen overflow.
      const vw =
        typeof document !== 'undefined'
          ? (document.documentElement?.clientWidth || window.innerWidth)
          : window.innerWidth;
      setDropPos({ top: r.bottom + 6, right: clampRight(Math.max(8, vw - r.right)) });
    }
    setShowAdd(v => !v);
  };

  const openManage = () => {
    if (manageBtnRef.current) {
      const r = manageBtnRef.current.getBoundingClientRect();
      const vw =
        typeof document !== 'undefined'
          ? (document.documentElement?.clientWidth || window.innerWidth)
          : window.innerWidth;
      setManagePos({ top: r.bottom + 6, right: clampRight(Math.max(8, vw - r.right)) });
    }
    setShowManage(v => !v);
  };

  const btnClass =
    'flex items-center gap-1.5 rounded-[10px] px-2.5 py-1.5 text-[11px] font-semibold tracking-tight transition-colors disabled:opacity-50 ' +
    'border border-border/80 bg-muted/25 text-foreground hover:bg-muted/50 backdrop-blur-sm';

  return (
    <>
      <div className="flex items-center gap-1.5 shrink-0">
        <div className="relative shrink-0">
          <button ref={btnRef} type="button" onClick={openDrop} disabled={!!connecting} className={btnClass}>
            {connecting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
            ) : (
              <Plus className="h-3.5 w-3.5 text-primary" />
            )}
            Connect
          </button>
        </div>
        <div className="relative shrink-0">
          <button
            ref={manageBtnRef}
            type="button"
            onClick={openManage}
            className={btnClass}
            title="Manage accounts"
          >
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            Manage
          </button>
        </div>
      </div>

      {/* Premium fixed-position dropdown */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            ref={addPanelRef}
            initial={{ opacity: 0, scale: 0.96, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -4 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'fixed',
              top: dropPos.top,
              right: dropPos.right,
              zIndex: 9999,
              width: 'min(260px, calc(100vw - 16px))',
              maxWidth: 'calc(100vw - 16px)',
            }}>
            <div
              className="hub-modal-solid overflow-hidden rounded-2xl shadow-2xl"
              style={{
                border: '1px solid color-mix(in srgb, var(--border) 85%, transparent)',
                background: 'var(--popover)',
                backdropFilter: 'saturate(180%) blur(12px)',
              }}
            >
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
                    type="button"
                    onClick={() => { onConnect(p.id); setShowAdd(false); }}
                    className="group w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all hover:bg-muted/60"
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

      {/* Manage dropdown (minimal) */}
      <AnimatePresence>
        {showManage && (
          <motion.div
            ref={managePanelRef}
            initial={{ opacity: 0, scale: 0.98, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -4 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'fixed',
              top: managePos.top,
              right: managePos.right,
              zIndex: 9999,
              width: 'min(260px, calc(100vw - 16px))',
              maxWidth: 'calc(100vw - 16px)',
            }}
          >
            <div
              className="hub-modal-solid overflow-hidden rounded-2xl shadow-xl"
              style={{ border: '1px solid var(--border)' }}
            >
              <div className="px-4 pt-4 pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
                <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>
                  Accounts
                </p>
                <p className="text-[12px] mt-0.5" style={{ color: 'var(--foreground)' }}>
                  Connected channels
                </p>
              </div>
              <div className="p-2 space-y-0.5">
                {accounts.map((acc) => {
                  const ch = providerToChannel(acc.type);
                  const Icon = CHANNEL_ICON[ch];
                  return (
                    <div
                      key={acc.id}
                      className="w-full flex items-center gap-2 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-muted"
                      style={{ color: 'var(--foreground)' }}
                    >
                      <StatusDot status={acc.status} />
                      <Icon className="h-4 w-4 shrink-0" style={{ color: CHANNEL_COLOR[ch] }} />
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-semibold leading-tight truncate">
                          {CHANNEL_LABEL[ch]}{acc.username ? ` · ${acc.username}` : ''}
                        </p>
                        <p className="text-[11px] mt-0.5 truncate" style={{ color: 'var(--muted-foreground)' }}>
                          {acc.status === 'RUNNING' || acc.status === 'CONNECTED'
                            ? 'Connected'
                            : typeof acc.status === 'string'
                              ? acc.status.toLowerCase()
                              : 'Unknown'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          window.dispatchEvent(new CustomEvent('hub:unipile-disconnect', { detail: { accountId: acc.id } }));
                          setShowManage(false);
                        }}
                        className="shrink-0 rounded-lg px-2 py-1 text-[11px] font-semibold transition-colors hover:bg-destructive/10"
                        style={{ color: 'var(--muted-foreground)' }}
                        title="Disconnect"
                      >
                        Disconnect
                      </button>
                    </div>
                  );
                })}
              </div>
              <div className="px-4 py-2.5" style={{ borderTop: '1px solid var(--border)' }}>
                <p className="text-[10px] text-center" style={{ color: 'var(--muted-foreground)' }}>
                  Manage connections · Disconnect to revoke access
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
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

function ChatRow({ chat, accounts, active, onClick, enrichment, onRequestEnrichment }: {
  chat: UnipileChat; accounts: UnipileAccount[]; active: boolean; onClick: () => void;
  /** From GET …/chats/{id}/attendees when list payload omits title/photo */
  enrichment?: ChatListEnrichment;
  onRequestEnrichment?: (chat: UnipileChat) => void;
}) {
  const rowRef = useRef<HTMLButtonElement>(null);
  const [avatarFailed, setAvatarFailed] = useState(false);
  useEffect(() => { setAvatarFailed(false); }, [chat.id, enrichment?.avatarUrl]);
  const channel = channelFromAccountId(chat.account_id, accounts);
  const Icon = CHANNEL_ICON[channel];
  const isUnread = (chat.unread_count || 0) > 0 || chat.is_unread;
  const baseName = chatName(chat);
  const rawListAvatar = chatAvatarUrl(chat);
  const name = enrichment?.loaded ? (enrichment.displayName || baseName) : baseName;
  const avatarUrl = (enrichment?.loaded && enrichment.avatarUrl) ? enrichment.avatarUrl : rawListAvatar;
  const snippet = chatSnippet(chat);
  const showImg = avatarUrl && !avatarFailed;
  // Only show subject as subtitle if it differs from the name AND differs from snippet
  const showSubject = chat.subject && chat.subject !== name && chat.subject !== snippet;

  useEffect(() => {
    if (chat.account_id === INTERNAL_LOCAL_ACCOUNT) return;
    if (!onRequestEnrichment || enrichment?.loaded) return;
    const hasAv = !!chatAvatarUrl(chat);
    const needs =
      baseName === 'Unknown Contact' ||
      !hasAv ||
      (channel === 'whatsapp' && looksLikePhoneOrMaskedId(baseName));
    if (!needs) return;
    const el = rowRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          onRequestEnrichment(chat);
          io.disconnect();
        }
      },
      { root: null, rootMargin: '160px', threshold: 0.01 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [chat, baseName, channel, enrichment?.loaded, onRequestEnrichment]);

  return (
    <button ref={rowRef} type="button" onClick={onClick}
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
const REPLY_TONES: { id: ReplyTone; label: string; subtitle: string }[] = [
  { id: 'professional', label: 'Professional', subtitle: 'Clear & formal' },
  { id: 'friendly', label: 'Friendly', subtitle: 'Warm tone' },
  { id: 'concise', label: 'Concise', subtitle: 'Brief' },
  { id: 'detailed', label: 'Detailed', subtitle: 'Thorough' },
];

function toneLabel(t: ReplyTone) {
  return REPLY_TONES.find(x => x.id === t)?.label ?? 'Professional';
}

function ReplyBox({ onSend, sending, messages, chatName: cName, channel, peerLabel, senderLookup, chatId, readOnly, prefetchSummary, prefetchTone, insightLoading }: {
  onSend: (text: string) => Promise<void> | void;
  sending: boolean;
  messages: any[]; chatName?: string; channel?: string;
  /** Display / AI context name (e.g. resolved from attendees when chat title is unknown) */
  peerLabel?: string;
  senderLookup?: Record<string, string>;
  chatId?: string;
  /** Email threads — now with full composer */
  readOnly?: boolean;
  /** Background thread summary (server + cache); feeds smart reply without opening Summary */
  prefetchSummary?: string;
  prefetchTone?: ReplyTone;
  insightLoading?: boolean;
}) {
  const displayPeer = peerLabel?.trim() || cName || 'Contact';
  const lookup = senderLookup ?? {};
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
    if (prefetchTone) setSelectedTone(prefetchTone);
  }, [prefetchTone]);

  /** Prefer server-inferred tone when generating in one tap */
  const effectiveTone: ReplyTone = prefetchTone ?? selectedTone;

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
      const fromPrefetch = (prefetchSummary && prefetchSummary.trim()) || '';
      const threadSummary =
        fromPrefetch || (chatId ? (loadChatMemory(chatId)?.summary || '') : '');

      const msgPayload = messages.slice(-16).map((m: any) => ({
        sender: resolveMessageSenderLabel(m, displayPeer, lookup),
        text: m.text || m.body || (m as any).content || '',
        timestamp: m.timestamp || m.created_at,
        from_me: isSentByMe(m),
      }));
      const res = await fetch('/api/ai/auto-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: msgPayload, chat_name: displayPeer, channel, tone, thread_summary: threadSummary }),
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

  const RefineStrip = ({ dense }: { dense?: boolean }) => (
    <div
      className={cn('mx-3 mb-2 rounded-2xl border px-2.5 py-2', dense ? 'mt-2' : 'mt-2.5')}
      style={{
        background: 'linear-gradient(180deg, color-mix(in srgb, var(--background) 86%, transparent), color-mix(in srgb, var(--secondary) 80%, transparent))',
        borderColor: 'color-mix(in srgb, var(--foreground) 10%, var(--border))',
        boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
        backdropFilter: 'saturate(180%) blur(14px)',
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[10px] font-semibold tracking-tight" style={{ color: 'var(--muted-foreground)' }}>
            Refine draft
          </div>
          <div className="text-[12px] font-semibold truncate" style={{ color: 'var(--foreground)' }}>
            {toneLabel(effectiveTone)}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {REPLY_TONES.map((t) => {
            const active = effectiveTone === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setSelectedTone(t.id);
                  void generateReply(t.id);
                }}
                className={cn(
                  'h-8 rounded-xl px-2.5 text-[11px] font-semibold transition-all',
                  active ? 'shadow-sm' : 'hover:opacity-90',
                )}
                style={{
                  background: active
                    ? 'color-mix(in srgb, var(--primary) 16%, var(--background))'
                    : 'color-mix(in srgb, var(--foreground) 5%, transparent)',
                  color: active ? 'var(--foreground)' : 'var(--muted-foreground)',
                  border: `1px solid ${active ? 'color-mix(in srgb, var(--primary) 35%, var(--border))' : 'color-mix(in srgb, var(--foreground) 9%, var(--border))'}`,
                }}
                title={t.subtitle}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  /* ── EMAIL COMPOSER states ── */
  const [emailTo, setEmailTo] = useState('');
  const [emailCc, setEmailCc] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [showCc, setShowCc] = useState(false);
  const [showEmailHeaders, setShowEmailHeaders] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [emailComposerExpanded, setEmailComposerExpanded] = useState(false);
  const composerRef = useRef<HTMLDivElement>(null);

  // Pre-fill email fields when opening
  useEffect(() => {
    if (!readOnly) return;
    // Extract email from last received message or chat name
    const lastMsg = messages.find((m: any) => !isSentByMe(m));
    const fromAddr = lastMsg?.from_attendees?.[0]?.identifier || lastMsg?.from?.email || '';
    if (fromAddr) setEmailTo(fromAddr);
    // Subject
    const subj = messages[0]?.subject || cName || '';
    setEmailSubject(subj.startsWith('Re:') ? subj : `Re: ${subj}`);
    setEmailSent(false);
    setShowEmailHeaders(false);
    setEmailComposerExpanded(false);
  }, [readOnly, messages, cName]);

  useEffect(() => {
    if (!readOnly) return;
    if (text.trim() || aiLoading || showTones || showEmailHeaders) setEmailComposerExpanded(true);
  }, [readOnly, text, aiLoading, showTones, showEmailHeaders]);

  if (readOnly) {
    const handleEmailSend = async () => {
      const body = text.trim();
      if (!body || emailSending) return;
      setEmailSending(true);
      setEmailError('');
      try {
        const res = await fetch('/api/unipile/emails/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            account_id: chatId?.split(':')[0] || '',
            to: emailTo.trim(),
            cc: emailCc.trim() || undefined,
            subject: emailSubject.trim(),
            body,
            in_reply_to: messages[messages.length - 1]?.id,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to send email');
        setText('');
        setEmailSent(true);
        setAiGenerated(false);
        setTimeout(() => setEmailSent(false), 3000);
      } catch (e: unknown) {
        setEmailError(e instanceof Error ? e.message : 'Failed to send');
      } finally {
        setEmailSending(false);
      }
    };

    return (
      <div className="shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
        {/* AI error */}
        <AnimatePresence>
          {aiError && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
              <div className="flex items-center gap-2 px-4 py-2 text-[11px]"
                style={{ background: 'color-mix(in srgb, #ef4444 8%, var(--background))', borderBottom: '1px solid color-mix(in srgb, #ef4444 15%, var(--border))' }}>
                <AlertCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                <span className="flex-1 min-w-0 break-words" style={{ color: '#ef4444' }}>{aiError}</span>
                <button type="button" onClick={() => generateReply(effectiveTone)} className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-md hover:bg-red-500/10" style={{ color: '#ef4444' }}>Retry</button>
                <button type="button" onClick={() => setAiError('')} className="shrink-0"><X className="h-3 w-3" style={{ color: 'var(--muted-foreground)' }} /></button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {insightLoading && !prefetchSummary && messages.length > 0 && (
          <div className="flex items-center gap-1.5 px-4 py-1 text-[10px]" style={{ color: 'var(--muted-foreground)', borderBottom: '1px solid color-mix(in srgb, var(--border) 60%, transparent)' }}>
            <Loader2 className="h-3 w-3 animate-spin shrink-0" />
            Preparing thread summary in the background…
          </div>
        )}

        {/* Tone menu is anchored to tone triggers (see chevrons / tone pill) */}

        {/* AI generated badge */}
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
                <span className="text-[10px] font-medium" style={{ color: '#10b981' }}>AI draft ready — review before sending</span>
                <div className="flex-1" />
                {/* Tone refinement appears below after draft is generated */}
                <button type="button" onClick={() => { setText(''); setAiGenerated(false); textareaRef.current?.focus(); }}
                  className="text-[10px] font-medium px-2 py-0.5 rounded-md hover:bg-secondary transition-colors" style={{ color: 'var(--muted-foreground)' }}>Clear</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {emailSent && (
          <div className="flex items-center gap-2 px-4 py-2 text-[11px]"
            style={{ background: 'color-mix(in srgb, #10b981 8%, var(--background))', borderBottom: '1px solid color-mix(in srgb, #10b981 15%, var(--border))' }}>
            <Check className="h-3.5 w-3.5 text-emerald-500" />
            <span style={{ color: '#10b981' }} className="font-medium">Email sent successfully</span>
          </div>
        )}

        {emailError && (
          <div className="flex items-center gap-2 px-4 py-2 text-[11px]"
            style={{ background: 'color-mix(in srgb, #ef4444 8%, var(--background))', borderBottom: '1px solid color-mix(in srgb, #ef4444 15%, var(--border))' }}>
            <AlertCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
            <span className="flex-1" style={{ color: '#ef4444' }}>{emailError}</span>
            <button type="button" onClick={() => setEmailError('')} className="shrink-0"><X className="h-3 w-3" style={{ color: 'var(--muted-foreground)' }} /></button>
          </div>
        )}

        {/* Compact email header strip (expandable) */}
        <div
          className="px-3 py-2 flex items-center gap-2"
          style={{ borderBottom: '1px solid color-mix(in srgb, var(--border) 55%, transparent)' }}
        >
          <div className="min-w-0 flex-1 flex items-center gap-2">
            <span
              className="text-[10px] font-semibold px-2 py-1 rounded-full truncate"
              style={{
                background: 'color-mix(in srgb, var(--foreground) 6%, transparent)',
                color: 'var(--muted-foreground)',
              }}
              title={emailTo || 'To'}
            >
              To: {emailTo || '—'}
            </span>
            <span
              className="text-[10px] font-semibold px-2 py-1 rounded-full truncate"
              style={{
                background: 'color-mix(in srgb, var(--foreground) 6%, transparent)',
                color: 'var(--muted-foreground)',
              }}
              title={emailSubject || 'Subject'}
            >
              Subj: {emailSubject || '—'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowEmailHeaders(v => !v)}
            className="shrink-0 text-[10px] font-semibold px-2 py-1 rounded-lg transition-colors hover:bg-secondary/80"
            style={{ color: 'var(--foreground)', border: '1px solid var(--border)' }}
            title="Edit To/Cc/Subject"
          >
            {showEmailHeaders ? 'Done' : 'Edit'}
          </button>
        </div>

        <AnimatePresence>
          {showEmailHeaders && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.16 }}
              className="px-3 pt-2 pb-2 space-y-1.5"
              style={{
                borderBottom: '1px solid color-mix(in srgb, var(--border) 55%, transparent)',
                background: 'color-mix(in srgb, var(--secondary) 75%, transparent)',
              }}
            >
              <div className="flex items-center gap-2">
                <label className="text-[11px] font-medium w-10 shrink-0" style={{ color: 'var(--muted-foreground)' }}>To</label>
                <input
                  value={emailTo}
                  onChange={e => setEmailTo(e.target.value)}
                  placeholder="recipient@email.com"
                  className="flex-1 bg-transparent border-0 text-[12px] py-1 outline-none"
                  style={{ color: 'var(--foreground)' }}
                />
                {!showCc && (
                  <button type="button" onClick={() => setShowCc(true)} className="text-[10px] font-medium px-1.5 shrink-0 transition-colors hover:opacity-80" style={{ color: 'var(--primary)' }}>
                    Cc
                  </button>
                )}
              </div>
              {showCc && (
                <div className="flex items-center gap-2">
                  <label className="text-[11px] font-medium w-10 shrink-0" style={{ color: 'var(--muted-foreground)' }}>Cc</label>
                  <input
                    value={emailCc}
                    onChange={e => setEmailCc(e.target.value)}
                    placeholder="cc@email.com"
                    className="flex-1 bg-transparent border-0 text-[12px] py-1 outline-none"
                    style={{ color: 'var(--foreground)' }}
                  />
                </div>
              )}
              <div className="flex items-center gap-2">
                <label className="text-[11px] font-medium w-10 shrink-0" style={{ color: 'var(--muted-foreground)' }}>Subj</label>
                <input
                  value={emailSubject}
                  onChange={e => setEmailSubject(e.target.value)}
                  placeholder="Subject"
                  className="flex-1 bg-transparent border-0 text-[12px] py-1 font-medium outline-none"
                  style={{ color: 'var(--foreground)' }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Body composer (sticky + collapsible) */}
        <div className="px-3 pb-3 pt-2">
          <div className="rounded-2xl border flex flex-col overflow-hidden"
            style={{
              borderColor: aiGenerated ? 'color-mix(in srgb, #10b981 28%, var(--border))' : aiLoading ? 'color-mix(in srgb, #6366f1 28%, var(--border))' : 'color-mix(in srgb, var(--border) 92%, transparent)',
              background: aiGenerated ? 'color-mix(in srgb, #10b981 5%, var(--secondary))' : 'color-mix(in srgb, var(--secondary) 88%, var(--background))',
              boxShadow: '0 1px 2px color-mix(in srgb, var(--foreground) 4%, transparent)',
            }}>
            <div
              ref={composerRef}
              className="relative"
              onFocusCapture={() => setEmailComposerExpanded(true)}
              onBlurCapture={() => {
                window.setTimeout(() => {
                  const root = composerRef.current;
                  const active = document.activeElement;
                  const stillInside = !!(root && active && root.contains(active));
                  if (stillInside) return;
                  if (!text.trim() && !aiLoading && !showTones && !showEmailHeaders && !emailSending) {
                    setEmailComposerExpanded(false);
                  }
                }, 0);
              }}
            >
              {aiLoading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center gap-2 rounded-t-2xl pointer-events-none"
                  style={{ background: 'color-mix(in srgb, var(--background) 88%, transparent)' }}>
                  <Sparkles className="h-3.5 w-3.5" style={{ color: '#6366f1' }} />
                  <span className="text-[11px] font-medium" style={{ color: 'var(--muted-foreground)' }}>
                    {REPLY_TONES.find(x => x.id === effectiveTone)?.label ?? 'Smart'} reply
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
              <div className="flex items-stretch gap-2">
                {emailComposerExpanded ? (
                  <textarea
                    ref={textareaRef}
                    value={text}
                    onChange={e => { setText(e.target.value); if (aiGenerated) setAiGenerated(false); }}
                    onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); void handleEmailSend(); } }}
                    disabled={emailSending || aiLoading}
                    rows={2}
                    placeholder="Write your email reply…"
                    className="flex-1 border-0 bg-transparent px-3 pt-2 pb-2 text-[13px] leading-[1.55] resize-none outline-none focus:ring-0"
                    style={{ minHeight: 56, maxHeight: MAX_TA_PX, color: 'var(--foreground)' }}
                    onFocus={() => { if (!emailTo.trim()) setShowEmailHeaders(true); }}
                    autoFocus={false}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setEmailComposerExpanded(true);
                      requestAnimationFrame(() => textareaRef.current?.focus());
                    }}
                    className="flex-1 text-left px-3 py-2.5 rounded-2xl transition-colors"
                    style={{
                      background: 'color-mix(in srgb, var(--background) 30%, transparent)',
                      color: 'var(--muted-foreground)',
                      border: '1px solid color-mix(in srgb, var(--border) 65%, transparent)',
                    }}
                  >
                    <span className="text-[13px] font-medium">Reply…</span>
                    {emailTo.trim() ? null : (
                      <span className="ml-2 text-[11px]" style={{ opacity: 0.85 }}>
                        Add recipient
                      </span>
                    )}
                  </button>
                )}

                {/* WhatsApp-style right action shelf */}
                <div className="shrink-0 pr-2 py-2 flex flex-col justify-end gap-1.5">
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    type="button"
                    onClick={() => {
                      setEmailComposerExpanded(true);
                      void generateReply(effectiveTone);
                    }}
                    disabled={aiLoading || messages.length === 0}
                    title="AI Smart Reply"
                    className="flex h-9 w-9 items-center justify-center rounded-xl transition-all disabled:opacity-30"
                    style={{
                      background: 'linear-gradient(180deg, #a855f7, #6366f1)',
                      boxShadow: '0 0 0 1px color-mix(in srgb, white 18%, transparent) inset, 0 2px 8px rgba(99,102,241,0.3)',
                      color: 'white',
                    }}>
                    {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                  </motion.button>
                  {/* No tone dropdown near AI button (premium minimal) */}

                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    type="button"
                    onClick={() => {
                      setEmailComposerExpanded(true);
                      void handleEmailSend();
                    }}
                    disabled={!text.trim() || !emailTo.trim() || emailSending || aiLoading}
                    title="Send"
                    className="flex h-9 w-9 items-center justify-center rounded-xl transition-all disabled:opacity-35"
                    style={{
                      background: text.trim() && emailTo.trim() ? 'var(--primary)' : 'var(--secondary)',
                      color: text.trim() && emailTo.trim() ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
                      border: text.trim() && emailTo.trim() ? 'none' : '1px solid var(--border)',
                      boxShadow: text.trim() && emailTo.trim() ? '0 0 0 1px color-mix(in srgb, white 10%, transparent) inset' : undefined,
                    }}>
                    {emailSending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                  </motion.button>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between gap-2 px-3 pb-2 pt-1 border-t"
              style={{ borderColor: 'color-mix(in srgb, var(--border) 75%, transparent)' }}>
              <p className="text-[9px] pl-1 min-w-0 truncate" style={{ color: 'var(--muted-foreground)' }}>
                ⌘+Return
              </p>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] tabular-nums" style={{ color: 'var(--muted-foreground)' }}>
                  {Math.max(0, 280 - text.length)}
                </span>
              </div>
            </div>
          </div>
        </div>
        <style>{`@keyframes aiDot { 0%, 80%, 100% { opacity: 0.25; transform: scale(0.85); } 40% { opacity: 1; transform: scale(1.15); } }`}</style>
      </div>
    );
  }

  return (
    <div className="shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
      <AnimatePresence>
        {aiError && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <div className="flex items-center gap-2 px-4 py-2 text-[11px]"
              style={{ background: 'color-mix(in srgb, #ef4444 8%, var(--background))', borderBottom: '1px solid color-mix(in srgb, #ef4444 15%, var(--border))' }}>
              <AlertCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
              <span className="flex-1 min-w-0 break-words" style={{ color: '#ef4444' }}>{aiError}</span>
              <button type="button" onClick={() => generateReply(effectiveTone)} className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-md hover:bg-red-500/10" style={{ color: '#ef4444' }}>Retry</button>
              <button type="button" onClick={() => setAiError('')} className="shrink-0"><X className="h-3 w-3" style={{ color: 'var(--muted-foreground)' }} /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {insightLoading && !prefetchSummary && messages.length > 0 && (
        <div className="flex items-center gap-1.5 px-4 py-1 text-[10px]" style={{ color: 'var(--muted-foreground)', borderBottom: '1px solid color-mix(in srgb, var(--border) 60%, transparent)' }}>
          <Loader2 className="h-3 w-3 animate-spin shrink-0" />
          Preparing thread summary in the background…
        </div>
      )}

      {/* Tone menu is anchored to the triggers (chevron / tone pill). */}

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

      {aiGenerated && text && !aiLoading && !sending && (
        <RefineStrip />
      )}

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
                  {REPLY_TONES.find(x => x.id === effectiveTone)?.label ?? 'Smart'} reply
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
              <div className="flex flex-col gap-1 items-center">
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  type="button"
                  onClick={() => { void generateReply(effectiveTone); }}
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
                {/* No tone dropdown near AI button (premium minimal) */}
              </div>
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
  const [previousSummary, setPreviousSummary] = useState<string>('');
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [senderLookup, setSenderLookup] = useState<Record<string, string>>({});
  const [resolvedHeaderName, setResolvedHeaderName] = useState('');

  /** Background AI: rolling summary + inferred tone (Supabase + localStorage fallback) */
  const [threadInsight, setThreadInsight] = useState<{ summary: string; tone: ReplyTone } | null>(null);
  const [threadInsightBusy, setThreadInsightBusy] = useState(false);
  const messagesRef = useRef<UnipileMessage[]>([]);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const bottomRef = useRef<HTMLDivElement>(null);

  const channel = channelFromAccountId(chat.account_id, accounts);
  const Icon = CHANNEL_ICON[channel];
  const name = chatName(chat);
  const displayHeaderName = resolvedHeaderName || name;

  const contextSnippet = useMemo(() => {
    return messages
      .slice(-8)
      .map(m => (m.text || m.body || (m as any).content || '').trim())
      .filter(Boolean)
      .join('\n')
      .slice(0, 1200);
  }, [messages]);

  const messageInsightSig = useMemo(() => {
    if (messages.length === 0) return '';
    const last = messages[messages.length - 1];
    return `${messages.length}|${last?.timestamp ?? (last as any)?.created_at ?? ''}|${String((last as any)?.id ?? '')}`;
  }, [messages]);

  const isMailThread = !!(chat.mail_thread_id || chat.mail_message_id);
  const compactActions = channel === 'email' && isMailThread;
  const selfMailHint = (
    accounts.find((a) => String(a.id) === String(chat.account_id))?.username ||
    accounts.find((a) => String(a.id) === String(chat.account_id))?.name ||
    ''
  ).toLowerCase();

  const mapMailRecordsToMessages = useCallback(
    (items: unknown[]): UnipileMessage[] => {
      const rows: UnipileMessage[] = [];
      for (const raw of items) {
        if (!raw || typeof raw !== 'object') continue;
        const e = raw as Record<string, unknown>;
        const fromA = mailRecordFrom(e);
        const fromAddr = (fromA?.identifier && String(fromA.identifier).toLowerCase()) || '';
        const fromMe =
          !!selfMailHint &&
          (fromAddr === selfMailHint ||
            (fromAddr && selfMailHint.includes(fromAddr)) ||
            (selfMailHint && fromAddr.includes(selfMailHint)));

        const html = typeof e.body === 'string' ? e.body.trim() : '';
        const plain = typeof e.body_plain === 'string' ? e.body_plain.trim() : '';
        const bodyText = plain || (html ? htmlToText(html) : '');
        const text = bodyText || (typeof e.subject === 'string' ? e.subject : '') || '';
        const mid = mailRecordId(e);
        if (!mid) continue;
        rows.push({
          id: mid,
          text,
          body: html || plain || undefined,
          timestamp: typeof e.date === 'string' ? e.date : undefined,
          created_at: typeof e.date === 'string' ? e.date : undefined,
          is_sender: fromMe,
          from_me: fromMe,
          sender: fromA
            ? {
              identifier: typeof fromA.identifier === 'string' ? fromA.identifier : undefined,
              display_name: typeof fromA.display_name === 'string' ? fromA.display_name : undefined,
            }
            : undefined,
        });
      }
      return sortMessagesOldestFirst(rows);
    },
    [selfMailHint],
  );

  const fetchMessages = useCallback(async () => {
    setLoadingMsgs(true); setMsgError('');
    try {
      if (isMailThread) {
        const sp = new URLSearchParams();
        sp.set('account_id', chat.account_id);
        if (chat.mail_thread_id) sp.set('thread_id', chat.mail_thread_id);
        if (chat.mail_message_id) sp.set('message_id', chat.mail_message_id);
        sp.set('fetch_all', '1');
        sp.set('meta_only', 'false');
        const res = await fetch(`/api/unipile/emails?${sp}`);
        const data = (await res.json().catch(() => ({}))) as { items?: unknown[]; error?: unknown };
        if (!res.ok) {
          const err = data.error;
          const msg = typeof err === 'string' ? err : JSON.stringify(err || data);
          throw new Error(msg || 'Failed to load email');
        }
        const items = Array.isArray(data.items) ? data.items : [];
        setMessages(mapMailRecordsToMessages(items));
      } else {
        const res = await fetch(`/api/unipile/messages?chat_id=${encodeURIComponent(chat.id)}&limit=30`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load messages');
        const raw: UnipileMessage[] = Array.isArray(data) ? data : (data.items || data.messages || []);
        setMessages(sortMessagesOldestFirst(raw));
      }
    } catch (e: any) {
      setMsgError(e.message);
    } finally {
      setLoadingMsgs(false);
    }
  }, [chat.id, chat.account_id, chat.mail_thread_id, chat.mail_message_id, isMailThread, mapMailRecordsToMessages]);

  /** Full thread (paginated server-side) → short model summary — not limited to on-screen messages */
  const fetchSummary = useCallback(async () => {
    setSummaryLoading(true);
    setSummaryError('');
    setSummaryText('');
    setSummaryThreadCount(null);
    try {
      const prev = loadChatMemory(chat.id)?.summary || '';
      let items: UnipileMessage[] = [];
      if (isMailThread) {
        const sp = new URLSearchParams();
        sp.set('account_id', chat.account_id);
        if (chat.mail_thread_id) sp.set('thread_id', chat.mail_thread_id);
        if (chat.mail_message_id) sp.set('message_id', chat.mail_message_id);
        sp.set('fetch_all', '1');
        sp.set('meta_only', 'false');
        const res = await fetch(`/api/unipile/emails?${sp}`);
        const data = (await res.json().catch(() => ({}))) as { items?: unknown[]; error?: unknown };
        if (!res.ok) {
          const err = data.error;
          const msg = typeof err === 'string' ? err : JSON.stringify(err || data);
          throw new Error(msg || 'Failed to load conversation');
        }
        items = mapMailRecordsToMessages(Array.isArray(data.items) ? data.items : []);
      } else {
        const res = await fetch(
          `/api/unipile/messages?chat_id=${encodeURIComponent(chat.id)}&fetch_all=1`,
        );
        const data = await res.json();
        if (!res.ok) {
          const err = data.error;
          const msg = typeof err === 'string' ? err : (err?.detail || err?.title || JSON.stringify(err || data));
          throw new Error(msg || 'Failed to load conversation');
        }
        items = Array.isArray(data.items) ? data.items : [];
      }
      if (items.length === 0) {
        setSummaryError('No messages in this chat yet.');
        return;
      }

      const msgPayload = items.map((m: any) => ({
        sender: resolveMessageSenderLabel(m, displayHeaderName, senderLookup),
        text: m.text || m.body || (m as any).content || '',
        timestamp: m.timestamp || m.created_at,
        from_me: isSentByMe(m),
      }));

      const resAi = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: msgPayload,
          chat_name: displayHeaderName,
          channel,
          previous_summary: prev,
        }),
      });
      const out = await resAi.json();
      if (!resAi.ok) throw new Error(out.error || 'Summarization failed');
      setSummaryText(out.summary || 'No summary generated.');
      setSummaryThreadCount(typeof out.message_count === 'number' ? out.message_count : items.length);
      setPreviousSummary(prev);
      const s = String(out.summary || '').trim();
      const tone = inferReplyToneFromSummary(s);
      saveChatMemory(chat.id, { summary: s, tone, updatedAt: new Date().toISOString() });
      setThreadInsight({ summary: s, tone });
    } catch (e: unknown) {
      setSummaryError(e instanceof Error ? e.message : 'Summarization failed');
    } finally {
      setSummaryLoading(false);
    }
  }, [
    chat.id,
    chat.account_id,
    chat.mail_thread_id,
    chat.mail_message_id,
    displayHeaderName,
    channel,
    senderLookup,
    isMailThread,
    mapMailRecordsToMessages,
  ]);

  const prefetchThreadInsight = useCallback(async () => {
    const msgs = messagesRef.current;
    if (msgs.length === 0) return;
    const msgPayload = msgs.map((m: any) => ({
      sender: resolveMessageSenderLabel(m, displayHeaderName, senderLookup),
      text: m.text || m.body || (m as any).content || '',
      timestamp: m.timestamp || m.created_at,
      from_me: isSentByMe(m),
    }));

    setThreadInsightBusy(true);
    try {
      const res = await fetch('/api/comm/thread-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          thread_key: chat.id,
          messages: msgPayload,
          chat_name: displayHeaderName,
          channel,
        }),
      });

      if (res.ok) {
        const d = await res.json();
        const summary = String(d.summary || '').trim();
        const tone = (['professional', 'friendly', 'concise', 'detailed'].includes(String(d.tone))
          ? d.tone
          : 'professional') as ReplyTone;
        if (summary.length > 12) {
          saveChatMemory(chat.id, { summary, tone, updatedAt: new Date().toISOString() });
          setThreadInsight({ summary, tone });
          setSummaryText((st) => (st ? st : summary));
        }
        return;
      }

      const prev = loadChatMemory(chat.id)?.summary || '';
      const r2 = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: msgPayload,
          chat_name: displayHeaderName,
          channel,
          previous_summary: prev,
        }),
      });
      const out = await r2.json();
      if (r2.ok && out.summary) {
        const summary = String(out.summary).trim();
        const tone = inferReplyToneFromSummary(summary);
        saveChatMemory(chat.id, { summary, tone, updatedAt: new Date().toISOString() });
        setThreadInsight({ summary, tone });
        setSummaryText((st) => (st ? st : summary));
      }
    } catch {
      /* background best-effort */
    } finally {
      setThreadInsightBusy(false);
    }
  }, [chat.id, displayHeaderName, channel, senderLookup]);

  useEffect(() => {
    if (!messageInsightSig) return;
    const t = window.setTimeout(() => {
      void prefetchThreadInsight();
    }, 550);
    return () => window.clearTimeout(t);
  }, [messageInsightSig, prefetchThreadInsight]);

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
    const mem = loadChatMemory(chat.id);
    setPreviousSummary(mem?.summary || '');
    if (mem?.summary) {
      setThreadInsight({
        summary: mem.summary,
        tone: (mem.tone as ReplyTone) || inferReplyToneFromSummary(mem.summary),
      });
    } else {
      setThreadInsight(null);
    }
    setThreadInsightBusy(false);
  }, [chat.id]);

  useEffect(() => {
    setSenderLookup({});
    setResolvedHeaderName('');
    if (isMailThread) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/unipile/chat-attendees?chat_id=${encodeURIComponent(chat.id)}`);
        const data = await res.json();
        if (cancelled) return;
        const items = Array.isArray(data) ? data : (data.items || data.data || data.attendees || []);
        if (!Array.isArray(items)) return;
        setSenderLookup(buildSenderLookupFromAttendees(items));
        const title = resolvedTitleFromAttendees(items, name);
        if (title) setResolvedHeaderName(title);
      } catch {
        if (!cancelled) setSenderLookup({});
      }
    })();
    return () => { cancelled = true; };
  }, [chat.id, name, isMailThread]);

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
          <h2 className="text-[13px] font-semibold truncate flex-1" style={{ color: 'var(--foreground)' }}>{displayHeaderName}</h2>
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
                }}>GPT</span>
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
          const peerName = resolveMessageSenderLabel(msg, displayHeaderName, senderLookup);
          const senderName = fromMe ? 'You' : peerName;
          const text = msg.text || msg.body || (msg as any).content || '';
          const initialSrc = peerName !== 'Unknown Contact' ? peerName : displayHeaderName;
          const emailSender = channel === 'email'
            ? (msg.sender?.identifier || msg.sender?.display_name || '')
            : '';
          const emailDomain =
            channel === 'email' && typeof emailSender === 'string' && emailSender.includes('@')
              ? emailSender.split('@').pop()!.toLowerCase()
              : '';
          const faviconUrl =
            emailDomain ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(emailDomain)}&sz=64` : '';
          const renderAsHtml = isMailThread && typeof msg.body === 'string' && looksLikeHtml(msg.body);
          return (
            <div key={messageStableId(msg, idx)} className={cn('flex gap-2.5', fromMe ? 'justify-end' : 'justify-start')}>
              {!fromMe && (
                <div
                  className="shrink-0 h-7 w-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold mt-1 overflow-hidden"
                  style={{ background: CHANNEL_GRADIENT[channel] }}
                >
                  {channel === 'email' && faviconUrl ? (
                    <img src={faviconUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    (initialSrc !== 'Unknown Contact' ? initials(initialSrc) : <span>?</span>)
                  )}
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
                  {renderAsHtml ? (
                    <div
                      className="email-html"
                      style={{ whiteSpace: 'normal' }}
                      dangerouslySetInnerHTML={{ __html: sanitizeEmailHtml(String(msg.body)) }}
                    />
                  ) : (
                    text || <em className="opacity-50">Media / attachment</em>
                  )}
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

      <style>{`
        .email-html { line-height: 1.55; }
        .email-html img { max-width: 100%; height: auto; border-radius: 10px; }
        .email-html a { color: inherit; text-decoration: underline; text-underline-offset: 2px; }
        .email-html blockquote {
          margin: 10px 0 0;
          padding-left: 10px;
          border-left: 2px solid color-mix(in srgb, var(--muted-foreground) 35%, transparent);
          opacity: 0.95;
        }
        .email-html pre, .email-html code {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
          font-size: 12px;
        }
      `}</style>

      {/* Action bar — Design Foundation pattern: primary actions left, task/issue right */}
      <div
        className={cn(
          'shrink-0 flex flex-wrap items-center justify-between gap-2',
          compactActions ? 'px-3 py-1.5' : 'px-4 py-2.5',
        )}
        style={{
          borderTop: '1px solid color-mix(in srgb, var(--border) 90%, transparent)',
          background: 'linear-gradient(0deg, color-mix(in srgb, var(--secondary) 35%, transparent), transparent)',
        }}>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={handleToggleSummary}
            disabled={summaryLoading}
            className={cn(
              'flex items-center gap-1.5 rounded-[10px] border font-semibold tracking-tight transition-all disabled:opacity-40',
              compactActions ? 'px-2.5 py-1.5 text-[11px]' : 'px-3 py-2 text-[12px]',
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
            {!compactActions && 'AI Summary'}
          </button>
          <BonsaiButton
            size="sm"
            variant="outline"
            className={cn('rounded-[10px] gap-1.5 font-medium', compactActions && 'px-2.5 py-1.5')}
            title="Link to Record"
          >
            <LinkIcon className="h-3.5 w-3.5" />{!compactActions && 'Link to Record'}
          </BonsaiButton>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setTaskModalOpen(true)}
            className={cn(
              'flex items-center gap-1.5 rounded-[10px] border font-semibold tracking-tight transition-colors hover:bg-secondary/90',
              compactActions ? 'px-2.5 py-1.5 text-[11px]' : 'px-3 py-2 text-[12px]',
            )}
            style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
            <ListTodo className="h-3.5 w-3.5 shrink-0 opacity-80" />
            {!compactActions && 'Create task'}
          </button>
          <button
            type="button"
            onClick={() => setIssueModalOpen(true)}
            className={cn(
              'flex items-center gap-1.5 rounded-[10px] border font-semibold tracking-tight transition-colors hover:bg-secondary/90',
              compactActions ? 'px-2.5 py-1.5 text-[11px]' : 'px-3 py-2 text-[12px]',
            )}
            style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
            <Bug className="h-3.5 w-3.5 shrink-0 opacity-80" />
            {!compactActions && 'Create issue'}
          </button>
        </div>
      </div>

      <CommunicationCreateTaskModal
        open={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        contactName={displayHeaderName}
        chatId={chat.id}
        snippet={contextSnippet}
      />
      <CommunicationCreateIssueModal
        open={issueModalOpen}
        onClose={() => setIssueModalOpen(false)}
        contactName={displayHeaderName}
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
        peerLabel={displayHeaderName}
        senderLookup={senderLookup}
        channel={channel}
        chatId={chat.id}
        readOnly={isMailThread}
        prefetchSummary={threadInsight?.summary}
        prefetchTone={threadInsight?.tone}
        insightLoading={threadInsightBusy}
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

function mergeInternalThreads(saved: InternalThread[]): InternalThread[] {
  const map = new Map(saved.map(t => [t.id, t]));
  return INTERNAL_TEAM.map(p => {
    const id = `int-${p.id}`;
    return (
      map.get(id) ?? {
        id,
        peerId: p.id,
        peerName: p.name,
        peerRole: p.role,
        messages: [],
        updatedAt: new Date(0).toISOString(),
      }
    );
  });
}

/** Internal team DM — feature parity with Unipile detail (AI summary, tasks, issues, smart reply) */
function InternalChatDetail({
  thread,
  onBack,
  onSend,
  sending,
}: {
  thread: InternalThread;
  onBack?: () => void;
  onSend: (text: string) => Promise<void>;
  sending: boolean;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const Icon = CHANNEL_ICON.internal;
  const internalThreadKey = `internal:${thread.id}`;

  const [threadInsight, setThreadInsight] = useState<{ summary: string; tone: ReplyTone } | null>(null);
  const [threadInsightBusy, setThreadInsightBusy] = useState(false);
  const internalMsgsRef = useRef(thread.messages);
  useEffect(() => {
    internalMsgsRef.current = thread.messages;
  }, [thread.messages]);

  const [showSummary, setShowSummary] = useState(false);
  const [summaryText, setSummaryText] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState('');
  const [summaryCopied, setSummaryCopied] = useState(false);
  const [summaryThreadCount, setSummaryThreadCount] = useState<number | null>(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [issueModalOpen, setIssueModalOpen] = useState(false);

  const replyMessages = useMemo(
    () =>
      thread.messages.map(m => ({
        text: m.text,
        body: m.text,
        from_me: m.fromMe,
        is_sender: m.fromMe,
        timestamp: m.at,
        created_at: m.at,
      })),
    [thread.messages],
  );

  const contextSnippet = useMemo(() => {
    return thread.messages
      .slice(-8)
      .map(m => m.text.trim())
      .filter(Boolean)
      .join('\n')
      .slice(0, 1200);
  }, [thread.messages]);

  const internalInsightSig = useMemo(() => {
    if (thread.messages.length === 0) return '';
    const last = thread.messages[thread.messages.length - 1];
    return `${thread.messages.length}|${last?.at}|${last?.id}`;
  }, [thread.messages]);

  const fetchSummary = useCallback(async () => {
    setSummaryLoading(true);
    setSummaryError('');
    setSummaryText('');
    setSummaryThreadCount(null);
    try {
      const sorted = [...thread.messages].sort(
        (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime(),
      );
      if (sorted.length === 0) {
        setSummaryError('No messages in this chat yet.');
        return;
      }
      const msgPayload = sorted.map(m => ({
        sender: m.fromMe ? 'You' : thread.peerName,
        text: m.text,
        timestamp: m.at,
        from_me: m.fromMe,
      }));
      const resAi = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: msgPayload,
          chat_name: thread.peerName,
          channel: 'internal',
        }),
      });
      const out = await resAi.json();
      if (!resAi.ok) throw new Error(out.error || 'Summarization failed');
      setSummaryText(out.summary || 'No summary generated.');
      setSummaryThreadCount(typeof out.message_count === 'number' ? out.message_count : sorted.length);
      const s = String(out.summary || '').trim();
      const tone = inferReplyToneFromSummary(s);
      saveChatMemory(internalThreadKey, { summary: s, tone, updatedAt: new Date().toISOString() });
      setThreadInsight({ summary: s, tone });
    } catch (e: unknown) {
      setSummaryError(e instanceof Error ? e.message : 'Summarization failed');
    } finally {
      setSummaryLoading(false);
    }
  }, [thread.messages, thread.peerName, internalThreadKey]);

  const prefetchInternalInsight = useCallback(async () => {
    const sorted = [...internalMsgsRef.current].sort(
      (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime(),
    );
    if (sorted.length === 0) return;
    const msgPayload = sorted.map(m => ({
      sender: m.fromMe ? 'You' : thread.peerName,
      text: m.text,
      timestamp: m.at,
      from_me: m.fromMe,
    }));

    setThreadInsightBusy(true);
    try {
      const res = await fetch('/api/comm/thread-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          thread_key: internalThreadKey,
          messages: msgPayload,
          chat_name: thread.peerName,
          channel: 'internal',
        }),
      });

      if (res.ok) {
        const d = await res.json();
        const summary = String(d.summary || '').trim();
        const tone = (['professional', 'friendly', 'concise', 'detailed'].includes(String(d.tone))
          ? d.tone
          : 'professional') as ReplyTone;
        if (summary.length > 12) {
          saveChatMemory(internalThreadKey, { summary, tone, updatedAt: new Date().toISOString() });
          setThreadInsight({ summary, tone });
          setSummaryText((st) => (st ? st : summary));
        }
        return;
      }

      const prev = loadChatMemory(internalThreadKey)?.summary || '';
      const r2 = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: msgPayload,
          chat_name: thread.peerName,
          channel: 'internal',
          previous_summary: prev,
        }),
      });
      const out = await r2.json();
      if (r2.ok && out.summary) {
        const summary = String(out.summary).trim();
        const tone = inferReplyToneFromSummary(summary);
        saveChatMemory(internalThreadKey, { summary, tone, updatedAt: new Date().toISOString() });
        setThreadInsight({ summary, tone });
        setSummaryText((st) => (st ? st : summary));
      }
    } catch {
      /* best-effort */
    } finally {
      setThreadInsightBusy(false);
    }
  }, [internalThreadKey, thread.peerName]);

  useEffect(() => {
    if (!internalInsightSig) return;
    const t = window.setTimeout(() => {
      void prefetchInternalInsight();
    }, 550);
    return () => window.clearTimeout(t);
  }, [internalInsightSig, prefetchInternalInsight]);

  const copySummary = () => {
    navigator.clipboard.writeText(summaryText);
    setSummaryCopied(true);
    setTimeout(() => setSummaryCopied(false), 2000);
  };

  const handleToggleSummary = () => {
    if (!showSummary) {
      setShowSummary(true);
      if (!summaryText && !summaryLoading) void fetchSummary();
    } else {
      setShowSummary(false);
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread.messages.length]);

  useEffect(() => {
    setSummaryText('');
    setSummaryError('');
    setShowSummary(false);
    setSummaryThreadCount(null);
    const mem = loadChatMemory(internalThreadKey);
    if (mem?.summary) {
      setThreadInsight({
        summary: mem.summary,
        tone: (mem.tone as ReplyTone) || inferReplyToneFromSummary(mem.summary),
      });
    } else {
      setThreadInsight(null);
    }
    setThreadInsightBusy(false);
  }, [thread.id, internalThreadKey]);

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="shrink-0 px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2">
          {onBack && (
            <button type="button" onClick={onBack} className="hub-touch-target shrink-0 rounded-lg lg:hidden" style={{ color: 'var(--muted-foreground)' }} aria-label="Back">
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <Icon className="h-4 w-4 shrink-0" style={{ color: CHANNEL_COLOR.internal }} />
          <div className="min-w-0 flex-1">
            <h2 className="text-[13px] font-semibold truncate" style={{ color: 'var(--foreground)' }}>{thread.peerName}</h2>
            {thread.peerRole ? (
              <p className="text-[10px] truncate mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{thread.peerRole}</p>
            ) : null}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showSummary && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="shrink-0 mx-4 mt-3">
            <div className="rounded-xl overflow-hidden" style={{
              background: 'linear-gradient(135deg, color-mix(in srgb, var(--primary) 6%, var(--background)), color-mix(in srgb, #a855f7 4%, var(--background)))',
              border: '1px solid color-mix(in srgb, var(--primary) 20%, var(--border))',
              boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
            }}>
              <div className="flex items-center gap-2 px-3 py-2" style={{ borderBottom: '1px solid color-mix(in srgb, var(--primary) 10%, var(--border))' }}>
                <div className="flex items-center justify-center h-5 w-5 rounded-md" style={{ background: 'linear-gradient(135deg, #a855f7, #6366f1)' }}>
                  <Sparkles className="h-3 w-3 text-white" />
                </div>
                <div className="min-w-0 flex flex-col gap-0.5">
                  <span className="text-[11px] font-semibold" style={{ color: 'var(--foreground)' }}>AI Summary</span>
                  {summaryThreadCount != null && (
                    <span className="text-[9px] font-medium truncate" style={{ color: 'var(--muted-foreground)' }}>
                      Thread · {summaryThreadCount} message{summaryThreadCount !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium shrink-0" style={{
                  background: 'color-mix(in srgb, var(--primary) 12%, transparent)',
                  color: 'var(--primary)',
                }}>GPT</span>
                <div className="flex-1" />
                {summaryText && (
                  <>
                    <button type="button" onClick={copySummary} title="Copy summary"
                      className="rounded p-1 hover:bg-white/10 transition-colors" style={{ color: 'var(--muted-foreground)' }}>
                      {summaryCopied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    </button>
                    <button type="button" onClick={() => void fetchSummary()} title="Regenerate summary" disabled={summaryLoading}
                      className="rounded p-1 hover:bg-white/10 transition-colors disabled:opacity-40" style={{ color: 'var(--muted-foreground)' }}>
                      <RotateCcw className={cn('h-3 w-3', summaryLoading && 'animate-spin')} />
                    </button>
                  </>
                )}
                <button type="button" onClick={() => setShowSummary(false)} className="rounded p-1 hover:bg-white/10 transition-colors" style={{ color: 'var(--muted-foreground)' }}>
                  <X className="h-3 w-3" />
                </button>
              </div>

              <div className="px-3.5 py-3 min-h-[56px]">
                {summaryLoading && (
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="h-3 w-3" style={{ color: '#a855f7' }} />
                      <span className="text-[10px] font-medium" style={{ color: 'var(--muted-foreground)' }}>Summarizing…</span>
                    </div>
                    {[100, 92, 85, 60].map((w, i) => (
                      <div key={i} className="rounded-md overflow-hidden" style={{
                        width: `${w}%`, height: '8px',
                        background: 'color-mix(in srgb, var(--foreground) 6%, var(--background))',
                      }} />
                    ))}
                  </div>
                )}
                {summaryError && (
                  <div className="flex items-center gap-2.5 py-1">
                    <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                    <span className="text-[11px] flex-1 font-medium" style={{ color: '#ef4444' }}>{summaryError}</span>
                    <button type="button" onClick={() => void fetchSummary()} className="text-[10px] font-semibold px-2.5 py-1 rounded-lg hover:bg-red-500/10 shrink-0" style={{ color: '#ef4444', border: '1px solid color-mix(in srgb, #ef4444 25%, transparent)' }}>Retry</button>
                  </div>
                )}
                {!summaryLoading && !summaryError && summaryText && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-[11px] leading-[1.7] whitespace-pre-wrap"
                    style={{ color: 'var(--foreground)' }}>
                    {summaryText}
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
        {thread.messages.length === 0 && (
          <p className="text-center text-[12px] py-8 leading-relaxed max-w-xs mx-auto" style={{ color: 'var(--muted-foreground)' }}>
            Team-only chat — not synced to WhatsApp, email, or LinkedIn. Send a message to start.
          </p>
        )}
        {thread.messages.map(m => {
          const fromMe = m.fromMe;
          return (
            <div key={m.id} className={cn('flex gap-2.5', fromMe ? 'justify-end' : 'justify-start')}>
              {!fromMe && (
                <div className="shrink-0 h-7 w-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold mt-1"
                  style={{ background: CHANNEL_GRADIENT.internal }}>
                  {initials(thread.peerName)}
                </div>
              )}
              <div className={cn('flex flex-col gap-1', fromMe ? 'items-end max-w-[72%]' : 'items-start max-w-[72%]')}>
                <div className={cn('flex items-center gap-1.5', fromMe ? 'flex-row-reverse' : 'flex-row')}>
                  <span className="text-[11px] font-semibold" style={{ color: 'var(--foreground)' }}>{fromMe ? 'You' : thread.peerName}</span>
                  <span className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>{fmtTime(m.at)}</span>
                </div>
                <div
                  className={cn('rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap break-words shadow-sm', fromMe ? 'rounded-tr-sm' : 'rounded-tl-sm')}
                  style={fromMe
                    ? { background: 'var(--primary)', color: 'var(--primary-foreground)' }
                    : { background: 'var(--secondary)', color: 'var(--foreground)', border: '1px solid var(--border)' }}>
                  {m.text}
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
        contactName={thread.peerName}
        chatId={`internal:${thread.id}`}
        snippet={contextSnippet}
      />
      <CommunicationCreateIssueModal
        open={issueModalOpen}
        onClose={() => setIssueModalOpen(false)}
        contactName={thread.peerName}
        chatId={`internal:${thread.id}`}
        snippet={contextSnippet}
      />

      <ReplyBox
        onSend={onSend}
        sending={sending}
        messages={replyMessages}
        chatName={thread.peerName}
        peerLabel={thread.peerName}
        senderLookup={{}}
        channel="internal"
        chatId={internalThreadKey}
        prefetchSummary={threadInsight?.summary}
        prefetchTone={threadInsight?.tone}
        insightLoading={threadInsightBusy}
      />
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

  // Chats (LinkedIn / WhatsApp / etc.) + email threads (GET /emails — not /chats)
  const [chats, setChats] = useState<UnipileChat[]>([]);
  const [emailThreads, setEmailThreads] = useState<UnipileChat[]>([]);
  const [emailFetchError, setEmailFetchError] = useState('');
  const [chatsLoading, setChatsLoading] = useState(false);
  const [chatsError, setChatsError] = useState('');
  /** Sidebar: names/avatars from attendees when list API is sparse */
  const [chatEnrichment, setChatEnrichment] = useState<Record<string, ChatListEnrichment>>({});
  const listEnrichLoadedRef = useRef(new Set<string>());
  const listEnrichInFlightRef = useRef(new Set<string>());

  // Selected chat + send
  const [selectedChat, setSelectedChat] = useState<UnipileChat | null>(null);
  const [sending, setSending] = useState(false);
  const [mobileDetail, setMobileDetail] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [channelFilter, setChannelFilter] = useState('all');

  // Compose new email (not a reply)
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeAccountId, setComposeAccountId] = useState<string>('');
  const [composeTo, setComposeTo] = useState('');
  const [composeCc, setComposeCc] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [composeSending, setComposeSending] = useState(false);
  const [composeError, setComposeError] = useState('');
  const [composeSent, setComposeSent] = useState(false);

  // Compose: split-menu + internal
  const [composeMenuOpen, setComposeMenuOpen] = useState(false);
  const composeMenuRef = useRef<HTMLDivElement>(null);
  const [composeInternalOpen, setComposeInternalOpen] = useState(false);
  const [composeInternalTo, setComposeInternalTo] = useState<string>(INTERNAL_TEAM[0]?.id ?? '1');
  const [composeInternalBody, setComposeInternalBody] = useState('');

  const [internalThreads, setInternalThreads] = useState<InternalThread[]>(() => seedInternalThreads());
  const internalHydratedRef = useRef(false);

  const chatsCacheRef = useRef(new Map<string, { items: UnipileChat[]; at: number }>());
  const accountsCacheHydratedRef = useRef(false);
  const chatsCacheHydratedRef = useRef(false);

  // On mobile navigating back to list
  useEffect(() => { if (isLg) setMobileDetail(false); }, [isLg]);

  const fetchAccounts = useCallback(async (opts?: { force?: boolean }) => {
    const cache = getCommNavCache();
    const cached = cache.accounts;
    const fresh = cached && Date.now() - cached.at < ACCOUNTS_CACHE_TTL_MS;

    // Fresh cache short-circuit (skip when forcing — e.g. after disconnect).
    if (!opts?.force && cached?.items?.length && fresh) {
      setAccounts(cached.items);
      setAccountsError('');
      setAccountsLoading(false);
      return;
    }

    // Stale or forced: keep showing last list while refetching (no blocking spinner if we have data).
    if (cached?.items?.length) {
      setAccounts(cached.items);
      setAccountsError('');
      setAccountsLoading(false);
    } else {
      setAccountsLoading(true);
      setAccountsError('');
    }

    try {
      const data = await commFetchJsonWithPolicy<any>({
        key: 'unipile:accounts',
        url: '/api/unipile/accounts',
        dedupe: true,
      });
      const rawList: unknown[] = Array.isArray(data) ? data : (data.items || data.accounts || []);
      const items: UnipileAccount[] = rawList
        .map((r) => (r && typeof r === 'object' ? normalizeUnipileAccount(r as Record<string, unknown>) : null))
        .filter((a): a is UnipileAccount => a != null);
      setAccounts(items);
      getCommNavCache().accounts = { items, at: Date.now() };
    } catch (e: any) {
      if (!cached?.items?.length) setAccountsError(e.message);
    } finally {
      setAccountsLoading(false);
    }
  }, []);

  const fetchChats = useCallback(async (accountId?: string, opts?: { force?: boolean; background?: boolean }) => {
    const key = !accountId || accountId === 'all' ? 'all' : accountId;

    if (opts?.force) {
      chatsCacheRef.current.delete(key);
      setChatEnrichment({});
      listEnrichLoadedRef.current.clear();
      listEnrichInFlightRef.current.clear();
    }

    const cached = chatsCacheRef.current.get(key);
    const stale = !cached || Date.now() - cached.at >= CHATS_CACHE_TTL_MS;

    if (!opts?.background) {
      if (cached?.items?.length) {
        setChats(cached.items);
        setChatsError('');
      }

      if (cached?.items?.length && !opts?.force && !stale) {
        setChatsLoading(false);
        return;
      }

      if (cached?.items?.length && !opts?.force && stale) {
        setChatsLoading(false);
        void fetchChats(accountId, { background: true });
        return;
      }

      setChatsLoading(true);
      setChatsError('');
    }

    try {
      const params = new URLSearchParams({ fetch_all: '1' });
      if (accountId && accountId !== 'all') params.set('account_id', accountId);
      const data = await commFetchJsonWithPolicy<any>({
        key: `unipile:chats:${key}`,
        url: `/api/unipile/chats?${params}`,
        dedupe: true,
      });
      const items: UnipileChat[] = Array.isArray(data) ? data : (data.items || data.chats || []);
      chatsCacheRef.current.set(key, { items, at: Date.now() });
      setChats(items);
      const cache = getCommNavCache();
      cache.chats = cache.chats || {};
      cache.chats[key] = { items, at: Date.now() };
      if (!opts?.background) setChatsError('');
    } catch (e: any) {
      if (!opts?.background) setChatsError(e.message);
    } finally {
      if (!opts?.background) setChatsLoading(false);
    }
  }, []);

  const fetchEmailThreads = useCallback(
    async (accountFilter?: string) => {
      const key = !accountFilter || accountFilter === 'all' ? 'all' : accountFilter;
      const emailAccounts = accounts.filter((a) => {
        if (providerToChannel(a.type) !== 'email') return false;
        if (key === 'all') return true;
        return a.id === key;
      });
      if (!emailAccounts.length) {
        setEmailThreads([]);
        setEmailFetchError('');
        return;
      }
      setEmailFetchError('');
      try {
        const combined: UnipileChat[] = [];
        const errs: string[] = [];
        for (const acc of emailAccounts) {
          // Omit meta_only — Unipile's 0_ref rows lack subject/from; we need 1_meta for the inbox list.
          const res = await fetch(
            `/api/unipile/emails?account_id=${encodeURIComponent(acc.id)}&fetch_all=1&limit=100`,
            { credentials: 'include' },
          );
          const data = (await res.json().catch(() => ({}))) as { items?: unknown[]; error?: unknown };
          if (!res.ok) {
            const msg =
              typeof data.error === 'string'
                ? data.error
                : data.error != null
                  ? JSON.stringify(data.error)
                  : `HTTP ${res.status}`;
            errs.push(`${acc.name || acc.type || acc.id}: ${msg}`);
            continue;
          }
          const items = Array.isArray(data.items) ? data.items : [];
          combined.push(...groupRawEmailsToChats(items, acc.id));
        }
        combined.sort((a, b) => chatSortTimestampMs(b) - chatSortTimestampMs(a));
        setEmailThreads(combined);
        if (errs.length) setEmailFetchError(errs.join(' · '));
      } catch (e: unknown) {
        setEmailThreads([]);
        setEmailFetchError(e instanceof Error ? e.message : 'Failed to load email');
      }
    },
    [accounts],
  );

  // After Unipile OAuth redirect
  useEffect(() => {
    const connected = searchParams?.get('connected');
    if (!connected) return;
    fetchAccounts();
    fetchChats(undefined, { force: true });
    void fetchEmailThreads('all');
  }, [searchParams, fetchAccounts, fetchChats, fetchEmailThreads]);

  useEffect(() => {
    if (internalHydratedRef.current) return;
    internalHydratedRef.current = true;
    const saved = loadInternalThreadsFromStorage();
    if (saved?.length) setInternalThreads(mergeInternalThreads(saved));
  }, []);

  useEffect(() => {
    if (!internalThreads.length || typeof window === 'undefined') return;
    try {
      localStorage.setItem(INTERNAL_INBOX_STORAGE_KEY, JSON.stringify(internalThreads));
    } catch {
      /* ignore quota */
    }
  }, [internalThreads]);

  const requestChatListEnrichment = useCallback((chat: UnipileChat) => {
    if (chat.account_id === INTERNAL_LOCAL_ACCOUNT) return;
    if (chat.id.startsWith('mail:')) return;
    const id = chat.id;
    if (listEnrichLoadedRef.current.has(id) || listEnrichInFlightRef.current.has(id)) return;
    const baseName = chatName(chat);
    const hasAvatar = !!chatAvatarUrl(chat);
    const accChannel = channelFromAccountId(chat.account_id, accounts);
    const needBetterName =
      baseName === 'Unknown Contact' ||
      (accChannel === 'whatsapp' && looksLikePhoneOrMaskedId(baseName));
    if (!needBetterName && hasAvatar) {
      listEnrichLoadedRef.current.add(id);
      return;
    }
    listEnrichInFlightRef.current.add(id);
    fetch(`/api/unipile/chat-attendees?chat_id=${encodeURIComponent(id)}`)
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error('attendees');
        const items = Array.isArray(data) ? data : (data.items || data.data || data.attendees || []);
        return listEnrichmentFromAttendees(items);
      })
      .then(({ displayName, avatarUrl }) => {
        listEnrichLoadedRef.current.add(id);
        setChatEnrichment(prev => ({
          ...prev,
          [id]: {
            displayName: displayName || baseName,
            avatarUrl,
            loaded: true,
          },
        }));
      })
      .catch(() => {
        listEnrichLoadedRef.current.add(id);
        setChatEnrichment(prev => ({
          ...prev,
          [id]: { displayName: baseName, avatarUrl: null, loaded: true },
        }));
      })
      .finally(() => {
        listEnrichInFlightRef.current.delete(id);
      });
  }, [accounts]);

  // Hydrate from global cache instantly on revisit (fast page switching).
  useEffect(() => {
    if (accountsCacheHydratedRef.current) return;
    accountsCacheHydratedRef.current = true;
    const cache = getCommNavCache();
    if (cache.accounts?.items?.length) {
      setAccounts(cache.accounts.items);
      setAccountsLoading(false);
    }
  }, []);

  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);
  useEffect(() => {
    // Seed chats cache from global cache on first mount.
    if (!chatsCacheHydratedRef.current) {
      chatsCacheHydratedRef.current = true;
      const cache = getCommNavCache();
      if (cache.chats) {
        Object.entries(cache.chats).forEach(([k, v]) => {
          if (v?.items?.length) chatsCacheRef.current.set(k, v);
        });
      }
    }
    if (!accountsLoading) fetchChats(selectedAccountId);
  }, [accountsLoading, selectedAccountId, fetchChats]);

  useEffect(() => {
    if (accountsLoading) return;
    void fetchEmailThreads(selectedAccountId);
  }, [accountsLoading, selectedAccountId, fetchEmailThreads]);

  const handleConnect = async (provider: string) => {
    setConnecting(provider);
    try {
      const res = await fetch('/api/unipile/connect', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string; code?: string };
      if (!res.ok || !data.url) {
        const msg =
          typeof data.error === 'string'
            ? data.error
            : res.status === 503
              ? 'Unipile is not configured or the API URL is invalid. Check .env.local (UNIPILE_API_URL with real host:port, UNIPILE_ACCESS_TOKEN).'
              : JSON.stringify(data.error || data);
        throw new Error(msg);
      }
      // Open hosted auth in same tab — Unipile will redirect back on success
      window.location.href = data.url;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Connection failed';
      console.error(`Connection error: ${message}`);
      setConnecting(null);
    }
  };

  const handleSelectChat = (chat: UnipileChat) => {
    setSelectedChat(chat);
    if (!isLg) setMobileDetail(true);
  };

  const startInternalThread = useCallback(async () => {
    const person = INTERNAL_TEAM.find((p) => String(p.id) === String(composeInternalTo)) ?? INTERNAL_TEAM[0];
    const peerName = person?.name || 'Teammate';
    const now = new Date().toISOString();
    const tid = `internal-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const firstText = composeInternalBody.trim();
    const thread: InternalThread = {
      id: tid,
      peerId: String(person?.id || '1'),
      peerName,
      peerRole: person?.role,
      messages: firstText ? [{ id: `im-${Date.now()}`, text: firstText, fromMe: true, at: now }] : [],
      updatedAt: now,
    };
    setInternalThreads((prev) => [thread, ...prev]);
    setComposeInternalBody('');
    setComposeInternalOpen(false);
    setComposeMenuOpen(false);
    handleSelectChat(internalThreadToChat(thread));
  }, [composeInternalTo, composeInternalBody, handleSelectChat]);

  const handleSend = async (text: string) => {
    if (!selectedChat) return;
    if (selectedChat.account_id === INTERNAL_LOCAL_ACCOUNT) {
      setSending(true);
      try {
        const tid = selectedChat.id;
        const now = new Date().toISOString();
        const msgId = `im-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        setInternalThreads(prev =>
          prev.map(t =>
            t.id !== tid
              ? t
              : { ...t, messages: [...t.messages, { id: msgId, text, fromMe: true, at: now }], updatedAt: now },
          ),
        );
        setSelectedChat(c =>
          c && c.id === tid
            ? {
              ...c,
              last_message: { text, from_me: true, timestamp: now },
              updated_at: now,
              timestamp: now,
            }
            : c,
        );
      } finally {
        setSending(false);
      }
      return;
    }
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
      const ts = new Date().toISOString();
      setSelectedChat(c => c ? { ...c, last_message: { text, from_me: true, timestamp: ts }, updated_at: ts, timestamp: ts } : c);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Send failed';
      console.error(`Send error: ${msg}`);
      throw e;
    } finally {
      setSending(false);
    }
  };

  const internalChatsAsUnipile = useMemo(
    () => internalThreads.map(internalThreadToChat),
    [internalThreads],
  );

  const connectedAccountIds = useMemo(() => new Set(accounts.map((a) => String(a.id))), [accounts]);
  const connectedIntegrationChannels = useMemo(() => channelsFromAccounts(accounts), [accounts]);
  const emailAccounts = useMemo(() => accounts.filter(isEmailAccount), [accounts]);

  useEffect(() => {
    if (!composeOpen) return;
    if (!composeAccountId && emailAccounts[0]?.id) setComposeAccountId(String(emailAccounts[0].id));
  }, [composeOpen, composeAccountId, emailAccounts]);

  const sendComposedEmail = useCallback(async () => {
    if (!composeAccountId || !composeTo.trim() || !composeBody.trim() || composeSending) return;
    setComposeSending(true);
    setComposeError('');
    try {
      const res = await fetch('/api/unipile/emails/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account_id: composeAccountId,
          to: composeTo.trim(),
          cc: composeCc.trim() || undefined,
          subject: composeSubject.trim() || '(no subject)',
          body: composeBody.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to send email');
      setComposeSent(true);
      setTimeout(() => setComposeSent(false), 2500);
      setComposeBody('');
      setComposeSubject('');
      setComposeCc('');
      setComposeTo('');
      setComposeOpen(false);
      // Refresh inbox (non-blocking)
      void fetchEmailThreads(selectedAccountId);
    } catch (e: unknown) {
      setComposeError(e instanceof Error ? e.message : 'Failed to send email');
    } finally {
      setComposeSending(false);
    }
  }, [composeAccountId, composeTo, composeCc, composeSubject, composeBody, composeSending, fetchEmailThreads, selectedAccountId]);

  const listChats = useMemo(() => [...chats, ...emailThreads], [chats, emailThreads]);

  useEffect(() => {
    const allowed = new Set<string>(['all', 'internal', ...connectedIntegrationChannels]);
    if (!allowed.has(channelFilter)) setChannelFilter('all');
  }, [channelFilter, connectedIntegrationChannels]);

  // Filtered chats
  const filteredChats = useMemo(() => {
    const rowLabel = (c: UnipileChat) => {
      const e = chatEnrichment[c.id];
      const base = chatName(c);
      return e?.loaded ? (e.displayName || base) : base;
    };

    const basePool: UnipileChat[] =
      channelFilter === 'internal'
        ? [
          ...internalChatsAsUnipile,
          ...listChats.filter(c => channelFromAccountId(c.account_id, accounts) === 'internal'),
        ]
        : channelFilter === 'all'
          ? [...internalChatsAsUnipile, ...listChats]
          : listChats;

    return basePool.filter(chat => {
      if (
        chat.account_id !== INTERNAL_LOCAL_ACCOUNT &&
        !connectedAccountIds.has(String(chat.account_id))
      ) {
        return false;
      }
      if (channelFilter !== 'all' && channelFilter !== 'internal') {
        const ch = channelFromAccountId(chat.account_id, accounts);
        if (ch !== channelFilter) return false;
      }
      if (search) {
        const s = search.toLowerCase();
        const name = rowLabel(chat).toLowerCase();
        const snip = chatSnippet(chat).toLowerCase();
        const subj = (chat.subject || '').toLowerCase();
        if (!name.includes(s) && !snip.includes(s) && !subj.includes(s)) return false;
      }
      return true;
    });
  }, [listChats, channelFilter, search, accounts, chatEnrichment, internalChatsAsUnipile, connectedAccountIds]);

  const sortedFilteredChats = useMemo(() => {
    return [...filteredChats].sort((a, b) => {
      const tb = chatSortTimestampMs(b);
      const ta = chatSortTimestampMs(a);
      if (tb !== ta) return tb - ta;
      return String(b.id).localeCompare(String(a.id));
    });
  }, [filteredChats]);

  const showList = isLg || !mobileDetail;
  const showDetail = isLg || mobileDetail;
  const hasUnipileAccounts = accounts.length > 0;
  /** After accounts fetch: show inbox even if Unipile is down or unset (internal threads still work). */
  const showInboxShell = !accountsLoading;

  const disconnectAccount = useCallback(async (accountId: string) => {
    setAccountsError('');
    try {
      const res = await fetch(`/api/unipile/accounts/${encodeURIComponent(accountId)}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({} as Record<string, unknown>));
      if (!res.ok) {
        const err =
          typeof data.error === 'string'
            ? data.error
            : data.error && typeof data.error === 'object'
              ? JSON.stringify(data.error)
              : `Failed to disconnect (${res.status})`;
        throw new Error(err);
      }

      const nextSelected = selectedAccountId === accountId ? 'all' : selectedAccountId;
      if (nextSelected === 'all') setSelectedAccountId('all');

      const remaining = accounts.filter((a) => a.id !== accountId);
      setAccounts(remaining);
      getCommNavCache().accounts = {
        items: remaining,
        at: Date.now() - ACCOUNTS_CACHE_TTL_MS - 1,
      };

      chatsCacheRef.current.clear();
      getCommNavCache().chats = {};

      await fetchAccounts({ force: true });
      await fetchChats(nextSelected, { force: true });
    } catch (e: unknown) {
      setAccountsError(e instanceof Error ? e.message : 'Failed to disconnect account');
      await fetchAccounts({ force: true });
    }
  }, [accounts, fetchAccounts, fetchChats, selectedAccountId]);

  useEffect(() => {
    const h = (e: Event) => {
      const ce = e as CustomEvent;
      const id = ce.detail?.accountId;
      if (id) void disconnectAccount(String(id));
    };
    window.addEventListener('hub:unipile-disconnect', h as any);
    return () => window.removeEventListener('hub:unipile-disconnect', h as any);
  }, [disconnectAccount]);

  // Drive in-page search from the top header search bar when present.
  useEffect(() => {
    const h = (e: Event) => {
      const ce = e as CustomEvent;
      const q = String(ce.detail?.q ?? '');
      setSearch(q);
    };
    window.addEventListener('hub:global-search', h as any);
    return () => window.removeEventListener('hub:global-search', h as any);
  }, []);

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

      {/* ── Toolbar: search + connect/manage + channel filters (single glass strip) ── */}
      {!accountsLoading && showInboxShell && (
        <div
          className="shrink-0 hub-surface border-b border-border/70"
          style={{ borderBottomWidth: 1 }}
        >
            <div className="px-4 py-2">
            <div className="flex flex-wrap items-center gap-2">
              {/* Left: channel switcher */}
              <div className="min-w-0">
                <ChannelSegmented
                  value={channelFilter}
                  onChange={setChannelFilter}
                  connectedChannels={connectedIntegrationChannels}
                />
              </div>

              {/* Middle: search state chip (driven by header global search) */}
              <div className="min-w-0 flex items-center gap-2 flex-1">
                {search.trim() ? (
                  <div
                    className="flex min-w-0 items-center gap-2 rounded-[12px] px-2.5 py-1.5"
                    style={{
                      background: 'color-mix(in srgb, var(--foreground) 5%, transparent)',
                      border: '1px solid color-mix(in srgb, var(--border) 80%, transparent)',
                    }}
                  >
                    <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 truncate text-[11px]" style={{ color: 'var(--foreground)' }}>
                      <span className="font-semibold">{search.trim()}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setSearch('')}
                      className="shrink-0 rounded-lg p-1 transition-colors hover:bg-secondary/80"
                      style={{ color: 'var(--muted-foreground)' }}
                      title="Clear"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <span className="text-[11px] text-muted-foreground truncate">
                    Search from the top bar to filter conversations.
                  </span>
                )}
              </div>

              {/* Right: actions */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Compose appears only on Email tab */}
                {channelFilter === 'email' && emailAccounts.length > 0 && (
                  <div className="relative" ref={composeMenuRef}>
                    <button
                      type="button"
                      onClick={() => setComposeMenuOpen((v) => !v)}
                      className="flex items-center gap-1.5 rounded-[10px] px-3 py-2 text-[12px] font-semibold transition-colors hover:bg-secondary/80"
                      style={{ border: '1px solid var(--border)', color: 'var(--foreground)' }}
                      title="Compose"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Compose
                      <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                    </button>

                    <AnimatePresence>
                      {composeMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.98, y: 6 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.98, y: 6 }}
                          transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
                          className="absolute right-0 top-full mt-2 w-60 overflow-hidden rounded-2xl shadow-2xl"
                          style={{
                            background: 'var(--popover)',
                            border: '1px solid color-mix(in srgb, var(--border) 85%, transparent)',
                            backdropFilter: 'saturate(180%) blur(12px)',
                          }}
                        >
                          <div className="px-4 pt-3 pb-2" style={{ borderBottom: '1px solid var(--border)' }}>
                            <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>
                              Compose
                            </p>
                            <p className="text-[12px] mt-0.5" style={{ color: 'var(--foreground)' }}>
                              Start a new message
                            </p>
                          </div>
                          <div className="p-2 space-y-0.5">
                            <button
                              type="button"
                              onClick={() => { setComposeOpen(true); setComposeMenuOpen(false); }}
                              className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-muted/60"
                              style={{ color: 'var(--foreground)' }}
                            >
                              <Mail className="h-4 w-4" style={{ color: CHANNEL_COLOR.email }} />
                              <div className="min-w-0 flex-1">
                                <p className="text-[13px] font-semibold leading-tight">Email</p>
                                <p className="text-[11px] mt-0.5" style={{ color: 'var(--muted-foreground)' }}>New outbound email</p>
                              </div>
                            </button>
                            <button
                              type="button"
                              onClick={() => { setComposeInternalOpen(true); setComposeMenuOpen(false); }}
                              className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-muted/60"
                              style={{ color: 'var(--foreground)' }}
                            >
                              <StickyNote className="h-4 w-4" style={{ color: CHANNEL_COLOR.internal }} />
                              <div className="min-w-0 flex-1">
                                <p className="text-[13px] font-semibold leading-tight">Internal</p>
                                <p className="text-[11px] mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Message a teammate</p>
                              </div>
                            </button>
                            <button
                              type="button"
                              disabled
                              className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left opacity-50"
                              style={{ color: 'var(--foreground)' }}
                              title="LinkedIn compose coming soon"
                            >
                              <MessageCircle className="h-4 w-4" style={{ color: CHANNEL_COLOR.linkedin }} />
                              <div className="min-w-0 flex-1">
                                <p className="text-[13px] font-semibold leading-tight">LinkedIn</p>
                                <p className="text-[11px] mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Coming soon</p>
                              </div>
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                <AccountBar accounts={accounts} onConnect={handleConnect} connecting={connecting} />

                <span className="text-[11px] tabular-nums whitespace-nowrap text-muted-foreground">
                  {sortedFilteredChats.length} thread{sortedFilteredChats.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {accountsError && (
              <div
                className="flex flex-wrap items-start gap-2 rounded-[10px] border px-3 py-2 text-[11px] leading-snug"
                style={{
                  borderColor: 'color-mix(in srgb, var(--destructive) 35%, var(--border))',
                  background: 'color-mix(in srgb, var(--destructive) 8%, transparent)',
                  color: 'var(--muted-foreground)',
                }}
              >
                <WifiOff className="h-3.5 w-3.5 shrink-0 text-red-500 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground">Could not load Unipile accounts</p>
                  <p className="mt-0.5 break-words">{accountsError}</p>
                  <BonsaiButton size="sm" className="mt-2" onClick={() => void fetchAccounts({ force: true })}>
                    <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                    Retry
                  </BonsaiButton>
                </div>
              </div>
            )}
            {emailFetchError && (
              <div
                className="flex flex-wrap items-start gap-2 rounded-[10px] border px-3 py-2 text-[11px] leading-snug"
                style={{
                  borderColor: 'color-mix(in srgb, #d97706 35%, var(--border))',
                  background: 'color-mix(in srgb, #d97706 8%, transparent)',
                  color: 'var(--muted-foreground)',
                }}
              >
                <Mail className="h-3.5 w-3.5 shrink-0 mt-0.5" style={{ color: '#d97706' }} />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground">Could not load email from Unipile</p>
                  <p className="mt-0.5 break-words">{emailFetchError}</p>
                  <BonsaiButton
                    size="sm"
                    className="mt-2"
                    onClick={() => void fetchEmailThreads(selectedAccountId)}
                  >
                    <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                    Retry email sync
                  </BonsaiButton>
                </div>
              </div>
            )}
            {!hasUnipileAccounts && !accountsError && (
              <p className="text-[11px] leading-snug" style={{ color: 'var(--muted-foreground)' }}>
                No email, LinkedIn, or WhatsApp connected yet — use <span className="font-medium text-foreground">Connect</span> to add integrations.
                Internal threads below work without Unipile.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Loading accounts (non-blocking skeleton) ── */}
      {accountsLoading && accounts.length === 0 && (
        <div className="flex flex-1 min-h-0 overflow-hidden">
          <div className={cn('flex flex-col border-r min-h-0 overflow-hidden', isLg ? 'w-[360px] min-w-[300px] max-w-[420px]' : 'w-full')}
            style={{ borderColor: 'var(--border)' }}>
            <div className="shrink-0 px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl animate-pulse" style={{ background: 'color-mix(in srgb, var(--foreground) 6%, transparent)' }} />
                <div className="flex-1 min-w-0">
                  <div className="h-3.5 w-40 rounded animate-pulse" style={{ background: 'color-mix(in srgb, var(--foreground) 6%, transparent)' }} />
                  <div className="h-3 w-24 rounded mt-2 animate-pulse" style={{ background: 'color-mix(in srgb, var(--foreground) 5%, transparent)' }} />
                </div>
                <Loader2 className="h-4 w-4 animate-spin" style={{ color: 'var(--muted-foreground)' }} />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-full animate-pulse" style={{ background: 'color-mix(in srgb, var(--foreground) 6%, transparent)' }} />
                    <div className="flex-1 min-w-0">
                      <div className="h-3.5 w-40 rounded animate-pulse" style={{ background: 'color-mix(in srgb, var(--foreground) 6%, transparent)' }} />
                      <div className="h-3 w-56 rounded mt-2 animate-pulse" style={{ background: 'color-mix(in srgb, var(--foreground) 5%, transparent)' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="hidden lg:flex flex-1 min-h-0 min-w-0 flex-col overflow-hidden">
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-6 w-6 animate-spin mx-auto" style={{ color: 'var(--muted-foreground)' }} />
                <p className="text-[12px] mt-2" style={{ color: 'var(--muted-foreground)' }}>Loading Communication…</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Main 2-col layout (internal always; Unipile when connected or chats load) ── */}
      {showInboxShell && (
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

                {!chatsLoading && chatsError && hasUnipileAccounts && (
                  <div className="p-4 text-center text-[12px]" style={{ color: 'var(--muted-foreground)' }}>
                    <AlertCircle className="h-5 w-5 mx-auto mb-2 text-red-500" />
                    {chatsError}
                    <button type="button" onClick={() => fetchChats(selectedAccountId)} className="block mx-auto mt-2 text-primary hover:underline">Retry</button>
                  </div>
                )}

                {!chatsLoading && (!chatsError || !hasUnipileAccounts) && sortedFilteredChats.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 gap-3 px-8 text-center">
                    <MessageSquare className="h-8 w-8" style={{ color: 'var(--muted-foreground)' }} />
                    <p className="text-[13px] font-medium" style={{ color: 'var(--foreground)' }}>No conversations yet</p>
                    <p className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>
                      {search ? 'No results match your search.' : 'Messages from your connected accounts will appear here.'}
                    </p>
                  </div>
                )}

                {sortedFilteredChats.map(chat => (
                  <ChatRow
                    key={chat.id}
                    chat={chat}
                    accounts={accounts}
                    active={selectedChat?.id === chat.id}
                    onClick={() => handleSelectChat(chat)}
                    enrichment={chatEnrichment[chat.id]}
                    onRequestEnrichment={requestChatListEnrichment}
                  />
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
                    {selectedChat.account_id === INTERNAL_LOCAL_ACCOUNT ? (
                      <InternalChatDetail
                        thread={
                          internalThreads.find(t => t.id === selectedChat.id) ?? {
                            id: selectedChat.id,
                            peerId: '',
                            peerName: chatName(selectedChat),
                            messages: [],
                            updatedAt: new Date().toISOString(),
                          }
                        }
                        onBack={!isLg ? () => setMobileDetail(false) : undefined}
                        onSend={handleSend}
                        sending={sending}
                      />
                    ) : (
                      <ChatDetail
                        chat={selectedChat}
                        accounts={accounts}
                        onBack={!isLg ? () => setMobileDetail(false) : undefined}
                        onSend={handleSend}
                        sending={sending}
                      />
                    )}
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

      {/* Compose new email modal */}
      <AnimatePresence>
        {composeOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.45)' }}
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setComposeOpen(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 8 }}
              transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
              className="hub-modal-solid w-full max-w-2xl overflow-hidden rounded-2xl shadow-2xl"
              style={{ border: '1px solid var(--border)' }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-2 px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold truncate" style={{ color: 'var(--foreground)' }}>Compose email</p>
                  <p className="text-[11px] mt-0.5 truncate" style={{ color: 'var(--muted-foreground)' }}>
                    New message · choose an email account
                  </p>
                </div>
                <button
                  type="button"
                  className="rounded-lg p-2 transition-colors hover:bg-secondary/80"
                  style={{ color: 'var(--muted-foreground)' }}
                  onClick={() => setComposeOpen(false)}
                  aria-label="Close compose"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="px-4 py-3 space-y-2.5">
                {composeError && (
                  <div className="flex items-start gap-2 rounded-xl px-3 py-2 text-[11px]"
                    style={{
                      background: 'color-mix(in srgb, #ef4444 8%, var(--background))',
                      border: '1px solid color-mix(in srgb, #ef4444 18%, var(--border))',
                      color: '#ef4444',
                    }}>
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1 break-words">{composeError}</div>
                  </div>
                )}
                {composeSent && (
                  <div className="flex items-center gap-2 rounded-xl px-3 py-2 text-[11px]"
                    style={{
                      background: 'color-mix(in srgb, #10b981 8%, var(--background))',
                      border: '1px solid color-mix(in srgb, #10b981 18%, var(--border))',
                      color: '#10b981',
                    }}>
                    <Check className="h-4 w-4" />
                    Sent
                  </div>
                )}

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <div className="sm:col-span-1">
                    <label className="text-[11px] font-medium" style={{ color: 'var(--muted-foreground)' }}>From</label>
                    <select
                      className="mt-1 w-full rounded-xl px-3 py-2 text-[12px] outline-none"
                      style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                      value={composeAccountId}
                      onChange={(e) => setComposeAccountId(e.target.value)}
                    >
                      {emailAccounts.map((a) => (
                        <option key={a.id} value={a.id}>
                          {(a.username || a.name || 'Email')} · {String(a.id).slice(0, 6)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-medium" style={{ color: 'var(--muted-foreground)' }}>To</label>
                    <input
                      className="mt-1 w-full rounded-xl px-3 py-2 text-[12px] outline-none"
                      style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                      value={composeTo}
                      onChange={(e) => setComposeTo(e.target.value)}
                      placeholder="recipient@email.com"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <div className="sm:col-span-1">
                    <label className="text-[11px] font-medium" style={{ color: 'var(--muted-foreground)' }}>Cc</label>
                    <input
                      className="mt-1 w-full rounded-xl px-3 py-2 text-[12px] outline-none"
                      style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                      value={composeCc}
                      onChange={(e) => setComposeCc(e.target.value)}
                      placeholder="cc@email.com (optional)"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-medium" style={{ color: 'var(--muted-foreground)' }}>Subject</label>
                    <input
                      className="mt-1 w-full rounded-xl px-3 py-2 text-[12px] outline-none"
                      style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                      value={composeSubject}
                      onChange={(e) => setComposeSubject(e.target.value)}
                      placeholder="Subject"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-medium" style={{ color: 'var(--muted-foreground)' }}>Message</label>
                  <textarea
                    className="mt-1 w-full rounded-2xl px-3 py-2 text-[12px] outline-none resize-none"
                    style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                    rows={10}
                    value={composeBody}
                    onChange={(e) => setComposeBody(e.target.value)}
                    placeholder="Write your email…"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 px-4 py-3"
                style={{ borderTop: '1px solid var(--border)', background: 'color-mix(in srgb, var(--secondary) 65%, transparent)' }}>
                <span className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>
                  Tip: use the top search to filter conversations (this modal is for new outbound email).
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setComposeOpen(false)}
                    className="rounded-xl px-3 py-2 text-[12px] font-semibold transition-colors hover:bg-secondary/80"
                    style={{ border: '1px solid var(--border)', color: 'var(--foreground)' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => void sendComposedEmail()}
                    disabled={!composeAccountId || !composeTo.trim() || !composeBody.trim() || composeSending}
                    className="rounded-xl px-4 py-2 text-[12px] font-semibold text-white disabled:opacity-40"
                    style={{ background: 'var(--primary)' }}
                  >
                    {composeSending ? 'Sending…' : 'Send'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compose internal modal */}
      <AnimatePresence>
        {composeInternalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.45)' }}
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setComposeInternalOpen(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 8 }}
              transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
              className="hub-modal-solid w-full max-w-lg overflow-hidden rounded-2xl shadow-2xl"
              style={{ border: '1px solid var(--border)' }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-2 px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold truncate" style={{ color: 'var(--foreground)' }}>New internal message</p>
                  <p className="text-[11px] mt-0.5 truncate" style={{ color: 'var(--muted-foreground)' }}>
                    Starts a new internal thread
                  </p>
                </div>
                <button
                  type="button"
                  className="rounded-lg p-2 transition-colors hover:bg-secondary/80"
                  style={{ color: 'var(--muted-foreground)' }}
                  onClick={() => setComposeInternalOpen(false)}
                  aria-label="Close internal compose"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="px-4 py-3 space-y-2.5">
                <div>
                  <label className="text-[11px] font-medium" style={{ color: 'var(--muted-foreground)' }}>To</label>
                  <select
                    className="mt-1 w-full rounded-xl px-3 py-2 text-[12px] outline-none"
                    style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                    value={composeInternalTo}
                    onChange={(e) => setComposeInternalTo(e.target.value)}
                  >
                    {INTERNAL_TEAM.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} · {p.role}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-medium" style={{ color: 'var(--muted-foreground)' }}>Message</label>
                  <textarea
                    className="mt-1 w-full rounded-2xl px-3 py-2 text-[12px] outline-none resize-none"
                    style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                    rows={6}
                    value={composeInternalBody}
                    onChange={(e) => setComposeInternalBody(e.target.value)}
                    placeholder="Write a note…"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 px-4 py-3"
                style={{ borderTop: '1px solid var(--border)', background: 'color-mix(in srgb, var(--secondary) 65%, transparent)' }}>
                <button
                  type="button"
                  onClick={() => setComposeInternalOpen(false)}
                  className="rounded-xl px-3 py-2 text-[12px] font-semibold transition-colors hover:bg-secondary/80"
                  style={{ border: '1px solid var(--border)', color: 'var(--foreground)' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void startInternalThread()}
                  className="rounded-xl px-4 py-2 text-[12px] font-semibold text-white"
                  style={{ background: 'var(--primary)' }}
                >
                  Start thread
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
