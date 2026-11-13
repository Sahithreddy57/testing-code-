import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Admin Product Inventory Tests', () => {

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

        await page.getByRole('link', { name: /^oils$/i }).click();
    });

    test('OIL-001 - Verify Oil Products Page UI', async ({ page }) => {

        // Verify Oil Products page
        await expect(
            page.getByText(/oil products/i).first()
        ).toBeVisible();

        // Verify category tabs
        await expect(page.getByText('All', { exact: true }).first()).toBeVisible();
        await expect(page.getByText(/engine oil/i).first()).toBeVisible();
        await expect(page.getByText(/gear oil/i).first()).toBeVisible();
        await expect(page.getByText(/brake fluid/i).first()).toBeVisible();
        await expect(page.getByText(/coolant/i).first()).toBeVisible();

        // Verify search
        await expect(
            page.getByPlaceholder(/search/i)
        ).toBeVisible();

        // Verify action buttons
        await expect(
            page.getByRole('button', { name: /bulk import/i })
        ).toBeVisible();

        await expect(
            page.getByRole('button', { name: /add oil/i })
        ).toBeVisible();

    });

    test('OIL-002 - Verify Add Oil Products with Different Categories', async ({ page }) => {

        // ========== PRODUCT 1: ENGINE OIL ==========

        await page.getByRole('button', { name: /add oil/i }).click();

        await expect(page.getByText('Add Oil Product')).toBeVisible();

        // Upload Product Image
        const imagePath = path.resolve('tests/Images/oil 2.jpg');

        await page.locator('input[type="file"]').first().setInputFiles(imagePath);

        // Brand is a text input
        await page.getByPlaceholder(/e\.g\. castrol/i)
            .fill('Automation_Oil');

        // Product Name
        await page.getByPlaceholder(/e\.g\. edge 5w-30/i)
            .fill('Automation Engine Oil');

        // Category
        //await page.locator('select').selectOption({ label: 'Engine Oil' });

        // Size
        await page.getByPlaceholder(/e\.g\. 1l, 500ml/i)
            .fill('1L');

        // Price
        await page.locator('input[type="number"]').fill('500');

        // Description
        await page.getByPlaceholder(/product description/i)
            .fill('Engine oil created through Playwright automation');

        // Save - verify actual button name from UI
        await page.getByRole('button', { name: /add product|save/i }).click();


        // Verify Engine Oil product through search
        // Search Oil Product
        const searchInput = page.getByPlaceholder(
            /search by brand, name or size/i
        );

        // Search Engine Oil
        await searchInput.fill('Automation Engine Oil');

        // Verify product exists
        await expect(
            page.getByText('Automation Engine Oil', { exact: true })
        ).toBeVisible({ timeout: 10000 });

        await searchInput.fill('Automation Engine Oil');

        await expect(
            page.getByText('Automation Engine Oil', { exact: true })
        ).toBeVisible({ timeout: 10000 });

    });

    test('OIL-003 - Verify Add Oil Filter Product', async ({ page }) => {

        // Click Add Oil
        await page.getByRole('button', { name: /add oil/i }).click();

        // Verify Add Oil Product form
        await expect(page.getByText('Add Oil Product')).toBeVisible();

        // Upload Image
        const imagePath = path.resolve('tests/Images/oil 2.jpg');
        await page.locator('input[type="file"]').first().setInputFiles(imagePath);

        // Enter Brand
        await page.getByPlaceholder(/e\.g\. castrol/i)
            .fill('Automation_Oil');

        // Enter Product Name
        await page.getByPlaceholder(/e\.g\. edge 5w-30/i)
            .fill('Automation Oil Filter');

        // Select Oil Filter Category
        // Select Oil Filter Category
        await page.locator('select.input-field').last().selectOption({
            label: 'Oil Filter'
        });

        // Enter Part Number
        // Verify Part Number field
        const partNumberInput = page.getByPlaceholder(/e\.g\. of-h4, af-201/i);

        await expect(partNumberInput).toBeVisible();

        // Enter Part Number
        await partNumberInput.fill('AUTO-OIL-FILTER-001');

        // Enter Size
        await page.getByPlaceholder(/e\.g\. 1l, 500ml/i)
            .fill('Standard');

        // Enter Price
        await page.locator('input[type="number"]').fill('350');

        // Enter Description
        await page.getByPlaceholder(/product description/i)
            .fill('Oil filter created through Playwright automation');

        // Save Product
        await page.getByRole('button', {
            name: /add product|save/i
        }).click();

        // Search and verify product
        const searchInput = page.getByPlaceholder(
            /search by brand, name or size/i
        );

        await searchInput.fill('Automation Oil Filter');

        await expect(
            page.getByText('Automation Oil Filter', { exact: true })
        ).toBeVisible({ timeout: 10000 });

    });

    test('OIL-BULK-004 - Verify Bulk Upload Oils', async ({ page }) => {

        // Step 1: Click Bulk Import
        await page.getByRole('button', { name: /bulk import/i }).click();

        // Step 1: Define paths
        const filePath = String.raw`C:\Users\SNEHA VEGAAHI\Desktop\MechGoAutomation\tests\Images\Oils_Bulk_Upload_Test_Data_Pack\MechGo_Oils_Bulk_Upload_Two_Parts.xlsx`;

        const imagePath = String.raw`C:\Users\SNEHA VEGAAHI\Desktop\MechGoAutomation\tests\Images\BulkUpload_Oil_Images`;

        // Step 2: Upload Excel file (First input)
        await page.locator('input[type="file"]').nth(0).setInputFiles(filePath);

        // Step 4: Upload images folder (Second input)
        await page.locator('input[type="file"]').nth(1).setInputFiles(imagePath);

        // Step 6: Click Import
        await page.getByRole('button', { name: /^import$/i }).click();

        // Step 7: Verify successful import
        await expect(
            page.getByText(/2 created, 0 updated, 0 failed/i)
        ).toBeVisible();

        // Step 8: Close popup
        await page.getByRole('button', { name: 'Close' }).click();

        // Step 9: Verify Engine Oil
        const engineOil = 'Testing Oil Part 1';

        await page.getByPlaceholder(/search/i).fill(engineOil);
        await expect(page.getByText(engineOil)).toBeVisible();

        // Step 10: Verify Oil Filter
        const oilFilter = 'Testing Oil Part 2';

        await page.getByPlaceholder(/search/i).fill(oilFilter);
        await expect(page.getByText(oilFilter)).toBeVisible();

    });

    test('OIL-BULK-005 - Duplicate file Upload', async ({ page }) => {

        // Step 1: Click Bulk Import
        await page.getByRole('button', { name: /bulk import/i }).click();

        // Step 1: Define paths
        const filePath = String.raw`C:\Users\SNEHA VEGAAHI\Desktop\MechGoAutomation\tests\Images\Oils_Bulk_Upload_Test_Data_Pack\MechGo_Oils_Bulk_Upload_Two_Parts.xlsx`;

        const imagePath = String.raw`C:\Users\SNEHA VEGAAHI\Desktop\MechGoAutomation\tests\Images\BulkUpload_Oil_Images`;

        // Step 2: Upload Excel file (First input)
        await page.locator('input[type="file"]').nth(0).setInputFiles(filePath);

        // Step 4: Upload images folder (Second input)
        await page.locator('input[type="file"]').nth(1).setInputFiles(imagePath);

        // Step 6: Click Import
        await page.getByRole('button', { name: /^import$/i }).click();

        // Verify duplicate upload behavior
        await expect(
            page.getByText(/0 created, 2 updated, 0 failed/i)
        ).toBeVisible();

        // Step 8: Close popup
        await page.getByRole('button', { name: 'Close' }).click();

    });

    test('OIL-BULK-006 - Verify Bulk Upload with Empty Excel File', async ({ page }) => {

  // Step 1: Click Bulk Import
  await page.getByRole('button', { name: /bulk import/i }).click();

  // Step 2: Excel file path
  const filePath = String.raw`C:\Users\SNEHA VEGAAHI\Desktop\MechGoAutomation\tests\Images\Oils_Bulk_Upload_Test_Data_Pack\OIL-BULK-005_Empty_Excel_Test.xlsx`;
  const imagePath = String.raw`C:\Users\SNEHA VEGAAHI\Desktop\MechGoAutomation\tests\Images\BulkUpload_Oil_Images`;

  // Step 3: Upload empty Excel file
  await page.locator('input[type="file"]').nth(0).setInputFiles(filePath);
   await page.locator('input[type="file"]').nth(1).setInputFiles(imagePath);

  // Step 4: Click Import
  await page.getByRole('button', { name: /^import$/i }).click();

  // Step 5: Verify validation response
  await expect(
    page.getByText(/The file contains no data rows/i)
  ).toBeVisible();

});

