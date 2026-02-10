import { isIP } from "node:net";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { resolveCompanyUrl } from "@/lib/audit/company-resolver";
import { isLikelyDomainOrUrl, validateUrl } from "@/lib/audit/url-validator";
import { runWebsiteChecks } from "@/lib/audit/website-checks";
import { logAuditRequest } from "@/lib/audit/audit-logger";
import { validateCsrf } from "@/lib/utils/csrf";
import { RateLimiter } from "@/lib/utils/rate-limiter";

export const runtime = "nodejs";

const rateLimiter = new RateLimiter();

const auditRequestSchema = z.object({
  url: z
    .string({ error: "Missing or invalid 'url' field." })
    .trim()
    .min(1, "Missing or invalid 'url' field.")
    .max(2048, "'url' is too long.")
    .refine(isLikelyDomainOrUrl, {
      message: "'url' must be a valid domain or HTTP(S) URL.",
    }),
});

function getClientIpAddress(request: NextRequest): string {
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp && isIP(realIp)) {
    return realIp;
  }

  // NOTE: Use `request.ip` from trusted infrastructure for production-grade limits.
  return "anonymous";
}

export async function POST(request: NextRequest) {
  const clientIp = getClientIpAddress(request);

  try {
    if (!validateCsrf(request)) {
      void logAuditRequest({
        actor: clientIp,
        result: "denied",
        resource: "api.audit",
        metadata: { reason: "csrf_failed" },
      });
      return NextResponse.json(
        { error: "Invalid request origin" },
        { status: 403 },
      );
    }

    const allowed = await rateLimiter.check(clientIp, "audit-phase1", 50, 3600);

    if (!allowed) {
      void logAuditRequest({
        actor: clientIp,
        result: "denied",
        resource: "api.audit",
        metadata: { reason: "rate_limited" },
      });
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 },
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      void logAuditRequest({
        actor: clientIp,
        result: "failure",
        resource: "api.audit",
        metadata: { reason: "malformed_json" },
      });
      return NextResponse.json(
        { error: "Malformed JSON body." },
        { status: 400 },
      );
    }

    if (typeof body !== "object" || body === null || !("url" in body)) {
      void logAuditRequest({
        actor: clientIp,
        result: "failure",
        resource: "api.audit",
        metadata: { reason: "missing_url_field" },
      });
      return NextResponse.json(
        { error: "Missing or invalid 'url' field." },
        { status: 400 },
      );
    }

    const parsedBody = auditRequestSchema.safeParse(body);
    if (!parsedBody.success) {
      const firstIssue = parsedBody.error.issues[0];
      void logAuditRequest({
        actor: clientIp,
        result: "failure",
        resource: "api.audit",
        metadata: {
          reason: "schema_validation_failed",
          issue: firstIssue?.message ?? "unknown",
        },
      });
      return NextResponse.json(
        { error: firstIssue?.message ?? "Missing or invalid 'url' field." },
        { status: 400 },
      );
    }

    const input = parsedBody.data.url;
    const preflightValidation = await validateUrl(input);
    if (!preflightValidation.ok) {
      void logAuditRequest({
        actor: clientIp,
        result: "failure",
        resource: "api.audit",
        metadata: {
          reason: "blocked_or_private_url",
          input,
        },
      });
      return NextResponse.json(
        { error: "URL points to a blocked or private network." },
        { status: 400 },
      );
    }

    const resolved = await resolveCompanyUrl(input);
    const domain = resolved.url ?? preflightValidation.normalizedUrl.hostname;
    const companyName = resolved.name || preflightValidation.normalizedUrl.hostname;

    const result = await runWebsiteChecks(domain, companyName);
    void logAuditRequest({
      actor: clientIp,
      result: "success",
      resource: "api.audit",
      metadata: {
        input,
        resolved_domain: domain,
        company_name: companyName,
        score: result.score,
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Audit API error:", error);
    void logAuditRequest({
      actor: clientIp,
      result: "failure",
      resource: "api.audit",
      metadata: { reason: "internal_error" },
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
