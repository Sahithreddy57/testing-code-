
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login';
import { PickupAddressesPage, PickupLocation } from '../pages/pickupaddress';
import { validPickupData } from '../helpers/pickupaddress_testdata';

let pickupPage: PickupAddressesPage;
const createdLocations: string[] = [];

test.setTimeout(120000);

const makeLocation = (): PickupLocation => ({
  ...validPickupData,
  name: `auto_loc_${Date.now()}`
});

const timeText = (location: PickupLocation) =>
  `${location.timeFrom} - ${location.timeTo}`;

async function addTestLocation(data: PickupLocation) {
  createdLocations.push(data.name);
  await pickupPage.addLocation(data);
}

test.beforeEach(async ({ page }) => {
  createdLocations.length = 0;
  const login = new LoginPage(page);
  await login.open();
  await login.login();
  pickupPage = new PickupAddressesPage(page);
  await pickupPage.open();
});

test.afterEach(async () => {
  try {
    await pickupPage.reload();
    for (const name of createdLocations) {
      if (await pickupPage.card(name).count()) {
        await pickupPage.deleteLocation(name);
      }
    }
  } catch {
    console.log('Cleanup could not be completed');
  }
});

// ======================================================================
// PAGE UI
// ======================================================================

test('PICK_TC_001 to PICK_TC_004 - Verify Pickup Addresses page UI', async () => {
  await expect(pickupPage.bannerTag).toBeVisible();
  await expect(pickupPage.bannerTitle).toBeVisible();
  await expect(pickupPage.bannerText).toBeVisible();
  await expect(pickupPage.refreshButton).toBeVisible();
  await expect(pickupPage.formTitle).toBeVisible();
  await expect(pickupPage.formText).toBeVisible();
  await expect(pickupPage.nameBox).toBeVisible();
  await expect(pickupPage.cityBox).toBeVisible();
  await expect(pickupPage.stateBox).toBeVisible();
  await expect(pickupPage.pincodeBox).toBeVisible();
  await expect(pickupPage.pincodeHint).toBeVisible();
  await expect(pickupPage.timeFromBox).toBeVisible();
  await expect(pickupPage.timeToBox).toBeVisible();
  await expect(pickupPage.addressBox).toBeVisible();
  await expect(pickupPage.addButton).toBeVisible();
  await expect(pickupPage.savedTag).toBeVisible();
  await expect(pickupPage.savedTitle).toBeVisible();
  await expect(pickupPage.savedCount).toBeVisible();
});

// ======================================================================
// DROPDOWNS AND CHARACTER COUNTERS
// ======================================================================

test('PICK_TC_045 - Verify State dropdown options', async () => {
  const options = await pickupPage.getDropdownOptions(pickupPage.stateBox);

  expect(options[0]).toBe('Select state or territory');

  for (const state of [
    'New South Wales (NSW)',
    'Victoria (VIC)',
    'Queensland (QLD)',
    'Western Australia (WA)',
    'South Australia (SA)',
    'Tasmania (TAS)',
    'Australian Capital Territory (ACT)',
    'Northern Territory (NT)'
  ]) {
    expect(options).toContain(state);
  }
});

test('PICK_TC_046 - Verify Pickup Time Slot From and To dropdowns', async () => {
  expect(await pickupPage.getSelectedText(pickupPage.timeFromBox)).toBe('From');
  expect(await pickupPage.getSelectedText(pickupPage.timeToBox)).toBe('To');

  const fromOptions = await pickupPage.getDropdownOptions(pickupPage.timeFromBox);
  const toOptions = await pickupPage.getDropdownOptions(pickupPage.timeToBox);

  for (const time of ['12:00 AM', '12:30 AM', '9:00 AM', '12:00 PM']) {
    expect(fromOptions).toContain(time);
    expect(toOptions).toContain(time);
  }
});

test('PICK_TC_047 - Verify character counters and maximum length', async () => {
  await expect(pickupPage.nameCounter).toHaveText('0/60');
  await expect(pickupPage.cityCounter).toHaveText('0/50');
  await expect(pickupPage.addressCounter).toHaveText('0/250');

  await pickupPage.nameBox.fill('abc');
  await pickupPage.cityBox.fill('abcd');
  await pickupPage.addressBox.fill('abcde');

  await expect(pickupPage.nameCounter).toHaveText('3/60');
  await expect(pickupPage.cityCounter).toHaveText('4/50');
  await expect(pickupPage.addressCounter).toHaveText('5/250');

  await pickupPage.nameBox.fill('a'.repeat(70));
  await pickupPage.cityBox.fill('b'.repeat(60));
  await pickupPage.addressBox.fill('c'.repeat(300));

  await expect(pickupPage.nameBox).toHaveValue('a'.repeat(60));
  await expect(pickupPage.cityBox).toHaveValue('b'.repeat(50));
  await expect(pickupPage.addressBox).toHaveValue('c'.repeat(250));
});

// ======================================================================
// ADD PICKUP ADDRESS
// ======================================================================

