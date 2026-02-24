import { describe, expect, it, vi } from "vitest";

import { GET } from "@/app/api/pixel/v1/integrity/route";
import {
  PIXEL_SCRIPT_ETAG,
  PIXEL_SCRIPT_SRI,
  PIXEL_SCRIPT_VERSION,
} from "@/lib/pixel/script-artifact";

vi.mock("@/lib/pixel/health", () => ({
  markPixelServiceRequest: vi.fn(),
}));

describe("GET /api/pixel/v1/integrity", () => {
  it("returns the expected metadata payload", async () => {
    const response = await GET(new Request("https://openrole.test/api/pixel/v1/integrity"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.algorithm).toBe("sha384");
    expect(body.sri).toBe(PIXEL_SCRIPT_SRI);
    expect(body.etag).toBe(PIXEL_SCRIPT_ETAG);
    expect(body.version).toBe(PIXEL_SCRIPT_VERSION);
    expect(response.headers.get("ETag")).toBe(PIXEL_SCRIPT_ETAG);
  });

  it("stays stable under burst reads", async () => {
    const burstSize = 300;
    const responses = await Promise.all(
      Array.from({ length: burstSize }, () =>
        GET(new Request("https://openrole.test/api/pixel/v1/integrity"))
      )
    );

    expect(responses.every((response) => response.status === 200)).toBe(true);

    const payloads = await Promise.all(
      responses.map(async (response) => JSON.stringify(await response.json()))
    );

    expect(new Set(payloads).size).toBe(1);
  });
});
