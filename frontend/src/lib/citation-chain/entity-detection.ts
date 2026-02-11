/**
 * @module lib/citation-chain/entity-detection
 * Entity confusion detection for similarly named companies in LLM output.
 */

import { getCanonicalDomainKey } from "@/lib/citation-chain/source-mapper";
import { CITATION_CHAIN_MODEL_IDS } from "@/lib/citation-chain/types";
import type { CitationChainModelId, LlmResponse } from "@/lib/citation-chain/types";

const ENTITY_PATTERN =
  /\b[A-Z][A-Za-z0-9&'’.-]*(?:\s+(?:[A-Z][A-Za-z0-9&'’.-]*|of|and|the|&)){0,5}/g;

const COMPANY_SUFFIXES = new Set([
  "ltd",
  "inc",
  "group",
  "plc",
  "corp",
  "limited",
  "holdings",
]);

const CONNECTOR_TOKENS = new Set(["and", "of", "the"]);

const DESCRIPTOR_TOKENS = new Set([
  "career",
  "careers",
  "job",
  "jobs",
  "review",
  "reviews",
  "salary",
  "salaries",
  "employees",
  "employer",
  "official",
  "website",
  "site",
]);

const NON_ENTITY_TOKENS = new Set([
  "public",
  "available",
  "sources",
  "candidate",
  "candidates",
  "commentary",
  "articles",
  "evidence",
]);

const SHORT_ORG_TOKENS = new Set(["ai", "it"]);

const INDUSTRY_TOKEN_MAP: Record<string, string> = {
  tech: "technology",
  technology: "technology",
  software: "technology",
  digital: "technology",
  cloud: "technology",
  systems: "technology",
  platform: "technology",
  data: "technology",
  ai: "technology",
  it: "technology",
  health: "healthcare",
  healthcare: "healthcare",
  medical: "healthcare",
  pharma: "healthcare",
  biopharma: "healthcare",
  hospital: "healthcare",
  clinic: "healthcare",
  plan: "healthcare",
  finance: "financial",
  financial: "financial",
  banking: "financial",
  bank: "financial",
  insurance: "financial",
  capital: "financial",
  payments: "financial",
  logistics: "logistics",
  shipping: "logistics",
  freight: "logistics",
  education: "education",
  learning: "education",
  academy: "education",
};

const MODEL_ORDER = new Map(CITATION_CHAIN_MODEL_IDS.map((modelId, index) => [modelId, index]));

interface EntityMention {
  rawName: string;
  normalizedName: string;
  tokens: string[];
  start: number;
  end: number;
}

interface ConfusedEntityAccumulator {
  name: string;
  mentionedInModels: Set<CitationChainModelId>;
  evidenceSnippet: string;
}

/**
 * Severity level for entity confusion detection.
 */
export type EntityConfusionSeverity = "none" | "low" | "medium" | "high";

/**
 * One similarly named entity that appeared in model responses.
 */
export interface ConfusedEntity {
  /** The non-target entity name that was mentioned. */
  name: string;
  /** Which models mentioned this entity. */
  mentionedInModels: CitationChainModelId[];
  /** Short response snippet that demonstrates the confusion. */
  evidenceSnippet: string;
}

/**
 * Output payload describing whether models conflated target and non-target entities.
 */
export interface EntityConfusionResult {
  /** True when confusion signals were found. */
  isConfused: boolean;
  /** Aggregated confusion severity. */
  severity: EntityConfusionSeverity;
  /** Distinct confused entities observed in model output. */
  confusedEntities: ConfusedEntity[];
  /** Percentage of models that identified the target company (0-100). */
  correctIdentificationRate: number;
  /** Human recommendation to reduce confusion risk. */
  recommendation: string;
}

/**
 * Detect similarly named non-target entities across model responses.
 */
