/**
 * @module app/api/stripe/checkout/route
 * Creates a Stripe Checkout Session for subscription purchases.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getStripe } from "@/lib/stripe/server";
import { resolveRequestActor } from "@/lib/security/request-metadata";
import { API_ERROR_CODE, API_ERROR_MESSAGE } from "@/lib/utils/api-errors";
import {
  apiErrorResponse,
  apiSuccessResponse,
  type ApiErrorResponse,
} from "@/lib/utils/api-response";
import { validateCsrf } from "@/lib/utils/csrf";
import { RateLimiter } from "@/lib/utils/rate-limiter";

export const runtime = "nodejs";

/* ------------------------------------------------------------------ */
/* Config                                                              */
/* ------------------------------------------------------------------ */

const RATE_LIMIT_SCOPE = "stripe-checkout";
const RATE_LIMIT_LIMIT = 10;
const RATE_LIMIT_WINDOW_SECONDS = 3600;

const rateLimiter = new RateLimiter();

/* ------------------------------------------------------------------ */
/* Validation                                                          */
/* ------------------------------------------------------------------ */

const checkoutRequestSchema = z.object({
  priceId: z
    .string({ error: "Missing or invalid 'priceId' field." })
    .trim()
    .min(1, "'priceId' is required.")
    .max(256, "'priceId' is too long."),
  email: z
    .string()
    .email("Invalid email address.")
    .optional(),
});

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface CheckoutSuccessResponse {
  url: string;
}

/* ------------------------------------------------------------------ */
/* Handler                                                             */
/* ------------------------------------------------------------------ */

export async function POST(
  request: NextRequest,
): Promise<NextResponse<CheckoutSuccessResponse | ApiErrorResponse>> {
  const clientIp = resolveRequestActor(request);

  try {
    /* ── CSRF ──────────────────────────────────────── */
    if (!validateCsrf(request)) {
      return apiErrorResponse({
        error: API_ERROR_MESSAGE.invalidOrigin,
        code: API_ERROR_CODE.invalidOrigin,
        status: 403,
      });
    }

    /* ── Rate limit ────────────────────────────────── */
    const allowed = await rateLimiter.check(
      clientIp,
      RATE_LIMIT_SCOPE,
      RATE_LIMIT_LIMIT,
      RATE_LIMIT_WINDOW_SECONDS,
    );

    if (!allowed) {
      return apiErrorResponse({
        error: "Rate limit exceeded. Please try again later.",
        code: API_ERROR_CODE.rateLimited,
        status: 429,
      });
    }

    /* ── Parse body ────────────────────────────────── */
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

    const parsed = checkoutRequestSchema.safeParse(body);
    if (!parsed.success) {
      return apiErrorResponse({
        error: "Invalid request payload.",
        code: API_ERROR_CODE.invalidPayload,
        status: 400,
        details: parsed.error.issues,
      });
    }

    const { priceId, email } = parsed.data;

    /* ── Build URLs ────────────────────────────────── */
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const successUrl = `${appUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${appUrl}/pricing`;

    /* ── Create Checkout Session ───────────────────── */
    const session = await getStripe().checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      ...(email ? { customer_email: email } : {}),
    });

    if (!session.url) {
      return apiErrorResponse({
        error: "Failed to create checkout session.",
        code: API_ERROR_CODE.internal,
        status: 500,
      });
    }

    return apiSuccessResponse<CheckoutSuccessResponse>({ url: session.url });
  } catch (error) {
    console.error("[stripe/checkout] Error creating checkout session:", error);
    return apiErrorResponse({
      error: API_ERROR_MESSAGE.internal,
      code: API_ERROR_CODE.internal,
      status: 500,
    });
  }
}
