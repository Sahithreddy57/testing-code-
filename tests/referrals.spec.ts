
import { test, expect } from '@playwright/test';

test.describe('Admin Referrals Tests', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/');

        await page.locator('input[type="email"]')
            .fill(process.env.ADMIN_EMAIL!);

        await page.locator('input[type="password"]')
            .fill(process.env.ADMIN_PASSWORD!);

        await page.getByRole('button', { name: /sign in/i }).click();

        await expect(page).toHaveURL(/dashboard/i);

        await page.getByText('Referrals', { exact: true }).click();
    });

    // REF-001 - Navigation
    test('REF-001 - Verify Navigation to Referrals Module', async ({ page }) => {

        await expect(page).toHaveURL(/mechanic-referrals/);

        await expect(
            page.getByRole('heading', { name: 'Mechanic Referrals' })
        ).toBeVisible();

        const search = page.getByPlaceholder(/Search by name or mobile/);

        await expect(search).toBeVisible();

        await expect(
            page.getByText('Bhavya', { exact: true })
        ).toBeVisible();
    });

// REF-002 - Search by Name
test('REF-002 - Verify Search by Mechanic Name', async ({ page }) => {

    const search = page.getByPlaceholder(/Search by name or mobile/);

    await expect(search).toBeVisible();

    await search.fill('Bhavya');

    await expect(
        page.getByRole('row').filter({ hasText: 'Bhavya' }).first()
    ).toBeVisible();

});

// REF-003 - Search by Mobile Number
test('REF-003 - Verify Search by Mobile Number', async ({ page }) => {

    const search = page.getByPlaceholder(/Search by name or mobile/);

    await expect(search).toBeVisible();

    await search.fill('8985623741');

    await expect(
        page.getByRole('row').filter({ hasText: '8985623741' })
    ).toBeVisible();

});

// REF-004 - Invalid Search
test('REF-004 - Verify Search with Invalid Data', async ({ page }) => {

    const search = page.getByPlaceholder(/Search by name or mobile/);

    await search.fill('InvalidReferral123');

    await expect(
        page.getByText(/no referrals found|no data found/i)
    ).toBeVisible();

});

// REF-005 - Clear Search
test('REF-005 - Verify Clearing Search', async ({ page }) => {

    const search = page.getByPlaceholder(/Search by name or mobile/);

    await search.fill('Bhavya');

    await search.clear();

    await expect(search).toHaveValue('');

    await expect(page.getByText('19 referrals')).toBeVisible();

});

// REF-006 - Status Filter
test('REF-006 - Verify Referrals Status Filter Functionality', async ({ page }) => {

    const statusFilter = page.locator('select').first();

    await expect(statusFilter).toBeVisible();

    const options = await statusFilter.locator('option').allTextContents();

    console.log('Available referral statuses:', options);

    for (const option of options) {
        if (option.trim() === 'All Statuses') continue;

        await statusFilter.selectOption({ label: option.trim() });

        await expect(statusFilter).toHaveValue(
            await statusFilter.locator('option:checked').getAttribute('value') || ''
        );

        console.log(`Selected referral status: ${option}`);
    }

    // Reset filter
    await statusFilter.selectOption({ label: 'All Statuses' });

    await expect(statusFilter).toHaveValue(
        await statusFilter.locator('option:checked').getAttribute('value') || ''
    );

});

test('REF-007 - Verify Referral Details', async ({ page }) => {

    const mobileNumber = '8529637412';

    // Find referral record
    const referralRow = page.locator('tr').filter({
        hasText: mobileNumber
    });

    await expect(referralRow).toBeVisible();

    // Click Eye icon
    await referralRow.locator('button:has(svg.lucide-eye)').click();

    // Inspect the details opened
    await page.waitForTimeout(1000);

});

test('REF-008 - Verify Referral Confirmation', async ({ page }) => {

    const mobileNumber = '8529637412';

    // Find the referral record
    const referralRow = page.locator('tr').filter({
        hasText: mobileNumber
    });

    await expect(referralRow).toBeVisible();

    // Click Approve button for this referral only
    await referralRow.locator('button[title="Approve"]').click();

    // Check whether a confirmation popup appears
    const dialog = page.getByRole('dialog');

    if (await dialog.isVisible()) {

        await expect(dialog).toBeVisible();

        // Click Confirm only inside the popup
        await dialog.getByRole('button', {
            name: /^confirm$/i
        }).click();

    }

    // Wait for the action to complete
    await page.waitForLoadState('networkidle');

});


test.only('REF-009 - Verify Referral Rejection', async ({ page }) => {

    const mobileNumber = '8956237845';

    // Find referral record
    const referralRow = page.locator('tr').filter({
        hasText: mobileNumber
    });

    await expect(referralRow).toBeVisible();

    // Click Reject icon
    await referralRow.locator('button[title="Reject"]').click();

    // Verify rejection popup
    await expect(
        page.getByText('Reject Referral', { exact: true })
    ).toBeVisible();

    // Enter rejection reason
    const reasonField = page.getByPlaceholder(
        'Why is this referral being rejected?'
    );

    await expect(reasonField).toBeVisible();

    await reasonField.fill('Incomplete referral details');

    // Click Reject button in popup
    await page.getByRole('button', { name: 'Reject', exact: true })
        .last()
        .click();

    // Verify rejection action completed
    await expect(
        page.getByText('Reject Referral', { exact: true })
    ).not.toBeVisible();

});

});
