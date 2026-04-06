'use client';

import Link from 'next/link';
import { Building2, UserCircle, Briefcase, ShieldCheck, ArrowRight, UserCheck } from 'lucide-react';
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
  {
    slug: 'candidate',
    title: 'Candidate portal',
    description: 'Application status, interview schedule, documents, and offer package.',
    icon: UserCheck,
  },
];

export default function PortalsHubPage() {
  return (
    <div className="mx-auto max-w-[900px] px-6 py-12 md:px-10 md:py-14">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
      >
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          External experiences
        </p>
        <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-foreground">Choose a portal</h1>
        <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-muted-foreground">
          Role-specific surfaces for buyers, staff, contractors, and HR — same design system as the internal
          hub, tuned for each audience.
        </p>
      </motion.div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
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
                className="portal-panel group flex h-full flex-col p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <h2 className="mt-4 text-[16px] font-semibold text-foreground">{p.title}</h2>
                <p className="mt-1.5 flex-1 text-[13px] leading-relaxed text-muted-foreground">{p.description}</p>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <p className="mt-10 text-[12px] text-muted-foreground">
        Internal hub:{' '}
        <Link href="/hub/dashboard" className="font-medium text-foreground underline-offset-4 hover:underline">
          Return to dashboard
        </Link>
      </p>
    </div>
  );
}
