/**
 * @module api/snippet/[slug]/route
 * Dynamic JavaScript snippet that injects Schema.org JSON-LD for employers
 * 
 * Endpoint: GET /api/snippet/[slug]
 * Returns: JavaScript (IIFE) that injects structured data into the page
 * 
 * Usage: <script src="https://openrole.co.uk/api/snippet/monzo" async></script>
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://openrole.co.uk';

interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * Generate Schema.org JSON-LD from employer facts
 */
async function generateSchemaFromFacts(slug: string) {
  // Fetch organization
  const { data: org, error: orgError } = await supabaseAdmin
    .from('organizations')
    .select('id, name, slug, website, logo_url, employee_count')
    .eq('slug', slug)
    .single();

  if (orgError || !org) {
    return null;
  }

  // Fetch employer facts
  const { data: facts } = await supabaseAdmin
    .from('employer_facts')
    .select(`
      id,
      value,
      verification_status,
      fact_definitions(
        name,
        display_name,
        schema_property,
        schema_type,
        is_salary_data
      )
    `)
    .eq('organization_id', org.id)
    .eq('include_in_jsonld', true)
    .eq('is_current', true);

  // Build base schema
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: org.name,
  };

  if (org.website) {
    schema.url = org.website;
  }

  if (org.logo_url) {
    schema.logo = org.logo_url;
  }

  if (org.employee_count) {
    schema.numberOfEmployees = {
      '@type': 'QuantitativeValue',
      value: org.employee_count,
    };
  }

  // Process facts and map to schema properties
  const salaryRanges: Array<{
    title: string;
    min: number;
    max: number;
    currency: string;
  }> = [];
  const addresses: string[] = [];
  const socialLinks: string[] = [];
  let description = '';

  if (facts) {
    for (const fact of facts) {
      const def = fact.fact_definitions as {
        name: string;
        display_name: string;
        schema_property: string | null;
        schema_type: string | null;
        is_salary_data: boolean;
      } | null;

      if (!def) {
        continue;
      }

      const value = fact.value;

      // Handle salary data specially
      if (def.is_salary_data && typeof value === 'object' && value !== null) {
        const salaryData = value as Record<string, unknown>;
        if (salaryData.min && salaryData.max && salaryData.role) {
          salaryRanges.push({
            title: salaryData.role as string,
            min: Number(salaryData.min),
            max: Number(salaryData.max),
            currency: (salaryData.currency as string) || 'GBP',
          });
        }
      }

      // Map to schema properties
      if (def.schema_property) {
        switch (def.schema_property) {
          case 'description':
            if (typeof value === 'string') {
              description = value;
            }
            break;
          case 'address':
            if (typeof value === 'string') {
              addresses.push(value);
            }
            break;
          case 'sameAs':
            if (typeof value === 'string') {
              socialLinks.push(value);
            } else if (Array.isArray(value)) {
              socialLinks.push(...value.filter((v): v is string => typeof v === 'string'));
            }
            break;
          default:
            // Generic schema property mapping
            schema[def.schema_property] = value;
        }
      }
    }
  }

  if (description) {
    schema.description = description;
  }

  if (addresses.length > 0) {
    schema.address = addresses.length === 1 ? addresses[0] : addresses;
  }

  if (socialLinks.length > 0) {
    schema.sameAs = socialLinks;
  }

  // Add job postings from salary ranges
  if (salaryRanges.length > 0) {
    schema.hasOfferCatalog = {
      '@type': 'OfferCatalog',
      itemListElement: salaryRanges.map((range) => ({
        '@type': 'JobPosting',
        title: range.title,
        baseSalary: {
          '@type': 'MonetaryAmount',
          currency: range.currency,
          value: {
            '@type': 'QuantitativeValue',
            minValue: range.min,
            maxValue: range.max,
            unitText: 'YEAR',
          },
        },
      })),
    };
  }

  return schema;
}

/**
 * Generate visible HTML content for RAG crawlers
 */
