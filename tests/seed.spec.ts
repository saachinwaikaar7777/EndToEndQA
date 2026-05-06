// spec: specs/saucedemo-checkout-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

/**
 * Seed file for SauceDemo checkout tests.
 * This file serves as the base template for the playwright-test-generator agent.
 * All generated tests will follow this pattern with proper login setup.
 */
test.describe('SauceDemo - Checkout Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to SauceDemo and log in before each test
    await page.goto('https://www.saucedemo.com');
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();
    // Verify we are on the products page
    await expect(page).toHaveURL(/.*inventory/);
  });

  test('seed - login and navigate to products', async ({ page }) => {
    // Verify login was successful
    await expect(page.locator('.title')).toHaveText('Products');
  });
});
