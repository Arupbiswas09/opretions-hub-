import React, { useState, useMemo } from 'react';
import { Card } from '@/app/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Button } from '@/app/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { List, LayoutGrid, Columns3 } from 'lucide-react';
import { Task, TaskPriority, TaskStatus, EntityType } from './data';
import { TaskList } from './TaskList';
import { TaskKanban } from './TaskKanban';
import { TaskGrid } from './TaskGrid';
import { EmptyState } from '@/app/components/EmptyState';
import { LayoutDashboard } from 'lucide-react';

interface MyWorkProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onTaskComplete: (taskId: string) => void;
}

type ViewMode = 'list' | 'kanban' | 'grid';
type TimeFilter = 'today' | 'tomorrow' | 'week' | 'overdue' | 'waiting';

export const MyWork: React.FC<MyWorkProps> = ({ tasks, onTaskClick, onTaskComplete }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('today');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [entityFilter, setEntityFilter] = useState<EntityType | 'all'>('all');

  const filteredTasks = useMemo(() => {
    const now = new Date('2026-01-25'); // Current date for demo
    const today = now.toISOString().split('T')[0];
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    return tasks.filter((task) => {
      // Time filter
      if (timeFilter === 'today' && task.dueDate !== today) return false;
      if (timeFilter === 'tomorrow' && task.dueDate !== tomorrow) return false;
      if (timeFilter === 'week' && (task.dueDate < today || task.dueDate > weekEnd)) return false;
      if (timeFilter === 'overdue' && !task.isOverdue) return false;
      if (timeFilter === 'waiting' && task.status !== 'waiting') return false;

      // Priority filter
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;

      // Status filter
      if (statusFilter !== 'all' && task.status !== statusFilter) return false;

      // Entity filter
      if (entityFilter !== 'all' && task.entityType !== entityFilter) return false;

      return true;
    });
  }, [tasks, timeFilter, priorityFilter, statusFilter, entityFilter]);

  return (
    <div>
      <Tabs value={timeFilter} onValueChange={(val) => setTimeFilter(val as TimeFilter)}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="tomorrow">Tomorrow</TabsTrigger>
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="overdue">Overdue</TabsTrigger>
            <TabsTrigger value="waiting">Waiting</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
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
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4 flex-wrap">
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
            </SelectContent>
          </Select>
        </div>

        <TabsContent value={timeFilter} className="mt-0">
          {filteredTasks.length === 0 ? (
            <EmptyState
              title="No tasks found"
              description={`You don't have any tasks for this filter.`}
              icon={<LayoutDashboard className="w-12 h-12 text-muted-foreground" />}
            />
          ) : (
            <>
              {viewMode === 'list' && (
                <TaskList
                  tasks={filteredTasks}
                  onTaskClick={onTaskClick}
                  onTaskComplete={onTaskComplete}
                />
              )}
              {viewMode === 'kanban' && (
                <TaskKanban tasks={filteredTasks} onTaskClick={onTaskClick} />
              )}
              {viewMode === 'grid' && (
                <TaskGrid tasks={filteredTasks} onTaskClick={onTaskClick} />
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};