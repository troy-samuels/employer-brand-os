/**
 * @module components/landing/features
 * Bento grid with CSS spotlight hover effect.
 */

"use client";

import { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Search, FileSearch, BarChart3 } from "lucide-react";

const steps = [
  {
    icon: Search,
    label: "See what AI says",
    detail: "Real responses from ChatGPT, Claude, Perplexity and Gemini — word for word.",
  },
  {
    icon: FileSearch,
    label: "Find what's missing",
    detail: "Your employer brand audit report shows every gap — what AI can't answer about your salary, benefits, and culture.",
  },
  {
    icon: BarChart3,
    label: "Fill the gaps",
    detail: "A step-by-step Content Playbook to improve your employer branding. Publish on your site this week, see results within days.",
  },
];

const spring = { type: "spring" as const, stiffness: 200, damping: 20 };

function SpotlightCard({
  icon: Icon,
  label,
  detail,
  index,
}: {
  icon: typeof Search;
  label: string;
  detail: string;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      initial={{ opacity: 1, y: 0 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.05 }}
      transition={{ ...spring, delay: index * 0.1 }}
      className="group relative overflow-hidden rounded-2xl border border-neutral-100 bg-white p-8 transition-colors duration-300 hover:border-neutral-200"
    >
      {/* Spotlight gradient */}
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover:opacity-100 rounded-2xl"
        style={{
          background: `radial-gradient(500px circle at ${pos.x}px ${pos.y}px, rgba(13,148,136,0.06), transparent 40%)`,
        }}
      />

      <div className="relative z-10">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-50">
          <Icon className="h-5 w-5 text-brand-accent" strokeWidth={1.5} />
        </div>
        <h3 className="text-lg font-semibold text-neutral-950 mb-1.5" style={{ letterSpacing: "-0.02em" }}>
          {label}
        </h3>
        <p className="text-sm text-neutral-400 leading-relaxed">{detail}</p>
      </div>
    </motion.div>
  );
}

export default function Features() {
  return (
    <section id="how-it-works" className="py-20 lg:py-28 bg-white">
      <div className="max-w-[1000px] mx-auto px-6 lg:px-12">
        <motion.h2
          className="text-3xl lg:text-4xl font-medium text-neutral-950 text-center mb-16 lg:mb-20"
          style={{ letterSpacing: "-0.03em" }}
          initial={{ opacity: 1, y: 0 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.05 }}
          transition={spring}
        >
          See it. Find the gaps. Fix them.
        </motion.h2>

        <div className="grid gap-5 md:grid-cols-3">
          {steps.map((step, i) => (
            <SpotlightCard key={step.label} {...step} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
