/**
 * @module app/sitemap
 * Dynamic sitemap including all public company audit pages and blog posts.
 */

import type { MetadataRoute } from "next";
import { untypedTable } from "@/lib/supabase/untyped-table";
import { getAllPosts } from "@/lib/blog";
import { industries } from "@/data/industries";

const BASE_URL = "https://openrole.co.uk";

// Hardcoded blog posts (for sitemap purposes - duplicates will be handled)
const hardcodedBlogSlugs = [
  "what-ai-tells-candidates-about-your-company",
  "glassdoor-doesnt-matter-anymore",
  "zero-click-candidate",
  "llms-txt-guide",
  "ai-hallucinating-salary-data",
  "800-million-weekly-users",
  "geo-for-employer-branding",
  "ai-employer-brand-score",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    // Core pages
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/pricing`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/compare`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.85 },
    
    // Content & Education
    { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/how-we-score`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/faq`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE_URL}/sample-report`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE_URL}/roi-calculator`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    
    // Free Tools
    { url: `${BASE_URL}/tools/badge`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/tools/employer-schema`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/tools/llms-txt`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    
    // Legal & Trust
    { url: `${BASE_URL}/security`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE_URL}/terms`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE_URL}/dpa`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];

  // Blog posts (markdown + hardcoded)
  const blogPages: MetadataRoute.Sitemap = [];
  
  // Get markdown blog posts
  const markdownPosts = getAllPosts();
  const markdownSlugs = new Set(markdownPosts.map((p) => p.slug));
  
  // Add markdown posts
  for (const post of markdownPosts) {
    blogPages.push({
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: "monthly",
      priority: post.featured ? 0.9 : 0.7,
    });
  }
  
  // Add hardcoded posts that aren't in markdown
  for (const slug of hardcodedBlogSlugs) {
    if (!markdownSlugs.has(slug)) {
      blogPages.push({
        url: `${BASE_URL}/blog/${slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
  }

  // Industry index pages
  const industryPages: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/uk-index`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    ...industries.map((industry) => ({
      url: `${BASE_URL}/uk-index/${industry.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];

  // Dynamic company pages
  const companyPages: MetadataRoute.Sitemap = [];

  try {
    const { data } = await untypedTable("public_audits")
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

  return [...staticPages, ...industryPages, ...blogPages, ...companyPages];
}
