import { Page } from '@playwright/test';

/**
 * Navigates to the SauceDemo login page and logs in as standard_user.
 * Used in beforeEach blocks for test suites that do NOT rely on storageState.
 * (Most suites should rely on storageState from global-setup instead.)
 */
export async function loginToSauceDemo(page: Page): Promise<void> {
  await page.goto('/');
  await page.locator('[data-test="username"]').fill('standard_user');
  await page.locator('[data-test="password"]').fill('secret_sauce');
  await page.locator('[data-test="login-button"]').click();
  await page.waitForURL(/.*inventory/);
}

/**
 * Navigates to the SauceDemo login page WITHOUT logging in.
 * Used by login-specific tests that need a clean, unauthenticated state.
 */
export async function goToLoginPage(page: Page): Promise<void> {
  await page.goto('/');
  // Ensure we are on the login page (not redirected to inventory)
  await page.waitForURL('https://www.saucedemo.com/');
}
