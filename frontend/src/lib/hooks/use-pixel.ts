"use client";

import { useEffect, useState } from "react";
import { toast } from "@/components/ui/sonner";

interface PixelStatus {
  status: "active" | "paused" | "error";
  last_seen_at: string;
  schema_version: string;
  jobs_injected: number;
}

export function usePixel() {
  const [status, setStatus] = useState<PixelStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPixel = async () => {
      try {
        const response = await fetch("/api/pixel");
        if (!response.ok) {
          throw new Error("Unable to load pixel status");
        }
        const data = (await response.json()) as { pixel: PixelStatus };
        setStatus(data.pixel);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to load pixel status";
        toast.error("Pixel status error", { description: message });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPixel();
  }, []);

  return { status, isLoading };
}
