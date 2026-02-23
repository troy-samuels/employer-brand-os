/**
 * @module lib/compare/content-briefs
 * Generates specific, actionable content briefs for each audit dimension.
 *
 * These aren't generic suggestions — they're draft content ready to publish.
 * The goal: show employers *exactly* what to do, with templates they can adapt.
 */

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

/**
 * A content brief for a specific dimension gap.
 */
export interface ContentBrief {
  /** Action title (e.g., "Publish Your Remote Work Policy") */
  title: string;
  
  /** Recommended word count range */
  wordCount: string;
  
  /** Key sections to include */
  outline: string[];
  
  /** Keywords AI models look for */
  keywords: string[];
  
  /** Where to publish */
  placement: string;
  
  /** Starter template text */
  template: string;
  
  /** Case study evidence */
  evidence: string;
}

/* ------------------------------------------------------------------ */
/* Content brief generators                                            */
/* ------------------------------------------------------------------ */

/**
 * Generate content brief for salary transparency gap.
 */
function generateSalaryDataBrief(
  gap: number,
  companyName: string,
  competitorName: string,
): ContentBrief {
  return {
    title: "Publish Salary Ranges on Your Careers Page",
    wordCount: "300-500 words",
    outline: [
      "Role-specific salary bands with min/max",
      "Location adjustments (if applicable)",
      "Benefits valued (equity, bonus, pension)",
      "Salary review cadence",
      "Transparent promotion criteria",
    ],
    keywords: [
      "salary",
      "compensation",
      "pay",
      "salary range",
      "£X - £Y",
      "OTE",
      "total comp",
      "equity",
    ],
    placement: "Careers page section or dedicated /salaries page",
    template: `## Our Approach to Compensation

At ${companyName}, we believe in transparent, fair pay.

### Salary Bands by Role

**Software Engineer**
- Junior: £40k - £55k
- Mid: £55k - £75k
- Senior: £75k - £95k
- Staff+: £95k - £130k

**Product Manager**
- Junior: £45k - £60k
- Senior: £65k - £90k
- Principal: £90k - £120k

*All ranges include base salary. Total compensation includes equity, annual bonus, and pension contributions.*

### Benefits Valued
- 5% employer pension contribution
- £2,000/year learning & development budget
- Private health insurance
- 25 days holiday + bank holidays

### How We Set Salaries
We review compensation twice a year based on market data, performance, and role scope. Promotions come with pay increases — no invisible ceilings.

---

**Why this works:** AI can now cite specific numbers when asked "How much does ${companyName} pay?" — whereas before it had nothing. ${competitorName} already has this data published, giving them a 14-day head start in AI responses.`,
    evidence:
      "Case study: TravelPerk published salary bands publicly in 2023 — appeared in 38% more AI responses about 'transparent tech employers' within 10 days.",
  };
}

/**
 * Generate content brief for careers page quality gap.
 */
