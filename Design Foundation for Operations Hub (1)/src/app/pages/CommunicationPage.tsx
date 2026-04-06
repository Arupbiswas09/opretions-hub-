import React, { useState, useMemo } from 'react';
import { ModuleHeader } from '@/app/components/ModuleHeader';
import { conversations as initialConversations } from './communication/data';
import { Conversation, Channel, ConversationStatus, EntityType } from './communication/types';
import { ConversationListItem } from './communication/ConversationListItem';
import { ConversationDetail } from './communication/ConversationDetail';
import { AIDraftPanel } from './communication/AIDraftPanel';
import { CreateTaskModal } from './communication/CreateTaskModal';
import { EmptyConversations } from './communication/EmptyConversations';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { X } from 'lucide-react';
import { toast } from 'sonner';

export const CommunicationPage: React.FC = () => {
  const [conversations] = useState<Conversation[]>(initialConversations);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(
    initialConversations[0]
  );

  // Filters
  const [channelFilter, setChannelFilter] = useState<Channel | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<ConversationStatus | 'all'>('all');
  const [entityFilter, setEntityFilter] = useState<EntityType | 'all'>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');

  // UI States
  const [showAIDraft, setShowAIDraft] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);

  // Filtered conversations
  const filteredConversations = useMemo(() => {
    return conversations.filter((conv) => {
      if (channelFilter !== 'all' && conv.channel !== channelFilter) return false;
      if (statusFilter !== 'all' && conv.status !== statusFilter) return false;
      if (entityFilter !== 'all' && !conv.linkedEntities.some(e => e.type === entityFilter)) return false;
      if (assigneeFilter !== 'all' && conv.assignedTo !== assigneeFilter) return false;
      return true;
    });
  }, [conversations, channelFilter, statusFilter, entityFilter, assigneeFilter]);

  const hasActiveFilters = channelFilter !== 'all' || statusFilter !== 'all' || entityFilter !== 'all' || assigneeFilter !== 'all';

  const clearFilters = () => {
    setChannelFilter('all');
    setStatusFilter('all');
    setEntityFilter('all');
    setAssigneeFilter('all');
  };

  const handleConversationClick = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setShowAIDraft(false);
  };

  const handleAIDraft = () => {
    setShowAIDraft(true);
  };

  const handleSendDraft = (message: string) => {
    toast.success('Reply sent successfully');
    setShowAIDraft(false);
  };

  const handleCreateTask = (task: any) => {
    toast.success('Task created successfully');
    setShowCreateTask(false);
  };

  const handleCreateIssue = () => {
    toast.success('Issue creation modal would open here');
  };

  return (
    <div className="h-full flex flex-col">
      <ModuleHeader title="Communication" />

      {/* Content Wrapper - matches other modules */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Filters Bar */}
        <div className="border-b bg-card px-8 py-4 shrink-0">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Select value={channelFilter} onValueChange={(val) => setChannelFilter(val as Channel | 'all')}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Channel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Channels</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="internal">Internal</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val as ConversationStatus | 'all')}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="unread">Unread</SelectItem>
                  <SelectItem value="awaiting-reply">Awaiting Reply</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>

              <Select value={entityFilter} onValueChange={(val) => setEntityFilter(val as EntityType | 'all')}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Entity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="project">Project</SelectItem>
                  <SelectItem value="job">Job</SelectItem>
                  <SelectItem value="candidate">Candidate</SelectItem>
                  <SelectItem value="deal">Deal</SelectItem>
                </SelectContent>
              </Select>

              <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Assigned to" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Assignees</SelectItem>
                  <SelectItem value="me">Me</SelectItem>
                  <SelectItem value="sarah">Sarah</SelectItem>
                  <SelectItem value="john">John</SelectItem>
                  <SelectItem value="team">Team</SelectItem>
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Clear Filters
                </Button>
              )}
            </div>

            {hasActiveFilters && (
              <Badge variant="secondary">
                {filteredConversations.length} of {conversations.length} conversations
              </Badge>
            )}
          </div>
        </div>

        {/* Main Content: 2 Column Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Column: Conversation List */}
          <div className="w-[400px] min-w-[350px] max-w-[500px] border-r flex flex-col bg-card">
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <EmptyConversations />
              ) : (
                filteredConversations.map((conversation) => (
                  <ConversationListItem
                    key={conversation.id}
                    conversation={conversation}
                    isSelected={selectedConversation?.id === conversation.id}
                    onClick={() => handleConversationClick(conversation)}
                  />
                ))
              )}
            </div>
          </div>

          {/* Right Column: Conversation Detail */}
          <div className="flex-1 flex flex-col bg-background overflow-hidden">
            {selectedConversation ? (
              <>
                <ConversationDetail
                  conversation={selectedConversation}
                  onAIDraft={handleAIDraft}
                  onCreateTask={() => setShowCreateTask(true)}
                  onCreateIssue={handleCreateIssue}
                />
                {showAIDraft && (
                  <AIDraftPanel
                    conversation={selectedConversation}
                    onClose={() => setShowAIDraft(false)}
                    onSend={handleSendDraft}
                  />
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">Select a conversation to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Task Modal */}
      {selectedConversation && (
        <CreateTaskModal
          conversation={selectedConversation}
          open={showCreateTask}
          onClose={() => setShowCreateTask(false)}
          onCreateTask={handleCreateTask}
        />
      )}
    </div>
  );
};