test.only('PICK_TC_005 to PICK_TC_009 - Add valid pickup address', async ({page}) => {
  page.on('dialog', d => { console.log('ALERT:', d.message()); d.accept(); });
  const location = makeLocation();
  const countBefore = await pickupPage.getLocationCount();

  await addTestLocation(location);

  const card = pickupPage.card(location.name);
  await expect(card).toBeVisible();
  await expect(card).toContainText(location.city);
  await expect(card).toContainText(pickupPage.stateCode(location.state));
  await expect(card).toContainText(location.pincode);
  await expect(card).toContainText(timeText(location));
  await expect(card).toContainText(location.address);

  await expect.poll(() => pickupPage.getLocationCount()).toBe(countBefore + 1);

  await expect(pickupPage.nameBox).toHaveValue('');
  await expect(pickupPage.cityBox).toHaveValue('');
  await expect(pickupPage.pincodeBox).toHaveValue('');
  
  await expect(pickupPage.addressBox).toHaveValue('');
  expect(await pickupPage.getSelectedText(pickupPage.stateBox)).toBe('Select state or territory');
  expect(await pickupPage.getSelectedText(pickupPage.timeFromBox)).toBe('From');
  expect(await pickupPage.getSelectedText(pickupPage.timeToBox)).toBe('To');

  await pickupPage.reload();
  await expect(pickupPage.card(location.name)).toBeVisible();
});

// ======================================================================
// REQUIRED FIELD VALIDATION
// ======================================================================

test('PICK_TC_010 to PICK_TC_016 - Verify required field validation', async ({ page }) => {
  const testCases: { id: string; data: Partial<PickupLocation> }[] = [
    { id: 'PICK_TC_010', data: {} },
    { id: 'PICK_TC_011', data: { name: 'Test Location' } },
    { id: 'PICK_TC_012', data: { city: 'Melbourne' } },
    { id: 'PICK_TC_013', data: { state: 'Victoria (VIC)' } },
    { id: 'PICK_TC_014', data: { pincode: '3000' } },
    { id: 'PICK_TC_015', data: { timeFrom: '9:00 AM', timeTo: '12:00 PM' } },
    { id: 'PICK_TC_016', data: { address: 'Test pickup address' } }
  ];

  for (const testCase of testCases) {
    await test.step(`${testCase.id} - Verify required field validation`, async () => {
      const dialogPromise = page.waitForEvent('dialog');
      await pickupPage.addLocation(testCase.data);
      const dialog = await dialogPromise;
      expect(dialog.message()).toBe('Please fill all fields.');
      await dialog.accept();
    });
  }
});

// ======================================================================
// POSTCODE VALIDATION
// ======================================================================

test('PICK_TC_017 to PICK_TC_020 - Verify invalid postcode values', async () => {
  const invalidPostcodes = [
    { id: 'PICK_TC_017', value: '123' },
    { id: 'PICK_TC_018', value: '12345' },
    { id: 'PICK_TC_019', value: 'ABCD' },
    { id: 'PICK_TC_020', value: '@#$%' }
  ];

  for (const testCase of invalidPostcodes) {
    await test.step(`${testCase.id} - Verify postcode ${testCase.value}`, async () => {
      await pickupPage.pincodeBox.fill(testCase.value);
      const value = await pickupPage.pincodeBox.inputValue();
      expect(value).toMatch(/^\d{0,4}$/);
    });
  }
});

test('PICK_TC_022 - Verify valid 4-digit postcode is accepted', async () => {
  await pickupPage.pincodeBox.fill('3000');
  await expect(pickupPage.pincodeBox).toHaveValue('3000');
});

// ======================================================================
// DUPLICATE PICKUP ADDRESS
// ======================================================================

test('PICK_TC_023 - Verify duplicate pickup address is prevented', async ({ page }) => {
  const location = makeLocation();
  const countBefore = await pickupPage.getLocationCount();

  await addTestLocation(location);
  await expect(pickupPage.card(location.name)).toBeVisible();

  page.on('dialog', dialog => dialog.accept());
  await pickupPage.addLocation(location);

  await expect.poll(() => pickupPage.getLocationCount()).toBe(countBefore + 1);
});

// ======================================================================
// WHITESPACE HANDLING
// ======================================================================

test('PICK_TC_027 - Verify leading and trailing spaces are handled', async () => {
  const location = makeLocation();
  const spacedLocation = {
    ...location,
    name: `  ${location.name}  `,
    city: `  ${location.city}  `,
    address: `  ${location.address}  `
  };

  createdLocations.push(spacedLocation.name);
  await pickupPage.addLocation(spacedLocation);
  await expect(pickupPage.card(spacedLocation.name)).toBeVisible();
});

// ======================================================================
// EDIT PICKUP ADDRESS
// ======================================================================

