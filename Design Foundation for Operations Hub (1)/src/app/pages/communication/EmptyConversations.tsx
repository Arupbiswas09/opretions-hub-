import React from 'react';
import { MessageSquare, Mail, MessageCircle } from 'lucide-react';

export const EmptyConversations: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-full p-8">
      <div className="text-center max-w-md">
        <div className="flex justify-center gap-4 mb-6">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Mail className="h-6 w-6 text-blue-600" />
          </div>
          <div className="p-3 bg-blue-100 rounded-lg">
            <MessageCircle className="h-6 w-6 text-blue-600" />
          </div>
          <div className="p-3 bg-green-100 rounded-lg">
            <MessageSquare className="h-6 w-6 text-green-600" />
          </div>
        </div>
        <h3 className="text-lg font-semibold mb-2">No conversations to show</h3>
        <p className="text-muted-foreground">
          New messages from email, LinkedIn, and WhatsApp will appear here.
        </p>
      </div>
    </div>
  );
};
