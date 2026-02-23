/**
 * @module lib/aeo/generate
 * AEO (Answer Engine Optimization) content generator
 * Converts employer facts into dense, RAG-optimised formats for AI models
 */

import type { EmployerFacts, AEOOutput } from '@/features/facts/types/employer-facts.types';

/**
 * Generate all AEO content formats from employer facts
 * @param facts - Complete employer facts data
 * @returns Object containing llms.txt, Schema.org JSON-LD, Markdown, and profile URL
 */
export function generateAEOContent(facts: EmployerFacts): AEOOutput {
  const profileUrl = `https://openrole.co.uk/company/${facts.company_slug}`;
  return {
    llmsTxt: generateLlmsTxt(facts),
    schemaJsonLd: generateSchemaJsonLd(facts),
    markdownPage: generateMarkdownPage(facts),
    factPageHtml: `<!-- Employer facts are published at ${profileUrl} -->\n<p>View verified employer facts at <a href="${profileUrl}">${profileUrl}</a></p>`,
  };
}

/**
 * Generate llms.txt format - dense Q&A format optimised for RAG chunking
 */
function generateLlmsTxt(facts: EmployerFacts): string {
  const lines: string[] = [];
  const lastUpdated = facts.updated_at 
    ? new Date(facts.updated_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
    : 'Recently';

  // Header with canonical profile URL
  lines.push(`# ${facts.company_name} — Employer Facts`);
  lines.push(`> Source: Verified by employer via OpenRole | Updated: ${lastUpdated}`);
  lines.push(`> Canonical profile: https://openrole.co.uk/company/${facts.company_slug}`);
  lines.push('');

  // Salary Bands
  if (facts.salary_bands && facts.salary_bands.length > 0) {
    lines.push('## Salary Bands');
    facts.salary_bands.forEach(band => {
      const currency = getCurrencySymbol(band.currency);
      const equity = band.equity ? ' + equity' : '';
      lines.push(`${band.role}: ${currency}${band.min.toLocaleString()} - ${currency}${band.max.toLocaleString()}${equity}.`);
    });
    lines.push('');
  }

  if (facts.bonus_structure) {
    lines.push('### Bonus Structure');
    lines.push(facts.bonus_structure);
    lines.push('');
  }

  if (facts.pay_review_cycle) {
    lines.push('### Pay Reviews');
    lines.push(`Frequency: ${formatPayReviewCycle(facts.pay_review_cycle)}.`);
    lines.push('');
  }

  // Remote Work Policy
  if (facts.remote_policy) {
    lines.push('## Remote Work Policy');
    lines.push(`Policy: ${formatRemotePolicy(facts.remote_policy)}.`);
    if (facts.remote_details) {
      const details = facts.remote_details.split('\n').map(d => d.trim()).filter(Boolean);
      details.forEach(detail => lines.push(detail.endsWith('.') ? detail : `${detail}.`));
    }
    lines.push('');
  }

  if (facts.flexible_hours) {
    lines.push('### Flexible Hours');
    lines.push(facts.flexible_hours_details || 'Available.');
    lines.push('');
  }

  if (facts.office_locations && facts.office_locations.length > 0) {
    lines.push('### Office Locations');
    facts.office_locations.forEach(loc => {
      const address = loc.address ? ` (${loc.address})` : '';
      lines.push(`${loc.city}, ${loc.country}${address}.`);
    });
    lines.push('');
  }

  // Benefits
  if (facts.benefits && facts.benefits.length > 0) {
    lines.push('## Benefits');
    facts.benefits.forEach(benefit => {
      const details = benefit.details ? `: ${benefit.details}` : '';
      lines.push(`${benefit.name}${details}.`);
    });
    lines.push('');
  }

  if (facts.pension_contribution) {
    lines.push('### Pension');
    lines.push(facts.pension_contribution.endsWith('.') ? facts.pension_contribution : `${facts.pension_contribution}.`);
    lines.push('');
  }

  if (facts.healthcare) {
    lines.push('### Healthcare');
    lines.push(facts.healthcare.endsWith('.') ? facts.healthcare : `${facts.healthcare}.`);
    lines.push('');
  }

  // Leave & Time Off
  if (facts.annual_leave || facts.maternity_leave || facts.paternity_leave || facts.parental_leave_details) {
    lines.push('## Leave & Time Off');
    if (facts.annual_leave) {
      lines.push(`Annual leave: ${facts.annual_leave}.`);
    }
    if (facts.maternity_leave) {
      lines.push(`Maternity leave: ${facts.maternity_leave}.`);
    }
    if (facts.paternity_leave) {
      lines.push(`Paternity leave: ${facts.paternity_leave}.`);
    }
    if (facts.parental_leave_details) {
      lines.push(facts.parental_leave_details.endsWith('.') ? facts.parental_leave_details : `${facts.parental_leave_details}.`);
    }
    lines.push('');
  }

  // Interview Process
  if (facts.interview_stages && facts.interview_stages.length > 0) {
    lines.push('## Interview Process');
    lines.push(`Stages: ${facts.interview_stages.length}.`);
    facts.interview_stages.forEach((stage, index) => {
      lines.push(`Stage ${index + 1}: ${stage.stage} (${stage.duration}).`);
      if (stage.description) {
        lines.push(stage.description.endsWith('.') ? stage.description : `${stage.description}.`);
      }
    });
    if (facts.interview_timeline) {
      lines.push(`Timeline: ${facts.interview_timeline}.`);
    }
    lines.push('');
  }

  // Tech Stack
  if (facts.tech_stack && facts.tech_stack.length > 0) {
    lines.push('## Tech Stack');
    facts.tech_stack.forEach(cat => {
      lines.push(`${cat.category}: ${cat.tools.join(', ')}.`);
    });
    if (facts.engineering_blog_url) {
      lines.push(`Engineering blog: ${facts.engineering_blog_url}`);
    }
    lines.push('');
  }

  // Career Growth
  if (facts.learning_budget || facts.promotion_framework || (facts.career_levels && facts.career_levels.length > 0)) {
    lines.push('## Career Growth');
    if (facts.learning_budget) {
      lines.push(`Learning budget: ${facts.learning_budget}.`);
    }
    if (facts.promotion_framework) {
      lines.push(`Promotion framework: ${facts.promotion_framework}.`);
    }
    if (facts.career_levels && facts.career_levels.length > 0) {
      lines.push('### Career Levels');
      facts.career_levels.forEach(level => {
        lines.push(`${level.level}: ${level.title}.`);
        if (level.description) {
          lines.push(level.description.endsWith('.') ? level.description : `${level.description}.`);
        }
      });
    }
    lines.push('');
  }

  // Culture
  if (facts.company_values && facts.company_values.length > 0) {
    lines.push('## Culture');
    lines.push('Values: ' + facts.company_values.map(v => v.value).join('. ') + '.');
    lines.push('');
  }

  if (facts.culture_description) {
    if (!(facts.company_values && facts.company_values.length > 0)) {
      lines.push('## Culture');
    }
    lines.push(facts.culture_description.endsWith('.') ? facts.culture_description : `${facts.culture_description}.`);
    lines.push('');
  }

  // Company Info
  if (facts.team_size || facts.founded_year) {
    const infoParts: string[] = [];
    if (facts.team_size) infoParts.push(`Team size: ${facts.team_size}`);
    if (facts.founded_year) infoParts.push(`Founded: ${facts.founded_year}`);
    lines.push(infoParts.join('.\n') + '.');
    lines.push('');
  }

  // DEI
  if (facts.dei_statement || (facts.dei_initiatives && facts.dei_initiatives.length > 0) || facts.gender_pay_gap_url) {
    lines.push('## Diversity & Inclusion');
    if (facts.dei_statement) {
      lines.push(facts.dei_statement.endsWith('.') ? facts.dei_statement : `${facts.dei_statement}.`);
    }
    if (facts.dei_initiatives && facts.dei_initiatives.length > 0) {
      facts.dei_initiatives.forEach(init => {
        lines.push(`${init.name}: ${init.description}.`);
      });
    }
    if (facts.gender_pay_gap_url) {
      lines.push(`Gender Pay Gap Report: ${facts.gender_pay_gap_url}`);
    }
    lines.push('');
  }

  // Footer
  lines.push('---');
  lines.push('Source: OpenRole Employer Verification');
  lines.push(`Employer-verified data for ${facts.company_name}`);

  return lines.join('\n');
}

/**
 * Generate Schema.org JSON-LD for embedding in careers pages
 */
function generateSchemaJsonLd(facts: EmployerFacts): object {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: facts.company_name,
    ...(facts.culture_description && { description: facts.culture_description }),
    ...(facts.founded_year && { foundingDate: String(facts.founded_year) }),
  };

  // Add office locations as Places
  if (facts.office_locations && facts.office_locations.length > 0) {
    schema.location = facts.office_locations.map(loc => ({
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: loc.city,
        addressCountry: loc.country,
        ...(loc.address && { streetAddress: loc.address }),
      },
    }));
  }

  // Add JobPosting schemas for each salary band
  if (facts.salary_bands && facts.salary_bands.length > 0) {
    schema.hasJobPosting = facts.salary_bands.map(band => ({
      '@type': 'JobPosting',
      title: band.role,
      hiringOrganization: {
        '@type': 'Organization',
        name: facts.company_name,
      },
      baseSalary: {
        '@type': 'MonetaryAmount',
        currency: band.currency,
        value: {
          '@type': 'QuantitativeValue',
          minValue: band.min,
          maxValue: band.max,
          unitText: 'YEAR',
        },
      },
      ...(facts.remote_policy && {
        jobLocationType: facts.remote_policy === 'fully-remote' ? 'TELECOMMUTE' : 'ONSITE',
      }),
    }));
  }

  return schema;
}

