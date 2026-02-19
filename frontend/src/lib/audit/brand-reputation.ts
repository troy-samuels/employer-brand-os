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
};

/* ── Review platform detection ───────────────────── */

const REVIEW_PLATFORMS: { name: string; domain: string }[] = [
  { name: "Glassdoor", domain: "glassdoor." },
  { name: "Indeed", domain: "indeed." },
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

async function searchBrave(
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
    const timeoutId = setTimeout(() => controller.abort(), 8_000);

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

/* ── Main check ──────────────────────────────────── */

export async function checkBrandReputation(
  companyName: string,
): Promise<BrandReputation> {
  const results = await searchBrave(
    `"${companyName}" employer reviews working at`,
  );

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
  };
}

/* ── Scoring ─────────────────────────────────────── */

export function scoreBrandReputation(reputation: BrandReputation): number {
  const { sourceCount, sentiment } = reputation;

  // Evidence: Brands present on 4+ platforms get 2.8x more AI citations
  // (Digital Bloom 2025 AI Citation Report). Multi-platform presence is
  // among the strongest predictors of LLM citation alongside brand search volume.
  let score = 0;

  if (sourceCount >= 5) {
    score = 12;
  } else if (sourceCount >= 4) {
    score = 10;
  } else if (sourceCount >= 2) {
    score = 7;
  } else if (sourceCount >= 1) {
    score = 4;
  }
  // 0 platforms = 0 base score

  // Sentiment modifier
  if (sentiment === "positive" && score > 0) {
    score = Math.min(score + 5, 17);
  } else if (sentiment === "negative" && score > 0) {
    score = Math.max(score - 3, 0);
  }

  return score;
}
