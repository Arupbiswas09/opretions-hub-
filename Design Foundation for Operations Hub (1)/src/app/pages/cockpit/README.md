# Cockpit Module

## Overview
The Cockpit is the main operational dashboard for internal employees, providing a comprehensive view of tasks, AI insights, meetings, and quick actions with a clean, subtle design featuring soft colors and rounded square shapes.

## Design System
- **Color Palette**: Soft, muted backgrounds with proper contrast
  - Priority badges: Subtle reds (high), ambers (medium), slates (low)
  - Status badges: Soft blues, greens, yellows, and reds on light backgrounds
  - Entity badges: Pastel purples, indigos, teals, and pinks
- **Border Radius**: Rounded squares (rounded-lg) instead of full ovals
- **Typography**: Clean hierarchy with Inter font family
- **Spacing**: Consistent padding and gaps for readability

## Components

### Main Page
- **CockpitPage.tsx** - Main orchestrator component that brings everything together

### KPI Section
- **KpiTiles.tsx** - Displays 6 key performance indicators that are clickable and navigate to respective modules
  - Overdue Tasks → Work module (filtered)
  - Projects at Risk → Projects module (filtered)
  - Unanswered Messages → Communication module (filtered)
  - Open Roles → Recruitment module (filtered)
  - Revenue This Month → Finance module (filtered)
  - Pending Approvals → Work module (filtered)

### My Work Section
- **MyWork.tsx** - Main work management component with tabs and view toggles
  - Tabs: Today, Tomorrow, This Week, Overdue, Waiting
  - Views: List, Kanban, Grid
  - Filters: Priority, Status, Entity Type
- **TaskList.tsx** - List view of tasks with inline actions
- **TaskKanban.tsx** - Kanban board view with status columns
- **TaskGrid.tsx** - Card grid view of tasks

### Right Panel Components
- **AiInbox.tsx** - AI-generated insights and recommendations panel
  - Insight types: Follow-up, Risk, Missing Info, Blocker
  - Actions: Accept, Snooze, Dismiss
- **TodaysCalendar.tsx** - Today's meetings with time and participants
- **QuickCapture.tsx** - Quick input for tasks, notes, and issues

### Drawers and Modals
- **TaskDrawer.tsx** - Right-side drawer for task details
  - Full task information
  - Comments thread
  - AI suggestions
  - Quick actions
- **MeetingDrawer.tsx** - Right-side drawer for meeting details
  - Meeting summary
  - Participants
  - AI meeting summary
  - Action item extraction
- **AiDetailModal.tsx** - Modal for AI insight details
  - Expanded reasoning
  - Suggested actions
  - Create task or link to existing

### Data
- **data.ts** - Comprehensive dummy data including:
  - Users (5 internal team members)
  - Clients (6 companies)
  - Projects (8 active projects)
  - Jobs (3 open positions)
  - Candidates (2 in pipeline)
  - Tasks (16 tasks with various states)
  - AI Insights (8 AI-generated recommendations)
  - Meetings (6 meetings for today)
  - KPI Data (6 key metrics)

### Loading States
- **LoadingState.tsx** - Skeleton loading state for entire Cockpit

## Features

### Task Management
- View tasks by time period (Today, Tomorrow, This Week, Overdue, Waiting)
- Switch between List, Kanban, and Grid views
- Filter by priority, status, and entity type
- Click tasks to see full details in drawer
- Mark tasks complete with checkbox
- Quick actions: comment, reassign, set due date

### AI Insights
- 8 AI-generated insights with contextual recommendations
- Color-coded by type (Follow-up, Risk, Missing Info, Blocker)
- Priority indicators
- Accept to create task, Snooze to remind later, or Dismiss
- Click for expanded reasoning and suggested actions

### Calendar Integration
- Today's meetings with time slots
- Linked to related projects/clients
- Click to see meeting details
- AI meeting summary
- Extract action items from meetings

### Quick Capture
- Natural language input for quick task creation
- Create tasks, notes, or log issues
- Recent captures history

### Data Relationships
All data is interconnected:
- Tasks link to Projects, Clients, Jobs, or Candidates
- Meetings link to Projects or Clients
- AI Insights reference specific entities
- KPIs navigate to filtered views in other modules

## Dummy Data Details

### Timeline
- Current date: January 25, 2026 (Saturday)
- 3 overdue tasks (Jan 22-24)
- 4 tasks due today (Jan 25)
- 3 tasks due tomorrow (Jan 26)
- 4 tasks due this week (Jan 27-30)
- 2 blocked tasks
- 2 waiting tasks

### Task Distribution
- 2 recruitment tasks (interview follow-ups)
- 2 sales tasks (contract, forecast)
- 9 project delivery tasks
- 1 approval task
- 2 client tasks

### Priority Distribution
- 8 high priority tasks
- 6 medium priority tasks
- 2 low priority tasks

## User Interactions

### Clickable Elements
1. **KPI Tiles** - Navigate to filtered module views
2. **Tasks** - Open task drawer
3. **Meetings** - Open meeting drawer
4. **AI Insights** - Open detailed modal or accept/snooze/dismiss
5. **View Toggles** - Switch between List/Kanban/Grid
6. **Tabs** - Filter tasks by time period
7. **Filters** - Filter by priority, status, entity type
8. **Quick Actions** - Comment, reassign, reschedule tasks

### Toast Notifications
All actions show toast notifications:
- Task completed
- Task created
- Insight accepted/snoozed/dismissed
- Quick capture saved

## Future Enhancements
- Real-time updates
- Drag-and-drop task reordering
- Bulk task operations
- Custom views and saved filters
- Task templates
- Advanced AI recommendations
- Meeting recording integration
- Voice-to-task quick capture