import { Page } from '@playwright/test';

// ─── Cart helpers ─────────────────────────────────────────────────────────────

/** Clicks "Add to cart" for a product by its data-test attribute. */
export async function addItemToCart(page: Page, dataTestId: string): Promise<void> {
  await page.locator(`[data-test="${dataTestId}"]`).click();
}

/** Clicks the cart icon and waits for the cart URL. */
export async function openCart(page: Page): Promise<void> {
  await page.locator('[data-test="shopping-cart-link"]').click();
  await page.waitForURL(/.*cart/);
}

/** Clicks Checkout from the cart page and waits for checkout step 1. */
export async function proceedToCheckout(page: Page): Promise<void> {
  await page.locator('[data-test="checkout"]').click();
  await page.waitForURL(/.*checkout-step-one/);
}

// ─── Checkout form helpers ─────────────────────────────────────────────────

/**
 * Fills the checkout information form and clicks Continue.
 * Waits for checkout step 2 (overview page).
 */
export async function fillCheckoutInfo(
  page:       Page,
  firstName:  string,
  lastName:   string,
  postalCode: string,
): Promise<void> {
  await page.locator('[data-test="firstName"]').fill(firstName);
  await page.locator('[data-test="lastName"]').fill(lastName);
  await page.locator('[data-test="postalCode"]').fill(postalCode);
  await page.locator('[data-test="continue"]').click();
  await page.waitForURL(/.*checkout-step-two/);
}

// ─── Composite helpers ────────────────────────────────────────────────────────

/**
 * One-shot helper: add item → open cart → checkout → fill form → reach overview.
 * Defaults to Sauce Labs Backpack + John Doe / 10001.
 */
export async function addItemAndGoToOverview(
  page:       Page,
  itemDataTestId = 'add-to-cart-sauce-labs-backpack',
  firstName      = 'John',
  lastName       = 'Doe',
  postalCode     = '10001',
): Promise<void> {
  await addItemToCart(page, itemDataTestId);
  await openCart(page);
  await proceedToCheckout(page);
  await fillCheckoutInfo(page, firstName, lastName, postalCode);
}
