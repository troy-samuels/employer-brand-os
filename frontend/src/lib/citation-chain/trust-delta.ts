/**
 * @module lib/citation-chain/trust-delta
 * Trust-delta extraction and cost-of-misinformation helpers.
 */

import { PROMPT_CATEGORIES } from "@/lib/citation-chain/prompts";
import { getCanonicalDomainKey } from "@/lib/citation-chain/source-mapper";
import type { LlmResponse, PromptCategoryId } from "@/lib/citation-chain/types";

const CATEGORY_LABELS: Record<PromptCategoryId, string> = {
  salary: "Senior Engineer Salary",
  culture: "Company Culture",
  benefits: "Benefits",
  remote_policy: "Remote Policy",
  interview: "Interview Process",
  competitors: "Employer Competitors",
  reviews: "Employee Reviews",
  growth: "Hiring Growth",
};

const MODEL_PRIORITY: Record<LlmResponse["modelId"], number> = {
  chatgpt: 3,
  claude: 2,
  perplexity: 1,
};

const SOURCE_LABELS: Record<string, string> = {
  glassdoor: "Glassdoor",
  indeed: "Indeed",
  linkedin: "LinkedIn",
  reddit: "Reddit",
  comparably: "Comparably",
};

const SALARY_MATCH_THRESHOLD = 1_000;

const SALARY_RANGE_REGEX =
  /([£$€])\s*(\d{1,3}(?:[,\s]\d{3})*|\d+(?:\.\d+)?)\s*([kK])?\s*(?:-|–|—|to)\s*(?:([£$€])\s*)?(\d{1,3}(?:[,\s]\d{3})*|\d+(?:\.\d+)?)\s*([kK])?\s*(?:\s*(?:\/\s*(?:yr|year)|per\s+annum))?/i;

/**
 * Parsed salary range extracted from unstructured AI output.
 */
export interface SalaryRange {
  /** Currency symbol found in text. */
  currency: "£" | "$" | "€";
  /** Minimum annual value. */
  min: number;
  /** Maximum annual value. */
  max: number;
  /** Raw matched substring. */
  raw: string;
}

/**
 * One trust-gap row shown in the Trust Delta table.
 */
export interface DeltaItem {
  /** Human-readable audit category label. */
  category: string;
  /** What AI currently reports to candidates. */
  aiSays: string;
  /** Published company reality; null when unavailable. */
  reality: string | null;
  /** Human-readable difference; null when reality is unknown. */
  delta: string | null;
  /** The dominant source AI appears to rely on. */
  source: string;
  /** Confidence level in extracted AI claim. */
  confidence: "high" | "medium" | "low";
}

/**
 * Full trust-delta payload used by UI and downstream calculators.
 */
export interface TrustDeltaResult {
  /** Per-category trust-delta rows. */
  items: DeltaItem[];
  /** % of categories that are wrong or missing. */
  hallucinationRate: number;
}

/**
 * Inputs for cost-of-misinformation estimation.
 */
export interface CostCalculatorInput {
  /** Number of actively hiring roles. */
  activeRoles: number;
  /** Monthly candidate views driven by AI-assisted job discovery. */
  monthlyViews: number;
  /** Average recruiting cost per successful hire. */
  costPerHire: number;
  /** Hallucination rate percentage (0-100). */
  hallucinationRate: number;
  /** Estimated share of candidates who drop off due to misinformation (0-1). */
  estimatedDropoff?: number;
  /** Average number of views required to generate one hire. */
  viewsPerHire?: number;
}

/**
 * Output of the monthly misinformation spend estimate.
 */
export interface CostCalculationResult {
  /** Estimated wasted spend per month in GBP. */
  monthlyWastedSpend: number;
  /** ROI multiplier versus OpenRole Pro subscription cost. */
  roi: number;
}

/**
 * Default active roles value for calculator UX.
 */
export const DEFAULT_ACTIVE_ROLES = 10;

/**
 * Default monthly AI-assisted job views.
 */
export const DEFAULT_MONTHLY_VIEWS = 2_000;

/**
 * Default average cost-per-hire in GBP.
 */
