# Bonsai UI Kit

A comprehensive, production-ready UI component library inspired by the HelloBonsai app aesthetic. Built with React, TypeScript, and Tailwind CSS.

## Design Principles

- **Clean & Minimal**: Warm neutral color palette with lots of whitespace
- **Professional**: Friendly but polished interface elements
- **Accessible**: Proper focus states and semantic HTML
- **Consistent**: Unified design tokens across all components
- **Responsive**: Mobile-first approach with desktop optimization

## Color Palette

```css
Primary (Teal): #00b894
Background: #fafaf9
Foreground: #292524
Border: #e7e5e4
Destructive: #ef4444
```

## Typography

- **Font Family**: Inter (weights: 400, 500, 600, 700)
- **Base Size**: 16px
- **Scale**: text-xs (12px), text-sm (14px), text-base (16px), text-lg (18px), text-xl (20px), text-2xl (24px)

## Components

### Layout Components

#### BonsaiSidebar
Navigation sidebar with collapsible functionality, icons, and active states.

```tsx
<BonsaiSidebar 
  collapsed={false}
  onToggleCollapse={() => {}}
/>
```

#### BonsaiTopBar
Top navigation bar with search, create button, and profile menu.

```tsx
<BonsaiTopBar />
```

#### BonsaiPageHeader
Page title with optional subtitle and action buttons.

```tsx
<BonsaiPageHeader
  title="Dashboard"
  subtitle="Welcome back, John"
  actions={<BonsaiButton>Action</BonsaiButton>}
/>
```

### Buttons

Multiple variants: primary, secondary, ghost, outline, destructive.

```tsx
<BonsaiButton variant="primary" size="md" icon={<Plus />}>
  Create New
</BonsaiButton>
```

### Form Fields

Complete form components with labels, errors, and helper text.

```tsx
<BonsaiInput 
  label="Email"
  placeholder="email@example.com"
  error="Invalid email"
/>

<BonsaiTextarea 
  label="Description"
  rows={4}
/>

<BonsaiSelect
  label="Status"
  options={[
    { value: 'active', label: 'Active' },
    { value: 'draft', label: 'Draft' }
  ]}
/>

<BonsaiCheckbox label="I agree to terms" />
```

### Data Display

#### BonsaiTable
Feature-rich table with search, filters, sorting, pagination, and column chooser.

```tsx
<BonsaiTable
  columns={[
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true }
  ]}
  data={users}
  onRowClick={(row) => console.log(row)}
  searchable
  filterable
  pagination
/>
```

#### BonsaiKanban
Kanban board with draggable cards (drag functionality can be added with react-dnd).

```tsx
<BonsaiKanban
  columns={[
    {
      id: 'todo',
      title: 'To Do',
      count: 5,
      cards: [...]
    }
  ]}
  onCardClick={(card) => {}}
/>
```

#### BonsaiGridCards
Responsive card grid (2, 3, or 4 columns).

```tsx
<BonsaiGridCards
  columns={3}
  cards={[
    {
      id: '1',
      title: 'Project Alpha',
      subtitle: 'Web Development',
      status: 'Active',
      meta: ['5 tasks', 'Due Jan 15']
    }
  ]}
/>
```

#### BonsaiTimeline
Activity feed / timeline component.

```tsx
<BonsaiTimeline
  items={[
    {
      id: '1',
      title: 'Project created',
      description: 'New project initialized',
      timestamp: '2 hours ago',
      user: { name: 'John Doe' }
    }
  ]}
/>
```

### Status & Feedback

#### BonsaiStatusPill
Status badges with predefined color schemes.

```tsx
<BonsaiStatusPill status="active" label="Active" />
<BonsaiStatusPill status="completed" label="Completed" />
<BonsaiStatusPill status="draft" label="Draft" />
```

#### BonsaiToast
Toast notifications system with success, error, and info types.

```tsx
const toast = useBonsaiToast();

toast.success('Saved successfully!');
toast.error('Something went wrong');
toast.info('Processing...');

// Render container
<BonsaiToastContainer toasts={toast.toasts} onClose={toast.closeToast} />
```

### Modals & Overlays

#### BonsaiDrawer
Slide-in drawer from the right side.

```tsx
<BonsaiDrawer
  open={isOpen}
  onClose={() => setIsOpen(false)}
  title="Edit Project"
  width="lg"
  footer={
    <>
      <BonsaiButton variant="ghost">Cancel</BonsaiButton>
      <BonsaiButton>Save</BonsaiButton>
    </>
  }
>
  <p>Drawer content</p>
</BonsaiDrawer>
```

#### BonsaiModal
Centered modal dialog.

```tsx
<BonsaiModal
  open={isOpen}
  onClose={() => setIsOpen(false)}
  title="Create Project"
  size="md"
  footer={<BonsaiButton>Create</BonsaiButton>}
>
  <p>Modal content</p>
</BonsaiModal>
```

#### BonsaiConfirmDialog
Confirmation dialog for destructive actions.

```tsx
<BonsaiConfirmDialog
  open={isOpen}
  onClose={() => setIsOpen(false)}
  onConfirm={handleDelete}
  title="Delete Project"
  description="Are you sure? This cannot be undone."
  variant="destructive"
/>
```

### Files

#### BonsaiFileUpload
Drag-and-drop file upload area.

```tsx
<BonsaiFileUpload
  onFilesSelected={(files) => console.log(files)}
  accept="image/*,.pdf"
  multiple
  maxSize={10}
/>
```

#### BonsaiDocumentList
List of uploaded documents with actions.

```tsx
<BonsaiDocumentList
  documents={[
    {
      id: '1',
      name: 'proposal.pdf',
      type: 'application/pdf',
      size: '2.4 MB',
      uploadedAt: 'Jan 5, 2026'
    }
  ]}
  onDownload={(doc) => {}}
  onDelete={(doc) => {}}
/>
```

### Empty States

#### BonsaiEmptyState
Generic empty state with icon, title, description, and action.

```tsx
<BonsaiEmptyState
  title="No projects yet"
  description="Get started by creating your first project"
  action={<BonsaiButton>Create Project</BonsaiButton>}
/>
```

#### BonsaiPermissionDenied
Permission denied / access restricted state.

```tsx
<BonsaiPermissionDenied
  action={<BonsaiButton variant="ghost">Go Back</BonsaiButton>}
/>
```

## Usage

Import components directly:

```tsx
import { BonsaiButton, BonsaiTable, useBonsaiToast } from './components/bonsai';
```

Or import individually:

```tsx
import { BonsaiButton } from './components/bonsai/BonsaiButton';
```

## Layout Template

Standard layout structure:

```tsx
<div className="flex h-screen">
  <BonsaiSidebar />
  
  <div className="flex-1 flex flex-col">
    <BonsaiTopBar />
    
    <main className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto p-8">
        <BonsaiPageHeader title="Dashboard" />
        {/* Page content */}
      </div>
    </main>
  </div>
</div>
```

## Customization

All components accept a `className` prop for additional styling. The design system uses CSS variables defined in `/src/styles/theme.css` for easy theming.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

---

Built with ❤️ inspired by HelloBonsai
