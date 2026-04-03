# Sales Module - Complete Documentation

## Overview

The Sales module is a complete CRM solution for managing deals and proposals with two distinct sales pipelines (Project Deals and Talent Deals). Built with the Bonsai UI Kit aesthetic.

---

## 🎯 Nine Complete Screens

### SA-01: Sales Dashboard
**Purpose**: Executive overview of sales performance

**Features**:
- 4 key metric cards (Total Pipeline, Active Deals, Win Rate, Avg Close Time)
- Project Pipeline summary (5 stages with deal counts and values)
- Talent Pipeline summary (5 stages with deal counts and values)
- Recent Deals list with quick view
- Navigation links to List and Pipeline views

**Prototype Links**:
- "View Pipeline" → SA-03 Pipeline
- "View All" → SA-02 Deals List
- "Create Deal" → SA-05 Deal Drawer

---

### SA-02: Deals List
**Purpose**: Comprehensive list of all deals with multiple view options

**Features**:
- ✅ **View Switcher**: Toggle between List/Kanban/Grid views
- 4 stats cards (Total Deals, Total Value, Project Deals, Talent Deals)
- Enhanced table with:
  - Row selection
  - Sortable columns
  - Search and filters
  - Deal type badges (blue for Project, purple for Talent)
  - Status pills
- Grid view with card previews
- Kanban redirect to Pipeline view

**Prototype Links**:
- Click any row → SA-04 Deal Detail
- "Create Deal" button → SA-05 Deal Drawer
- Grid card click → SA-04 Deal Detail

---

### SA-03: Deals Pipeline (Kanban)
**Purpose**: Visual workflow management with dual pipelines

**Features**:
- ✅ **Pipeline Toggle**: Switch between Project and Talent pipelines
- 4 stats cards (context-aware based on selected pipeline)
- Kanban board with color-coded stages:

**Project Pipeline Stages**:
1. New Lead (gray)
2. Qualified (blue)
3. Discovery Scheduled (cyan)
4. Proposal Sent (purple)
5. Negotiation (amber)
6. Won (green)

**Talent Pipeline Stages**:
1. New Request (gray)
2. Qualified (blue)
3. Profiles Shared (cyan)
4. Interviewing (purple)
5. Placement (amber)
6. Won (green)

**Card Information**:
- Deal name and description
- Tags
- Assignee avatar
- Client name and value

**Prototype Links**:
- Click any card → SA-04 Deal Detail
- "+" button on column → SA-05 Deal Drawer
- "Create Deal" → SA-05 Deal Drawer

---

### SA-04: Deal Detail
**Purpose**: Complete deal record with all related information

**Features**:
- ✅ **Next Step Widget** (gradient banner):
  - Next action item
  - Follow-up date with calendar icon
  - Mark complete button
- Quick Action Cards:
  - Create Proposal → SA-07 Proposal Drawer
  - Log Activity
  - Mark Won/Lost → SA-09 Modal
- 4 info cards (Deal Value, Owner, Created, Expected Close)
- Tabbed interface:
  - **Overview**: Details, description, primary contact
  - **Proposals**: Table with version history (v2.0, v1.0, etc.)
  - **Activity**: Timeline of deal activities
  - **Documents**: File management

**Prototype Links**:
- "Create Proposal" → SA-07 Proposal Drawer
- "Mark Won/Lost" → SA-09 Won/Lost Modal
- "Edit" → SA-05 Deal Drawer (edit mode)
- Click proposal row → SA-08 Proposal Detail

---

### SA-05: New/Edit Deal (Drawer)
**Purpose**: Create or edit deal records

**Features**:
- Right-side drawer (full height, 2xl width)
- Form sections:
  - **Deal Information**: Name, Client, Type, Value
  - **Sales Information**: Stage, Owner, Close Date, Probability slider
  - Description textarea
- Dynamic stage options based on deal type
- Probability slider (0-100% in 5% increments)
- Form validation

**Prototype Links**:
- "Create Deal" / "Save Changes" → SA-04 Deal Detail
- "Cancel" → Close drawer, return to previous screen

---

