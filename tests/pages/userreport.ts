
import { Page, Locator, expect } from '@playwright/test';

export class UserReportsPage {
  readonly page: Page;

  // Sidebar
  readonly menuUserReports: Locator;
  readonly menuDashboard: Locator;

  // Banner
  readonly bannerTag: Locator;
  readonly heading: Locator;
  readonly bannerText: Locator;
  readonly downloadButton: Locator;
  readonly refreshButton: Locator;

  // Counters and search
  readonly totalCustomersLabel: Locator;
  readonly searchResultsLabel: Locator;
  readonly searchBox: Locator;

  // Registered customers
  readonly sectionTag: Locator;
  readonly sectionTitle: Locator;
  readonly customersBadge: Locator;
  readonly emptyTitle: Locator;
  readonly emptyText: Locator;
  readonly noResultsMessage: Locator;
  readonly emailTexts: Locator;

  // Dashboard
  readonly dashboardTotalCustomersLabel: Locator;

  constructor(page: Page) {
    this.page = page;

    // Sidebar
    this.menuUserReports = page.getByRole('button', { name: 'User Reports', exact: true });
    this.menuDashboard = page.getByRole('button', { name: 'Dashboard', exact: true });

    // Banner
    this.bannerTag = page.getByText(/^customer information$/i);
    this.heading = page.getByRole('heading', { name: 'User Reports' });
    this.bannerText = page.getByText('View registered customer information and account details.');
    this.downloadButton = page.getByRole('button', { name: /Download Excel/i });
    this.refreshButton = page.getByRole('button', { name: 'Refresh' });

    // Counters and search
    this.totalCustomersLabel = page.getByText('Total Customers', { exact: true });
    this.searchResultsLabel = page.getByText('Search Results', { exact: true });
    this.searchBox = page.getByPlaceholder(/Search by name, email or mobile number/i);

    // Registered customers
    this.sectionTag = page.getByText(/^registered customers$/i);
    this.sectionTitle = page.getByRole('heading', { name: 'Customer Details' });
    this.customersBadge = page.getByText(/^\d+\s+Customers?$/);
    this.emptyTitle = page.getByText('No Customers Yet');
    this.emptyText = page.getByText('Registered customers will appear here.');
    this.noResultsMessage = page.getByText(/no (customers|results|matching).*(found|match)|nothing found/i);
    this.emailTexts = page.getByText(/[\w.+-]+@[\w-]+\.[\w.]+/);

    // Dashboard
    this.dashboardTotalCustomersLabel = page.getByText(/^total customers$/i);
  }

  // PAGE NAVIGATION
  async openFromSidebar(): Promise<void> {
    await this.menuUserReports.click();
    await expect(this.heading).toBeVisible();
  }

  async expectLoaded(): Promise<void> {
    await expect(this.heading).toBeVisible();
  }

  async reload(): Promise<void> {
    await this.page.reload();
    await expect(this.menuUserReports).toBeVisible();

    if (!(await this.heading.isVisible())) {
      await this.menuUserReports.click();
    }

    await this.expectLoaded();
  }

  async openDashboard(): Promise<void> {
    await this.menuDashboard.click();
    await expect(this.dashboardTotalCustomersLabel.first()).toBeVisible();
  }

  // COUNTERS
  private async numberNextTo(label: Locator): Promise<number> {
    for (const level of [1, 2]) {
      const container = label.first().locator(`xpath=ancestor::div[${level}]`);
      const text = await container.innerText();
      const number = text.match(/\d+/)?.[0];

      if (number !== undefined) {
        return Number(number);
      }
    }

    return NaN;
  }

  async searchResults(): Promise<number> {
    return this.numberNextTo(this.searchResultsLabel);
  }

  async totalCustomers(): Promise<number> {
    return this.numberNextTo(this.totalCustomersLabel);
  }

  async badgeCount(): Promise<number> {
    const text = await this.customersBadge.innerText();
    return Number(text.match(/\d+/)?.[0] ?? NaN);
  }

  async dashboardTotalCustomers(): Promise<number> {
    return this.numberNextTo(this.dashboardTotalCustomersLabel);
  }

  // SEARCH
  async search(text: string): Promise<void> {
    await this.searchBox.fill(text);
  }

  async clearSearch(): Promise<void> {
    await this.searchBox.clear();
  }

  async typeSlowly(text: string): Promise<void> {
    await this.searchBox.clear();
    await this.searchBox.pressSequentially(text, { delay: 150 });
  }

  // CUSTOMER CARDS
  async listedCount(): Promise<number> {
    return this.emailTexts.count();
  }

  private async cardText(index: number): Promise<string> {
    const email = this.emailTexts.nth(index);
    const row = email.locator('xpath=ancestor::tr[1]');

    if (await row.count()) {
      return await row.innerText();
    }

    return await email.innerText();
  }

  async customerDetails(index = 0): Promise<{
    name: string;
    email: string;
    mobile: string;
    text: string;
  }> {
    const text = await this.cardText(index);

    const email = text.match(/[\w.+-]+@[\w-]+\.[\w.]+/)?.[0] ?? '';
    const mobile = text.match(/\+?\d[\d\s-]{6,}\d/)?.[0].trim() ?? '';

    const lines = text.split('\n').map(line => line.trim()).filter(Boolean);

    const name = lines.find(line =>
      !/^\d+$/.test(line) &&
      !/^[A-Z]$/i.test(line) &&
      !line.includes('@') &&
      !/\d{5,}/.test(line)
    ) ?? '';

    return { name, email, mobile, text };
  }
  // DOWNLOAD
  async downloadExcel() {
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.downloadButton.click()
    ]);

    return download;
  }
}
