/// <reference types="cypress" />

import { generateNewOrg, generateNewUser } from '../../utils/generateMockData';

describe('Organization with status Pending and User status active flow', () => {
  const testUser = generateNewUser();
  const testOrg = generateNewOrg(testUser);

  before(() => {
    cy.apiRegisterAndApproveUser(testUser);
    cy.apiRegisterOrg(testUser, testOrg);
    cy.visit('/');
  });

  beforeEach(() => {
    cy.apiLoginUser(testUser);
  });

  it('should display appropriate data in My Organization page ', () => {
    cy.dataCy('organizationMenu').click();
    cy.dataCy('myOrganization').filter(':visible').click();
    cy.url().should('include', 'organization/my');

    cy.dataCy('organizationName').should('have.value', testOrg.name);
    cy.dataCy('organizationAddress').should('have.value', testOrg.address);
    cy.dataCy('organizationBusinessType').should(
      'have.value',
      'Registered incorporated body'
    );
    cy.dataCy('organizationtTradeRegistry').should(
      'have.value',
      testOrg.tradeRegistryCompanyNumber
    );
    cy.dataCy('organizationtVatNumber').should('have.value', testOrg.vatNumber);
    cy.dataCy('organizationtSignatoryName').should(
      'have.value',
      testOrg.signatoryFullName
    );
    cy.dataCy('organizationtSignatoryAddress').should(
      'have.value',
      testOrg.signatoryAddress
    );
    cy.dataCy('organizationtSignatoryEmail').should(
      'have.value',
      testOrg.signatoryEmail
    );
    cy.dataCy('organizationtSignatoryPhoneNumber').should(
      'have.value',
      testOrg.signatoryPhoneNumber
    );
    cy.dataCy('organizationtStatus').should('have.value', 'Submitted');
  });

  it('should display all menu tabs for Organizations menu', () => {
    cy.dataCy('myOrganization');
    cy.dataCy('organizationMembers');
    cy.dataCy('organizationInvitations');
    cy.dataCy('organizationInvite');
    cy.dataCy('organizationRegisterIRec');
    cy.dataCy('organizationCreateBeneficiary');
  });

  it('should display only Admin of the Organization in Members page', () => {
    cy.dataCy('organizationMembers').filter(':visible').click();
    cy.url().should('include', 'members');

    cy.contains('Organization members');
    cy.contains(testUser.firstName);
    cy.contains(testUser.lastName);
    cy.contains(testUser.email);
    cy.contains('Admin');
    cy.contains('1–1 of 1');
  });

  it('should display device pages with requirements', () => {
    cy.dataCy('deviceMenu').click();
    cy.navigateMenu('allDevices');

    cy.navigateMenu('devicesMap');
    cy.url().should('include', 'map');

    cy.navigateMenu('myDevices');
    cy.url().should('include', 'my');
    cy.contains('You need to be a logged in user');
    cy.contains('The user should be a part of an approved organization');

    cy.navigateMenu('registerDevice');
    cy.url().should('include', 'register');
    cy.contains('User has to be approved by the platform admin');
    cy.contains(
      'The organization has to have a blockchain exchange deposit address attached to the account'
    );
  });

  it('should display certificates pages with requirements', () => {
    cy.dataCy('certificateMenu').click();

    cy.url().should('include', 'exchange-inbox');
    cy.contains('you need to fulfill following criteria');
    cy.contains('exchange deposit address attached to the account');

    cy.navigateMenu('certificateClaimsReport');
    cy.url().should('include', 'claims-report');
    cy.contains('you need to fulfill following criteria');
    cy.contains('The user should be a part of an approved organization');

    cy.navigateMenu('certificateRequests');
    cy.url().should('include', 'requests');
    cy.contains('you need to fulfill following criteria');
    cy.contains('exchange deposit address attached to the account');
  });

  it('should display exchange pages with requirements', () => {
    cy.dataCy('exchangeMenu').click();

    cy.url().should('include', 'view-market');
    cy.contains('Market');
    cy.contains('One time purchase');
    cy.contains('Repeated purchase');
    cy.contains('Sell offers');
    cy.contains('Buy offers');

    cy.navigateMenu('exchangeAllPackages');
    cy.url().should('include', 'all-packages');
    cy.contains('Total energy');
    cy.contains('Price per MWh');

    cy.navigateMenu('exchangeCreatePackage');
    cy.url().should('include', 'create-package');
    cy.contains('fulfill following criteria');
    cy.contains('exchange deposit address');

    cy.navigateMenu('exchangeMyTrades');
    cy.url().should('include', 'my-trades');
    cy.contains('fulfill following criteria');
    cy.contains('exchange deposit address');

    cy.navigateMenu('exchangeMyPackages');
    cy.url().should('include', 'my-packages');
    cy.contains('fulfill following criteria');
    cy.contains('exchange deposit address');

    cy.navigateMenu('exchangeMyOrders');
    cy.url().should('include', 'my-orders');
    cy.contains('fulfill following criteria');
    cy.contains('exchange deposit address');

    cy.navigateMenu('exchangeSupply');
    cy.url().should('include', 'supply');
    cy.contains('fulfill following criteria');
    cy.contains('exchange deposit address');
  });
});
