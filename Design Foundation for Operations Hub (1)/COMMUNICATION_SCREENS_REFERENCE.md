# Communication Module - Screen Reference Guide

## Quick Navigation

All screens are accessible from the Internal App Shell → Communication menu item.

## Screen Breakdown

### SCREEN 1: Communication Inbox (Default View)

**Route:** `/communication`

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ [Module Header]                                             │
│ Communication                                               │
├─────────────────────────────────────────────────────────────┤
│ [Filters Bar]                                               │
│ [Channel ▼] [Status ▼] [Entity ▼] [Assignee ▼]            │
├───────────────────┬─────────────────────────────────────────┤
│ CONVERSATION LIST │ CONVERSATION DETAIL                     │
│ (400px)           │                                         │
│                   │ [Header]                                │
│ ● Sarah Chen      │ Sarah Chen | Email                      │
│   Q1 Contract...  │ [Client] [Project] [Deal]              │
│   Client badges   │                                         │
│   2 hours ago     │ [Messages]                              │
│                   │ Hi team, I wanted to follow up...       │
│   Marcus Thompson │                                         │
│   Hey! I saw...   │ Thanks for reaching out...              │
│   2 hours ago     │                                         │
│                   │ [Action Bar]                            │
│   ... (13 more)   │ [Reply] [Link] | [AI Draft] [Summarize]│
└───────────────────┴─────────────────────────────────────────┘
```

**Features:**
- 15 conversations total
- 5 unread (blue dot + background)
- First conversation auto-selected
- Scrollable left panel
- Channel icons visible
- Entity badges color-coded
- Relative timestamps

**User Actions:**
- Click conversation → View details
- Click filters → Apply filters
- Click AI Draft → Open AI panel
- Click Create Task → Open modal

---

### SCREEN 2: Filtered Inbox State

**Trigger:** Apply any filter (e.g., Channel: Email, Status: Unread)

**Changes from Default:**
```
┌─────────────────────────────────────────────────────────────┐
│ [Filters Bar]                                               │
│ [Email ▼] [Unread ▼] [All Types ▼] [All ▼] [× Clear]      │
│ "5 of 15 conversations" badge                               │
├───────────────────┬─────────────────────────────────────────┤
│ FILTERED LIST     │ DETAIL VIEW                             │
│ (Only matching)   │                                         │
│                   │                                         │
│ ● Sarah Chen      │ (Same as default)                       │
│ ● Jennifer Wu     │                                         │
│ ● Amanda Lee      │                                         │
│ ● Sophie Martin   │                                         │
│ ● Robert Foster   │                                         │
│                   │                                         │
└───────────────────┴─────────────────────────────────────────┘
```

**Features:**
- Active filters highlighted
- Clear Filters button visible
- Result count badge
- Only matching conversations shown
- Empty state if no matches

**User Actions:**
- Click Clear Filters → Return to full inbox
- Change filter → Update results live
- Click conversation → View as normal

---

### SCREEN 3: Conversation Open (Detail View)

**Trigger:** Click any conversation from list

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ [Header Section]                                            │
│ ✉️  Sarah Chen                           2 hours ago        │
│     Q1 Contract Review                                      │
│     [TechCorp Inc] [Q1 Implementation] [TechCorp Enterprise]│
├─────────────────────────────────────────────────────────────┤
│ [Messages Timeline - Scrollable]                            │
│                                                             │
│ Sarah Chen                           Jan 26, 9:15 AM        │
│ ┌─────────────────────────────────────────────────┐        │
│ │ Hi team,                                        │        │
│ │ I wanted to follow up on the contract terms...  │        │
│ │ 1. Can we extend payment terms to Net 45?      │        │
│ │ 2. What's the timeline for implementation?     │        │
│ └─────────────────────────────────────────────────┘        │
│                                                             │
│                          You            Jan 26, 10:30 AM    │
│                    ┌─────────────────────────────────────┐  │
│                    │ Hi Sarah,                           │  │
│                    │ Thanks for reaching out...          │  │
│                    │ 1. Net 45 is acceptable            │  │
│                    │ 2. Implementation in 2 weeks        │  │
│                    └─────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│ [Action Bar]                                                │
│ [Reply] [🔗 Link to Record]  |  [✨ AI Draft] [📄 Summarize]│
│                                   [+ Create Task] [+ Issue] │
└─────────────────────────────────────────────────────────────┘
```

