/**
 * @module lib/hooks/use-analytics
 * Module implementation for use-analytics.ts.
 */

"use client";

import { useEffect, useState } from "react";
import { toast } from "@/components/ui/sonner";
import type { AnalyticsOverview } from "@/types/analytics";

/**
 * Executes useAnalytics.
 * @returns The resulting value.
 */
export function useAnalytics() {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch("/api/analytics");
        if (!response.ok) {
          throw new Error("Unable to load analytics");
        }
        const data = (await response.json()) as { analytics: AnalyticsOverview };
        setOverview(data.analytics);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to load analytics";
        toast.error("Analytics error", { description: message });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  return { overview, isLoading };
}
