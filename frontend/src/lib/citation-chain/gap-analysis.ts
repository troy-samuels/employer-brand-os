/**
 * @module lib/citation-chain/gap-analysis
 * Builds a category-by-category source gap matrix from citation-chain output.
 */

import { PROMPT_CATEGORIES } from "@/lib/citation-chain/prompts";
import { classifySourceType, getCanonicalDomainKey } from "@/lib/citation-chain/source-mapper";
import type {
  CitationChainModelId,
  CitationChainResult,
  GoogleResult,
  LlmResponse,
  PromptCategoryId,
  SourceType,
} from "@/lib/citation-chain/types";

/**
 * Traffic-light status used in the gap matrix.
 */
export type GapStatus = "red" | "amber" | "green";

/**
 * Impact band used to prioritise row ordering.
 */
export type GapImpactLevel = "high" | "medium" | "low";

/**
 * AI citation detail for one model in one prompt category.
 */
export interface GapAiCitationDetail {
  /** Model id that produced the citations. */
  modelId: CitationChainModelId;
  /** URLs cited by this model for the category. */
  citations: string[];
}

/**
 * One row in the source gap matrix.
 */
export interface GapAnalysisRow {
  /** Prompt category id. */
  category: PromptCategoryId;
  /** Red/amber/green coverage status. */
  status: GapStatus;
  /** Top 3 Google domains for this category. */
  googleTopDomains: string[];
  /** Unique domains cited by AI models for this category. */
  aiCitedDomains: string[];
  /** Whether company domain appears in Google or AI citations. */
  companyAppears: boolean;
  /** Company rank position in Google results, or null when absent. */
  companyGooglePosition: number | null;
  /** Specific recommendation for closing the gap. */
  recommendedAction: string;
  /** Priority level for sorting and triage. */
  impactLevel: GapImpactLevel;
  /** Full Google results for the category (used by expandable UI). */
  googleResults: GoogleResult[];
  /** Per-model citations for the category (used by expandable UI). */
  aiCitationDetails: GapAiCitationDetail[];
  /** Which models cite the company domain in this category. */
  companyCitedByModels: CitationChainModelId[];
}

/**
 * Full source gap analysis for one citation-chain run.
 */
export interface GapAnalysis {
  /** Company domain used for canonical matching. */
  companyDomain: string;
  /** Sorted gap rows across all eight prompt categories. */
  rows: GapAnalysisRow[];
}

const CATEGORY_IMPACT_LEVEL: Record<PromptCategoryId, GapImpactLevel> = {
  salary: "high",
  interview: "high",
  reviews: "high",
  culture: "medium",
  benefits: "medium",
  remote_policy: "medium",
  competitors: "low",
  growth: "low",
};

const IMPACT_PRIORITY: Record<GapImpactLevel, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

const STATUS_PRIORITY: Record<GapStatus, number> = {
  red: 0,
  amber: 1,
  green: 2,
};

const CATEGORY_ORDER: Record<PromptCategoryId, number> = PROMPT_CATEGORIES.reduce(
  (accumulator, category, index) => ({
    ...accumulator,
    [category.id]: index,
  }),
  {
    salary: 0,
    culture: 1,
    benefits: 2,
    remote_policy: 3,
    interview: 4,
    competitors: 5,
    reviews: 6,
    growth: 7,
  } satisfies Record<PromptCategoryId, number>
);

const CATEGORY_LABELS: Record<PromptCategoryId, string> = PROMPT_CATEGORIES.reduce(
  (accumulator, category) => ({
    ...accumulator,
    [category.id]: category.label,
  }),
  {
    salary: "Salary",
    culture: "Culture",
    benefits: "Benefits",
    remote_policy: "Remote Policy",
    interview: "Interview",
    competitors: "Competitors",
    reviews: "Reviews",
    growth: "Growth",
  } satisfies Record<PromptCategoryId, string>
);

/**
 * Analyse citation-chain output and return an impact-sorted source gap matrix.
 */
export function analyseGaps(
  chainResult: CitationChainResult,
  companyDomain: string
): GapAnalysis {
  const resolvedCompanyDomain = companyDomain.trim() || chainResult.companyDomain.trim();
  const companyKey = getCanonicalDomainKey(resolvedCompanyDomain);

  const rows = PROMPT_CATEGORIES.map((category) => {
    const categoryId = category.id;
    const googleResults = chainResult.googleResults
      .filter((result) => result.category === categoryId)
      .slice()
      .sort((left, right) => left.position - right.position);
    const llmResponses = chainResult.llmResponses.filter((response) => response.category === categoryId);

    const googleTopDomains = getTopGoogleDomains(googleResults);
    const aiCitedDomains = getAiCitedDomains(llmResponses);
    const companyGooglePosition = findCompanyGooglePosition(googleResults, companyKey);
    const companyCitedByModels = findCompanyCitingModels(llmResponses, companyKey);
    const companyAppears = companyGooglePosition !== null || companyCitedByModels.length > 0;
    const status = getGapStatus(companyCitedByModels.length);
    const dominantSourceType = getDominantSourceType(
      [...googleTopDomains, ...aiCitedDomains],
      companyKey
    );

    return {
      category: categoryId,
      status,
      googleTopDomains,
      aiCitedDomains,
      companyAppears,
      companyGooglePosition,
      recommendedAction: buildRecommendedAction(
        categoryId,
        status,
        dominantSourceType,
        resolvedCompanyDomain
      ),
      impactLevel: CATEGORY_IMPACT_LEVEL[categoryId],
      googleResults,
      aiCitationDetails: llmResponses.map((response) => ({
        modelId: response.modelId,
        citations: response.citations,
      })),
      companyCitedByModels,
    } satisfies GapAnalysisRow;
  }).sort((left, right) => {
    const impactDiff = IMPACT_PRIORITY[left.impactLevel] - IMPACT_PRIORITY[right.impactLevel];
    if (impactDiff !== 0) {
      return impactDiff;
    }

    const statusDiff = STATUS_PRIORITY[left.status] - STATUS_PRIORITY[right.status];
    if (statusDiff !== 0) {
      return statusDiff;
    }

    return CATEGORY_ORDER[left.category] - CATEGORY_ORDER[right.category];
  });

  return {
    companyDomain: resolvedCompanyDomain,
    rows,
  };
}

