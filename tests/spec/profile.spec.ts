
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login';
import { ProfilePage } from '../pages/profile';

test.use({ actionTimeout: 10_000 });
let profilePage: ProfilePage;

test.beforeEach(async ({ page }) => {
  test.setTimeout(120_000);

  const loginPage = new LoginPage(page);
  await loginPage.open();
  await loginPage.login();

  profilePage = new ProfilePage(page);
  await profilePage.openFromSidebar();
});

// ======================================================================
// PROF_TC_001 to PROF_TC_005 - Profile Page UI
// ======================================================================

test('PROF_TC_001 to PROF_TC_005 - Verify Profile page UI', async () => {

  await test.step('PROF_TC_001 - Profile page opens from sidebar', async () => {
    await expect(profilePage.bannerTag).toBeVisible();
    await expect(profilePage.bannerTitle).toBeVisible();
    await expect(profilePage.bannerText).toBeVisible();
    await expect(profilePage.dashboardButton).toBeVisible();
  });

  await test.step('PROF_TC_002 - Profile card displays name and role', async () => {
    await expect(profilePage.cardName).toBeVisible();
    await expect(profilePage.cardRole).toHaveText('Administrator');
  });

  await test.step('PROF_TC_003 - Profile form displays all fields and buttons', async () => {
    await expect(profilePage.fullNameBox).toBeVisible();
    await expect(profilePage.emailBox).toBeVisible();
    await expect(profilePage.mobileBox).toBeVisible();
    await expect(profilePage.addressBox).toBeVisible();
    await expect(profilePage.cancelButton).toBeVisible();
    await expect(profilePage.saveButton).toBeVisible();
  });

  await test.step('PROF_TC_004 - Email address cannot be changed', async () => {
    await expect(profilePage.emailNote).toBeVisible();
    await expect(profilePage.emailBox).not.toBeEditable();
  });

  await test.step('PROF_TC_005 - Update Password section displays all fields', async () => {
    await expect(profilePage.passwordTitle).toBeVisible();
    await expect(profilePage.passwordText).toBeVisible();
    await expect(profilePage.currentPasswordBox).toBeVisible();
    await expect(profilePage.newPasswordBox).toBeVisible();
    await expect(profilePage.confirmPasswordBox).toBeVisible();
    await expect(profilePage.updatePasswordButton).toBeVisible();
  });
});

// ======================================================================
// PROF_TC_009 - Cancel discards profile changes
// ======================================================================

test('PROF_TC_009 - Cancel discards profile changes', async ({ page }) => {

  const oldName = await profilePage.fullNameBox.inputValue();

  await profilePage.fullNameBox.fill(`${oldName} changed`);
  await profilePage.cancelButton.click();

  await expect(
    page.getByRole('heading', {
      name: /Good (morning|afternoon|evening)/i
    })
  ).toBeVisible();

  await profilePage.openFromSidebar();

  await expect(profilePage.fullNameBox).toHaveValue(oldName);
});

// ======================================================================
// PROF_TC_010 - Mobile number with less than 10 digits is not saved
// ======================================================================

test('PROF_TC_010 - Invalid mobile number with less than 10 digits', async () => {

  await profilePage.saveProfile({ mobile: '98765' });

  await expect(
    profilePage.page.getByText(
      'Australian mobile numbers start with 04.',
      { exact: true }
    )
  ).toBeVisible();
});

// ======================================================================
// PROF_TC_011 - Valid 10-digit mobile number is saved
// ======================================================================


// ======================================================================
// PROF_TC_011 - Valid 10-digit mobile number is saved
// ======================================================================

test('PROF_TC_011 - Valid mobile number is saved successfully', async () => {

  const validMobile = '0412345678';

  await profilePage.saveProfile({ mobile: validMobile });

  await expect(
    profilePage.page.getByText(
      'Profile updated successfully',
      { exact: true }
    )
  ).toBeVisible();

  await profilePage.reload();

  await expect(profilePage.mobileBox).toHaveValue('0412 345 678');
});


