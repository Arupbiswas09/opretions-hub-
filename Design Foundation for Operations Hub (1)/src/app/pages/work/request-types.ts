// Request-specific types

export type RequestType = 'client' | 'employee' | 'freelancer' | 'internal';
export type RequestCategory = 'new-talent' | 'change-request' | 'support' | 'leave' | 'payment' | 'access' | 'other';
export type RequestStatus = 'new' | 'in-review' | 'approved' | 'rejected' | 'fulfilled' | 'converted';

export interface Request {
  id: string;
  requestType: RequestType;
  category: RequestCategory;
  subject: string;
  description: string;
  requestedById: string;
  requestedByName: string;
  requestedByOrg?: string;
  submittedDate: string;
  dueDate?: string;
  status: RequestStatus;
  ownerId?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  relatedEntityName?: string;
  attachments?: string[];
  comments: RequestComment[];
  activityLog: RequestActivity[];
  convertedTo?: {
    type: 'task' | 'issue' | 'project' | 'job';
    id: string;
  };
}

export interface RequestComment {
  id: string;
  userId: string;
  text: string;
  timestamp: string;
  isInternal: boolean;
}

export interface RequestActivity {
  id: string;
  userId: string;
  action: string;
  timestamp: string;
  details?: string;
}
