
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login';
import { DashboardPage } from '../pages/dashboard';

// Valid details come from the .env file. Invalid details are created here,
// so the tests never depend on fixed app data.
const VALID_EMAIL = process.env.ADMIN_USER ?? '';
const VALID_PASS = process.env.ADMIN_PASS ?? '';
const unique = () => `invalid_${Date.now()}`;
const uniqueEmail = () => `invalid_${Date.now()}@example.com`;

// The login form can be opened from two Sign In buttons
const entryPoints = ['top', 'bottom'] as const;

let loginPage: LoginPage;
let dashboardPage: DashboardPage;

test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    await loginPage.open();
});

// Login failed = Dashboard is not shown and the login form is still there
async function expectLoginFailed(): Promise<void> {
    await expect(dashboardPage.greeting).toBeHidden();
    await expect(loginPage.loginButton).toBeVisible();
}

// ---------------------------------------------------------------
test.describe('Login - Landing page and entry points', () => {

    test('LOGIN_TC_001 Landing page shows both Sign In buttons and the Create account button', async () => {
        await expect(loginPage.signInTopButton).toBeVisible();
        await expect(loginPage.signInBottomButton).toBeVisible();
        await expect(loginPage.requestAccessButton).toBeVisible();
    });

    test('LOGIN_TC_002 Login form is not shown before clicking Sign In', async () => {
        await expect(loginPage.emailInput).toBeHidden();
        await expect(loginPage.passwordInput).toBeHidden();
    });

    for (const entry of entryPoints) {
        test(`LOGIN_TC_003 Sign In button (${entry}) opens the login form`, async () => {
            if (entry === 'top') {
                await loginPage.openFromTop();
            } else {
                await loginPage.openFromBottom();
            }

            await loginPage.expectFormVisible();
        });
    }

    // test.only('LOGIN_TC_004 Back to home returns to the landing page', async () => {
    //     await loginPage.openFromTop();
    //     await loginPage.clickBackToHome();
        
    //     await expect(loginPage.signInTopButton).toBeVisible();
    // });
});

// ---------------------------------------------------------------
test.describe('Login - Form UI', () => {

    test.beforeEach(async () => {
        await loginPage.openFromTop();
    });

    test('LOGIN_TC_005 Form shows heading, email, password, Sign In button and sign-up hint', async () => {
        await loginPage.expectFormVisible();
        await expect(loginPage.notMemberText).toBeVisible();
    });

    test('LOGIN_TC_006 Email and password fields are empty by default', async () => {
        await expect(loginPage.emailInput).toHaveValue('');
        await expect(loginPage.passwordInput).toHaveValue('');
    });

    test('LOGIN_TC_007 Password is hidden while typing', async () => {
        await loginPage.fillPassword(unique());
        await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');
    });

    test('LOGIN_TC_008 Eye icon shows and hides the password', async () => {
        await loginPage.fillPassword(unique());

        await loginPage.toggleShowPassword();
        await expect(loginPage.passwordInput).toHaveAttribute('type', 'text');

        await loginPage.toggleShowPassword();
        await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');
    });

    test('LOGIN_TC_009 Tab key moves focus from email to password', async () => {
        await loginPage.emailInput.focus();
        await loginPage.page.keyboard.press('Tab');
        await expect(loginPage.passwordInput).toBeFocused();
    });
});

// ---------------------------------------------------------------
test.describe('Login - Valid login', () => {

    for (const entry of entryPoints) {
        test(`LOGIN_TC_010 Valid details open the Dashboard (form opened from ${entry} Sign In button)`, async () => {
            if (entry === 'top') {
                await loginPage.openFromTop();
            } else {
                await loginPage.openFromBottom();
            }

            await loginPage.login();
            await expect(dashboardPage.greeting).toBeVisible();
        });
    }

    test('LOGIN_TC_011 Login works with the Enter key', async () => {
        await loginPage.openFromTop();
        await loginPage.fillEmail(VALID_EMAIL);
        await loginPage.fillPassword(VALID_PASS);
        await loginPage.submitWithEnter();
        await expect(dashboardPage.greeting).toBeVisible();
    });

    test('LOGIN_TC_012 User stays logged in after browser refresh', async () => {
        await loginPage.login();
        await expect(dashboardPage.greeting).toBeVisible();

        await dashboardPage.reload();
        await expect(dashboardPage.greeting).toBeVisible();
    });

    test('LOGIN_TC_013 Double click on Sign In button does not cause an error', async () => {
        await loginPage.openFromTop();
        await loginPage.fillEmail(VALID_EMAIL);
        await loginPage.fillPassword(VALID_PASS);
        await loginPage.loginButton.dblclick();
        await expect(dashboardPage.greeting).toBeVisible();
    });

    test('LOGIN_TC_014 User can login after a failed attempt', async () => {
        await loginPage.openFromTop();
        await loginPage.loginWith(VALID_EMAIL, unique());
        await expectLoginFailed();

        await loginPage.fillPassword(VALID_PASS);
        await loginPage.clickLogin();
        await expect(dashboardPage.greeting).toBeVisible();
    });
});

