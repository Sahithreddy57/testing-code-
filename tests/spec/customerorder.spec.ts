
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login';
import { CustomerOrdersPage, OrderStatus, parseOrderDateTime } from '../pages/customerorder';

let orders: CustomerOrdersPage;
let pageErrors: string[] = [];
const MAX_ROWS = 15;

test.setTimeout(120000);

test.beforeEach(async ({ page }) => {
    pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    const login = new LoginPage(page);
    await login.open();
    await login.login();
    orders = new CustomerOrdersPage(page);
    await orders.openFromSidebar();
});

async function needOrders(min = 1): Promise<number> {
    const count = await orders.rowCount();
    test.skip(count < min, `Needs at least ${min} order(s) in the list`);
    return count;
}

async function needNoOrders(): Promise<void> {
    const count = await orders.rowCount();
    test.skip(count > 0, 'Needs a store with no orders');
}

async function openCodePopup(): Promise<void> {
    const confirmed = orders.rowsWithStatus('Confirmed');
    test.skip(await confirmed.count() === 0, 'No Confirmed order in the list');
    await orders.openCodePopupFor(confirmed.first());
}

// NAVIGATION

test('CO-002 - Verify navigation to Customer Orders page', async () => {
    await expect(orders.heading).toBeVisible();
    expect(pageErrors).toEqual([]);
});

test('CO-004 - Verify Customer Orders breadcrumb', async () => {
    await expect(orders.breadcrumb).toBeVisible();
});

// PAGE UI

test('CO-005 - Verify Customer Orders page heading', async () => {
    await expect(orders.heading).toBeVisible();
    await expect(orders.heading).toHaveText(/^\s*Customer Orders\s*$/);
});

test('CO-006 - Verify order-management banner label', async () => {
    await expect(orders.bannerTag).toBeVisible();
});

test('CO-007 - Verify banner description', async () => {
    await expect(orders.bannerDescription).toBeVisible();
});

test('CO-008 - Verify Refresh button visibility', async () => {
    await expect(orders.refreshButton).toBeVisible();
    await expect(orders.refreshButton).toBeEnabled();
});

test('CO-037 - Verify page loads again after browser reload', async () => {
    await orders.reload();
    await expect(orders.ordersCount.or(orders.emptyTitle).first()).toBeVisible();
});

// REFRESH

test('CO-009 - Verify Refresh reloads order data', async () => {
    const before = await orders.rowTexts();
    await orders.clickRefresh();
    await expect(orders.heading).toBeVisible();
    expect(await orders.rowTexts()).toEqual(before);
    expect(pageErrors).toEqual([]);
});

test('CO-034 - Verify no duplicate orders after refresh', async () => {
    await needOrders();
    const before = await orders.rowTexts();
    for (let i = 0; i < 3; i++) await orders.clickRefresh();
    const after = await orders.rowTexts();
    expect(after).toEqual(before);
    expect(new Set(after).size).toBe(after.length);
});

// ORDERS COUNT

test('CO-011 - Verify order count is displayed', async () => {
    await expect(orders.ordersCount).toBeVisible();
});

test('CO-013 - Verify count matches displayed orders', async () => {
    await needOrders();
    expect(await orders.countLabelValue()).toBe(await orders.rowCount());
});

// EMPTY STATE

test('CO-014 - Verify empty-state message', async () => {
    await needNoOrders();
    await expect(orders.emptyTitle).toBeVisible();
});

test('CO-015 - Verify empty-state helper text', async () => {
    await needNoOrders();
    await expect(orders.emptyMessage).toBeVisible();
});

test('CO-016 - Verify empty-state icon', async () => {
    await needNoOrders();
    await expect(orders.emptyPanel.locator('svg, img').first()).toBeVisible();
});

test('CO-017 - Verify no order rows appear in empty state', async () => {
    await needNoOrders();
    await expect(orders.orderRows).toHaveCount(0);
});

// ORDER LIST DATA

test('CO-038 - Verify each order row shows required fields', async () => {
    const count = await needOrders();
    for (let i = 0; i < Math.min(count, MAX_ROWS); i++) {
        const row = orders.orderRows.nth(i);
        const info = await orders.rowInfo(row);
        expect(info.number, `Order number in row ${i + 1}`).not.toBeNull();
        expect(info.name, `Customer name in row ${i + 1}`).toBeTruthy();
        expect(info.phone, `Phone in row ${i + 1}`).not.toBeNull();
        expect(info.type, `Order type in row ${i + 1}`).not.toBeNull();
        expect(info.date, `Date in row ${i + 1}`).not.toBeNull();
        expect(info.time, `Time in row ${i + 1}`).not.toBeNull();
        expect(info.total, `Total in row ${i + 1}`).not.toBeNull();
        expect(info.status, `Status in row ${i + 1}`).not.toBeNull();
        await expect(row.locator('svg').last()).toBeVisible();
    }
});

test('CO-039 - Verify order type badge values', async () => {
    const count = await needOrders();
    for (let i = 0; i < Math.min(count, MAX_ROWS); i++) {
        await expect(orders.orderRows.nth(i).getByText(/^(Pickup|Delivery)$/)).toHaveCount(1);
    }
});

