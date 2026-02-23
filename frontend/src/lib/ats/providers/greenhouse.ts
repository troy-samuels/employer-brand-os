/**
 * @module lib/ats/providers/greenhouse
 * Greenhouse job board API client.
 * Public API documentation: https://developers.greenhouse.io/job-board.html
 */

const GREENHOUSE_API_BASE = "https://boards-api.greenhouse.io/v1/boards";
const FETCH_TIMEOUT_MS = 10000;
const REQUEST_DELAY_MS = 1000; // Rate limiting: 1 request per second

export interface GreenhouseJob {
  id: number;
  title: string;
  location: {
    name: string;
  };
  departments: Array<{
    id: number;
    name: string;
  }>;
  offices: Array<{
    id: number;
    name: string;
    location: string | null;
  }>;
  metadata: Array<{
    id: number;
    name: string;
    value: string;
  }> | null;
  content: string; // HTML job description
  updated_at: string;
}

export interface RawJob {
  id: string;
  title: string;
  location: string;
  department: string;
  description: string; // HTML content
  url: string;
  source: string;
  rawData: unknown;
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
 * Fetch all jobs from a Greenhouse job board
 * 
 * @param boardToken - The Greenhouse board token (company identifier)
 * @returns Array of normalized job postings
 * 
 * @example
 * ```typescript
 * const jobs = await fetchGreenhouseJobs("monzo");
 * console.log(`Found ${jobs.length} jobs`);
 * ```
 */
export async function fetchGreenhouseJobs(boardToken: string): Promise<RawJob[]> {
  try {
    const url = `${GREENHOUSE_API_BASE}/${boardToken}/jobs?content=true`;
    const response = await rateLimitedFetch(url);
    
    if (!response.ok) {
      console.error(`[Greenhouse] API error: ${response.status} ${response.statusText}`);
      return [];
    }
    
    const data = await response.json();
    const jobs = data.jobs as GreenhouseJob[];
    
    if (!Array.isArray(jobs)) {
      console.error("[Greenhouse] Invalid response format");
      return [];
    }
    
    // Normalize to RawJob format
    return jobs.map(job => ({
      id: String(job.id),
      title: job.title,
      location: job.location?.name || job.offices?.[0]?.location || job.offices?.[0]?.name || "Not specified",
      department: job.departments?.[0]?.name || "General",
      description: job.content || "",
      url: `https://boards.greenhouse.io/${boardToken}/jobs/${job.id}`,
      source: "greenhouse",
      rawData: job,
    }));
    
  } catch (error) {
    console.error("[Greenhouse] Fetch error:", error);
    return [];
  }
}
