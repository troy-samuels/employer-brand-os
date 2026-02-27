/**
 * @module lib/audit/llm-testing
 * Runs per-LLM reputation checks for a company domain via OpenRouter.
 *
 * Queries real AI models with standardised employer prompts, then parses
 * responses into structured claims with accuracy classifications.
 */

import type {
  LlmModelId,
  LlmAuditResult,
  LlmClaim,
  PlanTier,
  ComprehensiveLlmAudit,
  ConsensusItem,
} from "@/types/llm-audit";
import { LLM_MODELS, isModelAvailable } from "@/types/llm-audit";
import { queryModel, isConfigured } from "@/lib/ai/openrouter";
import {
  getCachedResponse,
  setCachedResponse,
  type CachedLlmResponse,
} from "@/lib/ai/llm-cache";

/* ------------------------------------------------------------------ */
/* Standard prompts                                                    */
/* ------------------------------------------------------------------ */

const EMPLOYER_PROMPTS = [
  "What is it like to work at {company}?",
  "What does {company} pay its employees?",
  "What benefits does {company} offer?",
  "Is {company} a good employer?",
];

/** The combined prompt sent to each LLM. */
export function buildPrompt(domain: string): string {
  const company = domainToName(domain);
  return EMPLOYER_PROMPTS.map((p) => p.replace("{company}", company)).join("\n");
}

/** Extract a readable company name from a domain. */
function domainToName(domain: string): string {
  return domain
    .replace(/^(www\.)/i, "")
    .replace(/\.(com|co\.uk|io|org|net|co|uk|ai|dev|app)$/i, "")
    .replace(/\./g, " ")
    .replace(/(^|\s)\S/g, (c) => c.toUpperCase());
}

/* ------------------------------------------------------------------ */
/* Claim categories                                                    */
/* ------------------------------------------------------------------ */

const CLAIM_CATEGORIES = [
  "salary",
  "benefits",
  "culture",
  "remote_policy",
  "interview_process",
  "tech_stack",
  "career_growth",
  "location",
  "reputation",
  "reviews",
] as const;

/** Keywords that signal each claim category. */
const CATEGORY_SIGNALS: Record<string, string[]> = {
  salary: ["salary", "salaries", "pay", "compensation", "earning", "£", "$", "wage", "bonus", "equity", "stock", "remuneration"],
  benefits: ["benefit", "pension", "health insurance", "dental", "gym", "wellbeing", "well-being", "perks", "holiday", "leave", "pto", "maternity", "paternity", "childcare"],
  culture: ["culture", "values", "environment", "team", "atmosphere", "inclusive", "diversity", "work-life", "collaboration", "supportive", "toxic"],
  remote_policy: ["remote", "hybrid", "office", "work from home", "wfh", "flexible", "onsite", "on-site", "in-office"],
  interview_process: ["interview", "hiring", "application", "recruitment", "screening", "assessment", "process", "stages"],
  tech_stack: ["tech stack", "technology", "tools", "programming", "framework", "engineering", "developer"],
  career_growth: ["career", "growth", "promotion", "progression", "training", "development", "learning", "mentoring", "advance"],
  location: ["location", "based", "headquarter", "office in", "located"],
  reputation: ["reputation", "known for", "recognized", "recognised", "award", "ranking", "best place", "great place"],
  reviews: ["glassdoor", "indeed", "rating", "review", "stars", "score", "rated"],
};

/* ------------------------------------------------------------------ */
/* Response parsing                                                    */
/* ------------------------------------------------------------------ */

/**
 * Parse an LLM response into structured claims by splitting into sentences
 * and classifying each one.
 */
function parseResponseIntoClaims(
  response: string,
  domain: string
): LlmClaim[] {
  if (!response || response.trim().length === 0) return [];

  const company = domainToName(domain);

  // Split into sentences (handles ., !, ? and double newlines)
  const sentences = response
    .split(/(?<=[.!?])\s+|\n\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 15 && s.length < 500);

  const claims: LlmClaim[] = [];
  const seenCategories = new Set<string>();

  for (const sentence of sentences) {
    const lower = sentence.toLowerCase();

    // Determine category
    let category = "general";
    for (const [cat, signals] of Object.entries(CATEGORY_SIGNALS)) {
      if (signals.some((signal) => lower.includes(signal))) {
        category = cat;
        break;
      }
    }

    // Skip if we already have a claim in this category (keep it concise)
    if (seenCategories.has(category) && claims.length > 3) continue;
    seenCategories.add(category);

    // Classify accuracy
    const accuracy = classifyAccuracy(lower, company);

    // Determine severity for non-accurate claims
    let severity: LlmClaim["severity"] | undefined;
    if (accuracy !== "accurate" && accuracy !== "unverifiable") {
      severity = determineSeverity(category, accuracy);
    }

    // Extract source URL if present
    const urlMatch = sentence.match(/https?:\/\/[^\s)]+/);

    claims.push({
      category,
      llmStatement: sentence,
      verifiedValue: null,
      accuracy,
      ...(severity ? { severity } : {}),
      ...(urlMatch ? { sourceUrl: urlMatch[0] } : {}),
    });

    // Cap at 8 claims per model to keep results digestible
    if (claims.length >= 8) break;
  }

  return claims;
}

