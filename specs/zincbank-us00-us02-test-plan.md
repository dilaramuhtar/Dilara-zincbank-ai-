# ZincBank UI Automation Test Plan — US00, US01, and US02

## 1. Purpose and scope

This plan defines independent Playwright/TypeScript/Cucumber UI scenarios for ZincBank customer login, authenticated dashboard access, navigation, sign-out, profile maintenance, and password changes. It is intended for implementation with the repository's page-object model and Allure reporting.

Target: `https://zincbank.cydeo.io/`

In scope:

- US00 — Customer Login (AC1–AC6)
- US01 — Personalized Dashboard (AC1–AC7)
- US02 — Profile and Password Management (AC1–AC9)
- Functional, validation, boundary, security-visible, navigation, persistence, and session-isolation checks

Out of scope:

- Penetration testing, API contract testing, performance/load testing, email delivery, and visual pixel comparison
- Validation of the semantic correctness of icon artwork beyond visibility, accessible name, and association with its navigation label

## 2. Test approach

Automate scenarios through user-visible controls with Playwright. Prefer accessible roles/labels and stable `data-testid` attributes; keep locators and actions in page objects. Use Cucumber hooks to create a fresh browser context for every scenario, capture screenshot/trace on failure, and attach evidence to Allure.

Each scenario starts from a blank/fresh browser context: no cookies, local storage, session storage, service-worker state, or cached authentication. Scenarios must run in any order and must not depend on another scenario having logged in, edited a profile, or changed a password.

### Tags and priorities

- `@P0`: critical authentication/security path; release blocker
- `@P1`: core account behavior or destructive/mutating path
- `@P2`: presentation, validation detail, or secondary behavior
- `@smoke`: minimal high-value deployment confidence
- `@regression`: full suite
- `@auth`, `@dashboard`, `@navigation`, `@profile`, `@password`: functional grouping
- `@negative`: rejected or invalid input
- `@session`: authentication/session boundary
- `@mutating`: changes persistent test data
- `@serial`: excluded from parallel execution and protected by an account-level lock

## 3. Preconditions and controlled test data

1. The target environment is reachable and seeded with a dedicated active customer account.
2. Credentials are supplied through environment variables or CI secrets, never feature files, source code, logs, screenshots, or Allure step parameters:
   - `ZINCBANK_EMAIL` (current seed: `student03@zinc.test`)
   - `ZINCBANK_PASSWORD` (provided securely through `.env` or CI secrets)
3. Before authenticated scenarios run, a setup health check must verify the credential pair works. If it does not, classify the run as blocked/test-data failure rather than an application assertion failure.
4. Password-changing tests require a separate resettable account (`ZINCBANK_PASSWORD_TEST_EMAIL` / `ZINCBANK_PASSWORD_TEST_PASSWORD`) or an environment reset API/fixture. They must not share an account with parallel read-only tests.
5. Profile-changing tests require a dedicated resettable account or an environment reset API/fixture.
6. Invalid test data:
   - syntactically valid unknown email: `not-a-user-<run-id>@zinc.test`
   - invalid password: generated non-secret value not equal to the valid password
   - invalid email formats: `student01`, `student01@`, `@zinc.test`, and `student 01@zinc.test`
7. Unique editable profile data must include the run ID to prevent collision, while remaining valid for field constraints.
8. Default desktop viewport is used for the acceptance suite. Cross-browser regression runs on Chromium, Firefox, and WebKit.

## 4. State isolation and cleanup rules

