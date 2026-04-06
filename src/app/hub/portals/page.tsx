'use client';

import Link from 'next/link';
import { Building2, UserCircle, Briefcase, ShieldCheck, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { EASE_OUT_EXPO } from '../../lib/motion';

const PORTALS: {
  slug: string;
  title: string;
  description: string;
  icon: typeof Building2;
}[] = [
  {
    slug: 'client',
    title: 'Client portal',
    description: 'Proposals, contracts, invoices, and approval queues your clients act on.',
    icon: Building2,
  },
  {
    slug: 'employee',
    title: 'Employee portal',
    description: 'Onboarding, policies, time off, and internal requests.',
    icon: UserCircle,
  },
  {
    slug: 'freelancer',
    title: 'Freelancer portal',
    description: 'Assignments, timesheets, self-bills, and documents.',
    icon: Briefcase,
  },
  {
    slug: 'hris',
    title: 'HRIS admin',
    description: 'Org data, approvals, and sensitive HR configuration.',
    icon: ShieldCheck,
  },
];

export default function PortalsHubPage() {
  return (
    <div className="mx-auto max-w-[900px] px-10 py-14">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] mb-2 text-stone-400 dark:text-stone-500">
          External experiences
        </p>
        <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-stone-900 dark:text-stone-50">
          Choose a portal
        </h1>
        <p className="text-[14px] mt-2 text-stone-500 dark:text-stone-400 max-w-xl leading-relaxed">
          Same workspace, role-specific surfaces — aligned with client onboarding, employee lifecycle, and
          freelancer billing flows.
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-2 gap-4 mt-10">
        {PORTALS.map((p, i) => {
          const Icon = p.icon;
          return (
            <motion.div
              key={p.slug}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.32, delay: 0.06 + i * 0.05, ease: EASE_OUT_EXPO }}
            >
              <Link
                href={`/hub/portals/${p.slug}`}
                className="group flex flex-col h-full rounded-xl border p-5 transition-colors hover:bg-stone-50/80 dark:hover:bg-white/[0.04]"
                style={{
                  background: 'var(--glass-bg)',
                  borderColor: 'var(--border)',
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ background: 'var(--muted)', color: 'var(--foreground)' }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
                </div>
                <h2 className="text-[16px] font-semibold mt-4 text-stone-900 dark:text-stone-100">{p.title}</h2>
                <p className="text-[13px] mt-1.5 text-stone-500 dark:text-stone-400 leading-relaxed flex-1">
                  {p.description}
                </p>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <p className="text-[12px] mt-10 text-stone-400 dark:text-stone-500">
        Internal hub:{' '}
        <Link href="/hub/dashboard" className="font-medium text-stone-600 dark:text-stone-300 hover:underline">
          Return to dashboard
        </Link>
      </p>
    </div>
  );
}
