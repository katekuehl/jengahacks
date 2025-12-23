# Managing Blog Content

This project uses a static JSON-based system for managing blog posts, located at `src/content/blog.json`.

## How to Add a New Post

1.  Open `src/content/blog.json`.
2.  Add a new entry to the array with the following structure:

```json
{
  "id": "slug-style-id",
  "title": "Your Post Title",
  "excerpt": "A short summary of your post for the preview card.",
  "content": "The full text of your blog post (supports basic formatting).",
  "author": "Author Name",
  "publishedAt": "YYYY-MM-DDTHH:mm:ssZ",
  "readTime": 5,
  "tags": ["tag1", "tag2"],
  "imageUrl": "https://example.com/image.jpg"
}
```

### Field Details

- `id`: Unique string used for the URL (e.g., `registration-open-2026`).
- `publishedAt`: ISO 8601 format. Posts are automatically sorted by this date descending.
- `readTime`: Estimated minutes to read.
- `imageUrl`: Optional link to a cover image. Unsplash links work well.

## Images

We recommend using optimized images. If using Unsplash, you can use the following format for optimized sizes:
`https://images.unsplash.com/photo-ID?auto=format&fit=crop&q=80&w=800`

## Verification

After adding a post:
1. Run `npm run dev` to see it on the `/blog` page.
2. Ensure the `id` is unique to avoid routing issues.
3. Check that the `publishedAt` date is correct for the desired sorting order.
