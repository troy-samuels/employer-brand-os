/**
 * @module components/ui/badge
 * Module implementation for badge.tsx.
 */

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        neutral: "bg-gray-100 text-gray-700",
        success: "bg-success-light text-success",
        warning: "bg-warning-light text-warning",
        error: "bg-error-light text-error",
        info: "bg-brand-primary-light text-brand-primary",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  }
);

/**
 * Defines the BadgeProps contract.
 */
export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

/**
 * Executes Badge.
 * @param param1 - param1 input.
 * @returns The resulting value.
 */
export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />;
}
