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

    // Navigate to Mechanics module
    await page.getByText('Mechanics', { exact: true }).click();

    });

    test('MEC-001 - Verify Navigation to Mechanic App', async ({ page }) => {

    // Verify Mechanics page
    await expect(
        page.getByText('Mechanics', { exact: true }).last()
    ).toBeVisible();

});

test('MEC-002 - Verify Mechanic Details Navigation', async ({ page }) => {

    // Verify Mechanics page
    await expect(page.getByRole('heading', {
        name: 'Mechanics',
        exact: true
    })).toBeVisible();

    // Select a mechanic
    const mechanicRow = page.locator('tr').filter({
        hasText: 'sahith Reddy'
    });

    await expect(mechanicRow).toBeVisible();

    // Click mechanic name
    await mechanicRow.getByText('sahith Reddy', {
        exact: true
    }).click();

    // Verify mechanic details
    await expect(
        page.getByText('sahith Reddy', { exact: true }).last()
    ).toBeVisible();

});

test('MEC-003 - Verify Shop Assignment to Mechanic', async ({ page }) => {

  const mechanicRow = page.locator('tr').filter({
    hasText: 'sahith Reddy'
  });

  await mechanicRow.getByText('sahith Reddy', {
    exact: true
  }).click();

  await page.getByRole('button', {
    name: 'Assign Shop',
    exact: true
  }).click();

  await expect(
    page.getByText('Assign / Reassign Shop')
  ).toBeVisible();

  const shopDropdown = page.locator('select').nth(1);

await expect(shopDropdown).toBeVisible();

await shopDropdown.selectOption({
  label: 'spoorthy sales'
});

await expect(shopDropdown).toHaveValue(
  await shopDropdown.locator('option', {
    hasText: 'spoorthy sales'
  }).getAttribute('value') || ''
);

await page.getByRole('button', {
    name: 'Confirm',
    exact: true
  }).click();

});

test('MEC-004 - Verify Mechanics Status Filter Functionality', async ({ page }) => {

  const statusDropdown = page.locator('select').nth(0);

const mechanicRows = page.locator('tbody tr');

// All Statuses
await statusDropdown.selectOption({ label: 'All Statuses' });
const totalMechanics = await mechanicRows.count();
console.log('Total Mechanics:', totalMechanics);

// Pending
await statusDropdown.selectOption({ label: 'Pending' });
console.log('Pending Mechanics:', await mechanicRows.count());

// Active
await statusDropdown.selectOption({ label: 'Active' });
console.log('Active Mechanics:', await mechanicRows.count());

// Suspended
await statusDropdown.selectOption({ label: 'Suspended' });
console.log('Suspended Mechanics:', await mechanicRows.count());

// Rejected
await statusDropdown.selectOption({ label: 'Rejected' });
console.log('Rejected Mechanics:', await mechanicRows.count());

});

test('MEC-005 - Verify Mechanics Search Functionality', async ({ page }) => {

    const searchBox = page.getByPlaceholder('Search mechanics…');
    const mechanicRows = page.locator('tbody tr');

    // Step 1: Verify search box visibility
    await expect(searchBox).toBeVisible();

    // Step 2: Search by mechanic name
    await searchBox.fill('sahith Reddy');

    await expect(
        page.getByText('sahith Reddy', { exact: true })
    ).toBeVisible();

    console.log('Search by mechanic name successful');

    // Step 3: Search by partial mechanic name
    await searchBox.fill('sahith');

    await expect(
        page.getByText('sahith Reddy', { exact: true })
    ).toBeVisible();

    console.log('Partial name search successful');

    // Step 4: Search by mechanic email
    await searchBox.fill('sahithreddyvegaahi@gmail.com');

    await expect(
        mechanicRows.first()
    ).toContainText('sahithreddyvegaahi@gmail.com');

    console.log('Search by email successful');

    // Step 5: Search using invalid data
    await searchBox.fill('InvalidMechanic123');

    await expect(
        page.getByText('No mechanics found')
    ).toBeVisible();

    console.log('Invalid search validation successful');

    // Step 6: Clear search
    await searchBox.clear();

    await expect(mechanicRows.first()).toBeVisible();

    console.log('Clear search successful');

});

