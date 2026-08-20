import {
  After,
  AfterAll,
  Before,
  BeforeAll,
  Status,
  setDefaultTimeout,
} from "@cucumber/cucumber";
import { mkdir } from "node:fs/promises";
import { config } from "../config/config";
import { PageManager } from "../pages/page-manager";
import { BrowserUtils } from "./browser-utils";
import { createDriver } from "./driver";
import type { ZincBankWorld } from "./world";

setDefaultTimeout(config.defaultTimeout);

BeforeAll(async function () {
  await mkdir("test-results/traces", { recursive: true });
});

Before(async function (this: ZincBankWorld, scenario) {
  const session = await createDriver();
  this.browser = session.browser;
  this.context = session.context;
  this.page = session.page;
  this.pages = new PageManager(this.page);
  this.browserUtils = new BrowserUtils(this.page);
  this.isPasswordScenario = scenario.pickle.tags.some(
    (tag) => tag.name === "@password",
  );
  this.isMutatingProfileScenario =
    scenario.pickle.tags.some((tag) => tag.name === "@profile") &&
    scenario.pickle.tags.some((tag) => tag.name === "@mutating") &&
    !this.isPasswordScenario;
});

After(async function (this: ZincBankWorld, scenario) {
  const failed = scenario.result?.status === Status.FAILED;
  const safeName = scenario.pickle.name
    .replace(/[^a-z0-9]+/gi, "-")
    .toLowerCase();

  try {
    if (
      failed &&
      config.screenshotOnFailure &&
      this.page &&
      !this.page.isClosed()
    ) {
      await this.attach(
        await this.page.screenshot({ fullPage: true }),
        "image/png",
      );
    }
    if (this.context && config.trace !== "off") {
      await this.context.tracing.stop(
        config.trace === "on" || failed
          ? { path: `test-results/traces/${safeName}.zip` }
          : undefined,
      );
    }
  } finally {
    await this.context?.close();
    await this.browser?.close();
  }
});

AfterAll(async function () {
  // Reserved for suite-level cleanup such as test-data removal.
});

// Registered after the evidence/driver hook because Cucumber runs After hooks
// in reverse order. Persistent state is therefore restored before the context closes.
After({ tags: "@mutating" }, async function (this: ZincBankWorld) {
  if (this.profileNeedsRestore && this.originalProfile) {
    await this.pages.profile.open();
    if (/\/login\/?$/.test(new URL(this.page.url()).pathname)) {
      const credentials = config.profileTestCredentials;
      if (!credentials.email || !credentials.password)
        throw new Error(
          "Cannot restore profile: dedicated profile-test credentials are unavailable.",
        );
      await this.pages.login.login(credentials.email, credentials.password);
      await this.pages.profile.open();
    }
    const { email: _email, ...editable } = this.originalProfile;
    await this.pages.profile.fill(editable);
    await this.pages.profile.save();
    await this.page.reload({ waitUntil: "domcontentloaded" });
    await this.pages.profile.expectValues(this.originalProfile);
    this.profileNeedsRestore = false;
  }

  if (this.passwordRestore) {
    const { email, original, current } = this.passwordRestore;
    await this.context.clearCookies();
    await this.pages.login.open();
    await this.pages.login.login(email, current);
    if (/\/dashboard\/?$/.test(new URL(this.page.url()).pathname)) {
      await this.pages.profile.open();
      await this.pages.profile.changePassword(current, original);
      await this.pages.login.open();
      await this.pages.login.login(email, original);
      await this.pages.dashboard.expectLoaded();
    } else {
      // A failure before the mutation may leave the original password intact.
      await this.pages.login.open();
      await this.pages.login.login(email, original);
      await this.pages.dashboard.expectLoaded();
    }
    this.passwordRestore = undefined;
  }
});
