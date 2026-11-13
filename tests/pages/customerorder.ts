
import { Page, Locator, expect } from '@playwright/test';

export type OrderStatus = 'Pending' | 'Confirmed' | 'Delivered' | 'Rejected';
export type OrderType = 'Pickup' | 'Delivery';

export interface OrderRowInfo {
  text: string;
  number: string | null;
  name: string | null;
  type: OrderType | null;
  phone: string | null;
  date: string | null;
  time: string | null;
  total: string | null;
  status: OrderStatus | null;
}

export const ORDER_NO = /^#\d+$/;
export const STATUS_TEXT = /^(Pending|Confirmed|Delivered|Rejected)$/;
export const TYPE_TEXT = /^(Pickup|Delivery)$/;
export const MONEY_TEXT = /^\$[\d,]+\.\d{2}$/;

function deepestWith(page: Page, ...needs: Locator[]): Locator {
  const build = () => needs.reduce((locator, need) => locator.filter({ has: need }), page.locator('*'));
  const all = build();
  return all.filter({ hasNot: all });
}

export function parseOrderDateTime(date: string, time: string): number {
  const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  const d = date.match(/(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})/);
  const t = time.match(/(\d{1,2}):(\d{2})\s*([ap]m)/i);
  if (!d || !t) throw new Error(`Invalid order date/time: ${date} ${time}`);
  let hour = Number(t[1]) % 12;
  if (/pm/i.test(t[3])) hour += 12;
  const month = months.indexOf(d[2].toLowerCase());
  if (month < 0) throw new Error(`Invalid month: ${d[2]}`);
  return new Date(Number(d[3]), month, Number(d[1]), hour, Number(t[2])).getTime();
}

