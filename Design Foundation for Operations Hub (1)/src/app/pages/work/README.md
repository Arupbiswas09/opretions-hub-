# Work Module

The Work module is the execution backbone of the AI Operations Hub, managing tasks, approvals, and issues across the organization.

## Features

### Tasks Tab
- **List View**: Comprehensive table view with checkboxes, filters, and quick actions
- **Kanban View**: Visual board with 5 columns (To Do, In Progress, Blocked, Waiting, Done)
- **Grid View**: Card-based layout for visual scanning
- **Filters**: Assignee, Priority, Status, Entity Type, Source, Due Date
- **Task Drawer**: Full detail view with AI insights, comments, and activity log

### Approvals Tab
- Review and approve timesheets, documents, invoices, and leave requests
- Quick approve/reject buttons in list view
- Approval Detail Drawer with document preview, comments, and history
- Overdue tracking and notifications

### Issues Tab
- Track operational issues with severity levels (Critical, High, Medium, Low)
- Status tracking (Open, In Progress, Blocked, Resolved)
- Full-page issue detail view with:
  - AI analysis and suggested resolution steps
  - Activity timeline
  - Comments section
  - Sidebar with status controls
  - Convert to task functionality

## Data Structure

All data types are defined in `types.ts`:
- Task
- Approval
- Issue
- User
- Comment
- ActivityEntry

## Routing

- `/work` - Main Work page with tabs
- `/work/issues/:issueId` - Issue detail page

## Components

- `WorkPage.tsx` - Main container with tabs
- `TasksTab.tsx` - Tasks management with view modes
- `TaskListView.tsx` - Table view of tasks
- `TaskKanbanView.tsx` - Kanban board view
- `TaskGridView.tsx` - Grid card view
- `TaskDrawer.tsx` - Task detail drawer
- `ApprovalsTab.tsx` - Approvals list
- `ApprovalDrawer.tsx` - Approval detail drawer
- `IssuesTab.tsx` - Issues list
- `IssueDetailPage.tsx` - Full issue detail page
- `IssueDetailPageWrapper.tsx` - Wrapper with state management

## Dummy Data

Comprehensive dummy data in `data.ts` includes:
- 20 tasks with various statuses, priorities, and sources
- 9 approvals (pending, approved, rejected)
- 10 issues with different severity levels
- 7 users
- Comments and activity logs