test('MEC-006 - Verify Mechanic Approval Functionality', async ({ page }) => {

    const mechanicRow = page.locator('tr').filter({
        hasText: 'snehakolipaka0501@gmail.com'
    });

    // Verify mechanic is visible
    await expect(mechanicRow).toBeVisible();

    // Verify Pending status
    await expect(
        mechanicRow.getByText('pending', { exact: true })
    ).toBeVisible();

    // Click Approve
    await mechanicRow.getByRole('button', {
        name: 'Approve',
        exact: true
    }).click();

    // Verify Confirm button in popup
    const confirmButton = page.getByRole('button', {
        name: 'Confirm',
        exact: true
    });

    await expect(confirmButton).toBeVisible();

    // Click Confirm
    await confirmButton.click();

    // Verify status changes to Active
    await expect(
        mechanicRow.getByText('active', { exact: true })
    ).toBeVisible();

    console.log('Mechanic approved successfully');

});

test('MEC-007 - Verify Mechanic Suspend Functionality', async ({ page }) => {

    const mechanicRow = page.locator('tr').filter({
        hasText: 'snehakolipaka0501@gmail.com'
    });

    // Verify mechanic is visible
    await expect(mechanicRow).toBeVisible();

    // Verify Pending status
    await expect(
        mechanicRow.getByText('active', { exact: true })
    ).toBeVisible();

    // Click Suspend
    await mechanicRow.getByRole('button', {
        name: 'Suspend',
        exact: true
    }).click();

    // Verify Confirm button in popup
    const confirmButton = page.getByRole('button', {
        name: 'Confirm',
        exact: true
    });

    await expect(confirmButton).toBeVisible();

    // Click Confirm
    await confirmButton.click();

    // Verify status changes to Active
    await expect(
        mechanicRow.getByText('suspended', { exact: true })
    ).toBeVisible();

    console.log('Mechanic suspended successfully');
});

test('MEC-008 - Verify Mechanic Delete Functionality', async ({ page }) => {

    const mechanicRow = page.locator('tr').filter({
        hasText: 'snehakolipaka0501@gmail.com'
    });

    // Verify mechanic is visible
    await expect(mechanicRow).toBeVisible();

    // Verify Pending status
    await expect(
        mechanicRow.getByText('suspended', { exact: true })
    ).toBeVisible();

    // Click Delete
    await mechanicRow.getByRole('button', {
        name: 'Delete',
        exact: true
    }).click();

    // Verify Confirm button in popup
    const deleteButton = page.getByRole('button', {
        name: 'Delete',
        exact: true
    }).last();

    await expect(deleteButton).toBeVisible();

    // Click Confirm
    await deleteButton.click();

    // Verify mechanic is no longer visible
    await expect(mechanicRow).not.toBeVisible();

    console.log('Mechanic deleted successfully');
});

test.only('MEC-009 - Verify Mechanic Rejection Functionality', async ({ page }) => {

    const mechanicName = 'jaanu';
    const rejectionReason = 'Incomplete mechanic details';

    // Find the Pending mechanic
    const mechanicRow = page.getByRole('row').filter({
        hasText: mechanicName
    });

    // Click Reject
    await mechanicRow.getByRole('button', { name: 'Reject' }).click();

    // Verify Reject Mechanic popup
    await expect(
        page.getByRole('heading', { name: 'Reject Mechanic' })
    ).toBeVisible();

    // Enter rejection reason
    const reasonField = page.getByPlaceholder(
        'Why is this mechanic being rejected?'
    );

    await expect(reasonField).toBeVisible();
    await reasonField.fill(rejectionReason);

    // Click Confirm
    await page.getByRole('button', { name: 'Confirm' }).click();

    // Verify status changes to Rejected
    await expect(mechanicRow.getByText('Rejected')).toBeVisible();

});

});

