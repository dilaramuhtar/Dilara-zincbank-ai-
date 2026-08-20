import { expect, type Locator, type Page } from "@playwright/test";
import { BasePage } from "./base.page";

export const protectedRoutes: Record<string, string> = {
  DASHBOARD: "/dashboard",
  ACCOUNTS: "/accounts",
  "MOVE MONEY": "/move-money",
  TRANSACTIONS: "/transactions",
  CARDS: "/cards",
  PROFILE: "/profile",
};

export class DashboardPage extends BasePage {
  readonly navigation: Locator;
  readonly signOut: Locator;

  constructor(page: Page) {
    super(page);
    this.navigation = page.getByRole("navigation").first();
    this.signOut = page
      .getByRole("button", { name: /sign out/i })
      .or(page.getByRole("link", { name: /sign out/i }));
  }

  async open(): Promise<void> {
    await super.open("/dashboard");
  }

  item(label: string): Locator {
    return this.navigation.getByRole("link", {
      name: new RegExp(`^${label}$`, "i"),
    });
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/dashboard\/?(?:[?#].*)?$/);
    await expect(this.navigation).toBeVisible();
    await expect(this.item("DASHBOARD")).toBeVisible();
  }

  async expectSidebar(): Promise<void> {
    for (const label of Object.keys(protectedRoutes)) {
      const item = this.item(label);
      await expect(item).toBeVisible();
      await expect(
        item.locator("svg, img, [class*='icon']").first(),
      ).toBeVisible();
    }
    await expect(this.signOut).toBeVisible();
    await expect(
      this.signOut.locator("svg, img, [class*='icon']").first(),
    ).toBeVisible();
  }

  async navigate(label: string): Promise<void> {
    await this.item(label).click();
  }

  async signOutCustomer(): Promise<void> {
    await this.signOut.click();
  }
}
