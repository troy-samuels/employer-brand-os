/**
 * @module data/industries
 * UK industry definitions for the AI Employer Visibility Index.
 * Each industry gets its own SEO-optimised page at /index/[slug].
 */

export interface Industry {
  slug: string;
  name: string;
  description: string;
  /** Long-form intro for the industry page — unique content for SEO */
  seoIntro: string;
  /** Related industries for internal linking */
  related: string[];
}

export const industries: Industry[] = [
  {
    slug: "fintech",
    name: "Fintech",
    description: "UK financial technology employers ranked by AI visibility",
    seoIntro:
      "The UK fintech sector employs over 76,000 people and competes fiercely for engineering, product, and compliance talent. When candidates ask ChatGPT or Claude about fintech employers, the answers shape where they apply. This index ranks UK fintech companies by how accurately AI represents them — from salary data to remote policies to interview processes.",
    related: ["finance", "saas", "payments"],
  },
  {
    slug: "saas",
    name: "SaaS & Software",
    description: "UK SaaS and software employers ranked by AI visibility",
    seoIntro:
      "The UK's SaaS and software sector is one of the most competitive talent markets in Europe. Engineers, designers, and product managers routinely ask AI to compare employers before applying. Companies with strong AI visibility attract more — and better — applicants. This index shows which UK software employers AI recommends, and which are invisible.",
    related: ["fintech", "cybersecurity", "ai-ml"],
  },
  {
    slug: "healthcare",
    name: "Healthcare & Life Sciences",
    description: "UK healthcare and life sciences employers ranked by AI visibility",
    seoIntro:
      "Healthcare and life sciences employers face unique recruitment challenges — from clinical roles to research positions to NHS-adjacent talent competition. Candidates increasingly use AI to compare employers, research salaries, and prepare for interviews. This index tracks which UK healthcare employers are visible to AI and which have critical information gaps.",
    related: ["pharma", "nhs", "biotech"],
  },
  {
    slug: "retail",
    name: "Retail & E-Commerce",
    description: "UK retail and e-commerce employers ranked by AI visibility",
    seoIntro:
      "The UK retail sector employs over 3 million people, from store associates to e-commerce engineers. As candidates research employers through AI, the companies with published career content and accurate salary data win more applications. This index ranks UK retail employers by AI visibility across the questions candidates actually ask.",
    related: ["logistics", "fmcg", "hospitality"],
  },
  {
    slug: "finance",
    name: "Banking & Financial Services",
    description: "UK banking and financial services employers ranked by AI visibility",
    seoIntro:
      "London is the world's leading financial centre, and AI is transforming how candidates evaluate banking employers. From graduate analysts to experienced quants, job seekers ask AI about compensation, culture, and work-life balance before applying. This index reveals which UK financial services firms control their AI narrative — and which are being defined by outdated Glassdoor reviews.",
    related: ["fintech", "insurance", "consulting"],
  },
  {
    slug: "consulting",
    name: "Consulting & Professional Services",
    description: "UK consulting and professional services employers ranked by AI visibility",
    seoIntro:
      "The Big Four and beyond — consulting firms compete intensely for graduate and experienced hire talent. Candidates use AI to compare firms on salary progression, culture, travel expectations, and exit opportunities. This index tracks which UK consultancies are visible to AI and which have information gaps that cost them candidates.",
    related: ["finance", "legal", "accounting"],
  },
  {
    slug: "engineering",
    name: "Engineering & Manufacturing",
    description: "UK engineering and manufacturing employers ranked by AI visibility",
    seoIntro:
      "From aerospace to automotive to renewable energy, UK engineering employers compete for skilled talent in an increasingly tight market. Engineers researching employers through AI need specific information — tech stacks, project types, progression paths. This index shows which engineering employers publish the facts AI needs, and which are invisible.",
    related: ["automotive", "energy", "construction"],
  },
  {
    slug: "media",
    name: "Media, Marketing & Creative",
    description: "UK media, marketing and creative employers ranked by AI visibility",
    seoIntro:
      "Creative industries attract passionate candidates who research employers thoroughly before committing. AI is increasingly where that research happens — from agency culture to in-house vs agency pay, to creative freedom and client portfolios. This index ranks UK media and creative employers by how well AI can answer candidate questions.",
    related: ["advertising", "publishing", "entertainment"],
  },
  {
    slug: "education",
    name: "Education & EdTech",
    description: "UK education and edtech employers ranked by AI visibility",
    seoIntro:
      "Education employers — from universities to edtech startups — face unique challenges in communicating their value proposition to talent. Candidates ask AI about teaching loads, research support, funding, and tech culture. This index tracks which UK education employers are visible to AI and where the information gaps are.",
    related: ["nonprofit", "government", "saas"],
  },
  {
    slug: "energy",
    name: "Energy & Sustainability",
    description: "UK energy and sustainability employers ranked by AI visibility",
    seoIntro:
      "The UK's energy transition is creating thousands of new roles across renewables, grid infrastructure, and sustainability consulting. Candidates passionate about climate increasingly use AI to find employers aligned with their values. This index shows which UK energy employers AI recommends — and which are missing from the conversation entirely.",
    related: ["engineering", "construction", "consulting"],
  },
  {
    slug: "hospitality",
    name: "Hospitality & Travel",
    description: "UK hospitality and travel employers ranked by AI visibility",
    seoIntro:
      "Hospitality and travel employers face high turnover and fierce competition for talent. When candidates ask AI about working at hotels, restaurants, airlines, or travel companies, they want specifics — pay, hours, progression, tips policy. This index reveals which UK hospitality employers provide those answers and which let AI guess.",
    related: ["retail", "entertainment", "fmcg"],
  },
  {
    slug: "legal",
    name: "Legal",
    description: "UK legal employers ranked by AI visibility",
    seoIntro:
      "From magic circle firms to high street practices, UK legal employers compete for trainees, NQs, and lateral hires in a market where reputation is everything. Candidates use AI to compare firms on salary, hours, culture, and training quality. This index tracks which UK law firms are visible to AI — and which are being defined by anonymous forums.",
    related: ["consulting", "finance", "government"],
  },
  {
    slug: "cybersecurity",
    name: "Cybersecurity",
    description: "UK cybersecurity employers ranked by AI visibility",
    seoIntro:
      "The UK cybersecurity sector has a significant talent gap, with demand far outstripping supply. Security professionals use AI to compare employers on technical challenge, tooling, certifications support, and compensation. This index shows which UK cybersecurity employers AI recommends to candidates — and where the information gaps are costing you hires.",
    related: ["saas", "government", "finance"],
  },
  {
    slug: "ai-ml",
    name: "AI & Machine Learning",
    description: "UK AI and machine learning employers ranked by AI visibility",
    seoIntro:
      "The UK's AI sector is growing rapidly, and competition for ML engineers, research scientists, and AI product managers is intense. These candidates are, unsurprisingly, heavy AI users who research employers through ChatGPT and Claude before applying. This index ranks UK AI companies by employer visibility — how well AI can answer questions about working there.",
    related: ["saas", "fintech", "cybersecurity"],
  },
  {
    slug: "government",
    name: "Government & Public Sector",
    description: "UK government and public sector employers ranked by AI visibility",
    seoIntro:
      "The UK public sector employs over 5 million people and increasingly competes with the private sector for digital, data, and policy talent. Candidates use AI to compare public vs private sector compensation, pension schemes, and work-life balance. This index tracks which government bodies and public sector employers are visible to AI.",
    related: ["nhs", "education", "legal"],
  },
];

/** Get industry by slug */
export function getIndustry(slug: string): Industry | undefined {
  return industries.find((i) => i.slug === slug);
}

/** Get related industries for internal linking */
export function getRelatedIndustries(industry: Industry): Industry[] {
  return industry.related
    .map((slug) => industries.find((i) => i.slug === slug))
    .filter((i): i is Industry => i !== undefined);
}