/**
 * Classify the accuracy of a statement based on linguistic signals.
 * In a future phase, this will cross-reference employer_facts data.
 */
function classifyAccuracy(
  lowerSentence: string,
  _company: string
): LlmClaim["accuracy"] {
  // Explicit admissions of ignorance
  const missingSignals = [
    "don't have",
    "do not have",
    "no specific",
    "not publicly available",
    "unable to find",
    "couldn't find",
    "no reliable",
    "i'm not sure",
    "i am not sure",
    "not available",
    "limited information",
    "i don't know",
    "cannot confirm",
    "can't confirm",
    "no data",
    "hard to say",
    "difficult to determine",
    "recommend checking",
    "would suggest checking",
    "check their",
    "visit their",
  ];
  if (missingSignals.some((s) => lowerSentence.includes(s))) {
    return "missing";
  }

  // Hedging / unverifiable
  const hedgeSignals = [
    "generally",
    "typically",
    "appears to",
    "seems to",
    "reportedly",
    "might",
    "may ",
    "could be",
    "likely",
    "probably",
    "some sources suggest",
    "it's believed",
    "from what i can gather",
    "based on limited",
  ];
  if (hedgeSignals.some((s) => lowerSentence.includes(s))) {
    return "unverifiable";
  }

  // Outdated signals (references to old data)
  const outdatedSignals = [
    "glassdoor",
    "according to indeed",
    "as of 2023",
    "as of 2024",
    "last reported",
    "historically",
    "in the past",
    "previous reports",
  ];
  if (outdatedSignals.some((s) => lowerSentence.includes(s))) {
    return "outdated";
  }

  // Specific factual claims (numbers, URLs, concrete details) → potentially accurate
  const factualSignals = [
    /£[\d,]+/,
    /\$[\d,]+/,
    /\d+\s*(employees|staff|people|workers)/,
    /founded in \d{4}/i,
    /headquartered in/i,
    /\d+\s*stars?/,
    /\d+(\.\d+)?\/\d+/,
  ];
  if (factualSignals.some((r) => r.test(lowerSentence))) {
    // Specific claims from third-party data are likely outdated
    if (outdatedSignals.some((s) => lowerSentence.includes(s))) {
      return "outdated";
    }
    // Without verification data, mark as unverifiable
    return "unverifiable";
  }

  // Default: unverifiable (we can't confirm without employer data)
  return "unverifiable";
}

/** Assign severity based on category importance. */
function determineSeverity(
  category: string,
  accuracy: LlmClaim["accuracy"]
): "critical" | "moderate" | "minor" {
  // Hallucinated or inaccurate salary/benefits claims are always critical
  if (
    (category === "salary" || category === "benefits") &&
    (accuracy === "hallucinated" || accuracy === "inaccurate")
  ) {
    return "critical";
  }

  // Outdated salary data is critical
  if (category === "salary" && accuracy === "outdated") {
    return "critical";
  }

  // Missing data in important categories is moderate
  if (
    (category === "salary" || category === "benefits" || category === "culture") &&
    accuracy === "missing"
  ) {
    return "moderate";
  }

  // Everything else
  if (accuracy === "hallucinated" || accuracy === "inaccurate") return "moderate";
  if (accuracy === "outdated") return "moderate";
  return "minor";
}

/* ------------------------------------------------------------------ */
/* Scoring                                                             */
/* ------------------------------------------------------------------ */

