
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login';
import { UserReportsPage } from '../pages/userreport';

let userReports: UserReportsPage;
test.setTimeout(120000);

test.beforeEach(async ({ page }) => {
    const login = new LoginPage(page);
    await login.open();
    await login.login();
    userReports = new UserReportsPage(page);
    await userReports.openFromSidebar();
});

// PAGE UI

test('UR_TC_001 - Verify User Reports page opens from sidebar', async () => {
    await expect(userReports.bannerTag).toBeVisible();
    await expect(userReports.heading).toBeVisible();
    await expect(userReports.bannerText).toBeVisible();
    await expect(userReports.downloadButton).toBeVisible();
    await expect(userReports.refreshButton).toBeVisible();
});

test('UR_TC_002 - Verify Total Customers and Search Results are displayed', async () => {
    await expect(userReports.totalCustomersLabel).toBeVisible();
    await expect(userReports.searchResultsLabel).toBeVisible();
    expect(await userReports.totalCustomers()).not.toBeNaN();
    expect(await userReports.searchResults()).not.toBeNaN();
});

test('UR_TC_003 - Verify search box visibility and placeholder', async () => {
    await expect(userReports.searchBox).toBeVisible();
    await expect(userReports.searchBox).toHaveValue('');
    await expect(userReports.searchBox).toHaveAttribute('placeholder', /Search by name, email or mobile number/i);
});

test('UR_TC_004 - Verify Registered Customers section', async () => {
    await userReports.sectionTitle.scrollIntoViewIfNeeded();
    await expect(userReports.sectionTag).toBeVisible();
    await expect(userReports.sectionTitle).toBeVisible();
    await expect(userReports.customersBadge).toBeVisible();
});

test('UR_TC_005 - Verify empty message when there are no customers', async () => {
    const total = await userReports.totalCustomers();
    if (total === 0) {
        await expect(userReports.emptyTitle).toBeVisible();
        await expect(userReports.emptyText).toBeVisible();
    } else {
        await expect(userReports.emptyTitle).toBeHidden();
        await expect(userReports.emptyText).toBeHidden();
    }
});

test('UR_TC_006 - Verify User Reports menu is highlighted', async () => {
    const activeClass = await userReports.menuUserReports.getAttribute('class');
    const otherClass = await userReports.menuDashboard.getAttribute('class');
    expect(activeClass).not.toBe(otherClass);
});

// COUNTERS AND REFRESH

test('UR_TC_007 - Verify Total Customers matches the badge count', async () => {
    expect(await userReports.totalCustomers()).toBe(await userReports.badgeCount());
});

test('UR_TC_008 - Verify Search Results displays 0 when search is empty', async () => {
    await expect(userReports.searchBox).toHaveValue('');
    expect(await userReports.searchResults()).toBe(0);
});

test('UR_TC_009 - Verify Refresh keeps the page and customer counts', async () => {
    const total = await userReports.totalCustomers();
    const results = await userReports.searchResults();
    await userReports.refreshButton.click();
    await userReports.expectLoaded();
    expect(await userReports.totalCustomers()).toBe(total);
    expect(await userReports.searchResults()).toBe(results);
});

test('UR_TC_010 - Verify customer counts remain after browser reload', async () => {
    const total = await userReports.totalCustomers();
    const results = await userReports.searchResults();
    await userReports.reload();
    expect(await userReports.totalCustomers()).toBe(total);
    expect(await userReports.searchResults()).toBe(results);
});

test('UR_TC_011 - Verify Dashboard customer count matches User Reports', async () => {
    const total = await userReports.totalCustomers();
    await userReports.openDashboard();
    expect(await userReports.dashboardTotalCustomers()).toBe(total);
});

// SEARCH

test('UR_TC_012 - Verify search with no matching customer', async () => {
    const total = await userReports.totalCustomers();
    await userReports.search('zzzqqqxxx');
    await expect.poll(() => userReports.searchResults()).toBe(0);
    expect(await userReports.totalCustomers()).toBe(total);
});

test('UR_TC_013 - Verify clearing search displays the default search count', async () => {
    await userReports.search('zzzqqqxxx');
    await expect.poll(() => userReports.searchResults()).toBe(0);
    await userReports.clearSearch();
    await expect(userReports.searchBox).toHaveValue('');
    await expect.poll(() => userReports.searchResults()).toBe(0);
});

test('UR_TC_014 - Verify special characters do not break search', async () => {
    const total = await userReports.totalCustomers();
    await userReports.search('% $ # @ ! * ( )');
    await userReports.expectLoaded();
    await expect.poll(() => userReports.searchResults()).toBeLessThanOrEqual(total);
});

// DOWNLOAD

