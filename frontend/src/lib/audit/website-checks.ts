/**
 * @module lib/audit/website-checks
 * Module implementation for website-checks.ts.
 */

import { validateUrl } from "@/lib/audit/url-validator";
import { renderPage } from "@/lib/audit/headless-render";

const FETCH_TIMEOUT_MS = 5000;
const AUDIT_USER_AGENT = "RankwellAuditBot/1.0";
const HEADLESS_FALLBACK_MAX_TEXT_CHARS = 500;
const HEADLESS_FALLBACK_MIN_HTML_BYTES = 5000;

const LLMS_EMPLOYMENT_KEYWORDS = [
  "career",
  "careers",
  "job",
  "jobs",
  "employment",
  "salary",
  "compensation",
  "hiring",
  "recruit",
];

const SALARY_KEYWORDS = [
  "salary",
  "salary range",
  "salary band",
  "base salary",
  "competitive salary",
  "salary on application",
  "salary commensurate with experience",
  "depending on experience",
  "doe",
  "pay",
  "pay range",
  "pay band",
  "compensation",
  "compensation range",
  "remuneration",
  "market rate",
];

const SALARY_NON_DISCLOSURE_PATTERNS = [
  /\bcompetitive salary\b/i,
  /\bsalary\s+(?:on|upon)\s+application\b/i,
  /\bsalary\s+(?:commensurate|dependent|depending)\s+with\s+experience\b/i,
  /\b(?:salary|compensation)\s+doe\b/i,
  /\b(?:salary|compensation)\s+negotiable\b/i,
  /\bmarket[-\s]?rate\b/i,
];

const JOB_TITLE_TERMS = [
  "engineer",
  "developer",
  "designer",
  "manager",
  "analyst",
  "specialist",
  "coordinator",
  "director",
  "consultant",
  "architect",
  "recruiter",
  "intern",
  "associate",
];

const SALARY_CURRENCY_PATTERN = String.raw`(?:[£$€¥₹₩₽₪₺₱৳]|gbp|usd|eur|jpy|inr|krw|rub|ils|try|php|bdt|chf|rm|myr|kr|zł|pln|zar|r|aud|cad|sgd|hkd|nzd|thb|idr)`;
const SALARY_AMOUNT_PATTERN = String.raw`(?:\d{1,3}(?:[,.\s]\d{3})+|\d{4,9}|\d{2,3}(?:[.,]\d+)?\s*[kK])`;
const SALARY_VALUE_PATTERN = String.raw`${SALARY_CURRENCY_PATTERN}\s*${SALARY_AMOUNT_PATTERN}`;
const SALARY_RANGE_PATTERN = String.raw`${SALARY_VALUE_PATTERN}\s*(?:-|–|—|to|bis|à|a)\s*(?:${SALARY_CURRENCY_PATTERN}\s*)?${SALARY_AMOUNT_PATTERN}`;

const CAREERS_PATHS = [
  "/careers",
  "/jobs",
  "/careers/",
  "/jobs/",
  "/about/careers",
  "/join-us",
  "/work-with-us",
  // International variants
  "/karriere", // German
  "/karriere/",
  "/carrières", // French
  "/carrières/",
  "/carrera", // Spanish
  "/carrera/",
  "/carriera", // Italian
  "/carriera/",
  "/empleo", // Spanish (alternative)
  "/empleo/",
  "/vagas", // Portuguese
  "/vagas/",
  "/vacatures", // Dutch
  "/vacatures/",
  "/lediga-jobb", // Swedish
  "/lediga-jobb/",
  "/arbejde", // Danish
  "/arbejde/",
  "/採用情報", // Japanese
  "/採用情報/",
  "/채용", // Korean
  "/채용/",
  "/职位", // Chinese (Simplified)
  "/职位/",
  "/offres-emploi", // French (alternative)
  "/offres-emploi/",
  "/stellenangebote", // German (alternative)
  "/stellenangebote/",
];

const MAX_SAMPLED_JOB_LISTING_PAGES = 12;
const CAREERS_SUBDOMAIN_PREFIXES = ["careers", "jobs"] as const;
const MAX_META_REFRESH_REDIRECT_HOPS = 2;

const ATS_HOST_SUFFIXES = [
  "boards.greenhouse.io",
  "greenhouse.io",
  "jobs.lever.co",
  "lever.co",
  "apply.workable.com",
  "jobs.ashbyhq.com",
  "jobs.smartrecruiters.com",
  "myworkdayjobs.com",
  "workday.com",
  "jobs.jobvite.com",
  "jobs.jobscore.com",
  "ats.rippling.com",
  "jobs.gohire.io",
  "bamboohr.com",
  "applytojob.com",
  "breezy.hr",
  "recruitee.com",
  "pinpointhq.com",
  "teamtailor.com",
  "welcometothejungle.com",
  "jobs.polymer.co",
  "workable.com",
  "recruiterbox.com",
  "jazz.co",
  "talentlyft.com",
  "comeet.com",
];

const ATS_SUBDOMAINS = [
  "careers",
  "jobs",
  "apply",
  "hiring",
  "join",
  "talent",
  "recruiting",
  "opportunities",
];

