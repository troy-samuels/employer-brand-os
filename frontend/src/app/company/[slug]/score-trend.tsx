"use client";

import { useEffect, useId, useRef, useState } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface ScorePoint {
  date: string;
  score: number;
}

interface ScoreTrendProps {
  history: ScorePoint[];
  companyName: string;
  /** Optional UK average line for context */
  ukAverage?: number;
}

const CHART_VIEWBOX_WIDTH = 600;
const CHART_VIEWBOX_HEIGHT = 180;

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function scoreColor(score: number): string {
  if (score >= 70) return "#0D9488";
  if (score >= 40) return "#d97706";
  return "#dc2626";
}

/* ------------------------------------------------------------------ */
/* Tooltip                                                             */
/* ------------------------------------------------------------------ */

interface TooltipData {
  x: number;
  y: number;
  score: number;
  date: string;
}

function Tooltip({ data }: { data: TooltipData }) {
  const xPercent = (data.x / CHART_VIEWBOX_WIDTH) * 100;
  const yPercent = (data.y / CHART_VIEWBOX_HEIGHT) * 100;
  const flipLeft = xPercent > 75;

  return (
    <div
      className="pointer-events-none absolute z-10 rounded-lg bg-neutral-900 px-3 py-2 text-xs shadow-lg transition-all duration-150"
      style={{
        left: `${xPercent}%`,
        top: `${yPercent}%`,
        transform: flipLeft
          ? "translate(calc(-100% - 8px), calc(-100% - 8px))"
          : "translate(8px, calc(-100% - 8px))",
      }}
    >
      <span className="font-semibold text-white tabular-nums">{data.score}/100</span>
      <span className="ml-1.5 text-neutral-400">{formatDate(data.date)}</span>
      {/* Arrow */}
      <div
        className="absolute top-full h-0 w-0 border-x-[5px] border-t-[5px] border-x-transparent border-t-neutral-900"
        style={{ left: flipLeft ? "auto" : 8, right: flipLeft ? 8 : "auto" }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

export function ScoreTrend({ history, companyName, ukAverage }: ScoreTrendProps) {
  const gradientId = useId().replace(/:/g, "_");
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredPoint, setHoveredPoint] = useState<TooltipData | null>(null);
  const [animated, setAnimated] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  // Trigger line-draw animation on mount / scroll into view
  useEffect(() => {
    if (!chartRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnimated(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(chartRef.current);
    return () => observer.disconnect();
  }, []);

  if (history.length < 2) {
    return null;
  }

  const latest = history[history.length - 1];
  const earliest = history[0];
  const delta = latest.score - earliest.score;

  // SVG chart dimensions
  const width = CHART_VIEWBOX_WIDTH;
  const height = CHART_VIEWBOX_HEIGHT;
  const padding = { top: 24, right: 30, bottom: 32, left: 44 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Calculate scales
  const scores = history.map((p) => p.score);
  const minScore = Math.max(0, Math.min(...scores) - 8);
  const maxScore = Math.min(100, Math.max(...scores) + 8);
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

  // Grid lines — 3 evenly spaced
  const gridLines = [minScore, Math.round((minScore + maxScore) / 2), maxScore];

  // Smart date label selection — avoid collisions
  const showDateLabel = (i: number): boolean => {
    if (i === 0 || i === history.length - 1) return true;
    if (history.length <= 5) return true;
    // For longer histories, show every nth to avoid overlap
    const step = Math.max(2, Math.ceil(history.length / 5));
    return i % step === 0;
  };

  // Calculate line length for stroke animation
  const pathLength = history.reduce((acc, p, i) => {
    if (i === 0) return 0;
    const dx = xScale(i) - xScale(i - 1);
    const dy = yScale(p.score) - yScale(history[i - 1].score);
    return acc + Math.sqrt(dx * dx + dy * dy);
  }, 0);

  return (
    <div ref={chartRef} className="rounded-2xl border border-neutral-200 bg-white p-6">
      {/* Header — stacks vertically on mobile */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-5">
        <div>
          <h3 className="text-base font-semibold text-neutral-950">Score History</h3>
          <p className="text-xs text-neutral-500">
            {companyName}&apos;s AI visibility over time
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {delta > 0 ? (
            <TrendingUp className="h-4 w-4 text-teal-500" />
          ) : delta < 0 ? (
            <TrendingDown className="h-4 w-4 text-red-500" />
          ) : (
            <Minus className="h-4 w-4 text-neutral-400" />
          )}
          <span
            className={`text-sm font-semibold tabular-nums ${
              delta > 0 ? "text-teal-600" : delta < 0 ? "text-red-600" : "text-neutral-500"
            }`}
          >
            {delta > 0 ? "+" : ""}
            {delta} points
          </span>
          <span className="text-xs text-neutral-500 ml-1">
            since {formatDate(earliest.date)}
          </span>
        </div>
      </div>

      {/* Chart with tooltip overlay */}
      <div className="relative">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto"
          preserveAspectRatio="xMidYMid meet"
          onMouseLeave={() => setHoveredPoint(null)}
        >
          <defs>
            <linearGradient id={`grad-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
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
                x={padding.left - 10}
                y={yScale(score) + 4}
                textAnchor="end"
                fill="#94a3b8"
                fontSize={10}
                fontFamily="inherit"
              >
                {score}
              </text>
            </g>
          ))}

          {/* UK average dashed line */}
          {ukAverage != null && ukAverage >= minScore && ukAverage <= maxScore && (
            <g>
              <line
                x1={padding.left}
                y1={yScale(ukAverage)}
                x2={width - padding.right}
                y2={yScale(ukAverage)}
                stroke="#cbd5e1"
                strokeWidth={1}
                strokeDasharray="4 3"
              />
              <text
                x={width - padding.right + 4}
                y={yScale(ukAverage) + 3}
                textAnchor="start"
                fill="#94a3b8"
                fontSize={9}
                fontFamily="inherit"
              >
                UK avg
              </text>
            </g>
          )}

          {/* Area fill — fades in after line draws */}
          <path
            d={areaPath}
            fill={`url(#grad-${gradientId})`}
            className="transition-opacity duration-700"
            style={{
              opacity: animated ? 1 : 0,
              transitionDelay: "0.6s",
            }}
          />

          {/* Line with draw animation */}
          <path
            d={linePath}
            fill="none"
            stroke={scoreColor(latest.score)}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              strokeDasharray: pathLength,
              strokeDashoffset: animated ? 0 : pathLength,
              transition: "stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          />

          {/* Data points — appear after line draws */}
          {history.map((p, i) => (
            <g
              key={i}
              style={{
                opacity: animated ? 1 : 0,
                transition: `opacity 0.3s ease ${0.6 + i * 0.05}s`,
              }}
            >
              {/* Invisible larger hit area for hover */}
              <circle
                cx={xScale(i)}
                cy={yScale(p.score)}
                r={14}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() =>
                  setHoveredPoint({ x: xScale(i), y: yScale(p.score), score: p.score, date: p.date })
                }
              />
              {/* Visible dot */}
              <circle
                cx={xScale(i)}
                cy={yScale(p.score)}
                r={hoveredPoint?.date === p.date ? 5 : 3.5}
                fill="white"
                stroke={scoreColor(p.score)}
                strokeWidth={2}
                className="transition-all duration-150"
              />
              {/* Date labels */}
              {showDateLabel(i) && (
                <text
                  x={xScale(i)}
                  y={height - 6}
                  textAnchor={i === 0 ? "start" : i === history.length - 1 ? "end" : "middle"}
                  fill="#94a3b8"
                  fontSize={9}
                  fontFamily="inherit"
                >
                  {formatDate(p.date)}
                </text>
              )}
            </g>
          ))}

          {/* Current score label at last point */}
          <g
            style={{
              opacity: animated ? 1 : 0,
              transition: `opacity 0.3s ease 0.9s`,
            }}
          >
            <text
              x={xScale(history.length - 1) + 8}
              y={yScale(latest.score) + 4}
              textAnchor="start"
              fill={scoreColor(latest.score)}
              fontSize={12}
              fontWeight={600}
              fontFamily="inherit"
            >
              {latest.score}
            </text>
          </g>
        </svg>

        {/* Tooltip */}
        {hoveredPoint && <Tooltip data={hoveredPoint} />}
      </div>

      {/* Footer */}
      {history.length >= 3 ? (
        <p className="text-xs text-neutral-500 mt-3 text-center">
          {history.length} data points · Updated with each audit
        </p>
      ) : (
        <p className="text-xs text-neutral-400 mt-3 text-center italic">
          Trend data building — each audit adds a data point
        </p>
      )}
    </div>
  );
}