function getGapStatus(citingModelCount: number): GapStatus {
  if (citingModelCount >= 2) {
    return "green";
  }

  if (citingModelCount === 1) {
    return "amber";
  }

  return "red";
}

function getTopGoogleDomains(results: GoogleResult[]): string[] {
  const seen = new Set<string>();
  const topDomains: string[] = [];

  for (const result of results) {
    const domain = getDisplayDomain(result.domain || result.url);
    if (!domain) {
      continue;
    }

    const key = getCanonicalDomainKey(domain) || domain;
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    topDomains.push(domain);

    if (topDomains.length >= 3) {
      break;
    }
  }

  return topDomains;
}

function getAiCitedDomains(responses: LlmResponse[]): string[] {
  const seen = new Set<string>();
  const domains: string[] = [];

  for (const response of responses) {
    for (const citation of response.citations) {
      const domain = getDisplayDomain(citation);
      if (!domain) {
        continue;
      }

      const key = getCanonicalDomainKey(domain) || domain;
      if (seen.has(key)) {
        continue;
      }

      seen.add(key);
      domains.push(domain);
    }
  }

  return domains;
}

function findCompanyGooglePosition(results: GoogleResult[], companyKey: string): number | null {
  if (!companyKey) {
    return null;
  }

  const match = results.find((result) => {
    const key = getCanonicalDomainKey(result.domain || result.url);
    return key === companyKey;
  });

  return match?.position ?? null;
}

function findCompanyCitingModels(
  responses: LlmResponse[],
  companyKey: string
): CitationChainModelId[] {
  if (!companyKey) {
    return [];
  }

  const models = new Set<CitationChainModelId>();

  for (const response of responses) {
    const citesCompany = response.citations.some((citation) => {
      const key = getCanonicalDomainKey(citation);
      return key === companyKey;
    });

    if (citesCompany) {
      models.add(response.modelId);
    }
  }

  return Array.from(models);
}

function getDominantSourceType(domains: string[], companyKey: string): SourceType {
  const counts: Record<SourceType, number> = {
    "review-platform": 0,
    employer: 0,
    forum: 0,
    news: 0,
    other: 0,
  };

  for (const domain of domains) {
    if (!domain) {
      continue;
    }

    const sourceType = classifySourceType(domain, companyKey);
    counts[sourceType] += 1;
  }

  const priority: SourceType[] = ["review-platform", "forum", "news", "other", "employer"];
  let winner: SourceType = "other";
  let winnerCount = -1;

  for (const sourceType of priority) {
    const count = counts[sourceType];
    if (count > winnerCount) {
      winner = sourceType;
      winnerCount = count;
    }
  }

  return winner;
}

function buildRecommendedAction(
  category: PromptCategoryId,
  status: GapStatus,
  dominantSourceType: SourceType,
  companyDomain: string
): string {
  const categoryLabel = CATEGORY_LABELS[category].toLowerCase();

  if (status === "green") {
    return `Maintain first-party ${categoryLabel} content on ${companyDomain} and refresh it monthly to keep multi-model coverage.`;
  }

  if (dominantSourceType === "review-platform") {
    return `Publish an authoritative ${categoryLabel} page on ${companyDomain} and link it from Glassdoor/Indeed profiles to shift AI citations to owned content.`;
  }

  if (dominantSourceType === "forum") {
    return `Create an official ${categoryLabel} FAQ on ${companyDomain} and answer recurring forum claims with canonical references AI can cite.`;
  }

  if (dominantSourceType === "news") {
    return `Add a newsroom-backed ${categoryLabel} update on ${companyDomain} with dated facts so models prefer current first-party data.`;
  }

  if (status === "amber") {
    return `Expand ${categoryLabel} coverage on ${companyDomain} with clearer headings and schema so at least two AI models cite your domain.`;
  }

  return `Create a crawlable ${categoryLabel} resource hub on ${companyDomain} and interlink it from careers pages to replace third-party citations.`;
}

function getDisplayDomain(input: string): string {
  const value = input.trim();
  if (!value) {
    return "";
  }

  try {
    const url = /^[a-z][a-z0-9+.-]*:\/\//i.test(value) ? value : `https://${value}`;
    const hostname = new URL(url).hostname.toLowerCase();
    if (!hostname.includes(".")) {
      return "";
    }

    return hostname.replace(/^www\./i, "");
  } catch {
    return "";
  }
}