function scoreClaims(claims: LlmClaim[]): {
  score: number;
  accurateCount: number;
  inaccurateCount: number;
  unverifiableCount: number;
} {
  if (claims.length === 0) {
    return { score: 0, accurateCount: 0, inaccurateCount: 0, unverifiableCount: 0 };
  }

  const accurateCount = claims.filter((c) => c.accuracy === "accurate").length;
  const inaccurateCount = claims.filter(
    (c) =>
      c.accuracy === "inaccurate" ||
      c.accuracy === "hallucinated" ||
      c.accuracy === "outdated"
  ).length;
  const unverifiableCount = claims.filter(
    (c) => c.accuracy === "unverifiable" || c.accuracy === "missing"
  ).length;

  const total = claims.length;
  // Scoring: accurate = 100pts, unverifiable = 40pts, missing = 20pts, inaccurate = 0pts
  const score = Math.round(
    (accurateCount * 100 + unverifiableCount * 40 + claims.filter((c) => c.accuracy === "missing").length * 20) /
      total
  );

  return {
    score: Math.min(100, Math.max(0, score)),
    accurateCount,
    inaccurateCount,
    unverifiableCount,
  };
}

/* ------------------------------------------------------------------ */
/* Query a single model (real or placeholder)                          */
/* ------------------------------------------------------------------ */

