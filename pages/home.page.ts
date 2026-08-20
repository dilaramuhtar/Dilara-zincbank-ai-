import { expect, type Locator, type Page } from "@playwright/test";
import { BasePage } from "./base.page";

export class HomePage extends BasePage {
  readonly heading: Locator;
  readonly loginLink: Locator;
  readonly openAccountLink: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole("heading", {
      name: /Banking, quietly exceptional/i,
    });
    this.loginLink = page.getByTestId("home-nav-login");
    this.openAccountLink = page.getByTestId("home-nav-apply");
  }

  async open(): Promise<void> {
    await super.open("/");
  }

  async expectLoaded(): Promise<void> {
    await expect(this.heading).toBeVisible();
    await expect(this.loginLink).toBeVisible();
  }

  async goToLogin(): Promise<void> {
    await this.loginLink.click();
  }
}
