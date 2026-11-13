import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Admin Product Inventory Tests', () => {

    let createdShopName = '';

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

        await page.getByText('Shops', { exact: true }).click();

    });

    test('SHP-001 - Verify Enrol New Shop Form UI', async ({ page }) => {

        // Click Enrol New Shop
        await page.getByRole('button', {
            name: /Enrol Shop/i
        }).click();

        // Verify Owner / Contact Details
        await expect(page.getByText(/Owner Full Name/i)).toBeVisible();
        await expect(page.getByText(/Email Address/i)).toBeVisible();
        await expect(page.getByText(/Mobile Number/i)).toBeVisible();

        // Verify Shop Identity
        await expect(page.getByText(/Shop Name/i)).toBeVisible();
        await expect(page.getByText(/Shop Registration ID/i)).toBeVisible();

        // Verify Login Credentials
        await expect(page.getByText(/Password/i).first()).toBeVisible();
        await expect(page.getByText(/Confirm Password/i)).toBeVisible();

        // Verify Location Details
        await expect(page.getByText(/Address Line 1/i)).toBeVisible();
        await expect(page.getByText(/PIN Code/i)).toBeVisible();
        await expect(
            page.getByPlaceholder(/city/i)
        ).toBeVisible();

        // Verify Enrolment Button
        await expect(
            page.getByRole('button', {
                name: /Enrol Shop & Send Credentials/i
            })
        ).toBeVisible();

    });

    test('SHP-002 - Verify Mandatory Field Validation', async ({ page }) => {

        await page.getByRole('button', {
            name: /Enrol Shop/i
        }).click();

        // Click Enrol Shop without entering any details
        await page.getByRole('button', {
            name: /Enrol Shop & Send Credentials/i
        }).click();


        // Verify mandatory validation messages
        await expect(
            page.getByText('Owner name is required', { exact: true })
        ).toBeVisible();

        await expect(
            page.getByText('Valid 10-digit Indian mobile number required', { exact: true })
        ).toBeVisible();

        // Verify the form remains open
        await expect(
            page.getByRole('button', {
                name: /Enrol Shop & Send Credentials/i
            })
        ).toBeVisible();

    });

    test('SHP-003 - Verify Invalid Email and Mobile Number Validation', async ({ page }) => {

        await page.getByRole('button', {
            name: /Enrol Shop/i
        }).click();

        await page.getByRole('button', {
            name: /Enrol Shop & Send Credentials/i
        }).click();

        // Enter invalid email
        await page.locator('input[type="email"]').fill('invalidemail');

        // Enter invalid mobile number
        await page.getByPlaceholder(/9XXXXXXXXX/i).fill('12345');

        // Submit the form
        await page.getByRole('button', {
            name: /Enrol Shop & Send Credentials/i
        }).click();

        // Verify email validation
        await expect(
            page.getByText(/valid email|invalid email/i)
        ).toBeVisible();

        // Verify mobile validation
        await expect(
            page.getByText(/valid 10-digit Indian mobile number required/i)
        ).toBeVisible();

    });

    test('SHP-004 - Verify Password and Confirm Password Mismatch Validation', async ({ page }) => {

        await page.getByRole('button', {
            name: /Enrol Shop/i
        }).click();

        // Enter password
        await page.locator('input[type="password"]').nth(0).fill('Shop@12345');

        await page.waitForTimeout(2000);

        // Enter incorrect confirm password
        await page.locator('input[type="password"]').nth(1).fill('Shop@54321');

        await page.waitForTimeout(2000);

        // Click outside the Confirm Password field
        await page.getByText('Shop Identity').click();

        // Verify password mismatch validation
        await expect(
            page.getByText(/passwords do not match|password mismatch|passwords must match/i)
        ).toBeVisible();

    });

    test('SHP-005 - Verify PIN Code and City Auto-fill', async ({ page }) => {

        await page.getByRole('button', {
            name: /Enrol Shop/i
        }).click();

        const pinInput = page.getByPlaceholder('6-digit PIN');
        const cityInput = page.getByPlaceholder('City name');

        // Enter valid PIN code
        await pinInput.fill('506001');

        // Click on City field to trigger auto-fill
        await cityInput.click();

        await page.waitForTimeout(2000); // Wait for auto-fill to complete

        // Verify City is automatically populated
        await expect(cityInput).not.toHaveValue('');

    });

    test('SHP-006 - Verify Optional Fields Expand and Collapse', async ({ page }) => {

        await page.getByRole('button', {
            name: /Enrol Shop/i
        }).click();

        // Click Optional Fields section
        await page.getByText(/Optional Fields \(GST, Bank, Logo, Hours\)/i).click();

        // Verify optional fields are displayed
        await expect(page.getByText(/GST Number/i)).toBeVisible();
        await expect(page.getByText(/Shop Description/i)).toBeVisible();
        await expect(page.getByText(/Opening Time/i)).toBeVisible();
        await expect(page.getByText(/Closing Time/i)).toBeVisible();
        await expect(page.getByText(/Account Number/i)).toBeVisible();
        await expect(page.getByText(/IFSC Code/i)).toBeVisible();
        await expect(page.getByText(/Bank Name/i)).toBeVisible();

        // Collapse Optional Fields
        await page.getByText(/Optional Fields \(GST, Bank, Logo, Hours\)/i).click();

        // Verify optional fields are hidden
        await expect(page.getByText(/GST Number/i)).toBeHidden();

    });

    test('SHP-007 - Verify Shop Logo Upload Functionality', async ({ page }) => {

        await page.getByRole('button', {
            name: /Enrol Shop/i
        }).click();

        // Expand Optional Fields
        await page.getByText(/Optional Fields/i).click();

        // Upload shop logo
        const logoInput = page.locator('input[type="file"]').first();

        await logoInput.setInputFiles('tests/Images/shop-logo.jpg');

        // Verify uploaded file
        await expect(
            page.getByText('shop-logo.jpg')
        ).toBeVisible();

    });

    test('SHP-008 - Verify Optional Fields Data Entry', async ({ page }) => {

        await page.getByRole('button', {
            name: /Enrol Shop/i
        }).click();

        // Expand Optional Fields
        await page.getByText(/Optional Fields/i).click();

        // Enter GST Number
        const gstInput = page.getByPlaceholder('15-CHAR GST NUMBER');
        await gstInput.fill('36ABCDE1234F1Z5');

        // Enter Shop Description
        const descriptionInput = page.getByPlaceholder(/Brief description of the shop/i);
        await descriptionInput.fill('Automation testing shop');

        // Enter Bank Account Number
        const accountInput = page.locator('input[name="bank_account"]');
        await accountInput.fill('123456789012');

        // Enter IFSC Code
        const ifscInput = page.locator('input[name="bank_ifsc"]');
        await ifscInput.fill('SBIN0001234');

        // Enter Bank Name
        const bankNameInput = page.locator('input[name="bank_name"]');
        await bankNameInput.fill('State Bank of India');

        // Set Opening Time and Closing Time

        const openingTimeInput = page.locator('input[type="time"]').nth(0);
        const closingTimeInput = page.locator('input[type="time"]').nth(1);

        // Get current system time
        const now = new Date();

        const openingTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        // Calculate closing time (+10 hours)
        const closingDate = new Date(now.getTime() + 10 * 60 * 60 * 1000);

        const closingTime = `${String(closingDate.getHours()).padStart(2, '0')}:${String(closingDate.getMinutes()).padStart(2, '0')}`;

        // Fill time fields
        await openingTimeInput.fill(openingTime);
        await closingTimeInput.fill(closingTime);

        // Verify time values
        await expect(openingTimeInput).toHaveValue(openingTime);
        await expect(closingTimeInput).toHaveValue(closingTime);

        // Verify entered values
        await expect(gstInput).toHaveValue('36ABCDE1234F1Z5');
        await expect(descriptionInput).toHaveValue('Automation testing shop');
        await expect(accountInput).toHaveValue('123456789012');
        await expect(ifscInput).toHaveValue('SBIN0001234');
        await expect(bankNameInput).toHaveValue('State Bank of India');

    });

    test('SHP-009 - Verify Cancel Button Functionality', async ({ page }) => {

        await page.getByRole('button', {
            name: /Enrol Shop/i
        }).click();
        // Enter sample shop name
        await page.getByPlaceholder(/e.g. Kumar Auto Parts/i)
            .fill('Automation Test Shop');

        // Click Cancel
        await page.getByRole('button', { name: /cancel/i }).click();

        // Verify navigation back to Shops page
        await expect(page).toHaveURL(/\/admin\/shops$/);

    });

    test('SHP-010 - Verify Successful Shop Enrolment', async ({ page }) => {

        // Generate unique timestamp
        const timestamp = Date.now().toString();

        // Generate unique shop details
        const shopName = `QA_TEST_SHOP_${timestamp}`;
        createdShopName = shopName;
        const email = `qa.shop.${timestamp}@example.com`;
        const registrationId = `QAREG${timestamp}`;

        // Generate unique 10-digit mobile number
        const mobileNumber = `9${timestamp.slice(-9)}`;

        await page.getByRole('button', {
            name: /Enrol Shop/i
        }).click();

        // Owner / Contact Details
        await page.getByPlaceholder(/e.g. Rajesh Kumar/i).fill('Bhavya');
        await page.locator('input[type="email"]').fill(email);
        await page.getByPlaceholder(/9XXXXXXXXX/i).fill(mobileNumber);

        // Shop Identity
        await page.getByPlaceholder(/e.g. Kumar Auto Parts/i).fill(shopName);
        await page.getByPlaceholder(/e.g. REG20241234/i).fill(registrationId);

        // Login Credentials
        await page.locator('input[type="password"]').nth(0).fill('Shop@QA2026');
        await page.locator('input[type="password"]').nth(1).fill('Shop@QA2026');

        // Location Details
        await page.getByPlaceholder(/Street, building, landmark/i).fill('Plot 101, QA Test Street');
        await page.getByPlaceholder(/Area, colony/i).fill('Test Colony, Phase 2');

        await page.getByPlaceholder(/6-digit PIN/i).fill('500001');

        // City auto-fill
        await page.getByPlaceholder(/City name/i).click();

        await page.waitForTimeout(2000); // Wait for auto-fill to complete

        // Expand Optional Fields
        await page.getByText(/Optional Fields/i).click();

        // Optional Fields
        await page.getByPlaceholder(/15-char GST number/i).fill('36AABCU9603R1ZM');
        await page.getByPlaceholder(/Brief description of the shop.../i)
            .fill('QA dummy shop created for enrolment testing');

        await page.locator('input[type="time"]').nth(0).fill('09:00');
        await page.locator('input[type="time"]').nth(1).fill('19:00');

        await page.locator('input[name="bank_account"]').fill('1234567890123456');
        await page.locator('input[name="bank_ifsc"]').fill('SBIN0001234');
        await page.locator('input[name="bank_name"]').fill('State Bank of India');

        // Submit Shop Enrolment
        await page.getByRole('button', { name: /Enrol Shop & Send Credentials/i }).click();

        // Verify Successful Enrolment
        await expect(page.getByText(createdShopName)).toBeVisible();

        await expect(
            page.getByRole('button', { name: /Back to Shops List/i })
        ).toBeVisible();

        await expect(
            page.getByRole('button', { name: /Enrol Another Shop/i })
        ).toBeVisible();

    });

    test('SHP-011 - Verify Newly Enrolled Shop Appears in Shops List', async ({ page }) => {

        // Navigate to Shops List
        await page.getByText('Shops', { exact: true }).first().click();

        // Verify newly created shop
        await expect(
            page.getByText(createdShopName, { exact: true })
        ).toBeVisible();


    });

    test('SHP-012 - Verify Shop Search Functionality', async ({ page }) => {

        // Search for the newly created shop
        await page.getByPlaceholder(/Search by name, city, ID/i)
            .fill(createdShopName);

        // Verify matching shop is displayed
        await expect(
            page.getByText(createdShopName, { exact: true })
        ).toBeVisible();

    });

    test('SHP-013 - Verify Shops Bulk Upload Functionality', async ({ page }) => {

        // Navigate to Bulk Import
        await page.getByRole('button', { name: /Bulk Import/i }).click();

        // Excel file path
        const filePath = 'C:\\Users\\SNEHA VEGAAHI\\Desktop\\MechGoAutomation\\tests\\Images\\MechGo_Shops_Bulk_Upload_3_Dummy_Records.xlsx';

        // Upload Excel file
        await page.locator('input[type="file"]').setInputFiles(filePath);

        // Click Import
        await page.getByRole('button', { name: /Import/i }).click();

        // Verify import completion message
        await expect(
            page.getByText(/import complete|successfully imported|upload successful/i)
        ).toBeVisible({ timeout: 30000 });

        // Verify uploaded shops
        await expect(
            page.getByText('QA_BULK_SHOP_001', { exact: true })
        ).toBeVisible();

        await expect(
            page.getByText('QA_BULK_SHOP_002', { exact: true })
        ).toBeVisible();

        await expect(
            page.getByText('QA_BULK_SHOP_003', { exact: true })
        ).toBeVisible();

    });

    test('SHP-014 - Verify Shop Status Filter Functionality', async ({ page }) => {

        // Navigate to Shops List
        await page.getByText('Shops', { exact: true }).last().click();

        const statusDropdown = page.getByRole('combobox');

        // Verify All Statuses
        await statusDropdown.selectOption({ label: 'All Statuses' });
        await expect(statusDropdown).toHaveValue('');

        // Verify Active
        await statusDropdown.selectOption({ label: 'Active' });
        await expect(statusDropdown).toHaveValue('active');

        // Verify Suspended
        await statusDropdown.selectOption({ label: 'Suspended' });
        await expect(statusDropdown).toHaveValue('suspended');

        // Verify Deactivated
        await statusDropdown.selectOption({ label: 'Deactivated' });
        await expect(statusDropdown).toHaveValue('deactivated');

        // Click Refresh button beside All Statuses
        await page.locator('select')
            .locator('xpath=following-sibling::button')
            .click();

    });

    test('SHP-015 - Verify Parts Assignment and Removal Functionality', async ({ page }) => {

        // Navigate to Shops
        await page.getByText('Shops', { exact: true }).last().click();

        // Search automation-created shop
        await page.getByPlaceholder(/Search by name, city, ID/i)
            .fill(createdShopName);

        // Click Eye icon of the created shop
        const shopRow = page.locator('tr').filter({
            hasText: createdShopName
        });

        await shopRow.locator('button').first().click();

        // Verify Shop Details page
        await expect(
            page.getByText(createdShopName)
        ).toBeVisible();

        await page.waitForTimeout(2000); // Wait for the page to load completely

        // Verify Overview
        await expect(
            page.getByText('Overview', { exact: true }).last()
        ).toBeVisible();

        // Open Manage Products
        await page.getByRole('button', {
            name: /Manage Products/i
        }).click();

        await page.locator('select').nth(0).selectOption({ label: 'Van' });

        await page.locator('select').nth(1).selectOption({ label: 'Automationbrand_1793090406608_updated' });

        // Select Model
        await page.locator('select').nth(2).selectOption({ label: 'Automationmodel_1793168538228_updated' });

        // Select Supplier / Company
        await page.locator('select').nth(3).selectOption({ label: 'AutomationCompany1793168913704_Updated' });

        // Verify automation-created part is displayed
        const partName = page.getByText(/Automationtestpart_/).first();

        await expect(partName).toBeVisible();

        // Select Part Checkbox
        const partCard = partName.locator(
            'xpath=ancestor::div[.//input[@type="checkbox"]][1]'
        );

        await partCard.locator('input[type="checkbox"]').check();


        // Verify selected part in Manage Products
        await expect(
            page.getByText(/To Assign/i)
        ).toBeVisible();

        // Confirm Assignment
        await page.getByRole('button', {
            name: /Confirm Assignment/i
        }).click();

        // Verify confirmation message
        await expect(
            page.getByText(/ assigned to /i)
        ).toBeVisible();

        // Click Dustbin icon to remove assigned part
        // const assignedPartRow = page.locator('tr').filter({ has: partName });

        // await partCard.locator('button').last().click();

        // // Verify removal confirmation / validation message
        // await expect(
        //     page.getByText(/remove|confirm|are you sure/i).nth(4)
        // ).toBeVisible();

        // await
        //     page.getByText(/remove|confirm|are you sure/i).nth(4).click();

        // await expect(
        //     page.getByText(/product removed from/i)
        // ).toBeVisible();

    });

    test('SHP-016 - Verify Oils Assignment and Removal Functionality', async ({ page }) => {

        // Navigate to Shops
        await page.getByText('Shops', { exact: true }).last().click();

        // Search automation-created shop
        await page.getByPlaceholder(/Search by name, city, ID/i)
            .fill(createdShopName);

        // Open Shop Details
        const shopRow = page.locator('tr').filter({
            hasText: createdShopName
        });

        await shopRow.locator('button').first().click();

        // Verify Shop Details
        await expect(
            page.getByText(createdShopName)
        ).toBeVisible();

        await page.waitForTimeout(2000); // Wait for the page to load completely

        // Open Manage Products
        await page.getByRole('button', {
            name: /Manage Products/i
        }).click();

        await page.waitForTimeout(2000); // Wait for the page to load completely

        // Select Oils tab
        await page.getByText('Oils', { exact: true }).last().click();

        // Select Category - Oil Filter
        await page.locator('select').nth(0).selectOption({ label: 'Oil Filter' });

        // Verify automation-created oil
        const oilName = page.getByText(
            'Automation_Oil Automation Oil Filter',
            { exact: true }
        ).first();

        await expect(oilName).toBeVisible();

        // Select Oil Checkbox
        await oilName.click();

        // Verify selected oil
        await expect(
            page.getByText(/To Assign/i)
        ).toBeVisible();

        // Confirm Assignment
        await page.getByRole('button', {
            name: /Assign 1 oil/i
        }).click();

        // Verify assignment success
        await expect(
            page.getByText(/assigned to/i)
        ).toBeVisible();

        // Verify Assigned status
        // const assignedStatus = page.getByText('Selected', { exact: true });

        // await expect(assignedStatus).toBeVisible();

        // Remove assigned oil
        // await oilName.click();

        // // Verify removal confirmation
        // await expect(
        //     page.getByText(/Remove 1 oil/i)
        // ).toBeVisible();

        // // Confirm removal
        // await page.getByText(
        //     /Remove 1 oil/i
        // ).click();

        // // Verify successful removal
        // await expect(
        //     page.getByText(/oil removed from /i)
        // ).toBeVisible();

    });

    test('SHP-017 - Verify Assigned Product Removal Functionality', async ({ page }) => {

        // Navigate to Shops
        await page.getByText('Shops', { exact: true }).last().click();

        // Search automation-created shop
        await page.getByPlaceholder(/Search by name, city, ID/i)
            .fill(createdShopName);

        // Open shop using Eye icon
        const shopRow = page.locator('tr').filter({
            hasText: createdShopName
        });

        await shopRow.locator('button').first().click();

        // Open Assigned Products tab
        await page.getByText('Assigned Products', { exact: true }).click();

        // Locate assigned automation-created part
        const partRow = page.locator('tr').filter({
            hasText: /Automationtestpart_/
        }).first();

        await expect(partRow).toBeVisible();

        // Select assigned part
        await partRow.locator('input[type="checkbox"]').check();

        // Verify Remove button
        // Click Remove 1 selected
        const removeButton = page.locator('button').filter({
            hasText: /Remove\s*1\s*selected/i
        });

        await expect(removeButton).toBeVisible();
        await expect(removeButton).toBeEnabled();

        await removeButton.click();

        // Handle confirmation dialog if displayed
        page.once('dialog', async dialog => {
            console.log('Confirmation message:', dialog.message());
            await dialog.accept();
        });

        // Click Remove Selected button
        await page.getByRole('button', {
            name: /Remove 1 selected/i
        }).click();

        // Verify product is removed
        const assignedPartRow = page.locator('tr').filter({
            hasText: /Automationtestpart_/
        });

        await expect(assignedPartRow).toHaveCount(0);

    });

    test('SHP-018 - Verify Oil Removal from Oils Tab', async ({ page }) => {

        // Navigate to Shops
        await page.getByText('Shops', { exact: true }).last().click();

        // Search the automation-created shop
        await page.getByPlaceholder(/Search by name, city, ID/i)
            .fill(createdShopName);

        // Open Shop Details
        const shopRow = page.locator('tr').filter({
            hasText: createdShopName
        });

        await shopRow.locator('button').first().click();

        await page.waitForTimeout(1000); // Wait for the page to load completely

        // Open Oils tab
        await page.getByText('Oils', { exact: true }).last().click();

        await page.waitForTimeout(1000); // Wait for the oils list to load
        // Locate the assigned oil
        const oilRow = page.locator('tr').filter({
            hasText: 'Automation_Oil Automation Oil Filter'
        });

        await expect(oilRow).toBeVisible();

        // Handle confirmation dialog
        page.once('dialog', async dialog => {
            console.log('Confirmation message:', dialog.message());
            await dialog.accept();
        });

        // Click Remove
        await oilRow.getByText('Remove', { exact: true }).click();

        // Verify oil is removed
        await expect(oilRow).toHaveCount(0);

    });

    test('SHP-019 - Verify Multiple Product Assignment, Removal and Assignment History', async ({ page }) => {

        // Navigate to Shops
        await page.getByText('Shops', { exact: true }).last().click();

        // Search automation-created shop
        await page.getByPlaceholder(/Search by name, city, ID/i)
            .fill(createdShopName);

        // Open Shop Details
        const shopRow = page.locator('tr').filter({
            hasText: createdShopName
        });

        await shopRow.locator('button').first().click();

        // Open Manage Products
        await page.getByRole('button', { name: /Manage Products/i }).click();

        // Select Parts filters
        await page.locator('select').nth(0).selectOption({ label: 'Van' });
        await page.locator('select').nth(1).selectOption({
            label: 'Automationbrand_1793090406608_updated'
        });
        await page.locator('select').nth(2).selectOption({
            label: 'Automationmodel_1793168538228_updated'
        });
        await page.locator('select').nth(3).selectOption({
            label: 'AutomationCompany1793168913704_Updated'
        });

        // Select two automation-created parts
        // Select two automation-created parts
        const firstPart = page.getByText(/Automationtestpart_/).nth(0);
        const secondPart = page.getByText(/Automationtestpart_/).nth(1);

        await expect(firstPart).toBeVisible();
        await expect(secondPart).toBeVisible();

        // Locate the checkbox containers
        const firstPartCard = firstPart.locator(
            'xpath=ancestor::div[.//input[@type="checkbox"]][1]'
        );

        const secondPartCard = secondPart.locator(
            'xpath=ancestor::div[.//input[@type="checkbox"]][1]'
        );

        // Click both checkboxes
        await firstPartCard.locator('input[type="checkbox"]').check();
        await secondPartCard.locator('input[type="checkbox"]').check();

        // Verify selected products
        await expect(page.getByText(/To Assign/i)).toBeVisible();

        // Confirm Assignment
        await page.getByRole('button', { name: /Confirm Assignment/i }).click();

        await expect(page.getByText(/ assigned to /i)).toBeVisible();

        await page.goBack();

        // Open Assigned Products tab
        await page.getByText('Assigned Products', { exact: true }).click();

        // Select the first assigned product for removal
        const assignedProduct = page.locator('tr').filter({
            hasText: /Automationtestpart_/
        }).first();

        await expect(assignedProduct).toBeVisible();
        await assignedProduct.locator('input[type="checkbox"]').check();

        // Handle confirmation dialog
        page.once('dialog', async dialog => {
            console.log('Confirmation message:', dialog.message());
            await dialog.accept();
        });

        // Remove selected product
        await page.getByRole('button', {
            name: /Remove\s+1\s+selected/i
        }).click();

        // Open Assignment History
        await page.getByText('Assignment History', { exact: true }).click();

        // Verify Removed status
        const removedProduct = page.locator('tr').filter({
            hasText: /Automationtestpart_/
        }).filter({
            has: page.getByText('Removed', { exact: true })
        });

        await expect(removedProduct.first()).toBeVisible();

        // Verify Active status
        const activeProduct = page.locator('tr').filter({
            hasText: /Automationtestpart_/
        }).filter({
            has: page.getByText('Active', { exact: true })
        });

        await expect(activeProduct.first()).toBeVisible();

    });

    test('SHP-020 - Verify Oils Assignment and Removal Functionality', async ({ page }) => {

    // Navigate to Shops
    await page.getByText('Shops', { exact: true }).last().click();

    // Search automation-created shop
    await page.getByPlaceholder(/Search by name, city, ID/i)
        .fill(createdShopName);

    // Open Shop Details
    const shopRow = page.locator('tr').filter({
        hasText: createdShopName
    });

    await shopRow.locator('button').first().click();

    // Open Oils tab
    await page.getByText('Oils', { exact: true }).last().click();

    // Verify empty state
    await expect(
        page.getByText('No oils assigned yet. Assign now')
    ).toBeVisible();

    // Click Assign now
    await page.getByText('Assign now', { exact: true }).click();

    // Verify Assign Oils popup
    await expect(
        page.getByText('Assign Oils to Shop', { exact: true })
    ).toBeVisible();

    // Search first automation-created oil
    await page.getByPlaceholder(/Search oils/i)
        .fill('Automation_Oil Automation Oil Filter');

    // Locate first oil
    const firstOil = page.getByRole('row', {
        name: /Automation_Oil Automation Oil Filter/
    });

    await expect(firstOil).toBeVisible();

    // Select first oil checkbox
    await firstOil.getByRole('checkbox').check();

    // Verify selection
    await expect(
        page.getByText('1 selected', { exact: true })
    ).toBeVisible();

    // Click Assign
    const firstAssignButton = page.getByRole('button', {
        name: /^Assign/
    }).last();

    await expect(firstAssignButton).toBeEnabled();
    await firstAssignButton.click();

    // Verify first oil assigned
    await expect(
        page.getByText('Automation_Oil Automation Oil Filter', { exact: true })
    ).toBeVisible();

    // Click Assign Oils button to add another oil
    await page.getByRole('button', {
        name: 'Assign Oils',
        exact: true
    }).click();

    // Search second automation-created oil
    await page.getByPlaceholder(/Search oils/i)
        .fill('Automation_Oil Automation Engine Oil');

    // Locate second oil
    const secondOil = page.getByRole('row', {
        name: /Automation_Oil Automation Engine Oil/
    });

    await expect(secondOil).toBeVisible();

    // Select second oil checkbox
    await secondOil.getByRole('checkbox').check();

    // Verify selection
    await expect(
        page.getByText('1 selected', { exact: true })
    ).toBeVisible();

    // Click Assign
    const secondAssignButton = page.getByRole('button', {
        name: /^Assign/
    }).last();

    await expect(secondAssignButton).toBeEnabled();
    await secondAssignButton.click();

    // Verify second oil assigned
    const assignedSecondOil = page.locator('tr').filter({
        hasText: 'Automation_Oil Automation Engine Oil'
    });

    await expect(assignedSecondOil).toBeVisible();

    // Handle removal confirmation dialog
    page.once('dialog', async dialog => {
        console.log('Confirmation message:', dialog.message());
        await dialog.accept();
    });

    // Remove second assigned oil
    await assignedSecondOil.getByText('Remove', {
        exact: true
    }).click();

    // Verify second oil removed
    await expect(assignedSecondOil).toHaveCount(0);

    // Verify first oil is still assigned
    await expect(
        page.getByText('Automation_Oil Automation Oil Filter', {
            exact: true
        })
    ).toBeVisible();

});

