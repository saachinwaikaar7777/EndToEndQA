// spec: specs/saucedemo-checkout-test-plan.md
// Step 4 – Happy Path Checkout (SCRUM-101)
// storageState from global-setup: tests start already logged in

import { test, expect } from '@playwright/test';
import { snap } from '../helpers/screenshot';
import {
  addItemToCart,
  openCart,
  proceedToCheckout,
  fillCheckoutInfo,
} from '../helpers/checkout';

test.describe('SauceDemo - Happy Path Checkout', () => {

  // storageState already provides a logged-in session.
  // Just navigate to the inventory page before each test.
  test.beforeEach(async ({ page }) => {
    await page.goto('/inventory.html');
    await expect(page).toHaveURL(/.*inventory/);
  });

  // ─────────────────────────────────────────────────────────────────────────
  test('1.1 Add single item to cart and complete full checkout',
    async ({ page }, testInfo) => {
      test.setTimeout(60_000); // Full flow needs extra time

      // Add backpack
      await addItemToCart(page, 'add-to-cart-sauce-labs-backpack');
      await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('1');
      await snap(page, testInfo, '1-1 item-added-to-cart');

      // Cart page
      await openCart(page);
      await expect(page.locator('.inventory_item_name')).toHaveText('Sauce Labs Backpack');
      await expect(page.locator('.inventory_item_price')).toHaveText('$29.99');
      await expect(page.locator('[data-test="continue-shopping"]')).toBeVisible();
      await expect(page.locator('[data-test="checkout"]')).toBeVisible();
      await snap(page, testInfo, '1-1 cart-page');

      // Checkout step 1
      await proceedToCheckout(page);
      await snap(page, testInfo, '1-1 checkout-step-one');

      // Fill info
      await fillCheckoutInfo(page, 'John', 'Doe', '10001');

      // Overview page
      await expect(page.locator('.inventory_item_name')).toHaveText('Sauce Labs Backpack');
      await expect(page.locator('.inventory_item_price')).toHaveText('$29.99');
      await expect(page.locator('.summary_info')).toBeVisible();
      await expect(page.locator('[data-test="subtotal-label"]')).toBeVisible();
      await expect(page.locator('[data-test="tax-label"]')).toBeVisible();
      await expect(page.locator('[data-test="total-label"]')).toBeVisible();
      await expect(page.locator('[data-test="cancel"]')).toBeVisible();
      await expect(page.locator('[data-test="finish"]')).toBeVisible();
      await snap(page, testInfo, '1-1 checkout-overview');

      // Finish
      await page.locator('[data-test="finish"]').click();
      await expect(page).toHaveURL(/.*checkout-complete/);
      await expect(page.locator('[data-test="complete-header"]')).toHaveText('Thank you for your order!');
      await expect(page.locator('[data-test="complete-text"]')).toContainText('dispatched');
      await expect(page.locator('[data-test="back-to-products"]')).toBeVisible();
      await snap(page, testInfo, '1-1 order-confirmation');

      // Back to products
      await page.locator('[data-test="back-to-products"]').click();
      await expect(page).toHaveURL(/.*inventory/);
      await snap(page, testInfo, '1-1 back-to-products');
    });

  // ─────────────────────────────────────────────────────────────────────────
  test('1.2 Add multiple items and complete checkout',
    async ({ page }, testInfo) => {
      test.setTimeout(60_000);

      // Add two items
      await addItemToCart(page, 'add-to-cart-sauce-labs-backpack');
      await addItemToCart(page, 'add-to-cart-sauce-labs-bike-light');
      await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('2');
      await snap(page, testInfo, '1-2 two-items-added');

      // Cart page – verify both items
      await openCart(page);
      const itemNames = page.locator('.inventory_item_name');
      await expect(itemNames).toHaveCount(2);
      await expect(itemNames.nth(0)).toHaveText('Sauce Labs Backpack');
      await expect(itemNames.nth(1)).toHaveText('Sauce Labs Bike Light');
      await snap(page, testInfo, '1-2 cart-two-items');

      // Checkout
      await proceedToCheckout(page);
      await fillCheckoutInfo(page, 'Jane', 'Smith', '90210');
      await snap(page, testInfo, '1-2 checkout-form-filled');

      // Overview – both items, correct subtotal
      const overviewItems = page.locator('.inventory_item_name');
      await expect(overviewItems).toHaveCount(2);
      await expect(page.locator('[data-test="subtotal-label"]')).toContainText('39.98');
      await snap(page, testInfo, '1-2 checkout-overview-two-items');

      // Finish
      await page.locator('[data-test="finish"]').click();
      await expect(page).toHaveURL(/.*checkout-complete/);
      await expect(page.locator('[data-test="complete-header"]')).toHaveText('Thank you for your order!');
      await snap(page, testInfo, '1-2 order-confirmation');
    });
});