export class CustomerOrdersPage {
  readonly page: Page;
  readonly menuCustomerOrders: Locator;
  readonly menuDashboard: Locator;
  readonly breadcrumb: Locator;
  readonly headerDate: Locator;
  readonly headerProfile: Locator;
  readonly headerPrintButton: Locator;
  readonly headerNotificationButton: Locator;
  readonly heading: Locator;
  readonly bannerTag: Locator;
  readonly bannerDescription: Locator;
  readonly refreshButton: Locator;
  readonly ordersCount: Locator;
  readonly orderRows: Locator;
  readonly orderNumbers: Locator;
  readonly emptyTitle: Locator;
  readonly emptyMessage: Locator;
  readonly emptyPanel: Locator;
  readonly detailsPanel: Locator;
  readonly printOrderButton: Locator;
  readonly approveButton: Locator;
  readonly rejectButton: Locator;
  readonly markDeliveredButton: Locator;
  readonly codePopupHeading: Locator;
  readonly codePopup: Locator;
  readonly codeInput: Locator;
  readonly sendNewCodeLink: Locator;
  readonly deliverWithoutCodeLink: Locator;
  readonly cancelButton: Locator;
  readonly verifyButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.menuCustomerOrders = page.locator('button.admin-menu-item', { hasText: /^Customer Orders$/ });
    this.menuDashboard = page.locator('button.admin-menu-item', { hasText: /^Dashboard$/ });
    this.breadcrumb = page.getByText(/^LB Smoke Shop\s*\/\s*Customer Orders$/);
    this.headerDate = page.getByText(/^[A-Za-z]{3}, [A-Za-z]{3} \d{1,2}, \d{4}$/);
    this.headerProfile = page.getByText(/^Store owner$/i);
    this.headerPrintButton = page.getByRole('button', { name: /print/i }).first();
    this.headerNotificationButton = page.getByRole('button', { name: /notification|bell/i }).first();
    this.heading = page.getByRole('heading', { name: /Customer Orders/i }).first();
    this.bannerTag = page.getByText(/order management/i);
    this.bannerDescription = page.getByText('View and manage customer orders.');
    this.refreshButton = page.getByRole('button', { name: /refresh/i });
    this.ordersCount = page.getByText(/^\d+\s+Orders?$/);
    this.orderNumbers = page.getByText(ORDER_NO);
    this.orderRows = deepestWith(page, page.getByText(ORDER_NO), page.getByText(STATUS_TEXT));
    this.emptyTitle = page.getByText('No orders found');
    this.emptyMessage = page.getByText(/appear here once they place an order/i);
    this.emptyPanel = deepestWith(page, this.emptyTitle, this.emptyMessage);
    this.detailsPanel = deepestWith(page, page.getByText(/^Order Information$/i), page.getByText(/^Ordered Products$/i));
    this.printOrderButton = this.detailsPanel.getByRole('button', { name: /print order copy/i });
    this.approveButton = this.detailsPanel.getByRole('button', { name: /approve/i });
    this.rejectButton = this.detailsPanel.getByRole('button', { name: /reject/i });
    this.markDeliveredButton = this.detailsPanel.getByRole('button', { name: /^\s*mark delivered\s*$/i });
    this.codePopupHeading = page.getByText(/^Enter the customer.s pickup code$/i);
    this.cancelButton = page.getByRole('button', { name: /^\s*cancel\s*$/i });
    this.codePopup = deepestWith(page, this.codePopupHeading, this.cancelButton);
    this.codeInput = this.codePopup.locator('input');
    this.sendNewCodeLink = this.codePopup.getByText(/send a new code/i);
    this.deliverWithoutCodeLink = this.codePopup.getByText(/deliver without code/i);
    this.verifyButton = this.codePopup.getByRole('button', { name: /verify\s*&\s*mark delivered/i });
  }

  async openFromSidebar(): Promise<void> {
    await this.menuCustomerOrders.click();
    await expect(this.heading).toBeVisible();
    await this.waitForList();
  }

  async reload(): Promise<void> {
    await this.page.reload();
    await expect(this.menuCustomerOrders).toBeVisible();
    if (!(await this.heading.isVisible())) await this.menuCustomerOrders.click();
    await expect(this.heading).toBeVisible();
    await this.waitForList();
  }

  async waitForList(): Promise<void> {
    await expect(this.ordersCount).toBeVisible();
    await this.page.waitForLoadState('networkidle').catch(() => { });
  }

  async clickRefresh(): Promise<void> {
    await this.refreshButton.click();
    await this.waitForList();
  }

  async rowCount(): Promise<number> {
    return this.orderRows.count();
  }

  async countLabelValue(): Promise<number> {
    const text = await this.ordersCount.innerText();
    return Number(text.match(/\d+/)?.[0] ?? NaN);
  }

  rowsWithStatus(status: OrderStatus): Locator {
    return this.orderRows.filter({ has: this.page.getByText(status, { exact: true }) });
  }

  rowsWithType(type: OrderType): Locator {
    return this.orderRows.filter({ has: this.page.getByText(type, { exact: true }) });
  }

  async rowTexts(): Promise<string[]> {
    return this.orderRows.allInnerTexts();
  }

  async rowInfo(row: Locator): Promise<OrderRowInfo> {
    const text = await row.innerText();
    const pick = (regex: RegExp, group = 0): string | null => text.match(regex)?.[group] ?? null;
    return {
      text,
      number: pick(/#\d+/),
      name: pick(/#\d+\s*([\s\S]*?)\s*(Pickup|Delivery)\b/, 1)?.trim() || null,
      type: pick(/\b(Pickup|Delivery)\b/) as OrderType | null,
      phone: pick(/\+?\d[\d ]{7,}\d/),
      date: pick(/\d{1,2}\s+[A-Za-z]{3}\s+\d{4}/),
      time: pick(/\d{1,2}:\d{2}\s*[ap]m/i),
      total: pick(/\$[\d,]+\.\d{2}/),
      status: pick(/\b(Pending|Confirmed|Delivered|Rejected)\b/) as OrderStatus | null
    };
  }

  async expandRow(row: Locator): Promise<void> {
    await row.scrollIntoViewIfNeeded();
    await row.locator('svg').last().click();
    await expect(this.detailsPanel).toBeVisible();
  }

  async collapseRow(row: Locator): Promise<void> {
    await row.locator('svg').last().click();
    await expect(this.detailsPanel).toBeHidden();
  }

  async detailsText(): Promise<string> {
    return this.detailsPanel.innerText();
  }

  async openCodePopupFor(row: Locator): Promise<void> {
    await this.expandRow(row);
    await this.markDeliveredButton.click();
    await expect(this.codePopupHeading).toBeVisible();
  }
}