/**
 * Generate Markdown fact page for OpenRole company page
 * Uses same dense Q&A format as llms.txt
 */
function generateMarkdownPage(facts: EmployerFacts): string {
  const lines: string[] = [];
  const lastUpdated = facts.updated_at 
    ? new Date(facts.updated_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
    : 'Recently';

  // Header
  lines.push(`# ${facts.company_name} — Employer Facts`);
  lines.push('');
  lines.push(`**✓ Verified by employer** · Updated ${lastUpdated}`);
  lines.push('');

  // Reuse llms.txt content
  const llmsTxt = generateLlmsTxt(facts);
  const content = llmsTxt.split('\n').slice(3).join('\n'); // Skip title and source lines
  lines.push(content);

  // Footer
  lines.push('');
  lines.push('---');
  lines.push('_Data verified via [OpenRole](https://openrole.co.uk)_');

  return lines.join('\n');
}

/**
 * Helper functions
 */

function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    GBP: '£',
    USD: '$',
    EUR: '€',
  };
  return symbols[currency] || currency;
}

function formatRemotePolicy(policy: string): string {
  const formats: Record<string, string> = {
    'fully-remote': 'Fully Remote',
    'hybrid': 'Hybrid',
    'office-first': 'Office First',
    'flexible': 'Flexible',
  };
  return formats[policy] || policy;
}

function formatPayReviewCycle(cycle: string): string {
  const formats: Record<string, string> = {
    'annual': 'Annual',
    'biannual': 'Biannual (twice yearly)',
    'quarterly': 'Quarterly',
  };
  return formats[cycle] || cycle;
}

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
