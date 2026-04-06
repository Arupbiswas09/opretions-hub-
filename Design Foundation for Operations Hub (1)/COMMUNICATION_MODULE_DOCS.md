# Communication Module - Complete Documentation

## Overview

The Communication module is a unified inbox that consolidates all communication channels (Email, LinkedIn, WhatsApp, Internal Notes) into a single, streamlined interface for the AI Operations Hub.

## Module Structure

### File Organization

```
/src/app/pages/
├── CommunicationPage.tsx          # Main page component
└── communication/
    ├── index.ts                    # Barrel exports
    ├── types.ts                    # TypeScript types
    ├── data.ts                     # Dummy data (15 conversations)
    ├── ConversationListItem.tsx    # List item component
    ├── ConversationDetail.tsx      # Detail view component
    ├── AIDraftPanel.tsx            # AI draft reply panel
    ├── CreateTaskModal.tsx         # Task creation modal
    └── EmptyConversations.tsx      # Empty state component
```

## Core Concepts

### Conversation-Based Model

The primary unit is a **Conversation/Thread**, not individual messages. Each conversation:
- Can span multiple messages
- Belongs to a single channel (email, linkedin, whatsapp, internal)
- Has one primary contact
- Can be linked to multiple entities (clients, projects, jobs, candidates, deals)
- Has a status (unread, awaiting-reply, done)

### Multi-Channel Support

**Supported Channels:**
1. **Email** - Traditional email conversations with subject lines
2. **LinkedIn** - LinkedIn message threads (candidate/prospect outreach)
3. **WhatsApp** - Quick client/team messages
4. **Internal** - Internal team notes and communications

Each channel has:
- Unique icon
- Color coding
- Contextual UI adaptations

### Entity Linking

Conversations can be linked to:
- **Client** accounts
- **Project** records
- **Job** openings
- **Candidate** profiles
- **Deal** pipeline items
- **Contact** records

These links appear as color-coded badges and enable:
- Context-aware filtering
- Quick navigation
- Relationship tracking
- AI context enhancement

## User Interface

### Layout: 2-Column Design

```
┌─────────────────────────────────────────────────────┐
│ MODULE HEADER: Communication                        │
├─────────────────────────────────────────────────────┤
│ FILTERS: Channel | Status | Entity | Assignee      │
├──────────────────┬──────────────────────────────────┤
│ CONVERSATION     │ CONVERSATION DETAIL              │
│ LIST             │                                  │
│ (400px fixed)    │ - Header (contact, channel)     │
│                  │ - Messages timeline              │
│ [Conv 1 - Unread]│ - Action bar (Reply, AI, Tasks) │
│ [Conv 2]         │                                  │
│ [Conv 3 - Active]│ Optional: AI Draft Panel        │
│ [Conv 4]         │                                  │
│ ...              │                                  │
└──────────────────┴──────────────────────────────────┘
```

### Screen States

#### 1. Communication Inbox (Default)
- Full list of conversations
- All filters set to "All"
- First conversation auto-selected
- Left column: scrollable conversation list
- Right column: selected conversation detail

#### 2. Filtered Inbox
- Active filters displayed with clear button
- Badge showing "X of Y conversations"
- Empty state if no matches
- Filters persist until cleared

#### 3. Conversation Open
- Message thread displayed chronologically
- Own messages right-aligned (blue background)
- Others' messages left-aligned (gray background)
- Timestamps and sender names visible
- Linked entity badges in header
- Action bar always visible at bottom

#### 4. AI Draft State
- AI Draft panel appears below messages
- Blue-tinted background
- AI-generated draft in editable textarea
- AI action buttons (Regenerate, Shorten, Formalize, Insert Availability)
- Send/Save/Discard buttons
- Simulated generation delay (1.5s)

#### 5. Create Task from Conversation
- Modal dialog overlay
- Pre-filled with conversation context
- Source indicator showing conversation snippet
- Linked entities auto-populated
- Standard task fields (title, description, priority, due date, assignee)
- Create/Cancel actions

#### 6. Empty State
- Centered icon grid (Email, LinkedIn, WhatsApp)
- Friendly message
- Hint about future messages
- Shown when filters return no results OR inbox is empty

## Features

### Filtering System

**Available Filters:**
1. **Channel Filter**
   - All Channels (default)
   - Email
   - LinkedIn
   - WhatsApp
   - Internal

