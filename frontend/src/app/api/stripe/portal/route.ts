/**
 * @module app/api/stripe/portal/route
 * Creates a Stripe Customer Portal session for subscription management.
 */

import { NextResponse } from "next/server";

import { stripe } from "@/lib/stripe/server";
import { createClient } from "@/lib/supabase/server";
import { untypedTable } from "@/lib/supabase/untyped-table";
import { API_ERROR_CODE, API_ERROR_MESSAGE } from "@/lib/utils/api-errors";
import {
  apiErrorResponse,
  apiSuccessResponse,
  type ApiErrorResponse,
} from "@/lib/utils/api-response";

export const runtime = "nodejs";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface PortalSuccessResponse {
  url: string;
}

/* ------------------------------------------------------------------ */
/* Handler                                                             */
/* ------------------------------------------------------------------ */

export async function POST(): Promise<
  NextResponse<PortalSuccessResponse | ApiErrorResponse>
> {
  try {
    /* ── Authenticate ──────────────────────────────── */
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return apiErrorResponse({
        error: API_ERROR_MESSAGE.unauthorized,
        code: API_ERROR_CODE.unauthorized,
        status: 401,
      });
    }

    /* ── Look up Stripe customer ID ────────────────── */
    // subscriptions table not yet in generated types
    const { data: subscription, error: subError } = await untypedTable(
      "subscriptions",
    )
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single();

    if (subError || !subscription?.stripe_customer_id) {
      return apiErrorResponse({
        error: "No active subscription found. Please subscribe first.",
        code: API_ERROR_CODE.notFound,
        status: 404,
      });
    }

    /* ── Create portal session ─────────────────────── */
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id as string,
      return_url: `${appUrl}/dashboard`,
    });

    return apiSuccessResponse<PortalSuccessResponse>({
      url: portalSession.url,
    });
  } catch (error) {
    console.error("[stripe/portal] Error creating portal session:", error);
    return apiErrorResponse({
      error: API_ERROR_MESSAGE.internal,
      code: API_ERROR_CODE.internal,
      status: 500,
    });
  }
}
