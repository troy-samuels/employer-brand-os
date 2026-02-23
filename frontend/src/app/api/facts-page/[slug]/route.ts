/**
 * @module api/facts-page/[slug]/route
 * Standalone HTML facts page for reverse proxy deployment on client domains.
 * Client points yourdomain.com/ai-facts → openrole.co.uk/api/facts-page/slug
 */

import { NextRequest, NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabase/admin";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://openrole.co.uk";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

/* ── helpers ───────────────────────────────────────────────── */

function currency(v: string | undefined) {
  return v === "GBP" || !v ? "£" : v === "USD" ? "$" : v === "EUR" ? "€" : v;
}

function salaryLine(b: Record<string, unknown>): string {
  const role = b.role || "Role";
  const c = currency(b.currency as string | undefined);
  const min = b.min ?? "";
  const max = b.max ?? "";
  const eq = b.equity ? " + equity" : "";
  return `${role}: ${c}${min} – ${c}${max}${eq}.`;
}

function listLines(items: unknown[], labelKey = "name", detailKey = "details"): string {
  if (!Array.isArray(items)) return "";
  return items
    .map((i) => {
      const obj = i as Record<string, unknown>;
      const label = obj[labelKey] ?? "";
      const detail = obj[detailKey] ?? "";
      return detail ? `${label}: ${detail}.` : `${label}.`;
    })
    .join("\n");
}

/* ── data fetching ────────────────────────────────────────── */

async function fetchFacts(slug: string) {
  const { data, error } = await supabaseAdmin
    .from("employer_facts")
    .select("*")
    .eq("company_slug", slug)
    .eq("published", true)
    .single();

  if (error || !data) return null;
  return data;
}

/* ── html generation ──────────────────────────────────────── */

function buildSections(f: Record<string, unknown>): string[] {
  const s: string[] = [];

  // Salary
  const bands = f.salary_bands as Record<string, unknown>[] | null;
  if (bands?.length) {
    s.push(`<h2>Salary Bands</h2>\n<p>${bands.map(salaryLine).join("<br>")}</p>`);
  }
  if (f.bonus_structure) s.push(`<p>Bonus: ${f.bonus_structure}.</p>`);
  if (f.pay_review_cycle) s.push(`<p>Pay review: ${f.pay_review_cycle}.</p>`);

  // Benefits
  const benefits = f.benefits as Record<string, unknown>[] | null;
  if (benefits?.length) {
    s.push(`<h2>Benefits</h2>\n<p>${listLines(benefits)}</p>`);
  }
  if (f.pension_contribution) s.push(`<p>Pension: ${f.pension_contribution}.</p>`);
  if (f.healthcare) s.push(`<p>Healthcare: ${f.healthcare}.</p>`);

  // Work policy
  if (f.remote_policy || f.remote_details) {
    const parts = [`Policy: ${f.remote_policy || "Not specified"}`];
    if (f.remote_details) parts.push(String(f.remote_details));
    if (f.flexible_hours) parts.push(`Flexible hours: Yes. ${f.flexible_hours_details || ""}`);
    s.push(`<h2>Work Policy</h2>\n<p>${parts.join(". ").replace(/\.\./g, ".")}.</p>`);
  }
  const offices = f.office_locations as Record<string, unknown>[] | null;
  if (offices?.length) {
    s.push(`<p>Offices: ${offices.map((o) => `${o.city}, ${o.country}`).join("; ")}.</p>`);
  }

  // Tech stack
  const stack = f.tech_stack as Record<string, unknown>[] | null;
  if (stack?.length) {
    const lines = stack.map((t) => {
      const tools = Array.isArray(t.tools) ? (t.tools as string[]).join(", ") : t.tools;
      return `${t.category}: ${tools}.`;
    });
    s.push(`<h2>Tech Stack</h2>\n<p>${lines.join("<br>")}</p>`);
  }
  if (f.engineering_blog_url) s.push(`<p>Engineering blog: ${f.engineering_blog_url}</p>`);

  // Interview
  const stages = f.interview_stages as Record<string, unknown>[] | null;
  if (stages?.length) {
    const lines = stages.map(
      (st, i) => `Stage ${i + 1}: ${st.stage || st.name}${st.duration ? ` (${st.duration})` : ""}.${st.description ? ` ${st.description}` : ""}`
    );
    s.push(`<h2>Interview Process</h2>\n<p>Stages: ${stages.length}.<br>${lines.join("<br>")}</p>`);
    if (f.interview_timeline) s.push(`<p>Timeline: ${f.interview_timeline}.</p>`);
  }

  // Culture
  const values = f.company_values as Record<string, unknown>[] | null;
  if (values?.length || f.culture_description) {
    const parts: string[] = [];
    if (values?.length) parts.push(`Values: ${values.map((v) => v.value || v.name).join(". ")}.`);
    if (f.culture_description) parts.push(String(f.culture_description));
    if (f.team_size) parts.push(`Team size: ${f.team_size}.`);
    if (f.founded_year) parts.push(`Founded: ${f.founded_year}.`);
    s.push(`<h2>Culture</h2>\n<p>${parts.join("<br>")}</p>`);
  }

  // DEI
  if (f.dei_statement || (f.dei_initiatives as unknown[])?.length) {
    const parts: string[] = [];
    if (f.dei_statement) parts.push(String(f.dei_statement));
    const inits = f.dei_initiatives as Record<string, unknown>[] | null;
    if (inits?.length) parts.push(listLines(inits));
    s.push(`<h2>Diversity &amp; Inclusion</h2>\n<p>${parts.join("<br>")}</p>`);
  }

  // Career growth
  if (f.promotion_framework || f.learning_budget) {
    const parts: string[] = [];
    if (f.promotion_framework) parts.push(`Promotion: ${f.promotion_framework}.`);
    if (f.learning_budget) parts.push(`Learning budget: ${f.learning_budget}.`);
    const levels = f.career_levels as Record<string, unknown>[] | null;
    if (levels?.length) parts.push(listLines(levels, "title", "description"));
    s.push(`<h2>Career Growth</h2>\n<p>${parts.join("<br>")}</p>`);
  }

  // Leave
  if (f.maternity_leave || f.paternity_leave || f.annual_leave) {
    const parts: string[] = [];
    if (f.annual_leave) parts.push(`Annual leave: ${f.annual_leave}.`);
    if (f.maternity_leave) parts.push(`Maternity: ${f.maternity_leave}.`);
    if (f.paternity_leave) parts.push(`Paternity: ${f.paternity_leave}.`);
    if (f.parental_leave_details) parts.push(String(f.parental_leave_details));
    s.push(`<h2>Leave &amp; Time Off</h2>\n<p>${parts.join("<br>")}</p>`);
  }

  return s;
}

function generateSchemaLD(name: string, bands: Record<string, unknown>[] | null) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
  };
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
  return schema;
}

