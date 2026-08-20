import { When } from "@cucumber/cucumber";
import { config } from "../config/config";
import type { ZincBankWorld } from "../utilities/world";

When(
  "I log in with configured credentials",
  async function (this: ZincBankWorld) {
    const { email, password } = config.credentials;
    if (!email || !password) {
      throw new Error(
        "Set ZINCBANK_EMAIL and ZINCBANK_PASSWORD in .env before running credential tests.",
      );
    }
    await this.pages.login.login(email, password);
  },
);
