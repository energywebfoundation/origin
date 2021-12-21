/// <reference types="cypress" />

import { generateNewOrg, generateNewUser } from '../../utils/generateMockData';

describe('Register organization form validation', () => {
  const testUser = generateNewUser();
  const testOrg = generateNewOrg(testUser);

  before(() => {
    cy.apiRegisterUser(testUser);
  });

  beforeEach(() => {
    cy.apiLoginUser(testUser);
    cy.visit('/organization/register');
    cy.url().should('include', '/organization/register');
  });

  it('should not allow to register company without docs', () => {
    cy.fillOrgRegisterInfo(testOrg);
    cy.nextStep();
    cy.fillOrgRegisterAuthSignInfo(testOrg);
    cy.nextStep();

    cy.contains('Submit').should('be.disabled');

    cy.attachDocument('companyProof');
    cy.attachDocument('signatoryId');

    cy.contains('Submit').should('not.be.disabled');
  });

  it('should validate input fields', () => {
    cy.inputRequired('orgInfoName', 'orgInfoAddress');
    cy.inputRequired('orgInfoAddress', 'orgInfoZipCode');
    cy.inputRequired('orgInfoZipCode', 'orgInfoCity');
    cy.inputRequired('orgInfoCity', 'orgInfoTradeRegistryCompanyNumber');
    cy.inputRequired('orgInfoTradeRegistryCompanyNumber', 'orgInfoVatNumber');
    cy.inputRequired('orgInfoVatNumber', 'orgInfoName');
  });
});
