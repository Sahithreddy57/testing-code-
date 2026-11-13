import { Page, Locator, expect } from '@playwright/test';

// Profile page (Admin Profile): all locators and functions are in this one file
export class ProfilePage {
    readonly page: Page;
    readonly main: Locator;
    readonly topBar: Locator;

    // ---------- Sidebar and banner ----------
    readonly menuProfile: Locator;
    readonly logoutButton: Locator;
    readonly bannerTag: Locator;
    readonly bannerTitle: Locator;
    readonly bannerText: Locator;
    readonly dashboardButton: Locator;

    // ---------- Profile card ----------
    readonly cardName: Locator;
    readonly cardRole: Locator;

    // ---------- Profile form ----------
    readonly fullNameBox: Locator;
    readonly emailBox: Locator;
    readonly emailNote: Locator;
    readonly mobileBox: Locator;
    readonly addressBox: Locator;
    readonly cancelButton: Locator;
    readonly saveButton: Locator;

    // ---------- Update password ----------
    readonly passwordTitle: Locator;
    readonly passwordText: Locator;
    readonly currentPasswordBox: Locator;
    readonly newPasswordBox: Locator;
    readonly confirmPasswordBox: Locator;
    readonly updatePasswordButton: Locator;

    // ---------- Messages ----------
    // TODO: the messages were not recorded yet. This finds a common success or error message.
    readonly message: Locator;

    constructor(page: Page) {
        this.page = page;
        this.main = page.getByRole('main');
        this.topBar = page.locator('header');

        // Sidebar and banner
        this.menuProfile = page.getByRole('button', { name: 'Profile', exact: true });
        this.logoutButton = page.getByRole('button', { name: 'Logout' });
        this.bannerTag = page.getByText(/^account settings$/i);
        this.bannerTitle = page.getByRole('heading', { name: 'Admin Profile' });
        this.bannerText = page.getByText('Manage your personal account information.');
        this.dashboardButton = this.main.getByRole('button', { name: /Dashboard/ });

        // Profile card
        this.cardRole = this.main.getByText('Administrator', { exact: true });
        this.cardName = this.cardRole.locator('xpath=preceding-sibling::*[1]'); // the name is right above the role

        // Profile form
        this.fullNameBox = page.getByRole('textbox', { name: 'Full Name' });
        this.emailBox = page.getByRole('textbox', { name: 'Email Address' });
        this.emailNote = page.getByText('Email address cannot be changed here.');
        this.mobileBox = page.getByRole('textbox', { name: 'Mobile Number' });
        this.addressBox = page.getByRole('textbox', { name: 'Address', exact: true });
        this.cancelButton = page.getByRole('button', { name: 'Cancel' });
        this.saveButton = page.getByRole('button', { name: 'Save Changes' });

        // Update password
        this.passwordTitle = page.getByRole('heading', { name: 'Update Password' });
        this.passwordText = page.getByText('Change your admin account password');
        this.currentPasswordBox = page.getByPlaceholder('Enter your current password');
        this.newPasswordBox = page.getByPlaceholder('Enter your new password').first();
        this.confirmPasswordBox = page.getByPlaceholder('Re-enter your new password');
        this.updatePasswordButton = page.getByRole('button', { name: 'Update Password' });

        // Messages
        this.message = page
            .getByRole('alert')
            .or(page.getByText(/updated|saved|success|required|invalid|incorrect|do not match|don't match|least|short|wrong|error|failed/i))
            .first();
    }

    // ---------- Page ----------
    async openFromSidebar(): Promise<void> {
        await this.menuProfile.click();
        await this.bannerTitle.waitFor();
    }

    async reload(): Promise<void> {
        await this.page.reload();
        await this.bannerTitle.waitFor();
    }

    // ---------- Profile form ----------
    async saveProfile(details: { name?: string; mobile?: string; address?: string }): Promise<void> {
        if (details.name !== undefined) await this.fullNameBox.fill(details.name);
        if (details.mobile !== undefined) await this.mobileBox.fill(details.mobile);
        if (details.address !== undefined) await this.addressBox.fill(details.address);
        await this.saveButton.click();
    }

    // ---------- Update password ----------
    // Fills the three boxes and clicks "Update Password". Only wrong data is used in the tests.
    async updatePassword(current: string, newPassword: string, confirm: string): Promise<void> {
        await this.currentPasswordBox.fill(current);
        await this.newPasswordBox.fill(newPassword);
        await this.confirmPasswordBox.fill(confirm);
        await this.updatePasswordButton.click();
    }

    // ---------- Logout ----------
    async logout(): Promise<void> {
        await this.logoutButton.click();
        // If the app asks to confirm, click the button in the dialog. A real dialog is used so no other button is clicked.
        const confirm = this.page.getByRole('alertdialog').or(this.page.getByRole('dialog'));
        await confirm.getByRole('button', { name: /logout|confirm|yes/i }).click({ timeout: 2000 }).catch(() => { });
    }

    async expectLoaded(): Promise<void> {
        await expect(this.bannerTitle).toBeVisible();
    }
}