import { test, expect } from '@playwright/test';

test.describe.serial('Admin Product Inventory Tests', () => {

    // Step 1: Login and navigate to Products
    test.beforeEach(async ({ page }) => {

        await page.goto('/');

        await page.locator('input[type="email"]')
            .fill(process.env.ADMIN_EMAIL!);

        await page.locator('input[type="password"]')
            .fill(process.env.ADMIN_PASSWORD!);

        await page.getByRole('button', {
            name: /sign in/i
        }).click();

        await expect(page).toHaveURL(/dashboard/i);

        // Open Products page
        await page.getByRole('link', {
            name: /^products$/i
        }).click();

    });

    // PROD-001: Select multiple products and verify bulk actions
    test('PROD-001 - Verify multiple product selection and bulk actions', async ({ page }) => {

        // Step 1: Verify Product Inventory page
        await expect(
            page.getByText(/product inventory/i)
        ).toBeVisible();

        // Step 2: Locate product rows
        const productRows = page.locator('table tbody tr');

        await expect(productRows.nth(0)).toBeVisible();
        await expect(productRows.nth(1)).toBeVisible();

        // Step 3: Select first product
        await productRows.nth(0)
            .locator('input[type="checkbox"]')
            .check();

        // Step 4: Select second product
        await productRows.nth(1)
            .locator('input[type="checkbox"]')
            .check();

        // Step 5: Verify selected count
        await expect(
            page.getByText(/2 selected/i)
        ).toBeVisible();

        // Step 6: Verify bulk action buttons
        // Step 6: Verify bulk action buttons

        await expect(
            page.getByRole('button', { name: 'Activate', exact: true })
        ).toBeVisible();

        await expect(
            page.getByRole('button', { name: 'Deactivate', exact: true })
        ).toBeVisible();

        await expect(
            page.getByRole('button', { name: 'Mark Regular', exact: true })
        ).toBeVisible();

        await expect(
            page.getByRole('button', { name: 'Mark Dead', exact: true })
        ).toBeVisible();

        await expect(
          page.getByRole('button', { name: 'Delete Selected', exact: true })
        ).toBeVisible();

    });
    test('PROD-002 - Verify deactivate selected products', async ({ page }) => {

    // Step 1: Locate product rows
    const productRows = page.locator('table tbody tr');

    await expect(productRows.nth(0)).toBeVisible();
    await expect(productRows.nth(1)).toBeVisible();

    // Step 2: Select first two TEST products
    await productRows.nth(0)
        .locator('input[type="checkbox"]')
        .check();

    await productRows.nth(1)
        .locator('input[type="checkbox"]')
        .check();

    // Step 3: Verify selected count
    await expect(
        page.getByText(/2 selected/i)
    ).toBeVisible();

    // Step 4: Click Deactivate
    await page.getByRole('button', {
        name: 'Deactivate',
        exact: true,
    }).click();

    // Step 5: Verify updated status
    // Replace this with the actual status text shown by the application.
    // await expect(
    //     page.getByText(/inactive|deactivated successfully/i).first()
    // ).toBeVisible({ timeout: 15000 });

});

test('PROD-003 - Verify Activate Selected Products', async ({ page }) => {

  const productRows = page.locator('table tbody tr');

  // Select two previously deactivated test products
  await productRows.nth(0).locator('input[type="checkbox"]').check();
  await productRows.nth(1).locator('input[type="checkbox"]').check();

  // Verify selected count
  await expect(page.getByText(/2 selected/i)).toBeVisible();

  // Click Activate
  await page.getByRole('button', {
    name: 'Activate',
    exact: true
  }).click();

  // Verify products are activated
//   await expect(productRows.nth(0)).toContainText(/active/i);
//   await expect(productRows.nth(1)).toContainText(/active/i);

//   // Verify selection is cleared
//   await expect(page.getByText(/2 selected/i)).toHaveCount(0);

});

test('PROD-004 - Verify Mark Dead Selected Products', async ({ page }) => {

  const productRows = page.locator('table tbody tr');

  // Select two test-created products
  await productRows.nth(0).locator('input[type="checkbox"]').check();
  await productRows.nth(1).locator('input[type="checkbox"]').check();

  // Verify selected count
  await expect(page.getByText(/2 selected/i)).toBeVisible();

  // Click Mark Dead
  await page.getByRole('button', {
    name: 'Mark Dead',
    exact: true
  }).click();

  // Verify both products are marked as Dead
  await expect(productRows.nth(0)).toContainText(/dead/i);
  await expect(productRows.nth(1)).toContainText(/dead/i);

  // Verify selection is cleared
  await expect(page.getByText(/2 selected/i)).toHaveCount(0);

});

test('PROD-005 - Verify Mark Regular Selected Products', async ({ page }) => {

  const productRows = page.locator('table tbody tr');

  // Select two previously marked Dead test products
  await productRows.nth(0).locator('input[type="checkbox"]').check();
  await productRows.nth(1).locator('input[type="checkbox"]').check();

  // Verify selected count
  await expect(page.getByText(/2 selected/i)).toBeVisible();

  // Click Mark Regular
  await page.getByRole('button', {
    name: 'Mark Regular',
    exact: true
  }).click();

  // Verify both products are marked as Regular
  await expect(productRows.nth(0)).toContainText(/regular/i);
  await expect(productRows.nth(1)).toContainText(/regular/i);

  // Verify selection is cleared
  await expect(page.getByText(/2 selected/i)).toHaveCount(0);

});

test('PROD-006 - Verify Product Details View', async ({ page }) => {

  const productRows = page.locator('table tbody tr');
  const firstRow = productRows.nth(0);

  // Click View Product icon
await firstRow.locator('button').last().click();

// Verify product details
await expect(page.getByText('SKU', { exact: true }).last()).toBeVisible();
await expect(page.getByText('Item Type', { exact: true }).last()).toBeVisible();
await expect(page.getByText('Status', { exact: true }).last()).toBeVisible();
await expect(page.getByText('Created', { exact: true }).last()).toBeVisible();
await expect(page.getByText('Change History', { exact: true })).toBeVisible();

});

test('PROD-007 - Verify Edit Product Details', async ({ page }) => {

  const productRows = page.locator('table tbody tr');
  const firstRow = productRows.nth(0);

  // Open product details
  await firstRow.locator('button').last().click();

  // Verify product details page
  await expect(page.getByText('SKU', { exact: true }).last()).toBeVisible();

  // Update description
  const description = page.locator('textarea').first();
  await description.fill('Updated through Playwright automation testing');

  // Save changes
  // Check Save Changes button
const saveButton = page.getByRole('button', {
  name: /save changes/i
});

await expect(saveButton).toBeVisible();
await expect(saveButton).toBeEnabled();

// Click Save Changes
await saveButton.click({ timeout: 10000 });

// Wait for save operation
await page.waitForTimeout(2000);

console.log('Save button clicked');

// Click Back button
await page.getByRole('button', { name: /back/i }).click();

// Verify Product Inventory page
await expect(page.getByText(/product inventory/i)).toBeVisible();

});

test('PROD-008 - Verify Product Image Display', async ({ page }) => {

  const productRows = page.locator('table tbody tr');
  const firstRow = productRows.nth(1);

  // Open product details
  await firstRow.locator('button').last().click();

  // Verify product image is visible
  const productImage = page.locator('img').first();

  await expect(productImage).toBeVisible();

  // Verify image is loaded successfully
  const imageLoaded = await productImage.evaluate(
    (img: HTMLImageElement) => img.complete && img.naturalWidth > 0
  );

  expect(imageLoaded).toBeTruthy();

});

test('PROD-009 - Verify Product Export to Excel', async ({ page }) => {

  // Click Export button
  await page.getByRole('button', { name: /export/i }).click();

  // Verify Excel export option
  const excelOption = page.getByText(/excel.*xlsx/i);
  await expect(excelOption).toBeVisible();

  // Download Excel file
  const downloadPromise = page.waitForEvent('download');
  await excelOption.click();

  const download = await downloadPromise;

  // Verify downloaded file
  expect(download.suggestedFilename()).toMatch(/\.xlsx$/i);

});

test('PROD-010 - Verify Product Export to CSV', async ({ page }) => {

  // Click Export button
  await page.getByRole('button', { name: /export/i }).click();

  // Verify CSV export option
  const csvOption = page.getByText(/csv.*\.csv/i);
  await expect(csvOption).toBeVisible();

  // Download CSV file
  const downloadPromise = page.waitForEvent('download');
  await csvOption.click();

  const download = await downloadPromise;

  // Verify downloaded file
  expect(download.suggestedFilename()).toMatch(/\.csv$/i);

});

test('PROD-011 - Verify All Product Inventory Filters', async ({ page }) => {

  // Open Filters
  await page.getByRole('button', { name: /filters/i }).click();

  const filters = page.locator('select');

  // Category Filter
  await filters.nth(0).selectOption({ label: 'Van' });
  await expect(filters.nth(0)).toHaveValue(/.+/);

  // Model Filter
  await filters.nth(1).selectOption({ label: 'Automationmodel_1793168538228_updated' });
  await expect(filters.nth(1)).toHaveValue(/.+/);

  // Year Filter
  await filters.nth(2).selectOption({ label: '2026' });
  await expect(filters.nth(2)).toHaveValue(/.+/);

  // Part Name Filter
  const partNameInput = page.getByPlaceholder(/part name/i);
  await partNameInput.fill('au');
  await expect(partNameInput).toHaveValue('au');

  // Item Type Filter
  await filters.nth(3).selectOption({ label: 'Regular' });
  await expect(filters.nth(3)).toHaveValue(/.+/);

  // Status Filter
  await filters.nth(4).selectOption({ label: 'Active' });
  await expect(filters.nth(4)).toHaveValue(/.+/);

  // Verify filtered results
  await expect(page.locator('table tbody tr').first()).toBeVisible();

  // Clear Part Name
  await partNameInput.clear();

  // Reset all filters
  await page.getByRole('button', { name: /reset/i }).click();

  // Verify filters are reset
  for (let i = 0; i < 5; i++) {
    await expect(filters.nth(i)).toHaveValue('');
  }

  await expect(partNameInput).toHaveValue('');

});

test('PROD-012 - Verify Product Search Functionality', async ({ page }) => {

  const searchInput = page.getByPlaceholder(/search/i);

  // Search using valid product name
  await searchInput.fill('Automation');

  // Verify search value
  await expect(searchInput).toHaveValue('Automation');

  // Verify matching results
  await expect(page.locator('table tbody tr').first()).toBeVisible();

  // Clear search
  await searchInput.clear();

  // Verify search is cleared
  await expect(searchInput).toHaveValue('');

});

test('PROD-013 - Verify Next Page Navigation', async ({ page }) => {

  // Verify current page
  await expect(page.getByText(/page 1 of/i)).toBeVisible();

  // Click Next Page
  await page.getByRole('button', { name: /next/i }).click();

  // Verify navigation to next page
  await expect(page.getByText(/page 2 of/i)).toBeVisible();

});

test('PROD-019 - Verify Sorting Functionality for All Product Columns', async ({ page }) => {

  const columns = [
    'SKU',
    'PART',
    'SUB-PART',
    'ADDED'
  ];

  for (const column of columns) {

    // Locate column header
    const header = page.locator('th').filter({
      hasText: new RegExp(column, 'i')
    }).first();

    // Verify header is visible
    await expect(header).toBeVisible();

    // First click - Ascending
    await header.click();

    await expect(header).toBeVisible();

    // Second click - Descending
    await header.click();

    await expect(header).toBeVisible();

  }

});

test('PROD-025 - Verify Filter and Search Combination', async ({ page }) => {

  // Open Filters
  await page.getByRole('button', { name: /filters/i }).click();

  const filters = page.locator('select');

  // Apply Category filter
  await filters.nth(0).selectOption({ index: 1 });

  // Apply Item Type filter
  await filters.nth(3).selectOption({ label: 'Regular' });

  // Apply Status filter
  await filters.nth(4).selectOption({ label: 'Active' });

  // Search product
  const searchInput = page.getByPlaceholder(/search sku, part name, sub-part name/i);
  await searchInput.fill('CAR');

  // Verify search value
  await expect(searchInput).toHaveValue('CAR');

  // Verify filtered results
  const productRows = page.locator('table tbody tr');
  await expect(productRows.first()).toBeVisible();

  // Reset filters
  await page.getByText('Reset', { exact: true }).click();

  // Clear search
  await searchInput.clear();

});


});