function renderPage(f: Record<string, unknown>): string {
  const name = f.company_name as string;
  const slug = f.company_slug as string;
  const updated = f.updated_at
    ? new Date(f.updated_at as string).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : "Recently";
  const sections = buildSections(f);
  const schema = generateSchemaLD(name, f.salary_bands as Record<string, unknown>[] | null);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${name} — Verified Employer Facts</title>
<meta name="description" content="Verified salary bands, benefits, remote policy, interview process and tech stack at ${name}. Machine-readable employer data.">
<meta name="robots" content="index,follow">
<meta property="og:title" content="${name} — Verified Employer Facts">
<meta property="og:description" content="Verified employer data for ${name}.">
<script type="application/ld+json">${JSON.stringify(schema)}</script>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:system-ui,sans-serif;line-height:1.6;color:#1a1a1a;max-width:760px;margin:0 auto;padding:2rem 1rem}
h1{font-size:1.6rem;margin-bottom:.4rem}
h2{font-size:1.15rem;margin:1.8rem 0 .6rem;border-bottom:2px solid #e5e5e5;padding-bottom:.2rem}
p{margin-bottom:.8rem;color:#333}
.meta{color:#888;font-size:.85rem;margin-bottom:1.6rem}
footer{margin-top:2.5rem;padding-top:1rem;border-top:1px solid #e5e5e5;color:#999;font-size:.8rem}
footer a{color:#3b82f6;text-decoration:none}
</style>
</head>
<body>
<h1>${name} — Verified Employer Facts</h1>
<p class="meta">Updated: ${updated} · Verified by employer</p>
${sections.join("\n")}
<footer>Data verified via <a href="${APP_URL}">OpenRole</a></footer>
<img src="${APP_URL}/api/snippet/ping?s=${slug}&t=facts-page" width="1" height="1" alt="" style="position:absolute;opacity:0">
</body>
</html>`;
}

/* ── route handler ────────────────────────────────────────── */

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { slug } = await params;

  try {
    const facts = await fetchFacts(slug);
    if (!facts) {
      return new NextResponse("<html><body><h1>Not found</h1></body></html>", {
        status: 404,
        headers: { "Content-Type": "text/html", "Cache-Control": "public,max-age=300" },
      });
    }

    const html = renderPage(facts as Record<string, unknown>);
    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html;charset=utf-8",
        "Cache-Control": "public,max-age=3600",
        "Access-Control-Allow-Origin": "*",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    console.error("Facts page error:", err);
    return new NextResponse("<html><body><h1>Error</h1></body></html>", {
      status: 500,
      headers: { "Content-Type": "text/html" },
    });
  }
}
