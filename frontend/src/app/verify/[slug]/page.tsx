import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase/admin';

/**
 * Hosted Truth Page
 *
 * A public, SEO-optimized page that displays verified company facts
 * and injects JSON-LD schema for AI agents and Google Jobs indexing.
 *
 * This allows companies without a careers page to still be indexed.
 */

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

interface EmployerFactData {
  id: string;
  name: string;
  displayName: string;
  value: Record<string, unknown>;
  category: string;
  verificationStatus: string;
}

interface TruthPageData {
  organization: OrganizationData;
  hostedPage: HostedPageData | null;
  facts: EmployerFactData[];
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

  // Fetch employer facts
  const { data: factsData } = await supabaseAdmin
    .from('employer_facts')
    .select(`
      id,
      value,
      verification_status,
      fact_definitions (
        name,
        display_name,
        fact_categories (
          name
        )
      )
    `)
    .eq('organization_id', organization.id)
    .eq('is_current', true)
    .eq('include_in_jsonld', true);

  const facts: EmployerFactData[] = (factsData || []).map((fact) => {
    const def = fact.fact_definitions as {
      name: string;
      display_name: string;
      fact_categories: { name: string } | null;
    } | null;

    return {
      id: fact.id,
      name: def?.name || '',
      displayName: def?.display_name || '',
      value: fact.value as Record<string, unknown>,
      category: def?.fact_categories?.name || 'other',
      verificationStatus: fact.verification_status || 'unverified',
    };
  });

