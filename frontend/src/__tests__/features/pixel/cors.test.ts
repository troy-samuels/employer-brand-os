import { describe, expect, it } from "vitest";

import { buildPreflightResponse } from "@/features/pixel/lib/cors";

describe("buildPreflightResponse", () => {
  it("allows exact host matches across http/https and www variants", () => {
    const response = buildPreflightResponse("https://www.example.com", [
      "http://example.com",
    ]);

    expect(response.status).toBe(204);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe(
      "https://www.example.com"
    );
    expect(response.headers.get("Vary")).toContain("Origin");
  });

  it("allows wildcard subdomains", () => {
    const response = buildPreflightResponse("https://jobs.us.example.com", [
      "*.example.com",
    ]);

    expect(response.status).toBe(204);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe(
      "https://jobs.us.example.com"
    );
  });

  it("returns 403 when origin is outside allowlist", () => {
    const response = buildPreflightResponse("https://evil.example.net", [
      "example.com",
    ]);

    expect(response.status).toBe(403);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBeNull();
  });

  it("keeps permissive preflight behavior when no allowlist is provided", () => {
    const response = buildPreflightResponse("https://any.customer.site");
    expect(response.status).toBe(204);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe(
      "https://any.customer.site"
    );
  });
});
