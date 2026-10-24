import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";
import { SITE_URL } from "@/lib/site";
import { COUNTRIES } from "@/lib/countries";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  const latestPostDate = posts
    .map((post) => post.updatedAt || post.publishedAt)
    .sort()
    .at(-1);

  return [
    {
      url: SITE_URL,
      // Prices change daily
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/zakat-calculator`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/nisab`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...COUNTRIES.map((country) => ({
      url: `${SITE_URL}/nisab/${country.slug}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    {
      url: `${SITE_URL}/blog`,
      lastModified: latestPostDate ? new Date(latestPostDate) : undefined,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...posts.map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt || post.publishedAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