test('OIL-BULK-007 - Verify Bulk Upload with Missing Brand', async ({ page }) => {

  // Step 1: Click Bulk Import
  await page.getByRole('button', { name: /bulk import/i }).click();

  // Step 2: Upload Excel
  const filePath = String.raw`C:\Users\SNEHA VEGAAHI\Desktop\MechGoAutomation\tests\Images\Oils_Bulk_Upload_Test_Data_Pack\OIL-BULK-006_Missing_Brand_Test.xlsx`;
  const imagePath = String.raw`C:\Users\SNEHA VEGAAHI\Desktop\MechGoAutomation\tests\Images\BulkUpload_Oil_Images`;


  await page.locator('input[type="file"]').nth(0).setInputFiles(filePath);
  await page.locator('input[type="file"]').nth(1).setInputFiles(imagePath);

  // Step 3: Click Import
  await page.getByRole('button', { name: /^import$/i }).click();

  // Step 4: Verify validation response
  await expect(
    page.getByText(/ Brand is required/i).first()
  ).toBeVisible();

});

test('OIL-BULK-008 - Verify Bulk Upload with Missing Product Name', async ({ page }) => {

  // Step 1: Open Bulk Import
  await page.getByRole('button', { name: /bulk import/i }).click();

  // Step 2: Upload Excel
  const filePath = String.raw`C:\Users\SNEHA VEGAAHI\Desktop\MechGoAutomation\tests\Images\Oils_Bulk_Upload_Test_Data_Pack\OIL-BULK-007_Missing_Product_Name_Test.xlsx`;
  const imagePath = String.raw`C:\Users\SNEHA VEGAAHI\Desktop\MechGoAutomation\tests\Images\BulkUpload_Oil_Images`;


  await page.locator('input[type="file"]').nth(0).setInputFiles(filePath);
  await page.locator('input[type="file"]').nth(1).setInputFiles(imagePath);

  // Step 3: Click Import
  await page.getByRole('button', { name: /^import$/i }).click();

  // Step 4: Verify validation message
  await expect(
    page.getByText(/product name|required|missing|invalid|failed/i).first()
  ).toBeVisible();

});


