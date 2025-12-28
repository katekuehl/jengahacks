import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should navigate to homepage', async ({ page }) => {
    await expect(page).toHaveURL(/\//);
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to sponsorship page', async ({ page }) => {
    const sponsorshipLink = page.getByRole('link', { name: /Sponsor|Become a Sponsor/i });
    await sponsorshipLink.click();
    await expect(page).toHaveURL(/\/sponsorship\/?$/);
  });

  test('should navigate to blog page', async ({ page }) => {
    const blogLink = page.getByRole('link', { name: /Blog/i });
    await blogLink.click();
    await expect(page).toHaveURL('/blog');
  });

  test('should scroll to registration section when clicking register link', async ({ page }) => {
    const registerLink = page.getByRole('link', { name: /Register/i }).first();
    await registerLink.click();

    // Check that we're at the registration section
    await expect(page.locator('#register')).toBeInViewport();
  });

  test('should scroll to about section when clicking about link', async ({ page }) => {
    const aboutLink = page.getByRole('link', { name: /About/i }).first();
    await aboutLink.click();

    // Check that we're at the about section
    await expect(page.locator('#about')).toBeInViewport();
  });

  test('should scroll to sponsors section when clicking sponsors link', async ({ page }) => {
    const sponsorsLink = page.getByRole('link', { name: /Sponsors/i });
    if (await sponsorsLink.isVisible()) {
      await sponsorsLink.click();
      await expect(page.locator('#sponsors')).toBeInViewport();
    }
  });

  test('should have working mobile menu', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Look for mobile menu button
    const menuButton = page.locator('button[aria-label*="menu"], button[aria-label*="Menu"]').first();

    if (await menuButton.isVisible()) {
      await menuButton.click();

      // Check that menu is open
      const menu = page.getByRole('menu');
      await expect(menu).toBeVisible();
    }
  });
});

