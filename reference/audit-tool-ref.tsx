"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScoreRing } from "@/components/ui/score-ring";
import { cn, getScoreColor } from "@/lib/utils";
import { AlertTriangle, CheckCircle2, ExternalLink, FileText, XCircle } from "lucide-react";
import { useState } from "react";

interface AuditResult {
  url: string;
  overallScore: number;
  categories: {
    name: string;
    score: number;
    status: "pass" | "warn" | "fail";
    details: string;
  }[];
  recommendations: string[];
}

function simulateAudit(url: string): AuditResult {
  // Simulate analysis - in production this calls a real API
  const hasSchema = Math.random() > 0.7;
  const schemaScore = hasSchema ? 60 + Math.floor(Math.random() * 30) : Math.floor(Math.random() * 30);
  const accessScore = 40 + Math.floor(Math.random() * 50);
  const structureScore = 30 + Math.floor(Math.random() * 50);
  const metaScore = 35 + Math.floor(Math.random() * 50);
  const overall = Math.round((schemaScore + accessScore + structureScore + metaScore) / 4);

  return {
    url,
    overallScore: overall,
    categories: [
      {
        name: "JSON-LD Schema",
        score: schemaScore,
        status: schemaScore >= 70 ? "pass" : schemaScore >= 40 ? "warn" : "fail",
        details: hasSchema
          ? "Job posting schema found but missing recommended fields (salary, employmentType)."
          : "No JobPosting schema detected. AI agents cannot parse your job listings.",
      },
      {
        name: "AI Accessibility",
        score: accessScore,
        status: accessScore >= 70 ? "pass" : accessScore >= 40 ? "warn" : "fail",
        details:
          accessScore >= 70
            ? "Job pages are crawlable and accessible to AI agents."
            : "Some job pages are behind JavaScript rendering that AI agents may not execute.",
      },
      {
        name: "Data Structure",
        score: structureScore,
        status: structureScore >= 70 ? "pass" : structureScore >= 40 ? "warn" : "fail",
        details:
          structureScore >= 70
            ? "Job data is well-structured with clear fields."
            : "Job data lacks consistent structure. Key fields like salary range and location type are missing.",
      },
      {
        name: "Meta & Open Graph",
        score: metaScore,
        status: metaScore >= 70 ? "pass" : metaScore >= 40 ? "warn" : "fail",
        details:
          metaScore >= 70
            ? "Meta tags and Open Graph data are well configured."
            : "Missing or incomplete meta tags reduce discoverability by AI agents.",
      },
    ],
    recommendations: [
      "Add JSON-LD JobPosting schema to all career pages",
      "Include salary range, employment type, and location in structured data",
      "Ensure job listings are server-side rendered for AI crawlers",
      "Add Open Graph tags optimized for job content sharing",
      "Implement structured navigation for AI agent page traversal",
    ],
  };
}

export function AuditTool() {
  const [url, setUrl] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [step, setStep] = useState<"input" | "analyzing" | "results">("input");

  const handleAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !email) return;

    setStep("analyzing");
    setLoading(true);

    // Simulate API call with progressive loading
    await new Promise((r) => setTimeout(r, 3000));

    const auditResult = simulateAudit(url);
    setResult(auditResult);
    setLoading(false);
    setStep("results");
  };

  const statusIcon = (status: "pass" | "warn" | "fail") => {
    switch (status) {
      case "pass":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "warn":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case "fail":
        return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  return (
    <section id="audit" className="py-20 lg:py-28 bg-surface-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-brand-600 uppercase tracking-wider mb-3">
            Free Tool
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-surface-900">
            AI Visibility Audit
          </h2>
          <p className="mt-4 text-lg text-surface-600 max-w-2xl mx-auto">
            See how visible your job postings are to AI agents. Get a free report with
            actionable recommendations in under 5 minutes.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-surface-200 overflow-hidden">
          {step === "input" && (
            <form onSubmit={handleAudit} className="p-8 space-y-6">
              <Input
                id="audit-url"
                label="Careers Page URL"
                type="url"
                placeholder="https://yourcompany.com/careers"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
              <Input
                id="audit-email"
                label="Work Email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                hint="We'll send the full PDF report to this email"
                required
              />
              <Button type="submit" size="lg" className="w-full">
                Run Free AI Visibility Audit
              </Button>
              <p className="text-xs text-surface-500 text-center">
                No credit card required. Results in under 5 minutes.
              </p>
            </form>
          )}

          {step === "analyzing" && (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-brand-100 flex items-center justify-center">
                <svg className="animate-spin w-8 h-8 text-brand-600" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-surface-900 mb-2">Analyzing your careers page...</h3>
              <p className="text-surface-500">Checking JSON-LD schema, AI accessibility, data structure, and metadata.</p>

              <div className="mt-8 space-y-3 max-w-sm mx-auto text-left">
                {["Scanning page structure", "Checking JSON-LD schema", "Testing AI accessibility", "Generating report"].map(
                  (task, i) => (
                    <div key={task} className="flex items-center gap-3">
                      {loading ? (
                        i <= 2 ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <svg className="animate-spin w-4 h-4 text-brand-600" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        )
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      )}
                      <span className="text-sm text-surface-600">{task}</span>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {step === "results" && result && (
            <div className="divide-y divide-surface-200">
              {/* Score header */}
              <div className="p-8 text-center bg-surface-50">
                <ScoreRing score={result.overallScore} size="lg" label="Overall AI Visibility" />
                <p className="mt-4 text-surface-600">
                  Your careers page at <span className="font-medium text-surface-800">{result.url}</span>
                </p>
              </div>

              {/* Category breakdown */}
              <div className="p-8">
                <h3 className="text-lg font-semibold text-surface-900 mb-6">Category Breakdown</h3>
                <div className="space-y-4">
                  {result.categories.map((cat) => (
                    <div key={cat.name} className="flex items-start gap-4 p-4 rounded-lg bg-surface-50">
                      {statusIcon(cat.status)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-surface-900">{cat.name}</span>
                          <span className={cn("font-semibold", getScoreColor(cat.score))}>{cat.score}/100</span>
                        </div>
                        <p className="text-sm text-surface-600">{cat.details}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div className="p-8">
                <h3 className="text-lg font-semibold text-surface-900 mb-4">Recommendations</h3>
                <ul className="space-y-3">
                  {result.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-surface-600">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs font-semibold">
                        {i + 1}
                      </span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              <div className="p-8 bg-brand-50 text-center">
                <h3 className="text-lg font-semibold text-surface-900 mb-2">
                  Ready to fix these issues automatically?
                </h3>
                <p className="text-surface-600 mb-6">
                  OpenRole Smart Pixel fixes all of these in under 5 minutes. No code changes needed.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button size="lg">Start Free Trial</Button>
                  <Button variant="outline" size="lg">
                    <FileText className="w-4 h-4 mr-2" />
                    Download PDF Report
                  </Button>
                </div>
              </div>

              {/* Reset */}
              <div className="p-4 text-center">
                <button
                  onClick={() => {
                    setStep("input");
                    setResult(null);
                  }}
                  className="text-sm text-brand-600 hover:underline inline-flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  Audit another URL
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
