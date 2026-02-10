/**
 * @module components/dashboard/pixel-status
 * Module implementation for pixel-status.tsx.
 */

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface PixelStatusProps {
  status: "active" | "paused" | "error";
  lastSeen: string;
  schemaVersion: string;
  jobsInjected: number;
}

/**
 * Executes PixelStatus.
 * @param param1 - param1 input.
 * @returns The resulting value.
 */
export function PixelStatus({ status, lastSeen, schemaVersion, jobsInjected }: PixelStatusProps) {
  return (
    <Card variant="bordered" padding="lg">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Smart Pixel Status</h3>
          <p className="text-sm text-gray-500">Last ping: {lastSeen}</p>
        </div>
        <Badge
          variant={status === "active" ? "success" : status === "paused" ? "warning" : "error"}
        >
          {status.toUpperCase()}
        </Badge>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg bg-gray-50 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">Facts injected</p>
          <p className="text-lg font-semibold text-gray-900 mt-1">{jobsInjected}</p>
        </div>
        <div className="rounded-lg bg-gray-50 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">Schema version</p>
          <p className="text-lg font-semibold text-gray-900 mt-1">{schemaVersion}</p>
        </div>
      </div>
    </Card>
  );
}