export function detectEntityConfusion(
  llmResponses: LlmResponse[],
  companyName: string,
  companyDomain: string
): EntityConfusionResult {
  const targetTokens = normaliseEntityTokens(companyName);
  const targetNormalizedName = targetTokens.join(" ");
  const targetDomainKey = getCanonicalDomainKey(companyDomain);

  const modelIds = Array.from(new Set(llmResponses.map((response) => response.modelId)));
  const modelsIdentifyingTarget = new Set<CitationChainModelId>();
  const confusedEntities = new Map<string, ConfusedEntityAccumulator>();

  for (const response of llmResponses) {
    const mentions = extractEntityMentions(response.response);
    const modelId = response.modelId;
    let hasTargetMention = false;

    for (const mention of mentions) {
      if (isEquivalentEntity(mention, targetTokens, targetNormalizedName)) {
        hasTargetMention = true;
        continue;
      }

      if (isConfusableEntity(mention, targetTokens, targetNormalizedName)) {
        addConfusedEntity(confusedEntities, mention, response.response, modelId);
      }
    }

    if (!hasTargetMention && targetDomainKey) {
      hasTargetMention = response.citations.some(
        (citationUrl) => getCanonicalDomainKey(citationUrl) === targetDomainKey
      );
    }

    if (hasTargetMention) {
      modelsIdentifyingTarget.add(modelId);
    }
  }

  const confusedEntityList = Array.from(confusedEntities.values())
    .map((entity) => ({
      name: entity.name,
      mentionedInModels: Array.from(entity.mentionedInModels).sort(compareModels),
      evidenceSnippet: entity.evidenceSnippet,
    }))
    .sort((left, right) => {
      if (left.mentionedInModels.length !== right.mentionedInModels.length) {
        return right.mentionedInModels.length - left.mentionedInModels.length;
      }
      return left.name.localeCompare(right.name);
    });

  const correctIdentificationRate = calculateCorrectIdentificationRate(
    modelIds,
    modelsIdentifyingTarget
  );

  const isConfused = confusedEntityList.length > 0 || correctIdentificationRate < 50;
  const severity = determineSeverity(
    isConfused,
    confusedEntityList.length,
    correctIdentificationRate
  );

  return {
    isConfused,
    severity,
    confusedEntities: confusedEntityList,
    correctIdentificationRate,
    recommendation: getRecommendation(severity),
  };
}

function extractEntityMentions(responseText: string): EntityMention[] {
  const mentions: EntityMention[] = [];
  const seen = new Set<string>();

  for (const match of responseText.matchAll(ENTITY_PATTERN)) {
    const rawCandidate = (match[0] ?? "").trim().replace(/[.,;:!?]+$/g, "");
    const matchIndex = match.index ?? 0;

    if (!rawCandidate) {
      continue;
    }

    const tokens = normaliseEntityTokens(rawCandidate);
    if (!isLikelyEntity(tokens)) {
      continue;
    }

    const normalizedName = tokens.join(" ");
    if (seen.has(normalizedName)) {
      continue;
    }

    seen.add(normalizedName);
    mentions.push({
      rawName: rawCandidate,
      normalizedName,
      tokens,
      start: matchIndex,
      end: matchIndex + rawCandidate.length,
    });
  }

  return mentions;
}

function isLikelyEntity(tokens: string[]): boolean {
  if (tokens.length === 0) {
    return false;
  }

  if (tokens.every((token) => NON_ENTITY_TOKENS.has(token))) {
    return false;
  }

  if (tokens.length === 1) {
    const token = tokens[0] ?? "";
    return token.length >= 3 || SHORT_ORG_TOKENS.has(token);
  }

  return true;
}

function normaliseEntityTokens(value: string): string[] {
  const parsedTokens = value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .filter((token) => !CONNECTOR_TOKENS.has(token));

  if (parsedTokens.length === 0) {
    return [];
  }

  const tokens = [...parsedTokens];
  while (tokens.length > 1 && COMPANY_SUFFIXES.has(tokens[tokens.length - 1] ?? "")) {
    tokens.pop();
  }

  return tokens;
}

