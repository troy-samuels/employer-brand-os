import { validateUrl } from "@/lib/audit/url-validator";

const FETCH_TIMEOUT_MS = 5_000;
const URL_SCHEME_REGEX = /^[a-z][a-z0-9+.-]*:\/\//i;
const USER_AGENT = "BrandOSAuditBot/1.0 (+https://brandos.ai)";

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

  const candidates = [`https://${slug}.com`, `https://www.${slug}.com`];
  for (const candidateUrl of candidates) {
    if (await isReachable(candidateUrl)) {
      return { name, url: candidateUrl };
    }
  }

  return { name, url: null };
}
