import React, { useState } from 'react';
import { Conversation } from './types';
import { Mail, MessageCircle, MessageSquare, StickyNote, Sparkles, FileText, Plus, Link } from 'lucide-react';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Separator } from '@/app/components/ui/separator';
import { formatDistanceToNow, format } from 'date-fns';

interface ConversationDetailProps {
  conversation: Conversation;
  onAIDraft: () => void;
  onCreateTask: () => void;
  onCreateIssue: () => void;
}

const channelIcons = {
  email: Mail,
  linkedin: MessageCircle,
  whatsapp: MessageSquare,
  internal: StickyNote,
};

const entityColors: Record<string, string> = {
  client: 'bg-blue-50 text-blue-700 border-blue-100',
  project: 'bg-purple-50 text-purple-700 border-purple-100',
  job: 'bg-orange-50 text-orange-700 border-orange-100',
  candidate: 'bg-green-50 text-green-700 border-green-100',
  deal: 'bg-amber-50 text-amber-700 border-amber-100',
  contact: 'bg-gray-50 text-gray-700 border-gray-200',
};

export const ConversationDetail: React.FC<ConversationDetailProps> = ({
  conversation,
  onAIDraft,
  onCreateTask,
  onCreateIssue,
}) => {
  const Icon = channelIcons[conversation.channel];
  const [showSummarize, setShowSummarize] = useState(false);

  const handleSummarize = () => {
    setShowSummarize(true);
    setTimeout(() => setShowSummarize(false), 3000);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b bg-card p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <Icon className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-xl font-semibold truncate">
                {conversation.primaryContact.name}
              </h2>
            </div>
            {conversation.subject && (
              <p className="text-sm text-muted-foreground mb-2">{conversation.subject}</p>
            )}
            {conversation.linkedEntities.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {conversation.linkedEntities.map((entity) => (
                  <Badge
                    key={entity.id}
                    variant="outline"
                    className={`${entityColors[entity.type]}`}
                  >
                    {entity.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <div className="text-sm text-muted-foreground whitespace-nowrap">
            {formatDistanceToNow(new Date(conversation.lastActivity), { addSuffix: true })}
          </div>
        </div>
      </div>

      {/* AI Summary (if shown) */}
      {showSummarize && (
        <div className="mx-6 mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Sparkles className="h-4 w-4 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900 mb-1">AI Summary</p>
              <p className="text-sm text-blue-800">
                This conversation discusses {conversation.subject?.toLowerCase() || 'various topics'} with{' '}
                {conversation.primaryContact.name}. There are {conversation.messages.length} messages exchanged.
                {conversation.linkedEntities.length > 0 && (
                  <> Related to: {conversation.linkedEntities.map(e => e.name).join(', ')}.</>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {conversation.messages.map((message, index) => (
          <div key={message.id}>
            <div className={`flex ${message.sender.isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-2xl ${message.sender.isMe ? 'ml-12' : 'mr-12'}`}>
                {/* Message Header */}
                <div className={`flex items-center gap-2 mb-1 ${message.sender.isMe ? 'justify-end' : 'justify-start'}`}>
                  <span className="text-sm font-medium">{message.sender.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(message.timestamp), 'MMM d, h:mm a')}
                  </span>
                </div>
                {/* Message Content */}
                <div
                  className={`p-4 rounded-lg ${
                    message.sender.isMe
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                </div>
              </div>
            </div>
            {index < conversation.messages.length - 1 && <Separator className="my-4" />}
          </div>
        ))}
      </div>

      {/* Action Bar */}
      <div className="border-t bg-card p-4">
        <div className="flex items-center justify-between gap-4">
          {/* Manual Actions */}
          <div className="flex items-center gap-2">
            <Button variant="default">
              Reply
            </Button>
            <Button variant="outline" onClick={() => {}}>
              <Link className="h-4 w-4 mr-2" />
              Link to Record
            </Button>
          </div>

          {/* AI Actions */}
          <div className="flex items-center gap-2">
            <Separator orientation="vertical" className="h-8 mx-2" />
            <Button
              variant="outline"
              className="border-purple-200 hover:bg-purple-50"
              onClick={onAIDraft}
            >
              <Sparkles className="h-4 w-4 mr-2 text-purple-600" />
              AI Draft
            </Button>
            <Button
              variant="outline"
              className="border-purple-200 hover:bg-purple-50"
              onClick={handleSummarize}
            >
              <FileText className="h-4 w-4 mr-2 text-purple-600" />
              Summarize
            </Button>
            <Separator orientation="vertical" className="h-8 mx-2" />
            <Button variant="outline" onClick={onCreateTask}>
              <Plus className="h-4 w-4 mr-2" />
              Create Task
            </Button>
            <Button variant="outline" onClick={onCreateIssue}>
              <Plus className="h-4 w-4 mr-2" />
              Create Issue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};