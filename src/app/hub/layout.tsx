'use client';

import HubShell from '../components/HubShell';
import { CommandPalette } from '../components/bonsai/CommandPalette';
import { ToastProvider } from '../components/bonsai/ToastSystem';

export default function HubLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <HubShell>{children}</HubShell>
      <CommandPalette />
    </ToastProvider>
  );
}
