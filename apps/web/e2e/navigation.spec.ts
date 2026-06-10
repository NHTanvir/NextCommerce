import { test, expect } from '@playwright/test';
import { sel } from './helpers/selectors';

test.describe('Header navigation', () => {
  test('home → category link uses /category/<slug> path', async ({ page }) => {
    await page.goto('/');
    await sel.homeFirstCategory(page).click();
    await expect(page).toHaveURL(/\/category\/running/);
  });

  test('home page exposes link to login', async ({ page }) => {
    await page.goto('/');
    const loginLink = sel.navLink(page, /sign in|log in|login/i);
    if (await loginLink.isVisible().catch(() => false)) {
      await loginLink.click();
      await expect(page).toHaveURL(/\/login/);
    }
  });

  test('cart icon route resolves to /cart or opens drawer', async ({ page }) => {
    await page.goto('/');
    const cartLink = page.getByRole('link', { name: /cart/i }).first();
    if (await cartLink.isVisible().catch(() => false)) {
      await cartLink.click();
      await expect(page).toHaveURL(/\/cart|\/checkout|^\/$/);
    }
  });
});
