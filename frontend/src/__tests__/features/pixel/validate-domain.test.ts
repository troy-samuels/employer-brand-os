import { describe, expect, it } from "vitest";

import {
  isValidDomainPattern,
  validateDomain,
} from "@/features/pixel/lib/validate-domain";

describe("validateDomain", () => {
  it("allows exact domains with protocol, path and port variations", () => {
    const result = validateDomain(
      "https://www.example.com:443/careers",
      null,
      ["example.com"]
    );

    expect(result.valid).toBe(true);
  });

  it("allows wildcard subdomains and base domain", () => {
    expect(
      validateDomain("https://jobs.eu.example.com", null, ["*.example.com"]).valid
    ).toBe(true);
    expect(
      validateDomain("https://example.com", null, ["*.example.com"]).valid
    ).toBe(true);
  });

  it("rejects suffix and lookalike attacks", () => {
    expect(
      validateDomain("https://example.com.evil.org", null, ["example.com"]).valid
    ).toBe(false);
    expect(
      validateDomain("https://evil-example.com", null, ["example.com"]).valid
    ).toBe(false);
    expect(
      validateDomain("https://nottrusted.io", null, ["*.trusted.io"]).valid
    ).toBe(false);
  });

  it("uses referer fallback when origin is missing", () => {
    const result = validateDomain(null, "https://careers.example.com/jobs", [
      "*.example.com",
    ]);

    expect(result.valid).toBe(true);
  });

  it("is resilient under hostile origin fuzzing", () => {
    const allowed = ["example.com", "*.trusted.io", "portal.company.co.uk"];

    for (let index = 0; index < 1500; index += 1) {
      const origin = `https://evil-${index}.example.com.evil.net`;
      const result = validateDomain(origin, null, allowed);
      expect(result.valid).toBe(false);
    }
  });
});

describe("isValidDomainPattern", () => {
  it("accepts valid wildcard and exact domains", () => {
    expect(isValidDomainPattern("example.com")).toBe(true);
    expect(isValidDomainPattern("*.example.com")).toBe(true);
    expect(isValidDomainPattern("api.uk.example.co.uk")).toBe(true);
  });

  it("rejects malformed domain patterns", () => {
    expect(isValidDomainPattern("https://example.com")).toBe(false);
    expect(isValidDomainPattern("example..com")).toBe(false);
    expect(isValidDomainPattern("*.")).toBe(false);
  });
});
