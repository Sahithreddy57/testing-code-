
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login';
import { DashboardPage } from '../pages/dashboard';

const VALID_EMAIL = process.env.ADMIN_USER ?? '';
const VALID_PASS = process.env.ADMIN_PASS ?? '';

let loginPage: LoginPage;
let dashboardPage: DashboardPage;
let dashboardUrl: string;

// ---------------------------------------------------------------
// Login before each test
test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);

    await loginPage.open();
    await loginPage.login();

    await expect(dashboardPage.greeting).toBeVisible();

    dashboardUrl = page.url();
});

// Common logout function
async function logout(): Promise<void> {
    await loginPage.page.getByText('Logout', { exact: true }).click();
}

// ---------------------------------------------------------------
test.describe('Logout Module', () => {

    // LOGOUT_TC_001
    test('LOGOUT_TC_001 - Verify successful logout', async ({ page }) => {

        await logout();

        await expect(loginPage.signInTopButton).toBeVisible();
        await expect(dashboardPage.greeting).toBeHidden();
    });

    // LOGOUT_TC_002
    test('LOGOUT_TC_002 - Verify Dashboard access is blocked using browser Back', async ({ page }) => {

        await logout();

        await page.goBack();

        await expect(dashboardPage.greeting).toBeHidden();
        
    });

    // LOGOUT_TC_003
    test('LOGOUT_TC_003 - Verify Dashboard access is blocked using direct URL', async ({ page }) => {

        await logout();

        await page.goto(dashboardUrl);

        await expect(dashboardPage.greeting).toBeHidden();
       
    });

    // LOGOUT_TC_004
    test('LOGOUT_TC_004 - Verify session remains logged out after refresh', async ({ page }) => {

        await logout();

        await page.reload();

        await expect(dashboardPage.greeting).toBeHidden();
       
    });

    // LOGOUT_TC_005
    test('LOGOUT_TC_005 - Verify user can log in again after logout', async ({ page }) => {

        await logout();

        await expect(loginPage.signInTopButton).toBeVisible();

        await loginPage.openFromTop();
        await loginPage.login();

        await expect(dashboardPage.greeting).toBeVisible();
    });

});
