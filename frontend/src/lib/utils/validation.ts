/**
 * @module lib/utils/validation
 * Module implementation for validation.ts.
 */

import { z } from "zod";

/**
 * Exposes exported value(s): domainRegex.
 */
export const domainRegex =
  /^(?=.{1,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i;

/**
 * Executes normalizeDomain.
 * @param input - input input.
 * @returns The resulting value.
 */
export function normalizeDomain(input: string) {
  const trimmed = input.trim();
  if (!trimmed) return "";

  const hasScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed);
  const candidate = hasScheme ? trimmed : `https://${trimmed}`;

  try {
    const url = new URL(candidate);
    if (!["http:", "https:"].includes(url.protocol)) {
      return "";
    }
    const hostname = url.hostname.toLowerCase();
    return domainRegex.test(hostname) ? hostname : "";
  } catch {
    return "";
  }
}

/**
 * Exposes exported value(s): auditFormSchema.
 */
export const auditFormSchema = z.object({
  companyDomain: z
    .string()
    .min(1, "Company domain is required")
    .transform((value) => normalizeDomain(value))
    .refine((value) => domainRegex.test(value), "Invalid domain format"),
  companyName: z.string().min(2, "Company name is required"),
  email: z.string().email("Valid email address is required"),
  industry: z.string().optional(),
});

/**
 * Defines the AuditFormValues contract.
 */
export type AuditFormValues = z.infer<typeof auditFormSchema>;
