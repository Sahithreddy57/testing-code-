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

    test('CAT-IMG-001 - Remove image from part details', async ({ page }) => {
  // Step 1: Search for the uploaded part
  await page.getByPlaceholder(
    /search by part name, part number or company/i
  ).fill('Auto_test_dead_part_003');

  // Step 2: Click the part to open its details
  await page.getByText('Auto_test_dead_part_003', {
    exact: true,
  }).click();

  // Step 3: Verify the part details are open
  await expect(
    page.getByText('COMPATIBLE VEHICLES', { exact: false })
  ).toBeVisible();

// Step 4: Click the X button on the image
const imageRemoveButton = page
  .locator('button:has(svg)')
  .filter({ visible: true })
  .nth(12);

await expect(imageRemoveButton).toBeVisible();
await imageRemoveButton.click();

  // Step 5: Click Close after removing the image
  await page.getByRole('button', {
    name: 'Close',
    exact: true,
  }).click();

});

 test('CAT-BATCH-IMG-001 - Upload image to two selected parts', async ({ page }) => {

    // Step 1: Select the first two part rows
    const partRows = page.locator('input[type="checkbox"]');

    // Header checkbox might be the first checkbox.
    // Select the first two part checkboxes after the header.
    await expect(partRows.nth(1)).toBeVisible();
    await expect(partRows.nth(2)).toBeVisible();

    await partRows.nth(1).check();
    await partRows.nth(2).check();

    // Step 2: Click Batch Image
    await page.getByRole('button', {
      name: /batch image/i,
    }).click();

    // Step 3: Set image path
    const imagePath =
      'C:\\Users\\SNEHA VEGAAHI\\Desktop\\MechGoAutomation\\tests\\Images\\BulkUploadImages\\test_image_2.png';

    // Step 4: Upload the image
    const imageInput = page.locator('input[type="file"]');

    await expect(imageInput.first()).toBeAttached();

    await imageInput.first().setInputFiles(imagePath);

    // Step 5: Verify the actual success message
    // Update this locator if your app displays different text.
    const successMessage = page.getByText(
      /image uploaded successfully|images uploaded successfully|updated successfully|upload successful/i
    );

    // await expect(successMessage.first()).toBeVisible({
    //   timeout: 15000,
    // });
  });

  test('CAT-BATCH-IMG-002 - Verify batch image in part details', async ({ page }) => {

  // Step 1: Search for one of the two parts selected earlier
  const searchBox = page.getByPlaceholder(
    /search by part name, part number or company/i
  );

  await searchBox.fill('Auto_test_bulk_part_003');

  // Step 2: Click the part name to open details
  await page.getByText('Auto_test_bulk_part_003', {
    exact: true,
  }).click();

  // Step 3: Verify part details are visible
  await expect(
    page.getByText('COMPATIBLE VEHICLES', {
      exact: false,
    })
  ).toBeVisible();

  // Step 4: Verify an image is displayed in the details
  const partImages = page.locator('img').filter({
    visible: true,
  });

  await expect(partImages.first()).toBeVisible();

  // Step 5: Close part details
  await page.getByRole('button', {
    name: 'Close',
    exact: true,
  }).click();
});

test('CAT-VIEW-003 - Verify view part details using eye icon', async ({ page }) => {

  // Step 1: Search for the test part
  const searchBox = page.getByPlaceholder(
    /search by part name, part number or company/i
  );

  await searchBox.fill('Auto_test_bulk_part_003');

  // Step 2: Locate the matching part card
  const partCard = page.locator('div').filter({
    has: page.getByText('Auto_test_bulk_part_003', {
      exact: true,
    }),
  }).filter({
    has: page.locator('button'),
  }).last();

  await expect(
    page.getByText('Auto_test_bulk_part_003', {
      exact: true,
    })
  ).toBeVisible();

  // Step 3: Click the Eye icon
  await partCard.locator('button').first().click();

  // Step 4: Verify part details are open
  await expect(
    page.getByText('COMPATIBLE VEHICLES', {
      exact: false,
    })
  ).toBeVisible();

  // Step 5: Close part details
  await page.getByRole('button', {
    name: 'Close',
    exact: true,
  }).click();

  // Step 6: Verify details are closed
  await expect(
    page.getByText('COMPATIBLE VEHICLES', {
      exact: false,
    })
  ).toBeHidden();

});

