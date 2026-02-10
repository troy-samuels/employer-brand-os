/**
 * @module components/landing/cta
 * Module implementation for cta.tsx.
 */

import Link from "next/link";

import { Button } from "@/components/ui/button";

/**
 * Executes CTA.
 * @returns The resulting value.
 */
export default function CTA() {
  return (
    <section className="py-16 lg:py-20 bg-brand-deep">
      <div className="max-w-3xl mx-auto px-6 lg:px-12 text-center">
        <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4 tracking-tight">
          See what AI says about your company
        </h2>
        <p className="text-lg text-white/70 mb-8 max-w-xl mx-auto">
          Enter your company name. Get your Shadow Salary in 60 seconds.
          No signup, no credit card.
        </p>
        <Button
          size="lg"
          className="bg-white text-brand-deep hover:bg-neutral-100 font-semibold"
          asChild
        >
          <Link href="/#audit">Get your free audit</Link>
        </Button>
      </div>
    </section>
  );
}
