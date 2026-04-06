'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Mail, Phone, Globe, MapPin, Building2, Clock,
  DollarSign, Calendar, FileText, MessageSquare, Activity,
  Check, Edit3, Archive, Trash2, ExternalLink, Download,
  ChevronRight, MoreHorizontal, Star, Tag, User, Briefcase,
} from 'lucide-react';
import { SlideDrawer } from './Overlays';

/* ══════════════════════════════════════════════════════════════════════
   DETAIL PANELS
   Slide-over panels that open when clicking a row in any table/list.
   Includes tabbed views, activity timelines, and action buttons.
   ══════════════════════════════════════════════════════════════════════ */

/* ── Shared: Tab bar ── */
function DetailTabs({ tabs, active, onChange }: {
  tabs: string[]; active: string; onChange: (t: string) => void;
}) {
  return (
    <div className="flex items-center gap-0.5 mb-5 pb-2.5"
      style={{ borderBottom: '1px solid var(--border)' }}>
      {tabs.map(t => (
        <button key={t} onClick={() => onChange(t)}
          className="px-3 py-1.5 rounded-md text-[12px] font-medium transition-all"
          style={{
            background: active === t ? 'rgba(37, 99, 235, 0.10)' : 'transparent',
            color: active === t ? '#2563EB' : 'var(--muted-foreground)',
          }}>
          {t}
        </button>
      ))}
    </div>
  );
}

/* ── Shared: Activity timeline item ── */
function TimelineItem({ icon: Icon, text, time, color = '#2563EB' }: {
  icon: React.ElementType; text: string; time: string; color?: string;
}) {
  return (
    <div className="flex items-start gap-3 mb-4 last:mb-0">
      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: `${color}15` }}>
        <Icon className="w-3.5 h-3.5" style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] leading-relaxed" style={{ color: 'var(--foreground-secondary)' }}>{text}</p>
        <p className="text-[10px] mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{time}</p>
      </div>
    </div>
  );
}

/* ── Shared: Info row ── */
function InfoRow({ label, value, icon: Icon }: {
  label: string; value: string; icon?: React.ElementType;
}) {
  return (
    <div className="flex items-center justify-between py-2.5"
      style={{ borderBottom: '1px solid var(--border-subtle)' }}>
      <span className="text-[12px] flex items-center gap-2" style={{ color: 'var(--muted-foreground)' }}>
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {label}
      </span>
      <span className="text-[13px] font-medium" style={{ color: 'var(--foreground)' }}>{value}</span>
    </div>
  );
}

/* ═══════════════════════════════════════
   CLIENT DETAIL PANEL
   ═══════════════════════════════════════ */
