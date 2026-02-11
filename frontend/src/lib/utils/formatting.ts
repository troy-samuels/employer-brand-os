/**
 * Executes formatDate.
 * @param value - value input.
 * @returns The resulting value.
 */
/**
 * @module lib/utils/formatting
 * Module implementation for formatting.ts.
 */

export function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

/**
 * Executes formatScore.
 * @param value - value input.
 * @returns The resulting value.
 */
export function formatScore(value: number) {
  return `${value.toFixed(1)}/10`;
}

/**
 * Executes formatCurrency.
 * @param min - min input.
 * @param max - max input.
 * @param currency - currency input.
 * @returns The resulting value.
 */
export function formatCurrency(min: number, max: number, currency = "USD") {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  });

  return `${formatter.format(min)} - ${formatter.format(max)}`;
}
