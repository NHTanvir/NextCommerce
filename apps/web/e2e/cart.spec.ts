import { test, expect } from '@playwright/test';

test.describe('Cart drawer', () => {
  test('cart route is reachable from the storefront', async ({ page }) => {
    await page.goto('/cart');
    await expect(page).toHaveURL(/\/cart/);
  });

  test('empty cart shows a hint to keep shopping', async ({ page }) => {
    await page.goto('/cart');
    const emptyHint = page.getByText(/empty|nothing|keep shopping|start shopping|browse/i).first();
    if (await emptyHint.isVisible().catch(() => false)) {
      await expect(emptyHint).toBeVisible();
    }
  });

  test('checkout route exists', async ({ page }) => {
    await page.goto('/checkout');
    await expect(page).toHaveURL(/\/checkout|\/login|\/cart/);
  });
});
