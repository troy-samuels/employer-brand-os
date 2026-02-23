/**
 * @module components/pricing/checkout-button
 * Client component that initiates a Stripe Checkout session.
 */

"use client";

import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface CheckoutButtonProps {
  /** Stripe Price ID to subscribe to */
  priceId: string;
  /** Button label text */
  label?: string;
  /** Whether to show highlighted (primary) styling */
  highlighted?: boolean;
  /** Optional CSS class overrides */
  className?: string;
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function CheckoutButton({
  priceId,
  label = "Get started",
  highlighted = false,
  className,
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleCheckout}
        disabled={loading}
        className={
          className ??
          `flex items-center justify-center w-full rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${
            highlighted
              ? "bg-brand-accent text-white hover:bg-brand-accent-hover shadow-md shadow-brand-accent/20"
              : "bg-slate-100 text-slate-900 hover:bg-neutral-200"
          }`
        }
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Redirecting…
          </>
        ) : (
          <>
            {label}
            <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
          </>
        )}
      </button>
      {error && (
        <p className="mt-2 text-xs text-red-600 text-center">{error}</p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Contact Sales variant                                               */
/* ------------------------------------------------------------------ */

interface ContactSalesButtonProps {
  className?: string;
}

export function ContactSalesButton({ className }: ContactSalesButtonProps) {
  return (
    <a
      href="mailto:hello@openrole.co.uk?subject=Agency%20pricing%20enquiry"
      className={
        className ??
        "flex items-center justify-center w-full rounded-xl px-4 py-3 text-sm font-semibold bg-slate-100 text-slate-900 hover:bg-neutral-200 transition-all duration-200"
      }
    >
      Contact sales
      <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
    </a>
  );
}
