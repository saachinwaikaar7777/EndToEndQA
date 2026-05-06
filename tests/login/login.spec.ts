// Missing tests identified in audit – Login, Auth & Edge Cases
// These tests need a FRESH unauthenticated context, so we clear storageState.

import { test, expect } from '@playwright/test';
import { snap } from '../helpers/screenshot';

// Override storageState for the entire login test suite
test.use({ storageState: { cookies: [], origins: [] } });

// ═══════════════════════════════════════════════════════════════════════════════
// L1. Login — Valid & Invalid Credentials
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('SauceDemo - Login Authentication', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-test="login-button"]')).toBeVisible();
  });

  test('L1.1 Valid credentials login successfully and reach inventory',
    async ({ page }, testInfo) => {
      await page.locator('[data-test="username"]').fill('standard_user');
      await page.locator('[data-test="password"]').fill('secret_sauce');
      await snap(page, testInfo, 'L1-1 credentials-entered');

      await page.locator('[data-test="login-button"]').click();
      await expect(page).toHaveURL(/.*inventory/);
      await expect(page.locator('.title')).toHaveText('Products');
      await snap(page, testInfo, 'L1-1 logged-in-products-page');
    });

  test('L1.2 Wrong password shows credential mismatch error',
    async ({ page }, testInfo) => {
      await page.locator('[data-test="username"]').fill('standard_user');
      await page.locator('[data-test="password"]').fill('wrong_password');
      await page.locator('[data-test="login-button"]').click();

      await expect(page.locator('[data-test="error"]')).toBeVisible();
      await expect(page.locator('[data-test="error"]'))
        .toContainText('Username and password do not match');
      await expect(page).toHaveURL('https://www.saucedemo.com/');
      await snap(page, testInfo, 'L1-2 wrong-password-error');
    });

  test('L1.3 Locked-out user shows locked out error',
    async ({ page }, testInfo) => {
      await page.locator('[data-test="username"]').fill('locked_out_user');
      await page.locator('[data-test="password"]').fill('secret_sauce');
      await page.locator('[data-test="login-button"]').click();

      await expect(page.locator('[data-test="error"]')).toBeVisible();
      await expect(page.locator('[data-test="error"]'))
        .toContainText('Sorry, this user has been locked out');
      await snap(page, testInfo, 'L1-3 locked-out-user-error');
    });

  test('L1.4 Empty credentials show First Name / Username required error',
    async ({ page }, testInfo) => {
      await page.locator('[data-test="login-button"]').click();

      await expect(page.locator('[data-test="error"]')).toBeVisible();
      await expect(page.locator('[data-test="error"]'))
        .toContainText('Username is required');
      await snap(page, testInfo, 'L1-4 empty-credentials-error');
    });

  test('L1.5 Username only (no password) shows Password required error',
    async ({ page }, testInfo) => {
      await page.locator('[data-test="username"]').fill('standard_user');
      await page.locator('[data-test="login-button"]').click();

      await expect(page.locator('[data-test="error"]')).toBeVisible();
      await expect(page.locator('[data-test="error"]'))
        .toContainText('Password is required');
      await snap(page, testInfo, 'L1-5 no-password-error');
    });

  test('L1.6 Password field masks input (type=password)',
    async ({ page }, testInfo) => {
      const pwdField = page.locator('[data-test="password"]');
      await expect(pwdField).toHaveAttribute('type', 'password');
      await pwdField.fill('secret_sauce');
      await snap(page, testInfo, 'L1-6 password-masked');
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// L2. Logout
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('SauceDemo - Logout', () => {

  test.beforeEach(async ({ page }) => {
    // Login manually (no storageState for this suite)
    await page.goto('/');
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();
    await expect(page).toHaveURL(/.*inventory/);
  });

  test('L2.1 Logout via hamburger menu redirects to login page',
    async ({ page }, testInfo) => {
      await page.locator('#react-burger-menu-btn').click();
      await page.locator('#logout_sidebar_link').waitFor({ state: 'visible' });
      await snap(page, testInfo, 'L2-1 hamburger-menu-open');

      await page.locator('#logout_sidebar_link').click();
      await expect(page).toHaveURL('https://www.saucedemo.com/');
      await expect(page.locator('[data-test="login-button"]')).toBeVisible();
      await snap(page, testInfo, 'L2-1 logged-out-login-page');
    });

  test('L2.2 After logout, direct URL to inventory redirects to login',
    async ({ page }, testInfo) => {
      // Logout first
      await page.locator('#react-burger-menu-btn').click();
      await page.locator('#logout_sidebar_link').waitFor({ state: 'visible' });
      await page.locator('#logout_sidebar_link').click();
      await expect(page).toHaveURL('https://www.saucedemo.com/');

      // Attempt to navigate directly to protected page
      await page.goto('/inventory.html');
      await expect(page).toHaveURL('https://www.saucedemo.com/');
      await snap(page, testInfo, 'L2-2 auth-bypass-blocked');
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// L3. Auth Edge Cases
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('SauceDemo - Auth Edge Cases', () => {

  test('L3.1 Direct URL access to inventory without login redirects to login',
    async ({ page }, testInfo) => {
      await page.goto('/inventory.html');
      await expect(page).toHaveURL('https://www.saucedemo.com/');
      await expect(page.locator('[data-test="login-button"]')).toBeVisible();
      await snap(page, testInfo, 'L3-1 unauthenticated-redirect');
    });

  test('L3.2 Direct URL access to checkout-step-one without login redirects',
    async ({ page }, testInfo) => {
      await page.goto('/checkout-step-one.html');
      await expect(page).toHaveURL('https://www.saucedemo.com/');
      await snap(page, testInfo, 'L3-2 checkout-without-auth-redirect');
    });
});
