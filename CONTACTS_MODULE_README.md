# Contacts Module - Complete Documentation

## Overview

The Contacts module is a comprehensive CRM contact management system with full GDPR compliance features. Built with the Bonsai UI Kit aesthetic and includes extensive data privacy controls.

---

## 🎯 Seven Complete Screens

### CO-01: Contacts List
**Purpose**: Comprehensive contact management with advanced filtering and bulk operations

**Features**:
- ✅ **View Switcher**: Toggle between List/Kanban/Grid views
- ✅ **Column Chooser**: Show/hide table columns (10 available columns)
  - Name, Email, Phone, Type, Linked Client, Consent, GDPR Status, Source, Tags, Last Contact
- ✅ **Row Checkboxes + Bulk Actions**:
  - Send Email (stub)
  - Add Tag
  - Update Consent
  - Export
  - Delete
- ✅ **Advanced Filters**:
  - Type (Client, Lead, Candidate, Partner, Vendor)
  - Linked Client (All, Linked, Not Linked)
  - Consent (Given, Pending, Withdrawn)
  - GDPR Status (Active, Export Requested, Deletion Requested)
  - Source (Website, Referral, LinkedIn, Event, Cold Outreach)
  - Tags (VIP, Qualified, Active, etc.)
- 5 stats cards:
  - Total Contacts
  - Consent Given (green)
  - Pending Consent (amber)
  - Export Requests (blue)
  - Deletion Requests (red)
- Search and sort functionality
- Bulk Actions Bar appears when contacts selected

**Data Fields**:
- Contact types: Client, Lead, Candidate, Partner, Vendor
- Consent statuses with color coding
- GDPR status tracking
- Tag system for categorization

---

### CO-02: New/Edit Contact Drawer
**Purpose**: Create or edit contact records with GDPR fields

**Features**:
- Right-side drawer (2xl width)
- Form sections:
  - **Basic Information**: First/Last Name, Email, Phone, Company, Job Title
  - **Classification**: Type, Source, Linked Client, Tags
  - **GDPR & Consent**: 
    - Consent Status dropdown
    - Consent Date picker
    - Data Processing Basis (Consent, Contract, Legal Obligation, Legitimate Interest)
    - Marketing opt-in checkbox
    - Third-party sharing consent checkbox
    - GDPR notice banner
- Comma-separated tags input
- Required field validation
- GDPR compliance reminder

**GDPR Notice**: "Ensure you have a lawful basis for processing this contact's data..."

---

### CO-03: Contact Detail
**Purpose**: Complete contact record with all related information

**Features**:
- Avatar with initials
- Header with:
  - Name
  - Consent status pill (color-coded)
  - GDPR status pill (if not Active)
  - Contact type badge
  - Email, Phone, Company, Job Title icons
- Quick Actions: Send Email, Edit, Delete
- Tags display
- ✅ **Tabbed Interface**:

#### **Overview Tab**:
- 4 info cards: Source, Linked Client, Added Date, Last Contact
- "Link to Client" button if not linked
- Contact Information grid
- Data Privacy Summary with link to GDPR tab
- Notes section

#### **Related Tab**:
- Related Deals section with "View all" link
- Related Projects section (with empty state)
- Related Jobs section (with empty state)
- Support Requests section (with empty state)
- Each section shows compact list or empty state

#### **Activity Tab**:
- ✅ **Filter Chips** (All, Note, Email, Call, Meeting, System)
  - Click to toggle filters
  - Multiple filters can be active
  - "All" resets to show everything
- Timeline with activity items
- ✅ **Edit/Delete Actions** on timeline items (except system events)
- Activity types color-coded

#### **Documents Tab**:
- Document list with upload/download/delete
- Shows signed consent forms, meeting notes, etc.
- File metadata (size, date, uploader)

#### **GDPR Tab**:
- Shows CO-04 GDPR Actions component
- Full compliance interface

---

### CO-04: GDPR Actions (Tab within Contact Detail)
**Purpose**: Comprehensive GDPR compliance interface

