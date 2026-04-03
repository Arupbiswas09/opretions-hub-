'use client';
import { ModuleSubNav } from '../../components/ModuleSubNav';

const TABS = [
  { href: '/hub/people/directory', label: 'Directory' },
  { href: '/hub/people/approvals', label: 'Approvals' },
];

export default function PeopleLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full">
      <ModuleSubNav tabs={TABS} />
      {children}
    </div>
  );
}