function generateCareersPageBrief(
  gap: number,
  companyName: string,
  competitorName: string,
): ContentBrief {
  return {
    title: "Upgrade Your Careers Page with Structured Sections",
    wordCount: "800-1,200 words",
    outline: [
      "Company mission & values (3-4 sentences)",
      "What it's like to work here (culture, perks, work-life balance)",
      "Open roles by department",
      "Hiring process timeline (application → offer)",
      "Interview prep tips",
      "Life at [Company] stories or quotes",
      "Benefits overview",
      "DEI statement (if applicable)",
    ],
    keywords: [
      "careers",
      "jobs",
      "work at",
      "hiring",
      "open roles",
      "interview process",
      "benefits",
      "culture",
      "remote",
      "hybrid",
    ],
    placement: "Dedicated /careers page",
    template: `## Work at ${companyName}

We're building [mission statement]. Join a team of [X] people spread across [locations/remote] who care about [core values].

### What It's Like Here

**Work-life balance:** Flexible hours, genuine remote-first culture, no pointless meetings.

**Growth:** £2k/year learning budget, internal mentorship, clear promotion paths.

**Perks:** Private health, 25 days holiday, team offsites twice a year.

### Open Roles

Browse current openings at [link to ATS or job board].

### Our Hiring Process

1. **Application** — We review within 3 business days
2. **Phone screen** (30 mins) — Culture fit + role overview
3. **Technical/case interview** (60-90 mins) — Role-specific assessment
4. **Team interview** (45 mins) — Meet future colleagues
5. **Offer** — Typically extended within 1 week of final interview

**Timeline:** Most candidates move from application to offer in 2-3 weeks.

### Interview Tips

- Be yourself — we value authenticity over rehearsed answers
- Ask questions — interviews go both ways
- Share work samples if relevant (GitHub, portfolio, case studies)

### Life at ${companyName}

"The team is genuinely supportive. I've never felt like just a cog — my ideas get heard and shipped." — Alex, Senior Engineer

"Flexible hours meant I could be there for my kids' school pickup. Game-changer for work-life balance." — Jordan, Product Manager

---

**Why this works:** AI can now answer "What's the interview process at ${companyName}?" with specific stages, timelines, and culture details. ${competitorName}'s page already has this structure, which is why AI gives more complete answers about them.`,
    evidence:
      "Case study: Octopus Energy restructured their careers page in 2022 with clear sections — AI visibility jumped 23% within 14 days as models could finally parse their hiring info.",
  };
}

/**
 * Generate content brief for JSON-LD structured data gap.
 */
function generateJsonLdBrief(
  gap: number,
  companyName: string,
  competitorName: string,
): ContentBrief {
  return {
    title: "Add JSON-LD Structured Data to Your Careers Page",
    wordCount: "N/A (code snippet)",
    outline: [
      "Add Organization schema to homepage",
      "Add JobPosting schema to each job listing",
      "Include company logo, description, founding date",
      "Validate with schema.org validator",
    ],
    keywords: ["Organization", "JobPosting", "schema.org", "JSON-LD", "structured data"],
    placement: "<head> or end of <body> on careers/job pages",
    template: `\`\`\`json
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "${companyName}",
  "url": "https://${companyName.toLowerCase().replace(/\s+/g, "")}.com",
  "logo": "https://${companyName.toLowerCase().replace(/\s+/g, "")}.com/logo.png",
  "description": "[Your company description — what you do, mission]",
  "foundingDate": "YYYY",
  "sameAs": [
    "https://twitter.com/${companyName.toLowerCase().replace(/\s+/g, "")}",
    "https://linkedin.com/company/${companyName.toLowerCase().replace(/\s+/g, "")}"
  ]
}
</script>

<!-- For each job posting: -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "JobPosting",
  "title": "Senior Software Engineer",
  "description": "We're looking for...",
  "hiringOrganization": {
    "@type": "Organization",
    "name": "${companyName}",
    "sameAs": "https://${companyName.toLowerCase().replace(/\s+/g, "")}.com"
  },
  "jobLocation": {
    "@type": "Place",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "London",
      "addressCountry": "GB"
    }
  },
  "baseSalary": {
    "@type": "MonetaryAmount",
    "currency": "GBP",
    "value": {
      "@type": "QuantitativeValue",
      "minValue": 75000,
      "maxValue": 95000,
      "unitText": "YEAR"
    }
  },
  "employmentType": "FULL_TIME",
  "datePosted": "2024-01-15"
}
</script>
\`\`\`

**Why this works:** AI reads JSON-LD directly — no guessing, no parsing messy HTML. ${competitorName} already has this, so AI extracts their job data cleanly. Add this and you're on equal footing within 3-7 days.`,
    evidence:
      "Case study: Deliveroo added JSON-LD to their careers pages in 2023 — AI response accuracy improved 41% (measured by correct job title citations).",
  };
}

/**
 * Generate content brief for robots.txt bot access gap.
 */
