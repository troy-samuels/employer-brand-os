/**
 * @module features/pixel/lib/validate-domain
 * Module implementation for validate-domain.ts.
 */

/**
 * Domain Validation
 * Validates request origin against allowed domains with wildcard support
 *
 * Security: This is a critical security function that prevents pixel theft.
 * We check both Origin and Referer headers as defense in depth.
 */

import type { DomainValidationResult } from '../types/pixel.types';

/**
 * Validate that the request origin is in the allowed domains list
 *
 * Security considerations:
 * - Origin header is preferred (set by browser, harder to spoof)
 * - Referer is fallback (can be stripped by privacy settings)
 * - Supports wildcard patterns: *.example.com
 * - Prevents suffix attacks: evil.com cannot match example.com
 *
 * @param origin - Origin header value
 * @param referer - Referer header value
 * @param allowedDomains - List of allowed domain patterns
 * @returns Validation result with matched domain
 */
export function validateDomain(
  origin: string | null,
  referer: string | null,
  allowedDomains: string[]
): DomainValidationResult {
  // If no allowed domains configured, deny by default (secure by default)
  if (!allowedDomains || allowedDomains.length === 0) {
    return {
      valid: false,
      matchedDomain: null,
      requestedOrigin: origin,
    };
  }

  // Try to extract hostname from Origin first (preferred)
  const originHostname = extractHostname(origin);
  if (originHostname) {
    const match = findMatchingDomain(originHostname, allowedDomains);
    if (match) {
      return {
        valid: true,
        matchedDomain: match,
        requestedOrigin: origin,
      };
    }
  }

  // Fallback to Referer header
  const refererHostname = extractHostname(referer);
  if (refererHostname) {
    const match = findMatchingDomain(refererHostname, allowedDomains);
    if (match) {
      return {
        valid: true,
        matchedDomain: match,
        requestedOrigin: referer,
      };
    }
  }

  // No match found
  return {
    valid: false,
    matchedDomain: null,
    requestedOrigin: origin || referer,
  };
}

/**
 * Extract hostname from a URL string
 * Handles full URLs and bare hostnames
 */
function extractHostname(urlOrHostname: string | null): string | null {
  if (!urlOrHostname) {
    return null;
  }

  try {
    const trimmed = urlOrHostname.trim();
    if (!trimmed || trimmed === 'null') {
      return null;
    }

    // If it looks like a URL, parse it
    if (trimmed.includes('://')) {
      const url = new URL(trimmed);
      return normalizeHostname(url.hostname);
    }

    // Otherwise treat as bare hostname
    return normalizeHostname(trimmed);
  } catch {
    return null;
  }
}

function normalizeHostname(hostname: string): string | null {
  const normalizedInput = hostname.trim().toLowerCase();
  if (!normalizedInput) {
    return null;
  }

  const withoutPath = normalizedInput.split(/[/?#]/)[0];
  const withoutPort = withoutPath.split(':')[0];
  const withoutTrailingDot = withoutPort.endsWith('.')
    ? withoutPort.slice(0, -1)
    : withoutPort;

  return withoutTrailingDot || null;
}

function stripWww(hostname: string): string {
  return hostname.startsWith('www.') ? hostname.slice(4) : hostname;
}

function parseDomainPattern(pattern: string): { wildcard: boolean; hostname: string } | null {
  const trimmed = pattern.trim().toLowerCase();
  if (!trimmed) {
    return null;
  }

  const wildcard = trimmed.startsWith('*.');
  const rawHostname = wildcard ? trimmed.slice(2) : trimmed;
  const hostname = extractHostname(rawHostname);

  if (!hostname) {
    return null;
  }

  return { wildcard, hostname };
}

/**
 * Find a matching domain pattern in the allowed list
 * Supports wildcard patterns: *.example.com
 *
 * Security: Carefully handles wildcards to prevent suffix attacks
 * *.example.com matches sub.example.com but NOT notexample.com
 */
function findMatchingDomain(
  hostname: string,
  allowedDomains: string[]
): string | null {
  const normalizedHostname = hostname.toLowerCase();
  const canonicalHostname = stripWww(normalizedHostname);

  for (const pattern of allowedDomains) {
    const parsedPattern = parseDomainPattern(pattern);
    if (!parsedPattern) {
      continue;
    }

    const canonicalPatternHost = stripWww(parsedPattern.hostname);

    // Exact match with www/non-www tolerance.
    if (!parsedPattern.wildcard && canonicalHostname === canonicalPatternHost) {
      return pattern;
    }

    // Wildcard match: *.example.com
    if (parsedPattern.wildcard) {
      const baseDomain = canonicalPatternHost;
      if (!baseDomain) {
        continue;
      }

      // Match base domain and all subdomains, while preventing suffix attacks.
      if (
        canonicalHostname === baseDomain ||
        canonicalHostname.endsWith(`.${baseDomain}`)
      ) {
        return pattern;
      }
    }
  }

  return null;
}

/**
 * Check if a domain pattern is valid
 * Used for input validation when creating Smart Pixels
 */
export function isValidDomainPattern(pattern: string): boolean {
  // Allow wildcard prefix
  const domainPart = pattern.startsWith('*.') ? pattern.slice(2) : pattern;

  // Basic domain validation regex
  const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*$/;

  return domainRegex.test(domainPart);
}
