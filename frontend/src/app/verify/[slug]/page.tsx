/**
 * @module app/verify/[slug]/page
 * Hosted Truth Page
 *
 * A public, SEO-optimized page that displays verified company facts
 * and injects JSON-LD schema for AI agents and Google Jobs indexing.
 *
 * This allows companies without a careers page to still be indexed.
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { serializeJsonForHtml } from '@/lib/utils/safe-json';
import type { EmployerFacts } from '@/features/facts/types/employer-facts.types';

interface PageProps {
  params: Promise<{ slug: string }>;
}

interface OrganizationData {
  id: string;
  name: string;
  slug: string;
  website: string | null;
  logoUrl: string | null;
  industry: string | null;
  employeeCount: number | null;
  trustScore: number | null;
}

interface HostedPageData {
  id: string;
  title: string | null;
  description: string | null;
  logoUrl: string | null;
  isPublished: boolean;
}

interface TruthPageData {
  organization: OrganizationData;
  hostedPage: HostedPageData | null;
  facts: EmployerFacts | null;
}

function normalizeWebsite(website: string | null) {
  if (!website) return null;
  const trimmed = website.trim();
  if (!trimmed) return null;

  const hasScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed);
  const candidate = hasScheme ? trimmed : `https://${trimmed}`;

  try {
    const parsed = new URL(candidate);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

function hostnameFromUrl(url: string | null) {
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

// Fetch organization and facts by slug
async function getTruthPageData(slug: string): Promise<TruthPageData | null> {
  // First try hosted_pages table
  const { data: hostedPage } = await supabaseAdmin
    .from('hosted_pages')
    .select(`
      id,
      title,
      description,
      logo_url,
      is_published,
      organization_id,
      organizations (
        id,
        name,
        slug,
        website,
        logo_url,
        industry,
        employee_count,
        trust_score
      )
    `)
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  let organization: OrganizationData | null = null;
  let pageData: HostedPageData | null = null;

  if (hostedPage?.organizations) {
    const org = hostedPage.organizations as {
      id: string;
      name: string;
      slug: string;
      website: string | null;
      logo_url: string | null;
      industry: string | null;
      employee_count: number | null;
      trust_score: number | null;
    };

    organization = {
      id: org.id,
      name: org.name,
      slug: org.slug,
      website: org.website,
      logoUrl: org.logo_url,
      industry: org.industry,
      employeeCount: org.employee_count,
      trustScore: org.trust_score,
    };

    pageData = {
      id: hostedPage.id,
      title: hostedPage.title,
      description: hostedPage.description,
      logoUrl: hostedPage.logo_url,
      isPublished: hostedPage.is_published ?? false,
    };
  } else {
    // Fallback: try organization slug directly
    const { data: org } = await supabaseAdmin
      .from('organizations')
      .select('id, name, slug, website, logo_url, industry, employee_count, trust_score')
      .eq('slug', slug)
      .single();

    if (!org) {
      return null;
    }

    organization = {
      id: org.id,
      name: org.name,
      slug: org.slug,
      website: org.website,
      logoUrl: org.logo_url,
      industry: org.industry,
      employeeCount: org.employee_count,
      trustScore: org.trust_score,
    };
  }

  if (!organization) {
    return null;
  }

  // Fetch employer facts by company_slug
  const { data: factsData } = await supabaseAdmin
    .from('employer_facts')
    .select('*')
    .eq('company_slug', slug)
    .single();

  const facts = factsData as EmployerFacts | null;

  // Update view count and last viewed (fire and forget)
  if (pageData) {
    supabaseAdmin
      .from('hosted_pages')
      .select('view_count')
      .eq('id', pageData.id)
      .single()
      .then(({ data }) => {
        const currentCount = data?.view_count ?? 0;
        supabaseAdmin
          .from('hosted_pages')
          .update({
            view_count: currentCount + 1,
            last_viewed_at: new Date().toISOString(),
          })
          .eq('id', pageData.id)
          .then(() => {});
      });
  }

  return {
    organization,
    hostedPage: pageData,
    facts,
  };
}

// Generate JSON-LD for the page
function generateJsonLd(data: TruthPageData): object[] {
  const { organization, facts } = data;
  const websiteUrl = normalizeWebsite(organization.website);

  // Organization schema
  const orgSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: facts?.company_name || organization.name,
    ...(websiteUrl && { url: websiteUrl }),
    ...(organization.logoUrl && { logo: organization.logoUrl }),
    ...(organization.industry && { industry: organization.industry }),
    ...(organization.employeeCount && {
      numberOfEmployees: {
        '@type': 'QuantitativeValue',
        value: organization.employeeCount,
      },
    }),
  };

  // Add description from facts
  if (facts?.culture_description) {
    orgSchema.description = facts.culture_description;
  }

  // JobPosting schema (generic for the company)
  const jobSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: `Careers at ${organization.name}`,
    description: facts?.culture_description || `Explore career opportunities at ${organization.name}`,
    datePosted: new Date().toISOString().split('T')[0],
    hiringOrganization: {
      '@type': 'Organization',
      name: organization.name,
      ...(websiteUrl && { sameAs: websiteUrl }),
      ...(organization.logoUrl && { logo: organization.logoUrl }),
    },
    ...(websiteUrl && {
      directApply: true,
      applicationContact: {
        '@type': 'ContactPoint',
        url: websiteUrl,
      },
    }),
  };

  // Add salary to job posting
  if (facts?.salary_bands && Array.isArray(facts.salary_bands)) {
    const salaryBands = facts.salary_bands as Array<{
      role?: string;
      min?: number;
      max?: number;
      currency?: string;
      equity?: boolean;
    }>;
    
    const firstBand = salaryBands[0];
    if (firstBand && (firstBand.min || firstBand.max)) {
      jobSchema.baseSalary = {
        '@type': 'MonetaryAmount',
        currency: firstBand.currency || 'USD',
        value: {
          '@type': 'QuantitativeValue',
          ...(firstBand.min && { minValue: firstBand.min }),
          ...(firstBand.max && { maxValue: firstBand.max }),
          unitText: 'YEAR',
        },
      };
    }
  }

  // Add remote policy
  if (facts?.remote_policy) {
    const remotePolicyMap: Record<string, string> = {
      'fully-remote': 'TELECOMMUTE',
      'hybrid': 'TELECOMMUTE',
      'office-first': 'OFFICE',
      'flexible': 'TELECOMMUTE',
    };
    
    jobSchema.jobLocationType = remotePolicyMap[facts.remote_policy] || facts.remote_policy;
  }

  // Add benefits
  if (facts?.benefits && Array.isArray(facts.benefits)) {
    const benefits = facts.benefits as Array<{
      category?: string;
      name?: string;
      details?: string;
    }>;
    
    const benefitNames = benefits
      .map((b) => b.name)
      .filter((name): name is string => Boolean(name));
    
    if (benefitNames.length > 0) {
      jobSchema.jobBenefits = benefitNames.join(', ');
    }
  }

  return [orgSchema, jobSchema];
}

// Metadata generation
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getTruthPageData(slug);

  if (!data) {
    return {
      title: 'Not Found',
    };
  }

  const title = data.hostedPage?.title || `${data.organization.name} - Verified Employer Profile`;
  const description = data.hostedPage?.description ||
    data.facts?.culture_description ||
    `Verified employment information for ${data.organization.name}. View salary ranges, benefits, and work policies.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      ...(data.organization.logoUrl && {
        images: [{ url: data.organization.logoUrl }],
      }),
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

export default async function TruthPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getTruthPageData(slug);

  if (!data) {
    notFound();
  }

  const { organization, facts } = data;
  const jsonLdSchemas = generateJsonLd(data);
  const websiteUrl = normalizeWebsite(organization.website);
  const websiteHost = hostnameFromUrl(websiteUrl);

  // Helper to format salary
  const formatSalary = (min?: number, max?: number, currency?: string) => {
    if (!min && !max) return null;
    const fmt = new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: currency || 'USD', 
      maximumFractionDigits: 0 
    });
    if (min && max) return `${fmt.format(min)} - ${fmt.format(max)}`;
    if (min) return `From ${fmt.format(min)}`;
    if (max) return `Up to ${fmt.format(max)}`;
    return null;
  };

  // Extract display values from facts
  const salaryBands = facts?.salary_bands as Array<{
    role?: string;
    min?: number;
    max?: number;
    currency?: string;
    equity?: boolean;
  }> | undefined;
  
  const firstSalaryBand = salaryBands?.[0];
  const salaryDisplay = firstSalaryBand 
    ? formatSalary(firstSalaryBand.min, firstSalaryBand.max, firstSalaryBand.currency)
    : null;

  const remotePolicyDisplay: Record<string, string> = {
    'fully-remote': 'Fully Remote',
    'hybrid': 'Hybrid',
    'office-first': 'Office First',
    'flexible': 'Flexible',
  };

  const remoteDisplay = facts?.remote_policy 
    ? remotePolicyDisplay[facts.remote_policy] || facts.remote_policy 
    : null;

  const benefits = facts?.benefits as Array<{
    category?: string;
    name?: string;
    details?: string;
  }> | undefined;

  const benefitNames = benefits
    ?.map((b) => b.name)
    .filter((name): name is string => Boolean(name)) || [];

  // Determine if facts are self-reported or verified
  const isPublished = facts?.published ?? false;
  const verificationStatus = isPublished ? 'Verified Employer' : 'Self-Reported';

  return (
    <>
      {/* JSON-LD Scripts */}
      {jsonLdSchemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonForHtml(schema),
          }}
        />
      ))}

      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-3xl px-6 py-4">
            <Link
              href="/"
              className="text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors"
            >
              Powered by OpenRole
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="mx-auto max-w-3xl px-6 py-16">
          {/* Company Header */}
          <div className="text-center mb-16">
            {/* Logo */}
            {organization.logoUrl && (
              <div className="mb-6">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={organization.logoUrl}
                  alt={organization.name}
                  className="mx-auto h-16 w-auto object-contain"
                />
              </div>
            )}

            {/* Company Name */}
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 mb-3">
              {facts?.company_name || organization.name}
            </h1>

            {/* Verified Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-teal-50 border border-teal-200 rounded-full">
              <span className="w-2 h-2 bg-teal-600 rounded-full" />
              <span className="text-xs font-medium text-teal-700 uppercase tracking-wide">
                {verificationStatus}
              </span>
            </div>

            {/* Industry & Size */}
            {(organization.industry || facts?.team_size || organization.employeeCount) && (
              <p className="mt-4 text-sm text-slate-500">
                {organization.industry}
                {organization.industry && (facts?.team_size || organization.employeeCount) && ' · '}
                {facts?.team_size || (organization.employeeCount && `${organization.employeeCount.toLocaleString()} employees`)}
              </p>
            )}

            {/* Description */}
            {facts?.culture_description && (
              <p className="mt-6 text-base text-slate-600 leading-relaxed max-w-xl mx-auto">
                {facts.culture_description}
              </p>
            )}
          </div>

          {/* Facts Grid */}
          <div className="space-y-8">
            {/* Compensation */}
            {salaryDisplay && (
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-medium mb-2">
                  Compensation
                </p>
                <p className="text-2xl font-semibold text-slate-900">
                  {salaryDisplay}
                </p>
                <p className="text-sm text-slate-500 mt-1">Annual base salary range</p>
                {firstSalaryBand?.equity && (
                  <p className="text-sm text-slate-500 mt-1">+ Equity</p>
                )}
              </div>
            )}

            {/* Work Policy */}
            {remoteDisplay && (
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-medium mb-2">
                  Work Policy
                </p>
                <p className="text-2xl font-semibold text-slate-900">
                  {remoteDisplay}
                </p>
                {facts?.remote_details && (
                  <p className="text-sm text-slate-500 mt-2">{facts.remote_details}</p>
                )}
              </div>
            )}

            {/* Benefits */}
            {benefitNames.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-medium mb-4">
                  Benefits
                </p>
                <div className="flex flex-wrap gap-2">
                  {benefitNames.map((benefit, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 bg-slate-100 text-neutral-700 text-sm rounded-lg"
                    >
                      {benefit}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Sections */}
            {facts?.office_locations && Array.isArray(facts.office_locations) && facts.office_locations.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-medium mb-4">
                  Office Locations
                </p>
                <div className="space-y-2">
                  {(facts.office_locations as Array<{ city?: string; country?: string; address?: string }>).map((loc, i) => (
                    <p key={i} className="text-sm text-slate-700">
                      {loc.city && loc.country ? `${loc.city}, ${loc.country}` : loc.city || loc.country}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Tech Stack */}
            {facts?.tech_stack && Array.isArray(facts.tech_stack) && facts.tech_stack.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-medium mb-4">
                  Tech Stack
                </p>
                {(facts.tech_stack as Array<{ category?: string; tools?: string[] }>).map((cat, i) => (
                  <div key={i} className="mb-3 last:mb-0">
                    {cat.category && (
                      <p className="text-xs font-medium text-slate-500 mb-2">{cat.category}</p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {cat.tools?.map((tool, j) => (
                        <span key={j} className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded">
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CTA */}
          {websiteUrl && (
            <div className="mt-16 text-center">
              <a
                href={websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 py-3 bg-slate-800 text-white font-medium rounded-lg hover:bg-slate-700 transition-colors"
              >
                View Open Positions
              </a>
              {websiteHost && (
                <p className="mt-3 text-xs text-slate-400">
                  Opens {websiteHost}
                </p>
              )}
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-3xl px-6 py-8 text-center">
            <p className="text-xs text-slate-400">
              This information has been {isPublished ? 'verified' : 'self-reported'} by the employer.
              <br />
              Last updated {new Date(facts?.updated_at || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}.
            </p>
            <div className="mt-4 flex items-center justify-center gap-1">
              <span className="w-1.5 h-1.5 bg-teal-600 rounded-full" />
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-medium">
                OpenRole {verificationStatus}
              </span>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
