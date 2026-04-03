'use client';
import { ModuleSubNav } from '../../components/ModuleSubNav';

const TABS = [
  { href: '/hub/talent/overview', label: 'Overview' },
  { href: '/hub/talent/jobs', label: 'Jobs' },
  { href: '/hub/talent/pipeline', label: 'Pipeline' },
  { href: '/hub/talent/candidates', label: 'Candidates' },
  { href: '/hub/talent/referrals', label: 'Referrals' },
];

export default function TalentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full">
      <ModuleSubNav tabs={TABS} />
      {children}
    </div>
  );
}
