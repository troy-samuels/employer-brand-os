/**
 * @module components/landing/features
 * Module implementation for features.tsx.
 */

import { Eye, ShieldCheck, BarChart3 } from "lucide-react";

const features = [
  {
    icon: Eye,
    title: "See your Shadow Salary",
    description:
      "Find out exactly what AI tells candidates about your pay, culture, and benefits — and where it's getting things wrong.",
  },
  {
    icon: ShieldCheck,
    title: "Correct the record",
    description:
      "Publish verified facts that AI agents prioritise over stale Glassdoor data. You choose how much to share — from a trust signal to full transparency.",
  },
  {
    icon: BarChart3,
    title: "Prove it every Monday",
    description:
      "Get a weekly report showing where AI cited your company, what it corrected, and how your visibility compares to competitors.",
  },
];

/**
 * Executes Features.
 * @returns The resulting value.
 */
export default function Features() {
  return (
    <section id="how-it-works" className="py-16 lg:py-20 bg-white">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-12">
        <div className="mb-12">
          <p className="overline mb-3">How Rankwell works</p>
          <h2 className="text-3xl font-bold text-neutral-950 max-w-xl">
            Take control of what AI says about you
          </h2>
        </div>

        <div className="grid gap-10 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title}>
                <Icon className="h-6 w-6 text-brand-accent mb-4" strokeWidth={1.5} />
                <h3 className="text-lg font-semibold text-neutral-950 mb-2">
                  {feature.title}
                </h3>
                <p className="text-neutral-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