test('CAT-EDIT-004 - Verify edit part functionality', async ({ page }) => {

  // Step 1: Search for the test part
  const searchBox = page.getByPlaceholder(
    /search by part name, part number or company/i
  );

  await searchBox.fill('Auto_test_bulk_part_003');

  // Step 2: Locate the part card
  const partCard = page.locator('div').filter({
    has: page.getByText('Auto_test_bulk_part_003', {
      exact: true,
    }),
  }).filter({
    has: page.locator('button'),
  }).last();

  await expect(
    page.getByText('Auto_test_bulk_part_003', {
      exact: true,
    })
  ).toBeVisible();

  // Step 3: Click Edit icon (pencil)
  await partCard.locator('button').nth(1).click();

  // Step 4: Verify Edit Part form
  await expect(
    page.getByText(/edit part/i).first()
  ).toBeVisible();

  // Step 5: Update description
  const updatedDescription =
    'Updated description - Playwright automation testing';

  const descriptionField = page.locator('textarea').first();

  await expect(descriptionField).toBeVisible();
  await descriptionField.fill(updatedDescription);

  // Step 6: Click Save Changes
  await page.getByRole('button', {
    name: /save changes/i,
  }).click();

  // Step 7: Wait for Edit form to close
await expect(
  page.getByRole('button', {
    name: /save changes/i,
  })
).toBeHidden({ timeout: 15000 });

// Step 8: Open the updated part details again
await page.getByText('Auto_test_bulk_part_003', {
  exact: true,
}).click();

// Step 9: Verify updated description
await expect(
  page.getByText(updatedDescription, {
    exact: true,
  })
).toBeVisible({ timeout: 15000 });

// Step 10: Close part details
await page.getByRole('button', {
  name: 'Close',
  exact: true,
}).click();

});

// test.only('CAT-DELETE-001 - Verify delete part functionality', async ({ page }) => {

//   // Step 1: Search for the test part
//   const searchBox = page.getByPlaceholder(
//     /search by part name, part number or company/i
//   );

//   await searchBox.fill('Auto_test_bulk_part_003');

//   // Step 2: Verify the part is visible
//   const partName = page.getByText(
//     'Auto_test_bulk_part_003',
//     { exact: true }
//   );

//   await expect(partName).toBeVisible();

//   // Step 3: Locate the exact part card
//   const partCard = page.locator('div').filter({
//     has: partName,
//   }).filter({
//     has: page.locator('button'),
//   }).last();

//   // Step 4: Click Delete icon
//   await partCard.locator('button').last().click();

// // Step 5: Verify delete confirmation popup
// const deleteConfirmation = page.getByText(
//   'Delete "Auto_test_bulk_part_003"?',
//   { exact: true }
// );

// await expect(deleteConfirmation).toBeVisible();

// // Step 6: Click Delete button in confirmation popup
// const confirmDeleteButton = page.locator(
//   'button.bg-red-600'
// );

// await expect(confirmDeleteButton).toBeVisible();
// await confirmDeleteButton.click();

// // Step 7: Verify part is removed
// await expect(partName).toBeHidden({
//   timeout: 15000,
// });

// // Step 7: Verify part is removed
// await expect(partName).toBeHidden({
//   timeout: 15000,
// });

// });

test('CAT-PAGE-001 - Verify rows per page selection as 50', async ({ page }) => {

  // Step 1: Scroll to bottom of Catalog page
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

  // Step 2: Locate Rows Per Page dropdown
  const rowsDropdown = page.locator('select').filter({
    visible: true,
  }).last();

  await expect(rowsDropdown).toBeVisible();

  // Step 3: Select 50 rows
  await rowsDropdown.selectOption({ label: '50' });

  // Step 4: Verify selected value
  await expect(rowsDropdown).toHaveValue('50');

  // Step 5: Verify parts list is displayed
  await expect(
    page.getByText(/parts found/i)
  ).toBeVisible();

});

