import type { Page } from "@playwright/test";
import { HomePage } from "./home.page";
import { LoginPage } from "./login.page";
import { DashboardPage } from "./dashboard.page";
import { ProfilePage } from "./profile.page";

export class PageManager {
  readonly home: HomePage;
  readonly login: LoginPage;
  readonly dashboard: DashboardPage;
  readonly profile: ProfilePage;

  constructor(page: Page) {
    this.home = new HomePage(page);
    this.login = new LoginPage(page);
    this.dashboard = new DashboardPage(page);
    this.profile = new ProfilePage(page);
  }
}