function isEquivalentEntity(
  mention: EntityMention,
  targetTokens: string[],
  targetNormalizedName: string
): boolean {
  if (!targetNormalizedName) {
    return false;
  }

  if (mention.normalizedName === targetNormalizedName) {
    return true;
  }

  if (isTargetWithDescriptors(mention.tokens, targetTokens)) {
    return true;
  }

  if (mention.tokens.length !== targetTokens.length) {
    return false;
  }

  return stringSimilarity(mention.normalizedName, targetNormalizedName) >= 0.93;
}

function isTargetWithDescriptors(mentionTokens: string[], targetTokens: string[]): boolean {
  if (mentionTokens.length <= targetTokens.length || targetTokens.length === 0) {
    return false;
  }

  const prefixMatches = targetTokens.every(
    (targetToken, index) => mentionTokens[index] === targetToken
  );
  if (!prefixMatches) {
    return false;
  }

  const remainder = mentionTokens.slice(targetTokens.length);
  return remainder.length > 0 && remainder.every((token) => DESCRIPTOR_TOKENS.has(token));
}

function isConfusableEntity(
  mention: EntityMention,
  targetTokens: string[],
  targetNormalizedName: string
): boolean {
  if (!targetNormalizedName || mention.normalizedName === targetNormalizedName) {
    return false;
  }

  if (targetTokens.length === 0) {
    return false;
  }

  if (isTargetWithDescriptors(mention.tokens, targetTokens)) {
    return false;
  }

  const overlapCount = countFuzzyTokenOverlap(targetTokens, mention.tokens);
  if (overlapCount === 0) {
    return false;
  }

  const overlapRatio = overlapCount / Math.max(targetTokens.length, mention.tokens.length);
  const similarName = stringSimilarity(mention.normalizedName, targetNormalizedName) >= 0.58;
  const sameLeadToken = mention.tokens[0] === targetTokens[0];
  const industryMismatch = hasIndustryMismatch(targetTokens, mention.tokens);

  if (industryMismatch && sameLeadToken) {
    return true;
  }

  if (overlapRatio >= 0.34) {
    return true;
  }

  if (similarName && sameLeadToken) {
    return true;
  }

  return sameLeadToken && overlapCount >= 1 && mention.tokens.length >= targetTokens.length;
}

function countFuzzyTokenOverlap(targetTokens: string[], candidateTokens: string[]): number {
  const remainingCandidateTokens = [...candidateTokens];
  let overlapCount = 0;

  for (const targetToken of targetTokens) {
    const matchIndex = remainingCandidateTokens.findIndex(
      (candidateToken) => tokenSimilarity(targetToken, candidateToken) >= 0.82
    );

    if (matchIndex >= 0) {
      overlapCount += 1;
      remainingCandidateTokens.splice(matchIndex, 1);
    }
  }

  return overlapCount;
}

function tokenSimilarity(left: string, right: string): number {
  if (left === right) {
    return 1;
  }

  return stringSimilarity(left, right);
}

function stringSimilarity(left: string, right: string): number {
  const maxLength = Math.max(left.length, right.length);
  if (maxLength === 0) {
    return 1;
  }

  return 1 - levenshteinDistance(left, right) / maxLength;
}

function hasIndustryMismatch(targetTokens: string[], candidateTokens: string[]): boolean {
  const targetIndustry = inferIndustry(targetTokens);
  const candidateIndustry = inferIndustry(candidateTokens);
  return Boolean(targetIndustry && candidateIndustry && targetIndustry !== candidateIndustry);
}

function inferIndustry(tokens: string[]): string | null {
  const counts = new Map<string, number>();

  for (const token of tokens) {
    const industry = INDUSTRY_TOKEN_MAP[token];
    if (!industry) {
      continue;
    }
    counts.set(industry, (counts.get(industry) ?? 0) + 1);
  }

  let selectedIndustry: string | null = null;
  let highestCount = 0;

  for (const [industry, count] of counts.entries()) {
    if (count > highestCount) {
      selectedIndustry = industry;
      highestCount = count;
    }
  }

  return selectedIndustry;
}

