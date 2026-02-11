/**
 * @module lib/citation-chain/source-mapper
 * Maps LLM citations to Google organic results.
 */

import { normaliseDomain } from "@/lib/citation-chain/google-search";
import type {
  CitationChainModelId,
  GoogleResult,
  LlmResponse,
  SourceMapping,
  SourceType,
} from "@/lib/citation-chain/types";

const REVIEW_PLATFORM_KEYS = new Set([
  "glassdoor",
  "indeed",
  "comparably",
  "levels.fyi",
  "builtin",
]);

const FORUM_KEYS = new Set(["reddit", "teamblind", "blind"]);

const NEWS_KEYS = new Set([
  "techcrunch.com",
  "bloomberg.com",
  "forbes.com",
  "reuters.com",
  "wsj.com",
]);

/**
 * Generate source mappings for Google results that are also cited by LLMs.
 */
export function mapSources(
  googleResults: GoogleResult[],
  llmResponses: LlmResponse[],
  companyDomain?: string
): SourceMapping[] {
  const companyKey = companyDomain ? getCanonicalDomainKey(companyDomain) : null;

  return googleResults
    .map((googleResult) => {
      const googleKey = getCanonicalDomainKey(googleResult.domain || googleResult.url);
      const citedByModels = collectCitingModels(googleKey, googleResult.category, llmResponses);

      if (citedByModels.length === 0) {
        return null;
      }

      return {
        category: googleResult.category,
        googlePosition: googleResult.position,
        domain: googleResult.domain,
        citedByModels,
        sourceType: classifySourceType(googleResult.domain, companyKey),
      } satisfies SourceMapping;
    })
    .filter((mapping): mapping is SourceMapping => mapping !== null);
}

/**
 * Convert a URL/domain into a canonical key for cross-TLD matching.
 */
export function getCanonicalDomainKey(input: string): string {
  const domain = normaliseDomain(input);

  if (!domain) {
    return "";
  }

  if (/(^|\.)glassdoor\./i.test(domain)) return "glassdoor";
  if (/(^|\.)indeed\./i.test(domain)) return "indeed";
  if (/(^|\.)reddit\./i.test(domain)) return "reddit";
  if (/(^|\.)linkedin\./i.test(domain)) return "linkedin";
  if (/(^|\.)comparably\./i.test(domain)) return "comparably";

  return getRegistrableDomain(domain);
}

/**
 * Classify a source domain into the UI source type buckets.
 */
export function classifySourceType(domain: string, companyKey?: string | null): SourceType {
  const key = getCanonicalDomainKey(domain);
  if (!key) {
    return "other";
  }

  if (companyKey && key === companyKey) {
    return "employer";
  }

  if (REVIEW_PLATFORM_KEYS.has(key)) {
    return "review-platform";
  }

  if (FORUM_KEYS.has(key)) {
    return "forum";
  }

  if (NEWS_KEYS.has(key)) {
    return "news";
  }

  return "other";
}

function collectCitingModels(
  googleKey: string,
  category: GoogleResult["category"],
  llmResponses: LlmResponse[]
): CitationChainModelId[] {
  const models = new Set<CitationChainModelId>();

  for (const response of llmResponses) {
    if (response.category !== category) {
      continue;
    }

    const hasMatch = response.citations.some((citationUrl) => {
      const citationKey = getCanonicalDomainKey(citationUrl);
      return citationKey === googleKey;
    });

    if (hasMatch) {
      models.add(response.modelId);
    }
  }

  return Array.from(models);
}

function getRegistrableDomain(domain: string): string {
  const parts = domain.split(".");
  if (parts.length <= 2) {
    return domain;
  }

  const tld = parts[parts.length - 1];
  const secondLevel = parts[parts.length - 2];

  if (
    tld.length === 2
    && ["co", "com", "org", "net", "gov", "ac"].includes(secondLevel)
    && parts.length >= 3
  ) {
    return `${parts[parts.length - 3]}.${secondLevel}.${tld}`;
  }

  return `${secondLevel}.${tld}`;
}
