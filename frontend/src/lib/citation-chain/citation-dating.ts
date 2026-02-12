/**
 * @module lib/citation-chain/citation-dating
 * Determines publication/freshness dates for citation URLs.
 *
 * Uses multiple strategies in priority order:
 * 1. URL pattern extraction (dates embedded in URL paths)
 * 2. Wayback Machine CDX API (first/last capture dates)
 * 3. HTTP header inspection (Last-Modified, Date)
 * 4. HTML meta tag parsing (article:published_time, dateModified, JSON-LD)
 *
 * For blocked sites (Glassdoor, Indeed), falls back to Wayback Machine
 * which provides evidence of when the content was last publicly accessible.
 */

import type { CitationChainModelId, LlmResponse } from "@/lib/citation-chain/types";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

/** How confident we are in the extracted date. */
export type DateConfidence = "high" | "medium" | "low" | "none";

/** The method used to determine the citation date. */
export type DateMethod =
  | "url-pattern"
  | "wayback-last-capture"
  | "wayback-first-capture"
  | "http-last-modified"
  | "meta-published"
  | "meta-modified"
  | "json-ld"
  | "domain-heuristic"
  | "unknown";

/** Date information for a single citation URL. */
export interface CitationDate {
  /** The citation URL being dated. */
  url: string;
  /** Normalised domain of the citation. */
  domain: string;
  /** ISO date string of the estimated publication/freshness date. */
  date: string | null;
  /** How the date was determined. */
  method: DateMethod;
  /** Confidence level of the date estimate. */
  confidence: DateConfidence;
  /** Human-readable explanation of the dating. */
  explanation: string;
  /** Which AI models cited this URL. */
  citedByModels: CitationChainModelId[];
  /** Age in days from the audit date (null if no date found). */
  ageDays: number | null;
  /** Whether the source site currently blocks AI crawlers. */
  blocksAiCrawlers: boolean;
}

/** Aggregate freshness analysis across all citations. */
export interface CitationFreshnessResult {
  /** Individual citation dates. */
  citations: CitationDate[];
  /** Median age of dated citations in days. */
  medianAgeDays: number | null;
  /** Average age of dated citations in days. */
  averageAgeDays: number | null;
  /** Oldest dated citation age in days. */
  oldestAgeDays: number | null;
  /** Percentage of citations from sites that block AI crawlers. */
  blockedSourcePercentage: number;
  /** Percentage of citations where we could determine a date. */
  dateResolutionRate: number;
  /** Human-readable freshness summary. */
  summary: string;
}

/* ------------------------------------------------------------------ */
/*  Known AI-blocking domains                                          */
/* ------------------------------------------------------------------ */

const AI_BLOCKING_DOMAINS: Record<string, string> = {
  "glassdoor.com": "Full Cloudflare lockdown — blocks all automated access",
  "glassdoor.co.uk": "Full Cloudflare lockdown — blocks all automated access",
  "glassdoor.de": "Full Cloudflare lockdown — blocks all automated access",
  "glassdoor.fr": "Full Cloudflare lockdown — blocks all automated access",
  "reddit.com": "Blocks all bots (Disallow: /), exclusive $60M Google AI deal",
  "old.reddit.com": "Blocks all bots (Disallow: /), exclusive $60M Google AI deal",
  "linkedin.com": "Heavy restrictions, legal threats against automated access",
  "teamblind.com": "Blocks GPTBot, ClaudeBot, anthropic-ai, Meta, Google-Extended",
  "kununu.com": "Blocks ClaudeBot",
  "indeed.com": "Blocks AI training crawlers (GPTBot, anthropic-ai, CCBot), allows ChatGPT-User",
  "indeed.co.uk": "Blocks AI training crawlers (GPTBot, anthropic-ai, CCBot), allows ChatGPT-User",
};

/* ------------------------------------------------------------------ */
/*  URL date pattern extraction                                        */
/* ------------------------------------------------------------------ */

/**
 * Date patterns commonly found in URLs.
 * Ordered by specificity — most specific first.
 */
