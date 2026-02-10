/**
 * @module app/sitemap
 * Dynamic sitemap including all public company audit pages.
 * This is how Google discovers /company/[slug] pages automatically.
 */

import type { MetadataRoute } from "next";
import { supabaseAdmin } from "@/lib/supabase/admin";

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- public_audits not in generated types until migration runs
const db = supabaseAdmin as any;

const BASE_URL = "https://rankwell.io";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/pricing`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/how-we-score`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/security`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/terms`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  ];

  // Dynamic company pages
  const companyPages: MetadataRoute.Sitemap = [];

  try {
    const { data } = await db
      .from("public_audits")
      .select("company_slug, updated_at")
      .order("score", { ascending: false })
      .limit(10000);

    if (data) {
      for (const row of data) {
        companyPages.push({
          url: `${BASE_URL}/company/${row.company_slug}`,
          lastModified: new Date(row.updated_at as string),
          changeFrequency: "weekly",
          priority: 0.6,
        });
      }
    }
  } catch {
    // Sitemap still works with just static pages if DB is unavailable
  }

  return [...staticPages, ...companyPages];
}
