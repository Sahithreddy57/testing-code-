import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

let createdCategoryName = '';

test.describe.serial('Admin Categories Tests', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.locator('input[type="email"]').fill(process.env.ADMIN_EMAIL!);
        await page.locator('input[type="password"]').fill(process.env.ADMIN_PASSWORD!);
        await page.getByRole('button', { name: 'Sign in' }).click();
        await expect(page).toHaveURL(/dashboard/i);
        await page.getByText('Categories', { exact: true }).click();
    });

    test('CAT-001 - Categories page loads successfully', async ({ page }) => {

        await expect(page).toHaveURL(/categories/i);
        await expect(
            page.getByText('Vehicle types', { exact: false })
        ).toBeVisible();
    });

    test('CAT-002 - Existing category cards are visible', async ({ page }) => {
        await expect(page.getByText('Car', { exact: true })).toBeVisible();
        await expect(page.getByText('Bike', { exact: true })).toBeVisible();
    });

    test('CAT-003 - Category images are displayed', async ({ page }) => {
        const carCard = page.locator('div').filter({
            has: page.getByText('Car', { exact: true }),
        }).first();

        const bikeCard = page.locator('div').filter({
            has: page.getByText('Bike', { exact: true }),
        }).first();

        await expect(carCard.locator('img').first()).toBeVisible();
        await expect(bikeCard.locator('img').first()).toBeVisible();
    });

    test('CAT-004 - Category names and slugs are displayed', async ({ page }) => {
        await expect(page.getByText('Car', { exact: true })).toBeVisible();
        await expect(page.getByText('/car', { exact: true })).toBeVisible();

        await expect(page.getByText('Bike', { exact: true })).toBeVisible();
        await expect(page.getByText('/bike', { exact: true })).toBeVisible();
    });

    test('CAT-002 - Verify category cards can be reordered', async ({ page }) => {

        await expect(page).toHaveURL(/\/admin\/categories/);

        const carCard = page.getByText('Car', { exact: true }).locator('xpath=../..');
        const bikeCard = page.getByText('Bike', { exact: true }).locator('xpath=../..');

        await expect(carCard).toBeVisible();
        await expect(bikeCard).toBeVisible();

        await carCard.dragTo(bikeCard);

        // Verify both category cards remain visible after reordering
        await expect(page.getByText('Car', { exact: true })).toBeVisible();
        await expect(page.getByText('Bike', { exact: true })).toBeVisible();
    });

    // CAT-003: Verify a new category can be created
    test('CAT-003 - Create a new category with cover image', async ({ page }) => {
    await page.getByText('New Category', { exact: true }).click();

    const imagePath = path.resolve(
        process.cwd(),
        'tests',
        'Images',
        'Van.jpg'
    );

    const fileInput = page.locator('input[type="file"]');

    console.log('File inputs found:', await fileInput.count());

    await expect(fileInput.first()).toBeAttached({
        timeout: 10000,
    });

    await fileInput.first().setInputFiles(imagePath);

    // Enter the category name
    createdCategoryName = 'Van';

    await page
        .getByPlaceholder(/e\.g\.\s*car,\s*bike,\s*truck/i)
        .fill(createdCategoryName);

    await page.getByRole('checkbox').check();

    await page.getByRole('button', { name: /create category/i }).click();

    // Verify creation
    await expect(
        page.getByText(createdCategoryName, { exact: true })
    ).toBeVisible({ timeout: 10000 });
});

    test('CAT-004 - Edit the created category', async ({ page }) => {

        const categoryCard = page
            .locator('div')
            .filter({ hasText: createdCategoryName })
            .filter({ has: page.getByText('Edit', { exact: true }) })
            .last();

        await expect(categoryCard).toBeVisible();

        await categoryCard.getByText('Edit', { exact: true }).click();

        await expect(
            page.getByText('Edit Category', { exact: true })
        ).toBeVisible();

        const updatedCategoryName = `UpdatedCategory${Date.now()}`;

        await page.locator('input').filter({ visible: true }).first()
            .fill(updatedCategoryName);

        const activeCheckbox = page.getByRole('checkbox');

        if (!(await activeCheckbox.isChecked())) {
            await activeCheckbox.check();
        }

        await page.getByRole('button', { name: /save changes/i }).click();

        await expect(
            page.getByText(updatedCategoryName, { exact: true })
        ).toBeVisible({ timeout: 10000 });

        // Store the updated name for the delete test
        createdCategoryName = updatedCategoryName;
    });

//    test('CAT-005 - Delete the edited category', async ({ page }) => {

//   // Find the category created and edited by the previous tests
//   const categoryCard = page
//     .locator('div')
//     .filter({ hasText: createdCategoryName })
//     .filter({ has: page.getByText('Delete', { exact: true }) })
//     .last();

//   await expect(categoryCard).toBeVisible();

//   // Open delete confirmation
//   await categoryCard.getByText('Delete', { exact: true }).click();

//   // Verify confirmation popup
//   await expect(
//     page.getByText(createdCategoryName, { exact: false }).last()
//   ).toBeVisible();

//   // Click the red Delete button in the confirmation popup
//   await page.getByRole('button', { name: /^Delete$/i }).last().click();

//   // Verify category was deleted
//   await expect(
//     page.getByText(createdCategoryName, { exact: true })
//   ).toHaveCount(0);
// });
});