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

        await page.getByText('Audit Logs', { exact: true }).click();

    });


test('AUD-001 - Verify Navigation to Audit Logs Module', async ({ page }) => {

    // Verify URL
    await expect(page).toHaveURL(/audit-logs/);

    // Verify Admin filter
    await expect(page.getByText('Admin', { exact: true }).first()).toBeVisible();

    // Verify Action filter
    await expect(page.getByText('Action', { exact: true }).first()).toBeVisible();

    // Verify Entity Type filter
    await expect(page.getByText('Entity Type', { exact: true }).first()).toBeVisible();

    // Verify date fields
    await expect(page.locator('input[type="date"]').first()).toBeVisible();
    await expect(page.locator('input[type="date"]').nth(1)).toBeVisible();

       // Verify dynamic record count
    const recordCount = page.locator('span').filter({
        hasText: /^\s*[\d,]+\s*records\s*$/
    });

    await expect(recordCount).toBeVisible();

    // Verify audit log table
    await expect(page.locator('tbody tr').first()).toBeVisible();

});



test('AUD-002 - Verify Audit Logs UI Elements', async ({ page }) => {

    // Verify page heading
    await expect(
        page.getByRole('heading', { name: 'Audit Logs' })
    ).toBeVisible();

    // Verify filter dropdowns
    const dropdowns = page.locator('select');

    await expect(dropdowns).toHaveCount(3);

    for (let i = 0; i < 3; i++) {
        await expect(dropdowns.nth(i)).toBeVisible();
        await expect(dropdowns.nth(i)).toBeEnabled();
    }

    // Verify date fields
    const dateFields = page.locator('input[type="date"]');

    await expect(dateFields).toHaveCount(2);
    await expect(dateFields.nth(0)).toBeVisible();
    await expect(dateFields.nth(1)).toBeVisible();

    // Verify audit log table
    const table = page.locator('table');

    await expect(table).toBeVisible();

    // Verify table header row
    const headerRow = table.locator('thead tr');

    await expect(headerRow).toBeVisible();

    const headerCount = await headerRow.locator('th').count();

    expect(headerCount).toBeGreaterThan(0);

    // Verify at least one audit record
    await expect(table.locator('tbody tr').first()).toBeVisible();

    // Verify View action
    await expect(
        page.getByText('View', { exact: true }).first()
    ).toBeVisible();

});


test('AUD-003 - Verify Admin Filter Functionality', async ({ page }) => {

    // Admin dropdown
    const adminDropdown = page.locator('select').nth(0);

    await expect(adminDropdown).toBeVisible();
    await expect(adminDropdown).toBeEnabled();

    // Get all available admin options
    const adminOptions = await adminDropdown.locator('option').evaluateAll(options =>
        options.map(option => ({
            value: (option as HTMLOptionElement).value,
            label: (option as HTMLOptionElement).textContent?.trim() || ''
        }))
    );

    console.log('Available Admins:', adminOptions);

    // Verify individual admin filters
    for (const admin of adminOptions) {

        await adminDropdown.selectOption(admin.value);

        await expect(adminDropdown).toHaveValue(admin.value);

        // Wait for filtered results to update
        await page.waitForTimeout(500);

        console.log(`Selected Admin: ${admin.label}`);

        // Verify table or empty state is displayed
        const table = page.locator('table');
        await expect(table).toBeVisible();
    }

    // Reset to All Admins
    const allAdmins = adminOptions.find(option =>
        option.label === 'All Admins'
    );

    if (allAdmins) {
        await adminDropdown.selectOption(allAdmins.value);
        await expect(adminDropdown).toHaveValue(allAdmins.value);
    }

});


test('AUD-004 - Verify Action Filter Functionality', async ({ page }) => {

    // Locate Action dropdown
    const actionDropdown = page.locator('select').nth(1);

    await expect(actionDropdown).toBeVisible();
    await expect(actionDropdown).toBeEnabled();

    // Important actions to verify
    const importantActions = [
        'LOGIN_SUCCESS',
        'LOGIN_FAILED',
        'LOGOUT',
        'CREATE',
        'UPDATE',
        'DELETE',
        'APPROVE',
        'REJECT',
        'SUSPEND',
        'NOTIFICATION_SENT'
    ];

    // Get available dropdown options
    const availableOptions = await actionDropdown.locator('option').allTextContents();

    for (const action of importantActions) {

        if (availableOptions.some(option => option.trim() === action)) {

            await actionDropdown.selectOption({ label: action });

            // Verify selected action
            await expect(actionDropdown.locator('option:checked'))
                .toHaveText(action);

            // Verify displayed records
            const rows = page.locator('tbody tr');

            const rowCount = await rows.count();

            for (let i = 0; i < rowCount; i++) {
                await expect(rows.nth(i).locator('td').nth(2))
                    .toContainText(action);
            }

            console.log(`Verified Action: ${action}`);
        }
    }

    // Reset filter
    await actionDropdown.selectOption({ label: 'All Actions' });

    await expect(actionDropdown.locator('option:checked'))
        .toHaveText('All Actions');

});

