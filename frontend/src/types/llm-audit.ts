/**
 * @module types/llm-audit
 * Per-LLM audit result types — each model gets its own score, response,
 * and accuracy breakdown.
 */

/* ------------------------------------------------------------------ */
/* LLM Model Registry                                                  */
/* ------------------------------------------------------------------ */

/** Canonical identifiers for monitored LLMs. */
export type LlmModelId =
  | "chatgpt"
  | "google-ai"
  | "perplexity"
  | "copilot"
  | "claude"
  | "meta-ai";

/** Which plan tier unlocks each model. */
export type PlanTier = "starter" | "growth" | "scale" | "enterprise";

export interface LlmModelMeta {
  id: LlmModelId;
  name: string;
  provider: string;
  /** Minimum plan tier required to see results from this model. */
  requiredTier: PlanTier;
  /** Approximate reach description for UI display. */
  reach: string;
  /** Icon identifier or emoji for UI. */
  icon: string;
}

/** Registry of all monitored models with metadata. */
export const LLM_MODELS: LlmModelMeta[] = [
  {
    id: "chatgpt",
    name: "ChatGPT",
    provider: "OpenAI",
    requiredTier: "starter",
    reach: "Most-used AI assistant globally",
    icon: "🟢",
  },
  {
    id: "google-ai",
    name: "Google AI Overviews",
    provider: "Google",
    requiredTier: "starter",
    reach: "Appears in Google search results",
    icon: "🔵",
  },
  {
    id: "perplexity",
    name: "Perplexity",
    provider: "Perplexity AI",
    requiredTier: "starter",
    reach: "Research-focused, cites sources",
    icon: "🟣",
  },
  {
    id: "copilot",
    name: "Microsoft Copilot",
    provider: "Microsoft",
    requiredTier: "growth",
    reach: "Built into Bing, Edge, Windows, Office",
    icon: "🔷",
  },
  {
    id: "claude",
    name: "Claude",
    provider: "Anthropic",
    requiredTier: "scale",
    reach: "Popular with technical & professional users",
    icon: "🟠",
  },
  {
    id: "meta-ai",
    name: "Meta AI",
    provider: "Meta",
    requiredTier: "scale",
    reach: "WhatsApp, Instagram, Facebook — massive passive reach",
    icon: "🔵",
  },
];

/* ------------------------------------------------------------------ */
/* Per-LLM Audit Result                                                */
/* ------------------------------------------------------------------ */

/** A single factual claim extracted from an LLM response. */
export interface LlmClaim {
  /** The category of the claim (salary, benefits, culture, location, etc.). */
  category: string;
  /** What the LLM said. */
  llmStatement: string;
  /** The verified truth (from employer facts / pixel data), or null if unknown. */
  verifiedValue: string | null;
  /** Whether this claim is accurate, inaccurate, or unverifiable. */
  accuracy: "accurate" | "inaccurate" | "hallucinated" | "outdated" | "missing" | "unverifiable";
  /** Severity of the inaccuracy (if inaccurate). */
  severity?: "critical" | "moderate" | "minor";
  /** Source URL if the LLM cited one (Perplexity, Google). */
  sourceUrl?: string;
}

/** Full audit result for a single LLM model. */
export interface LlmAuditResult {
  /** Which model produced this result. */
  modelId: LlmModelId;
  /** The raw prompt sent to the model. */
  prompt: string;
  /** The raw response from the model. */
  rawResponse: string;
  /** Parsed claims extracted from the response. */
  claims: LlmClaim[];
  /** Per-model accuracy score (0–100). */
  score: number;
  /** Number of claims that were accurate. */
  accurateCount: number;
  /** Number of claims that were inaccurate or hallucinated. */
  inaccurateCount: number;
  /** Number of claims that couldn't be verified. */
  unverifiableCount: number;
  /** Timestamp of the check. */
  checkedAt: string;
  /** Whether this result is locked behind a higher plan tier. */
  locked: boolean;
}

/* ------------------------------------------------------------------ */
/* Aggregate Audit Result                                              */
/* ------------------------------------------------------------------ */

/** Cross-model consensus on a specific claim category. */
export interface ConsensusItem {
  /** The category (e.g., "salary", "benefits", "remote policy"). */
  category: string;
  /** How many models agree on the same answer. */
  agreementCount: number;
  /** Total models that mentioned this category. */
  totalMentioned: number;
  /** Whether the consensus is accurate or consistently wrong. */
  consensusAccuracy: "accurate" | "inaccurate" | "mixed";
  /** The most common statement across models. */
  dominantClaim: string;
}

/** The complete per-LLM audit result for a company. */
export interface ComprehensiveLlmAudit {
  /** Company domain that was audited. */
  companyDomain: string;
  /** Company name. */
  companyName: string;
  /** Overall AI reputation score (weighted average across models). */
  overallScore: number;
  /** Per-model results (some may be locked based on plan). */
  modelResults: LlmAuditResult[];
  /** Cross-model consensus analysis. */
  consensus: ConsensusItem[];
  /** Summary of the biggest risks. */
  topRisks: string[];
  /** Summary of what's going well. */
  topStrengths: string[];
  /** The user's plan tier (determines which models are unlocked). */
  planTier: PlanTier;
  /** When this audit was run. */
  auditedAt: string;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/** Get models available for a given plan tier. */
export function getModelsForTier(tier: PlanTier): LlmModelMeta[] {
  const tierOrder: Record<PlanTier, number> = {
    starter: 0,
    growth: 1,
    scale: 2,
    enterprise: 3,
  };
  const tierLevel = tierOrder[tier];
  return LLM_MODELS.filter((m) => tierOrder[m.requiredTier] <= tierLevel);
}

/** Get the count of models available for a given tier. */
export function getModelCountForTier(tier: PlanTier): number {
  return getModelsForTier(tier).length;
}

/** Check if a specific model is available on a given tier. */
export function isModelAvailable(modelId: LlmModelId, tier: PlanTier): boolean {
  return getModelsForTier(tier).some((m) => m.id === modelId);
}
