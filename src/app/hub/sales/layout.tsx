'use client';
import { ModuleSubNav } from '../../components/ModuleSubNav';

const TABS = [
  { href: '/hub/sales/overview', label: 'Overview' },
  { href: '/hub/sales/deals', label: 'Deals' },
  { href: '/hub/sales/pipeline', label: 'Pipeline' },
];

export default function SalesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full">
      <ModuleSubNav tabs={TABS} />
      {children}
    </div>
  );
}
