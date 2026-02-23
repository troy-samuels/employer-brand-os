/**
 * @module app/company/[slug]/score-gauge
 * Animated SVG arc gauge for the AI visibility score.
 * Client component for CSS animation.
 */

"use client";

import { useEffect, useState } from "react";

interface ScoreGaugeProps {
  score: number;
  size?: number;
}

function scoreGradient(score: number): [string, string] {
  if (score >= 70) return ["#0d9488", "#14b8a6"]; // teal
  if (score >= 50) return ["#0d9488", "#2dd4bf"]; // teal lighter
  if (score >= 30) return ["#d97706", "#f59e0b"]; // amber
  return ["#dc2626", "#f87171"]; // red
}

function scoreLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Needs work";
  if (score >= 20) return "Poor";
  return "Critical";
}

export function ScoreGauge({ score, size = 160 }: ScoreGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [colors] = useState(() => scoreGradient(score));

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = Math.PI * radius; // half circle
  const progress = (animatedScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size / 2 + 30 }}>
        <svg
          width={size}
          height={size / 2 + strokeWidth}
          viewBox={`0 0 ${size} ${size / 2 + strokeWidth}`}
          className="overflow-visible"
        >
          <defs>
            <linearGradient id={`gauge-grad-${score}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={colors[0]} />
              <stop offset="100%" stopColor={colors[1]} />
            </linearGradient>
          </defs>
          {/* Background arc */}
          <path
            d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-100"
            strokeLinecap="round"
          />
          {/* Progress arc */}
          <path
            d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
            fill="none"
            stroke={`url(#gauge-grad-${score})`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            style={{
              transition: "stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />
        </svg>
        {/* Score number in centre */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-end pb-1"
          style={{ height: size / 2 + 30 }}
        >
          <span
            className="text-5xl font-bold tabular-nums tracking-tight"
            style={{ color: colors[0] }}
          >
            {score}
          </span>
          <span className="text-sm text-slate-400 font-medium -mt-1">out of 100</span>
        </div>
      </div>
      <span
        className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold mt-1"
        style={{
          backgroundColor: `${colors[0]}15`,
          color: colors[0],
        }}
      >
        {scoreLabel(score)}
      </span>
    </div>
  );
}
