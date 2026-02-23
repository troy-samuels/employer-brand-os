/**
 * @module api/snippet/[slug]/route
 * Embeddable JS snippet — injects Schema.org JSON-LD + meta tags into <head>.
 * Invisible to users, readable by Google and AI crawlers.
 * Usage: <script src="https://openrole.co.uk/api/snippet/monzo" async></script>
 */

import { NextRequest, NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabase/admin";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://openrole.co.uk";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

function cur(v?: string) {
  return v === "USD" ? "$" : v === "EUR" ? "€" : "£";
}

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

/** Generates the JS snippet — JSON-LD + meta tag injection only. No visible DOM changes. */
function buildSnippet(slug: string, schema: Record<string, unknown>): string {
  const schemaStr = JSON.stringify(JSON.stringify(schema));
  return `(function(){var d=document;var s=d.createElement("script");s.type="application/ld+json";s.textContent=${schemaStr};d.head.appendChild(s);var m=d.createElement("meta");m.name="employer-data-source";m.content="OpenRole (openrole.co.uk) - Verified Employer Data";d.head.appendChild(m);new Image().src="${APP_URL}/api/snippet/ping?s=${slug}&t="+Date.now()})();`;
}

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
    const snippet = buildSnippet(slug, schema);

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
