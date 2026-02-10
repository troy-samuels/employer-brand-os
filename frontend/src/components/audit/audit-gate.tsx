/**
 * @module components/audit/audit-gate
 * Module implementation for audit-gate.tsx.
 */

"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";

interface AuditGateProps {
  score?: number;
  companySlug?: string;
}

function getCtaCopy(score: number) {
  if (score >= 61) {
    return {
      headline: "You're ahead of most employers — claim your verified profile",
      description:
        "Lock in your advantage. A verified AI profile ensures your employer brand stays accurate as AI models update.",
      button: "Claim your profile",
    };
  }
  if (score >= 31) {
    return {
      headline: "You're making progress — close the gaps",
      description:
        "A few targeted fixes will dramatically improve what AI tells candidates about you. Get the full breakdown.",
      button: "Get your report",
    };
  }
  return {
    headline: "Want the full picture?",
    description:
      "See exactly what AI tells candidates about your company — and what you can do about it.",
    button: "Send report",
  };
}

/**
 * Executes AuditGate.
 * @param param1 - param1 input.
 * @returns The resulting value.
 */
export function AuditGate({ score = 0, companySlug }: AuditGateProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/audit/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, companySlug, score }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const cta = getCtaCopy(score);

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
          {cta.headline}
        </h2>
        <p className="text-sm text-neutral-500 leading-relaxed max-w-sm mx-auto">
          {cta.description}
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
          disabled={loading}
          className="rounded-xl bg-neutral-950 px-5 py-3 text-sm font-medium text-white hover:bg-neutral-800 active:scale-[0.98] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Sending…" : cta.button}
        </button>
      </form>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <p className="text-xs text-neutral-400">
        Free, no card, no spam.
      </p>
    </motion.div>
  );
}
