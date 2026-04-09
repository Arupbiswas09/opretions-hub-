'use client';
import { ModuleSubNav } from '../../components/ModuleSubNav';

const TABS = [
  { href: '/hub/people/directory', label: 'Directory' },
  { href: '/hub/people/approvals', label: 'HR approvals' },
];

export default function PeopleLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full">
      <p
        className="px-3 pt-2.5 pb-1 text-[10px] leading-snug sm:px-5"
        style={{ color: 'var(--muted-foreground)' }}
      >
        Your org’s employees and contractors — not external CRM contacts (see{' '}
        <span style={{ color: 'var(--foreground)', fontWeight: 500 }}>CRM contacts</span> in the sidebar).
      </p>
      <ModuleSubNav tabs={TABS} />
      {children}
    </div>
  );
}
