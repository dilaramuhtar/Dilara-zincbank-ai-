@regression @auth
Feature: US00 Customer Login
  @smoke @P0
  Scenario: ZB-US00-001 Login form displays all required elements
    Given I am on the ZincBank login page
    Then all required login elements are accessible

  @smoke @session @P0
  Scenario: ZB-US00-002 Valid credentials authenticate the customer
    Given I am on the ZincBank login page
    When I log in with configured credentials
    Then protected customer content is displayed

  @negative @P0
  Scenario: ZB-US00-003 Unknown email with a password is rejected
    Given I am on the ZincBank login page
    When I submit an unknown email and an incorrect password
    Then login is rejected with "Invalid email or password."

  @negative @P0
  Scenario: ZB-US00-004 Valid email with an incorrect password is rejected
    Given I am on the ZincBank login page
    When I submit the configured email with an incorrect password
    Then login is rejected with "Invalid email or password."

  @smoke @negative @P0
  Scenario: ZB-US00-005 Empty Email and Password fields are required
    Given I am on the ZincBank login page
    When I submit the login form without credentials
    Then login is rejected with "Enter your email and password."

  @negative @P1
  Scenario Outline: ZB-US00-006 Invalid email formats are rejected
    Given I am on the ZincBank login page
    When I submit invalid email "<email>" with a non-empty password
    Then login is rejected with "Enter your email and password."
    Examples:
      | email                |
      | student01            |
      | student01@           |
      | @zinc.test           |
      | student 01@zinc.test |

  @security @P1
  Scenario: ZB-US00-007 Password entry is masked
    Given I am on the ZincBank login page
    Then the login password remains masked during entry
