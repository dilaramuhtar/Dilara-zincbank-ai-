import { Given, Then, When } from "@cucumber/cucumber";
import type { ZincBankWorld } from "../utilities/world";

Given("I am on the ZincBank home page", async function (this: ZincBankWorld) {
  await this.pages.home.open();
});

Given("I am on the ZincBank login page", async function (this: ZincBankWorld) {
  await this.pages.login.open();
});

When("I choose to log in", async function (this: ZincBankWorld) {
  await this.pages.home.goToLogin();
});

Then(
  "the ZincBank home page is displayed",
  async function (this: ZincBankWorld) {
    await this.pages.home.expectLoaded();
  },
);

Then("the login page is displayed", async function (this: ZincBankWorld) {
  await this.pages.login.expectLoaded();
  await this.browserUtils.verifyPath(/\/login$/);
});
