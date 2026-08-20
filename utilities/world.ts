import {
  setWorldConstructor,
  World,
  type IWorldOptions,
} from "@cucumber/cucumber";
import type { Browser, BrowserContext, Page } from "@playwright/test";
import { PageManager } from "../pages/page-manager";
import { BrowserUtils } from "./browser-utils";
import type { ProfileValues } from "../pages/profile.page";

export class ZincBankWorld extends World {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;
  pages!: PageManager;
  browserUtils!: BrowserUtils;
  originalProfile?: ProfileValues;
  profileNeedsRestore = false;
  passwordRestore?: { email: string; original: string; current: string };
  isPasswordScenario = false;
  isMutatingProfileScenario = false;
  activeCredentials?: { email: string; password: string };
  candidatePassword?: string;
  unsavedFirstName?: { original: string; changed: string };

  constructor(options: IWorldOptions) {
    super(options);
  }
}

setWorldConstructor(ZincBankWorld);
