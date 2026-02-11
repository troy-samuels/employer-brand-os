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
    <section className="py-24 lg:py-32 bg-brand-deep relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-accent/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-brand-accent/5 rounded-full blur-3xl" />
      <div className="relative max-w-3xl mx-auto px-6 lg:px-12 text-center">
        <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-5 tracking-tight">
          See what AI says about your company
        </h2>
        <p className="text-lg text-white/60 mb-10 max-w-xl mx-auto leading-relaxed">
          Enter your company name. Get your Shadow Salary in 30 seconds.
          No signup, no credit card.
        </p>
        <Button
          size="lg"
          className="bg-white text-brand-deep hover:bg-neutral-100 font-semibold rounded-full px-8 py-4 text-base shadow-xl shadow-black/20 transition-all duration-200 hover:shadow-2xl hover:shadow-black/30"
          asChild
        >
          <Link href="/#audit">Get your free audit</Link>
        </Button>
      </div>
    </section>
  );
}
