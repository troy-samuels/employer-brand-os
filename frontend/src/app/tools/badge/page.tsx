/**
 * @module app/tools/badge/page
 * Embeddable AI Score Badge — companies embed their OpenRole score
 * on their careers page. This is a distribution play:
 * - Every badge is a backlink to OpenRole
 * - Every badge is social proof for the company
 * - Every badge drives candidates to check scores
 * - Every badge is free advertising
 *
 * Think: Glassdoor widget but for AI reputation.
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Copy, Check, Code2 } from "lucide-react";

import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";

/* ------------------------------------------------------------------ */
/* Badge generation                                                    */
/* ------------------------------------------------------------------ */

type BadgeStyle = "minimal" | "detailed" | "compact";
type BadgeTheme = "light" | "dark";

function scoreColor(score: number): string {
  if (score >= 70) return "#059669";
  if (score >= 40) return "#d97706";
  return "#dc2626";
}

function scoreLabel(score: number): string {
  if (score >= 70) return "Strong";
  if (score >= 40) return "Moderate";
  return "Needs Work";
}

function generateSvg(
  company: string,
  score: number,
  style: BadgeStyle,
  theme: BadgeTheme
): string {
  const color = scoreColor(score);
  const label = scoreLabel(score);
  const bg = theme === "dark" ? "#0a0a0a" : "#ffffff";
  const text = theme === "dark" ? "#ffffff" : "#0a0a0a";
  const muted = theme === "dark" ? "#a3a3a3" : "#737373";
  const border = theme === "dark" ? "#262626" : "#e5e5e5";

  if (style === "compact") {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="32" viewBox="0 0 200 32">
  <rect width="200" height="32" rx="6" fill="${bg}" stroke="${border}" stroke-width="1"/>
  <text x="8" y="20" font-family="system-ui,sans-serif" font-size="11" font-weight="600" fill="${text}">AI Score</text>
  <text x="62" y="20" font-family="system-ui,sans-serif" font-size="11" font-weight="700" fill="${color}">${score}/100</text>
  <text x="108" y="20" font-family="system-ui,sans-serif" font-size="9" fill="${muted}">by OpenRole</text>
</svg>`;
  }

  if (style === "minimal") {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="64" viewBox="0 0 240 64">
  <rect width="240" height="64" rx="12" fill="${bg}" stroke="${border}" stroke-width="1"/>
  <text x="16" y="24" font-family="system-ui,sans-serif" font-size="11" fill="${muted}">AI Employer Visibility</text>
  <text x="16" y="46" font-family="system-ui,sans-serif" font-size="20" font-weight="700" fill="${color}">${score}/100</text>
  <text x="80" y="46" font-family="system-ui,sans-serif" font-size="12" fill="${muted}">${label}</text>
  <text x="168" y="46" font-family="system-ui,sans-serif" font-size="9" fill="${muted}">openrole.co.uk</text>
</svg>`;
  }

  // detailed
  return `<svg xmlns="http://www.w3.org/2000/svg" width="280" height="96" viewBox="0 0 280 96">
  <rect width="280" height="96" rx="12" fill="${bg}" stroke="${border}" stroke-width="1"/>
  <text x="16" y="24" font-family="system-ui,sans-serif" font-size="13" font-weight="600" fill="${text}">${company}</text>
  <text x="16" y="42" font-family="system-ui,sans-serif" font-size="10" fill="${muted}">AI Employer Visibility Score</text>
  <text x="16" y="72" font-family="system-ui,sans-serif" font-size="28" font-weight="700" fill="${color}">${score}</text>
  <text x="52" y="72" font-family="system-ui,sans-serif" font-size="14" fill="${muted}">/100</text>
  <rect x="90" y="56" width="80" height="22" rx="11" fill="${color}" opacity="0.1"/>
  <text x="107" y="71" font-family="system-ui,sans-serif" font-size="10" font-weight="600" fill="${color}">${label}</text>
  <text x="16" y="88" font-family="system-ui,sans-serif" font-size="9" fill="${muted}">Verified by OpenRole · openrole.co.uk</text>
</svg>`;
}

