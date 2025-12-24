# Caching Strategies

This document outlines the caching strategies implemented in the JengaHacks application to improve performance and reduce server load.

## Overview

The application implements multiple layers of caching:

1. **React Query Caching** - Client-side data caching
2. **HTTP Cache Headers** - Browser and CDN caching
3. **Static Asset Caching** - Long-term caching for immutable assets
4. **API Response Caching** - Short-term caching for API responses

## React Query Caching

React Query provides intelligent caching for API responses and data fetching.

### Configuration

Located in `src/App.tsx`:

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 minutes - data is fresh
      gcTime: 15 * 60 * 1000,         // 15 minutes - cache retention
      retry: 3,                        // Retry failed requests
      refetchOnWindowFocus: false,     // Don't refetch on focus (dev)
      refetchOnReconnect: true,        // Refetch on reconnect
      refetchOnMount: false,           // Don't refetch if data exists
    },
  },
});
```

### Cache Durations

Defined in `src/lib/cache.ts`:

- **SHORT** (5 minutes): Frequently changing data
- **MEDIUM** (15 minutes): Moderately changing data
- **LONG** (1 hour): Rarely changing data
- **VERY_LONG** (24 hours): Static data
- **STATIC** (1 year): Static assets

### Usage Example

```typescript
import { useQuery } from '@tanstack/react-query';
import { CACHE_KEYS, CACHE_DURATIONS } from '@/lib/cache';

const { data, isLoading } = useQuery({
  queryKey: [CACHE_KEYS.blog.posts],
  queryFn: fetchBlogPosts,
  staleTime: CACHE_DURATIONS.MEDIUM,
});
```

## HTTP Cache Headers

Cache headers are automatically applied based on resource type:

### Static Assets
- **Cache-Control**: `public, max-age=31536000, immutable`
- **Duration**: 1 year
- **Use Case**: JS, CSS, images, fonts with content hashes

### API Responses
- **Cache-Control**: `public, max-age=300, must-revalidate`
- **Duration**: 5 minutes
- **Use Case**: API endpoints, dynamic data

### Dynamic Content
- **Cache-Control**: `no-cache, no-store, must-revalidate`
- **Use Case**: User-specific data, real-time updates

## Static Asset Caching

Vite is configured to generate content-hashed filenames for optimal caching:

```typescript
// vite.config.ts
build: {
  rollupOptions: {
    output: {
      entryFileNames: 'assets/[name]-[hash].js',
      chunkFileNames: 'assets/[name]-[hash].js',
      assetFileNames: 'assets/[name]-[hash][extname]',
    },
  },
}
```

### Benefits

- **Content-based hashing**: Filenames change when content changes
- **Long-term caching**: Can cache for 1 year since filenames are unique
- **Automatic invalidation**: New content gets new hash, invalidating old cache

## API Response Caching

### Monitored Fetch

The `monitoredFetch` wrapper automatically applies cache headers:

```typescript
import { monitoredFetch } from '@/lib/monitoredFetch';

// Automatically applies cache headers based on URL pattern
const response = await monitoredFetch('/api/data');
```

### Cache Utilities

Located in `src/lib/cache.ts`:

```typescript
import { cachedFetch, CACHE_DURATIONS } from '@/lib/cache';

// Cache API response for 15 minutes
const response = await cachedFetch('/api/posts', {}, CACHE_DURATIONS.MEDIUM);
```

## Cache Keys

Standardized cache keys for consistent invalidation:

```typescript
import { CACHE_KEYS } from '@/lib/cache';

// Blog posts
CACHE_KEYS.blog.posts
CACHE_KEYS.blog.post('post-id')

// Registration
CACHE_KEYS.registration.waitlistStatus
CACHE_KEYS.registration.stats

// Admin
CACHE_KEYS.admin.registrations
CACHE_KEYS.admin.stats
```

## Server-Side Caching

### Nginx Configuration

```nginx
# Cache static assets for 1 year
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# Cache API responses for 5 minutes
location /api/ {
    add_header Cache-Control "public, max-age=300, must-revalidate";
}
```

### Apache Configuration

```apache
# Cache static assets
<FilesMatch "\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$">
    ExpiresActive On
    ExpiresDefault "access plus 1 year"
    Header set Cache-Control "public, immutable"
</FilesMatch>
```

## Best Practices

1. **Use React Query** for all data fetching to leverage automatic caching
2. **Set appropriate staleTime** based on data freshness requirements
3. **Use content hashes** for static assets to enable long-term caching
4. **Invalidate cache** when data is updated (mutations)
5. **Monitor cache hit rates** to optimize cache durations

## Cache Invalidation

### React Query

```typescript
import { useQueryClient } from '@tanstack/react-query';
import { CACHE_KEYS } from '@/lib/cache';

const queryClient = useQueryClient();

// Invalidate specific cache
queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.blog.posts] });

// Invalidate all blog-related caches
queryClient.invalidateQueries({ queryKey: ['blog'] });
```

### Manual Cache Clearing

```typescript
// Clear session storage cache
sessionStorage.clear();

// Clear specific cache entry
sessionStorage.removeItem('fetch:https://api.example.com/posts');
```

## Monitoring

Cache performance is monitored through:

- React Query DevTools (development)
- Browser DevTools Network tab
- Performance metrics in monitoring system

## Troubleshooting

### Cache Not Working

1. Check browser DevTools Network tab for cache headers
2. Verify React Query configuration
3. Check if cache is being invalidated too frequently
4. Verify server cache headers are set correctly

### Stale Data

1. Reduce `staleTime` for frequently changing data
2. Use `refetchOnWindowFocus` for critical data
3. Implement manual cache invalidation after mutations

### Cache Too Aggressive

1. Increase `staleTime` for static data
2. Use `refetchOnMount: true` for critical data
3. Implement cache invalidation strategies

## Future Enhancements

- [ ] Service Worker for offline caching
- [ ] IndexedDB for persistent cache storage
- [ ] Cache warming strategies
- [ ] CDN integration for edge caching