/** Convert domain to a URL-safe slug for cache keys. */
function domainToSlug(domain: string): string {
  return domain
    .replace(/^(www\.)/i, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

async function queryAndParseModel(
  modelId: LlmModelId,
  domain: string,
  locked: boolean
): Promise<LlmAuditResult> {
  const prompt = buildPrompt(domain);
  const slug = domainToSlug(domain);
  const now = new Date().toISOString();

  // Locked models return empty result
  if (locked) {
    return {
      modelId,
      prompt,
      rawResponse: "",
      claims: [],
      score: 0,
      accurateCount: 0,
      inaccurateCount: 0,
      unverifiableCount: 0,
      checkedAt: now,
      locked: true,
    };
  }

  // Check cache first (24hr TTL)
  const cached = await getCachedResponse(slug, modelId);
  if (cached) {
    const scores = scoreClaims(cached.claims);
    return {
      modelId,
      prompt,
      rawResponse: cached.rawResponse,
      claims: cached.claims,
      ...scores,
      checkedAt: cached.createdAt,
      locked: false,
    };
  }

  // If OpenRouter is not configured, return graceful fallback
  if (!isConfigured()) {
    return {
      modelId,
      prompt,
      rawResponse: "[OpenRouter API key not configured — unable to query AI models]",
      claims: [
        {
          category: "general",
          llmStatement:
            "AI model query unavailable — configure OPENROUTER_API_KEY to enable real-time employer audits.",
          verifiedValue: null,
          accuracy: "missing",
          severity: "moderate",
        },
      ],
      score: 0,
      accurateCount: 0,
      inaccurateCount: 0,
      unverifiableCount: 1,
      checkedAt: now,
      locked: false,
    };
  }

  // Real query via OpenRouter
  const result = await queryModel(modelId, prompt, { timeoutMs: 25_000 });

  if (!result.success) {
    console.error(`[llm-testing] ${modelId} query failed:`, result.error);
    return {
      modelId,
      prompt,
      rawResponse: "",
      claims: [
        {
          category: "general",
          llmStatement: `Failed to query ${modelId}: ${result.error ?? "unknown error"}`,
          verifiedValue: null,
          accuracy: "missing",
          severity: "minor",
        },
      ],
      score: 0,
      accurateCount: 0,
      inaccurateCount: 0,
      unverifiableCount: 1,
      checkedAt: now,
      locked: false,
    };
  }

  // Parse the real response into structured claims
  const claims = parseResponseIntoClaims(result.response, domain);
  const scores = scoreClaims(claims);

  // Write to cache (fire-and-forget)
  void setCachedResponse(
    slug,
    domain,
    modelId,
    prompt,
    result.response,
    claims,
    scores.score,
    result.tokensUsed,
    result.latencyMs
  );

  return {
    modelId,
    prompt,
    rawResponse: result.response,
    claims,
    ...scores,
    checkedAt: now,
    locked: false,
  };
}

/* ------------------------------------------------------------------ */
/* Consensus analysis                                                  */
/* ------------------------------------------------------------------ */

function analyseConsensus(results: LlmAuditResult[]): ConsensusItem[] {
  const unlocked = results.filter((r) => !r.locked);
  const categoryMap = new Map<string, LlmClaim[]>();

  for (const result of unlocked) {
    for (const claim of result.claims) {
      const existing = categoryMap.get(claim.category) || [];
      existing.push(claim);
      categoryMap.set(claim.category, existing);
    }
  }

  const consensus: ConsensusItem[] = [];
  for (const [category, claims] of categoryMap) {
    const accurateCount = claims.filter((c) => c.accuracy === "accurate").length;
    const inaccurateCount = claims.filter(
      (c) =>
        c.accuracy === "inaccurate" ||
        c.accuracy === "hallucinated" ||
        c.accuracy === "outdated"
    ).length;

    let consensusAccuracy: ConsensusItem["consensusAccuracy"] = "mixed";
    if (accurateCount > 0 && inaccurateCount === 0) consensusAccuracy = "accurate";
    else if (inaccurateCount > 0 && accurateCount === 0)
      consensusAccuracy = "inaccurate";

    consensus.push({
      category,
      agreementCount: Math.max(accurateCount, inaccurateCount),
      totalMentioned: claims.length,
      consensusAccuracy,
      dominantClaim: claims[0]?.llmStatement || "",
    });
  }

  return consensus;
}

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

/**
 * Run LLM reputation tests for a domain.
 * Queries real AI models via OpenRouter, gated by plan tier.
 */
export async function runLlmTests(
  domain: string,
  tier: PlanTier = "starter"
): Promise<ComprehensiveLlmAudit> {
  const company = domainToName(domain);
  const modelResults: LlmAuditResult[] = [];

  // Query all models in parallel (locked models return instantly)
  const promises = LLM_MODELS.map((model) => {
    const locked = !isModelAvailable(model.id, tier);
    return queryAndParseModel(model.id, domain, locked);
  });

  const results = await Promise.all(promises);
  modelResults.push(...results);

  const unlockedResults = modelResults.filter((r) => !r.locked);
  const overallScore =
    unlockedResults.length > 0
      ? Math.round(
          unlockedResults.reduce((sum, r) => sum + r.score, 0) /
            unlockedResults.length
        )
      : 0;

  const consensus = analyseConsensus(modelResults);

  // Extract top risks and strengths
  const allClaims = unlockedResults.flatMap((r) => r.claims);
  const topRisks = allClaims
    .filter((c) => c.severity === "critical")
    .map((c) => c.llmStatement)
    .slice(0, 3);
  const topStrengths = allClaims
    .filter((c) => c.accuracy === "accurate")
    .map((c) => c.llmStatement)
    .slice(0, 3);

  return {
    companyDomain: domain,
    companyName: company,
    overallScore,
    modelResults,
    consensus,
    topRisks:
      topRisks.length > 0
        ? topRisks
        : ["No verified employer data found — AI is guessing"],
    topStrengths: topStrengths.length > 0 ? topStrengths : [],
    planTier: tier,
    auditedAt: new Date().toISOString(),
  };
}

/**
 * Run a single ChatGPT query for the homepage AI preview.
 * Uses cache, returns raw response text + parsed claims.
 * Returns null if OpenRouter is not configured or query fails.
 */
export async function runSingleModelPreview(
  domain: string
): Promise<{
  model: string;
  response: string;
  claims: LlmClaim[];
  score: number;
  cached: boolean;
} | null> {
  const slug = domainToSlug(domain);
  const prompt = buildPrompt(domain);

  // Check cache first
  const cached = await getCachedResponse(slug, "chatgpt");
  if (cached) {
    return {
      model: "ChatGPT",
      response: cached.rawResponse,
      claims: cached.claims,
      score: scoreClaims(cached.claims).score,
      cached: true,
    };
  }

  if (!isConfigured()) return null;

  const result = await queryModel("chatgpt", prompt, { timeoutMs: 20_000 });
  if (!result.success) return null;

  const claims = parseResponseIntoClaims(result.response, domain);
  const scores = scoreClaims(claims);

  // Cache it
  void setCachedResponse(
    slug,
    domain,
    "chatgpt",
    prompt,
    result.response,
    claims,
    scores.score,
    result.tokensUsed,
    result.latencyMs
  );

  return {
    model: "ChatGPT",
    response: result.response,
    claims,
    score: scores.score,
    cached: false,
  };
}

/**
 * Legacy export for backward compatibility with audit-engine.ts.
 * Returns the old format (simple object with model name → string array).
 */
export async function runLlmTestsLegacy(domain: string) {
  const audit = await runLlmTests(domain, "starter");
  const result: Record<string, string[]> = {};

  for (const modelResult of audit.modelResults) {
    if (!modelResult.locked) {
      const model = LLM_MODELS.find((m) => m.id === modelResult.modelId);
      const name = model?.name || modelResult.modelId;
      result[name] = modelResult.claims.map((c) => c.llmStatement);
    }
  }

  return result;
}
