import { test, expect } from '@playwright/test';


let createdBrandName = '';
let updatedBrandName = '';


test.describe.serial('Admin Brands Tests', () => {

    test.beforeEach(async ({ page }) => {

        // Step 1: Open the login page
        await page.goto('/');

        // Step 2: Login as Admin
        await page.locator('input[type="email"]')
            .fill(process.env.ADMIN_EMAIL!);

        await page.locator('input[type="password"]')
            .fill(process.env.ADMIN_PASSWORD!);

        await page.getByRole('button', { name: /sign in/i }).click();

        // Step 3: Verify successful login
        await expect(page).toHaveURL(/dashboard/i);

        // Step 4: Navigate to Catalog
        await page.getByRole('link', { name: /catalog/i }).click();

        await expect(page).toHaveURL(/\/admin\/catalog/i);
    });

    test('BRAND-001 - Navigate to Brands tab successfully', async ({ page }) => {

        // Step 1: Click Brands tab
        await page.getByText('Brands', { exact: true }).first().click();

        // Step 2: Verify Brands tab is visible
        await expect(
            page.getByText('Brands', { exact: true }).first()
        ).toBeVisible();

        // Step 3: Capture screenshot
        await page.screenshot({
            path: 'test-results/brands-page.png',
            fullPage: true,
        });
    });


    test('BRAND-002 - Select Updated category in Brands tab', async ({ page }) => {

        // Step 1: Open Brands tab
        await page.getByText('Brands', { exact: true }).first().click();

        // Step 2: Locate the category dropdown
        const categoryDropdown = page.getByRole('combobox').first();

        await expect(categoryDropdown).toBeVisible();

        // Step 3: Verify Updated category is available
        await expect(categoryDropdown).toContainText(
            'Van'
        );

        // Step 4: Select Updated category
        await categoryDropdown.selectOption({
            label: 'Van',
        });

        // Step 5: Verify category selection
        await expect(categoryDropdown).toHaveValue(
            '6adef10b63d4cd7411e93995'
        );

        // Step 6: Capture screenshot
        await page.screenshot({
            path: 'test-results/brands-updated-category.png',
            fullPage: true,
        });
    });

    
test('BRAND-003 - Add a new brand under Updated category', async ({ page }) => {

    // Step 1: Open Brands tab
    await page.getByText('Brands', { exact: true }).first().click();

    // Step 2: Select Updated category
    const categoryDropdown = page.getByRole('combobox').first();

    await categoryDropdown.selectOption({
        label: 'Van',
    });

    await expect(categoryDropdown).toHaveValue(
        '6adef10b63d4cd7411e93995'
    );

    // Step 3: Open Add Brand form
    await page.getByRole('button', { name: /add brand/i }).click();

    await expect(
        page.getByRole('heading', { name: /add brand/i })
    ).toBeVisible();

    // Step 4: Enter a unique brand name
    createdBrandName = `AutomationBrand_${Date.now()}`;

    await page.getByPlaceholder(
        /maruti suzuki, honda, hyundai/i
    ).fill(createdBrandName);

    // Step 5: Add the brand
    await page.getByRole('button', { name: /^add$/i }).click();

    await page.reload();

    await page.getByText('Brands', { exact: true }).first().click();

    await categoryDropdown.selectOption({
        label: 'Van',
    });

    // Step 6: Verify the form closes
    await expect(
        page.getByRole('heading', { name: /add brand/i })
    ).toHaveCount(0);

    // Step 7: Verify the brand appears under the selected category
    
await page.waitForTimeout(1500);

console.log('Brand name:', createdBrandName);
console.log('Selected category:', await categoryDropdown.inputValue());

console.log(
    'Brand found:',
    await page.getByText(createdBrandName, { exact: false }).count()
);

await expect(
    page.getByText(createdBrandName, { exact: false })
).toBeVisible({ timeout: 10000 });

console.log(
    'Page content:',
    (await page.locator('body').innerText()).slice(-3000)
);

await page.screenshot({
    path: 'test-results/brand-after-add-debug.png',
    fullPage: true,
});

});

    


test('BRAND-004 - Edit the brand created in BRAND-003', async ({ page }) => {

    // Step 1: Open Brands tab
    await page.getByText('Brands', { exact: true }).first().click();

    // Step 2: Select Updated category
    const categoryDropdown = page.getByRole('combobox').first();

    await categoryDropdown.selectOption({
        label: 'Van',
    });

    // Step 3: Find the brand created in BRAND-003
    expect(createdBrandName).not.toBe('');

    const brand = page.getByText(createdBrandName, { exact: false });
    await expect(brand).toBeVisible();

    // Step 4: Hover over the brand card to reveal its actions
    
    
    // Step 4: Locate and hover over the brand card
    const brandCard = brand.locator('..');
    await brandCard.hover();

    // Step 5: Find buttons inside the brand card
    const cardButtons = brandCard.getByRole('button');

    await expect(cardButtons.first()).toBeVisible();

    // Step 6: Click the first action button
    await cardButtons.first().click();

    // Step 7: Check whether the Edit Brand form opened
    await expect(
        page.getByRole('heading', { name: /edit brand/i })
    ).toBeVisible();


    // Step 7: Enter updated brand name
    updatedBrandName = `${createdBrandName}_Updated`;

    const brandNameInput = page.getByPlaceholder(
        /maruti suzuki, honda, hyundai/i
    );

    await brandNameInput.fill(updatedBrandName);

    // Step 8: Save changes
    await page.getByRole('button', { name: /update|save changes/i }).click();

    // Step 9: Verify updated name appears
    await expect(
        page.getByText(updatedBrandName, { exact: false })
    ).toBeVisible();

    // Step 10: Verify old name no longer appears
    await expect(
        page.getByText(createdBrandName, { exact: true })
    ).toHaveCount(0);
});


// test('BRAND-005 - Delete the updated brand', async ({ page }) => {

//     // Step 1: Open Brands tab
//     await page.getByText('Brands', { exact: true }).first().click();

//     // Step 2: Select Updated category
//     const categoryDropdown = page.getByRole('combobox').first();

//     await categoryDropdown.selectOption({
//         label: 'Van',
//     });

//     // Step 3: Find the brand updated in BRAND-004
//     expect(updatedBrandName).not.toBe('');

//     const brand = page.getByText(updatedBrandName, { exact: false });
//     await expect(brand).toBeVisible();

//     // Step 4: Hover over the brand card
//     const brandCard = brand.locator('..');
//     await brandCard.hover();

//     // Step 5: Locate the delete action
//     const cardButtons = brandCard.getByRole('button');

//     // Delete is often the second action button; verify before clicking
//     await expect(cardButtons.nth(1)).toBeVisible();

//     // Step 6: Click Delete
   
//     // Step 6: Click the Delete button
//     await cardButtons.nth(1).click();

//     // Step 7: Handle the delete confirmation popup
   
//     // Step 7: Wait for the delete confirmation button
//     const confirmDeleteButton = page.getByRole('button', {
//         name: /confirm delete|yes, delete|delete|confirm/i,
//     }).last();

//     await expect(confirmDeleteButton).toBeVisible();

//     // Step 8: Confirm deletion
//     await confirmDeleteButton.click();

//     // Step 9: Verify the updated brand is removed
//     await expect(
//         page.getByText(updatedBrandName, { exact: true })
//     ).toHaveCount(0);

// });
});
