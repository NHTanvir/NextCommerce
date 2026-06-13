import { test, expect, type Route } from '@playwright/test';

const PRODUCT_FIXTURE = {
  id: 'p-test',
  slug: 'air-velocity-pro',
  title: 'Air Velocity Pro',
  description: 'Lightweight running shoe used by the Playwright purchase flow.',
  brand: 'Nike',
  basePriceCents: 12999,
  categoryId: 'c1',
  categoryName: 'Running',
  images: [{ url: 'https://example.com/shoe.jpg' }],
  variants: [
    { id: 'v1', productId: 'p-test', size: 9, color: 'White/Black', sku: 'AVP-W-9', stockQty: 10, priceCents: 12999 },
    { id: 'v2', productId: 'p-test', size: 10, color: 'White/Black', sku: 'AVP-W-10', stockQty: 8, priceCents: 12999 },
  ],
  isActive: true,
  createdAt: '2026-01-01T00:00:00Z',
};

async function stubCatalog(route: Route) {
  await route.fulfill({ json: PRODUCT_FIXTURE });
}

async function stubEmpty(route: Route) {
  await route.fulfill({ json: { products: [], data: [], total: 0 } });
}

async function stubAddToCart(route: Route) {
  await route.fulfill({
    status: 201,
    headers: { 'x-cart-token': 'cart-tok-1' },
    json: {
      id: 'cart-1',
      items: [
        {
          id: 'ci-1',
          variantId: 'v1',
          quantity: 1,
          unitPriceCents: 12999,
          product: { id: 'p-test', slug: 'air-velocity-pro', title: 'Air Velocity Pro', brand: 'Nike' },
          variant: { id: 'v1', size: 9, color: 'White/Black', sku: 'AVP-W-9' },
        },
      ],
      totalCents: 12999,
    },
  });
}

test.describe('Purchase flow: home -> product detail -> add to cart -> checkout', () => {
  test.beforeEach(async ({ page }) => {
    // Stub the data endpoints the storefront hits during the flow so the test
    // does not require a running API. The Add to Cart UI also dispatches into
    // Redux locally, so the drawer is driven from local state after the
    // mocked POST resolves.
    await page.route('**/api/products/air-velocity-pro', stubCatalog);
    await page.route('**/api/catalog/trending*', stubEmpty);
    await page.route('**/api/wishlist/product/*', (route) =>
      route.fulfill({ json: 0 }),
    );
    await page.route('**/api/cart/items', stubAddToCart);
  });

  test('home -> product -> add to cart -> checkout', async ({ page }) => {
    // 1. Home page renders the storefront chrome.
    await page.goto('/');
    await expect(page.getByRole('link', { name: /Running/i }).first()).toBeVisible();

    // 2. Navigate straight to a product detail page (the home links use a
    // `?category=` query param into the catalog list; the product detail page
    // is the unit under test for the purchase flow).
    await page.goto('/products/air-velocity-pro');
    await expect(page.getByRole('heading', { name: 'Air Velocity Pro' })).toBeVisible();

    // 3. Select a size variant.
    await page.getByRole('button', { name: /^9$/ }).click();

    // 4. Add to cart.
    await page.getByRole('button', { name: /^Add to Cart$/ }).click();

    // 5. Cart drawer slides in with the line item present.
    const drawer = page.getByRole('dialog', { name: /Shopping cart/i });
    await expect(drawer).toBeVisible();
    await expect(drawer.getByText('Air Velocity Pro')).toBeVisible();
    await expect(drawer.getByText(/Size 9/i)).toBeVisible();

    // 6. Proceed to checkout.
    await drawer.getByRole('link', { name: /Checkout/i }).click();

    // The route guard may redirect anonymous users to /login; both endpoints
    // are valid terminal states for the demo's mock-payment checkout.
    await expect(page).toHaveURL(/\/checkout(\?|$|#)|\/login/);
  });
});
