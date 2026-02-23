/**
 * @module components/landing/pricing
 * Company-size pricing tiers with highlighted Growth card.
 */

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, ArrowRight, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const spring = { type: "spring" as const, stiffness: 200, damping: 20 };

const plans = [
  {
    name: "Startup",
    size: "1–50 employees",
    price: "£49",
    features: [
      "Full audit suite + AEO content",
      "Monthly monitoring across 4 AI models",
      "1 competitor benchmark",
      "Email reports & alerts",
    ],
  },
  {
    name: "Growth",
    size: "51–250 employees",
    price: "£99",
    highlighted: true,
    features: [
      "Everything in Startup",
      "Weekly monitoring + content playbook",
      "3 competitor benchmarks",
      "ATS integration + proof tracking",
    ],
  },
  {
    name: "Scale",
    size: "250+ employees",
    price: "£249",
    features: [
      "Everything in Growth",
      "Daily monitoring",
      "Unlimited competitor benchmarks",
      "Dedicated snippet optimisation",
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
            Priced for your company size
          </h2>
          <p className="text-neutral-400 mt-3 max-w-md mx-auto text-sm">
            The free audit is always free. Paid plans add ongoing AI monitoring,
            competitor benchmarking, and the content playbook to close every gap.
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-3 items-center">
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
                  ? "bg-neutral-950 border border-white/10 shadow-2xl shadow-black/20 md:scale-105 md:py-10"
                  : "bg-transparent border border-neutral-200"
              )}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-accent px-3 py-1 text-[10px] font-semibold text-white tracking-wide">
                  Most popular
                </span>
              )}

              <h3 className={cn(
                "text-sm font-semibold",
                plan.highlighted ? "text-white" : "text-neutral-950"
              )}>
                {plan.name}
              </h3>

              <div className={cn(
                "flex items-center gap-1.5 mt-1.5",
                plan.highlighted ? "text-neutral-400" : "text-neutral-400"
              )}>
                <Users className="h-3 w-3 shrink-0" strokeWidth={2.5} />
                <span className="text-xs font-medium">{plan.size}</span>
              </div>

              <div className="mt-4 flex items-baseline gap-1">
                <span
                  className={cn(
                    "text-3xl font-medium",
                    plan.highlighted ? "text-white" : "text-neutral-950"
                  )}
                  style={{ letterSpacing: "-0.03em" }}
                >
                  {plan.price}
                </span>
                <span className={cn(
                  "text-sm",
                  plan.highlighted ? "text-neutral-400" : "text-neutral-400"
                )}>
                  /mo
                </span>
              </div>

              <ul className="mt-6 space-y-3">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className={cn(
                      "flex items-center gap-2 text-sm",
                      plan.highlighted ? "text-neutral-300" : "text-neutral-400"
                    )}
                  >
                    <Check
                      className={cn(
                        "h-3.5 w-3.5 shrink-0",
                        plan.highlighted ? "text-brand-accent" : "text-neutral-300"
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

        <motion.div
          className="mt-10 text-center"
          initial={{ opacity: 1 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.05 }}
          transition={{ delay: 0.3 }}
        >
          <Link
            href="/pricing"
            className="inline-flex items-center gap-1.5 text-sm text-neutral-400 hover:text-neutral-950 transition-colors"
          >
            Full pricing & FAQ
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
