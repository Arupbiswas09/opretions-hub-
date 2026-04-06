'use client';
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, Plus, Inbox, Hash, Send, Paperclip, Smile, AtSign,
  MoreHorizontal, Star, Archive, Trash2, Reply, Forward,
  Sparkles, ChevronDown, ChevronRight, Filter, RefreshCw,
  MessageSquare, Users, Briefcase, FolderKanban, FileText,
  Clock, CheckCircle2, Circle, Bot, X, Loader2, ArrowLeft,
} from 'lucide-react';
import { BonsaiButton } from './bonsai/BonsaiButton';
import { BonsaiStatusPill } from './bonsai/BonsaiStatusPill';
import { cn } from './ui/utils';
import { useMediaQuery } from '../lib/use-media-query';

/* ─────────────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────────────── */
type MessageKind = 'email' | 'channel' | 'direct';
type ThreadLabel = 'inbox' | 'sent' | 'starred' | 'archived';

interface EntityTag {
  kind: 'client' | 'project' | 'deal' | 'person' | 'task';
  label: string;
}

interface Message {
  id: string;
  kind: MessageKind;
  from: { name: string; initials: string; email?: string };
  subject: string;
  preview: string;
  body: string;
  time: string;
  unread: boolean;
  starred: boolean;
  label: ThreadLabel;
  entities: EntityTag[];
  replies?: number;
  attachments?: number;
}

interface Channel {
  id: string;
  name: string;
  unread: number;
  members: number;
  description: string;
}

/* ─────────────────────────────────────────────────────────────
   Mock data
───────────────────────────────────────────────────────────── */
const CHANNELS: Channel[] = [
  { id: 'general', name: 'general', unread: 0, members: 24, description: 'Company-wide announcements' },
  { id: 'projects', name: 'projects', unread: 3, members: 12, description: 'Project updates and coordination' },
  { id: 'sales', name: 'sales', unread: 7, members: 8, description: 'Sales pipeline and deals' },
  { id: 'design', name: 'design', unread: 1, members: 6, description: 'Design reviews and assets' },
  { id: 'engineering', name: 'engineering', unread: 0, members: 10, description: 'Engineering discussions' },
];