function addConfusedEntity(
  entityMap: Map<string, ConfusedEntityAccumulator>,
  mention: EntityMention,
  responseText: string,
  modelId: CitationChainModelId
): void {
  const key = mention.normalizedName;
  const existingEntity = entityMap.get(key);

  if (!existingEntity) {
    entityMap.set(key, {
      name: mention.rawName,
      mentionedInModels: new Set([modelId]),
      evidenceSnippet: createEvidenceSnippet(responseText, mention.start, mention.end),
    });
    return;
  }

  existingEntity.mentionedInModels.add(modelId);
  if (mention.rawName.length > existingEntity.name.length) {
    existingEntity.name = mention.rawName;
  }
}

function createEvidenceSnippet(text: string, start: number, end: number): string {
  const contextWindow = 48;
  const snippetStart = Math.max(0, start - contextWindow);
  const snippetEnd = Math.min(text.length, end + contextWindow);

  const prefix = snippetStart > 0 ? "..." : "";
  const suffix = snippetEnd < text.length ? "..." : "";

  return `${prefix}${text.slice(snippetStart, snippetEnd).trim()}${suffix}`;
}

function calculateCorrectIdentificationRate(
  modelIds: CitationChainModelId[],
  identifiedModels: Set<CitationChainModelId>
): number {
  if (modelIds.length === 0) {
    return 100;
  }

  const rawRate = (identifiedModels.size / modelIds.length) * 100;
  return Number(rawRate.toFixed(2));
}

function determineSeverity(
  isConfused: boolean,
  confusedEntityCount: number,
  correctIdentificationRate: number
): EntityConfusionSeverity {
  if (!isConfused) {
    return "none";
  }

  if (confusedEntityCount >= 3 || correctIdentificationRate < 50) {
    return "high";
  }

  if (confusedEntityCount >= 1) {
    return "medium";
  }

  return "low";
}

function getRecommendation(severity: EntityConfusionSeverity): string {
  if (severity === "high") {
    return "Urgent: publish your full legal entity name, domain, and industry context across careers pages and structured data to reduce legal and brand misattribution risk.";
  }

  if (severity === "medium") {
    return "Add repeated brand qualifiers (full company name + industry) on high-visibility hiring pages so models can better distinguish your company from similarly named entities.";
  }

  if (severity === "low") {
    return "Add clearer naming conventions in employer content to reduce low-confidence entity matching.";
  }

  return "No entity confusion detected. Continue reinforcing your official company naming in public employer content.";
}

function compareModels(left: CitationChainModelId, right: CitationChainModelId): number {
  const leftOrder = MODEL_ORDER.get(left) ?? Number.MAX_SAFE_INTEGER;
  const rightOrder = MODEL_ORDER.get(right) ?? Number.MAX_SAFE_INTEGER;
  if (leftOrder !== rightOrder) {
    return leftOrder - rightOrder;
  }
  return left.localeCompare(right);
}

function levenshteinDistance(left: string, right: string): number {
  if (left === right) {
    return 0;
  }

  if (left.length === 0) {
    return right.length;
  }

  if (right.length === 0) {
    return left.length;
  }

  const previousRow: number[] = Array.from({ length: right.length + 1 }, (_, index) => index);
  const currentRow: number[] = new Array(right.length + 1).fill(0);

  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    currentRow[0] = leftIndex;
    const leftChar = left[leftIndex - 1];

    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      const rightChar = right[rightIndex - 1];
      const substitutionCost = leftChar === rightChar ? 0 : 1;

      currentRow[rightIndex] = Math.min(
        previousRow[rightIndex] + 1,
        currentRow[rightIndex - 1] + 1,
        previousRow[rightIndex - 1] + substitutionCost
      );
    }

    for (let rightIndex = 0; rightIndex <= right.length; rightIndex += 1) {
      previousRow[rightIndex] = currentRow[rightIndex];
    }
  }

  return previousRow[right.length] ?? 0;
}
