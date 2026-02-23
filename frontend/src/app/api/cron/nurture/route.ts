/**
 * @module app/api/cron/nurture/route
 * Cron endpoint: processes the post-audit email nurture sequence.
 *
 * Called daily by Vercel Cron or an external scheduler.
 * Queries audit_leads for leads that need nurture emails
 * based on their created_at timestamp.
 *
 * Protected by CRON_SECRET header validation.
 */

import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@supabase/supabase-js";
import {
  sendNurtureEmail,
  getNurtureStep,
} from "@/lib/email/nurture-sequence";

export const runtime = "nodejs";
export const maxDuration = 60;

const CRON_SECRET = process.env.CRON_SECRET;
const BATCH_SIZE = 50;

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase config");
  return createClient(url, key);
}

export async function GET(request: NextRequest) {
  // Validate cron secret (Vercel sends this as Authorization: Bearer <secret>)
  const authHeader = request.headers.get("authorization");
  const cronSecret = authHeader?.replace("Bearer ", "");

  if (CRON_SECRET && cronSecret !== CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = getServiceClient();
    const now = new Date();

    // Query audit_leads with email addresses, created in the last 8 days
    const eightDaysAgo = new Date(
      now.getTime() - 8 * 24 * 60 * 60 * 1000
    ).toISOString();

    const { data: leads, error } = await supabase
      .from("audit_leads")
      .select("id, email, company_slug, created_at, nurture_sent")
      .gte("created_at", eightDaysAgo)
      .not("email", "is", null)
      .order("created_at", { ascending: true })
      .limit(BATCH_SIZE);

    if (error) {
      console.error("[cron/nurture] Failed to query leads:", error);
      return NextResponse.json(
        { error: "Database query failed" },
        { status: 500 }
      );
    }

    if (!leads || leads.length === 0) {
      return NextResponse.json({ processed: 0, message: "No leads to nurture" });
    }

    const results: Array<{
      email: string;
      step: string;
      success: boolean;
      error?: string;
    }> = [];

    for (const lead of leads) {
      const daysSinceAudit = Math.floor(
        (now.getTime() - new Date(lead.created_at).getTime()) /
          (24 * 60 * 60 * 1000)
      );

      const step = getNurtureStep(daysSinceAudit);
      if (!step) continue;

      // Check if this step was already sent
      const sentSteps: string[] = lead.nurture_sent
        ? (typeof lead.nurture_sent === "string"
            ? JSON.parse(lead.nurture_sent)
            : lead.nurture_sent)
        : [];

      if (sentSteps.includes(step)) continue;

      // Send the email
      const result = await sendNurtureEmail({
        email: lead.email,
        companySlug: lead.company_slug,
        step,
      });

      results.push(result);

      // Mark step as sent
      if (result.success) {
        const updatedSteps = [...sentSteps, step];
        await supabase
          .from("audit_leads")
          .update({ nurture_sent: updatedSteps })
          .eq("id", lead.id);
      }
    }

    return NextResponse.json({
      processed: results.length,
      succeeded: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      results,
    });
  } catch (err) {
    console.error("[cron/nurture] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
