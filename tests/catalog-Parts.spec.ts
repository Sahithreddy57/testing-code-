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

    // TC-CAT-001: Validate Catalog page navigation
    test('CAT-001 - Navigate to Catalog page successfully', async ({ page }) => {

        await expect(page).toHaveURL(/\/admin\/catalog/i);

        await expect(
            page.getByRole('button', { name: /add part/i })
        ).toBeVisible();

        await expect(
            page.getByPlaceholder(/search by part name/i)
        ).toBeVisible();
    });

    // TC-CAT-002: Verify Catalog tabs and filters

    // TC-CAT-002: Verify Catalog tabs and filters
    test('CAT-002 - Verify Catalog tabs and filters', async ({ page }) => {

        // Verify Catalog tabs
        await expect(
            page.getByText('Parts', { exact: true }).first()
        ).toBeVisible();

        await expect(
            page.getByText('Brands', { exact: true })
        ).toBeVisible();

        await expect(
            page.getByText('Models', { exact: true })
        ).toBeVisible();

        await expect(
            page.getByText('Variants', { exact: true })
        ).toBeVisible();

        // Verify category, brand and model filter dropdowns
        await expect(
            page.getByRole('combobox').filter({ visible: true }).first()
        ).toBeVisible();

        await expect(
            page.getByRole('combobox').filter({ visible: true }).nth(1)
        ).toBeVisible();

        await expect(
            page.getByRole('combobox').filter({ visible: true }).nth(2)
        ).toBeVisible();
    });

    // TC-CAT-003: Open Add Part form
    test('CAT-003 - Open Add Part form successfully', async ({ page }) => {

        // Step 1: Open the Add Part form
        await page.getByRole('button', { name: /^add part$/i }).first().click();

        // Step 2: Verify the form heading
        const formHeading = page.getByRole('heading', {
            name: /add new part/i,
        });

        await expect(formHeading).toBeVisible();

        // Step 3: Verify the Part Name field
        await expect(
            page.getByPlaceholder(/brake pad, clutch plate, air filter/i)
        ).toBeVisible();

        // Step 4: Locate the Cancel and Add Part buttons
        const cancelButton = page.getByRole('button', {
            name: /^cancel$/i,
        }).last();

        const addPartButton = page.getByRole('button', {
            name: /^add part$/i,
        }).last();

        // Step 5: Scroll to the footer buttons

        // Step 5: Print button details for debugging
        console.log('Cancel count:', await cancelButton.count());
        console.log('Add Part count:', await addPartButton.count());

        console.log('Cancel position:', await cancelButton.boundingBox());
        console.log('Add Part position:', await addPartButton.boundingBox());

        // Step 6: Scroll buttons into view
        await cancelButton.scrollIntoViewIfNeeded();
        await addPartButton.scrollIntoViewIfNeeded();

        // Step 7: Verify buttons are in the viewport
        await expect(cancelButton).toBeInViewport();
        await expect(addPartButton).toBeInViewport();

        // Step 8: Capture screenshot
        await page.screenshot({
            path: 'test-results/catalog-modal-debug.png',
            fullPage: false,
        });

    });

    // TC-CAT-004: Verify Add Part form can be cancelled
    test('CAT-004 - Cancel Add Part form successfully', async ({ page }) => {

        await page.getByRole('button', { name: /add part/i }).click();

        await expect(
            page.getByRole('heading', { name: /add new part/i })
        ).toBeVisible();

        await page.getByRole('button', { name: /cancel/i }).click();

        await expect(
            page.getByRole('heading', { name: /add new part/i })
        ).toHaveCount(0);
    });

    // TC-CAT-005: Search for an existing part
    test('CAT-005 - Search parts by name', async ({ page }) => {

        const searchBox = page.getByPlaceholder(
            /search by part name, part number or company/i
        );

        await searchBox.fill('Toyota Crysta-break Pad');

        await expect(
            page.getByText('Toyota Crysta-break Pad', { exact: false }).first()
        ).toBeVisible();

        await searchBox.clear();
    });


    test('CAT-006 - Verify category selection in Add Part form', async ({ page }) => {

        // Step 3: Locate the three dropdowns
        const dropdowns = page.getByRole('combobox');

        const categoryDropdown = dropdowns.nth(0);
        const brandDropdown = dropdowns.nth(1);
        const modelDropdown = dropdowns.nth(2);

        // Step 4: Verify dropdowns are visible
        await expect(categoryDropdown).toBeVisible();
        await expect(brandDropdown).toBeVisible();
        await expect(modelDropdown).toBeVisible();

        // Step 5: Verify category options
        await expect(categoryDropdown).toContainText('Car');
        await expect(categoryDropdown).toContainText('Bike');

        // Step 6: Select Car category
        await categoryDropdown.selectOption({
            label: 'Van'
        });

        // Step 7: Verify selected category
        await expect(categoryDropdown).toHaveValue(/.+/);

        // Step 8: Verify Brand and Model dropdowns remain visible
        await expect(brandDropdown).toBeVisible();
        await expect(modelDropdown).toBeVisible();

        await page.waitForTimeout(5000); // Wait for 2 seconds to allow the UI to update

    });


    test('CAT-007 - Add a part with vehicle and company pricing', async ({ page }) => {
        const categoryName = 'Van';
        const brandName = 'Automationbrand_1793090406608_updated';
        const modelName = 'Automationmodel_1793168538228_updated';

        const partName = `AutomationTestPart_${Date.now()}`;
        const partNumber = `OEM-${Date.now()}`;

        // 1. Open Add Part form
        await page.getByRole('button', { name: /^add part$/i }).first().click();

        await expect(
            page.getByRole('heading', { name: /add new part/i })
        ).toBeVisible();

        // 2. Fill part details
        await page.getByPlaceholder(
            /brake pad, clutch plate, air filter/i
        ).fill(partName);

        await page.getByPlaceholder(/04465-02220/i).fill(partNumber);

        // 3. Upload image
        const imagePath = path.resolve(
            process.cwd(), 'tests', 'Images', 'testing.jpg'
        );

        await page.locator('input[type="file"]').first().setInputFiles(imagePath);

        // 4. Select category
        const categoryDropdown = page.getByRole('combobox').filter({
            has: page.locator('option', { hasText: categoryName }),
        }).last();

        await categoryDropdown.selectOption({ label: categoryName });

        // 5. Enable sub-parts
        // await page.getByRole('checkbox', {
        //     name: /this part has sub-parts/i,
        // }).check();

        // 6. Fill description
        await page.getByPlaceholder(/optional notes about this part/i)
            .fill('Automation test part');

        // 7. Select brand
        const brandDropdown = page.getByRole('combobox').filter({
            has: page.locator('option', { hasText: brandName }),
        }).last();

        await brandDropdown.selectOption({ label: brandName });

        // 8. Select model option
        const modelDropdown = page.getByRole('combobox').filter({
            has: page.locator('option', { hasText: modelName }),
        }).last();

        const modelOption = modelDropdown.locator('option', {
            hasText: modelName,
        }).filter({
            hasText: /Automationvariant_1793168623112_updated/,
        });

        const modelValue = await modelOption.getAttribute('value');

        if (!modelValue) {
            throw new Error('Required model/variant option was not found');
        }

        await modelDropdown.selectOption(modelValue);

        // 9. Inspect Add buttons and current UI state
        console.log(
            'Add buttons:',
            await page.getByRole('button', { name: 'Add', exact: true }).count()
        );
        // Add selected brand and model/variant to Vehicle Compatibility
        const vehicleAddButton = page
            .getByRole('button', { name: 'Add', exact: true })
            .first();

        await expect(vehicleAddButton).toBeEnabled();
        await vehicleAddButton.click();

        // 10. Select company in Company Pricing
        // 10. Select company in Company Pricing
        const companyDropdown = page
            .locator('select')
            .filter({
                has: page.locator(
                    'option[value="6ae1961291160ec4a140549b"]'
                ),
            });

        await expect(companyDropdown).toHaveCount(1);

        await companyDropdown.selectOption(
            '6ae1961291160ec4a140549b'
        );

        // 11. Click the Add button next to Company Pricing dropdown
        const companyPricingAddButton = companyDropdown.locator(
            'xpath=following-sibling::button'
        );

        await expect(companyPricingAddButton).toBeEnabled();
        await companyPricingAddButton.click();

        // 12. Verify Price and Stock fields appear
        const numberInputs = page.locator('input[type="number"]');

        await expect(numberInputs).toHaveCount(2);

        // 13. Fill Price and Stock
        const priceInput = numberInputs.nth(0);
        const stockInput = numberInputs.nth(1);

        await priceInput.fill('100');
        await stockInput.fill('10');

        await expect(priceInput).toHaveValue('100');
        await expect(stockInput).toHaveValue('10');

        // 14. Click the final Add Part button
        const submitButton = page.getByRole('button', {
            name: 'Add Part',
            exact: true,
        }).last();

        await expect(submitButton).toBeEnabled();
        await submitButton.click();
    });


});
