"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface ScoreGaugeProps {
  score: number;
  companyName: string;
}

function getScoreColour(score: number): string {
  if (score <= 33) return "var(--status-critical)";
  if (score <= 66) return "var(--status-warning)";
  return "var(--status-verified)";
}

function getVerdict(score: number): string {
  if (score <= 20) return "Needs urgent attention";
  if (score <= 40) return "Significant gaps found";
  if (score <= 60) return "Room for improvement";
  if (score <= 80) return "Looking strong";
  return "Best in class";
}

export function ScoreGauge({ score, companyName }: ScoreGaugeProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const steps = 50;
    const inc = score / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      setCount(Math.min(Math.round(inc * step), score));
      if (step >= steps) clearInterval(timer);
    }, duration / steps);

    return () => clearInterval(timer);
  }, [score]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center space-y-5"
    >
      {/* Company */}
      <p className="text-sm font-medium tracking-wide text-neutral-500 uppercase">
        {companyName}
      </p>

      {/* Score */}
      <div className="relative inline-block">
        <span
          className="text-[7rem] leading-none font-normal tabular-nums"
          style={{
            fontFamily: "var(--font-display)",
            color: getScoreColour(score),
          }}
        >
          {count}
        </span>
        <span
          className="absolute -right-10 top-6 text-lg font-normal text-neutral-400"
          style={{ fontFamily: "var(--font-display)" }}
        >
          /100
        </span>
      </div>

      {/* Verdict */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-base text-neutral-600"
      >
        {getVerdict(score)}
      </motion.p>
    </motion.div>
  );
}
