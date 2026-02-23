/**
 * @module lib/ats/providers/lever
 * Lever job board API client.
 * Public API documentation: https://github.com/lever/postings-api
 */

import type { RawJob } from "./greenhouse";

const LEVER_API_BASE = "https://api.lever.co/v0/postings";
const FETCH_TIMEOUT_MS = 10000;
const REQUEST_DELAY_MS = 1000; // Rate limiting: 1 request per second

export interface LeverJob {
  id: string;
  text: string; // Job title
  categories: {
    team?: string;
    department?: string;
    location?: string;
    commitment?: string;
  };
  description: string; // HTML job description
  descriptionPlain: string; // Plain text version
  lists: Array<{
    text: string;
    content: string;
  }>;
  additional: string; // Additional HTML content
  additionalPlain: string; // Plain text version
  hostedUrl: string;
  applyUrl: string;
  createdAt: number;
}

let lastRequestTime = 0;

/**
 * Rate-limited fetch with timeout
 */
async function rateLimitedFetch(url: string): Promise<Response> {
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
      signal: controller.signal,
      headers: {
        "Accept": "application/json",
      },
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Fetch all jobs from a Lever job board
 * 
 * @param company - The Lever company identifier (slug)
 * @returns Array of normalized job postings
 * 
 * @example
 * ```typescript
 * const jobs = await fetchLeverJobs("revolut");
 * console.log(`Found ${jobs.length} jobs`);
 * ```
 */
export async function fetchLeverJobs(company: string): Promise<RawJob[]> {
  try {
    const url = `${LEVER_API_BASE}/${company}`;
    const response = await rateLimitedFetch(url);
    
    if (!response.ok) {
      console.error(`[Lever] API error: ${response.status} ${response.statusText}`);
      return [];
    }
    
    const jobs = await response.json() as LeverJob[];
    
    if (!Array.isArray(jobs)) {
      console.error("[Lever] Invalid response format");
      return [];
    }
    
    // Normalize to RawJob format
    return jobs.map(job => {
      // Combine description, lists, and additional content
      let fullDescription = job.description;
      
      if (job.lists && job.lists.length > 0) {
        fullDescription += "\n\n" + job.lists.map(list => 
          `<h3>${list.text}</h3>\n${list.content}`
        ).join("\n\n");
      }
      
      if (job.additional) {
        fullDescription += "\n\n" + job.additional;
      }
      
      return {
        id: job.id,
        title: job.text,
        location: job.categories?.location || "Not specified",
        department: job.categories?.team || job.categories?.department || "General",
        description: fullDescription,
        url: job.hostedUrl,
        source: "lever",
        rawData: job,
      };
    });
    
  } catch (error) {
    console.error("[Lever] Fetch error:", error);
    return [];
  }
}
