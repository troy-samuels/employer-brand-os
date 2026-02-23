/**
 * @module app/api/nominate/route
 * API endpoint for "Nominate a Company" feature.
 * Stores nominations in Supabase for later batch auditing.
 *
 * SECURITY: CSRF validation, rate limiting (10/hour per IP), Zod input validation.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { resolveRequestActor } from "@/lib/security/request-metadata";
import { untypedTable } from "@/lib/supabase/untyped-table";
import { validateCsrf } from "@/lib/utils/csrf";
import { RateLimiter } from "@/lib/utils/rate-limiter";

export const runtime = "nodejs";

const NOMINATE_RATE_LIMIT = 10;
const NOMINATE_RATE_WINDOW_SECONDS = 3600;

const rateLimiter = new RateLimiter();

const nominationSchema = z.object({
  domain: z
    .string()
    .trim()
    .min(1, "Company domain is required")
    .max(253, "Domain is too long")
    .transform((d) =>
      d
        .toLowerCase()
        .replace(/^https?:\/\//, "")
        .replace(/^www\./, "")
        .replace(/\/.*$/, "")
        .trim()
    )
    .refine((d) => d.includes(".") && /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z]{2,})+$/.test(d), {
      message: "Please enter a valid domain (e.g. monzo.com)",
    }),
  nominatorEmail: z
    .string()
    .email("Invalid email address")
    .max(320, "Email is too long")
    .optional()
    .nullable()
    .or(z.literal("")),
});

export async function POST(request: NextRequest) {
  // CSRF validation
  if (!validateCsrf(request)) {
    return NextResponse.json(
      { error: "Invalid request origin" },
      { status: 403 }
    );
  }

  // Rate limiting
  const actor = resolveRequestActor(request);
  const allowed = await rateLimiter.check(
    actor,
    "nominate",
    NOMINATE_RATE_LIMIT,
    NOMINATE_RATE_WINDOW_SECONDS
  );

  if (!allowed) {
    return NextResponse.json(
      { error: "Too many nominations. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const parsed = nominationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { domain: cleanDomain, nominatorEmail } = parsed.data;

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
