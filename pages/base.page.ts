import type { Page } from "@playwright/test";

export abstract class BasePage {
  protected constructor(protected readonly page: Page) {}

  async open(path = ""): Promise<void> {
    await this.page.goto(path, { waitUntil: "domcontentloaded" });
  }
}
