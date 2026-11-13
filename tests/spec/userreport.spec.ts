import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login';
import { DashboardPage } from '../pages/dashboard';
import { UserReportsPage } from '../pages/userreport';

test.use({ actionTimeout: 10_000 });

let reportsPage: UserReportsPage;

test.beforeEach(async ({ page }) => {
    test.setTimeout(120_000);

    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.login();

    reportsPage = new UserReportsPage(page);
    await reportsPage.openFromSidebar();
});

// ======================================================================
// UR_TC_001 - Page opens from sidebar
// ======================================================================

test('UR_TC_001 - User Reports page opens from sidebar', async () => {
    await expect(reportsPage.bannerTag).toBeVisible();
    await expect(reportsPage.heading).toBeVisible();
    await expect(reportsPage.bannerText).toBeVisible();
    await expect(reportsPage.downloadButton).toBeVisible();
    await expect(reportsPage.refreshButton).toBeVisible();
});

// ======================================================================
// UR_TC_002 - Total Customers and Search Results are shown
// ======================================================================

test('UR_TC_002 - Total Customers and Search Results are shown', async () => {
    await expect(reportsPage.totalCustomersLabel).toBeVisible();
    await expect(reportsPage.searchResultsLabel).toBeVisible();

    expect(await reportsPage.totalCustomers()).toBeGreaterThanOrEqual(0);
    expect(await reportsPage.searchResults()).toBeGreaterThanOrEqual(0);
});

// ======================================================================
// UR_TC_003 - Search box is shown
// ======================================================================

test('UR_TC_003 - Search box is shown and empty', async () => {
    await expect(reportsPage.searchBox).toBeVisible();
    await expect(reportsPage.searchBox).toHaveValue('');
    await expect(reportsPage.searchBox).toHaveAttribute(
        'placeholder',
        /Search by name, email or mobile number/
    );
});

// ======================================================================
// UR_TC_004 - Registered Customers section is shown
// ======================================================================

test('UR_TC_004 - Registered Customers section is shown', async () => {
    await expect(reportsPage.sectionTag).toBeVisible();
    await expect(reportsPage.sectionTitle).toBeVisible();
    await expect(reportsPage.customersBadge).toBeVisible();
});

// ======================================================================
// UR_TC_005 - Empty message is shown only when there are no customers
// ======================================================================

test('UR_TC_005 - Empty message is shown only when there are no customers', async () => {
    const count = await reportsPage.badgeCount();

    if (count === 0) {
        await expect(reportsPage.emptyTitle).toBeVisible();
        await expect(reportsPage.emptyText).toBeVisible();
    } else {
        await expect(reportsPage.emptyTitle).toBeHidden();
        await expect(reportsPage.emptyText).toBeHidden();
    }
});

// ======================================================================
// UR_TC_006 - User Reports menu is highlighted
// ======================================================================

test('UR_TC_006 - User Reports menu is highlighted in sidebar', async () => {
    await expect(reportsPage.menuUserReports).toHaveAttribute(
        'aria-current',
        'page'
    );
});

// ======================================================================
// UR_TC_007 - Total Customers matches customers badge
// ======================================================================

test('UR_TC_007 - Total Customers matches customers badge', async () => {
    const total = await reportsPage.totalCustomers();
    const badge = await reportsPage.badgeCount();

    expect(badge).toBe(total);
});

// ======================================================================
// UR_TC_008 - Search Results matches Total Customers when search is empty
// ======================================================================

test('UR_TC_008 - Search Results matches Total Customers when search is empty', async () => {
    const total = await reportsPage.totalCustomers();
    const results = await reportsPage.searchResults();

    await expect(reportsPage.searchBox).toHaveValue('');
    expect(results).toBe(total);
});

// ======================================================================
// UR_TC_009 - Refresh keeps page and numbers
// ======================================================================

test('UR_TC_009 - Refresh keeps the page and customer numbers', async () => {
    const total = await reportsPage.totalCustomers();
    const badge = await reportsPage.badgeCount();

    await reportsPage.refreshButton.click();

    await reportsPage.expectLoaded();

    await expect.poll(() => reportsPage.totalCustomers()).toBe(total);
    await expect.poll(() => reportsPage.badgeCount()).toBe(badge);
});

// ======================================================================
// UR_TC_010 - Numbers stay the same after browser refresh
// ======================================================================

test('UR_TC_010 - Customer numbers remain after browser refresh', async () => {
    const total = await reportsPage.totalCustomers();
    const badge = await reportsPage.badgeCount();

    await reportsPage.reload();

    await expect(reportsPage.heading).toBeVisible();
    expect(await reportsPage.totalCustomers()).toBe(total);
    expect(await reportsPage.badgeCount()).toBe(badge);
});

// ======================================================================
// UR_TC_011 - Dashboard Total Customers matches User Reports
// ======================================================================

test('UR_TC_011 - Dashboard Total Customers matches User Reports', async ({ page }) => {
    const total = await reportsPage.totalCustomers();

    const dashboardPage = new DashboardPage(page);
    await dashboardPage.openMenu(dashboardPage.menuDashboard);
    await dashboardPage.greeting.waitFor();

    expect(await dashboardPage.cardValue('Total customers')).toBe(total);
});

// ======================================================================
// UR_TC_012 - Search with no match shows zero results
// ======================================================================

test('UR_TC_012 - Search with no match shows zero results', async () => {
    const total = await reportsPage.totalCustomers();

    await reportsPage.searchBox.fill(`NoMatch${Date.now()}`);

    await expect.poll(() => reportsPage.searchResults()).toBe(0);
    expect(await reportsPage.totalCustomers()).toBe(total);
});

// ======================================================================
// UR_TC_013 - Clearing search shows all customers again
// ======================================================================

test('UR_TC_013 - Clearing search shows all customers again', async () => {
    const total = await reportsPage.totalCustomers();

    await reportsPage.searchBox.fill(`NoMatch${Date.now()}`);
    await expect.poll(() => reportsPage.searchResults()).toBe(0);

    await reportsPage.searchBox.clear();

    await expect.poll(() => reportsPage.searchResults()).toBe(total);
});

// ======================================================================
// UR_TC_015 - Download Excel
// ======================================================================

test('UR_TC_015 - Download Excel downloads an Excel file', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download');

    await reportsPage.downloadButton.click();

    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/\.xlsx?$/i);
});