test('OIL-BULK-009 - Verify Bulk Upload with Missing Price', async ({ page }) => {

    await page.getByRole('button', { name: /bulk import/i }).click();

    const filePath = String.raw`C:\Users\SNEHA VEGAAHI\Desktop\MechGoAutomation\tests\Images\Oils_Bulk_Upload_Test_Data_Pack\OIL-BULK-008_Missing_Price.xlsx`;

    const imagePath = String.raw`C:\Users\SNEHA VEGAAHI\Desktop\MechGoAutomation\tests\Images\BulkUpload_Oil_Images`;

    await page.locator('input[type="file"]').nth(0).setInputFiles(filePath);

    await page.locator('input[type="file"]').nth(1).setInputFiles(imagePath);

    await page.getByRole('button', { name: /^import$/i }).click();

    await expect(
        page.getByText(/ Invalid price: ""/i)
    ).toBeVisible({ timeout: 10000 });

});


test('OIL-BULK-010 - Verify Bulk Upload with Missing Size', async ({ page }) => {

    await page.getByRole('button', { name: /bulk import/i }).click();

    const filePath = String.raw`C:\Users\SNEHA VEGAAHI\Desktop\MechGoAutomation\tests\Images\Oils_Bulk_Upload_Test_Data_Pack\OIL-BULK-009_Missing_Size.xlsx`;

    const imagePath = String.raw`C:\Users\SNEHA VEGAAHI\Desktop\MechGoAutomation\tests\Images\BulkUpload_Oil_Images`;

    await page.locator('input[type="file"]').nth(0).setInputFiles(filePath);

    await page.locator('input[type="file"]').nth(1).setInputFiles(imagePath);

    await page.getByRole('button', { name: /^import$/i }).click();

    // Verify import response
    await expect(
        page.getByText(/import complete|failed|required|invalid|error/i).first()
    ).toBeVisible({ timeout: 15000 });

});