**Visual Design:**
- Own messages: right-aligned, blue background
- Other messages: left-aligned, gray background
- Sender name + timestamp above each message
- Linked entity badges in header (color-coded)
- Channel icon + name in header
- Separator lines between messages

**User Actions:**
- Scroll to read full conversation
- Click Reply → Compose reply
- Click AI Draft → Open AI panel (Screen 4)
- Click Summarize → Show AI summary inline
- Click Create Task → Open modal (Screen 5)
- Click Create Issue → Open modal (future)
- Click Link to Record → Link to entities (future)

---

### SCREEN 4: AI Draft State

**Trigger:** Click "AI Draft" button in action bar

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ [Messages - Same as Screen 3]                               │
│ (Conversation detail view remains visible above)            │
├─────────────────────────────────────────────────────────────┤
│ [AI DRAFT PANEL - Blue tinted background]                   │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ ✨ AI Draft Reply      Generating... (animated)     [×]│   │
│ ├───────────────────────────────────────────────────────┤   │
│ │ [Textarea - Editable]                                 │   │
│ │ Hi Sarah,                                             │   │
│ │                                                       │   │
│ │ Thank you for your email regarding q1 contract       │   │
│ │ review. I've reviewed your message and wanted to     │   │
│ │ address your points:                                 │   │
│ │                                                       │   │
│ │ - I'll look into this and get back to you by EOD    │   │
│ │ - Please let me know if you need additional info    │   │
│ │                                                       │   │
│ │ Best regards                                          │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                             │
│ [AI Action Buttons]                                         │
│ [🔄 Regenerate] [➖ Shorten] [💼 Make Formal] [📅 Avail.]  │
│                                                             │
│ [Primary Actions]                                           │
│ [Discard]  [Save as Draft]  [Send]                         │
└─────────────────────────────────────────────────────────────┘
```

**Behavior:**
1. **Generation Phase** (1.5 seconds)
   - "Generating..." text with pulse animation
   - Textarea disabled
   - Buttons disabled
   - Simulates AI processing

2. **Ready Phase**
   - Draft appears in textarea
   - All buttons enabled
   - User can edit text freely

**AI Action Buttons:**
- **Regenerate:** New draft with different wording
- **Shorten:** Condense to essentials
- **Make Formal:** Professional tone
- **Insert Availability:** Add meeting times

**Primary Actions:**
- **Discard:** Close panel, lose draft
- **Save as Draft:** Keep draft for later
- **Send:** Send message (toast notification)

**User Actions:**
- Edit text directly in textarea
- Click any AI button → Transform draft
- Click Send → Success toast + close panel
- Click × or Discard → Close panel

---

### SCREEN 5: Create Task from Conversation

**Trigger:** Click "Create Task" button in action bar

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│                      [Modal Overlay]                        │
│   ┌─────────────────────────────────────────────────────┐   │
│   │ Create Task from Conversation                   [×] │   │
│   ├─────────────────────────────────────────────────────┤   │
│   │                                                     │   │
│   │ [Source Indicator - Blue background]               │   │
│   │ 💬 Source: Conversation with Sarah Chen            │   │
│   │    "Hi team, I wanted to follow up on the..."      │   │
│   │                                                     │   │
│   │ Task Title *                                        │   │
│   │ ┌─────────────────────────────────────────────┐     │   │
│   │ │ Follow up with Sarah Chen                   │     │   │
│   │ └─────────────────────────────────────────────┘     │   │
│   │                                                     │   │
│   │ Description                                         │   │
│   │ ┌─────────────────────────────────────────────┐     │   │
│   │ │ Task created from conversation with Sarah   │     │   │
│   │ │ Chen.                                        │     │   │
│   │ │                                              │     │   │
│   │ │ Hi team, I wanted to follow up on the...    │     │   │
│   │ └─────────────────────────────────────────────┘     │   │
│   │                                                     │   │
│   │ Priority          Due Date                          │   │
│   │ [Medium ▼]        [Date picker]                     │   │
│   │                                                     │   │
│   │ Assignee                                            │   │
│   │ [Me ▼]                                              │   │
│   │                                                     │   │
│   │ Linked Entities (pre-filled)                       │   │
│   │ [TechCorp Inc] [Q1 Implementation] [Deal]          │   │
│   │                                                     │   │
│   │               [Cancel]  [Create Task]               │   │
│   └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

**Pre-filled Fields:**
- **Title:** Subject or "Follow up with [Contact]"
- **Description:** AI-summarized from conversation snippet
- **Linked Entities:** Auto-populated from conversation
- **Source:** Read-only indicator showing conversation

**Manual Fields:**
- **Priority:** Low / Medium / High (default: Medium)
- **Due Date:** Date picker (default: empty)
- **Assignee:** Me / Sarah / John / Team (default: Me)

**User Actions:**
- Edit any field
- Click Cancel → Close modal
- Click Create Task → Success toast + close modal
- Task appears in Work module with link to conversation

---

### SCREEN 6: Empty State

**Trigger:** No conversations OR filters return no results

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ [Module Header]                                             │
│ Communication                                               │
├─────────────────────────────────────────────────────────────┤
│ [Filters Bar - if filtered]                                 │
│ [Email ▼] [All Status ▼] [All Types ▼] [All ▼] [× Clear]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                                                             │
│                    [Icon Grid]                              │
│             ┌───┐  ┌───┐  ┌───┐                            │
│             │ ✉ │  │ in│  │ W │                            │
│             └───┘  └───┘  └───┘                            │
│                                                             │
│             No conversations to show                        │
│                                                             │
│    New messages from email, LinkedIn, and WhatsApp         │
│                will appear here.                            │
│                                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Two Scenarios:**

1. **Truly Empty Inbox:**
   - No filters applied
   - No conversations in data
   - Generic empty message

2. **Empty Filter Results:**
   - Filters active
   - No conversations match criteria
   - Shows "Clear Filters" option
   - Same visual design

**User Actions:**
- Click Clear Filters (if filtered) → Return to full inbox
- Wait for new messages → Auto-update (future)

---

## State Transitions

### Flow Diagram

```
[Inbox (Default)]
    ├─→ Apply Filter → [Filtered Inbox]
    │                      └─→ Clear Filter → [Back to Inbox]
    │
    ├─→ Click Conversation → [Conversation Open]
    │                            ├─→ Click AI Draft → [AI Draft Panel]
    │                            │                        └─→ Send/Discard → [Back to Conversation]
    │                            ├─→ Click Create Task → [Create Task Modal]
    │                            │                           └─→ Create/Cancel → [Back to Conversation]
    │                            └─→ Click Summarize → [Inline Summary] → Auto-close
    │
    └─→ No Results → [Empty State]
                        └─→ Clear Filters → [Back to Inbox]
```

---

## Responsive Behavior

### Desktop (Default)
- 2-column layout
- 400px fixed left panel
- Flexible right panel

### Tablet (Future)
- Collapsible left panel
- Full-width detail view when selected

### Mobile (Future)
- Stack layout
- List view first
- Detail view on selection (full screen)
- Back button to return to list

---

## Keyboard Shortcuts (Future)

- `↑` / `↓` - Navigate conversations
- `Enter` - Open selected conversation
- `R` - Reply
- `A` - AI Draft
- `T` - Create Task
- `Esc` - Close modal/panel

---

## Summary

All 6 screens are implemented and connected:
✅ Inbox with 15 conversations
✅ Filtered state with active filters
✅ Conversation detail with message timeline
✅ AI Draft panel with generation + actions
✅ Create Task modal with pre-filling
✅ Empty state for no results

Navigation is smooth, data is realistic, and all interactions provide immediate feedback through toasts, loading states, and visual transitions.
