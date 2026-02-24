import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

import { GET as getLlmsTxt } from "@/app/api/employer-facts/download/llms-txt/route";
import { GET as getMarkdown } from "@/app/api/employer-facts/download/markdown/route";
import { GET as getSchema } from "@/app/api/employer-facts/download/schema/route";

const createClientMock = vi.fn();
const generateAEOContentMock = vi.fn();
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

describe("/api/employer-facts/download/*", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    fromMock.mockImplementation(() => makeQueryBuilder());

    createClientMock.mockResolvedValue({
      from: (...args: unknown[]) => fromMock(...args),
    });

    singleMock.mockResolvedValue({
      data: {
        company_slug: "acme",
        company_name: "Acme",
        published: true,
      },
      error: null,
    });

    generateAEOContentMock.mockReturnValue({
      llmsTxt: "# Acme",
      markdownPage: "# Acme Facts",
      schemaJsonLd: { "@type": "Organization", name: "Acme" },
      factPageHtml: "<p>Acme</p>",
    });
  });

  it("returns 400 when slug is missing", async () => {
    const request = new NextRequest(
      "https://openrole.test/api/employer-facts/download/llms-txt"
    );

    const response = await getLlmsTxt(request);
    expect(response.status).toBe(400);
  });

  it("returns 404 when published facts are missing", async () => {
    singleMock.mockResolvedValueOnce({ data: null, error: { code: "PGRST116" } });

    const request = new NextRequest(
      "https://openrole.test/api/employer-facts/download/schema?slug=acme"
    );

    const response = await getSchema(request);
    expect(response.status).toBe(404);
  });

  it("sanitizes Content-Disposition filenames for hostile slugs", async () => {
    const slug = encodeURIComponent('acme"\r\nfilename=pwned');

    const [llmsResponse, markdownResponse, schemaResponse] = await Promise.all([
      getLlmsTxt(
        new NextRequest(
          `https://openrole.test/api/employer-facts/download/llms-txt?slug=${slug}`
        )
      ),
      getMarkdown(
        new NextRequest(
          `https://openrole.test/api/employer-facts/download/markdown?slug=${slug}`
        )
      ),
      getSchema(
        new NextRequest(
          `https://openrole.test/api/employer-facts/download/schema?slug=${slug}`
        )
      ),
    ]);

    expect(llmsResponse.status).toBe(200);
    expect(markdownResponse.status).toBe(200);
    expect(schemaResponse.status).toBe(200);

    const llmsDisposition = llmsResponse.headers.get("Content-Disposition") ?? "";
    const markdownDisposition =
      markdownResponse.headers.get("Content-Disposition") ?? "";
    const schemaDisposition =
      schemaResponse.headers.get("Content-Disposition") ?? "";

    expect(llmsDisposition).toBe(
      'attachment; filename="acme-filename-pwned-llms.txt"'
    );
    expect(markdownDisposition).toBe(
      'attachment; filename="acme-filename-pwned-facts.md"'
    );
    expect(schemaDisposition).toBe(
      'attachment; filename="acme-filename-pwned-schema.jsonld"'
    );

    for (const header of [
      llmsDisposition,
      markdownDisposition,
      schemaDisposition,
    ]) {
      expect(header).not.toContain("\r");
      expect(header).not.toContain("\n");
    }
  });
});
