import { expect, type Locator, type Page } from "@playwright/test";
import { BasePage } from "./base.page";

export class LoginPage extends BasePage {
  readonly pageContainer: Locator;
  readonly heading: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly branding: Locator;
  readonly openAccountLink: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.pageContainer = page.getByTestId("login-page");
    this.heading = page.getByRole("heading", { name: "Sign in to ZincBank" });
    this.emailInput = page.getByTestId("login-email-input");
    this.passwordInput = page.getByTestId("login-password-input");
    this.submitButton = page.getByTestId("login-submit");
    this.branding = page.getByText("ZincBank", { exact: true }).first();
    this.openAccountLink = page.getByRole("link", { name: "Open an account" });
    this.errorMessage = page
      .getByRole("alert")
      .or(page.locator("[data-testid*='error']"));
  }

  async open(): Promise<void> {
    await super.open("/login");
  }

  async expectLoaded(): Promise<void> {
    await expect(this.pageContainer).toBeVisible();
    await expect(this.heading).toBeVisible();
    await expect(this.submitButton).toBeEnabled();
  }

  async login(email: string, password: string): Promise<void> {
    await this.expectLoaded();
    await this.waitUntilHydrated();
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);

    // Hydration-safe verification also guards against any form re-render that
    // replaces an input while credentials are being entered.
    if ((await this.emailInput.inputValue()) !== email)
      await this.emailInput.fill(email);
    if ((await this.passwordInput.inputValue()) !== password)
      await this.passwordInput.fill(password);
    await expect(this.emailInput).toHaveValue(email);
    await expect(this.passwordInput).toHaveValue(password);
    await this.submitButton.click();
  }

  private async waitUntilHydrated(): Promise<void> {
    await this.page.waitForFunction(
      (button) =>
        Object.keys(button).some((key) => key.startsWith("__reactProps$")),
      await this.submitButton.elementHandle(),
    );
  }

  async submit(): Promise<void> {
    await this.expectLoaded();
    await this.waitUntilHydrated();
    await this.submitButton.click();
  }

  async expectError(message: string): Promise<void> {
    await expect(this.page.getByText(message, { exact: true })).toBeVisible();
  }

  async expectRequiredElements(): Promise<void> {
    await expect(this.branding).toBeVisible();
    await expect(this.emailInput).toBeVisible();
    await expect(this.emailInput).toBeEnabled();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.passwordInput).toBeEnabled();
    await expect(this.submitButton).toBeVisible();
    await expect(this.submitButton).toBeEnabled();
    await expect(this.openAccountLink).toBeVisible();
    await expect(this.openAccountLink).toHaveAttribute("href", /.+/);
  }
}
