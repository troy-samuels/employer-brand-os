/**
 * @module components/landing/pricing
 * Simplified pricing teaser on the homepage — links through to /pricing.
 */

import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";

const highlights = [
  {
    name: "Starter",
    audience: "1–50 employees",
    price: "£49",
    features: [
      "3 LLM reputation checks",
      "Pixel & verification page",
      "Monthly reputation snapshot",
    ],
  },
  {
    name: "Growth",
    audience: "51–500 employees",
    price: "£149",
    highlighted: true,
    features: [
      "4 LLM reputation checks",
      "Weekly Monday Report",
      "Hallucination alerts",
    ],
  },
  {
    name: "Scale",
    audience: "500+ employees",
    price: "£399",
    features: [
      "6 LLMs — full coverage",
      "Competitor benchmarking",
      "Unlimited locations",
    ],
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 lg:py-28 bg-neutral-50">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-12">
        <div className="mb-14 lg:mb-16 text-center">
          <p className="overline mb-3">Pricing</p>
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-950 tracking-tight">
            Cheaper than one bad hire
          </h2>
          <p className="text-neutral-500 mt-4 max-w-xl mx-auto">
            Plans scale with your team. The free audit is always free —
            no signup, no credit card.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {highlights.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl bg-white p-7 lg:p-8 border transition-all duration-300 ${
                plan.highlighted
                  ? "border-brand-accent ring-1 ring-brand-accent/20 shadow-elevated scale-[1.02]"
                  : "border-neutral-200 hover:shadow-card-hover hover:border-neutral-300"
              }`}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center rounded-full bg-brand-accent px-3 py-1 text-[11px] font-semibold text-white">
                  Most popular
                </span>
              )}
              <div className="mb-6">
                <h3 className="text-base font-semibold text-neutral-950">
                  {plan.name}
                </h3>
                <p className="text-xs font-medium text-neutral-400 mt-1">
                  {plan.audience}
                </p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-neutral-950 tracking-tight">
                    {plan.price}
                  </span>
                  <span className="text-neutral-500 text-sm">/month</span>
                </div>
              </div>

              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2.5 text-sm text-neutral-600"
                  >
                    <Check
                      className="h-4 w-4 text-brand-accent mt-0.5 shrink-0"
                      strokeWidth={2.5}
                    />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-950 hover:text-neutral-700 transition-colors"
          >
            See full pricing & FAQ
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <span className="text-neutral-300 hidden sm:inline">·</span>
          <p className="text-sm text-neutral-500">
            Enterprise & agency pricing available.{" "}
            <a
              href="mailto:hello@rankwell.io"
              className="text-brand-accent hover:underline"
            >
              Get in touch
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
