/**
 * @module api/snippet/[slug]/route
 * Embeddable JS snippet — injects Schema.org JSON-LD + visible semantic HTML.
 * Usage: <script src="https://openrole.co.uk/api/snippet/monzo" async></script>
 */

import { NextRequest, NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabase/admin";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://openrole.co.uk";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

/* ── helpers ───────────────────────────────────────────────── */

function esc(t: string): string {
  return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function cur(v?: string) {
  return v === "USD" ? "$" : v === "EUR" ? "€" : "£";
}

/* ── data ──────────────────────────────────────────────────── */

async function fetchFacts(slug: string) {
  const { data, error } = await supabaseAdmin
    .from("employer_facts")
    .select("*")
    .eq("company_slug", slug)
    .eq("published", true)
    .single();
  if (error || !data) return null;
  return data as Record<string, unknown>;
}

/* ── schema generation ────────────────────────────────────── */

function buildSchema(f: Record<string, unknown>) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: f.company_name,
  };

  const bands = f.salary_bands as Record<string, unknown>[] | null;
  if (bands?.length) {
    schema.hasOfferCatalog = {
      "@type": "OfferCatalog",
      itemListElement: bands.map((b) => ({
        "@type": "JobPosting",
        title: b.role,
        baseSalary: {
          "@type": "MonetaryAmount",
          currency: b.currency || "GBP",
          value: { "@type": "QuantitativeValue", minValue: b.min, maxValue: b.max, unitText: "YEAR" },
        },
      })),
    };
  }

  if (f.team_size) schema.numberOfEmployees = { "@type": "QuantitativeValue", value: f.team_size };
  if (f.founded_year) schema.foundingDate = String(f.founded_year);

  const offices = f.office_locations as Record<string, unknown>[] | null;
  if (offices?.length) {
    schema.address = offices.map((o) => ({
      "@type": "PostalAddress",
      addressLocality: o.city,
      addressCountry: o.country,
    }));
  }

  return schema;
}

/* ── visible HTML for RAG crawlers ────────────────────────── */

function buildVisibleHtml(f: Record<string, unknown>): string {
  const name = esc(f.company_name as string);
  const now = new Date().toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  const lines: string[] = [];

  lines.push(`<section id="openrole-facts" style="font-family:system-ui;max-width:800px;margin:40px auto;padding:24px;background:#f8f9fa;border-radius:8px;color:#1a1a1a;font-size:14px;line-height:1.6">`);
  lines.push(`<h2 style="margin:0 0 12px;font-size:18px">${name} — Employer Facts</h2>`);
  lines.push(`<p style="color:#666;font-size:12px;margin:0 0 16px">Verified by employer · ${now}</p>`);

  // Salary
  const bands = f.salary_bands as Record<string, unknown>[] | null;
  if (bands?.length) {
    lines.push(`<h3 style="font-size:15px;margin:12px 0 6px">Salary Bands</h3><p>`);
    for (const b of bands) lines.push(`${esc(String(b.role))}: ${cur(b.currency as string)}${b.min} – ${cur(b.currency as string)}${b.max}${b.equity ? " + equity" : ""}.<br>`);
    lines.push(`</p>`);
  }

  // Work policy
  if (f.remote_policy) {
    lines.push(`<h3 style="font-size:15px;margin:12px 0 6px">Work Policy</h3>`);
    lines.push(`<p>Policy: ${esc(String(f.remote_policy))}.${f.remote_details ? " " + esc(String(f.remote_details)) + "." : ""}</p>`);
  }

  // Benefits
  const benefits = f.benefits as Record<string, unknown>[] | null;
  if (benefits?.length) {
    lines.push(`<h3 style="font-size:15px;margin:12px 0 6px">Benefits</h3><p>`);
    for (const b of benefits) lines.push(`${esc(String(b.name))}${b.details ? ": " + esc(String(b.details)) : ""}.<br>`);
    lines.push(`</p>`);
  }

  // Interview
  const stages = f.interview_stages as Record<string, unknown>[] | null;
  if (stages?.length) {
    lines.push(`<h3 style="font-size:15px;margin:12px 0 6px">Interview Process</h3><p>Stages: ${stages.length}.<br>`);
    stages.forEach((st, i) => lines.push(`Stage ${i + 1}: ${esc(String(st.stage || st.name))}${st.duration ? " (" + esc(String(st.duration)) + ")" : ""}.<br>`));
    lines.push(`</p>`);
  }

  // Tech stack
  const stack = f.tech_stack as Record<string, unknown>[] | null;
  if (stack?.length) {
    lines.push(`<h3 style="font-size:15px;margin:12px 0 6px">Tech Stack</h3><p>`);
    for (const t of stack) {
      const tools = Array.isArray(t.tools) ? (t.tools as string[]).join(", ") : t.tools;
      lines.push(`${esc(String(t.category))}: ${esc(String(tools))}.<br>`);
    }
    lines.push(`</p>`);
  }

  lines.push(`<p style="color:#999;font-size:11px;margin:16px 0 0">Data verified via <a href="https://openrole.co.uk" style="color:#999">OpenRole</a></p>`);
  lines.push(`</section>`);

  return lines.join("");
}

/* ── snippet JS ───────────────────────────────────────────── */

function buildSnippet(slug: string, schema: Record<string, unknown>, html: string): string {
  const schemaStr = JSON.stringify(JSON.stringify(schema));
  const htmlStr = JSON.stringify(html);
  return `(function(){var d=document;var s=d.createElement("script");s.type="application/ld+json";s.textContent=${schemaStr};d.head.appendChild(s);function inject(){var c=d.createElement("div");c.innerHTML=${htmlStr};if(c.firstChild)d.body.appendChild(c.firstChild)}if(d.body)inject();else d.addEventListener("DOMContentLoaded",inject);new Image().src="${APP_URL}/api/snippet/ping?s=${slug}&t="+Date.now()})();`;
}

/* ── route handler ────────────────────────────────────────── */

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { slug } = await params;

  try {
    const facts = await fetchFacts(slug);
    if (!facts) {
      return new NextResponse(`console.warn("OpenRole: \\"${slug}\\" not found");`, {
        status: 404,
        headers: { "Content-Type": "application/javascript", "Cache-Control": "public,max-age=300", "Access-Control-Allow-Origin": "*" },
      });
    }

    const schema = buildSchema(facts);
    const html = buildVisibleHtml(facts);
    const snippet = buildSnippet(slug, schema, html);

    return new NextResponse(snippet, {
      status: 200,
      headers: {
        "Content-Type": "application/javascript",
        "Cache-Control": "public,max-age=3600",
        "Access-Control-Allow-Origin": "*",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    console.error("Snippet error:", err);
    return new NextResponse(`console.error("OpenRole snippet failed");`, {
      status: 500,
      headers: { "Content-Type": "application/javascript", "Access-Control-Allow-Origin": "*" },
    });
  }
}