2. **Status Filter**
   - All Status (default)
   - Unread
   - Awaiting Reply
   - Done

3. **Entity Filter**
   - All Types (default)
   - Client
   - Project
   - Job
   - Candidate
   - Deal

4. **Assignee Filter**
   - All Assignees (default)
   - Me
   - Sarah
   - John
   - Team

**Filter Behavior:**
- Multiple filters applied with AND logic
- Active filters show "Clear Filters" button
- Result count displayed when filtering
- Filters reset on clear

### AI Features

#### AI Draft Reply
**Trigger:** Click "AI Draft" button in action bar

**Capabilities:**
1. **Auto-Generation**
   - Analyzes conversation context
   - Detects if reply is needed
   - Generates contextual response
   - Different templates per channel

2. **Regenerate**
   - Creates alternative draft
   - Maintains context
   - New tone/structure

3. **Shorten**
   - Condenses draft to essentials
   - Removes filler
   - Keeps key points

4. **Make Formal**
   - Professional language
   - Formal greeting/closing
   - Business-appropriate tone

5. **Insert Availability**
   - Adds meeting time options
   - Smart scheduling suggestions
   - Calendar-aware (future enhancement)

#### AI Summarize
**Trigger:** Click "Summarize" button

**Output:**
- Inline summary banner (blue background)
- Key points extracted
- Linked entities highlighted
- Action items identified (future)
- Auto-dismisses after 3 seconds

### Task/Issue Creation

#### Create Task from Conversation
**Pre-filled Fields:**
- **Title:** Subject or contact name
- **Description:** AI-summarized from conversation
- **Linked Entities:** Auto-populated from conversation
- **Source:** "Communication" (read-only indicator)

**Manual Fields:**
- Priority (dropdown)
- Due Date (date picker)
- Assignee (dropdown)

**Action:**
- Creates task in Work module
- Links to original conversation
- Toast notification on success

#### Create Issue
- Same flow as Create Task
- Different form fields (future implementation)
- Links to Issues module

### Linked Entity Navigation

**Visual Indicators:**
- Color-coded badges
- Entity type prefix
- Truncation with "+X more" for long lists

**Behavior:**
- Clicking badge = navigate to entity (future)
- Hover = tooltip with full name (future)
- Filter by entity type

### Conversation Actions

**Manual Actions:**
1. **Reply** - Opens compose view (native to channel)
2. **Link to Record** - Attach conversation to entities

**AI Actions:**
1. **AI Draft** - Generate reply with AI
2. **Summarize** - Get conversation summary

**Creation Actions:**
1. **Create Task** - Convert to task
2. **Create Issue** - Convert to issue

## Data Model

### Conversation Type

```typescript
interface Conversation {
  id: string;
  channel: 'email' | 'linkedin' | 'whatsapp' | 'internal';
  primaryContact: {
    id: string;
    name: string;
    email?: string;
    avatar?: string;
  };
  subject?: string;              // Email only
  snippet: string;               // Preview text
  messages: Message[];
  linkedEntities: LinkedEntity[];
  status: 'unread' | 'awaiting-reply' | 'done';
  lastActivity: string;          // ISO timestamp
  isUnread: boolean;
  assignedTo?: string;
}
```

### Message Type

```typescript
interface Message {
  id: string;
  sender: {
    id: string;
    name: string;
    email?: string;
    isMe?: boolean;
  };
  content: string;
  timestamp: string;             // ISO timestamp
  channel: Channel;
}
```

### Linked Entity Type

```typescript
interface LinkedEntity {
  id: string;
  type: 'client' | 'project' | 'job' | 'candidate' | 'deal' | 'contact';
  name: string;
}
```

## Dummy Data

### 15 Realistic Conversations

**Distribution:**
- Email: 5 conversations
- LinkedIn: 3 conversations (candidate outreach)
- WhatsApp: 3 conversations (client/team)
- Internal: 4 conversations (team notes)

**Status Distribution:**
- Unread: 5 conversations
- Awaiting Reply: 3 conversations
- Done: 7 conversations

**Entity Linking:**
- 8 linked to clients
- 7 linked to projects
- 2 linked to jobs
- 2 linked to candidates
- 3 linked to deals
- Some have multiple links

**Assignee Distribution:**
- Me: 4 conversations
- Sarah: 2 conversations
- John: 1 conversation
- Team: 4 conversations
- Other roles: 4 conversations

## Design Principles

