/// <reference types="cypress" />

import { generateNewUser } from '../../utils/generateMockData';

describe('Active user profile password block interactions', () => {
  const testUser = generateNewUser();
  const { password: oldPassword, email } = testUser;
  const editNumbers = '1111';
  const newPassword = oldPassword + editNumbers;

  before(() => {
    cy.apiRegisterAndApproveUser(testUser);
  });

  it('should validate password field as required', () => {
    cy.apiLoginUser(testUser);
    cy.visit('/account/profile');

    cy.inputRequired('oldPassword', 'newPassword');
    cy.inputRequired('newPassword', 'newPasswordConfirm');
    cy.inputRequired('newPasswordConfirm', 'oldPassword');
  });

  it('should allow user to change password and logout', () => {
    cy.apiLoginUser(testUser);
    cy.visit('/account/profile');

    cy.dataCy('oldPassword').type(oldPassword);
    cy.dataCy('newPassword').type(newPassword);
    cy.dataCy('newPasswordConfirm').type(newPassword).blur();
    cy.dataCy('password-change-button').click();

    cy.notification('User password updated successfully');
    cy.url().should('include', 'device/all');
    cy.dataCy('navigation-login-button').should('be.visible');
  });

  it('should allow user to log in using new password', () => {
    cy.login(email, newPassword);

    cy.contains('Thank you for registering as a user on the marketplace');
    cy.get('button').contains('Not now').click();

    cy.contains(`${testUser.firstName} ${testUser.lastName}`);
    cy.url().should('include', 'device/all');
  });
});