1. Create and dispose one Playwright `BrowserContext` per scenario. Never reuse an authenticated storage state for unauthenticated-access tests.
2. Login independently in each authenticated scenario, preferably through the UI when login itself is under test. A separately validated API/storage-state fixture may be used only for non-login scenarios.
3. For a profile mutation, read and retain the original First Name, Last Name, Phone, and Address before editing. Restore all original values in an `After`/`finally` cleanup even if an assertion fails, then refresh and verify restoration.
4. For a password mutation, use a dedicated account, run with `@serial`, change from the original to a unique compliant temporary password, verify it, then restore the original password in `After`/`finally`. Verify login with the original password after restoration.
5. If password restoration fails, mark cleanup as failed, quarantine the account, suppress its use by later tests, and trigger the environment reset procedure. Never continue using an account with unknown credentials.
6. Do not log or attach password values. Mask sensitive Allure parameters and redact traces where environment policy requires it.
7. Sign out or dispose the context after authenticated scenarios. Context disposal is mandatory even when UI sign-out is the behavior under test.

## 5. Acceptance-criteria traceability

| Acceptance criterion | Covered by               |
| -------------------- | ------------------------ |
| US00-AC1             | ZB-US00-001              |
| US00-AC2             | ZB-US00-002              |
| US00-AC3             | ZB-US00-003, ZB-US00-004 |
| US00-AC4             | ZB-US00-005              |
| US00-AC5             | ZB-US00-006              |
| US00-AC6             | ZB-US00-007              |
| US01-AC1             | ZB-US01-001              |
| US01-AC2             | ZB-US01-002              |
| US01-AC3             | ZB-US01-003              |
| US01-AC4             | ZB-US01-004              |
| US01-AC5             | ZB-US01-005, ZB-US01-006 |
| US01-AC6             | ZB-US01-007              |
| US01-AC7             | ZB-US01-008              |
| US02-AC1             | ZB-US02-001              |
| US02-AC2             | ZB-US02-002              |
| US02-AC3             | ZB-US02-003, ZB-US02-004 |
| US02-AC4             | ZB-US02-005              |
| US02-AC5             | ZB-US02-006              |
| US02-AC6             | ZB-US02-007, ZB-US02-008 |
| US02-AC7             | ZB-US02-009              |
| US02-AC8             | ZB-US02-010              |
| US02-AC9             | ZB-US02-009              |

## 6. Detailed scenarios

### US00 — Customer Login

#### ZB-US00-001 — Login form displays all required elements

Tags/Priority: `@smoke @regression @auth @P0`  
Covers: US00-AC1  
Starting state: Fresh unauthenticated context.

Steps:

1. Navigate to `/login`.
2. Verify the page finishes loading without a client or server error.
3. Locate the ZincBank brand mark/name, Email field, Password field, Sign in button, and Open an account link.
4. Verify every element is visible and enabled where interactive.
5. Verify the fields have accessible labels `Email` and `Password`, the button name is `Sign in`, and the link text is `Open an account`.

Expected results:

- All required elements are rendered once, are usable by keyboard/accessibility locators, and the Open an account link has a valid destination.
- Failure: any element is missing, duplicated ambiguously, hidden, disabled unexpectedly, mislabeled, or the page reports an error.

#### ZB-US00-002 — Valid credentials authenticate the customer

Tags/Priority: `@smoke @regression @auth @session @P0`  
Covers: US00-AC2  
Starting state: Fresh unauthenticated context; valid controlled credentials pass the setup health check.

Steps:

1. Navigate to `/login`.
2. Enter `ZINCBANK_EMAIL` and `ZINCBANK_PASSWORD`.
3. Select Sign in once.
4. Wait for the authentication/navigation response to settle.
5. Verify the login form is no longer displayed and protected customer content is visible.

Expected results:

- Authentication succeeds without an error message or duplicate submission.
- Failure: credentials are rejected, the login form remains active, an error is shown, or protected content is not reached.

#### ZB-US00-003 — Unknown email with a password is rejected

Tags/Priority: `@regression @auth @negative @P0`  
Covers: US00-AC3  
Starting state: Fresh unauthenticated context.

Steps:

1. Navigate to `/login`.
2. Enter a unique syntactically valid unknown email and a non-empty password.
3. Select Sign in.
4. Observe the form, URL, and visible error feedback.

Expected results:

- Login is prevented, the user remains unauthenticated on `/login`, protected content is absent, and `Invalid email or password.` is displayed.
- Failure: the user is authenticated, the message differs/leaks account existence, or protected content appears.

