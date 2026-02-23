/**
 * @module lib/ats/providers/ashby
 * Ashby job board API client.
 * Uses their public GraphQL endpoint.
 */

import type { RawJob } from "./greenhouse";

const ASHBY_API_ENDPOINT = "https://jobs.ashbyhq.com/api/non-user-graphql";
const FETCH_TIMEOUT_MS = 10000;
const REQUEST_DELAY_MS = 1000; // Rate limiting: 1 request per second

interface AshbyJobPosting {
  id: string;
  title: string;
  location: string;
  department: string;
  employmentType: string;
  description: string; // HTML
  customFields: Array<{
    title: string;
    value: string;
  }>;
}

interface AshbyGraphQLResponse {
  data: {
    jobPostings: AshbyJobPosting[];
  };
}

let lastRequestTime = 0;

/**
 * Rate-limited fetch with timeout
 */
async function rateLimitedFetch(url: string, options: RequestInit): Promise<Response> {
  // Respect rate limit
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < REQUEST_DELAY_MS) {
    await new Promise(resolve => setTimeout(resolve, REQUEST_DELAY_MS - timeSinceLastRequest));
  }
  lastRequestTime = Date.now();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * GraphQL query for fetching job postings
 */
const JOB_POSTINGS_QUERY = `
  query JobPostings($organizationHostedJobsPageName: String!) {
    jobPostings: jobPostingsWithFilters(
      organizationHostedJobsPageName: $organizationHostedJobsPageName
    ) {
      id
      title
      location
      department
      employmentType
      description
      customFields {
        title
        value
      }
    }
  }
`;

/**
 * Fetch all jobs from an Ashby job board
 * 
 * @param boardSlug - The Ashby organization slug
 * @returns Array of normalized job postings
 * 
 * @example
 * ```typescript
 * const jobs = await fetchAshbyJobs("revolut");
 * console.log(`Found ${jobs.length} jobs`);
 * ```
 */
export async function fetchAshbyJobs(boardSlug: string): Promise<RawJob[]> {
  try {
    const response = await rateLimitedFetch(ASHBY_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        query: JOB_POSTINGS_QUERY,
        variables: {
          organizationHostedJobsPageName: boardSlug,
        },
      }),
    });
    
    if (!response.ok) {
      console.error(`[Ashby] API error: ${response.status} ${response.statusText}`);
      return [];
    }
    
    const result = await response.json() as AshbyGraphQLResponse;
    
    if (!result.data?.jobPostings) {
      console.error("[Ashby] Invalid response format");
      return [];
    }
    
    const jobs = result.data.jobPostings;
    
    // Normalize to RawJob format
    return jobs.map(job => ({
      id: job.id,
      title: job.title,
      location: job.location || "Not specified",
      department: job.department || "General",
      description: job.description,
      url: `https://jobs.ashbyhq.com/${boardSlug}/${job.id}`,
      source: "ashby",
      rawData: job,
    }));
    
  } catch (error) {
    console.error("[Ashby] Fetch error:", error);
    return [];
  }
}
