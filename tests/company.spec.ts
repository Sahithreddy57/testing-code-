import { test, expect } from '@playwright/test';

test.describe.serial('Admin Companies Tests', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.locator('input[type="email"]').fill(process.env.ADMIN_EMAIL!);
        await page.locator('input[type="password"]').fill(process.env.ADMIN_PASSWORD!);
        await page.getByRole('button', { name: /sign in/i }).click();
        await expect(page).toHaveURL(/dashboard/i);
        await page.getByRole('link', { name: /companies/i }).click();

    });

    // TC-COMP-001: Validate Companies page navigation
    test('COMP-001 - Navigate to Companies page successfully', async ({ page }) => {

        // Verify Companies page
        await expect(page).toHaveURL(/\/companies/i);
        await expect(
            page.getByRole('heading', { name: /parts companies/i })
        ).toBeVisible();
    });


    // TC-COMP-002: Add a new company
    test('COMP-002 - Add a new company successfully', async ({ page }) => {

        await page.getByRole('button', { name: /add company/i }).click();

        await expect(
            page.getByRole('heading', { name: /add company/i })
        ).toBeVisible();

        const companyName = `AutomationCompany${Date.now()}`;

        await page.getByPlaceholder(/bosch, denso, toyota oem/i)
            .fill(companyName);


        await page.getByRole('button', { name: /add company/i }).last().click();

        // Verify the company was added
        await expect(
            page.getByText(companyName, { exact: true })
        ).toBeVisible({ timeout: 10000 });

        // Locate the company row
        const companyRow = page
            .locator('.space-y-2 > div')
            .filter({ hasText: companyName });

        await expect(companyRow).toBeVisible();

        // Hover to reveal Edit and Delete icons
        await companyRow.hover();

        // Click Edit (pencil icon)
        await companyRow.locator('button').nth(0).click();

        // Verify Edit Company popup
        await expect(
            page.getByRole('heading', { name: 'Edit Company' })
        ).toBeVisible();

        // Update the same company name
        const updatedCompanyName = `${companyName}_Updated`;

        await page.getByPlaceholder(/bosch, denso, toyota oem/i)
            .fill(updatedCompanyName);

        // Save changes
        await page.getByRole('button', { name: /save changes/i }).click();

        // Verify updated company
        await expect(
            page.getByText(updatedCompanyName, { exact: true })
        ).toBeVisible();

        // Locate the updated company
        const updatedCompanyRow = page
            .locator('.space-y-2 > div')
            .filter({ hasText: updatedCompanyName });

        await expect(updatedCompanyRow).toBeVisible();

        // Hover to reveal action buttons
        // await updatedCompanyRow.hover();

        // // Click Delete (trash icon)
        // await updatedCompanyRow.locator('button').nth(1).click();

        // // Confirm deletion if a confirmation dialog appears
        // const deleteButton = page.getByRole('button', {
        //     name: /^delete$/i
        // });

        // await expect(deleteButton).toBeVisible();
        // await deleteButton.click();

        // // Verify company is removed
        // await expect(
        //     page.getByText(updatedCompanyName, { exact: true })
        // ).toHaveCount(0);
    });
});