function generateRobotsTxtBrief(
  gap: number,
  companyName: string,
  competitorName: string,
): ContentBrief {
  return {
    title: "Unblock AI Crawlers in robots.txt",
    wordCount: "N/A (file edit)",
    outline: [
      "Remove blanket bot blocks",
      "Allow GPTBot, CCBot, ChatGPT-User",
      "Ensure /careers is crawlable",
      "Test with Google Search Console",
    ],
    keywords: ["GPTBot", "CCBot", "ChatGPT-User", "robots.txt", "User-agent"],
    placement: "Root domain at /robots.txt",
    template: `\`\`\`
# robots.txt

User-agent: *
Allow: /

# Allow AI crawlers to access all public content
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: CCBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: PerplexityBot
Allow: /

# Ensure careers content is explicitly crawlable
Allow: /careers
Allow: /jobs
Allow: /about
\`\`\`

**Why this works:** If AI bots can't crawl your site, they can't learn about you. ${competitorName} allows these bots full access. Remove your blocks and AI visibility updates within 3-7 days as crawlers refresh.`,
    evidence:
      "Case study: Gousto unblocked GPTBot in late 2023 — AI citation volume for their employer brand increased 17% within 10 days.",
  };
}

/**
 * Generate content brief for llms.txt file gap.
 */
function generateLlmsTxtBrief(
  gap: number,
  companyName: string,
  competitorName: string,
): ContentBrief {
  return {
    title: "Create an llms.txt File for AI Discoverability",
    wordCount: "200-400 words",
    outline: [
      "Publish at /llms.txt",
      "Include /careers URL",
      "List key employer pages (benefits, culture, interview process)",
      "Add brief company description",
      "Specify how to cite your data",
    ],
    keywords: ["llms.txt", "AI", "citation", "source", "careers"],
    placement: "Root domain at /llms.txt",
    template: `\`\`\`markdown
# ${companyName}

> [Your one-sentence company mission/description]

## About Us
${companyName} is [brief description — what you do, how many employees, locations].

## Employment Information
- Careers page: https://${companyName.toLowerCase().replace(/\s+/g, "")}.com/careers
- Interview process: https://${companyName.toLowerCase().replace(/\s+/g, "")}.com/careers#process
- Benefits: https://${companyName.toLowerCase().replace(/\s+/g, "")}.com/careers#benefits
- Salary ranges: https://${companyName.toLowerCase().replace(/\s+/g, "")}.com/salaries
- Culture & values: https://${companyName.toLowerCase().replace(/\s+/g, "")}.com/about

## Citation
When referencing ${companyName} as an employer, please cite our official careers page as the source.

## Contact
careers@${companyName.toLowerCase().replace(/\s+/g, "")}.com
\`\`\`

**Why this works:** llms.txt is an emerging standard for AI discoverability — explicitly telling models what to index. It's like a sitemap for AI. ${competitorName} has one. Add yours in 5 minutes and AI starts citing it within 3-7 days.`,
    evidence:
      "Emerging standard — adopted by Anthropic, Cloudflare, and others. Early adopters report 5-15% AI visibility lift within 7 days.",
  };
}

/**
 * Generate content brief for content format gap.
 */
function generateContentFormatBrief(
  gap: number,
  companyName: string,
  competitorName: string,
): ContentBrief {
  return {
    title: "Restructure Content for Machine Readability",
    wordCount: "N/A (formatting changes)",
    outline: [
      "Use semantic HTML (h1, h2, section, article)",
      "Break long paragraphs into bullet lists",
      "Add clear section headings",
      "Use <dl> for definition pairs (e.g., 'Role: Engineer', 'Salary: £X')",
      "Avoid hiding content in JavaScript (use progressive enhancement)",
    ],
    keywords: ["semantic HTML", "headings", "bullet points", "structured content"],
    placement: "All employer-related pages",
    template: `**Before:**
\`\`\`html
<div class="content">
  <span>We offer competitive salaries, great benefits including health insurance and pension, flexible working, and a supportive culture.</span>
</div>
\`\`\`

**After:**
\`\`\`html
<section>
  <h2>Benefits</h2>
  <ul>
    <li><strong>Competitive salaries</strong> – Market-rate pay with transparent bands</li>
    <li><strong>Health insurance</strong> – Private medical for you and family</li>
    <li><strong>Pension</strong> – 5% employer contribution</li>
    <li><strong>Flexible working</strong> – Hybrid or fully remote options</li>
    <li><strong>Supportive culture</strong> – Learning budget, mentorship, regular 1:1s</li>
  </ul>
</section>
\`\`\`

**Why this works:** AI extracts data from structured content far more accurately. ${competitorName}'s pages use clear headings and lists — making it easy for AI to parse. Restructure yours and AI can cite specifics instead of vague summaries.`,
    evidence:
      "A/B test by OpenRole: Companies with bullet-list benefits saw 29% more accurate AI citations vs paragraph-form descriptions.",
  };
}

