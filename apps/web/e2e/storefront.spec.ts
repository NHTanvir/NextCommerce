import { test, expect } from '@playwright/test';

test.describe('Storefront browsing', () => {
  test('home page renders categories and brand grid', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/NextCommerce|Shoe/i);
    await expect(page.getByRole('link', { name: /Running/i }).first()).toBeVisible();
    await expect(page.getByText(/Nike/i).first()).toBeVisible();
  });

  test('category link navigates to category page', async ({ page }) => {
    await page.goto('/');
    const runningLink = page.getByRole('link', { name: /Running/i }).first();
    await runningLink.click();
    await expect(page).toHaveURL(/\/category\/running/);
  });

  test('login page exposes form inputs', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('input[type="email"], input[name="email"]').first()).toBeVisible();
    await expect(page.locator('input[type="password"], input[name="password"]').first()).toBeVisible();
  });
});