#### ZB-US00-004 — Valid email with an incorrect password is rejected

Tags/Priority: `@regression @auth @negative @P0`  
Covers: US00-AC3  
Starting state: Fresh unauthenticated context; valid account exists.

Steps:

1. Navigate to `/login`.
2. Enter the valid email and a known incorrect non-empty password.
3. Select Sign in.
4. Observe the form, URL, and visible error feedback.

Expected results:

- Login is prevented, the user remains on `/login`, no protected content appears, and `Invalid email or password.` is displayed.
- Failure: login succeeds or the message reveals whether the email exists.

#### ZB-US00-005 — Empty Email and Password fields are required

Tags/Priority: `@smoke @regression @auth @negative @P0`  
Covers: US00-AC4  
Starting state: Fresh unauthenticated context.

Steps:

1. Navigate to `/login` without entering either field.
2. Select Sign in.
3. Verify the URL, authentication state, validation message, and protected-content visibility.

Expected results:

- Login is prevented and `Enter your email and password.` is displayed.
- The user remains unauthenticated; no protected dashboard content is visible.
- Failure: submission authenticates, navigates to protected content, or gives absent/incorrect feedback.

#### ZB-US00-006 — Invalid email formats are rejected

Tags/Priority: `@regression @auth @negative @P1`  
Covers: US00-AC5  
Starting state: Fresh unauthenticated context for each example.

Steps (Scenario Outline):

1. Navigate to `/login`.
2. Enter one invalid email example (`student01`, `student01@`, `@zinc.test`, or `student 01@zinc.test`) and a non-empty password.
3. Select Sign in.
4. Repeat as an independent scenario for every example.

Expected results:

- Each format is rejected; `Enter your email and password.` is displayed; the context remains unauthenticated and protected content is absent.
- Failure: any malformed email is accepted or the required message is not displayed.

#### ZB-US00-007 — Password entry is masked

Tags/Priority: `@regression @auth @security @P1`  
Covers: US00-AC6  
Starting state: Fresh unauthenticated context.

Steps:

1. Navigate to `/login`.
2. Verify the Password input has HTML input type `password` before entry.
3. Enter a distinctive non-secret test value.
4. Verify the input remains type `password` and the literal value is not rendered as visible page text.

Expected results:

- Browser-native masking is active before and after entry.
- Failure: the field type changes to text or the password appears visibly elsewhere on the page.

### US01 — Personalized Dashboard

#### ZB-US01-001 — Successful login creates an authenticated session

Tags/Priority: `@smoke @regression @auth @session @P0`  
Covers: US01-AC1  
Starting state: Fresh unauthenticated context; controlled credentials are valid.

Steps:

1. Open `/login` and log in with the controlled valid account.
2. Verify authentication succeeds.
3. Reload the resulting protected page in the same context.
4. Verify the protected page remains visible without requesting credentials again.

Expected results:

- A session is created and survives a same-context reload.
- Failure: login fails or reload returns the user to `/login`.

#### ZB-US01-002 — Successful login redirects to the dashboard

Tags/Priority: `@smoke @regression @dashboard @P0`  
Covers: US01-AC2  
Starting state: Fresh unauthenticated context; valid credentials.

Steps:

1. Navigate to `/login` and submit valid credentials.
2. Wait for the URL to become `/dashboard`.
3. Verify the dashboard's unique heading/container and customer overview content are visible.

Expected results:

- Final path is exactly `/dashboard` (allowing only documented query/fragment values), the dashboard renders, and the login form is absent.
- Failure: wrong route, blank/error page, or login content remains.

#### ZB-US01-003 — Authenticated customer can revisit `/dashboard`

Tags/Priority: `@regression @dashboard @session @P0`  
Covers: US01-AC3  
Starting state: Fresh context authenticated within this scenario.

Steps:

1. Log in with valid credentials.
2. Navigate to another public or protected page without signing out.
3. Directly navigate to `/dashboard`.
4. Reload `/dashboard` once.

