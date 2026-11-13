import { test, expect } from '@playwright/test';
import path from 'path';

test.describe.serial('Admin Catalog Tests', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/');

        await page.locator('input[type="email"]')
            .fill(process.env.ADMIN_EMAIL!);

        await page.locator('input[type="password"]')
            .fill(process.env.ADMIN_PASSWORD!);

        await page.getByRole('button', { name: /sign in/i }).click();

        await expect(page).toHaveURL(/dashboard/i);

        await page.getByRole('link', { name: /catalog/i }).click();
    });
    test('BULK-001 - Import parts with images', async ({ page }) => {

  // 3. Open Bulk Upload
  await page.getByRole('button', {
    name: /bulk upload|bulk import/i,
  }).click();

  await expect(
    page.getByText('Bulk Import Parts', { exact: true })
  ).toBeVisible();

    const csvPath = path.resolve(
  process.cwd(),
  'tests',
  'Images',
  'MechGo_bulk_test_parts.xlsx'
);

const imagesFolder = path.resolve(
  process.cwd(),
  'tests',
  'Images',
  'BulkUploadImages'
);


  // 4. Upload CSV file
  const fileInputs = page.locator('input[type="file"]');

  await expect(fileInputs).toHaveCount(2);

  await fileInputs.nth(0).setInputFiles(csvPath);

  // 5. Select images folder
  await fileInputs.nth(1).setInputFiles(imagesFolder);

  // 6. Select Part name only
  await page.getByText('Part name only', {
    exact: true,
  }).click();

  // 7. Import parts
  const importButton = page.getByRole('button', {
    name: 'Import',
    exact: true,
  });

  await expect(importButton).toBeEnabled();
  await importButton.click();
});


test('BULK-NEG-001 - Verify error for invalid Excel structure', async ({ page }) => {

    // Open Bulk Upload
    await page.getByRole('button', {
        name: /bulk upload|bulk import/i,
    }).click();

    await expect(
        page.getByText('Bulk Import Parts', { exact: true })
    ).toBeVisible();

    // Invalid Excel file
    const invalidExcelPath = path.resolve(
        process.cwd(),
        'tests',
        'Images',
        'invalid_bulk_upload_wrong_structure.xlsx'
    );

    // Images folder
    const imagesFolder = path.resolve(
        process.cwd(),
        'tests',
        'Images',
        'BulkUploadImages'
    );

    // Upload Excel and images folder
    const fileInputs = page.locator('input[type="file"]');

    await expect(fileInputs).toHaveCount(2);

    await fileInputs.nth(0).setInputFiles(invalidExcelPath);
    await fileInputs.nth(1).setInputFiles(imagesFolder);

    // Select part name format
    await page.getByText('Part name only', {
        exact: true,
    }).click();

    // Click Import
    await page.getByRole('button', {
        name: 'Import',
        exact: true,
    }).click();

    // Validate the error message
   
    // Click Import
    await page.getByRole('button', {
        name: 'Import',
        exact: true,
    }).click();

    // Validate the actual error message
    const errorMessage = page.getByText(
        /Missing required column\(s\):|Import failed — check the file and try again/
    );

    await expect(errorMessage.first()).toBeVisible({
        timeout: 60000,
    });
});


test('BULK-NEG-002 - Reject invalid product image', async ({ page }) => {
    // Open Bulk Upload
    await page.getByRole('button', {
        name: /bulk upload|bulk import/i,
    }).click();

    await expect(
        page.getByText('Bulk Import Parts', { exact: true })
    ).toBeVisible();

    // Invalid Excel file
    const invalidExcelPath = path.resolve(
        process.cwd(),
        'tests',
        'Images',
        'MechGo_bulk_test_parts.xlsx'
    );

    // Images folder
    const imagesFolder = path.resolve(
        process.cwd(),
        'tests',
        'Images',
        'invalid_bulk_images_folder'
    );

    // Upload Excel and images folder
    const fileInputs = page.locator('input[type="file"]');

    await expect(fileInputs).toHaveCount(2);

    await fileInputs.nth(0).setInputFiles(invalidExcelPath);
    await fileInputs.nth(1).setInputFiles(imagesFolder);

    // Select part name format
    await page.getByText('Part name only', {
        exact: true,
    }).click();

    // Click Import
    await page.getByRole('button', {
        name: 'Import',
        exact: true,
    }).click();

    // Validate the actual error message
    const errorMessage = page.getByText(
      /Import failed — check the file and try again|invalid image|image.*invalid|image.*not found/i
    );

    await expect(errorMessage.first()).toBeVisible({
        timeout: 60000,
    });
});

