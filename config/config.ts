import "dotenv/config";
import type { BrowserType, LaunchOptions } from "@playwright/test";

export type BrowserName = "chromium" | "firefox" | "webkit";
export type EnvironmentName = "local" | "qa" | "staging" | "production";

const environmentUrls: Record<EnvironmentName, string> = {
  local: process.env.LOCAL_BASE_URL ?? "http://localhost:3000",
  qa: process.env.QA_BASE_URL ?? "https://zincbank.cydeo.io",
  staging: process.env.STAGING_BASE_URL ?? "https://zincbank.cydeo.io",
  production: process.env.PRODUCTION_BASE_URL ?? "https://zincbank.cydeo.io",
};

function oneOf<T extends string>(
  value: string,
  allowed: readonly T[],
  name: string,
): T {
  if (!allowed.includes(value as T)) {
    throw new Error(
      `${name} must be one of: ${allowed.join(", ")}. Received: ${value}`,
    );
  }
  return value as T;
}

const browserName = oneOf(
  (process.env.BROWSER ?? "chromium").toLowerCase(),
  ["chromium", "firefox", "webkit"] as const,
  "BROWSER",
);
const environment = oneOf(
  (process.env.TEST_ENV ?? "qa").toLowerCase(),
  ["local", "qa", "staging", "production"] as const,
  "TEST_ENV",
);

export const config = Object.freeze({
  browserName,
  environment,
  baseUrl: process.env.BASE_URL ?? environmentUrls[environment],
  defaultTimeout: Number(process.env.DEFAULT_TIMEOUT ?? 10_000),
  navigationTimeout: Number(process.env.NAVIGATION_TIMEOUT ?? 30_000),
  actionTimeout: Number(process.env.ACTION_TIMEOUT ?? 10_000),
  screenshotOnFailure: process.env.SCREENSHOT_ON_FAILURE !== "false",
  trace: (process.env.TRACE ?? "retain-on-failure") as
    "on" | "off" | "retain-on-failure",
  launchOptions: {
    headless: process.env.HEADLESS !== "false",
    slowMo: Number(process.env.SLOW_MO ?? 0),
  } satisfies LaunchOptions,
  credentials: {
    email: process.env.ZINCBANK_EMAIL,
    password: process.env.ZINCBANK_PASSWORD,
  },
  passwordTestCredentials: {
    email: process.env.ZINCBANK_PASSWORD_TEST_EMAIL,
    password: process.env.ZINCBANK_PASSWORD_TEST_PASSWORD,
  },
  profileTestCredentials: {
    email: process.env.ZINCBANK_PROFILE_TEST_EMAIL,
    password: process.env.ZINCBANK_PROFILE_TEST_PASSWORD,
  },
  expectedProfile: {
    firstName: process.env.ZINCBANK_FIRST_NAME,
    lastName: process.env.ZINCBANK_LAST_NAME,
    phone: process.env.ZINCBANK_PHONE,
    address: process.env.ZINCBANK_ADDRESS,
  },
});

export type FrameworkConfig = typeof config;
export type SupportedBrowserType = BrowserType;
