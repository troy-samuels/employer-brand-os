/**
 * @module components/landing/prompt-intelligence
 * Infinite marquee of candidate prompt categories.
 */

"use client";

import { motion } from "framer-motion";

const PROMPTS = [
  { emoji: "💰", query: "What's the salary at [Company]?" },
  { emoji: "🏢", query: "What's it like to work at [Company]?" },
  { emoji: "🎁", query: "What benefits does [Company] offer?" },
  { emoji: "🏠", query: "Does [Company] allow remote work?" },
  { emoji: "🎯", query: "What's the interview process at [Company]?" },
  { emoji: "📈", query: "Is there career growth at [Company]?" },
  { emoji: "⭐", query: "What do employees say about [Company]?" },
  { emoji: "⚔️", query: "[Company] vs [Competitor] — who's better?" },
];

function MarqueeRow({ reverse = false }: { reverse?: boolean }) {
  const items = [...PROMPTS, ...PROMPTS]; // duplicate for seamless loop

  return (
    <div className="relative overflow-hidden" style={{
      maskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
      WebkitMaskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
    }}>
      <motion.div
        className="flex gap-3 w-max"
        animate={{ x: reverse ? ["0%", "-50%"] : ["-50%", "0%"] }}
        transition={{
          x: { repeat: Infinity, repeatType: "loop", duration: 30, ease: "linear" },
        }}
      >
        {items.map((p, i) => (
          <div
            key={`${p.query}-${i}`}
            className="shrink-0 flex items-center gap-2.5 rounded-full border border-neutral-100 bg-white px-5 py-2.5 text-sm text-neutral-500 opacity-60 hover:opacity-100 transition-opacity duration-200"
          >
            <span className="text-base">{p.emoji}</span>
            <span>&ldquo;{p.query}&rdquo;</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export default function PromptIntelligence() {
  return (
    <section className="py-20 lg:py-24 bg-neutral-50/40 overflow-hidden">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-12">
        <motion.h2
          className="text-2xl lg:text-3xl font-medium text-neutral-950 text-center mb-3"
          style={{ letterSpacing: "-0.03em" }}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          What candidates ask AI about you
        </motion.h2>
        <motion.p
          className="text-sm text-neutral-400 text-center mb-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          Millions of prompts every week. Is AI getting yours right?
        </motion.p>
      </div>

      <div className="space-y-3">
        <MarqueeRow />
        <MarqueeRow reverse />
      </div>
    </section>
  );
}
