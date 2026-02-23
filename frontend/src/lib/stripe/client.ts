/**
 * @module lib/stripe/client
 * Client-side Stripe.js loader with memoized promise.
 */

import { loadStripe, type Stripe } from "@stripe/stripe-js";

let stripePromise: Promise<Stripe | null> | null = null;

/**
 * Returns a memoized Stripe.js instance.
 * Safe to call multiple times — only loads once.
 */
export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) {
      console.error(
        "Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable.",
      );
      return Promise.resolve(null);
    }
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
}
