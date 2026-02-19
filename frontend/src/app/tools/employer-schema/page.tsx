/**
 * @module app/tools/employer-schema/page
 * Employer Schema Generator — a free tool that generates JSON-LD
 * structured data (Organization, JobPosting, FAQPage,
 * EmployerAggregateRating) for any employer.
 *
 * Replaces the old llms-txt generator: research proved AI bots
 * don't read llms.txt, but structured data delivers a 30-40 %
 * citation improvement.
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Copy,
  Check,
  Code2,
  Download,
  Lightbulb,
  Zap,
  Globe,
} from "lucide-react";

import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface FormData {
  companyName: string;
  domain: string;
  industry: string;
  headquarters: string;
  founded: string;
  employees: string;
  description: string;
  mission: string;
  culture: string;
  benefits: string;
  salaryRange: string;
  remotePolicy: string;
  techStack: string;
  careersUrl: string;
  glassdoorUrl: string;
  linkedinUrl: string;
}

/* ------------------------------------------------------------------ */
/*  Schema generators                                                  */
/* ------------------------------------------------------------------ */

function buildOrganizationSchema(d: FormData) {
  const domain = d.domain.replace(/^https?:\/\//, "");
  const sameAs: string[] = [];
  if (d.linkedinUrl) sameAs.push(d.linkedinUrl);
  if (d.glassdoorUrl) sameAs.push(d.glassdoorUrl);

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: d.companyName,
    url: `https://${domain}`,
    description: d.description || `${d.companyName} is a ${d.industry || ""} company.`,
  };

  if (d.industry) schema.industry = d.industry;
  if (d.founded) schema.foundingDate = d.founded;
  if (d.headquarters) {
    schema.address = {
      "@type": "PostalAddress",
      addressLocality: d.headquarters,
    };
  }
  if (d.employees) {
    schema.numberOfEmployees = {
      "@type": "QuantitativeValue",
      value: d.employees,
    };
  }
  if (sameAs.length > 0) schema.sameAs = sameAs;

  return schema;
}

function buildJobPostingSchema(d: FormData) {
  const domain = d.domain.replace(/^https?:\/\//, "");

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: "[JOB_TITLE — replace with actual title]",
    description: "[JOB_DESCRIPTION — replace with the full role description]",
    datePosted: new Date().toISOString().split("T")[0],
    validThrough: "[EXPIRY_DATE — e.g. 2026-06-30]",
    hiringOrganization: {
      "@type": "Organization",
      name: d.companyName,
      sameAs: `https://${domain}`,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: d.headquarters || "[CITY]",
        addressCountry: "[COUNTRY_CODE — e.g. GB, US]",
      },
    },
  };

  if (d.remotePolicy) {
    const lower = d.remotePolicy.toLowerCase();
    if (lower.includes("remote") && lower.includes("hybrid")) {
      schema.jobLocationType = "TELECOMMUTE";
      schema.applicantLocationRequirements = {
        "@type": "Country",
        name: "[COUNTRY — e.g. United Kingdom]",
      };
    } else if (lower.includes("remote")) {
      schema.jobLocationType = "TELECOMMUTE";
    }
  }

  if (d.salaryRange) {
    schema.baseSalary = {
      "@type": "MonetaryAmount",
      currency: "[CURRENCY — e.g. GBP, USD]",
      value: {
        "@type": "QuantitativeValue",
        minValue: "[MIN_SALARY — e.g. 55000]",
        maxValue: "[MAX_SALARY — e.g. 120000]",
        unitText: "YEAR",
      },
    };
    schema["//baseSalary_hint"] = `Parsed from your input: "${d.salaryRange}". Replace placeholders with real numbers.`;
  }

  if (d.careersUrl) {
    schema.url = d.careersUrl;
  }

  return schema;
}

function buildFAQPageSchema(d: FormData) {
  const faqs: { question: string; answer: string }[] = [];

  if (d.culture) {
    faqs.push({
      question: `What is it like to work at ${d.companyName}?`,
      answer: d.culture,
    });
  }

  if (d.benefits) {
    faqs.push({
      question: `What benefits does ${d.companyName} offer?`,
      answer: d.benefits,
    });
  }

  if (d.remotePolicy) {
    faqs.push({
      question: `Does ${d.companyName} offer remote work?`,
      answer: d.remotePolicy,
    });
  }

  if (d.techStack) {
    faqs.push({
      question: `What is the tech stack at ${d.companyName}?`,
      answer: d.techStack,
    });
  }

  if (d.salaryRange) {
    faqs.push({
      question: `What is the salary range at ${d.companyName}?`,
      answer: d.salaryRange,
    });
  }

  // Fallback: always have at least one FAQ
  if (faqs.length === 0) {
    faqs.push({
      question: `What does ${d.companyName} do?`,
      answer: d.description || `${d.companyName} is a company in the ${d.industry || "technology"} industry.`,
    });
  }

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };
}

