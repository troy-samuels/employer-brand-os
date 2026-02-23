/**
 * @module app/api/audit/leads/route
 * Captures audit lead emails submitted after audit completion.
 */

import { NextRequest, type NextResponse } from "next/server";
import { z } from "zod";

import { logAuditRequest } from "@/lib/audit/audit-logger";
import { sendAuditReportEmail } from "@/lib/email/send-audit-report";
import { resolveRequestActor } from "@/lib/security/request-metadata";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { API_ERROR_CODE, API_ERROR_MESSAGE } from "@/lib/utils/api-errors";
import {
  apiErrorResponse,
  apiSuccessResponse,
  type ApiErrorResponse,
} from "@/lib/utils/api-response";
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

const AUDIT_LEADS_RESOURCE = "api.audit.leads";

const leadSchema = z.object({
  email: z.string().email(),
  companySlug: z.string().optional(),
  score: z.number().int().optional(),
});

interface AuditLeadSuccessResponse {
  success: true;
}

/**
 * Stores a lead capture submission for the audit funnel.
 * @param request - The incoming lead capture request.
 * @returns A success payload or a standardized error response.
 */
export async function POST(
  request: NextRequest,
): Promise<NextResponse<AuditLeadSuccessResponse | ApiErrorResponse>> {
  const actor = resolveRequestActor(request);

  try {
    if (!validateCsrf(request)) {
      void logAuditRequest({
        actor,
        result: "denied",
        resource: AUDIT_LEADS_RESOURCE,
        metadata: { reason: "csrf_failed" },
      });
      return apiErrorResponse({
        error: API_ERROR_MESSAGE.forbidden,
        code: API_ERROR_CODE.invalidOrigin,
        status: 403,
      });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      void logAuditRequest({
        actor,
        result: "failure",
        resource: AUDIT_LEADS_RESOURCE,
        metadata: { reason: "invalid_json" },
      });
      return apiErrorResponse({
        error: "Invalid JSON",
        code: API_ERROR_CODE.invalidJson,
        status: 400,
      });
    }

    const parsed = leadSchema.safeParse(body);
    if (!parsed.success) {
      void logAuditRequest({
        actor,
        result: "failure",
        resource: AUDIT_LEADS_RESOURCE,
        metadata: { reason: "schema_validation_failed" },
      });
      return apiErrorResponse({
        error: "Please enter a valid email address",
        code: API_ERROR_CODE.invalidPayload,
        status: 400,
      });
    }

    const { email, companySlug, score } = parsed.data;
    const emailDomain = email.split("@")[1]?.toLowerCase();

    if (!emailDomain || CONSUMER_DOMAINS.has(emailDomain)) {
      void logAuditRequest({
        actor,
        result: "failure",
        resource: AUDIT_LEADS_RESOURCE,
        metadata: {
          reason: "consumer_email_domain",
          email_domain: emailDomain ?? null,
        },
      });
      return apiErrorResponse({
        error: "Please use your work email address",
        code: API_ERROR_CODE.invalidPayload,
        status: 400,
      });
    }

    try {
      const { error: dbError } = await supabaseAdmin.from("audit_leads").insert({
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
          resource: AUDIT_LEADS_RESOURCE,
          metadata: { reason: "db_insert_error", db_error: dbError.message },
        });
        // Keep success to avoid interrupting funnel UX.
      }
    } catch (error) {
      console.error("[audit/leads] Unexpected error:", error);
      void logAuditRequest({
        actor,
        result: "failure",
        resource: AUDIT_LEADS_RESOURCE,
        metadata: { reason: "unexpected_error" },
      });
      // Keep success to avoid interrupting funnel UX.
    }

    // Fire-and-forget: send audit report email (don't block the response)
    if (companySlug) {
      void sendAuditReportEmail({
        email,
        companySlug,
        score: score ?? 0,
      });
    }

    void logAuditRequest({
      actor,
      result: "success",
      resource: AUDIT_LEADS_RESOURCE,
      metadata: {
        company_slug: companySlug ?? null,
        score: score ?? null,
        email_domain: emailDomain,
      },
    });

    return apiSuccessResponse<AuditLeadSuccessResponse>({ success: true });
  } catch (error) {
    console.error("[audit/leads] Route error:", error);
    return apiErrorResponse({
      error: API_ERROR_MESSAGE.internal,
      code: API_ERROR_CODE.internal,
      status: 500,
    });
  }
}
