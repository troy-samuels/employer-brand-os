import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import {
  createRequestSignature,
  verifyPixelRequestSignature,
} from "@/lib/pixel/request-signing";

function createSignedRequest(input: {
  url: string;
  secret: string;
  timestamp: string;
  nonce: string;
  method?: string;
  body?: string;
}): NextRequest {
  const method = input.method ?? "GET";
  const body = input.body ?? "";
  const parsed = new URL(input.url);
  const pathWithQuery = parsed.search
    ? `${parsed.pathname}${parsed.search}`
    : parsed.pathname;

  const signature = createRequestSignature({
    secret: input.secret,
    method,
    pathWithQuery,
    timestamp: input.timestamp,
    nonce: input.nonce,
    body,
  });

  return new NextRequest(input.url, {
    method,
    headers: {
      "X-OpenRole-Timestamp": input.timestamp,
      "X-OpenRole-Nonce": input.nonce,
      "X-OpenRole-Signature": signature,
    },
  });
}

describe("verifyPixelRequestSignature", () => {
  it("accepts valid signatures within the default 5-minute window", () => {
    const request = createSignedRequest({
      url: "https://openrole.test/api/pixel/v1/facts?key=bos_live_valid123456",
      secret: "bos_live_valid123456",
      timestamp: "1000",
      nonce: "nonce-valid-window",
    });

    const result = verifyPixelRequestSignature(request, "bos_live_valid123456", {
      nowSeconds: 1250,
    });

    expect(result.ok).toBe(true);
  });

  it("rejects requests outside the allowed timestamp window", () => {
    const request = createSignedRequest({
      url: "https://openrole.test/api/pixel/v1/facts?key=bos_live_old123456",
      secret: "bos_live_old123456",
      timestamp: "1000",
      nonce: "nonce-old-window",
    });

    const result = verifyPixelRequestSignature(request, "bos_live_old123456", {
      nowSeconds: 1401,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("invalid_timestamp");
    }
  });

  it("detects replay attacks for duplicate nonce values", () => {
    const request = createSignedRequest({
      url: "https://openrole.test/api/pixel/v1/facts?key=bos_live_replay123456",
      secret: "bos_live_replay123456",
      timestamp: "2000",
      nonce: "nonce-replay",
    });

    const first = verifyPixelRequestSignature(request, "bos_live_replay123456", {
      nowSeconds: 2000,
      allowedDriftSeconds: 60,
    });
    const second = verifyPixelRequestSignature(
      request,
      "bos_live_replay123456",
      {
        nowSeconds: 2000,
        allowedDriftSeconds: 60,
      }
    );

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(false);
    if (!second.ok) {
      expect(second.error).toBe("replay_detected");
    }
  });

  it("allows nonce reuse after expiry cleanup", () => {
    const firstRequest = createSignedRequest({
      url: "https://openrole.test/api/pixel/v1/facts?key=bos_live_cleanup123456",
      secret: "bos_live_cleanup123456",
      timestamp: "3000",
      nonce: "nonce-cleanup",
    });
    const secondRequest = createSignedRequest({
      url: "https://openrole.test/api/pixel/v1/facts?key=bos_live_cleanup123456",
      secret: "bos_live_cleanup123456",
      timestamp: "3006",
      nonce: "nonce-cleanup",
    });

    const first = verifyPixelRequestSignature(
      firstRequest,
      "bos_live_cleanup123456",
      {
        nowSeconds: 3000,
        allowedDriftSeconds: 5,
      }
    );
    const second = verifyPixelRequestSignature(
      secondRequest,
      "bos_live_cleanup123456",
      {
        nowSeconds: 3006,
        allowedDriftSeconds: 5,
      }
    );

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);
  });

  it("supports nonce store trimming while preserving replay checks for recent requests", () => {
    const secret = "bos_live_trim123456";

    for (let index = 0; index < 20; index += 1) {
      const request = createSignedRequest({
        url: "https://openrole.test/api/pixel/v1/facts?key=bos_live_trim123456",
        secret,
        timestamp: "4000",
        nonce: `nonce-trim-${index}`,
      });

      const result = verifyPixelRequestSignature(request, secret, {
        nowSeconds: 4000,
        allowedDriftSeconds: 120,
        maxNonceEntries: 5,
      });

      expect(result.ok).toBe(true);
    }

    const replayLatest = createSignedRequest({
      url: "https://openrole.test/api/pixel/v1/facts?key=bos_live_trim123456",
      secret,
      timestamp: "4000",
      nonce: "nonce-trim-19",
    });
    const replayResult = verifyPixelRequestSignature(replayLatest, secret, {
      nowSeconds: 4000,
      allowedDriftSeconds: 120,
      maxNonceEntries: 5,
    });

    expect(replayResult.ok).toBe(false);
    if (!replayResult.ok) {
      expect(replayResult.error).toBe("replay_detected");
    }
  });

  it("handles high-volume signed traffic with replay guarantees", () => {
    const secret = "bos_live_burst123456";
    const nowSeconds = 5000;
    const requestCount = 2000;

    for (let index = 0; index < requestCount; index += 1) {
      const request = createSignedRequest({
        url: "https://openrole.test/api/pixel/v1/facts?key=bos_live_burst123456",
        secret,
        timestamp: String(nowSeconds),
        nonce: `nonce-burst-${index}`,
      });

      const result = verifyPixelRequestSignature(request, secret, {
        nowSeconds,
        allowedDriftSeconds: 120,
        maxNonceEntries: requestCount + 10,
      });

      expect(result.ok).toBe(true);
    }

    const replay = createSignedRequest({
      url: "https://openrole.test/api/pixel/v1/facts?key=bos_live_burst123456",
      secret,
      timestamp: String(nowSeconds),
      nonce: "nonce-burst-1999",
    });

    const replayResult = verifyPixelRequestSignature(replay, secret, {
      nowSeconds,
      allowedDriftSeconds: 120,
      maxNonceEntries: requestCount + 10,
    });

    expect(replayResult.ok).toBe(false);
    if (!replayResult.ok) {
      expect(replayResult.error).toBe("replay_detected");
    }
  });
});