function buildEmployerAggregateRatingSchema(d: FormData) {
  const domain = d.domain.replace(/^https?:\/\//, "");

  return {
    "@context": "https://schema.org",
    "@type": "EmployerAggregateRating",
    itemReviewed: {
      "@type": "Organization",
      name: d.companyName,
      sameAs: `https://${domain}`,
    },
    ratingValue: "[YOUR_RATING — e.g. 4.2]",
    bestRating: "5",
    worstRating: "1",
    ratingCount: "[NUMBER_OF_RATINGS — e.g. 312]",
    "//instructions":
      "Replace the placeholder values above with real data from Glassdoor, Indeed, or your internal surveys. Do NOT publish fake ratings.",
  };
}

/* ------------------------------------------------------------------ */
/*  Schema block descriptor                                            */
/* ------------------------------------------------------------------ */

interface SchemaBlock {
  id: string;
  label: string;
  description: string;
  data: Record<string, unknown>;
}

function generateAllSchemas(d: FormData): SchemaBlock[] {
  return [
    {
      id: "organization",
      label: "Organization",
      description: "Tells AI who your company is, where you're based, and how to find you.",
      data: buildOrganizationSchema(d),
    },
    {
      id: "job-posting",
      label: "JobPosting (template)",
      description:
        "An example job posting with your company details pre-filled. Replace placeholder fields for each role.",
      data: buildJobPostingSchema(d),
    },
    {
      id: "faq-page",
      label: "FAQPage",
      description:
        "Auto-generated FAQ entries from your form data. AI models love FAQ schema for employer brand queries.",
      data: buildFAQPageSchema(d),
    },
    {
      id: "aggregate-rating",
      label: "EmployerAggregateRating",
      description:
        "Template for employer ratings. Fill in real data from Glassdoor or internal surveys before publishing.",
      data: buildEmployerAggregateRatingSchema(d),
    },
  ];
}

/* ------------------------------------------------------------------ */
/*  Copy-to-script helper                                              */
/* ------------------------------------------------------------------ */

function toScriptTag(data: Record<string, unknown>): string {
  return `<script type="application/ld+json">\n${JSON.stringify(data, null, 2)}\n</script>`;
}

/* ------------------------------------------------------------------ */
/*  SchemaCodeBlock component                                          */
/* ------------------------------------------------------------------ */

function SchemaCodeBlock({
  block,
}: {
  block: SchemaBlock;
}) {
  const [copied, setCopied] = useState(false);
  const code = toScriptTag(block.data);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 bg-slate-50/80">
        <div>
          <span className="text-xs font-mono font-semibold text-slate-700">
            {block.label}
          </span>
          <p className="text-xs text-slate-500 mt-0.5">{block.description}</p>
        </div>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors shrink-0 ml-3"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-teal-500" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="p-4 text-xs font-mono text-neutral-700 whitespace-pre-wrap overflow-auto max-h-[400px] leading-relaxed">
        {code}
      </pre>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function EmployerSchemaGenerator() {
  const [formData, setFormData] = useState<FormData>({
    companyName: "",
    domain: "",
    industry: "",
    headquarters: "",
    founded: "",
    employees: "",
    description: "",
    mission: "",
    culture: "",
    benefits: "",
    salaryRange: "",
    remotePolicy: "",
    techStack: "",
    careersUrl: "",
    glassdoorUrl: "",
    linkedinUrl: "",
  });
  const [schemas, setSchemas] = useState<SchemaBlock[] | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const canGenerate =
    formData.companyName.trim() !== "" &&
    formData.domain.trim() !== "" &&
    formData.description.trim() !== "";

  const handleGenerate = () => {
    if (!canGenerate) return;
    setSchemas(generateAllSchemas(formData));
  };

  const handleCopyAll = async () => {
    if (!schemas) return;
    const all = schemas.map((s) => toScriptTag(s.data)).join("\n\n");
    await navigator.clipboard.writeText(all);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleDownload = () => {
    if (!schemas) return;
    const payload = JSON.stringify(
      schemas.map((s) => s.data),
      null,
      2
    );
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "employer-schema.json";
    a.click();
    URL.revokeObjectURL(url);
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
              Employer Schema Generator
            </h1>
            <p className="mt-4 text-lg text-slate-500 max-w-2xl leading-relaxed">
              Generate{" "}
              <code className="text-sm bg-slate-100 px-1.5 py-0.5 rounded font-mono">
                JSON-LD
              </code>{" "}
              structured data for your careers page — the proven way to help AI
              models accurately represent your employer brand. Schema.org markup
              delivers a 30-40% improvement in AI citations.
            </p>

            {/* Why it matters */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  icon: <Lightbulb className="h-5 w-5 text-amber-500" />,
                  title: "AI actually reads it",
                  desc: "Every major AI model parses JSON-LD. Structured data is the #1 citation factor after brand size.",
                },
                {
                  icon: <Zap className="h-5 w-5 text-teal-500" />,
                  title: "4 schema types generated",
                  desc: "Organization, JobPosting, FAQ, and EmployerAggregateRating — all from one form.",
                },
                {
                  icon: <Globe className="h-5 w-5 text-blue-500" />,
                  title: "Works everywhere",
                  desc: "Paste into your HTML head, use Google Tag Manager, or automate with Rankwell's Smart Pixel.",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-slate-200 bg-white p-4"
                >
                  {item.icon}
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {item.title}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Generator ────────────────────── */}
        <section className="py-12 lg:py-16">
          <div className="mx-auto max-w-[1200px] px-6 lg:px-12">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* ── Form ── */}
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-900">
                  Your company details
                </h2>

                {/* Required */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Company name *
                    </label>
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) =>
                        handleChange("companyName", e.target.value)
                      }
                      placeholder="e.g. Monzo"
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-950/10 focus:border-neutral-300"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Domain *
                      </label>
                      <input
                        type="text"
                        value={formData.domain}
                        onChange={(e) =>
                          handleChange("domain", e.target.value)
                        }
                        placeholder="monzo.com"
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-950/10 focus:border-neutral-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Industry
                      </label>
                      <input
                        type="text"
                        value={formData.industry}
                        onChange={(e) =>
                          handleChange("industry", e.target.value)
                        }
                        placeholder="Fintech"
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-950/10 focus:border-neutral-300"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Headquarters
                      </label>
                      <input
                        type="text"
                        value={formData.headquarters}
                        onChange={(e) =>
                          handleChange("headquarters", e.target.value)
                        }
                        placeholder="London, UK"
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-950/10 focus:border-neutral-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Founded
                      </label>
                      <input
                        type="text"
                        value={formData.founded}
                        onChange={(e) =>
                          handleChange("founded", e.target.value)
                        }
                        placeholder="2015"
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-950/10 focus:border-neutral-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Employees
                      </label>
                      <input
                        type="text"
                        value={formData.employees}
                        onChange={(e) =>
                          handleChange("employees", e.target.value)
                        }
                        placeholder="3,000+"
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-950/10 focus:border-neutral-300"
                      />
                    </div>
                  </div>
                </div>

                {/* Employer brand fields */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                    Employer Brand
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Company description *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        handleChange("description", e.target.value)
                      }
                      placeholder="One paragraph describing what your company does..."
                      rows={2}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-950/10 focus:border-neutral-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Mission / values
                    </label>
                    <textarea
                      value={formData.mission}
                      onChange={(e) =>
                        handleChange("mission", e.target.value)
                      }
                      placeholder="What drives your company..."
                      rows={2}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-950/10 focus:border-neutral-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Culture
                    </label>
                    <textarea
                      value={formData.culture}
                      onChange={(e) =>
                        handleChange("culture", e.target.value)
                      }
                      placeholder="Describe your work culture, team dynamics, values in practice..."
                      rows={2}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-950/10 focus:border-neutral-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Remote / flexibility policy
                    </label>
                    <input
                      type="text"
                      value={formData.remotePolicy}
                      onChange={(e) =>
                        handleChange("remotePolicy", e.target.value)
                      }
                      placeholder="e.g. Hybrid (3 days office, 2 remote). Flexible hours."
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-950/10 focus:border-neutral-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Key benefits
                    </label>
                    <textarea
                      value={formData.benefits}
                      onChange={(e) =>
                        handleChange("benefits", e.target.value)
                      }
                      placeholder="List key benefits: pension, health, equity, parental leave..."
                      rows={2}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-950/10 focus:border-neutral-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Salary ranges
                    </label>
                    <input
                      type="text"
                      value={formData.salaryRange}
                      onChange={(e) =>
                        handleChange("salaryRange", e.target.value)
                      }
                      placeholder="e.g. Engineering: £55K-120K. Product: £60K-100K."
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-950/10 focus:border-neutral-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Tech stack (optional)
                    </label>
                    <input
                      type="text"
                      value={formData.techStack}
                      onChange={(e) =>
                        handleChange("techStack", e.target.value)
                      }
                      placeholder="e.g. TypeScript, React, Go, Kubernetes, AWS"
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-950/10 focus:border-neutral-300"
                    />
                  </div>
                </div>

                {/* Links */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                    Links
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    <input
                      type="text"
                      value={formData.careersUrl}
                      onChange={(e) =>
                        handleChange("careersUrl", e.target.value)
                      }
                      placeholder="Careers page URL"
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-950/10 focus:border-neutral-300"
                    />
                    <input
                      type="text"
                      value={formData.linkedinUrl}
                      onChange={(e) =>
                        handleChange("linkedinUrl", e.target.value)
                      }
                      placeholder="LinkedIn company URL"
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-950/10 focus:border-neutral-300"
                    />
                    <input
                      type="text"
                      value={formData.glassdoorUrl}
                      onChange={(e) =>
                        handleChange("glassdoorUrl", e.target.value)
                      }
                      placeholder="Glassdoor profile URL"
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-950/10 focus:border-neutral-300"
                    />
                  </div>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={!canGenerate}
                  className="w-full rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Generate JSON-LD Schema
                </button>
                {!canGenerate && formData.companyName && (
                  <p className="text-xs text-slate-400 -mt-2">
                    Company name, domain, and description are required.
                  </p>
                )}
              </div>

              {/* ── Output ── */}
              <div>
                <div className="sticky top-8 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-900">
                      Your JSON-LD schema
                    </h2>
                    {schemas && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleCopyAll}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors"
                        >
                          {copiedAll ? (
                            <Check className="h-3.5 w-3.5 text-teal-500" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                          {copiedAll ? "Copied all" : "Copy all"}
                        </button>
                        <button
                          onClick={handleDownload}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors"
                        >
                          <Download className="h-3.5 w-3.5" />
                          Download
                        </button>
                      </div>
                    )}
                  </div>

                  {schemas ? (
                    <div className="space-y-4">
                      {schemas.map((block) => (
                        <SchemaCodeBlock key={block.id} block={block} />
                      ))}

                      {/* How to install */}
                      <div className="rounded-2xl border border-slate-200 bg-white p-5">
                        <h3 className="text-sm font-semibold text-slate-900 mb-3">
                          How to install
                        </h3>
                        <ol className="space-y-3 text-sm text-slate-600">
                          <li className="flex gap-2">
                            <span className="font-semibold text-slate-900 shrink-0">
                              1.
                            </span>
                            <span>
                              <strong>Paste into your HTML.</strong> Add each{" "}
                              <code className="text-xs bg-slate-100 px-1 rounded">
                                &lt;script&gt;
                              </code>{" "}
                              block inside your careers page&apos;s{" "}
                              <code className="text-xs bg-slate-100 px-1 rounded">
                                &lt;head&gt;
                              </code>{" "}
                              section.
                            </span>
                          </li>
                          <li className="flex gap-2">
                            <span className="font-semibold text-slate-900 shrink-0">
                              2.
                            </span>
                            <span>
                              <strong>Or use Google Tag Manager.</strong> Create
                              a Custom HTML tag, paste each block, and fire it on
                              your careers pages.
                            </span>
                          </li>
                          <li className="flex gap-2">
                            <span className="font-semibold text-slate-900 shrink-0">
                              3.
                            </span>
                            <span>
                              <strong>Or automate with Rankwell.</strong> Our{" "}
                              <Link
                                href="/pricing"
                                className="text-brand-accent hover:underline"
                              >
                                Smart Pixel
                              </Link>{" "}
                              injects and updates structured data automatically —
                              no code changes needed.
                            </span>
                          </li>
                        </ol>
                      </div>

                      {/* Tip box */}
                      <div className="rounded-2xl border border-teal-200 bg-teal-50 p-4">
                        <p className="text-xs text-teal-700">
                          <strong>💡 Tip:</strong> Companies with structured data
                          score 25-30 points higher on their AI Visibility audit.
                          Schema markup is the single biggest quick win for
                          employer brand visibility.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-neutral-300 bg-slate-50/50 p-12 text-center">
                      <Code2 className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm text-slate-500">
                        Fill in the form and click Generate to create your
                        JSON-LD structured data.
                      </p>
                      <p className="text-xs text-slate-400 mt-2">
                        4 schema blocks will be generated: Organization,
                        JobPosting, FAQPage, and EmployerAggregateRating.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ──────────────────────────── */}
        <section className="py-12 border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-2xl px-6 text-center">
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              Want to go further?
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              Structured data is step one. A full Rankwell audit checks 50+
              signals across 6 AI models and gives you a complete action plan to
              control your employer brand narrative.
            </p>
            <Link
              href="/#audit"
              className="inline-flex items-center justify-center rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-700 transition-colors"
            >
              Run your free audit
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
