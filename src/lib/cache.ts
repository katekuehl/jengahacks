/**
 * Caching utilities and strategies
 * Provides caching configuration and utilities for API responses and static assets
 */

/**
 * Cache duration constants (in milliseconds)
 */
export const CACHE_DURATIONS = {
  // Short cache for frequently changing data (5 minutes)
  SHORT: 5 * 60 * 1000,
  // Medium cache for moderately changing data (15 minutes)
  MEDIUM: 15 * 60 * 1000,
  // Long cache for rarely changing data (1 hour)
  LONG: 60 * 60 * 1000,
  // Very long cache for static data (24 hours)
  VERY_LONG: 24 * 60 * 60 * 1000,
  // Static assets cache (1 year)
  STATIC: 365 * 24 * 60 * 60 * 1000,
} as const;

/**
 * Cache keys for different data types
 */
export const CACHE_KEYS = {
  blog: {
    posts: 'blog:posts',
    post: (id: string) => `blog:post:${id}`,
  },
  registration: {
    waitlistStatus: 'registration:waitlist',
    stats: 'registration:stats',
  },
  admin: {
    registrations: 'admin:registrations',
    stats: 'admin:stats',
  },
} as const;

/**
 * Get cache headers for different resource types
 */
export const getCacheHeaders = (type: 'static' | 'api' | 'dynamic' = 'api'): HeadersInit => {
  const headers: HeadersInit = {};

  switch (type) {
    case 'static':
      // Static assets: cache for 1 year, immutable
      headers['Cache-Control'] = 'public, max-age=31536000, immutable';
      break;
    case 'api':
      // API responses: cache for 5 minutes, revalidate
      headers['Cache-Control'] = 'public, max-age=300, must-revalidate';
      break;
    case 'dynamic':
      // Dynamic content: no cache
      headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
      headers['Pragma'] = 'no-cache';
      headers['Expires'] = '0';
      break;
  }

  return headers;
};

/**
 * Check if a response is still fresh based on cache headers
 */
export const isResponseFresh = (response: Response): boolean => {
  const cacheControl = response.headers.get('Cache-Control');
  const expires = response.headers.get('Expires');
  const date = response.headers.get('Date');

  if (!cacheControl && !expires) {
    return false;
  }

  // Check max-age
  const maxAgeMatch = cacheControl?.match(/max-age=(\d+)/);
  if (maxAgeMatch && date) {
    const maxAge = parseInt(maxAgeMatch[1], 10);
    const responseDate = new Date(date).getTime();
    const now = Date.now();
    return (now - responseDate) < maxAge * 1000;
  }

  // Check Expires header
  if (expires) {
    const expiresDate = new Date(expires).getTime();
    return Date.now() < expiresDate;
  }

  return false;
};

/**
 * Create a cached fetch wrapper
 */
export const cachedFetch = async (
  url: string,
  options?: RequestInit,
  cacheDuration: number = CACHE_DURATIONS.MEDIUM
): Promise<Response> => {
  // Check if we have a cached response
  const cacheKey = `fetch:${url}`;
  const cached = sessionStorage.getItem(cacheKey);
  
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    const age = Date.now() - timestamp;
    
    if (age < cacheDuration) {
      // Return cached response
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-Cache': 'HIT',
        },
      });
    }
  }

  // Fetch fresh data
  const response = await fetch(url, options);
  
  if (response.ok) {
    const data = await response.json();
    
    // Cache the response
    sessionStorage.setItem(cacheKey, JSON.stringify({
      data,
      timestamp: Date.now(),
    }));
  }

  return response;
};

