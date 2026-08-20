import { expect, type Page } from "@playwright/test";

export class BrowserUtils {
  constructor(private readonly page: Page) {}

  async waitForPageReady(): Promise<void> {
    await this.page.waitForLoadState("domcontentloaded");
  }

  async verifyPath(path: string | RegExp): Promise<void> {
    await expect(this.page).toHaveURL(path);
  }

  async verifyTitle(title: string | RegExp): Promise<void> {
    await expect(this.page).toHaveTitle(title);
  }
}
