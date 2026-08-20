import {
  chromium,
  firefox,
  webkit,
  type Browser,
  type BrowserContext,
  type Page,
} from "@playwright/test";
import { config } from "../config/config";

const browserTypes = { chromium, firefox, webkit } as const;

export interface DriverSession {
  browser: Browser;
  context: BrowserContext;
  page: Page;
}

export async function createDriver(): Promise<DriverSession> {
  const browser = await browserTypes[config.browserName].launch(
    config.launchOptions,
  );
  const context = await browser.newContext({
    baseURL: config.baseUrl,
    viewport: { width: 1440, height: 900 },
    ignoreHTTPSErrors: process.env.IGNORE_HTTPS_ERRORS === "true",
    recordVideo:
      process.env.RECORD_VIDEO === "true"
        ? { dir: "test-results/videos" }
        : undefined,
  });

  context.setDefaultTimeout(config.actionTimeout);
  context.setDefaultNavigationTimeout(config.navigationTimeout);

  if (config.trace !== "off") {
    await context.tracing.start({
      screenshots: true,
      snapshots: true,
      sources: true,
    });
  }

  return { browser, context, page: await context.newPage() };
}