**Features**:

#### **GDPR Compliance Status**:
- 3 status cards:
  - Consent Status (green check icon)
  - Data Processing basis (blue document icon)
  - Data Retention (purple clock icon)

#### **Data Subject Rights** (3 action cards):

1. **Right to Access (Export Data)**:
   - Blue download icon
   - Explanation of export functionality
   - "Export Contact Data" button → CO-07 Modal
   
2. **Right to Erasure (Request Deletion)**:
   - Amber warning icon
   - Soft delete explanation (anonymization + 30-day reversal)
   - "Request Deletion" button
   
3. **Permanent Delete (Admin Only)**:
   - Red bordered card with shield icon
   - ⚠️ Warning about irreversibility
   - Admin-only badge
   - "Permanent Delete (Admin)" button

#### **Consent History**:
- Timeline of consent actions
- Shows when/how consent was given
- Status pills for each consent

#### **Data Processing Log**:
- Audit trail of data usage
- Contact created, emails sent, data accessed
- Timestamps for all actions

#### **Legal Basis Documentation**:
- Processing Basis (GDPR Article reference)
- Purpose of processing
- Data categories (tags)
- Retention period details

#### **GDPR Compliance Checklist**:
- 5 checkmarks in gradient box:
  - ✓ Valid consent obtained
  - ✓ Legal basis documented
  - ✓ Processing activities logged
  - ✓ Retention policy applied
  - ✓ Subject rights mechanism in place

---

### CO-05: Link Contact to Client Modal
**Purpose**: Associate contact with a client organization

**Features**:
- Modal overlay (max-w-2xl)
- Search bar with magnifying glass icon
- Client list with:
  - Client name
  - Industry
  - Number of existing contacts
- Radio-style selection (border highlights when selected)
- "Create new client" link at bottom
- Real-time search filtering
- Empty state when no results

**Use Case**: Link individual contacts to their organizations for better relationship mapping

---

### CO-06: Bulk Actions Toolbar
**Purpose**: Floating toolbar for bulk operations

**Features**:
- ✅ **Fixed bottom position** (centered, floating)
- ✅ **Gradient background** (primary to green)
- Visual design:
  - White text on gradient
  - Selection count in circular badge
  - Border separators between sections
- Action buttons:
  - Send Email
  - Add Tag
  - Update Consent
  - Export
  - Delete (red background)
- Close button (X icon)
- Shows count: "3 contacts selected"

**Interaction**: Appears when rows selected in CO-01, can also be triggered manually to demonstrate design

---

### CO-07: Export Contact Data Modal
**Purpose**: GDPR-compliant data export with granular options

**Features**:

#### **GDPR Notice**:
- Blue info box at top
- Explains Article 20 compliance
- References data portability rights

#### **Format Selection**:
- 2 large format buttons:
  - JSON (machine-readable)
  - CSV (spreadsheet format)
- Icon + label for each

#### **Data to Include** (6 checkboxes):
1. ✓ Contact Information (name, email, phone, address)
2. ✓ Activity History (notes, emails, calls, meetings)
3. ✓ Documents (files and attachments)
4. ✓ Consent Records (consent history and preferences)
5. ✓ GDPR Metadata (processing basis, retention info)
6. ☐ Related Records (deals, projects, invoices)

Each option has:
- Checkbox
- Bold label
- Gray description text
- Hover background

#### **Export Summary**:
- Green checkmark box
- Shows: Format, number of sections, compliance reference
- Example: "Format: JSON • Sections: 5 • Compliance: GDPR Article 20"

**Prototype Links**:
- "Export Data" button → Triggers download
- Can be accessed from CO-01 bulk actions or CO-04 GDPR tab

---

## 🔗 Complete Prototype Flow

### New Contact Flow:
1. CO-01 List → Click "Create Contact"
2. CO-02 Drawer → Fill form with GDPR fields → Submit
3. CO-03 Detail → Shows new contact with all tabs

