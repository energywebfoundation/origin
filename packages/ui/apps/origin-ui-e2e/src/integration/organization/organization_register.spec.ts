/// <reference types="cypress" />

import { generateNewOrg, generateNewUser } from '../../utils/generateMockData';

describe('Register new organization', () => {
  const testUser = generateNewUser();
  const testOrg = generateNewOrg(testUser);

  before(() => {
    cy.apiRegisterUser(testUser);
    cy.apiLoginUser(testUser);
    cy.visit('/organization/register');
    cy.url().should('include', '/organization/register');
  });

  it('should allow to create new organization using register form', () => {
    cy.fillOrgRegisterForm(testOrg);
    cy.submitForm();

    cy.notification('Organization registered');
  });

  it('should show Role Changed Modal', () => {
    cy.contains('Successfully joined');
    cy.contains('You have successfully joined');
    cy.contains('As an Organization Admin you have permission');
    cy.contains('You can also perform all actions of a Device Manager');
    cy.contains(
      'You can also perform all actions that a regular Organization Member can perform'
    );
    cy.get('button').contains('Ok').click();
  });

  it('should show Register I-Rec Modal', () => {
    cy.contains(
      'Thank you for registering an organization on the marketplace!'
    );
    cy.get('button').contains('Register new I-REC account');
    cy.get('button').contains('Not now').click();
  });

  it('should show Modal with info about admin approval', () => {
    cy.contains('Thank you for registering!');
    cy.contains('Your registration is reviewed by the platform administrator');
    cy.get('button').contains('Ok').click();
  });

  it('should show uploaded docs in My Organization view', () => {
    cy.url().should('include', 'organization/my');
    cy.dataCy('downloadCompanyProof')
      .find('span')
      .should('have.text', 'Company Proof');
    cy.dataCy('downloadSignatoryId')
      .find('span')
      .should('have.text', 'Signatory ID');
  });
});
