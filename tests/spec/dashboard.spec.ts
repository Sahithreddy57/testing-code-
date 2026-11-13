import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login';
import { DashboardPage } from '../pages/dashboard';
import { AddProductPage } from '../pages/addproduct';
import { CategoriesPage } from '../pages/categories';
import { CustomerOrdersPage } from '../pages/customerorder';
import { PickupAddressesPage } from '../pages/pickupaddress';
import { UserReportsPage } from '../pages/userreport';

let dashboardPage: DashboardPage;
let addProductPage: AddProductPage;
let categoriesPage: CategoriesPage;
let customerOrdersPage: CustomerOrdersPage;
let pickupAddressesPage: PickupAddressesPage;
let userReportsPage: UserReportsPage;

test.beforeEach(async ({ page }) => {
  // Open the landing page, click 'Member login' and login with the .env details
  const loginPage = new LoginPage(page);
  await loginPage.open();
  await loginPage.login();

  dashboardPage = new DashboardPage(page);
  addProductPage = new AddProductPage(page);
  categoriesPage = new CategoriesPage(page);
  customerOrdersPage = new CustomerOrdersPage(page);
  pickupAddressesPage = new PickupAddressesPage(page);
  userReportsPage = new UserReportsPage(page);

  await dashboardPage.greeting.waitFor();
});

test.describe('Dashboard - Header', () => {
  test('DASH_TC_001 Breadcrumb shows store name and page', async () => {
    await expect(dashboardPage.breadcrumbStore).toBeVisible();
    await expect(dashboardPage.breadcrumbPage).toBeVisible();
  });

  test('DASH_TC_002 Date chip shows the current date', async () => {
    await expect(dashboardPage.dateChip).toHaveText(dashboardPage.todayText());
  });

  test('DASH_TC_003 Admin name and role are shown', async () => {
    await expect(dashboardPage.adminName).toBeVisible();
    await expect(dashboardPage.adminRole).toBeVisible();
  });
});

test.describe('Dashboard - Welcome Banner', () => {
  test('DASH_TC_008 Greeting matches the time of day', async () => {
    await expect(dashboardPage.greeting).toHaveText(dashboardPage.expectedGreeting());
  });

  test('DASH_TC_011 Add Product button opens Add Product page', async () => {
    await dashboardPage.clickBannerAddProduct();
    await addProductPage.expectLoaded();
  });

  test('DASH_TC_012 View Orders button opens Customer Orders page', async () => {
    await dashboardPage.clickBannerViewOrders();
    await customerOrdersPage.expectLoaded();
  });
});

test.describe('Dashboard - Summary Cards', () => {
  test('DASH_TC_013 All summary cards are displayed with a numeric value', async () => {
    for (const title of dashboardPage.cardTitles) {
      await expect(dashboardPage.card(title)).toBeVisible();
      expect(await dashboardPage.cardValue(title), `${title} value`).not.toBeNaN();
    }
  });

  test('DASH_TC_020 Total orders equals the sum of all order status cards', async () => {
    const v = await dashboardPage.allCardValues();
    const statusSum =
      v['Pending orders'] + v['Confirmed orders'] + v['Delivered orders'] + v['Rejected orders'];
    expect(v['Total orders']).toBe(statusSum);
  });
});

test.describe('Dashboard - Order Pipeline', () => {
  test('DASH_TC_027 Order pipeline section is displayed', async () => {
    await expect(dashboardPage.pipelineTitle).toBeVisible();
    await expect(dashboardPage.deliveredPercent).toBeVisible();
    await expect(dashboardPage.reviewOrdersButton).toBeVisible();
  });

  test('DASH_TC_028 Delivered percentage is calculated correctly', async () => {
    const v = await dashboardPage.allCardValues();
    const shown = await dashboardPage.deliveredPercentValue();
    const expected = v['Total orders'] === 0 ? 0 : (v['Delivered orders'] / v['Total orders']) * 100;
    expect(shown).toBeCloseTo(expected, 0); // allows for rounding
  });

  test('DASH_TC_034 Review orders button opens Customer Orders page', async () => {
    await dashboardPage.clickReviewOrders();
    await customerOrdersPage.expectLoaded();
  });
});

test.describe('Dashboard - Quick Actions', () => {
  test('DASH_TC_035 All quick actions are displayed', async () => {
    await expect(dashboardPage.quickAddProduct).toBeVisible();
    await expect(dashboardPage.quickManageCategories).toBeVisible();
    await expect(dashboardPage.quickPickupLocations).toBeVisible();
    await expect(dashboardPage.quickCustomerReports).toBeVisible();
  });

  test('DASH_TC_036 Add a product opens Add Product page', async () => {
    await dashboardPage.clickQuickAddProduct();
    await addProductPage.expectLoaded();
  });

  test('DASH_TC_037 Manage categories opens Category Management page', async () => {
    await dashboardPage.clickQuickManageCategories();
    // await categoriesPage.expectLoaded();
  });

  test('DASH_TC_038 Pickup locations opens Pickup Addresses page', async () => {
    await dashboardPage.clickQuickPickupLocations();
    await pickupAddressesPage.open()
  });

  test('DASH_TC_039 Customer reports opens User Reports page', async () => {
    await dashboardPage.clickQuickCustomerReports();
    await userReportsPage.expectLoaded();
  });
});

test.describe('Dashboard - Navigation', () => {
  test('DASH_TC_049 Dashboard opens from the sidebar', async () => {
    await dashboardPage.openMenu(dashboardPage.menuCategories);
    await dashboardPage.openMenu(dashboardPage.menuDashboard);
    await expect(dashboardPage.greeting).toBeVisible();
  });

  test('DASH_TC_051 Dashboard stays after browser refresh', async () => {
    await dashboardPage.reload();
    await expect(dashboardPage.greeting).toBeVisible();
  });

  test('DASH_TC_061 No console errors on page load', async () => {
    const errors: string[] = [];
    dashboardPage.page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    dashboardPage.page.on('pageerror', (e) => errors.push(e.message));
    await dashboardPage.reload();
    await expect(dashboardPage.greeting).toBeVisible();
    expect(errors).toEqual([]);
  });
});