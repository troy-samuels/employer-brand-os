/**
 * @module lib/audit/website-checks
 * Module implementation for website-checks.ts.
 */

import { validateUrl } from "@/lib/audit/url-validator";
import { renderPage, renderBotProtectedPage } from "@/lib/audit/headless-render";
import {
  checkBrandReputation,
  scoreBrandReputation,
  type BrandReputation,
} from "@/lib/audit/brand-reputation";
import { detectATS, isReliableDetection } from "@/lib/ats/detect";
import { fetchJobsFromProvider } from "@/lib/ats/providers";
import { analyseJobs } from "@/lib/ats/analyse";
import { generateFacts, hasSubstantialFacts } from "@/lib/ats/generate-facts";

const FETCH_TIMEOUT_MS = 5000;
const AUDIT_USER_AGENT = "OpenRoleAuditBot/1.1 (+https://openrole.ai/audit)";
const HEADLESS_FALLBACK_MAX_TEXT_CHARS = 500;
const HEADLESS_FALLBACK_MIN_HTML_BYTES = 5000;
const HEADLESS_FALLBACK_EXTENDED_TEXT_CHARS = 1200;
const MAX_FETCH_REDIRECT_HOPS = 5;

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

const SALARY_CURRENCY_PATTERN = String.raw`(?:a\$|c\$|s\$|hk\$|nz\$|r\$|zł|[£$€¥₹₩₽₪₺₱৳฿]|\b(?:gbp|usd|eur|jpy|inr|krw|rub|ils|try|php|bdt|chf|myr|pln|zar|aud|cad|sgd|hkd|nzd|thb|idr|cny|rmb|brl|mxn|sek|nok|dkk)\b|\b(?:rm|rp|kr|r)\b(?=\s*\d))`;
const SALARY_AMOUNT_PATTERN = String.raw`(?:\d{1,3}(?:[,.\s]\d{3})+|\d{4,9}|\d{2,3}(?:[.,]\d+)?\s*[kK])`;
const SALARY_VALUE_PATTERN = String.raw`${SALARY_CURRENCY_PATTERN}\s*${SALARY_AMOUNT_PATTERN}`;
const SALARY_RANGE_PATTERN = String.raw`${SALARY_VALUE_PATTERN}\s*(?:-|–|—|to|bis|à|a)\s*(?:${SALARY_CURRENCY_PATTERN}\s*)?${SALARY_AMOUNT_PATTERN}`;
const AMOUNT_BEFORE_SUFFIX_CURRENCY_PATTERN = String.raw`\b\d{1,3}(?:[,\.\s]\d{3})*(?:[.,]\d+)?(?:\s*[kK])?\s*`;

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
const CAREERS_PROBE_CONCURRENCY = 4;
const CAREERS_PROBE_TIMEOUT_MS = 35_000;

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

const CROSS_DOMAIN_CAREER_TERMS = [
  "job",
  "jobs",
  "career",
  "careers",
  "hiring",
  "join",
  "work",
  "recruit",
  "talent",
  "vacancies",
  "opportunities",
];

const CROSS_DOMAIN_HOST_PATTERNS = [
  /(?:^|\.)jobs?\./i,
  /(?:^|[.-])jobs?(?:[.-]|$)/i,
  /(?:^|[.-])careers?(?:[.-]|$)/i,
];

const MAX_CROSS_DOMAIN_CAREER_CANDIDATES = 16;

const CAREERS_STATUS_RANK: Record<CareersPageStatus, number> = {
  not_found: 0,
  bot_protected: 0.5,
  none: 1,
  partial: 2,
  full: 3,
};

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

type CareersPageStatus = "full" | "partial" | "none" | "not_found" | "bot_protected";
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
  isBotProtected: boolean;
};

const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);

const SPA_SHELL_MARKERS = [
  "__NEXT_DATA__",
  "id=\"__next\"",
  "id='__next'",
  "id=\"root\"",
  "id='root'",
  "data-reactroot",
  "window.__NUXT__",
  "ng-version",
  "webpackJsonp",
];

function shouldUseHeadlessFallback(html: string): boolean {
  const strippedTextLength = stripHtmlTags(html).length;
  const htmlSize = Buffer.byteLength(html, "utf8");

  if (
    strippedTextLength < HEADLESS_FALLBACK_MAX_TEXT_CHARS &&
    htmlSize > HEADLESS_FALLBACK_MIN_HTML_BYTES
  ) {
    return true;
  }

  const lowerHtml = html.toLowerCase();
  const scriptTagCount = (lowerHtml.match(/<script\b/gi) ?? []).length;
  const hasSpaMarker = SPA_SHELL_MARKERS.some((marker) =>
    lowerHtml.includes(marker.toLowerCase())
  );

  return (
    hasSpaMarker &&
    scriptTagCount >= 6 &&
    strippedTextLength < HEADLESS_FALLBACK_EXTENDED_TEXT_CHARS
  );
}

