/**
 * @module app/api/email/audit-report/route
 * Internal API endpoint for sending audit report emails.
 * Protected by CRON_SECRET or INTERNAL_API_SECRET.
 */

import { NextRequest } from "next/server";
import { z } from "zod";

import { sendEmail } from "@/lib/email/resend";
import { renderAuditReportEmail } from "@/lib/email/templates/audit-report";
import { untypedTable } from "@/lib/supabase/untyped-table";
import {
  apiErrorResponse,
  apiSuccessResponse,
} from "@/lib/utils/api-response";
import { API_ERROR_CODE, API_ERROR_MESSAGE } from "@/lib/utils/api-errors";

const payloadSchema = z.object({
  email: z.string().email(),
  companySlug: z.string().min(1),
  companyName: z.string().min(1),
  score: z.number().int().min(0).max(100),
});

function isAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  const internalSecret = process.env.INTERNAL_API_SECRET;

  if (!authHeader) return false;

  const token = authHeader.replace(/^Bearer\s+/i, "");

  if (cronSecret && token === cronSecret) return true;
  if (internalSecret && token === internalSecret) return true;

  return false;
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return apiErrorResponse({
      error: API_ERROR_MESSAGE.unauthorized,
      code: API_ERROR_CODE.unauthorized,
      status: 401,
    });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiErrorResponse({
      error: API_ERROR_MESSAGE.invalidJson,
      code: API_ERROR_CODE.invalidJson,
      status: 400,
    });
  }

  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    return apiErrorResponse({
      error: "Invalid payload",
      code: API_ERROR_CODE.invalidPayload,
      status: 400,
      details: parsed.error.flatten(),
    });
  }

  const { email, companySlug, companyName, score } = parsed.data;

  const html = renderAuditReportEmail({
    companyName,
    companySlug,
    score,
  });

  const result = await sendEmail({
    to: email,
    subject: `Your AI Employer Brand Audit — ${companyName} (Score: ${score}/100)`,
    html,
    tags: [
      { name: "type", value: "audit-report" },
      { name: "company", value: companySlug },
    ],
  });

  // Log the send attempt in Supabase
  try {
    await untypedTable("email_sends").insert({
      email,
      template: "audit-report",
      company_slug: companySlug,
      resend_id: result.id ?? null,
      success: result.success,
      error: result.error ?? null,
    });
  } catch (logError) {
    // Don't fail the request if logging fails — the email_sends table may not exist yet
    console.error("[email/audit-report] Failed to log email send:", logError);
  }

  if (!result.success) {
    return apiErrorResponse({
      error: result.error ?? "Failed to send email",
      code: API_ERROR_CODE.internal,
      status: 500,
    });
  }

  return apiSuccessResponse({
    success: true,
    emailId: result.id,
  });
}
