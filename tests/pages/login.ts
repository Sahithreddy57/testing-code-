
import { Page, Locator, expect } from '@playwright/test';

// Login flow: all locators and functions are in this one file.
// Screen 1 = Landing page (has the top and bottom "Sign In" buttons)
// Screen 2 = Login form (opens after clicking either "Sign In" button)

export class LoginPage {
  readonly page: Page;

  // ---------- Locators: Landing page ----------
  readonly signInTopButton: Locator;       // Top Sign In button in the header
  readonly signInBottomButton: Locator;    // Bottom Sign In button in the hero section
  readonly requestAccessButton: Locator;   // Create account / Register button

  // ---------- Locators: Login form ----------
  readonly welcomeHeading: Locator;
  readonly backToHomeButton: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly showPasswordButton: Locator;
  readonly loginButton: Locator;
  readonly notMemberText: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;

    // ---------- Landing page ----------

    // Top Sign In button
    this.signInTopButton = page.locator('button.lp-top-link')
      .filter({ hasText: 'Sign In' });

    // Bottom Sign In button
    this.signInBottomButton = page.locator('button.lp-btn.is-primary')
      .filter({ hasText: 'Sign In' });

    // Request access / Create account button
    this.requestAccessButton = page
      .getByRole('button', {
        name: /request access|create (a new )?account|sign up|register/i
      })
      .or(
        page.getByRole('link', {
          name: /request access|create (a new )?account|sign up|register/i
        })
      )
      .first();

    // ---------- Login form ----------

    // Login form heading
    this.welcomeHeading = page.getByRole('heading', { name: /log in/i });
    this.backToHomeButton = page.locator('button.lb-login-back');
    this.emailInput = page.getByLabel('Email address')
      .or(page.getByPlaceholder(/email/i));

    this.passwordInput = page.getByLabel('Password', { exact: true })
      .or(page.getByPlaceholder(/password/i));

    // First button after the password field = Show/Hide password
    this.showPasswordButton = this.passwordInput.locator('xpath=following::button[1]');

    // New design: Sign In to LB button
    this.loginButton = page.getByRole('button', { name: /sign in to lb/i });

    // New design: New to LB?
    this.notMemberText = page.getByText(/new to lb/i);

    this.errorMessage = page.getByRole('alert');
  }

  // ---------- Functions: Landing page ----------

  async open(): Promise<void> {
    await this.page.goto('/');
  }

  async openFromTop(): Promise<void> {
    await this.signInTopButton.click();
    await this.welcomeHeading.waitFor();
  }

  async openFromBottom(): Promise<void> {
    await this.signInBottomButton.click();
    await this.welcomeHeading.waitFor();
  }

  async clickBackToHome(): Promise<void> {
    await this.backToHomeButton.scrollIntoViewIfNeeded();
   
    await this.backToHomeButton.click();
  
  }

  // ---------- Functions: Login form ----------

  async fillEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  async clickLogin(): Promise<void> {
    await this.loginButton.click();
  }

  async submitWithEnter(): Promise<void> {
    await this.passwordInput.press('Enter');
  }

  async toggleShowPassword(): Promise<void> {
    await this.showPasswordButton.click();
  }

  // Fill email and password, then click Sign In to LB.
  // Login form must already be open.
  async loginWith(email: string, password: string): Promise<void> {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.clickLogin();
  }

  // Full valid login using credentials from the .env file.
  // If the login form is not open, it opens it using the top Sign In button.
  async login(
    email: string = process.env.ADMIN_USER ?? '',
    password: string = process.env.ADMIN_PASS ?? '',
  ): Promise<void> {
    if (!(await this.emailInput.isVisible())) {
      await this.openFromTop();
    }

    await this.loginWith(email, password);
  }

  async expectFormVisible(): Promise<void> {
    await expect(this.welcomeHeading).toBeVisible();
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.loginButton).toBeVisible();
  }
}
