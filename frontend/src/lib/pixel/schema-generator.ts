import type { JobPosting } from "@/types/jobs";

export function generateJobPostingSchema(jobs: JobPosting[], company: { name: string; website: string; logo_url?: string }) {
  return {
    "@context": "https://schema.org/",
    "@type": "Organization",
    name: company.name,
    url: company.website,
    dateModified: new Date().toISOString(),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Job Opportunities",
      itemListElement: jobs.map((job) => ({
        "@type": "JobPosting",
        title: job.title,
        description: job.description,
        datePosted: job.posted_date,
        validThrough: job.expires_date,
        employmentType: job.employment_type?.toUpperCase(),
        workFromHome: job.remote_eligible,
        hiringOrganization: {
          "@type": "Organization",
          name: company.name,
          sameAs: company.website,
          logo: company.logo_url,
        },
      })),
    },
  };
}
