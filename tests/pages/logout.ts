
import { Page, Locator, expect } from '@playwright/test';

export class LogoutPage {
    readonly page: Page;

    // ---------- Sidebar ----------
    readonly logoutButton: Locator;

    // ---------- Logout confirmation popup ----------
    readonly confirmationPopup: Locator;
    readonly confirmationMessage: Locator;
    readonly cancelButton: Locator;
    readonly confirmLogoutButton: Locator;
    readonly closeButton: Locator;

    // ---------- Landing page ----------
    readonly signInTopButton: Locator;

    // ---------- Dashboard ----------
    readonly dashboardGreeting: Locator;

    constructor(page: Page) {
        this.page = page;

        // Sidebar
        this.logoutButton = page.getByText('Logout', { exact: true });

        // Confirmation popup
        this.confirmationPopup = page.getByText(
            'Are you sure you want to log out?'
        );
        this.confirmationMessage = this.confirmationPopup;
        this.cancelButton = page.getByRole('button', {
            name: 'Cancel',
            exact: true
        });
        this.confirmLogoutButton = page.getByRole('button', {
            name: 'Yes, Logout',
            exact: true
        });
        this.closeButton = page.getByRole('button', {
            name: /close/i
        });

        // Landing page
        this.signInTopButton = page.getByRole('button', {
            name: 'Sign In',
            exact: true
        }).first();

        // Dashboard
        this.dashboardGreeting = page.getByText('Dashboard', {
            exact: true
        });
    }

    // ---------- Logout actions ----------

    async clickLogout(): Promise<void> {
        await this.logoutButton.click();
    }

    async expectLogoutVisible(): Promise<void> {
        await expect(this.logoutButton).toBeVisible();
    }

    // ---------- Confirmation popup actions ----------

    async expectConfirmationVisible(): Promise<void> {
        await expect(this.confirmationPopup).toBeVisible();
        await expect(this.cancelButton).toBeVisible();
        await expect(this.confirmLogoutButton).toBeVisible();
    }

    async cancelLogout(): Promise<void> {
        await this.cancelButton.click();
    }

    async confirmLogout(): Promise<void> {
        await this.confirmLogoutButton.click();
    }

    async closeConfirmation(): Promise<void> {
        await this.closeButton.click();
    }

    // ---------- Verification methods ----------

    async expectLoggedOut(): Promise<void> {
        await expect(this.signInTopButton).toBeVisible();
        await expect(this.dashboardGreeting).toBeHidden();
    }

    async expectDashboardVisible(): Promise<void> {
        await expect(this.dashboardGreeting).toBeVisible();
    }

    async reload(): Promise<void> {
        await this.page.reload();
    }

    async goBack(): Promise<void> {
        await this.page.goBack();
    }

    async openDashboard(url: string): Promise<void> {
        await this.page.goto(url);
    }
}
