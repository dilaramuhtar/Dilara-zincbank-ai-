# ZincBank UI Automation

A production-ready BDD test framework using Playwright, TypeScript, Cucumber, Page Objects, and Allure.

## Structure

```text
features/       Gherkin feature files
pages/          Page objects and the PageManager
steps/          Cucumber step definitions
utilities/      Browser driver, hooks, custom World, and browser helpers
config/         Central browser, environment, timeout, and credential configuration
```

## Setup

Requires Node.js 20 or newer and Java (only for viewing Allure reports).

```bash
npm install
npx playwright install
cp .env.example .env
npm test
```

Never commit `.env`. Put secrets such as `ZINCBANK_EMAIL` and `ZINCBANK_PASSWORD` there or inject them through CI secret variables.

## Configuration

All runtime settings are centralized in `config/config.ts` and overridden through environment variables:

```bash
BROWSER=firefox TEST_ENV=staging npm test
BASE_URL=https://example.test HEADLESS=false npm test
```

Supported browsers are `chromium`, `firefox`, and `webkit`. Supported named environments are `local`, `qa`, `staging`, and `production`. `BASE_URL` has the highest priority.

## Common commands

```bash
npm test                    # all scenarios
npm run test:smoke          # @smoke scenarios
npm run test:regression     # @regression scenarios
npm run test:headed         # visible browser
npm run test:firefox        # select Firefox
npm run test:parallel       # four Cucumber workers
npm run typecheck           # strict TypeScript validation
npm run allure:serve        # generate and open results
```

On failure, the framework attaches a full-page screenshot to the scenario and retains a Playwright trace under `test-results/traces`. Use `npx playwright show-trace <trace.zip>` to inspect it.

## Adding a test

1. Describe behavior in a `.feature` file.
2. Add reusable actions and locators to the relevant class under `pages/`.
3. Expose a new page through `pages/page-manager.ts`.
4. Bind business-readable steps under `steps/`; keep selectors and low-level UI details out of steps.

Prefer roles, labels, and the application's `data-testid` hooks over CSS or XPath selectors.
