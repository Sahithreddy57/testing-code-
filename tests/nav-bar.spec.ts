import { test, expect } from '@playwright/test';

test.describe('Admin Notifications Tests', () => {

    test.beforeEach(async ({ page }) => {

        await page.goto('/');

        await page.locator('input[type="email"]')
            .fill(process.env.ADMIN_EMAIL!);

        await page.locator('input[type="password"]')
            .fill(process.env.ADMIN_PASSWORD!);

        await page.getByRole('button', { name: /sign in/i }).click();

        await expect(page).toHaveURL(/dashboard/i);

    });

    test('RID-001 - Verify Sidebar Expand and Collapse Functionality', async ({ page }) => {

    const sidebar = page.locator('nav');
    const toggleButton = page.locator('button').filter({
        has: page.locator('svg.lucide-chevron-left, svg.lucide-chevron-right')
    }).first();

    await expect(sidebar).toBeVisible();

    // Collapse sidebar
    await toggleButton.click();
    await expect(sidebar).toBeVisible();

    // Expand sidebar
    await toggleButton.click();
    await expect(sidebar).toBeVisible();

});

test('RID-002 - Verify Navigation to All Admin Modules', async ({ page }) => {

    const modules = [
        { name: 'Dashboard', url: /dashboard/ },
        { name: 'Categories', url: /categories/ },
        { name: 'Catalog', url: /catalog/ },
        { name: 'Companies', url: /companies/ },
        { name: 'Products', url: /products/ },
        { name: 'Oils', url: /oils/ },
        { name: 'Shops', url: /shops/ },
        { name: 'Mechanics', url: /mechanics/ },
        { name: 'Referrals', url: /mechanic-referrals/ },
        { name: 'Riders', url: /riders/ },
        { name: 'Deliveries', url: /deliveries/ },
        { name: 'Revenue', url: /revenue/ },
        { name: 'Finance', url: /finance/ },
        { name: 'Notifications', url: /notifications/ },
        { name: 'Audit Logs', url: /audit-logs/ },
        { name: 'Users', url: /users/ }
    ];

    for (const module of modules) {

        const moduleLink = module.name === 'Catalog'
            ? page.getByText('Catalog', { exact: true }).nth(1)
            : module.name === 'Finance'
            ? page.getByText('Finance', { exact: true }).nth(1)
            : page.getByText(module.name, { exact: true }).first();

        await expect(moduleLink).toBeVisible();
        await moduleLink.click();

        await expect(page).toHaveURL(module.url);

        console.log(`${module.name} navigation successful`);
    }

});

test('LANG-001 - Verify Language Dropdown Functionality', async ({ page }) => {

    const languageButton = page.getByText('English', { exact: true }).first();

    // Verify English is displayed
    await expect(languageButton).toBeVisible();

    // Click language dropdown
    await languageButton.click();

    // Verify available languages
    await expect(page.getByText('हिंदी', { exact: true })).toBeVisible();
    await expect(page.getByText('తెలుగు', { exact: true })).toBeVisible();
    await expect(page.getByText('English', { exact: true }).last()).toBeVisible();

    console.log('English, Hindi and Telugu options are displayed');

});

// test('LANG-002 - Verify Hindi Language Selection', async ({ page }) => {

//     // Open language dropdown
//     await page.getByText('English', { exact: true }).first().click();

//     // Select Hindi
//     await page.getByText('हिंदी', { exact: true }).click();

//     // Verify Hindi is selected
//     await expect(page.getByText('हिंदी', { exact: true }).first()).toBeVisible();

//     // Verify translated dashboard heading
//     await expect(page.getByText('Dashboard', { exact: true })).toHaveCount(0);

//     console.log('Hindi language selection verified');

// });

// test('LANG-003 - Verify Telugu Language Selection', async ({ page }) => {

//     // Open language dropdown
//     await page.getByText('English', { exact: true }).first().click();

//     // Select Telugu
//     await page.getByText('తెలుగు', { exact: true }).click();

//     // Verify Telugu is selected
//     await expect(
//         page.getByText('తెలుగు', { exact: true }).first()
//     ).toBeVisible();

//     // Verify sidebar translation
//     await expect(page.getByText('డాష్‌బోర్డ్', { exact: true })).toBeVisible();

//     // Verify English dashboard heading is translated
//     await expect(
//         page.getByRole('heading', { name: 'Dashboard', exact: true })
//     ).toHaveCount(0);

//     console.log('Telugu language selection verified');

// });

test('LANG-005 - Verify Selected Language Checkmark', async ({ page }) => {

    const languageButton = page.getByText('English', { exact: true }).first();

    // Select Hindi
    await languageButton.click();
    await page.getByText('हिंदी', { exact: true }).click();

    // Reopen dropdown
    await page.getByText('हिंदी', { exact: true }).first().click();

    // Verify Hindi option is selected
    const hindiOption = page.getByText('हिंदी', { exact: true }).last();
    await expect(hindiOption.locator('..').locator('svg')).toBeVisible();

    // Select Telugu
    await page.getByText('తెలుగు', { exact: true }).click();

    // Reopen dropdown
    await page.getByText('తెలుగు', { exact: true }).first().click();

    // Verify Telugu option is selected
    const teluguOption = page.getByText('తెలుగు', { exact: true }).last();
    await expect(teluguOption.locator('..').locator('svg')).toBeVisible();

});

test('LANG-006 - Verify Language Persistence After Refresh', async ({ page }) => {

    // Select Hindi
    await page.getByText('English', { exact: true }).first().click();
    await page.getByText('हिंदी', { exact: true }).click();

    // Refresh page
    await page.reload();

    // Verify selected language
    await expect(
        page.getByText('हिंदी', { exact: true }).first()
    ).toBeVisible();

    console.log('Language selection persistence verified');

});

test('THEME-001 - Verify Dark Mode Functionality', async ({ page }) => {

  // Locate and click the theme toggle
  await page.getByRole('button', { name: /theme|dark mode/i }).click();

  // Verify dark theme is applied
  await expect(page.locator('html')).toHaveAttribute('class', /dark/);

});

test('THEME-002 - Verify Light Mode Functionality', async ({ page }) => {

    await page.getByRole('button', { name: /theme|dark mode/i }).click();
  // Locate and click the theme toggle
  await page.getByRole('button', { name: /theme|light mode/i }).click();

  // Verify light theme is applied
  await expect(page.locator('html')).not.toHaveAttribute('class', /dark/);

});

test('NOTIF-001 - Verify Notification Icon Functionality', async ({ page }) => {

  // Locate notification icon
  const notificationIcon = page.locator('button').filter({
    has: page.locator('svg.lucide-bell')
  });

  await expect(notificationIcon).toBeVisible();

  // Click notification icon
  await notificationIcon.click();

  // Verify notification panel or empty state
  const notificationContent = page.getByText(
    /no notifications|notifications/i
  );

  await expect(notificationContent).toBeVisible();
});

// test('SA-001 - Verify Super Admin Profile Dropdown', async ({ page }) => {

//   await page.getByText('Super Admin', { exact: true }).click();

//   // Verify dropdown options are displayed
//   await expect(
//     page.getByText(/profile|account|settings|logout/i)
//   ).toBeVisible();

// });

// test('SA-002 - Verify Super Admin Logout Functionality', async ({ page }) => {

//   // Click Logout icon
//   await page.locator('svg.lucide-log-out').click();

//   // Verify redirection to login page
//   await expect(page).toHaveURL(/admin/i);

//   // Verify login form is visible
//   await expect(page.locator('input[type="email"]')).toBeVisible();
//   await expect(page.locator('input[type="password"]')).toBeVisible();

// });

// test.only('SA-003 - Verify Footer Company Link Functionality', async ({ page }) => {

//   const companyName = page.getByText('VEGAAHI IT PVT LTD', {
//     exact: true
//   });

//   await expect(companyName).toBeVisible();

//   await companyName.click();

//   // Verify navigation
//   await expect(page).toHaveURL(/vegaahi/i);

// });

});