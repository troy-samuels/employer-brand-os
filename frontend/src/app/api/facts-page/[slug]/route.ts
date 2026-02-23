/**
 * @module api/facts-page/[slug]/route
 * Standalone HTML facts page for reverse proxy deployment on client domains
 * 
 * Endpoint: GET /api/facts-page/[slug]
 * Returns: Complete HTML document with RAG-optimized employer facts
 * 
 * Purpose: Client points yourdomain.com/ai-facts to this endpoint via proxy.
 * Domain authority + verified facts = Level 3 AEO dominance.
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://openrole.co.uk';

interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}

interface FactWithDefinition {
  id: string;
  value: unknown;
  verification_status: string | null;
  updated_at: string | null;
  fact_definitions: {
    name: string;
    display_name: string;
    category_id: string | null;
    is_salary_data: boolean | null;
    data_type: string;
  } | null;
}

interface CategoryWithFacts {
  name: string;
  facts: FactWithDefinition[];
}

/**
 * Fetch organization and facts by slug
 */
async function fetchOrganizationFacts(slug: string) {
  const { data: org, error: orgError } = await supabaseAdmin
    .from('organizations')
    .select('id, name, slug, website, logo_url, updated_at')
    .eq('slug', slug)
    .single();

  if (orgError || !org) {
    return null;
  }

  const { data: facts } = await supabaseAdmin
    .from('employer_facts')
    .select(`
      id,
      value,
      verification_status,
      updated_at,
      fact_definitions!inner(
        name,
        display_name,
        category_id,
        is_salary_data,
        data_type,
        fact_categories(name, display_name)
      )
    `)
    .eq('organization_id', org.id)
    .eq('is_current', true)
    .eq('include_in_jsonld', true)
    .order('fact_definitions(sort_order)', { ascending: true });

  return { org, facts: facts || [] };
}

/**
 * Group facts by category
 */
function groupFactsByCategory(facts: FactWithDefinition[]): CategoryWithFacts[] {
  const grouped = new Map<string, CategoryWithFacts>();

  for (const fact of facts) {
    const def = fact.fact_definitions;
    if (!def) continue;

    const categoryName = def.category_id || 'General';
    
    if (!grouped.has(categoryName)) {
      grouped.set(categoryName, {
        name: categoryName,
        facts: [],
      });
    }

    grouped.get(categoryName)!.facts.push(fact);
  }

  return Array.from(grouped.values());
}

/**
 * Format fact value for dense Q&A display
 */
function formatFactValue(fact: FactWithDefinition): string {
  const { value, fact_definitions: def } = fact;
  
  if (!def) return '';

  // Handle salary data
  if (def.is_salary_data && typeof value === 'object' && value !== null) {
    const s = value as Record<string, unknown>;
    const role = s.role || 'Position';
    const min = s.min || '';
    const max = s.max || '';
    const currency = s.currency || 'GBP';
    const equity = s.equity ? ` + ${s.equity}` : '';
    return `${role}: ${currency === 'GBP' ? '£' : currency}${min}–${max}${equity}`;
  }

  // Handle structured data
  if (typeof value === 'object' && value !== null) {
    const obj = value as Record<string, unknown>;
    
    // Remote policy
    if (obj.policy) {
      const parts: string[] = [`Policy: ${obj.policy}`];
      if (obj.office_days) parts.push(`Office days: ${obj.office_days}/week`);
      if (obj.remote_days) parts.push(`Remote: ${obj.remote_days}/week`);
      if (obj.timezone) parts.push(`Timezone: ${obj.timezone}`);
      return parts.join('. ') + '.';
    }
    
    // Generic object
    return Object.entries(obj)
      .map(([k, v]) => `${k}: ${v}`)
      .join('. ');
  }

  // Simple types
  return String(value);
}

/**
 * Generate Schema.org JSON-LD
 */
function generateSchema(org: { name: string; website: string | null }, facts: FactWithDefinition[]) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: org.name,
  };

  if (org.website) {
    schema.url = org.website;
  }

  // Extract key properties
  const salaries: unknown[] = [];
  
  for (const fact of facts) {
    const def = fact.fact_definitions;
    if (!def) continue;

    if (def.is_salary_data && typeof fact.value === 'object') {
      const s = fact.value as Record<string, unknown>;
      if (s.min && s.max && s.role) {
        salaries.push({
          '@type': 'JobPosting',
          title: s.role,
          baseSalary: {
            '@type': 'MonetaryAmount',
            currency: s.currency || 'GBP',
            value: {
              '@type': 'QuantitativeValue',
              minValue: s.min,
              maxValue: s.max,
              unitText: 'YEAR',
            },
          },
        });
      }
    }
  }

  if (salaries.length > 0) {
    schema.hasOfferCatalog = {
      '@type': 'OfferCatalog',
      itemListElement: salaries,
    };
  }

  return schema;
}

