import { test, expect } from '@playwright/test';

test.describe.serial('Admin Variants Tests', () => {
    const categoryName = 'Van';
    const brandName = 'Automationbrand_1793090406608_updated';
    const modelName = 'Automationmodel_1793168538228_updated';

    let createdVariantName = '';

    test.beforeEach(async ({ page }) => {
        await page.goto('/');

        await page.locator('input[type="email"]')
            .fill(process.env.ADMIN_EMAIL!);

        await page.locator('input[type="password"]')
            .fill(process.env.ADMIN_PASSWORD!);

        await page.getByRole('button', { name: /sign in/i }).click();
        await expect(page).toHaveURL(/dashboard/i);

        await page.getByRole('link', { name: /catalog/i }).click();
        await page.getByText('Variants', { exact: true }).first().click();
    });

    test('VARIANT-001 - Select category, brand and model', async ({ page }) => {
    // Select category
    const categoryDropdown = page.getByRole('combobox').nth(0);
    await categoryDropdown.selectOption({ label: categoryName });

    // Select brand
    const brandDropdown = page.getByRole('combobox').nth(1);
    await expect(brandDropdown).toContainText(brandName);
    await brandDropdown.selectOption({ label: brandName });

    // Select model
    const modelDropdown = page.getByRole('combobox').nth(2);
    await expect(modelDropdown).toBeEnabled();

    console.log(
        'Available models:',
        await modelDropdown.locator('option').allTextContents()
    );

    await modelDropdown.selectOption({ label: modelName });

    // Verify selected model
    const selectedModelValue = await modelDropdown
        .locator('option')
        .filter({ hasText: modelName })
        .getAttribute('value');

    await expect(modelDropdown).toHaveValue(selectedModelValue!);

    // Verify Add Variant button
    await expect(
        page.getByRole('button', { name: /add variant/i })
    ).toBeVisible();
});

    test('VARIANT-002 - Add a new variant', async ({ page }) => {
        const categoryDropdown = page.getByRole('combobox').nth(0);
        await categoryDropdown.selectOption({ label: categoryName });

        const brandDropdown = page.getByRole('combobox').nth(1);
        await brandDropdown.selectOption({ label: brandName });

        const modelDropdown = page.getByRole('combobox').nth(2);
        await modelDropdown.selectOption({ label: modelName });

        await page.getByRole('button', { name: /add variant/i }).click();

        await expect(
            page.getByRole('heading', { name: /add variant/i })
        ).toBeVisible();

        createdVariantName = `AutomationVariant_${Date.now()}`;

        await page.getByPlaceholder(/lxi, vxi, zxi, petrol, diesel/i)
            .fill(createdVariantName);

        await page.getByPlaceholder(/2020, 2021, 2022/i)
            .fill('2025, 2026');

        await page.getByRole('button', { name: /^add variant$/i }).last().click();

        await expect(
            page.getByRole('heading', { name: /add variant/i })
        ).toHaveCount(0);

        // Verify variant was created
        await page.waitForTimeout(1000);

        console.log('Variant name:', createdVariantName);
        console.log(
            'Variant count:',
            await page.getByText(createdVariantName, { exact: true }).count()
        );
        console.log('Current page URL:', page.url());

        console.log(
            'Visible page content:',
            (await page.locator('body').innerText()).slice(-2000)
        );

        await page.screenshot({
            path: 'test-results/variant-after-add.png',
            fullPage: true,
        });
    });


    test('VARIANT-003 - Edit the created variant', async ({ page }) => {
        // Step 1: Select category
        const categoryDropdown = page.getByRole('combobox').nth(0);
        await categoryDropdown.selectOption({ label: categoryName });

        // Step 2: Select brand
        const brandDropdown = page.getByRole('combobox').nth(1);
        await expect(brandDropdown).toContainText(brandName);
        await brandDropdown.selectOption({ label: brandName });

        // Step 3: Select model
        const modelDropdown = page.getByRole('combobox').nth(2);
        await expect(modelDropdown).toContainText(modelName);
        await modelDropdown.selectOption({ label: modelName });

        // Step 4: Verify the variant name from VARIANT-002
        console.log('Created variant name:', createdVariantName);

        // Use partial text matching in case the UI renders the name inside a label
        const variant = page.getByText(createdVariantName, { exact: false }).first();

        await expect(variant).toBeVisible({ timeout: 10000 });

        // Step 5: Locate the variant card
        // Step 5: Locate the variant card containing the variant name
        const variantCard = page
            .locator('div.group')
            .filter({ hasText: createdVariantName })
            .last();

        // Step 6: Hover over the card to reveal Edit/Delete icons
        await variantCard.hover();

        // Step 7: Locate the Edit button using the pencil icon
        const editButton = variantCard.locator('button').filter({
            has: page.locator('svg.lucide-pencil'),
        }).first();

        console.log('Variant card count:', await variantCard.count());
        console.log('Buttons inside card:', await variantCard.locator('button').count());

        await expect(editButton).toBeVisible({ timeout: 10000 });
        await editButton.click();

        console.log('Variant cards found:', await variantCard.count());
        console.log('Buttons found:', await variantCard.locator('button').count());

        // Step 8: Verify Edit Variant form opens
        await expect(
            page.getByRole('heading', { name: /edit variant/i })
        ).toBeVisible();

        // Step 9: Update variant name
        const updatedVariantName = `${createdVariantName}_Updated`;

        await page.getByPlaceholder(/lxi, vxi, zxi, petrol, diesel/i)
            .fill(updatedVariantName);

        // Step 10: Update years
        await page.getByPlaceholder(/2020, 2021, 2022/i)
            .fill('2026, 2027');

        // Step 11: Save changes
        await page.getByRole('button', { name: /save changes/i }).click();

        // Step 12: Verify the edit form closes
        await expect(
            page.getByRole('heading', { name: /edit variant/i })
        ).toHaveCount(0);

        // Step 13: Verify updated variant appears
        await expect(
            page.getByText(updatedVariantName, { exact: false }).first()
        ).toBeVisible({ timeout: 10000 });

        console.log('Variant updated successfully:', updatedVariantName);
    });

});
