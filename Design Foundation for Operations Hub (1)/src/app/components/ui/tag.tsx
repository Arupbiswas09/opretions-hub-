import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./utils";

/**
 * GLOBAL TAG/CHIP COMPONENT SYSTEM
 * 
 * Design rules:
 * - Background: very light tint (5-10% opacity)
 * - Text: darker tone of same color
 * - Border: subtle 1px border (same color, ~20-30% opacity)
 * - Shape: pill / rounded
 * - Font: small / label
 * - NO fully saturated or bright colors
 */

const tagVariants = cva(
  "inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-medium border transition-colors whitespace-nowrap",
  {
    variants: {
      variant: {
        // PRIORITY TAGS
        "priority-high": 
          "bg-red-50 text-red-700 border-red-100",
        "priority-medium": 
          "bg-amber-50 text-amber-700 border-amber-100",
        "priority-low": 
          "bg-gray-50 text-gray-600 border-gray-100",
        
        // STATUS TAGS
        "status-todo": 
          "bg-gray-50 text-gray-700 border-gray-100",
        "status-in-progress": 
          "bg-blue-50 text-blue-700 border-blue-100",
        "status-blocked": 
          "bg-red-50 text-red-700 border-red-100",
        "status-waiting": 
          "bg-purple-50 text-purple-700 border-purple-100",
        "status-done": 
          "bg-green-50 text-green-700 border-green-100",
        "status-pending": 
          "bg-amber-50 text-amber-700 border-amber-100",
        "status-approved": 
          "bg-green-50 text-green-700 border-green-100",
        "status-rejected": 
          "bg-red-50 text-red-700 border-red-100",
        
        // ENTITY / SOURCE TAGS (all muted neutral tones)
        "entity-client": 
          "bg-blue-50 text-blue-700 border-blue-100",
        "entity-project": 
          "bg-purple-50 text-purple-700 border-purple-100",
        "entity-job": 
          "bg-orange-50 text-orange-700 border-orange-100",
        "entity-candidate": 
          "bg-green-50 text-green-700 border-green-100",
        "entity-talent": 
          "bg-green-50 text-green-700 border-green-100",
        "entity-deal": 
          "bg-amber-50 text-amber-700 border-amber-100",
        "entity-contact": 
          "bg-gray-50 text-gray-700 border-gray-200",
        "entity-communication": 
          "bg-cyan-50 text-cyan-700 border-cyan-100",
        
        // TYPE TAGS
        "type-task": 
          "bg-blue-50 text-blue-700 border-blue-100",
        "type-request": 
          "bg-purple-50 text-purple-700 border-purple-100",
        "type-issue": 
          "bg-red-50 text-red-700 border-red-100",
        "type-approval": 
          "bg-green-50 text-green-700 border-green-100",
        
        // CHANNEL TAGS
        "channel-email": 
          "bg-blue-50 text-blue-700 border-blue-100",
        "channel-linkedin": 
          "bg-blue-50 text-blue-700 border-blue-100",
        "channel-whatsapp": 
          "bg-green-50 text-green-700 border-green-100",
        "channel-internal": 
          "bg-gray-50 text-gray-700 border-gray-100",
        
        // DEFAULT NEUTRAL
        "neutral": 
          "bg-gray-50 text-gray-700 border-gray-100",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  }
);

export interface TagProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof tagVariants> {}

function Tag({ className, variant, ...props }: TagProps) {
  return (
    <span
      className={cn(tagVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Tag, tagVariants };
