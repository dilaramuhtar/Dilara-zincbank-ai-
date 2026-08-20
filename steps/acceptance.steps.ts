import { Given, Then, When } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { config } from "../config/config";
import type { ProfileValues } from "../pages/profile.page";
import type { ZincBankWorld } from "../utilities/world";

function required(value: string | undefined, name: string): string {
  if (!value) throw new Error(`${name} must be set in .env for this scenario.`);
  return value;
}

function primaryCredentials() {
  return {
    email: required(config.credentials.email, "ZINCBANK_EMAIL"),
    password: required(config.credentials.password, "ZINCBANK_PASSWORD"),
  };
}

function passwordCredentials() {
  return {
    email: required(
      config.passwordTestCredentials.email,
      "ZINCBANK_PASSWORD_TEST_EMAIL",
    ),
    password: required(
      config.passwordTestCredentials.password,
      "ZINCBANK_PASSWORD_TEST_PASSWORD",
    ),
  };
}

function profileCredentials() {
  return {
    email: required(
      config.profileTestCredentials.email,
      "ZINCBANK_PROFILE_TEST_EMAIL",
    ),
    password: required(
      config.profileTestCredentials.password,
      "ZINCBANK_PROFILE_TEST_PASSWORD",
    ),
  };
}

async function authenticate(
  world: ZincBankWorld,
  credentials = primaryCredentials(),
): Promise<void> {
  world.activeCredentials = credentials;
  await world.pages.login.open();
  await world.pages.login.login(credentials.email, credentials.password);
  await world.pages.dashboard.expectLoaded();
}

When(
  "I authenticate with the configured customer",
  async function (this: ZincBankWorld) {
    await authenticate(this);
  },
);

Then(
  "all required login elements are accessible",
  async function (this: ZincBankWorld) {
    await this.pages.login.expectRequiredElements();
    await expect(this.page.getByLabel("Email", { exact: true })).toBeVisible();
    await expect(
      this.page.getByLabel("Password", { exact: true }),
    ).toBeVisible();
  },
);

When(
  "I submit an unknown email and an incorrect password",
  async function (this: ZincBankWorld) {
    await this.pages.login.login(
      `not-a-user-${Date.now()}@zinc.test`,
      "KnownWrong!123",
    );
  },
);

When(
  "I submit the configured email with an incorrect password",
  async function (this: ZincBankWorld) {
    await this.pages.login.login(primaryCredentials().email, "WrongPass123");
  },
);

When(
  "I submit the login form without credentials",
  async function (this: ZincBankWorld) {
    await this.pages.login.submit();
  },
);

When(
  "I submit invalid email {string} with a non-empty password",
  async function (this: ZincBankWorld, email: string) {
    await this.pages.login.login(email, "NonSecret123!");
  },
);

