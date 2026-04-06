# Module Header Standard - Locked Structure

## Overview

All internal modules (Cockpit, Work, Communication, Recruitment, Projects, People, Sales, Finance, Knowledge, Forms, Analytics, Portals, Settings) now use a **standardized Module Header structure** to ensure visual consistency across the entire application.

## The ModuleHeader Component

**Location:** `/src/app/components/ModuleHeader.tsx`

This is the single source of truth for all module headers in the application.

## Module Header Structure (LOCKED)

Every module header follows this exact order and spacing:

```
┌─────────────────────────────────────────────────────────┐
│ 1. Breadcrumb Row (optional)                            │
│    Home > Module Name                                   │
├─────────────────────────────────────────────────────────┤
│ 2. Module Title (H1)                                    │
│    Example: "Cockpit" or "Work"                         │
│                                                          │
│ 3. Module Description (optional, one line, muted)       │
│    Example: "Manage tasks, requests, issues..."         │
├─────────────────────────────────────────────────────────┤
│ 4. Module-Level Tabs (if applicable)                    │
│    ┌──────────┬──────────┬──────────┬──────────┐       │
│    │ My Work  │ AI Inbox │ Calendar │ Quick... │       │
│    └──────────┴──────────┴──────────┴──────────┘       │
├─────────────────────────────────────────────────────────┤
│ 5. Controls Row (optional)                              │
│    [Filters...]              [View Toggles] [Actions]   │
└─────────────────────────────────────────────────────────┘
```

## Spacing Rules (STRICT)

### Vertical Spacing:
- **Breadcrumbs to Title**: 2 units (pt-2)
- **Title to Tabs**: 4 units (pb-4)
- **Tabs to Content**: 6 units (py-6 on content container)
- **No breadcrumbs**: 8 units top padding (pt-8)

### Horizontal Spacing:
- All elements: 8 units left/right (px-8)
- Content container: px-8 py-6

## Usage Examples

### 1. Simple Module (No Tabs)

```tsx
import { ModuleHeader } from '@/app/components/ModuleHeader';

export const CommunicationPage = () => {
  return (
    <div>
      <ModuleHeader
        title="Communication"
        description="Manage messages, emails, and notifications"
      />
      <div className="px-8 py-6">
        {/* Module content */}
      </div>
    </div>
  );
};
```

### 2. Module with Tabs (Like Cockpit)

```tsx
import { ModuleHeader, ModuleTab } from '@/app/components/ModuleHeader';
import { ListTodo, Sparkles, Calendar, Zap } from 'lucide-react';

const tabs: ModuleTab[] = [
  { id: 'my-work', label: 'My Work', icon: ListTodo },
  { id: 'ai-inbox', label: 'AI Inbox', icon: Sparkles },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'quick-capture', label: 'Quick Capture', icon: Zap },
];

export const CockpitPage = () => {
  const [activeTab, setActiveTab] = useState('my-work');

  return (
    <div>
      <ModuleHeader
        title="Cockpit"
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      <div className="px-8 py-6">
        {/* Tab content */}
      </div>
    </div>
  );
};
```

### 3. Module with Tabs and Description (Like Work)

```tsx
import { ModuleHeader, ModuleTab } from '@/app/components/ModuleHeader';

const workTabs: ModuleTab[] = [
  { id: 'tasks', label: 'Tasks' },
  { id: 'requests', label: 'Requests' },
  { id: 'issues', label: 'Issues' },
  { id: 'approvals', label: 'Approvals' },
];

export const WorkPage = () => {
  const [activeTab, setActiveTab] = useState('tasks');

  return (
    <div>
      <ModuleHeader
        title="Work"
        description="Manage tasks, requests, issues, and approvals across all projects"
        tabs={workTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      <div className="px-8 py-6">
        {/* Tab content */}
      </div>
    </div>
  );
};
```

### 4. Module with Breadcrumbs

