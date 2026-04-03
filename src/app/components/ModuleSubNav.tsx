'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Tab {
  href: string;
  label: string;
  badge?: number;
}

interface Action {
  label: string;
  onClick?: () => void;
  href?: string;
}

interface ModuleSubNavProps {
  tabs: Tab[];
  actions?: Action[];
}

export function ModuleSubNav({ tabs, actions }: ModuleSubNavProps) {
  const pathname = usePathname();

  return (
    <div className="px-8 py-3 border-b border-stone-100/60">
      <div className="flex items-center gap-1">
        {tabs.map((tab) => {
          const active =
            pathname === tab.href ||
            pathname.startsWith(tab.href + '/');
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`relative px-3 py-1.5 text-[12px] rounded-md transition-all duration-200 ${
                active
                  ? 'bg-stone-800 text-white font-medium shadow-sm'
                  : 'text-stone-400 hover:text-stone-600 hover:bg-stone-50'
              }`}
            >
              {tab.label}
              {tab.badge !== undefined && (
                <span
                  className={`ml-1.5 inline-flex items-center justify-center w-[14px] h-[14px] text-[9px] font-semibold rounded-full ${
                    active ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-600'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </Link>
          );
        })}

        {actions && actions.length > 0 && (
          <>
            <div className="w-px h-3.5 bg-stone-200/60 mx-1.5" />
            {actions.map((action) =>
              action.href ? (
                <Link
                  key={action.label}
                  href={action.href}
                  className="px-3 py-1.5 text-[12px] text-stone-400 hover:text-stone-600 hover:bg-stone-50 rounded-md transition-colors"
                >
                  {action.label}
                </Link>
              ) : (
                <button
                  key={action.label}
                  type="button"
                  onClick={action.onClick}
                  className="px-3 py-1.5 text-[12px] text-stone-400 hover:text-stone-600 hover:bg-stone-50 rounded-md transition-colors"
                >
                  {action.label}
                </button>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
}