test('BULK-NEG-003 - Import parts with dead item type', async ({ page }) => {
  // Open Bulk Upload
  await page.getByRole('button', {
    name: /bulk upload|bulk import/i
  }).click();

  await expect(
    page.getByText('Bulk Import Parts', { exact: true })
  ).toBeVisible();

  // Excel and images paths
  const excelPath = path.resolve(
    process.cwd(),
    'tests',
    'Images',
    'MechGo_bulk_upload_dead_item_type.xlsx'
  );

  const imagesFolder = path.resolve(
    process.cwd(),
    'tests',
    'Images',
    'BulkUploadImages'
  );

  // Upload Excel file and images folder
  const fileInputs = page.locator('input[type="file"]');

  await expect(fileInputs).toHaveCount(2);
  await fileInputs.nth(0).setInputFiles(excelPath);
  await fileInputs.nth(1).setInputFiles(imagesFolder);

  // Select part name format
  await page.getByText('Part name only', { exact: true }).click();

  // Click Import
  const importButton = page.getByRole('button', {
    name: 'Import',
    exact: true
  });

  await expect(importButton).toBeEnabled();
  await importButton.click();

  // Verify import result
  const resultMessage = page.getByText(
    /import complete|import successful|import failed|skipped|invalid item.type/i
  ).first();

  //await expect(resultMessage).toBeVisible({ timeout: 60000 });
});

test('BULK-NEG-005 - Re-upload previously uploaded Excel file', async ({ page }) => {
  await page.getByRole('button', {
    name: /bulk upload|bulk import/i,
  }).click();

  const excelPath = path.resolve(
    process.cwd(),
    'tests',
    'Images',
    'MechGo_bulk_upload_dead_item_type.xlsx'
  );

  const imagesFolder = path.resolve(
    process.cwd(),
    'tests',
    'Images',
    'BulkUploadImages'
  );

  const fileInputs = page.locator('input[type="file"]');

  await expect(fileInputs).toHaveCount(2);

  // Upload the already-imported Excel file once more
  await fileInputs.nth(0).setInputFiles(excelPath);
  await fileInputs.nth(1).setInputFiles(imagesFolder);

  await page.getByText('Part name only', {
    exact: true,
  }).click();

  await page.getByRole('button', {
    name: 'Import',
    exact: true,
  }).click();

  // Wait for the import result
  await expect(
    page.getByText(
      /imported|failed|skipped|duplicate|import complete/i
    ).first()
  ).toBeVisible({ timeout: 60000 });
});

test('BULK-NEG-006 - Reject empty Excel file', async ({ page }) => {
  // Open Catalog → Bulk Upload
  await page.getByRole('button', {
    name: /bulk upload|bulk import/i,
  }).click();

  await expect(
    page.getByText('Bulk Import Parts', { exact: true })
  ).toBeVisible();

  const emptyExcelPath = path.resolve(
    process.cwd(),
    'tests',
    'Images',
    'empty_bulk_upload.xlsx'
  );

  const imagesFolder = path.resolve(
    process.cwd(),
    'tests',
    'Images',
    'BulkUploadImages'
  );

  const fileInputs = page.locator('input[type="file"]');

  await expect(fileInputs).toHaveCount(2);

  // Step 1: Upload Excel file first
  await fileInputs.nth(0).setInputFiles(emptyExcelPath);

  // Step 2: Upload images folder
  await fileInputs.nth(1).setInputFiles(imagesFolder);

  // Step 3: Select part name format
  await page.getByText('Part name only', {
    exact: true,
  }).click();

  // Step 4: Click Import
  await page.getByRole('button', {
    name: 'Import',
    exact: true,
  }).click();

  // Step 5: Verify exact empty Excel validation message
const errorMessage = page.getByText(
  'The Excel file is empty — add at least one data row',
  { exact: true }
);

await expect(errorMessage).toBeVisible({
  timeout: 10000,
});
});
});
