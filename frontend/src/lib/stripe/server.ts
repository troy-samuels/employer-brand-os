/**
 * @module lib/stripe/server
 * Server-side Stripe client.
 * SECURITY: Only use in API routes, never expose to client.
 */

import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error(
    "Missing STRIPE_SECRET_KEY environment variable. " +
      "Set it in .env.local or your deployment environment.",
  );
}

/**
 * Stripe server-side client instance.
 * Uses the secret key for full API access.
 */
export const stripe = new Stripe(stripeSecretKey, {
  typescript: true,
});