Expected results:

- Both navigation and reload remain on `/dashboard`; protected dashboard content is visible and `/login` is never the final route.
- Failure: session is lost or the user is redirected to login.

#### ZB-US01-004 — Unauthenticated direct dashboard access is blocked

Tags/Priority: `@smoke @regression @dashboard @session @negative @P0`  
Covers: US01-AC4  
Starting state: Brand-new context with no imported storage state.

Steps:

1. Navigate directly to `/dashboard`.
2. Wait for redirects and rendering to settle.
3. Inspect the final URL and visible page content.

Expected results:

- Final route is `/login`; the login page is visible; account balances, recent activity, customer identity, and all other protected dashboard content are absent throughout the settled page.
- Failure: dashboard content is exposed, even briefly after settling, or final access remains on `/dashboard`.

#### ZB-US01-005 — Sidebar displays all required labels and icons

Tags/Priority: `@regression @dashboard @navigation @P1`  
Covers: US01-AC5  
Starting state: Fresh context authenticated within this scenario and displaying `/dashboard`.

Steps:

1. Locate the dashboard sidebar/navigation landmark.
2. Verify unique visible entries labeled `DASHBOARD`, `ACCOUNTS`, `MOVE MONEY`, `TRANSACTIONS`, `CARDS`, `PROFILE`, and `Sign out`.
3. For each entry, verify an icon is visible, non-empty, and associated with the same control (decorative icons may be `aria-hidden`; functional labels must remain accessible).

Expected results:

- Every required entry appears with the exact label and an associated icon; none are disabled unexpectedly.
- Failure: missing/wrong/duplicate label, missing icon, inaccessible control, or unexpected disabled state.

#### ZB-US01-006 — Every sidebar navigation item opens its corresponding page

Tags/Priority: `@regression @dashboard @navigation @P1`  
Covers: US01-AC5  
Starting state: A new authenticated context for each navigation example.

Steps (Scenario Outline):

1. Open `/dashboard` while authenticated.
2. Select one sidebar item: `DASHBOARD`, `ACCOUNTS`, `MOVE MONEY`, `TRANSACTIONS`, `CARDS`, or `PROFILE`.
3. Wait for navigation/rendering to settle.
4. Verify the destination path matches the product route for that item and a destination-specific heading/container is visible.
5. Repeat in a fresh context for every item.

Expected results:

- Each item reaches only its corresponding authenticated page, its selected/active state is correct, and no error/login page appears.
- Failure: wrong/no navigation, broken page, lost authentication, or incorrect active state.

#### ZB-US01-007 — Sign out ends the authenticated session

Tags/Priority: `@smoke @regression @auth @session @P0`  
Covers: US01-AC6  
Starting state: Fresh context authenticated within this scenario on `/dashboard`.

Steps:

1. Select `Sign out` in the sidebar.
2. Wait for navigation and session cleanup to settle.
3. Verify the final route and visible page.
4. Reload the page.

Expected results:

- The final route is `/login`, the login page is displayed, protected content is absent, and reload remains unauthenticated.
- Failure: protected content/session remains accessible or sign-out does not redirect.

#### ZB-US01-008 — Signed-out customer cannot return to protected pages

Tags/Priority: `@smoke @regression @auth @session @negative @P0`  
Covers: US01-AC7  
Starting state: Fresh context; log in and sign out within this scenario.

Steps (Scenario Outline):

1. Log in and use Sign out.
2. Attempt direct navigation to each protected route discovered for Dashboard, Accounts, Move Money, Transactions, Cards, and Profile.
3. For `/dashboard`, also use browser Back and reload to test cached history.
4. Wait for each navigation to settle.

Expected results:

- Every protected-route attempt resolves to `/login`; protected content and sensitive cached values are absent.
- Failure: any protected route/content is accessible without reauthentication.

### US02 — Profile and Password Management

#### ZB-US02-001 — Profile displays the current customer information