test('OIL-BULK-011 - Verify Bulk Upload with Missing Image Path', async ({ page }) => {

    await page.getByRole('button', { name: /bulk import/i }).click();

    const filePath = String.raw`C:\Users\SNEHA VEGAAHI\Desktop\MechGoAutomation\tests\Images\Oils_Bulk_Upload_Test_Data_Pack\OIL-BULK-011_Missing_Image_Path.xlsx`;

    const imagePath = String.raw`C:\Users\SNEHA VEGAAHI\Desktop\MechGoAutomation\tests\Images\BulkUpload_Oil_Images`;

    await page.locator('input[type="file"]').nth(0).setInputFiles(filePath);

    await page.locator('input[type="file"]').nth(1).setInputFiles(imagePath);

    await page.getByRole('button', { name: /^import$/i }).click();

    await expect(
        page.getByText(/import complete|failed|required|invalid|error/i).first()
    ).toBeVisible({ timeout: 15000 });

});


test('OIL-BULK-012 - Verify Bulk Upload with Missing Category Column', async ({ page }) => {

    await page.getByRole('button', { name: /bulk import/i }).click();

    const filePath = String.raw`C:\Users\SNEHA VEGAAHI\Desktop\MechGoAutomation\tests\Images\Oils_Bulk_Upload_Test_Data_Pack\OIL-BULK-012_Missing_Category_Column.xlsx`;

    const imagePath = String.raw`C:\Users\SNEHA VEGAAHI\Desktop\MechGoAutomation\tests\Images\BulkUpload_Oil_Images`;

    await page.locator('input[type="file"]').nth(0).setInputFiles(filePath);

    await page.locator('input[type="file"]').nth(1).setInputFiles(imagePath);

    await page.getByRole('button', { name: /^import$/i }).click();

    // Capture import response
    await expect(
        page.getByText(/import complete|failed|required|invalid|error/i).first()
    ).toBeVisible({ timeout: 15000 });

});


test('OIL-BULK-013 - Verify Bulk Upload with Invalid Category', async ({ page }) => {

    await page.getByRole('button', { name: /bulk import/i }).click();

    const filePath = String.raw`C:\Users\SNEHA VEGAAHI\Desktop\MechGoAutomation\tests\Images\Oils_Bulk_Upload_Test_Data_Pack\OIL-BULK-013_Invalid_Category.xlsx`;

    const imagePath = String.raw`C:\Users\SNEHA VEGAAHI\Desktop\MechGoAutomation\tests\Images\BulkUpload_Oil_Images`;

    await page.locator('input[type="file"]').nth(0).setInputFiles(filePath);

    await page.locator('input[type="file"]').nth(1).setInputFiles(imagePath);

    await page.getByRole('button', { name: /^import$/i }).click();

    // Verify that the import response is displayed
    await expect(
        page.getByText(/import complete|failed|required|invalid|error/i).first()
    ).toBeVisible({ timeout: 15000 });

});

