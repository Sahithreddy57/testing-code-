import { test, expect } from '@playwright/test';

test.describe('Admin Login Tests', () => {

test('Admin Login', async ({ page }) => {
  await page.goto('/');

  await page.locator('input[type="email"]').fill(process.env.ADMIN_EMAIL!);
  await page.locator('input[type="password"]').fill(process.env.ADMIN_PASSWORD!);

  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page).toHaveURL(/dashboard/);
});


test('Invalid email and password', async ({ page }) => {
  await page.goto('/');

  await page.locator('input[type="email"]').fill('wrong@example.com');
  await page.locator('input[type="password"]').fill('WrongPass123');

  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page).not.toHaveURL(/dashboard/);
});

test('Invalid email with valid password', async ({ page }) => {
  await page.goto('/');

  await page.locator('input[type="email"]').fill('wrong@example.com');
  await page.locator('input[type="password"]').fill(process.env.ADMIN_PASSWORD!);

  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page).not.toHaveURL(/dashboard/);
});

test('Valid email with invalid password', async ({ page }) => {
  await page.goto('/');

  await page.locator('input[type="email"]').fill(process.env.ADMIN_EMAIL!);
  await page.locator('input[type="password"]').fill('WrongPass123');

  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page).not.toHaveURL(/dashboard/);
});


test('Empty email and password', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page).not.toHaveURL(/dashboard/);
});

test('Empty password', async ({ page }) => {
  await page.goto('/');

  await page.locator('input[type="email"]').fill(process.env.ADMIN_EMAIL!);
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page).not.toHaveURL(/dashboard/);
});


});