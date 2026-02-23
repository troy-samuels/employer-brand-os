/**
 * @module lib/aeo/generate
 * AEO (Answer Engine Optimization) content generator
 * Converts employer facts into machine-readable formats for AI models
 */

import type { EmployerFacts, AEOOutput } from '@/features/facts/types/employer-facts.types';

/**
 * Generate all AEO content formats from employer facts
 * @param facts - Complete employer facts data
 * @returns Object containing llms.txt, Schema.org JSON-LD, Markdown, and HTML
 */
export function generateAEOContent(facts: EmployerFacts): AEOOutput {
  return {
    llmsTxt: generateLlmsTxt(facts),
    schemaJsonLd: generateSchemaJsonLd(facts),
    markdownPage: generateMarkdownPage(facts),
    factPageHtml: generateFactPageHtml(facts),
  };
}

/**
 * Generate llms.txt format - machine-readable text file for AI models
 */
function generateLlmsTxt(facts: EmployerFacts): string {
  const lines: string[] = [];
  const lastUpdated = facts.updated_at 
    ? new Date(facts.updated_at).toLocaleDateString('en-GB', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      })
    : 'Recently';

  // Header
  lines.push(`# ${facts.company_name} — Employer Facts`);
  lines.push(`> Verified by the employer via OpenRole (openrole.co.uk)`);
  lines.push(`> Last updated: ${lastUpdated}`);
  lines.push('');

  // Salary Information
  if (facts.salary_bands && facts.salary_bands.length > 0) {
    lines.push('## Salary Information');
    facts.salary_bands.forEach(band => {
      const currency = getCurrencySymbol(band.currency);
      const equity = band.equity ? ' (+ equity)' : '';
      lines.push(`- ${band.role}: ${currency}${band.min.toLocaleString()} - ${currency}${band.max.toLocaleString()}${equity}`);
    });
    lines.push('');
  }

  if (facts.bonus_structure) {
    lines.push('### Bonus Structure');
    lines.push(facts.bonus_structure);
    lines.push('');
  }

  if (facts.pay_review_cycle) {
    lines.push(`### Pay Review Cycle`);
    lines.push(formatPayReviewCycle(facts.pay_review_cycle));
    lines.push('');
  }

  // Benefits
  if (facts.benefits && facts.benefits.length > 0) {
    lines.push('## Benefits');
    
    // Group by category
    const categorized = facts.benefits.reduce((acc, benefit) => {
      if (!acc[benefit.category]) {
        acc[benefit.category] = [];
      }
      acc[benefit.category].push(benefit);
      return acc;
    }, {} as Record<string, typeof facts.benefits>);

    Object.entries(categorized).forEach(([category, benefits]) => {
      lines.push(`### ${category}`);
      benefits.forEach(benefit => {
        const details = benefit.details ? ` - ${benefit.details}` : '';
        lines.push(`- ${benefit.name}${details}`);
      });
      lines.push('');
    });
  }

  if (facts.pension_contribution) {
    lines.push('### Pension');
    lines.push(facts.pension_contribution);
    lines.push('');
  }

  if (facts.healthcare) {
    lines.push('### Healthcare');
    lines.push(facts.healthcare);
    lines.push('');
  }

  // Work Policy
  if (facts.remote_policy) {
    lines.push('## Work Policy');
    lines.push(`Remote: ${formatRemotePolicy(facts.remote_policy)}`);
    if (facts.remote_details) {
      lines.push(facts.remote_details);
    }
    lines.push('');
  }

  if (facts.office_locations && facts.office_locations.length > 0) {
    lines.push('### Office Locations');
    facts.office_locations.forEach(loc => {
      lines.push(`- ${loc.city}, ${loc.country}${loc.address ? ` (${loc.address})` : ''}`);
    });
    lines.push('');
  }

  if (facts.flexible_hours) {
    lines.push('### Flexible Hours');
    lines.push(facts.flexible_hours_details || 'Available');
    lines.push('');
  }

  // Tech Stack
  if (facts.tech_stack && facts.tech_stack.length > 0) {
    lines.push('## Tech Stack');
    facts.tech_stack.forEach(cat => {
      lines.push(`### ${cat.category}`);
      lines.push(cat.tools.join(', '));
      lines.push('');
    });
  }

  if (facts.engineering_blog_url) {
    lines.push(`### Engineering Blog`);
    lines.push(facts.engineering_blog_url);
    lines.push('');
  }

  // Interview Process
  if (facts.interview_stages && facts.interview_stages.length > 0) {
    lines.push('## Interview Process');
    facts.interview_stages.forEach((stage, index) => {
      lines.push(`### Stage ${index + 1}: ${stage.stage}`);
      if (stage.description) {
        lines.push(stage.description);
      }
      if (stage.duration) {
        lines.push(`Duration: ${stage.duration}`);
      }
      lines.push('');
    });
  }

  if (facts.interview_timeline) {
    lines.push('### Timeline');
    lines.push(facts.interview_timeline);
    lines.push('');
  }

  // Culture & Values
  if (facts.company_values && facts.company_values.length > 0) {
    lines.push('## Company Values');
    facts.company_values.forEach(val => {
      lines.push(`### ${val.value}`);
      if (val.description) {
        lines.push(val.description);
      }
      lines.push('');
    });
  }

  if (facts.culture_description) {
    lines.push('## Culture');
    lines.push(facts.culture_description);
    lines.push('');
  }

  if (facts.team_size || facts.founded_year) {
    lines.push('## Company Info');
    if (facts.team_size) {
      lines.push(`Team size: ${facts.team_size}`);
    }
    if (facts.founded_year) {
      lines.push(`Founded: ${facts.founded_year}`);
    }
    lines.push('');
  }

  // DEI
  if (facts.dei_statement || (facts.dei_initiatives && facts.dei_initiatives.length > 0)) {
    lines.push('## Diversity & Inclusion');
    if (facts.dei_statement) {
      lines.push(facts.dei_statement);
      lines.push('');
    }
    if (facts.dei_initiatives && facts.dei_initiatives.length > 0) {
      lines.push('### Initiatives');
      facts.dei_initiatives.forEach(init => {
        lines.push(`**${init.name}**`);
        if (init.description) {
          lines.push(init.description);
        }
        lines.push('');
      });
    }
    if (facts.gender_pay_gap_url) {
      lines.push(`Gender Pay Gap Report: ${facts.gender_pay_gap_url}`);
      lines.push('');
    }
  }

  // Career Growth
  if (facts.promotion_framework || facts.learning_budget || (facts.career_levels && facts.career_levels.length > 0)) {
    lines.push('## Career Growth');
    if (facts.promotion_framework) {
      lines.push('### Promotion Framework');
      lines.push(facts.promotion_framework);
      lines.push('');
    }
    if (facts.learning_budget) {
      lines.push('### Learning Budget');
      lines.push(facts.learning_budget);
      lines.push('');
    }
    if (facts.career_levels && facts.career_levels.length > 0) {
      lines.push('### Career Levels');
      facts.career_levels.forEach(level => {
        lines.push(`**${level.level}: ${level.title}**`);
        if (level.description) {
          lines.push(level.description);
        }
        lines.push('');
      });
    }
  }

  // Leave & Time Off
  if (facts.maternity_leave || facts.paternity_leave || facts.parental_leave_details || facts.annual_leave) {
    lines.push('## Leave & Time Off');
    if (facts.maternity_leave) {
      lines.push(`Maternity leave: ${facts.maternity_leave}`);
    }
    if (facts.paternity_leave) {
      lines.push(`Paternity leave: ${facts.paternity_leave}`);
    }
    if (facts.parental_leave_details) {
      lines.push(facts.parental_leave_details);
    }
    if (facts.annual_leave) {
      lines.push(`Annual leave: ${facts.annual_leave}`);
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
 */
function generateMarkdownPage(facts: EmployerFacts): string {
  const lines: string[] = [];

  // Hero
  lines.push(`# ${facts.company_name}`);
  lines.push('');
  lines.push('**✓ Employer Verified** via [OpenRole](https://openrole.co.uk)');
  lines.push('');

  if (facts.culture_description) {
    lines.push(facts.culture_description);
    lines.push('');
  }

  // Quick Facts
  const quickFacts = [];
  if (facts.team_size) quickFacts.push(`**Team Size:** ${facts.team_size}`);
  if (facts.founded_year) quickFacts.push(`**Founded:** ${facts.founded_year}`);
  if (facts.remote_policy) quickFacts.push(`**Remote Policy:** ${formatRemotePolicy(facts.remote_policy)}`);

  if (quickFacts.length > 0) {
    lines.push('## Quick Facts');
    lines.push('');
    quickFacts.forEach(fact => lines.push(`- ${fact}`));
    lines.push('');
  }

  // Main sections (reuse llms.txt logic but with markdown formatting)
  const llmsTxt = generateLlmsTxt(facts);
  const sections = llmsTxt.split('\n## ').slice(1); // Skip header
  sections.forEach(section => {
    lines.push(`## ${section}`);
  });

  // Footer
  lines.push('---');
  lines.push('');
  lines.push('_This data was provided and verified by the employer._');
  lines.push(`_Last updated: ${facts.updated_at ? new Date(facts.updated_at).toLocaleDateString() : 'Recently'}_`);

  return lines.join('\n');
}

/**
 * Generate HTML snippet with microdata
 */
function generateFactPageHtml(facts: EmployerFacts): string {
  const html: string[] = [];

  html.push('<div itemscope itemtype="https://schema.org/Organization">');
  html.push(`  <h1 itemprop="name">${escapeHtml(facts.company_name)}</h1>`);
  
  if (facts.culture_description) {
    html.push(`  <p itemprop="description">${escapeHtml(facts.culture_description)}</p>`);
  }

  if (facts.salary_bands && facts.salary_bands.length > 0) {
    html.push('  <section>');
    html.push('    <h2>Salary Ranges</h2>');
    html.push('    <ul>');
    facts.salary_bands.forEach(band => {
      const currency = getCurrencySymbol(band.currency);
      html.push(`      <li><strong>${escapeHtml(band.role)}:</strong> ${currency}${band.min.toLocaleString()} - ${currency}${band.max.toLocaleString()}${band.equity ? ' (+ equity)' : ''}</li>`);
    });
    html.push('    </ul>');
    html.push('  </section>');
  }

  // Additional sections can be added similarly...

  html.push('</div>');

  return html.join('\n');
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