test('CO-040 - Verify status badge values', async () => {
    const count = await needOrders();
    for (let i = 0; i < Math.min(count, MAX_ROWS); i++) {
        await expect(orders.orderRows.nth(i).getByText(/^(Pending|Confirmed|Delivered|Rejected)$/)).toHaveCount(1);
    }
});

test('CO-041 - Verify orders are listed newest first', async () => {
    const count = await needOrders(2);
    const timestamps: number[] = [];
    for (let i = 0; i < Math.min(count, MAX_ROWS); i++) {
        const info = await orders.rowInfo(orders.orderRows.nth(i));
        timestamps.push(parseOrderDateTime(info.date!, info.time!));
    }
    for (let i = 1; i < timestamps.length; i++) {
        expect(timestamps[i - 1], `Row ${i} should not be older than row ${i + 1}`).toBeGreaterThanOrEqual(timestamps[i]);
    }
});

test('CO-042 - Verify total amount format', async () => {
    const count = await needOrders();
    for (let i = 0; i < Math.min(count, MAX_ROWS); i++) {
        await expect(orders.orderRows.nth(i).getByText(/^\$\d{1,3}(,\d{3})*\.\d{2}$/)).toHaveCount(1);
    }
});

test('CO-044 - Verify row details match expanded details', async () => {
    await needOrders();
    const row = orders.orderRows.first();
    const info = await orders.rowInfo(row);
    await orders.expandRow(row);
    const details = await orders.detailsText();
    expect(details).toContain(info.name!);
    expect(details).toContain(info.phone!);
    expect(details).toContain(info.date!);
    expect(details.toLowerCase()).toContain(info.time!.toLowerCase());
    expect(details).toContain(info.total!);
});

// ORDER DETAILS

test('CO-045 - Verify order expands on click', async () => {
    await needOrders();
    await orders.expandRow(orders.orderRows.first());
    await expect(orders.detailsPanel).toBeVisible();
});

test('CO-046 - Verify order collapses on second click', async () => {
    await needOrders();
    const row = orders.orderRows.first();
    await orders.expandRow(row);
    await orders.collapseRow(row);
});

test('CO-047 - Verify sections shown in order details', async () => {
    await needOrders();
    await orders.expandRow(orders.orderRows.first());
    const details = await orders.detailsText();
    for (const label of [/Order Information/i, /Customer/i, /Contact/i, /Order Placed/i, /Ordered Products/i, /Item/i, /Quantity/i, /Price/i, /Subtotal/i, /Total Amount/i]) {
        expect(details).toMatch(label);
    }
});

test('CO-048 - Verify delivery order shows address and instructions', async () => {
    const delivery = orders.rowsWithType('Delivery');
    test.skip(await delivery.count() === 0, 'No Delivery order in the list');
    await orders.expandRow(delivery.first());
    const details = await orders.detailsText();
    expect(details).toMatch(/Delivery Address/i);
    expect(details).toMatch(/Delivery Instructions/i);
});

test('CO-050 - Verify subtotal and total calculation', async () => {
    await needOrders();
    await orders.expandRow(orders.orderRows.first());
    const details = await orders.detailsText();
    const toCents = (value: string) => Math.round(Number(value.replace(/,/g, '')) * 100);
    const items = [...details.matchAll(/(\d+)\s*[x×]\s*\$([\d,]+\.\d{2})\s+\$([\d,]+\.\d{2})/g)];
    expect(items.length, 'At least one product row').toBeGreaterThan(0);
    let sum = 0;
    for (const [, quantity, price, subtotal] of items) {
        expect(toCents(subtotal)).toBe(Number(quantity) * toCents(price));
        sum += toCents(subtotal);
    }
    const total = details.match(/Total Amount\s*\$([\d,]+\.\d{2})/i);
    expect(total).not.toBeNull();
    expect(toCents(total![1])).toBe(sum);
});

test('CO-052 - Verify Print order copy button visibility', async () => {
    await needOrders();
    await orders.expandRow(orders.orderRows.first());
    await expect(orders.printOrderButton).toBeVisible();
    await expect(orders.printOrderButton).toBeEnabled();
});

// PENDING ORDER BUTTONS

test('CO-054 - Verify Approve and Reject buttons for Pending order', async () => {
    const pending = orders.rowsWithStatus('Pending');
    test.skip(await pending.count() === 0, 'No Pending order in the list');
    await orders.expandRow(pending.first());
    await expect(orders.approveButton).toBeVisible();
    await expect(orders.rejectButton).toBeVisible();
});

test('CO-055 - Verify Approve and Reject hidden for other statuses', async () => {
    const statuses: OrderStatus[] = ['Confirmed', 'Delivered', 'Rejected'];
    let checked = 0;
    for (const status of statuses) {
        if (await orders.rowsWithStatus(status).count() === 0) continue;
        await test.step(`${status} order has no Approve/Reject`, async () => {
            await orders.reload();
            await orders.expandRow(orders.rowsWithStatus(status).first());
            await expect(orders.approveButton).toHaveCount(0);
            await expect(orders.rejectButton).toHaveCount(0);
        });
        checked++;
    }
    test.skip(checked === 0, 'No Confirmed, Delivered or Rejected order in the list');
});