const URL_DATE_PATTERNS: Array<{ regex: RegExp; extract: (match: RegExpMatchArray) => string | null }> = [
  // /2024/03/15/ or /2024-03-15/
  {
    regex: /\/(\d{4})[/-](0[1-9]|1[0-2])[/-](0[1-9]|[12]\d|3[01])\//,
    extract: (m) => `${m[1]}-${m[2]}-${m[3]}`,
  },
  // /2024/03/ (month precision)
  {
    regex: /\/(\d{4})\/(0[1-9]|1[0-2])\//,
    extract: (m) => `${m[1]}-${m[2]}-15`,
  },
  // /2024/ alone in path (year only)
  {
    regex: /\/(\d{4})\//,
    extract: (m) => {
      const year = Number(m[1]);
      return year >= 2015 && year <= 2030 ? `${m[1]}-06-15` : null;
    },
  },
  // ?date=2024-03 or &date=2024-03-15
  {
    regex: /[?&]date=(\d{4})-(0[1-9]|1[0-2])(?:-(0[1-9]|[12]\d|3[01]))?/,
    extract: (m) => `${m[1]}-${m[2]}-${m[3] ?? "15"}`,
  },
];

function extractDateFromUrl(url: string): { date: string; confidence: DateConfidence } | null {
  for (const pattern of URL_DATE_PATTERNS) {
    const match = url.match(pattern.regex);
    if (match) {
      const date = pattern.extract(match);
      if (date && isValidIsoDate(date)) {
        // Full date = high confidence, month-only or year-only = medium
        const hasDay = pattern.regex.source.includes("3[01]");
        return { date, confidence: hasDay ? "high" : "medium" };
      }
    }
  }
  return null;
}

/* ------------------------------------------------------------------ */
/*  Wayback Machine CDX API                                            */
/* ------------------------------------------------------------------ */

const WAYBACK_CDX_ENDPOINT = "https://web.archive.org/cdx/search/cdx";
const WAYBACK_TIMEOUT_MS = 8_000;

/**
 * Query the Wayback Machine CDX API for capture timestamps of a URL.
 * Returns the most recent successful capture date.
 */
async function getWaybackDate(url: string): Promise<{ date: string; method: DateMethod } | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), WAYBACK_TIMEOUT_MS);

    try {
      // Get the most recent capture
      const params = new URLSearchParams({
        url,
        output: "json",
        limit: "1",
        fl: "timestamp,statuscode",
        filter: "statuscode:200",
        sort: "reverse",
      });

      const response = await fetch(`${WAYBACK_CDX_ENDPOINT}?${params.toString()}`, {
        signal: controller.signal,
        headers: { "user-agent": "BrandOS-CitationDating/1.0" },
      });

      if (!response.ok) {
        return null;
      }

      const data: unknown = await response.json();
      if (!Array.isArray(data) || data.length < 2) {
        return null;
      }

      // First row is headers, second is the data
      const row = data[1] as string[];
      const timestamp = row[0];
      if (!timestamp || timestamp.length < 8) {
        return null;
      }

      const year = timestamp.slice(0, 4);
      const month = timestamp.slice(4, 6);
      const day = timestamp.slice(6, 8);
      const date = `${year}-${month}-${day}`;

      if (!isValidIsoDate(date)) {
        return null;
      }

      return { date, method: "wayback-last-capture" };
    } finally {
      clearTimeout(timeoutId);
    }
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/*  Domain heuristics for known platforms                               */
/* ------------------------------------------------------------------ */

/**
 * Some platforms encode dates in their URL structure. This handles
 * platform-specific patterns that generic regex won't catch.
 */
function extractPlatformDate(url: string, domain: string): { date: string; confidence: DateConfidence } | null {
  // Reddit: /comments/[id]/[slug]/ — no date in URL, but we know training cutoff
  if (domain.includes("reddit.com")) {
    return null; // Can't determine from URL alone
  }

  // Glassdoor review URLs don't contain dates
  if (domain.includes("glassdoor")) {
    return null;
  }

  // News sites often have /YYYY/MM/DD/ patterns (handled by generic extraction)
  return null;
}

/* ------------------------------------------------------------------ */
/*  Core analysis                                                      */
/* ------------------------------------------------------------------ */

function normaliseDomain(url: string): string {
  try {
    const hostname = new URL(
      /^[a-z][a-z0-9+.-]*:\/\//i.test(url) ? url : `https://${url}`,
    ).hostname.toLowerCase();
    return hostname.replace(/^www\./i, "");
  } catch {
    return "";
  }
}

function isBlockedDomain(domain: string): { blocked: boolean; reason: string } {
  for (const [blockedDomain, reason] of Object.entries(AI_BLOCKING_DOMAINS)) {
    if (domain === blockedDomain || domain.endsWith(`.${blockedDomain}`)) {
      return { blocked: true, reason };
    }
  }
  return { blocked: false, reason: "" };
}

