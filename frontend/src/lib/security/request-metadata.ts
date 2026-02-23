/**
 * @module lib/security/request-metadata
 * Normalized request metadata helpers for security boundaries.
 */

import type { NextRequest } from "next/server";

type HeaderCarrier = Pick<NextRequest, "headers">;

const FALLBACK_FINGERPRINT_LENGTH = 8;

function splitHeaderList(value: string | null): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function isValidIpv4(value: string): boolean {
  const octets = value.split(".");
  if (octets.length !== 4) {
    return false;
  }

  return octets.every((octet) => {
    if (!/^\d{1,3}$/.test(octet)) {
      return false;
    }
    if (octet.length > 1 && octet.startsWith("0")) {
      return false;
    }

    const numeric = Number(octet);
    return Number.isInteger(numeric) && numeric >= 0 && numeric <= 255;
  });
}

function isValidIpv6(value: string): boolean {
  const candidate = value.toLowerCase();
  if (!/^[0-9a-f:.]+$/.test(candidate)) {
    return false;
  }

  let normalized = candidate;
  const embeddedIpv4Match = candidate.match(/^(.*:)(\d+\.\d+\.\d+\.\d+)$/);
  if (embeddedIpv4Match) {
    const ipv4Part = embeddedIpv4Match[2];
    if (!isValidIpv4(ipv4Part)) {
      return false;
    }
    normalized = `${embeddedIpv4Match[1]}0:0`;
  }

  const pieces = normalized.split("::");
  if (pieces.length > 2) {
    return false;
  }

  const left = pieces[0]
    ? pieces[0].split(":").filter((segment) => segment.length > 0)
    : [];
  const right = pieces[1]
    ? pieces[1].split(":").filter((segment) => segment.length > 0)
    : [];

  const isValidSegment = (segment: string) => /^[0-9a-f]{1,4}$/.test(segment);
  if (!left.every(isValidSegment) || !right.every(isValidSegment)) {
    return false;
  }

  if (pieces.length === 1) {
    return left.length === 8;
  }

  return left.length + right.length < 8;
}

function isValidIp(value: string): boolean {
  return isValidIpv4(value) || isValidIpv6(value);
}

function normalizeIpCandidate(value: string): string | null {
  let candidate = value.trim();
  if (!candidate) {
    return null;
  }

  if (candidate.toLowerCase() === "unknown") {
    return null;
  }

  if (candidate.startsWith('"') && candidate.endsWith('"')) {
    candidate = candidate.slice(1, -1);
  }

  if (candidate.toLowerCase().startsWith("for=")) {
    candidate = candidate.slice(4);
  }

  if (candidate.startsWith("[") && candidate.includes("]")) {
    const closingBracketIndex = candidate.indexOf("]");
    candidate = candidate.slice(1, closingBracketIndex);
  } else if (candidate.includes(".") && candidate.includes(":")) {
    const lastColon = candidate.lastIndexOf(":");
    candidate = candidate.slice(0, lastColon);
  }

  candidate = candidate.trim().replace(/\.$/, "");

  return isValidIp(candidate) ? candidate : null;
}

function normalizeHostValue(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const asUrl = trimmed.includes("://") ? new URL(trimmed) : new URL(`https://${trimmed}`);
    return asUrl.host.toLowerCase().replace(/\.$/, "");
  } catch {
    return null;
  }
}

function fnv1aHash(input: string): string {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(16).padStart(FALLBACK_FINGERPRINT_LENGTH, "0");
}

/**
 * Extracts a normalized client IP from common proxy headers.
 */
export function extractClientIp(request: HeaderCarrier): string | null {
  const directCandidates = [
    request.headers.get("x-real-ip"),
    request.headers.get("cf-connecting-ip"),
  ];

  for (const candidate of directCandidates) {
    const normalized = candidate ? normalizeIpCandidate(candidate) : null;
    if (normalized) {
      return normalized;
    }
  }

  const forwardedCandidates = [
    ...splitHeaderList(request.headers.get("x-vercel-forwarded-for")),
    ...splitHeaderList(request.headers.get("x-forwarded-for")),
  ];

  for (let index = forwardedCandidates.length - 1; index >= 0; index -= 1) {
    const candidate = forwardedCandidates[index];
    if (!candidate) {
      continue;
    }

    const normalized = normalizeIpCandidate(candidate);
    if (normalized) {
      return normalized;
    }
  }

  return null;
}

/**
 * Returns a deterministic actor key for logging/rate limiting.
 */
export function resolveRequestActor(request: HeaderCarrier): string {
  const ip = extractClientIp(request);
  if (ip) {
    return ip;
  }

  const fingerprintSource = [
    request.headers.get("user-agent") ?? "",
    request.headers.get("accept-language") ?? "",
    request.headers.get("host") ?? "",
  ]
    .join("|")
    .slice(0, 512);

  return `anonymous:${fnv1aHash(fingerprintSource)}`;
}

/**
 * Returns canonical host for the current request.
 */
export function getRequestHost(request: HeaderCarrier): string | null {
  const directHost = request.headers.get("host");
  if (directHost) {
    const normalized = normalizeHostValue(directHost);
    if (normalized) {
      return normalized;
    }
  }

  const forwardedHosts = splitHeaderList(request.headers.get("x-forwarded-host"));
  for (const host of forwardedHosts) {
    const normalized = normalizeHostValue(host);
    if (normalized) {
      return normalized;
    }
  }

  return null;
}

/**
 * Parses an Origin header into canonical host form.
 */
export function getOriginHost(originHeader: string | null): string | null {
  if (!originHeader) {
    return null;
  }

  try {
    return new URL(originHeader).host.toLowerCase().replace(/\.$/, "");
  } catch {
    return null;
  }
}

/**
 * Builds the host allowlist used for origin checks.
 */
export function getAllowedRequestHosts(request: HeaderCarrier): Set<string> {
  const hosts = new Set<string>();

  const requestHost = getRequestHost(request);
  if (requestHost) {
    hosts.add(requestHost);
  }

  for (const forwardedHost of splitHeaderList(request.headers.get("x-forwarded-host"))) {
    const normalized = normalizeHostValue(forwardedHost);
    if (normalized) {
      hosts.add(normalized);
    }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (appUrl) {
    try {
      hosts.add(new URL(appUrl).host.toLowerCase().replace(/\.$/, ""));
    } catch {
      // Ignore invalid app URL configuration.
    }
  }

  return hosts;
}
