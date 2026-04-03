'use client';
import { ModuleSubNav } from '../../components/ModuleSubNav';

const TABS = [
  { href: '/hub/finance/overview', label: 'Overview' },
  { href: '/hub/finance/invoices', label: 'Invoices' },
  { href: '/hub/finance/expenses', label: 'Expenses' },
];

export default function FinanceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full">
      <ModuleSubNav tabs={TABS} />
      {children}
    </div>
  );
}
