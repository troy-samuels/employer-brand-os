/**
 * @module lib/utils/sanitize-html
 * Provides server-side HTML sanitization for content rendered via
 * `dangerouslySetInnerHTML`. Strips dangerous tags and attributes to
 * prevent XSS while preserving safe formatting.
 */

/**
 * Strips potentially dangerous HTML elements and attributes while
 * preserving safe formatting tags.
 *
 * This is a basic regex-based sanitiser suitable for server-rendered CMS
 * content. For user-generated content at scale, prefer a dedicated library
 * such as `isomorphic-dompurify` or `sanitize-html`.
 *
 * @param html - Raw HTML string.
 * @returns Sanitised HTML string safe for `dangerouslySetInnerHTML`.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return "";

  // Step 1: Remove <script>, <style>, <iframe>, <object>, <embed>, <form>, <input>, <textarea>, <select>, <button> tags and their content
  let sanitized = html;
  const dangerousTags = [
    "script",
    "style",
    "iframe",
    "object",
    "embed",
    "form",
    "input",
    "textarea",
    "select",
    "button",
    "applet",
    "base",
    "link",
    "meta",
    "noscript",
  ];
  for (const tag of dangerousTags) {
    const regex = new RegExp(`<${tag}\\b[\\s\\S]*?<\\/${tag}>`, "gi");
    sanitized = sanitized.replace(regex, "");
    // Also remove self-closing or unclosed variants
    const selfClosing = new RegExp(`<${tag}\\b[^>]*\\/?>`, "gi");
    sanitized = sanitized.replace(selfClosing, "");
  }

  // Step 2: Remove on* event handler attributes (onclick, onerror, etc.)
  sanitized = sanitized.replace(
    /\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi,
    ""
  );

  // Step 3: Remove javascript: protocol in href/src
  sanitized = sanitized.replace(
    /\b(?:href|src)\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*')/gi,
    ""
  );

  // Step 4: Remove data: protocol in src (allows XSS via data:text/html)
  sanitized = sanitized.replace(
    /\bsrc\s*=\s*(?:"data:[^"]*"|'data:[^']*')/gi,
    ""
  );

  return sanitized;
}
