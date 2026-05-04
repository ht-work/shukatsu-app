import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    className={cn(
      "focus-ring min-h-28 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-colors hover:border-zinc-700",
      className,
    )}
    ref={ref}
    {...props}
  />
));
Textarea.displayName = "Textarea";