export const DEFAULT_COST_PER_HIRE_GBP = 8_500;

/**
 * Default drop-off assumption used when no custom value is provided.
 */
export const DEFAULT_ESTIMATED_DROPOFF = 0.2;

/**
 * Default views-to-hire conversion assumption.
 */
export const DEFAULT_VIEWS_PER_HIRE = 100;

/**
 * OpenRole Pro monthly subscription price in GBP.
 */
export const OPENROLE_PRO_MONTHLY_PRICE_GBP = 299;

/**
 * Parse a salary range from a free-text AI response.
 */
export function parseSalaryRange(text: string): SalaryRange | null {
  const match = text.match(SALARY_RANGE_REGEX);
  if (!match) {
    return null;
  }

  const primaryCurrency = match[1];
  const minRaw = match[2];
  const minSuffix = match[3];
  const secondaryCurrency = match[4];
  const maxRaw = match[5];
  const maxSuffix = match[6];
  const selectedCurrency = (secondaryCurrency ?? primaryCurrency) as SalaryRange["currency"] | undefined;

  if (!selectedCurrency || !minRaw || !maxRaw) {
    return null;
  }

  const minValue = parseSalaryNumber(minRaw, minSuffix);
  const maxValue = parseSalaryNumber(maxRaw, maxSuffix);

  if (minValue === null || maxValue === null) {
    return null;
  }

  return {
    currency: selectedCurrency,
    min: Math.min(minValue, maxValue),
    max: Math.max(minValue, maxValue),
    raw: match[0].trim(),
  };
}

/**
 * Calculate trust delta rows from LLM responses and company domain ownership.
 */
export function calculateTrustDelta(
  llmResponses: LlmResponse[],
  companyDomain: string
): TrustDeltaResult {
  const companyDomainKey = getCanonicalDomainKey(companyDomain);
  const items = PROMPT_CATEGORIES.map((category) => {
    const responses = llmResponses.filter((response) => response.category === category.id);
    return buildDeltaItem(category.id, responses, companyDomainKey);
  });

  return {
    items,
    hallucinationRate: deriveHallucinationRate(items),
  };
}

/**
 * Derive hallucination rate as percentage of rows with wrong or missing data.
 */
export function deriveHallucinationRate(items: DeltaItem[]): number {
  if (items.length === 0) {
    return 0;
  }

  const problematicCount = items.filter(isProblematicDelta).length;
  return roundTo((problematicCount / items.length) * 100, 2);
}

/**
 * Estimate monthly recruiting spend wasted due to misinformation.
 * Formula: (views × hallucination_rate × estimated_dropoff × cost_per_hire / views_per_hire)
 */
export function calculateMisinformationCost(
  input: CostCalculatorInput
): CostCalculationResult {
  const activeRoles = sanitiseNonNegative(input.activeRoles, DEFAULT_ACTIVE_ROLES);
  const monthlyViews = sanitiseNonNegative(input.monthlyViews, DEFAULT_MONTHLY_VIEWS);
  const costPerHire = sanitiseNonNegative(input.costPerHire, DEFAULT_COST_PER_HIRE_GBP);
  const hallucinationRate = clamp(input.hallucinationRate, 0, 100) / 100;
  const estimatedDropoff = clamp(
    input.estimatedDropoff ?? DEFAULT_ESTIMATED_DROPOFF,
    0,
    1
  );
  const viewsPerHire = Math.max(1, sanitiseNonNegative(input.viewsPerHire ?? DEFAULT_VIEWS_PER_HIRE, DEFAULT_VIEWS_PER_HIRE));

  const roleAdjustedViews = monthlyViews * (activeRoles / DEFAULT_ACTIVE_ROLES);
  const monthlyWastedSpend =
    (roleAdjustedViews * hallucinationRate * estimatedDropoff * costPerHire) / viewsPerHire;

  return {
    monthlyWastedSpend: roundTo(monthlyWastedSpend, 2),
    roi: roundTo(monthlyWastedSpend / OPENROLE_PRO_MONTHLY_PRICE_GBP, 2),
  };
}

/**
 * Format a GBP amount using UK locale separators.
 */
