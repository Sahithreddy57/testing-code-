import { Page, Locator, expect } from '@playwright/test';

export class CategoriesPage {
  readonly page: Page;
  readonly main: Locator;

  // Sidebar
  readonly menuCategories: Locator;

  // Page heading and banner
  readonly heading: Locator;
  readonly bannerTag: Locator;
  readonly bannerDescription: Locator;
  readonly addCategoryButton: Locator;

  // Statistics
  readonly statCategoriesLabel: Locator;
  readonly statActiveLabel: Locator;
  readonly statInactiveLabel: Locator;
  readonly statSubCategoriesLabel: Locator;

  // Search and filters
  readonly searchInput: Locator;
  readonly filterAll: Locator;
  readonly filterActive: Locator;
  readonly filterInactive: Locator;

  //add category related locators
  readonly addCategoryHeading: Locator;
  readonly nameInput: Locator;
  readonly descriptionInput: Locator;
  readonly imageInput: Locator;
  readonly createCategoryButton: Locator;
  readonly cancelButton: Locator;
  readonly modal: Locator;
  // Category cards
  readonly categoryCards: Locator;
  readonly editButtons: Locator;
  readonly activeToggle: Locator;


  constructor(page: Page) {
    this.page = page;
    this.main = page.locator('main');

    // Sidebar
    this.menuCategories = page.locator('button.admin-menu-item', { hasText: /^Categories$/, });

    // Heading and banner
    this.heading = page.getByRole('heading', {
      name: 'Category Management',
    });

    this.bannerTag = page.getByText(/^catalogue$/i);

    this.bannerDescription = page.getByText(
      /Add and edit categories, organise sub-categories/i
    );

    this.addCategoryButton = page.getByRole('button', {
      name: /^add category$/i,
    });

    // Statistics
    this.statCategoriesLabel = this.main
      .getByText('Categories', { exact: true })
      .first();

    this.statActiveLabel = this.main
      .getByText('Active', { exact: true })
      .first();

    this.statInactiveLabel = this.main
      .getByText('Inactive', { exact: true })
      .first();

    this.statSubCategoriesLabel = this.main
      .getByText('Sub-categories', { exact: true })
      .first();

    // Search and filters
    this.searchInput = page.getByPlaceholder(
      /Search categories or sub-categories/i
    );

    this.filterAll = this.main.getByRole('tab', {
      name: 'All',
    });

    this.filterActive = this.main.getByRole('tab', { name: 'Active', }).first();

    this.filterInactive = this.main.getByRole('tab', {
      name: 'Inactive',
    });
    //add caetgory related locators
    this.addCategoryHeading = page.getByText('Add a category', {
      exact: true,
    });
    this.modal = page.getByRole('dialog');

    this.nameInput = this.modal.getByPlaceholder('e.g. Hookahs');

    this.descriptionInput = this.modal.getByPlaceholder(
      /A short line shown to help you identify this category/i
    );

    this.imageInput = this.modal.locator('input[type="file"]');

    this.createCategoryButton = this.modal.getByRole('button', {
      name: 'Create category',
    });

    this.cancelButton = this.modal.getByRole('button', {
      name: 'Cancel',
    });
    // Category cards
    this.categoryCards = this.main.locator('div').filter({
      has: page.getByRole('button', { name: /^edit$/i }),
    });

    this.editButtons = this.main.getByRole('button', {
      name: /^edit$/i,
    });
    //active toggle
    this.activeToggle = this.page.getByRole('switch', { name: 'Category status' });;


  }
  async toggleActiveStatus() {
    await this.activeToggle.click();
  }

  async isActiveStatusEnabled() {
    return await this.activeToggle.getAttribute('aria-checked') === 'true';
  }

  // Open Categories page from sidebar
  async openFromSidebar(): Promise<void> {
    await this.menuCategories.click();
    // await expect(this.heading).toBeVisible();
  }

  // Verify Categories page is loaded
  async verifyPageLoaded(): Promise<void> {
    await expect(this.heading).toBeVisible();
  }

  // Reload Categories page
  async reload(): Promise<void> {
    await this.page.reload();
    await expect(this.heading).toBeVisible();
  }
  // Open Add Category dialog
  async openAddCategoryDialog(): Promise<void> {
    await this.addCategoryButton.click();
    await expect(this.addCategoryHeading).toBeVisible();
  }

  // Fill Add Category form
  async fillCategoryForm(
    name: string,
    description: string,
    image: {
      name: string;
      mimeType: string;
      buffer: Buffer;
    }
  ): Promise<void> {
    await this.nameInput.fill(name);
    await this.descriptionInput.fill(description);
    await this.imageInput.setInputFiles(image);
  }

  // Create category
  async createCategory(): Promise<void> {
    await this.createCategoryButton.click();
  }

  // Get total category card count
  async getCategoryCount(): Promise<number> {
    return await this.editButtons.count();
  }
}