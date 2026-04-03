'use client';

import HubShell from '../components/HubShell';
import { CommandPalette } from '../components/bonsai/CommandPalette';
import { ToastProvider } from '../components/bonsai/ToastSystem';
import { ThemeProvider } from '../lib/theme';

export default function HubLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <HubShell>{children}</HubShell>
        <CommandPalette />
      </ToastProvider>
    </ThemeProvider>
  );
}