// ---------------------------------------------------------------
test.describe('Login - Invalid login', () => {

    test.beforeEach(async () => {
        await loginPage.openFromTop();
    });

    test('LOGIN_TC_015 Invalid email with valid password is rejected', async () => {
        await loginPage.loginWith(uniqueEmail(), VALID_PASS);
        await expect(loginPage.errorMessage).toBeVisible();
        await expectLoginFailed();
    });

    test('LOGIN_TC_016 Valid email with invalid password is rejected', async () => {
        await loginPage.loginWith(VALID_EMAIL, unique());
        await expect(loginPage.errorMessage).toBeVisible();
        await expectLoginFailed();
    });

    test('LOGIN_TC_017 Invalid email and invalid password are rejected', async () => {
        await loginPage.loginWith(uniqueEmail(), unique());
        await expect(loginPage.errorMessage).toBeVisible();
        await expectLoginFailed();
    });

    test('LOGIN_TC_018 Login is not allowed with both fields empty', async () => {
        await loginPage.clickLogin();
        await expectLoginFailed();
    });

    test('LOGIN_TC_019 Login is not allowed with empty email', async () => {
        await loginPage.fillPassword(VALID_PASS);
        await loginPage.clickLogin();
        await expectLoginFailed();
    });

    test('LOGIN_TC_020 Login is not allowed with empty password', async () => {
        await loginPage.fillEmail(VALID_EMAIL);
        await loginPage.clickLogin();
        await expectLoginFailed();
    });

    test('LOGIN_TC_021 Login is not allowed with only spaces in the fields', async () => {
        await loginPage.loginWith('     ', '     ');
        await expectLoginFailed();
    });

    test('LOGIN_TC_022 Email without @ is not accepted', async () => {
        await loginPage.loginWith(unique(), VALID_PASS);
        await expectLoginFailed();
    });

    test('LOGIN_TC_023 Password is case sensitive', async () => {
        test.skip(
            VALID_PASS === VALID_PASS.toUpperCase(),
            'Password has no lowercase letters to change'
        );

        await loginPage.loginWith(VALID_EMAIL, VALID_PASS.toUpperCase());
        await expectLoginFailed();
    });

    test('LOGIN_TC_024 Error message is the same for wrong email and wrong password', async () => {
        await loginPage.loginWith(uniqueEmail(), VALID_PASS);
        await expect(loginPage.errorMessage).toBeVisible();

        const wrongEmailMessage = (await loginPage.errorMessage.innerText()).trim();

        await loginPage.open();
        await loginPage.openFromTop();
        await loginPage.loginWith(VALID_EMAIL, unique());

        await expect(loginPage.errorMessage).toBeVisible();

        const wrongPassMessage = (await loginPage.errorMessage.innerText()).trim();

        // The message must not tell which field is wrong
        expect(wrongEmailMessage).toBe(wrongPassMessage);
    });
});

// ---------------------------------------------------------------
test.describe('Login - Input safety', () => {

    test.beforeEach(async () => {
        await loginPage.openFromTop();
    });

    test('LOGIN_TC_025 Special characters in email do not log in', async () => {
        await loginPage.loginWith('!@#$%^&*()_+{}|:"<>?', VALID_PASS);
        await expectLoginFailed();
    });

    test('LOGIN_TC_026 SQL injection text does not log in', async () => {
        await loginPage.loginWith("' OR '1'='1", "' OR '1'='1");
        await expectLoginFailed();
    });

    test('LOGIN_TC_027 Script text in email is not run', async () => {
        let dialogShown = false;

        loginPage.page.on('dialog', async (dialog) => {
            dialogShown = true;
            await dialog.dismiss();
        });

        await loginPage.loginWith('<script>alert(1)</script>', VALID_PASS);
        await expectLoginFailed();

        expect(dialogShown).toBe(false);
    });

    test('LOGIN_TC_028 Very long input does not log in or break the page', async () => {
        const longText = 'a'.repeat(300);
        await loginPage.loginWith(longText, longText);
        await expectLoginFailed();
    });

    test('LOGIN_TC_029 Password is not sent in the page URL', async () => {
        await loginPage.login();
        await expect(dashboardPage.greeting).toBeVisible();

        expect(loginPage.page.url()).not.toContain(encodeURIComponent(VALID_PASS));
    });
});

// ---------------------------------------------------------------
test.describe('Login - Access control', () => {

    test('LOGIN_TC_030 Dashboard cannot be opened without login', async () => {
        await loginPage.page.goto('/dashboard'); // Change the path if your Dashboard URL is different

        await expect(dashboardPage.greeting).toBeHidden();
        await expect(loginPage.loginButton).toBeHidden();
    });
});
