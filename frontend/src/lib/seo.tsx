/**
 * @module lib/seo
 * Shared SEO utilities — metadata generation, JSON-LD schemas, canonical URLs.
 */

import type { Metadata } from "next";

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

export const BASE_URL = "https://rankwell.io";
export const SITE_NAME = "Rankwell";
export const DEFAULT_OG_IMAGE = "/opengraph-image";

/* ------------------------------------------------------------------ */
/* Metadata Helpers                                                    */
/* ------------------------------------------------------------------ */

interface PageMetadataProps {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
  noIndex?: boolean;
}

/**
 * Generate complete metadata object for a page with OpenGraph, Twitter Card, and canonical URL.
 */
export function generateMetadata({
  title,
  description,
  path,
  ogImage = DEFAULT_OG_IMAGE,
  noIndex = false,
}: PageMetadataProps): Metadata {
  const url = `${BASE_URL}${path}`;
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;

  return {
    title: fullTitle,
    description,
    alternates: {
      canonical: url,
    },
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
    openGraph: {
      type: "website",
      url,
      title: fullTitle,
      description,
      siteName: SITE_NAME,
      images: [
        {
          url: ogImage.startsWith("http") ? ogImage : `${BASE_URL}${ogImage}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImage.startsWith("http") ? ogImage : `${BASE_URL}${ogImage}`],
    },
  };
}

/* ------------------------------------------------------------------ */
/* JSON-LD Schema Helpers                                              */
/* ------------------------------------------------------------------ */

interface OrganizationSchema {
  name: string;
  url: string;
  logo?: string;
  description?: string;
  sameAs?: string[];
}

/**
 * Generate Organization schema (for homepage).
 */
export function generateOrganizationSchema({
  name,
  url,
  logo,
  description,
  sameAs = [],
}: OrganizationSchema) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url,
    logo: logo || `${url}/logo.png`,
    description:
      description ||
      "AI is telling candidates the wrong things about your company. Rankwell gives you verified employer data that AI agents trust — so you control the narrative.",
    sameAs,
  };
}

interface WebsiteSchema {
  url: string;
  name: string;
  description?: string;
}

/**
 * Generate WebSite schema with SearchAction (for homepage).
 */
export function generateWebsiteSchema({ url, name, description }: WebsiteSchema) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    url,
    name,
    description,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${url}/#audit?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

interface ProductSchema {
  name: string;
  description: string;
  url: string;
  offers: {
    price: string;
    priceCurrency: string;
    name: string;
  }[];
}

/**
 * Generate Product/SoftwareApplication schema (for pricing page).
 */
export function generateProductSchema({ name, description, url, offers }: ProductSchema) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name,
    description,
    url,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: offers.map((offer) => ({
      "@type": "Offer",
      name: offer.name,
      price: offer.price,
      priceCurrency: offer.priceCurrency,
      availability: "https://schema.org/InStock",
      url,
    })),
  };
}

interface FAQItem {
  question: string;
  answer: string;
}

/**
 * Generate FAQPage schema.
 */
export function generateFAQSchema(faqs: FAQItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

interface HowToStep {
  name: string;
  text: string;
}

/**
 * Generate HowTo schema (for how-we-score).
 */
export function generateHowToSchema({
  name,
  description,
  steps,
}: {
  name: string;
  description: string;
  steps: HowToStep[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    description,
    step: steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.text,
    })),
  };
}

interface ArticleSchema {
  headline: string;
  description: string;
  author: string;
  datePublished: string;
  dateModified?: string;
  image?: string;
  url: string;
}

/**
 * Generate Article schema (for blog posts).
 */
export function generateArticleSchema({
  headline,
  description,
  author,
  datePublished,
  dateModified,
  image,
  url,
}: ArticleSchema) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    author: {
      "@type": "Person",
      name: author,
    },
    datePublished,
    dateModified: dateModified || datePublished,
    image: image || `${BASE_URL}${DEFAULT_OG_IMAGE}`,
    url,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/logo.png`,
      },
    },
  };
}

/* ------------------------------------------------------------------ */
/* Component Helper                                                    */
/* ------------------------------------------------------------------ */

/**
 * JSON-LD script component — renders structured data in <script type="application/ld+json">.
 * Usage: <JsonLd data={schema} />
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
