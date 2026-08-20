import { expect, type Locator, type Page } from "@playwright/test";
import { BasePage } from "./base.page";

export interface ProfileValues {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  email: string;
}

export class ProfilePage extends BasePage {
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly phone: Locator;
  readonly address: Locator;
  readonly email: Locator;
  readonly saveButton: Locator;
  readonly currentPassword: Locator;
  readonly newPassword: Locator;
  readonly changePasswordButton: Locator;

  constructor(page: Page) {
    super(page);
    this.firstName = page.getByTestId("profile-firstname-input");
    this.lastName = page.getByTestId("profile-lastname-input");
    this.phone = page.getByTestId("profile-phone-input");
    this.address = page.getByTestId("profile-addressline-input");
    this.email = page.getByTestId("profile-email-input");
    this.saveButton = page.getByTestId("profile-save");
    this.currentPassword = page.getByTestId("profile-currentpassword-input");
    this.newPassword = page.getByTestId("profile-newpassword-input");
    this.changePasswordButton = page.getByTestId(
      "profile-changepassword-submit",
    );
  }

  async open(): Promise<void> {
    await super.open("/profile");
  }
  async expectLoaded(): Promise<void> {
    await expect(this.firstName).toBeVisible();
    await expect(this.saveButton).toBeVisible();
  }
  async read(): Promise<ProfileValues> {
    return {
      firstName: await this.firstName.inputValue(),
      lastName: await this.lastName.inputValue(),
      phone: await this.phone.inputValue(),
      address: await this.address.inputValue(),
      email: await this.email.inputValue(),
    };
  }
  async fill(values: Omit<ProfileValues, "email">): Promise<void> {
    await this.firstName.fill(values.firstName);
    await this.lastName.fill(values.lastName);
    await this.phone.fill(values.phone);
    await this.address.fill(values.address);
  }
  async save(): Promise<void> {
    await this.saveButton.click();
  }
  async changePassword(current: string, next: string): Promise<void> {
    await this.currentPassword.fill(current);
    await this.newPassword.fill(next);
    await this.changePasswordButton.click();
  }
  async expectValues(values: Partial<ProfileValues>): Promise<void> {
    for (const [key, value] of Object.entries(values))
      await expect(this[key as keyof ProfileValues]).toHaveValue(value);
  }
}
