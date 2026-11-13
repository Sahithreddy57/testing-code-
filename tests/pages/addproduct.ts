
import { Page, Locator, expect } from '@playwright/test';

export type ImageInput =
  | string
  | { name: string; mimeType: string; buffer: Buffer };

export interface ProductDetails {
  name?: string;
  price?: string;
  brand?: string;
  flavour?: string;
  description?: string;
  note?: string;
  category?: string;
  subCategory?: string;
  image?: ImageInput;
}

export class AddProductPage {
  readonly page: Page;

  // Sidebar
  readonly menuAddProduct: Locator;

  // Page headings
  readonly heading: Locator;
  readonly bannerDescription: Locator;
  readonly sectionTag: Locator;
  readonly sectionDescription: Locator;

  // Form fields
  readonly productNameInput: Locator;
  readonly priceInput: Locator;
  readonly brandLabel: Locator;
  readonly brandInput: Locator;
  readonly flavourInput: Locator;
  readonly descriptionInput: Locator;
  readonly descriptionCounter: Locator;
  readonly noteInput: Locator;
  readonly categorySelect: Locator;
  readonly subCategorySelect: Locator;
  readonly imageInput: Locator;
  readonly addProductButton: Locator;

  // Messages
  readonly message: Locator;

  constructor(page: Page) {
    this.page = page;

    // Sidebar
    this.menuAddProduct = page.locator(
      'button.admin-menu-item',
      { hasText: /^Add Product$/ }
    );

    // Headings
    this.heading = page.getByRole('heading', {
      name: /Add New Product/i
    }).first();

    this.bannerDescription = page.getByText(
      /Add new smoke products and accessories/i
    );

    this.sectionTag = page.getByText(
      /product details/i
    ).first();

    this.sectionDescription = page.getByText(
      /Enter the product information, category and image/i
    );

    // Inputs
    this.productNameInput = page.getByPlaceholder(
      /Glass Water Pipe|Rolling Papers/i
    ).or(page.getByLabel('Product Name'));

    this.priceInput = page.locator('input[name="price"]');
    this.brandLabel = page.getByText(
      /Brand Name/i
    ).first();

    this.brandInput = page.getByPlaceholder(
      /RAW|Khalil Mamoon|Clipper/i
    ).or(page.getByLabel(/Brand Name/i));

    this.flavourInput = page.getByPlaceholder(
      /Double Apple|Mint|Unflavoured/i
    ).or(page.getByLabel(/Flavour/i));

    this.descriptionInput = page.getByPlaceholder(
      /Material, size, pack quantity/i
    ).or(page.getByLabel('Description'));

    this.descriptionCounter = page.getByText(
      /^\d+\s*\/\s*2000$/
    );

    this.noteInput = page.getByPlaceholder(
      /Limited stock/i
    ).or(page.getByLabel(/Note/i));

    this.categorySelect = page.locator('select[name="mainCategory"]');
    this.subCategorySelect = page.locator('select[name="category"]');

    this.imageInput = page.locator(
      'input[type="file"]'
    );

    this.addProductButton = page.locator(
      'button.add-product-submit-button'
    );

    this.message = page.getByRole('alert')
      .or(page.getByRole('status'));
  }

  // ---------------- PAGE FUNCTIONS ----------------

  async openFromSidebar(): Promise<void> {
    await this.menuAddProduct.click();
    await this.heading.waitFor();
  }

  async expectLoaded(): Promise<void> {
    await expect(this.heading).toBeVisible();
  }

  async reload(): Promise<void> {
    await this.page.reload();
    await this.expectLoaded();
  }

  // ---------------- FIELD FUNCTIONS ----------------

  async fillProductName(value: string): Promise<void> {
    await this.productNameInput.fill(value);
  }

  async fillPrice(value: string): Promise<void> {
    await this.priceInput.fill(value);
  }

