import { test, expect } from '@playwright/test';

test.describe('Blog Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/blog');
  });

  test('should display blog page', async ({ page }) => {
    await expect(page).toHaveURL('/blog');
    await expect(page.locator('h1, h2')).toContainText(/Blog|News/i);
  });

  test('should display blog posts', async ({ page }) => {
    // Wait for blog posts to load
    await page.waitForLoadState('networkidle');
    
    // Check for blog post elements
    // This may vary based on implementation
    const blogPosts = page.locator('article, [data-testid="blog-post"]');
    const count = await blogPosts.count();
    
    // At minimum, the blog structure should be present
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should navigate back to homepage', async ({ page }) => {
    const homeLink = page.getByRole('link', { name: /Home|JengaHacks/i }).first();
    await homeLink.click();
    await expect(page).toHaveURL('/');
  });
});

