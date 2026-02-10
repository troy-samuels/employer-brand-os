import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { logAuditRequest } from "@/lib/audit/audit-logger";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { validateCsrf } from "@/lib/utils/csrf";

const CONSUMER_DOMAINS = new Set([
  "gmail.com",
  "hotmail.com",
  "outlook.com",
  "yahoo.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "aol.com",
  "protonmail.com",
  "googlemail.com",
  "hotmail.co.uk",
  "yahoo.co.uk",
  "live.com",
]);

const leadSchema = z.object({
  email: z.email(),
  companySlug: z.string().optional(),
  score: z.number().int().optional(),
});

export async function POST(request: NextRequest) {
  const actor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  // CSRF check
  if (!validateCsrf(request)) {
    void logAuditRequest({
      actor,
      result: "denied",
      resource: "api.audit.leads",
      metadata: { reason: "csrf_failed" },
    });
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    void logAuditRequest({
      actor,
      result: "failure",
      resource: "api.audit.leads",
      metadata: { reason: "invalid_json" },
    });
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    void logAuditRequest({
      actor,
      result: "failure",
      resource: "api.audit.leads",
      metadata: { reason: "schema_validation_failed" },
    });
    return NextResponse.json(
      { error: "Please enter a valid email address" },
      { status: 400 }
    );
  }

  const { email, companySlug, score } = parsed.data;
  const emailDomain = email.split("@")[1]?.toLowerCase();

  if (!emailDomain || CONSUMER_DOMAINS.has(emailDomain)) {
    void logAuditRequest({
      actor,
      result: "failure",
      resource: "api.audit.leads",
      metadata: {
        reason: "consumer_email_domain",
        email_domain: emailDomain ?? null,
      },
    });
    return NextResponse.json(
      { error: "Please use your work email address" },
      { status: 400 }
    );
  }

  // Insert into Supabase — gracefully handle if table doesn't exist yet
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: dbError } = await (supabaseAdmin as any)
      .from("audit_leads")
      .insert({
        email,
        email_domain: emailDomain,
        company_slug: companySlug ?? null,
        score: score ?? null,
      });

    if (dbError) {
      console.error("[audit/leads] Supabase insert error:", dbError.message);
      void logAuditRequest({
        actor,
        result: "failure",
        resource: "api.audit.leads",
        metadata: { reason: "db_insert_error", db_error: dbError.message },
      });
      // Still return success so we don't break the UX flow
    }
  } catch (err) {
    console.error("[audit/leads] Unexpected error:", err);
    void logAuditRequest({
      actor,
      result: "failure",
      resource: "api.audit.leads",
      metadata: { reason: "unexpected_error" },
    });
    // Still return success
  }

  void logAuditRequest({
    actor,
    result: "success",
    resource: "api.audit.leads",
    metadata: {
      company_slug: companySlug ?? null,
      score: score ?? null,
      email_domain: emailDomain,
    },
  });

  return NextResponse.json({ success: true });
}
