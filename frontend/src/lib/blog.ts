/**
 * @module lib/blog
 * Blog utilities for reading and parsing markdown posts from /content/blog/
 */

import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  category: string;
  readTime: string;
  date: string;
  author?: string;
  tags?: string[];
  featured?: boolean;
  content: string;
}

export interface BlogPostMetadata {
  slug: string;
  title: string;
  description: string;
  category: string;
  readTime: string;
  date: string;
  author?: string;
  tags?: string[];
  featured?: boolean;
}

const CONTENT_DIR = path.join(process.cwd(), "content", "blog");

/**
 * Get all blog post slugs
 */
export function getAllPostSlugs(): string[] {
  try {
    const files = fs.readdirSync(CONTENT_DIR);
    return files
      .filter((file) => file.endsWith(".md"))
      .map((file) => file.replace(/\.md$/, ""));
  } catch (error) {
    console.error("Error reading blog directory:", error);
    return [];
  }
}

/**
 * Get metadata for all blog posts (no content)
 */
export function getAllPosts(): BlogPostMetadata[] {
  const slugs = getAllPostSlugs();

  const posts = slugs.map((slug) => {
    const filePath = path.join(CONTENT_DIR, `${slug}.md`);
    const fileContents = fs.readFileSync(filePath, "utf8");
    const { data } = matter(fileContents);

    return {
      slug,
      title: data.title || "",
      description: data.description || "",
      category: data.category || "Article",
      readTime: data.readTime || "5 min",
      date: data.date || "",
      author: data.author,
      tags: data.tags,
      featured: data.featured || false,
    };
  });

  // Sort by date (newest first)
  return posts.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}

/**
 * Get a single blog post by slug (with content)
 */
export function getPostBySlug(slug: string): BlogPost | null {
  try {
    const filePath = path.join(CONTENT_DIR, `${slug}.md`);
    const fileContents = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(fileContents);

    return {
      slug,
      title: data.title || "",
      description: data.description || "",
      category: data.category || "Article",
      readTime: data.readTime || "5 min",
      date: data.date || "",
      author: data.author,
      tags: data.tags,
      featured: data.featured || false,
      content,
    };
  } catch (error) {
    console.error(`Error reading blog post ${slug}:`, error);
    return null;
  }
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
