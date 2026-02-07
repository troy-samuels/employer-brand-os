import * as React from "react";

import { cn } from "@/lib/utils";

interface ChartProps {
  data: number[];
  className?: string;
  ariaLabel?: string;
}

export function Chart({ data, className, ariaLabel = "Chart" }: ChartProps) {
  const max = Math.max(1, ...data);

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className={cn("flex h-24 items-end gap-2", className)}
    >
      {data.map((value, index) => (
        <div
          key={`${value}-${index}`}
          className="flex-1 rounded-md bg-brand-primary-light"
          style={{ height: `${Math.round((value / max) * 100)}%` }}
        >
          <div className="h-full rounded-md bg-brand-primary" />
        </div>
      ))}
    </div>
  );
}