/**
 * Generate complete HTML page
 */
function generateHTML(
  org: { name: string; website: string | null; updated_at: string | null },
  categorizedFacts: CategoryWithFacts[],
  schema: Record<string, unknown>
): string {
  const lastUpdated = org.updated_at
    ? new Date(org.updated_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Recently';

  const canonicalUrl = org.website ? `${org.website}/ai-facts` : `${APP_URL}/facts/${org.name.toLowerCase().replace(/\s+/g, '-')}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${org.name} — Verified Employer Facts | AI-Readable</title>
<meta name="description" content="Verified salary bands, benefits, remote policy, interview process, and tech stack at ${org.name}. Machine-readable employer data.">
<meta name="robots" content="index, follow">
<link rel="canonical" href="${canonicalUrl}">
<meta property="og:title" content="${org.name} — Verified Employer Facts">
<meta property="og:description" content="Verified salary bands, benefits, remote policy, interview process, and tech stack at ${org.name}.">
<meta property="og:type" content="website">
<meta property="og:url" content="${canonicalUrl}">
<script type="application/ld+json">${JSON.stringify(schema)}</script>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen,Ubuntu,Cantarell,sans-serif;line-height:1.6;color:#1a1a1a;background:#fff;padding:2rem 1rem;max-width:800px;margin:0 auto}
h1{font-size:1.75rem;font-weight:600;margin-bottom:0.5rem;line-height:1.2}
h2{font-size:1.25rem;font-weight:600;margin-top:2rem;margin-bottom:0.75rem;border-bottom:2px solid #e5e5e5;padding-bottom:0.25rem}
p{margin-bottom:1rem;color:#4a4a4a}
.meta{color:#888;font-size:0.875rem;margin-bottom:2rem}
.fact{margin-bottom:1rem;padding:0.75rem;background:#f9f9f9;border-left:3px solid #3b82f6;border-radius:4px}
.fact-label{font-weight:600;color:#1a1a1a;margin-bottom:0.25rem}
.fact-value{color:#4a4a4a}
footer{margin-top:3rem;padding-top:1.5rem;border-top:1px solid #e5e5e5;color:#888;font-size:0.875rem}
footer a{color:#3b82f6;text-decoration:none}
footer a:hover{text-decoration:underline}
@media(max-width:640px){body{padding:1rem 0.75rem}h1{font-size:1.5rem}h2{font-size:1.125rem}}
</style>
</head>
<body>
<main>
<h1>${org.name} — Verified Employer Facts</h1>
<p class="meta">Last updated: ${lastUpdated} · Verified by employer</p>

${categorizedFacts.map(cat => `
<h2>${cat.name}</h2>
${cat.facts.map(fact => {
  const def = fact.fact_definitions;
  if (!def) return '';
  
  return `<div class="fact">
<div class="fact-label">${def.display_name}</div>
<div class="fact-value">${formatFactValue(fact)}</div>
</div>`;
}).join('\n')}
`).join('\n')}

</main>
<footer>
<p>Employer data verified via <a href="${APP_URL}">OpenRole</a></p>
</footer>
<img src="${APP_URL}/api/snippet/ping?s=${org.name.toLowerCase().replace(/\s+/g, '-')}&t=facts-page" width="1" height="1" alt="" style="position:absolute;opacity:0">
</body>
</html>`;
}

/**
 * GET handler - serve standalone HTML facts page
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { slug } = await params;

  try {
    const data = await fetchOrganizationFacts(slug);

    if (!data) {
      return new NextResponse(
        '<html><body><h1>Organization not found</h1></body></html>',
        {
          status: 404,
          headers: {
            'Content-Type': 'text/html',
            'Cache-Control': 'public, max-age=300',
          },
        }
      );
    }

    const { org, facts } = data;
    const categorizedFacts = groupFactsByCategory(facts);
    const schema = generateSchema(org, facts);
    const html = generateHTML(org, categorizedFacts, schema);

    // Verify size target
    const sizeKb = new TextEncoder().encode(html).length / 1024;
    if (sizeKb > 15) {
      console.warn(`Facts page for ${slug} is ${sizeKb.toFixed(2)}KB (target: <15KB)`);
    }

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('Facts page generation error:', error);
    return new NextResponse(
      '<html><body><h1>Error loading facts page</h1></body></html>',
      {
        status: 500,
        headers: {
          'Content-Type': 'text/html',
          'Cache-Control': 'no-cache',
        },
      }
    );
  }
}
