/**
 * @module lib/pixel/request-signing
 * Module implementation for request-signing.ts.
 */

import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

const SIGNATURE_HEADER = "x-openrole-signature";
const TIMESTAMP_HEADER = "x-openrole-timestamp";
const NONCE_HEADER = "x-openrole-nonce";
const DEFAULT_ALLOWED_DRIFT_SECONDS = 300;
const DEFAULT_MAX_NONCE_STORE_ENTRIES = 10000;

const nonceStore = new Map<string, number>();

type SignatureVerificationResult =
  | { ok: true }
  | {
      ok: false;
      status: number;
      error: "missing_headers" | "invalid_timestamp" | "signature_mismatch" | "replay_detected";
      message: string;
    };

type BuildPayloadInput = {
  method: string;
  pathWithQuery: string;
  timestamp: string;
  nonce: string;
  body?: string;
};

function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);

  if (left.length !== right.length) {
    return false;
  }

  try {
    return timingSafeEqual(left, right);
  } catch {
    return false;
  }
}

function cleanupNonceStore(nowSeconds: number): void {
  for (const [nonceKey, expiresAt] of nonceStore.entries()) {
    if (expiresAt <= nowSeconds) {
      nonceStore.delete(nonceKey);
    }
  }
}

function trimNonceStore(maxEntries: number): void {
  if (nonceStore.size <= maxEntries) {
    return;
  }

  const entriesByExpiry = Array.from(nonceStore.entries()).sort(
    (left, right) => left[1] - right[1]
  );
  const entriesToDelete = nonceStore.size - maxEntries;

  for (let index = 0; index < entriesToDelete; index += 1) {
    const entry = entriesByExpiry[index];
    if (!entry) {
      break;
    }
    nonceStore.delete(entry[0]);
  }
}

function nonceCacheKey(secret: string, nonce: string): string {
  const secretHash = createHash("sha256").update(secret).digest("hex");
  return `${secretHash}:${nonce}`;
}

/**
 * Executes buildSigningPayload.
 * @param input - input input.
 * @returns The resulting value.
 */
export function buildSigningPayload(input: BuildPayloadInput): string {
  const bodyHash = sha256(input.body ?? "");

  return [
    input.method.toUpperCase(),
    input.pathWithQuery,
    input.timestamp,
    input.nonce,
    bodyHash,
  ].join("\n");
}

/**
 * Executes createRequestSignature.
 * @param input - input input.
 * @returns The resulting value.
 */
export function createRequestSignature(input: BuildPayloadInput & { secret: string }): string {
  const payload = buildSigningPayload(input);
  return createHmac("sha256", input.secret).update(payload).digest("base64");
}

/**
 * Executes verifyPixelRequestSignature.
 * @param request - request input.
 * @param secret - secret input.
 * @param options - options input.
 * @returns The resulting value.
 */
export function verifyPixelRequestSignature(
  request: NextRequest,
  secret: string,
  options?: {
    body?: string;
    nowSeconds?: number;
    allowedDriftSeconds?: number;
    maxNonceEntries?: number;
  }
): SignatureVerificationResult {
  const signature = request.headers.get(SIGNATURE_HEADER);
  const timestamp = request.headers.get(TIMESTAMP_HEADER);
  const nonce = request.headers.get(NONCE_HEADER);

  if (!signature || !timestamp || !nonce) {
    return {
      ok: false,
      status: 401,
      error: "missing_headers",
      message: "Missing signature headers",
    };
  }

  const parsedTimestamp = Number(timestamp);
  if (!Number.isFinite(parsedTimestamp) || !Number.isInteger(parsedTimestamp)) {
    return {
      ok: false,
      status: 401,
      error: "invalid_timestamp",
      message: "Invalid signature timestamp",
    };
  }

  const nowSeconds = options?.nowSeconds ?? Math.floor(Date.now() / 1000);
  const allowedDriftSeconds = options?.allowedDriftSeconds ?? DEFAULT_ALLOWED_DRIFT_SECONDS;
  const maxNonceEntries = options?.maxNonceEntries ?? DEFAULT_MAX_NONCE_STORE_ENTRIES;
  if (Math.abs(nowSeconds - parsedTimestamp) > allowedDriftSeconds) {
    return {
      ok: false,
      status: 401,
      error: "invalid_timestamp",
      message: "Signature timestamp outside allowed window",
    };
  }

  cleanupNonceStore(nowSeconds);

  const replayKey = nonceCacheKey(secret, nonce);
  if (nonceStore.has(replayKey)) {
    return {
      ok: false,
      status: 409,
      error: "replay_detected",
      message: "Replay attack detected",
    };
  }

  const url = new URL(request.url);
  const query = url.searchParams.toString();
  const pathWithQuery = query ? `${url.pathname}?${query}` : url.pathname;

  const expectedSignature = createRequestSignature({
    secret,
    method: request.method,
    pathWithQuery,
    timestamp,
    nonce,
    body: options?.body ?? "",
  });

  if (!safeEqual(signature, expectedSignature)) {
    return {
      ok: false,
      status: 401,
      error: "signature_mismatch",
      message: "Invalid request signature",
    };
  }

  trimNonceStore(Math.max(1, maxNonceEntries - 1));
  nonceStore.set(replayKey, nowSeconds + allowedDriftSeconds);
  return { ok: true };
}

/**
 * Exposes exported value(s): pixelSignatureHeaders.
 */
export const pixelSignatureHeaders = {
  signature: SIGNATURE_HEADER,
  timestamp: TIMESTAMP_HEADER,
  nonce: NONCE_HEADER,
};
