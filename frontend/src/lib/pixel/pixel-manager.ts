/**
 * @module lib/pixel/pixel-manager
 * Module implementation for pixel-manager.ts.
 */

import { SAMPLE_JOBS } from "@/lib/utils/constants";

/**
 * Executes getEmploymentData.
 * @param companyId - companyId input.
 * @returns The resulting value.
 */
export async function getEmploymentData(companyId: string) {
  return {
    company: {
      id: companyId,
      name: "OpenRole Demo",
      website: "https://openrole.co.uk",
      logo_url: "/images/openrole-logo.svg",
    },
    jobs: SAMPLE_JOBS,
    compliance: {
      status: "warning",
      violations: 1,
    },
  };
}
