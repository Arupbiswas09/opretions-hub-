import React from 'react';
import { Conversation } from './types';
import { Mail, MessageCircle, MessageSquare, StickyNote } from 'lucide-react';
import { Tag } from '@/app/components/ui/tag';
import { formatDistanceToNow } from 'date-fns';

interface ConversationListItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
}

const channelIcons = {
  email: Mail,
  linkedin: MessageCircle,
  whatsapp: MessageSquare,
  internal: StickyNote,
};

const channelColors = {
  email: 'text-blue-600',
  linkedin: 'text-blue-700',
  whatsapp: 'text-green-600',
  internal: 'text-gray-600',
};

const entityTypeVariants: Record<string, any> = {
  client: 'entity-client',
  project: 'entity-project',
  job: 'entity-job',
  candidate: 'entity-candidate',
  deal: 'entity-deal',
  contact: 'entity-contact',
};

export const ConversationListItem: React.FC<ConversationListItemProps> = ({
  conversation,
  isSelected,
  onClick,
}) => {
  const Icon = channelIcons[conversation.channel];
  const iconColor = channelColors[conversation.channel];

  return (
    <div
      onClick={onClick}
      className={`p-4 border-b cursor-pointer hover:bg-accent/50 transition-colors ${
        isSelected ? 'bg-accent' : 'bg-white'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Channel Icon */}
        <div className={`mt-1 ${iconColor}`}>
          <Icon className="h-4 w-4" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Contact Name & Timestamp */}
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2">
              <span className={`font-medium truncate ${conversation.isUnread ? 'text-foreground' : 'text-foreground/90'}`}>
                {conversation.primaryContact.name}
              </span>
              {conversation.isUnread && (
                <div className="h-2 w-2 rounded-full bg-blue-600" />
              )}
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {formatDistanceToNow(new Date(conversation.lastActivity), { addSuffix: true })}
            </span>
          </div>

          {/* Subject (Email only) */}
          {conversation.subject && (
            <div className={`text-sm mb-1 truncate ${conversation.isUnread ? 'font-medium' : ''}`}>
              {conversation.subject}
            </div>
          )}

          {/* Snippet */}
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {conversation.snippet}
          </p>

          {/* Linked Entities */}
          {conversation.linkedEntities.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {conversation.linkedEntities.slice(0, 3).map((entity) => (
                <Tag
                  key={entity.id}
                  variant={entityTypeVariants[entity.type]}
                  className="text-xs"
                >
                  {entity.name}
                </Tag>
              ))}
              {conversation.linkedEntities.length > 3 && (
                <Tag variant="neutral" className="text-xs">
                  +{conversation.linkedEntities.length - 3}
                </Tag>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};