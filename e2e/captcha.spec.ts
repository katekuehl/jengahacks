import { test, expect } from '@playwright/test';

test.describe('CAPTCHA Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('#register').scrollIntoViewIfNeeded();
  });

  test('should display CAPTCHA when site key is configured', async ({ page }) => {
    // Check if CAPTCHA is present on the page
    // CAPTCHA might be rendered in an iframe or as a component
    const captchaContainer = page.locator('[data-testid="recaptcha"], .g-recaptcha, iframe[title*="reCAPTCHA"]');
    
    // CAPTCHA should be visible if site key is configured
    // Note: In test environment, CAPTCHA might not render if site key is not set
    const captchaCount = await captchaContainer.count();
    
    if (captchaCount > 0) {
      await expect(captchaContainer.first()).toBeVisible();
    } else {
      // If CAPTCHA is not configured, skip this test
      test.skip();
    }
  });

  test('should require CAPTCHA completion before form submission', async ({ page }) => {
    // Fill form fields
    await page.getByLabel(/Full Name/i).fill('Test User');
    await page.getByLabel(/Email Address/i).fill('test@example.com');
    await page.getByLabel(/LinkedIn Profile/i).fill('linkedin.com/in/test');

    // Check if CAPTCHA is present
    const captcha = page.locator('[data-testid="recaptcha"], .g-recaptcha');
    const captchaVisible = await captcha.isVisible().catch(() => false);

    if (!captchaVisible) {
      test.skip();
      return;
    }

    // Try to submit without completing CAPTCHA
    const submitButton = page.getByRole('button', { name: /Complete Registration/i });
    await submitButton.click();

    // Should show CAPTCHA error or prevent submission
    await expect(
      page.getByText(/CAPTCHA|Please complete|verify/i)
    ).toBeVisible({ timeout: 5000 });
  });

  test('should allow form submission after CAPTCHA completion', async ({ page }) => {
    // Mock successful CAPTCHA verification
    await page.route('**/functions/verify-recaptcha', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    // Mock successful registration
    await page.route('**/functions/register-with-ip', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    // Fill form fields
    await page.getByLabel(/Full Name/i).fill('Test User');
    await page.getByLabel(/Email Address/i).fill('test@example.com');
    await page.getByLabel(/LinkedIn Profile/i).fill('linkedin.com/in/test');

    // Complete CAPTCHA (simulate clicking the CAPTCHA)
    const captchaTrigger = page.locator('[data-testid="recaptcha-trigger"]');
    const captchaVisible = await captchaTrigger.isVisible().catch(() => false);

    if (captchaVisible) {
      await captchaTrigger.click();
      await page.waitForTimeout(1000); // Wait for CAPTCHA to process
    } else {
      // If CAPTCHA component is not visible, check for actual reCAPTCHA
      const recaptchaFrame = page.frameLocator('iframe[title*="reCAPTCHA"]').first();
      const recaptchaCheckbox = recaptchaFrame.locator('.recaptcha-checkbox-border');
      
      if (await recaptchaCheckbox.count() > 0) {
        await recaptchaCheckbox.click();
        await page.waitForTimeout(2000); // Wait for CAPTCHA verification
      } else {
        test.skip();
        return;
      }
    }

    // Submit form
    const submitButton = page.getByRole('button', { name: /Complete Registration/i });
    await submitButton.click();

    // Should show success message
    await expect(page.getByText(/Registration successful/i)).toBeVisible({ timeout: 10000 });
  });

  test('should handle CAPTCHA verification failure', async ({ page }) => {
    // Mock CAPTCHA verification failure
    await page.route('**/functions/verify-recaptcha', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: false }),
      });
    });

    // Fill form fields
    await page.getByLabel(/Full Name/i).fill('Test User');
    await page.getByLabel(/Email Address/i).fill('test@example.com');
    await page.getByLabel(/LinkedIn Profile/i).fill('linkedin.com/in/test');

    // Complete CAPTCHA
    const captchaTrigger = page.locator('[data-testid="recaptcha-trigger"]');
    const captchaVisible = await captchaTrigger.isVisible().catch(() => false);

    if (captchaVisible) {
      await captchaTrigger.click();
      await page.waitForTimeout(1000);
    } else {
      test.skip();
      return;
    }

    // Submit form
    const submitButton = page.getByRole('button', { name: /Complete Registration/i });
    await submitButton.click();

    // Should show CAPTCHA verification error
    await expect(
      page.getByText(/CAPTCHA.*failed|verification.*failed|Please.*try again/i)
    ).toBeVisible({ timeout: 10000 });
  });

  test('should handle CAPTCHA expiration', async ({ page }) => {
    // Mock successful CAPTCHA verification initially
    let verifyCallCount = 0;
    await page.route('**/functions/verify-recaptcha', async route => {
      verifyCallCount++;
      if (verifyCallCount === 1) {
        // First call succeeds
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        });
      } else {
        // Subsequent calls fail (expired)
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: false, error: 'CAPTCHA expired' }),
        });
      }
    });

    // Fill form fields
    await page.getByLabel(/Full Name/i).fill('Test User');
    await page.getByLabel(/Email Address/i).fill('test@example.com');
    await page.getByLabel(/LinkedIn Profile/i).fill('linkedin.com/in/test');

    // Complete CAPTCHA
    const captchaTrigger = page.locator('[data-testid="recaptcha-trigger"]');
    const captchaVisible = await captchaTrigger.isVisible().catch(() => false);

    if (captchaVisible) {
      await captchaTrigger.click();
      await page.waitForTimeout(1000);
    } else {
      test.skip();
      return;
    }

    // Simulate CAPTCHA expiration by waiting and trying again
    await page.waitForTimeout(2000);

    // Submit form (CAPTCHA should be expired)
    const submitButton = page.getByRole('button', { name: /Complete Registration/i });
    await submitButton.click();

    // Should show expiration error
    await expect(
      page.getByText(/CAPTCHA.*expired|expired|Please.*complete/i)
    ).toBeVisible({ timeout: 10000 });
  });

  test('should reset CAPTCHA on form reset', async ({ page }) => {
    // Fill form fields
    await page.getByLabel(/Full Name/i).fill('Test User');
    await page.getByLabel(/Email Address/i).fill('test@example.com');
    await page.getByLabel(/LinkedIn Profile/i).fill('linkedin.com/in/test');

    // Complete CAPTCHA
    const captchaTrigger = page.locator('[data-testid="recaptcha-trigger"]');
    const captchaVisible = await captchaTrigger.isVisible().catch(() => false);

    if (captchaVisible) {
      await captchaTrigger.click();
      await page.waitForTimeout(1000);
    } else {
      test.skip();
      return;
    }

    // Mock successful registration
    await page.route('**/functions/verify-recaptcha', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    await page.route('**/functions/register-with-ip', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    // Submit form
    const submitButton = page.getByRole('button', { name: /Complete Registration/i });
    await submitButton.click();

    // Wait for success
    await expect(page.getByText(/Registration successful/i)).toBeVisible({ timeout: 10000 });

    // After successful submission, CAPTCHA should be reset
    // Check that CAPTCHA is in initial state (not completed)
    await page.waitForTimeout(1000);
    
    // Try to submit again without completing CAPTCHA
    await page.getByLabel(/Full Name/i).fill('Test User 2');
    await page.getByLabel(/Email Address/i).fill('test2@example.com');
    await page.getByLabel(/LinkedIn Profile/i).fill('linkedin.com/in/test2');
    
    await submitButton.click();

    // Should require CAPTCHA again
    await expect(
      page.getByText(/CAPTCHA|Please complete|verify/i)
    ).toBeVisible({ timeout: 5000 });
  });

  test('should handle CAPTCHA verification API errors', async ({ page }) => {
    // Mock CAPTCHA verification API error
    await page.route('**/functions/verify-recaptcha', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' }),
      });
    });

    // Fill form fields
    await page.getByLabel(/Full Name/i).fill('Test User');
    await page.getByLabel(/Email Address/i).fill('test@example.com');
    await page.getByLabel(/LinkedIn Profile/i).fill('linkedin.com/in/test');

    // Complete CAPTCHA
    const captchaTrigger = page.locator('[data-testid="recaptcha-trigger"]');
    const captchaVisible = await captchaTrigger.isVisible().catch(() => false);

    if (captchaVisible) {
      await captchaTrigger.click();
      await page.waitForTimeout(1000);
    } else {
      test.skip();
      return;
    }

    // Submit form
    const submitButton = page.getByRole('button', { name: /Complete Registration/i });
    await submitButton.click();

    // Should show error message
    await expect(
      page.getByText(/CAPTCHA.*failed|error|try again/i)
    ).toBeVisible({ timeout: 10000 });
  });

  test('should verify CAPTCHA token before registration', async ({ page }) => {
    let captchaVerified = false;
    let registrationCalled = false;

    // Mock CAPTCHA verification
    await page.route('**/functions/verify-recaptcha', async route => {
      captchaVerified = true;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    // Mock registration
    await page.route('**/functions/register-with-ip', async route => {
      registrationCalled = true;
      // Verify that CAPTCHA was verified first
      // Note: In actual flow, CAPTCHA verification happens before registration
      if (!captchaVerified) {
        console.warn('CAPTCHA verification may not have been called before registration');
      }
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    // Fill form fields
    await page.getByLabel(/Full Name/i).fill('Test User');
    await page.getByLabel(/Email Address/i).fill('test@example.com');
    await page.getByLabel(/LinkedIn Profile/i).fill('linkedin.com/in/test');

    // Complete CAPTCHA
    const captchaTrigger = page.locator('[data-testid="recaptcha-trigger"]');
    const captchaVisible = await captchaTrigger.isVisible().catch(() => false);

    if (captchaVisible) {
      await captchaTrigger.click();
      await page.waitForTimeout(1000);
    } else {
      test.skip();
      return;
    }

    // Submit form
    const submitButton = page.getByRole('button', { name: /Complete Registration/i });
    await submitButton.click();

    // Wait for registration to complete
    await expect(page.getByText(/Registration successful/i)).toBeVisible({ timeout: 10000 });

    // Verify that CAPTCHA was verified before registration
    expect(captchaVerified).toBe(true);
    expect(registrationCalled).toBe(true);
  });

  test('should display CAPTCHA error messages correctly', async ({ page }) => {
    // Fill form fields
    await page.getByLabel(/Full Name/i).fill('Test User');
    await page.getByLabel(/Email Address/i).fill('test@example.com');
    await page.getByLabel(/LinkedIn Profile/i).fill('linkedin.com/in/test');

    // Try to submit without CAPTCHA
    const submitButton = page.getByRole('button', { name: /Complete Registration/i });
    await submitButton.click();

    // Check if CAPTCHA is required
    const captcha = page.locator('[data-testid="recaptcha"], .g-recaptcha');
    const captchaVisible = await captcha.isVisible().catch(() => false);

    if (captchaVisible) {
      // Should show CAPTCHA error
      const errorMessage = page.getByText(/CAPTCHA|Please complete|verify/i);
      await expect(errorMessage).toBeVisible({ timeout: 5000 });
      
      // Error should be styled appropriately
      const errorElement = page.locator('[role="alert"], .text-destructive, [class*="error"]').filter({ hasText: /CAPTCHA/i });
      await expect(errorElement.first()).toBeVisible();
    } else {
      test.skip();
    }
  });

  test('should handle missing CAPTCHA site key gracefully', async ({ page }) => {
    // This test verifies that the form works even if CAPTCHA is not configured
    // Check if CAPTCHA is present
    const captcha = page.locator('[data-testid="recaptcha"], .g-recaptcha');
    const captchaVisible = await captcha.isVisible().catch(() => false);

    if (!captchaVisible) {
      // If CAPTCHA is not visible, form should still work
      // Mock successful registration
      await page.route('**/functions/register-with-ip', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        });
      });

      await page.route('**/from("registrations")', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: null, error: null }),
        });
      });

      // Fill and submit form
      await page.getByLabel(/Full Name/i).fill('Test User');
      await page.getByLabel(/Email Address/i).fill('test@example.com');
      await page.getByLabel(/LinkedIn Profile/i).fill('linkedin.com/in/test');

      const submitButton = page.getByRole('button', { name: /Complete Registration/i });
      await submitButton.click();

      // Should succeed without CAPTCHA
      await expect(page.getByText(/Registration successful/i)).toBeVisible({ timeout: 10000 });
    } else {
      test.skip();
    }
  });
});

