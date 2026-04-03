# Operations Hub - App Shell & Templates

## Overview

The Operations Hub is a comprehensive internal application shell with 10 core modules and 7 reusable page templates built using the Bonsai-style UI kit.

## Navigation Structure

### Sidebar Modules

1. **Dashboard** - Overview and key metrics
2. **Sales** - Manage deals and opportunities
3. **Contacts** - Business contact management
4. **Clients** - Client relationship management
5. **Projects** - Project tracking and management
6. **Talent** - Freelancer and contractor management
7. **People** - Team member management
8. **Finance** - Financial management and reporting
9. **Support** - Customer support and ticketing
10. **Admin** - System administration

## Page Templates

### T-01: List Page Template

**Purpose**: Display data in tabular format with advanced features

**Key Features**:
- ✅ Row selection checkboxes (select all / individual)
- ✅ Bulk actions toolbar (appears when items selected)
  - Email selected
  - Tag selected
  - Export selected
  - Delete selected
- ✅ Column chooser (show/hide columns)
- ✅ Search functionality
- ✅ Filters
- ✅ Sortable columns
- ✅ Pagination
- ✅ Stats cards at top

**Use Cases**: Contacts, Clients, People, Finance records

---

### T-02: Kanban Page Template

**Purpose**: Visualize workflow with drag-and-drop cards across columns

**Key Features**:
- Multiple status columns
- Card previews with key info
- Assignee avatars
- Tags/labels
- Due dates
- Add card button per column
- Column counts
- Stats cards at top

**Use Cases**: Sales pipeline, Project tasks, Support tickets

---

### T-03: Grid Page Template

**Purpose**: Display items in a responsive card grid layout

**Key Features**:
- 3-column responsive grid
- Card previews with images (optional)
- Status pills
- Metadata display
- Search and filter dropdowns
- View toggle (Grid/List)
- Stats cards at top

**Use Cases**: Projects overview, Talent directory, Dashboard widgets

---

### T-04: Detail Page Template

**Purpose**: Full record detail view with comprehensive information

**Key Features**:
- ✅ **AI Assistant Side Panel** (collapsible)
  - Quick action suggestions
  - Chat interface
  - Context-aware help
- Tabbed interface:
  - **Overview**: Key details, description, related items
  - **Activity**: Timeline of changes and actions
  - **Documents**: File management
  - **Module-specific tabs**: Customizable per module
- Action buttons: Edit, Delete, Share, Favorite
- Status display
- Related records section

**Use Cases**: Individual client, project, contact, ticket details

---

### T-05: Client Portal Shell

**Purpose**: External-facing portal for clients to access their data

**Key Features**:
- Blue gradient branding
- Simplified navigation:
  - Dashboard
  - Projects (with badge count)
  - Invoices
  - Messages (with badge count)
  - Settings
- Welcome banner
- Stats overview
- Recent activity feed
- User profile section
- Responsive mobile menu

**Use Cases**: Client self-service, project collaboration

---

### T-06: Employee Portal Shell

**Purpose**: Internal portal for employees to manage their work

**Key Features**:
- Green gradient branding
- Employee-specific navigation:
  - Dashboard
  - Time Tracking
  - Expenses
  - Team Chat (with badge count)
  - Profile
- Personal stats
- Task overview
- Team activity feed

**Use Cases**: Employee time tracking, expense submission, team communication

---

### T-07: Freelancer Portal Shell

**Purpose**: Portal for freelancers to manage their projects and payments

**Key Features**:
- Purple/pink gradient branding
- Freelancer-specific navigation:
  - Dashboard
  - My Projects (with badge count)
  - Payments
  - Messages (with badge count)
  - Settings
- Payment tracking
- Project status overview
- Communication hub

**Use Cases**: Freelancer onboarding, project management, payment tracking

---

## Global UI Patterns

### Bulk Actions Toolbar

Appears when one or more rows are selected in list views:
- Floating toolbar with primary color background
- Shows selection count
- Quick access to bulk operations
- Clear selection button

### Column Chooser

Available in all table views:
- Dropdown menu with checkboxes
- Show/hide individual columns
- Persists selections
- Accessible via "Columns" button in table toolbar

### AI Assistant Panel

Available in detail pages:
- Collapsible side panel (280px width)
- Collapses to floating button when hidden
- Quick action buttons
- Chat interface
- Context-aware suggestions

### Stats Cards

Standard 4-column grid at top of pages:
- White background with subtle border
- Label (text-sm, stone-600)
- Value (text-2xl, font-semibold, stone-800)
- Optional trend indicator

---

## Component Architecture

### Core Components
- `OperationsHubSidebar` - Main navigation sidebar
- `BonsaiTopBar` - Top navigation bar
- `EnhancedTable` - Table with row selection and bulk actions
- `BulkActionsToolbar` - Bulk action controls
- `AIAssistantPanel` - AI helper side panel

### Template Components
- `T01ListPage` - List template
- `T02KanbanPage` - Kanban template
- `T03GridPage` - Grid template
- `T04DetailPage` - Detail template
- `T05ClientPortal` - Client portal
- `T06EmployeePortal` - Employee portal
- `T07FreelancerPortal` - Freelancer portal

---

## Usage Examples

### Switching Templates

The Operations Hub includes a template switcher in the top bar:

```tsx
// Templates are switchable per module
- T-01 List: Table view with bulk actions
- T-02 Kanban: Board view with columns
- T-03 Grid: Card grid view
- T-04 Detail: Full record detail
- T-05 Client Portal: External client view
- T-06 Employee Portal: Internal employee view
- T-07 Freelancer Portal: Freelancer view
```

### Module Navigation

Click any sidebar item to switch modules. Each module defaults to its optimal template:
- Dashboard → Grid
- Sales → Kanban
- Contacts → List
- Projects → Kanban
- Talent → Grid
- etc.

### AI Assistant

On detail pages, click the sparkle icon to open/close the AI Assistant panel. It provides:
- Record summarization
- Insight generation
- Email drafting
- Context-aware Q&A

---

## Design Tokens

Consistent with Bonsai UI Kit:
- Primary: #00b894 (Teal)
- Border: #e7e5e4 (Stone)
- Background: #fafaf9 (Stone 50)
- Radius: 0.5rem
- Font: Inter

---

## Accessibility

- Keyboard navigation support
- Focus states on all interactive elements
- Semantic HTML structure
- ARIA labels where appropriate
- Color contrast compliant

---

## Responsive Behavior

- Sidebar collapses on mobile
- Tables scroll horizontally on small screens
- Grid cards stack to 1 column on mobile
- Portal shells include mobile hamburger menu
- Stats cards stack vertically on mobile

---

Built with React, TypeScript, and Tailwind CSS v4
