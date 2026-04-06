// Work module types and data

export type TaskStatus = 'todo' | 'in-progress' | 'blocked' | 'waiting' | 'done';
export type TaskPriority = 'high' | 'medium' | 'low';
export type TaskSource = 'ai' | 'email' | 'meeting' | 'manual';
export type EntityType = 'project' | 'client' | 'job' | 'candidate' | 'internal';

export type ApprovalType = 'timesheet' | 'document' | 'invoice' | 'leave';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export type IssueSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IssueStatus = 'open' | 'in-progress' | 'blocked' | 'resolved';

export interface User {
  id: string;
  name: string;
  avatar: string;
  email: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  entityType: EntityType;
  entityId: string;
  entityName: string;
  assigneeId: string;
  createdById: string;
  source: TaskSource;
  isOverdue: boolean;
  comments: Comment[];
  activityLog: ActivityEntry[];
  sourceRequestId?: string; // Link to originating request
}

export interface Comment {
  id: string;
  userId: string;
  text: string;
  timestamp: string;
}

export interface ActivityEntry {
  id: string;
  userId: string;
  action: string;
  timestamp: string;
  details?: string;
}

export interface Approval {
  id: string;
  type: ApprovalType;
  title: string;
  description: string;
  requestedById: string;
  requestedAt: string;
  dueDate: string;
  status: ApprovalStatus;
  entityType: EntityType;
  entityId: string;
  entityName: string;
  isOverdue: boolean;
  comments: Comment[];
  documentUrl?: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  severity: IssueSeverity;
  status: IssueStatus;
  entityType: EntityType;
  entityId: string;
  entityName: string;
  assigneeId: string;
  createdById: string;
  createdAt: string;
  comments: Comment[];
  activityLog: ActivityEntry[];
  sourceRequestId?: string; // Link to originating request
}