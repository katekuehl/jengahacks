import { expect, Page, test, TestInfo } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  // Helper function to wait for fonts and content to be stable
  const waitForStableContent = async (page: Page) => {
    await page.waitForLoadState('networkidle');
    // Wait for fonts to load
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(1000); // Additional wait for animations
  };

  // Helper function to check if we're on a mobile browser
  const isMobileBrowser = (testInfo: TestInfo): boolean => {
    const projectName = testInfo.project?.name || '';
    return projectName.includes('Mobile');
  };

  test.describe('Homepage', () => {
    test('homepage should match visual baseline', async ({ page }, testInfo) => {
      // Skip on mobile browsers - use responsive design tests instead
      if (isMobileBrowser(testInfo)) {
        test.skip();
        return;
      }
      // Set desktop viewport
      await page.setViewportSize({ width: 1280, height: 720 });
      
      // Disable CAPTCHA for testing
      await page.addInitScript(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).VITE_RECAPTCHA_SITE_KEY = '';
      });
      await page.goto('/');
      await waitForStableContent(page);

      // Take full page screenshot
      await expect(page).toHaveScreenshot('homepage-full.png', {
        fullPage: true,
        maxDiffPixelRatio: 0.05,
        animations: 'disabled',
        scale: 'css',
        timeout: 30000,
      });
    });

    test('homepage hero section should match baseline', async ({ page }, testInfo) => {
      // Skip on mobile browsers
      if (isMobileBrowser(testInfo)) {
        test.skip();
        return;
      }
      // Set desktop viewport
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto('/');
      await waitForStableContent(page);

      const heroSection = page.locator('main section').first();
      await expect(heroSection).toHaveScreenshot('homepage-hero.png', { maxDiffPixelRatio: 0.05, animations: 'disabled', scale: 'css', timeout: 30000 });
    });

    test('homepage about section should match baseline', async ({ page }, testInfo) => {
      // Skip on mobile browsers
      if (isMobileBrowser(testInfo)) {
        test.skip();
        return;
      }
      // Set desktop viewport
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto('/');
      await waitForStableContent(page);
      await page.locator('#about').scrollIntoViewIfNeeded();
      await page.waitForTimeout(1000); // Wait for animations

      const aboutSection = page.locator('#about');
      await expect(aboutSection).toHaveScreenshot('homepage-about.png', { maxDiffPixelRatio: 0.05, animations: 'disabled', scale: 'css', timeout: 30000 });
    });

    test('homepage sponsors section should match baseline', async ({ page }, testInfo) => {
      // Skip on mobile browsers
      if (isMobileBrowser(testInfo)) {
        test.skip();
        return;
      }
      // Set desktop viewport
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto('/');
      await waitForStableContent(page);
      await page.locator('#sponsors').scrollIntoViewIfNeeded();
      await page.waitForTimeout(3000); // Wait for lazy-loaded content

      const sponsorsSection = page.locator('#sponsors');
      await expect(sponsorsSection).toHaveScreenshot('homepage-sponsors.png', { maxDiffPixelRatio: 0.05, animations: 'disabled', scale: 'css', timeout: 30000 });
    });



    test('homepage footer should match baseline', async ({ page }, testInfo) => {
      // Skip on mobile browsers
      if (isMobileBrowser(testInfo)) {
        test.skip();
        return;
      }
      // Set desktop viewport
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto('/');
      await waitForStableContent(page);
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(2000);

      const footer = page.locator('footer');
      await expect(footer).toHaveScreenshot('homepage-footer.png', { maxDiffPixelRatio: 0.05, animations: 'disabled', scale: 'css', timeout: 30000 });
    });
  });



  test.describe('Navigation', () => {
    test('navbar should match baseline', async ({ page }, testInfo) => {
      // Skip on mobile browsers - use mobile menu test instead
      if (isMobileBrowser(testInfo)) {
        test.skip();
        return;
      }
      // Set desktop viewport
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto('/');
      await waitForStableContent(page);

      const navbar = page.getByRole('navigation', { name: /Main navigation/i });
      await expect(navbar).toHaveScreenshot('navbar-desktop.png', { maxDiffPixelRatio: 0.05, animations: 'disabled', scale: 'css', timeout: 30000 });
    });

    test('mobile menu should match baseline', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      await waitForStableContent(page);

      const navbar = page.getByRole('navigation', { name: /Main navigation/i });

      // Check if mobile menu button exists
      const menuButton = page.locator('button[aria-label*="Toggle"], button[aria-label*="menu"], button[aria-label*="Menu"]').first();
      if (await menuButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await menuButton.click();
        await page.locator('#mobile-menu').waitFor({ state: 'visible', timeout: 3000 });
        await page.waitForTimeout(500); // Wait for animation
      }

      await expect(navbar).toHaveScreenshot('navbar-mobile.png', { maxDiffPixelRatio: 0.05, animations: 'disabled', scale: 'css', timeout: 30000 });
    });
  });

  test.describe('Responsive Design', () => {
    test('homepage should match baseline on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/');
      await waitForStableContent(page);

      await expect(page).toHaveScreenshot('homepage-tablet.png', {
        fullPage: true,
        maxDiffPixelRatio: 0.05,
        animations: 'disabled',
        scale: 'css',
        timeout: 30000,
      });
    });

    test('homepage should match baseline on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      await waitForStableContent(page);

      await expect(page).toHaveScreenshot('homepage-mobile.png', {
        fullPage: true,
        maxDiffPixelRatio: 0.05,
        animations: 'disabled',
        scale: 'css',
        timeout: 30000,
      });
    });

    test('homepage hero section should match baseline on mobile', async ({ page }, testInfo) => {
      // Only run on mobile browsers
      if (!isMobileBrowser(testInfo)) {
        test.skip();
        return;
      }
      await page.goto('/');
      await waitForStableContent(page);

      const heroSection = page.locator('main section').first();
      await expect(heroSection).toHaveScreenshot('homepage-hero-mobile.png', { maxDiffPixelRatio: 0.05, animations: 'disabled', scale: 'css', timeout: 30000 });
    });

    test('homepage about section should match baseline on mobile', async ({ page }, testInfo) => {
      // Only run on mobile browsers
      if (!isMobileBrowser(testInfo)) {
        test.skip();
        return;
      }
      await page.goto('/');
      await waitForStableContent(page);
      await page.locator('#about').scrollIntoViewIfNeeded();
      await page.waitForTimeout(1000);

      const aboutSection = page.locator('#about');
      await expect(aboutSection).toHaveScreenshot('homepage-about-mobile.png', { maxDiffPixelRatio: 0.05, animations: 'disabled', scale: 'css', timeout: 30000 });
    });

    test('homepage sponsors section should match baseline on mobile', async ({ page }, testInfo) => {
      // Only run on mobile browsers
      if (!isMobileBrowser(testInfo)) {
        test.skip();
        return;
      }
      await page.goto('/');
      await waitForStableContent(page);
      await page.locator('#sponsors').scrollIntoViewIfNeeded();
      await page.waitForTimeout(3000);

      const sponsorsSection = page.locator('#sponsors');
      await expect(sponsorsSection).toHaveScreenshot('homepage-sponsors-mobile.png', { maxDiffPixelRatio: 0.05, animations: 'disabled', scale: 'css', timeout: 30000 });
    });



    test('homepage footer should match baseline on mobile', async ({ page }, testInfo) => {
      // Only run on mobile browsers
      if (!isMobileBrowser(testInfo)) {
        test.skip();
        return;
      }
      await page.goto('/');
      await waitForStableContent(page);
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(2000);

      const footer = page.locator('footer');
      await expect(footer).toHaveScreenshot('homepage-footer-mobile.png', { maxDiffPixelRatio: 0.05, animations: 'disabled', scale: 'css', timeout: 30000 });
    });



    test('sponsorship page should match baseline on mobile', async ({ page }, testInfo) => {
      // Only run on mobile browsers
      if (!isMobileBrowser(testInfo)) {
        test.skip();
        return;
      }
      await page.goto('/sponsorship');
      await waitForStableContent(page);

      await expect(page).toHaveScreenshot('sponsorship-page-mobile.png', {
        fullPage: true,
        maxDiffPixelRatio: 0.05,
        animations: 'disabled',
        scale: 'css',
        timeout: 30000,
      });
    });

    test('blog page should match baseline on mobile', async ({ page }, testInfo) => {
      // Only run on mobile browsers
      if (!isMobileBrowser(testInfo)) {
        test.skip();
        return;
      }
      await page.goto('/blog');
      await waitForStableContent(page);

      await expect(page).toHaveScreenshot('blog-page-mobile.png', {
        fullPage: true,
        maxDiffPixelRatio: 0.05,
        animations: 'disabled',
        scale: 'css',
        timeout: 30000,
      });
    });

    test('404 page should match baseline on mobile', async ({ page }, testInfo) => {
      // Only run on mobile browsers
      if (!isMobileBrowser(testInfo)) {
        test.skip();
        return;
      }
      await page.goto('/non-existent-page');
      await waitForStableContent(page);

      await expect(page).toHaveScreenshot('404-page-mobile.png', {
        fullPage: true,
        maxDiffPixelRatio: 0.05,
        animations: 'disabled',
        scale: 'css',
        timeout: 30000,
      });
    });


  });

  test.describe('Other Pages', () => {
    test('sponsorship page should match baseline', async ({ page }, testInfo) => {
      // Skip on mobile browsers
      if (isMobileBrowser(testInfo)) {
        test.skip();
        return;
      }
      // Set desktop viewport
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto('/sponsorship');
      await waitForStableContent(page);

      await expect(page).toHaveScreenshot('sponsorship-page.png', {
        fullPage: true,
        maxDiffPixelRatio: 0.05,
        animations: 'disabled',
        scale: 'css',
        timeout: 30000,
      });
    });

    test('blog page should match baseline', async ({ page }, testInfo) => {
      // Skip on mobile browsers
      if (isMobileBrowser(testInfo)) {
        test.skip();
        return;
      }
      // Set desktop viewport
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto('/blog');
      await waitForStableContent(page);

      await expect(page).toHaveScreenshot('blog-page.png', {
        fullPage: true,
        maxDiffPixelRatio: 0.05,
        animations: 'disabled',
        scale: 'css',
        timeout: 30000,
      });
    });

    test('404 page should match baseline', async ({ page }, testInfo) => {
      // Skip on mobile browsers
      if (isMobileBrowser(testInfo)) {
        test.skip();
        return;
      }
      // Set desktop viewport
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto('/non-existent-page');
      await waitForStableContent(page);

      await expect(page).toHaveScreenshot('404-page.png', {
        fullPage: true,
        maxDiffPixelRatio: 0.05,
        animations: 'disabled',
        scale: 'css',
        timeout: 30000,
      });
    });
  });

  test.describe('Interactive States', () => {
    test('button hover state should match baseline', async ({ page }, testInfo) => {
      // Skip on mobile browsers (hover doesn't work on mobile)
      if (isMobileBrowser(testInfo)) {
        test.skip();
        return;
      }
      // Set desktop viewport
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto('/');
      await waitForStableContent(page);
      const learnMoreButton = page.locator('a[href="#about"]').first();
      await learnMoreButton.scrollIntoViewIfNeeded();
      await learnMoreButton.hover();
      await page.waitForTimeout(300);

      await expect(learnMoreButton).toHaveScreenshot('button-hover.png', { timeout: 30000 });
    });



    test('link hover state should match baseline', async ({ page }, testInfo) => {
      // Skip on mobile browsers (hover doesn't work on mobile)
      if (isMobileBrowser(testInfo)) {
        test.skip();
        return;
      }
      // Set desktop viewport
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto('/');
      await waitForStableContent(page);

      const aboutLink = page.getByRole('link', { name: /About/i }).first();
      await aboutLink.hover();
      await page.waitForTimeout(300);

      await expect(aboutLink).toHaveScreenshot('link-hover.png', { timeout: 30000 });
    });
  });



  test.describe('Dark Mode Support', () => {
    test('homepage should match baseline in dark mode (if supported)', async ({ page }, testInfo) => {
      // Skip on mobile browsers
      if (isMobileBrowser(testInfo)) {
        test.skip();
        return;
      }
      // Set desktop viewport
      await page.setViewportSize({ width: 1280, height: 720 });
      // Set dark mode preference
      await page.emulateMedia({ colorScheme: 'dark' });

      await page.goto('/');
      await waitForStableContent(page);

      // Check if dark mode is applied
      const bodyClasses = await page.locator('body').getAttribute('class');
      const hasDarkMode = bodyClasses?.includes('dark') ||
        (await page.evaluate(() =>
          window.getComputedStyle(document.body).colorScheme === 'dark'
        ));

      if (hasDarkMode) {
        await expect(page).toHaveScreenshot('homepage-dark-mode.png', {
          fullPage: true,
          maxDiffPixelRatio: 0.05,
          animations: 'disabled',
          scale: 'css',
          timeout: 30000,
        });
      } else {
        test.skip();
      }
    });
  });


});

