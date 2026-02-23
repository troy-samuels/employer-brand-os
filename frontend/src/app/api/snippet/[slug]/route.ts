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
 * Generate minified JavaScript snippet
 */
function generateSnippet(slug: string, schema: Record<string, unknown>): string {
  // Minified IIFE that injects the schema
  const schemaJson = JSON.stringify(schema);
  
  return `(function(){var d=document,s=d.createElement('script');s.type='application/ld+json';s.textContent=${JSON.stringify(schemaJson)};d.head.appendChild(s);var m=d.createElement('meta');m.name='employer-data-source';m.content='OpenRole (openrole.co.uk) - Verified Employer Data';d.head.appendChild(m);new Image().src='${APP_URL}/api/snippet/ping?s=${slug}&t='+Date.now();})();`;
}

/**
 * GET handler - serve the JavaScript snippet
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { slug } = await params;

  try {
    // Generate schema from database
    const schema = await generateSchemaFromFacts(slug);

    if (!schema) {
      // Return empty snippet for non-existent orgs
      return new NextResponse(
        `console.warn('OpenRole: Organization "${slug}" not found');`,
        {
          status: 404,
          headers: {
            'Content-Type': 'application/javascript',
            'Cache-Control': 'public, max-age=300', // 5 minutes for 404s
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
          },
        }
      );
    }

    // Generate snippet
    const snippet = generateSnippet(slug, schema);

    // Check size
    const sizeKb = new TextEncoder().encode(snippet).length / 1024;
    if (sizeKb > 5) {
      console.warn(`Snippet for ${slug} is ${sizeKb.toFixed(2)}KB (target: <5KB)`);
    }

    return new NextResponse(snippet, {
      status: 200,
      headers: {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'public, max-age=3600', // 1 hour
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
