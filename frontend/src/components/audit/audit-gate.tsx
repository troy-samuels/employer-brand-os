"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";

export function AuditGate() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg mx-auto text-center py-10"
      >
        <h3 className="text-lg font-semibold text-neutral-950">
          Check your inbox
        </h3>
        <p className="text-sm text-neutral-500 mt-2 max-w-sm mx-auto leading-relaxed">
          Your full AI visibility report is on its way. It covers what
          ChatGPT, Claude and Perplexity actually say about you.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="w-full max-w-lg mx-auto rounded-2xl bg-white p-7 shadow-[0_2px_16px_rgba(28,25,23,0.06),0_1px_4px_rgba(28,25,23,0.04)] text-center space-y-5"
    >
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-neutral-950">
          Want the full picture?
        </h2>
        <p className="text-sm text-neutral-500 leading-relaxed max-w-sm mx-auto">
          See exactly what AI tells candidates about your company —
          and what you can do about it.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Work email"
          required
          aria-label="Work email"
          className="flex-1 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-950 placeholder:text-neutral-400 focus:border-brand-accent focus:bg-white focus:ring-2 focus:ring-brand-accent/20 focus:outline-none transition-all duration-200"
        />
        <button
          type="submit"
          className="rounded-xl bg-neutral-950 px-5 py-3 text-sm font-medium text-white hover:bg-neutral-800 active:scale-[0.98] transition-all duration-150"
        >
          Send report
        </button>
      </form>

      <p className="text-xs text-neutral-400">
        Free, no card, no spam.
      </p>
    </motion.div>
  );
}