const MESSAGES: Message[] = [
  {
    id: 'm1', kind: 'email',
    from: { name: 'Sarah Chen', initials: 'SC', email: 'sarah@acmecorp.com' },
    subject: 'Q2 Campaign Brief — final sign-off needed',
    preview: "Hi, we've reviewed the creative assets and everything looks great. Just need your sign-off on the revised timeline before we kick off production...",
    body: `Hi,\n\nWe've reviewed the creative assets and everything looks great. Just need your sign-off on the revised timeline before we kick off production.\n\nThe key milestones are:\n• Week 1: Copy finalised\n• Week 2: Design review\n• Week 3: Dev handoff\n• Week 4: QA + launch\n\nCan you confirm by EOD Friday?\n\nBest,\nSarah`,
    time: '9:41 AM',
    unread: true, starred: true, label: 'inbox',
    entities: [{ kind: 'client', label: 'Acme Corp' }, { kind: 'project', label: 'Q2 Campaign' }],
    attachments: 2,
  },
  {
    id: 'm2', kind: 'email',
    from: { name: 'James Park', initials: 'JP', email: 'james@novahq.io' },
    subject: 'Contract renewal — Nova HQ',
    preview: "Following up on our conversation last Tuesday. The legal team has reviewed the updated terms and we're good to proceed. Just need a countersignature...",
    body: `Hi,\n\nFollowing up on our conversation last Tuesday. The legal team has reviewed the updated terms and we're good to proceed.\n\nJust need a countersignature on the attached PDF and we can get this wrapped up.\n\nLet me know if you have any questions.\n\nThanks,\nJames`,
    time: 'Yesterday',
    unread: true, starred: false, label: 'inbox',
    entities: [{ kind: 'client', label: 'Nova HQ' }, { kind: 'deal', label: 'Contract Renewal' }],
    attachments: 1,
  },
  {
    id: 'm3', kind: 'direct',
    from: { name: 'Priya Kapoor', initials: 'PK' },
    subject: 'Kickoff prep checklist',
    preview: 'Hey! I put together a prep checklist for the Nexus kickoff. Can you check if I missed anything? Also, do you know if the client has a preferred meeting tool?',
    body: `Hey!\n\nI put together a prep checklist for the Nexus kickoff. Can you check if I missed anything?\n\nChecklist:\n✓ Agenda drafted\n✓ Deck in progress\n○ Client questionnaire sent\n○ Tech access confirmed\n○ Recording consent\n\nAlso, do you know if the client has a preferred meeting tool?\n\n— Priya`,
    time: 'Yesterday',
    unread: false, starred: false, label: 'inbox',
    entities: [{ kind: 'project', label: 'Nexus Rebrand' }, { kind: 'person', label: 'Priya Kapoor' }],
    replies: 4,
  },
  {
    id: 'm4', kind: 'email',
    from: { name: 'Tom Bridges', initials: 'TB', email: 'tom@meridiangroup.co' },
    subject: 'Invoice #INV-2240 — payment query',
    preview: 'Hi, our accounts team is querying line item 3 on the latest invoice. Could you provide a breakdown of the consulting hours for the strategy sessions in March?',
    body: `Hi,\n\nOur accounts team is querying line item 3 on the latest invoice (#INV-2240).\n\nCould you provide a breakdown of the consulting hours for the strategy sessions held in March? Specifically the dates and duration for each session.\n\nThanks,\nTom`,
    time: 'Mon',
    unread: false, starred: false, label: 'inbox',
    entities: [{ kind: 'client', label: 'Meridian Group' }, { kind: 'task', label: 'Invoice #INV-2240' }],
  },
  {
    id: 'm5', kind: 'email',
    from: { name: 'Diana Lowell', initials: 'DL', email: 'diana@vertex.io' },
    subject: 'Design review feedback — Phase 1',
    preview: 'Thank you for sharing the Phase 1 designs. Overall we love the direction. A few comments on the homepage hero and the mobile nav are attached below...',
    body: `Thank you for sharing the Phase 1 designs.\n\nOverall we love the direction. A few comments:\n\n1. Homepage hero — the background feels too dark on mobile. Could we try a lighter variant?\n2. Mobile nav — the hamburger icon is hard to tap on smaller screens. Suggest increasing touch target.\n3. Typography — perfect. Love the scale.\n\nPlease action and share an updated draft by Wednesday.\n\nDiana`,
    time: 'Sun',
    unread: false, starred: true, label: 'inbox',
    entities: [{ kind: 'client', label: 'Vertex IO' }, { kind: 'project', label: 'Website Redesign' }],
    attachments: 3,
  },
  {
    id: 'm6', kind: 'direct',
    from: { name: 'Marcus Webb', initials: 'MW' },
    subject: 'Resource request for Nexus project',
    preview: "We're going to need an extra dev on Nexus starting week 3. I've flagged it in the resourcing board but wanted to give you a heads-up directly.",
    body: `We're going to need an extra dev on Nexus starting week 3.\n\nI've flagged it in the resourcing board but wanted to give you a heads-up directly so we can sort it before the planning session.\n\nThe skill requirement is React + TypeScript, ideally someone who knows our design system.\n\n— Marcus`,
    time: 'Fri',
    unread: false, starred: false, label: 'inbox',
    entities: [{ kind: 'project', label: 'Nexus Rebrand' }],
  },
];

const AI_DRAFT_TEMPLATES: Record<string, string> = {
  'm1': `Hi Sarah,\n\nThank you for sharing the revised timeline — the milestones look clear and achievable.\n\nI'm happy to sign off on the approach. Please proceed with the schedule as outlined, and feel free to kick off Week 1 from Monday.\n\nLet me know if anything changes.\n\nBest regards`,
  'm2': `Hi James,\n\nThanks for following up. I'll review the attached PDF today and get the countersignature back to you before EOD.\n\nLooking forward to getting this wrapped up.\n\nBest regards`,
  'm4': `Hi Tom,\n\nApologies for the confusion. I'll pull together a detailed breakdown of the March strategy sessions — dates, attendees, and hours — and send it across within 24 hours.\n\nThanks for flagging.\n\nBest regards`,
};