### SA-06: Proposals (Inside Deal Detail)
**Purpose**: Manage proposal versions within a deal

**Features**:
- Integrated table in Deal Detail "Proposals" tab
- Version history tracking (v1.0, v2.0, etc.)
- Columns: Name, Version, Amount, Status, Date
- Status pills (Sent, Draft, Accepted, Declined)
- Quick comparison of proposal versions
- "Create Proposal" button

**Prototype Links**:
- Click proposal row → SA-08 Proposal Detail
- "Create Proposal" → SA-07 Proposal Drawer

---

### SA-07: New/Edit Proposal (Drawer)
**Purpose**: Create detailed proposals with line items

**Features**:
- Wide drawer (3xl width for complex form)
- Form sections:
  - **Basic Information**: Name, Version, Amount, Valid Until, Status
  - **Line Items**: Dynamic add/remove
    - Description, Quantity, Rate, Amount per item
    - "+ Add Item" button
  - **Notes & Terms**: Payment terms, deliverables
- Line items in expandable cards
- Status dropdown (Draft, Sent, Viewed, Accepted, Declined)

**Prototype Links**:
- "Create Proposal" → SA-08 Proposal Detail
- "Cancel" → Close drawer, return to Deal Detail

---

### SA-08: Proposal Detail
**Purpose**: View proposal with PDF preview and tracking

**Features**:
- ✅ **PDF Preview Placeholder**:
  - Full-width mockup of proposal document
  - Executive Summary, Scope of Work, Investment breakdown, Timeline
  - Professional formatting with pricing table
- Header with version, status, validity date
- Action buttons: Download PDF, Edit, Send to Client
- Tabbed interface:
  - **Proposal**: PDF preview
  - **Activity**: Timeline of proposal actions (sent, updated, created)
  - **Documents**: Related files (PDF, Excel, etc.)

**Use Case**: Client-facing proposal presentation and tracking

---

### SA-09: Mark Won/Lost (Modal)
**Purpose**: Close deals with outcome tracking

**Features**:
- ✅ **Visual Outcome Selection**:
  - Large "Won" button (green with thumbs up icon)
  - Large "Lost" button (red with thumbs down icon)
  - Active state highlighting
- **Conditional Fields**:
  - **Won**: Final Close Value input
  - **Won Reasons**: Best Price, Best Solution, Relationship, Timing, Other
  - **Lost Reasons**: Price too high, Lost to competitor, Bad timing, No budget, etc.
- Additional Notes textarea
- Form validation (outcome required)

**Prototype Links**:
- "Mark as Won/Lost" → Updates deal status pill → Returns to SA-04 Deal Detail
- Visual feedback: Status pill changes to "Won" (green) or "Lost" (red)

---

## 🔗 Complete Prototype Flow

### New Deal Flow:
1. SA-01 Dashboard → Click "Create Deal"
2. SA-05 Deal Drawer opens → Fill form → Submit
3. SA-04 Deal Detail → Shows new deal

### Deal to Proposal Flow:
1. SA-04 Deal Detail → Click "Create Proposal"
2. SA-07 Proposal Drawer → Build proposal → Submit
3. SA-08 Proposal Detail → View/edit proposal
4. SA-04 Deal Detail → Proposals tab shows new proposal

### Close Deal Flow:
1. SA-04 Deal Detail → Click "Mark Won/Lost"
2. SA-09 Modal → Select outcome → Fill reason → Submit
3. SA-04 Deal Detail → Status pill updates to Won/Lost

### Pipeline Navigation:
1. SA-03 Pipeline → Click card
2. SA-04 Deal Detail → Shows full deal info
3. Can edit, add proposals, or close deal

---

## 📊 Data Model

### Deal Object
```typescript
{
  id: string;
  name: string;          // "Website Redesign Project"
  client: string;        // "Acme Corp"
  type: 'Project' | 'Talent';
  value: string;         // "$45,000"
  stage: string;         // Based on pipeline type
  owner: string;         // "John Doe"
  expectedClose: string; // "Jan 25, 2026"
  probability: number;   // 0-100
  description: string;
  nextStep: string;      // "Follow up on proposal"
  nextFollowUp: string;  // "Jan 15, 2026"
}
```