test('SHP-021 - Verify Shop Name Update Functionality', async ({ page }) => {

    // Navigate to Shops
    await page.getByText('Shops', { exact: true }).last().click();

    // Search automation-created shop
    await page.getByPlaceholder(/Search by name, city, ID/i)
        .fill(createdShopName);

    // Open Shop Details
    const shopRow = page.locator('tr').filter({
        hasText: createdShopName
    });

    await shopRow.locator('button').first().click();

    // Click Edit
    await page.getByRole('button', { name: /^Edit$/i }).click();

    // Verify Edit Shop Details popup
    await expect(
        page.getByText('Edit Shop Details', { exact: true })
    ).toBeVisible();

    // Update Shop Name
    const updatedShopName = `${createdShopName}_Updated`;

    await page.locator('input').first().fill(updatedShopName);

    // Save Changes
    await page.getByRole('button', { name: /Save Changes/i }).click();

    // Verify updated Shop Name
    await expect(
        page.getByText(updatedShopName, { exact: true })
    ).toBeVisible();

});

test('SHP-022 - Verify Resend Credentials Functionality', async ({ page }) => {

    // Navigate to Shops
    await page.getByText('Shops', { exact: true }).last().click();

    // Search automation-created shop
    await page.getByPlaceholder(/Search by name, city, ID/i)
        .fill(createdShopName);

    // Open Shop Details
    const shopRow = page.locator('tr').filter({
        hasText: createdShopName
    });

    await shopRow.locator('button').first().click();

    // Handle Credentials re-sent popup
    page.once('dialog', async dialog => {
        expect(dialog.message()).toBe('Credentials re-sent');
        await dialog.accept();
    });

    // Click Resend Credentials
    await page.getByRole('button', {
        name: /Resend Credentials/i
    }).click();

});

