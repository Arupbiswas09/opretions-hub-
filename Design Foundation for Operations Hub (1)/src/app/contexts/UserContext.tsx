import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 
  | 'founder'
  | 'sales'
  | 'recruiter'
  | 'hr'
  | 'delivery'
  | 'client'
  | 'freelancer'
  | 'consultant'
  | 'candidate';

export interface User {
  role: UserRole;
  name: string;
  email: string;
}

const userProfiles: Record<UserRole, User> = {
  founder: { role: 'founder', name: 'Alex Morgan', email: 'alex@company.com' },
  sales: { role: 'sales', name: 'Sarah Chen', email: 'sarah@company.com' },
  recruiter: { role: 'recruiter', name: 'James Wilson', email: 'james@company.com' },
  hr: { role: 'hr', name: 'Emma Davis', email: 'emma@company.com' },
  delivery: { role: 'delivery', name: 'Michael Brown', email: 'michael@company.com' },
  client: { role: 'client', name: 'David Thompson', email: 'david@client.com' },
  freelancer: { role: 'freelancer', name: 'Lisa Martinez', email: 'lisa@freelancer.com' },
  consultant: { role: 'consultant', name: 'Robert Lee', email: 'robert@consultant.com' },
  candidate: { role: 'candidate', name: 'Jennifer Kim', email: 'jennifer@email.com' },
};

export const isInternalUser = (role: UserRole): boolean => {
  return ['founder', 'sales', 'recruiter', 'hr', 'delivery'].includes(role);
};

export const getRoleLabel = (role: UserRole): string => {
  const labels: Record<UserRole, string> = {
    founder: 'Founder/Admin',
    sales: 'Sales (Employee)',
    recruiter: 'Recruiter (Employee)',
    hr: 'HR (Employee)',
    delivery: 'Delivery/PM (Employee)',
    client: 'Client (Portal)',
    freelancer: 'Freelancer (Portal)',
    consultant: 'Consultant (Portal)',
    candidate: 'Candidate (Portal)',
  };
  return labels[role];
};

interface UserContextType {
  currentUser: User;
  switchUser: (role: UserRole) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User>(userProfiles.founder);

  const switchUser = (role: UserRole) => {
    setCurrentUser(userProfiles[role]);
  };

  return (
    <UserContext.Provider value={{ currentUser, switchUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};
