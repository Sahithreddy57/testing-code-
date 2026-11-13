
import { test, expect } from '@playwright/test';

const categoryName = 'Van';
const brandName = 'Automationbrand_1793090406608_updated';

let createdModelName = '';
let createdVariantName = '';

test.describe.serial('Admin Models Tests', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/');

        await page.locator('input[type="email"]')
            .fill(process.env.ADMIN_EMAIL!);

        await page.locator('input[type="password"]')
            .fill(process.env.ADMIN_PASSWORD!);

        await page.getByRole('button', { name: /sign in/i }).click();

        await expect(page).toHaveURL(/dashboard/i);

        await page.getByRole('link', { name: /catalog/i }).click();

        await page.getByText('Models', { exact: true }).first().click();
    });

    test('MODEL-001 - Select Updated category and created brand', async ({ page }) => {
        const categoryDropdown = page.getByRole('combobox').nth(0);
        const brandDropdown = page.getByRole('combobox').nth(1);

        await categoryDropdown.selectOption({ label: categoryName });

        await expect(categoryDropdown).toHaveValue(
            '6adef10b63d4cd7411e93995'
        );

        await expect(brandDropdown).toContainText(brandName);

        await brandDropdown.selectOption({ label: brandName });

        await expect(brandDropdown).toHaveValue(/.+/);
    });

    test('MODEL-002 - Add a model with variant and years', async ({ page }) => {
        // Select category
        const categoryDropdown = page.getByRole('combobox').nth(0);

        await categoryDropdown.selectOption({ label: categoryName });

        // Select the brand created in the Brands tests
        const brandDropdown = page.getByRole('combobox').nth(1);

        await expect(brandDropdown).toContainText(brandName);

        await brandDropdown.selectOption({ label: brandName });

        // Open Add Model form
        await page.getByRole('button', { name: /add model/i }).click();

        await expect(
            page.getByRole('heading', { name: /add vehicle model/i })
        ).toBeVisible();

        // Fill model details
        createdModelName = `AutomationModel_${Date.now()}`;
        createdVariantName = `AutomationVariant_${Date.now()}`;

        await page.getByPlaceholder(/swift, city, i20/i)
            .fill(createdModelName);

        await page.getByPlaceholder(/lxi, vxi, zxi, petrol, diesel/i)
            .fill(createdVariantName);

        await page.getByPlaceholder(/2020, 2021, 2022/i)
            .fill('2026');

        // Submit the form
        await page.getByRole('button', { name: /^add$/i }).click();

        // Verify the Add Model form closes
        await expect(
            page.getByRole('heading', { name: /add vehicle model/i })
        ).toHaveCount(0);

        await page.reload();

        // Select Models tab again if necessary
        await page.getByText('Models', { exact: true }).first().click();

        // Re-select category and brand
        await categoryDropdown.selectOption({ label: categoryName });

        await brandDropdown.selectOption({ label: brandName });

        // Check whether the created model appears
        await expect(
            page.getByText(createdModelName, { exact: false }).first()
        ).toBeVisible({ timeout: 10000 });
    });


test('MODEL-003 - Edit the created model', async ({ page }) => {
    // Select the category
    const categoryDropdown = page.getByRole('combobox').nth(0);
    await categoryDropdown.selectOption({ label: categoryName });

    // Select the brand
    const brandDropdown = page.getByRole('combobox').nth(1);
    await brandDropdown.selectOption({ label: brandName });

    // Find the model created in MODEL-002
    const model = page.getByText(createdModelName, { exact: false }).first();
    await expect(model).toBeVisible();

    // Locate the model card

    // Hover over the model card
    const modelCard = model.locator('..').locator('..');
    await modelCard.hover();

    // Find and click the Edit button using its pencil icon
    const editButton = modelCard.locator('button').filter({
        has: page.locator('svg.lucide-pencil'),
    });

    await expect(editButton).toBeVisible();
    await editButton.click();

    // Verify Edit Vehicle Model form opens
    await expect(
        page.getByText('Edit Vehicle Model', { exact: true })
    ).toBeVisible({ timeout: 10000 });


    // Update the model details
    const updatedModelName = `${createdModelName}_Updated`;
    const updatedVariantName = `${createdVariantName}_Updated`;

    await page.getByPlaceholder(/swift, city, i20/i)
        .fill(updatedModelName);

    await page.getByPlaceholder(/lxi, vxi, zxi, petrol, diesel/i)
        .fill(updatedVariantName);

    await page.getByPlaceholder(/2020, 2021, 2022/i)
        .fill('2025, 2026');

    // Save changes
    await page.getByRole('button', { name: /save changes/i }).click();

    // Verify the form closes
    await expect(
        page.getByRole('heading', { name: /edit vehicle model/i })
    ).toHaveCount(0);

    // Verify the updated model name
    await expect(
        page.getByText(updatedModelName, { exact: false }).first()
    ).toBeVisible();
});


// test('MODEL-004 - Delete the created model', async ({ page }) => {
//     // Select the category
//     const categoryDropdown = page.getByRole('combobox').nth(0);
//     await categoryDropdown.selectOption({ label: categoryName });

//     // Select the brand
//     const brandDropdown = page.getByRole('combobox').nth(1);
//     await brandDropdown.selectOption({ label: brandName });

//     // Find the model created in MODEL-002
//     const model = page.getByText(createdModelName, { exact: false }).first();
//     await expect(model).toBeVisible();

//     // Locate the model card and reveal its action buttons
//     const modelCard = model.locator('..').locator('..');
//     // Hover over the model card to reveal action buttons
//     await modelCard.hover();

//     const actionButtons = modelCard.getByRole('button');

//     // Confirm both Edit and Delete buttons are available
//     await expect(actionButtons).toHaveCount(2);

//     // The second button is Delete
//     const deleteButton = actionButtons.nth(1);
//     await expect(deleteButton).toBeVisible();
//     await deleteButton.click();

//     // Verify the delete confirmation popup
//     await expect(
//         page.getByText(/delete.*model/i).first()
//     ).toBeVisible();

//     // Confirm deletion
//     const confirmDeleteButton = page.getByRole('button', {
//         name: /^delete$/i,
//     }).last();

//     await expect(confirmDeleteButton).toBeVisible();
//     await confirmDeleteButton.click();

//     // Verify the original model no longer exists
//     await expect(
//         page.getByText(createdModelName, { exact: false })
//     ).toHaveCount(0);
// });
});