### View Contact Flow:
1. CO-01 List → Click row
2. CO-03 Detail → Navigate tabs (Overview/Related/Activity/Documents/GDPR)
3. Edit button → CO-02 Drawer

### GDPR Export Flow:
1. CO-03 Detail → GDPR tab (CO-04)
2. Click "Export Contact Data"
3. CO-07 Modal → Select format & options → Export

### Link Client Flow:
1. CO-03 Detail → Overview tab → "Link to Client" button
2. CO-05 Modal → Search & select client → Link
3. CO-03 Detail → Shows linked client

### Bulk Operations Flow:
1. CO-01 List → Check multiple rows
2. Bulk Actions Bar appears
3. Click action or "Show CO-06" button
4. CO-06 Floating Toolbar → Choose action

---

## 📊 Data Model

### Contact Object
```typescript
{
  id: string;
  firstName: string;
  lastName: string;
  name: string;              // Full name
  email: string;
  phone: string;
  company: string;
  jobTitle: string;
  type: 'Client' | 'Lead' | 'Candidate' | 'Partner' | 'Vendor';
  source: 'Website' | 'Referral' | 'LinkedIn' | 'Event' | 'Cold Outreach' | 'Other';
  linkedClient: string;      // Client ID or name
  consent: 'Given' | 'Pending' | 'Withdrawn';
  consentDate: string;
  gdprStatus: 'Active' | 'Export Requested' | 'Deletion Requested';
  dataProcessingBasis: 'Consent' | 'Contract' | 'Legal Obligation' | 'Legitimate Interest';
  marketingOptIn: boolean;
  thirdPartySharing: boolean;
  tags: string[];
  notes: string;
  createdAt: string;
  lastContact: string;
}
```

### Activity Item
```typescript
{
  id: string;
  title: string;
  description: string;
  timestamp: string;
  user: { name: string };
  type: 'note' | 'email' | 'call' | 'meeting' | 'system';
}
```

---

## 🎨 Design Features

### Color Coding