### Proposal Object
```typescript
{
  id: string;
  dealId: string;
  name: string;          // "Website Redesign Proposal"
  version: string;       // "v2.0"
  amount: string;        // "$45,000"
  validUntil: string;    // "Jan 20, 2026"
  status: 'Draft' | 'Sent' | 'Viewed' | 'Accepted' | 'Declined';
  items: Array<{
    description: string;
    quantity: number;
    rate: string;
    amount: string;
  }>;
  notes: string;
}
```

---

## 🎨 Design Features

### Color Coding
- **Project Deals**: Blue badges and accents (#3b82f6)
- **Talent Deals**: Purple badges and accents (#a855f7)
- **Won Status**: Green (#10b981)
- **Lost Status**: Red (#ef4444)
- **Pending/Active**: Primary teal (#00b894)

### Pipeline Stage Colors
- New/Request: Stone gray (#9ca3af)
- Qualified: Blue (#3b82f6)
- Discovery/Profiles: Cyan (#06b6d4)
- Proposal/Interviewing: Purple (#a855f7)
- Negotiation/Placement: Amber (#f59e0b)
- Won: Green (#10b981)

### Typography
- Headers: 2xl, semibold (Deal/Proposal names)
- Subheaders: sm, stone-500 (Client, dates)
- Body: sm, stone-700 (Descriptions)
- Labels: xs, stone-600, uppercase (Form labels)

### Components Used
- BonsaiButton (Primary, Ghost, Destructive)
- BonsaiStatusPill (Status indicators)
- BonsaiTabs (Navigation in detail views)
- BonsaiTimeline (Activity feeds)
- BonsaiKanban (Pipeline boards)
- BonsaiFormField (All form inputs)
- BonsaiDocumentList (File management)
- EnhancedTable (Deals list, Proposals table)

---

## 🚀 Interactive Elements

### Hover States
- Cards: Slight shadow lift
- Buttons: Background color shift
- Table rows: Light background highlight
- Kanban cards: Border color change

### Click Targets
- Minimum 44x44px for touch targets
- Clear visual feedback on interaction
- Disabled states where appropriate

### Transitions
- All state changes: 200ms ease
- Drawer open/close: 300ms slide
- Modal fade: 200ms opacity

---

## 💡 Usage Scenarios

### Scenario 1: New Project Deal
1. Navigate to Dashboard or Pipeline
2. Click "Create Deal"
3. Fill: Name, Client, Type=Project, Value, Stage=New Lead
4. Deal appears in Project Pipeline
5. Move through stages as deal progresses
6. Create proposal when ready
7. Mark Won when client accepts

### Scenario 2: Talent Placement
1. Create deal with Type=Talent
2. Move to "Profiles Shared" stage
3. Add notes about candidates
4. Progress to "Interviewing"
5. Update to "Placement" when offer accepted
6. Mark Won with final placement fee

### Scenario 3: Proposal Versioning
1. Create initial proposal (v1.0) in Draft
2. Send to client (status=Sent)
3. Client requests changes
4. Create v2.0 with updated pricing
5. Both versions visible in Proposals tab
6. Track which version was accepted

---

## 📱 Responsive Design

- **Desktop** (≥1024px): Full layout with all features
- **Tablet** (768-1023px): Adjusted grid columns, drawer at 100% width
- **Mobile** (<768px): Stack cards vertically, full-width drawers, simplified tables

---

## ✅ Quality Checklist

- [x] All 9 screens implemented
- [x] Prototype links working
- [x] Two pipeline types with correct stages
- [x] Proposal version history
- [x] Won/Lost modal with visual outcome selection
- [x] Next step widget in Deal Detail
- [x] View switcher in Deals List
- [x] Pipeline toggle in Kanban view
- [x] Form validation
- [x] Bonsai aesthetic consistency
- [x] Responsive design
- [x] TypeScript types
- [x] Accessibility considerations

---

Built with React, TypeScript, Tailwind CSS v4, and the Bonsai UI Kit 🌿
