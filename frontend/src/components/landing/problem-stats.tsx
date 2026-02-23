/**
 * @module components/landing/problem-stats
 * Three large stats showing the AI employer brand problem.
 */

"use client";

import { motion } from "framer-motion";

const stats = [
  {
    value: "800M",
    label: "people use ChatGPT every week — and they're asking about your company",
  },
  {
    value: "68%",
    label: "of UK employers have no machine-readable salary or benefits data for AI to cite",
  },
  {
    value: "32/100",
    label: "average employer AI visibility score. Glassdoor fills the silence.",
  },
];

const spring = { type: "spring" as const, stiffness: 200, damping: 20 };

export default function ProblemStats() {
  return (
    <section className="py-16 lg:py-20 bg-neutral-50">
      <div className="mx-auto max-w-[1000px] px-6 lg:px-12">
        <div className="grid gap-10 md:grid-cols-3 text-center">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.value}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ ...spring, delay: i * 0.12 }}
            >
              <p
                className="text-5xl lg:text-6xl font-medium text-neutral-950 mb-3"
                style={{ letterSpacing: "-0.03em" }}
              >
                {stat.value}
              </p>
              <p className="text-sm text-neutral-400 leading-relaxed max-w-[240px] mx-auto">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
