/**
 * @module lib/stripe/server
 * Server-side Stripe client.
 * SECURITY: Only use in API routes, never expose to client.
 */

import Stripe from "stripe";

let _stripe: Stripe | null = null;

/**
 * Returns the Stripe server-side client instance.
 * Lazily initialised to avoid build-time errors when STRIPE_SECRET_KEY is not yet set.
 * @throws {Error} If STRIPE_SECRET_KEY is missing at call time.
 */
export function getStripe(): Stripe {
  if (_stripe) return _stripe;

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    throw new Error(
      "Missing STRIPE_SECRET_KEY environment variable. " +
        "Set it in .env.local or your deployment environment.",
    );
  }

  _stripe = new Stripe(stripeSecretKey, { typescript: true });
  return _stripe;
}

/**
 * @deprecated Use `getStripe()` instead. Kept for backward compatibility.
 */
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return Reflect.get(getStripe(), prop);
  },
});
