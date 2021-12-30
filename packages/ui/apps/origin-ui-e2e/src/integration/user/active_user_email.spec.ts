/// <reference types="cypress" />

import { generateNewUser } from '../../utils/generateMockData';

describe('Active user profile email block interactions', () => {
  const testUser = generateNewUser();
  const editText = 'edited';
  const newEmail = editText + testUser.email;

  before(() => {
    cy.apiRegisterAndApproveUser(testUser);
  });

  it('should validate email field as required', () => {
    cy.apiLoginUser(testUser);
    cy.visit('/account/profile');

    cy.inputRequired('email', 'firstName');
  });

  it('should keep save email button disabled if email did not changed after editing', () => {
    cy.apiLoginUser(testUser);
    cy.visit('/account/profile');

    cy.clearInput('email');
    cy.dataCy('email').type(testUser.email);
    cy.dataCy('email-change-button').should('be.disabled');
  });

  it('should change user email and log him out', () => {
    cy.apiLoginUser(testUser);
    cy.visit('/account/profile');

    cy.clearInput('email');

    cy.dataCy('email').type(newEmail).blur();
    cy.dataCy('email-change-button').should('not.be.disabled');
    cy.dataCy('email-change-button').click();

    cy.notification('User email updated successfully');
    cy.url().should('include', 'device/all');
  });

  it('should allow user to log in using new email', () => {
    cy.login(newEmail, testUser.password);

    cy.contains('Thank you for registering as a user on the marketplace');
    cy.get('button').contains('Not now').click();
    cy.url().should('include', '/device/all');
    cy.contains(`${testUser.firstName} ${testUser.lastName}`);
  });
});
