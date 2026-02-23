/**
 * @module app/api/stripe/webhook/route
 * Handles Stripe webhook events for subscription lifecycle management.
 *
 * IMPORTANT: This route must use the Node.js runtime and read the raw body
 * for webhook signature verification.
 */

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import { getStripe } from "@/lib/stripe/server";
import { untypedTable } from "@/lib/supabase/untyped-table";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/* ------------------------------------------------------------------ */
/* Config                                                              */
/* ------------------------------------------------------------------ */

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

/* ------------------------------------------------------------------ */
/* Plan mapping                                                        */
/* ------------------------------------------------------------------ */

/**
 * Maps Stripe Price IDs → OpenRole plan names.
 *
 * Plan tiers (Feb 2026):
 *   starter  — £59/mo (£49 annual) — diagnostic only, no playbook
 *   growth   — £179/mo (£149 annual) — full solution + playbook + competitors
 *   scale    — £449/mo (£379 annual) — unlimited benchmarks, API, strategy calls
 *
 * Env vars to set in .env.local / Vercel:
 *   NEXT_PUBLIC_STRIPE_PRICE_STARTER   → Starter monthly price ID
 *   NEXT_PUBLIC_STRIPE_PRICE_GROWTH    → Growth monthly price ID
 *   NEXT_PUBLIC_STRIPE_PRICE_SCALE     → Scale monthly price ID
 *   NEXT_PUBLIC_STRIPE_PRICE_STARTER_ANNUAL → Starter annual price ID
 *   NEXT_PUBLIC_STRIPE_PRICE_GROWTH_ANNUAL  → Growth annual price ID
 *   NEXT_PUBLIC_STRIPE_PRICE_SCALE_ANNUAL   → Scale annual price ID
 *
 * Legacy env vars (kept for backwards compat):
 *   NEXT_PUBLIC_STRIPE_PRICE_VISIBILITY → maps to "starter"
 *   NEXT_PUBLIC_STRIPE_PRICE_COMPLIANCE → maps to "growth"
 */
const PRICE_TO_PLAN: Record<string, string> = {
  // New plan-specific price IDs
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER ?? ""]: "starter",
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_GROWTH ?? ""]: "growth",
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_SCALE ?? ""]: "scale",
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER_ANNUAL ?? ""]: "starter",
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_GROWTH_ANNUAL ?? ""]: "growth",
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_SCALE_ANNUAL ?? ""]: "scale",
  // Legacy mappings
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_VISIBILITY ?? ""]: "starter",
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_COMPLIANCE ?? ""]: "growth",
};

function resolvePlanName(priceId: string | null | undefined): string {
  if (!priceId) return "free";
  return PRICE_TO_PLAN[priceId] ?? "free";
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function mapSubscriptionStatus(
  stripeStatus: Stripe.Subscription.Status,
): string {
  switch (stripeStatus) {
    case "active":
      return "active";
    case "past_due":
      return "past_due";
    case "canceled":
      return "cancelled";
    case "trialing":
      return "trialing";
    default:
      return "inactive";
  }
}

/**
 * Extracts current_period_start and current_period_end from subscription items.
 * In Stripe API v2025+, these are on the item, not the subscription root.
 */
function extractPeriod(subscription: Stripe.Subscription): {
  periodStart: string | null;
  periodEnd: string | null;
} {
  const item = subscription.items.data[0];
  if (!item) {
    return { periodStart: null, periodEnd: null };
  }
  return {
    periodStart: new Date(item.current_period_start * 1000).toISOString(),
    periodEnd: new Date(item.current_period_end * 1000).toISOString(),
  };
}

/* ------------------------------------------------------------------ */
/* Event handlers                                                      */
/* ------------------------------------------------------------------ */

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
): Promise<void> {
  console.log(
    "[stripe/webhook] checkout.session.completed:",
    session.id,
  );

  const customerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id;
  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id;
  const customerEmail = session.customer_details?.email ?? session.customer_email;

  if (!customerId || !subscriptionId) {
    console.error(
      "[stripe/webhook] Missing customer or subscription in checkout session:",
      session.id,
    );
    return;
  }

  // Fetch the full subscription to get price and period details
  const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
  const priceId = subscription.items.data[0]?.price?.id ?? null;
  const planName = resolvePlanName(priceId);
  const { periodStart, periodEnd } = extractPeriod(subscription);

  // Find the user by email in auth.users (via supabaseAdmin)
  let userId: string | null = null;
  if (customerEmail) {
    const { data: users } = await supabaseAdmin.auth.admin.listUsers();
    const matchedUser = users?.users?.find(
      (u) => u.email === customerEmail,
    );
    userId = matchedUser?.id ?? null;
  }

  if (!userId) {
    console.warn(
      "[stripe/webhook] No matching user found for email:",
      customerEmail,
    );
    return;
  }

  // Upsert subscription record (table not yet in generated types)
  const { error } = await untypedTable("subscriptions")
    .upsert(
      {
        user_id: userId,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        stripe_price_id: priceId,
        plan_name: planName,
        status: mapSubscriptionStatus(subscription.status),
        current_period_start: periodStart,
        current_period_end: periodEnd,
        cancel_at_period_end: subscription.cancel_at_period_end,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "stripe_customer_id" },
    );

  if (error) {
    console.error("[stripe/webhook] Error upserting subscription:", error);
  } else {
    console.log(
      "[stripe/webhook] Subscription created/updated for user:",
      userId,
      "plan:",
      planName,
    );
  }
}

async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription,
): Promise<void> {
  console.log(
    "[stripe/webhook] customer.subscription.updated:",
    subscription.id,
  );

  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer?.id;
  const priceId = subscription.items.data[0]?.price?.id ?? null;
  const { periodStart, periodEnd } = extractPeriod(subscription);

  const { error } = await untypedTable("subscriptions")
    .update({
      stripe_price_id: priceId,
      plan_name: resolvePlanName(priceId),
      status: mapSubscriptionStatus(subscription.status),
      current_period_start: periodStart,
      current_period_end: periodEnd,
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_customer_id", customerId ?? "");

  if (error) {
    console.error("[stripe/webhook] Error updating subscription:", error);
  }
}

async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
): Promise<void> {
  console.log(
    "[stripe/webhook] customer.subscription.deleted:",
    subscription.id,
  );

  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer?.id;

  const { error } = await untypedTable("subscriptions")
    .update({
      status: "cancelled",
      cancel_at_period_end: false,
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_customer_id", customerId ?? "");

  if (error) {
    console.error("[stripe/webhook] Error cancelling subscription:", error);
  }
}

/* ------------------------------------------------------------------ */
/* Route handler                                                       */
/* ------------------------------------------------------------------ */

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!webhookSecret) {
    console.error("[stripe/webhook] Missing STRIPE_WEBHOOK_SECRET");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 },
    );
  }

  /* ── Read raw body for signature verification ──── */
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 },
    );
  }

  /* ── Verify webhook ────────────────────────────── */
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[stripe/webhook] Signature verification failed:", message);
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${message}` },
      { status: 400 },
    );
  }

  /* ── Dispatch event ────────────────────────────── */
  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session,
        );
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription,
        );
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription,
        );
        break;

      default:
        console.log("[stripe/webhook] Unhandled event type:", event.type);
    }
  } catch (error) {
    console.error("[stripe/webhook] Error processing event:", event.type, error);
    // Return 200 even on handler errors to prevent Stripe retries
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
