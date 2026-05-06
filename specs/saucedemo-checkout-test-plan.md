# Test Plan: SauceDemo E-Commerce Checkout Workflow
**Story Reference:** SCRUM-101  
**Application URL:** https://www.saucedemo.com  
**Test Credentials:** Username: `standard_user` | Password: `secret_sauce`  
**Created:** 2026-05-05  
**Seed File:** `tests/seed.spec.ts`  

---

## 1. Happy Path — Complete Checkout Flow

### 1.1 Add Item to Cart and Complete Full Checkout
**Seed:** `tests/seed.spec.ts`

**Steps:**
1. Navigate to `https://www.saucedemo.com` and log in with `standard_user` / `secret_sauce`
2. Verify the Products page is displayed (title reads "Products")
3. Click "Add to cart" button for "Sauce Labs Backpack"
4. Verify the cart badge shows `1`
5. Click the shopping cart icon in the top-right
6. Verify the cart page shows the item "Sauce Labs Backpack" with correct price `$29.99`
7. Verify "Continue Shopping" and "Checkout" buttons are visible
8. Click "Checkout"
9. Verify navigation to checkout step-one page (`/checkout-step-one.html`)
10. Fill in First Name: `John`, Last Name: `Doe`, Zip/Postal Code: `10001`
11. Click "Continue"
12. Verify navigation to checkout step-two page (`/checkout-step-two.html`)
13. Verify order summary shows "Sauce Labs Backpack" with price `$29.99`
14. Verify "Payment Information" section is visible
15. Verify "Shipping Information" section is visible
16. Verify subtotal, tax, and total amounts are displayed
17. Verify "Cancel" and "Finish" buttons are visible
18. Click "Finish"
19. Verify navigation to checkout-complete page (`/checkout-complete.html`)
20. Verify success header reads "Thank you for your order!"
21. Verify "Back Home" button is visible
22. Click "Back Home" and verify return to products page

**Expected Result:** Full checkout completes successfully with confirmation page displayed.

---

### 1.2 Add Multiple Items and Complete Checkout
**Seed:** `tests/seed.spec.ts`

**Steps:**
1. Log in with `standard_user` / `secret_sauce`
2. Add "Sauce Labs Backpack" to cart
3. Add "Sauce Labs Bike Light" to cart
4. Verify cart badge shows `2`
5. Navigate to cart and verify both items are present
6. Click "Checkout"
7. Fill in First Name: `Jane`, Last Name: `Smith`, Zip: `90210`
8. Click "Continue"
9. Verify both items appear in the order overview
10. Verify total price reflects both items
11. Click "Finish"
12. Verify order confirmation page is displayed

**Expected Result:** Multiple items checkout successfully.

---

## 2. Cart Review Tests

### 2.1 View Cart with Items
**Seed:** `tests/seed.spec.ts`

**Steps:**
1. Log in with `standard_user` / `secret_sauce`
2. Add "Sauce Labs Fleece Jacket" to cart
3. Click cart icon
4. Verify item name "Sauce Labs Fleece Jacket" is visible
5. Verify item description is visible
6. Verify item price `$49.99` is visible
7. Verify item quantity is `1`
8. Verify "Continue Shopping" button is present
9. Verify "Checkout" button is present

**Expected Result:** Cart page displays all item details correctly.

---

### 2.2 Continue Shopping from Cart
**Seed:** `tests/seed.spec.ts`

**Steps:**
1. Log in and add an item to cart
2. Navigate to cart
3. Click "Continue Shopping"
4. Verify user returns to the products page (`/inventory.html`)

**Expected Result:** User returns to products page.

---

### 2.3 Remove Item from Cart
**Seed:** `tests/seed.spec.ts`

**Steps:**
1. Log in and add "Sauce Labs Backpack" to cart
2. Navigate to cart
3. Click "Remove" button for the item
4. Verify item is removed from cart
5. Verify cart badge is no longer displayed (or shows 0)

**Expected Result:** Item is removed and cart is updated.

---

## 3. Checkout Information Entry Tests

### 3.1 Empty Form Submission — All Fields Blank
**Seed:** `tests/seed.spec.ts`

**Steps:**
1. Log in, add an item to cart, navigate to cart
2. Click "Checkout"
3. Leave all fields (First Name, Last Name, Zip) empty
4. Click "Continue"
5. Verify error message is displayed: `"Error: First Name is required"`
6. Verify user remains on checkout-step-one page

**Expected Result:** Validation error shown for missing First Name.

---

### 3.2 Missing Last Name
**Seed:** `tests/seed.spec.ts`

**Steps:**
1. Log in, add item to cart, navigate to checkout step one
2. Fill in First Name: `John`, leave Last Name blank, fill Zip: `12345`
3. Click "Continue"
4. Verify error message: `"Error: Last Name is required"`

**Expected Result:** Validation error shown for missing Last Name.

---

