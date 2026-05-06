// spec: specs/saucedemo-checkout-test-plan.md
// Step 4 – Form Validation tests (SCRUM-101)
// storageState from global-setup: tests start already logged in

import { test, expect } from '@playwright/test';
import { snap } from '../helpers/screenshot';
import { addItemToCart, openCart, proceedToCheckout } from '../helpers/checkout';

test.describe('SauceDemo - Checkout Form Validation', () => {

  // Start at checkout step 1 before each validation test
  test.beforeEach(async ({ page }) => {
    await page.goto('/inventory.html');
    await addItemToCart(page, 'add-to-cart-sauce-labs-backpack');
    await openCart(page);
    await proceedToCheckout(page);
    await expect(page).toHaveURL(/.*checkout-step-one/);
  });

  // ─────────────────────────────────────────────────────────────────────────
  test('3.1 Empty form submission shows First Name required error',
    async ({ page }, testInfo) => {
      await expect(page.locator('[data-test="firstName"]')).toBeVisible();
      await expect(page.locator('[data-test="lastName"]')).toBeVisible();
      await expect(page.locator('[data-test="postalCode"]')).toBeVisible();

      await page.locator('[data-test="continue"]').click();

      await expect(page.locator('[data-test="error"]')).toBeVisible();
      await expect(page.locator('[data-test="error"]')).toContainText('First Name is required');
      await expect(page).toHaveURL(/.*checkout-step-one/);
      await snap(page, testInfo, '3-1 empty-form-error');
    });

  // ─────────────────────────────────────────────────────────────────────────
  test('3.2 Missing Last Name shows Last Name required error',
    async ({ page }, testInfo) => {
      await page.locator('[data-test="firstName"]').fill('John');
      await page.locator('[data-test="postalCode"]').fill('12345');
      await page.locator('[data-test="continue"]').click();

      await expect(page.locator('[data-test="error"]')).toContainText('Last Name is required');
      await expect(page).toHaveURL(/.*checkout-step-one/);
      await snap(page, testInfo, '3-2 missing-lastname-error');
    });

  // ─────────────────────────────────────────────────────────────────────────
  test('3.3 Missing Postal Code shows Postal Code required error',
    async ({ page }, testInfo) => {
      await page.locator('[data-test="firstName"]').fill('John');
      await page.locator('[data-test="lastName"]').fill('Doe');
      await page.locator('[data-test="continue"]').click();

      await expect(page.locator('[data-test="error"]')).toContainText('Postal Code is required');
      await expect(page).toHaveURL(/.*checkout-step-one/);
      await snap(page, testInfo, '3-3 missing-postalcode-error');
    });

  // ─────────────────────────────────────────────────────────────────────────
  test('3.4 Dismiss error message with close button',
    async ({ page }, testInfo) => {
      await page.locator('[data-test="continue"]').click();
      await expect(page.locator('[data-test="error"]')).toBeVisible();
      await snap(page, testInfo, '3-4 error-visible');

      await page.locator('.error-button').click();
      await expect(page.locator('[data-test="error"]')).not.toBeVisible();
      await snap(page, testInfo, '3-4 error-dismissed');
    });
});

// ─── UI Element Validation – Checkout Form ───────────────────────────────────
// Moved here from navigation spec; beforeEach navigates to step 1
test.describe('SauceDemo - UI Checkout Form Elements', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/inventory.html');
    await addItemToCart(page, 'add-to-cart-sauce-labs-backpack');
    await openCart(page);
    await proceedToCheckout(page);
  });

  test('6.3 Checkout form fields are present with correct placeholders',
    async ({ page }, testInfo) => {
      await expect(page.locator('[data-test="firstName"]'))
        .toHaveAttribute('placeholder', 'First Name');
      await expect(page.locator('[data-test="lastName"]'))
        .toHaveAttribute('placeholder', 'Last Name');
      await expect(page.locator('[data-test="postalCode"]'))
        .toHaveAttribute('placeholder', 'Zip/Postal Code');
      await expect(page.locator('[data-test="cancel"]')).toBeVisible();
      await expect(page.locator('[data-test="continue"]')).toBeVisible();
      await snap(page, testInfo, '6-3 checkout-form-fields');
    });
});