```tsx
export const SettingsPage = () => {
  return (
    <div>
      <ModuleHeader
        title="Settings"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Settings' }
        ]}
        description="Configure your workspace preferences"
      />
      <div className="px-8 py-6">
        {/* Settings content */}
      </div>
    </div>
  );
};
```

### 5. Placeholder Module

```tsx
export const PlaceholderPage = ({ title, description }) => {
  return (
    <div>
      <ModuleHeader
        title={title}
        description={description}
      />
      <div className="px-8 py-6">
        <EmptyState
          title={`${title} Module Coming Soon`}
          description="Module screen implementation will be added next."
        />
      </div>
    </div>
  );
};
```

## Tab-Specific Filters

**IMPORTANT:** Tab-specific filters and actions (like in TasksTab) should remain INSIDE the tab component, not in the ModuleHeader.

The ModuleHeader `filtersLeft` and `actionsRight` props are for **module-level** controls that apply to ALL tabs or are module-wide actions.

Example of tab-specific filters (correct):

```tsx
// TasksTab.tsx
export const TasksTab = () => {
  return (
    <div>
      {/* These filters are specific to Tasks tab */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Select>...</Select> {/* Assignee filter */}
          <Select>...</Select> {/* Priority filter */}
          <Select>...</Select> {/* Status filter */}
        </div>
        <div className="flex items-center gap-2">
          <Button>List</Button>
          <Button>Kanban</Button>
          <Button>New Task</Button>
        </div>
      </div>
      
      {/* Task list */}
    </div>
  );
};
```

## Module Header Props

```typescript
interface ModuleHeaderProps {
  // Required
  title: string;
  
  // Optional
  breadcrumbs?: Breadcrumb[];      // Home > Module Name
  description?: string;             // One-line description
  
  // Tabs (module-level navigation)
  tabs?: ModuleTab[];              // Array of tabs
  activeTab?: string;              // Currently active tab ID
  onTabChange?: (tabId: string) => void;
  
  // Controls row (appears below tabs)
  filtersLeft?: ReactNode;         // Left-aligned filters (module-level)
  actionsRight?: ReactNode;        // Right-aligned actions (module-level)
}
```

## Standardized Spacing

All modules MUST use this exact structure:

```tsx
<div>
  <ModuleHeader {...props} />
  <div className="px-8 py-6">
    {/* Content */}
  </div>
</div>
```

**Never:**
- Wrap the entire module in a padding container
- Add custom padding to ModuleHeader
- Use different spacing values
- Create custom header structures

## Benefits

✅ **Visual Consistency**: All modules look and feel the same
✅ **Predictable UX**: Users know exactly where to find things
✅ **Easy Maintenance**: One component to update
✅ **Future-Proof**: New modules automatically stay consistent
✅ **Developer Efficiency**: Copy-paste the same pattern everywhere

## Migration Checklist

When updating a module to use ModuleHeader:

- [ ] Remove old `PageHeader` import
- [ ] Import `ModuleHeader` and optionally `ModuleTab`
- [ ] Remove outer padding wrapper (`p-8` or similar)
- [ ] Add `px-8 py-6` to content container
- [ ] Define tabs array if module has tabs
- [ ] Add state for `activeTab` if using tabs
- [ ] Ensure breadcrumbs follow the format (optional)
- [ ] Move module-wide filters to `filtersLeft` (if any)
- [ ] Move module-wide actions to `actionsRight` (if any)
- [ ] Keep tab-specific filters INSIDE tab components

## Current Implementation Status

✅ **Cockpit** - Using ModuleHeader with tabs and icons
✅ **Work** - Using ModuleHeader with tabs and description
✅ **PlaceholderPage** - Template for all placeholder modules
✅ All 11 placeholder modules (Communication, Recruitment, etc.)

## Future Modules

All future modules MUST use ModuleHeader. No exceptions.

If you need a custom layout that doesn't fit this pattern, discuss with the team first. The goal is 100% consistency across all modules.