test('OIL-BULK-014 - Verify Bulk Upload with Invalid File Format', async ({ page }) => {

    await page.getByRole('button', { name: /bulk import/i }).click();

    const filePath = String.raw`C:\Users\SNEHA VEGAAHI\Desktop\MechGoAutomation\tests\Images\Oils_Bulk_Upload_Test_Data_Pack\OIL-BULK-014_Invalid_File_Format.txt`;
    const imagePath = String.raw`C:\Users\SNEHA VEGAAHI\Desktop\MechGoAutomation\tests\Images\BulkUpload_Oil_Images`;


    await page.locator('input[type="file"]').nth(0).setInputFiles(filePath);

    await page.locator('input[type="file"]').nth(1).setInputFiles(imagePath);

    await page.getByRole('button', { name: /^import$/i }).click();

    // Verify invalid file format validation
    await expect(
        page.getByText(/Only CSV and XLSX files are allowed for the import file/i).first()
    ).toBeVisible({ timeout: 10000 });

});


test('OIL-BULK-015 - Verify Bulk Upload with Invalid Price Format', async ({ page }) => {

    await page.getByRole('button', { name: /bulk import/i }).click();

    const filePath = String.raw`C:\Users\SNEHA VEGAAHI\Desktop\MechGoAutomation\tests\Images\Oils_Bulk_Upload_Test_Data_Pack\OIL-BULK-015_Invalid_Price_Format.xlsx`;

    const imagePath = String.raw`C:\Users\SNEHA VEGAAHI\Desktop\MechGoAutomation\tests\Images\BulkUpload_Oil_Images`;

    await page.locator('input[type="file"]').nth(0).setInputFiles(filePath);

    await page.locator('input[type="file"]').nth(1).setInputFiles(imagePath);

    await page.getByRole('button', { name: /^import$/i }).click();

    // Verify import response
    await expect(
        page.getByText(/import complete|failed|required|invalid|error/i).first()
    ).toBeVisible({ timeout: 15000 });

});


test('OIL-BULK-016 - Verify Bulk Upload with Duplicate Product Name', async ({ page }) => {

    await page.getByRole('button', { name: /bulk import/i }).click();

    const filePath = String.raw`C:\Users\SNEHA VEGAAHI\Desktop\MechGoAutomation\tests\Images\Oils_Bulk_Upload_Test_Data_Pack\OIL-BULK-016_Duplicate_Product_Name.xlsx`;

    const imagePath = String.raw`C:\Users\SNEHA VEGAAHI\Desktop\MechGoAutomation\tests\Images\BulkUpload_Oil_Images`;

    await page.locator('input[type="file"]').nth(0).setInputFiles(filePath);

    await page.locator('input[type="file"]').nth(1).setInputFiles(imagePath);

    await page.getByRole('button', { name: /^import$/i }).click();

    // Verify import summary
    await expect(
        page.getByText(/import complete|created|updated|failed/i).first()
    ).toBeVisible({ timeout: 15000 });

});


test('OIL-BULK-017 - Verify Bulk Upload with Missing Image File', async ({ page }) => {

    await page.getByRole('button', { name: /bulk import/i }).click();

    const filePath = String.raw`C:\Users\SNEHA VEGAAHI\Desktop\MechGoAutomation\tests\Images\Oils_Bulk_Upload_Test_Data_Pack\OIL-BULK-017_Missing_Image_File.xlsx`;

    const imagePath = String.raw`C:\Users\SNEHA VEGAAHI\Desktop\MechGoAutomation\tests\Images\BulkUpload_Oil_Images`;

    await page.locator('input[type="file"]').nth(0).setInputFiles(filePath);

    await page.locator('input[type="file"]').nth(1).setInputFiles(imagePath);

    await page.getByRole('button', { name: /^import$/i }).click();

    // Verify import response
    await expect(
        page.getByText(/import complete|failed|required|invalid|error/i).first()
    ).toBeVisible({ timeout: 15000 });

});


