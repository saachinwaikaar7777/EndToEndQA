// spec: specs/saucedemo-checkout-test-plan.md
// Step 4 – Navigation Flow, Cart Review, Order Overview & UI Element tests (SCRUM-101)
// storageState from global-setup: tests start already logged in

import { test, expect } from '@playwright/test';
import { snap } from '../helpers/screenshot';
import {
  addItemToCart,
  openCart,
  proceedToCheckout,
  fillCheckoutInfo,
  addItemAndGoToOverview,
} from '../helpers/checkout';

// ─── Shared beforeEach: start at inventory ───────────────────────────────────
async function goToInventory(page: any) {
  await page.goto('/inventory.html');
  await expect(page).toHaveURL(/.*inventory/);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. Cart Review Tests
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('SauceDemo - Cart Review', () => {
  test.beforeEach(async ({ page }) => { await goToInventory(page); });

  test('2.1 View cart with single item shows correct details',
    async ({ page }, testInfo) => {
      await addItemToCart(page, 'add-to-cart-sauce-labs-fleece-jacket');
      await snap(page, testInfo, '2-1 fleece-jacket-added');

      await openCart(page);
      await expect(page.locator('.inventory_item_name')).toContainText('Sauce Labs Fleece Jacket');
      await expect(page.locator('.inventory_item_desc')).toBeVisible();
      await expect(page.locator('.inventory_item_price')).toHaveText('$49.99');
      await expect(page.locator('.cart_quantity')).toHaveText('1');
      await expect(page.locator('[data-test="continue-shopping"]')).toBeVisible();
      await expect(page.locator('[data-test="checkout"]')).toBeVisible();
      await snap(page, testInfo, '2-1 cart-with-item-details');
    });

  test('2.2 Continue Shopping from cart returns to products page',
    async ({ page }, testInfo) => {
      await addItemToCart(page, 'add-to-cart-sauce-labs-backpack');
      await openCart(page);
      await snap(page, testInfo, '2-2 cart-before-continue-shopping');

      await page.locator('[data-test="continue-shopping"]').click();
      await expect(page).toHaveURL(/.*inventory/);
      await expect(page.locator('.title')).toHaveText('Products');
      await snap(page, testInfo, '2-2 returned-to-products');
    });

  test('2.3 Remove item from cart updates cart correctly',
    async ({ page }, testInfo) => {
      await addItemToCart(page, 'add-to-cart-sauce-labs-backpack');
      await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('1');
      await openCart(page);
      await expect(page.locator('.inventory_item_name')).toHaveText('Sauce Labs Backpack');
      await snap(page, testInfo, '2-3 cart-before-remove');

      await page.locator('[data-test="remove-sauce-labs-backpack"]').click();
      await expect(page.locator('.inventory_item_name')).not.toBeVisible();
      await expect(page.locator('[data-test="shopping-cart-badge"]')).not.toBeVisible();
      await snap(page, testInfo, '2-3 cart-after-remove-empty');
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 4. Navigation Flow Tests
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('SauceDemo - Navigation Flow', () => {
  test.beforeEach(async ({ page }) => { await goToInventory(page); });

  test('4.1 Cancel checkout from step one returns to cart',
    async ({ page }, testInfo) => {
      await addItemToCart(page, 'add-to-cart-sauce-labs-backpack');
      await openCart(page);
      await proceedToCheckout(page);
      await snap(page, testInfo, '4-1 checkout-step-one');

      await page.locator('[data-test="cancel"]').click();
      await expect(page).toHaveURL(/.*cart/);
      await expect(page.locator('.inventory_item_name')).toHaveText('Sauce Labs Backpack');
      await snap(page, testInfo, '4-1 back-to-cart-with-item');
    });

  test('4.2 Cancel checkout from overview returns to products page',
    async ({ page }, testInfo) => {
      await addItemAndGoToOverview(page);
      await snap(page, testInfo, '4-2 checkout-overview-before-cancel');

      await page.locator('[data-test="cancel"]').click();
      await expect(page).toHaveURL(/.*inventory/);
      await snap(page, testInfo, '4-2 returned-to-products');
    });

  test('4.3 Browser back navigation from step two to step one',
    async ({ page }, testInfo) => {
      await addItemAndGoToOverview(page);
      await snap(page, testInfo, '4-3 on-step-two-before-back');

      await page.goBack();
      await expect(page).toHaveURL(/.*checkout-step-one/);
      await expect(page.locator('[data-test="firstName"]')).toBeVisible();
      await snap(page, testInfo, '4-3 back-to-step-one');
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 5. Order Overview Validation Tests
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('SauceDemo - Order Overview Validation', () => {
  test.beforeEach(async ({ page }) => { await goToInventory(page); });

  test('5.1 Verify order summary details on overview page',
    async ({ page }, testInfo) => {
      await addItemAndGoToOverview(page);

      await expect(page.locator('.inventory_item_name')).toHaveText('Sauce Labs Backpack');
      await expect(page.locator('.inventory_item_price')).toHaveText('$29.99');
      await expect(page.locator('.summary_info_label').first()).toBeVisible();
      await expect(page.locator('[data-test="subtotal-label"]')).toContainText('29.99');
      await expect(page.locator('[data-test="tax-label"]')).toBeVisible();
      await expect(page.locator('[data-test="total-label"]')).toBeVisible();
      await snap(page, testInfo, '5-1 order-summary-details');
    });

  test('5.2 Price calculation accuracy for multiple items',
    async ({ page }, testInfo) => {
      // Backpack $29.99 + Bike Light $9.99 = $39.98; tax $3.20; total $43.18
      await addItemToCart(page, 'add-to-cart-sauce-labs-backpack');
      await addItemToCart(page, 'add-to-cart-sauce-labs-bike-light');
      await openCart(page);
      await proceedToCheckout(page);
      await fillCheckoutInfo(page, 'John', 'Doe', '10001');

      await expect(page.locator('[data-test="subtotal-label"]')).toContainText('39.98');
      await expect(page.locator('[data-test="tax-label"]')).toContainText('3.20');
      await expect(page.locator('[data-test="total-label"]')).toContainText('43.18');
      await snap(page, testInfo, '5-2 price-calculation-two-items');
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 6. UI Element Validation Tests
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('SauceDemo - UI Element Validation', () => {

  test('6.1 Login page elements are all present',
    async ({ page }, testInfo) => {
      // Override storageState to test the unauthenticated page
      await page.context().clearCookies();
      await page.goto('/');
      await expect(page.locator('[data-test="username"]')).toBeVisible();
      await expect(page.locator('[data-test="password"]')).toBeVisible();
      await expect(page.locator('[data-test="login-button"]')).toBeVisible();
      await expect(page.locator('.login_logo')).toBeVisible();
      await snap(page, testInfo, '6-1 login-page-elements');
    });

  test('6.2 Products page displays all expected elements post-login',
    async ({ page }, testInfo) => {
      await page.goto('/inventory.html');
      await expect(page.locator('.title')).toHaveText('Products');

      const products = page.locator('.inventory_item');
      await expect(products).toHaveCount(6);

      const firstProduct = products.first();
      await expect(firstProduct.locator('.inventory_item_name')).toBeVisible();
      await expect(firstProduct.locator('.inventory_item_desc')).toBeVisible();
      await expect(firstProduct.locator('.inventory_item_price')).toBeVisible();
      await expect(firstProduct.locator('button')).toBeVisible();
      await expect(page.locator('[data-test="shopping-cart-link"]')).toBeVisible();
      await expect(page.locator('#react-burger-menu-btn')).toBeVisible();
      await snap(page, testInfo, '6-2 products-page-elements');
    });
});
