/// <reference types="cypress" />

import { generateNewOrg, generateNewUser } from '../../utils/generateMockData';

describe('Register organization with taken name', () => {
  const testUser = generateNewUser();
  const testOrg = generateNewOrg(testUser);

  before(() => {
    cy.apiRegisterUser(testUser);
    cy.apiLoginUser(testUser);
    cy.visit('/organization/register');
    cy.url().should('include', '/organization/register');
  });

  it('should not allow to register organization with taken name', () => {
    const orgWithDuplicateName = {
      ...testOrg,
      name: 'Device Manager Organization',
    };

    cy.fillOrgRegisterForm(orgWithDuplicateName);

    cy.submitForm();

    cy.notification(
      `Organization name "${orgWithDuplicateName.name}" is already taken`
    );
    cy.contains('Sorry but this organization could not be registered.');
    cy.contains('Ok').click();
    cy.url().should('include', '/organization/register');
  });
});
