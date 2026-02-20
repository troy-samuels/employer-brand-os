---
title: "Structured Data for Employer Brands: A Technical Guide to JSON-LD"
description: "Complete implementation guide for schema.org structured data on employer websites. With code examples for Organization, JobPosting, FAQPage, and EmployerAggregateRating schemas."
date: "2026-02-22"
author: "Rankwell Engineering Team"
category: "Technical"
readTime: "20 min"
tags: ["JSON-LD", "schema.org", "structured data", "technical SEO", "implementation"]
featured: false
---

# Structured Data for Employer Brands: A Technical Guide to JSON-LD

Structured data is the **only format AI models reliably treat as authoritative** when answering questions about your company.

It's not marketing copy. It's machine-readable facts in a standardized format that Google, ChatGPT, Claude, and Perplexity all parse and trust.

This is a complete, technical implementation guide for developers and technical SEOs. By the end, you'll have working JSON-LD markup for your entire employer website.

---

## Table of Contents

1. [What is JSON-LD and Why It Matters](#what-is-jsonld)
2. [Schema.org Vocabulary for Employers](#schema-vocabulary)
3. [Implementation: Step-by-Step](#implementation)
4. [Organization Schema (Homepage)](#organization-schema)
5. [JobPosting Schema (Job Listings)](#jobposting-schema)
6. [FAQPage Schema (Careers Page)](#faqpage-schema)
7. [EmployerAggregateRating Schema](#rating-schema)
8. [BreadcrumbList Schema](#breadcrumb-schema)
9. [Validation & Testing](#validation)
10. [Common Mistakes](#mistakes)
11. [Maintenance & Updates](#maintenance)

---

<a name="what-is-jsonld"></a>
## 1. What is JSON-LD and Why It Matters

### What is JSON-LD?

**JSON-LD** (JavaScript Object Notation for Linked Data) is a format for embedding structured data in HTML.

It looks like this:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Acme Corp",
  "url": "https://acmecorp.com"
}
</script>
```

You add it to your `<head>` or `<body>` tag, and search engines + AI models parse it to understand your page content.

### Why JSON-LD vs. Microdata or RDFa?

**Three ways to add structured data:**
1. **Microdata** (inline HTML attributes)
2. **RDFa** (inline HTML attributes)
3. **JSON-LD** (separate JSON block)

**JSON-LD wins because:**
- **Easier to implement** (no need to modify existing HTML)
- **Easier to maintain** (all schema in one block)
- **Google's preferred format** (official recommendation)
- **AI-friendly** (models parse JSON natively)

---

### Why It Matters for Employer Brands

Research from Profound analyzing 680M AI citations found:

- **32% higher citation rate** for domains with schema.org markup
- **40% better factual accuracy** in AI responses
- **2.8x more likely** to be cited as a source by Perplexity
- **Immediate impact** (works as soon as Google/AI crawlers re-index your site)

**Translation:** If you implement structured data correctly, AI models will cite your facts instead of guessing.

---

<a name="schema-vocabulary"></a>
## 2. Schema.org Vocabulary for Employers

Schema.org defines **800+ types** of things you can describe. For employer branding, you need these **5 core schemas**:

| Schema Type | Where to Use | What It Describes | Impact |
|-------------|--------------|-------------------|--------|
| **Organization** | Homepage | Company basics (name, location, size) | High |
| **JobPosting** | Job listing pages | Open roles with salary data | High |
| **FAQPage** | Careers page | Common candidate questions | Medium |
| **EmployerAggregateRating** | Careers page | Review data (if you have it) | Medium |
| **BreadcrumbList** | All pages | Navigation hierarchy | Low |

Let's implement each.

---

<a name="implementation"></a>
## 3. Implementation: Step-by-Step

### Option 1: Direct HTML Injection

Add `<script type="application/ld+json">` blocks to your HTML:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Acme Corp</title>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Acme Corp"
  }
  </script>
</head>
<body>
  <!-- Your content -->
</body>
</html>
```

**Pros:** Simple, works everywhere  
**Cons:** Hard to maintain if you have many pages

---

### Option 2: React/Next.js Component

If you're using React or Next.js:

```tsx
// components/StructuredData.tsx
interface OrganizationSchemaProps {
  name: string;
  url: string;
  description?: string;
}

export function OrganizationSchema({ name, url, description }: OrganizationSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url,
    description,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
```

Use in your page:

```tsx
// app/page.tsx
import { OrganizationSchema } from "@/components/StructuredData";

export default function HomePage() {
  return (
    <>
      <OrganizationSchema
        name="Acme Corp"
        url="https://acmecorp.com"
        description="Fintech building payment infrastructure"
      />
      {/* Your page content */}
    </>
  );
}
```

**Pros:** Reusable, type-safe, maintainable  
**Cons:** Requires React/Next.js

---

### Option 3: Server-Side Injection (PHP/Laravel/Rails)

Generate JSON-LD on the server:

```php
// In your PHP view
<?php
$schema = [
  '@context' => 'https://schema.org',
  '@type' => 'Organization',
  'name' => 'Acme Corp',
  'url' => 'https://acmecorp.com'
];
?>

<script type="application/ld+json">
<?= json_encode($schema, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT) ?>
</script>
```

**Pros:** Works with any backend  
**Cons:** Requires server logic

---

### Option 4: CMS Plugins

**WordPress:**
- [Yoast SEO](https://yoast.com/wordpress/plugins/seo/) (has schema builder)
- [Schema Pro](https://wpschema.com/)
- [WP SEO Structured Data Schema](https://wordpress.org/plugins/wp-seo-structured-data-schema/)

**Webflow:**
- Add via custom code blocks in Page Settings

**Shopify:**
- Built-in for products, but you'll need to add Organization schema manually

---

<a name="organization-schema"></a>
## 4. Organization Schema (Homepage)

This is your **highest-priority implementation**. Add it to your homepage.

### Minimum Viable Schema

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Acme Corp",
  "url": "https://acmecorp.com",
  "logo": "https://acmecorp.com/logo.png"
}
```

**Impact:** AI now knows your name, website, and logo.

---

### Full Schema (Recommended)

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Acme Corp",
  "legalName": "Acme Corporation Ltd",
  "url": "https://acmecorp.com",
  "logo": "https://acmecorp.com/logo.png",
  "description": "We build payment infrastructure for modern commerce. 250 people, 15 countries, $500M+ processed annually.",
  "foundingDate": "2015-03-15",
  "numberOfEmployees": {
    "@type": "QuantitativeValue",
    "value": 250
  },
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Tech Street",
    "addressLocality": "London",
    "addressRegion": "England",
    "postalCode": "EC1A 1BB",
    "addressCountry": "GB"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "HR",
    "email": "careers@acmecorp.com",
    "telephone": "+44-20-1234-5678"
  },
  "sameAs": [
    "https://www.linkedin.com/company/acmecorp",
    "https://twitter.com/acmecorp",
    "https://www.glassdoor.com/Overview/Working-at-Acme-Corp",
    "https://github.com/acmecorp"
  ]
}
```

### Field Explanations

| Field | Required? | Purpose |
|-------|-----------|---------|
| `@context` | ✅ Yes | Tells parsers this is schema.org data |
| `@type` | ✅ Yes | What type of thing this is (Organization) |
| `name` | ✅ Yes | Your company name |
| `url` | ✅ Yes | Your homepage URL |
| `logo` | ✅ Yes | Square logo PNG (min 112×112px) |
| `description` | ⚠️ Recommended | One-sentence description (AI uses this heavily) |
| `foundingDate` | ⚠️ Recommended | When you were founded (ISO 8601 date) |
| `numberOfEmployees` | ⚠️ Recommended | Employee count (can be approximate) |
| `address` | ⚠️ Recommended | Headquarters address |
| `contactPoint` | Optional | HR contact info |
| `sameAs` | ⚠️ Recommended | Links to your profiles on other platforms |

---

### For Multi-Location Companies

If you have multiple offices:

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Acme Corp",
  "url": "https://acmecorp.com",
  "logo": "https://acmecorp.com/logo.png",
  "address": [
    {
      "@type": "PostalAddress",
      "addressLocality": "London",
      "addressCountry": "GB"
    },
    {
      "@type": "PostalAddress",
      "addressLocality": "New York",
      "addressCountry": "US"
    },
    {
      "@type": "PostalAddress",
      "addressLocality": "Berlin",
      "addressCountry": "DE"
    }
  ]
}
```

---

<a name="jobposting-schema"></a>
## 5. JobPosting Schema (Job Listings)

**Critical for salary visibility.** Add this to every job listing page.

### Full Schema

```json
{
  "@context": "https://schema.org",
  "@type": "JobPosting",
  "title": "Senior Software Engineer",
  "description": "<p>We're looking for a senior engineer to join our platform team...</p>",
  "identifier": {
    "@type": "PropertyValue",
    "name": "Acme Corp",
    "value": "12345"
  },
  "datePosted": "2026-02-20",
  "validThrough": "2026-04-20T23:59:59Z",
  "employmentType": ["FULL_TIME"],
  "hiringOrganization": {
    "@type": "Organization",
    "name": "Acme Corp",
    "sameAs": "https://acmecorp.com",
    "logo": "https://acmecorp.com/logo.png"
  },
  "jobLocation": {
    "@type": "Place",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "123 Tech Street",
      "addressLocality": "London",
      "addressRegion": "England",
      "postalCode": "EC1A 1BB",
      "addressCountry": "GB"
    }
  },
  "baseSalary": {
    "@type": "MonetaryAmount",
    "currency": "GBP",
    "value": {
      "@type": "QuantitativeValue",
      "minValue": 85000,
      "maxValue": 105000,
      "unitText": "YEAR"
    }
  },
  "responsibilities": "Design and build scalable backend systems. Mentor junior engineers. Review code and architecture decisions.",
  "skills": "Python, PostgreSQL, Docker, Kubernetes, AWS",
  "qualifications": "5+ years backend engineering. Experience with high-scale distributed systems.",
  "educationRequirements": {
    "@type": "EducationalOccupationalCredential",
    "credentialCategory": "bachelor degree"
  },
  "experienceRequirements": {
    "@type": "OccupationalExperienceRequirements",
    "monthsOfExperience": 60
  },
  "applicantLocationRequirements": {
    "@type": "Country",
    "name": "GB"
  },
  "jobLocationType": "TELECOMMUTE",
  "applicationContact": {
    "@type": "ContactPoint",
    "email": "jobs@acmecorp.com"
  }
}
```

### Critical Fields for AI

| Field | Impact | Why |
|-------|--------|-----|
| `title` | High | AI uses this to match candidate queries |
| `baseSalary` | **Critical** | This is what AI cites when asked "What does [Company] pay?" |
| `jobLocation` | High | AI uses for location-based queries |
| `employmentType` | Medium | Full-time vs. contract vs. part-time |
| `datePosted` | Medium | Freshness signal for AI |
| `validThrough` | Medium | Tells AI if role is still open |

---

### Salary Field Variations

**Salary Range:**
```json
"baseSalary": {
  "@type": "MonetaryAmount",
  "currency": "GBP",
  "value": {
    "@type": "QuantitativeValue",
    "minValue": 85000,
    "maxValue": 105000,
    "unitText": "YEAR"
  }
}
```

**Hourly Rate:**
```json
"baseSalary": {
  "@type": "MonetaryAmount",
  "currency": "GBP",
  "value": {
    "@type": "QuantitativeValue",
    "value": 45,
    "unitText": "HOUR"
  }
}
```

**Monthly Salary:**
```json
"baseSalary": {
  "@type": "MonetaryAmount",
  "currency": "GBP",
  "value": {
    "@type": "QuantitativeValue",
    "value": 7500,
    "unitText": "MONTH"
  }
}
```

---

<a name="faqpage-schema"></a>
## 6. FAQPage Schema (Careers Page)

Add this to your careers page to help AI answer common candidate questions.

### Full Schema

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is it like to work at Acme Corp?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "We're a 250-person fintech based in London. Engineers work in small teams (4-6 people), ship weekly, and choose their own tools. Culture is collaborative, low-ego, and focused on shipping."
      }
    },
    {
      "@type": "Question",
      "name": "What does Acme Corp pay for senior engineers?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Senior Software Engineer: £85,000-£105,000. Staff Engineer: £105,000-£130,000. Principal Engineer: £130,000-£160,000. All ranges include base salary only, excluding equity."
      }
    },
    {
      "@type": "Question",
      "name": "What benefits does Acme Corp offer?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "28 days holiday + UK bank holidays. Private health insurance (Vitality). £1,500/year learning budget. 5% pension contribution. Work from home 3 days/week."
      }
    },
    {
      "@type": "Question",
      "name": "Does Acme Corp allow remote work?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Hybrid model: 2 days/week in our London office, 3 days work from anywhere in the UK. Fully remote available for senior+ roles on a case-by-case basis."
      }
    },
    {
      "@type": "Question",
      "name": "What is Acme Corp's interview process?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Four stages: (1) 30-minute recruiter screen, (2) 60-minute technical interview, (3) Take-home project (4-6 hours), (4) On-site final round (3 hours). Total timeline: 2-3 weeks from application to offer."
      }
    }
  ]
}
```

### Best Practices

**Do:**
- ✅ Answer the exact questions candidates ask AI
- ✅ Be specific (numbers, names, details)
- ✅ Include salary information
- ✅ Use plain language, not marketing jargon

**Don't:**
- ❌ Write vague answers ("competitive compensation")
- ❌ Use questions nobody asks ("What makes us special?")
- ❌ Hide behind "contact us for details"

---

<a name="rating-schema"></a>
## 7. EmployerAggregateRating Schema

If you have Glassdoor reviews, add this to your careers page.

### Full Schema

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Acme Corp",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.2",
    "ratingCount": "347",
    "bestRating": "5",
    "worstRating": "1"
  }
}
```

**Note:** Only add this if you actually have review data. Don't fabricate ratings — Google will penalize you.

---

<a name="breadcrumb-schema"></a>
## 8. BreadcrumbList Schema

Add to every page for navigation context.

### Full Schema

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://acmecorp.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Careers",
      "item": "https://acmecorp.com/careers"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Senior Software Engineer",
      "item": "https://acmecorp.com/careers/senior-software-engineer"
    }
  ]
}
```

---

<a name="validation"></a>
## 9. Validation & Testing

Before deploying, validate your structured data:

### Tools

**1. Google Rich Results Test**
- URL: https://search.google.com/test/rich-results
- Paste your URL or code
- Checks for errors and warnings

**2. Schema Markup Validator**
- URL: https://validator.schema.org/
- Validates against official schema.org spec
- More strict than Google's tool

**3. Rankwell Schema Checker** (Coming Soon)
- Checks employer-specific fields
- Verifies AI-readable formatting

---

### Common Validation Errors

**Error: "Missing required field"**
```json
{
  "@context": "https://schema.org",
  "@type": "Organization"
  // Missing "name" — required!
}
```

**Fix:** Add all required fields (name, url, logo for Organization).

---

**Error: "Invalid date format"**
```json
"datePosted": "20/02/2026"  // Wrong format
```

**Fix:** Use ISO 8601 format:
```json
"datePosted": "2026-02-20"
```

---

**Error: "Unexpected property"**
```json
{
  "@type": "Organization",
  "companyVibe": "chill"  // Not a valid schema.org property
}
```

**Fix:** Use only official schema.org properties, or remove custom fields.

---

<a name="mistakes"></a>
## 10. Common Mistakes

### Mistake 1: Not Including Salary Data

**Bad:**
```json
{
  "@type": "JobPosting",
  "title": "Senior Engineer"
  // No baseSalary field
}
```

**Why it's bad:** AI will guess your salary (and get it wrong).

**Fix:** Always include `baseSalary` with min/max range.

---

### Mistake 2: Vague Descriptions

**Bad:**
```json
"description": "We cultivate a dynamic, synergistic environment where innovation thrives."
```

**Why it's bad:** AI can't extract facts from marketing fluff.

**Fix:**
```json
"description": "250-person fintech. Engineers work in teams of 5-7, ship weekly, choose their own tools."
```

---

### Mistake 3: Outdated Information

**Bad:**
```json
"numberOfEmployees": 150  // You now have 250
```

**Why it's bad:** AI will cite old data.

**Fix:** Update schema quarterly.

---

### Mistake 4: Multiple Conflicting Schemas

**Bad:**
```html
<script type="application/ld+json">
{"@type": "Organization", "name": "Acme Corp", "numberOfEmployees": 150}
</script>
<script type="application/ld+json">
{"@type": "Organization", "name": "Acme Corp", "numberOfEmployees": 250}
</script>
```

**Why it's bad:** AI doesn't know which is correct.

**Fix:** One schema per page (or merge into single JSON-LD block).

---

### Mistake 5: Hiding Salary Data Behind "Apply to Learn More"

**Bad:** JobPosting schema with no `baseSalary`, expecting candidates to apply first.

**Why it's bad:** AI can't extract salary → AI guesses → candidate sees wrong number.

**Fix:** Publish broad ranges. You can still negotiate within the range.

---

<a name="maintenance"></a>
## 11. Maintenance & Updates

Structured data isn't set-and-forget. Here's the maintenance schedule:

### Weekly
- [ ] Add JobPosting schema to new job listings
- [ ] Remove or update `validThrough` dates for filled roles

### Monthly
- [ ] Validate all schema markup (Google Rich Results Test)
- [ ] Check for new errors in Google Search Console
- [ ] Update any facts that changed (e.g., employee count)

### Quarterly
- [ ] Review and update Organization schema
- [ ] Update FAQPage answers if process/policy changed
- [ ] Refresh salary ranges in JobPosting schemas

### Annually
- [ ] Full schema audit (all pages)
- [ ] Update `foundingDate`, `numberOfEmployees`, etc.
- [ ] Add new schema types if applicable (e.g., new pages)

---

## Quick Start Checklist

**Week 1:**
- [ ] Implement Organization schema on homepage
- [ ] Validate with Google Rich Results Test
- [ ] Deploy

**Week 2:**
- [ ] Add FAQPage schema to careers page
- [ ] Validate
- [ ] Deploy

**Week 3:**
- [ ] Add JobPosting schema to top 5 open roles (with salary data)
- [ ] Validate each
- [ ] Deploy

**Week 4:**
- [ ] Add JobPosting to all remaining open roles
- [ ] Add BreadcrumbList to key pages
- [ ] Run full site validation

**Ongoing:**
- [ ] Monitor what AI says about you ([Rankwell audit](https://rankwell.io))
- [ ] Update schema when facts change
- [ ] Add schema to new pages as you publish them

---

## Conclusion

Structured data is your most direct way to control what AI says about your company.

It's not marketing. It's not "hoping AI finds you." It's **giving AI the facts in the format it trusts most.**

Companies that implement this see:
- **30-40% improvement in factual accuracy**
- **32% higher citation rates**
- **Immediate impact** (within weeks of deployment)

Start with Organization schema on your homepage. Add FAQPage to your careers page. Include salary data in JobPosting schemas.

Then measure. [Run a Rankwell audit](https://rankwell.io) before and 30 days after. You'll see the difference.

---

## Resources

**Schema.org Documentation:**
- [Organization](https://schema.org/Organization)
- [JobPosting](https://schema.org/JobPosting)
- [FAQPage](https://schema.org/FAQPage)

**Validation Tools:**
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Schema Markup Validator](https://validator.schema.org/)
- [Rankwell Audit Tool](https://rankwell.io)

**Code Generators:**
- [Rankwell JSON-LD Generator](https://rankwell.io/tools/employer-schema)
- [Technical SEO Schema Generator](https://technicalseo.com/tools/schema-markup-generator/)

**Further Reading:**
- [How AI Models Decide What to Say](/blog/how-ai-decides)
- [AI SEO Complete Guide](/blog/ai-seo-complete-guide)
- [The llms.txt Myth](/blog/llms-txt-myth)

---

**Questions? Found an error? Want to share your implementation?**  
Email: engineering@rankwell.io

We maintain this guide publicly and update it as schema.org standards evolve. Pull requests welcome.