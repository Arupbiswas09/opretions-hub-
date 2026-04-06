import React from 'react';
import { Outlet } from 'react-router';
import { AppHeader } from '@/app/components/AppHeader';
import { Sidebar } from '@/app/components/Sidebar';
import { RoleBasedRedirect } from '@/app/components/RoleBasedRedirect';

export const PortalShell = () => {
  return (
    <div className="flex h-screen overflow-hidden">
      <RoleBasedRedirect />
      <Sidebar isPortal />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AppHeader />
        <main className="flex-1 overflow-auto bg-surface">
          <Outlet />
        </main>
      </div>
    </div>
  );
};