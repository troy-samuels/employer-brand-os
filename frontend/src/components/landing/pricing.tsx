import Link from "next/link";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Visibility",
    price: "£299",
    period: "/month",
    description: "See what AI says about you and start correcting it.",
    features: [
      "Shadow Salary audit",
      "AI-readable data injection",
      "Hosted verification page",
      "Basic Monday Report",
    ],
    cta: "Start with Visibility",
    href: "/",
  },
  {
    name: "Compliance",
    price: "£899",
    period: "/month",
    description: "Full AI reputation control with automated pay transparency.",
    features: [
      "Everything in Visibility",
      "Auto-compliance by jurisdiction",
      "Compensation Confidence Score",
      "Full Monday Report with competitor benchmarking",
      "Hallucination monitoring",
    ],
    cta: "Start with Compliance",
    href: "/",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "Multi-location management, custom AI training, and dedicated support.",
    features: [
      "Everything in Compliance",
      "Unlimited locations",
      "Custom AI model training",
      "White-glove onboarding",
      "Dedicated account manager",
    ],
    cta: "Talk to us",
    href: "mailto:hello@rankwell.io",
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-16 lg:py-20 bg-neutral-50">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-12">
        <div className="mb-12">
          <p className="overline mb-3">Pricing</p>
          <h2 className="text-3xl font-bold text-neutral-950">
            Cheaper than one bad hire
          </h2>
          <p className="text-neutral-600 mt-3 max-w-xl">
            If Rankwell prevents even one candidate from ruling you out based on
            wrong AI data, it&apos;s paid for itself for the year.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-xl bg-white p-6 lg:p-8 border ${
                plan.highlighted
                  ? "border-brand-accent border-t-2 shadow-card"
                  : "border-neutral-200"
              }`}
            >
              <div className="mb-6">
                <h3 className="text-base font-semibold text-neutral-950">
                  {plan.name}
                </h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-neutral-950">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-neutral-500 text-sm">{plan.period}</span>
                  )}
                </div>
                <p className="text-neutral-600 text-sm mt-3 leading-relaxed">
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm text-neutral-600">
                    <Check className="h-4 w-4 text-status-verified mt-0.5 shrink-0" strokeWidth={2} />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.highlighted ? "primary" : "secondary"}
                size="md"
                className="w-full"
                asChild
              >
                <Link href={plan.href}>{plan.cta}</Link>
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-neutral-500">
            Agency wholesale pricing available — £150/month per location for 10+ locations.{" "}
            <Link href="mailto:hello@rankwell.io" className="text-brand-accent hover:underline">
              Get in touch
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