export function ClientDetailPanel({ open, onClose, client }: {
  open: boolean; onClose: () => void;
  client?: { name: string; status: string; revenue: string; industry: string };
}) {
  const [tab, setTab] = useState('Overview');
  if (!client) return null;
  return (
    <SlideDrawer open={open} onClose={onClose} title={client.name} subtitle={client.industry}
      width="520px"
      footer={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg transition-colors hover:bg-white/[0.06]"
              style={{ color: 'var(--muted-foreground)' }} title="Archive">
              <Archive className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-lg transition-colors hover:bg-white/[0.06]"
              style={{ color: '#EF4444' }} title="Delete">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <button className="px-4 py-2 rounded-lg text-[13px] font-medium flex items-center gap-2 transition-all hover:scale-[1.02]"
            style={{ background: '#2563EB', color: '#FFF' }}>
            <Edit3 className="w-3.5 h-3.5" /> Edit Client
          </button>
        </div>
      }>
      <DetailTabs tabs={['Overview', 'Projects', 'Invoices', 'Activity']} active={tab} onChange={setTab} />

      {tab === 'Overview' && (
        <>
          {/* Status badge */}
          <div className="flex items-center gap-2 mb-5">
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-md"
              style={{
                background: client.status === 'Active' ? 'rgba(37,99,235,0.10)' : 'rgba(255,255,255,0.06)',
                color: client.status === 'Active' ? '#2563EB' : 'var(--muted-foreground)',
              }}>
              {client.status}
            </span>
            <span className="text-[13px] font-semibold tabular-nums" style={{ color: 'var(--foreground)' }}>
              {client.revenue} lifetime revenue
            </span>
          </div>

          <InfoRow label="Industry" value={client.industry} icon={Building2} />
          <InfoRow label="Company Size" value="51-200" icon={User} />
          <InfoRow label="Primary Contact" value="John Doe" icon={User} />
          <InfoRow label="Email" value="john@acme.com" icon={Mail} />
          <InfoRow label="Phone" value="+1 (555) 123-4567" icon={Phone} />
          <InfoRow label="Website" value="acme.com" icon={Globe} />
          <InfoRow label="Address" value="123 Main St, New York" icon={MapPin} />
          <InfoRow label="Client Since" value="Jan 15, 2025" icon={Calendar} />

          <div className="mt-5">
            <p className="text-[11px] font-medium uppercase tracking-wider mb-2"
              style={{ color: 'var(--muted-foreground)' }}>Tags</p>
            <div className="flex flex-wrap gap-1.5">
              {['Enterprise', 'VIP', 'Retainer'].map(t => (
                <span key={t} className="text-[10px] font-medium px-2 py-1 rounded-md"
                  style={{ background: 'var(--glass-bg)', color: 'var(--foreground-secondary)', border: '1px solid var(--border-subtle)' }}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        </>
      )}

      {tab === 'Projects' && (
        <div>
          {[
            { name: 'Website Redesign', status: 'Active', budget: '$24,500' },
            { name: 'Mobile App — Phase 2', status: 'Planning', budget: '$85,000' },
            { name: 'SEO Audit', status: 'Completed', budget: '$5,000' },
          ].map((p, i) => (
            <div key={i} className="flex items-center gap-3 py-3 transition-colors hover:bg-white/[0.02]"
              style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <div className="w-1.5 h-8 rounded-full"
                style={{ background: p.status === 'Active' ? '#2563EB' : p.status === 'Planning' ? '#0D9488' : 'var(--muted-foreground)' }} />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium truncate" style={{ color: 'var(--foreground)' }}>{p.name}</p>
                <p className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>{p.status}</p>
              </div>
              <span className="text-[12px] font-medium tabular-nums" style={{ color: 'var(--foreground)' }}>{p.budget}</span>
            </div>
          ))}
        </div>
      )}

      {tab === 'Invoices' && (
        <div>
          {[
            { num: 'INV-001', amount: '$12,500', status: 'Paid', date: 'Mar 15, 2026' },
            { num: 'INV-002', amount: '$8,200', status: 'Pending', date: 'Apr 1, 2026' },
            { num: 'INV-003', amount: '$3,800', status: 'Overdue', date: 'Feb 28, 2026' },
          ].map((inv, i) => (
            <div key={i} className="flex items-center gap-3 py-3"
              style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <div className="flex-1">
                <p className="text-[13px] font-medium" style={{ color: 'var(--foreground)' }}>{inv.num}</p>
                <p className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>{inv.date}</p>
              </div>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-md"
                style={{
                  background: inv.status === 'Paid' ? 'rgba(37,99,235,0.10)' : inv.status === 'Overdue' ? 'rgba(248,113,113,0.10)' : 'rgba(255,255,255,0.06)',
                  color: inv.status === 'Paid' ? '#2563EB' : inv.status === 'Overdue' ? '#F87171' : 'var(--muted-foreground)',
                }}>
                {inv.status}
              </span>
              <span className="text-[13px] font-medium tabular-nums" style={{ color: 'var(--foreground)' }}>{inv.amount}</span>
            </div>
          ))}
        </div>
      )}

      {tab === 'Activity' && (
        <div>
          <TimelineItem icon={FileText} text="Invoice INV-002 was sent" time="2 hours ago" />
          <TimelineItem icon={DollarSign} text="Payment of $12,500 received for INV-001" time="Yesterday" color="#10B981" />
          <TimelineItem icon={Briefcase} text="Project 'Website Redesign' was started" time="Mar 15, 2026" color="#0D9488" />
          <TimelineItem icon={MessageSquare} text="Meeting summary shared" time="Mar 12, 2026" />
          <TimelineItem icon={User} text="Client account was created" time="Jan 15, 2025" color="var(--muted-foreground)" />
        </div>
      )}
    </SlideDrawer>
  );
}

/* ═══════════════════════════════════════
   DEAL DETAIL PANEL
   ═══════════════════════════════════════ */
export function DealDetailPanel({ open, onClose, deal }: {
  open: boolean; onClose: () => void;
  deal?: { name: string; client: string; value: string; stage: string };
}) {
  const [tab, setTab] = useState('Overview');
  if (!deal) return null;

  return (
    <SlideDrawer open={open} onClose={onClose} title={deal.name} subtitle={deal.client}
      width="520px"
      footer={
        <div className="flex items-center justify-between">
          <button className="px-3 py-2 rounded-lg text-[12px] font-medium transition-colors"
            style={{ background: 'rgba(248,113,113,0.10)', color: '#F87171', border: '1px solid rgba(248,113,113,0.15)' }}>
            Mark Lost
          </button>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 rounded-lg text-[13px] font-medium flex items-center gap-2 transition-all hover:scale-[1.02]"
              style={{ background: 'var(--glass-bg)', color: 'var(--foreground)', border: '1px solid var(--border)' }}>
              <Edit3 className="w-3.5 h-3.5" /> Edit
            </button>
            <button className="px-4 py-2 rounded-lg text-[13px] font-medium flex items-center gap-2 transition-all hover:scale-[1.02]"
              style={{ background: '#10B981', color: '#FFF' }}>
              <Check className="w-3.5 h-3.5" /> Mark Won
            </button>
          </div>
        </div>
      }>
      <DetailTabs tabs={['Overview', 'Activity', 'Documents', 'Notes']} active={tab} onChange={setTab} />

      {tab === 'Overview' && (
        <>
          {/* Stage progress */}
          <div className="mb-5">
            <p className="text-[11px] font-medium uppercase tracking-wider mb-2"
              style={{ color: 'var(--muted-foreground)' }}>Pipeline Stage</p>
            <div className="flex items-center gap-1">
              {['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Won'].map((s, i) => {
                const isActive = s === deal.stage || ['Lead', 'Qualified', 'Proposal', 'Negotiation'].indexOf(s) <= ['Lead', 'Qualified', 'Proposal', 'Negotiation'].indexOf(deal.stage);
                return (
                  <div key={s} className="flex-1 h-2 rounded-full" style={{
                    background: isActive ? '#2563EB' : 'var(--glass-bg)',
                  }} />
                );
              })}
            </div>
            <p className="text-[12px] font-medium mt-1.5" style={{ color: '#2563EB' }}>{deal.stage}</p>
          </div>

          <InfoRow label="Deal Value" value={deal.value} icon={DollarSign} />
          <InfoRow label="Win Probability" value="60%" icon={Star} />
          <InfoRow label="Expected Close" value="Apr 30, 2026" icon={Calendar} />
          <InfoRow label="Deal Owner" value="John Doe" icon={User} />
          <InfoRow label="Source" value="Referral" icon={ExternalLink} />
          <InfoRow label="Created" value="Mar 5, 2026" icon={Clock} />
        </>
      )}

      {tab === 'Activity' && (
        <div>
          <TimelineItem icon={FileText} text="Proposal sent to client" time="Today, 10:30 AM" />
          <TimelineItem icon={MessageSquare} text="Follow-up call completed" time="Yesterday" />
          <TimelineItem icon={Mail} text="Initial outreach email sent" time="Mar 5, 2026" />
          <TimelineItem icon={Briefcase} text="Deal created from website lead" time="Mar 5, 2026" color="var(--muted-foreground)" />
        </div>
      )}

      {tab === 'Documents' && (
        <div>
          {[
            { name: 'Proposal_v2.pdf', size: '2.4 MB', date: 'Apr 5, 2026' },
            { name: 'Requirements.docx', size: '1.1 MB', date: 'Mar 28, 2026' },
            { name: 'Budget_Estimate.xlsx', size: '856 KB', date: 'Mar 20, 2026' },
          ].map((doc, i) => (
            <div key={i} className="flex items-center gap-3 py-3 group"
              style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: 'var(--glass-bg)' }}>
                <FileText className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium truncate" style={{ color: 'var(--foreground)' }}>{doc.name}</p>
                <p className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>{doc.size} · {doc.date}</p>
              </div>
              <button className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                style={{ color: 'var(--muted-foreground)' }}>
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          <button className="w-full mt-3 py-2.5 rounded-lg text-[12px] font-medium flex items-center justify-center gap-1.5 transition-colors hover:bg-white/[0.03]"
            style={{ color: '#2563EB', border: '1px dashed var(--border)' }}>
            <ExternalLink className="w-3 h-3" /> Upload Document
          </button>
        </div>
      )}

      {tab === 'Notes' && (
        <div>
          <textarea
            rows={4}
            placeholder="Add a note about this deal..."
            className="w-full px-3 py-2.5 rounded-lg text-[13px] outline-none resize-none mb-3"
            style={{ background: 'var(--glass-bg)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
          />
          <button className="px-4 py-2 rounded-lg text-[12px] font-medium transition-all hover:scale-[1.02]"
            style={{ background: '#2563EB', color: '#FFF' }}>
            Save Note
          </button>
          <div className="mt-5">
            {[
              { text: 'Client prefers phased delivery. Budget flexible.', author: 'John Doe', time: '2 days ago' },
              { text: 'Initial requirements gathered. Need design specs.', author: 'Jane Smith', time: '1 week ago' },
            ].map((n, i) => (
              <div key={i} className="mb-4 px-3 py-2.5 rounded-lg"
                style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-subtle)' }}>
                <p className="text-[12px] leading-relaxed" style={{ color: 'var(--foreground-secondary)' }}>{n.text}</p>
                <p className="text-[10px] mt-1.5" style={{ color: 'var(--muted-foreground)' }}>
                  {n.author} · {n.time}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </SlideDrawer>
  );
}

/* ═══════════════════════════════════════
   SETTINGS DRAWER
   User preferences, appearance, workspace settings
   ═══════════════════════════════════════ */
export function SettingsDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [tab, setTab] = useState('Account');
  return (
    <SlideDrawer open={open} onClose={onClose} title="Settings" subtitle="Manage your preferences" width="480px">
      <DetailTabs tabs={['Account', 'Appearance', 'Notifications', 'Workspace']} active={tab} onChange={setTab} />

      {tab === 'Account' && (
        <>
          {/* Profile card */}
          <div className="flex items-center gap-4 p-4 rounded-xl mb-5"
            style={{ background: 'var(--glass-bg)', border: '1px solid var(--border)' }}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-[16px] font-bold"
              style={{ background: '#2563EB', color: '#FFF' }}>
              JD
            </div>
            <div>
              <p className="text-[15px] font-semibold" style={{ color: 'var(--foreground)' }}>John Doe</p>
              <p className="text-[12px]" style={{ color: 'var(--muted-foreground)' }}>john@operationshub.com</p>
              <p className="text-[11px] mt-0.5" style={{ color: '#2563EB' }}>Admin</p>
            </div>
          </div>
          <InfoRow label="Full Name" value="John Doe" icon={User} />
          <InfoRow label="Email" value="john@operationshub.com" icon={Mail} />
          <InfoRow label="Phone" value="+1 (555) 123-4567" icon={Phone} />
          <InfoRow label="Time Zone" value="EST (UTC-5)" icon={Clock} />
          <InfoRow label="Language" value="English (US)" icon={Globe} />
        </>
      )}

      {tab === 'Appearance' && (
        <>
          <p className="text-[12px] mb-3" style={{ color: 'var(--muted-foreground)' }}>
            Choose how Operations Hub looks for you.
          </p>
          <div className="grid grid-cols-2 gap-3 mb-5">
            {[
              { label: 'Dark', active: true },
              { label: 'Light', active: false },
            ].map(t => (
              <button key={t.label}
                className="p-4 rounded-xl text-center transition-all"
                style={{
                  background: t.active ? 'rgba(37,99,235,0.10)' : 'var(--glass-bg)',
                  border: `1px solid ${t.active ? '#2563EB' : 'var(--border)'}`,
                  color: 'var(--foreground)',
                }}>
                <div className="w-full h-16 rounded-lg mb-2"
                  style={{ background: t.label === 'Dark' ? '#0B0D12' : '#FFFFFF', border: '1px solid var(--border)' }} />
                <span className="text-[12px] font-medium">{t.label}</span>
              </button>
            ))}
          </div>
          <InfoRow label="Sidebar Collapsed" value="Auto" icon={Activity} />
          <InfoRow label="Density" value="Default" icon={Activity} />
          <InfoRow label="Animations" value="Enabled" icon={Activity} />
        </>
      )}

      {tab === 'Notifications' && (
        <>
          {[
            { label: 'Email notifications', desc: 'Receive updates via email', checked: true },
            { label: 'Desktop notifications', desc: 'Browser push notifications', checked: true },
            { label: 'Deal stage changes', desc: 'When deals move between stages', checked: true },
            { label: 'Invoice payments', desc: 'When invoices are paid', checked: true },
            { label: 'New client signups', desc: 'Portal registration alerts', checked: false },
            { label: 'Weekly summary', desc: 'Digest of weekly activity', checked: true },
          ].map((n, i) => (
            <div key={i} className="flex items-center justify-between py-3"
              style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <div>
                <p className="text-[13px] font-medium" style={{ color: 'var(--foreground)' }}>{n.label}</p>
                <p className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>{n.desc}</p>
              </div>
              <input type="checkbox" defaultChecked={n.checked}
                className="w-4 h-4 rounded accent-blue-500" />
            </div>
          ))}
        </>
      )}

      {tab === 'Workspace' && (
        <>
          <InfoRow label="Workspace Name" value="Operations Hub" icon={Building2} />
          <InfoRow label="Plan" value="Pro" icon={Star} />
          <InfoRow label="Members" value="12" icon={User} />
          <InfoRow label="Storage Used" value="4.2 GB / 50 GB" icon={Activity} />
          <InfoRow label="API Keys" value="3 active" icon={ExternalLink} />
          <div className="mt-5">
            <button className="w-full py-2.5 rounded-lg text-[12px] font-medium transition-colors hover:bg-white/[0.03]"
              style={{ color: '#F87171', border: '1px solid rgba(248,113,113,0.15)' }}>
              Delete Workspace
            </button>
          </div>
        </>
      )}
    </SlideDrawer>
  );
}
