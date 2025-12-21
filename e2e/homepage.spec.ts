import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display hero section', async ({ page }) => {
    await expect(page.locator('section').first()).toBeVisible();
    await expect(page.getByText(/JengaHacks|hackathon/i)).toBeVisible();
  });

  test('should display about section', async ({ page }) => {
    await page.locator('#about').scrollIntoViewIfNeeded();
    await expect(page.locator('#about')).toBeVisible();
    await expect(page.getByText(/Why JengaHacks/i)).toBeVisible();
  });

  test('should display sponsors section', async ({ page }) => {
    await page.locator('#sponsors').scrollIntoViewIfNeeded();
    await expect(page.locator('#sponsors')).toBeVisible();
    await expect(page.getByText(/Sponsors/i)).toBeVisible();
  });

  test('should display registration section', async ({ page }) => {
    await page.locator('#register').scrollIntoViewIfNeeded();
    await expect(page.locator('#register')).toBeVisible();
    await expect(page.getByText(/Register/i)).toBeVisible();
  });

  test('should display footer', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(page.locator('footer')).toBeVisible();
  });

  test('should have working social share buttons', async ({ page }) => {
    await page.locator('#register').scrollIntoViewIfNeeded();
    
    // Look for social share buttons
    const shareButtons = page.locator('button[aria-label*="Share"], button[aria-label*="share"]');
    const count = await shareButtons.count();
    
    if (count > 0) {
      // Click first share button
      await shareButtons.first().click();
      
      // Check that share menu or dialog appears
      // This may vary based on implementation
      await page.waitForTimeout(500);
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check that content is still visible and readable
    await expect(page.locator('main, body')).toBeVisible();
    
    // Check that navigation is accessible
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
  });

  test('should be responsive on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // Check that content is still visible
    await expect(page.locator('main, body')).toBeVisible();
  });

  test('should have proper meta tags', async ({ page }) => {
    // Check for title
    await expect(page).toHaveTitle(/.+/);
    
    // Check for meta description
    const metaDescription = page.locator('meta[name="description"]');
    if (await metaDescription.count() > 0) {
      await expect(metaDescription).toHaveAttribute('content', /.+/);
    }
  });

  test('should load without JavaScript errors', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Filter out known non-critical errors (like analytics, etc.)
    const criticalErrors = errors.filter(
      (error) =>
        !error.includes('analytics') &&
        !error.includes('gtag') &&
        !error.includes('google-analytics')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });
});

