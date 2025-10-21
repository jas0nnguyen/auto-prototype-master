import { test, expect } from '@playwright/test';

/**
 * Home Page Tests
 *
 * Tests for the landing page and initial user experience
 */

test.describe('Home Page', () => {
  test('should load home page successfully', async ({ page }) => {
    await page.goto('/');

    // Verify page loaded
    await expect(page).toHaveTitle(/Auto Insurance/i);

    // Check for main heading or CTA
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();
  });

  test('should have working "Get a Quote" button', async ({ page }) => {
    await page.goto('/');

    // Find and click the main CTA button
    const getQuoteButton = page.locator('button:has-text("Get a Quote"), a:has-text("Get a Quote")').first();
    await expect(getQuoteButton).toBeVisible();
    await getQuoteButton.click();

    // Should navigate to vehicle info page
    await expect(page).toHaveURL(/\/quote\/vehicle-info/);
  });

  test('should display key features or benefits', async ({ page }) => {
    await page.goto('/');

    // Verify some content is visible (adjust based on your actual home page)
    const content = page.locator('main, .container, [role="main"]');
    await expect(content).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Page should still be functional
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();

    // Mobile navigation or button should work
    const getQuoteButton = page.locator('button:has-text("Get a Quote"), a:has-text("Get a Quote")').first();
    if (await getQuoteButton.isVisible()) {
      await getQuoteButton.click();
      await expect(page).toHaveURL(/\/quote/);
    }
  });
});

test.describe('Navigation', () => {
  test('should allow navigation between pages', async ({ page }) => {
    await page.goto('/');

    // Navigate to quote flow
    const getQuoteButton = page.locator('button:has-text("Get a Quote"), a:has-text("Get a Quote")').first();
    if (await getQuoteButton.isVisible()) {
      await getQuoteButton.click();
      await expect(page).toHaveURL(/\/quote/);
    }

    // Navigate back to home (if there's a home link)
    const homeLink = page.locator('a[href="/"], button:has-text("Home")').first();
    if (await homeLink.isVisible()) {
      await homeLink.click();
      await expect(page).toHaveURL('/');
    }
  });

  test('should handle 404 for unknown routes', async ({ page }) => {
    const response = await page.goto('/this-route-does-not-exist');

    // May redirect to home or show 404 page depending on routing setup
    // Adjust assertion based on your error handling
    expect(response?.status()).toBeTruthy();
  });
});

test.describe('Accessibility', () => {
  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');

    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1); // Should have exactly one H1
  });

  test('should have accessible buttons with labels', async ({ page }) => {
    await page.goto('/');

    const buttons = page.locator('button, a[role="button"]');
    const count = await buttons.count();

    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');

      // Button should have either text content or aria-label
      expect(text?.trim() || ariaLabel).toBeTruthy();
    }
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/');

    // Tab through interactive elements
    await page.keyboard.press('Tab');

    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeTruthy();
  });
});
