/**
 * @module lib/audit/brand-reputation
 * Checks brand reputation signals using web search.
 * Detects review platform presence and sentiment from search snippets.
 */

export type ReviewPlatform = {
  name: string;
  url: string;
  /** Snippet text from search results, if available */
  snippet: string | null;
};

export type BrandReputation = {
  /** Review platforms that have data on this company */
  platforms: ReviewPlatform[];
  /** Overall sentiment from search snippets: positive | mixed | negative | unknown */
  sentiment: "positive" | "mixed" | "negative" | "unknown";
  /** Number of review sources found */
  sourceCount: number;
  /**
   * Whether the brand reputation data was successfully retrieved.
   * When `false`, the search infrastructure failed (API down, no key, timeout)
   * and the score should be treated as neutral rather than zero.
   */
  available: boolean;
};

/* ── Review platform detection ───────────────────── */

const REVIEW_PLATFORMS: { name: string; domain: string }[] = [
  { name: "Glassdoor", domain: "glassdoor." },
  { name: "Indeed", domain: "indeed." },
  { name: "LinkedIn", domain: "linkedin." },
  { name: "Blind", domain: "teamblind.com" },
  { name: "Comparably", domain: "comparably.com" },
  { name: "Kununu", domain: "kununu.com" },
  { name: "Trustpilot", domain: "trustpilot.com" },
  { name: "Ambition Box", domain: "ambitionbox.com" },
  { name: "Levels.fyi", domain: "levels.fyi" },
  { name: "RepVue", domain: "repvue.com" },
];

/* ── Sentiment analysis (simple keyword-based) ───── */

const POSITIVE_SIGNALS = [
  "great place to work",
  "top employer",
  "best companies",
  "award-winning",
  "excellent culture",
  "highly rated",
  "great benefits",
  "recommended",
  "love working",
  "amazing team",
  "certified",
  "top rated",
  "best workplace",
];

const NEGATIVE_SIGNALS = [
  "toxic",
  "overworked",
  "underpaid",
  "high turnover",
  "poor management",
  "burnout",
  "layoffs",
  "controversy",
  "lawsuit",
  "scandal",
  "terrible",
  "avoid",
  "hostile",
  "discrimination",
  "low morale",
];

function analyzeSentiment(
  snippets: string[],
): "positive" | "mixed" | "negative" | "unknown" {
  if (snippets.length === 0) return "unknown";

  const combined = snippets.join(" ").toLowerCase();
  const positiveHits = POSITIVE_SIGNALS.filter((s) =>
    combined.includes(s),
  ).length;
  const negativeHits = NEGATIVE_SIGNALS.filter((s) =>
    combined.includes(s),
  ).length;

  if (positiveHits === 0 && negativeHits === 0) return "unknown";
  if (positiveHits > 0 && negativeHits > 0) return "mixed";
  if (negativeHits > positiveHits) return "negative";
  return "positive";
}

/* ── Brave Search integration ────────────────────── */

interface BraveSearchResult {
  title: string;
  url: string;
  description: string;
}

const BRAVE_SEARCH_TIMEOUT_MS = 8_000;
const BRAVE_SEARCH_USER_AGENT = "OpenRoleAuditBot/1.1 (+https://openrole.ai/audit)";
const BRAVE_SEARCH_MAX_HTML_RESULTS = 20;
const BRAVE_SEARCH_IGNORED_HOSTS = new Set([
  "search.brave.com",
  "cdn.search.brave.com",
  "imgs.search.brave.com",
]);