function generateEmbedCode(
  company: string,
  slug: string,
  score: number,
  style: BadgeStyle,
  theme: BadgeTheme
): string {
  const svg = generateSvg(company, score, style, theme);
  const encodedSvg = `data:image/svg+xml,${encodeURIComponent(svg)}`;
  return `<!-- OpenRole AI Score Badge -->
<a href="https://openrole.co.uk/company/${slug}" target="_blank" rel="noopener" title="${company} AI Employer Visibility Score: ${score}/100">
  <img src="${encodedSvg}" alt="${company} AI Score: ${score}/100 - Verified by OpenRole" />
</a>`;
}

function generateSimpleEmbedCode(
  company: string,
  slug: string,
): string {
  return `<!-- OpenRole AI Score Badge (auto-updating) -->
<a href="https://openrole.co.uk/company/${slug}" target="_blank" rel="noopener">
  <img src="https://openrole.co.uk/api/badge/${slug}" alt="AI Visibility Score - ${company} - OpenRole" />
</a>`;
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function BadgePage() {
  const [company, setCompany] = useState("");
  const [slug, setSlug] = useState("");
  const [score, setScore] = useState(65);
  const [style, setStyle] = useState<BadgeStyle>("detailed");
  const [theme, setTheme] = useState<BadgeTheme>("light");
  const [copied, setCopied] = useState(false);
  const [copiedSimple, setCopiedSimple] = useState(false);

  const handleCompanyChange = (value: string) => {
    setCompany(value);
    setSlug(
      value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
    );
  };

  const svgOutput = company
    ? generateSvg(company, score, style, theme)
    : null;
  const embedCode = company
    ? generateEmbedCode(company, slug, score, style, theme)
    : null;
  const simpleEmbed = company
    ? generateSimpleEmbedCode(company, slug)
    : null;

  const handleCopy = async () => {
    if (!embedCode) return;
    await navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main>
        {/* ── Hero ─────────────────────────── */}
        <section className="bg-white border-b border-slate-200 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_var(--neutral-200)_1px,_transparent_0)] [background-size:32px_32px] opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-white to-transparent" />
          <div className="relative mx-auto max-w-[1200px] px-6 lg:px-12 py-16 lg:py-20">
            <div className="flex items-start gap-3 mb-5">
              <Code2 className="h-6 w-6 text-brand-accent mt-0.5" />
              <p className="overline">Free Tool</p>
            </div>
            <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-slate-900 tracking-tight max-w-2xl">
              AI Score Badge
            </h1>
            <p className="mt-4 text-lg text-slate-500 max-w-2xl leading-relaxed">
              Embed your AI employer visibility score on your careers page.
              Show candidates you take AI reputation seriously — and stand out
              from competitors who don&apos;t.
            </p>
          </div>
        </section>

        {/* ── Generator ────────────────────── */}
        <section className="py-12 lg:py-16">
          <div className="mx-auto max-w-[1200px] px-6 lg:px-12">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Controls */}
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-900">
                  Customise your badge
                </h2>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Company name
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => handleCompanyChange(e.target.value)}
                    placeholder="e.g. Monzo"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-950/10 focus:border-neutral-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Score (from your audit)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={score}
                      onChange={(e) => setScore(Number(e.target.value))}
                      className="flex-1"
                    />
                    <span
                      className="text-lg font-bold tabular-nums min-w-[3rem] text-right"
                      style={{ color: scoreColor(score) }}
                    >
                      {score}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Style
                  </label>
                  <div className="flex gap-2">
                    {(["detailed", "minimal", "compact"] as BadgeStyle[]).map(
                      (s) => (
                        <button
                          key={s}
                          onClick={() => setStyle(s)}
                          className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                            style === s
                              ? "bg-teal-600 text-white"
                              : "bg-white border border-slate-200 text-slate-600 hover:border-neutral-300"
                          }`}
                        >
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Theme
                  </label>
                  <div className="flex gap-2">
                    {(["light", "dark"] as BadgeTheme[]).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTheme(t)}
                        className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                          theme === t
                            ? "bg-teal-600 text-white"
                            : "bg-white border border-slate-200 text-slate-600 hover:border-neutral-300"
                        }`}
                      >
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                  <p className="text-xs text-amber-700">
                    <strong>Note:</strong> Use the score from your{" "}
                    <Link
                      href="/#audit"
                      className="underline hover:text-amber-900"
                    >
                      free OpenRole audit
                    </Link>
                    . Displaying an inaccurate score is against our terms.
                  </p>
                </div>
              </div>

              {/* Preview + code */}
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-900">Preview</h2>

                {/* Badge preview */}
                <div
                  className={`rounded-2xl border p-8 flex items-center justify-center ${
                    theme === "dark"
                      ? "bg-slate-800 border-neutral-700"
                      : "bg-slate-100 border-slate-200"
                  }`}
                >
                  {svgOutput ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: svgOutput }}
                    />
                  ) : (
                    <p className="text-sm text-slate-400">
                      Enter a company name to preview
                    </p>
                  )}
                </div>

                {/* Embed code */}
                {embedCode && (
                  <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 bg-slate-50/80">
                      <span className="text-xs font-mono text-slate-500">
                        HTML embed code
                      </span>
                      <button
                        onClick={handleCopy}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
                      >
                        {copied ? (
                          <Check className="h-3.5 w-3.5 text-teal-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                        {copied ? "Copied" : "Copy code"}
                      </button>
                    </div>
                    <pre className="p-4 text-xs font-mono text-neutral-700 whitespace-pre-wrap overflow-auto max-h-[200px]">
                      {embedCode}
                    </pre>
                  </div>
                )}

                {/* Simple API badge */}
                {simpleEmbed && (
                  <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 bg-slate-50/80">
                      <span className="text-xs font-mono text-slate-500">
                        Simple badge (auto-updating)
                      </span>
                      <button
                        onClick={async () => {
                          await navigator.clipboard.writeText(simpleEmbed);
                          setCopiedSimple(true);
                          setTimeout(() => setCopiedSimple(false), 2000);
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
                      >
                        {copiedSimple ? (
                          <Check className="h-3.5 w-3.5 text-teal-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                        {copiedSimple ? "Copied" : "Copy code"}
                      </button>
                    </div>
                    <pre className="p-4 text-xs font-mono text-neutral-700 whitespace-pre-wrap overflow-auto max-h-[200px]">
                      {simpleEmbed}
                    </pre>
                    <div className="px-4 py-3 border-t border-neutral-100 bg-slate-50/60">
                      <p className="text-xs text-slate-500">
                        This version fetches your score automatically from the OpenRole API — it always stays up to date.
                      </p>
                    </div>
                  </div>
                )}

                {/* Installation */}
                {embedCode && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <h3 className="text-sm font-semibold text-slate-900 mb-3">
                      How to add to your site
                    </h3>
                    <ol className="space-y-2 text-sm text-slate-600">
                      <li>
                        <strong>1.</strong> Copy either embed code above
                      </li>
                      <li>
                        <strong>2.</strong> Paste into your careers page HTML
                      </li>
                      <li>
                        <strong>3.</strong> The badge links to your OpenRole
                        profile automatically
                      </li>
                    </ol>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ──────────────────────────── */}
        <section className="py-12 border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-2xl px-6 text-center">
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              Don&apos;t have a score yet?
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              Run a free audit to get your AI visibility score, then come back
              to generate your badge.
            </p>
            <Link
              href="/#audit"
              className="inline-flex items-center justify-center rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-700 transition-colors"
            >
              Get your score
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
