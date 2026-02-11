/**
 * @module lib/citation-chain/google-search
 * Server-side Google SERP retrieval with deterministic mock fallback.
 */

import type { GoogleResult, PromptCategoryId } from "@/lib/citation-chain/types";

interface GoogleSearchOptions {
  category?: PromptCategoryId;
  timeoutMs?: number;
  apiKey?: string;
}

interface SerperOrganicResult {
  title?: string;
  link?: string;
  snippet?: string;
  position?: number;
}

const SERPER_ENDPOINT = "https://google.serper.dev/search";
const DEFAULT_TIMEOUT_MS = 9_000;
const RESULT_LIMIT = 10;

/**
 * Normalise a URL/hostname into a lowercase hostname without `www.`.
 */
export function normaliseDomain(input: string): string {
  try {
    const value = /^[a-z][a-z0-9+.-]*:\/\//i.test(input) ? input : `https://${input}`;
    const hostname = new URL(value).hostname.toLowerCase();
    if (!hostname.includes(".")) {
      return "";
    }
    return hostname.replace(/^www\./i, "");
  } catch {
    return "";
  }
}

/**
 * Fetch top 10 Google organic results for a query.
 * Falls back to realistic mock data when Serper is unavailable.
 */
export async function fetchGoogleResults(
  query: string,
  options: GoogleSearchOptions = {}
): Promise<GoogleResult[]> {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    return [];
  }

  const category = options.category ?? "reviews";
  const apiKey = options.apiKey ?? process.env.SERPER_API_KEY;

  if (!apiKey) {
    return getMockGoogleResults(trimmedQuery, category);
  }

  try {
    const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(SERPER_ENDPOINT, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "user-agent": "Rankwell-CitationChain/1.0 (+https://rankwell.ai)",
      },
      body: JSON.stringify({
        q: trimmedQuery,
        num: RESULT_LIMIT,
        gl: "us",
        hl: "en",
      }),
      signal: controller.signal,
      cache: "no-store",
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return getMockGoogleResults(trimmedQuery, category);
    }

    const payload: unknown = await response.json();
    const organic = extractOrganicResults(payload);

    if (organic.length === 0) {
      return getMockGoogleResults(trimmedQuery, category);
    }

    return organic.slice(0, RESULT_LIMIT).map((result, index) => {
      const url = result.link ?? "";
      const domain = normaliseDomain(url);
      return {
        category,
        query: trimmedQuery,
        url,
        domain,
        title: result.title ?? "Untitled result",
        snippet: result.snippet ?? "",
        position: typeof result.position === "number" && result.position > 0
          ? result.position
          : index + 1,
      } satisfies GoogleResult;
    });
  } catch {
    return getMockGoogleResults(trimmedQuery, category);
  }
}

/**
 * Build realistic fallback SERP results for local/test use.
 */
export function getMockGoogleResults(
  query: string,
  category: PromptCategoryId = "reviews"
): GoogleResult[] {
  const companyName = inferCompanyNameFromQuery(query);
  const companySlug = companyName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const companyDomain = `${companySlug || "company"}.com`;

  const baseResults: Array<Omit<GoogleResult, "query" | "category" | "position" | "domain">> = [
    {
      url: `https://www.${companyDomain}/careers`,
      title: `${companyName} Careers and Open Roles`,
      snippet: `Discover roles, benefits, and life at ${companyName} directly from the employer website.`,
    },
    {
      url: `https://www.glassdoor.com/Salary/${companySlug}-Salaries-E12345.htm`,
      title: `${companyName} salaries: Software engineer pay and bonus benchmarks`,
      snippet: `Employee-reported pay data and interview feedback for ${companyName} on Glassdoor.`,
    },
    {
      url: `https://www.indeed.com/cmp/${companySlug}/salaries`,
      title: `${companyName} salaries and compensation data | Indeed`,
      snippet: `Indeed salary estimates, job postings, and employer profile insights for ${companyName}.`,
    },
    {
      url: `https://www.reddit.com/r/cscareerquestions/comments/xyz123/working_at_${companySlug}/`,
      title: `Reddit discussion: what it is like to work at ${companyName}`,
      snippet: `Community perspectives on interview rounds, team culture, and growth opportunities at ${companyName}.`,
    },
    {
      url: `https://www.linkedin.com/company/${companySlug}/jobs/`,
      title: `${companyName} jobs and hiring activity | LinkedIn`,
      snippet: `Current openings, hiring trends, and company updates for ${companyName}.`,
    },
    {
      url: `https://www.levels.fyi/companies/${companySlug}/salaries/software-engineer`,
      title: `${companyName} compensation insights on Levels.fyi`,
      snippet: `Compensation ranges and equity data for engineering roles at ${companyName}.`,
    },
    {
      url: `https://www.comparably.com/companies/${companySlug}`,
      title: `${companyName} culture and leadership ratings | Comparably`,
      snippet: `Employee sentiment benchmarks and workplace culture metrics for ${companyName}.`,
    },
    {
      url: `https://www.builtin.com/company/${companySlug}`,
      title: `${companyName} company profile and workplace overview`,
      snippet: `Company overview, office details, and growth signals for ${companyName}.`,
    },
    {
      url: `https://www.crunchbase.com/organization/${companySlug}`,
      title: `${companyName} funding and growth data | Crunchbase`,
      snippet: `Funding rounds, headcount trajectory, and leadership updates for ${companyName}.`,
    },
    {
      url: `https://techcrunch.com/tag/${companySlug}/`,
      title: `${companyName} news coverage and updates`,
      snippet: `Recent reporting and commentary related to ${companyName}.`,
    },
  ];

  return baseResults.map((result, index) => ({
    ...result,
    query,
    category,
    domain: normaliseDomain(result.url),
    position: index + 1,
  }));
}

function extractOrganicResults(payload: unknown): SerperOrganicResult[] {
  if (!isObject(payload)) {
    return [];
  }

  const organic = payload.organic;
  if (!Array.isArray(organic)) {
    return [];
  }

  return organic.filter((item): item is SerperOrganicResult => {
    if (!isObject(item)) {
      return false;
    }
    return typeof item.link === "string";
  });
}

function inferCompanyNameFromQuery(query: string): string {
  const removableTokens = new Set([
    "salary",
    "salaries",
    "employee",
    "employees",
    "benefits",
    "remote",
    "policy",
    "interview",
    "process",
    "competitors",
    "employer",
    "reviews",
    "review",
    "growth",
    "hiring",
    "software",
    "engineer",
    "what",
    "is",
    "the",
    "for",
    "at",
    "and",
    "hybrid",
    "work",
    "in",
  ]);

  const tokens = query
    .split(/\s+/)
    .map((token) => token.replace(/[^a-z0-9]/gi, ""))
    .filter(Boolean);

  const companyTokens = tokens.filter((token) => !removableTokens.has(token.toLowerCase()));
  const candidate = companyTokens.slice(0, 3).join(" ").trim();

  if (!candidate) {
    return "Example Company";
  }

  return candidate
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