function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeSearchUrl(rawUrl: string): string | null {
  const decoded = decodeHtmlEntities(rawUrl);
  try {
    const parsed = new URL(decoded);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return null;
    }
    const hostname = parsed.hostname.toLowerCase();
    if (BRAVE_SEARCH_IGNORED_HOSTS.has(hostname)) {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

function extractBraveHtmlResults(html: string): BraveSearchResult[] {
  const results: BraveSearchResult[] = [];
  const seen = new Set<string>();
  const anchorPattern = /<a\b[^>]*href="(https?:\/\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;

  for (const match of html.matchAll(anchorPattern)) {
    const candidateUrl = normalizeSearchUrl(match[1] ?? "");
    if (!candidateUrl || seen.has(candidateUrl)) {
      continue;
    }

    const title = stripHtml(decodeHtmlEntities(match[2] ?? ""));
    if (!title) {
      continue;
    }

    const startIndex = typeof match.index === "number" ? match.index + match[0].length : -1;
    const nearbyChunk = startIndex >= 0 ? html.slice(startIndex, startIndex + 800) : "";
    const snippetMatch = nearbyChunk.match(/<div class="content[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
    const description = stripHtml(decodeHtmlEntities(snippetMatch?.[1] ?? ""));

    seen.add(candidateUrl);
    results.push({
      title,
      url: candidateUrl,
      description,
    });

    if (results.length >= BRAVE_SEARCH_MAX_HTML_RESULTS) {
      break;
    }
  }

  return results;
}

async function searchBraveApi(
  query: string,
): Promise<BraveSearchResult[]> {
  const apiKey = process.env.BRAVE_SEARCH_API_KEY;
  if (!apiKey) {
    return [];
  }

  try {
    const params = new URLSearchParams({
      q: query,
      count: "10",
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), BRAVE_SEARCH_TIMEOUT_MS);

    try {
      const response = await fetch(
        `https://api.search.brave.com/res/v1/web/search?${params.toString()}`,
        {
          headers: {
            Accept: "application/json",
            "Accept-Encoding": "gzip",
            "X-Subscription-Token": apiKey,
          },
          signal: controller.signal,
        },
      );

      if (!response.ok) return [];

      const data = (await response.json()) as {
        web?: { results?: { title: string; url: string; description: string }[] };
      };

      return (
        data.web?.results?.map((r) => ({
          title: r.title,
          url: r.url,
          description: r.description,
        })) ?? []
      );
    } finally {
      clearTimeout(timeoutId);
    }
  } catch {
    return [];
  }
}

async function searchBraveHtml(
  query: string,
): Promise<BraveSearchResult[]> {
  try {
    const params = new URLSearchParams({
      q: query,
      source: "web",
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), BRAVE_SEARCH_TIMEOUT_MS);

    try {
      const response = await fetch(
        `https://search.brave.com/search?${params.toString()}`,
        {
          headers: {
            "User-Agent": BRAVE_SEARCH_USER_AGENT,
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          },
          signal: controller.signal,
        },
      );

      if (!response.ok) {
        return [];
      }

      const html = await response.text();
      return extractBraveHtmlResults(html);
    } finally {
      clearTimeout(timeoutId);
    }
  } catch {
    return [];
  }
}

async function searchBrave(
  query: string,
): Promise<BraveSearchResult[]> {
  const apiResults = await searchBraveApi(query);
  if (apiResults.length > 0) {
    return apiResults;
  }

  return searchBraveHtml(query);
}

function mergeUniqueResults(...resultSets: BraveSearchResult[][]): BraveSearchResult[] {
  const merged: BraveSearchResult[] = [];
  const seen = new Set<string>();

  for (const set of resultSets) {
    for (const result of set) {
      if (seen.has(result.url)) {
        continue;
      }
      seen.add(result.url);
      merged.push(result);
    }
  }

  return merged;
}

/* ── Main check ──────────────────────────────────── */

export async function checkBrandReputation(
  companyName: string,
): Promise<BrandReputation> {
  let reviewResults: BraveSearchResult[];
  let linkedInResults: BraveSearchResult[];

  try {
    [reviewResults, linkedInResults] = await Promise.all([
      searchBrave(`"${companyName}" employer reviews working at`),
      searchBrave(`"${companyName}" linkedin company jobs`),
    ]);
  } catch {
    // Search infrastructure failed entirely — mark as unavailable
    return {
      platforms: [],
      sentiment: "unknown",
      sourceCount: 0,
      available: false,
    };
  }

  // If both company-specific searches returned zero results, distinguish
  // between "search API is broken" and "genuinely obscure company" by
  // running a trivial canary query. If the canary also returns nothing,
  // the API is down/rate-limited → mark unavailable. If the canary
  // succeeds, the company simply has no online employer presence →
  // return available: true with zero platforms (scores 0/15, not 8/15).
  const totalResults = reviewResults.length + linkedInResults.length;
  if (totalResults === 0) {
    try {
      const canary = await searchBrave("site:google.com");
      if (canary.length === 0) {
        // Search API is genuinely broken
        return {
          platforms: [],
          sentiment: "unknown",
          sourceCount: 0,
          available: false,
        };
      }
    } catch {
      return {
        platforms: [],
        sentiment: "unknown",
        sourceCount: 0,
        available: false,
      };
    }
    // API works — company genuinely has no employer presence online
    return {
      platforms: [],
      sentiment: "unknown",
      sourceCount: 0,
      available: true,
    };
  }

  const results = mergeUniqueResults(reviewResults, linkedInResults);

  const platforms: ReviewPlatform[] = [];
  const snippets: string[] = [];

  for (const result of results) {
    const urlLower = result.url.toLowerCase();

    // Check if this result is from a known review platform
    for (const platform of REVIEW_PLATFORMS) {
      if (
        urlLower.includes(platform.domain) &&
        !platforms.some((p) => p.name === platform.name)
      ) {
        platforms.push({
          name: platform.name,
          url: result.url,
          snippet: result.description || null,
        });
      }
    }

    // Collect all snippets for sentiment analysis
    if (result.description) {
      snippets.push(result.description);
    }
    if (result.title) {
      snippets.push(result.title);
    }
  }

  const sentiment = analyzeSentiment(snippets);

  return {
    platforms,
    sentiment,
    sourceCount: platforms.length,
    available: true,
  };
}

/* ── Scoring ─────────────────────────────────────── */

export function scoreBrandReputation(reputation: BrandReputation): number {
  const { sourceCount, sentiment, available } = reputation;

  // Semrush: unlinked brand mentions carry weight in AI visibility.
  // Moz: consistent brand positioning across platforms drives AI citation.
  // Fairness: capped at 3 platforms for full base marks — a 20-person startup
  // on Glassdoor + LinkedIn + their own site scores the same as a Fortune 500.
  // Max: 15 points.

  // When brand reputation data is unavailable (search API down, no key, timeout),
  // return a neutral median score so companies aren't penalised for our
  // infrastructure issues. 8 is the midpoint of the 0-15 range.
  if (!available) {
    return 8;
  }

  let score = 0;

  if (sourceCount >= 3) {
    score = 10;
  } else if (sourceCount >= 2) {
    score = 7;
  } else if (sourceCount >= 1) {
    score = 4;
  }
  // 0 platforms = 0 base score

  // Sentiment modifier (±5 max)
  if (sentiment === "positive" && score > 0) {
    score = Math.min(score + 5, 15);
  } else if (sentiment === "negative" && score > 0) {
    score = Math.max(score - 3, 0);
  }

  return score;
}
