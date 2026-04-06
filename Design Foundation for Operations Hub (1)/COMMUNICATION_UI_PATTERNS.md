# Communication Module - UI Patterns & Visual Guide

## Color Coding System

### Channel Colors
Each communication channel has a distinct color for quick visual identification:

```
Email      → Blue (#2563eb)    ✉️  Mail icon
LinkedIn   → Dark Blue (#1d4ed8) 💬 MessageCircle icon
WhatsApp   → Green (#16a34a)    💬 MessageSquare icon
Internal   → Gray (#4b5563)     📝 StickyNote icon
```

### Entity Badge Colors
Linked entities use color-coded badges:

```
Client     → Blue background    [TechCorp Inc]
Project    → Purple background  [Q1 Implementation]
Job        → Orange background  [Senior DevOps Engineer]
Candidate  → Green background   [Marcus Thompson]
Deal       → Yellow background  [Enterprise Deal]
Contact    → Gray background    [Contact Name]
```

### Status Indicators

```
Unread           → Blue dot (●) + blue-tinted background
Awaiting Reply   → No dot, normal background
Done             → No dot, normal background
```

---

## Layout Patterns

### Main Layout: 2-Column Split

```
┌────────────────────────────────────────────────────────┐
│                   MODULE HEADER                        │
│                   [Title only]                         │
├────────────────────────────────────────────────────────┤
│                   FILTERS BAR                          │
│   [4 dropdowns] + [Clear button] + [Result badge]     │
├───────────────────┬────────────────────────────────────┤
│                   │                                    │
│   CONVERSATION    │    CONVERSATION DETAIL             │
│   LIST            │                                    │
│                   │                                    │
│   400px fixed     │    Flexible width                  │
│   Scrollable      │    Scrollable messages             │
│   Border-right    │    Action bar fixed at bottom      │
│                   │                                    │
└───────────────────┴────────────────────────────────────┘
```

### Conversation List Item Pattern

```
┌─────────────────────────────────────────────────────┐
│ [Icon] Name                              2 hrs ago  │ ← Header row
│        [●] if unread                                │
│                                                     │
│        Subject Line (email only)                    │ ← Optional
│                                                     │
│        Message snippet preview text goes here...    │ ← 2 lines max
│        truncated with ellipsis if too long          │
│                                                     │
│        [Client Badge] [Project Badge] [+2 more]     │ ← Entity badges
└─────────────────────────────────────────────────────┘
Border-bottom separator
```

### Message Bubble Pattern

**Others' messages (left-aligned):**
```
Sender Name                              Jan 26, 9:15 AM
┌──────────────────────────────────────────────────────┐
│ Message content goes here...                         │
│ Can span multiple lines                              │
│ Gray background (bg-muted)                           │
└──────────────────────────────────────────────────────┘
```

**Your messages (right-aligned):**
```
                              You        Jan 26, 10:30 AM
                    ┌──────────────────────────────────┐
                    │ Message content goes here...     │
                    │ Can span multiple lines          │
                    │ Blue background (bg-primary)     │
                    └──────────────────────────────────┘
```

---

## Component Patterns

### Filter Bar

**Default State:**
```
[All Channels ▼] [All Status ▼] [All Types ▼] [All Assignees ▼]
```

**Active State:**
```
[Email ▼] [Unread ▼] [All Types ▼] [All Assignees ▼] [× Clear Filters] | 5 of 15 conversations
```

### Action Bar

**Layout:**
```
[Manual Actions]           |    [AI Actions]           |    [Creation Actions]
[Reply] [Link to Record]   |    [✨ AI Draft]          |    [+ Create Task]
                           |    [📄 Summarize]         |    [+ Create Issue]
```

**Visual Separators:**
- Vertical separator (|) between action groups
- AI actions have purple accent (border-purple-200)
- Manual actions are primary/outline style
- Creation actions use outline style with + icon

---

## Interactive States

### Hover States

**List Item Hover:**
```
Background: bg-accent/50 (light gray overlay)
Cursor: pointer
Transition: smooth fade
```

**Selected List Item:**
```
Background: bg-accent (persistent)
Border: none (already in list)
```

**Unread List Item:**
```
Background: bg-blue-50/50 (subtle blue tint)
Blue dot indicator
Bolder text weight on name/subject
```

### Button States

**Primary Button (Reply, Send):**
```
Default:  bg-primary, text-primary-foreground
Hover:    Slightly darker
Disabled: Opacity reduced, cursor not-allowed
```

**AI Button (AI Draft, Summarize):**
```
Default:  border-purple-200, bg-white
Hover:    bg-purple-50
Icon:     text-purple-600 (Sparkles)
```

**Outline Button (Others):**
```
Default:  border-gray, bg-white
Hover:    bg-accent
```

---

## Loading & Feedback States

### AI Draft Generation

**Phase 1: Generating (1.5s)**
```
┌─────────────────────────────────────────────────────┐
│ ✨ AI Draft Reply         Generating... (pulsing)  │
├─────────────────────────────────────────────────────┤
│ [Textarea - disabled, empty or with placeholder]    │
│                                                     │
└─────────────────────────────────────────────────────┘
Buttons: All disabled
Textarea: Disabled
Text: Animated pulse
```

**Phase 2: Ready**
```
┌─────────────────────────────────────────────────────┐
│ ✨ AI Draft Reply                              [×] │
├─────────────────────────────────────────────────────┤
│ [Textarea - enabled, with generated text]           │
│ Hi Sarah,                                           │
│ Thank you for your email...                         │
│                                                     │
└─────────────────────────────────────────────────────┘
[🔄 Regenerate] [➖ Shorten] [💼 Formal] [📅 Avail.]
[Discard] [Save as Draft] [Send]
```

