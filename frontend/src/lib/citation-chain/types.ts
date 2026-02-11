/**
 * @module lib/citation-chain/types
 * Shared types for the citation chain engine.
 */

import type { LlmModelId } from "@/types/llm-audit";

/**
 * Prompt category identifiers used across Google and LLM querying.
 */
export type PromptCategoryId =
  | "salary"
  | "culture"
  | "benefits"
  | "remote_policy"
  | "interview"
  | "competitors"
  | "reviews"
  | "growth";

/**
 * A standardised prompt category definition.
 */
export interface PromptCategory {
  /** Stable category id used in analytics and mapping. */
  id: PromptCategoryId;
  /** Human label for UI display. */
  label: string;
  /** LLM prompt template with `{company}` and optional `{role}` placeholders. */
  template: string;
  /** Google query template with `{company}` and optional `{role}` placeholders. */
  googleTemplate: string;
}

/**
 * Supported model ids for citation chain checks.
 */
export const CITATION_CHAIN_MODEL_IDS = ["chatgpt", "claude", "perplexity"] as const;

/**
 * Model id union for the citation chain engine.
 */
export type CitationChainModelId = Extract<LlmModelId, (typeof CITATION_CHAIN_MODEL_IDS)[number]>;

/**
 * One organic Google search result.
 */
export interface GoogleResult {
  /** The prompt category this result belongs to. */
  category: PromptCategoryId;
  /** The full search query used to obtain the result. */
  query: string;
  /** Result URL. */
  url: string;
  /** Normalised hostname (no scheme). */
  domain: string;
  /** Result title. */
  title: string;
  /** Result snippet/description. */
  snippet: string;
  /** Organic ranking position (1-10). */
  position: number;
}

/**
 * One model response for one prompt category.
 */
export interface LlmResponse {
  /** Model that produced this response. */
  modelId: CitationChainModelId;
  /** Prompt category this response belongs to. */
  category: PromptCategoryId;
  /** Prompt text sent to the model. */
  prompt: string;
  /** Raw response text. */
  response: string;
  /** Citation URLs extracted/returned by the model. */
  citations: string[];
  /** Runtime metadata in milliseconds. */
  latencyMs: number;
  /** True when the query failed and this is a partial placeholder. */
  failed?: boolean;
  /** Error details for failed responses. */
  error?: string;
}

/**
 * Source classification values used for mapping.
 */
export const SOURCE_TYPES = ["review-platform", "employer", "forum", "news", "other"] as const;

/**
 * Source classification union for mapping output.
 */
export type SourceType = (typeof SOURCE_TYPES)[number];

/**
 * Mapping row that links Google rankings to model citations.
 */
export interface SourceMapping {
  /** Category for which this mapping was computed. */
  category: PromptCategoryId;
  /** Google organic position of the source. */
  googlePosition: number;
  /** Mapped domain. */
  domain: string;
  /** Which models cited this source. */
  citedByModels: CitationChainModelId[];
  /** Source family bucket for UI treatment. */
  sourceType: SourceType;
}

/**
 * Non-fatal run error details returned when partial results are produced.
 */
export interface CitationRunError {
  /** The subsystem that raised the error. */
  scope: "google" | CitationChainModelId;
  /** Category associated with the failure. */
  category?: PromptCategoryId;
  /** Human-readable error message. */
  message: string;
}

/**
 * Full citation chain engine output for one company.
 */
export interface CitationChainResult {
  /** Audited company name. */
  companyName: string;
  /** Audited company domain. */
  companyDomain: string;
  /** Flattened Google results across all categories. */
  googleResults: GoogleResult[];
  /** Flattened LLM responses across all categories and models. */
  llmResponses: LlmResponse[];
  /** Mapping between Google results and model citations. */
  sourceMappings: SourceMapping[];
  /**
   * Citation Score = (citations from employer domain / total citations) × 100.
   * Capped to 0-100.
   */
  citationScore: number;
  /** ISO timestamp of generation time. */
  timestamp: string;
  /** Non-fatal errors captured during execution. */
  errors: CitationRunError[];
}
