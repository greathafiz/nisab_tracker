import {
  WebPage,
  WithContext,
  WebApplication,
  Organization,
  Article,
  FAQPage,
  BreadcrumbList,
} from "schema-dts";

/**
 * Generate WebApplication schema for the Nisab Tracker
 * This tells search engines that our site is a web-based calculator tool
 */
export function generateWebApplicationSchema(): WithContext<WebApplication> {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Nisab Tracker",
    applicationCategory: "FinanceApplication",
    description:
      "Free Islamic Zakat calculator that tracks Nisab values based on current gold and silver prices. Calculate your Zakat obligation accurately with real-time precious metal prices.",
    url: "https://nisabtracker.com",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript. Requires HTML5.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Real-time gold and silver nisab tracking",
      "Multi-currency support",
      "Nisab calculation based on Islamic standards",
      "Zakat calculator",
      //   "Historical price charts",
    ],
  };
}

/**
 * Generate Organization schema
 * This provides information about who runs the site
 */
export function generateOrganizationSchema(): WithContext<Organization> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Nisab Tracker",
    url: "https://nisabtracker.com",
    logo: {
      "@type": "ImageObject",
      url: "https://nisabtracker.com/logo-192.png",
      width: "192",
      height: "192",
    },
    foundingDate: "2025-10-26",
    founder: {
      "@type": "Person",
      name: "Abdul Hafiz Aderemi",
    },
    description:
      "Providing free Islamic financial tools for calculating Zakat and tracking Nisab values.",
  };
}

/**
 * Generate WebPage schema for specific pages
 * This provides context about individual pages
 */
export function generateWebPageSchema(
  title: string,
  description: string,
  url: string
): WithContext<WebPage> {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description: description,
    url: url,
    publisher: {
      "@type": "Organization",
      name: "Nisab Tracker",
      url: "https://nisabtracker.com",
    },
    inLanguage: "en-US",
    isPartOf: {
      "@type": "WebSite",
      name: "Nisab Tracker",
      url: "https://nisabtracker.com",
    },
  };
}

/**
 * Generate FAQ schema
 * Use this when you have FAQ sections
 */
export function generateFAQSchema(
  faqs: Array<{ question: string; answer: string }>
): WithContext<FAQPage> {
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

/**
 * Generate Article schema
 * This helps search engines understand blog posts and articles
 */
export function generateArticleSchema(data: {
  title: string;
  description: string;
  image?: string;
  datePublished: string;
  dateModified: string;
  authorName: string;
  slug: string;
}): WithContext<Article> {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: data.title,
    description: data.description,
    image: data.image ? `https://nisabtracker.com${data.image}` : undefined,
    datePublished: data.datePublished,
    dateModified: data.dateModified || data.datePublished,
    author: {
      "@type": "Person",
      name: data.authorName,
    },
    publisher: {
      "@type": "Organization",
      name: "Nisab Tracker",
      logo: {
        "@type": "ImageObject",
        url: "https://nisabtracker.com/logo-192.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://nisabtracker.com/blog/${data.slug}`,
    },
  };
}

/**
 * Generate BreadcrumbList schema
 * This helps search engines understand your site structure
 */
export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
): WithContext<BreadcrumbList> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
