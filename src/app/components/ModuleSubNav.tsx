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
    <div className="px-8 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
      <div className="flex items-center gap-1">
        {tabs.map((tab) => {
          const active =
            pathname === tab.href ||
            pathname.startsWith(tab.href + '/');
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`relative px-3.5 py-[6px] text-[12px] rounded-full transition-all duration-200 font-medium`}
              style={{
                background: active ? 'var(--glass-bg-strong)' : 'transparent',
                border: active ? '1px solid var(--border-strong)' : '1px solid transparent',
                color: active ? 'var(--foreground)' : 'var(--foreground-muted)',
                ...(active ? { boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12)' } : {}),
              }}
            >
              {tab.label}
              {tab.badge !== undefined && (
                <span
                  className="ml-1.5 inline-flex items-center justify-center w-[14px] h-[14px] text-[9px] font-semibold rounded-full"
                  style={{
                    background: active ? 'var(--primary)' : 'var(--glass-bg)',
                    color: active ? '#FFFFFF' : 'var(--foreground-secondary)',
                  }}
                >
                  {tab.badge}
                </span>
              )}
            </Link>
          );
        })}

        {actions && actions.length > 0 && (
          <>
            <div className="w-px h-3.5 mx-1.5" style={{ background: 'var(--border)' }} />
            {actions.map((action) =>
              action.href ? (
                <Link
                  key={action.label}
                  href={action.href}
                  className="px-3 py-1.5 text-[12px] rounded-full transition-colors"
                  style={{ color: 'var(--foreground-muted)' }}
                >
                  {action.label}
                </Link>
              ) : (
                <button
                  key={action.label}
                  type="button"
                  onClick={action.onClick}
                  className="px-3 py-1.5 text-[12px] rounded-full transition-colors"
                  style={{ color: 'var(--foreground-muted)' }}
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
