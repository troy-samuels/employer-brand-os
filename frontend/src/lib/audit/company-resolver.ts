/**
 * @module lib/audit/company-resolver
 * Module implementation for company-resolver.ts.
 */

import { validateUrl } from "@/lib/audit/url-validator";

const FETCH_TIMEOUT_MS = 5_000;
const URL_SCHEME_REGEX = /^[a-z][a-z0-9+.-]*:\/\//i;
const USER_AGENT = "RankwellAuditBot/1.0 (+https://rankwell.io)";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toTitleCase(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function deriveCompanyNameFromHostname(hostname: string): string {
  const labels = hostname.toLowerCase().split(".").filter(Boolean);
  const candidate = labels[0] === "www" ? labels[1] ?? labels[0] : labels[0] ?? hostname;
  return toTitleCase(candidate.replace(/[-_]+/g, " ").trim());
}

function normalizeCompanyName(input: string): string {
  return input
    .trim()
    .replace(/\s+/g, " ")
    .replace(/^[^\w]+|[^\w]+$/g, "");
}

async function fetchWithTimeout(url: string, init: RequestInit = {}): Promise<Response | null> {
  const validation = await validateUrl(url);
  if (!validation.ok) {
    return null;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const headers = new Headers(init.headers);
    if (!headers.has("user-agent")) {
      headers.set("user-agent", USER_AGENT);
    }

    return await fetch(url, {
      ...init,
      headers,
      redirect: "follow",
      signal: controller.signal,
    });
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function isReachable(candidateUrl: string): Promise<boolean> {
  const headResponse = await fetchWithTimeout(candidateUrl, { method: "HEAD" });
  if (headResponse?.ok) {
    return true;
  }

  const getResponse = await fetchWithTimeout(candidateUrl, { method: "GET" });
  return Boolean(getResponse?.ok);
}

const COUNTRY_TLDS = [
  "com",
  "co.uk",
  "de",
  "fr",
  "com.au",
  "co.jp",
  "com.br",
  "ca",
  "nl",
  "es",
  "it",
  "se",
  "dk",
  "no",
  "fi",
  "ch",
  "at",
  "be",
  "ie",
  "nz",
  "sg",
  "in",
  "mx",
  "ar",
  "cl",
  "co",
  "pl",
  "cz",
  "pt",
  "gr",
  "ru",
  "cn",
  "jp",
  "kr",
  "hk",
  "tw",
  "my",
  "th",
  "id",
  "ph",
  "vn",
  "za",
  "ae",
  "il",
  "tr",
];

async function searchCompanyUrl(companyName: string): Promise<string | null> {
  // Simple web search fallback using DuckDuckGo instant answer API
  try {
    const searchQuery = encodeURIComponent(`${companyName} official website`);
    const response = await fetchWithTimeout(
      `https://api.duckduckgo.com/?q=${searchQuery}&format=json&no_html=1&skip_disambig=1`
    );
    
    if (!response?.ok) {
      return null;
    }

    const data = await response.json() as { AbstractURL?: string };
    const abstractUrl = data.AbstractURL;
    
    if (abstractUrl && typeof abstractUrl === "string") {
      const normalized = normalizeUrl(abstractUrl);
      if (normalized) {
        return normalized;
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Executes normalizeUrl.
 * @param input - input input.
 * @returns The resulting value.
 */
export function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) {
    return "";
  }

  const candidate = URL_SCHEME_REGEX.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const parsed = new URL(candidate);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return "";
    }

    const hostname = parsed.hostname.toLowerCase();
    if (!hostname) {
      return "";
    }

    return `https://${hostname}`;
  } catch {
    return "";
  }
}

/**
 * Executes resolveCompanyUrl.
 * @param input - input input.
 * @returns The resulting value.
 */
export async function resolveCompanyUrl(
  input: string
): Promise<{ name: string; url: string | null }> {
  const trimmed = input.trim();
  if (!trimmed) {
    return { name: "", url: null };
  }

  const normalizedInputUrl = normalizeUrl(trimmed);
  if (normalizedInputUrl) {
    const hostname = new URL(normalizedInputUrl).hostname;
    return {
      name: deriveCompanyNameFromHostname(hostname),
      url: normalizedInputUrl,
    };
  }

  const name = normalizeCompanyName(trimmed);
  if (!name) {
    return { name: "", url: null };
  }

  const slug = slugify(name);
  if (!slug) {
    return { name, url: null };
  }

  // Try various TLD combinations
  const candidates: string[] = [];
  for (const tld of COUNTRY_TLDS) {
    candidates.push(`https://${slug}.${tld}`);
    if (!tld.includes(".")) {
      candidates.push(`https://www.${slug}.${tld}`);
    }
  }

  for (const candidateUrl of candidates) {
    if (await isReachable(candidateUrl)) {
      return { name, url: candidateUrl };
    }
  }

  // Fallback to web search
  const searchResult = await searchCompanyUrl(name);
  if (searchResult) {
    return { name, url: searchResult };
  }

  return { name, url: null };
}