### AI Summary Display

**Inline Banner (auto-dismiss after 3s):**
```
┌──────────────────────────────────────────────────────┐
│ ✨ AI Summary                                        │
│ This conversation discusses q1 contract review with  │
│ Sarah Chen. There are 2 messages exchanged. Related  │
│ to: TechCorp Inc, Q1 Implementation.                 │
└──────────────────────────────────────────────────────┘
Background: bg-blue-50, border-blue-200
Icon: Sparkles (text-blue-600)
Auto-dismiss: Fade out after 3 seconds
```

### Toast Notifications

**Success (Task Created):**
```
✓ Task created successfully
```

**Success (Reply Sent):**
```
✓ Reply sent successfully
```

**Info (Issue Creation - Future):**
```
ℹ Issue creation modal would open here
```

**Style:**
- Position: Bottom-right
- Duration: 3 seconds
- Dismissable: Yes (X button)
- Animation: Slide in from bottom

---

## Spacing Standards

### Conversation List
```
Item padding:       p-4
Border:             border-b
Gap (icon-content): gap-3
Badge gap:          gap-1
```

### Conversation Detail
```
Header padding:     p-6
Message padding:    p-6
Message bubble:     p-4
Action bar padding: p-4
Message gap:        space-y-6
```

### Filters Bar
```
Container padding:  px-8 py-4
Filter gap:         gap-2
```

### AI Draft Panel
```
Container padding:  p-4
Button gap:         gap-2
Textarea height:    min-h-[200px]
```

### Create Task Modal
```
Content padding:    py-4 (internal)
Field gap:          space-y-4
Grid columns:       2 (for priority/date)
```

---

## Typography Patterns

### Conversation List
```
Contact name:     font-medium, text-base
Subject:          text-sm, font-medium (email only)
Snippet:          text-sm, text-muted-foreground, line-clamp-2
Timestamp:        text-xs, text-muted-foreground
Badge text:       text-xs
```

### Conversation Detail
```
Header name:      text-xl, font-semibold
Header subject:   text-sm, text-muted-foreground
Sender name:      text-sm, font-medium
Message content:  text-sm, whitespace-pre-wrap
Timestamp:        text-xs, text-muted-foreground
```

### AI Draft Panel
```
Header:           text-sm, font-medium
Draft text:       text-sm (in textarea)
Button text:      text-xs
Status text:      text-xs, text-muted-foreground
```

---

## Icon Usage

### Channel Icons (lucide-react)
```
Mail             - Email
MessageCircle    - LinkedIn
MessageSquare    - WhatsApp
StickyNote       - Internal
```

### Action Icons
```
Sparkles         - AI features
FileText         - Summarize
RefreshCw        - Regenerate
Minus            - Shorten
Briefcase        - Make Formal
Calendar         - Insert Availability
Plus             - Create actions
Link             - Link to Record
X                - Close/Clear
```

### Icon Sizes
```
Channel icons:   h-4 w-4
Action icons:    h-4 w-4 (with mr-2 for spacing)
Empty state:     h-6 w-6
```

---

## Responsive Breakpoints (Future)

### Desktop (Current - Default)
```
min-width: 1024px
Layout: 2-column (400px + flex)
Filters: Full row
```

### Tablet (Future)
```
min-width: 768px, max-width: 1023px
Layout: Collapsible left panel
List: Overlay on selection
Filters: Compact (2 per row)
```

### Mobile (Future)
```
max-width: 767px
Layout: Stack (list OR detail)
List: Full width
Detail: Full screen with back button
Filters: Dropdown menu (1 column)
```

---

## Accessibility Patterns

### Keyboard Navigation (Future)
```
Tab          - Navigate between filters/actions
Enter        - Select/activate
Escape       - Close modals/panels
Arrow keys   - Navigate list (future)
```

### Screen Reader Labels
```
Conversations: "X unread conversations"
Filters: "Filter by channel/status/entity/assignee"
Actions: "Reply to conversation", "Generate AI draft"
Entity badges: "Linked to [Entity Name]"
```

### Focus States
```
Visible focus ring on all interactive elements
Skip to content link (future)
Logical tab order
```

---

## Error States (Future)

### API Error
```
┌──────────────────────────────────────────────┐
│ ⚠️ Failed to load conversations              │
│ Please try again or contact support.         │
│ [Retry]                                      │
└──────────────────────────────────────────────┘
```

### Send Failure
```
Toast: ✗ Failed to send message. Please try again.
Draft preserved in panel
Retry option available
```

---

## Animation Patterns

### Transitions
```
List item hover:      150ms ease-in-out
Filter change:        Instant (data update)
Modal open/close:     200ms fade + scale
Panel slide:          300ms ease-out
Toast slide:          200ms ease-in-out
```

### Loading States
```
AI generation:        Pulse animation on text
Infinite spinner:     Rotate 360deg, 1s linear infinite
Skeleton loading:     Shimmer effect (future)
```

---

## Z-Index Layers

```
Base content:         z-0
Conversation list:    z-0
Conversation detail:  z-0
Filters bar:          z-10
AI Draft panel:       z-10
Modal overlay:        z-50
Modal content:        z-50
Toast notifications:  z-100
```

---

## Summary

These UI patterns ensure:
✅ **Visual Consistency** - Same patterns used throughout
✅ **Clear Hierarchy** - Information organized logically
✅ **Quick Scanning** - Color codes and icons aid recognition
✅ **Smooth Interactions** - Transitions and feedback states
✅ **Accessible** - Keyboard and screen reader support
✅ **Scalable** - Easy to extend with new features

All patterns follow the established design system and maintain enterprise-grade quality while remaining calm and readable.
