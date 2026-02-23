import { describe, expect, it } from "vitest";

import { serializeJsonForHtml } from "@/lib/utils/safe-json";

describe("serializeJsonForHtml", () => {
  it("escapes script-breaking characters", () => {
    const serialized = serializeJsonForHtml({
      payload: "</script><script>alert(1)</script>&",
    });

    expect(serialized).toContain("\\u003c/script\\u003e");
    expect(serialized).toContain("\\u0026");
    expect(serialized).not.toContain("</script>");
  });

  it("returns a valid fallback for undefined", () => {
    expect(serializeJsonForHtml(undefined)).toBe("null");
  });
});
