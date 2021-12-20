/// <reference types="cypress" />

import { generateNewOrg, generateNewUser } from '../../utils/generateMockData';

describe('Organization with status Active and User status active flow', () => {
  const testUser = generateNewUser();
  const testOrg = generateNewOrg(testUser);

  before(() => {
    cy.apiRegisterAndApproveUser(testUser);
    cy.apiRegisterAndApproveOrg(testUser, testOrg);
  });

  beforeEach(() => {
    cy.apiLoginUser(testUser);
    cy.visit('/');
  });

  it('should not display pending badge', () => {
    cy.dataCy('organization-pending-badge').should('not.exist');
  });

  it('exchange deposit address should exist', () => {
    cy.visit('/account/profile');

    cy.dataCy('exchange-deposit-address').should('exist');
    cy.dataCy('exchange-deposit-address').should('include.value', '0x');
  });

  it('should not show requirements in devices', () => {
    cy.visit('/device/my');

    cy.wait(1000);

    cy.contains(
      'To access this page, you need to fulfill following criteria'
    ).should('not.exist');

    cy.contains("Currently you don't have any devices in Origin");

    cy.dataCy('registerDevice').last().click();
    cy.contains('Register New Device');
    cy.contains('Device Information');
  });

  it('should not show requirements in certificates', () => {
    cy.dataCy('certificateMenu').click();

    cy.dataCy('certificateExchangeInbox').last().click();
    cy.url().should('include', 'exchange-inbox');
    cy.contains('Exchange Inbox');
    cy.contains('Sell');

    cy.dataCy('certificateClaimsReport').last().click();
    cy.url().should('include', 'claims-report');
    cy.contains('Compliance');
    cy.contains('Certified Energy');

    cy.dataCy('certificateRequests').last().click();
    cy.url().should('include', 'requests');
    cy.contains('Evidence files');
    cy.contains('Status');
  });

  it('should not show requirements in exchange', () => {
    cy.dataCy('exchangeMenu').click();

    cy.url().should('include', 'view-market');
    cy.contains('Market');
    cy.contains('Sell offers');
    cy.contains('Buy offers');

    cy.dataCy('exchangeAllBundles').last().click();
    cy.url().should('include', 'all-bundles');
    cy.contains('Total energy');
    cy.contains('Price per MWh');

    cy.dataCy('exchangeCreateBundle').last().click();
    cy.url().should('include', 'create-bundle');
    cy.contains('Create Bundle');
    cy.contains('Selected For Sale');

    cy.dataCy('exchangeMyTrades').last().click();
    cy.url().should('include', 'my-trades');
    cy.contains('My Trades');
    cy.contains('Total');

    cy.dataCy('exchangeMyBundles').last().click();
    cy.url().should('include', 'my-bundles');
    cy.contains('My bundles');
    cy.contains('Total energy');

    cy.dataCy('exchangeMyOrders').last().click();
    cy.url().should('include', 'my-orders');
    cy.contains('Demands');
    cy.contains('Bids');
    cy.contains('Asks');

    cy.dataCy('exchangeSupply').last().click();
    cy.url().should('include', 'supply');
    cy.contains('Status');
    cy.contains('To be certified');
  });
});