  // Update view count and last viewed (fire and forget)
  if (pageData) {
    // First get current count, then increment
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
    name: organization.name,
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

  // Extract facts into schema
  const salaryFact = facts.find((f) => f.name === 'base_salary');
  const remoteFact = facts.find((f) => f.name === 'remote_policy');
  const benefitsFact = facts.find((f) => f.name === 'benefits_list');
  const descriptionFact = facts.find((f) => f.name === 'company_description');

  // Add description to org
  if (descriptionFact?.value) {
    orgSchema.description = typeof descriptionFact.value === 'string'
      ? descriptionFact.value
      : descriptionFact.value;
  }

  // JobPosting schema (generic for the company)
  const jobSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: `Careers at ${organization.name}`,
    description: `Explore career opportunities at ${organization.name}`,
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
  if (salaryFact?.value) {
    const salary = salaryFact.value as { min?: number; max?: number; currency?: string };
    if (salary.min || salary.max) {
      jobSchema.baseSalary = {
        '@type': 'MonetaryAmount',
        currency: salary.currency || 'USD',
        value: {
          '@type': 'QuantitativeValue',
          ...(salary.min && { minValue: salary.min }),
          ...(salary.max && { maxValue: salary.max }),
          unitText: 'YEAR',
        },
      };
    }
  }

  // Add remote policy
  if (remoteFact?.value) {
    const remote = remoteFact.value as { value?: string; display?: string };
    const remoteValue = remote.value || remote.display;
    if (remoteValue === 'remote') {
      jobSchema.jobLocationType = 'TELECOMMUTE';
    } else if (remoteValue === 'hybrid') {
      jobSchema.employmentType = 'FULL_TIME';
      jobSchema.jobLocationType = 'TELECOMMUTE';
    }
  }

  // Add benefits
  if (benefitsFact?.value) {
    const benefits = Array.isArray(benefitsFact.value)
      ? benefitsFact.value
      : [];
    if (benefits.length > 0) {
      jobSchema.jobBenefits = benefits.join(', ');
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

  // Extract display values
  const salaryFact = facts.find((f) => f.name === 'base_salary');
  const remoteFact = facts.find((f) => f.name === 'remote_policy');
  const benefitsFact = facts.find((f) => f.name === 'benefits_list');
  const descriptionFact = facts.find((f) => f.name === 'company_description');

  const salary = salaryFact?.value as { min?: number; max?: number; currency?: string } | undefined;
  const remote = remoteFact?.value as { value?: string; display?: string } | undefined;
  const benefits = benefitsFact?.value as string[] | undefined;
  const description = descriptionFact?.value as string | undefined;

  const formatSalary = (min?: number, max?: number, currency?: string) => {
    if (!min && !max) return null;
    const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD', maximumFractionDigits: 0 });
    if (min && max) return `${fmt.format(min)} - ${fmt.format(max)}`;
    if (min) return `From ${fmt.format(min)}`;
    if (max) return `Up to ${fmt.format(max)}`;
    return null;
  };

  const remoteDisplay = remote?.display || (remote?.value === 'remote' ? 'Fully Remote' : remote?.value === 'hybrid' ? 'Hybrid' : remote?.value === 'onsite' ? 'On-site' : null);

  return (
    <>
      {/* JSON-LD Scripts */}
      {jsonLdSchemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <div className="min-h-screen bg-zinc-50">
        {/* Header */}
        <header className="border-b border-zinc-200 bg-white">
          <div className="mx-auto max-w-3xl px-6 py-4">
            <Link
              href="/"
              className="text-xs font-medium text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              Powered by BrandOS
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
                <img
                  src={organization.logoUrl}
                  alt={organization.name}
                  className="mx-auto h-16 w-auto object-contain"
                />
              </div>
            )}

            {/* Company Name */}
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 mb-3">
              {organization.name}
            </h1>

            {/* Verified Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full">
              <span className="w-2 h-2 bg-emerald-500 rounded-full" />
              <span className="text-xs font-medium text-emerald-700 uppercase tracking-wide">
                Verified Employer
              </span>
            </div>

            {/* Industry & Size */}
            {(organization.industry || organization.employeeCount) && (
              <p className="mt-4 text-sm text-zinc-500">
                {organization.industry}
                {organization.industry && organization.employeeCount && ' · '}
                {organization.employeeCount && `${organization.employeeCount.toLocaleString()} employees`}
              </p>
            )}

            {/* Description */}
            {description && (
              <p className="mt-6 text-base text-zinc-600 leading-relaxed max-w-xl mx-auto">
                {description}
              </p>
            )}
          </div>

          {/* Facts Grid */}
          <div className="space-y-8">
            {/* Compensation */}
            {salary && (salary.min || salary.max) && (
              <div className="bg-white border border-zinc-200 rounded-xl p-6">
                <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium mb-2">
                  Compensation
                </p>
                <p className="text-2xl font-semibold text-zinc-950">
                  {formatSalary(salary.min, salary.max, salary.currency)}
                </p>
                <p className="text-sm text-zinc-500 mt-1">Annual base salary range</p>
              </div>
            )}

            {/* Work Style */}
            {remoteDisplay && (
              <div className="bg-white border border-zinc-200 rounded-xl p-6">
                <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium mb-2">
                  Work Style
                </p>
                <p className="text-2xl font-semibold text-zinc-950">
                  {remoteDisplay}
                </p>
              </div>
            )}

            {/* Benefits */}
            {benefits && benefits.length > 0 && (
              <div className="bg-white border border-zinc-200 rounded-xl p-6">
                <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium mb-4">
                  Benefits
                </p>
                <div className="flex flex-wrap gap-2">
                  {benefits.map((benefit, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 bg-zinc-100 text-zinc-700 text-sm rounded-lg"
                    >
                      {benefit}
                    </span>
                  ))}
                </div>
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
                className="inline-flex items-center justify-center px-6 py-3 bg-zinc-900 text-white font-medium rounded-lg hover:bg-zinc-800 transition-colors"
              >
                View Open Positions
              </a>
              {websiteHost && (
                <p className="mt-3 text-xs text-zinc-400">
                  Opens {websiteHost}
                </p>
              )}
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-zinc-200 bg-white">
          <div className="mx-auto max-w-3xl px-6 py-8 text-center">
            <p className="text-xs text-zinc-400">
              This information has been verified by the employer.
              <br />
              Last updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}.
            </p>
            <div className="mt-4 flex items-center justify-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium">
                BrandOS Verified
              </span>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
