/**
 * @module lib/utils/safe-json
 * Safe JSON serialization for HTML script contexts.
 */

/**
 * Serializes JSON and escapes characters that can break out of script tags.
 * This is intended for `dangerouslySetInnerHTML` with JSON-LD payloads.
 */
export function serializeJsonForHtml(value: unknown): string {
  const serialized = JSON.stringify(value);
  const payload = serialized === undefined ? "null" : serialized;

  return payload
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