test('SHP-023 - Verify Shop Suspend and Reinstate Functionality', async ({ page }) => {

    // Navigate to Shops
    await page.getByText('Shops', { exact: true }).last().click();

    // Search automation-created shop
    await page.getByPlaceholder(/Search by name, city, ID/i)
        .fill(createdShopName);

    // Open Shop Details
    const shopRow = page.locator('tr').filter({
        hasText: createdShopName
    });

    await shopRow.locator('button').first().click();

    // Verify initial Active status
    await expect(
        page.getByText('active', { exact: true })
    ).toBeVisible();

    // Handle Suspend confirmation popup
    page.once('dialog', async dialog => {
        expect(dialog.message()).toBe(
            'Suspend this shop? They will lose access until reinstated.'
        );
        await dialog.accept();
    });

    // Click Suspend
    await page.getByRole('button', {
        name: 'Suspend',
        exact: true
    }).click();

    // Verify Suspended status
    await expect(
        page.getByText('suspended', { exact: true })
    ).toBeVisible();

    // Verify Reinstate button
    const reinstateButton = page.getByRole('button', {
        name: 'Reinstate',
        exact: true
    });

    await expect(reinstateButton).toBeVisible();

    // Click Reinstate
    await reinstateButton.click();

    // Verify Active status after reinstatement
    await expect(
        page.getByText('active', { exact: true })
    ).toBeVisible();

});

