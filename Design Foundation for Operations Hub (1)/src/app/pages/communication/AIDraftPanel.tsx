import React, { useState, useEffect } from 'react';
import { Conversation } from './types';
import { Button } from '@/app/components/ui/button';
import { Textarea } from '@/app/components/ui/textarea';
import { Sparkles, RefreshCw, Minus, Briefcase, Calendar, X } from 'lucide-react';
import { Separator } from '@/app/components/ui/separator';

interface AIDraftPanelProps {
  conversation: Conversation;
  onClose: () => void;
  onSend: (message: string) => void;
}

export const AIDraftPanel: React.FC<AIDraftPanelProps> = ({
  conversation,
  onClose,
  onSend,
}) => {
  const [draft, setDraft] = useState('');
  const [isGenerating, setIsGenerating] = useState(true);

  useEffect(() => {
    // Simulate AI generation
    setIsGenerating(true);
    setTimeout(() => {
      // Generate a contextual draft based on the conversation
      const lastMessage = conversation.messages[conversation.messages.length - 1];
      const isReplyNeeded = !lastMessage.sender.isMe;
      
      if (isReplyNeeded) {
        let generatedDraft = `Hi ${conversation.primaryContact.name},\n\n`;
        
        if (conversation.channel === 'email') {
          generatedDraft += `Thank you for your email regarding ${conversation.subject?.toLowerCase() || 'your inquiry'}.\n\n`;
          generatedDraft += `I've reviewed your message and wanted to address your points:\n\n`;
          generatedDraft += `- I'll look into this and get back to you by end of day\n`;
          generatedDraft += `- Please let me know if you need any additional information\n\n`;
          generatedDraft += `Best regards`;
        } else if (conversation.channel === 'linkedin') {
          generatedDraft += `Thank you for reaching out!\n\n`;
          generatedDraft += `I'd be happy to discuss this opportunity further. Are you available for a quick call this week?\n\n`;
          generatedDraft += `Best regards`;
        } else if (conversation.channel === 'whatsapp') {
          generatedDraft = `Thanks for the update! I'll review this and get back to you shortly.`;
        } else {
          generatedDraft += `Thanks for the message. I'll follow up on this today.\n\nBest,`;
        }
        
        setDraft(generatedDraft);
      } else {
        setDraft(`Hi ${conversation.primaryContact.name},\n\nFollowing up on our previous conversation. Let me know if you have any questions.\n\nBest regards`);
      }
      
      setIsGenerating(false);
    }, 1500);
  }, [conversation]);

  const handleRegenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setDraft(`Hi ${conversation.primaryContact.name},\n\nThank you for your message. I wanted to circle back on this and provide an update.\n\nPlease let me know if you have any questions or concerns.\n\nBest regards`);
      setIsGenerating(false);
    }, 1000);
  };

  const handleShorten = () => {
    setDraft(`Hi ${conversation.primaryContact.name},\n\nThanks for your message. I'll review and get back to you soon.\n\nBest`);
  };

  const handleFormalize = () => {
    setDraft(`Dear ${conversation.primaryContact.name},\n\nThank you for your correspondence. I have carefully reviewed your message and will provide a comprehensive response within 24 hours.\n\nShould you require any immediate assistance, please do not hesitate to contact me directly.\n\nWith warm regards,\nYour name`);
  };

  const handleInsertAvailability = () => {
    setDraft(draft + `\n\nI'm available for a call:\n- Tomorrow, 2-4 PM EST\n- Thursday, 10 AM - 12 PM EST\n- Friday morning\n\nLet me know what works for you.`);
  };

  return (
    <div className="border-t bg-blue-50/30">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-600" />
            <span className="font-medium text-sm">AI Draft Reply</span>
            {isGenerating && (
              <span className="text-xs text-muted-foreground animate-pulse">Generating...</span>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Draft Editor */}
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="min-h-[200px] mb-4 bg-white"
          placeholder="AI-generated draft will appear here..."
          disabled={isGenerating}
        />

        {/* AI Action Buttons */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRegenerate}
            disabled={isGenerating}
            className="text-xs"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Regenerate
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleShorten}
            disabled={isGenerating}
            className="text-xs"
          >
            <Minus className="h-3 w-3 mr-1" />
            Shorten
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleFormalize}
            disabled={isGenerating}
            className="text-xs"
          >
            <Briefcase className="h-3 w-3 mr-1" />
            Make Formal
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleInsertAvailability}
            disabled={isGenerating}
            className="text-xs"
          >
            <Calendar className="h-3 w-3 mr-1" />
            Insert Availability
          </Button>
        </div>

        <Separator className="mb-4" />

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Discard
          </Button>
          <Button variant="outline">
            Save as Draft
          </Button>
          <Button onClick={() => onSend(draft)} disabled={isGenerating}>
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};
