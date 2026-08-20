@regression @dashboard
Feature: US01 Personalized Dashboard
  @smoke @auth @session @P0
  Scenario: ZB-US01-001 Successful login creates an authenticated session
    When I authenticate with the configured customer
    And I reload the current page
    Then the dashboard is displayed

  @smoke @P0
  Scenario: ZB-US01-002 Successful login redirects to the dashboard
    When I authenticate with the configured customer
    Then the dashboard is displayed

  @session @P0
  Scenario: ZB-US01-003 Authenticated customer can revisit dashboard
    When I authenticate with the configured customer
    And I open the protected route "/profile"
    And I open the protected route "/dashboard"
    And I reload the current page
    Then the dashboard is displayed

  @smoke @session @negative @P0
  Scenario: ZB-US01-004 Unauthenticated direct dashboard access is blocked
    When I open the protected route "/dashboard"
    Then the login page is displayed
    And protected customer content is absent

  @navigation @P1
  Scenario: ZB-US01-005 Sidebar displays all required labels and icons
    When I authenticate with the configured customer
    Then the sidebar displays all required labels and icons

  @navigation @P1
  Scenario Outline: ZB-US01-006 Every sidebar navigation item opens its corresponding page
    When I authenticate with the configured customer
    And I select sidebar item "<item>"
    Then the protected destination "<route>" is displayed
    Examples:
      | item         | route         |
      | DASHBOARD    | /dashboard    |
      | ACCOUNTS     | /accounts     |
      | MOVE MONEY   | /move-money   |
      | TRANSACTIONS | /transactions |
      | CARDS        | /cards        |
      | PROFILE      | /profile      |

  @smoke @auth @session @P0
  Scenario: ZB-US01-007 Sign out ends the authenticated session
    When I authenticate with the configured customer
    And I sign out
    And I reload the current page
    Then the login page is displayed
    And protected customer content is absent

  @smoke @auth @session @negative @P0
  Scenario Outline: ZB-US01-008 Signed-out customer cannot return to protected pages
    When I authenticate with the configured customer
    And I sign out
    And I open the protected route "<route>"
    Then the login page is displayed
    And protected customer content is absent
    Examples:
      | route         |
      | /dashboard    |
      | /accounts     |
      | /move-money   |
      | /transactions |
      | /cards        |
      | /profile      |
