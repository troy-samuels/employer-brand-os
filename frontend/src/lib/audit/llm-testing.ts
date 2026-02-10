/**
 * @module lib/audit/llm-testing
 * Runs per-LLM reputation checks for a company domain.
 *
 * Phase 1: Returns structured placeholder results per model.
 * Phase 2: Will call actual LLM APIs with standardised employer prompts.
 */

import type {
  LlmModelId,
  LlmAuditResult,
  LlmClaim,
  PlanTier,
  ComprehensiveLlmAudit,
  ConsensusItem,
} from "@/types/llm-audit";
import { LLM_MODELS, getModelsForTier, isModelAvailable } from "@/types/llm-audit";

/* ------------------------------------------------------------------ */
/* Standard prompts (used when querying each LLM)                      */
/* ------------------------------------------------------------------ */

const EMPLOYER_PROMPTS = [
  "What is it like to work at {company}?",
  "What does {company} pay its employees?",
  "What benefits does {company} offer?",
  "Is {company} a good employer?",
];

/** Build the standard prompt for a given company. */
export function buildPrompt(domain: string): string {
  const company = domain.replace(/\.(com|co\.uk|io|org|net)$/i, "");
  return EMPLOYER_PROMPTS.map((p) => p.replace("{company}", company)).join("\n");
}

/* ------------------------------------------------------------------ */
/* Phase 1: Placeholder results                                        */
/* ------------------------------------------------------------------ */

/**
 * Generate a placeholder LLM audit result for a model.
 * In Phase 2, this will be replaced with actual API calls.
 */
function generatePlaceholderResult(
  modelId: LlmModelId,
  domain: string,
  locked: boolean
): LlmAuditResult {
  const company = domain.replace(/\.(com|co\.uk|io|org|net)$/i, "");
  const now = new Date().toISOString();

  if (locked) {
    return {
      modelId,
      prompt: buildPrompt(domain),
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

  // Placeholder claims that simulate what real LLM responses look like
  const placeholderClaims: Record<LlmModelId, LlmClaim[]> = {
    chatgpt: [
      {
        category: "salary",
        llmStatement: `${company} offers competitive salaries, though specific figures are not publicly available.`,
        verifiedValue: null,
        accuracy: "missing",
        severity: "moderate",
      },
      {
        category: "culture",
        llmStatement: `${company} is generally well-regarded as an employer with a positive work culture.`,
        verifiedValue: null,
        accuracy: "unverifiable" as const,
      },
      {
        category: "benefits",
        llmStatement: `Benefits typically include standard offerings such as health insurance and pension contributions.`,
        verifiedValue: null,
        accuracy: "hallucinated",
        severity: "moderate",
      },
    ],
    "google-ai": [
      {
        category: "salary",
        llmStatement: `Based on Glassdoor data, average salaries at ${company} range from £25,000 to £65,000.`,
        verifiedValue: null,
        accuracy: "outdated",
        severity: "critical",
        sourceUrl: "https://www.glassdoor.co.uk",
      },
      {
        category: "location",
        llmStatement: `${company} is based in the United Kingdom.`,
        verifiedValue: null,
        accuracy: "accurate",
      },
    ],
    perplexity: [
      {
        category: "salary",
        llmStatement: `According to Indeed, ${company} pays between £28,000-£55,000 depending on role.`,
        verifiedValue: null,
        accuracy: "outdated",
        severity: "critical",
        sourceUrl: "https://www.indeed.co.uk",
      },
      {
        category: "reviews",
        llmStatement: `${company} has a 3.4/5 rating on Glassdoor based on 12 reviews.`,
        verifiedValue: null,
        accuracy: "outdated",
        severity: "minor",
        sourceUrl: "https://www.glassdoor.co.uk",
      },
    ],
    copilot: [
      {
        category: "salary",
        llmStatement: `Salary information for ${company} is limited. Consider checking job listings directly.`,
        verifiedValue: null,
        accuracy: "missing",
        severity: "moderate",
      },
      {
        category: "culture",
        llmStatement: `${company} appears to be a growing company in its sector.`,
        verifiedValue: null,
        accuracy: "unverifiable" as const,
      },
    ],
    claude: [
      {
        category: "salary",
        llmStatement: `I don't have specific salary data for ${company}. I'd recommend checking their careers page or salary comparison sites.`,
        verifiedValue: null,
        accuracy: "missing",
        severity: "moderate",
      },
      {
        category: "benefits",
        llmStatement: `I don't have detailed information about ${company}'s benefits package.`,
        verifiedValue: null,
        accuracy: "missing",
        severity: "minor",
      },
    ],
    "meta-ai": [
      {
        category: "salary",
        llmStatement: `${company} salaries vary by role. Check Glassdoor for the latest figures.`,
        verifiedValue: null,
        accuracy: "missing",
        severity: "moderate",
      },
      {
        category: "culture",
        llmStatement: `${company} seems like a decent place to work based on online reviews.`,
        verifiedValue: null,
        accuracy: "unverifiable" as const,
      },
    ],
  };

  const claims = placeholderClaims[modelId] || [];
  const accurateCount = claims.filter((c) => c.accuracy === "accurate").length;
  const inaccurateCount = claims.filter(
    (c) => c.accuracy === "inaccurate" || c.accuracy === "hallucinated" || c.accuracy === "outdated"
  ).length;
  const unverifiableCount = claims.filter(
    (c) => c.accuracy === "unverifiable" || c.accuracy === "missing"
  ).length;

  // Score: 100 if all accurate, penalise for inaccuracies
  const total = claims.length || 1;
  const score = Math.round(((accurateCount * 100) + (unverifiableCount * 40)) / total);

  return {
    modelId,
    prompt: buildPrompt(domain),
    rawResponse: claims.map((c) => c.llmStatement).join(" "),
    claims,
    score,
    accurateCount,
    inaccurateCount,
    unverifiableCount,
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
      (c) => c.accuracy === "inaccurate" || c.accuracy === "hallucinated" || c.accuracy === "outdated"
    ).length;

    let consensusAccuracy: ConsensusItem["consensusAccuracy"] = "mixed";
    if (accurateCount > 0 && inaccurateCount === 0) consensusAccuracy = "accurate";
    else if (inaccurateCount > 0 && accurateCount === 0) consensusAccuracy = "inaccurate";

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
 * Returns per-model results gated by plan tier.
 */
export async function runLlmTests(
  domain: string,
  tier: PlanTier = "starter"
): Promise<ComprehensiveLlmAudit> {
  const company = domain.replace(/\.(com|co\.uk|io|org|net)$/i, "");
  const modelResults: LlmAuditResult[] = [];

  for (const model of LLM_MODELS) {
    const locked = !isModelAvailable(model.id, tier);
    const result = generatePlaceholderResult(model.id, domain, locked);
    modelResults.push(result);
  }

  const unlockedResults = modelResults.filter((r) => !r.locked);
  const overallScore = unlockedResults.length > 0
    ? Math.round(unlockedResults.reduce((sum, r) => sum + r.score, 0) / unlockedResults.length)
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
    topRisks: topRisks.length > 0 ? topRisks : ["No verified employer data found — AI is guessing"],
    topStrengths: topStrengths.length > 0 ? topStrengths : [],
    planTier: tier,
    auditedAt: new Date().toISOString(),
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