// ======================================================================
// PROF_TC_012 - Letters and symbols are not accepted
// ======================================================================

test('PROF_TC_012 - Letters and symbols are not accepted in mobile number', async () => {

  await profilePage.mobileBox.fill('abc@12345');
  await profilePage.saveButton.click();
  await expect(
    profilePage.page.getByText(
      'Australian mobile numbers start with 04.',
      { exact: true }
    )
  ).toBeVisible();
  await profilePage.reload();

  await expect(profilePage.mobileBox).not.toHaveValue('abc@12345');
});

// ======================================================================
// PROF_TC_013 - More than 10 digits are not accepted
// ======================================================================

test('PROF_TC_013 - Mobile number with more than 10 digits', async () => {

  await profilePage.mobileBox.fill('987654321012');
  await profilePage.saveButton.click();

  await profilePage.reload();

  await expect(profilePage.mobileBox).not.toHaveValue('987654321012');
});

// ======================================================================
// PROF_TC_014 - Name containing only spaces is not saved
// ======================================================================

test('PROF_TC_014 - Name containing only spaces is not saved', async () => {

  await profilePage.saveProfile({ name: '     ' });

  await expect(
    profilePage.page.getByText('Name is required.', { exact: true })
  ).toBeVisible();
});

// ======================================================================
// PROF_TC_015 - Leading and trailing spaces are removed
// ======================================================================

test('PROF_TC_015 - Leading and trailing spaces in name are trimmed', async () => {

  const updatedName = `AutoName`;

  await profilePage.saveProfile({
    name: `   ${updatedName}   `
  });

  await profilePage.reload();

  await expect(profilePage.fullNameBox).toHaveValue(updatedName);
});

// ======================================================================
// PROF_TC_017 - Address cannot be empty
// ======================================================================

test('PROF_TC_017 - Address cannot be empty', async () => {

  await profilePage.saveProfile({ address: '' });

  await expect(
    profilePage.page.getByText('Address is required.', { exact: true })
  ).toBeVisible();
});

// ======================================================================
// PROF_TC_018 - Multi-line address is saved with line breaks
// ======================================================================

test('PROF_TC_018 - Multi-line address is saved correctly', async () => {

  const multilineAddress = 'Street 1\nMain Road\nChennai';

  await profilePage.saveProfile({ address: multilineAddress });

  await profilePage.reload();

  await expect(profilePage.addressBox).toHaveValue(multilineAddress);
});

// ======================================================================
// PROF_TC_019 - Double-click Save Changes
// ======================================================================

test('PROF_TC_019 - Double click on Save Changes does not cause an error', async () => {

  const updatedName = `DoubleClick${Date.now()}`;

  await profilePage.fullNameBox.fill(updatedName);
  await profilePage.saveButton.dblclick();

  await expect(profilePage.fullNameBox).toHaveValue(updatedName);
});

// ======================================================================
// PROF_TC_020 - Success message after saving
// ======================================================================

test('PROF_TC_020 - Success message appears after saving profile', async () => {

  const updatedName = `SuccessTest`;

  await profilePage.saveProfile({ name: updatedName });

  await expect(
    profilePage.page.getByText(
      'Profile updated successfully',
      { exact: true }
    )
  ).toBeVisible();
});

// ======================================================================
// PROF_TC_021 - Changes are not saved without clicking Save
// ======================================================================

test('PROF_TC_021 - Unsaved profile changes are discarded on navigation', async () => {

  const oldName = await profilePage.fullNameBox.inputValue();

  await profilePage.fullNameBox.fill(`NotSaved${Date.now()}`);

  await profilePage.dashboardButton.click();

  await profilePage.openFromSidebar();

  await expect(profilePage.fullNameBox).toHaveValue(oldName);
});