Then(
  "login is rejected with {string}",
  async function (this: ZincBankWorld, message: string) {
    await this.pages.login.expectError(message);
    await expect(this.page).toHaveURL(/\/login\/?(?:[?#].*)?$/);
    await expect(this.pages.dashboard.navigation).toBeHidden();
  },
);

Then(
  "the login password remains masked during entry",
  async function (this: ZincBankWorld) {
    const testValue = "MaskCheck-123";
    await expect(this.pages.login.passwordInput).toHaveAttribute(
      "type",
      "password",
    );
    await this.pages.login.passwordInput.fill(testValue);
    await expect(this.pages.login.passwordInput).toHaveAttribute(
      "type",
      "password",
    );
    await expect(this.page.getByText(testValue, { exact: true })).toHaveCount(
      0,
    );
  },
);

Then(
  "protected customer content is displayed",
  async function (this: ZincBankWorld) {
    await this.pages.dashboard.expectLoaded();
  },
);
When("I reload the current page", async function (this: ZincBankWorld) {
  await this.page.reload({ waitUntil: "domcontentloaded" });
});
Then("the dashboard is displayed", async function (this: ZincBankWorld) {
  await this.pages.dashboard.expectLoaded();
});
When(
  "I open the protected route {string}",
  async function (this: ZincBankWorld, route: string) {
    await this.page.goto(route, { waitUntil: "domcontentloaded" });
  },
);
Then(
  "protected customer content is absent",
  async function (this: ZincBankWorld) {
    await expect(this.pages.dashboard.navigation).toBeHidden();
  },
);
Then(
  "the sidebar displays all required labels and icons",
  async function (this: ZincBankWorld) {
    await this.pages.dashboard.expectSidebar();
  },
);
When(
  "I select sidebar item {string}",
  async function (this: ZincBankWorld, item: string) {
    await this.pages.dashboard.navigate(item);
  },
);
Then(
  "the protected destination {string} is displayed",
  async function (this: ZincBankWorld, route: string) {
    await expect(this.page).toHaveURL(
      new RegExp(`${route.replace("-", "\\-")}\\/?(?:[?#].*)?$`),
    );
    await expect(this.pages.dashboard.navigation).toBeVisible();
  },
);
When("I sign out", async function (this: ZincBankWorld) {
  await this.pages.dashboard.signOutCustomer();
  await expect(this.page).toHaveURL(/\/login/);
});

Given(
  "I am authenticated on the Profile page",
  async function (this: ZincBankWorld) {
    const credentials = this.isPasswordScenario
      ? passwordCredentials()
      : this.isMutatingProfileScenario
        ? profileCredentials()
        : primaryCredentials();
    await authenticate(this, credentials);
    await this.pages.profile.open();
    await this.pages.profile.expectLoaded();
  },
);

Then(
  "all profile fields display configured customer information",
  async function (this: ZincBankWorld) {
    const values = await this.pages.profile.read();
    expect(values.email).toBe(this.activeCredentials?.email);
    for (const [key, value] of Object.entries(values))
      expect(value, `${key} must not be blank`).not.toBe("");
    const expected = config.expectedProfile;
    if (expected.firstName) expect(values.firstName).toBe(expected.firstName);
    if (expected.lastName) expect(values.lastName).toBe(expected.lastName);
    if (expected.phone) expect(values.phone).toBe(expected.phone);
    if (expected.address) expect(values.address).toBe(expected.address);
  },
);

Then(
  "profile fields have the required editability",
  async function (this: ZincBankWorld) {
    const original = await this.pages.profile.read();
    for (const field of [
      this.pages.profile.firstName,
      this.pages.profile.lastName,
      this.pages.profile.phone,
      this.pages.profile.address,
    ]) {
      await expect(field).toBeEditable();
      const old = await field.inputValue();
      await field.fill(`${old}x`);
      expect(await field.inputValue()).toBe(`${old}x`);
    }
    await expect(this.pages.profile.email).not.toBeEditable();
    await this.page.reload();
    await this.pages.profile.expectValues(original);
  },
);

When(
  "I save unique values in all editable profile fields",
  async function (this: ZincBankWorld) {
    this.originalProfile = await this.pages.profile.read();
    this.profileNeedsRestore = true;
    const id = Date.now().toString().slice(-6);
    const changed = {
      firstName: `Auto${id}`,
      lastName: `Test${id}`,
      phone: `555${id}0`,
      address: `${id} Test Street`,
    };
    await this.pages.profile.fill(changed);
    await this.pages.profile.save();
    await this.pages.profile.expectValues(changed);
  },
);

Then(
  "the profile changes persist after reload and revisit",
  async function (this: ZincBankWorld) {
    const changed = await this.pages.profile.read();
    await this.page.reload();
    await this.pages.profile.expectValues(changed);
    await this.pages.dashboard.open();
    await this.pages.profile.open();
    await this.pages.profile.expectValues(changed);
  },
);

When(
  "I edit the first name without saving",
  async function (this: ZincBankWorld) {
    const original = await this.pages.profile.firstName.inputValue();
    const changed = `Unsaved${Date.now().toString().slice(-6)}`;
    this.unsavedFirstName = { original, changed };
    await this.pages.profile.firstName.fill(changed);
  },
);
When(
  "I reload and revisit the Profile page",
  async function (this: ZincBankWorld) {
    await this.page.reload();
    await this.pages.dashboard.open();
    await this.pages.profile.open();
  },
);
Then(
  "the unsaved profile edit is discarded",
  async function (this: ZincBankWorld) {
    await expect(this.pages.profile.firstName).toHaveValue(
      this.unsavedFirstName!.original,
    );
  },
);

Then(
  "the Change Password controls are accessible",
  async function (this: ZincBankWorld) {
    await expect(
      this.page.getByRole("heading", { name: "Change Password" }),
    ).toBeVisible();
    await expect(this.pages.profile.currentPassword).toBeVisible();
    await expect(this.pages.profile.newPassword).toBeVisible();
    await expect(this.pages.profile.changePasswordButton).toBeEnabled();
  },
);

Then(
  "both profile password fields remain masked during entry",
  async function (this: ZincBankWorld) {
    for (const [field, value] of [
      [this.pages.profile.currentPassword, "MaskCurrent1"],
      [this.pages.profile.newPassword, "MaskNew123"],
    ] as const) {
      await expect(field).toHaveAttribute("type", "password");
      await field.fill(value);
      await expect(field).toHaveAttribute("type", "password");
      await expect(this.page.getByText(value, { exact: true })).toHaveCount(0);
      await field.clear();
    }
  },
);

When(
  "I attempt a password change using a new password of length {int}",
  async function (this: ZincBankWorld, length: number) {
    const credentials = passwordCredentials();
    this.candidatePassword = "A".repeat(length);
    await this.pages.profile.currentPassword.fill(credentials.password);
    await this.pages.profile.newPassword.fill(this.candidatePassword);
    if (await this.pages.profile.changePasswordButton.isEnabled())
      await this.pages.profile.changePasswordButton.click();
  },
);
Then("the password change is prevented", async function (this: ZincBankWorld) {
  await expect(
    this.page.getByText("Password changed", { exact: true }),
  ).toHaveCount(0);
  const browserRejected = await this.pages.profile.newPassword.evaluate(
    (input: HTMLInputElement) => !input.validity.valid,
  );
  const validationShown = await this.page
    .getByText(/at least 8|minimum.*8|8 characters/i)
    .isVisible()
    .catch(() => false);
  expect(
    browserRejected || validationShown,
    "New Password must expose validation for fewer than 8 characters",
  ).toBe(true);
});

async function changeToUnique(
  world: ZincBankWorld,
  length: number,
): Promise<void> {
  const credentials = passwordCredentials();
  const suffix = Date.now().toString(36);
  const candidate = `Z7!${suffix}Abcdefgh`.slice(0, length);
  world.candidatePassword = candidate;
  world.passwordRestore = {
    email: credentials.email,
    original: credentials.password,
    current: candidate,
  };
  await world.pages.profile.changePassword(credentials.password, candidate);
}
When(
  "I change the password to a unique value of length {int}",
  async function (this: ZincBankWorld, length: number) {
    await changeToUnique(this, length);
  },
);
When(
  "I change the password to a unique value longer than 8 characters",
  async function (this: ZincBankWorld) {
    await changeToUnique(this, 14);
  },
);
Then(
  "{string} is displayed",
  async function (this: ZincBankWorld, message: string) {
    await expect(this.page.getByText(message, { exact: true })).toBeVisible();
  },
);

async function assertLogin(
  world: ZincBankWorld,
  email: string,
  password: string,
  succeeds: boolean,
): Promise<void> {
  await world.context.clearCookies();
  await world.pages.login.open();
  await world.pages.login.login(email, password);
  if (succeeds) await world.pages.dashboard.expectLoaded();
  else await world.pages.login.expectError("Invalid email or password.");
}
Then(
  "the new password authenticates the customer",
  async function (this: ZincBankWorld) {
    const c = passwordCredentials();
    await assertLogin(this, c.email, this.candidatePassword!, true);
  },
);
Then(
  "the old password is rejected and the new password authenticates the customer",
  async function (this: ZincBankWorld) {
    const c = passwordCredentials();
    await assertLogin(this, c.email, c.password, false);
    await assertLogin(this, c.email, this.candidatePassword!, true);
  },
);
When(
  "I attempt a password change with an incorrect current password",
  async function (this: ZincBankWorld) {
    this.candidatePassword = `Proposed!${Date.now().toString(36)}`;
    await this.pages.profile.changePassword(
      "KnownWrong!123",
      this.candidatePassword,
    );
  },
);
Then(
  "the proposed password is rejected while the original password authenticates",
  async function (this: ZincBankWorld) {
    const c = passwordCredentials();
    await assertLogin(this, c.email, this.candidatePassword!, false);
    await assertLogin(this, c.email, c.password, true);
  },
);
