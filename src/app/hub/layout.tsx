'use client';

import HubShell from '../components/HubShell';

export default function HubLayout({ children }: { children: React.ReactNode }) {
  return <HubShell>{children}</HubShell>;
}