// ======================================================================
// PROF_TC_022 - Password fields hide entered text
// ======================================================================

test('PROF_TC_022 - Password fields hide the entered text', async () => {

  await expect(profilePage.currentPasswordBox).toHaveAttribute('type', 'password');
  await expect(profilePage.newPasswordBox).toHaveAttribute('type', 'password');
  await expect(profilePage.confirmPasswordBox).toHaveAttribute('type', 'password');
});

// ======================================================================
// PROF_TC_023 - Validation when password fields are empty
// ======================================================================

test('PROF_TC_023 - Validation appears when any password field is empty', async () => {

  const wrongPassword = `Wrong@${Date.now()}`;
  const newPassword = `New@${Date.now()}`;

  // Current Password empty
  await profilePage.newPasswordBox.fill(newPassword);
  await profilePage.confirmPasswordBox.fill(newPassword);
  await profilePage.updatePasswordButton.click();

  await expect(profilePage.message).toBeVisible();

  // New Password empty
  await profilePage.currentPasswordBox.fill(wrongPassword);
  await profilePage.newPasswordBox.clear();
  await profilePage.confirmPasswordBox.fill(newPassword);
  await profilePage.updatePasswordButton.click();

  await expect(profilePage.message).toBeVisible();

  // Confirm New Password empty
  await profilePage.currentPasswordBox.fill(wrongPassword);
  await profilePage.newPasswordBox.fill(newPassword);
  await profilePage.confirmPasswordBox.clear();
  await profilePage.updatePasswordButton.click();

  await expect(profilePage.message).toBeVisible();
});

// ======================================================================
// PROF_TC_024 - Password containing only spaces is not accepted
// ======================================================================

test('PROF_TC_024 - New password containing only spaces is rejected', async () => {

  await profilePage.updatePassword(
    `Wrong@${Date.now()}`,
    '        ',
    '        '
  );

  await expect(profilePage.message).toBeVisible();
});


// ======================================================================
// PROF_TC_026 - Password rules validation
// ======================================================================

test('PROF_TC_026 - Password complexity rules are validated', async () => {

  const currentPassword = `Wrong@${Date.now()}`;

  const invalidPasswords = [
    'Ab@1',
    'abcdefgh@',
    'ABCDEFGH@',
    'Abcdefgh1'
  ];

  for (const password of invalidPasswords) {

    await profilePage.updatePassword(
      currentPassword,
      password,
      password
    );

    await expect(profilePage.message).toBeVisible();
  }
});

// ======================================================================
// PROF_TC_030 - Profile page remains available after refresh
// ======================================================================

test('PROF_TC_030 - Profile page and saved details remain after refresh', async () => {

  const savedName = await profilePage.fullNameBox.inputValue();
  const savedMobile = await profilePage.mobileBox.inputValue();
  const savedAddress = await profilePage.addressBox.inputValue();

  await profilePage.reload();

  await expect(profilePage.bannerTitle).toBeVisible();
  await expect(profilePage.fullNameBox).toHaveValue(savedName);
  await expect(profilePage.mobileBox).toHaveValue(savedMobile);
  await expect(profilePage.addressBox).toHaveValue(savedAddress);
});

// ======================================================================
// PROF_TC_031 - Profile menu is highlighted
// ======================================================================

test('PROF_TC_031 - Profile menu is highlighted in sidebar', async () => {

  await expect(profilePage.menuProfile).toHaveAttribute(
    'aria-current',
    'page'
  );
});

// ======================================================================
// PROF_TC_032 - Dashboard button navigation
// ======================================================================

test('PROF_TC_032 - Dashboard button displays correct label and navigates', async ({ page }) => {

  await expect(profilePage.dashboardButton).toHaveText(/Dashboard/i);

  await profilePage.dashboardButton.click();

  await expect(
    page.getByRole('heading', {
      name: /Good (morning|afternoon|evening)/i
    })
  ).toBeVisible();
});