test('PICK_TC_031 to PICK_TC_037 - Verify edit pickup address functionality', async () => {
  const location = makeLocation();
  await addTestLocation(location);

  const card = pickupPage.card(location.name);
  await expect(card).toBeVisible();

  await test.step('PICK_TC_031 - Verify Edit button visibility', async () => {
    await expect(card.getByRole('button', { name: 'Edit' })).toBeVisible();
  });

  await test.step('PICK_TC_032 - Verify existing details are populated', async () => {
    await card.getByRole('button', { name: 'Edit' }).click();
    await expect(pickupPage.nameBox).toHaveValue(location.name);
    await expect(pickupPage.cityBox).toHaveValue(location.city);
    expect(await pickupPage.getSelectedText(pickupPage.stateBox)).toBe(location.state);
    await expect(pickupPage.pincodeBox).toHaveValue(location.pincode);
    expect(await pickupPage.getSelectedText(pickupPage.timeFromBox)).toBe(location.timeFrom);
    expect(await pickupPage.getSelectedText(pickupPage.timeToBox)).toBe(location.timeTo);
    await expect(pickupPage.addressBox).toHaveValue(location.address);
  });

  const updatedName = `${location.name}_updated`;

  await test.step('PICK_TC_033 - Update location name', async () => {
    await pickupPage.nameBox.fill(updatedName);
    await pickupPage.addButton.click();
    await expect(pickupPage.card(updatedName)).toBeVisible();
    createdLocations.push(updatedName);
  });

  await test.step('PICK_TC_034 to PICK_TC_035 - Update remaining details', async () => {
    await pickupPage.editLocation(updatedName, {
      city: 'Sydney',
      state: 'New South Wales (NSW)',
      pincode: '2000',
      timeFrom: '10:00 AM',
      timeTo: '1:00 PM',
      address: 'Updated pickup address'
    });

    const editedCard = pickupPage.card(updatedName);
    await expect(editedCard).toContainText('Sydney');
    await expect(editedCard).toContainText('NSW');
    await expect(editedCard).toContainText('2000');
    await expect(editedCard).toContainText('10:00 AM - 1:00 PM');
    await expect(editedCard).toContainText('Updated pickup address');
  });

  await test.step('PICK_TC_036 - Verify edit form without changes', async () => {
    await pickupPage.card(updatedName).getByRole('button', { name: 'Edit' }).click();
    await expect(pickupPage.nameBox).toHaveValue(updatedName);
    await pickupPage.addButton.click();
    await expect(pickupPage.card(updatedName)).toBeVisible();
  });

  await test.step('PICK_TC_037 - Verify updated details after reload', async () => {
    await pickupPage.reload();
    await expect(pickupPage.card(updatedName)).toContainText('Sydney');
    await expect(pickupPage.card(updatedName)).toContainText('2000');
  });
});

// ======================================================================
// DELETE PICKUP ADDRESS
// ======================================================================

test('PICK_TC_038 to PICK_TC_043 - Verify delete pickup address functionality', async ({ page }) => {
  const location = makeLocation();
  await addTestLocation(location);

  const card = pickupPage.card(location.name);

  await test.step('PICK_TC_038 - Verify Delete button visibility', async () => {
    await expect(card.getByRole('button', { name: 'Delete' })).toBeVisible();
  });

  await test.step('PICK_TC_039 - Verify pickup address deletion', async () => {
    const countBefore = await pickupPage.getLocationCount();
    await pickupPage.deleteLocation(location.name);
    await expect.poll(() => pickupPage.getLocationCount()).toBe(countBefore - 1);
  });

  await test.step('PICK_TC_040 - Verify deletion can be cancelled', async () => {
    const anotherLocation = makeLocation();
    await addTestLocation(anotherLocation);

    const anotherCard = pickupPage.card(anotherLocation.name);
    page.once('dialog', dialog => dialog.dismiss());
    await anotherCard.getByRole('button', { name: 'Delete' }).click();
    await expect(anotherCard).toBeVisible();
  });

  await test.step('PICK_TC_041 to PICK_TC_042 - Verify count and deletion after reload', async () => {
    const anotherLocation = makeLocation();
    await addTestLocation(anotherLocation);
    const countBefore = await pickupPage.getLocationCount();

    await pickupPage.deleteLocation(anotherLocation.name);
    await expect.poll(() => pickupPage.getLocationCount()).toBe(countBefore - 1);

    await pickupPage.reload();
    await expect(pickupPage.card(anotherLocation.name)).toHaveCount(0);
  });

  await test.step('PICK_TC_043 - Verify only selected location is deleted', async () => {
    const first = makeLocation();
    const second = { ...makeLocation(), name: `auto_loc_${Date.now()}_b` };

    await addTestLocation(first);
    await addTestLocation(second);

    await pickupPage.deleteLocation(first.name);
    await expect(pickupPage.card(first.name)).toHaveCount(0);
    await expect(pickupPage.card(second.name)).toBeVisible();
  });
});

// ======================================================================
// REFRESH
// ======================================================================

test('PICK_TC_044 - Verify Refresh button functionality', async () => {
  const location = makeLocation();
  await addTestLocation(location);

  await pickupPage.refreshButton.click();
  await expect(pickupPage.card(location.name)).toBeVisible();
});
