/**
 * @module components/landing/pricing
 * Clean three-tier pricing preview. Annual prices. Compete highlighted.
 */

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, ArrowRight, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

const spring = { type: "spring" as const, stiffness: 200, damping: 20 };

const plans = [
  {
    name: "Control",
    price: "£119",
    subtitle: "Monitor & start fixing",
    features: [
      "Weekly monitoring across 4 AI models",
      "Content playbook + brand defence",
      "Embeddable JS snippet",
      "1 competitor benchmark",
    ],
  },
  {
    name: "Compete",
    price: "£239",
    subtitle: "Outmanoeuvre competitors",
    highlighted: true,
    features: [
      "Everything in Control",
      "5 competitors + displacement reports",
      "ATS integration + proof tracking",
      "Custom branded reports",
    ],
  },
  {
    name: "Command",
    price: "£479",
    subtitle: "Full ownership + API",
    features: [
      "Everything in Compete",
      "Unlimited competitors + API",
      "Dedicated account manager",
      "Quarterly strategy calls",
    ],
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 lg:py-32 bg-white">
      <div className="max-w-[960px] mx-auto px-6 lg:px-12">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 1, y: 0 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.05 }}
          transition={spring}
        >
          <h2
            className="text-3xl lg:text-4xl font-medium text-neutral-950"
            style={{ letterSpacing: "-0.03em" }}
          >
            Monitor. Compete. Command.
          </h2>
          <p className="text-neutral-400 mt-3 max-w-sm mx-auto text-sm">
            Free audits forever. Prices shown billed annually.
          </p>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-3 items-center">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 1, y: 0 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.05 }}
              transition={{ ...spring, delay: i * 0.08 }}
              className={cn(
                "relative rounded-2xl p-7 transition-all duration-300",
                plan.highlighted
                  ? "bg-neutral-950 md:scale-[1.03] md:py-9"
                  : "bg-neutral-50 border border-neutral-200/60"
              )}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-accent px-4 py-1 text-[10px] font-semibold text-white tracking-wide">
                  Most popular
                </span>
              )}

              <p className={cn(
                "text-sm font-semibold",
                plan.highlighted ? "text-white" : "text-neutral-950"
              )}>
                {plan.name}
              </p>
              <p className={cn(
                "text-xs mt-0.5",
                "text-neutral-400"
              )}>
                {plan.subtitle}
              </p>

              <div className="mt-5 flex items-baseline gap-1">
                <span
                  className={cn(
                    "text-3xl font-medium",
                    plan.highlighted ? "text-white" : "text-neutral-950"
                  )}
                  style={{ letterSpacing: "-0.03em" }}
                >
                  {plan.price}
                </span>
                <span className="text-sm text-neutral-400">/mo</span>
              </div>

              {plan.highlighted && (
                <div className="mt-3 flex items-center gap-2 rounded-lg bg-white/[0.06] border border-white/[0.08] px-3 py-2">
                  <Lock className="h-3 w-3 text-teal-400 shrink-0" />
                  <p className="text-[11px] text-neutral-400 leading-snug">
                    Founding: <strong className="text-neutral-300">£199/mo</strong> locked forever
                  </p>
                </div>
              )}

              <ul className="mt-6 space-y-3">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className={cn(
                      "flex items-center gap-2 text-[13px]",
                      plan.highlighted ? "text-neutral-300" : "text-neutral-400"
                    )}
                  >
                    <Check
                      className={cn(
                        "h-3.5 w-3.5 shrink-0",
                        plan.highlighted ? "text-teal-400" : "text-neutral-300"
                      )}
                      strokeWidth={2.5}
                    />
                    {f}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/#audit"
            className="inline-flex items-center gap-1.5 text-sm text-neutral-400 hover:text-neutral-950 transition-colors"
          >
            See what AI says about you right now
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <span className="hidden sm:block text-neutral-200">·</span>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-950 hover:text-neutral-700 transition-colors"
          >
            Full pricing & FAQ
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
