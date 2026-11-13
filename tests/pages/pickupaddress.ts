
import { Page, Locator, expect } from '@playwright/test';

export interface PickupLocation {
  name: string;
  city: string;
  state: string;
  pincode: string;
  timeFrom: string;
  timeTo: string;
  address: string;
}

export class PickupAddressesPage {
  readonly page: Page;

  // Banner
  readonly menuPickupAddresses: Locator;
  readonly bannerTag: Locator;
  readonly bannerTitle: Locator;
  readonly bannerText: Locator;
  readonly refreshButton: Locator;

  // Add Pickup Address Form
  readonly formTitle: Locator;
  readonly formText: Locator;
  readonly nameBox: Locator;
  readonly cityBox: Locator;
  readonly stateBox: Locator;
  readonly pincodeBox: Locator;
  readonly pincodeHint: Locator;
  readonly timeFromBox: Locator;
  readonly timeToBox: Locator;
  readonly addressBox: Locator;
  readonly addButton: Locator;

  // Character Counters
  readonly nameCounter: Locator;
  readonly cityCounter: Locator;
  readonly addressCounter: Locator;

  // Saved Locations
  readonly savedTag: Locator;
  readonly savedTitle: Locator;
  readonly savedCount: Locator;
  readonly cards: Locator;

  constructor(page: Page) {
    this.page = page;

    // Banner
    this.menuPickupAddresses = page.getByRole('button', {
      name: 'Pickup Addresses',
      exact: true
    });
    this.bannerTag = page.getByText(/^pickup locations$/i);
    this.bannerTitle = page.getByRole('heading', {
      name: 'Add Pickup Addresses'
    });
    this.bannerText = page.getByText(
      'Add and manage pickup locations for LB Smoke Shop customers.'
    );
    this.refreshButton = page.getByRole('button', { name: 'Refresh' });

    // Add Pickup Address Form
    this.formTitle = page.getByText('Add New Pickup Address', {
      exact: true
    });
    this.formText = page.getByText(
      'Enter the details of the new pickup location.'
    );
    this.nameBox = page.getByPlaceholder(/Example: LB Smoke Shop/);
    this.cityBox = page.getByPlaceholder('Enter city');
    this.stateBox = page.locator('select').nth(0);
    this.pincodeBox = page.getByPlaceholder(/4-digit postcode/);
    this.pincodeHint = page.getByText(
      'Australian postcode: exactly 4 digits'
    );
    this.timeFromBox = page.locator('select').nth(1);
    this.timeToBox = page.locator('select').nth(2);
    this.addressBox = page.getByPlaceholder('Enter complete pickup address');
    this.addButton = page.getByRole('button', {
      name: /Add Pickup Address/
    });

    // Character Counters
    this.nameCounter = page.getByText(/^\d+\/60$/);
    this.cityCounter = page.getByText(/^\d+\/50$/);
    this.addressCounter = page.getByText(/^\d+\/250$/);

    // Saved Locations
    this.savedTag = page.getByText(/^saved locations$/i);
    this.savedTitle = page.getByRole('heading', {
      name: 'Pickup Addresses',
      exact: true
    });
    this.savedCount = page.getByText(/^\d+\s+Locations?$/);
    this.cards = page.locator('div').filter({
      has: page.getByRole('button', { name: 'Edit' })
    });
  }

  // Navigation
  async open(): Promise<void> {
    await this.menuPickupAddresses.click();
    await expect(this.bannerTitle).toBeVisible();
  }

  async reload(): Promise<void> {
    await this.page.reload();
    await expect(this.bannerTitle).toBeVisible();
  }

  // Saved Location Count
  async getLocationCount(): Promise<number> {
    const text = await this.savedCount.innerText();
    return Number(text.match(/\d+/)?.[0] ?? 0);
  }

  // Individual Location Card
  card(name: string): Locator {
    return this.page.locator('div')
      .filter({
        has: this.page.getByText(name, { exact: true })
      })
      .filter({
        has: this.page.getByRole('button', { name: 'Edit' })
      })
      .last();
  }

  // Dropdown Helpers
  async getSelectedText(select: Locator): Promise<string> {
    return (await select.locator('option:checked').innerText()).trim();
  }

  async getDropdownOptions(select: Locator): Promise<string[]> {
    const options = await select.locator('option').allInnerTexts();
    return options.map(option => option.trim());
  }

  // State Short Code
  stateCode(stateLabel: string): string {
    return stateLabel.match(/\(([A-Z]+)\)/)?.[1] ?? stateLabel;
  }

  // Pickup Time Slot
  timeText(data: Pick<PickupLocation, 'timeFrom' | 'timeTo'>): string {
    return `${data.timeFrom} - ${data.timeTo}`;
  }

  // Fill Pickup Address Form
  async fillForm(data: Partial<PickupLocation>): Promise<void> {
    if (data.name !== undefined) await this.nameBox.fill(data.name);
    if (data.city !== undefined) await this.cityBox.fill(data.city);
    if (data.state !== undefined) {
      await this.stateBox.selectOption({ label: data.state });
    }
    if (data.pincode !== undefined) await this.pincodeBox.fill(data.pincode);
    if (data.timeFrom !== undefined) {
      await this.timeFromBox.selectOption({ label: data.timeFrom });
    }
    if (data.timeTo !== undefined) {
      await this.timeToBox.selectOption({ label: data.timeTo });
    }
    if (data.address !== undefined) await this.addressBox.fill(data.address);
  }

  // Add Pickup Address
  async addLocation(data: Partial<PickupLocation>): Promise<void> {
    await this.fillForm(data);
    await this.addButton.click();
  }

  // Edit Pickup Address
  async editLocation(
    currentName: string,
    updatedData: Partial<PickupLocation>
  ): Promise<void> {
    const card = this.card(currentName);
    await card.getByRole('button', { name: 'Edit' }).click();
    await this.fillForm(updatedData);
    await this.addButton.click();
  }

  // Delete Pickup Address
  async deleteLocation(name: string): Promise<void> {
    const card = this.card(name);
    this.page.once('dialog', dialog => dialog.accept());
    await card.getByRole('button', { name: 'Delete' }).click();
    await expect(card).toHaveCount(0);
  }
}
