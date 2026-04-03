'use client';
import { ModuleSubNav } from '../../components/ModuleSubNav';

const TABS = [
  { href: '/hub/projects/list', label: 'Projects' },
  { href: '/hub/projects/timesheets', label: 'Timesheets' },
  { href: '/hub/projects/approvals', label: 'Approvals' },
];

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full">
      <ModuleSubNav tabs={TABS} />
      {children}
    </div>
  );
}
