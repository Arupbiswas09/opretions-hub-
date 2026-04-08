import type { ReactNode } from 'react';
import { ThemeProvider } from '../lib/theme';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <div
        className="min-h-screen flex flex-col antialiased"
        style={{ background: 'var(--background)', color: 'var(--foreground)' }}
      >
        {children}
      </div>
    </ThemeProvider>
  );
}
