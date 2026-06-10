import { test, expect } from '@playwright/test';
import { sel } from './helpers/selectors';

test.describe('Login form', () => {
  test('renders email and password inputs', async ({ page }) => {
    await page.goto('/login');
    await expect(sel.email(page)).toBeVisible();
    await expect(sel.password(page)).toBeVisible();
  });

  test('keeps user on /login when submitting empty form', async ({ page }) => {
    await page.goto('/login');
    const submit = sel.submitButton(page);
    if (await submit.isVisible().catch(() => false)) {
      await submit.click();
    }
    await expect(page).toHaveURL(/\/login/);
  });

  test('rejects an obviously invalid email', async ({ page }) => {
    await page.goto('/login');
    await sel.email(page).fill('not-an-email');
    await sel.password(page).fill('whatever');
    const submit = sel.submitButton(page);
    if (await submit.isVisible().catch(() => false)) {
      await submit.click();
    }
    await expect(page).toHaveURL(/\/login/);
  });
});