**Consent Status**:
- Given: Green (#10b981) - Active pill
- Pending: Amber (#f59e0b) - Pending pill
- Withdrawn: Red (#ef4444) - Inactive pill

**Contact Types**:
- All types: Blue badge (#3b82f6)

**GDPR Actions**:
- Export: Blue (#3b82f6)
- Request Deletion: Amber (#f59e0b)
- Permanent Delete: Red (#ef4444)

**Stats Cards**:
- Total: Stone
- Consent Given: Green
- Pending: Amber
- Export Requests: Blue
- Deletion Requests: Red

### Typography
- Headers: 2xl, semibold
- Section titles: semibold, stone-800
- Body text: sm, stone-700
- Helper text: xs, stone-500
- Labels: xs, stone-600, uppercase

### GDPR-Specific Components
- Warning boxes: Amber border + background
- Info boxes: Blue border + background
- Admin-only badges: Red
- Compliance checkmarks: Green

---

## 🔒 GDPR Compliance Features

### Legal Basis Options
1. **Consent** (Article 6(1)(a))
   - Explicit permission from data subject
   - Can be withdrawn at any time
   
2. **Contract** (Article 6(1)(b))
   - Processing necessary for contract performance
   
3. **Legal Obligation** (Article 6(1)(c))
   - Required by law
   
4. **Legitimate Interest** (Article 6(1)(f))
   - Necessary for legitimate business interests

### Data Subject Rights (All Implemented)
- ✅ Right to Access (Article 15) - Export data
- ✅ Right to Rectification (Article 16) - Edit contact
- ✅ Right to Erasure (Article 17) - Request deletion
- ✅ Right to Data Portability (Article 20) - Export in machine-readable format
- ✅ Processing transparency - Full audit log

### Audit Trail
- Consent history with timestamps
- Data processing log
- Activity tracking
- Document uploads tracked

### Data Retention
- Active contacts: Until consent withdrawn
- Deleted contacts: 30-day soft delete period
- Legal compliance: +3 years after relationship ends
- Permanent deletion: Admin-only action

---

## 💡 Usage Scenarios

### Scenario 1: Onboard New Lead
1. Create contact via CO-02
2. Set Type = Lead, Source = Website
3. Consent = Pending (awaiting confirmation)
4. Add tags: "Qualified", "Website Inquiry"
5. Contact appears in list with pending status

### Scenario 2: GDPR Export Request
1. Contact emails requesting their data
2. Navigate to CO-03 → GDPR tab
3. Click "Export Contact Data"
4. Select JSON format + all data categories
5. Download provides complete data package
6. Log export request in processing log

### Scenario 3: Consent Withdrawal
1. Contact withdraws marketing consent
2. Edit via CO-02 → Change consent to "Withdrawn"
3. System prevents future marketing emails
4. Audit trail logs consent change
5. Option to request deletion if desired

### Scenario 4: Bulk Tag Addition
1. Filter contacts by Type = Lead
2. Select multiple rows
3. Bulk Actions → Add Tag
4. Add "Q1 2026 Campaign"
5. All selected contacts tagged

### Scenario 5: Client Relationship Mapping
1. Contact detail → "Link to Client"
2. CO-05 Modal → Search "Acme Corp"
3. Link contact to organization
4. Related tab shows other Acme contacts
5. Deals/Projects associated via client

---

## 📋 Column Chooser Columns

Available columns (toggleable):
1. ✓ Name (default: visible)
2. ✓ Email (default: visible)
3. ✓ Phone (default: visible)
4. ✓ Type (default: visible)
5. ✓ Linked Client (default: visible)
6. ✓ Consent (default: visible)
7. ☐ GDPR Status (default: hidden)
8. ☐ Source (default: hidden)
9. ✓ Tags (default: visible)
10. ✓ Last Contact (default: visible)

Users can show/hide any column to customize their view.

---

## 🎯 Bulk Actions

Available bulk operations:
1. **Send Email** - Compose email to selected (stub)
2. **Add Tag** - Apply tag to all selected
3. **Update Consent** - Batch consent status change
4. **Export** - Bulk data export
5. **Delete** - Batch deletion (with confirmation)

All actions respect GDPR requirements and log processing activities.

---

## 🔍 Filter System

**Type Filter**: Client, Lead, Candidate, Partner, Vendor
**Linked Client**: All, Linked, Not Linked
**Consent**: All, Given, Pending, Withdrawn
**GDPR Status**: All, Active, Export Requested, Deletion Requested
**Source**: All sources available
**Tags**: All tags in system

Filters combine (AND logic) for precise searching.

---

## ✅ Quality Checklist

- [x] All 7 screens implemented
- [x] View switcher (List/Kanban/Grid)
- [x] Column chooser with 10 columns
- [x] Row checkboxes + bulk actions
- [x] 6 filter categories
- [x] Activity filter chips (6 types)
- [x] Edit/delete on timeline items
- [x] GDPR tab with full compliance interface
- [x] 3 GDPR action buttons
- [x] Consent history tracking
- [x] Data processing log
- [x] Legal basis documentation
- [x] Export modal with 6 options
- [x] Link client modal with search
- [x] Bulk toolbar (floating design)
- [x] Related sections with empty states
- [x] GDPR compliance checklist
- [x] Bonsai aesthetic consistency
- [x] Responsive design
- [x] TypeScript types
- [x] Accessibility considerations

---

## 🌍 GDPR Compliance Summary

This module fully supports:
- **Lawful basis** documentation for all contacts
- **Transparent processing** with full audit logs
- **Data minimization** through granular consent options
- **Purpose limitation** via processing basis tracking
- **Storage limitation** with retention policies
- **Integrity & confidentiality** through access controls
- **Accountability** via compliance checklists and logs

All required GDPR rights are accessible within 2 clicks from any contact.

---

Built with React, TypeScript, Tailwind CSS v4, and the Bonsai UI Kit 🌿

**Compliance**: GDPR Articles 6, 15, 16, 17, 20 | Privacy by Design
