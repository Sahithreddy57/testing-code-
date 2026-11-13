import { test, expect } from '@playwright/test';

test.describe('Admin Notifications Tests', () => {

    test.beforeEach(async ({ page }) => {

        await page.goto('/');

        await page.locator('input[type="email"]')
            .fill(process.env.ADMIN_EMAIL!);

        await page.locator('input[type="password"]')
            .fill(process.env.ADMIN_PASSWORD!);

        await page.getByRole('button', { name: /sign in/i }).click();

        await expect(page).toHaveURL(/dashboard/i);
  
        await page.getByText('Notifications', { exact: true }).click();

    });

    // NOT-001 - Verify Navigation to Notifications Module
    test('NOT-001 - Verify Navigation to Notifications Module', async ({ page }) => {

        await expect(page).toHaveURL(/notifications/);

        await expect(
            page.getByRole('heading', { name: 'Notifications', exact: true })
        ).toBeVisible();

        await expect(
            page.getByText('Send Notification', { exact: true }).first()
        ).toBeVisible();

        await expect(
            page.getByText('Sent History', { exact: true })
        ).toBeVisible();

    });


test('NOT-002 - Verify Notifications UI Elements', async ({ page }) => {

    // Verify page heading
    await expect(
        page.getByRole('heading', { name: 'Notifications', exact: true })
    ).toBeVisible();

    // Verify Title field
    await expect(
        page.getByPlaceholder('Notification title')
    ).toBeVisible();

    // Verify Target Audience dropdown
    await expect(page.locator('select').first()).toBeVisible();

    // Verify Message Body
    await expect(
        page.getByPlaceholder(/Write your announcement or notification message/)
    ).toBeVisible();

    // Verify Push Notification checkbox
    await expect(
        page.getByLabel('Push Notification')
    ).toBeVisible();

    // Verify Email checkbox
    await expect(
        page.getByLabel('Email', { exact: true })
    ).toBeVisible();

    // Verify Send Notification button
    await expect(
        page.getByRole('button', { name: 'Send Notification' })
    ).toBeVisible();

    // Verify Sent History
    await expect(
        page.getByText('Sent History', { exact: true })
    ).toBeVisible();

});



test('NOT-003 - Verify Sending Notification with All Fields', async ({ page }) => {


    // Enter notification title
    await page.getByPlaceholder('Notification title')
        .fill('MechGo Service Update');

    // Select target audience
    await page.locator('select').first()
        .selectOption('all');

    // Enter message body
    await page.getByPlaceholder(
        /Write your announcement or notification message/
    ).fill('MechGo service updates are now available. Please check the latest announcements.');

    // Select Push Notification checkbox
    const pushCheckbox = page.getByLabel('Push Notification');

    if (!(await pushCheckbox.isChecked())) {
        await pushCheckbox.check();
    }

    // Select Email checkbox
    const emailCheckbox = page.getByLabel('Email', { exact: true });

    if (!(await emailCheckbox.isChecked())) {
        await emailCheckbox.check();
    }

    // Verify entered values
    await expect(
        page.getByPlaceholder('Notification title')
    ).toHaveValue('MechGo Service Update');

    await expect(page.locator('select').first())
        .toHaveValue('all');

    await expect(pushCheckbox).toBeChecked();
    await expect(emailCheckbox).toBeChecked();

    // Send notification
    await page.getByRole('button', {
        name: 'Send Notification'
    }).click();

    // Verify form reset after successful submission
    await expect(
        page.getByPlaceholder('Notification title')
    ).toHaveValue('');

});


test('NOT-004 - Verify Sent Notification History', async ({ page }) => {

    // Verify Sent History section
    await expect(
        page.getByText('Sent History', { exact: true })
    ).toBeVisible();

    // Verify notification title
    await expect(
        page.getByText('MechGo Service Update', { exact: true })
    ).toBeVisible();

    // Verify target audience
    await expect(
        page.getByText('All Users', { exact: true }).last()
    ).toBeVisible();

    // Verify notification channels
    await expect(
        page.getByText('Push, Email', { exact: true }).last()
    ).toBeVisible();

    // Verify sent date
    await expect(
        page.getByText('11/11/2026', { exact: true }).last()
    ).toBeVisible();

    // Verify record count
    await expect(
        page.getByText('3 records', { exact: true }).last()
    ).toBeVisible();

});





test.only('NOT-005 - Verify Delete Notification Functionality', async ({ page }) => {

    const notificationTitle = 'MechGo Service Update';

    // Locate the specific notification row
    const notificationRow = page.locator('tr')
        .filter({ hasText: notificationTitle })
        .first();

    await expect(notificationRow).toBeVisible();

    // Verify Delete button
    const deleteButton = notificationRow.locator(
        'button:has(svg.lucide-trash2)'
    );

    await expect(deleteButton).toBeVisible();

    // Accept browser confirmation popup
    page.once('dialog', async dialog => {
        console.log('Delete popup:', dialog.message());
        await dialog.accept();
    });

    // Delete notification
    await deleteButton.click();

    // Verify the selected row is removed
    await expect(notificationRow).toHaveCount(0, {
        timeout: 10000
    });

    console.log('Notification deleted successfully');

});



});
