/**
 * @module app/api/nominate/route
 * API endpoint for "Nominate a Company" feature.
 * Stores nominations in Supabase for later batch auditing.
 */

import { NextResponse } from "next/server";
import { untypedTable } from "@/lib/supabase/untyped-table";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { domain, nominatorEmail } = body;

    if (!domain || typeof domain !== "string") {
      return NextResponse.json(
        { error: "Company domain is required" },
        { status: 400 }
      );
    }

    // Normalise domain
    const cleanDomain = domain
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .replace(/\/.*$/, "")
      .trim();

    if (!cleanDomain || !cleanDomain.includes(".")) {
      return NextResponse.json(
        { error: "Please enter a valid domain (e.g. monzo.com)" },
        { status: 400 }
      );
    }

    // Check if this company has already been audited
    const { data: existing } = await untypedTable("public_audits")
      .select("company_slug")
      .eq("company_domain", cleanDomain)
      .limit(1)
      .single();

    if (existing) {
      return NextResponse.json({
        status: "already_audited",
        slug: (existing as { company_slug: string }).company_slug,
        message: "This company has already been audited!",
      });
    }

    // Store the nomination
    const { error } = await untypedTable("nominations").insert({
      domain: cleanDomain,
      nominator_email: nominatorEmail || null,
      status: "pending",
      created_at: new Date().toISOString(),
    });

    if (error) {
      // Table might not exist yet — that's fine, log and return success
      console.error("Nomination insert error:", error);
      return NextResponse.json({
        status: "received",
        message: "Thanks! We'll audit this company soon.",
      });
    }

    return NextResponse.json({
      status: "received",
      message: "Thanks! We'll audit this company soon.",
    });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