type CareersCheckResult = {
  status: CareersPageStatus;
  url: string | null;
  blockedUrl: string | null;
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
export type { ReviewPlatform, BrandReputation } from "@/lib/audit/brand-reputation";

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
  careersBlockedUrl: string | null;
  atsDetected: AtsName;
  atsProvider: string | null;
  atsBoardToken: string | null;
  atsJobCount: number | null;
  atsAnalysis: Record<string, unknown> | null;
  atsGeneratedFacts: Record<string, unknown> | null;
  hasSitemap: boolean;
  robotsTxtStatus: RobotsTxtStatus;
  robotsTxtAllowedBots: string[];
  robotsTxtBlockedBots: string[];
  brandReputation: BrandReputation;
  score: number;
  scoreBreakdown: {
    jsonld: number;
    robotsTxt: number;
    careersPage: number;
    brandReputation: number;
    salaryData: number;
    contentFormat: number;
    llmsTxt: number;
  };
};

function isBotProtectionResponse(status: number, text: string): boolean {
  if (status !== 403) return false;
  // Cloudflare challenge pages contain these markers
  return (
    text.includes("cf-mitigated") ||
    text.includes("cf-challenge") ||
    text.includes("challenge-platform") ||
    text.includes("Just a moment...") ||
    text.includes("Checking your browser") ||
    text.includes("Attention Required")
  );
}

