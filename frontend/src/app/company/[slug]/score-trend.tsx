"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface ScorePoint {
  date: string;
  score: number;
}

interface ScoreTrendProps {
  history: ScorePoint[];
  companyName: string;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function scoreColor(score: number): string {
  if (score >= 70) return "#0D9488";
  if (score >= 40) return "#d97706";
  return "#dc2626";
}

export function ScoreTrend({ history, companyName }: ScoreTrendProps) {
  if (history.length < 2) return null;

  const latest = history[history.length - 1];
  const earliest = history[0];
  const delta = latest.score - earliest.score;

  // SVG chart dimensions
  const width = 600;
  const height = 160;
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Calculate scales
  const scores = history.map((p) => p.score);
  const minScore = Math.max(0, Math.min(...scores) - 5);
  const maxScore = Math.min(100, Math.max(...scores) + 5);
  const scoreRange = maxScore - minScore || 1;

  const xScale = (i: number) => padding.left + (i / (history.length - 1)) * chartWidth;
  const yScale = (score: number) =>
    padding.top + chartHeight - ((score - minScore) / scoreRange) * chartHeight;

  // Build SVG path
  const linePath = history
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xScale(i)} ${yScale(p.score)}`)
    .join(" ");

  // Gradient fill area
  const areaPath = `${linePath} L ${xScale(history.length - 1)} ${yScale(minScore)} L ${xScale(0)} ${yScale(minScore)} Z`;

  // Grid lines (horizontal)
  const gridLines = [minScore, Math.round((minScore + maxScore) / 2), maxScore];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Score History</h3>
          <p className="text-xs text-slate-400">
            {companyName}&apos;s AI visibility over time
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {delta > 0 ? (
            <TrendingUp className="h-4 w-4 text-teal-500" />
          ) : delta < 0 ? (
            <TrendingDown className="h-4 w-4 text-red-500" />
          ) : (
            <Minus className="h-4 w-4 text-slate-400" />
          )}
          <span
            className={`text-sm font-bold ${
              delta > 0 ? "text-teal-600" : delta < 0 ? "text-red-600" : "text-slate-500"
            }`}
          >
            {delta > 0 ? "+" : ""}
            {delta} points
          </span>
          <span className="text-xs text-slate-400 ml-1">
            since {formatDate(earliest.date)}
          </span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={scoreColor(latest.score)} stopOpacity={0.15} />
            <stop offset="100%" stopColor={scoreColor(latest.score)} stopOpacity={0.02} />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {gridLines.map((score) => (
          <g key={score}>
            <line
              x1={padding.left}
              y1={yScale(score)}
              x2={width - padding.right}
              y2={yScale(score)}
              stroke="#f1f5f9"
              strokeWidth={1}
            />
            <text
              x={padding.left - 8}
              y={yScale(score) + 4}
              textAnchor="end"
              className="fill-slate-400"
              fontSize={10}
            >
              {score}
            </text>
          </g>
        ))}

        {/* Area fill */}
        <path d={areaPath} fill="url(#scoreGradient)" />

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke={scoreColor(latest.score)}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {history.map((p, i) => (
          <g key={i}>
            <circle
              cx={xScale(i)}
              cy={yScale(p.score)}
              r={3.5}
              fill="white"
              stroke={scoreColor(p.score)}
              strokeWidth={2}
            />
            {/* Show date labels for first, last, and every ~3rd point */}
            {(i === 0 || i === history.length - 1 || i % Math.max(1, Math.floor(history.length / 4)) === 0) && (
              <text
                x={xScale(i)}
                y={height - 6}
                textAnchor={i === 0 ? "start" : i === history.length - 1 ? "end" : "middle"}
                className="fill-slate-400"
                fontSize={9}
              >
                {formatDate(p.date)}
              </text>
            )}
          </g>
        ))}
      </svg>

      {history.length >= 3 && (
        <p className="text-xs text-slate-400 mt-2 text-center">
          {history.length} data points · Updated with each audit
        </p>
      )}
    </div>
  );
}
