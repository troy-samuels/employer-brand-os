/**
 * @module components/ui/textarea
 * Exposes a styled textarea component with forwarded ref support.
 */

import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Props supported by the textarea primitive.
 */
export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

/**
 * Renders a styled textarea input control.
 * @param props - Native textarea props with optional className overrides.
 * @returns The textarea element.
 */
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
