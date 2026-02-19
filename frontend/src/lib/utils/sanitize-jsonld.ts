/**
 * @module lib/utils/sanitize-jsonld
 * Sanitizes JSON-LD data to prevent XSS injection via structured data.
 * 
 * Security: The pixel injects JSON-LD into customer domains. Any user-controlled
 * data MUST be sanitized to prevent script injection, even though JSON.stringify
 * provides some protection.
 * 
 * Defense in depth: Multiple layers of sanitization for critical security boundary.
 */

/**
 * Sanitize a value for safe inclusion in JSON-LD
 * 
 * Security rules:
 * 1. Strip all HTML tags (JSON-LD is data, not markup)
 * 2. Remove potentially dangerous characters (</script>, -->, etc.)
 * 3. Normalize unicode to prevent homograph attacks
 * 4. Limit string length to prevent DoS
 * 5. Recursively sanitize objects and arrays
 * 
 * @param value - The value to sanitize
 * @param maxDepth - Maximum nesting depth (prevents recursion DoS)
 * @returns Sanitized value safe for JSON-LD injection
 */
export function sanitizeJsonLdValue(
  value: unknown,
  maxDepth: number = 10
): unknown {
  if (maxDepth <= 0) {
    return null; // Prevent deep recursion attacks
  }

  // Null and undefined pass through
  if (value === null || value === undefined) {
    return value;
  }

  // Numbers and booleans are safe
  if (typeof value === 'number' || typeof value === 'boolean') {
    // Validate numbers are finite
    if (typeof value === 'number' && !Number.isFinite(value)) {
      return null;
    }
    return value;
  }

  // Strings need sanitization
  if (typeof value === 'string') {
    return sanitizeString(value);
  }

  // Arrays: recursively sanitize each element
  if (Array.isArray(value)) {
    return value
      .map((item) => sanitizeJsonLdValue(item, maxDepth - 1))
      .filter((item) => item !== null && item !== undefined);
  }

  // Objects: recursively sanitize each property
  if (typeof value === 'object') {
    const sanitized: Record<string, unknown> = {};
    
    for (const [key, val] of Object.entries(value)) {
      // Sanitize both keys and values
      const sanitizedKey = sanitizePropertyKey(key);
      if (sanitizedKey) {
        const sanitizedValue = sanitizeJsonLdValue(val, maxDepth - 1);
        if (sanitizedValue !== null && sanitizedValue !== undefined) {
          sanitized[sanitizedKey] = sanitizedValue;
        }
      }
    }
    
    return sanitized;
  }

  // Unknown types: reject
  return null;
}

/**
 * Sanitize a string value for JSON-LD
 * 
 * CRITICAL: This runs on customer domains. Any XSS here = game over.
 */
function sanitizeString(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  const MAX_STRING_LENGTH = 10000; // Prevent DoS
  let sanitized = input.slice(0, MAX_STRING_LENGTH);

  // Step 1: Remove all HTML tags
  sanitized = sanitized.replace(/<[^>]*>/g, '');

  // Step 2: Remove script-closing sequences (defense in depth)
  // Even though JSON-LD is in <script type="application/ld+json">,
  // a malicious </script> could break out
  sanitized = sanitized.replace(/<\/script/gi, '');
  sanitized = sanitized.replace(/<script/gi, '');

  // Step 3: Remove HTML comment sequences
  sanitized = sanitized.replace(/<!--/g, '');
  sanitized = sanitized.replace(/-->/g, '');

  // Step 4: Remove CDATA sequences
  sanitized = sanitized.replace(/<!\[CDATA\[/gi, '');
  sanitized = sanitized.replace(/\]\]>/g, '');

  // Step 5: Remove null bytes and other control characters
  sanitized = sanitized.replace(/\0/g, '');
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');

  // Step 6: Normalize unicode (prevent homograph attacks)
  try {
    sanitized = sanitized.normalize('NFKC');
  } catch {
    // normalize() can throw on invalid input
    sanitized = '';
  }

  // Step 7: Trim whitespace
  sanitized = sanitized.trim();

  return sanitized;
}

/**
 * Sanitize an object property key
 * 
 * Keys should be alphanumeric + hyphens/underscores only
 * Allow @context, @type, etc. for schema.org compliance
 */
function sanitizePropertyKey(key: string): string | null {
  if (!key || typeof key !== 'string') {
    return null;
  }

  // Allow schema.org special keys
  if (key.startsWith('@')) {
    // Only allow known schema.org keys
    const allowedSchemaKeys = [
      '@context',
      '@type',
      '@id',
      '@graph',
      '@value',
      '@language',
    ];
    if (allowedSchemaKeys.includes(key)) {
      return key;
    }
    return null;
  }

  // Allow x- prefix for custom properties
  if (key.startsWith('x-')) {
    // Validate the rest of the key
    const suffix = key.slice(2);
    if (/^[a-zA-Z0-9_-]+$/.test(suffix)) {
      return key;
    }
    return null;
  }

  // Standard property keys: alphanumeric + underscore + hyphen only
  if (/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(key)) {
    return key;
  }

  return null;
}

/**
 * Validate that a JSON-LD object is safe to inject
 * 
 * This is a final safety check before injection. Should never fail
 * if sanitizeJsonLdValue was called first, but defense in depth.
 * 
 * @param jsonLd - The JSON-LD object to validate
 * @returns True if safe, false if potentially dangerous
 */
export function validateJsonLdSafety(jsonLd: unknown): boolean {
  try {
    // Convert to JSON string
    const serialized = JSON.stringify(jsonLd);

    // Check for dangerous patterns
    const dangerousPatterns = [
      /<script/i,
      /<\/script/i,
      /javascript:/i,
      /onerror=/i,
      /onload=/i,
      /<iframe/i,
      /<embed/i,
      /<object/i,
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(serialized)) {
        console.error('[SECURITY] Dangerous pattern detected in JSON-LD:', pattern);
        return false;
      }
    }

    // Validate it's valid JSON (should always be true after JSON.stringify)
    JSON.parse(serialized);

    return true;
  } catch (error) {
    console.error('[SECURITY] JSON-LD validation failed:', error);
    return false;
  }
}

/**
 * Sanitize an entire JSON-LD organization object
 * 
 * Convenience wrapper for the most common use case
 */
export function sanitizeOrganizationJsonLd(
  jsonLd: Record<string, unknown>
): Record<string, unknown> {
  const sanitized = sanitizeJsonLdValue(jsonLd) as Record<string, unknown>;
  
  // Ensure required schema.org properties exist
  if (!sanitized['@context']) {
    sanitized['@context'] = 'https://schema.org';
  }
  if (!sanitized['@type']) {
    sanitized['@type'] = 'Organization';
  }

  // Validate safety before returning
  if (!validateJsonLdSafety(sanitized)) {
    // Return minimal safe object if validation fails
    console.error('[SECURITY] JSON-LD failed safety validation, returning minimal object');
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Organization',
    };
  }

  return sanitized;
}