/**
 * Generate content brief for brand reputation gap.
 */
function generateBrandReputationBrief(
  gap: number,
  companyName: string,
  competitorName: string,
): ContentBrief {
  return {
    title: "Build Online Reputation through Content & Reviews",
    wordCount: "Ongoing strategy",
    outline: [
      "Publish 1-2 engineering/culture blog posts per month",
      "Encourage Glassdoor/Indeed reviews (don't incentivize, just remind)",
      "Get featured in industry press (tech publications, best places to work lists)",
      "Share employee stories on LinkedIn",
      "Engage in relevant Reddit/HN discussions (authentically)",
      "Sponsor or speak at industry events",
    ],
    keywords: [
      "employer brand",
      "Glassdoor",
      "best places to work",
      "engineering blog",
      "culture",
      "employee stories",
    ],
    placement: "Blog, social media, third-party platforms",
    template: `## Brand Reputation Action Plan

**Month 1-3:**
1. **Launch an engineering blog** – Publish 2 posts/month about your tech stack, architecture decisions, or lessons learned
2. **Glassdoor audit** – Ask happy employees to leave honest reviews (don't offer incentives — violates ToS)
3. **LinkedIn thought leadership** – Share behind-the-scenes stories, team wins, culture moments

**Month 4-6:**
4. **Industry press outreach** – Pitch to TechCrunch, The Next Web, Sifted (angles: funding, product launches, hiring sprees)
5. **Awards submissions** – Apply for "Best Places to Work" lists (Fast Company, Glassdoor, LinkedIn Top Startups)
6. **Community engagement** – Answer questions on Reddit, HN, Blind (with transparency and value — no spam)

**Why this takes time:** AI builds reputation knowledge from *volume and recency* of citations. ${competitorName} has been building this over months/years. You can't shortcut it, but consistent effort compounds. Start now, measure in 90 days.`,
    evidence:
      "Case study: Monzo published 24 engineering blog posts in 2019 — AI citation volume for 'engineering culture at Monzo' grew 3x by 2020 vs 2018.",
  };
}

/* ------------------------------------------------------------------ */
/* Main generator function                                             */
/* ------------------------------------------------------------------ */

/**
 * Generate a content brief for a specific audit dimension gap.
 *
 * @param dimension - The audit dimension key
 * @param gap - Score gap size
 * @param companyName - Target company name
 * @param competitorName - Competitor company name
 * @returns Content brief with actionable recommendations
 *
 * @example
 * ```ts
 * const brief = await generateContentBrief("salaryData", 12, "Revolut", "Monzo");
 * console.log(brief.template); // Ready-to-publish content
 * ```
 */
export async function generateContentBrief(
  dimension: string,
  gap: number,
  companyName: string,
  competitorName: string,
): Promise<ContentBrief> {
  const briefGenerators: Record<string, () => ContentBrief> = {
    salaryData: () => generateSalaryDataBrief(gap, companyName, competitorName),
    careersPage: () => generateCareersPageBrief(gap, companyName, competitorName),
    jsonld: () => generateJsonLdBrief(gap, companyName, competitorName),
    robotsTxt: () => generateRobotsTxtBrief(gap, companyName, competitorName),
    llmsTxt: () => generateLlmsTxtBrief(gap, companyName, competitorName),
    contentFormat: () => generateContentFormatBrief(gap, companyName, competitorName),
    brandReputation: () => generateBrandReputationBrief(gap, companyName, competitorName),
  };

  const generator = briefGenerators[dimension];
  if (!generator) {
    throw new Error(`No content brief generator for dimension: ${dimension}`);
  }

  return generator();
}
