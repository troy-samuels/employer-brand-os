/**
 * @module app/api/pdf/briefing/[slug]/route
 * GET endpoint that generates and returns the "AI Employer Brand Briefing" PDF
 * for a given company slug. No auth required — this is a public download.
 *
 * Usage: GET /api/pdf/briefing/acme-corp → downloads acme-corp-ai-briefing.pdf
 */

import { NextRequest, NextResponse } from "next/server";

import { generateBriefingPDF } from "@/lib/pdf/generate-briefing";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { slug } = await params;

  if (!slug || typeof slug !== "string") {
    return NextResponse.json(
      { error: "Missing company slug" },
      { status: 400 }
    );
  }

  try {
    const result = await generateBriefingPDF(slug);

    if (!result) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    const { buffer, companyName } = result;

    // Sanitise company name for filename
    const safeFilename = companyName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeFilename}-ai-briefing.pdf"`,
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
        "Content-Length": String(buffer.length),
      },
    });
  } catch (error) {
    console.error("[pdf/briefing] Generation failed:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
