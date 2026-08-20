@smoke
Feature: ZincBank public navigation
  As a prospective ZincBank customer
  I want to navigate the public website
  So that I can access the banking experience

  Scenario: View the ZincBank home page
    Given I am on the ZincBank home page
    Then the ZincBank home page is displayed

  Scenario: Navigate from the home page to login
    Given I am on the ZincBank home page
    When I choose to log in
    Then the login page is displayed