/* ─────────────────────────────────────────────────────────────
   Entity tag pill
───────────────────────────────────────────────────────────── */
const ENTITY_ICONS: Record<EntityTag['kind'], React.ElementType> = {
  client: Briefcase,
  project: FolderKanban,
  deal: Star,
  person: Users,
  task: CheckCircle2,
};

function EntityPill({ tag }: { tag: EntityTag }) {
  const Icon = ENTITY_ICONS[tag.kind];
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
      <Icon className="h-2.5 w-2.5 shrink-0 opacity-90" />
      {tag.label}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────
   AI Draft panel
───────────────────────────────────────────────────────────── */
function AIDraftPanel({ messageId, onUse, onClose }: { messageId: string; onUse: (text: string) => void; onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState('');
  const [tone, setTone] = useState<'professional' | 'friendly' | 'concise'>('professional');

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      setDraft(AI_DRAFT_TEMPLATES[messageId] ?? "Thank you for your message. I'll review this and get back to you shortly.\n\nBest regards");
      setLoading(false);
    }, 900);
    return () => clearTimeout(t);
  }, [messageId, tone]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.18 }}
      className="rounded-xl overflow-hidden"
      style={{ background: 'var(--popover)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}
    >
      <div className="flex items-center justify-between px-3 py-2.5" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/15">
            <Sparkles className="h-3 w-3 text-primary" />
          </div>
          <span className="text-[12px] font-semibold" style={{ color: 'var(--foreground)' }}>AI Draft</span>
        </div>
        <div className="flex items-center gap-1.5">
          {(['professional', 'friendly', 'concise'] as const).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setTone(t)}
              className="rounded-md px-2 py-0.5 text-[10px] font-medium capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              style={{
                background: tone === t ? 'var(--primary)' : 'var(--secondary)',
                color: tone === t ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
              }}
            >
              {t}
            </button>
          ))}
          <button type="button" onClick={onClose} className="rounded-md p-0.5 transition-colors hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50" style={{ color: 'var(--muted-foreground)' }}>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div className="p-3">
        {loading ? (
          <div className="flex items-center gap-2 py-4 justify-center">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-[12px]" style={{ color: 'var(--muted-foreground)' }}>Drafting reply…</span>
          </div>
        ) : (
          <>
            <pre className="text-[12px] whitespace-pre-wrap font-sans leading-relaxed" style={{ color: 'var(--foreground)' }}>
              {draft}
            </pre>
            <div className="flex items-center gap-2 mt-3 pt-2.5" style={{ borderTop: '1px solid var(--border)' }}>
              <BonsaiButton size="sm" onClick={() => onUse(draft)}>Use this draft</BonsaiButton>
              <button
                onClick={() => { setLoading(true); setTimeout(() => { setDraft(draft + '\n\nPlease let me know if you need anything else.'); setLoading(false); }, 600); }}
                className="text-[11px] font-medium transition-colors"
                style={{ color: 'var(--muted-foreground)' }}
              >
                Regenerate
              </button>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Compose panel
───────────────────────────────────────────────────────────── */
function ComposePanel({
  replyTo,
  initialBody,
  onClose,
}: {
  replyTo?: Message;
  initialBody?: string;
  onClose: () => void;
}) {
  const [body, setBody] = useState(initialBody ?? '');
  const [showAI, setShowAI] = useState(false);

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: 'var(--popover)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>
      <div className="flex items-center justify-between px-3 py-2.5" style={{ borderBottom: '1px solid var(--border)' }}>
        <span className="text-[12px] font-semibold" style={{ color: 'var(--foreground)' }}>
          {replyTo ? `Reply to ${replyTo.from.name}` : 'New message'}
        </span>
        <button type="button" onClick={onClose} className="rounded-md p-0.5 hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50" style={{ color: 'var(--muted-foreground)' }}>
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      {replyTo && (
        <div className="px-3 py-1.5 text-[11px]" style={{ background: 'var(--secondary)', borderBottom: '1px solid var(--border)', color: 'var(--muted-foreground)' }}>
          To: <span style={{ color: 'var(--foreground)' }}>{replyTo.from.email ?? replyTo.from.name}</span>
          &ensp;|&ensp;Re: {replyTo.subject}
        </div>
      )}
      <div className="p-3">
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          rows={6}
          className="w-full resize-none text-[12px] bg-transparent outline-none leading-relaxed"
          style={{ color: 'var(--foreground)' }}
          placeholder="Write your message…"
        />
      </div>
      <div className="flex items-center justify-between px-3 pb-3">
        <div className="flex items-center gap-1">
          {[Paperclip, Smile, AtSign].map((Icon, i) => (
            <button key={i} type="button" className="rounded-lg p-1.5 transition-colors hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50" style={{ color: 'var(--muted-foreground)' }}>
              <Icon className="w-3.5 h-3.5" />
            </button>
          ))}
          <button
            type="button"
            onClick={() => setShowAI(s => !s)}
            className={cn(
              'flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
              showAI ? 'bg-primary/15 text-primary' : 'bg-secondary text-muted-foreground',
            )}
          >
            <Sparkles className="w-3 h-3" />
            AI draft
          </button>
        </div>
        <BonsaiButton size="sm">
          <Send className="w-3 h-3 mr-1.5" />
          Send
        </BonsaiButton>
      </div>
      <AnimatePresence>
        {showAI && replyTo && (
          <div className="px-3 pb-3">
            <AIDraftPanel messageId={replyTo.id} onUse={t => { setBody(t); setShowAI(false); }} onClose={() => setShowAI(false)} />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Thread list item
───────────────────────────────────────────────────────────── */
function ThreadItem({ msg, active, onClick }: { msg: Message; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full border-l-[3px] px-3 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/40',
        active ? 'bg-primary/[0.07]' : 'hover:bg-secondary/60',
      )}
      style={{ borderLeftColor: active ? 'var(--primary)' : 'transparent' }}
    >
      <div className="flex items-start gap-2.5">
        <div
          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-primary-foreground"
          style={{ background: msg.unread ? 'var(--primary)' : 'var(--muted-foreground)' }}
        >
          {msg.from.initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className={cn('truncate text-[12px]', msg.unread ? 'font-semibold' : 'font-medium')}
              style={{ color: 'var(--foreground)' }}>
              {msg.from.name}
            </span>
            <span className="shrink-0 text-[10px] tabular-nums" style={{ color: 'var(--muted-foreground)' }}>{msg.time}</span>
          </div>
          <p className={cn('mt-0.5 truncate text-[11px]', msg.unread ? 'font-medium' : '')}
            style={{ color: msg.unread ? 'var(--foreground)' : 'var(--foreground-secondary)' }}>
            {msg.subject}
          </p>
          <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug" style={{ color: 'var(--foreground-secondary)' }}>{msg.preview}</p>
          {msg.entities.length > 0 && (
            <div className="flex items-center gap-1 mt-1.5 flex-wrap">
              {msg.entities.map((e, i) => <EntityPill key={i} tag={e} />)}
            </div>
          )}
        </div>
        {msg.unread && <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-2" />}
      </div>
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────
   Thread detail view
───────────────────────────────────────────────────────────── */
function ThreadDetail({ msg, onClose, onBack }: { msg: Message; onClose: () => void; onBack?: () => void }) {
  const [replying, setReplying] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [replyBody, setReplyBody] = useState('');

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 px-4 py-3 sm:px-5 sm:py-3.5" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex min-w-0 flex-1 items-start gap-2">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="hub-touch-target mt-0.5 shrink-0 rounded-lg text-muted-foreground hover:bg-secondary lg:hidden"
              aria-label="Back to inbox"
            >
              <ArrowLeft className="h-5 w-5" strokeWidth={1.75} />
            </button>
          )}
        <div className="min-w-0 flex-1">
          <h2 className="text-[13px] font-semibold leading-snug sm:text-[14px] sm:truncate" style={{ color: 'var(--foreground)' }}>{msg.subject}</h2>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>
              {msg.from.name}{msg.from.email ? ` <${msg.from.email}>` : ''}
            </span>
            <span className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>· {msg.time}</span>
          </div>
          {msg.entities.length > 0 && (
            <div className="flex items-center gap-1 mt-2 flex-wrap">
              {msg.entities.map((e, i) => <EntityPill key={i} tag={e} />)}
            </div>
          )}
        </div>
        </div>
        <div className="flex shrink-0 items-center gap-0.5 sm:ml-3">
          <button type="button" className="rounded-lg p-1.5 transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50" style={{ color: 'var(--muted-foreground)' }} title="Star">
            <Star className={cn('h-4 w-4', msg.starred && 'fill-current text-amber-500')} />
          </button>
          <button type="button" className="rounded-lg p-1.5 transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50" style={{ color: 'var(--muted-foreground)' }} title="Archive">
            <Archive className="h-4 w-4" />
          </button>
          <button type="button" className="rounded-lg p-1.5 transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50" style={{ color: 'var(--muted-foreground)' }} title="More">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Body — readable measure on wide screens */}
      <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
        <div className="mx-auto max-w-3xl space-y-4">
          <pre className="whitespace-pre-wrap font-sans text-[13px] leading-relaxed sm:text-[14px]" style={{ color: 'var(--foreground)' }}>
            {msg.body}
          </pre>
          {(msg.attachments ?? 0) > 0 && (
            <div className="border-t pt-4" style={{ borderColor: 'var(--border)' }}>
              <p className="mb-2 text-[11px] font-medium" style={{ color: 'var(--muted-foreground)' }}>
                {msg.attachments} attachment{msg.attachments! > 1 ? 's' : ''}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {Array.from({ length: msg.attachments! }).map((_, i) => (
                  <div key={i} className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px]"
                    style={{ background: 'var(--secondary)', borderColor: 'var(--border)', color: 'var(--foreground)' }}>
                    <FileText className="h-3.5 w-3.5" style={{ color: 'var(--muted-foreground)' }} />
                    Attachment_{i + 1}.pdf
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reply area */}
      <div className="px-4 pb-4 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
        <AnimatePresence mode="wait">
          {replying ? (
            <motion.div key="compose" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}>
              <ComposePanel replyTo={msg} initialBody={replyBody} onClose={() => setReplying(false)} />
            </motion.div>
          ) : (
            <motion.div key="actions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 flex-wrap">
              <BonsaiButton size="sm" variant="outline" onClick={() => setReplying(true)}>
                <Reply className="w-3.5 h-3.5 mr-1.5" />
                Reply
              </BonsaiButton>
              <BonsaiButton size="sm" variant="outline">
                <Forward className="w-3.5 h-3.5 mr-1.5" />
                Forward
              </BonsaiButton>
              <button
                type="button"
                onClick={() => { setShowAI(s => !s); }}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[12px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
                  showAI ? 'border-primary/30 bg-primary/10 text-primary' : 'border-border bg-secondary text-muted-foreground',
                )}
              >
                <Sparkles className="h-3.5 w-3.5" />
                AI draft reply
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {showAI && !replying && (
            <motion.div className="mt-3" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}>
              <AIDraftPanel
                messageId={msg.id}
                onUse={t => { setReplyBody(t); setReplying(true); setShowAI(false); }}
                onClose={() => setShowAI(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Channel view (placeholder / Slack-style)
───────────────────────────────────────────────────────────── */
function ChannelView({ channel }: { channel: Channel }) {
  const [msg, setMsg] = useState('');

  const MOCK_MSGS = [
    { id: 1, from: 'Alex Torres', initials: 'AT', text: 'Just pushed the updated designs to Figma. Take a look when you get a chance!', time: '10:02 AM' },
    { id: 2, from: 'Priya Kapoor', initials: 'PK', text: "Thanks! The new hero looks great. One small note on the mobile breakpoint — I'll comment in Figma.", time: '10:17 AM' },
    { id: 3, from: 'Marcus Webb', initials: 'MW', text: 'FYI the client review is moved to Thursday 2pm. Deck should be ready by Wednesday EOD.', time: '11:45 AM' },
    { id: 4, from: 'You', initials: 'JD', text: "Got it. I'll make sure the deck is ready. Priya can you handle the case studies section?", time: '11:52 AM' },
    { id: 5, from: 'Priya Kapoor', initials: 'PK', text: "On it! I'll have a draft by tomorrow afternoon.", time: '11:54 AM' },
  ];

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2">
          <Hash className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
          <span className="text-[14px] font-semibold" style={{ color: 'var(--foreground)' }}>{channel.name}</span>
          <span className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>· {channel.members} members</span>
        </div>
        <div className="flex items-center gap-0.5">
          <button type="button" className="rounded-lg p-1.5 transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50" style={{ color: 'var(--muted-foreground)' }} title="Search channel">
            <Search className="h-4 w-4" />
          </button>
          <button type="button" className="rounded-lg p-1.5 transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50" style={{ color: 'var(--muted-foreground)' }} title="More">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {MOCK_MSGS.map(m => (
          <div key={m.id} className="flex items-start gap-2.5">
            <div
              className={cn(
                'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-primary-foreground',
                m.from === 'You' ? 'bg-primary' : 'bg-muted-foreground',
              )}
            >
              {m.initials}
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-[12px] font-semibold" style={{ color: 'var(--foreground)' }}>{m.from}</span>
                <span className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>{m.time}</span>
              </div>
              <p className="text-[13px] mt-0.5 leading-relaxed" style={{ color: 'var(--foreground)' }}>{m.text}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="px-4 pb-4 pt-2">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}>
          <input
            className="flex-1 bg-transparent text-[13px] outline-none"
            style={{ color: 'var(--foreground)' }}
            placeholder={`Message #${channel.name}`}
            value={msg}
            onChange={e => setMsg(e.target.value)}
          />
          <div className="flex items-center gap-1">
            {[Paperclip, Smile].map((Icon, i) => (
              <button key={i} className="p-1 rounded hover:bg-black/[0.04] transition-colors" style={{ color: 'var(--muted-foreground)' }}>
                <Icon className="w-3.5 h-3.5" />
              </button>
            ))}
            <button
              type="button"
              className={cn(
                'rounded-lg p-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
                msg ? 'bg-primary text-primary-foreground' : 'text-muted-foreground',
              )}
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Main Communication component
───────────────────────────────────────────────────────────── */
type InboxFilter = 'all' | 'unread' | 'starred';
type ViewMode = 'email' | 'channel';

export default function Communication() {
  const isLg = useMediaQuery('(min-width: 1024px)');
  const [viewMode, setViewMode] = useState<ViewMode>('email');
  const [activeThread, setActiveThread] = useState<Message | null>(MESSAGES[0]);
  const [activeChannel, setActiveChannel] = useState<Channel>(CHANNELS[0]);
  const [filter, setFilter] = useState<InboxFilter>('all');
  const [search, setSearch] = useState('');
  const [composing, setComposing] = useState(false);
  /** On narrow screens, whether the thread reader is full-screen (vs thread list). */
  const [mobileEmailDetail, setMobileEmailDetail] = useState(false);

  useEffect(() => {
    if (isLg) setMobileEmailDetail(false);
  }, [isLg]);

  const openThread = (msg: Message) => {
    setActiveThread(msg);
    setComposing(false);
    if (!isLg) setMobileEmailDetail(true);
  };

  const filteredMessages = MESSAGES.filter(m => {
    if (filter === 'unread' && !m.unread) return false;
    if (filter === 'starred' && !m.starred) return false;
    if (search && !m.subject.toLowerCase().includes(search.toLowerCase()) && !m.from.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const unreadCount = MESSAGES.filter(m => m.unread).length;

  const showEmailListCol =
    viewMode === 'email' && (isLg || (!mobileEmailDetail && !composing));
  const showMainColumn =
    isLg ||
    composing ||
    viewMode === 'channel' ||
    (viewMode === 'email' && mobileEmailDetail);

  return (
    <div className="flex h-full min-h-0 flex-col lg:flex-row" style={{ background: 'var(--background)' }}>

      {/* Mobile: mode + new mail */}
      <div
        className="flex items-center justify-between gap-2 border-b px-3 py-2 lg:hidden"
        style={{ borderColor: 'var(--border)', background: 'var(--sidebar-glass)' }}
      >
        <div className="flex flex-1 gap-0.5 rounded-lg bg-secondary/80 p-0.5">
          {([['email', 'Inbox'], ['channel', 'Channels']] as const).map(([mode, label]) => (
            <button
              key={mode}
              type="button"
              onClick={() => {
                setViewMode(mode);
                setMobileEmailDetail(false);
              }}
              className={cn(
                'flex-1 rounded-md py-2 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
                viewMode === mode ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground',
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            setComposing(true);
            setMobileEmailDetail(false);
          }}
          className="hub-touch-target shrink-0 rounded-lg bg-primary text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          aria-label="New message"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile channel picker (sidebar hidden on small screens) */}
      {!isLg && viewMode === 'channel' && (
        <div
          className="flex gap-1 overflow-x-auto border-b px-2 py-2 lg:hidden"
          style={{ borderColor: 'var(--border)', background: 'var(--background)' }}
        >
          {CHANNELS.map(ch => (
            <button
              key={ch.id}
              type="button"
              onClick={() => setActiveChannel(ch)}
              className={cn(
                'shrink-0 rounded-full px-3 py-1.5 text-[11px] font-medium transition-colors',
                activeChannel.id === ch.id ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground',
              )}
            >
              #{ch.name}
            </button>
          ))}
        </div>
      )}

      {/* ── Left sidebar: folders + channels (desktop; mobile uses strip above + this hidden) */}
      <aside
        className="hidden w-56 shrink-0 flex-col overflow-y-auto border-r lg:flex"
        style={{ borderColor: 'var(--border)', background: 'var(--sidebar-glass)' }}
      >
        <div className="flex items-center justify-between px-3 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <span className="text-[12px] font-semibold" style={{ color: 'var(--foreground)' }}>Communication</span>
          <button
            type="button"
            onClick={() => setComposing(true)}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            aria-label="New message"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Mode toggle — segmented control; radius aligned with search fields (rounded-lg) */}
        <div className="p-2" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex gap-0.5 rounded-lg bg-secondary/80 p-0.5">
            {([['email', 'Inbox'], ['channel', 'Channels']] as const).map(([mode, label]) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                className={cn(
                  'flex-1 rounded-md py-1.5 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
                  viewMode === mode ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {viewMode === 'email' ? (
          <nav className="flex-1 px-2 py-2 space-y-0.5">
            {([
              { id: 'all', label: 'All mail', icon: Inbox, count: unreadCount },
              { id: 'unread', label: 'Unread', icon: Circle, count: unreadCount },
              { id: 'starred', label: 'Starred', icon: Star, count: MESSAGES.filter(m => m.starred).length },
            ] as const).map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilter(item.id)}
                className={cn(
                  'flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-[12px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
                  filter === item.id ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-secondary/70',
                )}
              >
                <div className="flex items-center gap-2">
                  <item.icon className="h-3.5 w-3.5 shrink-0 opacity-90" />
                  {item.label}
                </div>
                {item.count > 0 && (
                  <span
                    className={cn(
                      'rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums',
                      filter === item.id ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground',
                    )}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            ))}
            <div className="pt-3 pb-1 px-2.5">
              <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Labels</span>
            </div>
            {(['Clients', 'Internal', 'Finance', 'Projects'] as const).map((label, idx) => (
              <button
                key={label}
                type="button"
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] transition-colors hover:bg-secondary/60 text-left"
                style={{ color: 'var(--muted-foreground)' }}
              >
                <span
                  className="h-2 w-2 shrink-0 rounded-full bg-primary"
                  style={{ opacity: 1 - idx * 0.18 }}
                />
                {label}
              </button>
            ))}
          </nav>
        ) : (
          <nav className="flex-1 px-2 py-2 space-y-0.5">
            <div className="px-2.5 py-1 flex items-center justify-between">
              <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Channels</span>
              <button className="hover:opacity-70 transition-opacity" style={{ color: 'var(--muted-foreground)' }}>
                <Plus className="w-3 h-3" />
              </button>
            </div>
            {CHANNELS.map(ch => (
              <button
                key={ch.id}
                type="button"
                onClick={() => setActiveChannel(ch)}
                className={cn(
                  'flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-[12px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
                  activeChannel.id === ch.id ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-secondary/70',
                )}
              >
                <div className="flex items-center gap-1.5">
                  <Hash className="w-3 h-3" />
                  {ch.name}
                </div>
                {ch.unread > 0 && (
                  <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                    {ch.unread}
                  </span>
                )}
              </button>
            ))}
            <div className="px-2.5 pt-3 pb-1 flex items-center justify-between">
              <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Direct Messages</span>
            </div>
            {[{ name: 'Priya Kapoor', initials: 'PK', online: true }, { name: 'Marcus Webb', initials: 'MW', online: false }, { name: 'Alex Torres', initials: 'AT', online: true }].map(dm => (
              <button key={dm.name} className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[12px] transition-colors hover:bg-secondary/60 text-left"
                style={{ color: 'var(--foreground)' }}>
                <div className="relative">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/50 text-[9px] font-bold text-primary-foreground">
                    {dm.initials}
                  </div>
                  <span className={cn('absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-background', dm.online ? 'bg-green-500' : 'bg-gray-400')} />
                </div>
                {dm.name}
              </button>
            ))}
          </nav>
        )}
      </aside>

      {/* ── Thread list ── */}
      {showEmailListCol && (
        <div
          className="flex min-h-0 w-full min-w-0 shrink-0 flex-col overflow-hidden border-r lg:min-w-[300px] lg:max-w-md lg:flex-[1_1_36%]"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-2 px-3 py-2.5" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="flex flex-1 items-center gap-1.5 rounded-lg border px-2.5 py-1.5" style={{ background: 'var(--secondary)', borderColor: 'var(--border)' }}>
              <Search className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--muted-foreground)' }} />
              <input
                className="min-w-0 flex-1 bg-transparent text-[12px] outline-none focus-visible:ring-0"
                style={{ color: 'var(--foreground)' }}
                placeholder="Search…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                aria-label="Search messages"
              />
            </div>
            <button type="button" className="rounded-lg p-1.5 transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50" style={{ color: 'var(--muted-foreground)' }} title="Filters">
              <Filter className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2">
                <Inbox className="w-8 h-8" style={{ color: 'var(--muted-foreground)' }} />
                <span className="text-[12px]" style={{ color: 'var(--muted-foreground)' }}>No messages</span>
              </div>
            ) : (
              filteredMessages.map(msg => (
                <ThreadItem
                  key={msg.id}
                  msg={msg}
                  active={activeThread?.id === msg.id}
                  onClick={() => openThread(msg)}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* ── Main panel ── */}
      <div
        className={cn(
          'flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden',
          !showMainColumn && 'hidden lg:flex',
        )}
      >
        <AnimatePresence mode="wait">
          {composing ? (
            <motion.div key="compose" className="flex-1 p-4 sm:p-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ComposePanel onClose={() => setComposing(false)} />
            </motion.div>
          ) : viewMode === 'channel' ? (
            <motion.div key={`ch-${activeChannel.id}`} className="flex min-h-0 flex-1 flex-col" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ChannelView channel={activeChannel} />
            </motion.div>
          ) : activeThread ? (
            <motion.div key={activeThread.id} className="flex min-h-0 flex-1 flex-col" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ThreadDetail
                msg={activeThread}
                onClose={() => setActiveThread(null)}
                onBack={!isLg ? () => setMobileEmailDetail(false) : undefined}
              />
            </motion.div>
          ) : (
            <motion.div key="empty" className="flex flex-1 flex-col items-center justify-center gap-3 px-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <MessageSquare className="h-10 w-10" style={{ color: 'var(--muted-foreground)' }} />
              <p className="text-center text-[13px]" style={{ color: 'var(--muted-foreground)' }}>Select a conversation to read</p>
              <BonsaiButton size="sm" onClick={() => setComposing(true)}>
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                New message
              </BonsaiButton>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
