/**
 * @module components/ui/loading
 * Module implementation for loading.tsx.
 */

import * as React from "react";

import { cn } from "@/lib/utils";

interface LoadingProps {
  label?: string;
  className?: string;
}

/**
 * Executes Loading.
 * @param param1 - param1 input.
 * @returns The resulting value.
 */
export function Loading({ label = "Loading...", className }: LoadingProps) {
  return (
    <div className={cn("flex items-center gap-3 text-sm text-gray-600", className)}>
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-200 border-t-brand-primary" />
      <span>{label}</span>
    </div>
  );
}
