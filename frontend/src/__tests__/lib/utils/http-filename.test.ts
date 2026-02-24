import { describe, expect, it } from "vitest";

import {
  toAttachmentDisposition,
  toSafeFilenameSegment,
} from "@/lib/utils/http-filename";

describe("toSafeFilenameSegment", () => {
  it("keeps expected slug characters", () => {
    expect(toSafeFilenameSegment("acme-holdings_2026.v2")).toBe(
      "acme-holdings_2026.v2"
    );
  });

  it("strips control characters and punctuation used for header injection", () => {
    const unsafe = "\r\nacme\"; filename=\"pwned\n";
    expect(toSafeFilenameSegment(unsafe, "fallback")).toBe("acme-filename-pwned");
  });

  it("falls back when nothing safe remains", () => {
    expect(toSafeFilenameSegment("\r\n\t", "facts")).toBe("facts");
  });
});

describe("toAttachmentDisposition", () => {
  it("returns a quoted attachment header", () => {
    expect(toAttachmentDisposition("acme-llms.txt")).toBe(
      'attachment; filename="acme-llms.txt"'
    );
  });
});
