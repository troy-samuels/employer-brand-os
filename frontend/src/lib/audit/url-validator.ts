/**
 * @module lib/audit/url-validator
 * Module implementation for url-validator.ts.
 */

import * as dns from "node:dns/promises";
import { isIP } from "node:net";

const URL_SCHEME_REGEX = /^[a-z][a-z0-9+.-]*:\/\//i;
const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);
const DNS_LOOKUP_TIMEOUT_MS = 3_000;
const HOST_RESOLUTION_CACHE_TTL_MS = 5 * 60 * 1_000;
const HOST_RESOLUTION_CACHE_MAX_ENTRIES = 500;

const BLOCKED_IPV4_CIDRS: Array<[string, number]> = [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.0.2.0", 24],
  ["192.168.0.0", 16],
  ["198.18.0.0", 15],
  ["198.51.100.0", 24],
  ["203.0.113.0", 24],
  ["224.0.0.0", 4],
  ["240.0.0.0", 4],
];

const BLOCKED_LOCAL_HOSTNAMES = new Set([
  "localhost",
  "localhost.localdomain",
  "metadata.google.internal",
]);

const CLOUD_METADATA_IPV4 = "169.254.169.254";

type HostResolutionCacheEntry = {
  expiresAt: number;
  addresses: string[] | null;
};

const hostResolutionCache = new Map<string, HostResolutionCacheEntry>();
const hostResolutionInFlight = new Map<string, Promise<string[] | null>>();

type UrlValidationFailureReason =
  | "invalid_url"
  | "unsupported_protocol"
  | "missing_hostname"
  | "blocked_hostname"
  | "dns_lookup_failed"
  | "private_network";

/**
 * Defines the UrlValidationResult contract.
 */
export type UrlValidationResult =
  | {
      ok: true;
      normalizedUrl: URL;
      resolvedAddresses: string[];
    }
  | {
      ok: false;
      reason: UrlValidationFailureReason;
    };

function parseUrlCandidate(input: string): URL | null {
  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }

  const candidate = URL_SCHEME_REGEX.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    return new URL(candidate);
  } catch {
    return null;
  }
}

