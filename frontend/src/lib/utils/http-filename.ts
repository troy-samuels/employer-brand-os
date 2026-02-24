/**
 * @module lib/utils/http-filename
 * Utilities for building safe Content-Disposition filenames.
 */

const NON_ASCII = /[^\x20-\x7E]/g;
const UNSAFE_CHARS = /[^a-zA-Z0-9._-]+/g;
const EDGE_SEPARATORS = /^[._-]+|[._-]+$/g;
const DUPLICATE_DASH = /-+/g;
const MAX_FILENAME_SEGMENT = 80;

/**
 * Normalizes arbitrary user input into a conservative ASCII filename segment.
 * This protects header construction from control characters and odd quoting.
 */
export function toSafeFilenameSegment(
  value: string,
  fallback = "download"
): string {
  const normalized = (value ?? "")
    .trim()
    .normalize("NFKD")
    .replace(NON_ASCII, "")
    .replace(UNSAFE_CHARS, "-")
    .replace(DUPLICATE_DASH, "-")
    .replace(EDGE_SEPARATORS, "")
    .slice(0, MAX_FILENAME_SEGMENT);

  return normalized || fallback;
}

/**
 * Builds an attachment header with a quoted, pre-sanitized filename.
 */
export function toAttachmentDisposition(filename: string): string {
  return `attachment; filename="${filename}"`;
}
