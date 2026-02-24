import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

import { GET } from "@/app/api/pixel/v1/script/route";
import {
  PIXEL_SCRIPT_BODY,
  PIXEL_SCRIPT_ETAG,
  PIXEL_SCRIPT_SRI,
  PIXEL_SCRIPT_VERSION,
} from "@/lib/pixel/script-artifact";

const logPixelLoadMock = vi.fn();

vi.mock("@/lib/audit/audit-logger", () => ({
  logPixelLoad: (...args: unknown[]) => logPixelLoadMock(...args),
}));

vi.mock("@/lib/pixel/health", () => ({
  markPixelServiceRequest: vi.fn(),
}));

vi.mock("@/lib/security/request-metadata", () => ({
  resolveRequestActor: vi.fn(() => ({
    ip: "203.0.113.10",
    userAgent: "vitest",
  })),
}));

describe("GET /api/pixel/v1/script", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    logPixelLoadMock.mockResolvedValue(undefined);
  });

  it("serves the immutable script with expected security headers", async () => {
    const request = new NextRequest("https://openrole.test/api/pixel/v1/script");

    const response = await GET(request);
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain(
      "application/javascript"
    );
    expect(response.headers.get("Cache-Control")).toContain("immutable");
    expect(response.headers.get("ETag")).toBe(PIXEL_SCRIPT_ETAG);
    expect(response.headers.get("X-OpenRole-SRI")).toBe(PIXEL_SCRIPT_SRI);
    expect(response.headers.get("X-OpenRole-Script-Version")).toBe(
      PIXEL_SCRIPT_VERSION
    );
    expect(body).toBe(PIXEL_SCRIPT_BODY);
    expect(logPixelLoadMock).toHaveBeenCalledTimes(1);
  });

  it("returns 304 when If-None-Match matches the current script etag", async () => {
    const request = new NextRequest("https://openrole.test/api/pixel/v1/script", {
      headers: {
        "if-none-match": PIXEL_SCRIPT_ETAG,
      },
    });

    const response = await GET(request);

    expect(response.status).toBe(304);
    expect(await response.text()).toBe("");
    expect(logPixelLoadMock).not.toHaveBeenCalled();
  });

  it("stays consistent under burst traffic", async () => {
    const burstSize = 250;

    const responses = await Promise.all(
      Array.from({ length: burstSize }, (_, index) =>
        GET(
          new NextRequest(
            `https://openrole.test/api/pixel/v1/script?cachebust=${index}`,
            {
              headers: {
                "user-agent": `stress-${index}`,
              },
            }
          )
        )
      )
    );

    expect(responses.every((response) => response.status === 200)).toBe(true);
    expect(
      responses.every(
        (response) => response.headers.get("ETag") === PIXEL_SCRIPT_ETAG
      )
    ).toBe(true);

    const bodies = await Promise.all(responses.map((response) => response.text()));
    expect(new Set(bodies).size).toBe(1);
    expect(bodies[0]).toBe(PIXEL_SCRIPT_BODY);
    expect(logPixelLoadMock).toHaveBeenCalledTimes(burstSize);
  });
});