async function fetchSafe(url: string, useHeadlessFallback = false): Promise<SafeFetchResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    let currentUrl = url;
    let response: Response | null = null;

    for (let redirectHop = 0; redirectHop <= MAX_FETCH_REDIRECT_HOPS; redirectHop += 1) {
      const validation = await validateUrl(currentUrl);
      if (!validation.ok) {
        return {
          ok: false,
          status: null,
          text: "",
          url: currentUrl,
          isBotProtected: false,
        };
      }

      response = await fetch(currentUrl, {
        headers: {
          "User-Agent": AUDIT_USER_AGENT,
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
        },
        signal: controller.signal,
        redirect: "manual",
      });

      if (!REDIRECT_STATUSES.has(response.status)) {
        break;
      }

      const location =
        typeof response.headers?.get === "function"
          ? response.headers.get("location")
          : null;
      if (!location) {
        break;
      }

      let nextUrl: URL;
      try {
        nextUrl = new URL(location, currentUrl);
      } catch {
        break;
      }

      if (!/^https?:$/i.test(nextUrl.protocol)) {
        break;
      }

      currentUrl = nextUrl.toString();
    }

    if (!response) {
      return {
        ok: false,
        status: null,
        text: "",
        url,
        isBotProtected: false,
      };
    }

    const text = await response.text();
    const resolvedUrl = typeof response.url === "string" && response.url ? response.url : currentUrl;
    const botProtected = isBotProtectionResponse(response.status, text);

    if (useHeadlessFallback && response.status === 200 && shouldUseHeadlessFallback(text)) {
      const renderedPage = await renderPage(resolvedUrl);
      if (renderedPage.html) {
        return {
          ok: true,
          status: response.status,
          text: renderedPage.html,
          url: renderedPage.url || resolvedUrl,
          isBotProtected: false,
        };
      }
    }

    return {
      ok: true,
      status: response.status,
      text,
      url: resolvedUrl,
      isBotProtected: botProtected,
    };
  } catch {
    return {
      ok: false,
      status: null,
      text: "",
      url,
      isBotProtected: false,
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

function looksLikeErrorPage(html: string): boolean {
  const lower = html.toLowerCase();
  // Detect soft-404 pages that return HTTP 200 but contain error content
  const errorPatterns = [
    "page not found",
    "404 error",
    "404 not found",
    "page doesn't exist",
    "page does not exist",
    "this page isn't available",
    "this page is not available",
    "no longer available",
    "couldn't find",
    "could not find",
    "nothing here",
    "page you requested",
    "doesn't exist",
    "does not exist",
    "<title>404",
    "<title>not found",
    "<title>page not found",
    "<title>error",
  ];
  const matchCount = errorPatterns.filter((p) => lower.includes(p)).length;
  return matchCount >= 1;
}

function classifyCareersResponse(html: string, resolvedUrl: string): CareersCheckResult {
  // Detect soft-404 pages (HTTP 200 but error content)
  if (looksLikeErrorPage(html)) {
    return { status: "not_found", url: null, blockedUrl: null, html: "" };
  }

  const textLength = stripHtmlTags(html).length;
  if (textLength > 1000) {
    return { status: "full", url: resolvedUrl, blockedUrl: null, html };
  }
  if (textLength >= 200) {
    return { status: "partial", url: resolvedUrl, blockedUrl: null, html };
  }
  return { status: "none", url: resolvedUrl, blockedUrl: null, html };
}

function isBetterCareersResult(candidate: CareersCheckResult, current: CareersCheckResult): boolean {
  const candidateRank = CAREERS_STATUS_RANK[candidate.status];
  const currentRank = CAREERS_STATUS_RANK[current.status];
  if (candidateRank !== currentRank) {
    return candidateRank > currentRank;
  }

  if (
    candidate.status !== "full" &&
    candidate.status !== "partial" &&
    candidate.status !== "none"
  ) {
    return false;
  }

  return stripHtmlTags(candidate.html).length > stripHtmlTags(current.html).length;
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
    const domainVariants = [normalizedDomain];
    if (baseDomain !== normalizedDomain) {
      domainVariants.push(baseDomain);
    }

    for (const variant of domainVariants) {
      appendCandidate(`https://${prefix}.${variant}`);
      // Some organizations expose careers only on www.jobs.<domain> style hosts
      // (for example, www.jobs.nhs.uk) even when jobs.<domain> has no DNS record.
      appendCandidate(`https://www.${prefix}.${variant}`);
    }
  }

  return urls;
}

export function extractCrossDomainCareerLinks(
  homepageHtml: string,
  homepageUrl: string,
  domain: string,
): string[] {
  if (!homepageHtml || !homepageUrl || !domain) {
    return [];
  }

  const normalizedDomain = domain.toLowerCase();
  const baseDomain = stripLeadingWww(normalizedDomain);
  const sameHostnames = new Set<string>([
    normalizedDomain,
    baseDomain,
    `www.${baseDomain}`,
  ]);
  const linkRegex = /<a\b[^>]*href\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'<>]+))[^>]*>/gi;
  const links: string[] = [];
  const seen = new Set<string>();

  for (const match of homepageHtml.matchAll(linkRegex)) {
    const href = (match[1] ?? match[2] ?? match[3] ?? "").trim();
    if (!href || href.startsWith("#")) {
      continue;
    }

    if (/^(?:mailto:|tel:|javascript:)/i.test(href)) {
      continue;
    }

    let resolvedUrl: URL;
    try {
      resolvedUrl = new URL(href, homepageUrl);
    } catch {
      continue;
    }

    if (!/^https?:$/i.test(resolvedUrl.protocol)) {
      continue;
    }

    const hostname = resolvedUrl.hostname.toLowerCase();
    if (sameHostnames.has(hostname)) {
      continue;
    }

    const isAts = isTrustedAtsHost(hostname);
    const lowerHostname = hostname.toLowerCase();
    const lowerPath = resolvedUrl.pathname.toLowerCase();
    const lowerSearch = resolvedUrl.search.toLowerCase();
    const searchable = `${lowerHostname}${lowerPath}${lowerSearch}`;
    const hasCareerTerm = CROSS_DOMAIN_CAREER_TERMS.some((term) => searchable.includes(term));
    const hasCommonPattern = CROSS_DOMAIN_HOST_PATTERNS.some((pattern) => pattern.test(lowerHostname));

    if (!isAts && !hasCareerTerm && !hasCommonPattern) {
      continue;
    }

    resolvedUrl.hash = "";
    const normalizedUrl = resolvedUrl.toString();
    if (seen.has(normalizedUrl)) {
      continue;
    }

    seen.add(normalizedUrl);
    links.push(normalizedUrl);

    if (links.length >= MAX_CROSS_DOMAIN_CAREER_CANDIDATES) {
      break;
    }
  }

  return links;
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
      const variants = [
        `${prefix}.${normalizedDomain}`,
        `${prefix}.${baseDomain}`,
        `www.${prefix}.${normalizedDomain}`,
        `www.${prefix}.${baseDomain}`,
      ];
      return variants.includes(targetHostname);
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

function safeDecodeURIComponent(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function isLikelyJobListingUrl(url: URL, domain: string): boolean {
  const hostname = url.hostname.toLowerCase();
  const pathname = safeDecodeURIComponent(url.pathname).toLowerCase();
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

export function stripHtmlTags(html: string): string {
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
  let bestResult: CareersCheckResult = {
    status: "not_found",
    url: null,
    blockedUrl: null,
    html: "",
  };

  let firstBlockedUrl: string | null = null;
  const candidateUrls = getCareersCandidateUrls(domain);

  for (let start = 0; start < candidateUrls.length; start += CAREERS_PROBE_CONCURRENCY) {
    const batch = candidateUrls.slice(start, start + CAREERS_PROBE_CONCURRENCY);
    const responses = await Promise.all(
      batch.map((careersUrl) =>
        fetchCareersPage(careersUrl, domain).then((response) => ({
          careersUrl,
          response,
        }))
      )
    );

    for (const { careersUrl, response } of responses) {
      // Track the first bot-protected URL we encounter
      if (response.isBotProtected && !firstBlockedUrl) {
        firstBlockedUrl = response.url || careersUrl;
      }

      if (!response.ok || response.status !== 200) {
        continue;
      }

      const resolvedUrl = response.url || careersUrl;
      const candidateResult = classifyCareersResponse(response.text, resolvedUrl);
      if (candidateResult.status === "full") {
        return candidateResult;
      }

      if (isBetterCareersResult(candidateResult, bestResult)) {
        bestResult = candidateResult;
      }
    }
  }

  // If we found nothing usable but detected bot protection, try the fallback chain
  if (bestResult.status === "not_found" && firstBlockedUrl) {
    const rendered = await renderBotProtectedPage(firstBlockedUrl);
    if (rendered.html) {
      const resolvedUrl = rendered.url || firstBlockedUrl;
      if (stripHtmlTags(rendered.html).length > 0) {
        return classifyCareersResponse(rendered.html, resolvedUrl);
      }
    }

    // All fallbacks failed — report as bot-protected
    return { status: "bot_protected", url: null, blockedUrl: firstBlockedUrl, html: "" };
  }

  return bestResult;
}

async function runCrossDomainCareersCheck(
  homepageHtml: string,
  homepageUrl: string,
  domain: string,
): Promise<CareersCheckResult> {
  const candidateUrls = extractCrossDomainCareerLinks(homepageHtml, homepageUrl, domain);
  if (candidateUrls.length === 0) {
    return {
      status: "not_found",
      url: null,
      blockedUrl: null,
      html: "",
    };
  }

  let bestResult: CareersCheckResult = {
    status: "not_found",
    url: null,
    blockedUrl: null,
    html: "",
  };
  let firstBlockedUrl: string | null = null;

  for (let start = 0; start < candidateUrls.length; start += CAREERS_PROBE_CONCURRENCY) {
    const batch = candidateUrls.slice(start, start + CAREERS_PROBE_CONCURRENCY);
    const responses = await Promise.all(
      batch.map((careersUrl) =>
        fetchCareersPage(careersUrl, domain).then((response) => ({
          careersUrl,
          response,
        })),
      ),
    );

    for (const { careersUrl, response } of responses) {
      if (response.isBotProtected && !firstBlockedUrl) {
        firstBlockedUrl = response.url || careersUrl;
      }

      if (!response.ok || response.status !== 200) {
        continue;
      }

      const resolvedUrl = response.url || careersUrl;
      const candidateResult = classifyCareersResponse(response.text, resolvedUrl);
      if (candidateResult.status === "full") {
        return candidateResult;
      }

      if (isBetterCareersResult(candidateResult, bestResult)) {
        bestResult = candidateResult;
      }
    }
  }

  if (bestResult.status === "not_found" && firstBlockedUrl) {
    return {
      status: "bot_protected",
      url: null,
      blockedUrl: firstBlockedUrl,
      html: "",
    };
  }

  return bestResult;
}

async function runCareersOverrideCheck(
  careersUrlOverride: string,
  domain: string,
): Promise<CareersCheckResult> {
  let careersDomain = domain;

  try {
    careersDomain = new URL(careersUrlOverride).hostname.toLowerCase();
  } catch {
    careersDomain = domain;
  }

  const response = await fetchCareersPage(careersUrlOverride, careersDomain);

  if (response.isBotProtected) {
    const blockedUrl = response.url || careersUrlOverride;
    const rendered = await renderBotProtectedPage(blockedUrl);
    if (rendered.html && stripHtmlTags(rendered.html).length > 0) {
      const resolvedUrl = rendered.url || blockedUrl;
      return classifyCareersResponse(rendered.html, resolvedUrl);
    }

    return {
      status: "bot_protected",
      url: null,
      blockedUrl,
      html: "",
    };
  }

  if (!response.ok || response.status !== 200) {
    return {
      status: "not_found",
      url: null,
      blockedUrl: null,
      html: "",
    };
  }

  const resolvedUrl = response.url || careersUrlOverride;
  return classifyCareersResponse(response.text, resolvedUrl);
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

function evaluateRulesForPath(rules: RobotsRule[], targetPath: string): "allow" | "block" {
  let bestMatch: RobotsRule | null = null;
  let bestSpecificity = -1;

  for (const rule of rules) {
    if (!doesRuleMatchPath(rule.path, targetPath)) {
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
    // If rules exist but none match the target path, that path is crawlable.
    return "allow";
  }

  return bestMatch.type === "allow" ? "allow" : "block";
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

  const employmentPaths = ["/careers", "/jobs"];
  const employmentPathAccess = employmentPaths.map((path) =>
    evaluateRulesForPath(rules, path)
  );

  // If employment-centric paths are fully blocked for this bot, treat as blocked.
  if (employmentPathAccess.every((access) => access === "block")) {
    return "block";
  }
  if (employmentPathAccess.some((access) => access === "allow")) {
    return "allow";
  }

  return evaluateRulesForPath(rules, "/");
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
    { pattern: /(?:£\s*\d|\bgbp\b)/i, code: "GBP" },
    { pattern: /(?:a\$\s*\d|\baud\b)/i, code: "AUD" },
    { pattern: /(?:c\$\s*\d|\bcad\b)/i, code: "CAD" },
    { pattern: /(?:s\$\s*\d|\bsgd\b)/i, code: "SGD" },
    { pattern: /(?:hk\$\s*\d|\bhkd\b)/i, code: "HKD" },
    { pattern: /(?:nz\$\s*\d|\bnzd\b)/i, code: "NZD" },
    { pattern: /(?:r\$\s*\d|\bbrl\b)/i, code: "BRL" },
    { pattern: /(?:\$\s*\d|\busd\b)/i, code: "USD" },
    { pattern: /(?:€\s*\d|\beur\b)/i, code: "EUR" },
    { pattern: /(?:¥\s*\d|\bjpy\b)/i, code: "JPY" },
    { pattern: /(?:₹\s*\d|\binr\b)/i, code: "INR" },
    { pattern: /(?:₩\s*\d|\bkrw\b)/i, code: "KRW" },
    { pattern: /(?:\bcny\b|\brmb\b)/i, code: "CNY" },
    { pattern: /\bchf\b/i, code: "CHF" },
    { pattern: /\bnok\b/i, code: "NOK" },
    { pattern: /\bdkk\b/i, code: "DKK" },
    { pattern: /(?:zł\s*\d|\bpln\b)/i, code: "PLN" },
    {
      pattern: new RegExp(String.raw`\bzar\b|\br\b(?=\s*\d)|${AMOUNT_BEFORE_SUFFIX_CURRENCY_PATTERN}r\b`, "i"),
      code: "ZAR",
    },
    { pattern: /\bmxn\b/i, code: "MXN" },
    { pattern: /(?:฿\s*\d|\bthb\b)/i, code: "THB" },
    {
      pattern: new RegExp(String.raw`\bmyr\b|\brm\b(?=\s*\d)|${AMOUNT_BEFORE_SUFFIX_CURRENCY_PATTERN}rm\b`, "i"),
      code: "MYR",
    },
    {
      pattern: new RegExp(String.raw`\bidr\b|\brp\b(?=\s*\d)|${AMOUNT_BEFORE_SUFFIX_CURRENCY_PATTERN}rp\b`, "i"),
      code: "IDR",
    },
    { pattern: /(?:₱\s*\d|\bphp\b)/i, code: "PHP" },
    { pattern: /(?:₽\s*\d|\brub\b)/i, code: "RUB" },
    {
      pattern: new RegExp(String.raw`₺\s*\d|\btry\b(?=\s*\d)|${AMOUNT_BEFORE_SUFFIX_CURRENCY_PATTERN}try\b`, "i"),
      code: "TRY",
    },
    { pattern: /(?:₪\s*\d|\bils\b)/i, code: "ILS" },
    { pattern: /(?:৳\s*\d|\bbdt\b)/i, code: "BDT" },
    {
      pattern: new RegExp(String.raw`\bsek\b|\bkr\b(?=\s*\d)|${AMOUNT_BEFORE_SUFFIX_CURRENCY_PATTERN}kr\b`, "i"),
      code: "SEK",
    },
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

  // Salary transparency: max 10 points (v2 scoring model).
  // Scored as bonus, not penalty — 0 base if no data, not a deduction.
  // Reduced from v1 due to regional variation and lack of direct AI citation evidence.
  if (hasJsonLdBaseSalary) {
    return {
      hasSalaryData: true,
      salaryConfidence: "jsonld_base_salary",
      score: 10,
      detectedCurrency,
    };
  }

  if (salaryRangeMatches.length >= 2) {
    return {
      hasSalaryData: true,
      salaryConfidence: "multiple_ranges",
      score: 8,
      detectedCurrency,
    };
  }

  if (salaryRangeMatches.length >= 1 || hasStructuredElements) {
    return {
      hasSalaryData: true,
      salaryConfidence: "single_range",
      score: 5,
      detectedCurrency,
    };
  }

  if (hasSalaryMentions) {
    return {
      hasSalaryData: true,
      salaryConfidence: "mention_only",
      score: 2,
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

/**
 * Scoring weights v2 (total: 100)
 *
 * Evidence-based model — see docs/scoring-research.md for full citations.
 * Every weight is traceable to at least one study or platform guideline.
 *
 * Sources: Princeton GEO study (KDD 2024), Microsoft AEO/GEO guidelines,
 * Semrush GEO analysis, Moz/Exposure Ninja practice, Senthor/SE Ranking studies.
 *
 *   Content accessibility ... 20  (bot access + SSR + sitemap — foundational gate)
 *   Structured data ........ 20  (JSON-LD: GEO study + Microsoft guidelines)
 *   Careers content ........ 20  (content quality + richness — GEO study)
 *   Content format ......... 15  (FAQ, semantic HTML, answer-first — GEO study + Microsoft)
 *   Brand presence ......... 15  (multi-platform mentions — Semrush + Moz; capped at 3 for fairness)
 *   Salary transparency .... 10  (candidate-value signal; reduced due to regional variation)
 *   llms.txt ............... 0   (proven zero impact — Senthor 10M+ requests, SE Ranking 300K domains)
 *
 * Fairness mechanisms:
 *   - Brand presence capped at 3 platforms (startup on Glassdoor+LinkedIn+own site = full marks)
 *   - Salary scored as bonus, not penalty (0 base if no data, not a deduction)
 *   - No company size proxy signals (headcount, revenue, listing count)
 */

function scoreLlmsCheck(): number {
  // Zeroed: Senthor (10M+ requests) and SE Ranking (300K domains) studies
  // found zero measurable impact on AI citations. Kept for backward compatibility.
  return 0;
}

function scoreJsonLdCheck(schemas: string[]): number {
  // GEO study: structured data with citations/statistics boosts visibility 30-40%.
  // Microsoft AEO guidelines: "make catalogs machine-readable."
  // Max: 20 points.
  const hasJobSchema = schemas.includes("JobPosting") || schemas.includes("EmployerAggregateRating");
  if (hasJobSchema) {
    return 20;
  }

  if (schemas.includes("Organization")) {
    return 12;
  }

  if (schemas.length > 0) {
    return 5;
  }

  return 0;
}

function scoreCareersCheck(status: CareersPageStatus): number {
  // GEO study: content quality and structure matter more than existence alone.
  // Moz: "extreme close matching" — rich, direct content gets cited.
  // Max: 20 points.
  if (status === "full") {
    return 20;
  }
  if (status === "partial") {
    return 10;
  }
  return 0;
}

function scoreRobotsCheck(status: RobotsTxtStatus, allowedBotsCount: number, hasSitemap: boolean): number {
  // Combined "Content Accessibility" dimension — can AI crawlers reach and parse your content?
  // Semrush: SSR matters, AI crawlers can't execute JS.
  // Moz: organic visibility is prerequisite for AI citation.
  // Max: 20 points (robots: 14, sitemap: 6).
  let robotsScore = 0;

  if (status === "allows") {
    robotsScore = 14;
  } else if (status === "partial") {
    const partialBonus = Math.round((allowedBotsCount / AI_BOTS.length) * 5);
    robotsScore = 6 + partialBonus;
  } else if (status === "no_rules") {
    robotsScore = 8;
  }

  const sitemapScore = hasSitemap ? 6 : 0;

  return Math.min(robotsScore + sitemapScore, 20);
}

/**
 * Score content format signals that AI models prefer to cite.
 * Princeton GEO study: citations, statistics, Q&A format → up to 40% visibility boost.
 * Microsoft AEO guidelines: "structure content to answer real questions."
 *
 * Max: 15 points.
 */
function scoreContentFormat(careersHtml: string | null): number {
  if (!careersHtml) return 0;

  let score = 0;
  const html = careersHtml.toLowerCase();

  // FAQ schema or FAQ-like structure (AI prefers Q&A format) — 3 pts
  if (html.includes('"faqpage"') || html.includes('"question"') ||
      (html.includes('<details') && html.includes('<summary'))) {
    score += 3;
  }

  // Semantic heading structure (proper h1→h2→h3 hierarchy helps AI parse) — 3 pts
  const hasH1 = /<h1[\s>]/i.test(careersHtml);
  const hasH2 = /<h2[\s>]/i.test(careersHtml);
  if (hasH1 && hasH2) {
    score += 3;
  }

  // Tables or definition lists (AI prefers tabular/structured data) — 2 pts
  if (html.includes('<table') || html.includes('<dl')) {
    score += 2;
  }

  // Answer-first paragraph structure: short opening paragraphs <60 words — 3 pts
  // GEO study: direct, concise answers get cited over verbose content
  const firstParaMatch = careersHtml.match(/<(?:h[12])[^>]*>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/i);
  if (firstParaMatch?.[1]) {
    const plainText = firstParaMatch[1].replace(/<[^>]+>/g, ' ').trim();
    const wordCount = plainText.split(/\s+/).filter(Boolean).length;
    if (wordCount > 0 && wordCount < 60) {
      score += 3;
    }
  }

  // ARIA/role attributes on key sections (accessibility = AI parsability) — 2 pts
  if (/\brole\s*=\s*["'](?:main|navigation|region|complementary|banner)/i.test(careersHtml) ||
      /\baria-label(?:ledby)?\s*=/i.test(careersHtml)) {
    score += 2;
  }

  // Lists (ordered or unordered) — AI models extract list content effectively — 2 pts
  const listCount = (html.match(/<(?:ul|ol)[\s>]/gi) ?? []).length;
  if (listCount >= 2) {
    score += 2;
  }

  return Math.min(score, 15);
}

/**
 * Executes runWebsiteChecks.
 * @param domain - domain input.
 * @param companyName - companyName input.
 * @returns The resulting value.
 */
export async function runWebsiteChecks(
  domain: string,
  companyName: string,
  careersUrlOverride?: string,
): Promise<WebsiteCheckResult> {
  const normalizedDomain = normalizeDomain(domain);
  const companySlug = createCompanySlug(companyName);

  // Resilience wrapper: never throw — always return at least a partial result
  try {
    return await runWebsiteChecksInner(normalizedDomain, companyName, companySlug, careersUrlOverride);
  } catch (error) {
    console.error("runWebsiteChecks fatal error (returning partial result):", error);
    return {
      domain: normalizedDomain || domain.trim(),
      companyName,
      companySlug,
      status: "no_website",
      hasLlmsTxt: false,
      llmsTxtHasEmployment: false,
      hasJsonld: false,
      jsonldSchemasFound: [],
      hasSalaryData: false,
      salaryConfidence: "none",
      detectedCurrency: null,
      careersPageStatus: "not_found",
      careersPageUrl: null,
      careersBlockedUrl: null,
      atsDetected: null,
      atsProvider: null,
      atsBoardToken: null,
      atsJobCount: null,
      atsAnalysis: null,
      atsGeneratedFacts: null,
      hasSitemap: false,
      robotsTxtStatus: "not_found",
      robotsTxtAllowedBots: [],
      robotsTxtBlockedBots: [],
      brandReputation: { platforms: [], sentiment: "unknown", sourceCount: 0 },
      score: 0,
      scoreBreakdown: {
        jsonld: 0,
        robotsTxt: 0,
        careersPage: 0,
        brandReputation: 0,
        salaryData: 0,
        contentFormat: 0,
        llmsTxt: 0,
      },
    };
  }
}

async function runWebsiteChecksInner(
  normalizedDomain: string,
  companyName: string,
  companySlug: string,
  careersUrlOverride?: string,
): Promise<WebsiteCheckResult> {

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
  let careersBlockedUrl: string | null = null;
  let atsDetected: AtsName = null;
  let atsProvider: string | null = null;
  let atsBoardToken: string | null = null;
  let atsJobCount: number | null = null;
  let atsAnalysis: Record<string, unknown> | null = null;
  let atsGeneratedFacts: Record<string, unknown> | null = null;
  let hasSitemap = false;
  let careersPageHtml: string | null = null;
  let robotsTxtStatus: RobotsTxtStatus = "not_found";
  let robotsTxtAllowedBots: string[] = [];
  let robotsTxtBlockedBots: string[] = [];

  let brandReputation: BrandReputation | null = null;

  if (!normalizedDomain) {
    auditStatus = "no_website";
  } else {
    const homepageUrl = `https://${normalizedDomain}/`;
    const careersCheckPromise = careersUrlOverride
      ? runCareersOverrideCheck(careersUrlOverride, normalizedDomain)
      : runCareersCheck(normalizedDomain);

    // Brand reputation is independent of crawl — run in parallel with initial fetches
    const brandReputationPromise = checkBrandReputation(companyName);

    const [llmsResponse, homepageResponse, careersCheck, robotsResponse, sitemapResponse] = await Promise.all([
      fetchSafe(`https://${normalizedDomain}/llms.txt`),
      fetchSafe(homepageUrl, true),
      careersCheckPromise,
      fetchSafe(`https://${normalizedDomain}/robots.txt`),
      fetchSafe(`https://${normalizedDomain}/sitemap.xml`),
    ]);

    if (llmsResponse.ok && llmsResponse.status === 200) {
      hasLlmsTxt = true;
      const llmsText = llmsResponse.text.toLowerCase();
      llmsTxtHasEmployment = LLMS_EMPLOYMENT_KEYWORDS.some((keyword) => llmsText.includes(keyword));
    }

    if (!homepageResponse.ok) {
      auditStatus = "unreachable";
    } else if (
      homepageResponse.status === 404 ||
      stripHtmlTags(homepageResponse.text).length < 50
    ) {
      auditStatus = "empty";
    }

    const homepageHtml = homepageResponse.ok && homepageResponse.status === 200 ? homepageResponse.text : "";

    // ── Careers probe phase (timeout-capped) ────────────────────────
    // The careers probe can involve multiple network hops (cross-domain
    // checks, bot-protection fallbacks, job listing sampling). Cap the
    // entire phase so it can't stall the audit indefinitely.
    type CareersProbeResult = {
      bestCareersCheck: CareersCheckResult;
      jobListingHtmlSamples: string[];
    };

    const careersProbeWork = async (): Promise<CareersProbeResult> => {
      // Cross-domain careers check overlaps with job listing fetches below
      const crossDomainPromise = (homepageHtml && !careersUrlOverride)
        ? runCrossDomainCareersCheck(homepageHtml, homepageUrl, normalizedDomain)
        : Promise.resolve(null);

      // Fetch job listing pages ONCE — reuse HTML for both salary and JSON-LD analysis
      let samples: string[] = [];
      if (careersCheck.html && careersCheck.url) {
        const jobListingLinks = extractJobListingLinks(
          careersCheck.html,
          careersCheck.url,
          normalizedDomain,
        );
        if (jobListingLinks.length > 0) {
          const sampledResponses = await Promise.all(
            jobListingLinks.slice(0, MAX_SAMPLED_JOB_LISTING_PAGES).map((link) => fetchSafe(link))
          );
          samples = sampledResponses
            .filter((r) => r.ok && r.status === 200 && r.text)
            .map((r) => r.text);
        }
      }

      // Merge cross-domain careers result (already running in parallel)
      const crossDomainCareersCheck = await crossDomainPromise;
      let best = careersCheck;
      if (crossDomainCareersCheck && isBetterCareersResult(crossDomainCareersCheck, best)) {
        best = crossDomainCareersCheck;
      }

      return { bestCareersCheck: best, jobListingHtmlSamples: samples };
    };

    const careersProbeTimeout = new Promise<CareersProbeResult>((resolve) => {
      setTimeout(() => {
        // Timeout: return whatever the initial careers check found (no cross-domain or job samples)
        resolve({ bestCareersCheck: careersCheck, jobListingHtmlSamples: [] });
      }, CAREERS_PROBE_TIMEOUT_MS);
    });

    const { bestCareersCheck, jobListingHtmlSamples } = await Promise.race([
      careersProbeWork(),
      careersProbeTimeout,
    ]);

    careersPageStatus = bestCareersCheck.status;
    careersPageUrl = bestCareersCheck.url;
    careersBlockedUrl = bestCareersCheck.blockedUrl;
    careersPageHtml = bestCareersCheck.html ?? null;

    // If the homepage appeared empty (JS-rendered shell) but we found real
    // content elsewhere, upgrade the overall status — the site isn't truly empty.
    if (auditStatus === "empty" && careersPageStatus === "full") {
      auditStatus = "success";
    }

    // Detect ATS from the careers URL hostname
    if (careersPageUrl) {
      try {
        const careersHostname = new URL(careersPageUrl).hostname.toLowerCase();
        atsDetected = detectAtsName(careersHostname);
        
        // Enhanced ATS detection with job scraping (graceful fallback on error)
        try {
          const atsDetection = await detectATS(careersPageUrl);
          if (isReliableDetection(atsDetection) && atsDetection.boardToken && atsDetection.provider) {
            atsProvider = atsDetection.provider;
            atsBoardToken = atsDetection.boardToken;
            
            // Fetch and analyse jobs (with timeout protection)
            const jobsPromise = fetchJobsFromProvider(atsDetection.provider, atsDetection.boardToken);
            const jobs = await Promise.race([
              jobsPromise,
              new Promise<[]>((resolve) => setTimeout(() => resolve([]), 8000))
            ]);
            
            if (jobs.length > 0) {
              atsJobCount = jobs.length;
              const analysis = analyseJobs(jobs);
              atsAnalysis = analysis as unknown as Record<string, unknown>;
              
              const facts = generateFacts(jobs, analysis, atsDetection.provider);
              if (hasSubstantialFacts(facts)) {
                atsGeneratedFacts = facts as unknown as Record<string, unknown>;
              }
            }
          }
        } catch (atsError) {
          // Enhanced ATS detection failed — gracefully continue with basic detection
          console.error("[Audit] Enhanced ATS detection failed:", atsError);
        }
      } catch {
        // Invalid URL — ignore
      }
    }

    // Salary analysis — reuse already-fetched job listing HTML (no double fetch)
    const salaryHtmlSamples = [bestCareersCheck.html, ...jobListingHtmlSamples].filter(Boolean);
    const salaryDetections = salaryHtmlSamples.map((html) => analyzeSalaryTransparency(html));
    const salaryDetection = selectHighestConfidenceSalaryDetection(salaryDetections);
    hasSalaryData = salaryDetection.hasSalaryData;
    salaryConfidence = salaryDetection.salaryConfidence;
    salaryScore = salaryDetection.score;
    detectedCurrency = salaryDetection.detectedCurrency;

    // JSON-LD schemas — reuse already-fetched job listing HTML (no double fetch)
    const htmlSamplesToScan = [homepageHtml, bestCareersCheck.html, ...jobListingHtmlSamples];

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

    if (robotsResponse.ok && robotsResponse.status === 200) {
      const parsedRobots = parseRobotsPolicy(robotsResponse.text);
      robotsTxtStatus = parsedRobots.status;
      robotsTxtAllowedBots = parsedRobots.allowedBots;
      robotsTxtBlockedBots = parsedRobots.blockedBots;
    } else if (robotsResponse.ok && robotsResponse.status === 404) {
      robotsTxtStatus = "not_found";
    }

    // Check for sitemap.xml
    if (sitemapResponse.ok && sitemapResponse.status === 200) {
      // Basic validation: check if it looks like an XML sitemap
      const sitemapText = sitemapResponse.text;
      hasSitemap = sitemapText.includes("<urlset") || sitemapText.includes("<sitemapindex");
    }

    // Await brand reputation (started in parallel at the top of crawl)
    brandReputation = await brandReputationPromise;
  }

  // Brand reputation fallback for no-website case
  if (!brandReputation) {
    brandReputation = await checkBrandReputation(companyName);
  }

  // Content format scoring uses the careers page HTML collected during the crawl.
  // careersPageHtml is set inside the crawl block; it's null if the site is unreachable.
  const careersHtml = careersPageHtml;

  const scoreBreakdown = {
    jsonld: scoreJsonLdCheck(jsonldSchemasFound),
    robotsTxt: scoreRobotsCheck(robotsTxtStatus, robotsTxtAllowedBots.length, hasSitemap),
    careersPage: scoreCareersCheck(careersPageStatus),
    brandReputation: scoreBrandReputation(brandReputation),
    salaryData: Math.min(salaryScore, 10),
    contentFormat: scoreContentFormat(careersHtml),
    llmsTxt: scoreLlmsCheck(),
  };

  const score =
    scoreBreakdown.jsonld +
    scoreBreakdown.robotsTxt +
    scoreBreakdown.careersPage +
    scoreBreakdown.brandReputation +
    scoreBreakdown.salaryData +
    scoreBreakdown.contentFormat +
    scoreBreakdown.llmsTxt;

  return {
    domain: normalizedDomain,
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
    careersBlockedUrl,
    atsDetected,
    atsProvider,
    atsBoardToken,
    atsJobCount,
    atsAnalysis,
    atsGeneratedFacts,
    hasSitemap,
    robotsTxtStatus,
    robotsTxtAllowedBots,
    robotsTxtBlockedBots,
    brandReputation,
    score,
    scoreBreakdown,
  };
}