export function formatGbpCurrency(value: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format ROI as an `XXx` style multiplier label.
 */
export function formatRoiMultiple(roi: number): string {
  if (!Number.isFinite(roi) || roi <= 0) {
    return "0x";
  }

  const rounded = roi >= 100 ? Math.round(roi).toString() : roundTo(roi, 1).toString();
  return `${rounded.replace(/\.0$/, "")}x`;
}

function buildDeltaItem(
  categoryId: PromptCategoryId,
  responses: LlmResponse[],
  companyDomainKey: string
): DeltaItem {
  const representative = selectRepresentativeResponse(responses, companyDomainKey);

  if (!representative) {
    return {
      category: CATEGORY_LABELS[categoryId],
      aiSays: "No AI answer captured",
      reality: null,
      delta: null,
      source: "Unknown",
      confidence: "low",
    };
  }

  const aiSays = buildAiClaim(categoryId, representative.response);
  const reality = inferReality(categoryId, responses, companyDomainKey);
  const delta = computeDelta(categoryId, representative.response, aiSays, reality);

  return {
    category: CATEGORY_LABELS[categoryId],
    aiSays,
    reality,
    delta,
    source: inferSource(representative.citations, companyDomainKey),
    confidence: inferConfidence(representative, companyDomainKey),
  };
}

function selectRepresentativeResponse(
  responses: LlmResponse[],
  companyDomainKey: string
): LlmResponse | null {
  if (responses.length === 0) {
    return null;
  }

  const viableResponses = responses.filter((response) => !response.failed && response.response.trim().length > 0);
  if (viableResponses.length === 0) {
    return responses[0] ?? null;
  }

  return viableResponses
    .slice()
    .sort((left, right) => {
      const leftWeight = responseWeight(left, companyDomainKey);
      const rightWeight = responseWeight(right, companyDomainKey);

      if (leftWeight !== rightWeight) {
        return rightWeight - leftWeight;
      }

      return MODEL_PRIORITY[right.modelId] - MODEL_PRIORITY[left.modelId];
    })[0] ?? null;
}

function responseWeight(response: LlmResponse, companyDomainKey: string): number {
  const hasCompanySource = hasCompanyCitation(response, companyDomainKey);
  const salaryRange = parseSalaryRange(response.response);

  return (
    (hasCompanySource ? 30 : 0)
    + Math.min(response.citations.length, 6) * 4
    + (salaryRange ? 8 : 0)
    + MODEL_PRIORITY[response.modelId]
  );
}

function inferConfidence(
  response: LlmResponse,
  companyDomainKey: string
): DeltaItem["confidence"] {
  if (response.failed || response.response.trim().length === 0) {
    return "low";
  }

  const citationCount = response.citations.length;
  const hasCompanySource = hasCompanyCitation(response, companyDomainKey);

  if (hasCompanySource && citationCount >= 2) {
    return "high";
  }

  if (hasCompanySource || citationCount >= 2) {
    return "medium";
  }

  return "low";
}

function hasCompanyCitation(response: LlmResponse, companyDomainKey: string): boolean {
  if (!companyDomainKey) {
    return false;
  }

  return response.citations.some((citation) => getCanonicalDomainKey(citation) === companyDomainKey);
}

function buildAiClaim(categoryId: PromptCategoryId, responseText: string): string {
  if (categoryId === "salary") {
    const parsedRange = parseSalaryRange(responseText);
    if (parsedRange) {
      return formatSalaryRange(parsedRange);
    }
  }

  const normalised = responseText.replace(/\s+/g, " ").trim();
  if (!normalised) {
    return "No AI answer captured";
  }

  const sentenceMatch = normalised.match(/(.+?[.!?])(?:\s|$)/);
  const primarySentence = sentenceMatch?.[1] ?? normalised;

  return primarySentence.length > 190
    ? `${primarySentence.slice(0, 187).trimEnd()}...`
    : primarySentence;
}

function inferReality(
  categoryId: PromptCategoryId,
  responses: LlmResponse[],
  companyDomainKey: string
): string | null {
  if (categoryId !== "salary" || !companyDomainKey) {
    return null;
  }

  const companyBackedResponses = responses.filter((response) =>
    response.citations.some((citation) => getCanonicalDomainKey(citation) === companyDomainKey)
  );

  const representative = selectRepresentativeResponse(companyBackedResponses, companyDomainKey);
  if (!representative) {
    return null;
  }

  const salaryRange = parseSalaryRange(representative.response);
  if (!salaryRange) {
    return null;
  }

  return formatSalaryRange(salaryRange);
}

function computeDelta(
  categoryId: PromptCategoryId,
  sourceResponse: string,
  aiSays: string,
  reality: string | null
): string | null {
  if (reality === null) {
    return null;
  }

  if (categoryId === "salary") {
    const aiRange = parseSalaryRange(sourceResponse) ?? parseSalaryRange(aiSays);
    const realityRange = parseSalaryRange(reality);

    if (!aiRange || !realityRange) {
      return "Mismatch with published data";
    }

    const aiMidpoint = (aiRange.min + aiRange.max) / 2;
    const realityMidpoint = (realityRange.min + realityRange.max) / 2;
    const difference = aiMidpoint - realityMidpoint;

    if (Math.abs(difference) < SALARY_MATCH_THRESHOLD) {
      return "Matches published range";
    }

    const sign = difference > 0 ? "+" : "-";
    return `${sign}${formatCompactCurrency(Math.abs(difference), realityRange.currency)}`;
  }

  return normaliseComparableText(aiSays) === normaliseComparableText(reality)
    ? "Matches published data"
    : "Mismatch with published data";
}

function inferSource(citations: string[], companyDomainKey: string): string {
  if (citations.length === 0) {
    return "Unknown";
  }

  for (const citation of citations) {
    const canonicalKey = getCanonicalDomainKey(citation);
    if (canonicalKey === companyDomainKey && canonicalKey) {
      return "Company website";
    }

    const known = SOURCE_LABELS[canonicalKey];
    if (known) {
      return known;
    }
  }

  const firstDomain = extractDomain(citations[0]);
  if (!firstDomain) {
    return "Unknown";
  }

  return firstDomain.replace(/^www\./i, "");
}

function extractDomain(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }

  const urlCandidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    return new URL(urlCandidate).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function formatSalaryRange(range: SalaryRange): string {
  return `${range.currency}${formatWholeNumber(range.min)} - ${range.currency}${formatWholeNumber(range.max)}`;
}

function formatWholeNumber(value: number): string {
  return Math.round(value).toLocaleString("en-GB");
}

function formatCompactCurrency(value: number, currency: SalaryRange["currency"]): string {
  if (value >= 1_000) {
    const inThousands = value / 1_000;
    const digits = inThousands >= 100 ? 0 : 1;
    return `${currency}${trimTrailingZero(roundTo(inThousands, digits))}K`;
  }

  return `${currency}${formatWholeNumber(value)}`;
}

function trimTrailingZero(value: number): string {
  return value.toFixed(1).replace(/\.0$/, "");
}

function parseSalaryNumber(raw: string | undefined, suffix: string | undefined): number | null {
  if (!raw) {
    return null;
  }

  const numeric = Number(raw.replace(/[\s,]/g, ""));
  if (!Number.isFinite(numeric)) {
    return null;
  }

  return suffix?.toLowerCase() === "k" ? numeric * 1_000 : numeric;
}

function normaliseComparableText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function sanitiseNonNegative(value: number, fallback: number): number {
  if (!Number.isFinite(value) || value < 0) {
    return fallback;
  }

  return value;
}

function roundTo(value: number, decimals: number): number {
  const multiplier = 10 ** decimals;
  return Math.round(value * multiplier) / multiplier;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function isProblematicDelta(item: DeltaItem): boolean {
  if (item.reality === null) {
    return true;
  }

  if (item.delta === null) {
    return true;
  }

  if (/^matches/i.test(item.delta)) {
    return false;
  }

  if (/^[+-]/.test(item.delta)) {
    return true;
  }

  return /mismatch|outdated|unknown/i.test(item.delta);
}