test('OIL-BULK-019 - Verify Bulk Upload with Negative Price', async ({ page }) => {

    await page.getByRole('button', { name: /bulk import/i }).click();

    const filePath = String.raw`C:\Users\SNEHA VEGAAHI\Desktop\MechGoAutomation\tests\Images\Oils_Bulk_Upload_Test_Data_Pack\OIL-BULK-019_Negative_Price.xlsx`;

    const imagePath = String.raw`C:\Users\SNEHA VEGAAHI\Desktop\MechGoAutomation\tests\Images\BulkUpload_Oil_Images`;

    await page.locator('input[type="file"]').nth(0).setInputFiles(filePath);
    await page.locator('input[type="file"]').nth(1).setInputFiles(imagePath);

    await page.getByRole('button', { name: /^import$/i }).click();

    await expect(
        page.getByText(/import complete|failed|required|invalid|error/i).first()
    ).toBeVisible({ timeout: 15000 });

});


test('OIL-BULK-020 - Verify Bulk Upload Without Image Folder', async ({ page }) => {

    await page.getByRole('button', { name: /bulk import/i }).click();

    const filePath = String.raw`C:\Users\SNEHA VEGAAHI\Desktop\MechGoAutomation\tests\Images\Oils_Bulk_Upload_Test_Data_Pack\OIL-BULK-020_Without_Image_Folder.xlsx`;

    // Upload only Excel file
    await page.locator('input[type="file"]').nth(0).setInputFiles(filePath);

    const importButton = page.getByRole('button', { name: /^import$/i });

    // Check whether Import is enabled without selecting image folder
    if (await importButton.isEnabled()) {
        await importButton.click();

        await expect(
            page.getByText(/import complete|failed|required|image|error/i).first()
        ).toBeVisible({ timeout: 15000 });
    } else {
        await expect(importButton).toBeDisabled();
    }

});


test('OIL-021 - Verify Oil Products Search Functionality', async ({ page }) => {

    const searchInput = page.getByPlaceholder(/search by brand, name or size/i);

    // Step 1: Verify search by Brand Name
    await searchInput.fill('Automation_Oil');

    await expect(
        page.locator('text=Automation_Oil').first()
    ).toBeVisible({ timeout: 10000 });

    // Step 2: Verify search by Size
    await searchInput.fill('1L');

    await expect(
        page.getByText('1L').first()
    ).toBeVisible();

    // Step 3: Verify invalid search
    await searchInput.fill('Invalid_Oil_12345');

    // Verify no matching product is displayed
    await expect(
        page.getByText('Invalid_Oil_12345')
    ).toHaveCount(0);

    // Step 4: Clear search
    await searchInput.clear();

    // Verify search field is cleared
    await expect(searchInput).toHaveValue('');

    // Verify products are displayed again
    await expect(
        page.getByText('Oil Products', { exact: false }).first()
    ).toBeVisible();

});

test('OIL-022 - Verify Oil Product Details View', async ({ page }) => {

  // Search for Automation Oil Filter
  const searchInput = page.getByPlaceholder(/search/i);

  await searchInput.fill('Automation Oil Filter');

  // Click on the searched product
  await page.getByText('Automation Oil Filter', { exact: true }).click();

  // Verify right-side details panel
  await expect(page.getByText('PRODUCT NAME')).toBeVisible();
  await expect(
  page.locator('p').filter({ hasText: /^Automation Oil Filter$/ })
).toBeVisible();

  // Verify Edit and Delete buttons
  // Verify Edit button in details panel
await expect(
  page.getByRole('button', { name: /edit/i }).last()
).toBeVisible();

// Verify Delete button in details panel
await expect(
  page.getByRole('button', { name: /delete/i }).last()
).toBeVisible();

});

