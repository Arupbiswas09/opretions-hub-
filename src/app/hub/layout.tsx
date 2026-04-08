'use client';

import HubShell from '../components/HubShell';
import { SessionWarmup } from '../components/hub/SessionWarmup';
import { CommandPalette } from '../components/bonsai/CommandPalette';
import { ToastProvider } from '../components/bonsai/ToastSystem';
import { ThemeProvider } from '../lib/theme';
import { UserRoleProvider } from '../lib/UserRoleContext';

export default function HubLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <UserRoleProvider>
        <SessionWarmup />
        <ToastProvider>
          <HubShell>{children}</HubShell>
          <CommandPalette />
        </ToastProvider>
      </UserRoleProvider>
    </ThemeProvider>
  );
}
