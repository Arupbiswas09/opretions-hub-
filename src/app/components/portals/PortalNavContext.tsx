'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

type PortalNavContextValue = {
  mobileRailOpen: boolean;
  setMobileRailOpen: (open: boolean) => void;
  openMobileRail: () => void;
  closeMobileRail: () => void;
};

const PortalNavContext = createContext<PortalNavContextValue | null>(null);

export function PortalNavProvider({ children }: { children: React.ReactNode }) {
  const [mobileRailOpen, setMobileRailOpen] = useState(false);
  const openMobileRail = useCallback(() => setMobileRailOpen(true), []);
  const closeMobileRail = useCallback(() => setMobileRailOpen(false), []);

  return (
    <PortalNavContext.Provider
      value={{ mobileRailOpen, setMobileRailOpen, openMobileRail, closeMobileRail }}
    >
      {children}
    </PortalNavContext.Provider>
  );
}

export function usePortalNav() {
  return useContext(PortalNavContext);
}