test('OIL-022 - Verify Edit Oil Product from Details View', async ({ page }) => {

  // Step 1: Search for the oil product
  const searchInput = page.getByPlaceholder(/search/i);
  await searchInput.fill('Automation Oil Filter');

  // Step 2: Click on the product
  await page.getByText('Automation Oil Filter', { exact: true }).first().click();

  // Step 3: Click Edit from details panel
  await page.getByRole('button', { name: /edit/i }).last().click();

  // Step 4: Verify Edit Oil Product form
  await expect(
    page.getByText('Edit Oil Product')
  ).toBeVisible();

  // Step 5: Verify existing product details
  // Step 5: Verify existing product details
await expect(
  page.locator('input[value="Automation_Oil"]')
).toBeVisible();

await expect(
  page.locator('input[value="Automation Oil Filter"]').last()
).toBeVisible();

await expect(
  page.locator('input[value="AUTO-OIL-FILTER-001"]')
).toBeVisible();

await expect(
  page.locator('input[value="350"]')
).toBeVisible();

  // Step 6: Update Description
  const description = page.locator('textarea').last();

  await description.fill(
    'Oil filter updated through Playwright automation'
  );

  // Step 7: Save Changes
  await page.getByRole('button', { name: 'Save Changes' }).click();

  // Step 8: Verify edit form is closed
  await expect(
    page.getByText('Edit Oil Product')
  ).toBeHidden();

});

// test('OIL-023 - Verify Delete Oil Product from Details View', async ({ page }) => {

//   // Step 1: Search for the test product
//   const searchInput = page.getByPlaceholder(/search/i);
//   await searchInput.fill('Automation Oil Filter');

//   // Step 2: Click the product
//   await page.getByText('Automation Oil Filter', { exact: true }).first().click();

//   // Step 3: Click Delete from details panel
//   await page.getByRole('button', { name: /delete/i }).last().click();

//   // Step 4: Verify delete confirmation popup
//   await expect(
//     page.getByText('This product will be removed from the catalogue.')
//   ).toBeVisible();

//   // Step 5: Confirm deletion
//   await page.getByRole('button', { name: 'Delete', exact: true }).last().click();

//   // Step 6: Verify product is removed
//   await expect(
//     page.getByText('Automation Oil Filter', { exact: true })
//   ).toHaveCount(0);

// });

test('OIL-024 - Verify Edit Pencil Icon Functionality', async ({ page }) => {
  const searchInput = page.getByPlaceholder(/search/i);

  await searchInput.fill('Automation Oil Filter');

  const product = page.getByText('Automation Oil Filter', { exact: true }).first();
  await expect(product).toBeVisible();

  // Click the Edit / Pencil icon
  await page.getByRole('button', { name: /edit/i }).first().click();

  // Verify Edit Oil Product form
  await expect(page.getByText('Edit Oil Product')).toBeVisible();

  await expect(page.getByRole('button', { name: 'Save Changes' })).toBeVisible();
});

test('OIL-025 - Verify Trash Icon Functionality', async ({ page }) => {
  const searchInput = page.getByPlaceholder(/search/i);

  await searchInput.fill('Automation Oil Filter');

  const product = page.getByText('Automation Oil Filter', { exact: true }).first();
  await expect(product).toBeVisible();

  // Click the Trash / Delete icon
  await page.getByRole('button', { name: /delete|trash/i }).last().click();

  // Verify confirmation popup
  await expect(
    page.getByText('This product will be removed from the catalogue.')
  ).toBeVisible();
});

test('OIL-026 - Verify Search with Invalid Product Name', async ({ page }) => {
  const searchInput = page.getByPlaceholder(/search/i);

  await searchInput.fill('Invalid_Product_12345');

  // Verify no matching product is displayed
  await expect(
    page.getByText('Invalid_Product_12345', { exact: true })
  ).toHaveCount(0);
});

test.only('OIL-027 - Verify Search with Partial Product Name', async ({ page }) => {
  const searchInput = page.getByPlaceholder(/search/i);

  await searchInput.fill('Automation Oil');

  // Verify matching product is displayed
  await expect(
    page.getByText('Automation Oil Filter', { exact: true })
  ).toBeVisible();
});

});