function generateVisibleHtml(
  orgName: string,
  facts: Array<{ value: unknown; fact_definitions: { display_name: string; is_salary_data: boolean } | null }>,
  salaryRanges: Array<{ title: string; min: number; max: number; currency: string }>
): string {
  const html: string[] = [];
  const now = new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

  html.push('<section id="openrole-facts" style="font-family:system-ui;max-width:800px;margin:40px auto;padding:24px;background:#f8f9fa;border-radius:8px;color:#1a1a1a;font-size:14px;line-height:1.6">');
  html.push(`  <h2 style="margin:0 0 16px;font-size:20px">${escapeHtml(orgName)} — Employer Facts</h2>`);
  html.push(`  <p style="color:#666;font-size:12px;margin:0 0 20px">Verified by employer · Updated ${now}</p>`);

  // Salary Bands
  if (salaryRanges.length > 0) {
    html.push('  <h3 style="font-size:16px;margin:16px 0 8px">Salary Bands</h3>');
    html.push('  <p>');
    salaryRanges.forEach(range => {
      const symbol = range.currency === 'GBP' ? '£' : range.currency === 'USD' ? '$' : range.currency === 'EUR' ? '€' : range.currency;
      html.push(`    ${escapeHtml(range.title)}: ${symbol}${range.min.toLocaleString()} - ${symbol}${range.max.toLocaleString()}.<br>`);
    });
    html.push('  </p>');
  }

  // Other facts (grouped by type)
  const benefitFacts = facts.filter(f => f.fact_definitions?.display_name.includes('Benefit'));
  const remoteFacts = facts.filter(f => f.fact_definitions?.display_name.includes('Remote'));
  
  if (remoteFacts.length > 0) {
    html.push('  <h3 style="font-size:16px;margin:16px 0 8px">Remote Work</h3>');
    html.push('  <p>');
    remoteFacts.forEach(f => {
      const value = typeof f.value === 'string' ? f.value : JSON.stringify(f.value);
      html.push(`    ${escapeHtml(value)}.<br>`);
    });
    html.push('  </p>');
  }

  if (benefitFacts.length > 0) {
    html.push('  <h3 style="font-size:16px;margin:16px 0 8px">Benefits</h3>');
    html.push('  <p>');
    benefitFacts.forEach(f => {
      const value = typeof f.value === 'string' ? f.value : JSON.stringify(f.value);
      html.push(`    ${escapeHtml(value)}.<br>`);
    });
    html.push('  </p>');
  }

  // Footer
  html.push('  <p style="color:#999;font-size:11px;margin:20px 0 0">Data verified via <a href="https://openrole.co.uk" style="color:#999">OpenRole</a></p>');
  html.push('</section>');

  return html.join('\n');
}

/**
 * Escape HTML entities
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Generate minified JavaScript snippet with both JSON-LD and visible HTML
 */
function generateSnippet(slug: string, schema: Record<string, unknown>, visibleHtml: string): string {
  const schemaJson = JSON.stringify(schema);
  const htmlEncoded = JSON.stringify(visibleHtml);
  
  return `(function(){var d=document,s=d.createElement('script');s.type='application/ld+json';s.textContent=${JSON.stringify(schemaJson)};d.head.appendChild(s);var m=d.createElement('meta');m.name='employer-data-source';m.content='OpenRole - Verified Employer Data';d.head.appendChild(m);if(d.body){var c=d.createElement('div');c.innerHTML=${htmlEncoded};d.body.appendChild(c.firstChild)}else{d.addEventListener('DOMContentLoaded',function(){var c=d.createElement('div');c.innerHTML=${htmlEncoded};d.body.appendChild(c.firstChild)})};new Image().src='${APP_URL}/api/snippet/ping?s=${slug}&t='+Date.now();})();`;
}

/**
 * GET handler - serve the JavaScript snippet
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { slug } = await params;

  try {
    // Fetch organization
    const { data: org, error: orgError } = await supabaseAdmin
      .from('organizations')
      .select('id, name, slug')
      .eq('slug', slug)
      .single();

    if (orgError || !org) {
      return new NextResponse(
        `console.warn('OpenRole: Organization "${slug}" not found');`,
        {
          status: 404,
          headers: {
            'Content-Type': 'application/javascript',
            'Cache-Control': 'public, max-age=300',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
          },
        }
      );
    }

    // Fetch facts for both schema and visible HTML
    const { data: facts } = await supabaseAdmin
      .from('employer_facts')
      .select(`
        id,
        value,
        fact_definitions(
          display_name,
          is_salary_data
        )
      `)
      .eq('organization_id', org.id)
      .eq('is_current', true);

    // Extract salary ranges
    const salaryRanges: Array<{ title: string; min: number; max: number; currency: string }> = [];
    if (facts) {
      for (const fact of facts) {
        const def = fact.fact_definitions as { is_salary_data: boolean } | null;
        if (def?.is_salary_data && typeof fact.value === 'object' && fact.value !== null) {
          const data = fact.value as Record<string, unknown>;
          if (data.min && data.max && data.role) {
            salaryRanges.push({
              title: data.role as string,
              min: Number(data.min),
              max: Number(data.max),
              currency: (data.currency as string) || 'GBP',
            });
          }
        }
      }
    }

    // Generate schema (keep existing logic)
    const schema = await generateSchemaFromFacts(slug);
    if (!schema) {
      return new NextResponse(
        `console.warn('OpenRole: Failed to generate schema for "${slug}");`,
        {
          status: 500,
          headers: {
            'Content-Type': 'application/javascript',
            'Cache-Control': 'no-cache',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Generate visible HTML
    const visibleHtml = generateVisibleHtml(org.name, facts || [], salaryRanges);

    // Generate snippet
    const snippet = generateSnippet(slug, schema, visibleHtml);

    // Check size
    const sizeKb = new TextEncoder().encode(snippet).length / 1024;
    if (sizeKb > 5) {
      console.warn(`Snippet for ${slug} is ${sizeKb.toFixed(2)}KB (target: <5KB)`);
    }

    return new NextResponse(snippet, {
      status: 200,
      headers: {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('Snippet generation error:', error);
    return new NextResponse(
      `console.error('OpenRole snippet failed to load');`,
      {
        status: 500,
        headers: {
          'Content-Type': 'application/javascript',
          'Cache-Control': 'no-cache',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}
