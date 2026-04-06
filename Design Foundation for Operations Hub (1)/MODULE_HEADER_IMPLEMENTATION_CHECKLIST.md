# Module Header Implementation Checklist

Use this checklist when creating or updating any internal module to ensure it follows the locked standard.

## ✅ Implementation Checklist

### 1. Component Structure
- [ ] Module does NOT use `PageHeader` component
- [ ] Module uses `ModuleHeader` component
- [ ] Import statement: `import { ModuleHeader } from '@/app/components/ModuleHeader'`
- [ ] If using tabs, also import: `import { ModuleTab } from '@/app/components/ModuleHeader'`

### 2. Module Wrapper
- [ ] Root element is a plain `<div>` with no padding
- [ ] No `p-8` or similar padding on the root div
- [ ] Structure is:
  ```tsx
  <div>
    <ModuleHeader {...} />
    <div className="px-8 py-6">
      {/* content */}
    </div>
  </div>
  ```

### 3. ModuleHeader Props
- [ ] `title` prop is provided (required)
- [ ] `description` prop is provided (optional, but recommended)
- [ ] `breadcrumbs` follow format: `[{ label: 'Home', href: '/' }, { label: 'Module' }]` (optional)
- [ ] If module has tabs, `tabs` array is defined
- [ ] If using tabs, `activeTab` state is managed
- [ ] If using tabs, `onTabChange` handler is provided

### 4. Content Container
- [ ] Content is wrapped in `<div className="px-8 py-6">`
- [ ] No other padding is applied
- [ ] No `p-8` wrapper around the entire module
- [ ] Content padding is EXACTLY `px-8 py-6` (not `p-8`, not `px-6 py-8`, etc.)

### 5. Tab Configuration (if applicable)
- [ ] Tabs array uses `ModuleTab` type
- [ ] Each tab has `id` and `label`
- [ ] Icons are optional but recommended for visual clarity
- [ ] Tab IDs match the state type
- [ ] Example:
  ```tsx
  const tabs: ModuleTab[] = [
    { id: 'tab1', label: 'Tab 1', icon: IconComponent },
    { id: 'tab2', label: 'Tab 2' },
  ];
  ```

### 6. State Management (for tabs)
- [ ] Active tab state is declared: `const [activeTab, setActiveTab] = useState('tab1')`
- [ ] State type matches tab IDs
- [ ] `onTabChange` is connected: `onTabChange={setActiveTab}`
- [ ] Tab content renders based on `activeTab` state

### 7. Spacing & Layout
- [ ] No custom margin/padding on ModuleHeader
- [ ] Content starts with `px-8 py-6`
- [ ] No duplicate spacing
- [ ] No wrapper divs with padding

### 8. Code Quality
- [ ] No unused imports
- [ ] No console.log statements
- [ ] TypeScript types are correct
- [ ] No linting errors

## 🎯 Quick Reference Templates

### Template 1: Simple Module (No Tabs)
```tsx
import { ModuleHeader } from '@/app/components/ModuleHeader';

export const MyModulePage = () => {
  return (
    <div>
      <ModuleHeader
        title="My Module"
        description="Brief description of what this module does"
      />
      <div className="px-8 py-6">
        {/* Your content here */}
      </div>
    </div>
  );
};
```

### Template 2: Module with Tabs
```tsx
import { useState } from 'react';
import { ModuleHeader, ModuleTab } from '@/app/components/ModuleHeader';
import { Icon1, Icon2 } from 'lucide-react';

type TabId = 'tab1' | 'tab2';

const tabs: ModuleTab[] = [
  { id: 'tab1', label: 'Tab 1', icon: Icon1 },
  { id: 'tab2', label: 'Tab 2', icon: Icon2 },
];

export const MyModulePage = () => {
  const [activeTab, setActiveTab] = useState<TabId>('tab1');

  return (
    <div>
      <ModuleHeader
        title="My Module"
        description="Brief description"
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      <div className="px-8 py-6">
        {activeTab === 'tab1' && <Tab1Content />}
        {activeTab === 'tab2' && <Tab2Content />}
      </div>
    </div>
  );
};
```

### Template 3: Module with Breadcrumbs
```tsx
import { ModuleHeader } from '@/app/components/ModuleHeader';

export const MyModulePage = () => {
  return (
    <div>
      <ModuleHeader
        title="My Module"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'My Module' }
        ]}
        description="Brief description"
      />
      <div className="px-8 py-6">
        {/* Your content here */}
      </div>
    </div>
  );
};
```

