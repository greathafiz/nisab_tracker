import fs from "fs";
import path from "path";
import matter from "gray-matter";

const contentDirectory = path.join(process.cwd(), "app/blog/_content");

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  author: string;
  category: string;
  tags: string[];
  featured: boolean;
  image: string;
  readingTime: string;
  keywords: {
    primary: string;
    secondary: string[];
    longtail: string[];
  };
  content: string;
  faqs?: Array<{
    question: string;
    answer: string;
  }>;
}

/**
 * Get all blog posts
 */
export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(contentDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(contentDirectory);

  const posts = fileNames
    .filter((fileName) => fileName.endsWith(".mdx") || fileName.endsWith(".md"))
    .map((fileName) => {
      const slug = fileName.replace(/\.mdx?$/, "");
      const fullPath = path.join(contentDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data, content } = matter(fileContents);
      return {
        slug,
        ...(data as Omit<BlogPost, "slug" | "content">),
        content,
      };
    })
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

  return posts;
}

/**
 * Get a single blog post by slug
 */
export function getPostBySlug(slug: string): BlogPost | null {
  try {
    const fullPath = path.join(contentDirectory, `${slug}.mdx`);

    let fileContents: string;
    try {
      fileContents = fs.readFileSync(fullPath, "utf8");
    } catch {
      const mdPath = path.join(contentDirectory, `${slug}.md`);
      fileContents = fs.readFileSync(mdPath, "utf8");
    }

    const { data, content } = matter(fileContents);

    return {
      slug,
      ...(data as Omit<BlogPost, "slug" | "content">),
      content,
    };
  } catch (error) {
    console.error(`Error reading post ${slug}:`, error);
    return null;
  }
}

/**
 * Get featured posts
 */
export function getFeaturedPosts(): BlogPost[] {
  return getAllPosts().filter((post) => post.featured);
}

/**
 * Get posts by category
 */
export function getPostsByCategory(category: string): BlogPost[] {
  return getAllPosts().filter((post) => post.category === category);
}

/**
 * Get posts by tag
 */
export function getPostsByTag(tag: string): BlogPost[] {
  return getAllPosts().filter((post) => post.tags.includes(tag));
}

/**
 * Get related posts based on tags and category
 */
export function getRelatedPosts(currentSlug: string, limit = 3): BlogPost[] {
  const currentPost = getPostBySlug(currentSlug);
  if (!currentPost) return [];

  const allPosts = getAllPosts().filter((post) => post.slug !== currentSlug);

  // Score posts based on matching tags and category
  const scoredPosts = allPosts.map((post) => {
    let score = 0;

    // Same category = +3 points
    if (post.category === currentPost.category) {
      score += 3;
    }

    // Each matching tag = +1 point
    const matchingTags = post.tags.filter((tag) =>
      currentPost.tags.includes(tag)
    );
    score += matchingTags.length;

    return { post, score };
  });

  // Sort by score and return top results
  return scoredPosts
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.post);
}

/**
 * Get all unique categories
 */
export function getAllCategories(): string[] {
  const posts = getAllPosts();
  const categories = posts.map((post) => post.category);
  return Array.from(new Set(categories));
}

/**
 * Get all unique tags
 */
export function getAllTags(): string[] {
  const posts = getAllPosts();
  const tags = posts.flatMap((post) => post.tags);
  return Array.from(new Set(tags));
}

/**
 * Search posts by query
 */
export function searchPosts(query: string): BlogPost[] {
  const lowercaseQuery = query.toLowerCase();

  return getAllPosts().filter((post) => {
    return (
      post.title.toLowerCase().includes(lowercaseQuery) ||
      post.description.toLowerCase().includes(lowercaseQuery) ||
      post.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery)) ||
      post.category.toLowerCase().includes(lowercaseQuery) ||
      post.content.toLowerCase().includes(lowercaseQuery)
    );
  });
}

/**
 * Calculate estimated reading time
 */
export function calculateReadingTime(content: string): string {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes} min`;
}