### Enterprise-Grade UI
- Clean, professional aesthetic
- High information density without clutter
- Consistent spacing (follows ModuleHeader standard)
- Subtle colors (no vibrant distractions)

### Scannable Lists
- Clear visual hierarchy
- Channel icons for quick identification
- Unread indicators (blue dot + background)
- Entity badges for context
- Relative timestamps

### AI-First but Not Intrusive
- AI features clearly separated (purple accent)
- Manual actions take precedence
- AI suggestions are optional
- Clear AI labeling (Sparkles icon)

### Responsive Actions
- Toast notifications for success
- Loading states during AI generation
- Smooth transitions
- Instant feedback

## Integration Points

### With Work Module
- Create tasks from conversations
- Link tasks back to conversations
- Task source tracking ("communication")
- Shared entity linking

### With Other Modules (Future)
- Recruitment: Candidate outreach tracking
- Sales: Deal communication history
- Projects: Project-related messages
- Clients: Client communication log

## Technical Implementation

### State Management
- Local state for UI (filters, selected conversation)
- Props drilling for simple data flow
- Future: Context API for global comm state

### Performance
- Conversation list virtualization (future)
- Lazy load message history
- Optimistic UI updates
- Debounced filtering

### Accessibility
- Keyboard navigation support
- Screen reader labels
- Focus management
- ARIA attributes

## User Workflows

### Typical User Flow 1: Read & Reply
1. Open Communication module
2. See unread conversations (blue indicators)
3. Click conversation to open
4. Read messages
5. Click "AI Draft"
6. Review/edit AI-generated reply
7. Click "Send"
8. Conversation marked as done

### Typical User Flow 2: Create Task
1. Reading conversation
2. Recognize action item needed
3. Click "Create Task"
4. Review pre-filled form
5. Adjust priority/due date
6. Click "Create Task"
7. Task appears in Work module
8. Conversation linked to task

### Typical User Flow 3: Filter & Focus
1. Open Communication
2. Select filter: "Unread + Email"
3. See filtered list (5 items)
4. Process each unread email
5. Clear filters
6. Return to full inbox

## Future Enhancements

### Phase 2
- [ ] Telephony integration (calls)
- [ ] SMS/text messages
- [ ] Slack integration
- [ ] Teams integration

### Phase 3
- [ ] Conversation threading (merge related)
- [ ] Smart replies (quick responses)
- [ ] Scheduled send
- [ ] Snooze conversations

### Phase 4
- [ ] AI sentiment analysis
- [ ] Priority scoring
- [ ] Auto-assignment
- [ ] Response templates

### Phase 5
- [ ] Voice notes
- [ ] Video messages
- [ ] Screen recordings
- [ ] File attachments

## Developer Notes

### Adding New Channel
1. Add channel type to `types.ts`
2. Add icon to `channelIcons` map
3. Add color to `channelColors` map
4. Create dummy data
5. Update filter options
6. Test all states

### Adding New Entity Type
1. Add type to `EntityType` union
2. Add color to `entityColors` map
3. Update filter dropdown
4. Add to dummy data
5. Test linking

### Customizing AI Behavior
- Edit generation logic in `AIDraftPanel.tsx` `useEffect`
- Modify action button handlers
- Adjust generation delays for UX

## Testing Checklist

- [ ] All 15 conversations load
- [ ] Each channel displays correctly
- [ ] Filters work independently
- [ ] Filters work in combination
- [ ] Clear filters resets all
- [ ] Conversation selection updates detail view
- [ ] Messages display correctly (left/right alignment)
- [ ] AI Draft generates and is editable
- [ ] AI action buttons work (Regenerate, Shorten, etc.)
- [ ] Create Task modal opens and pre-fills
- [ ] Task creation shows success toast
- [ ] Empty state shows when no results
- [ ] Timestamps format correctly
- [ ] Entity badges display and color correctly
- [ ] Unread indicators show properly
- [ ] Module header matches Cockpit/Work
- [ ] Responsive layout (2-column structure)
- [ ] Smooth scrolling in conversation list

## Summary

The Communication module provides a powerful, unified inbox for all communication channels with AI-enhanced features for drafting replies, summarizing conversations, and creating tasks. It follows the established design system, maintains structural consistency with other modules, and includes 15 realistic conversations for demonstration and development purposes.

All screens are functional and connected, demonstrating the complete user experience from filtering and reading conversations to using AI features and creating actionable tasks.
