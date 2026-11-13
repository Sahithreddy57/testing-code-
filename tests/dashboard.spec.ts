import { test, expect } from '@playwright/test';

test.describe.serial('Admin Dashboard Tests', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.locator('input[type="email"]').fill(process.env.ADMIN_EMAIL!);
        await page.locator('input[type="password"]').fill(process.env.ADMIN_PASSWORD!);
        await page.getByRole('button', { name: 'Sign in' }).click();
        await expect(page).toHaveURL(/dashboard/i);
    });

test('Admin dashboard loads successfully', async ({ page }) => {
  await expect(page.getByText('Dashboard', { exact: true }).first())
    .toBeVisible();

  await expect(page.getByText('Total Shops')).toBeVisible();
  await expect(page.getByText('Total Mechanics')).toBeVisible();
  await expect(page.getByText('General Users')).toBeVisible();
  await expect(page.getByText('Active Products')).toBeVisible();

  await expect(
    page.getByRole('button', { name: /refresh/i })
  ).toBeVisible();
});

test('Total Mechanics card navigation', async ({ page }) => {
  await page.getByText('Total Mechanics').click();

  await expect(page).toHaveURL(/mechanics/i);
});

test('General Users card navigation', async ({ page }) => {
  await page.getByText('General Users').click();

  await expect(page).toHaveURL(/users/i);
});

test('Active Products card navigation', async ({ page }) => {
  await page.getByText('Active Products').click();

  await expect(page).toHaveURL(/products/i);
});

test('Dashboard refresh functionality', async ({ page }) => {

  const refreshButton = page.getByText('Refresh', { exact: true });

  await expect(refreshButton).toBeVisible();

  const previousTimestamp = await page
    .locator('text=Last updated:')
    .textContent();

  await refreshButton.click();

  //await page.waitForTimeout(10000); // Wait for 1 second to allow the refresh to complete.

  // Wait for the dashboard refresh request and UI update to settle.
  await page.waitForLoadState('networkidle').catch(() => {});

  await expect(page.getByText('Total Shops')).toBeVisible();
  await expect(page.getByText('Total Mechanics')).toBeVisible();
  await expect(page.getByText('General Users')).toBeVisible();
  await expect(page.getByText('Active Products')).toBeVisible();

  const currentTimestamp = await page
    .locator('text=Last updated:')
    .textContent();

  console.log('Previous timestamp:', previousTimestamp);
  console.log('Current timestamp:', currentTimestamp);
});

test('Dashboard cards display valid counts', async ({ page }) => {

  const cards = [
    { label: 'Total Shops', expectedCount: '4' },
    { label: 'Total Mechanics', expectedCount: '3' },
    { label: 'General Users', expectedCount: '0' },
    { label: 'Active Products', expectedCount: '35' },
  ];

  for (const card of cards) {
    const cardLocator = page
      .locator('div')
      .filter({ hasText: card.label })
      .filter({ hasText: card.expectedCount })
      .first();

    await expect(
      page.getByText(card.label, { exact: true })
    ).toBeVisible();

    await expect(cardLocator).toBeVisible();

    console.log(`${card.label}: expected count ${card.expectedCount}`);
  }
});
test('TC-003 - Revenue summary cards are visible', async ({ page }) => {

  await expect(
    page.getByText('GROSS REVENUE (ALL TIME)')
  ).toBeVisible();

  await expect(
    page.getByText('REVENUE THIS MONTH')
  ).toBeVisible();

  await expect(
    page.getByText('COMMISSIONS THIS MONTH')
  ).toBeVisible();

  await expect(
    page.getByText('PENDING PAYOUTS')
  ).toBeVisible();
});

test('TC-004 - Revenue Trend chart is displayed', async ({ page }) => {

  await expect(
    page.getByText('Revenue Trend (Last 12 Months)')
  ).toBeVisible();

  await expect(
    page.getByText('Revenue', { exact: true }).first()
  ).toBeVisible();

  await expect(
    page.getByText('Commissions', { exact: true }).first()
  ).toBeVisible();
});

test('TC-005 - Recent Activity section is displayed', async ({ page }) => {

  await expect(
    page.getByText('Recent Activity', { exact: true })
  ).toBeVisible();

  const emptyState = page.getByText('No activity yet', { exact: true });

  const hasNoActivity = await emptyState.isVisible().catch(() => false);

  if (hasNoActivity) {
    await expect(emptyState).toBeVisible();
  } else {
    console.log(
      'Recent Activity section is visible; activity content may be present.'
    );
  }
});

test('TC-006 - New User Registrations chart is displayed', async ({ page }) => {

  const chartHeading = page.getByText(
    'New User Registrations (Last 12 Months)',
    { exact: true }
  );

  await expect(chartHeading).toBeVisible();

  await chartHeading.scrollIntoViewIfNeeded();

  await expect(chartHeading).toBeVisible();
});

test('TC-007 - Dashboard is responsive on mobile', async ({ page }) => {
  await page.setViewportSize({
    width: 360,
    height: 800,
  });

  await expect(
    page.getByText('Recent Activity', { exact: true })
  ).toBeVisible();

  const dimensions = await page.evaluate(() => ({
    viewportWidth: document.documentElement.clientWidth,
    pageWidth: document.documentElement.scrollWidth,
  }));

  console.log('Viewport width:', dimensions.viewportWidth);
  console.log('Page width:', dimensions.pageWidth);

  expect(
    dimensions.pageWidth,
    'Dashboard should not have unintended horizontal overflow on mobile'
  ).toBeLessThanOrEqual(dimensions.viewportWidth);
});

test('TC-009 - Verify all sidebar menu items are visible', async ({ page }) => {

  const sidebarItems = [
    'Dashboard',
    'Categories',
    'Catalog',
    'Companies',
    'Products',
    'Oils',
    'Shops',
    'Mechanics',
    'Referrals',
    'Riders',
    'Revenue',
    'Finance',
    'Notifications',
    'Audit Logs',
    'Users',
    'Orders',
  ];

  for (const item of sidebarItems) {
    await expect(
      page.getByText(item, { exact: true }).first(),
      `${item} menu should be visible`
    ).toBeVisible();
  }
});
});

