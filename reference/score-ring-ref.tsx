"use client";

import { cn, getScoreColor, getScoreLabel } from "@/lib/utils";

interface ScoreRingProps {
  score: number;
  size?: "sm" | "md" | "lg";
  label?: string;
}

export function ScoreRing({ score, size = "md", label }: ScoreRingProps) {
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (score / 100) * circumference;

  const dimensions = {
    sm: "w-20 h-20",
    md: "w-32 h-32",
    lg: "w-40 h-40",
  };

  const textSize = {
    sm: "text-lg",
    md: "text-3xl",
    lg: "text-4xl",
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={cn("relative", dimensions[size])}>
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="8" />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={score >= 80 ? "#22c55e" : score >= 60 ? "#eab308" : score >= 40 ? "#f97316" : "#ef4444"}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn("font-bold", textSize[size], getScoreColor(score))}>{score}</span>
        </div>
      </div>
      {label && <span className="text-sm text-surface-500">{label}</span>}
      <span className={cn("text-xs font-medium", getScoreColor(score))}>{getScoreLabel(score)}</span>
    </div>
  );
}