test('AUD-005 - Verify Entity Type Filter Functionality', async ({ page }) => {

    const entityDropdown = page.locator('select').nth(2);

    await expect(entityDropdown).toBeVisible();
    await expect(entityDropdown).toBeEnabled();

    const entityTypes = [
        'Shop',
        'Mechanic',
        'Product',
        'Category',
        'Transaction',
        'Notification'
    ];

    for (const entity of entityTypes) {

        // Select Entity Type
        await entityDropdown.selectOption({ label: entity });

        // Verify selected value
        await expect(
            entityDropdown.locator('option:checked')
        ).toHaveText(entity);

        // Wait for filter update
        await page.waitForTimeout(1000);

        console.log(`Entity Type selected successfully: ${entity}`);
    }

    // Reset filter
    await entityDropdown.selectOption({ label: 'All Types' });

    await expect(
        entityDropdown.locator('option:checked')
    ).toHaveText('All Types');

});


test('AUD-006 - Verify Date Range Filter Functionality', async ({ page }) => {

    // Locate From and To date fields
    const fromDate = page.locator('input[type="date"]').nth(0);
    const toDate = page.locator('input[type="date"]').nth(1);

    await expect(fromDate).toBeVisible();
    await expect(toDate).toBeVisible();

    // Select date range
    await fromDate.fill('2026-11-11');
    await toDate.fill('2026-11-11');

    // Verify selected dates
    await expect(fromDate).toHaveValue('2026-11-11');
    await expect(toDate).toHaveValue('2026-11-11');

    // Verify audit logs section remains available
    await expect(page.locator('table')).toBeVisible();

    // Clear date filters
    await fromDate.fill('');
    await toDate.fill('');

    // Verify date fields are cleared
    await expect(fromDate).toHaveValue('');
    await expect(toDate).toHaveValue('');

    console.log('Date range filter selection and reset verified');

});


test('AUD-007 - Verify Login Activity Logs', async ({ page }) => {


    const actionDropdown = page.locator('select').nth(1);

    await expect(actionDropdown).toBeVisible();

    // Verify successful login logs
    await actionDropdown.selectOption({ label: 'LOGIN_SUCCESS' });

    await expect(
        actionDropdown.locator('option:checked')
    ).toHaveText('LOGIN_SUCCESS');

    const loginRows = page.locator('tbody tr');

    await expect.poll(async () => await loginRows.count())
        .toBeGreaterThan(0);

    for (let i = 0; i < await loginRows.count(); i++) {

        const row = loginRows.nth(i);

        await expect(row.locator('td').nth(2))
            .toContainText('LOGIN_SUCCESS');

        await expect(row.locator('td').nth(0)).not.toBeEmpty();
        await expect(row.locator('td').nth(1)).not.toBeEmpty();
    }

    console.log('LOGIN_SUCCESS records verified');

    // Verify logout logs
    await actionDropdown.selectOption({ label: 'LOGOUT' });

    await expect(
        actionDropdown.locator('option:checked')
    ).toHaveText('LOGOUT');

    const logoutRows = page.locator('tbody tr');

    await expect.poll(async () => await logoutRows.count())
        .toBeGreaterThan(0);

    for (let i = 0; i < await logoutRows.count(); i++) {

        await expect(
            logoutRows.nth(i).locator('td').nth(2)
        ).toContainText('LOGOUT');
    }

    console.log('LOGOUT records verified');

    // Reset filter
    await actionDropdown.selectOption({ label: 'All Actions' });

});