Tags/Priority: `@smoke @regression @profile @P1`  
Covers: US02-AC1  
Starting state: Fresh context authenticated with a seeded account whose expected profile fixture is known.

Steps:

1. Navigate to Profile through the sidebar.
2. Verify fields labeled First Name, Last Name, Phone, Address, and Email are visible.
3. Read each displayed value.
4. Compare values with the seeded expected profile fixture for this account.

Expected results:

- All five fields display the correct current, non-placeholder values in their corresponding controls.
- Failure: missing field, swapped value, stale/blank value, or mismatch with seeded data.

#### ZB-US02-002 — Profile fields have the correct editability

Tags/Priority: `@regression @profile @P1`  
Covers: US02-AC2  
Starting state: Fresh authenticated context on Profile.

Steps:

1. Verify First Name, Last Name, Phone, and Address accept user input and are not disabled/read-only.
2. Attempt a reversible edit in each field without saving.
3. Verify Email is rendered read-only or disabled and cannot be altered using normal keyboard input.
4. Reload/navigate away to discard unsaved edits.

Expected results:

- Only the four specified profile fields are editable; Email remains unchanged and non-editable.
- Failure: an editable field rejects input or Email can be modified.

#### ZB-US02-003 — Saving all editable profile fields persists the changes

Tags/Priority: `@regression @profile @mutating @serial @P1`  
Covers: US02-AC3  
Starting state: Dedicated resettable account; original profile values captured before mutation.

Steps:

1. Replace First Name, Last Name, Phone, and Address with valid run-unique values.
2. Select `Save changes` once and wait for the save response/feedback.
3. Verify the page displays the submitted values.
4. Reload Profile and verify all values remain.
5. Navigate to another page and back to Profile; verify values still remain.
6. In cleanup, restore every original value, save, reload, and verify restoration.

Expected results:

- Save succeeds exactly once and all editable changes persist across reload and revisit; Email remains unchanged.
- Failure: partial update, stale values, unintended Email change, save error, or cleanup/restoration failure.

#### ZB-US02-004 — Unsaved profile edits do not masquerade as persisted data

Tags/Priority: `@regression @profile @negative @P2`  
Covers: US02-AC3  
Starting state: Fresh authenticated context; current values recorded.

Steps:

1. Modify one editable field with a valid run-unique value.
2. Do not select `Save changes`.
3. Reload the page (accept any documented unsaved-change prompt appropriately).
4. Revisit Profile and read the field.

Expected results:

- The unsaved value is not persisted; the original server value is displayed.
- Failure: data changes without Save changes or unrelated fields change.

#### ZB-US02-005 — Change Password section displays all required controls

Tags/Priority: `@smoke @regression @profile @password @P1`  
Covers: US02-AC4  
Starting state: Fresh authenticated context on Profile.

Steps:

1. Locate the Change Password section.
2. Verify visible fields labeled `Current Password` and `New Password`.
3. Verify a visible, enabled button named `Change password`.

Expected results:

- All three controls appear in the correct section with unique accessible labels/names.
- Failure: missing, mislabeled, ambiguous, hidden, or unexpectedly disabled control.

#### ZB-US02-006 — Current and New Password entries are masked

Tags/Priority: `@regression @profile @password @security @P1`  
Covers: US02-AC5  
Starting state: Fresh authenticated context on Profile.

Steps:

1. Verify both password controls have HTML input type `password`.
2. Enter distinct non-secret values into both fields.
3. Verify both remain type `password` and neither literal value appears in visible page text.
4. Clear both fields without submitting.

Expected results:

- Both values remain browser-masked throughout entry.
- Failure: either control exposes plain text or echoes a password visibly.

#### ZB-US02-007 — New Password rejects values shorter than eight characters

Tags/Priority: `@regression @profile @password @negative @P0`  
Covers: US02-AC6  
Starting state: Dedicated authenticated password-test account with known current password.

Steps (Scenario Outline):

1. Enter the correct current password.
2. Enter a generated new password of length 0, 1, or 7 (one independent context per example).
3. Select `Change password` if enabled; otherwise verify client validation prevents submission.
4. Sign out and verify the original password still authenticates.