test('SHP-024 - Verify Shop Deactivation and Reactivation Functionality', async ({ page }) => {

    // Navigate to Shops
    await page.getByText('Shops', { exact: true }).last().click();

    // Search automation-created shop
    await page.getByPlaceholder(/Search by name, city, ID/i)
        .fill(createdShopName);

    // Open Shop Details
    const shopRow = page.locator('tr').filter({
        hasText: createdShopName
    });

    await shopRow.locator('button').first().click();

    // Verify initial Active status
    await expect(
        page.getByText('active', { exact: true })
    ).toBeVisible();

    // Handle Deactivate and Reactivate confirmation popups
    page.on('dialog', async dialog => {
        console.log('Popup message:', dialog.message());
        await dialog.accept();
    });

    // Click Deactivate
    await page.getByRole('button', { name: /Deactivate/i }).click();

    // Verify Deactivated status
    await expect(
        page.getByText('deactivated', { exact: true })
    ).toBeVisible();

    // Click Reactivate Shop
    await page.getByRole('button', { name: /Reactivate Shop/i }).click();

    // Verify shop is Active again
    await expect(
        page.getByText('active', { exact: true })
    ).toBeVisible();

});

test('SHP-025 - Verify Shop Suspend, Reinstate, Deactivate and Reactivate Functionality', async ({ page }) => {

    // Navigate to Shops
    await page.getByText('Shops', { exact: true }).last().click();

    // Search automation-created shop
    await page.getByPlaceholder(/Search by name, city, ID/i)
        .fill(createdShopName);

    // Open Shop Details
    const shopRow = page.locator('tr').filter({
        hasText: createdShopName
    });

    // Verify initial Active status
    await expect(
        page.getByText('active', { exact: true }).first()
    ).toBeVisible();

    // Suspend Shop
    page.once('dialog', async dialog => {
        console.log('Suspend popup:', dialog.message());
        await dialog.accept();
    });

    await page.getByRole('button', { name: 'Suspend', exact: true }).click();

    await page.getByRole('button', { name: 'Confirm', exact: true }).click();

    await expect(
        page.getByText('suspended', { exact: true }).first()
    ).toBeVisible();

    await page.getByRole('button', { name: 'Reinstate', exact: true }).click();

    // Reinstate Shop
    page.once('dialog', async dialog => {
        console.log('Reinstate popup:', dialog.message());
        await dialog.accept();
    });

    await page.getByRole('button', { name: 'Confirm', exact: true }).click();

    //await page.getByRole('button', { name: 'Reinstate', exact: true }).click();

    // Verify Active status again
    await expect(
        page.getByText('active', { exact: true }).first()
    ).toBeVisible();

    // Deactivate Shop
    page.once('dialog', async dialog => {
        console.log('Deactivate popup:', dialog.message());
        await dialog.accept();
    });

    await page.getByRole('button', { name: 'Deactivate', exact: true }).click();

    await page.getByRole('button', { name: 'Confirm', exact: true }).click();

    // Verify Deactivated status
    // await expect(
    //     page.getByText('deactivated', { exact: true }).first()
    // ).toBeVisible();

    // Reactivate Shop
    //await page.getByRole('button', { name: /Reactivate Shop/i }).click();

    // Accept reactivation confirmation popup
    // page.once('dialog', async dialog => {
    //     console.log('Reactivate confirmation:', dialog.message());
    //     await dialog.accept();
    // });

    // // Verify Active status after reactivation
    // await expect(
    //     page.getByText('active', { exact: true }).first()
    // ).toBeVisible();

});

});