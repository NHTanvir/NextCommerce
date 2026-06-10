import type { Page, Locator } from '@playwright/test';

export const sel = {
  email: (page: Page): Locator =>
    page.locator('input[type="email"], input[name="email"]').first(),
  password: (page: Page): Locator =>
    page.locator('input[type="password"], input[name="password"]').first(),
  submitButton: (page: Page): Locator =>
    page.getByRole('button', { name: /sign in|log in|submit|continue/i }).first(),
  homeFirstCategory: (page: Page): Locator =>
    page.getByRole('link', { name: /running/i }).first(),
  navLink: (page: Page, name: RegExp): Locator =>
    page.getByRole('link', { name }).first(),
};
