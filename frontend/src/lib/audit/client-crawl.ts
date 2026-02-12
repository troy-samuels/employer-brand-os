/**
 * @module lib/audit/client-crawl
 * Analyses HTML submitted from the user's browser for pages behind bot protection.
 * Returns partial careers-check results that the frontend merges into the audit score.
 */

import { stripHtmlTags, type CurrencyCode } from "./website-checks";

/* ── Salary detection (simplified, matching website-checks logic) ── */

const SALARY_PATTERNS = [
  // Explicit ranges: £50,000-£70,000, $80k-$100k, €45.000-€55.000
  /(?:£|\$|€|¥|₹|₩|¥|A\$|C\$|NZ\$|HK\$|S\$|CHF|SEK|NOK|DKK|PLN|CZK|HUF|BRL|MXN|ZAR|AED|SAR|ILS|THB|MYR|PHP|IDR|VND|TWD|KRW|CNY|JPY|INR|RUB)\s*[\d,.]+[kK]?\s*[-–—to]+\s*(?:£|\$|€|¥|₹|₩|¥|A\$|C\$|NZ\$|HK\$|S\$|CHF|SEK|NOK|DKK|PLN|CZK|HUF|BRL|MXN|ZAR|AED|SAR|ILS|THB|MYR|PHP|IDR|VND|TWD|KRW|CNY|JPY|INR|RUB)?\s*[\d,.]+[kK]?/i,
  // "salary: £X" or "salary range"
  /salary\s*(?:range|band|bracket)?\s*[:：]\s*(?:£|\$|€)\s*[\d,.]+/i,
  // "£XX,XXX per annum/year/pa"
  /(?:£|\$|€)\s*[\d,.]+\s*(?:per\s+(?:annum|year|month)|p\.?a\.?|\/yr|\/year)/i,
  // "competitive salary" or "salary negotiable" as mentions
  /(?:competitive|negotiable|attractive)\s+(?:salary|compensation|pay|package)/i,
];

const CURRENCY_SYMBOLS: [RegExp, NonNullable<CurrencyCode>][] = [
  [/£/, "GBP"],
  [/\$(?!A\$|C\$|NZ\$|HK\$|S\$)/, "USD"],
  [/€/, "EUR"],
  [/¥/, "JPY"],
  [/₹/, "INR"],
  [/₩/, "KRW"],
  [/A\$/, "AUD"],
  [/C\$/, "CAD"],
];

function detectCurrency(text: string): CurrencyCode {
  for (const [pattern, code] of CURRENCY_SYMBOLS) {
    if (pattern.test(text)) return code;
  }
  return null;
}

type SalaryConfidence = "none" | "mention_only" | "single_range" | "multiple_ranges";

function detectSalary(text: string): { hasSalaryData: boolean; confidence: SalaryConfidence; currency: CurrencyCode } {
  const matches = SALARY_PATTERNS.filter((p) => p.test(text));
  if (matches.length === 0) return { hasSalaryData: false, confidence: "none", currency: null };
  if (matches.length >= 2) return { hasSalaryData: true, confidence: "multiple_ranges", currency: detectCurrency(text) };
  // Check if it's just a "competitive salary" mention vs actual numbers
  if (/(?:competitive|negotiable|attractive)/i.test(text) && !/(?:£|\$|€)\s*[\d]/.test(text)) {
    return { hasSalaryData: true, confidence: "mention_only", currency: null };
  }
  return { hasSalaryData: true, confidence: "single_range", currency: detectCurrency(text) };
}

/* ── JSON-LD extraction ──────────────────────────── */

function extractJsonLdSchemas(html: string): string[] {
  const schemas = new Set<string>();
  const regex = /<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(match[1]);
      collectTypes(parsed, schemas);
    } catch {
      continue;
    }
  }
  return Array.from(schemas);
}

function collectTypes(node: unknown, set: Set<string>): void {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) {
    for (const item of node) collectTypes(item, set);
    return;
  }
  const record = node as Record<string, unknown>;
  const typeValue = record["@type"];
  if (typeof typeValue === "string") set.add(typeValue);
  if (Array.isArray(typeValue)) {
    for (const t of typeValue) if (typeof t === "string") set.add(t);
  }
  for (const value of Object.values(record)) {
    if (value && typeof value === "object") collectTypes(value, set);
  }
}

/* ── Public interface ────────────────────────────── */

export interface ClientCrawlResult {
  careersPageStatus: "full" | "partial" | "none";
  careersPageUrl: string;
  hasSalaryData: boolean;
  salaryConfidence: SalaryConfidence;
  detectedCurrency: CurrencyCode;
  jsonldSchemasFound: string[];
  hasJsonld: boolean;
  /** Updated score components for the frontend to merge */
  scoreUpdates: {
    careersPage: number;
    salaryData: number;
    jsonld: number;
  };
}

export function analyzeClientSubmittedHtml(
  html: string,
  url: string,
  domain: string,
): ClientCrawlResult {
  const textContent = stripHtmlTags(html);
  const textLength = textContent.length;
  const fallbackUrl = domain ? `https://${domain}` : "";
  const careersPageUrl = url || fallbackUrl;

  // Careers page status based on content richness
  let careersPageStatus: "full" | "partial" | "none";
  let careersScore: number;

  if (textLength > 1000) {
    careersPageStatus = "full";
    careersScore = 15;
  } else if (textLength >= 200) {
    careersPageStatus = "partial";
    careersScore = 8;
  } else {
    careersPageStatus = "none";
    careersScore = 0;
  }

  // Salary detection
  const salary = detectSalary(textContent);
  let salaryScore = 0;
  if (salary.confidence === "multiple_ranges") salaryScore = 20;
  else if (salary.confidence === "single_range") salaryScore = 10;
  else if (salary.confidence === "mention_only") salaryScore = 5;

  // JSON-LD schemas
  const jsonldSchemasFound = extractJsonLdSchemas(html);
  const hasJsonld = jsonldSchemasFound.length > 0;
  let jsonldScore = 0;
  if (jsonldSchemasFound.includes("JobPosting")) jsonldScore = 25;
  else if (hasJsonld) jsonldScore = 12;

  return {
    careersPageStatus,
    careersPageUrl,
    hasSalaryData: salary.hasSalaryData,
    salaryConfidence: salary.confidence,
    detectedCurrency: salary.currency,
    jsonldSchemasFound,
    hasJsonld,
    scoreUpdates: {
      careersPage: careersScore,
      salaryData: salaryScore,
      jsonld: jsonldScore,
    },
  };
}