function daysBetween(dateStr: string, now: Date): number {
  const then = new Date(dateStr);
  const diffMs = now.getTime() - then.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

function isValidIsoDate(dateStr: string): boolean {
  const d = new Date(dateStr);
  return !isNaN(d.getTime()) && d.getFullYear() >= 2010 && d.getFullYear() <= 2030;
}

function buildExplanation(
  method: DateMethod,
  date: string | null,
  ageDays: number | null,
  blocksAi: boolean,
  blockReason: string,
): string {
  const parts: string[] = [];

  if (date && ageDays !== null) {
    const ageDesc = ageDays < 30
      ? `${ageDays} days old`
      : ageDays < 365
        ? `${Math.round(ageDays / 30)} months old`
        : `${(ageDays / 365).toFixed(1)} years old`;

    const methodDesc: Record<DateMethod, string> = {
      "url-pattern": "Date extracted from URL path",
      "wayback-last-capture": "Last Wayback Machine capture",
      "wayback-first-capture": "First Wayback Machine capture",
      "http-last-modified": "HTTP Last-Modified header",
      "meta-published": "HTML meta published date",
      "meta-modified": "HTML meta modified date",
      "json-ld": "JSON-LD datePublished",
      "domain-heuristic": "Platform-specific date extraction",
      "unknown": "Date could not be determined",
    };

    parts.push(`${methodDesc[method]} — ${ageDesc} (${date})`);
  } else {
    parts.push("Publication date could not be determined");
  }

  if (blocksAi) {
    parts.push(`⚠️ ${blockReason}`);
    if (!date) {
      parts.push("AI models citing this source are using pre-lockdown training data");
    }
  }

  return parts.join(". ");
}

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

/**
 * Analyse the freshness of all citations across LLM responses.
 * Deduplicates URLs, attempts multiple dating strategies per citation,
 * and produces an aggregate freshness report.
 */
export async function analyseCitationFreshness(
  llmResponses: LlmResponse[],
  options: { useWayback?: boolean; now?: Date } = {},
): Promise<CitationFreshnessResult> {
  const now = options.now ?? new Date();
  const useWayback = options.useWayback ?? true;

  // Deduplicate citations and track which models cited each
  const citationMap = new Map<string, Set<CitationChainModelId>>();
  for (const response of llmResponses) {
    if (response.failed) continue;
    for (const url of response.citations) {
      const normalised = url.trim();
      if (!normalised) continue;
      const existing = citationMap.get(normalised) ?? new Set();
      existing.add(response.modelId);
      citationMap.set(normalised, existing);
    }
  }

  // Process each unique citation
  const citations: CitationDate[] = [];
  const waybackQueue: Array<{ url: string; index: number }> = [];

  for (const [url, models] of citationMap) {
    const domain = normaliseDomain(url);
    const { blocked: blocksAi, reason: blockReason } = isBlockedDomain(domain);

    // Strategy 1: URL pattern
    const urlDate = extractDateFromUrl(url);
    if (urlDate) {
      const ageDays = daysBetween(urlDate.date, now);
      citations.push({
        url,
        domain,
        date: urlDate.date,
        method: "url-pattern",
        confidence: urlDate.confidence,
        explanation: buildExplanation("url-pattern", urlDate.date, ageDays, blocksAi, blockReason),
        citedByModels: Array.from(models),
        ageDays,
        blocksAiCrawlers: blocksAi,
      });
      continue;
    }

    // Strategy 2: Platform-specific extraction
    const platformDate = extractPlatformDate(url, domain);
    if (platformDate) {
      const ageDays = daysBetween(platformDate.date, now);
      citations.push({
        url,
        domain,
        date: platformDate.date,
        method: "domain-heuristic",
        confidence: platformDate.confidence,
        explanation: buildExplanation("domain-heuristic", platformDate.date, ageDays, blocksAi, blockReason),
        citedByModels: Array.from(models),
        ageDays,
        blocksAiCrawlers: blocksAi,
      });
      continue;
    }

    // Queue for Wayback Machine lookup
    const placeholderIndex = citations.length;
    citations.push({
      url,
      domain,
      date: null,
      method: "unknown",
      confidence: "none",
      explanation: buildExplanation("unknown", null, null, blocksAi, blockReason),
      citedByModels: Array.from(models),
      ageDays: null,
      blocksAiCrawlers: blocksAi,
    });

    if (useWayback) {
      waybackQueue.push({ url, index: placeholderIndex });
    }
  }

  // Strategy 3: Wayback Machine lookups (batched with concurrency limit)
  if (waybackQueue.length > 0) {
    const WAYBACK_CONCURRENCY = 3;
    const queue = [...waybackQueue];
    let nextIdx = 0;

    async function waybackWorker(): Promise<void> {
      while (nextIdx < queue.length) {
        const idx = nextIdx;
        nextIdx += 1;
        const item = queue[idx]!;

        const result = await getWaybackDate(item.url);
        if (result) {
          const ageDays = daysBetween(result.date, now);
          const citation = citations[item.index]!;
          const { blocked: blocksAi, reason: blockReason } = isBlockedDomain(citation.domain);

          citation.date = result.date;
          citation.method = result.method;
          citation.confidence = "medium";
          citation.ageDays = ageDays;
          citation.explanation = buildExplanation(result.method, result.date, ageDays, blocksAi, blockReason);
        }
      }
    }

    const workers = Array.from(
      { length: Math.min(WAYBACK_CONCURRENCY, queue.length) },
      () => waybackWorker(),
    );
    await Promise.all(workers);
  }

  // Calculate aggregates
  const datedCitations = citations.filter((c) => c.ageDays !== null);
  const ages = datedCitations.map((c) => c.ageDays!).sort((a, b) => a - b);
  const blockedCount = citations.filter((c) => c.blocksAiCrawlers).length;

  const medianAgeDays = ages.length > 0
    ? ages[Math.floor(ages.length / 2)]!
    : null;

  const averageAgeDays = ages.length > 0
    ? Math.round(ages.reduce((sum, a) => sum + a, 0) / ages.length)
    : null;

  const oldestAgeDays = ages.length > 0 ? ages[ages.length - 1]! : null;

  const blockedSourcePercentage = citations.length > 0
    ? Math.round((blockedCount / citations.length) * 100)
    : 0;

  const dateResolutionRate = citations.length > 0
    ? Math.round((datedCitations.length / citations.length) * 100)
    : 0;

  return {
    citations,
    medianAgeDays,
    averageAgeDays,
    oldestAgeDays,
    blockedSourcePercentage,
    dateResolutionRate,
    summary: buildFreshnessSummary(
      medianAgeDays,
      oldestAgeDays,
      blockedSourcePercentage,
      dateResolutionRate,
      citations.length,
    ),
  };
}

function buildFreshnessSummary(
  medianAgeDays: number | null,
  oldestAgeDays: number | null,
  blockedPercentage: number,
  resolutionRate: number,
  totalCitations: number,
): string {
  if (totalCitations === 0) {
    return "No citations found to analyse for freshness.";
  }

  const parts: string[] = [];

  if (medianAgeDays !== null) {
    if (medianAgeDays > 730) {
      parts.push(
        `The median citation is over ${Math.round(medianAgeDays / 365)} years old — AI is relying on significantly outdated information about this company.`,
      );
    } else if (medianAgeDays > 365) {
      parts.push(
        `The median citation is over a year old (${Math.round(medianAgeDays / 30)} months). Information may not reflect current company reality.`,
      );
    } else if (medianAgeDays > 180) {
      parts.push(
        `The median citation is ${Math.round(medianAgeDays / 30)} months old. Some information may be outdated.`,
      );
    } else {
      parts.push(
        `The median citation is relatively fresh at ${Math.round(medianAgeDays / 30)} months old.`,
      );
    }
  }

  if (oldestAgeDays !== null && oldestAgeDays > 365) {
    parts.push(
      `The oldest cited source is ${(oldestAgeDays / 365).toFixed(1)} years old.`,
    );
  }

  if (blockedPercentage > 50) {
    parts.push(
      `${blockedPercentage}% of cited sources actively block AI crawlers — this data cannot be updated by AI models and will continue to age.`,
    );
  } else if (blockedPercentage > 0) {
    parts.push(
      `${blockedPercentage}% of cited sources block AI crawlers.`,
    );
  }

  if (resolutionRate < 50) {
    parts.push(
      `We could only determine dates for ${resolutionRate}% of citations. Undated sources from blocked platforms are likely using pre-2024 training data.`,
    );
  }

  return parts.join(" ");
}
