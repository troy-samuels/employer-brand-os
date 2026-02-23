import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";

import { validateCsrf } from "@/lib/utils/csrf";

function createRequest(headers: Record<string, string>): NextRequest {
  return new NextRequest("https://openrole.co.uk/api/test", {
    method: "POST",
    headers,
  });
}

describe("validateCsrf", () => {
  it("allows same-origin origin header", () => {
    const request = createRequest({
      host: "openrole.co.uk",
      origin: "https://openrole.co.uk",
    });

    expect(validateCsrf(request)).toBe(true);
  });

  it("allows configured app URL host as fallback", () => {
    const original = process.env.NEXT_PUBLIC_APP_URL;
    process.env.NEXT_PUBLIC_APP_URL = "https://app.openrole.co.uk";

    const request = createRequest({
      host: "internal-vercel-host",
      origin: "https://app.openrole.co.uk",
    });

    expect(validateCsrf(request)).toBe(true);

    if (original === undefined) {
      delete process.env.NEXT_PUBLIC_APP_URL;
    } else {
      process.env.NEXT_PUBLIC_APP_URL = original;
    }
  });

  it("allows forwarded host when deployed behind proxy", () => {
    const request = createRequest({
      host: "internal-vercel-host",
      "x-forwarded-host": "openrole.co.uk",
      origin: "https://openrole.co.uk",
    });

    expect(validateCsrf(request)).toBe(true);
  });

  it("rejects cross-origin host mismatch", () => {
    const request = createRequest({
      host: "openrole.co.uk",
      origin: "https://evil.example",
    });

    expect(validateCsrf(request)).toBe(false);
  });

  it("rejects missing origin unless fetch metadata is same-origin", () => {
    const trustedRequest = createRequest({
      host: "openrole.co.uk",
      "sec-fetch-site": "same-origin",
    });
    const untrustedRequest = createRequest({
      host: "openrole.co.uk",
      "sec-fetch-site": "cross-site",
    });

    expect(validateCsrf(trustedRequest)).toBe(true);
    expect(validateCsrf(untrustedRequest)).toBe(false);
  });

  it("rejects malformed origin value", () => {
    const request = createRequest({
      host: "openrole.co.uk",
      origin: "not-a-url",
    });

    expect(validateCsrf(request)).toBe(false);
  });
});