const JOB_PATH_HINT_PATTERNS = [
  /\/jobs?(?:\/|$)/i,
  /\/careers?(?:\/|$)/i,
  /\/positions?(?:\/|$)/i,
  /\/openings?(?:\/|$)/i,
  /\/vacanc(?:y|ies)(?:\/|$)/i,
  /\/requisitions?(?:\/|$)/i,
  /\/job-postings?(?:\/|$)/i,
  /\/roles?(?:\/|$)/i,
  /\/j\/[^/?#]+/i,
];

const JOB_DETAIL_PATH_PATTERNS = [
  /\/jobs?\/[^/?#]+/i,
  /\/careers?\/[^/?#]+/i,
  /\/positions?\/[^/?#]+/i,
  /\/openings?\/[^/?#]+/i,
  /\/vacanc(?:y|ies)\/[^/?#]+/i,
  /\/requisitions?\/[^/?#]+/i,
  /\/j\/[^/?#]+/i,
];

const JOB_QUERY_HINT_PATTERNS = [/[?&](?:gh_jid|gh_src|jid|jobId|job|lever-source|lever-via)=/i];

const NON_JOB_PATH_SEGMENTS = [
  "about",
  "blog",
  "contact",
  "privacy",
  "terms",
  "legal",
  "cookie",
  "cookies",
  "press",
  "news",
  "investors",
  "team",
  "support",
  "help",
  "events",
];

const AI_BOTS = [
  {
    label: "GPTBot",
    userAgents: ["gptbot"],
  },
  {
    label: "ChatGPT-User",
    userAgents: ["chatgpt-user"],
  },
  {
    label: "Google-Extended",
    userAgents: ["google-extended"],
  },
  {
    label: "Anthropic",
    userAgents: ["anthropic-ai", "claudebot", "anthropic"],
  },
  {
    label: "CCBot",
    userAgents: ["ccbot"],
  },
] as const;

type CareersPageStatus = "full" | "partial" | "none" | "not_found";
type RobotsTxtStatus = "allows" | "partial" | "blocks" | "no_rules" | "not_found";
type SalaryConfidence =
  | "none"
  | "mention_only"
  | "single_range"
  | "multiple_ranges"
  | "jsonld_base_salary";

type SafeFetchResult = {
  ok: boolean;
  status: number | null;
  text: string;
  url: string;
};

type CareersCheckResult = {
  status: CareersPageStatus;
  url: string | null;
  html: string;
};

type RobotsPolicyParseResult = {
  status: Exclude<RobotsTxtStatus, "not_found">;
  allowedBots: string[];
  blockedBots: string[];
};

type SalaryDetectionResult = {
  hasSalaryData: boolean;
  salaryConfidence: SalaryConfidence;
  score: number;
  detectedCurrency: CurrencyCode;
};

/**
 * Defines the CurrencyCode contract.
 */
export type CurrencyCode =
  | "GBP"
  | "USD"
  | "EUR"
  | "JPY"
  | "INR"
  | "KRW"
  | "CNY"
  | "AUD"
  | "CAD"
  | "CHF"
  | "SEK"
  | "NOK"
  | "DKK"
  | "PLN"
  | "ZAR"
  | "BRL"
  | "MXN"
  | "SGD"
  | "HKD"
  | "NZD"
  | "THB"
  | "MYR"
  | "IDR"
  | "PHP"
  | "RUB"
  | "TRY"
  | "ILS"
  | "BDT"
  | null;

/**
 * Defines the AuditStatus contract.
 */
export type AuditStatus = "success" | "no_website" | "unreachable" | "empty";

/**
 * Defines the AtsName contract.
 */
export type AtsName =
  | "Greenhouse"
  | "Lever"
  | "Workday"
  | "Workable"
  | "Ashby"
  | "SmartRecruiters"
  | "Jobvite"
  | "JobScore"
  | "Rippling"
  | "GoHire"
  | "BambooHR"
  | "Breezy HR"
  | "Recruitee"
  | "Pinpoint"
  | "Teamtailor"
  | "Welcome to the Jungle"
  | "Polymer"
  | "Recruiterbox"
  | "JazzHR"
  | "TalentLyft"
  | "Comeet"
  | null;

/**
 * Exposes exported value(s): ATS_HOST_MAP.
 */
export const ATS_HOST_MAP: Record<string, AtsName> = {
  "boards.greenhouse.io": "Greenhouse",
  "greenhouse.io": "Greenhouse",
  "jobs.lever.co": "Lever",
  "lever.co": "Lever",
  "apply.workable.com": "Workable",
  "workable.com": "Workable",
  "jobs.ashbyhq.com": "Ashby",
  "jobs.smartrecruiters.com": "SmartRecruiters",
  "myworkdayjobs.com": "Workday",
  "workday.com": "Workday",
  "jobs.jobvite.com": "Jobvite",
  "jobs.jobscore.com": "JobScore",
  "ats.rippling.com": "Rippling",
  "jobs.gohire.io": "GoHire",
  "bamboohr.com": "BambooHR",
  "applytojob.com": "BambooHR",
  "breezy.hr": "Breezy HR",
  "recruitee.com": "Recruitee",
  "pinpointhq.com": "Pinpoint",
  "teamtailor.com": "Teamtailor",
  "welcometothejungle.com": "Welcome to the Jungle",
  "jobs.polymer.co": "Polymer",
  "recruiterbox.com": "Recruiterbox",
  "jazz.co": "JazzHR",
  "talentlyft.com": "TalentLyft",
  "comeet.com": "Comeet",
};

/**
 * Defines the WebsiteCheckResult contract.
 */
export type WebsiteCheckResult = {
  domain: string;
  companyName: string;
  companySlug: string;
  status: AuditStatus;
  hasLlmsTxt: boolean;
  llmsTxtHasEmployment: boolean;
  hasJsonld: boolean;
  jsonldSchemasFound: string[];
  hasSalaryData: boolean;
  salaryConfidence: SalaryConfidence;
  detectedCurrency: CurrencyCode;
  careersPageStatus: CareersPageStatus;
  careersPageUrl: string | null;
  atsDetected: AtsName;
  hasSitemap: boolean;
  robotsTxtStatus: RobotsTxtStatus;
  robotsTxtAllowedBots: string[];
  robotsTxtBlockedBots: string[];
  score: number;
  scoreBreakdown: {
    llmsTxt: number;
    jsonld: number;
    salaryData: number;
    careersPage: number;
    robotsTxt: number;
  };
};

async function fetchSafe(url: string, useHeadlessFallback = false): Promise<SafeFetchResult> {
  const validation = await validateUrl(url);
  if (!validation.ok) {
    return {
      ok: false,
      status: null,
      text: "",
      url,
    };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": AUDIT_USER_AGENT,
      },
      signal: controller.signal,
    });

    const text = await response.text();
    const resolvedUrl = typeof response.url === "string" && response.url ? response.url : url;

    if (
      useHeadlessFallback &&
      response.status === 200 &&
      stripHtmlTags(text).length < HEADLESS_FALLBACK_MAX_TEXT_CHARS &&
      Buffer.byteLength(text, "utf8") > HEADLESS_FALLBACK_MIN_HTML_BYTES
    ) {
      const renderedPage = await renderPage(resolvedUrl);
      if (renderedPage.html) {
        return {
          ok: true,
          status: response.status,
          text: renderedPage.html,
          url: renderedPage.url || resolvedUrl,
        };
      }
    }

    return {
      ok: true,
      status: response.status,
      text,
      url: resolvedUrl,
    };
  } catch {
    return {
      ok: false,
      status: null,
      text: "",
      url,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

function normalizeDomain(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) {
    return "";
  }

  try {
    const normalizedInput = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    return new URL(normalizedInput).hostname.toLowerCase();
  } catch {
    const withoutProtocol = trimmed.replace(/^https?:\/\//i, "");
    return withoutProtocol.split("/")[0]?.toLowerCase() ?? "";
  }
}

function stripLeadingWww(hostname: string): string {
  return hostname.startsWith("www.") ? hostname.slice(4) : hostname;
}

function isSameDomain(hostname: string, domain: string): boolean {
  return hostname === domain || hostname.endsWith(`.${domain}`);
}

function getCareersCandidateUrls(domain: string): string[] {
  const normalizedDomain = domain.toLowerCase();
  const baseDomain = stripLeadingWww(normalizedDomain);
  const urls: string[] = [];
  const seen = new Set<string>();

  const appendCandidate = (candidateUrl: string): void => {
    try {
      const normalized = new URL(candidateUrl).toString();
      if (seen.has(normalized)) {
        return;
      }
      seen.add(normalized);
      urls.push(normalized);
    } catch {
      // Skip malformed candidate URLs.
    }
  };

  for (const path of CAREERS_PATHS) {
    appendCandidate(`https://${normalizedDomain}${path}`);
  }

  for (const prefix of CAREERS_SUBDOMAIN_PREFIXES) {
    appendCandidate(`https://${prefix}.${normalizedDomain}`);
    if (baseDomain !== normalizedDomain) {
      appendCandidate(`https://${prefix}.${baseDomain}`);
    }
  }

  return urls;
}

function extractMetaRefreshRedirectUrl(html: string, baseUrl: string): string | null {
  const metaTagRegex = /<meta\b[^>]*>/gi;

  for (const match of html.matchAll(metaTagRegex)) {
    const tag = match[0] ?? "";
    if (!/\bhttp-equiv\s*=\s*(?:"refresh"|'refresh'|refresh)\b/i.test(tag)) {
      continue;
    }

    const contentMatch = tag.match(/\bcontent\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const contentValue = (contentMatch?.[1] ?? contentMatch?.[2] ?? contentMatch?.[3] ?? "").trim();
    if (!contentValue) {
      continue;
    }

    const urlMatch = contentValue.match(/(?:^|;)\s*url\s*=\s*(.+)$/i);
    if (!urlMatch?.[1]) {
      continue;
    }

    const rawTarget = urlMatch[1].trim().replace(/^['"]|['"]$/g, "");
    if (!rawTarget) {
      continue;
    }

    try {
      const resolvedUrl = new URL(rawTarget, baseUrl);
      if (!/^https?:$/i.test(resolvedUrl.protocol)) {
        continue;
      }
      resolvedUrl.hash = "";
      return resolvedUrl.toString();
    } catch {
      continue;
    }
  }

  return null;
}

function isAllowedCareersRedirectTarget(targetUrl: string, domain: string): boolean {
  try {
    const normalizedDomain = domain.toLowerCase();
    const baseDomain = stripLeadingWww(normalizedDomain);
    const target = new URL(targetUrl);
    const targetHostname = target.hostname.toLowerCase();

    if (isSameDomain(targetHostname, normalizedDomain) || isSameDomain(targetHostname, baseDomain)) {
      return true;
    }

    return CAREERS_SUBDOMAIN_PREFIXES.some((prefix) => {
      const sameDomainVariant = `${prefix}.${normalizedDomain}`;
      const baseDomainVariant = `${prefix}.${baseDomain}`;
      return targetHostname === sameDomainVariant || targetHostname === baseDomainVariant;
    });
  } catch {
    return false;
  }
}

async function fetchCareersPage(url: string, domain: string): Promise<SafeFetchResult> {
  let currentResponse = await fetchSafe(url, true);
  if (!currentResponse.ok || currentResponse.status !== 200) {
    return currentResponse;
  }

  const visitedUrls = new Set<string>([currentResponse.url]);

  for (let hop = 0; hop < MAX_META_REFRESH_REDIRECT_HOPS; hop += 1) {
    const metaRefreshUrl = extractMetaRefreshRedirectUrl(currentResponse.text, currentResponse.url);
    if (!metaRefreshUrl || visitedUrls.has(metaRefreshUrl)) {
      break;
    }

    if (!isAllowedCareersRedirectTarget(metaRefreshUrl, domain)) {
      break;
    }

    visitedUrls.add(metaRefreshUrl);
    const redirectedResponse = await fetchSafe(metaRefreshUrl, true);
    if (!redirectedResponse.ok || redirectedResponse.status !== 200) {
      break;
    }

    currentResponse = redirectedResponse;
  }

  return currentResponse;
}

function isTrustedAtsHost(hostname: string): boolean {
  return ATS_HOST_SUFFIXES.some((suffix) => hostname === suffix || hostname.endsWith(`.${suffix}`));
}

function detectAtsName(hostname: string): AtsName {
  for (const [suffix, name] of Object.entries(ATS_HOST_MAP)) {
    if (hostname === suffix || hostname.endsWith(`.${suffix}`)) {
      return name;
    }
  }
  return null;
}

function isAtsSubdomain(hostname: string, domain: string): boolean {
  // Check if the hostname is a subdomain of the main domain with an ATS-like prefix
  if (!hostname.endsWith(`.${domain}`)) {
    return false;
  }

  const subdomain = hostname.slice(0, -(domain.length + 1));
  return ATS_SUBDOMAINS.includes(subdomain);
}

function pathContainsNonJobSegment(pathname: string): boolean {
  const segments = pathname
    .split("/")
    .map((segment) => segment.trim().toLowerCase())
    .filter(Boolean);

  return segments.some((segment) => NON_JOB_PATH_SEGMENTS.includes(segment));
}

function isLikelyJobListingUrl(url: URL, domain: string): boolean {
  const hostname = url.hostname.toLowerCase();
  const pathname = decodeURIComponent(url.pathname).toLowerCase();
  const search = url.search.toLowerCase();

  const sameDomain = isSameDomain(hostname, domain);
  const trustedAtsHost = isTrustedAtsHost(hostname);
  const atsSubdomain = isAtsSubdomain(hostname, domain);

  if (!sameDomain && !trustedAtsHost && !atsSubdomain) {
    return false;
  }

  if (pathname === "/" && !search) {
    return false;
  }

  const hasJobPathHint = JOB_PATH_HINT_PATTERNS.some((pattern) => pattern.test(pathname));
  const hasJobDetailPath = JOB_DETAIL_PATH_PATTERNS.some((pattern) => pattern.test(pathname));
  const hasJobQueryHint = JOB_QUERY_HINT_PATTERNS.some((pattern) => pattern.test(search));

  if (!hasJobPathHint && !hasJobQueryHint && !trustedAtsHost) {
    return false;
  }

  const pathDepth = pathname.split("/").filter(Boolean).length;
  const hasAtsDetailDepth = trustedAtsHost && pathDepth >= 2;
  const isLikelyDetail = hasJobDetailPath || hasJobQueryHint || hasAtsDetailDepth;

  if (!isLikelyDetail) {
    return false;
  }

  if (pathContainsNonJobSegment(pathname) && !hasJobDetailPath && !hasJobQueryHint) {
    return false;
  }

  return true;
}

function extractJobListingLinks(careersHtml: string, careersUrl: string, domain: string): string[] {
  if (!careersHtml || !careersUrl) {
    return [];
  }

  const linkRegex = /<a\b[^>]*href\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'<>]+))[^>]*>/gi;
  const links: string[] = [];
  const seen = new Set<string>();

  for (const match of careersHtml.matchAll(linkRegex)) {
    const href = (match[1] ?? match[2] ?? match[3] ?? "").trim();
    if (!href || href.startsWith("#")) {
      continue;
    }

    if (/^(?:mailto:|tel:|javascript:)/i.test(href)) {
      continue;
    }

    let resolvedUrl: URL;
    try {
      resolvedUrl = new URL(href, careersUrl);
    } catch {
      continue;
    }

    if (!/^https?:$/i.test(resolvedUrl.protocol)) {
      continue;
    }

    if (!isLikelyJobListingUrl(resolvedUrl, domain)) {
      continue;
    }

    resolvedUrl.hash = "";
    const normalized = resolvedUrl.toString();
    if (seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    links.push(normalized);

    if (links.length >= MAX_SAMPLED_JOB_LISTING_PAGES) {
      break;
    }
  }

  return links;
}

function createCompanySlug(companyName: string): string {
  const slug = companyName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "company";
}

function stripHtmlTags(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function extractJsonLdBlocks(html: string): string[] {
  const matches = html.matchAll(
    /<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  );

  return Array.from(matches, (match) => match[1]?.trim() ?? "").filter(Boolean);
}

function normalizeSchemaType(typeValue: string): string {
  const trimmed = typeValue.trim();
  if (!trimmed) {
    return "";
  }

  const hashSplit = trimmed.split("#");
  const hashPart = hashSplit[hashSplit.length - 1] ?? "";
  const slashSplit = hashPart.split("/");
  return (slashSplit[slashSplit.length - 1] ?? "").trim();
}

function collectJsonLdTypes(node: unknown, typeSet: Set<string>): void {
  if (Array.isArray(node)) {
    for (const item of node) {
      collectJsonLdTypes(item, typeSet);
    }
    return;
  }

  if (node === null || typeof node !== "object") {
    return;
  }

  const record = node as Record<string, unknown>;
  const schemaType = record["@type"];

  if (typeof schemaType === "string") {
    const normalized = normalizeSchemaType(schemaType);
    if (normalized) {
      typeSet.add(normalized);
    }
  } else if (Array.isArray(schemaType)) {
    for (const typeValue of schemaType) {
      if (typeof typeValue === "string") {
        const normalized = normalizeSchemaType(typeValue);
        if (normalized) {
          typeSet.add(normalized);
        }
      }
    }
  }

  for (const value of Object.values(record)) {
    if (value && typeof value === "object") {
      collectJsonLdTypes(value, typeSet);
    }
  }
}

async function runCareersCheck(domain: string): Promise<CareersCheckResult> {
  const statusRank: Record<CareersPageStatus, number> = {
    not_found: 0,
    none: 1,
    partial: 2,
    full: 3,
  };
  let bestResult: CareersCheckResult = {
    status: "not_found",
    url: null,
    html: "",
  };

  for (const careersUrl of getCareersCandidateUrls(domain)) {
    const response = await fetchCareersPage(careersUrl, domain);

    if (!response.ok || response.status !== 200) {
      continue;
    }

    const textLength = stripHtmlTags(response.text).length;
    const resolvedUrl = response.url || careersUrl;

    if (textLength > 1000) {
      return { status: "full", url: resolvedUrl, html: response.text };
    }
    if (textLength >= 200) {
      const candidateResult: CareersCheckResult = { status: "partial", url: resolvedUrl, html: response.text };
      if (statusRank[candidateResult.status] > statusRank[bestResult.status]) {
        bestResult = candidateResult;
      }
      continue;
    }

    const candidateResult: CareersCheckResult = { status: "none", url: resolvedUrl, html: response.text };
    if (statusRank[candidateResult.status] > statusRank[bestResult.status]) {
      bestResult = candidateResult;
    }
  }

  return bestResult;
}

function selectHighestConfidenceSalaryDetection(
  detections: SalaryDetectionResult[],
): SalaryDetectionResult {
  if (detections.length === 0) {
    return {
      hasSalaryData: false,
      salaryConfidence: "none",
      score: 0,
      detectedCurrency: null,
    };
  }

  return detections.reduce((best, current) => (current.score > best.score ? current : best));
}

async function analyzeSalaryAcrossCareersAndJobListings(
  careersHtml: string,
  careersUrl: string | null,
  domain: string,
): Promise<SalaryDetectionResult> {
  const htmlSamples = [careersHtml];

  if (careersHtml && careersUrl) {
    const jobListingLinks = extractJobListingLinks(careersHtml, careersUrl, domain);
    if (jobListingLinks.length > 0) {
      const sampledResponses = await Promise.all(jobListingLinks.map((link) => fetchSafe(link)));
      for (const response of sampledResponses) {
        if (response.ok && response.status === 200 && response.text) {
          htmlSamples.push(response.text);
        }
      }
    }
  }

  const detections = htmlSamples.map((html) => analyzeSalaryTransparency(html));
  return selectHighestConfidenceSalaryDetection(detections);
}

type RobotsRule = {
  type: "allow" | "disallow";
  path: string;
};

type RobotsGroup = {
  agents: string[];
  rules: RobotsRule[];
};

function parseRobotsGroups(robotsTxt: string): RobotsGroup[] {
  const groups: RobotsGroup[] = [];
  let currentGroup: RobotsGroup = {
    agents: [],
    rules: [],
  };
  let hasRules = false;

  const flush = () => {
    if (currentGroup.agents.length > 0) {
      groups.push(currentGroup);
    }
    currentGroup = {
      agents: [],
      rules: [],
    };
    hasRules = false;
  };

  for (const rawLine of robotsTxt.split(/\r?\n/)) {
    const noComment = rawLine.split("#")[0] ?? "";
    const line = noComment.trim();
    if (!line) {
      flush();
      continue;
    }

    const directiveMatch = line.match(/^([a-z-]+)\s*:\s*(.*)$/i);
    if (!directiveMatch) {
      continue;
    }

    const directive = directiveMatch[1]?.toLowerCase();
    const value = (directiveMatch[2] ?? "").trim();

    if (directive === "user-agent") {
      if (hasRules) {
        flush();
      }
      if (value) {
        currentGroup.agents.push(value.toLowerCase());
      }
      continue;
    }

    if (directive === "allow" || directive === "disallow") {
      if (currentGroup.agents.length === 0) {
        continue;
      }

      hasRules = true;
      currentGroup.rules.push({
        type: directive,
        path: value,
      });
    }
  }

  flush();
  return groups;
}

function doesAgentMatch(agent: string, botAgent: string): boolean {
  if (agent === "*") {
    return true;
  }

  return botAgent === agent || botAgent.startsWith(agent);
}

function getMatchingGroups(groups: RobotsGroup[], botAgents: readonly string[]): RobotsGroup[] {
  const specificMatches = groups.filter((group) =>
    group.agents.some(
      (agent) => agent !== "*" && botAgents.some((botAgent) => doesAgentMatch(agent, botAgent))
    )
  );
  if (specificMatches.length > 0) {
    return specificMatches;
  }

  return groups.filter((group) => group.agents.includes("*"));
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function doesRuleMatchPath(rulePath: string, targetPath: string): boolean {
  const trimmed = rulePath.trim();
  if (!trimmed) {
    return false;
  }

  let regexPattern = "";
  for (const char of trimmed) {
    if (char === "*") {
      regexPattern += ".*";
      continue;
    }

    if (char === "$") {
      regexPattern += "$";
      continue;
    }

    regexPattern += escapeRegex(char);
  }

  if (!trimmed.endsWith("$")) {
    regexPattern += ".*";
  }

  const regex = new RegExp(`^${regexPattern}`, "i");
  return regex.test(targetPath);
}

function getRuleSpecificity(rulePath: string): number {
  return rulePath.replace(/\*/g, "").replace(/\$/g, "").length;
}

function evaluateBotAccess(groups: RobotsGroup[], botAgents: readonly string[]): "allow" | "block" | "no_rules" {
  const matchingGroups = getMatchingGroups(groups, botAgents);
  if (matchingGroups.length === 0) {
    return "no_rules";
  }

  const rules = matchingGroups.flatMap((group) => group.rules);
  if (rules.length === 0) {
    return "no_rules";
  }

  let bestMatch: RobotsRule | null = null;
  let bestSpecificity = -1;

  for (const rule of rules) {
    if (!doesRuleMatchPath(rule.path, "/")) {
      continue;
    }

    const specificity = getRuleSpecificity(rule.path);
    if (specificity > bestSpecificity) {
      bestSpecificity = specificity;
      bestMatch = rule;
      continue;
    }

    if (specificity === bestSpecificity && bestMatch?.type === "disallow" && rule.type === "allow") {
      bestMatch = rule;
    }
  }

  if (!bestMatch) {
    // If rules exist but none match "/", bots can still crawl at least part of the site.
    return "allow";
  }

  return bestMatch.type === "allow" ? "allow" : "block";
}

/**
 * Executes parseRobotsPolicy.
 * @param robotsTxt - robotsTxt input.
 * @returns The resulting value.
 */
export function parseRobotsPolicy(robotsTxt: string): RobotsPolicyParseResult {
  const groups = parseRobotsGroups(robotsTxt);

  const allowedBots: string[] = [];
  const blockedBots: string[] = [];
  let botsWithRules = 0;

  for (const bot of AI_BOTS) {
    const access = evaluateBotAccess(groups, bot.userAgents);
    if (access === "no_rules") {
      continue;
    }

    botsWithRules += 1;
    if (access === "allow") {
      allowedBots.push(bot.label);
    } else {
      blockedBots.push(bot.label);
    }
  }

  if (botsWithRules === 0) {
    return {
      status: "no_rules",
      allowedBots: [],
      blockedBots: [],
    };
  }

  if (allowedBots.length > 0 && blockedBots.length > 0) {
    return {
      status: "partial",
      allowedBots,
      blockedBots,
    };
  }

  if (allowedBots.length > 0) {
    return {
      status: "allows",
      allowedBots,
      blockedBots: [],
    };
  }

  return {
    status: "blocks",
    allowedBots: [],
    blockedBots,
  };
}

function collectRegexMatches(input: string, pattern: RegExp): string[] {
  const matches = input.matchAll(pattern);
  return Array.from(matches, (match) => (match[0] ?? "").trim()).filter(Boolean);
}

function textHasKeyword(input: string, keyword: string): boolean {
  const keywordRegex = new RegExp(String.raw`\b${escapeRegex(keyword)}\b`, "i");
  return keywordRegex.test(input);
}

function extractSalaryRangeMatches(text: string): string[] {
  const patterns = [
    new RegExp(SALARY_RANGE_PATTERN, "gi"),
    new RegExp(String.raw`from\s+${SALARY_VALUE_PATTERN}`, "gi"),
    new RegExp(String.raw`up\s*to\s+${SALARY_VALUE_PATTERN}`, "gi"),
  ];

  const uniqueMatches = new Set<string>();
  for (const pattern of patterns) {
    for (const match of collectRegexMatches(text, pattern)) {
      uniqueMatches.add(match.replace(/\s+/g, " ").toLowerCase());
    }
  }

  return Array.from(uniqueMatches);
}

function hasStructuredSalaryElements(careersHtml: string, careersText: string): boolean {
  const salaryRangePattern = String.raw`(?:${SALARY_RANGE_PATTERN}|from\s+${SALARY_VALUE_PATTERN}|up\s*to\s+${SALARY_VALUE_PATTERN})`;
  const jobTitlePattern = JOB_TITLE_TERMS.map((term) => escapeRegex(term)).join("|");
  const salaryNearRoleRegex = new RegExp(
    String.raw`(?:\b(?:${jobTitlePattern})\b[\s\S]{0,180}${salaryRangePattern}|${salaryRangePattern}[\s\S]{0,180}\b(?:${jobTitlePattern})\b)`,
    "i"
  );

  if (salaryNearRoleRegex.test(careersText)) {
    return true;
  }

  const tableMatches = careersHtml.match(/<table\b[\s\S]*?<\/table>/gi) ?? [];
  for (const tableHtml of tableMatches) {
    const tableText = stripHtmlTags(tableHtml).toLowerCase();
    const hasBandOrRangeLabel = /\b(?:salary|pay|compensation)\s*(?:band|range)\b/i.test(tableText);
    if (!hasBandOrRangeLabel) {
      continue;
    }

    if (extractSalaryRangeMatches(tableText).length > 0) {
      return true;
    }
  }

  return false;
}

function isJobPostingType(typeValue: unknown): boolean {
  if (typeof typeValue === "string") {
    return normalizeSchemaType(typeValue).toLowerCase() === "jobposting";
  }
  if (!Array.isArray(typeValue)) {
    return false;
  }

  return typeValue.some(
    (entry) => typeof entry === "string" && normalizeSchemaType(entry).toLowerCase() === "jobposting"
  );
}

function hasJobPostingBaseSalary(node: unknown): boolean {
  if (Array.isArray(node)) {
    return node.some((item) => hasJobPostingBaseSalary(item));
  }
  if (node === null || typeof node !== "object") {
    return false;
  }

  const record = node as Record<string, unknown>;
  if (isJobPostingType(record["@type"]) && record.baseSalary !== undefined && record.baseSalary !== null) {
    return true;
  }

  return Object.values(record).some((value) => hasJobPostingBaseSalary(value));
}

function hasJobPostingBaseSalaryInJsonLd(careersHtml: string): boolean {
  if (!careersHtml) {
    return false;
  }

  for (const block of extractJsonLdBlocks(careersHtml)) {
    try {
      const parsed = JSON.parse(block);
      if (hasJobPostingBaseSalary(parsed)) {
        return true;
      }
    } catch {
      continue;
    }
  }

  return false;
}

function detectCurrency(text: string): CurrencyCode {
  const currencyPatterns: Array<{ pattern: RegExp; code: CurrencyCode }> = [
    { pattern: /£|gbp/i, code: "GBP" },
    { pattern: /\$|usd/i, code: "USD" },
    { pattern: /€|eur/i, code: "EUR" },
    { pattern: /¥|jpy/i, code: "JPY" },
    { pattern: /₹|inr/i, code: "INR" },
    { pattern: /₩|krw/i, code: "KRW" },
    { pattern: /cny|rmb/i, code: "CNY" },
    { pattern: /aud|a\$/i, code: "AUD" },
    { pattern: /cad|c\$/i, code: "CAD" },
    { pattern: /chf/i, code: "CHF" },
    { pattern: /sek|kr/i, code: "SEK" },
    { pattern: /nok/i, code: "NOK" },
    { pattern: /dkk/i, code: "DKK" },
    { pattern: /zł|pln/i, code: "PLN" },
    { pattern: /\br\b|zar/i, code: "ZAR" },
    { pattern: /brl|r\$/i, code: "BRL" },
    { pattern: /mxn/i, code: "MXN" },
    { pattern: /sgd|s\$/i, code: "SGD" },
    { pattern: /hkd|hk\$/i, code: "HKD" },
    { pattern: /nzd|nz\$/i, code: "NZD" },
    { pattern: /thb|฿/i, code: "THB" },
    { pattern: /myr|rm/i, code: "MYR" },
    { pattern: /idr|rp/i, code: "IDR" },
    { pattern: /php|₱/i, code: "PHP" },
    { pattern: /rub|₽/i, code: "RUB" },
    { pattern: /try|₺/i, code: "TRY" },
    { pattern: /ils|₪/i, code: "ILS" },
    { pattern: /bdt|৳/i, code: "BDT" },
  ];

  for (const { pattern, code } of currencyPatterns) {
    if (pattern.test(text)) {
      return code;
    }
  }

  return null;
}

function analyzeSalaryTransparency(careersHtml: string): SalaryDetectionResult {
  if (!careersHtml) {
    return {
      hasSalaryData: false,
      salaryConfidence: "none",
      score: 0,
      detectedCurrency: null,
    };
  }

  const careersText = stripHtmlTags(careersHtml).toLowerCase();
  const hasJsonLdBaseSalary = hasJobPostingBaseSalaryInJsonLd(careersHtml);
  const salaryRangeMatches = extractSalaryRangeMatches(careersText);
  const hasStructuredElements = hasStructuredSalaryElements(careersHtml, careersText);
  const hasSalaryMentions =
    SALARY_KEYWORDS.some((keyword) => textHasKeyword(careersText, keyword)) ||
    SALARY_NON_DISCLOSURE_PATTERNS.some((pattern) => pattern.test(careersText));

  const detectedCurrency = detectCurrency(careersText);

  if (hasJsonLdBaseSalary) {
    return {
      hasSalaryData: true,
      salaryConfidence: "jsonld_base_salary",
      score: 20,
      detectedCurrency,
    };
  }

  if (salaryRangeMatches.length >= 2) {
    return {
      hasSalaryData: true,
      salaryConfidence: "multiple_ranges",
      score: 15,
      detectedCurrency,
    };
  }

  if (salaryRangeMatches.length >= 1 || hasStructuredElements) {
    return {
      hasSalaryData: true,
      salaryConfidence: "single_range",
      score: 10,
      detectedCurrency,
    };
  }

  if (hasSalaryMentions) {
    return {
      hasSalaryData: true,
      salaryConfidence: "mention_only",
      score: 5,
      detectedCurrency,
    };
  }

  return {
    hasSalaryData: false,
    salaryConfidence: "none",
    score: 0,
    detectedCurrency: null,
  };
}

function scoreLlmsCheck(hasLlmsTxt: boolean, llmsTxtHasEmployment: boolean): number {
  if (hasLlmsTxt && llmsTxtHasEmployment) {
    return 25;
  }
  if (hasLlmsTxt) {
    return 12;
  }
  return 0;
}

function scoreJsonLdCheck(schemas: string[]): number {
  const hasJobSchema = schemas.includes("JobPosting") || schemas.includes("EmployerAggregateRating");
  if (hasJobSchema) {
    return 25;
  }

  if (schemas.includes("Organization")) {
    return 12;
  }

  return 0;
}

function scoreCareersCheck(status: CareersPageStatus): number {
  if (status === "full") {
    return 15;
  }
  if (status === "partial") {
    return 8;
  }
  return 0;
}

function scoreRobotsCheck(status: RobotsTxtStatus, allowedBotsCount: number): number {
  if (status === "allows") {
    return 15;
  }
  if (status === "partial") {
    const partialBonus = Math.round((allowedBotsCount / AI_BOTS.length) * 7);
    return 8 + partialBonus;
  }
  if (status === "no_rules") {
    return 8;
  }
  return 0;
}

/**
 * Executes runWebsiteChecks.
 * @param domain - domain input.
 * @param companyName - companyName input.
 * @returns The resulting value.
 */
export async function runWebsiteChecks(
  domain: string,
  companyName: string
): Promise<WebsiteCheckResult> {
  const normalizedDomain = normalizeDomain(domain);
  const companySlug = createCompanySlug(companyName);

  let auditStatus: AuditStatus = "success";
  let hasLlmsTxt = false;
  let llmsTxtHasEmployment = false;
  let hasJsonld = false;
  let jsonldSchemasFound: string[] = [];
  let hasSalaryData = false;
  let salaryConfidence: SalaryConfidence = "none";
  let salaryScore = 0;
  let detectedCurrency: CurrencyCode = null;
  let careersPageStatus: CareersPageStatus = "not_found";
  let careersPageUrl: string | null = null;
  let atsDetected: AtsName = null;
  let hasSitemap = false;
  let robotsTxtStatus: RobotsTxtStatus = "not_found";
  let robotsTxtAllowedBots: string[] = [];
  let robotsTxtBlockedBots: string[] = [];

  if (!normalizedDomain) {
    auditStatus = "no_website";
  } else {
    const homepageUrl = `https://${normalizedDomain}/`;

    const llmsResponse = await fetchSafe(`https://${normalizedDomain}/llms.txt`);
    if (llmsResponse.ok && llmsResponse.status === 200) {
      hasLlmsTxt = true;
      const llmsText = llmsResponse.text.toLowerCase();
      llmsTxtHasEmployment = LLMS_EMPLOYMENT_KEYWORDS.some((keyword) => llmsText.includes(keyword));
    }

    const homepageResponse = await fetchSafe(homepageUrl);

    if (!homepageResponse.ok) {
      auditStatus = "unreachable";
    } else if (
      homepageResponse.status === 404 ||
      stripHtmlTags(homepageResponse.text).length < 50
    ) {
      auditStatus = "empty";
    }

    const homepageHtml = homepageResponse.ok && homepageResponse.status === 200 ? homepageResponse.text : "";

    const careersCheck = await runCareersCheck(normalizedDomain);
    careersPageStatus = careersCheck.status;
    careersPageUrl = careersCheck.url;

    // Detect ATS from the careers URL hostname
    if (careersPageUrl) {
      try {
        const careersHostname = new URL(careersPageUrl).hostname.toLowerCase();
        atsDetected = detectAtsName(careersHostname);
      } catch {
        // Invalid URL — ignore
      }
    }

    const salaryDetection = await analyzeSalaryAcrossCareersAndJobListings(
      careersCheck.html,
      careersCheck.url,
      normalizedDomain,
    );
    hasSalaryData = salaryDetection.hasSalaryData;
    salaryConfidence = salaryDetection.salaryConfidence;
    salaryScore = salaryDetection.score;
    detectedCurrency = salaryDetection.detectedCurrency;

    // Collect JSON-LD schemas from multiple pages: homepage, careers page, and job listings
    const htmlSamplesToScan = [homepageHtml];
    
    if (careersCheck.html) {
      htmlSamplesToScan.push(careersCheck.html);
    }

    // Also get job listing pages for JSON-LD checking
    if (careersCheck.html && careersCheck.url) {
      const jobListingLinks = extractJobListingLinks(careersCheck.html, careersCheck.url, normalizedDomain);
      if (jobListingLinks.length > 0) {
        const sampledResponses = await Promise.all(
          jobListingLinks.slice(0, 3).map((link) => fetchSafe(link))
        );
        for (const response of sampledResponses) {
          if (response.ok && response.status === 200 && response.text) {
            htmlSamplesToScan.push(response.text);
          }
        }
      }
    }

    const schemas = new Set<string>();
    for (const html of htmlSamplesToScan) {
      if (!html) continue;
      
      const jsonLdBlocks = extractJsonLdBlocks(html);
      for (const block of jsonLdBlocks) {
        try {
          const parsed = JSON.parse(block);
          collectJsonLdTypes(parsed, schemas);
        } catch {
          continue;
        }
      }
    }

    jsonldSchemasFound = Array.from(schemas);
    hasJsonld = jsonldSchemasFound.length > 0;

    const robotsResponse = await fetchSafe(`https://${normalizedDomain}/robots.txt`);
    if (robotsResponse.ok && robotsResponse.status === 200) {
      const parsedRobots = parseRobotsPolicy(robotsResponse.text);
      robotsTxtStatus = parsedRobots.status;
      robotsTxtAllowedBots = parsedRobots.allowedBots;
      robotsTxtBlockedBots = parsedRobots.blockedBots;
    } else if (robotsResponse.ok && robotsResponse.status === 404) {
      robotsTxtStatus = "not_found";
    }

    // Check for sitemap.xml
    const sitemapResponse = await fetchSafe(`https://${normalizedDomain}/sitemap.xml`);
    if (sitemapResponse.ok && sitemapResponse.status === 200) {
      // Basic validation: check if it looks like an XML sitemap
      const sitemapText = sitemapResponse.text;
      hasSitemap = sitemapText.includes("<urlset") || sitemapText.includes("<sitemapindex");
    }
  }

  const scoreBreakdown = {
    llmsTxt: scoreLlmsCheck(hasLlmsTxt, llmsTxtHasEmployment),
    jsonld: scoreJsonLdCheck(jsonldSchemasFound),
    salaryData: salaryScore,
    careersPage: scoreCareersCheck(careersPageStatus),
    robotsTxt: scoreRobotsCheck(robotsTxtStatus, robotsTxtAllowedBots.length),
  };

  const score =
    scoreBreakdown.llmsTxt +
    scoreBreakdown.jsonld +
    scoreBreakdown.salaryData +
    scoreBreakdown.careersPage +
    scoreBreakdown.robotsTxt;

  return {
    domain: normalizedDomain || domain.trim(),
    companyName,
    companySlug,
    status: auditStatus,
    hasLlmsTxt,
    llmsTxtHasEmployment,
    hasJsonld,
    jsonldSchemasFound,
    hasSalaryData,
    salaryConfidence,
    detectedCurrency,
    careersPageStatus,
    careersPageUrl,
    atsDetected,
    hasSitemap,
    robotsTxtStatus,
    robotsTxtAllowedBots,
    robotsTxtBlockedBots,
    score,
    scoreBreakdown,
  };
}
