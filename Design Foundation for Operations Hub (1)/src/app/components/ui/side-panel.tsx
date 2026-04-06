import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "./utils";

/**
 * GLOBAL SIDE PANEL / DRAWER COMPONENT
 * 
 * Viewport-based side panel with consistent behavior across the app.
 * 
 * Rules:
 * - Positioned relative to viewport (not content frame)
 * - Height = 100% of viewport
 * - Fixed width (420-480px)
 * - Internal scrolling inside panel
 * - Background content locked when panel is open
 * - Background visually dimmed with overlay
 */

const SidePanel = DialogPrimitive.Root;
const SidePanelTrigger = DialogPrimitive.Trigger;
const SidePanelClose = DialogPrimitive.Close;
const SidePanelPortal = DialogPrimitive.Portal;

const SidePanelOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/50",
      "data-[state=open]:animate-in data-[state=closed]:animate-out",
      "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));
SidePanelOverlay.displayName = DialogPrimitive.Overlay.displayName;

const SidePanelContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    side?: "left" | "right";
    width?: "sm" | "md" | "lg";
  }
>(({ side = "right", width = "md", className, children, ...props }, ref) => {
  const widthClasses = {
    sm: "w-[420px]",
    md: "w-[480px]",
    lg: "w-[600px]",
  };

  const sideClasses = {
    left: "left-0 border-r",
    right: "right-0 border-l",
  };

  const animationClasses = {
    left: "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left",
    right: "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
  };

  return (
    <SidePanelPortal>
      <SidePanelOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed z-50 bg-white shadow-lg",
          "inset-y-0 flex flex-col",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          animationClasses[side],
          "data-[state=closed]:duration-300 data-[state=open]:duration-500",
          widthClasses[width],
          sideClasses[side],
          className
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </SidePanelPortal>
  );
});
SidePanelContent.displayName = DialogPrimitive.Content.displayName;

const SidePanelHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex items-center justify-between border-b px-6 py-4 shrink-0",
      className
    )}
    {...props}
  />
);
SidePanelHeader.displayName = "SidePanelHeader";

const SidePanelBody = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex-1 overflow-y-auto px-6 py-6", className)}
    {...props}
  />
);
SidePanelBody.displayName = "SidePanelBody";

const SidePanelFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex items-center gap-3 border-t px-6 py-4 shrink-0",
      className
    )}
    {...props}
  />
);
SidePanelFooter.displayName = "SidePanelFooter";

const SidePanelTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold text-foreground", className)}
    {...props}
  />
));
SidePanelTitle.displayName = DialogPrimitive.Title.displayName;

const SidePanelDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
SidePanelDescription.displayName = DialogPrimitive.Description.displayName;

const SidePanelCloseButton = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Close>) => (
  <DialogPrimitive.Close
    className={cn(
      "rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100",
      "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
      "disabled:pointer-events-none",
      className
    )}
    {...props}
  >
    <X className="h-5 w-5" />
    <span className="sr-only">Close</span>
  </DialogPrimitive.Close>
);
SidePanelCloseButton.displayName = "SidePanelCloseButton";

export {
  SidePanel,
  SidePanelTrigger,
  SidePanelClose,
  SidePanelContent,
  SidePanelHeader,
  SidePanelBody,
  SidePanelFooter,
  SidePanelTitle,
  SidePanelDescription,
  SidePanelCloseButton,
};
