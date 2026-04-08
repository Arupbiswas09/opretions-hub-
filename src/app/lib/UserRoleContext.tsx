'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { isSupabaseBrowserConfigured } from './supabase/client';

/** Database + app roles (Phase 1). Legacy demo personas may use other labels. */
export type UserRole = 'admin' | 'manager' | 'member' | 'viewer' | 'employee' | 'client' | 'freelancer';

export interface UserPersona {
  role: UserRole;
  name: string;
  initials: string;
  email: string;
  avatarColor: string;
  accessGroups: ('top' | 'workspace' | 'productivity' | 'bottom')[];
  /** Supabase user id when logged in */
  userId?: string;
  orgName?: string | null;
  avatarUrl?: string | null;
}

export const PERSONAS: UserPersona[] = [
  {
    role: 'admin',
    name: 'John Doe',
    initials: 'JD',
    email: 'john.doe@company.com',
    avatarColor: '#2563EB',
    accessGroups: ['top', 'workspace', 'productivity', 'bottom'],
  },
  {
    role: 'manager',
    name: 'Sarah Chen',
    initials: 'SC',
    email: 'sarah.chen@company.com',
    avatarColor: '#7C3AED',
    accessGroups: ['top', 'workspace', 'productivity'],
  },
  {
    role: 'employee',
    name: 'Priya Kapoor',
    initials: 'PK',
    email: 'priya.kapoor@company.com',
    avatarColor: '#0891B2',
    accessGroups: ['top', 'productivity'],
  },
  {
    role: 'client',
    name: 'Tom Bridges',
    initials: 'TB',
    email: 'tom@meridiangroup.co',
    avatarColor: '#059669',
    accessGroups: ['top'],
  },
  {
    role: 'freelancer',
    name: 'Carlos Ruiz',
    initials: 'CR',
    email: 'carlos@freelance.io',
    avatarColor: '#D97706',
    accessGroups: ['top', 'productivity'],
  },
];

function avatarColorFromEmail(email: string): string {
  const colors = ['#2563EB', '#7C3AED', '#0891B2', '#059669', '#D97706', '#DC2626'];
  let h = 0;
  for (let i = 0; i < email.length; i++) h = (h << 5) - h + email.charCodeAt(i);
  return colors[Math.abs(h) % colors.length]!;
}

function initialsFrom(name: string | null | undefined, email: string): string {
  const n = (name || '').trim();
  if (n) {
    const parts = n.split(/\s+/).filter(Boolean);
    const a = parts[0]?.[0] || '';
    const b = parts.length > 1 ? parts[parts.length - 1]![0]! : parts[0]?.[1] || '';
    return (a + b).toUpperCase().slice(0, 2) || email.slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

export function accessGroupsForRole(role: string): UserPersona['accessGroups'] {
  if (role === 'employee' || role === 'member') return ['top', 'productivity'];
  if (role === 'client') return ['top'];
  if (role === 'freelancer') return ['top', 'productivity'];
  switch (role) {
    case 'admin':
      return ['top', 'workspace', 'productivity', 'bottom'];
    case 'manager':
      return ['top', 'workspace', 'productivity'];
    case 'member':
      return ['top', 'productivity'];
    case 'viewer':
      return ['top'];
    default:
      return ['top', 'workspace', 'productivity', 'bottom'];
  }
}

function personaFromApi(data: {
  user: { id: string; email: string | null };
  profile: {
    role: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
  organization: { name: string } | null;
}): UserPersona {
  const email = data.user.email || '';
  const role = (data.profile?.role || 'member') as UserRole;
  const name = data.profile?.display_name?.trim() || email.split('@')[0] || 'User';
  return {
    role,
    name,
    initials: initialsFrom(data.profile?.display_name, email),
    email,
    avatarColor: avatarColorFromEmail(email),
    accessGroups: accessGroupsForRole(role),
    userId: data.user.id,
    orgName: data.organization?.name ?? null,
    avatarUrl: data.profile?.avatar_url ?? null,
  };
}

interface UserRoleContextValue {
  persona: UserPersona;
  setPersona: (p: UserPersona) => void;
  loading: boolean;
  /** live = from /api/auth/me; demo = no Supabase */
  source: 'live' | 'demo';
  refreshPersona: () => Promise<void>;
}

const UserRoleContext = createContext<UserRoleContextValue>({
  persona: PERSONAS[0]!,
  setPersona: () => {},
  loading: true,
  source: 'demo',
  refreshPersona: async () => {},
});

export function UserRoleProvider({ children }: { children: React.ReactNode }) {
  const [persona, setPersona] = useState<UserPersona>(PERSONAS[0]!);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<'live' | 'demo'>('demo');

  const refreshPersona = useCallback(async () => {
    if (!isSupabaseBrowserConfigured()) {
      setPersona(PERSONAS[0]!);
      setSource('demo');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (!res.ok) {
        setPersona(PERSONAS[0]!);
        setSource('demo');
        return;
      }
      const data = await res.json();
      setPersona(personaFromApi(data));
      setSource('live');
    } catch {
      setPersona(PERSONAS[0]!);
      setSource('demo');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshPersona();
  }, [refreshPersona]);

  const value = useMemo(
    () => ({ persona, setPersona, loading, source, refreshPersona }),
    [persona, loading, source, refreshPersona],
  );

  return <UserRoleContext.Provider value={value}>{children}</UserRoleContext.Provider>;
}

export function useUserRole() {
  return useContext(UserRoleContext);
}

/** Show “Simulate persona” only when explicitly enabled (dev UX). */
export function showPersonaSimulator(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_PERSONA_SIMULATOR === 'true';
}
