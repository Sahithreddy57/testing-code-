import { Page, Locator } from '@playwright/test';

// Dashboard page: all locators and functions are in this one file
// (this includes the header and the sidebar, because they are shown on this page)
export class DashboardPage {
  readonly page: Page;

  // ---------- Locators: Header ----------
  readonly breadcrumbStore: Locator;
  readonly breadcrumbPage: Locator;
  readonly printButton: Locator;
  readonly bellButton: Locator;
  readonly dateChip: Locator;
  readonly adminName: Locator;
  readonly adminRole: Locator;

  // ---------- Locators: Sidebar ----------
  readonly menuDashboard: Locator;
  readonly menuAddProduct: Locator;
  readonly menuCategories: Locator;
  readonly menuCustomerOrders: Locator;
  readonly menuPickupAddresses: Locator;
  readonly menuUserReports: Locator;
  readonly menuProfile: Locator;

  // ---------- Locators: Welcome banner ----------
  readonly greeting: Locator;
  readonly banner: Locator;
  readonly bannerAddProduct: Locator;
  readonly bannerViewOrders: Locator;

  // ---------- Locators: Summary cards ----------
  readonly cardTitles: string[];

  // ---------- Locators: Order pipeline ----------
  readonly pipelineTitle: Locator;
  readonly deliveredPercent: Locator;
  readonly noOrdersMessage: Locator;
  readonly reviewOrdersButton: Locator;

  // ---------- Locators: Quick actions ----------
  readonly quickAddProduct: Locator;
  readonly quickManageCategories: Locator;
  readonly quickPickupLocations: Locator;
  readonly quickCustomerReports: Locator;

  // ---------- Locators: Pending user approvals ----------
  readonly pendingTitle: Locator;
  readonly pendingEmptyMessage: Locator;

  // ---------- Locators: Footer ----------
  readonly footer: Locator;

  constructor(page: Page) {
    this.page = page;

    // Header
    this.breadcrumbStore = page.getByText('LB Smoke Shop').first();
    this.breadcrumbPage = page.getByText('Dashboard', { exact: true }).first();
    this.printButton = page.getByRole('button', { name: /print/i });
    this.bellButton = page.getByRole('button', { name: /notification|bell/i });
    this.dateChip = page.getByText(/^[A-Z][a-z]{2}, [A-Z][a-z]{2} \d{1,2}, \d{4}$/);
    this.adminName = page.getByText('Admin', { exact: true }).first();
    this.adminRole = page.getByText('Store owner', { exact: true });

    //sidebar(navigations)
    this.menuDashboard = page.locator('button.admin-menu-item', { hasText: /^Dashboard$/ });
    this.menuAddProduct = page.locator('button.admin-menu-item', { hasText: /^Add Product$/ });
    this.menuCategories = page.locator('button.admin-menu-item', { hasText: /^Categories$/ });
    this.menuCustomerOrders = page.locator('button.admin-menu-item', { hasText: /^Customer Orders$/ });
    this.menuPickupAddresses = page.locator('button.admin-menu-item', { hasText: /^Pickup Addresses$/ });
    this.menuUserReports = page.locator('button.admin-menu-item', { hasText: /^User Reports$/ });
    this.menuProfile = page.locator('button.admin-menu-item', { hasText: /^Profile$/ });

    // Welcome banner
    this.greeting = page.getByRole('heading', { name: /Good (morning|afternoon|evening)/i });
    this.banner = page.locator('section.admin-welcome-banner');
    this.bannerAddProduct = this.banner.locator('button.lb-btn-primary');
    this.bannerViewOrders = this.banner.locator('button.lb-btn-glass');

    // Summary cards
    this.cardTitles = [
      'Total customers',
      'Total orders',
      'Pending orders',
      'Confirmed orders',
      'Delivered orders',
      'Rejected orders',
    ];

    // Order pipeline
    this.pipelineTitle = page.getByText('Order status breakdown');
    this.deliveredPercent = page.getByText(/^\d+(\.\d+)?%$/).first();
    this.noOrdersMessage = page.getByText(/No orders yet/i);
    this.reviewOrdersButton = page
      .getByRole('button', { name: /Review orders/i })
      .or(page.getByRole('link', { name: /Review orders/i }));

    // Quick actions (texts are unique, so no extra scoping needed)
    this.quickAddProduct = page.getByText('Add a product', { exact: true });
    this.quickManageCategories = page.getByText('Manage categories', { exact: true });
    this.quickPickupLocations = page.getByText('Pickup locations', { exact: true });
    this.quickCustomerReports = page.getByText('Customer reports', { exact: true });


    // Pending user approvals
    this.pendingTitle = page.getByText('Pending user approvals');
    this.pendingEmptyMessage = page.getByText(/all caught up/i);

    // Footer
    this.footer = page.getByText(/©\s*\d{4}/);
  }

  // ---------- Functions: Page ----------
  async open(): Promise<void> {
    await this.page.goto('/');
    await this.greeting.waitFor();
  }

  async reload(): Promise<void> {
    await this.page.reload();
  }

  // ---------- Functions: Sidebar ----------
  async openMenu(menu: Locator): Promise<void> {
    await menu.click();
  }

  // The active menu has a highlight. Update this check if your app uses a different class.
  async isMenuActive(menu: Locator): Promise<boolean> {
    const cls = (await menu.getAttribute('class')) ?? '';
    const aria = await menu.getAttribute('aria-current');
    return /active|selected|current/i.test(cls) || aria === 'page';
  }

  // ---------- Functions: Header ----------
  todayText(): string {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  // ---------- Functions: Greeting ----------
  // What the greeting should say now, based on the computer time
  expectedGreeting(date: Date = new Date()): RegExp {
    const hour = date.getHours();
    if (hour < 12) return /Good morning/i;
    if (hour < 17) return /Good afternoon/i;
    return /Good evening/i;
  }

  // ---------- Functions: Summary cards ----------
  // Deepest block that has the card title and a number
  card(title: string): Locator {
    return this.page
      .locator('div')
      .filter({ has: this.page.getByText(title, { exact: true }) })
      .filter({ hasText: /\d+/ })
      .last();
  }

  async cardValue(title: string): Promise<number> {
    const text = await this.card(title).innerText();
    const match = text.match(/\d+/);
    return match ? Number(match[0]) : NaN;
  }

  async allCardValues(): Promise<Record<string, number>> {
    const values: Record<string, number> = {};
    for (const title of this.cardTitles) {
      values[title] = await this.cardValue(title);
    }
    return values;
  }

  // ---------- Functions: Order pipeline ----------
  async deliveredPercentValue(): Promise<number> {
    const text = await this.deliveredPercent.innerText();
    return parseFloat(text);
  }

  async clickReviewOrders(): Promise<void> {
    await this.reviewOrdersButton.click();
  }

  // ---------- Functions: Banner and quick actions ----------
  async clickBannerAddProduct(): Promise<void> { await this.bannerAddProduct.click(); }
  async clickBannerViewOrders(): Promise<void> { await this.bannerViewOrders.click(); }
  async clickQuickAddProduct(): Promise<void> { await this.quickAddProduct.click(); }
  async clickQuickManageCategories(): Promise<void> { await this.quickManageCategories.click(); }
  async clickQuickPickupLocations(): Promise<void> { await this.quickPickupLocations.click(); }
  async clickQuickCustomerReports(): Promise<void> { await this.quickCustomerReports.click(); }
}