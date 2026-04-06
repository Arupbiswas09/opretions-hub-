# Operations Hub - Base Foundation

This is the foundational structure for an AI-powered Operations Hub used by a hybrid Talent + AI Services company.

## What Has Been Created

### 1. Design System (`/src/styles/theme.css`)
- **Color Tokens**: Added enterprise SaaS colors including success, warning, danger, info, surface states
- **Existing Tokens**: Background, foreground, card, muted, accent, borders, etc.
- **Typography**: H1-H4 hierarchy with consistent font weights
- **Spacing**: 4px base scale (4, 8, 12, 16, 24, 32)
- **Radius**: Small, medium, large variants
- **Dark Mode Support**: Full dark theme variables included

### 2. User Role System (`/src/app/contexts/UserContext.tsx`)
- **User Roles**: 
  - **Internal**: Founder/Admin, Sales, Recruiter, HR, Delivery/PM
  - **Portal**: Client, Freelancer, Consultant, Candidate
- **Role Switching**: Dropdown in header allows switching between user types for demo/testing
- **Auto-Redirect**: Automatically routes users to appropriate shell based on role

### 3. Layout Components

#### App Header (`/src/app/components/AppHeader.tsx`)
- Global search input
- Notification icon with indicator
- User dropdown with profile info
- **Switch User dropdown** for testing different roles
- Fully responsive design

#### Sidebar Navigation (`/src/app/components/Sidebar.tsx`)
- **Internal App Sidebar**: 13 modules (Cockpit, Work, Communication, Recruitment, Projects, People, Sales, Finance, Knowledge, Forms, Analytics, Portals, Settings)
- **Portal Sidebar**: 8 sections (Home, Projects, Tasks, Documents, Approvals, Timesheets, Payments, Profile)
- Collapsible state
- Active route highlighting
- Icon + label navigation

#### Page Header (`/src/app/components/PageHeader.tsx`)
- Title display
- Breadcrumb navigation
- Primary action button support
- Secondary actions area

### 4. App Shells

#### Internal App Shell (`/src/app/layouts/InternalAppShell.tsx`)
- For employees (Founder, Sales, Recruiter, HR, Delivery)
- Full sidebar with all internal modules
- Enterprise-focused layout

#### Portal Shell (`/src/app/layouts/PortalShell.tsx`)
- For external users (Client, Freelancer, Consultant, Candidate)
- Simplified navigation
- Client-facing design

### 5. Reusable Components

#### Empty State (`/src/app/components/EmptyState.tsx`)
- Placeholder pattern for unimplemented modules
- Customizable icon, title, description
- Used across all placeholder pages

#### Role-Based Redirect (`/src/app/components/RoleBasedRedirect.tsx`)
- Automatically switches between shells when user role changes
- Internal users → Internal App Shell
- Portal users → Portal Shell

### 6. Routing (`/src/app/routes.ts`)
- **React Router Data Mode** implementation
- Two main route groups:
  - `/` - Internal app routes (13 modules)
  - `/portal` - Portal routes (8 sections)
- All routes wired with placeholder pages

### 7. Placeholder Pages
- **CockpitPage**: Main dashboard placeholder
- **PlaceholderPage**: Reusable component for all other modules
- Each page includes:
  - Page header with title
  - Breadcrumbs
  - Empty state with contextual message
  - Module-specific icon

## File Structure

```
/src
├── /app
│   ├── /components
│   │   ├── AppHeader.tsx           # Top navigation bar
│   │   ├── EmptyState.tsx          # Empty state pattern
│   │   ├── PageHeader.tsx          # Page title + breadcrumbs
│   │   ├── RoleBasedRedirect.tsx   # Auto-redirect logic
│   │   ├── Sidebar.tsx             # Main navigation
│   │   └── /ui                     # Existing shadcn components
│   ├── /contexts
│   │   └── UserContext.tsx         # User role management
│   ├── /layouts
│   │   ├── InternalAppShell.tsx    # Employee layout
│   │   └── PortalShell.tsx         # External user layout
│   ├── /pages
│   │   ├── CockpitPage.tsx         # Dashboard placeholder
│   │   └── PlaceholderPage.tsx     # Generic module placeholder
│   ├── App.tsx                     # RouterProvider + UserProvider
│   └── routes.ts                   # Route configuration
└── /styles
    └── theme.css                   # Design system tokens
```

## How It Works

### User Role Switching
1. Click "Switch User" in the top-right header
2. Select any role from the dropdown
3. App automatically redirects to the appropriate shell:
   - Internal roles → `/cockpit` (Internal App)
   - Portal roles → `/portal` (Portal Shell)

### Navigation
- Click any sidebar item to navigate between modules
- All routes are clickable and working
- Active state highlights the current page
- Sidebar can be collapsed/expanded

### Adding New Module Screens
When you're ready to build detailed module screens:

1. Create a new page component in `/src/app/pages/`
2. Replace the PlaceholderPage in `/src/app/routes.ts`
3. The page will inherit the shell layout automatically

Example:
```tsx
// /src/app/pages/ProjectsDetailPage.tsx
import { PageHeader } from '@/app/components/PageHeader';

export const ProjectsDetailPage = () => {
  return (
    <div>
      <PageHeader title="Projects" />
      <div className="p-8">
        {/* Your detailed implementation */}
      </div>
    </div>
  );
};
```

## Design Principles Applied

### Enterprise SaaS Style
- **Clean**: Minimal clutter, focus on content
- **Calm**: Neutral color palette with subtle accents
- **Dense but readable**: Efficient use of space without cramping
- **Strong hierarchy**: Clear visual structure with typography

### Responsive Design
- 1440x900 desktop-first
- Sidebar collapses for space efficiency
- Header adapts to screen size
- All components use Tailwind responsive classes

### Consistency
- Reusable component patterns
- Unified spacing scale
- Consistent interaction patterns
- Shared design tokens

## Next Steps

This foundation is ready for detailed module implementation:

1. **Cockpit Dashboard**: Real-time metrics, KPIs, alerts
2. **Work Module**: Task management, assignments
3. **Communication**: Messaging, notifications
4. **Recruitment**: Candidate pipeline, job postings
5. **Projects**: Project tracking, timelines
6. **People**: Employee directory, org chart
7. **Sales**: CRM, deals pipeline
8. **Finance**: Invoicing, expenses
9. **Knowledge**: Documentation, wiki
10. **Forms**: Dynamic form builder
11. **Analytics**: Business intelligence
12. **Portals**: Portal configuration
13. **Settings**: System admin

Each module can be built independently while maintaining the cohesive foundation.

## Technologies Used

- **React 18** with TypeScript
- **React Router 7** (Data Mode)
- **Tailwind CSS v4** for styling
- **Radix UI** components (via shadcn/ui)
- **Lucide React** for icons
- **Context API** for state management
