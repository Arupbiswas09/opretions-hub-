'use client';
import React, { createContext, useContext, useState } from 'react';

export type UserRole = 'admin' | 'manager' | 'employee' | 'client' | 'freelancer';

export interface UserPersona {
  role: UserRole;
  name: string;
  initials: string;
  email: string;
  avatarColor: string;
  /** Sidebar sections this role can access */
  accessGroups: ('top' | 'workspace' | 'productivity' | 'bottom')[];
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

interface UserRoleContextValue {
  persona: UserPersona;
  setPersona: (p: UserPersona) => void;
}

const UserRoleContext = createContext<UserRoleContextValue>({
  persona: PERSONAS[0],
  setPersona: () => {},
});

export function UserRoleProvider({ children }: { children: React.ReactNode }) {
  const [persona, setPersona] = useState<UserPersona>(PERSONAS[0]);
  return (
    <UserRoleContext.Provider value={{ persona, setPersona }}>
      {children}
    </UserRoleContext.Provider>
  );
}

export function useUserRole() {
  return useContext(UserRoleContext);
}