  async fillBrand(value: string): Promise<void> {
    await this.brandInput.fill(value);
  }

  async fillFlavour(value: string): Promise<void> {
    await this.flavourInput.fill(value);
  }

  async fillDescription(value: string): Promise<void> {
    await this.descriptionInput.fill(value);
  }

  async fillNote(value: string): Promise<void> {
    await this.noteInput.fill(value);
  }

  async selectCategory(optionText: string): Promise<void> {
    await this.categorySelect.selectOption({
      label: optionText
    });
  }

  async selectSubCategory(optionText: string): Promise<void> {
    await this.subCategorySelect.selectOption({
      label: optionText
    });
  }

  async uploadImage(file: ImageInput): Promise<void> {
    await this.imageInput.setInputFiles(file);
  }

  async clickAddProduct(): Promise<void> {
    await this.addProductButton.click();
  }

  // ---------------- FORM FUNCTIONS ----------------

  async fillForm(details: ProductDetails): Promise<void> {
    if (details.name !== undefined)
      await this.fillProductName(details.name);

    if (details.price !== undefined)
      await this.fillPrice(details.price);

    if (details.brand !== undefined)
      await this.fillBrand(details.brand);

    if (details.flavour !== undefined)
      await this.fillFlavour(details.flavour);

    if (details.description !== undefined)
      await this.fillDescription(details.description);

    if (details.note !== undefined)
      await this.fillNote(details.note);

    if (details.category !== undefined)
      await this.selectCategory(details.category);

    if (details.subCategory !== undefined)
      await this.selectSubCategory(details.subCategory);

    if (details.image !== undefined)
      await this.uploadImage(details.image);
  }

  async addProduct(details: ProductDetails): Promise<void> {
    await this.fillForm(details);
    await this.clickAddProduct();
  }

  // ---------------- VALIDATION FUNCTIONS ----------------

  async descriptionCounterValue(): Promise<number> {
    const text = await this.descriptionCounter.innerText();
    const match = text.match(/^\d+/);

    return match ? Number(match[0]) : NaN;
  }

  async categoryOptionTexts(): Promise<string[]> {
    return this.categorySelect.locator('option').allInnerTexts();
  }

  async subCategoryOptionTexts(): Promise<string[]> {
    return this.subCategorySelect.locator('option').allInnerTexts();
  }

  async firstSubCategory(): Promise<string | undefined> {
    const options = await this.subCategoryOptionTexts();

    return options
      .map(text => text.trim())
      .find(text =>
        text && !/^(select|no)\b/i.test(text)
      );
  }

  async selectFirstCategoryWithSubCategory():
    Promise<{ category: string; subCategory: string } | undefined> {

    const categories = (await this.categoryOptionTexts())
      .map(text => text.trim())
      .filter(text => text && !/^select/i.test(text));

    for (const category of categories) {
      await this.selectCategory(category);

      await expect.poll(
        async () => this.subCategoryOptionTexts(),
        { timeout: 5000 }
      );

      const subCategory = await this.firstSubCategory();

      if (subCategory) {
        await this.selectSubCategory(subCategory);

        return { category, subCategory };
      }
    }

    return undefined;
  }

  async selectedImageName(): Promise<string> {
    return this.imageInput.evaluate(
      el => (el as HTMLInputElement).files?.[0]?.name ?? ''
    );
  }

  async brandShowsRequiredError(): Promise<boolean> {
    const nativeInvalid = await this.brandInput.evaluate(
      el => !(el as HTMLInputElement).validity.valid
    );

    const messageShown = await this.page
      .getByText(/required|please (enter|fill)/i)
      .first()
      .isVisible()
      .catch(() => false);

    return nativeInvalid || messageShown;
  }

  async expectFormCleared(): Promise<void> {
    await expect(this.productNameInput).toHaveValue('');
    await expect(this.brandInput).toHaveValue('');
    await expect(this.descriptionInput).toHaveValue('');
  }
}
