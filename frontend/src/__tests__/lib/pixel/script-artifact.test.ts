import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";

import {
  PIXEL_SCRIPT_BODY,
  PIXEL_SCRIPT_ETAG,
  PIXEL_SCRIPT_SRI,
  PIXEL_SCRIPT_VERSION,
} from "@/lib/pixel/script-artifact";

describe("pixel script artifact", () => {
  it("publishes an SRI hash that matches the served script body", () => {
    const expectedSri = `sha384-${createHash("sha384")
      .update(PIXEL_SCRIPT_BODY)
      .digest("base64")}`;
    expect(PIXEL_SCRIPT_SRI).toBe(expectedSri);
  });

  it("publishes an ETag derived from the script body hash", () => {
    const digest = createHash("sha256").update(PIXEL_SCRIPT_BODY).digest("hex");
    const expectedEtag = `"pixel-${PIXEL_SCRIPT_VERSION}-${digest.slice(0, 24)}"`;
    expect(PIXEL_SCRIPT_ETAG).toBe(expectedEtag);
  });

  it("keeps runtime fail-silent and self-contained guards in the script output", () => {
    expect(PIXEL_SCRIPT_BODY).toContain("try {");
    expect(PIXEL_SCRIPT_BODY).toContain("pending.catch(noop)");
    expect(PIXEL_SCRIPT_BODY).not.toContain("console.");
  });

  it("sends API keys via request headers rather than query-string params", () => {
    expect(PIXEL_SCRIPT_BODY).toContain("\"X-Rankwell-Key\": config.apiKey");
    expect(PIXEL_SCRIPT_BODY).not.toContain("factsUrl.searchParams.set(\"key\"");
  });
});
