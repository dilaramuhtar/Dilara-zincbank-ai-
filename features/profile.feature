@regression @profile
Feature: US02 Profile and Password Management
  Background:
    Given I am authenticated on the Profile page

  @smoke @P1
  Scenario: ZB-US02-001 Profile displays the current customer information
    Then all profile fields display configured customer information

  @P1
  Scenario: ZB-US02-002 Profile fields have the correct editability
    Then profile fields have the required editability

  @mutating @serial @P1
  Scenario: ZB-US02-003 Saving all editable profile fields persists the changes
    When I save unique values in all editable profile fields
    Then the profile changes persist after reload and revisit

  @negative @P2
  Scenario: ZB-US02-004 Unsaved profile edits do not masquerade as persisted data
    When I edit the first name without saving
    And I reload and revisit the Profile page
    Then the unsaved profile edit is discarded

  @smoke @password @P1
  Scenario: ZB-US02-005 Change Password section displays all required controls
    Then the Change Password controls are accessible

  @password @security @P1
  Scenario: ZB-US02-006 Current and New Password entries are masked
    Then both profile password fields remain masked during entry

  @password @negative @P0
  Scenario Outline: ZB-US02-007 New Password rejects values shorter than eight characters
    When I attempt a password change using a new password of length <length>
    Then the password change is prevented
    Examples:
      | length |
      | 0      |
      | 1      |
      | 7      |

  @password @boundary @mutating @serial @P0
  Scenario: ZB-US02-008 New Password accepts the eight-character boundary
    When I change the password to a unique value of length 8
    Then "Password changed" is displayed
    And the new password authenticates the customer

  @smoke @password @mutating @serial @P0
  Scenario: ZB-US02-009 Customer can change a password successfully
    When I change the password to a unique value longer than 8 characters
    Then "Password changed" is displayed
    And the old password is rejected and the new password authenticates the customer

  @smoke @password @negative @P0
  Scenario: ZB-US02-010 Incorrect current password prevents password change
    When I attempt a password change with an incorrect current password
    Then "Current password is incorrect" is displayed
    And the proposed password is rejected while the original password authenticates