### Template 4: Placeholder Module
```tsx
import { ModuleHeader } from '@/app/components/ModuleHeader';
import { EmptyState } from '@/app/components/EmptyState';

export const PlaceholderPage = ({ title, description, icon }) => {
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
          icon={icon}
        />
      </div>
    </div>
  );
};
```

## ❌ Common Mistakes to Avoid

### 1. Wrapping Everything in p-8
```tsx
// ❌ WRONG
<div className="p-8">
  <ModuleHeader title="Module" />
  <div>Content</div>
</div>

// ✅ CORRECT
<div>
  <ModuleHeader title="Module" />
  <div className="px-8 py-6">Content</div>
</div>
```

### 2. Using PageHeader Instead
```tsx
// ❌ WRONG
import { PageHeader } from '@/app/components/PageHeader';
<PageHeader title="Module" />

// ✅ CORRECT
import { ModuleHeader } from '@/app/components/ModuleHeader';
<ModuleHeader title="Module" />
```

### 3. Custom Tab Implementation
```tsx
// ❌ WRONG
import { Tabs, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
<Tabs>
  <TabsList>
    <TabsTrigger>Tab 1</TabsTrigger>
  </TabsList>
</Tabs>

// ✅ CORRECT
import { ModuleHeader, ModuleTab } from '@/app/components/ModuleHeader';
const tabs: ModuleTab[] = [{ id: 'tab1', label: 'Tab 1' }];
<ModuleHeader tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
```

### 4. Wrong Padding Values
```tsx
// ❌ WRONG
<div className="p-8">Content</div>
<div className="px-6 py-8">Content</div>
<div className="px-8 py-8">Content</div>

// ✅ CORRECT
<div className="px-8 py-6">Content</div>
```

### 5. Missing Content Wrapper
```tsx
// ❌ WRONG
<div>
  <ModuleHeader title="Module" />
  <MyComponent /> {/* No padding wrapper */}
</div>

// ✅ CORRECT
<div>
  <ModuleHeader title="Module" />
  <div className="px-8 py-6">
    <MyComponent />
  </div>
</div>
```

## 🔍 Review Checklist

Before submitting a PR with a new/updated module:

- [ ] Run `npm run build` - no errors
- [ ] Run `npm run lint` - no warnings
- [ ] Visual check: Header looks identical to Cockpit/Work
- [ ] Visual check: Spacing matches other modules
- [ ] Tab navigation works smoothly (if applicable)
- [ ] No console errors in browser
- [ ] Responsive on mobile (header adapts)
- [ ] Code follows the template exactly
- [ ] No custom header implementations

## 📋 Existing Module Status

| Module         | Status | Uses ModuleHeader | Tabs | Description |
|----------------|--------|-------------------|------|-------------|
| Cockpit        | ✅     | Yes               | 4    | No          |
| Work           | ✅     | Yes               | 4    | Yes         |
| Communication  | ✅     | Yes               | 0    | Optional    |
| Recruitment    | ✅     | Yes               | 0    | Optional    |
| Projects       | ✅     | Yes               | 0    | Optional    |
| People         | ✅     | Yes               | 0    | Optional    |
| Sales          | ✅     | Yes               | 0    | Optional    |
| Finance        | ✅     | Yes               | 0    | Optional    |
| Knowledge      | ✅     | Yes               | 0    | Optional    |
| Forms          | ✅     | Yes               | 0    | Optional    |
| Analytics      | ✅     | Yes               | 0    | Optional    |
| Portals        | ✅     | Yes               | 0    | Optional    |
| Settings       | ✅     | Yes               | 0    | Optional    |

**All modules are now standardized!** ✅

## 🎓 Learning Resources

- Read: `/MODULE_HEADER_STANDARD.md` for complete documentation
- Read: `/MODULE_HEADER_NORMALIZATION_SUMMARY.md` for implementation details
- Read: `/VISUAL_STRUCTURE_COMPARISON.md` for before/after comparison
- Reference: `/src/app/components/ModuleHeader.tsx` for component source
- Examples: `/src/app/pages/CockpitPage.tsx` and `/src/app/pages/work/WorkPage.tsx`

## 🚀 Next Steps

When creating a new module:

1. Copy one of the templates above
2. Replace the module name
3. Add your content
4. Test visually
5. Run through this checklist
6. Submit PR

**That's it!** The structure is locked and proven.