function withTimeout<T>(operation: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("timeout"));
    }, timeoutMs);

    operation.then(
      (result) => {
        clearTimeout(timer);
        resolve(result);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

function setHostResolutionCache(hostname: string, addresses: string[] | null): void {
  if (hostResolutionCache.has(hostname)) {
    hostResolutionCache.delete(hostname);
  }

  hostResolutionCache.set(hostname, {
    addresses,
    expiresAt: Date.now() + HOST_RESOLUTION_CACHE_TTL_MS,
  });

  while (hostResolutionCache.size > HOST_RESOLUTION_CACHE_MAX_ENTRIES) {
    const oldestKey = hostResolutionCache.keys().next().value;
    if (!oldestKey) {
      break;
    }
    hostResolutionCache.delete(oldestKey);
  }
}

function parseIPv4ToInt(ip: string): number | null {
  const segments = ip.split(".");
  if (segments.length !== 4) {
    return null;
  }

  let value = 0;
  for (const segment of segments) {
    if (!/^\d{1,3}$/.test(segment)) {
      return null;
    }

    const octet = Number.parseInt(segment, 10);
    if (Number.isNaN(octet) || octet < 0 || octet > 255) {
      return null;
    }
    value = (value << 8) | octet;
  }

  return value >>> 0;
}

function isIPv4InCidr(ip: string, network: string, maskBits: number): boolean {
  const ipInt = parseIPv4ToInt(ip);
  const networkInt = parseIPv4ToInt(network);
  if (ipInt === null || networkInt === null) {
    return false;
  }

  const mask = maskBits === 0 ? 0 : ((0xffffffff << (32 - maskBits)) >>> 0);
  return (ipInt & mask) === (networkInt & mask);
}

function splitAndExpandIPv6(address: string): string[] | null {
  const withoutZoneIndex = address.split("%")[0] ?? "";
  if (!withoutZoneIndex) {
    return null;
  }

  const doubleColonCount = withoutZoneIndex.split("::").length - 1;
  if (doubleColonCount > 1) {
    return null;
  }

  const [headRaw = "", tailRaw = ""] = withoutZoneIndex.split("::");

  const expandPart = (part: string): string[] | null => {
    if (!part) {
      return [];
    }

    const entries = part.split(":");
    const expanded: string[] = [];

    for (const entry of entries) {
      if (!entry) {
        return null;
      }

      if (entry.includes(".")) {
        const ipv4Int = parseIPv4ToInt(entry);
        if (ipv4Int === null) {
          return null;
        }

        expanded.push(((ipv4Int >>> 16) & 0xffff).toString(16));
        expanded.push((ipv4Int & 0xffff).toString(16));
      } else {
        if (!/^[0-9a-f]{1,4}$/i.test(entry)) {
          return null;
        }
        expanded.push(entry.toLowerCase());
      }
    }

    return expanded;
  };

  const head = expandPart(headRaw);
  const tail = expandPart(tailRaw);

  if (!head || !tail) {
    return null;
  }

  if (doubleColonCount === 0) {
    const full = [...head, ...tail];
    return full.length === 8 ? full.map((part) => part.padStart(4, "0")) : null;
  }

  const missingSegments = 8 - (head.length + tail.length);
  if (missingSegments < 0) {
    return null;
  }

  const zeroFill = Array.from({ length: missingSegments }, () => "0000");
  return [...head, ...zeroFill, ...tail].map((part) => part.padStart(4, "0"));
}

function isPrivateOrReservedIPv4(address: string): boolean {
  if (address === CLOUD_METADATA_IPV4) {
    return true;
  }

  for (const [network, maskBits] of BLOCKED_IPV4_CIDRS) {
    if (isIPv4InCidr(address, network, maskBits)) {
      return true;
    }
  }

  return false;
}

function isPrivateOrReservedIPv6(address: string): boolean {
  const normalized = address.toLowerCase().split("%")[0] ?? address.toLowerCase();

  if (normalized === "::" || normalized === "::1") {
    return true;
  }

  if (normalized.includes(".")) {
    const maybeIpv4 = normalized.split(":").pop();
    if (maybeIpv4 && isIP(maybeIpv4) === 4 && isPrivateOrReservedIPv4(maybeIpv4)) {
      return true;
    }
  }

  const parts = splitAndExpandIPv6(normalized);
  if (!parts) {
    return true;
  }

  const firstHextet = Number.parseInt(parts[0] ?? "0", 16);
  if ((firstHextet & 0xfe00) === 0xfc00) {
    return true;
  }
  if ((firstHextet & 0xffc0) === 0xfe80) {
    return true;
  }
  if ((firstHextet & 0xff00) === 0xff00) {
    return true;
  }

  const firstTwo = `${parts[0]}:${parts[1]}`;
  if (firstTwo === "2001:0db8") {
    return true;
  }

  return false;
}

/**
 * Executes isPrivateOrReservedIp.
 * @param address - address input.
 * @returns The resulting value.
 */
export function isPrivateOrReservedIp(address: string): boolean {
  const normalized = address.trim().toLowerCase().split("%")[0] ?? address.trim().toLowerCase();
  const family = isIP(normalized);

  if (family === 4) {
    return isPrivateOrReservedIPv4(normalized);
  }
  if (family === 6) {
    return isPrivateOrReservedIPv6(normalized);
  }

  return true;
}

function isBlockedHostname(hostname: string): boolean {
  const normalized = hostname.trim().toLowerCase().replace(/\.$/, "");
  if (!normalized) {
    return true;
  }

  if (BLOCKED_LOCAL_HOSTNAMES.has(normalized)) {
    return true;
  }

  if (normalized.endsWith(".localhost")) {
    return true;
  }

  if (normalized.endsWith(".local")) {
    return true;
  }

  return false;
}

async function resolveHostname(hostname: string): Promise<string[] | null> {
  const normalized = hostname.trim().toLowerCase().replace(/\.$/, "");
  const literalIpFamily = isIP(normalized);

  if (literalIpFamily > 0) {
    return [normalized];
  }

  const cached = hostResolutionCache.get(normalized);
  if (cached) {
    if (cached.expiresAt > Date.now()) {
      return cached.addresses;
    }
    hostResolutionCache.delete(normalized);
  }

  const inFlight = hostResolutionInFlight.get(normalized);
  if (inFlight) {
    return inFlight;
  }

  const lookupPromise = (async () => {
    try {
      const resolved = await withTimeout(
        dns.lookup(normalized, { all: true, verbatim: true }),
        DNS_LOOKUP_TIMEOUT_MS,
      );
      const dedupedAddresses = Array.from(new Set(resolved.map((entry) => entry.address)));
      const result = dedupedAddresses.length > 0 ? dedupedAddresses : null;
      setHostResolutionCache(normalized, result);
      return result;
    } catch {
      setHostResolutionCache(normalized, null);
      return null;
    } finally {
      hostResolutionInFlight.delete(normalized);
    }
  })();

  hostResolutionInFlight.set(normalized, lookupPromise);

  return lookupPromise;
}

/**
 * Executes validateUrl.
 * @param input - input input.
 * @returns The resulting value.
 */
export async function validateUrl(input: string): Promise<UrlValidationResult> {
  const parsed = parseUrlCandidate(input);
  if (!parsed) {
    return { ok: false, reason: "invalid_url" };
  }

  if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
    return { ok: false, reason: "unsupported_protocol" };
  }

  if (!parsed.hostname) {
    return { ok: false, reason: "missing_hostname" };
  }

  if (isBlockedHostname(parsed.hostname)) {
    return { ok: false, reason: "blocked_hostname" };
  }

  const resolvedAddresses = await resolveHostname(parsed.hostname);
  if (!resolvedAddresses || resolvedAddresses.length === 0) {
    return { ok: false, reason: "dns_lookup_failed" };
  }

  if (resolvedAddresses.some((address) => isPrivateOrReservedIp(address))) {
    return { ok: false, reason: "private_network" };
  }

  return {
    ok: true,
    normalizedUrl: parsed,
    resolvedAddresses,
  };
}

/**
 * Executes isLikelyDomainOrUrl.
 * @param input - input input.
 * @returns The resulting value.
 */
export function isLikelyDomainOrUrl(input: string): boolean {
  const parsed = parseUrlCandidate(input);
  if (!parsed) {
    return false;
  }

  if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
    return false;
  }

  if (!parsed.hostname) {
    return false;
  }

  return parsed.hostname.includes(".") || isIP(parsed.hostname) > 0 || parsed.hostname === "localhost";
}