### 3.3 Missing Zip/Postal Code
**Seed:** `tests/seed.spec.ts`

**Steps:**
1. Log in, add item to cart, navigate to checkout step one
2. Fill in First Name: `John`, Last Name: `Doe`, leave Zip blank
3. Click "Continue"
4. Verify error message: `"Error: Postal Code is required"`

**Expected Result:** Validation error shown for missing Postal Code.

---

### 3.4 Dismiss Error Message
**Seed:** `tests/seed.spec.ts`

**Steps:**
1. Navigate to checkout step one
2. Click "Continue" with empty fields
3. Verify error message appears
4. Click the `×` (close) button on the error message
5. Verify error message is dismissed

**Expected Result:** Error message can be dismissed.

---

## 4. Navigation Flow Tests

### 4.1 Cancel Checkout from Step One
**Seed:** `tests/seed.spec.ts`

**Steps:**
1. Log in, add item, navigate to checkout step one
2. Click "Cancel" button
3. Verify user is returned to the cart page (`/cart.html`)
4. Verify item is still in the cart

**Expected Result:** User returns to cart with items preserved.

---

### 4.2 Cancel Checkout from Step Two (Overview)
**Seed:** `tests/seed.spec.ts`

**Steps:**
1. Log in, add item, complete checkout step one (enter valid info)
2. On checkout overview page, click "Cancel"
3. Verify user is returned to the products page (`/inventory.html`)

**Expected Result:** User returns to products page from overview.

---

### 4.3 Browser Back Navigation
**Seed:** `tests/seed.spec.ts`

**Steps:**
1. Log in, add item, navigate to checkout step one
2. Fill valid info and click "Continue" to reach step two
3. Click browser back button
4. Verify user is returned to step one
5. Verify previously entered data may or may not be retained (observe behavior)

**Expected Result:** Back navigation works without crashing.

---

## 5. Order Overview Validation Tests

### 5.1 Verify Order Summary Details
**Seed:** `tests/seed.spec.ts`

**Steps:**
1. Log in, add "Sauce Labs Backpack" to cart
2. Complete checkout step one with valid data
3. On overview page, verify:
   - Item name: "Sauce Labs Backpack"
   - Item price: `$29.99`
   - Payment information label is visible
   - Shipping information label is visible
   - Item total label is visible
   - Tax label and amount are visible
   - Total label and amount are visible

**Expected Result:** All order summary details are accurately displayed.

---

### 5.2 Price Calculation Accuracy
**Seed:** `tests/seed.spec.ts`

**Steps:**
1. Log in, add "Sauce Labs Backpack" (`$29.99`) and "Sauce Labs Bike Light" (`$9.99`)
2. Complete checkout step one
3. On overview page:
   - Verify item total = `$39.98`
   - Verify tax is calculated correctly
   - Verify total = item total + tax

**Expected Result:** Price calculations are accurate.

---

## 6. UI Element Validation Tests

### 6.1 Login Page Elements
**Seed:** `tests/seed.spec.ts`

**Steps:**
1. Navigate to `https://www.saucedemo.com`
2. Verify "Username" input field is present
3. Verify "Password" input field is present
4. Verify "Login" button is present
5. Verify page title/logo is visible

**Expected Result:** All login page elements are present.

---

### 6.2 Products Page Post-Login Elements
**Seed:** `tests/seed.spec.ts`

**Steps:**
1. Log in successfully
2. Verify page title is "Products"
3. Verify at least 6 products are displayed
4. Verify each product has name, description, price, and "Add to cart" button
5. Verify cart icon is visible in header
6. Verify hamburger menu is visible

**Expected Result:** Products page renders correctly with all elements.

---

### 6.3 Checkout Form Field Validation
**Seed:** `tests/seed.spec.ts`

**Steps:**
1. Navigate to checkout step one
2. Verify "First Name" field is present with placeholder
3. Verify "Last Name" field is present with placeholder
4. Verify "Zip/Postal Code" field is present with placeholder
5. Verify "Cancel" and "Continue" buttons are present

**Expected Result:** All form fields and buttons are present.

---

## Test Data Summary

| Field         | Value             |
|---------------|-------------------|
| App URL       | https://www.saucedemo.com |
| Username      | standard_user     |
| Password      | secret_sauce      |
| Item 1        | Sauce Labs Backpack — $29.99 |
| Item 2        | Sauce Labs Bike Light — $9.99 |
| Item 3        | Sauce Labs Fleece Jacket — $49.99 |
| First Name    | John / Jane       |
| Last Name     | Doe / Smith       |
| Zip Code      | 10001 / 90210     |

---

## Test Suite Summary

| Suite | Scenarios |
|-------|-----------|
| 1. Happy Path | 2 |
| 2. Cart Review | 3 |
| 3. Checkout Validation | 4 |
| 4. Navigation Flow | 3 |
| 5. Order Overview | 2 |
| 6. UI Validation | 3 |
| **Total** | **17** |