Expected results:

- Password change is prevented for every value below eight characters; clear validation is associated with New Password; `Password changed` is absent.
- The original credential remains valid.
- Failure: any below-boundary password is accepted or the account credential changes.

#### ZB-US02-008 — New Password accepts the eight-character boundary

Tags/Priority: `@regression @profile @password @boundary @mutating @serial @P0`  
Covers: US02-AC6  
Starting state: Dedicated resettable password-test account; unique policy-compliant password of exactly 8 characters prepared.

Steps:

1. Enter the correct current password and the exactly 8-character new password.
2. Select `Change password`.
3. Verify success, sign out, and authenticate with the new password.
4. In cleanup, restore the original password using the new password as Current Password and verify original login works.

Expected results:

- The minimum boundary is accepted and usable for authentication.
- Failure: the 8-character value is rejected, cannot authenticate, or cleanup fails.

#### ZB-US02-009 — Customer can change a password successfully

Tags/Priority: `@smoke @regression @profile @password @mutating @serial @P0`  
Covers: US02-AC7, US02-AC9  
Starting state: Dedicated resettable account with known current password; generated valid new password longer than eight characters.

Steps:

1. Enter the correct current password and valid unique new password.
2. Select `Change password` once.
3. Verify the exact visible success message `Password changed`.
4. Sign out and verify the old password is rejected with `Invalid email or password.`.
5. Verify the new password authenticates successfully.
6. In cleanup, restore the original password, sign out, and verify original authentication.

Expected results:

- Exactly one successful change occurs; the exact success message is shown; the old credential stops working and the new credential works.
- Failure: absent/incorrect success feedback, both/neither passwords work, repeated mutation, or cleanup fails.

#### ZB-US02-010 — Incorrect current password prevents password change

Tags/Priority: `@smoke @regression @profile @password @negative @P0`  
Covers: US02-AC8  
Starting state: Dedicated authenticated password-test account with known original password.

Steps:

1. Enter a known incorrect Current Password.
2. Enter a valid unique New Password of at least eight characters.
3. Select `Change password`.
4. Verify the exact visible error `Current password is incorrect` and absence of `Password changed`.
5. Sign out; verify the proposed new password is rejected and the original password still authenticates.

Expected results:

- No password mutation occurs, the exact error is shown, and only the original credential remains valid.
- Failure: success is reported, the new password works, the original stops working, or the exact error is absent.

## 7. Recommended execution sets

### Pull-request smoke

Run `@smoke and not @mutating` on Chromium. Use a fresh account fixture and fail fast if the credential health check fails.

### Full regression

Run non-mutating `@regression and not @mutating` scenarios in parallel on Chromium, Firefox, and WebKit. Run `@mutating and @serial` scenarios afterward in a single worker using dedicated locked accounts.

### Suggested feature-file split

- `features/login.feature` — ZB-US00-001 through ZB-US00-007
- `features/dashboard.feature` — ZB-US01-001 through ZB-US01-008
- `features/profile.feature` — ZB-US02-001 through ZB-US02-010

## 8. Entry and exit criteria

Entry criteria:

- Target deployment is healthy and test accounts/fixtures are available.
- Browser binaries and supported Node dependencies are installed.
- Credential health check and test-data reset mechanism succeed.

Exit criteria:

- All `@P0` scenarios pass on required release browsers.
- No unexplained `@P1` failures remain.
- All mutable data is verified restored; no account remains quarantined.
- Allure report contains scenario ID, AC mapping, browser/environment metadata, and failure evidence without secrets.

## 9. Live inspection note

On 2026-08-20, the deployed login page was verified to expose ZincBank branding, Email, Password, Sign in, and Open an account, and to show `Invalid email or password.` for rejected credentials. The original student01 credential pair was rejected by the live deployment during planning and has since been replaced by the student03 account in the local secret configuration. Validate/reset credentials before execution rather than weakening authentication assertions.
