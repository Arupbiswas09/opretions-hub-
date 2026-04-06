export type Channel = 'email' | 'linkedin' | 'whatsapp' | 'internal';

export type ConversationStatus = 'unread' | 'awaiting-reply' | 'done';

export type EntityType = 'client' | 'project' | 'job' | 'candidate' | 'deal' | 'contact';

export interface LinkedEntity {
  id: string;
  type: EntityType;
  name: string;
}

export interface Message {
  id: string;
  sender: {
    id: string;
    name: string;
    email?: string;
    isMe?: boolean;
  };
  content: string;
  timestamp: string;
  channel: Channel;
}

export interface Conversation {
  id: string;
  channel: Channel;
  primaryContact: {
    id: string;
    name: string;
    email?: string;
    avatar?: string;
  };
  subject?: string;
  snippet: string;
  messages: Message[];
  linkedEntities: LinkedEntity[];
  status: ConversationStatus;
  lastActivity: string;
  isUnread: boolean;
  assignedTo?: string;
}

export interface AIAction {
  type: 'draft' | 'summarize' | 'translate' | 'shorten' | 'formalize';
  inProgress: boolean;
}
