/**
 * @module lib/hooks/use-jobs
 * Module implementation for use-jobs.ts.
 */

"use client";

import { useEffect, useState } from "react";
import { toast } from "@/components/ui/sonner";
import type { JobPosting } from "@/types/jobs";

/**
 * Executes useJobs.
 * @returns The resulting value.
 */
export function useJobs() {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch("/api/jobs");
        if (!response.ok) {
          throw new Error("Unable to load jobs");
        }
        const data = (await response.json()) as { jobs: JobPosting[] };
        setJobs(data.jobs);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to load jobs";
        toast.error("Job data error", { description: message });
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, []);

  return { jobs, isLoading };
}