test('UR_TC_015 - Verify Download Excel downloads an Excel file', async () => {
    const download = await userReports.downloadExcel();
    expect(download.suggestedFilename()).toMatch(/\.xlsx$/i);
});

// CUSTOMER DETAILS

test('UR_TC_016 - Verify customer details are displayed correctly', async () => {
    await expect(userReports.sectionTitle).toBeVisible();

    await expect.poll(
        () => userReports.listedCount(),
        { timeout: 15000 }
    ).toBeGreaterThan(0);

    const customer = await userReports.customerDetails(0);

    expect(customer.name).not.toBe('');
    expect(customer.email).toMatch(/^[\w.+-]+@[\w-]+\.[\w.]+$/);
    expect(customer.mobile).not.toBe('');
});

test('UR_TC_017 - Verify listed customers match badge and counters', async () => {
    await expect(userReports.sectionTitle).toBeVisible();

    await expect.poll(
        () => userReports.listedCount(),
        { timeout: 15000 }
    ).toBeGreaterThan(0);

    await expect.poll(
        () => userReports.badgeCount(),
        { timeout: 15000 }
    ).toBeGreaterThan(0);

    await expect.poll(
        () => userReports.totalCustomers(),
        { timeout: 15000 }
    ).toBeGreaterThan(0);

    const listed = await userReports.listedCount();
    const badge = await userReports.badgeCount();
    const total = await userReports.totalCustomers();

    expect(listed).toBe(badge);
    expect(listed).toBe(total);
});

// SEARCH USING CUSTOMER DATA

test('UR_TC_026 - Verify search by customer name is case-insensitive', async () => {
    test.skip(await userReports.listedCount() === 0, 'No customers to search');

    const details = await userReports.customerDetails(0);
    const { name } = details;

    const part = name.slice(0, Math.min(4, name.length));

    console.log('Customer row:', details.text);
    console.log('Extracted name:', name);
    console.log('Search text:', part);

    test.skip(!part, 'Customer name is empty');

    for (const text of [part.toLowerCase(), part.toUpperCase()]) {
        console.log('Searching:', text);

        await userReports.search(text);

        await expect.poll(() => userReports.searchResults()).toBeGreaterThan(0);

        console.log('Search results:', await userReports.searchResults());

        expect(await userReports.listedCount()).toBe(await userReports.searchResults());
    }
});

test('UR_TC_027 - Verify search by customer email', async () => {
    test.skip(await userReports.listedCount() === 0, 'No customers to search');
    const { email } = await userReports.customerDetails(0);
    test.skip(!email, 'Customer email is unavailable');
    await userReports.search(email.split('@')[0]);
    await expect.poll(() => userReports.searchResults()).toBeGreaterThan(0);
    expect(await userReports.listedCount()).toBe(await userReports.searchResults());
    await expect(userReports.emailTexts.first()).toContainText(email.split('@')[0]);
});

test('UR_TC_028 - Verify search by mobile number', async () => {
    test.skip(await userReports.listedCount() === 0, 'No customers to search');
    const { mobile } = await userReports.customerDetails(0);
    const digits = mobile.replace(/\D/g, '').slice(-6);
    test.skip(!digits, 'Customer mobile number is unavailable');
    await userReports.search(digits);
    await expect.poll(() => userReports.searchResults()).toBeGreaterThan(0);
    expect(await userReports.listedCount()).toBe(await userReports.searchResults());
});

// test('UR_TC_029 - Verify spaces before and after search text are ignored', async () => {
//     test.skip(await userReports.listedCount() === 0, 'No customers to search');
//     const { email } = await userReports.customerDetails(0);
//     test.skip(!email, 'Customer email is unavailable');
//     await userReports.search(`   ${email}   `);
//     await expect.poll(() => userReports.searchResults()).toBeGreaterThan(0);
//     await expect(userReports.emailTexts.first()).toContainText(email);
// });

test('UR_TC_030 - Verify search results update while typing', async () => {
    test.skip(await userReports.listedCount() === 0, 'No customers to search');
    const total = await userReports.totalCustomers();
    const { email } = await userReports.customerDetails(0);
    test.skip(!email, 'Customer email is unavailable');
    await userReports.typeSlowly(email);
    await expect.poll(() => userReports.searchResults()).toBeLessThanOrEqual(total);
    await expect.poll(() => userReports.searchResults()).toBeGreaterThan(0);
});

test('UR_TC_031 - Verify no-results message when no customer matches', async () => {
    test.skip(await userReports.totalCustomers() === 0, 'Needs at least one customer');
    await userReports.search('zzzqqqxxx');
    await expect.poll(() => userReports.searchResults()).toBe(0);
    await expect(userReports.emptyTitle).toBeHidden();
    await expect(userReports.noResultsMessage).toBeVisible();
});
