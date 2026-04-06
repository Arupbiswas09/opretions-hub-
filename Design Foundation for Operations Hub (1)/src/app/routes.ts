import { createBrowserRouter } from 'react-router';
import { InternalAppShell } from '@/app/layouts/InternalAppShell';
import { PortalShell } from '@/app/layouts/PortalShell';
import { CockpitPage } from '@/app/pages/CockpitPage';
import { CommunicationPage } from '@/app/pages/CommunicationPage';
import { RecruitmentPage } from '@/app/pages/RecruitmentPage';
import { JobDetailPage } from '@/app/pages/recruitment/JobDetailPage';
import { CandidateProfilePage } from '@/app/pages/recruitment/CandidateProfilePage';
import { PlaceholderPage } from '@/app/pages/PlaceholderPage';
import { WorkPage } from '@/app/pages/work';
import {
  Briefcase,
  MessageSquare,
  Users,
  FolderKanban,
  UserCircle,
  TrendingUp,
  DollarSign,
  BookOpen,
  FileText,
  BarChart3,
  Globe,
  Settings,
  Home,
  CheckSquare,
  File,
  Clock,
  CreditCard,
  Database,
} from 'lucide-react';
import { createElement } from 'react';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: InternalAppShell,
    children: [
      {
        index: true,
        element: createElement(CockpitPage),
      },
      {
        path: 'cockpit',
        element: createElement(CockpitPage),
      },
      {
        path: 'work',
        element: createElement(WorkPage),
      },
      {
        path: 'communication',
        element: createElement(CommunicationPage),
      },
      {
        path: 'recruitment',
        element: createElement(RecruitmentPage),
      },
      {
        path: 'recruitment/jobs/:jobId',
        element: createElement(JobDetailPage),
      },
      {
        path: 'recruitment/candidates/:candidateId',
        element: createElement(CandidateProfilePage),
      },
      {
        path: 'projects',
        element: createElement(PlaceholderPage, {
          title: 'Projects',
          breadcrumbLabel: 'Projects',
          icon: createElement(FolderKanban, { className: 'w-12 h-12 text-muted-foreground' }),
          description: 'Project management, timelines, and deliverables tracking.',
        }),
      },
      {
        path: 'people',
        element: createElement(PlaceholderPage, {
          title: 'People',
          breadcrumbLabel: 'People',
          icon: createElement(UserCircle, { className: 'w-12 h-12 text-muted-foreground' }),
          description: 'Employee and contractor directory with profiles and organizational structure.',
        }),
      },
      {
        path: 'sales',
        element: createElement(PlaceholderPage, {
          title: 'Sales',
          breadcrumbLabel: 'Sales',
          icon: createElement(TrendingUp, { className: 'w-12 h-12 text-muted-foreground' }),
          description: 'Sales pipeline, deals, and revenue tracking.',
        }),
      },
      {
        path: 'finance',
        element: createElement(PlaceholderPage, {
          title: 'Finance',
          breadcrumbLabel: 'Finance',
          icon: createElement(DollarSign, { className: 'w-12 h-12 text-muted-foreground' }),
          description: 'Financial management, invoicing, and expense tracking.',
        }),
      },
      {
        path: 'knowledge',
        element: createElement(PlaceholderPage, {
          title: 'Knowledge',
          breadcrumbLabel: 'Knowledge',
          icon: createElement(BookOpen, { className: 'w-12 h-12 text-muted-foreground' }),
          description: 'Company knowledge base, documentation, and resources.',
        }),
      },
      {
        path: 'forms',
        element: createElement(PlaceholderPage, {
          title: 'Forms',
          breadcrumbLabel: 'Forms',
          icon: createElement(FileText, { className: 'w-12 h-12 text-muted-foreground' }),
          description: 'Dynamic forms builder and submissions management.',
        }),
      },
      {
        path: 'analytics',
        element: createElement(PlaceholderPage, {
          title: 'Analytics',
          breadcrumbLabel: 'Analytics',
          icon: createElement(BarChart3, { className: 'w-12 h-12 text-muted-foreground' }),
          description: 'Business intelligence and analytics dashboards.',
        }),
      },
      {
        path: 'portals',
        element: createElement(PlaceholderPage, {
          title: 'Portals',
          breadcrumbLabel: 'Portals',
          icon: createElement(Globe, { className: 'w-12 h-12 text-muted-foreground' }),
          description: 'Manage external portal configurations and permissions.',
        }),
      },
      {
        path: 'settings',
        element: createElement(PlaceholderPage, {
          title: 'Settings',
          breadcrumbLabel: 'Settings',
          icon: createElement(Settings, { className: 'w-12 h-12 text-muted-foreground' }),
          description: 'System settings, configurations, and preferences.',
        }),
      },
    ],
  },
  {
    path: '/portal',
    Component: PortalShell,
    children: [
      {
        index: true,
        element: createElement(PlaceholderPage, {
          title: 'Portal Home',
          icon: createElement(Home, { className: 'w-12 h-12 text-muted-foreground' }),
          description: 'Welcome to your portal. Access your projects, tasks, and documents.',
        }),
      },
      {
        path: 'projects',
        element: createElement(PlaceholderPage, {
          title: 'Projects',
          breadcrumbLabel: 'Projects',
          icon: createElement(FolderKanban, { className: 'w-12 h-12 text-muted-foreground' }),
          description: 'View and collaborate on assigned projects.',
        }),
      },
      {
        path: 'tasks',
        element: createElement(PlaceholderPage, {
          title: 'Tasks',
          breadcrumbLabel: 'Tasks',
          icon: createElement(CheckSquare, { className: 'w-12 h-12 text-muted-foreground' }),
          description: 'Manage your assigned tasks and deliverables.',
        }),
      },
      {
        path: 'documents',
        element: createElement(PlaceholderPage, {
          title: 'Documents',
          breadcrumbLabel: 'Documents',
          icon: createElement(File, { className: 'w-12 h-12 text-muted-foreground' }),
          description: 'Access shared documents and resources.',
        }),
      },
      {
        path: 'approvals',
        element: createElement(PlaceholderPage, {
          title: 'Approvals',
          breadcrumbLabel: 'Approvals',
          icon: createElement(CheckSquare, { className: 'w-12 h-12 text-muted-foreground' }),
          description: 'Review and approve submitted items.',
        }),
      },
      {
        path: 'timesheets',
        element: createElement(PlaceholderPage, {
          title: 'Timesheets',
          breadcrumbLabel: 'Timesheets',
          icon: createElement(Clock, { className: 'w-12 h-12 text-muted-foreground' }),
          description: 'Submit and track your time entries.',
        }),
      },
      {
        path: 'payments',
        element: createElement(PlaceholderPage, {
          title: 'Payments',
          breadcrumbLabel: 'Payments',
          icon: createElement(CreditCard, { className: 'w-12 h-12 text-muted-foreground' }),
          description: 'View payment history and invoices.',
        }),
      },
      {
        path: 'profile',
        element: createElement(PlaceholderPage, {
          title: 'Profile & Data',
          breadcrumbLabel: 'Profile',
          icon: createElement(Database, { className: 'w-12 h-12 text-muted-foreground' }),
          description: 'Manage your profile information and data privacy settings (GDPR).',
        }),
      },
    ],
  },
]);