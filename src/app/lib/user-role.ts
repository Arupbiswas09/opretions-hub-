'use client';

/**
 * User Role System — mirrors Design Foundation roles
 * Internal: founder, sales, recruiter, hr, delivery/pm
 * Portal: client, freelancer, consultant, candidate
 */

export type InternalRole = 'founder' | 'sales' | 'recruiter' | 'hr' | 'delivery';
export type PortalRole   = 'client' | 'freelancer' | 'consultant' | 'candidate';
export type UserRole     = InternalRole | PortalRole;

export interface UserProfile {
  role: UserRole;
  name: string;
  email: string;
  initials: string;
}

export const USER_PROFILES: Record<UserRole, UserProfile> = {
  founder:    { role: 'founder',    name: 'Alex Morgan',   email: 'alex@company.com',       initials: 'AM' },
  sales:      { role: 'sales',      name: 'Sarah Chen',    email: 'sarah@company.com',      initials: 'SC' },
  recruiter:  { role: 'recruiter',  name: 'James Wilson',  email: 'james@company.com',      initials: 'JW' },
  hr:         { role: 'hr',         name: 'Emma Davis',    email: 'emma@company.com',       initials: 'ED' },
  delivery:   { role: 'delivery',   name: 'Michael Brown', email: 'michael@company.com',    initials: 'MB' },
  client:     { role: 'client',     name: 'David Thompson', email: 'david@client.com',      initials: 'DT' },
  freelancer: { role: 'freelancer', name: 'Lisa Martinez', email: 'lisa@freelancer.com',    initials: 'LM' },
  consultant: { role: 'consultant', name: 'Robert Lee',    email: 'robert@consultant.com',  initials: 'RL' },
  candidate:  { role: 'candidate',  name: 'Jennifer Kim',  email: 'jennifer@email.com',     initials: 'JK' },
};

export const ROLE_LABELS: Record<UserRole, string> = {
  founder:    'Founder / Admin',
  sales:      'Sales',
  recruiter:  'Recruiter',
  hr:         'HR Manager',
  delivery:   'Delivery / PM',
  client:     'Client (Portal)',
  freelancer: 'Freelancer (Portal)',
  consultant: 'Consultant (Portal)',
  candidate:  'Candidate (Portal)',
};

export const ROLE_GROUPS: { label: string; roles: UserRole[] }[] = [
  {
    label: 'Internal team',
    roles: ['founder', 'sales', 'recruiter', 'hr', 'delivery'],
  },
  {
    label: 'Portal users',
    roles: ['client', 'freelancer', 'consultant', 'candidate'],
  },
];

export function isInternalRole(role: UserRole): role is InternalRole {
  return ['founder', 'sales', 'recruiter', 'hr', 'delivery'].includes(role);
}

/** Route each role defaults to when switched */
export const ROLE_DEFAULT_ROUTE: Record<UserRole, string> = {
  founder:    '/hub/dashboard',
  sales:      '/hub/sales',
  recruiter:  '/hub/talent',
  hr:         '/hub/people',
  delivery:   '/hub/projects',
  client:     '/hub/portals/client',
  freelancer: '/hub/portals/freelancer',
  consultant: '/hub/portals/consultant',
  candidate:  '/hub/portals/candidate',
};

/**
 * Which hub-module slugs are visible per role.
 * Founder/Admin sees everything; others see a subset.
 */
export const ROLE_VISIBLE_MODULES: Record<InternalRole, string[]> = {
  founder:   ['dashboard', 'sales', 'clients', 'contacts', 'people', 'talent', 'projects',
              'communication', 'work', 'finance', 'forms', 'proposals', 'contracts',
              'meetings', 'timetracking', 'support', 'admin'],
  sales:     ['dashboard', 'sales', 'clients', 'contacts', 'proposals', 'contracts',
              'meetings', 'communication', 'work', 'finance'],
  recruiter: ['dashboard', 'talent', 'contacts', 'people', 'communication', 'work', 'meetings'],
  hr:        ['dashboard', 'people', 'forms', 'work', 'communication', 'meetings', 'admin'],
  delivery:  ['dashboard', 'projects', 'work', 'communication', 'timetracking', 'meetings', 'support'],
};
