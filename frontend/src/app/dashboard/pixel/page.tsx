"use client";

import { PixelStatus } from "@/components/dashboard/pixel-status";
import { Card } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { usePixel } from "@/lib/hooks/use-pixel";

export default function PixelPage() {
  const { status, isLoading } = usePixel();

  if (isLoading || !status) {
    return <Loading label="Loading pixel status" />;
  }

  return (
    <div className="space-y-6">
      <PixelStatus
        status={status.status}
        lastSeen={status.last_seen_at}
        schemaVersion={status.schema_version}
        jobsInjected={status.jobs_injected}
      />

      <Card variant="bordered" padding="lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Install the Smart Pixel
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Copy-paste this snippet into Google Tag Manager or your site header.
        </p>
        <pre className="rounded-lg bg-gray-900 text-gray-100 p-4 text-xs overflow-x-auto">
{`<script src="https://cdn.brandos.com/pixel/brandos-pixel.js"
  data-brandos-company-id="company_123"
  data-brandos-pixel-id="px_demo_123"
  async></script>`}
        </pre>
      </Card>
    </div>
  );
}
