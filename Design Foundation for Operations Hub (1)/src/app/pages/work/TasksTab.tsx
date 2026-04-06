import React, { useState, useMemo } from 'react';
import { Button } from '@/app/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { List, LayoutGrid, Columns3, Plus } from 'lucide-react';
import { Task, TaskPriority, TaskStatus, EntityType, TaskSource } from './types';
import { TaskListView } from './TaskListView';
import { TaskKanbanView } from './TaskKanbanView';
import { TaskGridView } from './TaskGridView';
import { TaskDrawer } from './TaskDrawer';
import { users } from './data';

interface TasksTabProps {
  tasks: Task[];
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
}

type ViewMode = 'list' | 'kanban' | 'grid';
type AssigneeFilter = 'all' | 'me' | 'team' | string;

export const TasksTab: React.FC<TasksTabProps> = ({ tasks, onTaskUpdate }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [assigneeFilter, setAssigneeFilter] = useState<AssigneeFilter>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [entityFilter, setEntityFilter] = useState<EntityType | 'all'>('all');
  const [sourceFilter, setSourceFilter] = useState<TaskSource | 'all'>('all');
  const [dueDateFilter, setDueDateFilter] = useState<'all' | 'overdue' | 'today' | 'week'>('all');
  
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const currentUserId = '1'; // In real app, this would come from auth context

  const filteredTasks = useMemo(() => {
    const now = new Date('2026-01-26'); // Current date for demo
    const today = now.toISOString().split('T')[0];
    const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    return tasks.filter((task) => {
      // Assignee filter
      if (assigneeFilter === 'me' && task.assigneeId !== currentUserId) return false;
      if (assigneeFilter === 'team' && task.assigneeId === currentUserId) return false;
      if (assigneeFilter !== 'all' && assigneeFilter !== 'me' && assigneeFilter !== 'team' && task.assigneeId !== assigneeFilter) return false;

      // Priority filter
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;

      // Status filter
      if (statusFilter !== 'all' && task.status !== statusFilter) return false;

      // Entity filter
      if (entityFilter !== 'all' && task.entityType !== entityFilter) return false;

      // Source filter
      if (sourceFilter !== 'all' && task.source !== sourceFilter) return false;

      // Due date filter
      if (dueDateFilter === 'overdue' && !task.isOverdue) return false;
      if (dueDateFilter === 'today' && task.dueDate !== today) return false;
      if (dueDateFilter === 'week' && (task.dueDate < today || task.dueDate > weekEnd)) return false;

      return true;
    });
  }, [tasks, assigneeFilter, priorityFilter, statusFilter, entityFilter, sourceFilter, dueDateFilter, currentUserId]);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsCreating(false);
    setIsDrawerOpen(true);
  };

  const handleNewTask = () => {
    setSelectedTask(null);
    setIsCreating(true);
    setIsDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setSelectedTask(null);
    setIsCreating(false);
  };

  const handleTaskSave = (updates: Partial<Task>) => {
    if (selectedTask) {
      onTaskUpdate(selectedTask.id, updates);
    }
    handleDrawerClose();
  };

  return (
    <div>
      {/* Header with filters and view toggle */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={assigneeFilter} onValueChange={(val) => setAssigneeFilter(val as AssigneeFilter)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Assignee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Assignees</SelectItem>
              <SelectItem value="me">Me</SelectItem>
              <SelectItem value="team">Team</SelectItem>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={(val) => setPriorityFilter(val as TaskPriority | 'all')}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val as TaskStatus | 'all')}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="blocked">Blocked</SelectItem>
              <SelectItem value="waiting">Waiting</SelectItem>
              <SelectItem value="done">Done</SelectItem>
            </SelectContent>
          </Select>

          <Select value={entityFilter} onValueChange={(val) => setEntityFilter(val as EntityType | 'all')}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Entity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="project">Projects</SelectItem>
              <SelectItem value="client">Clients</SelectItem>
              <SelectItem value="job">Jobs</SelectItem>
              <SelectItem value="candidate">Candidates</SelectItem>
              <SelectItem value="internal">Internal</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sourceFilter} onValueChange={(val) => setSourceFilter(val as TaskSource | 'all')}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="ai">AI</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="meeting">Meeting</SelectItem>
              <SelectItem value="manual">Manual</SelectItem>
            </SelectContent>
          </Select>

          <Select value={dueDateFilter} onValueChange={(val) => setDueDateFilter(val as any)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Due Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Dates</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              className={viewMode === 'list' ? 'bg-accent hover:bg-accent/90 text-accent-foreground' : ''}
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'kanban' ? 'default' : 'outline'}
              size="icon"
              className={viewMode === 'kanban' ? 'bg-accent hover:bg-accent/90 text-accent-foreground' : ''}
              onClick={() => setViewMode('kanban')}
            >
              <Columns3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              className={viewMode === 'grid' ? 'bg-accent hover:bg-accent/90 text-accent-foreground' : ''}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>

          <Button onClick={handleNewTask}>
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>

      {/* Views */}
      {viewMode === 'list' && (
        <TaskListView tasks={filteredTasks} onTaskClick={handleTaskClick} onTaskUpdate={onTaskUpdate} />
      )}
      {viewMode === 'kanban' && (
        <TaskKanbanView tasks={filteredTasks} onTaskClick={handleTaskClick} />
      )}
      {viewMode === 'grid' && (
        <TaskGridView tasks={filteredTasks} onTaskClick={handleTaskClick} />
      )}

      {/* Task Drawer */}
      <TaskDrawer
        task={selectedTask}
        open={isDrawerOpen}
        onClose={handleDrawerClose}
        onSave={handleTaskSave}
        isCreating={isCreating}
      />
    </div>
  );
};