test('AUD-008 - Verify Create, Update and Delete Activity Logs', async ({ page }) => {

    const actionDropdown = page.locator('select').nth(1);

    const actions = ['CREATE', 'UPDATE', 'DELETE'];

    for (const action of actions) {

        await actionDropdown.selectOption({ label: action });

        await expect(
            actionDropdown.locator('option:checked')
        ).toHaveText(action);

        // Wait for filtered results
        await page.waitForTimeout(1000);

        const rows = page.locator('tbody tr');
        const rowCount = await rows.count();

        if (rowCount > 0) {

            for (let i = 0; i < rowCount; i++) {

                const row = rows.nth(i);

                await expect(row.locator('td').nth(0)).not.toBeEmpty();
                await expect(row.locator('td').nth(2))
                    .toContainText(action);
            }

            console.log(`${action}: ${rowCount} records verified`);

        } else {

            console.log(`${action}: No records available`);
        }
    }

    // Reset Action filter
    await actionDropdown.selectOption({ label: 'All Actions' });

});


test('AUD-009 - Verify Approve, Reject and Suspend Activity Logs', async ({ page }) => {

    const actionDropdown = page.locator('select').nth(1);

    const actions = ['APPROVE', 'REJECT', 'SUSPEND'];

    for (const action of actions) {

        await actionDropdown.selectOption({ label: action });

        await expect(
            actionDropdown.locator('option:checked')
        ).toHaveText(action);

        await page.waitForTimeout(1000);

        const rows = page.locator('tbody tr');
        const rowCount = await rows.count();

        if (rowCount > 0) {

            for (let i = 0; i < rowCount; i++) {

                const row = rows.nth(i);

                await expect(row.locator('td').nth(0)).not.toBeEmpty();
                await expect(row.locator('td').nth(2))
                    .toContainText(action);
            }

            console.log(`${action}: ${rowCount} records verified`);

        } else {

            console.log(`${action}: No records available`);
        }
    }

    // Reset Action filter
    await actionDropdown.selectOption({ label: 'All Actions' });

});



test('AUD-010 - Verify CREATE Audit Log Details', async ({ page }) => {

    // Select CREATE action
    const actionDropdown = page.locator('select').nth(1);

    await actionDropdown.selectOption({ label: 'CREATE' });

    await expect(
        actionDropdown.locator('option:checked')
    ).toHaveText('CREATE');

    // Locate first CREATE record
    const firstRow = page.locator('tbody tr').first();

    await expect(firstRow).toBeVisible();

    // Click View
    await firstRow.getByText('View', { exact: true }).click();

    // Verify Meta details
    await expect(
        page.getByText('Meta', { exact: true }).first()
    ).toBeVisible();

    // Verify Hide button
    await expect(
        firstRow.getByText('Hide', { exact: true })
    ).toBeVisible();

    // Collapse Meta details
    await firstRow.getByText('Hide', { exact: true }).click();

    // Verify Meta section is collapsed
    await expect(
        firstRow.getByText('Hide', { exact: true })
    ).toHaveCount(0);

});


test('AUD-011 - Verify No Records for Invalid Filter Criteria', async ({ page }) => {

    const fromDate = page.locator('input[type="date"]').nth(0);
    const toDate = page.locator('input[type="date"]').nth(1);

    // Select a future date where no audit records are expected
    await fromDate.fill('2099-12-31');
    await toDate.fill('2099-12-31');

    // Wait for filtering
    await page.waitForTimeout(1500);

    // Verify no records are displayed
    // Verify no audit logs are available
const tableContent = await page.locator('tbody').innerText();

await expect(page.locator('tbody'))
    .toContainText('No audit logs found');

console.log('No audit logs found for the selected future date');

// Clear date filters
await fromDate.fill('');
await toDate.fill('');

// Verify filters are cleared
await expect(fromDate).toHaveValue('');
await expect(toDate).toHaveValue('');

// Verify audit logs are displayed again
await expect(page.locator('tbody tr').first())
    .not.toContainText('No audit logs found');


});

test('AUD-012 - Verify Previous and Next Pagination Functionality', async ({ page }) => {

    // Verify pagination on first page
    await expect(page.getByText('Page 1 of 207')).toBeVisible();

    const prevButton = page.getByRole('button', { name: /prev/i });
    const nextButton = page.getByRole('button', { name: /next/i });

    // Verify Previous is disabled on first page
    await expect(prevButton).toBeDisabled();

    // Click Next
    await nextButton.click();

    // Verify page number changes
    await expect(page.getByText('Page 2 of 207')).toBeVisible();

    // Verify Next and Previous are enabled
    await expect(prevButton).toBeEnabled();
    await expect(nextButton).toBeEnabled();

    // Click Previous
    await prevButton.click();

    // Verify return to first page
    await expect(page.getByText('Page 1 of 207')).toBeVisible();

    // Verify Previous is disabled again
    await expect(prevButton).toBeDisabled();

});

});

