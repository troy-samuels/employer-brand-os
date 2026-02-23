/**
 * @module app/company/[slug]/score-bar
 * Animated horizontal progress bar for check categories.
 */

"use client";

import { useEffect, useState } from "react";

interface ScoreBarProps {
  points: number;
  maxPoints: number;
  status: "pass" | "partial" | "fail";
}

const statusColor = {
  pass: { bg: "bg-teal-500", track: "bg-teal-50" },
  partial: { bg: "bg-amber-400", track: "bg-amber-50" },
  fail: { bg: "bg-red-400", track: "bg-red-50" },
};

export function ScoreBar({ points, maxPoints, status }: ScoreBarProps) {
  const [width, setWidth] = useState(0);
  const pct = maxPoints > 0 ? (points / maxPoints) * 100 : 0;

  useEffect(() => {
    const timer = setTimeout(() => setWidth(pct), 200);
    return () => clearTimeout(timer);
  }, [pct]);

  const colors = statusColor[status];

  return (
    <div className={`h-2 w-full rounded-full ${colors.track} overflow-hidden`}>
      <div
        className={`h-full rounded-full ${colors.bg}`}
        style={{
          width: `${width}%`,
          transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      />
    </div>
  );
}