// MARK DELIVERED

test('CO-061 - Verify Mark delivered button for Confirmed order', async () => {
    const confirmed = orders.rowsWithStatus('Confirmed');
    test.skip(await confirmed.count() === 0, 'No Confirmed order in the list');
    await orders.expandRow(confirmed.first());
    await expect(orders.markDeliveredButton).toBeVisible();
    await expect(orders.approveButton).toHaveCount(0);
    await expect(orders.rejectButton).toHaveCount(0);
});

test('CO-062 - Verify Mark delivered hidden for other statuses', async () => {
    const statuses: OrderStatus[] = ['Pending', 'Delivered', 'Rejected'];
    let checked = 0;
    for (const status of statuses) {
        if (await orders.rowsWithStatus(status).count() === 0) continue;
        await test.step(`${status} order has no Mark delivered`, async () => {
            await orders.reload();
            await orders.expandRow(orders.rowsWithStatus(status).first());
            await expect(orders.markDeliveredButton).toHaveCount(0);
        });
        checked++;
    }
    test.skip(checked === 0, 'No Pending, Delivered or Rejected order in the list');
});

// PICKUP CODE POPUP

test('CO-063 - Verify pickup code popup opens with all elements', async () => {
    const confirmed = orders.rowsWithStatus('Confirmed');
    test.skip(await confirmed.count() === 0, 'No Confirmed order in the list');
    const info = await orders.rowInfo(confirmed.first());
    await orders.openCodePopupFor(confirmed.first());
    const popupText = await orders.codePopup.innerText();
    expect(popupText).toMatch(/order\s*#\w+/i);
    expect(popupText).toContain(info.name!);
    expect(popupText).toContain(info.phone!);
    await expect(orders.codeInput).toHaveCount(1); // one input drawn as six boxes
    await expect(orders.codeInput).toHaveValue('');
    await expect(orders.sendNewCodeLink).toBeVisible();
    await expect(orders.deliverWithoutCodeLink).toBeVisible();
    await expect(orders.cancelButton).toBeVisible();
    await expect(orders.verifyButton).toBeVisible();
});

test('CO-064 - Verify Verify & mark delivered stays disabled until 6 digits are entered', async () => {
    await openCodePopup();
    await expect(orders.verifyButton).toBeDisabled();

    await orders.codeInput.fill('12345');
    await expect(orders.verifyButton).toBeDisabled();

    await orders.codeInput.fill('123456');
    await expect(orders.verifyButton).toBeEnabled(); // button is not clicked
});

test('CO-065 - Verify code boxes accept digits only', async ({ page }) => {
    await openCodePopup();
    await orders.codeInput.click();
    await page.keyboard.type('ab@#');
    await expect(orders.codeInput).toHaveValue('');

    await page.keyboard.type('5');
    await expect(orders.codeInput).toHaveValue('5');
});

test('CO-066 - Verify digits fill in order and Backspace removes the last digit', async ({ page }) => {
    await openCodePopup();
    await orders.codeInput.click();

    await page.keyboard.type('1');
    await expect(orders.codeInput).toHaveValue('1');
    await page.keyboard.type('2');
    await expect(orders.codeInput).toHaveValue('12');

    await page.keyboard.press('Backspace');
    await expect(orders.codeInput).toHaveValue('1');
});
// HEADER / ACCESSIBILITY

test('CO-026 - Verify global header controls remain available', async () => {
    await expect(orders.headerPrintButton).toBeVisible();
    await expect(orders.headerNotificationButton).toBeVisible();
    await expect(orders.headerDate).toBeVisible();
    await expect(orders.headerProfile).toBeVisible();
});

test('CO-028 - Verify direct URL access to Customer Orders', async ({ page }) => {
    const ordersUrl = page.url();
    await orders.menuDashboard.click();
    const dashboardUrl = page.url();
    test.skip(ordersUrl === dashboardUrl, 'URL does not change between pages');
    await page.goto(ordersUrl);
    await expect(orders.heading).toBeVisible();
    await orders.waitForList();
});

test('CO-031 - Verify Refresh button is keyboard accessible', async ({ page }) => {
    await orders.heading.click();
    let reached = false;
    for (let i = 0; i < 60 && !reached; i++) {
        await page.keyboard.press('Tab');
        reached = await orders.refreshButton.evaluate(element => element === document.activeElement);
    }
    expect(reached).toBe(true);
    await expect(orders.refreshButton).toBeFocused();
    await page.keyboard.press('Enter');
    await orders.waitForList();
    await expect(orders.heading).toBeVisible();
    expect(pageErrors).toEqual([]);
});

test.only('CO-032 - Verify meaningful accessible name for Refresh button', async () => {
    await expect(orders.page.getByRole('button', { name: /refresh/i })).toHaveCount(1);
    await expect(orders.refreshButton).toBeVisible();
});
