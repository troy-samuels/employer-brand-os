/**
 * @module lib/snippet/validator
 * Validates generated JSON-LD snippets for Schema.org compliance
 */

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  completeness: number; // 0-100
}

/**
 * Validates a JSON-LD Schema.org object
 * @param jsonLd - The JSON-LD object to validate
 * @returns Validation result with errors, warnings, and completeness score
 */
export function validateJsonLd(jsonLd: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  let score = 0;
  const maxScore = 100;

  // Required fields (critical)
  const requiredFields = [
    { key: '@context', points: 10, name: '@context' },
    { key: '@type', points: 10, name: '@type' },
    { key: 'name', points: 10, name: 'Organization name' },
  ];

  for (const field of requiredFields) {
    if (jsonLd[field.key]) {
      score += field.points;
    } else {
      errors.push(`Missing required field: ${field.name}`);
    }
  }

  // Recommended fields (improve visibility)
  const recommendedFields = [
    { key: 'description', points: 5, name: 'Organization description' },
    { key: 'url', points: 5, name: 'Website URL' },
    { key: 'logo', points: 5, name: 'Logo URL' },
    { key: 'sameAs', points: 5, name: 'Social media links' },
    { key: 'address', points: 5, name: 'Physical address' },
  ];

  for (const field of recommendedFields) {
    if (jsonLd[field.key]) {
      score += field.points;
    } else {
      warnings.push(`Missing recommended field: ${field.name}`);
    }
  }

  // Optional but valuable fields
  const optionalFields = [
    { key: 'foundingDate', points: 3, name: 'Founding date' },
    { key: 'numberOfEmployees', points: 3, name: 'Employee count' },
    { key: 'aggregateRating', points: 4, name: 'Aggregate rating' },
  ];

  for (const field of optionalFields) {
    if (jsonLd[field.key]) {
      score += field.points;
    }
  }

  // Job postings boost
  if (jsonLd.hasOfferCatalog) {
    const catalog = jsonLd.hasOfferCatalog as Record<string, unknown>;
    if (Array.isArray(catalog.itemListElement) && catalog.itemListElement.length > 0) {
      score += 10;
    } else {
      warnings.push('Job postings catalog is empty');
    }
  } else {
    warnings.push('No job postings included (recommended for careers pages)');
  }

  // Validate @context
  if (jsonLd['@context'] !== 'https://schema.org') {
    errors.push('Invalid @context - must be "https://schema.org"');
  }

  // Validate @type
  if (jsonLd['@type'] !== 'Organization') {
    warnings.push('Unexpected @type - typically should be "Organization"');
  }

  // Validate URLs if present
  if (jsonLd.url && typeof jsonLd.url === 'string') {
    try {
      new URL(jsonLd.url);
    } catch {
      errors.push('Invalid URL format');
    }
  }

  if (jsonLd.logo && typeof jsonLd.logo === 'string') {
    try {
      new URL(jsonLd.logo);
    } catch {
      errors.push('Invalid logo URL format');
    }
  }

  // Validate social links
  if (jsonLd.sameAs && Array.isArray(jsonLd.sameAs)) {
    for (const link of jsonLd.sameAs) {
      try {
        new URL(link as string);
      } catch {
        errors.push(`Invalid social media URL: ${link}`);
      }
    }
  }

  // Calculate final completeness
  const completeness = Math.min(100, Math.round(score));

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    completeness,
  };
}

/**
 * Generates a human-readable summary of validation results
 */
export function getValidationSummary(result: ValidationResult): string {
  if (result.valid && result.completeness === 100) {
    return 'Perfect! Your schema is fully optimized.';
  }
  if (result.valid && result.completeness >= 80) {
    return 'Great! Your schema is well-structured with good coverage.';
  }
  if (result.valid && result.completeness >= 60) {
    return 'Good start. Consider adding recommended fields for better visibility.';
  }
  if (result.valid) {
    return 'Valid but incomplete. Add more data for better AI crawler visibility.';
  }
  return 'Schema has errors that need to be fixed.';
}
