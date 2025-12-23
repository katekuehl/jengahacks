/**
 * Blog utilities for fetching and managing blog posts
 * Supports multiple data sources: API, RSS feed, CMS, or static content
 */

import { logger } from "./logger";
import { EXCERPT_MAX_LENGTH } from "./constants";

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content?: string;
  author?: string;
  publishedAt: string;
  imageUrl?: string;
  externalUrl?: string;
  readTime?: number;
  tags?: string[];
}

/**
 * Fetch blog posts from configured source
 * Priority: API endpoint > RSS feed > Static content
 */
export const fetchBlogPosts = async (limit?: number): Promise<BlogPost[]> => {
  const apiUrl = import.meta.env.VITE_BLOG_API_URL;
  const rssUrl = import.meta.env.VITE_BLOG_RSS_URL;

  try {
    // Try API endpoint first
    if (apiUrl) {
      const response = await fetch(apiUrl);
      if (response.ok) {
        const data = await response.json();
        const posts = Array.isArray(data) ? data : data.posts || [];
        return limit ? posts.slice(0, limit) : posts;
      }
    }

    // Try RSS feed
    if (rssUrl) {
      const posts = await fetchRSSFeed(rssUrl);
      return limit ? posts.slice(0, limit) : posts;
    }
  } catch (error) {
    logger.error("Error fetching blog posts", error instanceof Error ? error : new Error(String(error)), { apiUrl, rssUrl });
  }

  // Fallback to empty array or mock data in development
  if (import.meta.env.DEV) {
    return getPosts(limit);
  }

  return [];
};

/**
 * Fetch and parse RSS feed
 */
const fetchRSSFeed = async (rssUrl: string): Promise<BlogPost[]> => {
  try {
    // Use a CORS proxy or backend endpoint for RSS parsing
    // RSS parsing requires server-side processing or a CORS-enabled RSS parser
    const proxyUrl = import.meta.env.VITE_RSS_PROXY_URL || rssUrl;
    const response = await fetch(proxyUrl);
    const text = await response.text();

    // Parse RSS XML (simplified - use a proper RSS parser library in production)
    const parser = new DOMParser();
    const xml = parser.parseFromString(text, "text/xml");
    const items = xml.querySelectorAll("item");

    return Array.from(items).map((item, index) => {
      const title = item.querySelector("title")?.textContent || "";
      const description = item.querySelector("description")?.textContent || "";
      const link = item.querySelector("link")?.textContent || "";
      const pubDate = item.querySelector("pubDate")?.textContent || "";
      const author = item.querySelector("author")?.textContent || item.querySelector("dc:creator")?.textContent || "";

      return {
        id: `rss-${index}`,
        title,
        excerpt: description.substring(0, EXCERPT_MAX_LENGTH) + (description.length > EXCERPT_MAX_LENGTH ? "..." : ""),
        content: description,
        author,
        publishedAt: pubDate,
        externalUrl: link,
        readTime: Math.ceil(description.length / 1000), // Rough estimate
      };
    });
  } catch (error) {
    logger.error("Error parsing RSS feed", error instanceof Error ? error : new Error(String(error)), { rssUrl });
    return [];
  }
};

import blogData from "@/content/blog.json";

/**
 * Get blog posts from static JSON file
 */
export const getPosts = (limit?: number): BlogPost[] => {
  const posts = blogData as BlogPost[];

  // Sort by date descending
  const sortedPosts = [...posts].sort((a, b) =>
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  return limit ? sortedPosts.slice(0, limit) : sortedPosts;
};

import { formatDate as i18nFormatDate, formatDateShort as i18nFormatDateShort } from "./i18n";

/**
 * Format date for display
 * @deprecated Use formatDate from @/lib/i18n instead
 */
export const formatBlogDate = (dateString: string): string => {
  return i18nFormatDate(dateString);
};

/**
 * Format date for short display
 * @deprecated Use formatDateShort from @/lib/i18n instead
 */
export const formatBlogDateShort = (dateString: string): string => {
  return i18nFormatDateShort(dateString);
};

/**
 * Fetch a single blog post by ID
 */
export const fetchBlogPost = async (id: string): Promise<BlogPost | null> => {
  const apiUrl = import.meta.env.VITE_BLOG_API_URL;
  const rssUrl = import.meta.env.VITE_BLOG_RSS_URL;

  try {
    // Try API endpoint first
    if (apiUrl) {
      // If API supports individual post fetching
      const postUrl = `${apiUrl}/${id}`;
      const response = await fetch(postUrl);
      if (response.ok) {
        const post = await response.json();
        return post;
      }

      // Fallback: fetch all posts and find by ID
      const responseAll = await fetch(apiUrl);
      if (responseAll.ok) {
        const data = await responseAll.json();
        const posts = Array.isArray(data) ? data : data.posts || [];
        return posts.find((post: BlogPost) => post.id === id) || null;
      }
    }

    // Try RSS feed
    if (rssUrl) {
      const posts = await fetchRSSFeed(rssUrl);
      return posts.find((post) => post.id === id) || null;
    }
  } catch (error) {
    logger.error("Error fetching blog post", error instanceof Error ? error : new Error(String(error)), { id, apiUrl, rssUrl });
  }

  // Fallback to mock data in development
  if (import.meta.env.DEV) {
    const Posts = getPosts();
    return Posts.find((post) => post.id === id) || null;
  }

  return null;
};

/**
 * Generate a slug from a blog post title or ID
 */
export const generateSlug = (titleOrId: string): string => {
  return titleOrId
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

