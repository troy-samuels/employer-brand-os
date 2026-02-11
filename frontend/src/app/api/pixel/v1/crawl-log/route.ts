/**
 * @module app/api/pixel/v1/crawl-log
 * Logs AI crawler visits detected by the Rankwell pixel.
 * POST /api/pixel/v1/crawl-log
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { API_ERROR_CODE, API_ERROR_MESSAGE } from "@/lib/utils/api-errors";

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- crawler_visits not in generated types until migration runs
const db = supabaseAdmin as any;
import {
  apiErrorResponse,
  apiSuccessResponse,
} from "@/lib/utils/api-response";

export const runtime = "nodejs";

const crawlLogSchema = z.object({
  companyId: z.string().min(1),
  botName: z.string().min(1),
  userAgent: z.string().min(1),
  pageUrl: z.string().url(),
  timestamp: z.string().datetime().optional(),
  couldRead: z.boolean(),
});

export async function POST(request: NextRequest) {
  try {
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

    const parsed = crawlLogSchema.safeParse(body);
    if (!parsed.success) {
      return apiErrorResponse({
        error: "Invalid crawl log payload",
        code: API_ERROR_CODE.invalidPayload,
        status: 400,
        details: parsed.error.flatten(),
      });
    }

    const { companyId, botName, userAgent, pageUrl, timestamp, couldRead } =
      parsed.data;

    const { error } = await db.from("crawler_visits").insert({
      company_id: companyId,
      bot_name: botName,
      user_agent: userAgent,
      page_url: pageUrl,
      could_read: couldRead,
      response_served: false,
      visited_at: timestamp ?? new Date().toISOString(),
    });

    if (error) {
      console.error("Failed to log crawler visit:", error);
      return apiErrorResponse({
        error: API_ERROR_MESSAGE.internal,
        code: API_ERROR_CODE.internal,
        status: 500,
      });
    }

    return apiSuccessResponse({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("Crawl log API error:", error);
    return apiErrorResponse({
      error: API_ERROR_MESSAGE.internal,
      code: API_ERROR_CODE.internal,
      status: 500,
    });
  }
}

/**
 * Reject non-POST methods.
 */
export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed", status: 405 },
    { status: 405 },
  );
}