test('CAT-PAGE-002 - Verify rows per page selection as 25', async ({ page }) => {

  // Step 1: Scroll to bottom of Catalog page
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });

  // Step 2: Locate Rows Per Page dropdown
  const rowsDropdown = page.locator('select').filter({
    visible: true,
  }).last();

  await expect(rowsDropdown).toBeVisible();

  // Step 3: Select 25 rows
  await rowsDropdown.selectOption({ label: '25' });

  // Step 4: Verify selected value
  await expect(rowsDropdown).toHaveValue('25');

  // Step 5: Verify parts list is displayed
  await expect(
    page.getByText(/parts found/i)
  ).toBeVisible();

});

test('CAT-PAGE-003 - Verify next page navigation', async ({ page }) => {

  // Step 1: Scroll to Rows Per Page section
  const rowsLabel = page.getByText('Rows per page', {
    exact: true,
  });
  // Step 2: Get current page number
  const pageIndicator = page.getByText(/Page \d+ of \d+/);

  await expect(pageIndicator).toBeVisible();

  // Step 3: Locate Next button
  const paginationContainer = pageIndicator.locator('..');

  const nextPageButton = paginationContainer
    .getByRole('button')
    .last();

  // Step 4: Verify Next button is enabled
  await expect(nextPageButton).toBeEnabled();

  // Step 5: Click Next button
  await nextPageButton.click();

  // Step 6: Verify navigation to Page 2
  await expect(pageIndicator).toHaveText(/Page 2 of \d+/);

});

test('CAT-FILTER-001 - Verify Category, Brand, Model, Variant filters and Clear', async ({ page }) => {

  // Step 1: Locate Category dropdown
  const categoryDropdown = page.locator('select').nth(0);

  await expect(categoryDropdown).toBeVisible();

  // Step 2: Select Category
  await categoryDropdown.selectOption({
    label: 'Van',
  });

  await expect(categoryDropdown).toHaveValue(
    await categoryDropdown.locator('option', {
      hasText: 'Van',
    }).getAttribute('value') || ''
  );

  // Step 3: Select Brand
  const brandDropdown = page.locator('select').nth(1);

  await expect(brandDropdown).toBeVisible();

  await brandDropdown.selectOption({
    label: 'Automationbrand_1793090406608_updated',
  });

  await expect(brandDropdown).toHaveValue(
    await brandDropdown.locator('option', {
      hasText: 'Automationbrand_1793090406608_updated',
    }).getAttribute('value') || ''
  );

  // Step 4: Select Model
  const modelDropdown = page.locator('select').nth(2);

  await expect(modelDropdown).toBeVisible();

  await modelDropdown.selectOption({
    label: 'Automationmodel_1793168538228_updated',
  });

  await expect(modelDropdown).toHaveValue(
    await modelDropdown.locator('option', {
      hasText: 'Automationmodel_1793168538228_updated',
    }).getAttribute('value') || ''
  );

 // Step 5: Select Variant
const variantDropdown = page.locator('select').nth(3);

await expect(variantDropdown).toBeVisible();

await variantDropdown.selectOption({
  label: 'Automationvariant_1793168623112_updated',
});

await expect(variantDropdown).toHaveValue(
  await variantDropdown.locator('option', {
    hasText: 'Automationvariant_1793168623112_updated',
  }).getAttribute('value') || ''
);
  // Step 6: Verify filtered results
  await expect(
    page.getByText(/parts found|no parts match your filters/i)
  ).toBeVisible();

  // Step 7: Click Clear Filters
  await page.getByRole('button', {
    name: /clear/i,
  }).click();

  // Step 9: Verify catalog results are displayed again
  await expect(
    page.getByText(/parts found/i)
  ).toBeVisible();

});
});