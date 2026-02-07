import { SAMPLE_JOBS } from "@/lib/utils/constants";

export async function getEmploymentData(companyId: string) {
  return {
    company: {
      id: companyId,
      name: "BrandOS Demo",
      website: "https://brandos.com",
      logo_url: "/images/brandos-logo.svg",
    },
    jobs: SAMPLE_JOBS,
    compliance: {
      status: "warning",
      violations: 1,
    },
  };
}
