import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

import { GET, POST } from "@/app/api/employer-facts/generate/route";

const createClientMock = vi.fn();
const generateAEOContentMock = vi.fn();
const getUserMock = vi.fn();
const fromMock = vi.fn();
const singleMock = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: (...args: unknown[]) => createClientMock(...args),
}));

vi.mock("@/lib/aeo/generate", () => ({
  generateAEOContent: (...args: unknown[]) => generateAEOContentMock(...args),
}));

function makeQueryBuilder() {
  const queryBuilder = {
    select: vi.fn(() => queryBuilder),
    eq: vi.fn(() => queryBuilder),
    single: (...args: unknown[]) => singleMock(...args),
  };

  return queryBuilder;
}

describe("/api/employer-facts/generate", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    getUserMock.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });

    fromMock.mockImplementation(() => makeQueryBuilder());

    createClientMock.mockResolvedValue({
      auth: {
        getUser: (...args: unknown[]) => getUserMock(...args),
      },
      from: (...args: unknown[]) => fromMock(...args),
    });

    singleMock.mockResolvedValue({
      data: {
        company_slug: "acme",
        company_name: "Acme",
        published: true,
        updated_at: "2026-02-24T00:00:00.000Z",
      },
      error: null,
    });

    generateAEOContentMock.mockReturnValue({
      llmsTxt: "# Acme",
      schemaJsonLd: { "@type": "Organization", name: "Acme" },
      markdownPage: "# Acme Facts",
      factPageHtml: "<p>Acme</p>",
    });
  });

  it("returns 400 for GET requests missing slug", async () => {
    const request = new NextRequest(
      "https://openrole.test/api/employer-facts/generate"
    );

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toContain("slug");
  });

  it("returns generated payload for published company facts", async () => {
    const request = new NextRequest(
      "https://openrole.test/api/employer-facts/generate?slug=acme"
    );

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.meta.company_slug).toBe("acme");
    expect(body.data.llmsTxt).toBe("# Acme");
    expect(generateAEOContentMock).toHaveBeenCalledTimes(1);
  });

  it("stays consistent under burst GET traffic", async () => {
    const burstSize = 120;

    const responses = await Promise.all(
      Array.from({ length: burstSize }, () =>
        GET(
          new NextRequest(
            "https://openrole.test/api/employer-facts/generate?slug=acme"
          )
        )
      )
    );

    expect(responses.every((response) => response.status === 200)).toBe(true);

    const payloads = await Promise.all(
      responses.map(async (response) => JSON.stringify(await response.json()))
    );

    expect(new Set(payloads).size).toBe(1);
  });

  it("returns 401 for POST when not authenticated", async () => {
    getUserMock.mockResolvedValueOnce({
      data: { user: null },
      error: null,
    });

    const request = new NextRequest(
      "https://openrole.test/api/employer-facts/generate",
      {
        method: "POST",
        body: JSON.stringify({ company_slug: "acme" }),
        headers: {
          "content-type": "application/json",
        },
      }
    );

    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  it("returns 200 for authenticated POST generation", async () => {
    const request = new NextRequest(
      "https://openrole.test/api/employer-facts/generate",
      {
        method: "POST",
        body: JSON.stringify({ company_slug: "acme" }),
        headers: {
          "content-type": "application/json",
        },
      }
    );

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.meta.company_name).toBe("Acme");
  });
});
