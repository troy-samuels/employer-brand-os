/**
 * @module lib/ats/providers/index
 * Unified interface for all ATS provider API clients.
 */

import type { RawJob } from "./greenhouse";
import { fetchGreenhouseJobs } from "./greenhouse";
import { fetchLeverJobs } from "./lever";
import { fetchAshbyJobs } from "./ashby";
import type { ATSProvider } from "../detect";

export type { RawJob };

/**
 * Fetch jobs from any supported ATS provider
 * 
 * @param provider - The ATS provider name
 * @param token - The board token/company identifier
 * @returns Array of normalized job postings
 * 
 * @example
 * ```typescript
 * const jobs = await fetchJobsFromProvider("greenhouse", "monzo");
 * ```
 */
export async function fetchJobsFromProvider(
  provider: ATSProvider,
  token: string
): Promise<RawJob[]> {
  switch (provider) {
    case "greenhouse":
      return fetchGreenhouseJobs(token);
    case "lever":
      return fetchLeverJobs(token);
    case "ashby":
      return fetchAshbyJobs(token);
    case "workable":
    case "teamtailor":
    case "smartrecruiters":
    case "bamboohr":
      // Not yet implemented - return empty array
      console.warn(`[ATS] Provider ${provider} not yet implemented`);
      return [];
    default:
      console.error(`[ATS] Unknown provider: ${provider}`);
      return [];
  }
}
