/**
 * @module components/landing/pricing
 * Flat two-tier pricing: Free + Pro side-by-side.
 */

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, ArrowRight, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

const spring = { type: "spring" as const, stiffness: 200, damping: 20 };

const freePlan = {
  name: "Free",
  price: "£0",
  description: "See what AI says about you",
  features: [
    "Unlimited AI visibility audits",
    "PDF audit report download",
    "llms.txt & Schema generators",
    "Company scorecard page",
  ],
};

const proPlan = {
  name: "Pro",
  price: "£79",
  description: "Take control of it",
  features: [
    "Everything in Free",
    "Weekly monitoring across 4 AI models",
    "Competitor displacement reports",
    "Content playbook + ATS integration",
  ],
};

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 lg:py-32 bg-white">
      <div className="max-w-[760px] mx-auto px-6 lg:px-12">
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
            One plan. Everything included.
          </h2>
          <p className="text-neutral-400 mt-3 max-w-md mx-auto text-sm">
            Free audits forever. Pro when you&apos;re ready to take control.
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 items-center">
          {/* ── Free ─────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.05 }}
            transition={spring}
            className="relative rounded-2xl p-7 bg-transparent border border-neutral-200 transition-all duration-300"
          >
            <h3 className="text-sm font-semibold text-neutral-950">
              {freePlan.name}
            </h3>
            <p className="text-xs text-neutral-400 mt-1">{freePlan.description}</p>
            <div className="mt-4 flex items-baseline gap-1">
              <span
                className="text-3xl font-medium text-neutral-950"
                style={{ letterSpacing: "-0.03em" }}
              >
                Free
              </span>
              <span className="text-sm text-neutral-400">forever</span>
            </div>

            <ul className="mt-6 space-y-3">
              {freePlan.features.map((f) => (
                <li
                  key={f}
                  className="flex items-center gap-2 text-sm text-neutral-400"
                >
                  <Check
                    className="h-3.5 w-3.5 shrink-0 text-neutral-300"
                    strokeWidth={2.5}
                  />
                  {f}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* ── Pro ──────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.05 }}
            transition={{ ...spring, delay: 0.08 }}
            className="relative rounded-2xl p-7 bg-neutral-950 border border-white/10 shadow-2xl shadow-black/20 md:scale-105 md:py-10 transition-all duration-300"
          >
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-accent px-3 py-1 text-[10px] font-semibold text-white tracking-wide">
              Everything you need
            </span>

            <h3 className="text-sm font-semibold text-white">{proPlan.name}</h3>
            <p className="text-xs text-neutral-400 mt-1">{proPlan.description}</p>
            <div className="mt-4 flex items-baseline gap-1">
              <span
                className="text-3xl font-medium text-white"
                style={{ letterSpacing: "-0.03em" }}
              >
                {proPlan.price}
              </span>
              <span className="text-sm text-neutral-400">/mo</span>
            </div>

            <div className="mt-3 flex items-start gap-2 rounded-lg bg-white/5 border border-white/10 px-3 py-2">
              <Lock className="h-3 w-3 text-teal-400 mt-0.5 shrink-0" />
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Founding rate — locked forever for first 20 customers
              </p>
            </div>

            <ul className="mt-6 space-y-3">
              {proPlan.features.map((f) => (
                <li
                  key={f}
                  className="flex items-center gap-2 text-sm text-neutral-300"
                >
                  <Check
                    className="h-3.5 w-3.5 shrink-0 text-brand-accent"
                    strokeWidth={2.5}
                  />
                  {f}
                </li>
              ))}
            </ul>
          </motion.div>
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
