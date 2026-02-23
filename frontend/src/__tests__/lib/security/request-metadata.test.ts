import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

import {
  extractClientIp,
  getAllowedRequestHosts,
  getOriginHost,
  getRequestHost,
  resolveRequestActor,
} from "@/lib/security/request-metadata";

describe("request metadata helpers", () => {
  const originalAppUrl = process.env.NEXT_PUBLIC_APP_URL;

  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_APP_URL;
  });

  afterEach(() => {
    if (originalAppUrl === undefined) {
      delete process.env.NEXT_PUBLIC_APP_URL;
    } else {
      process.env.NEXT_PUBLIC_APP_URL = originalAppUrl;
    }
  });

  it("prefers x-real-ip when available", () => {
    const request = new NextRequest("http://localhost:3000", {
      headers: {
        "x-real-ip": "203.0.113.5",
        "x-forwarded-for": "198.51.100.1, 198.51.100.2",
      },
    });

    expect(extractClientIp(request)).toBe("203.0.113.5");
  });

  it("uses the trusted end of forwarded chain and strips ipv4 ports", () => {
    const request = new NextRequest("http://localhost:3000", {
      headers: {
        "x-forwarded-for": "10.0.0.2, 198.51.100.4:443",
      },
    });

    expect(extractClientIp(request)).toBe("198.51.100.4");
  });

  it("returns null when headers do not contain a valid IP", () => {
    const request = new NextRequest("http://localhost:3000", {
      headers: {
        "x-forwarded-for": "unknown, garbage",
      },
    });

    expect(extractClientIp(request)).toBeNull();
  });

  it("creates deterministic anonymous actor when no IP is available", () => {
    const request = new NextRequest("http://localhost:3000", {
      headers: {
        "user-agent": "unit-test-agent",
        host: "localhost:3000",
      },
    });

    const actorA = resolveRequestActor(request);
    const actorB = resolveRequestActor(request);

    expect(actorA).toMatch(/^anonymous:[0-9a-f]{8}$/);
    expect(actorA).toBe(actorB);
  });

  it("normalizes request host and origin host", () => {
    const request = new NextRequest("http://localhost:3000", {
      headers: {
        host: "LOCALHOST:3000",
      },
    });

    expect(getRequestHost(request)).toBe("localhost:3000");
    expect(getOriginHost("http://LOCALHOST:3000/path")).toBe("localhost:3000");
  });

  it("includes configured app host in allowed host set", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://app.openrole.co.uk";
    const request = new NextRequest("http://localhost:3000", {
      headers: {
        host: "localhost:3000",
      },
    });

    const hosts = getAllowedRequestHosts(request);
    expect(hosts.has("localhost:3000")).toBe(true);
    expect(hosts.has("app.openrole.co.uk")).toBe(true);
  });
});
